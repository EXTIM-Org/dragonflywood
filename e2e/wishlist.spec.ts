import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './login-helper';

test.describe('Wishlist System Flow', () => {
  test('User can add a product to wishlist and view it in profile', async ({ page }) => {
    // 1. Log in with a fresh test user
    await loginAsTestUser(page);
    
    // 2. Navigate to Products
    await page.getByRole('link', { name: /فروشگاه/i }).first().click();
    await page.waitForURL('**/products');
    
    // 3. Find the first product and add it to wishlist
    // The heart button has the title 'افزودن به علاقه‌مندی‌ها'
    const wishlistBtn = page.getByTitle('افزودن به علاقه‌مندی‌ها').first();
    
    // Wait for products to load
    await page.waitForTimeout(1500);
    
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      
      // 4. Verify success toast
      await expect(page.getByText('به علاقه‌مندی‌ها اضافه شد')).toBeVisible({ timeout: 10000 });
      
      // 5. Navigate to Wishlist page
      await page.goto('/profile/wishlist');
      await expect(page.getByRole('heading', { name: 'علاقه‌مندی‌ها' })).toBeVisible();
      
      // 6. Verify product is in wishlist
      // There should be a product card with the remove button
      const removeBtn = page.getByTitle('حذف از علاقه‌مندی‌ها').first();
      await expect(removeBtn).toBeVisible();
      
      // 7. Remove product from wishlist
      await removeBtn.click();
      
      // 8. Verify removal by checking if the 'Add to Wishlist' button appears
      await expect(page.getByTitle('افزودن به علاقه‌مندی‌ها').first()).toBeVisible({ timeout: 10000 });
    } else {
      console.log('No products available to test the wishlist flow.');
    }
  });
});
