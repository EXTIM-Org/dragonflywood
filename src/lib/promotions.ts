export interface PromotionCartItem {
  price: number;
  quantity: number;
  categoryId?: string | null;
}

export interface PromotionRule {
  type: string;
  isActive: boolean;
  minQuantity?: number | null;
  minCartTotal?: number | null;
  targetCategoryId?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  startsAt?: string | Date | null;
  expiresAt?: string | Date | null;
}

function isPromotionCurrent(promotion: PromotionRule, now: number): boolean {
  if (!promotion.isActive) return false;

  const startsAt = promotion.startsAt ? new Date(promotion.startsAt).getTime() : null;
  const expiresAt = promotion.expiresAt ? new Date(promotion.expiresAt).getTime() : null;

  if (startsAt !== null && (!Number.isFinite(startsAt) || now < startsAt)) return false;
  if (expiresAt !== null && (!Number.isFinite(expiresAt) || now > expiresAt)) return false;
  return true;
}

export function calculatePromotionDiscount(
  items: PromotionCartItem[],
  promotions: PromotionRule[],
  now: Date = new Date(),
): number {
  const eligibleItems = items.filter(
    (item) => Number.isFinite(item.price) && item.price >= 0 && Number.isSafeInteger(item.quantity) && item.quantity > 0,
  );
  const subtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (subtotal <= 0) return 0;

  const nowTime = now.getTime();
  let totalDiscount = 0;

  for (const promotion of promotions) {
    if (!isPromotionCurrent(promotion, nowTime)) continue;

    if (promotion.type === "BOGO") {
      const qualifyingItems = promotion.targetCategoryId
        ? eligibleItems.filter((item) => item.categoryId === promotion.targetCategoryId)
        : eligibleItems;
      const qualifyingQuantity = qualifyingItems.reduce((sum, item) => sum + item.quantity, 0);
      const minQuantity = promotion.minQuantity && promotion.minQuantity > 0 ? promotion.minQuantity : 2;
      let discountableUnits = Math.floor(qualifyingQuantity / minQuantity);
      const discountPercent = Math.min(100, Math.max(0, promotion.discountPercent ?? 0));

      for (const item of [...qualifyingItems].sort((left, right) => left.price - right.price)) {
        if (discountableUnits <= 0) break;
        const discountedUnits = Math.min(item.quantity, discountableUnits);
        totalDiscount += item.price * discountedUnits * discountPercent / 100;
        discountableUnits -= discountedUnits;
      }
    } else if (promotion.type === "CART_TOTAL") {
      const minCartTotal = promotion.minCartTotal ?? 0;
      if (minCartTotal > 0 && subtotal >= minCartTotal) {
        totalDiscount += Math.max(0, promotion.discountAmount ?? 0);
      }
    }
  }

  return Math.min(subtotal, Math.max(0, totalDiscount));
}