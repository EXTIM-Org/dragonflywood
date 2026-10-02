"use server";

import { calculateTapinShippingCost, DEFAULT_ITEM_WEIGHT_GRAMS, extractProductWeightGrams } from "@/lib/tapin-rates";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { markOrderAsPaid } from "@/services/order";
import { validateCoupon } from "@/actions/coupon";
import { getStoreSettings } from "@/actions/settings";
import { getEffectivePrice } from "@/lib/price";
import { getLogger } from "@/lib/logger";
import { calculatePromotionDiscount } from "@/lib/promotions";
import { rateLimit } from "@/lib/rate-limit";
import { requestZarinpalPayment } from "@/lib/zarinpal";

const checkoutSchema = z.object({
  receiverName: z.string().min(2, "نام تحویل گیرنده باید حداقل ۲ کاراکتر باشد."),
  phone: z.string().regex(/^09\d{9}$/, "شماره همراه نامعتبر است. (مثال: 09123456789)"),
  fullAddress: z.string().min(10, "آدرس دقیق باید حداقل ۱۰ کاراکتر باشد."),
  postalCode: z.string().regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد.").optional().or(z.literal("")),
  city: z.string().min(2, "نام شهر الزامی است."),
  province: z.string().min(2, "نام استان الزامی است."),
});

export async function getUserCheckoutData() {
  const session = await getSession();
  if (!session || !session.userId) return null;

  const userId = session.userId as string;

  // Get user details, latest address, latest order, and cart with specifications
  const [user, latestAddress, latestOrder, cart] = await Promise.all([
    db.orm.public.User.where({ id: userId }).first(),
    db.orm.public.Address.where({ userId }).orderBy((a) => a.createdAt.desc()).first(),
    db.orm.public.Order.where({ userId }).orderBy((o) => o.createdAt.desc()).first(),
    db.orm.public.Cart
      .where({ userId })
      .include("items", (item) =>
        item.include("variant", (variant) =>
          variant.include("product", (product) =>
            product.include("specifications")
          )
        )
      )
      .first(),
  ]);

  if (!user) return null;

  let totalWeightGrams = 0;
  let missingWeightProduct: string | null = null;
  let missingWeightError: string | null = null;

  if (cart && cart.items.length > 0) {
    for (const item of cart.items) {
      const product = item.variant?.product;
      if (!product) continue;
      const weightRes = extractProductWeightGrams(product);
      if (!weightRes.success) {
        missingWeightProduct = product.name;
        missingWeightError = weightRes.error;
        break;
      }
      totalWeightGrams += weightRes.weightGrams * item.quantity;
    }
  }

  return {
    receiverName: latestOrder?.receiverName || user.name || "",
    phone: latestOrder?.phone || "",
    address: latestAddress?.fullAddress || "",
    postalCode: latestAddress?.postalCode || "",
    city: latestAddress?.city || "",
    province: latestAddress?.province || "",
    lat: latestAddress?.lat || null,
    lng: latestAddress?.lng || null,
    totalWeightGrams,
    missingWeightProduct,
    missingWeightError,
  };
}

