import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32).default('dev-jwt-secret-change-in-production-min-32-chars!!'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default('dev-refresh-secret-change-in-production-min-32!!'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: z.string().email().default('admin@portfolio.com'),
  ADMIN_PASSWORD: z.string().min(8).default('***REDACTED***'),
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CACHE_TTL: z.coerce.number().default(30),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  SENTRY_DSN: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),
  LOCKOUT_THRESHOLD: z.coerce.number().default(5),
  LOCKOUT_DURATION_MS: z.coerce.number().default(15 * 60 * 1000),
  EMAIL_FROM: z.string().default('noreply@portfolio.com'),
  ADMIN_NOTIFICATION_EMAIL: z.string().default('admin@portfolio.com'),
  AI_API_URL: z.string().default('http://localhost:8000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const config = registerAs('app', () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error(`Environment validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
});
