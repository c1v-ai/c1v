# Phase 02: Critical Security Fixes - Research

**Researched:** 2026-01-19
**Domain:** Application Security (Data Exposure, Database Security, Environment Validation)
**Confidence:** HIGH

## Summary

This research covers three critical security fixes for the product-helper application:

1. **Password hash exposure** - The `/api/user` endpoint currently returns the full user object including `passwordHash`, which is a critical security vulnerability. The fix is straightforward: destructure and exclude the sensitive field before returning.

2. **Database SSL configuration** - The current `lib/db/drizzle.ts` uses postgres-js without SSL configuration. Production environments should always use SSL to encrypt database connections. The postgres-js library supports SSL configuration directly in the connection options.

3. **Environment variable validation** - The application has no centralized startup validation for critical secrets. If `AUTH_SECRET` is missing or weak, JWT signing will fail silently or use an insecure key. Zod is already installed and should be used to validate environment variables at application startup.

**Primary recommendation:** Use the existing patterns in this codebase (Zod for validation, object destructuring for filtering) to address all three issues with minimal complexity.

## Standard Stack

The codebase already has everything needed for these security fixes.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | 3.24.4 | Schema validation | Already used throughout codebase for input validation |
| postgres | 3.4.5 | PostgreSQL client | Already the database driver, supports SSL natively |
| drizzle-orm | 0.43.1 | ORM | Already integrated, no changes needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | 16.5.0 | Env loading | Already used in drizzle.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual Zod validation | t3-env | More structure but adds dependency; manual Zod is sufficient for 3 vars |
| next.config.ts validation | instrumentation.ts | instrumentation.ts doesn't run during `next build`; use next.config.ts import |

**No new dependencies required** - all fixes use existing libraries.

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── config/
│   └── env.ts          # NEW: Environment validation schema
├── db/
│   └── drizzle.ts      # MODIFY: Add SSL + pooling config
└── auth/
    └── session.ts      # No changes needed
app/
└── api/
    └── user/
        └── route.ts    # MODIFY: Filter passwordHash
```

### Pattern 1: Object Destructuring for Field Filtering
**What:** Use destructuring to exclude sensitive fields from API responses
**When to use:** Whenever returning database objects that contain sensitive data
**Example:**
```typescript
// Source: Codebase pattern from ROADMAP-1.1.md
export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json(null);
  }
  const { passwordHash, ...safeUser } = user;
  return Response.json(safeUser);
}
```

### Pattern 2: Zod Environment Schema
**What:** Define a strict schema for environment variables and validate at import time
**When to use:** For critical application secrets that must be present and valid
**Example:**
```typescript
// Source: Codebase pattern from .claude/skills/security-patterns.md (lines 279-294)
import { z } from 'zod';

const envSchema = z.object({
  POSTGRES_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),
});

export const env = envSchema.parse(process.env);
```

### Pattern 3: Conditional SSL Configuration
**What:** Enable SSL in production, disable in development
**When to use:** Database connections in multi-environment deployments
**Example:**
```typescript
// Source: Web search - postgres-js SSL patterns
import postgres from 'postgres';

const ssl = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }  // Strict verification
  : undefined;

export const client = postgres(process.env.POSTGRES_URL!, {
  ssl,
  max: 10,  // Connection pool size
  idle_timeout: 20,  // Seconds before idle connection is closed
  connect_timeout: 10,  // Seconds to wait for connection
});
```

### Anti-Patterns to Avoid
- **Returning full DB objects:** Always filter sensitive fields before API response
- **Using `ssl: { rejectUnauthorized: false }`:** Defeats the purpose of SSL, allows MITM attacks
- **Validating env vars in multiple places:** Centralize in one module, import elsewhere
- **Logging environment values:** Log presence/validity, never actual values

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Env validation | Custom if/throw checks | Zod schema | Type inference, detailed errors, already in codebase |
| SSL certificates | Manual cert loading | postgres-js ssl option | Library handles cert negotiation |
| Field filtering | Manual delete statements | Object destructuring | Immutable, TypeScript-friendly |

**Key insight:** The codebase already has the patterns and libraries needed. The fix is applying them consistently, not adding new complexity.

## Common Pitfalls

### Pitfall 1: Forgetting passwordHash in Other Queries
**What goes wrong:** Fixing `/api/user` but other endpoints still return passwordHash via joins/relations
**Why it happens:** The `users` table is joined in multiple places
**How to avoid:**
- Check `getTeamForUser()` - already filters to `id, name, email` (line 116-118 in queries.ts)
- Check any new endpoints that return user data
**Warning signs:** TypeScript will warn if you try to access `passwordHash` on a filtered object

### Pitfall 2: SSL Breaking Local Development
**What goes wrong:** Enabling SSL unconditionally breaks `localhost` connections
**Why it happens:** Local Postgres doesn't have SSL configured by default
**How to avoid:** Use `process.env.NODE_ENV === 'production'` conditional
**Warning signs:** "self signed certificate" or "SSL connection required" errors locally

### Pitfall 3: Environment Validation Timing
**What goes wrong:** Validation runs too late (on first request) instead of at startup
**Why it happens:** Next.js lazy-loads modules; validation in a route only runs on request
**How to avoid:** Import the validation module in `next.config.ts` or use the `register()` function in `instrumentation.ts`
**Warning signs:** App starts successfully but fails on first request due to missing env vars

### Pitfall 4: Connection Pool Exhaustion
**What goes wrong:** "remaining connection slots are reserved" errors under load
**Why it happens:** Too many connections, not enough pool management
**How to avoid:** Set reasonable `max` (10-20 for most apps), use `idle_timeout`
**Warning signs:** Sporadic connection errors during traffic spikes

### Pitfall 5: Weak AUTH_SECRET Accepted
**What goes wrong:** Short or predictable AUTH_SECRET allows JWT forgery
**Why it happens:** No length/entropy validation
**How to avoid:** Require minimum 32 characters, recommend 64
**Warning signs:** AUTH_SECRET under 32 chars in production

## Code Examples

Verified patterns from official sources and codebase:

### Task 2.1: Filter passwordHash from /api/user
```typescript
// File: app/api/user/route.ts
// Source: Existing pattern in ROADMAP-1.1.md line 57
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json(null);
  }
  // SECURITY: Never expose password hash
  const { passwordHash, ...safeUser } = user;
  return Response.json(safeUser);
}
```

### Task 2.2: Database SSL and Connection Pooling
```typescript
// File: lib/db/drizzle.ts
// Source: postgres-js docs + Drizzle ORM best practices (https://orm.drizzle.team/docs/get-started-postgresql)
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/lib/config/env';

