import { test, expect } from '@playwright/test';

test.describe('User Profile Security', () => {
  test('Unauthenticated user is redirected to login when accessing profile', async ({ page }) => {
    // Attempt to access user profile
    await page.goto('/profile');
    
    // Wait for the redirect
    await page.waitForTimeout(1500);

    // Verify redirection to login page
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('Unauthenticated user is redirected when accessing orders', async ({ page }) => {
    await page.goto('/profile/orders');
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/.*login/);
  });
});
