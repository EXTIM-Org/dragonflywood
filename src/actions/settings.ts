"use server";

import { redis } from "@/lib/redis";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/audit";

export async function getNotificationSettings() {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  const settings = await redis.hgetall("settings:notifications");
  
  // Provide defaults for all keys
  const getBool = (key: string, def = true) => settings[key] !== undefined ? settings[key] === "true" : def;

  return {
    globalSms: getBool("globalSms"),
    globalEmail: getBool("globalEmail"),
    
    // Returns
    returns_submitted_sms: getBool("returns_submitted_sms"),
    returns_submitted_email: getBool("returns_submitted_email"),
    returns_pending_sms: getBool("returns_pending_sms"),
    returns_pending_email: getBool("returns_pending_email"),
    returns_approved_sms: getBool("returns_approved_sms"),
    returns_approved_email: getBool("returns_approved_email"),
    returns_rejected_sms: getBool("returns_rejected_sms"),
    returns_rejected_email: getBool("returns_rejected_email"),
    returns_refunded_sms: getBool("returns_refunded_sms"),
    returns_refunded_email: getBool("returns_refunded_email"),
    
    // Orders
    orders_paid_sms: getBool("orders_paid_sms"),
    orders_paid_email: getBool("orders_paid_email"),
    orders_processing_sms: getBool("orders_processing_sms"),
    orders_processing_email: getBool("orders_processing_email"),
    orders_shipped_sms: getBool("orders_shipped_sms"),
    orders_shipped_email: getBool("orders_shipped_email"),
    orders_delivered_sms: getBool("orders_delivered_sms"),
    orders_delivered_email: getBool("orders_delivered_email"),
    orders_cancelled_sms: getBool("orders_cancelled_sms"),
    orders_cancelled_email: getBool("orders_cancelled_email"),
    
    // Abandoned Cart
    abandoned_cart_sms: getBool("abandoned_cart_sms", false),
    abandoned_cart_email: getBool("abandoned_cart_email", false),
    abandoned_cart_delay_minutes: settings["abandoned_cart_delay_minutes"] || "120",
    abandoned_cart_sms_text: settings["abandoned_cart_sms_text"] || "سلام {name} عزیز، سبد خرید شما منتظر شماست!\nهمین الان خرید خود را نهایی کنید.\n{discount}",
    abandoned_cart_discount_enabled: getBool("abandoned_cart_discount_enabled", false),
    abandoned_cart_discount_percent: settings["abandoned_cart_discount_percent"] || "10",
  };
}

export async function updateNotificationSettingValue(key: string, value: string) {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  await redis.hset("settings:notifications", key, value);
  await logAdminAction({
    action: 'SETTINGS_CHANGE',
    entity: 'NotificationSettings',
    description: `تغییر تنظیم ${key} به ${value}`
  });
  revalidatePath("/admin/settings/notifications");
  return { success: true };
}

export async function getStoreSettings() {
  const settings = await redis.hgetall("settings:store");
  return {
    free_shipping_enabled: settings["free_shipping_enabled"] === "true",
    free_shipping_threshold: parseInt(settings["free_shipping_threshold"] || "2000000", 10),
  };
}

export async function updateStoreSettingValue(key: string, value: string) {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  await redis.hset("settings:store", key, value);
  await logAdminAction({
    action: 'SETTINGS_CHANGE',
    entity: 'StoreSettings',
    description: `تغییر تنظیم فروشگاه ${key} به ${value}`
  });
  revalidatePath("/admin/settings/store");
  revalidatePath("/cart");
  return { success: true };
}

export async function updateNotificationSetting(key: string, value: boolean) {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  await redis.hset("settings:notifications", key, value ? "true" : "false");
  await logAdminAction({
    action: 'SETTINGS_CHANGE',
    entity: 'NotificationSettings',
    description: `تغییر وضعیت تنظیم ${key} به ${value ? "فعال" : "غیرفعال"}`
  });
  revalidatePath("/admin/settings/notifications");
  return { success: true };
}
