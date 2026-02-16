import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { ApprovalSchema, Approval } from '@/lib/models/approval';

const reader = new FileReader();
const writer = new FileWriter();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const existing = await reader.readJSON<Approval>(`clawd/approvals/${id}.json`);
    if (!existing) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    const approval = ApprovalSchema.parse({
      ...existing,
      ...body,
      id,
      respondedAt: body.status !== 'pending' ? new Date().toISOString() : existing.respondedAt,
    });

    await writer.writeJSON(`clawd/approvals/${approval.id}.json`, approval);
    return NextResponse.json(approval);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid approval data' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await writer.deleteFile(`clawd/approvals/${id}.json`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete approval' }, { status: 500 });
  }
}
