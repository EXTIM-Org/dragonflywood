import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './login-helper';

test.describe('Product Reviews & Ratings Flow', () => {
  test('User can log in, navigate to a product, and submit a review', async ({ page }) => {
    // 1. Log in with a fresh test user
    await loginAsTestUser(page);
    
    // 2. Navigate to Products (Shop)
    await page.getByRole('link', { name: /فروشگاه/i }).first().click();
    await page.waitForURL('**/products');
    
    // 3. Click on the first product card to view its details
    // Assuming product cards have a link wrapping the image/title
    const firstProductLink = page.locator('a[href^="/products/"]').first();
    await expect(firstProductLink).toBeVisible();
    await firstProductLink.click();
    
    // 4. Wait for product page to load
    await page.waitForURL('**/products/*');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    // 5. Navigate to Reviews tab
    const reviewsTab = page.getByRole('button', { name: /نظرات کاربران/i });
    await expect(reviewsTab).toBeVisible();
    await reviewsTab.click();
    
    // 6. Fill the review form
    // The form contains a "ثبت نظر جدید" heading when logged in
    await expect(page.getByText('ثبت نظر جدید')).toBeVisible();
    
    // Click the 5th star rating
    // We can target the buttons that contain the lucide-star svg
    const stars = page.locator('button').filter({ has: page.locator('svg.lucide-star') });
    await stars.nth(4).click(); // 5th star (0-indexed)
    
    // Fill the comment
    const commentBox = page.getByPlaceholder('تجربه خرید یا استفاده از این محصول را بنویسید...');
    await commentBox.fill('تست خودکار: این یک بررسی بی‌نظیر برای محصول است!');
    
    // Submit the review
    const submitBtn = page.getByRole('button', { name: 'ثبت نظر', exact: true });
    await submitBtn.click();
    
    // 7. Verify success toast
    await expect(page.getByText('نظر شما با موفقیت ثبت شد!')).toBeVisible({ timeout: 10000 });
  });
});
