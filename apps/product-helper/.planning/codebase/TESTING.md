# Testing Patterns

**Analysis Date:** 2026-02-08

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
pnpm test:lighthouse       # Lighthouse performance audit
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
app/
  api/
    projects/
      [id]/
        api-spec/
          __tests__/
            route.test.ts
        guidelines/
          __tests__/
            route.test.ts
        infrastructure/
          __tests__/
            route.test.ts
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
    user.json                # Stored auth state (generated, not committed)
  auth.setup.ts              # Global auth setup (runs once)
  auth.spec.ts               # Auth flow tests (unauthenticated)
  smoke.spec.ts              # Infrastructure smoke tests
  projects.spec.ts           # Project CRUD and navigation tests
  chat.spec.ts               # Chat interaction tests
  responsive.spec.ts         # Responsive layout tests
  layout.spec.ts             # Layout structure tests
  content-views.spec.ts      # Content view tests
  accessibility.spec.ts      # WCAG 2.1 AA, keyboard nav, ARIA, focus indicators
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
    jest.clearAllMocks();
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

// API route test helper
function createMockRequest(url: string, method: string = 'GET'): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), { method });
}
```

**Golden Test Pattern:**
The codebase uses "golden test scenarios" -- named, documented end-to-end scenarios that validate real-world usage patterns:

```typescript
describe('golden test scenarios', () => {
  /**
   * Golden Test: Basic SaaS App
   * User says "That's enough for now" after providing data
   */
  it('should recognize stop trigger in golden test scenario', () => {
    const userResponse = "That's enough for now";
    expect(containsStopTrigger(userResponse)).toBe(true);
  });

  /**
   * Golden Test: E-commerce Platform
   * User says "Generate the context diagram" to request artifact
   */
  it('should recognize artifact request in golden test scenario', () => {
    const userResponse = 'Generate the context diagram';
    expect(containsStopTrigger(userResponse)).toBe(true);
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
jest.mock('@/lib/db/queries', () => ({
  getUser: jest.fn(),
  getTeamForUser: jest.fn(),
}));

jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: {
      projects: { findFirst: jest.fn() },
    },
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
  },
}));
```

**Agent Mocking:**
```typescript
jest.mock('@/lib/langchain/agents/api-spec-agent', () => ({
  generateAPISpecification: jest.fn(),
  validateAPISpecification: jest.fn(() => ({ valid: true, errors: [] })),
}));
```

**Type-Safe Mock Access:**
```typescript
const mockedGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockedFindFirst = db.query.projects.findFirst as jest.MockedFunction<typeof db.query.projects.findFirst>;

// In beforeEach:
mockedGetUser.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);
mockedFindFirst.mockResolvedValue(mockProject as any);
```

**Module Mock Import Order (CRITICAL):**
Mocks must be declared BEFORE the modules that use them are imported:
```typescript
// 1. Declare mocks
jest.mock('@/lib/db/drizzle', () => ({ ... }));
jest.mock('@/lib/db/schema', () => ({ ... }));

// 2. Import handlers AFTER mocks
import { GET, POST } from '../route';
import { getUser } from '@/lib/db/queries';
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
- String utility functions

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

// Sample API specification for testing
const mockAPISpec: APISpecification = {
  baseUrl: '/api/v1',
  version: '1.0.0',
  authentication: { type: 'bearer', ... },
  endpoints: [{ path: '/users', method: 'GET', ... }],
  ...
};

// Mock project data
const mockProject = {
  id: 1,
  name: 'Test Project',
  vision: 'A test project vision',
  teamId: 1,
  projectData: { ... },
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

export const BREAKPOINTS = {
  sm: 640,
  md: 768,   // Chat panel visible
  lg: 1024,  // Explorer sidebar visible
  xl: 1280,
  '2xl': 1536,
} as const;
```

## Custom E2E Assertion Helpers

**Location:** `tests/e2e/helpers/assertions.ts`

```typescript
// Assert no severe console errors (ignoring known benign warnings)
export async function expectNoConsoleErrors(page: Page) { ... }

// Assert no horizontal overflow (no unwanted horizontal scrollbar)
export async function expectNoHorizontalScroll(page: Page) { ... }

// Assert minimum touch target size (44x44px per Apple HIG)
export async function expectAdequateTouchTarget(page: Page, selector: string, minSize = 44) { ... }

// Wait for network to be idle
export async function waitForNetworkIdle(page: Page, timeout = 5000) { ... }
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

**Coverage scope:** Only `lib/` directory is measured. Components (`components/`) and API routes (`app/api/`) are NOT included in coverage metrics -- they are covered by E2E tests instead.

## Test Types

**Unit Tests (Jest):**
- Scope: Pure functions, scoring logic, state management, routing decisions, utility functions, MCP auth/server
- Location: `lib/**/__tests__/*.test.ts` and `app/api/**/__tests__/*.test.ts`
- Count: ~16 test files with ~456 tests (per CLAUDE.md)
- Do NOT require running services or API keys
- Focus on logic, not integration

**Integration Tests (Jest, within unit test files):**
- Tests that exercise multiple modules together but still mock external deps
- Example: `lib/langchain/graphs/__tests__/intake-graph.test.ts` tests edge routing across the full graph flow
- Example: `app/api/projects/[id]/api-spec/__tests__/route.test.ts` tests full route handler with mocked DB and agents
- Still use Jest, co-located in `__tests__/` directories

**E2E Tests (Playwright):**
- Scope: Full browser-based user flows
- Location: `tests/e2e/*.spec.ts`
- Count: 10 spec files
- Requires running dev server (auto-started by Playwright via `npm run dev`)
- Requires seeded test database with test user
- Auth setup runs once, state reused across authenticated tests

**Accessibility Tests (Playwright + axe-core):**
- WCAG 2.1 AA compliance scans on sign-in, sign-up, projects, project detail pages
- Keyboard navigation tab order verification
- Focus indicator visibility checks
- ARIA label accessibility verification
- Form error announcement validation
- Skip-to-content link check

**Playwright Browser Projects:**
- `auth-setup` -- runs first, saves storage state
- `unauthenticated` -- auth flow tests (Desktop Chrome, no stored state)
- `chromium` -- Desktop Chrome (authenticated, depends on auth-setup)
- `firefox` -- Desktop Firefox (authenticated)
- `webkit` -- Desktop Safari (authenticated)
- `Mobile Chrome` -- Pixel 5 (authenticated)
- `Mobile Safari` -- iPhone 12 (authenticated)
- `Mobile Safari (landscape)` -- iPhone 12 landscape (authenticated)
- `iPad` -- iPad gen 7 (authenticated)

**Playwright Timeouts:**
- Test timeout: 60s
- Navigation timeout: 30s
- Action timeout: 15s
- Web server startup timeout: 120s

**Playwright CI vs Local:**
- CI: `forbidOnly: true`, retries: 2, workers: 1, reporters: HTML + GitHub
- Local: no retries, parallel workers, reporter: HTML
- Screenshots on failure, traces on first retry

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

  async signInAndWait(email: string, password: string) {
    await this.signIn(email, password);
    await this.page.waitForURL('**/projects**', { timeout: 60000, waitUntil: 'commit' });
  }
}
```

**Custom Playwright Fixtures (`tests/e2e/fixtures/base.ts`):**
```typescript
import { test as base } from '@playwright/test';
import { SignInPage, ProjectsPage, ProjectDetailPage, ChatPanelPage, DashboardPage } from '../pages';

