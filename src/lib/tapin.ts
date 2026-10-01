import https from "https";
import { db } from "@/prisma/db";
import { getLogger } from "@/lib/logger";
import { notificationQueue } from "@/jobs/queues";
import { render } from "@react-email/render";
import { OrderStatusEmail } from "@/emails/OrderStatusEmail";
import React from "react";

const log = getLogger("tapin");

const TAPIN_API_URL = process.env.TAPIN_API_URL || "https://api.tapin.ir";
const TAPIN_TOKEN = process.env.TAPIN_API_TOKEN || "";
const TAPIN_SHOP_ID = process.env.TAPIN_SHOP_ID || "";

// Use TLS 1.2 agent for stable, fast communication with Tapin servers on Linux
const httpsAgent = new https.Agent({ maxVersion: "TLSv1.2", keepAlive: true });

export interface TapinOrderEntry {
  id: string;
  barcode: string;
  order_id: number;
  status: number;
  first_name: string;
  last_name: string;
  mobile: string;
  state_code?: string;
  city_code?: string;
  pay_type?: string | number;
  order_type?: number;
  created_at?: string;
}

export interface TapinResponse<T = any> {
  returns: {
    status: number;
    message: string;
  };
  entries: T;
}

/**
 * Executes a low-level HTTPS request to Tapin API with TLS 1.2
 */
export async function requestTapin<T = any>(
  path: string,
  payload: Record<string, any> = {}
): Promise<TapinResponse<T>> {
  if (!TAPIN_TOKEN) {
    throw new Error("توکن وب‌سرویس تاپین (TAPIN_API_TOKEN) در فایل .env تعریف نشده است.");
  }
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(path, TAPIN_API_URL);
      const postData = JSON.stringify(payload);

      const req = https.request(
        {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: "POST",
          agent: httpsAgent,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: TAPIN_TOKEN,
            "Content-Length": Buffer.byteLength(postData),
            "User-Agent": "DragonflyWood-Platform/1.0",
          },
          timeout: 20000,
        },
        (res) => {
          let rawData = "";
          res.setEncoding("utf-8");
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            try {
              if (res.statusCode && res.statusCode >= 400) {
                log.warn({ status: res.statusCode, body: rawData.slice(0, 300) }, "Tapin returned HTTP error");
                return reject(new Error(`Tapin HTTP ${res.statusCode}: ${rawData.slice(0, 150)}`));
              }
              const parsed = JSON.parse(rawData);
              resolve(parsed);
            } catch (parseErr) {
              log.error({ err: parseErr, raw: rawData.slice(0, 300) }, "Failed to parse Tapin JSON response");
              reject(parseErr);
            }
          });
        }
      );

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("ارتباط با وب‌سرویس تاپین با خطا مواجه شد (Timeout)."));
      });

      req.on("error", (err) => {
        log.error({ err }, "Tapin request socket error");
        reject(err);
      });

      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Map Tapin numerical status code to internal store OrderStatus and Persian label
 */
export function mapTapinStatusToOrderStatus(tapinStatus: number): {
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  label: string;
} {
  switch (tapinStatus) {
    case -1:
    case 0:
      return { status: "PROCESSING", label: "ثبت شده در فروشگاه (تحت بررسی)" };
    case 1:
      return { status: "PROCESSING", label: "آماده به پرینت (معلق پستی)" };
    case 2:
      return { status: "PROCESSING", label: "آماده به ارسال" };
    case 50:
      return { status: "PROCESSING", label: "در حال جمع‌آوری مرسولات" };
    case 5:
      return { status: "SHIPPED", label: "قبول شد توسط پست" };
    case 13:
      return { status: "SHIPPED", label: "وارده به استان توزیع" };
    case 14:
      return { status: "SHIPPED", label: "تحویل به نامه‌رسان جهت توزیع" };
    case 15:
      return { status: "SHIPPED", label: "مراجعه اول نامه‌رسان" };
    case 16:
      return { status: "SHIPPED", label: "مراجعه دوم نامه‌رسان" };
    case 8:
      return { status: "SHIPPED", label: "باجه معطل پستی" };
    case 7:
      return { status: "DELIVERED", label: "توزیع شد (تحویل داده شده)" };
    case 9:
    case 10:
    case 11:
      return { status: "CANCELLED", label: "مرسوله برگشتی" };
    case 12:
      return { status: "CANCELLED", label: "مرسوله خسارتی" };
    case 80:
      return { status: "CANCELLED", label: "سفارش در تاپین لغو گردید" };
    default:
      return { status: "PROCESSING", label: `وضعیت تاپین (کد ${tapinStatus})` };
  }
}

