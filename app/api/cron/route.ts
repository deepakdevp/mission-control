import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { CronJobSchema, CronJob } from '@/lib/models/cron';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/cron', '.json');
    const cronJobs: CronJob[] = [];

    for (const file of files) {
      const cronJob = await reader.readJSON<CronJob>(`clawd/cron/${file}`);
      if (cronJob) {
        cronJobs.push(cronJob);
      }
    }

    return NextResponse.json(cronJobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read cron jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cronJob = CronJobSchema.parse({
      ...body,
      id: body.id || `cron-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/cron/${cronJob.id}.json`, cronJob);
    return NextResponse.json(cronJob, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid cron job data' }, { status: 400 });
  }
}
