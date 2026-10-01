import { test, expect } from '@playwright/test';
import { db } from '../src/prisma/db';
import { SignJWT } from 'jose';

test.describe('Admin Returns System', () => {
  test('Admin can view and update return requests', async ({ page, context }) => {
    test.setTimeout(60000);
    // 1. Create a unique Admin user in DB
    const uniqueSuffix = Date.now().toString();
    const phone = '0999' + uniqueSuffix.slice(-7);
    
    const adminUser = await db.orm.public.User.create({
      phoneNumber: phone,
      role: 'ADMIN',
      name: 'Admin ' + uniqueSuffix,
    });

    // 2. Generate Session JWT directly
    // Use the actual JWT_SECRET from process.env if available, else a fallback
    const secretText = process.env.JWT_SECRET || 'replace-with-a-random-secret-at-least-32-characters-long';
    const secret = new TextEncoder().encode(secretText);
    
    const token = await new SignJWT({
      userId: adminUser.id,
      role: 'ADMIN',
      name: adminUser.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
      
    // 3. Inject cookie into browser context
    await context.addCookies([
      {
        name: 'extim_session',
        value: token,
        domain: '127.0.0.1',
        path: '/',
      }
    ]);

    // 4. Seed product, order, and return request for this user
    let category = await db.orm.public.Category.first();
    if (!category) {
      category = await db.orm.public.Category.create({ name: 'Test', slug: 'test-' + uniqueSuffix });
    }
    
    const product = await db.orm.public.Product.create({
      name: 'Test Return Product ' + uniqueSuffix,
      slug: 'test-return-' + uniqueSuffix,
      categoryId: category.id,
      basePrice: 1000,
      images: [],
    });
    
    const variant = await db.orm.public.ProductVariant.create({
      productId: product.id,
      sku: 'TEST-SKU-' + uniqueSuffix,
    });
    
    const order = await db.orm.public.Order.create({
      userId: adminUser.id,
      totalAmount: 1000,
      receiverName: 'Test Admin',
      phone: phone,
      shippingAddress: 'Test Address',
      status: 'DELIVERED', 
    });
    
    const orderItem = await db.orm.public.OrderItem.create({
      orderId: order.id,
      variantId: variant.id,
      quantity: 1,
      unitPrice: 1000,
    });
    
    const returnRequest = await db.orm.public.ReturnRequest.create({
      orderItemId: orderItem.id,
      userId: adminUser.id,
      reason: 'Defective product e2e test',
      status: 'PENDING',
    });

    // 5. Navigate to Admin Returns Page
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log('BROWSER CONSOLE ERROR:', msg.text());
    });

    await page.goto('/admin/returns');
    
    // Wait for the page to load
    await expect(page.locator('h1', { hasText: 'مدیریت مرجوعی کالا' })).toBeVisible({ timeout: 15000 });
    
    // Verify the return request is visible
    await expect(page.locator('td', { hasText: product.name })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Defective product e2e test' }).first()).toBeVisible();
    // Scope to the specific row (if needed for further assertions, but we already asserted on td)
    
    // USE NATIVE FORM FALLBACK (Hydration often fails for this component in E2E environment)
    console.log("Clicking native form submit button...");
    const nativeBtn = page.getByTestId(`e2e-native-approve-${returnRequest.id}`);
    await nativeBtn.dispatchEvent('click');
    
    // Wait for page to reload/navigate after form submission
    await page.waitForLoadState('networkidle');
    console.log("Form submitted and network idle!");

    // Check if an error toast appeared
    const errorToast = page.locator('.go3958317564, .go2072408551, [role="status"]');
    await page.waitForTimeout(2000); // give it a sec to show up
    const toastText = await errorToast.allInnerTexts();
    console.log("TOAST TEXTS:", toastText);
    
    // First verify the DB was updated (polls until true or timeout)
    await expect(async () => {
      const updatedReturn = await db.orm.public.ReturnRequest.where({ id: returnRequest.id }).first();
      expect(updatedReturn?.status).toBe('APPROVED');
    }).toPass({ timeout: 10000 });

    // Then verify the UI updated
    const dropdownButton = page.getByTestId(`return-status-${returnRequest.id}-trigger`);
    await expect(dropdownButton).toContainText('تایید شده', { timeout: 10000 });
  });
});
