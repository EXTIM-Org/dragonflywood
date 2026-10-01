"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { upsertPromotion } from "@/actions/promotions";
import { DropdownSelect } from "@/components/ui/DropdownSelect";

type PromotionFormProps = {
  initialData?: any;
  categories: any[];
};

export function PromotionForm({ initialData, categories }: PromotionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    isActive: initialData !== undefined ? initialData.isActive : true,
    type: initialData?.type || "BOGO",
    targetCategoryId: initialData?.targetCategoryId || "",
    minQuantity: initialData?.minQuantity || 2,
    minCartTotal: initialData?.minCartTotal || 0,
    discountPercent: initialData?.discountPercent || 50,
    discountAmount: initialData?.discountAmount || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("نام کمپین الزامی است.");

    setSaving(true);
    const res = await upsertPromotion(initialData?.id || null, formData);
    setSaving(false);

    if (res.success) {
      toast.success("کمپین با موفقیت ذخیره شد");
      router.push("/admin/promotions");
    } else {
      toast.error(res.error || "خطا در ذخیره کمپین");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/promotions" className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData ? "ویرایش کمپین" : "افزودن کمپین جدید"}
        </h1>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">عنوان کمپین</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500"
              placeholder="مثال: یکی بخر دوتا ببر ویژه تیشرت"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">وضعیت</label>
            <DropdownSelect
              value={formData.isActive ? "true" : "false"}
              onChange={val => setFormData({ ...formData, isActive: val === "true" })}
              options={[
                { value: "true", label: "فعال" },
                { value: "false", label: "غیرفعال" }
              ]}
              variant="neutral"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">توضیحات (اختیاری)</label>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none h-24"
            placeholder="توضیحات مربوط به این کمپین..."
          />
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 my-2 pt-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">قوانین و شرایط</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نوع کمپین</label>
              <DropdownSelect
                value={formData.type}
                onChange={val => setFormData({ ...formData, type: val as any })}
                options={[
                  { value: "BOGO", label: "یکی بخر دومی با تخفیف (BOGO)" },
                  { value: "CART_TOTAL", label: "تخفیف روی مبلغ کل فاکتور" }
                ]}
                variant="neutral"
              />
            </div>

            {formData.type === "BOGO" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">اعمال روی دسته‌بندی</label>
                <DropdownSelect
                  value={formData.targetCategoryId || "all"}
                  onChange={val => setFormData({ ...formData, targetCategoryId: val === "all" ? "" : val })}
                  options={[
                    { value: "all", label: "همه محصولات فروشگاه" },
                    ...categories.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  variant="neutral"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-500/20">
            {formData.type === "BOGO" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-purple-900 dark:text-purple-300">حداقل تعداد خرید (شرط)</label>
                  <input 
                    type="number" 
                    value={formData.minQuantity} 
                    onChange={e => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })} 
                    className="px-4 py-3 bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs text-purple-600/70">مثلاً ۲ (یعنی کاربر باید ۲ تا بخرد تا روی ارزان‌ترین کالا تخفیف بگیرد)</span>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-purple-900 dark:text-purple-300">درصد تخفیف (پاداش)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.discountPercent} 
                      onChange={e => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })} 
                      className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-left"
                      dir="ltr"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <span className="text-xs text-purple-600/70">مثلاً ۵۰٪ روی دومین کالا اعمال می‌شود</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-purple-900 dark:text-purple-300">حداقل مبلغ فاکتور (تومان)</label>
                  <input 
                    type="number" 
                    value={formData.minCartTotal} 
                    onChange={e => setFormData({ ...formData, minCartTotal: parseInt(e.target.value) || 0 })} 
                    className="px-4 py-3 bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-left"
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-purple-900 dark:text-purple-300">مبلغ تخفیف (تومان)</label>
                  <input 
                    type="number" 
                    value={formData.discountAmount} 
                    onChange={e => setFormData({ ...formData, discountAmount: parseInt(e.target.value) || 0 })} 
                    className="px-4 py-3 bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-left"
                    dir="ltr"
                  />
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/admin/promotions" className="px-6 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
          انصراف
        </Link>
        <button 
          type="submit" 
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          ذخیره کمپین
        </button>
      </div>
    </form>
  );
}
