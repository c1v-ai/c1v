import { z } from 'zod';

const envSchema = z.object({
  // Database - required
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),

  // Authentication - must be strong
  AUTH_SECRET: z.string()
    .min(32, 'AUTH_SECRET must be at least 32 characters for security'),

  // AI Services - must be valid format
  OPENAI_API_KEY: z.string()
    .startsWith('sk-', 'OPENAI_API_KEY must be a valid OpenAI key starting with sk-'),

  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and export - throws descriptive error if invalid
export const env = envSchema.parse(process.env);

// Type export for use elsewhere
export type Env = z.infer<typeof envSchema>;
