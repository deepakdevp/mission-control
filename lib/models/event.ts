import { z } from 'zod';

export const EventSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  start: z.string(), // ISO date string
  end: z.string(), // ISO date string
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Event = z.infer<typeof EventSchema>;
