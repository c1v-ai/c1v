# Testing Standards & Guidelines

> **Version:** 1.0.0
> **Last Updated:** 2026-01-12

## Overview

This document defines testing standards for the C1V project. All code changes must include appropriate tests before merging.

---

## Test Coverage Requirements

### Minimum Coverage
- **Overall:** 80% code coverage
- **Critical paths:** 100% coverage (auth, payments, validation)
- **New features:** 90% coverage required
- **Bug fixes:** Must include regression test

### Coverage by Type
| Type | Minimum Coverage | Priority |
|------|-----------------|----------|
| Unit Tests | 85% | High |
| Integration Tests | 70% | High |
| E2E Tests | Critical flows only | Medium |

---

## Testing Strategy

### Test Pyramid

```
     /\
    /E2E\         <- Few (5-10 critical flows)
   /------\
  /Integr.\      <- Some (30-50 key integrations)
 /----------\
/ Unit Tests \   <- Many (hundreds of unit tests)
--------------
```

**Philosophy:** Write more unit tests, fewer integration tests, even fewer E2E tests.

---

## Unit Tests

### When to Write Unit Tests

Write unit tests for:
- ✅ Pure functions and utilities
- ✅ React components (logic and rendering)
- ✅ Custom hooks
- ✅ Validation logic
- ✅ Data transformations
- ✅ Business logic

### Unit Test Standards

**Framework:** Vitest
**React Testing:** React Testing Library
**Location:** Colocated with source files

```
src/
  lib/
    utils/
      format-date.ts
      format-date.test.ts    ← Unit test here
```

### Example: Testing a Utility Function

```typescript
// lib/utils/format-date.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// lib/utils/format-date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './format-date';

describe('formatDate', () => {
  it('formats date to YYYY-MM-DD', () => {
    const date = new Date('2026-01-12T10:30:00Z');
    expect(formatDate(date)).toBe('2026-01-12');
  });

  it('handles edge case: leap year', () => {
    const date = new Date('2024-02-29T00:00:00Z');
    expect(formatDate(date)).toBe('2024-02-29');
  });

  it('throws for invalid date', () => {
    const invalidDate = new Date('invalid');
    expect(() => formatDate(invalidDate)).toThrow();
  });
});
```

### Example: Testing a React Component

```typescript
// components/projects/project-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  const mockProject = {
    id: 1,
    name: 'Test Project',
    status: 'in_progress',
    validationScore: 75,
  };

  it('renders project name', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('shows validation score', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies correct status styling', () => {
    render(<ProjectCard project={mockProject} />);
    const card = screen.getByRole('article');
    expect(card).toHaveClass('status-in-progress');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={onClick} />);

    await userEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledWith(mockProject.id);
  });
});
```

### Unit Test Checklist

- [ ] Tests are isolated (no external dependencies)
- [ ] Tests are fast (<10ms each)
- [ ] Tests use descriptive names
- [ ] Tests cover happy path
- [ ] Tests cover edge cases
- [ ] Tests cover error scenarios
- [ ] Mocks are used for external dependencies
- [ ] Tests are deterministic (no flakiness)

---

## Integration Tests

### When to Write Integration Tests

Write integration tests for:
- ✅ API routes (request → response)
- ✅ Database operations (CRUD)
- ✅ Server actions
- ✅ Authentication flows
- ✅ Payment integration
- ✅ LangChain agent workflows

### Integration Test Standards

**Framework:** Vitest + Supertest (for API)
**Database:** Test database (PostgreSQL)
**Location:** `__tests__/integration/`

### Example: Testing an API Route

```typescript
// __tests__/integration/api/projects.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDatabase, cleanupTestDatabase } from '@/test-utils/db';
import { testApiRoute } from '@/test-utils/api';

describe('POST /api/projects', () => {
  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('creates a new project', async () => {
    const response = await testApiRoute('/api/projects', {
      method: 'POST',
      body: {
        name: 'Test Project',
        vision: 'Build something awesome',
      },
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: 'Test Project',
      vision: 'Build something awesome',
    });
  });

  it('validates required fields', async () => {
    const response = await testApiRoute('/api/projects', {
      method: 'POST',
      body: {}, // Missing required fields
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('name is required');
  });

  it('requires authentication', async () => {
    const response = await testApiRoute('/api/projects', {
      method: 'POST',
      body: { name: 'Test' },
      // No Authorization header
    });

    expect(response.status).toBe(401);
  });
});
```

### Example: Testing Database Operations

```typescript
// __tests__/integration/db/projects.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { createProject, getProject } from '@/lib/db/queries';

describe('Project Queries', () => {
  beforeEach(async () => {
    // Clean up before each test
    await db.delete(projects);
  });

  it('creates and retrieves project', async () => {
    const created = await createProject({
      name: 'Test Project',
      teamId: 1,
      vision: 'Test vision',
    });

    const retrieved = await getProject(created.id);

    expect(retrieved).toMatchObject({
      id: created.id,
      name: 'Test Project',
      vision: 'Test vision',
    });
  });

  it('enforces foreign key constraints', async () => {
    await expect(
      createProject({
        name: 'Test',
        teamId: 99999, // Non-existent team
        vision: 'Test',
      })
    ).rejects.toThrow('foreign key constraint');
  });
});
```

### Integration Test Checklist

- [ ] Tests use real database (test instance)
- [ ] Tests clean up after themselves
- [ ] Tests are isolated from each other
- [ ] Tests cover API contract
- [ ] Tests validate error responses
- [ ] Tests check authentication/authorization
- [ ] Tests verify database constraints

