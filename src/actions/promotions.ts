"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getPromotions() {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  const promotions = await db.orm.public.PromotionRule.include("category").all();
  return promotions;
}

export async function getPromotion(id: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  return await db.orm.public.PromotionRule.where({ id }).include("category").first();
}

export async function upsertPromotion(id: string | null, data: any) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  try {
    if (id) {
      await db.orm.public.PromotionRule.where({ id }).update({
        name: data.name,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
        minQuantity: data.minQuantity || null,
        minCartTotal: data.minCartTotal || null,
        targetCategoryId: data.targetCategoryId || null,
        discountPercent: data.discountPercent || null,
        discountAmount: data.discountAmount || null,
      });
    } else {
      await db.orm.public.PromotionRule.create({
        name: data.name,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
        minQuantity: data.minQuantity || null,
        minCartTotal: data.minCartTotal || null,
        targetCategoryId: data.targetCategoryId || null,
        discountPercent: data.discountPercent || null,
        discountAmount: data.discountAmount || null,
      });
    }

    revalidatePath("/admin/promotions");
    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error saving promotion:", error);
    return { success: false, error: "خطا در ذخیره کمپین" };
  }
}

export async function deletePromotion(id: string) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  try {
    await db.orm.public.PromotionRule.where({ id }).delete();
    revalidatePath("/admin/promotions");
    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return { success: false, error: "خطا در حذف کمپین" };
  }
}

export async function getActivePromotions() {
  try {
    const promotions = await db.orm.public.PromotionRule.where({ isActive: true }).include("category").all();
    return promotions;
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    return [];
  }
}
