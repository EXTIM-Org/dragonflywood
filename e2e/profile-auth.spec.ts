import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './login-helper';

test.describe('Authenticated User Profile Flow', () => {
  test('User can log in and view their profile', async ({ page }) => {
    // Increase test timeout to 120s because dev server compilation can push total time over 30s
    test.setTimeout(120000);
    
    // 1. Log in using the backdoor and get the generated phone number
    const phone = await loginAsTestUser(page);

    // 2. Navigate to Profile
    const profileLink = page.getByRole('link', { name: /سلام/i }).first();
    await expect(profileLink).toBeVisible();
    await page.goto('/profile'); // Avoid Next.js link prefetch caching issues in E2E
    await page.waitForURL('**/profile');

    // 3. Verify Profile Page Elements
    // Next.js dev server might take time to compile the /profile page on first visit, 
    // so we give it a generous timeout. We use toContainText so if it fails, it prints what it actually saw.
    const profileHeading = page.locator('h1').first();
    await expect(profileHeading).toContainText('حساب کاربری', { timeout: 60000 });

    // Verify phone number is shown
    await expect(page.getByText(phone).first()).toBeVisible();
  });
});