// SSL configuration - strict in production, disabled for local dev
const ssl = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }
  : undefined;

// Connection pooling configuration
export const client = postgres(env.POSTGRES_URL, {
  ssl,
  max: 10,              // Maximum connections in pool
  idle_timeout: 20,     // Close idle connections after 20s
  connect_timeout: 10,  // Timeout for new connections
});

export const db = drizzle(client, { schema });
```

### Task 2.3: Environment Variable Validation
```typescript
// File: lib/config/env.ts
// Source: Codebase pattern from .claude/skills/security-patterns.md
import { z } from 'zod';

const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),

  // Authentication - must be strong
  AUTH_SECRET: z.string()
    .min(32, 'AUTH_SECRET must be at least 32 characters for security'),

  // AI Services
  OPENAI_API_KEY: z.string()
    .startsWith('sk-', 'OPENAI_API_KEY must be a valid OpenAI key starting with sk-'),

  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and export - throws descriptive error if invalid
export const env = envSchema.parse(process.env);

// Type export for use elsewhere
export type Env = z.infer<typeof envSchema>;
```

### Importing Validation in next.config.ts
```typescript
// File: next.config.ts
// Source: GitHub discussion on startup validation
import type { NextConfig } from 'next';

// Validate environment at build/start time
import '@/lib/config/env';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true
  }
};

export default nextConfig;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual env checks | Zod schema validation | 2023+ | Type-safe, better errors |
| `ssl: true` | `ssl: { rejectUnauthorized: true }` | Always | Explicit verification |
| Global postgres client | Connection pooling | postgres-js v3+ | Better resource management |

**Deprecated/outdated:**
- `ssl: { rejectUnauthorized: false }`: Never use in production - allows MITM attacks
- Environment validation via `instrumentation.ts`: Doesn't run during `next build`, use next.config.ts

## Open Questions

Things that couldn't be fully resolved:

1. **Railway/Vercel SSL Configuration**
   - What we know: Railway uses self-signed certs requiring `ssl: "require"` instead of `ssl: true`
   - What's unclear: Exact production deployment target for this app
   - Recommendation: Use `ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined` as default; document override for Railway

2. **Additional Environment Variables**
   - What we know: STRIPE_SECRET_KEY, RESEND_API_KEY exist in .env.example
   - What's unclear: Whether these should be validated at startup or lazy-loaded
   - Recommendation: Add to schema but mark as optional for MVP; required vars are AUTH_SECRET, OPENAI_API_KEY, POSTGRES_URL per roadmap

## Sources

### Primary (HIGH confidence)
- **Codebase Analysis:** `app/api/user/route.ts`, `lib/db/drizzle.ts`, `lib/db/queries.ts`, `.env.example`
- **Codebase Skills:** `.claude/skills/security-patterns.md` - existing Zod env validation pattern
- **Drizzle ORM Docs:** https://orm.drizzle.team/docs/get-started-postgresql - postgres-js setup

### Secondary (MEDIUM confidence)
- **postgres-js SSL:** https://github.com/drizzle-team/drizzle-orm/discussions/881 - SSL configuration patterns
- **Best Practices Guide:** https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717 - Drizzle ORM PostgreSQL Best Practices 2025

### Tertiary (LOW confidence)
- **Next.js Env Validation:** https://github.com/vercel/next.js/discussions/79536 - Timing issues with validation (verify approach works)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, using existing libraries
- Architecture: HIGH - Patterns already exist in codebase
- Pitfalls: HIGH - Based on verified issues and codebase analysis

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - stable patterns, no fast-moving dependencies)
