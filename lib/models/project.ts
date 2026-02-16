import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(['planning', 'active', 'paused', 'completed']),
  tasks: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;
