# Coding Conventions

**Analysis Date:** 2025-01-25

## Naming Patterns

**Files:**
- Components: PascalCase with kebab-case filename (`chat-window.tsx` exports `ChatWindow`)
- Utilities: kebab-case (`lib/utils.ts`, `lib/auth/session.ts`)
- Types: kebab-case for file, PascalCase for exports (`types.ts` exports `IntakeState`)
- Tests: `*.test.ts` suffix in `__tests__/` directories
- API routes: `route.ts` in Next.js App Router convention

**Functions:**
- camelCase for all functions (`validateProject`, `createInitialState`)
- Async functions: no `async` prefix (`getUser`, not `asyncGetUser`)
- Boolean-returning: `is*`, `has*`, `should*` prefix (`isStopPhrase`, `hasMinimumActors`)
- Event handlers: `handle*` prefix in components (`handleSubmit`, `handleScroll`)

**Variables:**
- camelCase for variables and parameters (`projectId`, `extractedData`)
- SCREAMING_SNAKE_CASE for constants (`STOP_TRIGGER_KEYWORDS`, `VALIDATION_THRESHOLD`)
- Descriptive names over abbreviations (`useCaseCount` not `ucCnt`)

**Types:**
- PascalCase for types and interfaces (`IntakeState`, `ArtifactPhase`)
- Type suffix for complex types (`ExtractionResult`, `ValidationResult`)
- Use `type` for unions, `interface` for objects with methods

**React Components:**
- PascalCase (`ChatWindow`, `ChatMessages`, `ChatLayout`)
- Props interface: `ComponentNameProps` suffix (`ChatWindowProps`)
- Export both component and variants when using CVA (`Button`, `buttonVariants`)

## Code Style

**Formatting:**
- No explicit formatter config detected (eslint/prettier)
- 2-space indentation observed
- Single quotes for strings
- Trailing commas in multiline arrays/objects
- Max line length ~100 characters (observed)

**Linting:**
- TypeScript strict mode enabled (`"strict": true` in tsconfig)
- No ESLint config file detected - relies on TypeScript compiler

## Import Organization

**Order:**
1. React and external library imports (`react`, `@langchain/*`, `zod`)
2. Next.js framework imports (`next/server`, `next/headers`)
3. Internal absolute imports with `@/` alias (`@/lib/*`, `@/components/*`)
4. Relative imports for same-directory modules (`./types`, `../schemas`)
5. Types with `type` keyword for type-only imports

**Path Aliases:**
- `@/*` maps to project root (`./`)
- Use absolute imports: `@/lib/db/queries` not `../../lib/db/queries`

**Examples:**
```typescript
// External
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Internal absolute
import { db } from '@/lib/db/drizzle';
import { getUser } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';

// Relative (same module)
import type { IntakeState } from './types';
import { routeAfterAnalysis } from './edges';
```

## Error Handling

**Patterns:**
- API routes: try-catch with consistent error response format
- Server actions: return `{ error: string }` on failure, `{ success: string }` on success
- Zod validation: use `safeParse()` for type guards, throw for schemas
- Never swallow errors silently - at minimum `console.error`

**API Route Pattern:**
```typescript
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // ... logic
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error context:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Server Action Pattern:**
```typescript
export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  // Validation failure returns error object
  if (!valid) {
    return { error: 'Invalid email or password.', email, password };
  }

  // Success redirects or returns success
  redirect('/dashboard');
});
```

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- Use `console.error` for errors with context: `console.error('Error fetching projects:', error)`
- Use `console.log` for debugging only (should be removed in production)
- Include descriptive prefix in log messages
- Error logs should include the error object for stack traces

## Comments

**When to Comment:**
- Module-level JSDoc for files explaining purpose (`@module graphs/types`)
- Section separators using `// ===` for major code sections
- Complex business logic explanation
- TODO/FIXME markers for technical debt

**JSDoc/TSDoc:**
- Use JSDoc for exported functions with `@param`, `@returns`, `@example`
- Interface members use `.describe()` in Zod schemas instead of comments
- TSDoc for type parameters when non-obvious

**Example:**
```typescript
/**
 * Compute artifact readiness from extracted data
 * Determines which artifacts have sufficient data for generation
 *
 * @param data - The extracted PRD data
 * @returns Object indicating readiness for each artifact type
 *
 * @example
 * ```typescript
 * const readiness = computeArtifactReadiness(extractedData);
 * if (readiness.context_diagram) {
 *   // Ready to generate context diagram
 * }
 * ```
 */
export function computeArtifactReadiness(data: ExtractionResult): ArtifactReadiness {
```

## Function Design

**Size:** Functions are typically 10-50 lines. Break into helpers when exceeding ~60 lines.

**Parameters:**
- Use object parameter for 3+ args: `createInitialState(projectId, projectName, projectVision, teamId)`
- Optional last parameter for overrides: `createInitialState(..., existingData?: Partial<...>)`
- Destructure in function body for complex objects

**Return Values:**
- Return early for guard clauses
- Explicit `null` for "not found" (not `undefined`)
- Return objects with discriminated unions for success/error states

## Module Design

**Exports:**
- Named exports preferred over default exports
- Re-export from index files for public API (`lib/langchain/graphs/index.ts`)
- Type exports use `export type` for type-only exports

**Barrel Files:**
- `index.ts` files aggregate exports from subdirectories
- Keep barrel files minimal - just re-exports, no logic

**Example (`lib/langchain/graphs/nodes/index.ts`):**
```typescript
export { analyzeResponse } from './analyze-response';
export { extractData } from './extract-data';
export { generateArtifact } from './generate-artifact';
export { generateResponse } from './generate-response';
```

## Component Patterns

**UI Components (shadcn/ui style):**
```typescript
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "base-classes",
  {
    variants: { variant: { default: "...", destructive: "..." } },
    defaultVariants: { variant: "default" }
  }
);

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

**Feature Components:**
- `'use client'` directive at top for client components
- Props interface defined before component
- Hooks at top of component body
- Event handlers as `useCallback` when passed to children

## Zod Schema Patterns

**Schema Definition:**
```typescript
export const actorSchema = z.object({
  name: z.string().describe('Name of the actor'),
  role: z.string().describe('Role or type of actor'),
  goals: z.array(z.string()).optional().describe('Optional list of goals'),
});

export type Actor = z.infer<typeof actorSchema>;

// Type guard pattern
export function isActor(obj: unknown): obj is Actor {
  return actorSchema.safeParse(obj).success;
}
```

## Database Patterns

**Drizzle ORM:**
- Use `db.query.*` for reads with relations
- Use `db.select().from()` for simple queries
- Use `db.insert().values().returning()` for inserts
- Use `eq()`, `and()`, `isNull()` from drizzle-orm for conditions

---

*Convention analysis: 2025-01-25*
