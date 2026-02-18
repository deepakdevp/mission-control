import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const people = await prisma.person.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const person = await prisma.person.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
        notes: body.notes,
        lastContact: body.lastContact ? new Date(body.lastContact) : null,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
