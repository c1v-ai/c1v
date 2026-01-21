# Code Quality & Simplification

Enterprise-grade code quality patterns for maintainable, scalable, and understandable code. Reference the `/code-simplifier` skill for automated complexity analysis.

## Core Principles

### 1. Simplicity Over Cleverness
```typescript
// BAD - Clever but unreadable
const r = a.reduce((p, c) => (p[c.t] = [...(p[c.t] || []), c], p), {});

// GOOD - Clear and maintainable
const groupedByType = new Map<string, Item[]>();
for (const item of items) {
  const existing = groupedByType.get(item.type) ?? [];
  groupedByType.set(item.type, [...existing, item]);
}
```

### 2. Single Responsibility
```typescript
// BAD - Function does too many things
async function handleUserAction(user: User, action: string, data: unknown) {
  if (action === 'create') { /* 50 lines */ }
  else if (action === 'update') { /* 50 lines */ }
  else if (action === 'delete') { /* 50 lines */ }
  else if (action === 'notify') { /* 50 lines */ }
}

// GOOD - Each function has one job
async function createUser(data: CreateUserInput) { /* focused logic */ }
async function updateUser(id: string, data: UpdateUserInput) { /* focused logic */ }
async function deleteUser(id: string) { /* focused logic */ }
async function notifyUser(id: string, message: string) { /* focused logic */ }
```

### 3. Explicit Over Implicit
```typescript
// BAD - Magic values, implicit behavior
function process(data, flag) {
  if (flag) {
    return data.filter(d => d.status === 1);
  }
  return data;
}

// GOOD - Named constants, clear types
const STATUS_ACTIVE = 'active';

function filterActiveItems(items: Item[], includeInactive: boolean): Item[] {
  if (includeInactive) {
    return items;
  }
  return items.filter(item => item.status === STATUS_ACTIVE);
}
```

## Naming Conventions

### Variables
```typescript
// BAD - Abbreviations, single letters
const d = new Date();
const usr = await getUser();
const tmp = calculateTotal(items);

// GOOD - Descriptive, self-documenting
const createdAt = new Date();
const currentUser = await getUser();
const orderTotal = calculateTotal(items);
```

### Functions
```typescript
// BAD - Vague names
function handle(data) { }
function process(items) { }
function doStuff() { }

// GOOD - Action + Subject
function validateUserInput(input: FormData) { }
function calculateOrderTotal(items: OrderItem[]) { }
function sendPasswordResetEmail(email: string) { }
```

### Booleans
```typescript
// BAD - Unclear boolean names
let flag = true;
let status = false;
let check = true;

// GOOD - Question-style names
let isAuthenticated = true;
let hasPermission = false;
let shouldValidate = true;

// Also good: can/will/should prefixes
let canEdit = user.role === 'editor';
let willExpireSoon = expiresAt < oneWeekFromNow;
```

## Function Design

### Keep Functions Short
```typescript
// Target: 20-30 lines max
// If longer, extract helper functions

// BAD - 100+ line function
async function processOrder(order: Order) {
  // validation (20 lines)
  // inventory check (20 lines)
  // payment processing (30 lines)
  // notification (20 lines)
  // logging (20 lines)
}

// GOOD - Composed of small functions
async function processOrder(order: Order) {
  validateOrder(order);
  await checkInventory(order.items);
  const payment = await processPayment(order);
  await notifyCustomer(order, payment);
  logOrderProcessed(order);
}
```

### Pure Functions When Possible
```typescript
// BAD - Side effects, hard to test
let total = 0;
function addToTotal(amount: number) {
  total += amount;  // Mutates external state
  console.log(`Added ${amount}`);  // Side effect
  return total;
}

// GOOD - Pure function
function calculateNewTotal(currentTotal: number, amount: number): number {
  return currentTotal + amount;
}
```

### Early Returns
```typescript
// BAD - Deeply nested conditions
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // actual logic buried here
        return doSomething(user);
      } else {
        return { error: 'No permission' };
      }
    } else {
      return { error: 'User inactive' };
    }
  } else {
    return { error: 'User not found' };
  }
}

// GOOD - Guard clauses, flat structure
function processUser(user: User | null) {
  if (!user) {
    return { error: 'User not found' };
  }
  if (!user.isActive) {
    return { error: 'User inactive' };
  }
  if (!user.hasPermission) {
    return { error: 'No permission' };
  }

  // Main logic at top level
  return doSomething(user);
}
```

## Type Safety

