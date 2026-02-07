# Testing Patterns

**Analysis Date:** 2026-02-06

## Test Framework

**Unit Test Runner:**
- Jest 30.2.0
- Config: `jest.config.ts`
- Transform: ts-jest 29.4.6

**E2E Runner:**
- Playwright 1.57.0
- Config: `playwright.config.ts`

**Assertion Library:**
- Jest: `@jest/globals` (`describe`, `it`, `expect`, `jest`, `beforeEach`)
- Playwright: `@playwright/test` (`test`, `expect`)

**Run Commands:**
```bash
pnpm test                  # Run all unit tests (Jest)
pnpm test:watch            # Watch mode
pnpm test:coverage         # Coverage report
pnpm test:e2e              # All E2E tests (Playwright)
pnpm test:e2e:ui           # E2E with Playwright UI
pnpm test:e2e:mobile       # Mobile device E2E tests
pnpm test:e2e:desktop      # Desktop browser E2E tests
```

## Test File Organization

**Unit Tests:**
- Co-located `__tests__/` directories next to source files
- Pattern: `lib/[module]/__tests__/[module].test.ts`

```
lib/
  mcp/
    __tests__/
      auth.test.ts
      rate-limit.test.ts
      server.test.ts
    tools/
      core/
        __tests__/
          core-tools.test.ts
  langchain/
    __tests__/
      schemas.test.ts
    agents/
      __tests__/
        extraction-agent.test.ts
    graphs/
      __tests__/
        analyze-response.test.ts
        completion-detector.test.ts
        intake-graph.test.ts
        priority-scorer.test.ts
        state-manager.test.ts
  diagrams/
    __tests__/
      generators.test.ts
```

**E2E Tests:**
- Separate `tests/e2e/` directory at project root

```
tests/e2e/
  fixtures/
    base.ts                  # Custom Playwright fixtures (page objects)
  helpers/
    test-data.ts             # Test data builders and constants
    assertions.ts            # Custom assertion helpers
    index.ts                 # Barrel export
  pages/
    sign-in.page.ts          # Page Object: Sign In
    sign-up.page.ts          # Page Object: Sign Up
    projects.page.ts         # Page Object: Projects list
    project-detail.page.ts   # Page Object: Project detail
    chat-panel.page.ts       # Page Object: Chat panel
    dashboard.page.ts        # Page Object: Dashboard
    index.ts                 # Barrel export
  .auth/
    user.json                # Stored auth state (generated)
  auth.setup.ts              # Global auth setup (runs once)
  auth.spec.ts               # Auth flow tests (unauthenticated)
  smoke.spec.ts              # Infrastructure smoke tests
  projects.spec.ts           # Project CRUD tests
  chat.spec.ts               # Chat interaction tests
  responsive.spec.ts         # Responsive layout tests
  layout.spec.ts             # Layout structure tests
  content-views.spec.ts      # Content view tests
  accessibility.spec.ts      # a11y tests
  visual-regression.spec.ts  # Visual regression tests
  pwa.spec.ts                # PWA feature tests
```

## Unit Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ModuleName', () => {
  // Optional setup
  beforeEach(() => {
    clearState();
  });

  describe('functionName', () => {
    it('should do expected behavior', () => {
      const result = functionUnderTest(input);
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      expect(functionUnderTest('')).toBe(false);
    });
  });
});
```

**Section Separators in Tests:**
Use comment blocks to organize test sections:
```typescript
// ============================================================
// Mock Setup
// ============================================================

// ============================================================
// Test Helpers
// ============================================================

// ============================================================
// Function Under Test
// ============================================================

// ============================================================
// Golden Test Scenarios
// ============================================================
```

**Test Helpers:**
Define local helper functions at top of test file (not exported):
```typescript
function createTestState(overrides?: Partial<IntakeState>): IntakeState {
  const baseState = createInitialState(1, 'Test Project', 'A test vision', 1);
  return { ...baseState, ...overrides };
}

