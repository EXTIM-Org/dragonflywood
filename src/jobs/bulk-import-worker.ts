import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { db } from '../prisma/db';
import admZip from 'adm-zip';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { z } from 'zod';
import { invalidateCachePattern } from '../lib/cache';

const RowSchema = z.object({
  sku: z.string().optional().or(z.literal('')),
  productSlug: z.string().min(1, "لینک محصول (Slug) الزامی است"),
  productName: z.string().min(1, "نام محصول الزامی است"),
  categorySlug: z.string().optional(),
  basePrice: z.number().min(0, "قیمت پایه نمی‌تواند منفی باشد"),
  discount: z.number().min(0).max(100, "درصد تخفیف باید بین 0 و 100 باشد").optional().default(0),
  variantName: z.string().optional(),
  variantPrice: z.number().min(0, "قیمت تنوع نمی‌تواند منفی باشد").nullable().optional(),
  stockQuantity: z.number().int().min(0, "موجودی باید یک عدد صحیح مثبت باشد").default(0),
});

export const bulkImportWorker = new Worker('bulk-import-queue', async (job: Job) => {
  const { filePath } = job.data;
  console.log(`[BullMQ] Starting bulk import for ${filePath}`);

  try {
    const extractPath = path.join(process.cwd(), 'public/uploads/temp', `extract-${job.id}`);
    
    // 1. Unzip the file
    const zip = new admZip(filePath);
    zip.extractAllTo(extractPath, true);

    // 2. Find the excel file
    const files = fs.readdirSync(extractPath);
    const excelFile = files.find(f => f.endsWith('.xlsx'));
    
    if (!excelFile) {
      throw new Error('No .xlsx file found in the ZIP archive.');
    }

    // 3. Setup images directory
    const imagesDir = path.join(extractPath, 'images');
    const hasImages = fs.existsSync(imagesDir);

    // 4. Parse Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(extractPath, excelFile));
    const worksheet = workbook.worksheets[0];

    // Count actual rows with data
    let actualTotalRows = 0;
    for (let i = 2; i <= worksheet.rowCount; i++) {
      if (worksheet.getRow(i).hasValues) actualTotalRows++;
    }
    // Prevent division by zero
    const totalRowsToProcess = actualTotalRows > 0 ? actualTotalRows : 1;

    let processed = 0;
    const errors: { row: number, message: string }[] = [];

    const categoryCache = new Map<string, any>();

    // Headers map (expected)
    // 1: SKU, 2: ProductSlug, 3: ProductName, 4: CategorySlug, 5: BasePrice, 6: Discount, 7: VariantName, 8: VariantPrice, 9: StockQuantity
    
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      if (!row.hasValues) continue;

      const parseExcelNumber = (cellValue: any): number | null => {
        if (cellValue === null || cellValue === undefined || cellValue === '') return null;
        let val = cellValue;
        if (typeof val === 'object' && 'result' in val) {
          val = val.result;
        }
        if (typeof val === 'string') {
          // Convert Persian and Arabic digits to English
          val = val.replace(/[۰-۹]/g, (w: string) => String(w.charCodeAt(0) - 1776));
          val = val.replace(/[٠-٩]/g, (w: string) => String(w.charCodeAt(0) - 1632));
          val = val.trim();
        }
        const num = Number(val);
        return isNaN(num) ? null : num;
      };

      const rawData = {
        sku: row.getCell(1).text?.trim(),
        productSlug: row.getCell(2).text?.trim(),
        productName: row.getCell(3).text?.trim(),
        categorySlug: row.getCell(4).text?.trim(),
        basePrice: parseExcelNumber(row.getCell(5).value) ?? 0,
        discount: parseExcelNumber(row.getCell(6).value) ?? 0,
        variantName: row.getCell(7).text?.trim(),
        variantPrice: parseExcelNumber(row.getCell(8).value),
        stockQuantity: parseExcelNumber(row.getCell(9).value) ?? 0,
      };

      if (!rawData.sku && !rawData.productSlug && !rawData.productName) continue; // Skip truly empty row

      const parsed = RowSchema.safeParse(rawData);
      if (!parsed.success) {
        errors.push({ 
          row: i, 
          message: parsed.error.issues.map((e: any) => e.message).join(', ') 
        });
        continue; // Skip invalid row
      }

      const { productSlug, productName, categorySlug, basePrice, discount, variantName, variantPrice, stockQuantity } = parsed.data;
      
      // Generate a default SKU if empty, otherwise use the provided one
      const sku = parsed.data.sku || `sku-${productSlug}-${Date.now().toString().slice(-4)}-${i}`;

      const description = row.getCell(10).text || '';
      const introduction = row.getCell(11).text || '';
      const weight = row.getCell(12).text || '';
      const length = row.getCell(13).text || '';
      const width = row.getCell(14).text || '';
      const height = row.getCell(15).text || '';

      // Ensure Category exists
      const catKey = categorySlug || 'uncategorized';
      let category = categoryCache.get(catKey);
      
      if (!category) {
        category = await db.orm.public.Category.where(c => c.slug.eq(catKey)).first();
        if (!category) {
          category = await db.orm.public.Category.create({
            name: catKey === 'uncategorized' ? 'Uncategorized' : catKey,
            slug: catKey,
          });
        }
        categoryCache.set(catKey, category);
      }

      // Process Images for this SKU
      const imageUrls: string[] = [];
      if (hasImages) {
        const allImages = fs.readdirSync(imagesDir);
        // Find images matching SKU.* or SKU-*.*
        const matchingImages = allImages.filter(img => 
          img.startsWith(sku + '.') || img.startsWith(sku + '-')
        );

        for (const img of matchingImages) {
          const imgPath = path.join(imagesDir, img);
          
          // Check file size (10MB max) to match normal upload rules
          const stats = fs.statSync(imgPath);
          if (stats.size > 10 * 1024 * 1024) {
            errors.push({ row: i, message: `حجم عکس ${img} بیشتر از ۱۰ مگابایت است و نادیده گرفته شد.` });
            continue;
          }

          const ext = path.extname(img);
          const safeName = `${sku}-${Date.now()}${ext}`;
          const finalPath = path.join(process.cwd(), 'public/uploads/products', safeName);
          
          // Ensure products directory exists
          if (!fs.existsSync(path.join(process.cwd(), 'public/uploads/products'))) {
            fs.mkdirSync(path.join(process.cwd(), 'public/uploads/products'), { recursive: true });
          }

          try {
            // Compress and resize with sharp (matching normal product upload rules)
            await sharp(imgPath)
              .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
              .webp({ quality: 80 })
              .toFile(finalPath.replace(ext, '.webp'));

            imageUrls.push(`/uploads/products/${safeName.replace(ext, '.webp')}`);
          } catch (_err) {
            errors.push({ row: i, message: `فایل ${img} یک تصویر معتبر نیست یا قابل پردازش نمی‌باشد.` });
          }
        }
      }

      // Upsert Product
      let product = await db.orm.public.Product.where(p => p.slug.eq(productSlug)).first();
      if (product) {
        // Update product
        await db.orm.public.Product.where(p => p.id.eq(product!.id)).update({
          name: productName || product.name,
          basePrice: basePrice || product.basePrice,
          discount: discount !== undefined ? discount : product.discount,
          categoryId: category.id,
          description: description || product.description,
          introduction: introduction || product.introduction,
          // Append new images if any
          images: imageUrls.length > 0 ? [...product.images, ...imageUrls] : product.images,
        });
      } else {
        // Create product
        product = await db.orm.public.Product.create({
          name: productName,
          slug: productSlug,
          basePrice,
          discount,
          categoryId: category.id,
          images: imageUrls,
          description: description,
          introduction: introduction,
        });
      }

      // Upsert Variant
      let variant = await db.orm.public.ProductVariant.where(v => v.sku.eq(sku)).first();
      if (variant) {
        await db.orm.public.ProductVariant.where(v => v.id.eq(variant!.id)).update({
          name: variantName || variant.name,
          price: variantPrice,
        });
      } else {
        variant = await db.orm.public.ProductVariant.create({
          productId: product.id,
          sku,
          name: variantName,
          price: variantPrice,
        });
      }

      // Handle Inventory
      let inventory = await db.orm.public.Inventory.where(i => i.variantId.eq(variant?.id)).first();
      if (inventory) {
        if (inventory.stockQuantity !== stockQuantity) {
          const diff = stockQuantity - inventory.stockQuantity;
          await db.orm.public.Inventory.where(i => i.id.eq(inventory!.id)).update({
            stockQuantity,
          });
          
          await db.orm.public.InventoryTransaction.create({
            inventoryId: inventory.id,
            type: diff > 0 ? 'RESTOCK' : 'ADJUSTMENT',
            quantity: diff,
            reference: 'Bulk Import',
          });
        }
      } else {
        inventory = await db.orm.public.Inventory.create({
          variantId: variant.id,
          stockQuantity,
          lowStockThreshold: 5,
        });
        
        await db.orm.public.InventoryTransaction.create({
          inventoryId: inventory.id,
          type: 'RESTOCK',
          quantity: stockQuantity,
          reference: 'Bulk Import Initial',
        });
      }

      // Handle Specifications
      const specs = [
        { name: 'وزن', value: weight },
        { name: 'طول', value: length },
        { name: 'عرض', value: width },
        { name: 'ارتفاع', value: height }
      ];

      for (const spec of specs) {
        if (!spec.value) continue;
        
        const existingSpec = await db.orm.public.ProductSpecification.where({
          productId: product.id,
          name: spec.name
        }).first();

        if (existingSpec) {
          if (existingSpec.value !== spec.value) {
            await db.orm.public.ProductSpecification.where(s => s.id.eq(existingSpec.id)).update({ value: spec.value });
          }
        } else {
          await db.orm.public.ProductSpecification.create({
            productId: product.id,
            name: spec.name,
            value: spec.value
          });
        }
      }

      processed++;
      await job.updateProgress(Math.round((processed / totalRowsToProcess) * 100));
    }

    // Clean up temp files
    fs.rmSync(extractPath, { recursive: true, force: true });
    fs.rmSync(filePath, { force: true }); // delete the uploaded zip

    // Invalidate Redis cache so that new products appear immediately on homepage
    await invalidateCachePattern('cache:products:*');

    console.log(`[BullMQ] Bulk import completed for ${filePath}`);
    return { success: true, processed, errors };
  } catch (error: any) {
    console.error(`[BullMQ] Bulk import failed:`, error);
    throw error;
  }
}, { connection: redis });

bulkImportWorker.on('failed', (job, err) => console.error(`Bulk Import Job ${job?.id} failed:`, err));
