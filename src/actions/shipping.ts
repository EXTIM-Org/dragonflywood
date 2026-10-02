"use server";

import { canManageStore } from "@/lib/permissions";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { syncTapinOrders, queryTapinByBarcode, mapTapinStatusToOrderStatus } from "@/lib/tapin";
import { logAdminAction } from "@/lib/audit";

/**
 * Admin action to trigger immediate synchronization with Tapin
 */
export async function syncTapinShippingAction() {
  try {
    const session = await getSession();
    if (!session || !session.userId || !canManageStore(session.role as string)) {
      return { success: false, error: "عدم دسترسی. فقط مدیران می‌توانند همگام‌سازی را انجام دهند." };
    }

    const result = await syncTapinOrders();

    await logAdminAction({
      action: "UPDATE",
      entity: "Order",
      entityId: "tapin-sync",
      description: `همگام‌سازی تاپین: ${result.matchedCount} سفارش مطابقت داده شد، ${result.updatedCount} سفارش به‌روزرسانی شد.`,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile/orders");

    return {
      success: true,
      message: `همگام‌سازی با تاپین انجام شد. ${result.updatedCount} سفارش به‌روزرسانی شدند.`,
      result,
    };
  } catch (error: any) {
    console.error("Tapin manual sync failed:", error);
    return {
      success: false,
      error: error?.message || "خطا در برقراری ارتباط با وب‌سرویس تاپین.",
    };
  }
}

/**
 * Look up a tracking barcode in Tapin live
 */
export async function queryTapinBarcodeAction(barcode: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "لطفاً ابتدا وارد حساب خود شوید." };
    }

    const tapinOrder = await queryTapinByBarcode(barcode);
    if (!tapinOrder) {
      return { success: false, error: "اطلاعاتی برای این بارکد در سامانه تاپین یافت نشد." };
    }

    const { status: orderStatus, label } = mapTapinStatusToOrderStatus(tapinOrder.status);

    return {
      success: true,
      data: {
        barcode: tapinOrder.barcode,
        orderId: tapinOrder.order_id,
        rawStatus: tapinOrder.status,
        mappedStatus: orderStatus,
        statusLabel: label,
        fullName: `${tapinOrder.first_name} ${tapinOrder.last_name}`.trim(),
        createdAt: tapinOrder.created_at,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "خطا در استعلام اطلاعات از تاپین.",
    };
  }
}


import { db } from "@/prisma/db";
import { getEffectivePrice } from "@/lib/price";
import { getStoreSettings } from "@/actions/settings";
import { calculateTapinShippingCost, DEFAULT_ITEM_WEIGHT_GRAMS, getProvinceList, getCitiesByProvince, extractProductWeightGrams } from "@/lib/tapin-rates";

/**
 * Return list of all Iranian provinces
 */
export async function getShippingProvincesAction() {
  return getProvinceList();
}

/**
 * Return cities for a given province
 */
export async function getShippingCitiesAction(provinceIdOrName: number | string) {
  return getCitiesByProvince(provinceIdOrName);
}

/**
 * Action to estimate shipping fee live for a user's cart
 */
export async function calculateShippingFeeAction(params: {
  province?: string | number | null;
  city?: string | number | null;
}) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      // For unauthenticated user or guest, calculate standard rate with default weight
      const storeSettings = await getStoreSettings();
      const result = calculateTapinShippingCost({
        subtotalPrice: 0,
        totalWeightGrams: DEFAULT_ITEM_WEIGHT_GRAMS,
        province: params.province,
        city: params.city,
        freeShippingEnabled: storeSettings.free_shipping_enabled,
        freeShippingThreshold: storeSettings.free_shipping_threshold,
      });
      return { success: true, ...result };
    }

    const cart = await db.orm.public.Cart
      .where({ userId: session.userId as string })
      .include("items", (item) =>
        item.include("variant", (variant) =>
          variant.include("product", (product) =>
            product.include("flashSale").include("specifications")
          )
        )
      )
      .first();

    if (!cart || cart.items.length === 0) {
      return { success: true, shippingCost: 0, isFree: false };
    }

    let subtotal = 0;
    let totalWeightGrams = 0;

    for (const item of cart.items) {
      const variant = item.variant;
      const product = variant?.product;
      if (!variant || !product) continue;

      const basePrice = variant.price ?? product.basePrice;
      const { finalPrice } = getEffectivePrice(basePrice, product.discount, product.flashSale);
      subtotal += finalPrice * item.quantity;

      const weightRes = extractProductWeightGrams(product);
      if (!weightRes.success) {
        return {
          success: false,
          missingWeightProduct: product.name,
          error: weightRes.error,
          shippingCost: 0,
          isFree: false,
        };
      }
      totalWeightGrams += weightRes.weightGrams * item.quantity;
    }

    const storeSettings = await getStoreSettings();
    const result = calculateTapinShippingCost({
      subtotalPrice: subtotal,
      totalWeightGrams,
      province: params.province,
      city: params.city,
      freeShippingEnabled: storeSettings.free_shipping_enabled,
      freeShippingThreshold: storeSettings.free_shipping_threshold,
    });

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("calculateShippingFeeAction error:", error);
    return {
      success: false,
      error: error?.message || "خطا در محاسبه هزینه ارسال",
      shippingCost: 0,
      isFree: false,
    };
  }
}
