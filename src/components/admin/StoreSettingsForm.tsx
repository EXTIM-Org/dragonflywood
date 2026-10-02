"use client";

import { useState } from "react";
import { Truck, Save } from "lucide-react";
import toast from "react-hot-toast";

type StoreSettingsType = {
  free_shipping_enabled: boolean;
  free_shipping_threshold: number;
};

export function StoreSettingsForm({ initialSettings }: { initialSettings: StoreSettingsType }) {
  const [enabled, setEnabled] = useState(initialSettings.free_shipping_enabled);
  const [threshold, setThreshold] = useState(initialSettings.free_shipping_threshold.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { updateStoreSettingValue } = await import("@/actions/settings");
      await updateStoreSettingValue("free_shipping_enabled", enabled ? "true" : "false");
      await updateStoreSettingValue("free_shipping_threshold", threshold);
      toast.success("تنظیمات ارسال فروشگاه با موفقیت ذخیره شد");
    } catch (_error) {
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const isChanged =
    enabled !== initialSettings.free_shipping_enabled ||
    Number(threshold) !== initialSettings.free_shipping_threshold;

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">تنظیمات ارسال و تعرفه پستی تاپین</h2>
              <p className="text-sm text-gray-500 mt-1">مدیریت سقف ارسال رایگان و قوانین پستی</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] flex flex-col gap-6">
          {/* Toggle Free Shipping */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white">فعال‌سازی ارسال رایگان</span>
              <span className="text-xs text-gray-500">
                در صورت فعال بودن، سفارش‌های بالاتر از سقف تعیین‌شده مشمول ارسال رایگان خواهند شد. در صورت غیرفعال بودن، تعرفه واقعی تاپین برای تمامی سفارش‌ها محاسبه می‌شود.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer me-2">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>

          {/* Threshold input */}
          <div className={`max-w-xl transition-opacity duration-200 ${enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              سقف ارسال رایگان (تومان)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              سبدهای خریدی که مبلغ کل آن‌ها بیشتر از این مقدار باشد، شامل ارسال رایگان می‌شوند و نوار پیشرفت در سبد خرید نمایش داده خواهد شد.
            </p>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  disabled={!enabled}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-left font-mono focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  dir="ltr"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {new Intl.NumberFormat("fa-IR").format(Number(threshold || 0))} تومان
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={saving || !isChanged}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
