import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Mission Control Dashboard',
      description: 'Build a comprehensive mission control dashboard for managing all aspects of work',
      status: 'active',
      progress: 45,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      docs: '# Mission Control\n\n## Overview\nA centralized dashboard for managing tasks, approvals, projects, and more.',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Clawdbot Enhancements',
      description: 'Improve Clawdbot capabilities and integrations',
      status: 'planning',
      progress: 15,
      startDate: new Date('2025-02-01'),
      docs: '# Enhancements\n\n- Better memory management\n- Improved context awareness',
    },
  });

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up database schema',
        description: 'Create Prisma schema with all required models',
        status: 'done',
        priority: 'high',
        assignedTo: 'agent',
        tags: JSON.stringify(['database', 'backend']),
        projectId: project1.id,
      },
      {
        title: 'Build kanban board UI',
        description: 'Implement drag-and-drop kanban board for tasks',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-02-20'),
        assignedTo: 'agent',
        tags: JSON.stringify(['ui', 'frontend']),
        projectId: project1.id,
      },
      {
        title: 'Implement real-time updates',
        description: 'Set up SSE for live updates across the dashboard',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2025-02-25'),
        assignedTo: 'agent',
        tags: JSON.stringify(['backend', 'real-time']),
        projectId: project1.id,
      },
      {
        title: 'Review API documentation',
        description: 'Document all API endpoints and their usage',
        status: 'blocked',
        priority: 'low',
        assignedTo: 'user',
        tags: JSON.stringify(['documentation']),
        projectId: project1.id,
      },
      {
        title: 'Research memory optimization',
        description: 'Investigate better ways to manage agent memory',
        status: 'todo',
        priority: 'medium',
        assignedTo: 'agent',
        tags: JSON.stringify(['research', 'memory']),
        projectId: project2.id,
      },
    ],
  });

  // Create Approvals
  await prisma.approval.createMany({
    data: [
      {
        title: 'Deploy to production',
        description: 'Request approval to deploy v2.0 to production',
        status: 'pending',
        requestedBy: 'agent',
        metadata: JSON.stringify({ version: '2.0.0', environment: 'production' }),
      },
      {
        title: 'Database schema changes',
        description: 'Add new indexes to improve query performance',
        status: 'approved',
        requestedBy: 'agent',
        respondedAt: new Date('2025-02-16'),
        response: 'approved',
        notes: 'Approved - looks good',
      },
      {
        title: 'Budget increase request',
        description: 'Request $500 additional budget for API costs',
        status: 'denied',
        requestedBy: 'user',
        respondedAt: new Date('2025-02-15'),
        response: 'denied',
        notes: 'Current budget is sufficient',
        metadata: JSON.stringify({ amount: 500, reason: 'API overages' }),
      },
    ],
  });

  // Create People
  await prisma.person.createMany({
    data: [
      {
        name: 'Deepak Dev Panwar',
        email: 'deepak@example.com',
        phone: '+1234567890',
        tags: JSON.stringify(['team', 'developer']),
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/deepakdev',
          twitter: 'https://twitter.com/DeepakDev2012',
          github: 'https://github.com/deepakdev',
        }),
        notes: 'Primary developer and project lead',
        lastContact: new Date('2025-02-17'),
      },
      {
        name: 'Jane Smith',
        email: 'jane@client.com',
        tags: JSON.stringify(['client']),
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/janesmith',
        }),
        notes: 'Key stakeholder for Mission Control project',
        lastContact: new Date('2025-02-10'),
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+1987654321',
        tags: JSON.stringify(['friend', 'advisor']),
        notes: 'Technical advisor and mentor',
        lastContact: new Date('2025-01-28'),
      },
    ],
  });

  // Create Cron Jobs
  await prisma.cronJob.createMany({
    data: [
      {
        name: 'Daily backup',
        expression: '0 2 * * *',
        command: 'npm run backup',
        enabled: true,
        lastRun: new Date('2025-02-17T02:00:00'),
        nextRun: new Date('2025-02-18T02:00:00'),
        status: 'success',
        logs: JSON.stringify([
          { timestamp: '2025-02-17T02:00:00', message: 'Backup completed successfully' },
        ]),
      },
      {
        name: 'Check for updates',
        expression: '0 */6 * * *',
        command: 'npm run check-updates',
        enabled: true,
        lastRun: new Date('2025-02-17T06:00:00'),
        nextRun: new Date('2025-02-17T12:00:00'),
        status: 'success',
      },
      {
        name: 'Weekly report',
        expression: '0 9 * * 1',
        command: 'npm run weekly-report',
        enabled: false,
        lastRun: new Date('2025-02-10T09:00:00'),
        nextRun: new Date('2025-02-17T09:00:00'),
        status: 'success',
      },
    ],
  });

  // Create Memory Entries
  await prisma.memoryEntry.createMany({
    data: [
      {
        date: new Date('2025-02-17'),
        filePath: 'memory/2025-02-17.md',
        content: '# 2025-02-17\n\n## Accomplished\n- Started Mission Control project\n- Set up database schema\n\n## Notes\n- Need to focus on UI components next',
        tags: JSON.stringify(['development', 'mission-control']),
      },
      {
        date: new Date('2025-02-16'),
        filePath: 'memory/2025-02-16.md',
        content: '# 2025-02-16\n\n## Accomplished\n- Reviewed requirements\n- Planned project structure\n\n## Decisions\n- Using Prisma + SQLite\n- Next.js 14 with App Router',
        tags: JSON.stringify(['planning']),
      },
    ],
  });

  // Create Documents
  const rootDoc1 = await prisma.document.create({
    data: {
      title: 'Getting Started',
      path: '/getting-started.md',
      content: '# Getting Started\n\nWelcome to Mission Control! This guide will help you get started with the dashboard.',
    },
  });

  await prisma.document.create({
    data: {
      title: 'API Reference',
      path: '/api-reference.md',
      content: '# API Reference\n\n## Endpoints\n\n### Tasks\n- GET /api/tasks\n- POST /api/tasks',
      parentId: rootDoc1.id,
    },
  });

  await prisma.document.create({
    data: {
      title: 'Deployment Guide',
      path: '/deployment.md',
      content: '# Deployment\n\n## Production Deployment\n\n1. Build the project\n2. Set environment variables\n3. Deploy to Vercel',
    },
  });

  // Create Calendar Events
  await prisma.calendarEvent.createMany({
    data: [
      {
        title: 'Project kickoff meeting',
        description: 'Initial planning session for Mission Control',
        startTime: new Date('2025-02-18T10:00:00'),
        endTime: new Date('2025-02-18T11:00:00'),
        location: 'Zoom',
        attendees: JSON.stringify(['Deepak', 'Jane', 'Bob']),
      },
      {
        title: 'Sprint review',
        description: 'Review progress on current sprint',
        startTime: new Date('2025-02-21T14:00:00'),
        endTime: new Date('2025-02-21T15:00:00'),
        location: 'Conference Room A',
        attendees: JSON.stringify(['Team']),
      },
      {
        title: 'Demo day',
        description: 'Present Mission Control to stakeholders',
        startTime: new Date('2025-02-28T16:00:00'),
        endTime: new Date('2025-02-28T17:00:00'),
        location: 'Main Hall',
        attendees: JSON.stringify(['All hands']),
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
