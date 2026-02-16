import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { CronJobSchema, CronJob } from '@/lib/models/cron';

const reader = new FileReader();
const writer = new FileWriter();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const existing = await reader.readJSON<CronJob>(`clawd/cron/${id}.json`);
    if (!existing) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    const cronJob = CronJobSchema.parse({
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/cron/${cronJob.id}.json`, cronJob);
    return NextResponse.json(cronJob);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid cron job data' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await writer.deleteFile(`clawd/cron/${id}.json`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cron job' }, { status: 500 });
  }
}
