import assert from "node:assert/strict";
import test from "node:test";
import { calculatePromotionDiscount, type PromotionRule } from "./promotions";

const now = new Date("2026-09-30T12:00:00.000Z");

test("BOGO discounts the cheapest qualifying units", () => {
  const discount = calculatePromotionDiscount(
    [
      { price: 100, quantity: 1, categoryId: "tops" },
      { price: 300, quantity: 1, categoryId: "tops" },
    ],
    [{ type: "BOGO", isActive: true, minQuantity: 2, discountPercent: 50 }],
    now,
  );

  assert.equal(discount, 50);
});

test("BOGO only counts items in its target category", () => {
  const discount = calculatePromotionDiscount(
    [
      { price: 100, quantity: 1, categoryId: "tops" },
      { price: 300, quantity: 1, categoryId: "shoes" },
    ],
    [{ type: "BOGO", isActive: true, minQuantity: 2, discountPercent: 50, targetCategoryId: "tops" }],
    now,
  );

  assert.equal(discount, 0);
});

test("cart-total promotions stack with BOGO and the discount is capped at the subtotal", () => {
  const promotions: PromotionRule[] = [
    { type: "BOGO", isActive: true, minQuantity: 2, discountPercent: 50 },
    { type: "CART_TOTAL", isActive: true, minCartTotal: 300, discountAmount: 500 },
  ];
  const discount = calculatePromotionDiscount(
    [
      { price: 100, quantity: 1 },
      { price: 200, quantity: 1 },
    ],
    promotions,
    now,
  );

  assert.equal(discount, 300);
});

test("inactive and out-of-window promotions are ignored", () => {
  const promotions: PromotionRule[] = [
    { type: "CART_TOTAL", isActive: false, minCartTotal: 1, discountAmount: 10 },
    { type: "CART_TOTAL", isActive: true, minCartTotal: 1, discountAmount: 20, startsAt: "2026-10-01T00:00:00.000Z" },
    { type: "CART_TOTAL", isActive: true, minCartTotal: 1, discountAmount: 30, expiresAt: "2026-09-29T00:00:00.000Z" },
  ];

  assert.equal(calculatePromotionDiscount([{ price: 100, quantity: 1 }], promotions, now), 0);
});