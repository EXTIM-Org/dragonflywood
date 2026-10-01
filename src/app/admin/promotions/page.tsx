import { getPromotions } from "@/actions/promotions";
import Link from "next/link";
import { Plus, Gift, Edit, Trash2 } from "lucide-react";
import { deletePromotion } from "@/actions/promotions";

export const metadata = {
  title: "مدیریت کمپین‌ها | داشبورد ادمین",
};

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">کمپین‌های تخفیفی</h1>
          <p className="text-gray-500 mt-1">مدیریت تخفیف‌های هوشمند، BOGO و پاداش سبد خرید</p>
        </div>
        <Link 
          href="/admin/promotions/new" 
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          <Plus className="w-5 h-5" />
          افزودن کمپین
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {promotions.map((promo: any) => (
          <div key={promo.id} className={`bg-white dark:bg-white/5 border ${promo.isActive ? 'border-purple-200 dark:border-purple-500/30' : 'border-gray-200 dark:border-white/10'} rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl group`}>
            {promo.isActive ? (
              <div className="absolute top-4 left-4 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            ) : (
              <div className="absolute top-4 left-4 px-2 py-1 bg-gray-100 dark:bg-white/10 text-xs text-gray-500 rounded-lg">غیرفعال</div>
            )}
            
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{promo.name}</h3>
            {promo.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{promo.description}</p>}
            
            <div className="flex flex-col gap-2 mt-4 text-sm bg-gray-50 dark:bg-black/20 p-4 rounded-2xl">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>نوع کمپین:</span>
                <span className="font-bold text-gray-900 dark:text-white">{promo.type === 'BOGO' ? 'BOGO (تخفیف شرطی)' : 'تخفیف روی فاکتور'}</span>
              </div>
              
              {promo.type === 'BOGO' && (
                <>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>دسته‌بندی:</span>
                    <span>{promo.category?.name || 'همه دسته‌ها'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>حداقل تعداد:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{promo.minQuantity} عدد</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>تخفیف:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{promo.discountPercent}٪</span>
                  </div>
                </>
              )}
              
              {promo.type === 'CART_TOTAL' && (
                <>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>حداقل خرید:</span>
                    <span>{promo.minCartTotal?.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>تخفیف:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{promo.discountAmount?.toLocaleString('fa-IR')} تومان</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/admin/promotions/${promo.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors text-sm font-bold">
                <Edit className="w-4 h-4" /> ویرایش
              </Link>
              <form action={async () => {
                "use server";
                await deletePromotion(promo.id);
              }} className="flex-1">
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors text-sm font-bold">
                  <Trash2 className="w-4 h-4" /> حذف
                </button>
              </form>
            </div>
          </div>
        ))}

        {promotions.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/20">
            <Gift className="w-16 h-16 text-gray-300 dark:text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">هیچ کمپینی یافت نشد</h3>
            <p className="text-gray-500 text-center max-w-md">شما هنوز هیچ کمپین هوشمندی تعریف نکرده‌اید. با افزودن یک کمپین BOGO فروش خود را افزایش دهید.</p>
          </div>
        )}
      </div>
    </div>
  );
}
