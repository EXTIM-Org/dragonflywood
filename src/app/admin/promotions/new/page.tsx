import { PromotionForm } from "@/components/admin/PromotionForm";
import { db } from "@/prisma/db";

export const metadata = {
  title: "افزودن کمپین | داشبورد ادمین",
};

export default async function NewPromotionPage() {
  const categories = await db.orm.public.Category.all();

  return (
    <div className="w-full">
      <PromotionForm categories={categories} />
    </div>
  );
}
