import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const approval = await prisma.approval.findUnique({
      where: { id },
    });

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error fetching approval:', error);
    return NextResponse.json({ error: 'Failed to fetch approval' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json();
    
    const approval = await prisma.approval.update({
      where: { id },
      data: {
        status: body.status,
        response: body.response,
        notes: body.notes,
        respondedAt: body.status !== 'pending' ? new Date() : null,
      },
    });

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.approval.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting approval:', error);
    return NextResponse.json({ error: 'Failed to delete approval' }, { status: 500 });
  }
}