function createExtraction(data: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    actors: data.actors || [],
    useCases: data.useCases || [],
    systemBoundaries: data.systemBoundaries || { internal: [], external: [] },
    dataEntities: data.dataEntities || [],
  };
}
```

**Golden Test Pattern:**
The codebase uses "golden test scenarios" -- named, documented end-to-end scenarios that validate real-world usage patterns:

```typescript
describe('golden test scenarios', () => {
  /**
   * Golden Test: Basic SaaS App
   *
   * Vision: A project management tool for small teams
   * Conversation:
   * 1. "Team leads and developers will use it"
   * 2. "Integrates with GitHub and Slack"
   * 3. "That's enough for now"
   *
   * Expected: context_diagram ready, moving to use_case_diagram
   */
  describe('basic SaaS app scenario', () => {
    it('should extract actors from first message', () => { ... });
    it('should have context_diagram ready after conversation', () => { ... });
  });
});
```

## Mocking

**Framework:** Jest built-in mocking (`jest.mock()`, `jest.fn()`)

**Module Mocking (LLM/External Dependencies):**
```typescript
// Mock LangChain config to avoid requiring API keys at test time
jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: jest.fn().mockResolvedValue({}),
  }),
}));
```

**Database Mocking:**
```typescript
// Create mock query functions
const mockProjectsFindFirst = jest.fn();

// Mock the Drizzle client
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: {
      projects: { findFirst: mockProjectsFindFirst },
      projectData: { findFirst: mockProjectDataFindFirst },
    },
  },
}));

// Mock ORM operators
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((col, val) => ({ col, val })),
  and: jest.fn((...conditions) => conditions),
}));
```

**Schema Mocking:**
```typescript
jest.mock('@/lib/db/schema', () => ({
  projects: { id: 'projects.id' },
  projectData: { projectId: 'projectData.projectId' },
}));
```

**Module Mock Import Order (CRITICAL):**
Mocks must be declared BEFORE the modules that use them are imported:
```typescript
// 1. Declare mocks
jest.mock('@/lib/db/drizzle', () => ({ ... }));
jest.mock('@/lib/db/schema', () => ({ ... }));

// 2. Import handlers AFTER mocks
import { handler as getPrdHandler } from '../get-prd';
```

**What to Mock:**
- LLM/AI API calls (never call real LLM in unit tests)
- Database client (`lib/db/drizzle.ts`)
- External service SDKs (Stripe, Resend)
- Drizzle ORM operators (`eq`, `and`, `desc`, etc.)

**What NOT to Mock:**
- Pure functions (scoring, merging, validation logic)
- State creation/transformation functions
- Routing/edge functions in the LangGraph graph
- Zod schema validation

## Fixtures and Factories

**Unit Test Fixtures:**
```typescript
// Base extraction result factory
const baseExtraction: ExtractionResult = {
  actors: [],
  useCases: [],
  systemBoundaries: { internal: [], external: [] },
  dataEntities: [],
};

// Override with specific data
const withActors = {
  ...baseExtraction,
  actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
};
```

**E2E Test Data Builders (`tests/e2e/helpers/test-data.ts`):**
```typescript
// Unique data per test run (parallel-safe)
export function testUser(overrides?: { email?: string; password?: string }) {
  const id = uniqueId();
  return {
    email: overrides?.email ?? `test-${id}@e2e.local`,
    password: overrides?.password ?? `TestPass123!${id}`,
  };
}

export function testProject(overrides?: { name?: string; vision?: string }) {
  const id = uniqueId();
  return {
    name: overrides?.name ?? `E2E Test Project ${id}`,
    vision: overrides?.vision ?? `Automated test project created at ${new Date().toISOString()}`,
  };
}

