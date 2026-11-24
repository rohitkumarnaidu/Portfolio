import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email({ error: 'Please enter a valid email address' }).max(254),
  subject: z.string().trim().max(500).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
