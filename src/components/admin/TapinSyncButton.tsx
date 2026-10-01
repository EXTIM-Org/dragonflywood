"use client";

import { useState } from "react";
import { Truck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { syncTapinShippingAction } from "@/actions/shipping";

export function TapinSyncButton() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await syncTapinShippingAction();
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "وضعیت مرسولات با موفقیت از تاپین همگام‌سازی شد.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "خطا در همگام‌سازی با تاپین.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "خطای غیرمنتظره در ارتباط با تاپین.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
        title="دریافت آخرین وضعیت مرسولات پستی از تاپین"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Truck className="w-4 h-4" />
        )}
        <span>همگام‌سازی با تاپین</span>
      </button>

      {feedback && (
        <div
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
              : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
