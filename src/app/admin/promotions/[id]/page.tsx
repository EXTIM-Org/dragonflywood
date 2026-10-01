import { PromotionForm } from "@/components/admin/PromotionForm";
import { getPromotion } from "@/actions/promotions";
import { db } from "@/prisma/db";
import { notFound } from "next/navigation";

export const metadata = {
  title: "ویرایش کمپین | داشبورد ادمین",
};

export default async function EditPromotionPage({ params }: { params: { id: string } }) {
  const promotion = await getPromotion(params.id);
  if (!promotion) notFound();

  const categories = await db.orm.public.Category.all();

  return (
    <div className="w-full">
      <PromotionForm initialData={promotion} categories={categories} />
    </div>
  );
}
