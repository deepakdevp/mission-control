import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { PersonSchema, Person } from '@/lib/models/person';

const reader = new FileReader();
const writer = new FileWriter();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const existing = await reader.readJSON<Person>(`clawd/people/${id}.json`);
    if (!existing) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const person = PersonSchema.parse({
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/people/${person.id}.json`, person);
    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid person data' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await writer.deleteFile(`clawd/people/${id}.json`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
  }
}
