import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './login-helper';

test.describe('Ticketing System Flow', () => {
  test.setTimeout(120000);

  test('User can create a support ticket', async ({ page }) => {
    // 1. Log in with a fresh test user
    console.log('Logging in to test tickets...');
    await loginAsTestUser(page);

    // 2. Navigate to new ticket page
    await page.goto('/profile/tickets/new');
    await expect(page.locator('h1', { hasText: 'ثبت تیکت جدید' })).toBeVisible();

    // 3. Fill in the ticket form
    await page.fill('input[name="subject"]', 'مشکل در استفاده از کد تخفیف');
    await page.fill('textarea[name="message"]', 'سلام، کد تخفیف من اعمال نمیشه لطفا راهنمایی کنید.');

    // We can leave department and priority as default since they are handled by CustomSelect
    // which renders hidden inputs with default values.

    // 4. Submit the ticket
    await page.waitForTimeout(1000);
    const submitBtn = page.getByRole('button', { name: /ثبت تیکت/i });
    await submitBtn.click();

    // 5. Verify successful submission via URL redirect
    await page.waitForURL('**/profile/tickets', { timeout: 60000 });

    // 6. Verify the ticket appears in the list
    await expect(page.getByText('مشکل در استفاده از کد تخفیف').first()).toBeVisible();
    await expect(page.getByText('باز').first()).toBeVisible(); // Initially it's OPEN
  });
});