// Well-known test credentials (must match seeded DB user)
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e@test.local',
  password: process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!',
};
```

**E2E Viewport Presets:**
```typescript
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 844, height: 390 },
  tablet: { width: 810, height: 1080 },
  desktop: { width: 1280, height: 720 },
  desktopWide: { width: 1920, height: 1080 },
} as const;
```

## Coverage

**Requirements:** 70% minimum enforced for all metrics (branches, functions, lines, statements)

**Configuration:**
```typescript
// jest.config.ts
collectCoverageFrom: [
  'lib/**/*.ts',
  'lib/**/*.tsx',
  '!lib/**/*.d.ts',
  '!lib/**/__tests__/**',
],
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
},
```

**View Coverage:**
```bash
pnpm test:coverage         # Generate coverage report
```

**Coverage scope:** Only `lib/` directory is measured. Components and API routes are NOT included in coverage metrics.

## Test Types

**Unit Tests (Jest):**
- Scope: Pure functions, scoring logic, state management, routing decisions, utility functions
- Location: `lib/**/\__tests__/*.test.ts`
- Count: ~16 test files with ~456 tests (per CLAUDE.md)
- Do NOT require running services or API keys
- Focus on logic, not integration

**Integration Tests (Jest, within unit test files):**
- Tests that exercise multiple modules together but still mock external deps
- Example: `intake-graph.test.ts` tests edge routing across the full graph flow
- Still use Jest, co-located in `__tests__/` directories

**E2E Tests (Playwright):**
- Scope: Full browser-based user flows
- Location: `tests/e2e/*.spec.ts`
- Count: 10 spec files
- Requires running dev server (auto-started by Playwright)
- Requires seeded test database with test user
- Auth setup runs once, state reused across authenticated tests

**Playwright Configuration:**
- 8 browser projects: auth-setup, unauthenticated, chromium, firefox, webkit, Mobile Chrome, Mobile Safari, Mobile Safari (landscape), iPad
- Auth state stored in `tests/e2e/.auth/user.json`
- Timeout: 60s per test, 30s navigation, 15s actions
- Screenshots on failure, traces on first retry
- CI: retries 2, single worker; Local: no retries, parallel workers

## E2E Page Object Pattern

**Page objects encapsulate locators and actions:**
```typescript
import type { Page, Locator } from '@playwright/test';

export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-500');
  }

  async goto() {
    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

**Custom Playwright Fixtures (`tests/e2e/fixtures/base.ts`):**
```typescript
import { test as base } from '@playwright/test';
import { SignInPage, ProjectsPage, DashboardPage } from '../pages';

type Fixtures = {
  signInPage: SignInPage;
  projectsPage: ProjectsPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
});
```

**Usage in specs:**
```typescript
import { test, expect } from './fixtures/base';

test('authenticated user can access projects page', async ({ projectsPage }) => {
  await projectsPage.goto();
  await expect(projectsPage.heading).toBeVisible();
});
```

## E2E Auth Setup

**Global auth setup runs once before all authenticated test suites:**
```typescript
// tests/e2e/auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/sign-in');
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/projects**', { timeout: 60000, waitUntil: 'commit' });
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
```

**Unauthenticated tests** import directly from `@playwright/test` (not from `./fixtures/base`) to avoid inheriting stored auth state.

## Common Patterns

**Async Testing:**
```typescript
it('should generate a key with correct format', async () => {
  const result = await generateApiKey(1);
  expect(result.key).toMatch(/^ph_00000001_[A-Za-z0-9_-]{24}$/);
  expect(result.hash.length).toBe(64);
});
```

**Error Testing:**
```typescript
it('should return null for invalid key', () => {
  expect(extractKeyPrefix('')).toBeNull();
  expect(extractKeyPrefix(null as unknown as string)).toBeNull();
});
```

**Edge Case Testing:**
```typescript
it('handles empty string', () => {
  expect(containsStopTrigger('')).toBe(false);
});

it('handles whitespace-only string', () => {
  expect(containsStopTrigger('   ')).toBe(false);
});
```

**State Transition Testing:**
```typescript
it('routes to generate_artifact for STOP_TRIGGER', () => {
  const state = createTestState({
    lastIntent: 'STOP_TRIGGER',
    isComplete: false,
  });
  const route = routeAfterValidation(state);
  expect(route).toBe('generate_artifact');
});
```

**Exhaustive Scenario Testing:**
Tests enumerate all possible states/inputs and verify correct behavior for each:
```typescript
it('routes to extract_data for STOP_TRIGGER', () => { ... });
it('routes to check_prd_spec for REQUEST_ARTIFACT', () => { ... });
it('routes to extract_data for PROVIDE_INFO when artifact not ready', () => { ... });
it('routes to check_prd_spec for PROVIDE_INFO when artifact ready', () => { ... });
it('routes to compute_next_question for DENY', () => { ... });
it('routes to extract_data for UNKNOWN', () => { ... });
```

## Adding New Tests

**New unit test for a `lib/` module:**
1. Create `lib/[module]/__tests__/[name].test.ts`
2. Import from `@jest/globals`: `import { describe, it, expect } from '@jest/globals'`
3. Mock external deps with `jest.mock()` BEFORE importing the module under test
4. Define test helpers locally (not exported)
5. Follow the section separator pattern with `// ============================================================`

**New E2E test:**
1. Create `tests/e2e/[feature].spec.ts`
2. Import `{ test, expect }` from `'./fixtures/base'` for authenticated tests
3. Import from `'@playwright/test'` for unauthenticated tests
4. Create page object in `tests/e2e/pages/[page].page.ts` if needed
5. Add to barrel export in `tests/e2e/pages/index.ts`
6. Use test data builders from `tests/e2e/helpers/test-data.ts`

---

*Testing analysis: 2026-02-06*
