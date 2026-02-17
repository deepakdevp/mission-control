import { z } from 'zod';

export const ApprovalSchema = z.object({
  id: z.string(),
  type: z.enum(['file_delete', 'api_call', 'deployment', 'custom']),
  request: z.string(),
  context: z.record(z.string(), z.any()).optional(),
  status: z.enum(['pending', 'approved', 'denied']),
  createdAt: z.string(),
  respondedAt: z.string().optional(),
  response: z.string().optional(),
});

export type Approval = z.infer<typeof ApprovalSchema>;
