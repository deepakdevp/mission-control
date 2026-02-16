import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { TaskSchema, Task } from '@/lib/models/task';

const reader = new FileReader();
const writer = new FileWriter();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const existing = await reader.readJSON<Task>(`clawd/tasks/${id}.json`);
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = TaskSchema.parse({
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/tasks/${task.id}.json`, task);
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await writer.deleteFile(`clawd/tasks/${id}.json`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
