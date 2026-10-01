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
