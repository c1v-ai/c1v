# Testing Strategies

Best practices for testing in the product-helper codebase using Vitest and React Testing Library.

## Test Organization

### File Structure
```
lib/
├── validators/
│   ├── sr-cornell.ts
│   └── __tests__/
│       └── sr-cornell.test.ts
├── langchain/
│   └── graphs/
│       ├── intake-graph.ts
│       └── __tests__/
│           ├── intake-graph.test.ts
│           └── nodes/
│               └── analyze-response.test.ts
components/
├── chat/
│   ├── chat-window.tsx
│   └── __tests__/
│       └── chat-window.test.tsx
```

### Test File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts` (in `/e2e` directory)

## Unit Testing

### Basic Test Structure
```typescript
// lib/validators/__tests__/sr-cornell.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { validateProject, ValidationResult } from '../sr-cornell';

describe('SR-CORNELL Validator', () => {
  describe('validateProject', () => {
    it('should pass when all hard gates are met', () => {
      const project = createValidProject();
      const result = validateProject(project);
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('should fail HG1 when fewer than 2 actors', () => {
      const project = createProjectWithActors(1);
      const result = validateProject(project);
      expect(result.passed).toBe(false);
      expect(result.failedGates).toContain('HG1');
    });
  });
});
```

### Testing Pure Functions
```typescript
// lib/diagrams/__tests__/generators.test.ts
import { describe, it, expect } from 'vitest';
import { generateContextDiagram, generateUseCaseDiagram } from '../generators';

describe('Diagram Generators', () => {
  describe('generateContextDiagram', () => {
    it('should include all actors in the diagram', () => {
      const project = {
        actors: [
          { name: 'User', type: 'human' },
          { name: 'PaymentGateway', type: 'external' },
        ],
        systemName: 'OrderSystem',
      };

      const diagram = generateContextDiagram(project);

      expect(diagram).toContain('User');
      expect(diagram).toContain('PaymentGateway');
      expect(diagram).toContain('OrderSystem');
    });

    it('should use correct Mermaid syntax', () => {
      const diagram = generateContextDiagram(minimalProject);
      expect(diagram).toMatch(/^flowchart/);
      expect(diagram).not.toContain('undefined');
    });
  });
});
```

### Testing Async Functions
```typescript
// lib/langchain/graphs/__tests__/nodes/analyze-response.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeResponseNode } from '../../nodes/analyze-response';

// Mock the LLM
vi.mock('@/lib/langchain/models', () => ({
  analysisModel: {
    invoke: vi.fn(),
  },
}));

import { analysisModel } from '@/lib/langchain/models';

describe('analyzeResponseNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract actors from response', async () => {
    vi.mocked(analysisModel.invoke).mockResolvedValue({
      actors: [{ name: 'Admin', type: 'human' }],
    });

    const state = createStateWithMessage('The admin manages the system');
    const result = await analyzeResponseNode(state);

    expect(result.collectedData?.actors).toHaveLength(1);
    expect(result.collectedData?.actors[0].name).toBe('Admin');
  });

  it('should handle LLM errors gracefully', async () => {
    vi.mocked(analysisModel.invoke).mockRejectedValue(new Error('API error'));

    const state = createStateWithMessage('test');
    const result = await analyzeResponseNode(state);

    expect(result.collectedData?.error).toBeDefined();
  });
});
```

## Component Testing

### Testing React Components
```typescript
// components/chat/__tests__/chat-window.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '../chat-window';

describe('ChatWindow', () => {
  const defaultProps = {
    projectId: 'test-project',
    initialMessages: [],
    onSend: vi.fn(),
  };

  it('should render message input', () => {
    render(<ChatWindow {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display initial messages', () => {
    const messages = [
      { id: '1', role: 'assistant', content: 'Hello!' },
      { id: '2', role: 'user', content: 'Hi there' },
    ];

    render(<ChatWindow {...defaultProps} initialMessages={messages} />);

    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('should call onSend when submitting message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<ChatWindow {...defaultProps} onSend={onSend} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('Test message');
  });

  it('should disable input while loading', () => {
    render(<ChatWindow {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
```

### Testing with Providers
```typescript
// test/utils.tsx
import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';

const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Usage
import { renderWithProviders } from '@/test/utils';

it('should fetch and display projects', async () => {
  renderWithProviders(<ProjectList />);
  await waitFor(() => {
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });
});
```

## Mocking

### Mocking Modules
```typescript
// Mock entire module
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      projects: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
}));
```

### Mocking fetch/API Calls
```typescript
// Using msw (Mock Service Worker)
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/projects', () => {
    return HttpResponse.json([
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ]);
  }),
  http.post('/api/projects', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '3', ...body }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mocking Environment Variables
```typescript
// vitest.setup.ts
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
vi.stubEnv('OPENAI_API_KEY', 'test-key');

// Or in individual tests
it('should use production config', () => {
  vi.stubEnv('NODE_ENV', 'production');
  // test...
});
```

## Test Data Factories

### Creating Test Data
```typescript
// test/factories/project.ts
import { faker } from '@faker-js/faker';

export function createProject(overrides: Partial<Project> = {}): Project {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: faker.string.uuid(),
    ...overrides,
  };
}

export function createValidProject(): Project {
  return createProject({
    actors: [
      { name: 'User', type: 'human' },
      { name: 'Admin', type: 'human' },
    ],
    useCases: [
      'Create account',
      'Login',
      'Manage settings',
    ],
    boundaries: ['Web Application'],
  });
}

// Usage
it('should validate project', () => {
  const project = createValidProject();
  const result = validateProject(project);
  expect(result.passed).toBe(true);
});
```

## Snapshot Testing

### Use Sparingly for Stable Output
```typescript
// For diagram generation output
it('should generate consistent Mermaid syntax', () => {
  const diagram = generateContextDiagram(fixedProject);
  expect(diagram).toMatchSnapshot();
});

// Update snapshots: npm test -- -u
```

### Avoid for Dynamic Content
```typescript
// BAD: Snapshot with timestamps
it('should create project', () => {
  const project = createProject();
  expect(project).toMatchSnapshot(); // Fails due to createdAt
});

// GOOD: Check specific properties
it('should create project with correct structure', () => {
  const project = createProject();
  expect(project).toMatchObject({
    status: 'draft',
    actors: expect.any(Array),
  });
});
```

## Coverage Requirements

### vitest.config.ts Coverage Settings
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
});
```

### Checking Coverage
```bash
# Run tests with coverage
npm test -- --coverage

# View HTML report
open coverage/index.html
```

## CI/CD Integration

### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

## Quick Reference

### Common Matchers
```typescript
expect(value).toBe(expected)           // Strict equality
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeTruthy()             // Truthy check
expect(array).toContain(item)          // Array includes
expect(array).toHaveLength(n)          // Array length
expect(fn).toHaveBeenCalledWith(args)  // Function call
expect(promise).resolves.toBe(value)   // Async resolved
expect(promise).rejects.toThrow()      // Async rejected
```

### Testing Library Queries
```typescript
screen.getByRole('button', { name: /submit/i })  // Accessible
screen.getByText('Hello')                         // Text content
screen.getByTestId('submit-btn')                  // Test ID (last resort)
screen.queryByText('Optional')                    // Returns null if not found
screen.findByText('Async')                        // Async, returns Promise
```

## References

- See `vitest.config.ts` for test configuration
- See `test/` directory for test utilities and factories
- See `lib/**/__tests__/` for unit test examples
