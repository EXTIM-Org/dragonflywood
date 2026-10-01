import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { markOrderAsPaid } from "@/services/order";
import { verifyZarinpalPayment } from "@/lib/zarinpal";
import { getLogger } from "@/lib/logger";

const log = getLogger("payment-verify");

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const authority = searchParams.get("Authority") || searchParams.get("authority");
  const status = searchParams.get("Status") || searchParams.get("status");
  const orderId = searchParams.get("orderId");

  log.info({ orderId, authority, status }, "Payment callback received from Zarinpal");

  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/checkout/result";
  redirectUrl.search = "";

  if (!orderId) {
    redirectUrl.searchParams.set("status", "failed");
    redirectUrl.searchParams.set("message", "شناسه سفارش در بازگشت از درگاه یافت نشد.");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const order = await db.orm.public.Order.where({ id: orderId }).first();

    if (!order) {
      log.warn({ orderId }, "Order not found in payment callback");
      redirectUrl.searchParams.set("status", "failed");
      redirectUrl.searchParams.set("orderId", orderId);
      redirectUrl.searchParams.set("message", "سفارش مورد نظر در پایگاه داده یافت نشد.");
      return NextResponse.redirect(redirectUrl);
    }

    // If order was already processed as paid
    if (order.status === "PAID") {
      log.info({ orderId }, "Order was already marked as paid");
      redirectUrl.searchParams.set("status", "success");
      redirectUrl.searchParams.set("orderId", order.id);
      if (order.paymentRefId) {
        redirectUrl.searchParams.set("refId", order.paymentRefId);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user cancelled or payment was not approved by gateway
    if (status !== "OK") {
      log.warn({ orderId, status }, "Payment cancelled or rejected by Zarinpal");
      redirectUrl.searchParams.set("status", "failed");
      redirectUrl.searchParams.set("orderId", order.id);
      redirectUrl.searchParams.set(
        "message",
        "تراکنش پرداخت توسط کاربر لغو شد یا از سوی بانک تایید نگردید."
      );
      return NextResponse.redirect(redirectUrl);
    }

    if (!authority) {
      log.warn({ orderId }, "Authority code missing in successful payment callback");
      redirectUrl.searchParams.set("status", "failed");
      redirectUrl.searchParams.set("orderId", order.id);
      redirectUrl.searchParams.set("message", "کد اعتبارسنجی درگاه (Authority) یافت نشد.");
      return NextResponse.redirect(redirectUrl);
    }

    // Verify payment with Zarinpal API
    const verifyResult = await verifyZarinpalPayment({
      authority,
      amount: order.totalAmount,
    });

    if (verifyResult.success && verifyResult.refId) {
      log.info(
        { orderId: order.id, refId: verifyResult.refId, code: verifyResult.code },
        "Payment successfully verified with Zarinpal"
      );

      // Mark order as PAID, store refId & authority, and dispatch receipt email
      await markOrderAsPaid(order.id, verifyResult.refId, authority);

      redirectUrl.searchParams.set("status", "success");
      redirectUrl.searchParams.set("orderId", order.id);
      redirectUrl.searchParams.set("refId", verifyResult.refId);
      return NextResponse.redirect(redirectUrl);
    } else {
      log.error(
        { orderId: order.id, error: verifyResult.error, code: verifyResult.code },
        "Zarinpal verification failed"
      );

      redirectUrl.searchParams.set("status", "failed");
      redirectUrl.searchParams.set("orderId", order.id);
      redirectUrl.searchParams.set(
        "message",
        verifyResult.error || "خطا در تایید نهایی تراکنش توسط درگاه زرین‌پال."
      );
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    log.error({ err: error, orderId }, "Unhandled error in payment callback handler");
    redirectUrl.searchParams.set("status", "failed");
    if (orderId) redirectUrl.searchParams.set("orderId", orderId);
    redirectUrl.searchParams.set("message", "خطای غیرمنتظره سرور هنگام تایید پرداخت.");
    return NextResponse.redirect(redirectUrl);
  }
}
