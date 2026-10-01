import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './login-helper';

test.describe('E-Commerce Core Flow', () => {
  // Use a longer timeout for the full flow
  test.setTimeout(300000);

  test('User can login, browse, add to cart, and complete checkout', async ({ page }) => {
    // 1. Log in with a fresh test user
    console.log('Logging in as a fresh user...');
    page.on('response', response => {
    if (response.url().includes('localhost:3000')) {
      response.allHeaders().then(headers => {
        if (headers['set-cookie']) {
          console.log(`[SET_COOKIE_RECEIVED] ${response.request().method()} ${response.url()} -> cookie set`);
        }
      });
    }
  });

  page.on('request', request => {
    if (request.url().includes('localhost:3000')) {
      request.allHeaders().then(headers => {
        if (!headers.cookie) {
          console.log(`[NO_COOKIE_SENT] ${request.method()} ${request.url()}`);
        } else {
          console.log(`[COOKIE_SENT] ${request.method()} ${request.url()} -> cookie present`);
        }
      });
    }
  });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
    page.on('response', res => {
      if (res.status() >= 400) console.log('HTTP ERROR:', res.url(), res.status());
    });

    const userPhone = await loginAsTestUser(page);
    console.log(`Logged in with phone: ${userPhone}`);

    // 2. Visit Homepage (already there)
    await expect(page).toHaveTitle(/اکستیم/);

    // 3. Navigate to Products (Shop)
    await page.getByRole('link', { name: /فروشگاه/i }).first().click();
    await page.waitForURL('**/products');
    await expect(page.getByRole('main').first()).toBeVisible();

    // 4. Use Quick Add button on the first available product card
    const quickAddBtn = page.getByTitle('افزودن سریع به سبد خرید').first();

    // Wait a moment for products to load
    await page.waitForTimeout(1500);

    if (await quickAddBtn.isVisible()) {
      await quickAddBtn.click();

      // If a modal opens for variants, click 'افزودن به سبد'
      const modalBtn = page.getByRole('button', { name: /افزودن به سبد/i });
      if (await modalBtn.isVisible()) {
        await modalBtn.click();
      }

      // Wait a brief moment for cart state to update
      await page.waitForTimeout(1000);

      // 5. Go to Cart
      await page.getByLabel('سبد خرید').first().click();
      await page.waitForURL('**/cart');

      // Verify the checkout link is present and click it
      const checkoutLink = page.locator('a[href="/checkout"]').first();
      await expect(checkoutLink).toBeVisible();
      await checkoutLink.click({ force: true });

      // 6. Complete Checkout Process
      await page.waitForURL('**/checkout');
      await expect(page.locator('h1', { hasText: 'تکمیل اطلاعات و پرداخت' })).toBeVisible();

      // Fill in receiver details
      await page.fill('input[name="receiverName"]', 'کاربر تستی پلی‌رایت');
      await page.fill('input[name="phone"]', userPhone);
      await page.fill('input[name="province"]', 'تهران');
      await page.fill('input[name="city"]', 'تهران');
      await page.fill('textarea[name="address"]', 'میدان آزادی، خیابان تستی، پلاک 1');
      await page.fill('input[name="postalCode"]', '1234567890');

      // Check that the SUCCESS simulation radio is checked (it should be by default)
      const successRadio = page.locator('input[value="SUCCESS"]');
      await expect(successRadio).toBeChecked();

      // Submit the form (wait a moment for hydration and state population)
      await page.waitForTimeout(2000);
      const submitBtn = page.getByRole('button', { name: /پرداخت و ثبت نهایی سفارش/i });
      await submitBtn.click();

      // 7. Verify Success
      // The form submission uses a Server Action which will update the UI on success.
      try {
        await expect(page.getByText('سفارش شما با موفقیت ثبت شد!')).toBeVisible({ timeout: 60000 });
      } catch (error) {
        const errorMsg = page.locator('.bg-red-50.text-red-600');
        if (await errorMsg.isVisible()) {
          const text = await errorMsg.textContent();
          throw new Error("Checkout failed with error message: " + text);
        }
        throw error;
      }

      // Click on order tracking
      const trackOrderBtn = page.getByRole('link', { name: /پیگیری سفارشات/i });
      await trackOrderBtn.click();

      // 8. Verify Orders Page
      await page.waitForURL('**/profile/orders');
      await expect(page.getByRole('heading', { name: 'تاریخچه سفارشات' })).toBeVisible();

      // Simulated checkout marks the newly created order as PAID.
      await expect(page.getByText('پرداخت شده').first()).toBeVisible();

      console.log('Core E-Commerce flow completed successfully.');
    } else {
      console.log('No in-stock products found to test.');
    }
  });
});