type Fixtures = {
  // Unauthenticated page objects (for testing auth flows)
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  // Authenticated page objects (use stored auth state)
  dashboardPage: DashboardPage;
  projectsPage: ProjectsPage;
  projectDetailPage: ProjectDetailPage;
  chatPanelPage: ChatPanelPage;
};

export const test = base.extend<Fixtures>({
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  // ... etc
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

**API Route Testing:**
```typescript
describe('GET /api/projects/[id]/api-spec', () => {
  it('should return 401 if user is not authenticated', async () => {
    mockedGetUser.mockResolvedValue(null as any);
    const request = createMockRequest('/api/projects/1/api-spec');
    const response = await GET(request, { params: mockParams });
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return existing API spec in JSON format', async () => {
    mockedFindFirst.mockResolvedValue({ ...mockProject, ... } as any);
    const request = createMockRequest('/api/projects/1/api-spec');
    const response = await GET(request, { params: mockParams });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.apiSpecification).toEqual(mockAPISpec);
  });
});
```

**E2E Graceful Skip Pattern:**
When tests depend on data that may not exist, skip gracefully:
```typescript
test('clicking a project card navigates to project detail page', async ({ projectsPage, page }) => {
  await projectsPage.goto();
  const projectCount = await projectsPage.getProjectCount();
  if (projectCount === 0) {
    test.skip();
    return;
  }
  // ... test logic
});
```

**E2E Accessibility Testing:**
```typescript
import AxeBuilder from '@axe-core/playwright';

test('projects list page has no WCAG 2.1 AA violations', async ({ projectsPage }) => {
  await projectsPage.goto();
  const results = await new AxeBuilder({ page: projectsPage.page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations.length).toBe(0);
});
```

## Adding New Tests

**New unit test for a `lib/` module:**
1. Create `lib/[module]/__tests__/[name].test.ts`
2. Import from `@jest/globals`: `import { describe, it, expect } from '@jest/globals'`
3. Mock external deps with `jest.mock()` BEFORE importing the module under test
4. Define test helpers locally (not exported)
5. Follow the section separator pattern with `// ============================================================`
6. Include edge cases: empty string, null/undefined, whitespace
7. Use `beforeEach` with `jest.clearAllMocks()` to reset state

**New API route test:**
1. Create `app/api/[domain]/[id]/[feature]/__tests__/route.test.ts`
2. Mock `@/lib/db/queries` (getUser, getTeamForUser)
3. Mock `@/lib/db/drizzle` (db.query, db.update, etc.)
4. Mock agent functions if route calls them
5. Import route handlers AFTER all mocks
6. Test auth (401), team not found (404), invalid ID (400), not found (404), success (200)
7. Use `createMockRequest()` helper for request creation
8. Use async `Promise.resolve({ id: '1' })` for params (Next.js 15 pattern)

**New E2E test:**
1. Create `tests/e2e/[feature].spec.ts`
2. Import `{ test, expect }` from `'./fixtures/base'` for authenticated tests
3. Import from `'@playwright/test'` for unauthenticated tests
4. Create page object in `tests/e2e/pages/[page].page.ts` if needed
5. Add to barrel export in `tests/e2e/pages/index.ts`
6. Register in fixtures (`tests/e2e/fixtures/base.ts`) if page object is needed
7. Use test data builders from `tests/e2e/helpers/test-data.ts`
8. Handle missing data gracefully with `test.skip()` pattern

---

*Testing analysis: 2026-02-08*
