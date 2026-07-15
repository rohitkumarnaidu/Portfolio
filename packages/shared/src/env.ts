import { z } from 'zod';

// ── Environment Variable Validation ─────────────────────────

export const EnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Only required on server
  SUPABASE_DB_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  // Site Config
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // AI Service
  AI_API_URL: z.string().url().default('http://localhost:8000'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Node Env
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('3001'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Validates the environment variables against the schema.
 * Throws an error with details if validation fails.
 */
export function validateEnv(env: Record<string, string | undefined>): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }
  return result.data;
}
