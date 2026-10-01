"use client";

import { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  PhoneCall,
  MessageSquare,
  Send,
  Sparkles,
  TreePine,
  Hammer,
  Droplets,
  ShieldCheck,
  Users
} from "lucide-react";
import Link from "next/link";

export interface FaqItem {
  id: string;
  category: "production" | "custom" | "care" | "support";
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    id: "handmade",
    category: "production",
    question: "آیا محصولات گالری سنجاقک کاملاً دست‌ساز هستند؟",
    answer: "محصولات گالری سنجاقک دست‌ساز هستند، اما در فرایند تولید از دستگاه‌های تخصصی و مناسب نیز استفاده می‌شود. استفاده از تکنولوژی در خدمت کیفیت و اجرای دقیق‌تر محصول است و جایگزین هنر دست نمی‌شود."
  },
  {
    id: "wood-types",
    category: "production",
    question: "چه نوع چوب‌هایی در محصولات استفاده می‌شود؟",
    answer: "نوع چوب با توجه به محصول و طراحی آن انتخاب می‌شود. انتخاب چوب مناسب و طی شدن صحیح فرایند خشک‌شدن چوب، از بخش‌های مهم فرایند تولید ماست."
  },
  {
    id: "wood-uniqueness",
    category: "production",
    question: "چرا دو محصول یک مدل ممکن است دقیقاً شبیه هم نباشند؟",
    answer: "چوب یک ماده طبیعی است و هر قطعه دارای رگه، رنگ و بافت مخصوص خودش است. به همین دلیل ممکن است محصولات یک مدل، تفاوت‌های طبیعی و جزئی با یکدیگر داشته باشند."
  },
  {
    id: "custom-order",
    category: "custom",
    question: "آیا امکان سفارش محصول با طرح یا مشخصات دلخواه وجود دارد؟",
    answer: "بله، بخشی از محصولات به‌صورت سفارشی تولید می‌شوند. زمان آماده‌سازی این محصولات بسته به نوع سفارش، معمولاً بین ۷ تا ۲۰ روز است."
  },
  {
    id: "ready-vs-custom",
    category: "custom",
    question: "تفاوت محصول آماده و سفارشی چیست؟",
    answer: "محصولات آماده در روز سفارش یا حداکثر روز بعد برای ارسال آماده می‌شوند. محصولات سفارشی پس از ثبت سفارش وارد فرایند ساخت می‌شوند و آماده‌سازی آن‌ها معمولاً بین ۷ تا ۲۰ روز زمان می‌برد."
  },
  {
    id: "customize-details",
    category: "custom",
    question: "آیا امکان تغییر نوع چوب یا جزئیات محصول وجود دارد؟",
    answer: "در محصولاتی که امکان شخصی‌سازی دارند، تغییرات موردنظر قابل بررسی است. امکان اجرای تغییرات به نوع محصول و فرایند ساخت آن بستگی دارد."
  },
  {
    id: "custom-duration",
    category: "custom",
    question: "سفارش‌های سفارشی چقدر زمان می‌برند؟",
    answer: "آماده‌سازی محصولات سفارشی بسته به نوع و جزئیات سفارش معمولاً بین یک هفته تا ۲۰ روز زمان می‌برد."
  },
  {
    id: "water-resistance",
    category: "care",
    question: "آیا محصولات چوبی در برابر آب و رطوبت مقاوم هستند؟",
    answer: "محصولات چوبی نباید برای مدت طولانی در معرض آب و رطوبت قرار بگیرند. برای حفظ کیفیت ظروف چوبی، توصیه می‌شود آن‌ها را با دست بشویید و داخل ماشین ظرفشویی قرار ندهید."
  },
  {
    id: "cooperation",
    category: "support",
    question: "آیا امکان همکاری با فروشگاه‌ها و گالری‌ها وجود دارد؟",
    answer: "بله. گالری سنجاقک با مجموعه‌ها و گالری‌های مختلف همکاری داشته و با استادکاران و مجموعه‌های کارگاهی باتجربه نیز همکاری می‌کند."
  },
  {
    id: "pre-purchase-guide",
    category: "support",
    question: "چطور قبل از خرید درباره یک محصول راهنمایی بگیرم؟",
    answer: "می‌توانید در ساعات پاسخگویی پشتیبانی با شماره ۰۹۲۱۷۲۰۴۷۰۷ تماس بگیرید. همچنین می‌توانید از طریق تیکت پشتیبانی سایت یا واتساپ و تلگرام به همین شماره پیام دهید."
  }
];

const categories = [
  { id: "all", label: "همه سوالات", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "production", label: "تولید و اصالت چوب", icon: <TreePine className="w-4 h-4" /> },
  { id: "custom", label: "سفارشی و آماده", icon: <Hammer className="w-4 h-4" /> },
  { id: "care", label: "نگهداری و رطوبت", icon: <Droplets className="w-4 h-4" /> },
  { id: "support", label: "مشاوره و همکاری", icon: <Users className="w-4 h-4" /> },
];

export default function FaqClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "handmade": true,
    "custom-order": true
  });

  const toggleItem = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = useMemo(() => {
    return faqData.filter(item => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchQuery =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-12">
      
      {/* Search and Filters Bar */}
      <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-sm">
        
        {/* Search input */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در سوالات متداول (مثلاً: دست‌ساز، سفارشی، ماشین ظرفشویی، چوب)..."
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 ps-12 pe-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm md:text-base transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/25 scale-[1.02]"
                    : "bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-bold mb-1">
              موردی با عبارت جستجوی شما یافت نشد
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              می‌توانید کلمه دیگری را جستجو کنید یا مستقیماً با پشتیبانی تماس بگیرید.
            </p>
          </div>
        ) : (
          filteredFaqs.map((item, idx) => {
            const isOpen = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition-all shadow-sm hover:border-violet-500/30"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 text-start flex items-center justify-between gap-4 select-none cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
                      {item.question}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-violet-500/15 text-violet-600 dark:text-violet-400" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base border-t border-black/5 dark:border-white/5 mt-1">
                    <div className="pt-3 ps-12">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Consultation & Support Highlight Box */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-500/15 via-amber-500/10 to-transparent border-2 border-violet-500/25 p-8 md:p-10 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مشاوره تخصصی و پیش از خرید</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              سوال دیگری درباره محصولات دارید؟
            </h3>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base text-justify">
              می‌توانید در ساعات پاسخگویی پشتیبانی با شماره{" "}
              <a href="tel:09217204707" className="font-bold text-violet-700 dark:text-violet-400 underline underline-offset-4 dir-ltr inline-block">
                ۰۹۲۱۷۲۰۴۷۰۷
              </a>{" "}
              تماس بگیرید. همچنین می‌توانید از طریق تیکت پشتیبانی سایت یا پیام‌رسان‌های واتساپ و تلگرام با همین شماره در ارتباط باشید.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href="tel:09217204707"
              className="px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2.5 text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>تماس مستقیم: ۰۹۲۱۷۲۰۴۷۰۷</span>
            </a>

            <div className="flex gap-2">
              <a
                href="https://wa.me/989217204707"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>واتساپ</span>
              </a>

              <a
                href="https://t.me/+989217204707"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>تلگرام</span>
              </a>

              <Link
                href="/contact"
                className="flex-1 px-4 py-3 rounded-2xl bg-black/10 dark:bg-white/10 hover:bg-black/15 text-gray-900 dark:text-white font-semibold transition-all text-xs flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ارسال تیکت</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
