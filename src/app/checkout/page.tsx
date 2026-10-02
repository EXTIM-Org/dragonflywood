"use client";

import { useActionState, useEffect, useState, useMemo } from "react";
import { ProvinceCitySelect } from "@/components/ui/ProvinceCitySelect";
import { calculateTapinShippingCost, DEFAULT_ITEM_WEIGHT_GRAMS } from "@/lib/tapin-rates";

import { useCart } from "@/store/CartContext";
import { getUserCheckoutData, processCheckout } from "@/actions/checkout";
import { getStoreSettings } from "@/actions/settings";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, CreditCard, ShieldCheck, CheckCircle2, Tags, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/profile/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-gray-100 dark:bg-black/30 animate-pulse flex items-center justify-center text-sm text-gray-500 rounded-xl border border-gray-200 dark:border-white/10">
      در حال بارگذاری نقشه...
    </div>
  ),
});

function SubmitButton({ disabled, disabledReason }: { disabled?: boolean; disabledReason?: string }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);
  return (
    <button 
      type="submit" 
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`w-full bg-gradient-to-r ${isDisabled ? 'from-gray-400 to-gray-500 cursor-not-allowed opacity-60' : 'from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'} text-white font-bold py-4 rounded-2xl transition-all`}
      onClick={(e) => { if (isDisabled) e.preventDefault(); }}
    >
      {pending ? "در حال پردازش..." : disabledReason ? disabledReason : "پرداخت و ثبت نهایی سفارش"}
    </button>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, cartDiscount, clearCart, isInitialized } = useCart();
  const [state, formAction] = useActionState(processCheckout, null);
  const router = useRouter();

  const [initialData, setInitialData] = useState<{
    receiverName: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    province: string;
    lat: number | null;
    lng: number | null;
    totalWeightGrams?: number;
    missingWeightProduct?: string | null;
    missingWeightError?: string | null;
  } | null>(null);
  const [shippingThreshold, setShippingThreshold] = useState(2000000);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const discountedSubtotal = Math.max(0, totalPrice - cartDiscount);

  // Detect missing weight product from CartContext items or initialData
  const missingWeightItem = useMemo(() => {
    return items.find((item) => item.weightError != null);
  }, [items]);

  const activeWeightError = missingWeightItem?.weightError || initialData?.missingWeightError || null;

  const totalWeightGrams = useMemo(() => {
    if (items.length > 0 && items.every((i) => typeof i.weightGrams === "number")) {
      return items.reduce((sum, item) => sum + (item.weightGrams || 0) * item.quantity, 0);
    }
    return initialData?.totalWeightGrams || (totalItems * DEFAULT_ITEM_WEIGHT_GRAMS);
  }, [items, initialData?.totalWeightGrams, totalItems]);

  const shippingResult = useMemo(() => {
    if (activeWeightError) {
      return {
        shippingCost: 0,
        isFree: false,
        provinceTitle: "",
      };
    }
    return calculateTapinShippingCost({
      subtotalPrice: discountedSubtotal,
      totalWeightGrams,
      province: selectedProvince || initialData?.province || "",
      city: selectedCity || initialData?.city || "",
      freeShippingEnabled,
      freeShippingThreshold: shippingThreshold,
    });
  }, [discountedSubtotal, totalWeightGrams, selectedProvince, selectedCity, initialData?.province, initialData?.city, freeShippingEnabled, shippingThreshold, activeWeightError]);

  const shippingCost = shippingResult.shippingCost;
  const isFreeShipping = shippingResult.isFree;

  const [couponCode, setCouponCode] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const finalPayable = Math.max(0, discountedSubtotal + (totalItems > 0 ? shippingCost : 0) - appliedDiscount);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Fetch initial checkout data
  useEffect(() => {
    let isActive = true;
    Promise.all([getUserCheckoutData(), getStoreSettings()])
      .then(([data, settings]) => {
        if (!isActive) return;
        if (data) {
          setInitialData(data);
          if (data.lat && data.lng) setLocation({ lat: data.lat, lng: data.lng });
        }
        setShippingThreshold(settings.free_shipping_threshold);
        setFreeShippingEnabled(Boolean(settings.free_shipping_enabled));
      })
      .catch(() => undefined)
      .finally(() => {
        if (isActive) setIsFetchingData(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    
    try {
      const { validateCoupon } = await import("@/actions/coupon");
      const res = await validateCoupon(couponCode, discountedSubtotal);
      if (res.success) {
        setAppliedDiscount(res.discountAmount || 0);
        setCouponSuccess(`مبلغ ${(res.discountAmount || 0).toLocaleString('fa-IR')} تومان کسر شد.`);
      } else {
        setCouponError(res.error || "خطا در اعتبارسنجی");
        setAppliedDiscount(0);
      }
    } catch {
      setCouponError("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // If order is successful, redirect to Zarinpal gateway or show success message
  useEffect(() => {
    if (state?.success) {
      if (state.paymentUrl) {
        clearCart();
        window.location.href = state.paymentUrl;
        return;
      }
      clearCart();
      // Auto redirect to orders history after 3 seconds
      const timer = setTimeout(() => {
        router.push("/profile/orders");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router, clearCart]);

  // Redirect to cart if it's empty
  useEffect(() => {
    if (isInitialized && items.length === 0 && !state?.success) {
      router.replace("/cart");
    }
  }, [items.length, isInitialized, state?.success, router]);


  if (state?.success && state.paymentUrl) {
    return (
      <main className="min-h-screen py-20 px-6 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#516d3e] border-t-transparent rounded-full animate-spin mb-6" />
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">در حال اتصال به درگاه امن زرین‌پال...</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md text-sm">
          لطفاً چند لحظه شکیبا باشید؛ در حال انتقال به سامانه پرداخت بانکی شاپرک هستید.
        </p>
      </main>
    );
  }

  if (state?.success) {
    return (
      <main className="min-h-screen py-20 px-6 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">سفارش شما با موفقیت ثبت شد!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          کد رهگیری سفارش: <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">{state.orderId}</span>
        </p>
        <Link href="/profile/orders" className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white px-8 py-3 rounded-full transition-colors border border-gray-200 dark:border-white/10">
          پیگیری سفارشات
        </Link>
      </main>
    );
  }


  if (!isInitialized) {
    return (
      <main className="min-h-screen py-20 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تکمیل اطلاعات و پرداخت</h1>
        </div>

        <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-8" key={isFetchingData ? 'loading' : 'loaded'}>
          
          {/* Left Column: Address and Data */}
          <div className="flex flex-col gap-6">
            
            {activeWeightError && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-2xl text-sm flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">خطا در محاسبه هزینه ارسال</span>
                  <span>{activeWeightError}</span>
                </div>
              </div>
            )}

            {state?.error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {state.error}
              </div>
            )}

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-3xl backdrop-blur-sm relative shadow-sm dark:shadow-none">
              
              {isFetchingData && (
                <div className="absolute inset-0 z-10 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                اطلاعات گیرنده
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام و نام خانوادگی</label>
                  <input 
                    type="text" 
                    name="receiverName"
                    required
                    defaultValue={initialData?.receiverName || ""}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="نام تحویل گیرنده"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">شماره همراه</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    dir="ltr"
                    defaultValue={initialData?.phone || ""}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              <input type="hidden" name="lat" value={location?.lat || ""} />
              <input type="hidden" name="lng" value={location?.lng || ""} />

              <div className="mb-4">
                <ProvinceCitySelect
                  initialProvince={initialData?.province || ""}
                  initialCity={initialData?.city || ""}
                  onLocationChange={(loc) => {
                    setSelectedProvince(loc.province);
                    setSelectedCity(loc.city);
                  }}
                  required
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">آدرس دقیق</label>
                <textarea 
                  name="address"
                  required
                  rows={3}
                  defaultValue={initialData?.address || ""}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                  placeholder="خیابان، کوچه، پلاک، واحد..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">کد پستی (اختیاری)</label>
                <input 
                  type="text" 
                  name="postalCode"
                  dir="ltr"
                  defaultValue={initialData?.postalCode || ""}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left"
                  placeholder="1234567890"
                />
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب از روی نقشه (اختیاری)</label>
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden z-10 relative">
                  <MapComponent 
                    onLocationSelect={(lat, lng) => setLocation({ lat, lng })} 
                    defaultLocation={initialData?.lat && initialData?.lng ? { lat: initialData.lat, lng: initialData.lng } : undefined}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-3xl backdrop-blur-sm shadow-sm dark:shadow-none">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                درگاه پرداخت
              </h2>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-4 border border-purple-500/50 bg-purple-50 dark:bg-purple-500/10 rounded-xl cursor-pointer">
                  <input type="radio" name="simulationType" value="SUCCESS" defaultChecked className="text-purple-500 focus:ring-purple-500" />
                  <span className="text-gray-900 dark:text-white font-medium">شبیه‌سازی پرداخت موفق</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-red-500/50 bg-red-50 dark:bg-red-500/10 rounded-xl cursor-pointer">
                  <input type="radio" name="simulationType" value="FAIL" className="text-red-500 focus:ring-red-500" />
                  <span className="text-gray-900 dark:text-white font-medium">شبیه‌سازی پرداخت ناموفق</span>
                </label>
              </div>
            </div>
            
            <input type="hidden" name="couponCode" value={appliedDiscount > 0 ? couponCode : ""} />
            
          </div>

          {/* Right Column: Order Summary */}
          <div className="flex flex-col gap-6">
            
            {/* Coupon Section */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-3xl backdrop-blur-sm shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tags className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                کد تخفیف
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 min-w-0 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 uppercase text-sm sm:text-base"
                    placeholder="کد تخفیف..."
                    dir="ltr"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode}
                    className="shrink-0 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 sm:px-6 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isValidatingCoupon ? "..." : "اعمال"}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-green-500 text-sm mt-1">{couponSuccess}</p>}
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-4 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">فاکتور نهایی</h2>
              
              <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-white/10 pb-6">
                <div className="flex justify-between items-center">
                  <span>مبلغ کل ({totalItems} کالا)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{totalPrice.toLocaleString('fa-IR')} تومان</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>تخفیف کمپین</span>
                    <span className="font-medium">- {cartDiscount.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span>هزینه بسته‌بندی و ارسال</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      پست پیشتاز تاپین (مبدا: شیراز {shippingResult.provinceTitle ? `← مقصد: ${shippingResult.provinceTitle}` : ''})
                    </span>
                  </div>
                  {activeWeightError ? (
                    <span className="font-bold text-rose-500 dark:text-rose-400 text-xs">
                      غیرقابل محاسبه
                    </span>
                  ) : (
                    <span className={`font-medium ${isFreeShipping ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-900 dark:text-white"}`}>
                      {isFreeShipping ? "رایگان" : `${shippingCost.toLocaleString('fa-IR')} تومان`}
                    </span>
                  )}
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>تخفیف (کد: {couponCode})</span>
                    <span className="font-medium">- {appliedDiscount.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-end pt-2 mb-4">
                <span className="font-medium text-gray-700 dark:text-gray-300 text-lg">مبلغ قابل پرداخت:</span>
                <div className="flex items-center gap-2">
                  {activeWeightError ? (
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-500/20">
                      غیرقابل پرداخت
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-500">
                        {finalPayable.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">تومان</span>
                    </>
                  )}
                </div>
              </div>

              {activeWeightError && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">خطا در محاسبه هزینه ارسال</span>
                    <span className="font-medium">{activeWeightError}</span>
                    <span className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      به دلیل عدم ثبت وزن کالا، این فاکتور قابل پرداخت نمی‌باشد.
                    </span>
                  </div>
                </div>
              )}
              
              {state?.error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl text-center font-medium">
                  {state.error}
                </div>
              )}

              <SubmitButton 
                disabled={Boolean(activeWeightError)} 
                disabledReason={activeWeightError ? "فاکتور غیرقابل پرداخت است" : undefined} 
              />
              
              <p className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-500/70" />
                تراکنش شما با پروتکل SSL کاملاً ایمن است
              </p>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
