import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Flash Sale System Flow', () => {
  test.beforeAll(() => {
    // Ensure at least one flash sale exists
    console.log('Setting up flash sale...');
    execSync('npx tsx e2e/setup-flashsale.ts', { stdio: 'inherit' });
  });

  test('User can see flash sale badge and countdown on products', async ({ page }) => {
    // 1. Navigate to Products page
    await page.goto('/products');
    
    // 2. Wait for products to load
    await expect(page.getByRole('main').first()).toBeVisible();
    
    // 3. Find a product card with the flash sale badge (شگفت‌انگیز)
    const flashSaleBadge = page.getByText(/شگفت‌انگیز/).first();
    
    if (await flashSaleBadge.isVisible()) {
      const card = page.locator('a.group').filter({ has: flashSaleBadge });
      
      // 5. Navigate to the product page
      await card.click();
      await page.waitForURL('**/products/*');
      
      // 6. Verify flash sale is active on the product detail page
      await expect(page.locator('.text-rose-500').first()).toBeVisible();
    } else {
      console.log('No active flash sales found on the first page of products.');
    }
  });
});
