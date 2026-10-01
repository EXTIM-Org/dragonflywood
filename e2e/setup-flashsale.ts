import { db } from '../src/prisma/db';

async function main() {
  const product = await db.orm.public.Product.orderBy(p => p.createdAt.asc()).first();
  if (!product) {
    console.log('No products found.');
    return;
  }
  
  const existing = await db.orm.public.FlashSale.where({ productId: product.id }).first();
  if (!existing) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await db.orm.public.FlashSale.create({
      productId: product.id,
      discountPercent: 25,
      startTime: new Date().toISOString(),
      endTime: tomorrow.toISOString(),
      isActive: true,
    });
    console.log('Flash sale created for product', product.id);
  } else {
    // If it exists but expired, update it
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await db.orm.public.FlashSale.where({ id: existing.id }).update({
      endTime: tomorrow.toISOString(),
      isActive: true,
    });
    console.log('Flash sale updated');
  }
}

main().catch((err) => {
  console.error('Error setting up flash sale:', err);
  process.exit(1);
});
