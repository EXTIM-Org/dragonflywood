import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { mapTapinStatusToOrderStatus } from "@/lib/tapin";
import { getLogger } from "@/lib/logger";

const log = getLogger("tapin-webhook");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    log.info({ body }, "Received Tapin webhook event");

    const barcode = body.barcode || body.tracking_code || body.order?.barcode;
    const rawStatus = body.status !== undefined ? Number(body.status) : undefined;

    if (!barcode || rawStatus === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing barcode or status in webhook payload" },
        { status: 400 }
      );
    }

    const { status: targetStatus, label } = mapTapinStatusToOrderStatus(rawStatus);

    // Look up order by tracking code
    const order = await db.orm.public.Order
      .where({ trackingCode: barcode.trim() })
      .first();

    if (!order) {
      log.warn({ barcode }, "Webhook received for untracked order");
      return NextResponse.json({ success: true, message: "Order not found in store" });
    }

    if (order.status !== targetStatus) {
      await db.orm.public.Order.where({ id: order.id }).update({
        status: targetStatus as any,
      });
      log.info({ orderId: order.id, barcode, targetStatus, label }, "Order status updated via Tapin webhook");
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${label}`,
      orderId: order.id,
      status: targetStatus,
    });
  } catch (error: any) {
    log.error({ err: error }, "Unhandled error in Tapin webhook");
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
