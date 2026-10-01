import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './login-helper';
import { execSync } from 'child_process';

test.describe('Coupon & Discount System Flow', () => {
  test.beforeAll(() => {
    // Ensure the valid coupon exists
    console.log('Setting up valid coupon...');
    execSync('npx tsx e2e/setup-coupon.ts', { stdio: 'inherit' });
  });

  test('User can apply a valid coupon and sees error for invalid one', async ({ page }) => {
    // 1. Log in with a fresh test user
    await loginAsTestUser(page);
    
    // 2. Navigate to Products and add to cart
    await page.getByRole('link', { name: /فروشگاه/i }).first().click();
    await page.waitForURL('**/products');
    
    // Use Quick Add button on the first available product card
    const quickAddBtn = page.getByTitle('افزودن سریع به سبد خرید').first();
    await page.waitForTimeout(1500);
    
    if (await quickAddBtn.isVisible()) {
      await quickAddBtn.click();

      // If modal opens, click 'افزودن به سبد'
      const modalBtn = page.getByRole('button', { name: /افزودن به سبد/i });
      if (await modalBtn.isVisible()) {
        await modalBtn.click();
      }
      await page.waitForTimeout(1000);

      // 3. Go to Checkout
      await page.getByLabel('سبد خرید').first().click();
      await page.waitForURL('**/cart');
      await page.locator('a[href="/checkout"]').first().click({ force: true });
      await page.waitForURL('**/checkout');

      // 4. Test Invalid Coupon
      const couponInput = page.getByPlaceholder('کد تخفیف...');
      const applyBtn = page.getByRole('button', { name: 'اعمال' });
      
      await couponInput.fill('INVALID_CODE');
      await applyBtn.click();
      await expect(page.getByText('کد تخفیف نامعتبر است.')).toBeVisible({ timeout: 10000 });

      // 5. Test Valid Coupon
      await couponInput.fill('TEST_DISCOUNT');
      await applyBtn.click();
      
      // Should show success message with discount amount
      await expect(page.getByText(/مبلغ .* کسر شد/)).toBeVisible({ timeout: 10000 });
      
      // Ensure the "تخفیف (کد: TEST_DISCOUNT)" text is rendered
      await expect(page.getByText('تخفیف (کد: TEST_DISCOUNT)')).toBeVisible();

    } else {
      console.log('No products available to test the checkout coupon flow.');
    }
  });
});
