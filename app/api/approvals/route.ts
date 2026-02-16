import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { ApprovalSchema, Approval } from '@/lib/models/approval';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/approvals', '.json');
    const approvals: Approval[] = [];

    for (const file of files) {
      const approval = await reader.readJSON<Approval>(`clawd/approvals/${file}`);
      if (approval) {
        approvals.push(approval);
      }
    }

    return NextResponse.json(approvals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read approvals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const approval = ApprovalSchema.parse({
      ...body,
      id: body.id || `approval-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/approvals/${approval.id}.json`, approval);
    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid approval data' }, { status: 400 });
  }
}
