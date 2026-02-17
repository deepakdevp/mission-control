import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { MemorySchema, Memory } from '@/lib/models/memory';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/memory', '.json');
    const memories: Memory[] = [];

    for (const file of files) {
      const memory = await reader.readJSON<Memory>(`clawd/memory/${file}`);
      if (memory) {
        memories.push(memory);
      }
    }

    // Sort by createdAt desc
    memories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(memories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read memories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const memory = MemorySchema.parse({
      ...body,
      id: body.id || `memory-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/memory/${memory.id}.json`, memory);
    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid memory data' }, { status: 400 });
  }
}
