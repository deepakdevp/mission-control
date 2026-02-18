// app/api/files/route.ts
import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE_DIR = '/Users/deepak.panwar/clawd';
const ALLOWED_FILES = ['SOUL.md', 'MEMORY.md'];

function validatePath(path: string): boolean {
  return ALLOWED_FILES.includes(path) && !path.includes('../') && !path.startsWith('/');
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  
  if (!path || !validatePath(path)) {
    return NextResponse.json(
      { error: 'Invalid file path' },
      { status: 400 }
    );
  }
  
  try {
    const filePath = join(BASE_DIR, path);
    const content = await readFile(filePath, 'utf-8');
    return NextResponse.json({ path, content });
  } catch (error: unknown) {
    console.error('File read error:', error);
    return NextResponse.json(
      { error: 'Failed to read file', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const { path, content } = body;
  
  if (!path || !validatePath(path)) {
    return NextResponse.json(
      { error: 'Invalid file path' },
      { status: 400 }
    );
  }
  
  if (typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content must be a string' },
      { status: 400 }
    );
  }
  
  try {
    const filePath = join(BASE_DIR, path);
    await writeFile(filePath, content, 'utf-8');
    return NextResponse.json({
      success: true,
      path,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error('File write error:', error);
    return NextResponse.json(
      { error: 'Failed to write file', details: String(error) },
      { status: 500 }
    );
  }
}
