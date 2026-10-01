"use client";

import { useState } from "react";
import { Truck, Save } from "lucide-react";
import toast from "react-hot-toast";

type StoreSettingsType = {
  free_shipping_threshold: number;
};

export function StoreSettingsForm({ initialSettings }: { initialSettings: StoreSettingsType }) {
  const [threshold, setThreshold] = useState(initialSettings.free_shipping_threshold.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { updateStoreSettingValue } = await import("@/actions/settings");
      await updateStoreSettingValue("free_shipping_threshold", threshold);
      toast.success("تنظیمات فروشگاه با موفقیت ذخیره شد");
    } catch (_error) {
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">تنظیمات ارسال و پیک</h2>
              <p className="text-sm text-gray-500 mt-1">مدیریت هزینه‌های ارسال و نوارهای پیشرفت</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="max-w-xl">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              سقف ارسال رایگان (تومان)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              سبدهای خریدی که مبلغ کل آن‌ها بیشتر از این مقدار باشد، شامل ارسال رایگان می‌شوند و یک نوار پیشرفت جذاب در سبد خرید نمایش داده می‌شود.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-left font-mono focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  dir="ltr"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {new Intl.NumberFormat('fa-IR').format(Number(threshold || 0))} تومان
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || Number(threshold) === initialSettings.free_shipping_threshold}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                ذخیره
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
