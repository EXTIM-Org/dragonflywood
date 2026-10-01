"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useCart } from "@/store/CartContext";
import Link from "next/link";
import { CheckCircle2, XCircle, ShoppingBag, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const refId = searchParams.get("refId");
  const message = searchParams.get("message");

  const { clearCart } = useCart();
  const isSuccess = status === "success";

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  return (
    <div className="max-w-xl w-full mx-auto">
      {isSuccess ? (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            تراکنش امن بانکی تایید شد
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-2">
            پرداخت با موفقیت انجام شد
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base mb-8 max-w-sm">
            از خرید شما از گالری چوب سنجاقک سپاسگزاریم. سفارش شما ثبت و در صف آماده‌سازی قرار گرفت.
          </p>

          <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 mb-8 border border-zinc-200/70 dark:border-white/5 space-y-3 text-sm">
            {orderId && (
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>شناسه سفارش:</span>
                <span className="font-mono text-zinc-900 dark:text-white font-bold text-xs sm:text-sm bg-zinc-200/60 dark:bg-white/10 px-2 py-0.5 rounded">
                  {orderId}
                </span>
              </div>
            )}
            {refId && (
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>کد رهگیری زرین‌پال:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded">
                  {refId}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>وضعیت پرداخت:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">موفق</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/profile/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#516d3e] hover:bg-[#435b33] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-[#516d3e]/20"
            >
              پیگیری سفارشات
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 py-3.5 px-6 rounded-xl font-medium transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              ادامه خرید
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <XCircle className="w-12 h-12" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 mb-3">
            تراکنش ناموفق
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-2">
            پرداخت ناموفق بود
          </h1>
          <p className="text-rose-600 dark:text-rose-400 text-sm sm:text-base mb-6 max-w-sm">
            {message || "تراکنش توسط کاربر لغو شد یا از سوی بانک با خطا مواجه گردید."}
          </p>

          <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 mb-8 border border-zinc-200/70 dark:border-white/5 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-right">
            {orderId && (
              <div className="flex justify-between items-center">
                <span>شناسه سفارش:</span>
                <span className="font-mono text-zinc-900 dark:text-white font-bold text-xs bg-zinc-200/60 dark:bg-white/10 px-2 py-0.5 rounded">
                  {orderId}
                </span>
              </div>
            )}
            <p className="leading-relaxed text-zinc-500 dark:text-zinc-400 text-xs">
              چنانچه مبلغی از حساب شما کسر شده است، معمولاً ظرف مدت حداکثر ۷۲ ساعت توسط بانک به حسابتان عودت داده خواهد شد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/checkout"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#516d3e] hover:bg-[#435b33] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-[#516d3e]/20"
            >
              <RefreshCw className="w-4 h-4" />
              تلاش مجدد برای پرداخت
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 py-3.5 px-6 rounded-xl font-medium transition-all"
            >
              بازگشت به سبد خرید
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 flex items-center justify-center bg-gradient-to-b from-zinc-50/50 via-white to-zinc-100/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#516d3e] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">در حال دریافت وضعیت پرداخت...</p>
          </div>
        }
      >
        <PaymentResultContent />
      </Suspense>
    </main>
  );
}
