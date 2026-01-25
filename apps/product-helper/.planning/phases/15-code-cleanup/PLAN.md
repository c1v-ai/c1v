# Phase 15: Code Cleanup & Technical Debt

**Priority:** P1 - Maintainability & Security
**Created:** 2026-01-25
**Status:** PLANNED

---

## Overview

Comprehensive code review identified ~6,500 lines of duplicate code (~15-20% of codebase) and several security issues requiring remediation.

Additionally, migrate from OpenAI GPT-4o to **Claude 4.5** (Anthropic) for all LangChain agents.

---

## 15.0 Migrate to Claude 4.5 (Anthropic)

### Why Claude 4.5?
- Better structured output handling
- Improved reasoning for PRD extraction
- Cost optimization potential
- Unified with Claude Code tooling

### Installation

```bash
pnpm add @langchain/anthropic
```

### Environment Variable

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Add to `lib/config/env.ts`:**
```typescript
ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'Invalid Anthropic API key format'),
```

### Updated Config

**Replace `lib/langchain/config.ts`:**

```typescript
import { ChatAnthropic } from '@langchain/anthropic';

// Model options
export const CLAUDE_MODELS = {
  OPUS: 'claude-opus-4-5-20251101',      // Most capable, highest cost
  SONNET: 'claude-sonnet-4-5-20250514',  // Balanced (recommended)
} as const;

// Default model for agents
const DEFAULT_MODEL = CLAUDE_MODELS.SONNET;

/**
 * Standard LLM for structured output (agents)
 */
export const structuredLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.2,
  maxTokens: 4000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Streaming LLM for chat responses
 */
export const streamingLLM = new ChatAnthropic({
  modelName: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 2000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  streaming: true,
});

/**
 * Create a structured agent with Claude
 */
export function createClaudeAgent<T extends import('zod').ZodType>(
  schema: T,
  name: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: keyof typeof CLAUDE_MODELS;
  } = {}
) {
  const {
    temperature = 0.2,
    maxTokens = 4000,
    model = 'SONNET',
  } = options;

  const llm = new ChatAnthropic({
    modelName: CLAUDE_MODELS[model],
    temperature,
    maxTokens,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  return llm.withStructuredOutput(schema, { name });
}
```

### Files to Update

| File | Change |
|------|--------|
| `lib/langchain/config.ts` | Replace OpenAI with Claude (above) |
| `lib/langchain/agents/tech-stack-agent.ts` | Use `createClaudeAgent()` |
| `lib/langchain/agents/user-stories-agent.ts` | Use `createClaudeAgent()` |
| `lib/langchain/agents/schema-extraction-agent.ts` | Use `createClaudeAgent()` |
| `lib/langchain/agents/api-spec-agent.ts` | Use `createClaudeAgent()` |
| `lib/langchain/agents/infrastructure-agent.ts` | Use `createClaudeAgent()` |
| `lib/langchain/agents/guidelines-agent.ts` | Use `createClaudeAgent()` |
| `lib/langchain/agents/extraction-agent.ts` | Use `createClaudeAgent()` |
| `app/api/chat/projects/[projectId]/route.ts` | Use `streamingLLM` from config |
| `app/api/chat/route.ts` | Use `streamingLLM` from config |

### Agent Migration Example

**Before (OpenAI):**
```typescript
import { ChatOpenAI } from '@langchain/openai';

const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.2,
  maxTokens: 4000,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const structuredLLM = llm.withStructuredOutput(techStackSchema, {
  name: 'tech_stack_generator',
});
```

**After (Claude):**
```typescript
import { createClaudeAgent } from '@/lib/langchain/config';

const structuredLLM = createClaudeAgent(techStackSchema, 'tech_stack_generator', {
  temperature: 0.2,
  maxTokens: 4000,
});
```

### Multi-Tenant Data Isolation Note

Claude API calls are stateless. Data isolation is handled by your application:
- Each API call contains only ONE user's project data
- `teamId` checks in DB queries enforce tenant boundaries
- No conversation history crosses user boundaries
- Anthropic doesn't store/learn from API requests

---

## Critical Issues (Fix Immediately)

### 15.1 Security Fixes

| Task | File | Issue | Priority |
|------|------|-------|----------|
| **15.1.1** | `app/api/mcp/[projectId]/route.ts:96-100` | Race condition in rate limiting - `checkRateLimit()` called twice, counter incremented twice | CRITICAL |
| **15.1.2** | `middleware.ts:25` | Session only validated on GET requests - POST/PUT/DELETE can bypass expired sessions | CRITICAL |
| **15.1.3** | `app/(login)/actions.ts:335` | SQL template literal risk - use parameterized queries | HIGH |
| **15.1.4** | Multiple files | Missing env var validation - `process.env.STRIPE_SECRET_KEY!` etc. | HIGH |

### 15.2 Duplicate Hook Removal (Quick Win)

