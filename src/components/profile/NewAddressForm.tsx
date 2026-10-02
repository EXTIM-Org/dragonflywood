"use client";

import { ProvinceCitySelect } from "@/components/ui/ProvinceCitySelect";

import { useState, useActionState, useEffect } from "react";
import { addAddress } from "@/actions/address";
import { Plus } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-gray-100 dark:bg-black/30 animate-pulse flex items-center justify-center text-sm text-gray-500 rounded-xl border border-gray-200 dark:border-white/10">
      در حال بارگذاری نقشه...
    </div>
  ),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 mt-2"
    >
      {pending ? "در حال ثبت..." : "ذخیره آدرس"}
    </button>
  );
}

export function NewAddressForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(addAddress, null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }
  }, [state]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        افزودن آدرس جدید
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="ثبت آدرس جدید"
        maxWidth="md"
      >
        <form action={formAction} className="flex flex-col gap-4">
              
              {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {state.error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">عنوان آدرس (اختیاری - مثلا خانه)</label>
                <input 
                  type="text" 
                  name="title"
                  className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  placeholder="منزل"
                />
              </div>

              <input type="hidden" name="lat" value={location?.lat || ""} />
              <input type="hidden" name="lng" value={location?.lng || ""} />

              <ProvinceCitySelect required />

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">آدرس دقیق پستی</label>
                <textarea 
                  name="fullAddress"
                  required
                  rows={3}
                  className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="تهران، خیابان..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">کد پستی (اختیاری)</label>
                <input 
                  type="text" 
                  name="postalCode"
                  dir="ltr"
                  className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 text-left"
                  placeholder="1234567890"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">انتخاب از روی نقشه (اختیاری)</label>
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden z-10 relative">
                  <MapComponent onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                </div>
              </div>

              <SubmitButton />
        </form>
      </Modal>
    </>
  );
}