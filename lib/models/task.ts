import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().optional(),
  projectId: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  dueDate: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
