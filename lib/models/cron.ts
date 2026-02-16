import { z } from 'zod';

export const CronJobSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  schedule: z.string(), // Cron expression
  command: z.string(),
  enabled: z.boolean(),
  lastRun: z.string().optional(),
  nextRun: z.string().optional(),
  lastStatus: z.enum(['success', 'failure']).optional(),
  logs: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CronJob = z.infer<typeof CronJobSchema>;
