import { test, expect } from '@playwright/test';

test.describe('Blog Flow', () => {
  test('User can navigate to Blog and read an article', async ({ page }) => {
    // 1. Visit Blog Index
    await page.goto('/blog');
    await expect(page.locator('h1', { hasText: 'وبلاگ' }).first()).toBeVisible();
    await expect(page.getByText('جدیدترین مقالات')).toBeVisible();

    // 2. Open an article if one exists
    const firstArticle = page.locator('article').first();
    const hasArticle = await firstArticle.isVisible();

    if (hasArticle) {
      const readMoreLink = firstArticle.getByRole('link', { name: /ادامه مطلب|خواندن/i }).first();
      // Click the article link if there is a button, otherwise click the article title
      if (await readMoreLink.isVisible()) {
        await readMoreLink.click();
      } else {
        const titleLink = firstArticle.locator('h2 a, h3 a').first();
        if (await titleLink.isVisible()) {
          await titleLink.click();
        } else {
          // Just click anywhere on the article card that is a link
          await firstArticle.locator('a').first().click();
        }
      }

      // 3. Verify Article Page
      await page.waitForURL('**/blog/**');
      // Verify some markdown content or header exists
      await expect(page.locator('article')).toBeVisible();
      // Ensure there are no 404 text
      await expect(page.getByText('یافت نشد')).toBeHidden();
    } else {
      console.log('No blog articles found to test.');
    }
  });
});
