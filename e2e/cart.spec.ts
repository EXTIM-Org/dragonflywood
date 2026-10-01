import { test, expect } from '@playwright/test';

test.describe('Cart Management Flow', () => {
  test('User can add an item and then remove it to see empty cart state', async ({ page }) => {
    // 1. Visit Products Page
    await page.goto('/products');
    await page.waitForTimeout(1000); // Wait for products to load

    // 2. Add an item to cart using the Quick Add button
    const quickAddBtn = page.getByTitle('افزودن سریع به سبد خرید').first();
    
    if (await quickAddBtn.isVisible()) {
      await quickAddBtn.click();
      
      // If a modal opens for variants, click 'افزودن به سبد'
      const modalBtn = page.getByRole('button', { name: /افزودن به سبد/i });
      if (await modalBtn.isVisible()) {
        await modalBtn.click();
      }

      await page.waitForTimeout(1000); // Wait for state to update

      // 3. Navigate to Cart
      await page.goto('/cart');

      // 4. Verify item is in cart (checkout button is visible)
      await expect(page.locator('a[href="/checkout"]').first()).toBeVisible();

      // 5. Remove the item
      const removeBtn = page.getByTitle('حذف از سبد').first();
      await removeBtn.click();

      // 6. Verify cart empty state
      const emptyMsg = page.getByRole('heading', { name: /سبد خرید شما خالی است/i });
      await expect(emptyMsg).toBeVisible();
    } else {
      console.log('No in-stock products found to test cart removal.');
    }
  });
});
