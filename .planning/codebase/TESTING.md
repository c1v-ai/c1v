# Testing Patterns

**Analysis Date:** 2026-04-28

## Test Framework

**Unit Test Runner:**
- Jest 30.2.0
- Config: `jest.config.ts`
- Transform: ts-jest 29.4.6
- Environment: `node`

**E2E Runner:**
- Playwright 1.57.0
- Config: `playwright.config.ts`
- Accessibility: `@axe-core/playwright` 4.11.0

**Run Commands:**
```bash
pnpm test                  # Run all unit tests (Jest)
pnpm test:watch            # Watch mode
pnpm test:coverage         # Coverage report
pnpm test:e2e              # All E2E tests (Playwright)
pnpm test:e2e:ui           # E2E with Playwright UI
pnpm test:e2e:mobile       # Mobile device E2E tests
pnpm test:e2e:desktop      # Desktop browser E2E tests
pnpm test:lighthouse       # Lighthouse performance audit
```

## Test File Organization

**Unit Tests — dual location convention:**
- Co-located `__tests__/` directories next to source files: `lib/[module]/__tests__/[module].test.ts`
- App-root `__tests__/` for route/component/integration tests

```
lib/
  mcp/__tests__/auth.test.ts, rate-limit.test.ts, server.test.ts
  langchain/__tests__/schemas.test.ts
  langchain/agents/__tests__/extraction-agent.test.ts
  langchain/graphs/__tests__/analyze-response.test.ts, completion-detector.test.ts,
                              intake-graph.test.ts, priority-scorer.test.ts, state-manager.test.ts
  diagrams/__tests__/generators.test.ts
  engines/__tests__/           ← Wave E evaluator tests (13 green per tag b865abb)
app/api/projects/[id]/api-spec/__tests__/route.test.ts
app/api/projects/[id]/guidelines/__tests__/route.test.ts
app/api/projects/[id]/infrastructure/__tests__/route.test.ts
__tests__/build-all-headless.test.ts   ← Wave 4 artifact smoke suite (14 tests)
```

**E2E Tests:**
```
tests/e2e/
  fixtures/base.ts           # Custom Playwright fixtures (page objects)
  helpers/test-data.ts       # Test data builders and constants
  helpers/assertions.ts      # Custom assertion helpers
  pages/                     # Page Objects (sign-in, sign-up, projects, project-detail, chat-panel, dashboard)
  .auth/user.json            # Stored auth state (generated, gitignored)
  auth.setup.ts              # Global auth setup (runs once)
  auth.spec.ts, smoke.spec.ts, projects.spec.ts, chat.spec.ts
  responsive.spec.ts, layout.spec.ts, content-views.spec.ts
  accessibility.spec.ts      # WCAG 2.1 AA, keyboard nav, ARIA, focus indicators
  visual-regression.spec.ts
  pwa.spec.ts
```

**Verify scripts (not Jest):**
- `scripts/verify-{team}.ts` — exit-criteria gate runners (PASS/FAIL/WARN verdicts, CI-reusable)
- Teams covered: t3, t4a, t4b, t5, t6, t7, t11

