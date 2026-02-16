import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { PersonSchema, Person } from '@/lib/models/person';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/people', '.json');
    const people: Person[] = [];

    for (const file of files) {
      const person = await reader.readJSON<Person>(`clawd/people/${file}`);
      if (person) {
        people.push(person);
      }
    }

    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read people' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const person = PersonSchema.parse({
      ...body,
      id: body.id || `person-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/people/${person.id}.json`, person);
    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid person data' }, { status: 400 });
  }
}
