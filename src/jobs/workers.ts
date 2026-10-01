import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { db } from '../prisma/db';
import crypto from 'crypto';
import { keyRotationQueue, ticketAutoCloseQueue, notificationQueue } from './queues';
import { invalidateCachePattern } from '../lib/cache';
import { sendEmail } from '../lib/email';
import { sendSms } from '../lib/sms';
import './bulk-import-worker';
import { render } from '@react-email/render';
import { AbandonedCartEmail } from '../emails/AbandonedCartEmail';

export function setupWorkers() {
  console.log('[BullMQ] Setting up background workers...');

  const cartWorker = new Worker('cart-cleanup-queue', async (job: Job) => {
    const { cartItemId, variantId, quantity, reservedAt } = job.data;
    
    // Check if the cart item still exists
    const cartItem = await db.orm.public.CartItem.where({ id: cartItemId }).first();
    
    // If it exists and hasn't been updated (reservedAt matches precisely)
    if (cartItem && cartItem.reservedAt && new Date(cartItem.reservedAt).getTime() === new Date(reservedAt).getTime()) {
      console.log(`[BullMQ] Releasing cart reservation for item ${cartItemId}`);
      
      const inventory = await db.orm.public.Inventory.where({ variantId }).first();
      if (inventory) {
        // Atomic release
        const plan = db.raw.sql`
          UPDATE inventory 
          SET "stockQuantity" = "stockQuantity" + ${quantity}, 
              "reservedStock" = GREATEST(0, "reservedStock" - ${quantity})
          WHERE id = ${inventory.id}
        `.affectedCount().build();
        await db.runtime().execute(plan);
      }
      
      // Delete the expired cart item
      await db.orm.public.CartItem.where({ id: cartItemId }).delete();
    }
  }, { connection: redis });

  const flashSaleWorker = new Worker('flash-sale-queue', async (job: Job) => {
    const { flashSaleId } = job.data;
    console.log(`[BullMQ] Expiring flash sale ${flashSaleId}`);
    
    await db.orm.public.FlashSale.where({ id: flashSaleId }).update({ isActive: false });
    await invalidateCachePattern("cache:products:*");
  }, { connection: redis });

  const keyRotationWorker = new Worker('key-rotation-queue', async (_job: Job) => {
    console.log('[BullMQ] Rotating JWT Keys...');
    const current = await redis.get('jwt:secret:current');
    if (current) {
      await redis.set('jwt:secret:previous', current);
    }
    const newSecret = crypto.randomBytes(32).toString('hex');
    await redis.set('jwt:secret:current', newSecret);
    console.log('[BullMQ] JWT Keys rotated successfully.');
  }, { connection: redis });

  const notificationWorker = new Worker('notification-queue', async (job: Job) => {
    const { type, payload } = job.data;
    console.log(`[BullMQ] Processing notification: ${type}`);
    
    try {
      if (type === 'email') {
        await sendEmail(payload);
      } else if (type === 'sms') {
        await sendSms(payload);
      }
    } catch (error) {
      console.error(`[BullMQ] Failed to send ${type} notification:`, error);
      throw error; // Triggers BullMQ retry mechanism
    }
  }, { connection: redis });

  const abandonedCartWorker = new Worker('abandoned-cart-queue', async (job: Job) => {
    const { userId, cartUpdatedAt } = job.data;
    console.log(`[BullMQ] Checking abandoned cart for user ${userId} at ${new Date().toISOString()}`);

    const settings = await redis.hgetall("settings:notifications");
    const emailEnabled = settings["abandoned_cart_email"] === "true";
    const smsEnabled = settings["abandoned_cart_sms"] === "true";
    
    console.log(`[BullMQ] Abandoned Cart - emailEnabled: ${emailEnabled}, smsEnabled: ${smsEnabled}`);
    if (!emailEnabled && !smsEnabled) return;

    const discountEnabled = settings["abandoned_cart_discount_enabled"] === "true";
    const discountPercent = parseInt(settings["abandoned_cart_discount_percent"] || "10", 10);
    const smsTemplate = settings["abandoned_cart_sms_text"] || "سلام {name} عزیز، سبد خرید شما منتظر شماست!\nهمین الان خرید خود را نهایی کنید.\n{discount}";

    const cart = await db.orm.public.Cart.where({ userId }).include("items", (i) => i.include("variant", (v) => v.include("product"))).first();
    
    if (!cart || cart.items.length === 0) {
      console.log(`[BullMQ] Cart is empty or not found for user ${userId}. Ignoring.`);
      return;
    }

    const latestItem = cart.items.reduce((latest, item) => {
      return new Date(item.reservedAt || 0) > new Date(latest.reservedAt || 0) ? item : latest;
    }, cart.items[0]);

    if (new Date(latestItem.reservedAt!).getTime() > new Date(cartUpdatedAt).getTime()) {
      console.log(`[BullMQ] Cart was updated after this job was scheduled. Job: ${cartUpdatedAt}, Cart Latest: ${latestItem.reservedAt}. Ignoring.`);
      return;
    }

    const user = await db.orm.public.User.where({ id: userId }).first();
    if (!user) {
      console.log(`[BullMQ] User ${userId} not found. Ignoring.`);
      return;
    }
    console.log(`[BullMQ] Proceeding to send abandoned cart message to ${user.email || user.phoneNumber}`);

    let discountCode = undefined;
    let discountMsg = "";

    if (discountEnabled) {
      discountCode = `CBK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await db.orm.public.Coupon.create({
        code: discountCode,
        type: "PERCENTAGE",
        value: discountPercent,
        usageLimit: 1,
        // expires in 24 hours
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      discountMsg = `با کد تخفیف ${discountPercent}٪ اختصاصی: ${discountCode}`;
    }

    if (emailEnabled && user.email) {
      const emailHtml = await render(
        AbandonedCartEmail({
          customerName: user.name || "کاربر عزیز",
          items: cart.items.filter(item => item.variant).map(item => ({
            name: item.variant!.product.name,
            variantName: item.variant!.name || undefined,
            image: item.variant!.product.images[0] || "",
            price: item.variant!.price ?? item.variant!.product.basePrice
          })),
          checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout`,
          discountCode: discountCode,
          discountPercent: discountPercent
        })
      );

      await notificationQueue.add('send-email', {
        type: 'email',
        payload: {
          to: user.email,
          subject: 'سبد خرید شما منتظر شماست!',
          html: emailHtml
        }
      });
    }

    if (smsEnabled && user.phoneNumber) {
      const finalSms = smsTemplate
        .replace(/{name}/g, user.name || "کاربر عزیز")
        .replace(/{discount}/g, discountMsg);

      await notificationQueue.add('send-sms', {
        type: 'sms',
        payload: {
          to: user.phoneNumber,
          text: finalSms
        }
      });
    }
  }, { connection: redis });

  cartWorker.on('failed', (job, err) => console.error(`Cart Job ${job?.id} failed:`, err));
  flashSaleWorker.on('failed', (job, err) => console.error(`FlashSale Job ${job?.id} failed:`, err));
  keyRotationWorker.on('failed', (job, err) => console.error(`KeyRotation Job ${job?.id} failed:`, err));
  notificationWorker.on('failed', (job, err) => console.error(`Notification Job ${job?.id} failed:`, err));
  abandonedCartWorker.on('failed', (job, err) => console.error(`AbandonedCart Job ${job?.id} failed:`, err));

  const ticketAutoCloseWorker = new Worker('ticket-auto-close-queue', async (_job: Job) => {
    console.log('[BullMQ] Checking for inactive tickets to auto-close...');
    const seventyTwoHoursAgo = Date.now() - 72 * 60 * 60 * 1000;
    
    const pendingTickets = await db.orm.public.Ticket
        .where({ status: 'WAITING_FOR_USER' })
        .all();
    
    const inactiveTickets = pendingTickets.filter(t => new Date(t.updatedAt).getTime() < seventyTwoHoursAgo);
        
    if (inactiveTickets.length > 0) {
      console.log(`[BullMQ] Found ${inactiveTickets.length} tickets to auto-close.`);
      for (const ticket of inactiveTickets) {
          await db.orm.public.Ticket.where({ id: ticket.id }).update({ status: 'CLOSED' });
          console.log(`[BullMQ] Auto-closed ticket ${ticket.id}`);
      }
    }
  }, { connection: redis });

  ticketAutoCloseWorker.on('failed', (job, err) => console.error(`TicketAutoClose Job ${job?.id} failed:`, err));

  // Schedule monthly key rotation (Runs at 00:00 on day-of-month 1)
  keyRotationQueue.upsertJobScheduler('monthly-rotation', {
    pattern: '0 0 1 * *',
  }, {
    name: 'rotate-keys',
    data: {},
  });

  // Schedule ticket auto-close check (Runs every hour)
  ticketAutoCloseQueue.upsertJobScheduler('hourly-ticket-check', {
    pattern: '0 * * * *',
  }, {
    name: 'auto-close-tickets',
    data: {},
  });

  return { cartWorker, flashSaleWorker, keyRotationWorker, notificationWorker, abandonedCartWorker, ticketAutoCloseWorker };
}