**Delete:** `hooks/use-media-query.ts`
**Keep:** `lib/hooks/use-media-query.ts` (has SSR safety check)
**Update:** `app/(dashboard)/projects/[id]/chat/chat-client.tsx:19` - change import path

```typescript
// FROM:
import { useIsDesktop, useIsMobile } from '@/hooks/use-media-query';
// TO:
import { useIsDesktop, useIsMobile } from '@/lib/hooks/use-media-query';
```

---

## High Priority Refactoring

### 15.3 API Auth Middleware (Eliminates ~2,200 lines)

**Create:** `lib/api/with-project-auth.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthContext {
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>;
  team: NonNullable<Awaited<ReturnType<typeof getTeamForUser>>>;
  projectId: number;
  project?: any; // Optional - only if withProject: true
}

interface WithProjectAuthOptions {
  withProject?: boolean;
  projectRelations?: string[];
}

type AuthHandler<T = any> = (
  req: NextRequest,
  context: AuthContext,
  params: T
) => Promise<NextResponse>;

export function withProjectAuth<T = { id: string }>(
  handler: AuthHandler<T>,
  options: WithProjectAuthOptions = {}
) {
  return async (
    req: NextRequest,
    { params }: { params: Promise<T> }
  ): Promise<NextResponse> => {
    try {
      // 1. Auth check
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 2. Team check
      const team = await getTeamForUser();
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      // 3. Parse project ID
      const resolvedParams = await params;
      const projectIdStr = (resolvedParams as any).id || (resolvedParams as any).projectId;
      const projectId = parseInt(projectIdStr, 10);

      if (isNaN(projectId) || projectId < 1) {
        return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
      }

      // 4. Optionally fetch project
      let project = undefined;
      if (options.withProject) {
        project = await db.query.projects.findFirst({
          where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
          with: options.projectRelations?.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
        });

        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
      }

      // 5. Call handler
      return handler(req, { user, team, projectId, project }, resolvedParams);
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  };
}
```

**Affected Routes (22 files):**
- `app/api/projects/[id]/route.ts`
- `app/api/projects/[id]/validate/route.ts`
- `app/api/projects/[id]/stories/route.ts`
- `app/api/projects/[id]/stories/[storyId]/route.ts`
- `app/api/projects/[id]/tech-stack/route.ts`
- `app/api/projects/[id]/api-spec/route.ts`
- `app/api/projects/[id]/infrastructure/route.ts`
- `app/api/projects/[id]/guidelines/route.ts`
- `app/api/projects/[id]/export/route.ts`
- `app/api/projects/[id]/exports/skill/route.ts`
- `app/api/projects/[id]/exports/claude-md/route.ts`
- `app/api/projects/[id]/keys/route.ts`
- `app/api/projects/[id]/keys/[keyId]/route.ts`
- `app/api/chat/projects/[projectId]/route.ts`
- `app/api/chat/projects/[projectId]/save/route.ts`
- Plus 7 more

### 15.4 Base Agent Factory (Eliminates ~1,500 lines)

**Create:** `lib/langchain/agents/base-agent.ts`

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  modelName?: string;
}

const DEFAULT_CONFIG: Required<AgentConfig> = {
  temperature: 0.2,
  maxTokens: 4000,
  modelName: 'gpt-4o',
};

export function createStructuredAgent<T extends z.ZodType>(
  schema: T,
  name: string,
  config: AgentConfig = {}
) {
  const { temperature, maxTokens, modelName } = { ...DEFAULT_CONFIG, ...config };

  const llm = new ChatOpenAI({
    modelName,
    temperature,
    maxTokens,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  return llm.withStructuredOutput(schema, { name });
}

export function createStreamingAgent(config: AgentConfig = {}) {
  const { temperature, maxTokens, modelName } = { ...DEFAULT_CONFIG, ...config };

  return new ChatOpenAI({
    modelName,
    temperature,
    maxTokens,
    openAIApiKey: process.env.OPENAI_API_KEY,
    streaming: true,
  });
}
```

**Refactor Files:**
- `lib/langchain/agents/tech-stack-agent.ts`
- `lib/langchain/agents/user-stories-agent.ts`
- `lib/langchain/agents/schema-extraction-agent.ts`
- `lib/langchain/agents/api-spec-agent.ts`
- `lib/langchain/agents/infrastructure-agent.ts`
- `lib/langchain/agents/guidelines-agent.ts`

### 15.5 Environment Validation

**Extend:** `lib/config/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),

  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Invalid OpenAI API key format'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format'),

  // App
  BASE_URL: z.string().url('BASE_URL must be a valid URL'),

  // Email (optional in dev)
  RESEND_API_KEY: z.string().optional(),

  // Feature flags
  USE_LANGGRAPH: z.enum(['true', 'false']).optional().default('false'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Environment validation failed');
  }

  return result.data;
}