## Unit Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ModuleName', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('functionName', () => {
    it('should do expected behavior', () => { ... });
    it('should handle edge case', () => { ... });
  });
});
```

**Section Separators:**
```typescript
// ============================================================
// Mock Setup
// ============================================================
```

## Mocking

**Module Mocking (LLM/External Dependencies):**
```typescript
jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: jest.fn().mockResolvedValue({}),
  }),
}));
```

**Database Mocking:**
```typescript
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: { projects: { findFirst: jest.fn() } },
    update: jest.fn(() => ({ set: jest.fn(() => ({ where: jest.fn() })) })),
  },
}));
```

**CRITICAL — Mock Import Order:**
Mocks must be declared BEFORE the modules that use them are imported:
```typescript
// 1. Declare mocks
jest.mock('@/lib/db/drizzle', () => ({ ... }));
// 2. Import handlers AFTER mocks
import { GET } from '../route';
```

**What to Mock:**
- LLM/AI API calls (never call real LLM in unit tests)
- Database client (`lib/db/drizzle.ts`)
- Database query functions (`lib/db/queries.ts`)
- External service SDKs (Stripe, Resend)
- Agent functions when testing API routes

**What NOT to Mock:**
- Pure functions (scoring, merging, validation logic)
- State creation/transformation functions
- Routing/edge functions in the LangGraph graph
- Zod schema validation

## Env Stub Pattern (CRITICAL)

`lib/config/env.ts` validates at import time — tests will fail without real-shaped stubs:

```bash
POSTGRES_URL=stub \
AUTH_SECRET=stubsecretstubsecretstubsecret32ch \
ANTHROPIC_API_KEY=sk-ant-stub \
STRIPE_SECRET_KEY=sk_test_stub \
STRIPE_WEBHOOK_SECRET=whsec_stub \
BASE_URL=http://localhost:3000 \
npx jest
```

All-`stub` recipe fails. `AUTH_SECRET` needs ≥32 chars, `ANTHROPIC_API_KEY` needs `sk-ant-` prefix.

## Coverage

**Requirements:** 70% minimum enforced for all metrics (branches, functions, lines, statements)

**Configuration:**
```typescript
collectCoverageFrom: ['lib/**/*.ts', 'lib/**/*.tsx', '!lib/**/*.d.ts', '!lib/**/__tests__/**'],
coverageThreshold: { global: { branches: 70, functions: 70, lines: 70, statements: 70 } },
```

**Coverage scope:** Only `lib/` directory is measured. Components and API routes are covered by E2E tests.

## DB Integration Tests

- `itDb` conditional helper — skips gracefully when local Supabase unreachable
- Local Supabase: Docker, port 54322

## Test Types

**Unit Tests (Jest):**
- Pure functions, scoring logic, state management, routing decisions, utility functions, MCP auth/server
- Do NOT require running services or API keys

**Integration Tests (Jest, co-located):**
- Multiple modules together but still mock external deps
- Example: `lib/langchain/graphs/__tests__/intake-graph.test.ts` — edge routing across full graph
- Example: `app/api/projects/[id]/api-spec/__tests__/route.test.ts` — full route with mocked DB and agents

**E2E Tests (Playwright):**
- Full browser-based user flows
- Requires running dev server (auto-started via `webServer` in playwright.config.ts)
- Requires seeded test database with test user
- Auth setup runs once, state reused across authenticated tests

**Accessibility Tests (Playwright + axe-core):**
- WCAG 2.1 AA compliance scans (sign-in, sign-up, projects, project detail)
- Keyboard navigation tab order verification
- ARIA label accessibility verification

**Playwright Browser Projects:**
- `auth-setup` → Desktop Chrome (no stored state, saves auth)
- `unauthenticated` → Desktop Chrome (auth flow tests)
- `chromium`, `firefox`, `webkit` → authenticated
- `Mobile Chrome` (Pixel 5), `Mobile Safari` (iPhone 12), `Mobile Safari (landscape)`, `iPad`

**Playwright Timeouts:**
- Test: 60s, Navigation: 30s, Action: 15s, Web server startup: 120s

## E2E Page Object Pattern

```typescript
export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
  }
  async signIn(email: string, password: string) { ... }
}
```

**Custom Fixtures (`tests/e2e/fixtures/base.ts`):**
```typescript
export const test = base.extend<Fixtures>({
  signInPage: async ({ page }, use) => { await use(new SignInPage(page)); },
  // ...
});
```

## Fixtures and Factories

**Unit Test Factories:**
```typescript
function createTestState(overrides?: Partial<IntakeState>): IntakeState {
  const baseState = createInitialState(1, 'Test Project', 'A test vision', 1);
  return { ...baseState, ...overrides };
}
```

**E2E Test Data Builders (`tests/e2e/helpers/test-data.ts`):**
```typescript
export function testUser(overrides?: { email?: string; password?: string }) {
  const id = uniqueId();
  return { email: `test-${id}@e2e.local`, password: `TestPass123!${id}`, ...overrides };
}
```

**E2E Graceful Skip:**
```typescript
if (projectCount === 0) { test.skip(); return; }
```

## Adding New Tests

**New unit test for `lib/` module:**
1. Create `lib/[module]/__tests__/[name].test.ts`
2. Import from `@jest/globals`
3. Mock external deps BEFORE importing module under test
4. Define test helpers locally (not exported)
5. Include edge cases: empty string, null/undefined, whitespace
6. Use `beforeEach` with `jest.clearAllMocks()`

**New API route test:**
1. Mock `@/lib/db/queries`, `@/lib/db/drizzle`, agent functions
2. Import route handlers AFTER all mocks
3. Test: 401, team not found 404, invalid ID 400, not found 404, success 200
4. Use `async Promise.resolve({ id: '1' })` for params (Next.js 15 pattern)

**New E2E test:**
1. Import `{ test, expect }` from `'./fixtures/base'` for authenticated tests
2. Create page object in `tests/e2e/pages/` if needed
3. Use test data builders from `tests/e2e/helpers/test-data.ts`
4. Handle missing data gracefully with `test.skip()` pattern

---

*Testing analysis: 2026-04-28*
