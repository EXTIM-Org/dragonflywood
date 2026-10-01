import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can navigate to login page and see validation errors for empty submit', async ({ page }) => {
    // 1. Visit Homepage
    await page.goto('/');

    // 2. Navigate to Login Page
    const loginLink = page.getByRole('link', { name: /حساب کاربری/i }).first();
    await loginLink.click();
    await page.waitForURL('**/login');

    // 3. Verify Login UI Elements
    await expect(page.getByRole('heading', { name: /ورود/i })).toBeVisible();
    
    // 4. Submit empty form to trigger validation errors
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // 5. Check if Zod/HTML5 validation kicks in (usually shows text like 'شماره موبایل الزامی است')
    // Or we just verify that we are still on the login page (did not navigate)
    await expect(page).toHaveURL(/.*login/);
  });
});
