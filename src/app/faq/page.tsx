import { HelpCircle } from "lucide-react";
import FaqClient from "./FaqClient";

export const metadata = {
  title: 'سوالات متداول',
  description: 'پاسخ به سوالات متداول مشتریان گالری چوب سنجاقک درباره محصولات چوبی دست‌ساز، نحوه سفارش، نگهداری و راهنمایی پیش از خرید',
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "آیا محصولات گالری سنجاقک کاملاً دست‌ساز هستند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "محصولات گالری سنجاقک دست‌ساز هستند، اما در فرایند تولید از دستگاه‌های تخصصی و مناسب نیز استفاده می‌شود. استفاده از تکنولوژی در خدمت کیفیت و اجرای دقیق‌تر محصول است و جایگزین هنر دست نمی‌شود."
      }
    },
    {
      "@type": "Question",
      "name": "چه نوع چوب‌هایی در محصولات استفاده می‌شود؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "نوع چوب با توجه به محصول و طراحی آن انتخاب می‌شود. انتخاب چوب مناسب و طی شدن صحیح فرایند خشک‌شدن چوب، از بخش‌های مهم فرایند تولید ماست."
      }
    },
    {
      "@type": "Question",
      "name": "چرا دو محصول یک مدل ممکن است دقیقاً شبیه هم نباشند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "چوب یک ماده طبیعی است و هر قطعه دارای رگه، رنگ و بافت مخصوص خودش است. به همین دلیل ممکن است محصولات یک مدل، تفاوت‌های طبیعی و جزئی با یکدیگر داشته باشند."
      }
    },
    {
      "@type": "Question",
      "name": "آیا امکان سفارش محصول با طرح یا مشخصات دلخواه وجود دارد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، بخشی از محصولات به‌صورت سفارشی تولید می‌شوند. زمان آماده‌سازی این محصولات بسته به نوع سفارش، معمولاً بین ۷ تا ۲۰ روز است."
      }
    },
    {
      "@type": "Question",
      "name": "تفاوت محصول آماده و سفارشی چیست؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "محصولات آماده در روز سفارش یا حداکثر روز بعد برای ارسال آماده می‌شوند. محصولات سفارشی پس از ثبت سفارش وارد فرایند ساخت می‌شوند و آماده‌سازی آن‌ها معمولاً بین ۷ تا ۲۰ روز زمان می‌برد."
      }
    },
    {
      "@type": "Question",
      "name": "آیا امکان تغییر نوع چوب یا جزئیات محصول وجود دارد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "در محصولاتی که امکان شخصی‌سازی دارند، تغییرات موردنظر قابل بررسی است. امکان اجرای تغییرات به نوع محصول و فرایند ساخت آن بستگی دارد."
      }
    },
    {
      "@type": "Question",
      "name": "سفارش‌های سفارشی چقدر زمان می‌برند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "آماده‌سازی محصولات سفارشی بسته به نوع و جزئیات سفارش معمولاً بین یک هفته تا ۲۰ روز زمان می‌برد."
      }
    },
    {
      "@type": "Question",
      "name": "آیا محصولات چوبی در برابر آب و رطوبت مقاوم هستند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "محصولات چوبی نباید برای مدت طولانی در معرض آب و رطوبت قرار بگیرند. برای حفظ کیفیت ظروف چوبی، توصیه می‌شود آن‌ها را با دست بشویید و داخل ماشین ظرفشویی قرار ندهید."
      }
    },
    {
      "@type": "Question",
      "name": "آیا امکان همکاری با فروشگاه‌ها و گالری‌ها وجود دارد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله. گالری سنجاقک با مجموعه‌ها و گالری‌های مختلف همکاری داشته و با استادکاران و مجموعه‌های کارگاهی باتجربه نیز همکاری می‌کند."
      }
    },
    {
      "@type": "Question",
      "name": "چطور قبل از خرید درباره یک محصول راهنمایی بگیرم؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "می‌توانید در ساعات پاسخگویی پشتیبانی با شماره ۰۹۲۱۷۲۰۴۷۰۷ تماس بگیرید. همچنین می‌توانید از طریق تیکت پشتیبانی سایت یا واتساپ و تلگرام به همین شماره پیام دهید."
      }
    }
  ]
};

export default function FaqPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      {/* Schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4 bg-violet-500/10 dark:bg-violet-500/20 px-4 py-2 rounded-full border border-violet-500/20">
            <HelpCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
              مرکز پاسخ به پرسش‌های شما
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            سوالات{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-violet-600 to-amber-600 dark:from-violet-400 dark:to-amber-400">
              متداول
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            پاسخ به پرتکرارترین پرسش‌ها درباره فرایند ساخت، اصالت چوب‌ها، سفارش‌های اختصاصی و نحوه نگهداری محصولات در گالری سنجاقک
          </p>
        </div>

        {/* Client Interactive Component */}
        <FaqClient />

      </div>
    </main>
  );
}
