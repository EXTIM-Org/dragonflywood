import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Camera,
  Truck,
  ArrowLeft,
  RefreshCw,
  PhoneCall
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'شرایط مرجوعی',
  description: 'رویه، قوانین و شرایط بازگرداندن کالا در گالری چوب سنجاقک',
};

const returnSteps = [
  {
    step: "۱",
    icon: <Camera className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "بررسی سفارش و تهیه مستندات",
    desc: "در صورت مشاهده آسیب‌دیدگی یا مغایرت، از بسته‌بندی و خود محصول عکس و ویدئو تهیه فرمایید."
  },
  {
    step: "۲",
    icon: <PhoneCall className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "تماس با پشتیبانی یا ثبت درخواست",
    desc: "در مهلت مقرر (حداکثر ۳ روز برای کالای آماده)، درخواست مرجوعی خود را به پشتیبانی اطلاع دهید."
  },
  {
    step: "۳",
    icon: <Truck className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "هماهنگی و ارسال مرسوله",
    desc: "محصول را در بسته‌بندی ایمن قرار داده و بر اساس هماهنگی‌های انجام‌شده ارسال فرمایید."
  },
  {
    step: "۴",
    icon: <RefreshCw className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "تعویض یا بازگشت کامل وجه",
    desc: "محصول تعویض شده یا در صورت عدم تمایل، کل مبلغ پرداختی به حساب شما مسترد می‌گردد."
  }
];

export default function ReturnsPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4 bg-violet-500/10 dark:bg-violet-500/20 px-4 py-2 rounded-full border border-violet-500/20">
            <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
              تضمین اصالت، سلامت و همراهی با مشتری
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            شرایط و رویه{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-violet-600 to-amber-600 dark:from-violet-400 dark:to-amber-400">
              مرجوعی کالا
            </span>
          </h1>

          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-gray-800 dark:text-gray-200 text-lg leading-relaxed shadow-sm">
            <p className="font-medium text-center">
              رضایت مشتری برای گالری سنجاقک اهمیت زیادی دارد و تلاش می‌کنیم محصول نهایی مطابق سفارش و با کیفیت مناسب به دست شما برسد.
            </p>
          </div>
        </div>

        {/* 2-Column: Ready-made vs Custom-made rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Custom Products (سفارشی) */}
          <div className="bg-amber-500/5 dark:bg-amber-900/10 border border-amber-500/20 dark:border-amber-700/30 rounded-3xl p-8 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    تولید اختصاصی
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    مرجوعی محصولات سفارشی
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  محصولات سفارشی به دلیل اینکه مطابق درخواست و مشخصات اختصاصی مشتری محترم ساخته می‌شوند، <strong className="text-amber-700 dark:text-amber-400 font-bold">امکان مرجوعی ندارند</strong>.
                </p>
                <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border border-amber-500/10 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-gray-200">یادآوری:</span> لغو سفارش‌های سفارشی تنها تا قبل از شروع فرایند ساخت امکان‌پذیر است. زمان شروع ساخت پیش‌تر از طریق پیام یا تماس به شما اطلاع داده خواهد شد.
                </div>
              </div>
            </div>
          </div>

          {/* Ready-made Products (غیرسفارشی) */}
          <div className="bg-emerald-500/5 dark:bg-emerald-900/10 border border-emerald-500/20 dark:border-emerald-700/30 rounded-3xl p-8 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    مهلت ۳ روزه
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    مرجوعی محصولات غیرسفارشی
                  </h3>
                </div>
              </div>

              <ul className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <span>محصولات غیرسفارشی و آماده در صورت سالم بودن امکان مرجوعی دارند.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <span>مشتری تا <strong className="text-emerald-700 dark:text-emerald-300 font-bold">۳ روز</strong> پس از تحویل سفارش فرصت دارد درخواست مرجوعی خود را ثبت کند.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <span>در صورتی که محصول کاملاً سالم و مطابق سفارش باشد و مشتری صرفاً به هر دلیلی قصد مرجوع کردن آن را داشته باشد، هزینه بازگشت محصول بر عهده مشتری خواهد بود.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Featured Card: Defective, Damaged or Discrepant Products */}
        <div className="mb-16 rounded-3xl bg-gradient-to-br from-violet-500/10 via-amber-500/5 to-transparent border-2 border-violet-500/20 dark:border-violet-500/30 p-8 md:p-10 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-violet-500/15">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-500/15 px-3 py-1 rounded-full">
                  پشتیبانی و مسئولیت‌پذیری کامل
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
                  محصول معیوب، آسیب‌دیده یا مغایر با سفارش
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Guarantee 1 */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">هزینه بازگشت با سنجاقک</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                اگر محصول هنگام تحویل آسیب‌دیده باشد، معیوب باشد یا با سفارش ثبت‌شده مطابقت نداشته باشد، هزینه بازگشت کاملاً بر عهده گالری سنجاقک است.
              </p>
            </div>

            {/* Guarantee 2 */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">تهیه عکس و ویدئو</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                در صورت مشاهده آسیب، لطفاً از بسته‌بندی و خود محصول عکس و ویدئو تهیه کرده و در اسرع وقت با پشتیبانی تماس بگیرید.
              </p>
            </div>

            {/* Guarantee 3 */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">پیگیری و عودت بی دردسر</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                پیگیری با شرکت حمل‌ونقل بر عهده گالری سنجاقک است و مشتری نیازی به پیگیری مستقیم خسارت ندارد. در نهایت محصول تعویض یا مبلغ آن کامل بازگردانده می‌شود.
              </p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-violet-500/15 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed bg-white/40 dark:bg-black/20 p-5 rounded-2xl">
            <strong>خلاصه فرایند جبران:</strong> در نهایت محصول آسیب‌دیده توسط گالری سنجاقک پس گرفته می‌شود. در صورت تمایل مشتری، محصول تعویض خواهد شد و در صورتی که مشتری تمایلی به تعویض نداشته باشد، مبلغ محصول به‌صورت کامل بازگردانده می‌شود.
          </div>
        </div>

        {/* Steps Flow */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              مراحل مرجوعی و بازگرداندن سفارش
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
              راهنمای گام‌به‌گام پیگیری سفارش‌های مشمول مرجوعی
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {returnSteps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md shadow-violet-600/30">
                  {step.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Footer */}
        <div className="bg-gradient-to-r from-violet-900/10 via-amber-900/10 to-violet-900/10 border border-violet-500/20 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                نیاز به راهنمایی یا ثبت درخواست دارید؟
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xl">
                تیم پشتیبانی گالری سنجاقک همواره در کنار شماست تا خریدی مطمئن، شفاف و لذت‌بخش را تجربه کنید.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-violet-500/30 text-violet-700 dark:text-violet-300 font-bold hover:bg-violet-500/10 transition-all text-sm"
            >
              تماس با پشتیبانی
            </Link>
            <Link
              href="/profile/orders"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-2 text-sm"
            >
              <span>مشاهده و مدیریت سفارش‌ها</span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
