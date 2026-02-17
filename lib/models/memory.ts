import { z } from 'zod';

export const MemorySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()),
  category: z.enum(['personal', 'work', 'learning', 'idea', 'note']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Memory = z.infer<typeof MemorySchema>;
