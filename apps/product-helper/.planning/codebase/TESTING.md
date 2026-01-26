# Testing Patterns

**Analysis Date:** 2025-01-25

## Test Framework

**Runner:**
- Jest 30.x for unit/integration tests
- Config: `jest.config.ts`

**Assertion Library:**
- `@jest/globals` (Jest's native expectations)

**E2E Framework:**
- Playwright 1.57.x
- Config: `playwright.config.ts`

**Run Commands:**
```bash
npm run test              # Run all Jest tests
npm run test:watch        # Jest watch mode
npm run test:coverage     # Jest with coverage report
npm run test:e2e          # Run all Playwright tests
npm run test:e2e:ui       # Playwright with UI mode
npm run test:e2e:mobile   # Mobile device projects only
npm run test:e2e:desktop  # Desktop browser projects only
```

## Test File Organization

**Location:**
- Unit tests: Co-located in `__tests__/` directories next to source
- E2E tests: Separate in `tests/e2e/` directory

**Naming:**
- Unit/integration: `*.test.ts`
- E2E: `*.spec.ts`

**Structure:**
```
lib/
├── langchain/
│   ├── __tests__/
│   │   └── schemas.test.ts
│   ├── graphs/
│   │   ├── __tests__/
│   │   │   ├── intake-graph.test.ts
│   │   │   ├── state-manager.test.ts
│   │   │   ├── completion-detector.test.ts
│   │   │   └── priority-scorer.test.ts
│   │   └── *.ts
│   └── schemas.ts
├── diagrams/
│   └── __tests__/
│       └── generators.test.ts
tests/
└── e2e/
    ├── responsive.spec.ts
    └── pwa.spec.ts
```

## Test Structure

**Suite Organization (Jest):**
```typescript
import { describe, it, expect } from '@jest/globals';

describe('ModuleName', () => {
  // Section separator for organization
  // ============================================================
  // Test Group Name
  // ============================================================

  describe('functionName', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      // ...
    });
  });
});
```

**Suite Organization (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.describe('Sub-feature', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // Device config

    test('should verify behavior', async ({ page }) => {
      await page.goto('/route');
      await expect(page.locator('selector')).toBeVisible();
    });
  });
});
```

**Patterns:**
- Use `describe` blocks to group related tests
- Section comments (`// ===`) for major test categories
- Test names start with `should` or describe expected behavior
- Arrange-Act-Assert pattern within test bodies

## Test Helpers

**Factory Functions:**
```typescript
/**
 * Create a test state with default values
 */
function createTestState(overrides?: Partial<IntakeState>): IntakeState {
  const baseState = createInitialState(1, 'Test Project', 'A test app', 1);
  return { ...baseState, ...overrides };
}

/**
 * Create extraction result with specified data
 */
function createExtraction(data: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    actors: data.actors || [],
    useCases: data.useCases || [],
    systemBoundaries: data.systemBoundaries || { internal: [], external: [] },
    dataEntities: data.dataEntities || [],
  };
}
```

**Location:**
- Defined at top of test file after imports
- Named `create*` for factories, `mock*` for mocks

## Mocking

**Framework:** Jest mocks (native)

**Patterns:**
```typescript
// Module-level mock (when needed)
// Note: Tests in this codebase focus on pure functions to minimize mocking

// Inline mock data
const mockActor = {
  name: 'Customer',
  role: 'Primary User',
  description: 'End user who purchases products',
  goals: ['Browse products', 'Make purchases'],
};

// Mock state for stateful tests
const state = createTestState({
  lastIntent: 'STOP_TRIGGER',
  artifactReadiness: {
    context_diagram: true,
    use_case_diagram: false,
    // ...
  },
});
```

**What to Mock:**
- External API calls (LLM, database in unit tests)
- Time-dependent functions
- Environment variables

**What NOT to Mock:**
- Pure functions being tested
- Type validation (Zod schemas)
- State computation logic

## Fixtures and Factories