/**
 * Fetch shops associated with this token
 */
export async function getTapinShops() {
  const res = await requestTapin("/api/v2/public/shop/list/", { count: 10, page: 1 });
  return res.entries?.list || [];
}

/**
 * Fetch orders list from Tapin with optional barcode filter
 */
export async function getTapinOrders(options: {
  page?: number;
  count?: number;
  barcode?: string;
  shopId?: string;
} = {}): Promise<{ orders: TapinOrderEntry[]; totalCount: number }> {
  const shop_id = options.shopId || TAPIN_SHOP_ID;
  const count = options.count || 50;
  const page = options.page || 1;

  const payload: Record<string, any> = { shop_id, count, page };
  if (options.barcode) {
    payload.barcode = options.barcode.trim();
  }

  const res = await requestTapin<{ list: TapinOrderEntry[]; total_count: number }>(
    "/api/v2/public/order/post/list/",
    payload
  );

  return {
    orders: res.entries?.list || [],
    totalCount: res.entries?.total_count || 0,
  };
}

/**
 * Look up a specific tracking barcode in Tapin
 */
export async function queryTapinByBarcode(barcode: string): Promise<TapinOrderEntry | null> {
  if (!barcode) return null;
  const cleanBarcode = barcode.trim();
  const { orders } = await getTapinOrders({ barcode: cleanBarcode, count: 5 });
  const found = orders.find((o) => o.barcode === cleanBarcode);
  return found || null;
}

/**
 * Synchronize Tapin orders with store database
 * Finds matching orders in DB by trackingCode or mobile number,
 * updates tracking code & status, and sends email/SMS alerts to customer.
 */
