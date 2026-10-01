import Link from "next/link";
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  ShoppingBag, 
  CheckCircle2, 
  Layers, 
  Users, 
  ChevronLeft,
  HeartHandshake,
  Package,
  Truck,
  Clock,
  CreditCard,
  Undo2,
  Coins
} from "lucide-react";

export const metadata = {
  title: 'درباره ما',
  description: 'درباره گالری سنجاقک، فلسفه نام‌گذاری، داستان از هسته خرما تا دنیای چوب و راهنمای خرید.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-violet-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden border-b border-black/5 dark:border-white/5">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-violet-600/15 dark:bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-24 right-10 w-80 h-80 bg-fuchsia-600/15 dark:bg-fuchsia-600/10 blur-[110px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium text-sm mb-6 border border-violet-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>گالری چوب سنجاقک</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.25] mb-6">
            آفرینش یک اثر هنری، <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-amber-400">
              با روح و اصالت چوب
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/75 leading-relaxed max-w-2xl mx-auto">
            روایتی صادقانه از آغاز، فلسفه انتخاب نام سنجاقک، عشق به چوب‌های طبیعی و راهنمای همراهی با ما.
          </p>

          {/* Quick Navigation Anchor Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
            <a 
              href="#about-section" 
              className="px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-xs sm:text-sm font-medium border border-foreground/10 transition-colors"
            >
              ۱. درباره گالری
            </a>
            <a 
              href="#why-sanjaghak" 
              className="px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-xs sm:text-sm font-medium border border-foreground/10 transition-colors"
            >
              ۲. چرا سنجاقک؟
            </a>
            <a 
              href="#story-section" 
              className="px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-xs sm:text-sm font-medium border border-foreground/10 transition-colors"
            >
              ۳. داستان ما
            </a>
            <a 
              href="#shopping-guide" 
              className="px-4 py-2 rounded-full bg-violet-600/10 hover:bg-violet-600/20 text-violet-700 dark:text-violet-300 text-xs sm:text-sm font-medium border border-violet-500/20 transition-colors"
            >
              ۴. راهنمای خرید
            </a>
          </div>
        </div>
      </section>

      {/* 1. درباره ما (درباره گالری سنجاقک) */}
      <section id="about-section" className="py-20 border-b border-black/5 dark:border-white/5 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              ۱
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              درباره گالری سنجاقک
            </h2>
          </div>

          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-sm space-y-6 text-foreground/85 leading-relaxed text-base sm:text-lg">
            <p className="font-medium text-lg sm:text-xl text-violet-700 dark:text-violet-300 leading-relaxed">
              گالری سنجاقک یک مجموعه کارگاهی در زمینه تولید محصولات چوبی دست‌ساز است؛ مجموعه‌ای که در آن هر محصول فقط یک کالای تولیدی نیست، بلکه با نگاه یک اثر هنری شکل می‌گیرد.
            </p>

            <p>
              مسیر سنجاقک از جایی شروع شد که شاید هیچ‌وقت فکر نمی‌کردیم به اینجا برسد؛ از فروش خرما و دستفروشی. در همان مسیر، به‌صورت اتفاقی با یک تولیدی محصولات چوبی آشنا شدیم و فروش محصولات چوبی را هم شروع کردیم. همین اتفاق ساده، کم‌کم ما را وارد دنیای چوب کرد.
            </p>

            <p>
              بعد از آن، مسیر یادگیری شروع شد؛ از کار کردن و تجربه کردن تا شرکت در کلاس‌ها و یاد گرفتن بیشتر. امروز سنجاقک فقط یک فروشنده نیست؛ هم تولید می‌کند، هم با مجموعه‌های دیگر همکاری دارد و هم محصولات را مستقیماً به دست مشتری می‌رساند.
            </p>

            <p>
              ما با مجموعه‌های مختلف و همچنین استادکارانی با حدود ۱۰ تا ۱۵ سال تجربه همکاری می‌کنیم و تلاشمان این است که از انتخاب چوب مناسب تا رسیدن محصول نهایی، کیفیت در تمام مراحل مورد توجه قرار بگیرد.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/10">
                <div className="flex items-center gap-2 font-bold text-foreground mb-2">
                  <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>فرایند اصولی تولید</span>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  انتخاب چوب، طی شدن صحیح فرایند خشک‌شدن، استفاده از دستگاه‌های مناسب و کنترل کیفیت، بخش‌هایی از فرایند تولید ما هستند. در تولید محصولات چوبی، بخشی از کار به تجربه، آزمون و خطا و کنترل کیفیت نیاز دارد و ما تلاش می‌کنیم با یک فرایند تولید اصولی، کیفیت نهایی محصول را حفظ کنیم.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/10">
                <div className="flex items-center gap-2 font-bold text-foreground mb-2">
                  <Sparkles className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                  <span>دسته‌بندی‌های اصلی</span>
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  محصولات اصلی گالری سنجاقک در دو گروه <strong className="text-foreground">اکسسوری‌های چوبی</strong> و <strong className="text-foreground">ظروف چوبی</strong> قرار می‌گیرند که با نهایت ظرافت و ماندگاری فرآوری می‌شوند.
                </p>
              </div>
            </div>

            <p>
              با وجود تنوع محصولات، برای هر کار زمان و توجه زیادی صرف می‌شود؛ چون برای ما هر محصول قرار نیست صرفاً یک محصول تولیدی باشد. دوست داریم هر اثر، شبیه یک نقاشی، مرحله‌به‌مرحله شکل بگیرد.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-3">
              <Users className="w-6 h-6 text-violet-600 dark:text-violet-400 shrink-0" />
              <p className="text-sm sm:text-base font-medium text-foreground">
                و مهم‌تر از همه، سنجاقک یک نفر نیست؛ یک تیم است. تیمی که با تعهد، یادگیری و علاقه، این مسیر را ادامه می‌دهد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. چرا سنجاقک؟ */}
      <section id="why-sanjaghak" className="py-20 border-b border-black/5 dark:border-white/5 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center font-bold">
              ۲
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              چرا سنجاقک؟
            </h2>
          </div>

          <div className="bg-gradient-to-br from-violet-600/5 via-fuchsia-600/5 to-amber-600/5 dark:from-white/5 dark:to-white/[0.02] border border-violet-500/20 dark:border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-sm space-y-6 text-foreground/85 leading-relaxed text-base sm:text-lg">
            <blockquote className="border-s-4 border-violet-600 dark:border-violet-400 ps-4 py-1 italic text-lg sm:text-xl font-bold text-foreground">
              «عمر سنجاقک برای من خیلی قبل‌تر از هسته خرماست.»
            </blockquote>

            <p>
              من به چیزهایی نیاز داشتم درون خودم که همه‌شان را در سنجاقک می‌دیدم؛ برای همین سنجاقک نماد درون من شد.
            </p>

            <p className="bg-foreground/5 p-4 rounded-2xl border border-foreground/10">
              همیشه قبل از هر چیزی از خدایی که وجود ندارد خواستم تا آخر عمرم قدرت پذیرش داشته باشم.
              <br className="my-2" />
              یعنی چه؟ یعنی این توانایی را داشته باشم که هیچ‌وقت متعصبانه روی باورهایم باقی نمانم. حتی اگر آخرین روز عمرم باشد و بفهمم همه کارهایم اشتباه بوده، بتوانم راحت بپذیرم. مثل یک سنجاقک آزاد و رها باشم و راحت بتوانم بفهمم که اشتباه می‌روم و برگردم.
            </p>

            <div className="space-y-4">
              <p>
                یک چیز دیگر که من را عاشق سنجاقک می‌کند این است که این موجود بیشتر عمرش را داخل آب می‌گذراند.
              </p>
              <p>
                آب برای من نماد آرامش است. دنیا و چالش‌هایش را به شکل آب می‌بینم؛ جلوِ آن بایستی، می‌بردت، یادش بگیری، حالت را خوب می‌کند. برای من چالش‌های زندگی مثل زندگی داخل آب است. داخل این زندگی می‌کنم تا به وقتش پرواز کنم.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 font-bold text-violet-700 dark:text-violet-300 mb-1">
                  <Compass className="w-4 h-4" />
                  <span>دیدن زوایای مختلف</span>
                </div>
                <p className="text-sm text-foreground/75">
                  سنجاقک ویژگی‌های زیادی دارد؛ مثل دیدن زندگی از زاویه‌های مختلف.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 font-bold text-fuchsia-700 dark:text-fuchsia-300 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>ظریف اما قدرتمند</span>
                </div>
                <p className="text-sm text-foreground/75">
                  با اینکه موجود ظریفی است، اما به‌شدت قدرتمند و رهاست.
                </p>
              </div>
            </div>

            <p className="font-semibold text-foreground text-center pt-2 text-base sm:text-lg">
              برای من، سنجاقک نماد درون من است؛ آزاد، پذیرنده، انعطاف‌پذیر و آماده برای تغییر مسیر.
            </p>
          </div>
        </div>
      </section>

      {/* 3. داستان گالری سنجاقک */}
      <section id="story-section" className="py-20 border-b border-black/5 dark:border-white/5 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              ۳
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              داستان گالری سنجاقک
            </h2>
          </div>

          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-sm space-y-6 text-foreground/85 leading-relaxed text-base sm:text-lg">
            <p>
              وقتی تصمیم می‌گیری یک کاری برای خودت راه بیندازی، شاید حتی به ذهنت هم نرسد که قرار است آخرش به کجا برسی.
              <br />
              من هم نمی‌دانستم.
            </p>

            <p>
              اول کارم فروش خرما بود؛ با دستفروشی شروع کردم.
              <br />
              همان موقع، کاملاً اتفاقی با یک تولیدی کارهای چوبی آشنا شدم و شروع کردم به فروختن کارهای چوبی آنها در کنار خرما.
            </p>

            <p>
              کم‌کم چوب برایم فقط چیزی برای فروش نبود.
              <br />
              شروع کردم به یاد گرفتن. کلاس رفتم، تمرین کردم و کم‌کم خودم هم شروع به ساختن کردم.
            </p>

            <p>
              امروز داستان به جایی رسیده که هم با جاهای دیگر کار می‌کنم، هم خودم تولید می‌کنم، هم خودم می‌فروشم و هنوز هم کلاس می‌روم تا بیشتر و بیشتر یاد بگیرم.
            </p>

            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 my-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                <span>هسته خرما</span>
              </div>
              <p className="text-foreground/85 leading-relaxed">
                فروش خرما را کنار گذاشتم، ولی یک چیز از آن روزها هنوز با من است: <strong>هسته خرما</strong>.
                <br />
                شنیده بودم اولش یک هسته خرماست؛ وقتی روی آن کار کنی و به آن رسیدگی کنی، می‌تواند تبدیل به یک نخل شود.
                <br />
                من هم آن هسته را دور نینداختم. هنوز توی جیبم بود. کاشتمش.
              </p>
            </div>

            <p>
              گالری سنجاقک هم برای من همین است؛ یک هسته که هنوز دارد رشد می‌کند.
              <br />
              نمی‌دانم قرار است آخرش چقدر بزرگ شود، اما می‌دانم هنوز اول راه است.
              <br />
              و من هنوز دارم یاد می‌گیرم، می‌سازم، می‌فروشم و به آن رسیدگی می‌کنم.
            </p>

            <p className="font-bold text-violet-700 dark:text-violet-300 text-lg pt-2">
              این، داستان گالری سنجاقک است.
            </p>
          </div>
        </div>
      </section>

      {/* 4. راهنمای خرید */}
      <section id="shopping-guide" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              ۴
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              راهنمای خرید
            </h2>
          </div>

          <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-sm space-y-8">
            <p className="text-lg text-foreground/80 leading-relaxed font-medium">
              خرید از گالری سنجاقک ساده است.
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>ثبت سفارش</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { step: "۱", title: "محصول موردنظر خود را انتخاب کنید.", desc: "مشاهده تصاویر، مشخصات ابعاد و ویژگی‌های منحصربه‌فرد چوب هر کالا." },
                  { step: "۲", title: "محصول را به سبد خرید اضافه کنید.", desc: "انتخاب تنوع یا تعداد دلخواه و بررسی فاکتور در سبد خرید." },
                  { step: "۳", title: "اطلاعات موردنیاز را وارد کنید.", desc: "تکمیل آدرس دقیق پستی، کدپستی و شماره تماس جهت هماهنگی ارسال." },
                  { step: "۴", title: "پرداخت را به‌صورت آنلاین انجام دهید.", desc: "تسویه‌حساب ایمن و دریافت آنی کد رهگیری فاکتور." },
                  { step: "۵", title: "پس از ثبت موفق پرداخت، سفارش شما ثبت می‌شود.", desc: "آغاز فرایند بسته‌بندی ایمن و ارسال مستقیم اثر چوبی به نشانی شما." },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/10 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-base">
                        {item.title}
                      </h4>
                      <p className="text-sm text-foreground/70 mt-1">
                        {item.desc}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 hidden sm:block mt-1 opacity-70" />
                  </div>
                ))}
              </div>
            </div>

            {/* محصولات (آماده و سفارشی) */}
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>محصولات</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* محصولات آماده */}
                <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-2">
                  <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold text-base">
                    <Truck className="w-5 h-5" />
                    <span>آماده</span>
                  </div>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                    محصولات آماده در روز ثبت سفارش یا حداکثر روز بعد به شرکت حمل‌ونقل تحویل داده می‌شوند.
                  </p>
                </div>

                {/* محصولات سفارشی */}
                <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-2">
                  <div className="flex items-center gap-2 text-fuchsia-700 dark:text-fuchsia-300 font-bold text-base">
                    <Clock className="w-5 h-5" />
                    <span>محصولات سفارشی</span>
                  </div>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                    محصولات سفارشی پس از ثبت سفارش وارد فرایند آماده‌سازی می‌شوند. بسته به نوع و جزئیات سفارش، آماده‌سازی آنها معمولاً بین ۷ تا ۲۰ روز زمان می‌برد.
                  </p>
                </div>
              </div>
            </div>

            {/* پرداخت */}
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>پرداخت</span>
              </h3>

              <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
                  پرداخت سفارش‌ها در حال حاضر فقط به‌صورت آنلاین و از طریق سایت انجام می‌شود.
                </p>
              </div>
            </div>

            {/* لغو سفارش */}
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Undo2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>لغو سفارش</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* لغو محصولات آماده */}
                <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-2">
                  <h4 className="font-bold text-foreground text-base">
                    محصولات آماده:
                  </h4>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                    تا زمانی که سفارش به شرکت حمل‌ونقل تحویل داده نشده باشد، امکان لغو سفارش وجود دارد.
                  </p>
                </div>

                {/* لغو محصولات سفارشی */}
                <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-2">
                  <h4 className="font-bold text-foreground text-base">
                    محصولات سفارشی:
                  </h4>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                    تا زمانی که فرایند ساخت سفارش شروع نشده باشد، امکان لغو وجود دارد. زمان شروع ساخت به مشتری اعلام می‌شود و همان روز امکان لغو سفارش وجود دارد. پس از ورود سفارش به فرایند ساخت، امکان لغو آن وجود ندارد.
                  </p>
                </div>
              </div>
            </div>

            {/* هزینه ارسال */}
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>هزینه ارسال</span>
              </h3>

              <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <p className="text-sm sm:text-base text-foreground/90 font-medium leading-relaxed">
                  هزینه ارسال جدا از قیمت محصول محاسبه می‌شود و بر عهده مشتری است.
                </p>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                  مشتری می‌تواند شرکت حمل‌ونقل موردنظر خود را انتخاب کند. در صورتی که شرکت انتخابی در مقصد موردنظر امکان ارائه خدمات نداشته باشد، ارسال از طریق گزینه‌ای انجام می‌شود که در آن منطقه در دسترس باشد.
                </p>
                <div className="pt-2 border-t border-amber-500/20">
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    ما تلاش کرده‌ایم حاشیه سود محصولات را پایین نگه داریم تا قیمت خود محصول تا حد امکان مناسب باقی بماند؛ به همین دلیل هزینه ارسال به‌صورت جداگانه محاسبه می‌شود.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-foreground/75">
                <HeartHandshake className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>همراهی و پاسخگویی در تمام مراحل خرید</span>
              </div>

              <Link 
                href="/products" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-[0_0_20px_rgba(81,109,62,0.3)] hover:shadow-[0_0_30px_rgba(81,109,62,0.5)] flex items-center justify-center gap-2"
              >
                <span>مشاهده محصولات گالری</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
