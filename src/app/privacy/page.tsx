import {
  ShieldCheck,
  UserCheck,
  Truck,
  Database,
  BellRing,
  Scale,
  CreditCard,
  Mail,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست‌های حفظ حریم خصوصی و امنیت اطلاعات کاربران در گالری چوب سنجاقک',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4 overflow-hidden">
      
      {/* Background Subtle Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4 bg-violet-500/10 dark:bg-violet-500/20 px-4 py-2 rounded-full border border-violet-500/20 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
              امانت‌داری و شفافیت در نگهداری اطلاعات
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            سیاست حفظ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-violet-600 to-amber-600 dark:from-violet-400 dark:to-amber-400">
              حریم خصوصی
            </span>
          </h1>

          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-gray-800 dark:text-gray-200 text-lg leading-relaxed shadow-sm">
            <p className="font-semibold text-center">
              گالری سنجاقک برای حفظ حریم خصوصی مشتریان و حفاظت از اطلاعات آن‌ها اهمیت زیادی قائل است.
            </p>
          </div>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: اطلاعات دریافتی */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">
                  شفافیت در دریافت داده‌ها
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  چه اطلاعاتی دریافت می‌شود؟
                </h2>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-justify">
              برای ثبت و ارسال سفارش، اطلاعاتی مانند <strong>نام و نام خانوادگی، شماره موبایل، آدرس، کد پستی، ایمیل و کد ملی</strong> دریافت می‌شود.
            </p>

            <div className="p-4 rounded-2xl bg-violet-500/5 dark:bg-violet-950/20 border border-violet-500/15 text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
              <p>
                • <strong>هدف استفاده:</strong> این اطلاعات برای انجام دقیق فرایند سفارش، هماهنگی‌های لازم و ارسال آن به مقصد استفاده می‌شوند.
              </p>
              <p>
                • <strong>دریافت کد ملی:</strong> کد ملی نیز برای فرایند ارسال سفارش و صدور اسناد لازم دریافت می‌شود.
              </p>
            </div>
          </div>

          {/* Card 2: اشتراک‌گذاری محدود و هدفمند */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  ارائه خدمات لجستیک و مالی
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  اشتراک‌گذاری اطلاعات با ارائه‌دهندگان خدمت
                </h2>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-justify">
              اطلاعات موردنیاز مشتری، در حد لازم برای انجام خدمات، در اختیار شرکت حمل‌ونقل و امور مالی مجموعه قرار می‌گیرد.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-1">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>حداقل‌سازی دسترسی‌ها</span>
              </div>
              هیچ شریک تجاری یا متصدی ارسالی به اطلاعات فراتر از آدرس و شماره تماس تحویل‌گیرنده دسترسی نخواهد داشت.
            </div>
          </div>

          {/* Card 3: ثبت و نگهداری سوابق */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  حفظ پیشینه خرید
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  ثبت و نگهداری سوابق
                </h2>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
              اطلاعات مشتری در سوابق مجموعه ثبت و نگهداری می‌شود تا امکان پیگیری سفارش‌ها، ارائه خدمات پس از فروش و پشتیبانی‌های آتی به ساده‌ترین شکل ممکن فراهم باشد.
            </p>
          </div>

          {/* Card 4: پیام‌های تبلیغاتی با رضایت مشتری */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">
                  احترام به انتخاب مشتری
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  اطلاع‌رسانی و پیام‌های تبلیغاتی
                </h2>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
              استفاده از اطلاعات مشتری برای مواردی مانند ارسال پیام‌های تبلیغاتی، معرفی محصولات جدید، تخفیف‌ها و اطلاع‌رسانی‌های مشابه، <strong>تنها با رضایت مشتری</strong> انجام خواهد شد.
            </p>
          </div>

        </div>

        {/* Legal & Non-Disclosure Banner */}
        <div className="mb-12 rounded-3xl bg-gradient-to-br from-violet-500/10 via-amber-500/5 to-transparent border-2 border-violet-500/20 dark:border-violet-500/30 p-8 md:p-10 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-600/30">
              <Scale className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                تعهد عدم استفاده غیرمجاز از اطلاعات
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed text-justify">
                اطلاعات مشتریان بدون رضایت آن‌ها برای اهداف خارج از فرایند سفارش و خدمات مرتبط با آن مورد استفاده قرار نمی‌گیرد، مگر در مواردی که ارائه اطلاعات به‌موجب قانون الزامی باشد.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support Footer */}
        <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                پرسشی درباره حریم خصوصی و اطلاعات خود دارید؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                همکاران ما در بخش پشتیبانی گالری سنجاقک آماده پاسخگویی به ابهامات شما هستند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2 text-sm"
            >
              <span>تماس با پشتیبانی گالری</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
