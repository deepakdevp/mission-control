import { z } from 'zod';

export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  path: z.string(), // Path in folder structure
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;