export async function processCheckout(prevState: unknown, formData: FormData) {
  console.log('--- PROCESS CHECKOUT CALLED ---');
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "برای ثبت سفارش باید وارد حساب کاربری شوید." };
    }
    
    const log = getLogger(session.userId as string);
    log.info("Checkout process started");

    const rl = await rateLimit(session.userId as string, "CHECKOUT", 5, 60000);
    if (!rl.success) {
      return { error: "درخواست‌های شما بیش از حد مجاز است. لطفاً یک دقیقه صبر کنید." };
    }

    const fullAddress = formData.get("address") as string;
    const receiverName = formData.get("receiverName") as string;
    const phone = formData.get("phone") as string;
    const postalCode = formData.get("postalCode") as string | null;
    const city = formData.get("city") as string;
    const province = formData.get("province") as string;
    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;
    const simulationType = formData.get("simulationType") as string;
    const couponCode = formData.get("couponCode") as string | null;
    
    // Simulate failed payment
    if (simulationType === "FAIL") {
      log.warn({ amount: "unknown", reason: "Simulated failure" }, "Checkout failed due to simulation");
      return { error: "پرداخت ناموفق بود (شبیه‌سازی خطا توسط درگاه پرداخت). لطفاً مجدداً تلاش کنید." };
    }
    
    const validation = checkoutSchema.safeParse({
      receiverName,
      phone,
      fullAddress,
      postalCode,
      city,
      province,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const cart = await db.orm.public.Cart
      .where({ userId: session.userId as string })
      .include("items", (item) => item.include("variant", (variant) => variant.include("product", (product) => product.include("flashSale").include("specifications"))))
      .first();

    if (!cart || cart.items.length === 0) {
      return { error: "سبد خرید خالی است." };
    }

    const validatedOrderItems: { variantId: string; quantity: number; unitPrice: number; categoryId: string }[] = [];
    for (const cartItem of cart.items) {
      const variant = cartItem.variant;
      const product = variant?.product;
      if (!variant || !product) {
        return { error: "برخی از محصولات سبد خرید شما دیگر در سیستم موجود نیستند. لطفاً سبد خرید خود را بروزرسانی کنید." };
      }
      if (!Number.isSafeInteger(cartItem.quantity) || cartItem.quantity <= 0) {
        return { error: "تعداد یکی از کالاهای سبد خرید نامعتبر است. لطفاً سبد خرید را بروزرسانی کنید." };
      }

      const basePrice = variant.price ?? product.basePrice;
      const { finalPrice } = getEffectivePrice(basePrice, product.discount, product.flashSale);
      validatedOrderItems.push({
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
        unitPrice: finalPrice,
        categoryId: product.categoryId,
      });
    }

    const totalAmount = validatedOrderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const activePromotions = await db.orm.public.PromotionRule.where({ isActive: true }).all();
    const promotionDiscount = calculatePromotionDiscount(
      validatedOrderItems.map((item) => ({
        price: item.unitPrice,
        quantity: item.quantity,
        categoryId: item.categoryId,
      })),
      activePromotions,
    );
    const discountedSubtotal = Math.max(0, totalAmount - promotionDiscount);
    const storeSettings = await getStoreSettings();
    const isFreeShipping = Boolean(storeSettings.free_shipping_enabled) && discountedSubtotal >= storeSettings.free_shipping_threshold;

    // Calculate total order weight based on products' specifications
    let totalWeightGrams = 0;
    for (const cartItem of cart.items) {
      const product = cartItem.variant?.product;
      if (!product) continue;

      const weightRes = extractProductWeightGrams(product);
      if (!weightRes.success) {
        if (isFreeShipping) {
          log.info({ productId: product.id, productName: product.name }, "Free shipping applied: using fallback weight for unweighted product");
          totalWeightGrams += DEFAULT_ITEM_WEIGHT_GRAMS * cartItem.quantity;
        } else {
          log.warn({ productId: product.id, productName: product.name }, "Checkout blocked: missing product weight");
          return { error: weightRes.error };
        }
      } else {
        totalWeightGrams += weightRes.weightGrams * cartItem.quantity;
      }
    }

    const shippingResult = calculateTapinShippingCost({
      subtotalPrice: discountedSubtotal,
      totalWeightGrams,
      province,
      city,
      freeShippingEnabled: storeSettings.free_shipping_enabled,
      freeShippingThreshold: storeSettings.free_shipping_threshold,
    });
    const shipping = shippingResult.shippingCost;

    let couponDiscount = 0;
    let appliedCouponId: string | null = null;
    
    // Validate Coupon if provided
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, discountedSubtotal);
      if (!couponRes.success) {
        return { error: couponRes.error || "کد تخفیف نامعتبر است." };
      }
      couponDiscount = couponRes.discountAmount || 0;
      appliedCouponId = couponRes.couponId || null;
    }

    const discountAmount = promotionDiscount + couponDiscount;
    
    const finalTotal = totalAmount + shipping - discountAmount;

    // 3. Create the Order and process items in a Transaction
    const txResult = await db.transaction(async (tx) => {
      const newOrder = await tx.orm.public.Order.create({
        userId: session.userId as string,
        status: 'PENDING',
        totalAmount: finalTotal,
        couponId: appliedCouponId,
        discountAmount,
        receiverName,
        phone,
        shippingAddress: `استان: ${province} | شهر: ${city} | ${fullAddress} ${lat && lng ? `| مختصات: ${lat},${lng}` : ''}`,
        postalCode,
      });
      
      // Increment coupon usage
      if (appliedCouponId) {
        const coupon = await tx.orm.public.Coupon.where({ id: appliedCouponId }).first();
        if (coupon) {
          await tx.orm.public.Coupon.where({ id: appliedCouponId }).update({
            usedCount: coupon.usedCount + 1
          });
        }
      }

      // 4. Create OrderItems & Update Inventory
      const cart = await tx.orm.public.Cart.where({ userId: session.userId as string }).first();

      for (const item of validatedOrderItems) {
        await tx.orm.public.OrderItem.create({
          orderId: newOrder.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });

        // Find inventory
        const inventory = await tx.orm.public.Inventory.where({ variantId: item.variantId }).first();
        
        if (inventory) {
          // Check if there is an active reservation
          let cartItem = null;
          if (cart) {
            cartItem = await tx.orm.public.CartItem.where({ cartId: cart.id, variantId: item.variantId }).first();
          }

          if (cartItem) {
            // Has reservation, deduct from reservedStock atomically
            const plan = db.raw.sql`
              UPDATE inventory 
              SET "reservedStock" = GREATEST(0, "reservedStock" - ${item.quantity})
              WHERE id = ${inventory.id}
            `.affectedCount().build();
            await tx.execute(plan);
            
            // Remove cart item
            await tx.orm.public.CartItem.where({ id: cartItem.id }).delete();
          } else {
            // No reservation (maybe expired), deduct from stockQuantity if available atomically
            const plan = db.raw.sql`
              UPDATE inventory 
              SET "stockQuantity" = "stockQuantity" - ${item.quantity}
              WHERE id = ${inventory.id} AND "stockQuantity" >= ${item.quantity}
            `.affectedCount().build();
            const { affectedRows } = await tx.execute(plan);
            
            if (affectedRows === 0) {
               throw new Error(`موجودی کالای ${item.variantId} به پایان رسیده است.`);
            }
          }

          // Log transaction
          await tx.orm.public.InventoryTransaction.create({
            inventoryId: inventory.id,
            type: 'SALE',
            quantity: -item.quantity,
            reference: newOrder.id
          });
          
          log.info({ variantId: item.variantId, quantity: item.quantity, orderId: newOrder.id }, "Inventory deducted successfully");
        }
      }
      
      return { order: newOrder };
    }).catch(e => {
       log.error({ err: e }, "Transaction failed during checkout");
       return { error: e instanceof Error ? e.message : "خطایی در ثبت سفارش رخ داد." };
    });

    if ('error' in txResult) {
      return { error: txResult.error || "خطایی در پردازش سفارش رخ داد." };
    }
    
    const order = txResult.order;
    
    // 4. Auto-save Address if it doesn't exist
    const existingAddress = await db.orm.public.Address.where({ 
      userId: session.userId as string,
      fullAddress: fullAddress 
    }).first();

    if (!existingAddress) {
      await db.orm.public.Address.create({
        userId: session.userId as string,
        fullAddress: fullAddress,
        city,
        province,
        postalCode: postalCode || null,
        title: "آدرس تحویل سفارش",
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      });
    }
    
    // 5. If payable amount is 0 (e.g. 100% coupon discount)
    if (finalTotal <= 0) {
      await markOrderAsPaid(order.id, "FREE-DISCOUNT");
      log.info({ orderId: order.id, amount: finalTotal }, "Free order completed without payment gateway");
      return { success: true, orderId: order.id };
    }

    // 6. Connect to Zarinpal Gateway
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payment/verify?orderId=${order.id}`;

    const zarinpalResult = await requestZarinpalPayment({
      amount: finalTotal,
      description: `پرداخت سفارش گالری چوب سنجاقک (شماره سفارش: ${order.id.slice(0, 8)})`,
      callbackUrl,
      mobile: phone,
      email: typeof session.email === "string" ? session.email : undefined,
    });

    if (!zarinpalResult.success || !zarinpalResult.paymentUrl || !zarinpalResult.authority) {
      log.error({ err: zarinpalResult.error, orderId: order.id }, "Failed to initiate Zarinpal payment");
      return {
        error: zarinpalResult.error || "خطا در اتصال به درگاه پرداخت زرین‌پال. لطفاً مجدداً تلاش کنید.",
      };
    }

    // Store payment authority in order
    await db.orm.public.Order.where({ id: order.id }).update({
      paymentAuthority: zarinpalResult.authority,
    });

    log.info({ orderId: order.id, authority: zarinpalResult.authority }, "Redirecting to Zarinpal gateway");

    return {
      success: true,
      orderId: order.id,
      paymentUrl: zarinpalResult.paymentUrl,
    };

  } catch (error) {
    console.error("Checkout error:", error); // Keep console for unhandled outer catch if needed, but we can also use base logger
    return { error: "خطایی در پردازش سفارش رخ داد. لطفاً دوباره تلاش کنید." };
  }
}