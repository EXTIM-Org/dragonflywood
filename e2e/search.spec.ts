import { test, expect } from '@playwright/test';

test.describe('Search and Filter Flow', () => {
  test('User can search for products and see results', async ({ page }) => {
    // 1. Go to Products page
    await page.goto('/products');

    // 2. Locate the search input
    const searchInput = page.getByPlaceholder(/نام محصول/i).first();
    await expect(searchInput).toBeVisible();

    // 3. Type a query that should not match any products
    const searchTerm = 'محصولنامعتبرکهاصلاوجودندارد';
    await searchInput.fill(searchTerm);
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(searchTerm);

    // 5. Verify the empty state message is shown
    // Usually it says 'متاسفانه هیچ محصولی با این مشخصات یافت نشد.'
    const emptyState = page.locator('p').filter({ hasText: 'یافت نشد' }).first();
    await expect(emptyState).toBeVisible();
  });
});
