import { Page, expect } from '@playwright/test';

export async function loginAsTestUser(page: Page) {
  await page.goto('/login');

  // Generate a random 0999 number so we ALWAYS get a fresh user
  const randomPhone = '0999' + Math.floor(1000000 + Math.random() * 9000000).toString();

  // Step 1: Identifier
  const identifierInput = page.getByPlaceholder(/name@example\.com|0912/i).first();
  await expect(identifierInput).toBeVisible();
  await identifierInput.fill(randomPhone);
  await page.locator('form').filter({ has: identifierInput }).locator('button[type="submit"]').first().click();

  // Step 2: Because it's a new user, it will ALWAYS go to OTP step
  const otpInput = page.getByPlaceholder('•••••').first();
  await expect(otpInput).toBeVisible({ timeout: 60000 });
  await otpInput.fill('12345');
  await page.locator('form').filter({ has: otpInput }).locator('button[type="submit"]').first().click();

  // Step 3: Because it's a new user, it will ALWAYS go to SET_PHONE_PASSWORD step
  const passwordInput = page.locator('input[name="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 60000 });

  await passwordInput.fill('Password123!');

  const confirmPasswordInput = page.locator('input[name="confirmPassword"]').first();
  await confirmPasswordInput.fill('Password123!');

  await page.locator('form').filter({ has: page.locator('input[name="password"]') }).locator('button[type="submit"]').first().click();

  // Wait for Set-Cookie header to be fully processed and redirect to complete
  const profileLink = page.getByRole('link', { name: /سلام/i }).first();
  await expect(profileLink).toBeVisible({ timeout: 60000 });

  return randomPhone;
}
