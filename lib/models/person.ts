import { z } from 'zod';

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  lastContact: z.string().optional(),
  socials: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Person = z.infer<typeof PersonSchema>;
