import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

// Prevent multiple queue instances in development mode (hot reloading)
const globalForQueues = global as unknown as { 
  queues: {
    cartCleanup?: Queue;
    flashSale?: Queue;
    keyRotation?: Queue;
    notification?: Queue;
    bulkImport?: Queue;
    ticketAutoClose?: Queue;
    abandonedCart?: Queue;
    shippingSync?: Queue;
  }
};

if (!globalForQueues.queues) {
  globalForQueues.queues = {};
}

// Setup Cart Cleanup Queue
export const cartCleanupQueue = globalForQueues.queues.cartCleanup || new Queue('cart-cleanup-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
});

// Setup Flash Sale Queue
export const flashSaleQueue = globalForQueues.queues.flashSale || new Queue('flash-sale-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
});

// Setup Key Rotation Queue
export const keyRotationQueue = globalForQueues.queues.keyRotation || new Queue('key-rotation-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
});

// Setup Notification Queue (Email & SMS)
export const notificationQueue = globalForQueues.queues.notification || new Queue('notification-queue', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

// Setup Bulk Import Queue
export const bulkImportQueue = globalForQueues.queues.bulkImport || new Queue('bulk-import-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: 10, removeOnFail: 10 },
});

// Setup Ticket Auto-Close Queue
export const ticketAutoCloseQueue = globalForQueues.queues.ticketAutoClose || new Queue('ticket-auto-close-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
});

// Setup Abandoned Cart Queue
export const abandonedCartQueue = globalForQueues.queues.abandonedCart || new Queue('abandoned-cart-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
});

// Setup Tapin Shipping Sync Queue
export const shippingSyncQueue = globalForQueues.queues.shippingSync || new Queue('shipping-sync-queue', {
  connection: redis,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: 5 },
});

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.queues.cartCleanup = cartCleanupQueue;
  globalForQueues.queues.flashSale = flashSaleQueue;
  globalForQueues.queues.keyRotation = keyRotationQueue;
  globalForQueues.queues.notification = notificationQueue;
  globalForQueues.queues.bulkImport = bulkImportQueue;
  globalForQueues.queues.ticketAutoClose = ticketAutoCloseQueue;
  globalForQueues.queues.abandonedCart = abandonedCartQueue;
  globalForQueues.queues.shippingSync = shippingSyncQueue;
}
