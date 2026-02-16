import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { TaskSchema, Task } from '@/lib/models/task';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/tasks', '.json');
    const tasks: Task[] = [];

    for (const file of files) {
      const task = await reader.readJSON<Task>(`clawd/tasks/${file}`);
      if (task) {
        tasks.push(task);
      }
    }

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = TaskSchema.parse({
      ...body,
      id: body.id || `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/tasks/${task.id}.json`, task);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
  }
}
