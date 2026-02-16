import { NextRequest, NextResponse } from 'next/server';
import { FileReader } from '@/lib/fs/reader';
import { FileWriter } from '@/lib/fs/writer';
import { ProjectSchema, Project } from '@/lib/models/project';

const reader = new FileReader();
const writer = new FileWriter();

export async function GET() {
  try {
    const files = await reader.listFiles('clawd/projects', '.json');
    const projects: Project[] = [];

    for (const file of files) {
      const project = await reader.readJSON<Project>(`clawd/projects/${file}`);
      if (project) {
        projects.push(project);
      }
    }

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = ProjectSchema.parse({
      ...body,
      id: body.id || `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await writer.writeJSON(`clawd/projects/${project.id}.json`, project);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid project data' }, { status: 400 });
  }
}
