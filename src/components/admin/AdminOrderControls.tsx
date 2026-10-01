"use client";

import { updateOrderStatus, updateTrackingCode } from "@/actions/order";
import { queryTapinBarcodeAction } from "@/actions/shipping";
import { useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { DropdownSelect } from "@/components/ui/DropdownSelect";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

export function AdminOrderControls({ 
  orderId, 
  currentStatus, 
  trackingCode: initialTrackingCode 
}: { 
  orderId: string;
  currentStatus: OrderStatus;
  trackingCode?: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isTapinLoading, setIsTapinLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tapinInfo, setTapinInfo] = useState<{
    statusLabel: string;
    mappedStatus: OrderStatus;
    fullName?: string;
    createdAt?: string;
  } | null>(null);

  const STATUS_OPTIONS = [
    { value: "PENDING", label: "در انتظار پرداخت (PENDING)" },
    { value: "PAID", label: "تایید شده - پرداخت موفق (PAID)" },
    { value: "PROCESSING", label: "در حال پردازش (PROCESSING)" },
    { value: "SHIPPED", label: "ارسال شده (SHIPPED)" },
    { value: "CANCELLED", label: "لغو شده (CANCELLED)" },
    { value: "DELIVERED", label: "تحویل شده (DELIVERED)" },
  ];

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatus(newStatus);
    setIsLoading(true);
    setMessage("");
    
    const res = await updateOrderStatus(orderId, newStatus);
    
    setIsLoading(false);
    if (res.success) {
      setMessage("وضعیت با موفقیت به‌روزرسانی شد و ایمیل ارسال گردید.");
    } else {
      setMessage(res.error || "خطایی رخ داد.");
      setStatus(currentStatus); // Revert
    }
    
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const res = await updateTrackingCode(orderId, trackingCode);
    
    setIsLoading(false);
    if (res.success) {
      setMessage("کد رهگیری با موفقیت ثبت شد.");
    } else {
      setMessage(res.error || "خطایی رخ داد.");
    }

    setTimeout(() => setMessage(""), 5000);
  };

  const handleQueryTapin = async () => {
    if (!trackingCode.trim()) {
      setMessage("لطفاً ابتدا کد رهگیری را وارد کنید.");
      return;
    }
    setIsTapinLoading(true);
    setTapinInfo(null);
    setMessage("");

    const res = await queryTapinBarcodeAction(trackingCode.trim());
    setIsTapinLoading(false);

    if (res.success && res.data) {
      setTapinInfo({
        statusLabel: res.data.statusLabel,
        mappedStatus: res.data.mappedStatus as OrderStatus,
        fullName: res.data.fullName,
        createdAt: res.data.createdAt,
      });

      // If Tapin status is different from current status, suggest update
      if (res.data.mappedStatus !== status) {
        setMessage(`وضعیت تاپین: «${res.data.statusLabel}». در حال همگام‌سازی وضعیت سفارش...`);
        await handleStatusChange(res.data.mappedStatus as OrderStatus);
      } else {
        setMessage(`استعلام موفق: وضعیت مرسوله در تاپین «${res.data.statusLabel}» می‌باشد.`);
      }
    } else {
      setMessage(res.error || "بارکد مورد نظر در تاپین یافت نشد.");
    }

    setTimeout(() => setMessage(""), 7000);
  };

  return (
    <div className="bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 mt-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">کنترل و مدیریت سفارش</h3>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 ${message.includes("خطا") ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            تغییر وضعیت سفارش
          </label>
          <DropdownSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => handleStatusChange(val as OrderStatus)}
            variant="neutral"
            isLoading={isLoading}
            className="w-full text-right"
          />
          <p className="text-xs text-gray-500 mt-2">
            با تغییر وضعیت، ایمیل و پیامک اطلاع‌رسانی برای مشتری ارسال می‌شود.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            کد رهگیری پست (تاپین)
          </label>
          <form onSubmit={handleSaveTracking} className="flex gap-2">
            <input 
              type="text" 
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              disabled={isLoading || isTapinLoading}
              placeholder="مثلاً 045150519508280860098147"
              className="flex-1 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white font-mono text-left text-sm"
              dir="ltr"
            />
            <button 
              type="submit" 
              disabled={isLoading || isTapinLoading}
              className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-xl transition-colors disabled:opacity-50 min-w-[85px] flex justify-center items-center font-medium text-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ثبت کد"}
            </button>
          </form>

          {trackingCode && (
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleQueryTapin}
                disabled={isTapinLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                {isTapinLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Truck className="w-3.5 h-3.5" />
                )}
                <span>استعلام زنده از تاپین</span>
              </button>

              <a
                href={`https://tracking.post.ir/?id=${trackingCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                پیگیری در سامانه پست ↗
              </a>
            </div>
          )}

          {tapinInfo && (
            <div className="mt-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-xs flex flex-col gap-1 text-emerald-800 dark:text-emerald-200">
              <span className="font-bold">وضعیت در تاپین: {tapinInfo.statusLabel}</span>
              {tapinInfo.fullName && <span>گیرنده در سامانه تاپین: {tapinInfo.fullName}</span>}
              {tapinInfo.createdAt && <span>تاریخ ثبت در تاپین: {tapinInfo.createdAt}</span>}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            این بارکد وضعیت سفارش را به صورت خودکار از طریق وب‌سرویس تاپین به‌روز می‌کند.
          </p>
        </div>
      </div>
    </div>
  );
}
