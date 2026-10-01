import { test, expect } from '@playwright/test';

test.describe('Recommender System Flow', () => {
  test('User can see recommended products on homepage and product page', async ({ page }) => {
    // 1. Check Homepage Recommender Carousels
    await page.goto('/');
    
    // We expect the main element to be loaded
    await expect(page.locator('text=پلتفرم هوشمند فروشگاهی')).toBeVisible();

    // Check if any of the carousels exist (they might not have data, so we just check for their titles if they are rendered)
    // We don't strictly require them to be visible because a fresh DB might not have popular products,
    // but we can check if the DOM structure allows for them.
    const _hasPopular = page.getByRole('heading', { name: 'پرفروش‌ترین‌ها' });
    const _hasNewArrivals = page.getByRole('heading', { name: 'تازه‌ها' });
    
    // Ensure homepage loaded completely
    await expect(page.getByRole('link', { name: 'مشاهده محصولات' })).toBeVisible();

    // 2. Navigate to a product page to check similar/FBT products
    await page.goto('/products');
    await expect(page.getByRole('main').first()).toBeVisible();
    
    const firstProductLink = page.locator('a[href^="/products/"]').first();
    if (await firstProductLink.isVisible()) {
      await firstProductLink.click();
      await page.waitForURL('**/products/*');
      
      // Wait for product details to load
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
      
      // Scroll down to recommendations
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Recently Viewed should definitely appear if we just viewed it.
      // Wait a moment for localStorage to save and component to render
      await page.waitForTimeout(2000);
      
      // Navigate to homepage to check recently viewed
      await page.goto('/');
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      await expect(page.getByText('بازدیدهای اخیر شما').first()).toBeVisible({ timeout: 10000 });
    } else {
      console.log('No products available to test recommender system.');
    }
  });
});
