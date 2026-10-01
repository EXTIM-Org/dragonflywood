import { test, expect } from '@playwright/test';

test.describe('Admin Panel Security', () => {
  test('Unauthenticated user is redirected away from admin dashboard', async ({ page }) => {
    // Attempt to access a protected admin route directly
    await page.goto('/admin');
    
    // Wait for Next.js to potentially handle the redirect (middleware or layout)
    await page.waitForTimeout(1500);

    // Assert that we are NOT on the admin page anymore
    // Usually, unauthenticated users are redirected to /login
    expect(page.url()).not.toContain('/admin');
  });
  
  test('Unauthenticated user cannot access admin products page', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain('/admin/products');
  });
});
