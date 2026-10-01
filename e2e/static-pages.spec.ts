import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  test('User can navigate to Returns Policy page', async ({ page }) => {
    await page.goto('/returns');
    await expect(page).toHaveTitle(/مرجوعی/);
    await expect(page.getByText('شرایط و رویه مرجوعی کالا')).toBeVisible();
    await expect(page.getByText('ثبت مرجوعی سفارش')).toBeVisible();
  });

  test('User can navigate to About Us page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/درباره ما/);
  });

  test('User can navigate to Contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/تماس با ما/);
  });
});
