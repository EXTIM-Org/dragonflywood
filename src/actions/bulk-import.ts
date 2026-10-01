'use server';

import { bulkImportQueue } from '../jobs/queues';
import { getSession } from '../lib/session';

export async function checkBulkImportProgress(jobId: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return { success: false, error: 'Unauthorized' };
    }

    const job = await bulkImportQueue.getJob(jobId);
    if (!job) return { success: false, error: 'Job not found.' };

    const state = await job.getState();
    const progress = job.progress;
    
    return {
      success: true,
      state, // 'active', 'completed', 'failed', 'waiting', etc.
      progress,
      failedReason: job.failedReason,
      result: job.returnvalue,
    };
  } catch (_error) {
    return { success: false, error: 'Failed to check progress.' };
  }
}