**Test Data:**
```typescript
// Minimal valid data
function createMinimalExtraction(): ExtractionResult {
  return {
    actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
  };
}

// Complete/rich data
function createCompleteExtraction(): ExtractionResult {
  return {
    actors: [
      { name: 'Customer', role: 'Primary', description: 'Buys products' },
      { name: 'Seller', role: 'Primary', description: 'Sells products' },
      { name: 'Admin', role: 'Secondary', description: 'Manages platform' },
    ],
    useCases: [
      { id: 'UC1', name: 'Browse', description: '...', actor: 'Customer', ... },
      // ... more use cases
    ],
    // ...
  };
}
```

**Location:**
- Defined within test file, after imports
- Reusable factories at top of `describe` block

## Coverage

**Requirements:**
- Global threshold: 70% (branches, functions, lines, statements)
- Configured in `jest.config.ts`

**Coverage Scope:**
```typescript
collectCoverageFrom: [
  'lib/**/*.ts',
  'lib/**/*.tsx',
  '!lib/**/*.d.ts',
  '!lib/**/__tests__/**',
],
```

**View Coverage:**
```bash
npm run test:coverage
# Opens coverage/lcov-report/index.html
```

## Test Types

**Unit Tests:**
- Location: `lib/**/__tests__/*.test.ts`
- Scope: Individual functions, pure logic, type validation
- Focus: State computation, routing logic, schema validation
- Example: `schemas.test.ts`, `state-manager.test.ts`

**Integration Tests:**
- Location: `lib/**/__tests__/*.test.ts`
- Scope: Multi-node graph flows, full validation pipelines
- Focus: Edge routing, state transitions, artifact readiness
- Example: `intake-graph.test.ts`

**E2E Tests:**
- Location: `tests/e2e/*.spec.ts`
- Scope: Full user flows in browser
- Focus: Responsive design, PWA functionality, navigation
- Example: `responsive.spec.ts`, `pwa.spec.ts`

## Common Patterns

**Async Testing:**
```typescript
// Playwright async pattern
test('should handle async flow', async ({ page }) => {
  await page.goto('/route');
  await page.click('button');
  await expect(page.getByText('Success')).toBeVisible();
});

// Jest async pattern (when needed)
it('should resolve async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

**Error Testing:**
```typescript
it('should reject with invalid input', () => {
  const invalidInput = { name: 'Test' }; // missing required fields

  const result = schema.safeParse(invalidInput);

  expect(result.success).toBe(false);
});

it('should return error for unauthorized request', async ({ page }) => {
  const response = await page.goto('/api/projects');
  expect(response?.status()).toBe(401);
});
```

**Parameterized Tests:**
```typescript
describe('stop phrase detection', () => {
  const stopPhrases = ['no', 'nope', 'done', "that's enough"];

  stopPhrases.forEach((phrase) => {
    it(`detects "${phrase}"`, () => {
      expect(isStopPhrase(phrase)).toBe(true);
    });
  });
});
```

**Golden Tests:**
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
   * Expected: context_diagram ready
   */
  describe('basic SaaS app scenario', () => {
    it('should extract actors from first message', () => {
      // Test implementation
    });
  });
});
```

## Playwright Configuration

**Device Projects:**
```typescript
projects: [
  // Desktop browsers
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },

  // Mobile devices
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },

  // Tablet
  { name: 'iPad', use: { ...devices['iPad (gen 7)'] } },
]
```

**Web Server:**
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

**Test Settings:**
```typescript
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
}
```

## E2E Test Patterns

**Page Navigation:**
```typescript
test('should navigate to page', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveTitle(/Projects/);
});
```

**Element Assertions:**
```typescript
// Visibility
await expect(page.locator('nav.fixed.bottom-0')).toBeVisible();

// Role-based selection
const button = page.getByRole('button', { name: /menu/i });
await expect(button).toBeEnabled();

// Text content
await expect(page.getByText(/offline/i)).toBeVisible();
```

**Responsive Testing:**
```typescript
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('shows bottom navigation on mobile', async ({ page }) => {
    await page.goto('/projects');
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();
  });
});
```

---

*Testing analysis: 2025-01-25*