export async function syncTapinOrders(): Promise<{
  success: boolean;
  totalTapinOrders: number;
  matchedCount: number;
  updatedCount: number;
  details: Array<{
    orderId: string;
    barcode: string;
    oldStatus: string;
    newStatus: string;
    tapinLabel: string;
  }>;
}> {
  if (!TAPIN_TOKEN || !TAPIN_SHOP_ID) {
    log.warn("Tapin synchronization skipped: TAPIN_API_TOKEN or TAPIN_SHOP_ID is not configured in .env");
    return {
      success: false,
      totalTapinOrders: 0,
      matchedCount: 0,
      updatedCount: 0,
      details: [],
    };
  }
  log.info("Starting automatic Tapin shipping synchronization...");

  try {
    const { orders: tapinOrders, totalCount } = await getTapinOrders({ count: 50, page: 1 });
    log.info({ totalCount, fetched: tapinOrders.length }, "Fetched orders from Tapin");

    if (tapinOrders.length === 0) {
      return {
        success: true,
        totalTapinOrders: 0,
        matchedCount: 0,
        updatedCount: 0,
        details: [],
      };
    }

    // Fetch all active orders from store database
    const storeOrders = await db.orm.public.Order
      .include("user")
      .all();

    let matchedCount = 0;
    let updatedCount = 0;
    const details: Array<{
      orderId: string;
      barcode: string;
      oldStatus: string;
      newStatus: string;
      tapinLabel: string;
    }> = [];

    for (const tapinOrder of tapinOrders) {
      if (!tapinOrder.barcode) continue;

      const cleanBarcode = tapinOrder.barcode.trim();
      const cleanMobile = (tapinOrder.mobile || "").replace(/\D/g, "");

      // 1. Try to find order by exact trackingCode
      let matchedOrder = storeOrders.find(
        (o) => o.trackingCode && o.trackingCode.trim() === cleanBarcode
      );

      // 2. If no trackingCode match, match by phone for orders in progress (PAID or PROCESSING)
      if (!matchedOrder && cleanMobile) {
        matchedOrder = storeOrders.find((o) => {
          if (!["PAID", "PROCESSING"].includes(o.status)) return false;
          const orderPhone = (o.phone || "").replace(/\D/g, "");
          return orderPhone.endsWith(cleanMobile.slice(-10)) || cleanMobile.endsWith(orderPhone.slice(-10));
        });
      }

      if (!matchedOrder) continue;
      matchedCount++;

      const { status: targetStatus, label: tapinLabel } = mapTapinStatusToOrderStatus(tapinOrder.status);
      const isStatusChanged = matchedOrder.status !== targetStatus;
      const isTrackingCodeNew = !matchedOrder.trackingCode || matchedOrder.trackingCode.trim() !== cleanBarcode;

      if (isStatusChanged || isTrackingCodeNew) {
        const oldStatus = matchedOrder.status;

        // Update Order in database
        await db.orm.public.Order.where({ id: matchedOrder.id }).update({
          status: targetStatus as any,
          trackingCode: cleanBarcode,
        });

        // Trigger notification email if status actually changed
        if (isStatusChanged && matchedOrder.user?.email) {
          try {
            const html = await render(
              React.createElement(OrderStatusEmail, {
                customerName: matchedOrder.receiverName || matchedOrder.user.name || "مشتری گرامی",
                orderId: matchedOrder.id,
                status: targetStatus,
              })
            );

            await notificationQueue.add("send-email", {
              type: "email",
              payload: {
                to: matchedOrder.user.email,
                subject: `بروزرسانی وضعیت مرسوله پستی #${matchedOrder.id.split("-")[0]} (${tapinLabel})`,
                html,
              },
            });
          } catch (notifErr) {
            log.error({ err: notifErr, orderId: matchedOrder.id }, "Failed to send status email for synced order");
          }
        }

        // Trigger SMS notification if phone is present
        if (isStatusChanged && (matchedOrder.phone || matchedOrder.user?.phoneNumber)) {
          const recipientPhone = matchedOrder.phone || matchedOrder.user?.phoneNumber;
          try {
            await notificationQueue.add("send-sms", {
              type: "sms",
              payload: {
                to: recipientPhone,
                text: `گالری چوب سنجاقک\nسفارش #${matchedOrder.id.split("-")[0]} شما به وضعیت: «${tapinLabel}» تغییر یافت.\nکد رهگیری پستی: ${cleanBarcode}`,
              },
            });
          } catch (smsErr) {
            log.error({ err: smsErr, orderId: matchedOrder.id }, "Failed to send status SMS for synced order");
          }
        }

        updatedCount++;
        details.push({
          orderId: matchedOrder.id,
          barcode: cleanBarcode,
          oldStatus,
          newStatus: targetStatus,
          tapinLabel,
        });

        log.info(
          {
            orderId: matchedOrder.id,
            barcode: cleanBarcode,
            oldStatus,
            newStatus: targetStatus,
            tapinLabel,
          },
          "Order successfully updated from Tapin sync"
        );
      }
    }

    log.info({ matchedCount, updatedCount }, "Tapin shipping sync completed successfully");

    return {
      success: true,
      totalTapinOrders: totalCount,
      matchedCount,
      updatedCount,
      details,
    };
  } catch (error) {
    log.error({ err: error }, "Failed to sync Tapin shipping orders");
    throw error;
  }
}