---

## End-to-End (E2E) Tests

### When to Write E2E Tests

Write E2E tests for:
- ✅ Critical user journeys
- ✅ Payment flows (Stripe)
- ✅ Authentication flows
- ✅ Project creation → artifact generation → export
- ❌ NOT for every feature (too slow/brittle)

### E2E Test Standards

**Framework:** Playwright
**Location:** `e2e/`
**Run Frequency:** Before release only

### Example: Testing Critical Flow

```typescript
// e2e/project-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Creation Flow', () => {
  test('user can create and view project', async ({ page }) => {
    // 1. Login
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Navigate to projects
    await page.goto('/dashboard/projects');
    await expect(page.locator('h1')).toContainText('Projects');

    // 3. Create new project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="name"]', 'E2E Test Project');
    await page.fill('textarea[name="vision"]', 'Test vision for E2E');
    await page.click('button:has-text("Create")');

    // 4. Verify redirect to project page
    await expect(page).toHaveURL(/\/dashboard\/projects\/\d+/);
    await expect(page.locator('h1')).toContainText('E2E Test Project');

    // 5. Verify project appears in list
    await page.goto('/dashboard/projects');
    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });
});
```

### E2E Test Checklist

- [ ] Tests critical user journeys only
- [ ] Tests are reliable (no flakiness)
- [ ] Tests clean up test data
- [ ] Tests use test environment
- [ ] Tests don't depend on each other
- [ ] Tests have descriptive names
- [ ] Screenshots on failure

---

## Test Organization

### File Structure

```
apps/product-helper/
├── app/
│   └── api/
│       └── projects/
│           ├── route.ts
│           └── route.test.ts          ← Unit test (API logic)
├── lib/
│   ├── db/
│   │   ├── queries.ts
│   │   └── queries.test.ts            ← Unit test
│   └── validators/
│       ├── prd-spec-validator.ts
│       └── prd-spec-validator.test.ts         ← Unit test
├── components/
│   └── projects/
│       ├── project-card.tsx
│       └── project-card.test.tsx      ← Unit test
├── __tests__/
│   ├── integration/
│   │   ├── api/
│   │   │   └── projects.test.ts       ← Integration test
│   │   └── db/
│   │       └── queries.test.ts        ← Integration test
│   └── setup.ts                        ← Test setup
└── e2e/
    ├── project-creation.spec.ts        ← E2E test
    └── payment-flow.spec.ts            ← E2E test
```

---

## Mocking Best Practices

### When to Mock

**DO Mock:**
- External APIs (OpenAI, Stripe)
- Database calls (in unit tests)
- Environment-specific services
- Time-dependent functions

**DON'T Mock:**
- Code you're testing
- Simple utilities
- Database (in integration tests)

### Mocking Examples

```typescript
// Mocking external API
import { vi } from 'vitest';
import * as openai from '@/lib/openai';

vi.mock('@/lib/openai', () => ({
  generateResponse: vi.fn().mockResolvedValue({
    content: 'Mocked response',
  }),
}));

// Mocking database
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    query: {
      projects: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          name: 'Mock Project',
        }),
      },
    },
  },
}));

// Mocking Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));
```

---

## Test Data Management

### Test Fixtures

Create reusable test fixtures:

```typescript
// test-utils/fixtures.ts
export const mockProject = {
  id: 1,
  name: 'Test Project',
  vision: 'Test vision',
  status: 'intake' as const,
  validationScore: 75,
  createdAt: new Date('2026-01-12'),
  updatedAt: new Date('2026-01-12'),
};

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
};

export const mockTeam = {
  id: 1,
  name: 'Test Team',
  planName: 'pro',
};
```

### Factory Functions

```typescript
// test-utils/factories.ts
export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    ...mockProject,
    ...overrides,
  };
}

// Usage
const project = createMockProject({ status: 'completed' });
```

---

## CI/CD Integration

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests on staged files
pnpm test:staged

# Run linting
pnpm lint-staged
```

### GitHub Actions

All tests run automatically on PR:
- Unit tests: Every PR
- Integration tests: Every PR
- E2E tests: Before merge to main

See [.github/workflows/test.yml](../../.github/workflows/test.yml) for configuration.

---

## Debugging Tests

### Running Specific Tests

```bash
# Run single test file
pnpm test src/lib/utils/format-date.test.ts

# Run tests matching pattern
pnpm test --grep "formatDate"

# Run in watch mode
pnpm test --watch

# Run with coverage
pnpm test --coverage
```

### Debugging in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test", "--run", "--inspect-brk", "--single-thread"],
  "console": "integratedTerminal"
}
```

---

## Test Maintenance

### Keeping Tests Green

1. **Fix Broken Tests Immediately:** Don't merge with failing tests
2. **Remove Flaky Tests:** If it's unreliable, either fix or remove
3. **Update Tests with Code:** When refactoring, update tests
4. **Regular Cleanup:** Remove obsolete tests

### Test Smells to Avoid

❌ **Slow Tests:** Unit tests should be <10ms
❌ **Flaky Tests:** Tests that sometimes pass/fail
❌ **Brittle Tests:** Break with minor changes
❌ **Unclear Tests:** Hard to understand what's being tested
❌ **Test Duplication:** Same thing tested multiple ways

---

## Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Tools
- [Testing Library Playground](https://testing-playground.com/)
- [Playwright Inspector](https://playwright.dev/docs/debug)

---

## Questions?

Ask in the team channel or create an issue with label `testing`.
