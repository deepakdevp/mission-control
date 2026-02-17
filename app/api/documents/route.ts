import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { DocumentSchema, Document } from '@/lib/models/document';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/docs', '.json');
    const documents: Document[] = [];

    for (const file of files) {
      const doc = await reader.readJSON<Document>(`clawd/docs/${file}`);
      if (doc) {
        documents.push(doc);
      }
    }

    // Sort by path for tree structure
    documents.sort((a, b) => a.path.localeCompare(b.path));

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const document = DocumentSchema.parse({
      ...body,
      id: body.id || `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/docs/${document.id}.json`, document);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid document data' }, { status: 400 });
  }
}
