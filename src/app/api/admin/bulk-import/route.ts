import { bulkImportQueue } from '@/jobs/queues';
import fs from 'fs';
import path from 'path';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    if (file.name.split('.').pop() !== 'zip') {
      return NextResponse.json({ success: false, error: 'Only .zip files are allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = path.join(process.cwd(), 'public/uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `bulk-${Date.now()}.zip`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Add to BullMQ
    const job = await bulkImportQueue.add('import-products', { filePath });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error: any) {
    console.error('Bulk Import Upload API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload and start job.' }, { status: 500 });
  }
}
