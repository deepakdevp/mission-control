import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { ProjectSchema, Project } from '@/lib/models/project';

const reader = new FileReader();
const writer = new FileWriter();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const existing = await reader.readJSON<Project>(`clawd/projects/${id}.json`);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = ProjectSchema.parse({
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/projects/${project.id}.json`, project);
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid project data' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await writer.deleteFile(`clawd/projects/${id}.json`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
