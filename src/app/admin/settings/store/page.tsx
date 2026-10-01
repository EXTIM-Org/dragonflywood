import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getStoreSettings } from "@/actions/settings";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "تنظیمات فروشگاه | داشبورد ادمین",
};

export default async function AdminStoreSettingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const initialSettings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">تنظیمات فروشگاه</h1>
        </div>
        <p className="text-gray-500">پیکربندی تنظیمات کلی و کمپین‌های پایه</p>
      </div>

      <StoreSettingsForm initialSettings={initialSettings} />
      
    </div>
  );
}
