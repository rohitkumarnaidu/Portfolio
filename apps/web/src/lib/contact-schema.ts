import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  // Trim before validating: `.trim()` on a format schema runs after the check,
  // so a padded address would be rejected even though the form trims it.
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email({ error: 'Please enter a valid email address' })),
  subject: z.string().trim().max(500).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
