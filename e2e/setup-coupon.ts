import { db } from '../src/prisma/db';

async function main() {
  const code = 'TEST_DISCOUNT';
  const existing = await db.orm.public.Coupon.where({ code }).first();
  if (!existing) {
    await db.orm.public.Coupon.create({
      code,
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
    });
    console.log('Test coupon created');
  } else {
    console.log('Test coupon already exists');
  }
}

main().catch((err) => {
  console.error('Error creating coupon:', err);
  process.exit(1);
});