### Strict TypeScript
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Exhaustive Type Checking
```typescript
// Ensure all cases handled
type Status = 'pending' | 'active' | 'completed' | 'cancelled';

function getStatusColor(status: Status): string {
  switch (status) {
    case 'pending': return 'yellow';
    case 'active': return 'blue';
    case 'completed': return 'green';
    case 'cancelled': return 'red';
    default:
      // TypeScript error if new status added without handling
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

### Discriminated Unions
```typescript
// BAD - Loose typing
interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// GOOD - Discriminated union
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript knows response.data exists
    return response.data;
  } else {
    // TypeScript knows response.error exists
    throw new Error(response.error);
  }
}
```

## Error Handling

### Structured Error Types
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}
```

### Error Boundaries
```typescript
// Catch errors at appropriate levels
async function getProject(id: string): Promise<Project> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    throw new NotFoundError('Project', id);
  }

  return project;
}

// Handle in API route
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await getProject(params.id);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    // Log unexpected errors, return generic message
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Code Organization

### Feature-Based Structure
```
// BAD - Type-based (scattered features)
components/
  Button.tsx
  ProjectCard.tsx
  ChatMessage.tsx
hooks/
  useProject.ts
  useChat.ts
utils/
  projectUtils.ts
  chatUtils.ts

// GOOD - Feature-based (colocated)
features/
  projects/
    components/
      ProjectCard.tsx
    hooks/
      useProject.ts
    utils/
      projectUtils.ts
    index.ts
  chat/
    components/
      ChatMessage.tsx
    hooks/
      useChat.ts
    index.ts
```

### Barrel Exports
```typescript
// features/projects/index.ts
export { ProjectCard } from './components/ProjectCard';
export { useProject } from './hooks/useProject';
export type { Project, CreateProjectInput } from './types';

// Usage
import { ProjectCard, useProject } from '@/features/projects';
```

## Performance Patterns

### Memoization
```typescript
// Only memoize expensive computations
const expensiveResult = useMemo(() => {
  return items.reduce((acc, item) => {
    // Complex calculation
    return acc + computeComplexValue(item);
  }, 0);
}, [items]);

// DON'T memoize simple operations
// BAD
const doubled = useMemo(() => value * 2, [value]);

// GOOD
const doubled = value * 2;
```

### Lazy Loading
```typescript
// Dynamic imports for large components
const DiagramViewer = dynamic(
  () => import('@/components/diagram-viewer'),
  {
    loading: () => <Skeleton className="h-96" />,
    ssr: false,
  }
);

// Code splitting by route (automatic in Next.js App Router)
// Each page.tsx is automatically code-split
```

## Documentation

### JSDoc for Public APIs
```typescript
/**
 * Creates a new project with the given configuration.
 *
 * @param input - The project creation parameters
 * @param input.name - Project name (3-100 characters)
 * @param input.description - Optional project description
 * @returns The created project with generated ID
 * @throws {ValidationError} If input validation fails
 *
 * @example
 * const project = await createProject({
 *   name: 'My Project',
 *   description: 'A sample project'
 * });
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  // implementation
}
```

### Self-Documenting Code
```typescript
// BAD - Needs comment to explain
// Check if user can edit the project
if (user.id === project.ownerId || user.role === 'admin') {
  // ...
}

// GOOD - Code explains itself
const isOwner = user.id === project.ownerId;
const isAdmin = user.role === 'admin';
const canEditProject = isOwner || isAdmin;

if (canEditProject) {
  // ...
}
```

## Code Review Checklist

### Readability
- [ ] Variable/function names are descriptive
- [ ] No magic numbers or strings
- [ ] Functions are short (< 30 lines)
- [ ] No deeply nested conditionals
- [ ] Early returns used for guard clauses

### Maintainability
- [ ] Single responsibility principle followed
- [ ] DRY - no unnecessary duplication
- [ ] Proper error handling
- [ ] Types are specific, not `any`
- [ ] Side effects are isolated

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Expensive operations are memoized
- [ ] Large components are lazy-loaded
- [ ] Database queries are optimized

### Testability
- [ ] Pure functions where possible
- [ ] Dependencies are injectable
- [ ] No hidden state
- [ ] Clear inputs and outputs

## Complexity Metrics

Use the `/code-simplifier` skill to analyze:
- Cyclomatic complexity (target: < 10 per function)
- Cognitive complexity (target: < 15 per function)
- Function length (target: < 30 lines)
- File length (target: < 300 lines)
- Nesting depth (target: < 3 levels)

## Related Skills

- Use `/code-simplifier` skill for automated complexity analysis
- Use `/feature-dev` skill for guided feature development
- See `testing-strategies.md` for testable code patterns
- See `api-design.md` for API code patterns
