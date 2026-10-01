import { test, expect } from '@playwright/test';

test.describe('Header Navigation Flow', () => {
  test('User can navigate to Categories and Offers pages via header links', async ({ page }) => {
    // 1. Visit Homepage
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for Next.js hydration

    // 2. Go to Categories
    // Use locator with text to be more precise and avoid ZWNJ regex issues
    const categoriesLink = page.locator('nav a').filter({ hasText: 'دسته‌بندی‌ها' }).first();
    await categoriesLink.click();
    await page.waitForURL(/.*categories.*/);
    
    // Check if the page loaded
    await expect(page.locator('main').first()).toBeVisible();

    // 3. Go to Offers
    const offersLink = page.locator('nav a').filter({ hasText: 'پیشنهادهای ویژه' }).first();
    await offersLink.click();
    await page.waitForURL(/.*offers.*/);
    
    // Check if the page loaded
    await expect(page.locator('main').first()).toBeVisible();
  });
});
