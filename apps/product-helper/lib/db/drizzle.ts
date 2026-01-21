import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/config/env';

// SSL configuration - strict verification in production, disabled for local dev
const ssl = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }
  : undefined;

// Connection pooling configuration
export const client = postgres(env.POSTGRES_URL, {
  ssl,
  max: 10,              // Maximum connections in pool
  idle_timeout: 20,     // Close idle connections after 20s
  connect_timeout: 10,  // Timeout for new connections (seconds)
});

export const db = drizzle(client, { schema });
