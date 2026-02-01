import { z } from 'zod';

const envSchema = z.object({
  // Database - required
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),

  // Authentication - must be strong
  AUTH_SECRET: z.string()
    .min(32, 'AUTH_SECRET must be at least 32 characters for security'),

  // AI Services - Anthropic Claude API
  ANTHROPIC_API_KEY: z.string()
    .min(1, 'ANTHROPIC_API_KEY is required')
    .refine(
      (key) => key.startsWith('sk-ant-'),
      'ANTHROPIC_API_KEY must start with "sk-ant-"'
    ),

  // Stripe Payment Integration - required for payment features
  STRIPE_SECRET_KEY: z.string()
    .min(1, 'STRIPE_SECRET_KEY is required')
    .refine(
      (key) => key.startsWith('sk_'),
      'STRIPE_SECRET_KEY must start with "sk_" (use sk_test_ for development)'
    ),

  STRIPE_WEBHOOK_SECRET: z.string()
    .min(1, 'STRIPE_WEBHOOK_SECRET is required')
    .refine(
      (key) => key.startsWith('whsec_'),
      'STRIPE_WEBHOOK_SECRET must start with "whsec_"'
    ),

  // Application URL - required for CORS and redirects
  BASE_URL: z.string()
    .min(1, 'BASE_URL is required')
    .url('BASE_URL must be a valid URL'),

  // Email - optional in development, required in production
  RESEND_API_KEY: z.string().optional(),

  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validates environment variables at startup.
 * Logs detailed errors and throws if validation fails.
 *
 * @returns Validated and typed environment object
 * @throws Error if required env vars are missing or invalid
 */
function validateEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n========================================');
    console.error('  Environment Variable Validation Failed');
    console.error('========================================\n');

    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      console.error(`  [${path}]: ${issue.message}`);
    });

    console.error('\n----------------------------------------');
    console.error('  Check your .env.local file and ensure');
    console.error('  all required variables are set.');
    console.error('  See .env.example for reference.');
    console.error('----------------------------------------\n');

    throw new Error(
      `Environment validation failed: ${result.error.issues.map((i) => i.path.join('.')).join(', ')}`
    );
  }

  return result.data;
}

// Validate at import time - app won't start if invalid
export const env = validateEnv();

// Type export for use elsewhere
export type Env = z.infer<typeof envSchema>;