export const env = validateEnv();
```

---

## Medium Priority

### 15.6 Fix Rate Limit Bug

**File:** `app/api/mcp/[projectId]/route.ts`

**Problem:** `checkRateLimit()` called twice (line 68 and line 97), incrementing counter twice.

**Fix:** Create read-only status function:

```typescript
// lib/mcp/rate-limit.ts - ADD:
export function getRateLimitStatus(keyPrefix: string): RateLimitResult | null {
  const entry = rateLimitStore.get(keyPrefix);
  if (!entry) return null;

  const now = Date.now();
  if (now > entry.resetAt) return null;

  return {
    allowed: entry.count < MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}

// app/api/mcp/[projectId]/route.ts - CHANGE line 96-100:
if (keyPrefix) {
  const status = getRateLimitStatus(keyPrefix);
  if (status) {
    Object.assign(headers, getRateLimitHeaders(status));
  }
}
```

### 15.7 Fix Middleware Session Validation

**File:** `middleware.ts`

**Change line 25 from:**
```typescript
if (sessionCookie && request.method === 'GET') {
```

**To:**
```typescript
if (sessionCookie) {
  try {
    const parsed = await verifyToken(sessionCookie.value);

    // Check expiration for ALL methods
    if (new Date(parsed.expires) < new Date()) {
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }

    // Only refresh session on GET to avoid mutation side effects
    if (request.method === 'GET') {
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
      res.cookies.set({
        name: 'session',
        value: await signToken({ ...parsed, expires: expiresInOneDay.toISOString() }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    }
  } catch (error) {
    // ...existing error handling
  }
}
```

### 15.8 Replace `any` Types in Validation

**File:** `app/api/projects/[id]/validate/route.ts:83-87`

**Replace:**
```typescript
actors: project.projectData?.actors as any,
useCases: project.projectData?.useCases as any,
```

**With:**
```typescript
import type { Actor, UseCase, SystemBoundaries, DataEntity } from '@/lib/db/schema/v2-types';

actors: (project.projectData?.actors ?? []) as Actor[],
useCases: (project.projectData?.useCases ?? []) as UseCase[],
systemBoundaries: (project.projectData?.systemBoundaries ?? { internal: [], external: [] }) as SystemBoundaries,
dataEntities: (project.projectData?.dataEntities ?? []) as DataEntity[],
```

---

## Low Priority

### 15.9 Remove TODOs

| File | Line | TODO | Action |
|------|------|------|--------|
| `lib/langchain/graphs/nodes/check-sr-cornell.ts` | 194 | Track out-of-scope separately | Create issue or implement |
| `lib/hooks/use-keyboard-shortcuts.ts` | 67 | Open command palette | Create issue for Phase 12 |
| `lib/hooks/use-keyboard-shortcuts.ts` | 83 | Open new project dialog | Create issue for Phase 12 |

### 15.10 Extract Magic Numbers

**Create:** `lib/constants/index.ts`

```typescript
export const TIME_CONSTANTS = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  SESSION_EXPIRY_HOURS: 24,
};

export const INFRASTRUCTURE_COSTS = {
  VERCEL: { min: 20, max: 100 },
  AWS: { min: 50, max: 500 },
  GCP: { min: 50, max: 500 },
  AZURE: { min: 50, max: 500 },
  RAILWAY: { min: 5, max: 50 },
  RENDER: { min: 7, max: 85 },
};

export const SCORING = {
  ACTOR_SCORE: { MULTIPLE: 25, SINGLE: 12 },
  USE_CASE_SCORE: { FIVE_PLUS: 35, THREE_PLUS: 25 },
};

export const TOKEN_ESTIMATION = {
  AVG_CHARS_PER_TOKEN: 4,
};
```

---

## Execution Plan

### Wave 1: Quick Wins (1 hour)
- [ ] 15.2 Delete duplicate hook, update import
- [ ] 15.6 Fix rate limit bug
- [ ] 15.7 Fix middleware session validation

### Wave 2: Security (2 hours)
- [ ] 15.5 Add comprehensive env validation
- [ ] 15.8 Replace `any` types

### Wave 3: Major Refactoring (4-6 hours)
- [ ] 15.3 Create API auth middleware
- [ ] 15.3b Refactor 5 routes as proof of concept
- [ ] 15.4 Create base agent factory
- [ ] 15.4b Refactor 2 agents as proof of concept

### Wave 4: Cleanup (2 hours)
- [ ] 15.9 Address TODOs
- [ ] 15.10 Extract magic numbers
- [ ] Run tests to verify no regressions

---

## Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Duplicate lines | ~6,500 | ~1,500 |
| API route avg length | 80 lines | 30 lines |
| Agent file avg length | 450 lines | 200 lines |
| Security vulnerabilities | 4 | 0 |
| `any` type usages | 12+ | 0 |

---

## Testing Requirements

1. Run full test suite after each wave
2. Manual test auth flows (sign in, sign out, session expiry)
3. Manual test MCP endpoint rate limiting
4. Verify all API routes return correct responses
