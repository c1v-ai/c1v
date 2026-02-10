# Knowledge Bank: Coding Standards (Guidelines & Conventions)

**Step:** 2.6 - Coding Standards
**Purpose:** Guide language-specific coding conventions, testing requirements, and developer workflow
**Core Question:** "How should the team write, test, and ship code?"
**Feeds Into:** Guidelines agent (`guidelines-agent.ts`)
**Last Updated:** February 2026

---

## WHY THIS STEP MATTERS

Coding standards prevent the "everyone writes code differently" problem that kills team velocity. They're not about style preferences — they're about reducing cognitive load so developers can focus on solving problems instead of decoding each other's patterns.

---

## NAMING CONVENTIONS BY LANGUAGE

### TypeScript / JavaScript (Primary — 2026 dominant)

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase | `userName`, `isActive`, `orderCount` |
| Functions | camelCase | `getUser()`, `calculateTotal()`, `handleSubmit()` |
| Classes | PascalCase | `UserService`, `OrderController` |
| Interfaces/Types | PascalCase | `UserProfile`, `CreateOrderInput` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Enum members | PascalCase | `OrderStatus.Pending`, `Role.Admin` |
| Files (components) | kebab-case or PascalCase | `user-profile.tsx` or `UserProfile.tsx` |
| Files (utilities) | kebab-case | `format-date.ts`, `api-client.ts` |
| Directories | kebab-case | `user-stories/`, `api-spec/` |
| Boolean variables | `is`/`has`/`can` prefix | `isActive`, `hasPermission`, `canEdit` |

### Python

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | snake_case | `user_name`, `is_active` |
| Functions | snake_case | `get_user()`, `calculate_total()` |
| Classes | PascalCase | `UserService`, `OrderController` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Files | snake_case | `user_service.py`, `api_client.py` |
| Packages | lowercase | `mypackage`, `utils` |

### Go

| Element | Convention | Example |
|---------|-----------|---------|
| Exported | PascalCase | `GetUser()`, `UserService` |
| Unexported | camelCase | `getUser()`, `userService` |
| Constants | PascalCase (exported) | `MaxRetries`, `DefaultTimeout` |
| Files | snake_case | `user_service.go`, `api_handler.go` |
| Packages | lowercase, single word | `user`, `auth`, `handler` |

### Rust

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | snake_case | `user_name`, `is_active` |
| Functions | snake_case | `get_user()`, `calculate_total()` |
| Types/Structs | PascalCase | `UserService`, `OrderStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Modules | snake_case | `user_service`, `api_handler` |

---

## FILE ORGANIZATION PATTERNS

### Feature-Based (Recommended for Large Apps)
```
src/
├── features/
│   ├── auth/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom hooks
│   │   ├── api/               # API calls / server actions
│   │   ├── types.ts           # Feature-specific types
│   │   └── __tests__/         # Co-located tests
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── __tests__/
│   └── billing/
├── components/ui/             # Shared UI (shadcn/ui)
├── lib/                       # Shared utilities
└── app/                       # Routes (Next.js App Router)
```

### Layer-Based (Simpler Apps)
```
src/
├── components/                # All UI components
├── hooks/                     # Custom hooks
├── lib/                       # Utilities, helpers
├── api/                       # API client functions
├── types/                     # Shared type definitions
└── app/                       # Routes
```

### Next.js App Router (2026 Standard)
```
app/
├── (auth)/                    # Route group (no URL segment)
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (dashboard)/               # Authenticated pages
│   ├── layout.tsx             # Shared dashboard layout
│   ├── projects/
│   │   ├── page.tsx           # /projects (list)
│   │   └── [id]/
│   │       ├── page.tsx       # /projects/:id (detail)
│   │       └── settings/page.tsx
│   └── settings/page.tsx
├── api/                       # API routes
│   └── [domain]/
│       └── route.ts           # Route handlers
├── layout.tsx                 # Root layout
└── page.tsx                   # Home page
```

---

## COMPONENT PATTERNS (React — February 2026)

### React 19 + React Compiler
```typescript
// React Compiler eliminates manual useMemo/useCallback (Next.js 16)
// Write plain components — the compiler optimizes automatically

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  // No useMemo needed — React Compiler handles it
  const statusColor = getStatusColor(project.status);

  return (
    <Card onClick={() => onSelect(project.id)}>
      <CardHeader>
        <Badge color={statusColor}>{project.status}</Badge>
        <h3>{project.name}</h3>
      </CardHeader>
    </Card>
  );
}
```

### Rules
- **Functional components only** (no class components)
- **Props interface defined above component** (not inline)
- **One component per file** (exported as named export)
- **Co-located tests** (`__tests__/` directory or `.test.tsx` files)
- **Server Components by default** (Next.js) — add `'use client'` only when needed
- **No prop drilling** beyond 2 levels — use context or state management

### Server vs Client Components (Next.js 16)
```
Server Component (default):
  ✅ Database queries, API calls
  ✅ Access to secrets/env vars
  ✅ Large dependencies (stay on server)
  ❌ No useState, useEffect, event handlers

Client Component ('use client'):
  ✅ Interactivity (clicks, forms, state)
  ✅ Browser APIs (localStorage, etc.)
  ✅ Custom hooks with state
  ❌ Cannot directly query database
```

---

## TESTING REQUIREMENTS (February 2026)

### Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit** | Vitest | Pure functions, utilities, hooks |
| **Component** | Vitest + React Testing Library | UI components in isolation |
| **Integration** | Vitest | API routes, database operations |
| **E2E** | Playwright | Critical user flows across browsers |
| **Visual** | Playwright screenshots | Visual regression detection |

### Testing Priorities

| Priority | What to Test | Coverage Target |
|----------|-------------|----------------|
| **P0** | Business logic, data transformations | 90%+ |
| **P0** | API route handlers (happy + error paths) | 80%+ |
| **P1** | Complex UI components with state | 70%+ |
| **P1** | Critical user flows (E2E) | Top 5 flows |
| **P2** | Simple presentational components | Optional |
| **P2** | Styling/layout | Visual regression only |

### Test File Naming
```
src/
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts      # Unit tests
├── components/
│   ├── project-card.tsx
│   └── __tests__/
│       └── project-card.test.tsx  # Component tests
└── e2e/
    ├── auth.spec.ts            # E2E: auth flows
    └── projects.spec.ts        # E2E: project CRUD
```

### Test Patterns
```typescript
// Vitest + React Testing Library
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('ProjectCard', () => {
  it('displays project name and status', () => {
    render(<ProjectCard project={mockProject} onSelect={vi.fn()} />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});
```

---

## CODE QUALITY RULES

### Hard Limits
| Rule | Limit | Why |
|------|-------|-----|
| Max function length | 50 lines | Readability; extract if longer |
| Max file length | 300 lines | Maintainability; split if longer |
| Max cyclomatic complexity | 10 | Testability; refactor nested conditions |
| No `any` types | 0 (TypeScript strict) | Type safety is the whole point |
| No `console.log` in production | 0 | Use structured logger |
| Max function parameters | 3 (use object for more) | Readability |

### TypeScript Configuration (2026)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

---

## LINTING & FORMATTING (February 2026)

### Biome v2.3 (Recommended — Replaces ESLint + Prettier)
```json
// biome.json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "error" },
      "style": { "useConst": "error" }
    }
  },
  "organizeImports": { "enabled": true }
}
```

**Why Biome over ESLint:** 423 lint rules, type-aware linting, GritQL custom rules, 10-100x faster, single tool replaces ESLint + Prettier + import sorting. Vue, Svelte, and Astro support in v2.3.

### ESLint 9 + Prettier (Alternative — Established)
Still widely used in existing projects. Migration to Biome is recommended for new projects.

---

## GIT CONVENTIONS

### Branch Naming
```
feature/user-authentication     # New feature
bugfix/login-redirect-loop      # Bug fix
hotfix/security-patch           # Urgent production fix
chore/update-dependencies       # Maintenance
docs/api-documentation          # Documentation
refactor/auth-middleware         # Code restructuring
```

### Commit Format (Conventional Commits)
```
feat: add user authentication with Better Auth
fix: resolve redirect loop on login page
chore: update LangChain to v0.3.40
docs: add API endpoint documentation
refactor: extract auth middleware into HOF
test: add E2E tests for project creation
perf: optimize database query with composite index
```

**Format:** `<type>(<optional scope>): <description>`

| Type | When |
|------|------|
| `feat` | New feature for the user |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `refactor` | Code change with no feature/fix |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### PR Template
```markdown
## Summary
[1-3 bullet points describing the change]

## Changes
- [ ] New files: ...
- [ ] Modified files: ...
- [ ] Database migrations: Yes/No

## Test Plan
- [ ] Unit tests added/updated
- [ ] E2E test for critical path
- [ ] Manual testing steps:
  1. ...
  2. ...

## Screenshots
[If UI changes]
```

### Merge Strategy
- **Squash merge to main** — clean history, one commit per PR
- **Rebase for feature branches** — linear history within branch
- **Never force-push to main** — protected branch

---

## DOCUMENTATION STANDARDS

### What to Document
| What | Where | When |
|------|-------|------|
| API endpoints | OpenAPI spec + Scalar | Always for public APIs |
| Complex business logic | Inline comments | When logic isn't self-evident |
| Architecture decisions | ADR (Architecture Decision Record) | Major technical choices |
| Setup/deployment | README.md | Always |
| Environment variables | `.env.example` | Always |

### What NOT to Document
- Self-explanatory code (good names > comments)
- Every function/method (JSDoc only for public APIs)
- Obvious operations ("increment counter by 1")
- TODO comments without tracking (use issue tracker)

### ADR Format (Architecture Decision Records)
```markdown
# ADR-001: Use Drizzle ORM over Prisma

## Status: Accepted
## Date: 2026-02-07

## Context
We need a TypeScript ORM for PostgreSQL that works well with serverless/edge deployments.

## Decision
Use Drizzle ORM because of its 7.4kB bundle size, SQL-like API, and edge compatibility.

## Consequences
- Team needs to learn Drizzle's SQL-like syntax
- Better serverless cold starts
- Direct SQL escape hatch available
```

---

## ERROR HANDLING PATTERNS

### API Routes
```typescript
// Centralized error handler pattern
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createProjectSchema.parse(body); // Zod validation
    const result = await createProject(validated);
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({
        error: { code: 'VALIDATION_ERROR', details: error.errors }
      }, { status: 422 });
    }
    // Log to Sentry, return generic error
    logger.error('Unexpected error', { error });
    return Response.json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
    }, { status: 500 });
  }
}
```

### Rules
- **Validate at boundaries** — API inputs (Zod), form submissions
- **Trust internal code** — don't validate between your own functions
- **Never expose internals** — no stack traces, SQL errors, or file paths in responses
- **Log everything** — structured logging with context (userId, requestId)
- **Fail fast** — return errors early, avoid deep nesting

---

## DEPENDENCY MANAGEMENT

### Rules
- **Pin versions** — no `^` or `~` in production dependencies
- **Update regularly** — weekly dependency review (Dependabot/Renovate)
- **Audit before merge** — `pnpm audit` in CI pipeline
- **Minimize dependencies** — prefer stdlib/built-in over tiny packages
- **Lock file committed** — `pnpm-lock.yaml` always in git

### Package Manager (2026)
- **pnpm** — recommended (disk-efficient, strict deps, workspace support)
- **Bun** — alternative (faster installs, but less ecosystem compatibility)
- **npm/yarn** — legacy (still works, but pnpm is the modern standard)

---

## STANDARDS BY PROJECT TYPE

### B2B SaaS
```
Language:     TypeScript (strict mode)
Linting:      Biome v2.3
Testing:      Vitest + Playwright
Components:   Server Components default, 'use client' for interactivity
State:        Zustand (client) + React Query / SWR (server)
Forms:        React Hook Form + Zod
API:          tRPC (internal) + REST (public)
Git:          Conventional Commits + squash merge
```

### Mobile App
```
Language:     TypeScript (React Native)
Linting:      Biome v2.3
Testing:      Vitest (unit) + Detox or Maestro (E2E)
State:        Zustand + React Query
Navigation:   Expo Router (file-based)
Git:          Conventional Commits
```

### API Platform
```
Language:     TypeScript or Go
Linting:      Biome (TS) or golangci-lint (Go)
Testing:      Vitest (TS) or go test (Go) + k6 (load testing)
Docs:         OpenAPI 3.2 + Scalar
Versioning:   URL path (/v1/, /v2/)
Git:          Conventional Commits + semver tags
```

---

## INDUSTRY-SPECIFIC CODING STANDARDS

### Healthcare
```
Language:     TypeScript (strict mode, no 'any' — PHI type safety is critical)
Linting:      Biome v2.3 + custom rules for PHI handling
Testing:      Vitest + Playwright + HIPAA compliance test suite
Logging:      NEVER log PHI to console or generic logs — dedicated PHI audit log only
Auth:         Every endpoint must check authentication AND authorization (role-based)
Data handling:
  - PHI fields marked with branded types: `type PHI<T> = T & { readonly __phi: unique symbol }`
  - Encryption helper required for PHI at rest
  - Redaction middleware for API responses (strip PHI from error messages)
  - Session timeout: 15 minutes inactivity (clinical workstation standard)
Error handling:
  - NEVER include patient data in error messages or stack traces
  - Log errors with encounter/request ID, NOT patient identifiers
Git:          Conventional Commits + HIPAA compliance checks in CI
Code review:  Security review required for any code touching PHI
```

### Fintech
```
Language:     TypeScript (strict) or Go (for high-throughput services)
Linting:      Biome v2.3 + custom rules for financial calculations
Testing:      Vitest + property-based testing (fast-check) for financial math
Data handling:
  - ALWAYS use Decimal (not float/number) for money: `Decimal.js` or `dinero.js`
  - Currency as separate field alongside amount (never assume USD)
  - All monetary operations must be deterministic (no floating point)
  - Idempotency keys on all mutation endpoints
Transactions:
  - Every state change wrapped in DB transaction
  - Double-entry bookkeeping: every debit has a matching credit
  - Immutable ledger entries (append-only, no UPDATE/DELETE)
  - Optimistic locking for balance updates
Security:
  - Input validation with allowlists (not blocklists)
  - Rate limiting per endpoint AND per user
  - IP allowlisting for admin/internal APIs
  - Audit log every financial operation
Error handling:
  - Financial errors must be idempotent-safe (retry without double-charging)
  - Never expose internal transaction IDs to users
Git:          Conventional Commits + mandatory PR approval for payment code
```

### Education / EdTech
```
Language:     TypeScript (strict mode)
Linting:      Biome v2.3
Testing:      Vitest + Playwright + accessibility audit (axe-core)
Accessibility:
  - WCAG 2.2 AA MANDATORY (schools require it; Section 508 compliance)
  - Every interactive element keyboard-navigable
  - Screen reader testing for all learning content
  - Color contrast 4.5:1 minimum
  - Captions on all video content
Data handling:
  - Student records: FERPA-compliant access controls
  - Age gating: COPPA consent flow for under-13 users
  - Data minimization: only collect what's needed for learning
LTI Integration:
  - LTI 1.3 launch validation (JWT verification)
  - Grade passback via LTI Assignment and Grade Services (AGS)
  - Deep linking for content embedding in LMS
Content:
  - Support SCORM/xAPI for learning content interoperability
  - Offline-capable for low-bandwidth school environments
Git:          Conventional Commits
```

### Automotive / Dealer Management
```
Language:     TypeScript (strict mode)
Linting:      Biome v2.3
Testing:      Vitest + Playwright (mobile-responsive tests critical — salespeople use tablets)
Data handling:
  - VIN validation (17-character format + check digit verification)
  - Price formatting: always display with currency and disclaimer text
  - Inventory status: real-time sync with DMS (CDK, Reynolds, Tekion)
  - Trade-in values: snapshot at time of appraisal (values change daily)
Integrations:
  - ADF/XML for lead routing (industry standard)
  - STAR/XML for inventory feeds
  - RouteOne/DealerTrack APIs for F&I (financing)
  - NHTSA VIN decoder API (free, rate-limited)
UI patterns:
  - Mobile-first (salespeople on the lot use phones/tablets)
  - Large touch targets (44x44px minimum)
  - Offline-capable for lot walkarounds (poor signal in some lots)
Git:          Conventional Commits
```

### Logistics / Supply Chain
```
Language:     TypeScript (dashboard/API) or Go (event processors)
Linting:      Biome (TS) + golangci-lint (Go)
Testing:      Vitest + integration tests against EDI parsers
Data handling:
  - Timestamps: ALWAYS UTC with timezone (logistics spans time zones)
  - Weights/dimensions: store in metric (kg, cm), convert for display
  - Currency: store with ISO 4217 code (multi-currency shipments)
  - Addresses: structured format (not free text) for geocoding accuracy
  - GPS coordinates: store as `POINT` (PostGIS) or `decimal(10,7)` lat/lng
EDI:
  - Parse EDI 204 (Motor Carrier Load Tender)
  - Parse EDI 210 (Motor Carrier Freight Invoice)
  - Parse EDI 214 (Transportation Carrier Shipment Status)
  - Parse EDI 856 (Advance Ship Notice)
  - Use `node-x12` or `edi-parser` npm packages
Event handling:
  - Event-sourced tracking (append-only event log)
  - Idempotent webhook handlers (carriers may retry)
  - Dead letter queue for failed event processing
Git:          Conventional Commits
```

### Insurance / Insurtech
```
Language:     TypeScript (strict) or Java/Kotlin (enterprise Guidewire ecosystem)
Linting:      Biome v2.3 (TS) or SonarQube (Java/Kotlin)
Testing:      Vitest + property-based testing (rating engine math)
Data handling:
  - Policy: immutable versioning (never update, always create new version)
  - Claims: state machine with validated transitions
  - Dates: effective_date/expiration_date pairs on all versioned records
  - Premiums: DECIMAL(12,2), currency-aware, tax-aware
Rating engine:
  - Rule-based rating: store rules as JSONB, version independently
  - Territory rating: ZIP code to territory mapping tables
  - Factor tables: age, credit score, loss history multipliers
  - All rating inputs and outputs logged for regulatory audit
Compliance:
  - Rate filing documentation generated from code (regulatory requirement)
  - 30-day claims acknowledgment SLA tracked automatically
  - Agent licensing verification before binding policies
Git:          Conventional Commits + mandatory approval for rating engine changes
```

### Legal / LegalTech
```
Language:     TypeScript (strict mode)
Linting:      Biome v2.3
Testing:      Vitest + E2E for trust accounting flows (zero tolerance for errors)
Data handling:
  - Trust accounting: physically separate tables/schema from operating funds
  - Three-way reconciliation: bank statement vs trust ledger vs client ledger
  - Trust transactions: NEVER delete or modify (append-only, bar requirement)
  - Time entries: 6-minute increments (0.1 hour billing standard)
  - Conflict checking: search across all matters before new engagement
Billing:
  - UTBMS activity codes for time entry categorization
  - LEDES 1998B/2000 export format for e-billing
  - Billing rate snapshots (store rate at time of entry, not current rate)
Document handling:
  - Version control on all legal documents
  - Redline/compare capability for contract review
  - Digital signature integration (DocuSign, Adobe Sign)
  - Privilege tagging for document review
Git:          Conventional Commits + approval for trust accounting changes
```

---

## TEAM-SIZE SCALING

### Solo Developer
```
Priorities:   Ship fast, don't over-engineer, automate what hurts
Linting:      Biome with default rules (zero config)
Testing:      Unit tests on business logic only, skip E2E until v1
CI/CD:        GitHub Actions (lint + build), deploy on push to main
Code review:  Self-review via PR (forces you to read your own diff)
Git:          main only, no branching strategy needed
```

### Small Team (2-5 developers)
```
Priorities:   Consistency, clear ownership, fast PRs
Linting:      Biome with team-agreed rules + pre-commit hook
Testing:      Unit + integration tests, top 3 E2E flows
CI/CD:        GitHub Actions (lint + test + build + preview deploys)
Code review:  Required 1 approval, 24-hour SLA on reviews
Git:          feature/ branches, squash merge, Conventional Commits
Standards:    Lightweight doc (1-2 pages), rely on tooling enforcement
```

### Medium Team (5-20 developers)
```
Priorities:   Scalable patterns, team autonomy, documentation
Linting:      Biome + custom rules for project conventions
Testing:      Comprehensive: unit + integration + E2E + visual regression
CI/CD:        GitHub Actions + staging environment + manual prod gate
Code review:  2 approvals, CODEOWNERS file for critical paths
Git:          feature/ branches, release branches, semver tags
Standards:    Full standards doc, ADRs for architectural decisions
Ownership:    CODEOWNERS by feature area
```

### Enterprise (20+ developers)
```
Priorities:   Governance, compliance, cross-team coordination
Linting:      Shared config package, enforced via CI (fail on violations)
Testing:      Contract tests between services, load testing (k6), security scanning
CI/CD:        Multi-stage pipeline, approval gates, rollback automation
Code review:  2+ approvals, mandatory security review for auth/payment changes
Git:          Trunk-based development or GitFlow, protected branches
Standards:    Living documentation site, onboarding curriculum, style guides per language
Governance:   RFC process for architectural changes, tech radar for approved tools
```

---

## AI-ASSISTED DEVELOPMENT PATTERNS (2026)

### Code Generation Guardrails
```
DO:
  - Use AI (Cursor, Claude Code, Copilot) for boilerplate, tests, and repetitive code
  - Review all AI-generated code as if a junior developer wrote it
  - Maintain strict TypeScript — AI-generated code with `any` should be caught by linting
  - Use AI to write tests AFTER you write the implementation (not the other way around)

DON'T:
  - Let AI make architectural decisions (it doesn't understand your business context)
  - Accept AI-generated dependencies without audit (supply chain risk)
  - Use AI-generated code in security-critical paths without human review
  - Skip understanding code because "the AI wrote it" — you own it
```

### AI-Friendly Codebase Patterns
```
Good (AI generates better code for these patterns):
  - Clear function names with JSDoc describing intent
  - Zod schemas defining exact input/output shapes
  - Consistent patterns (AI learns from your codebase)
  - Small, focused files (<300 lines)
  - Well-named test files co-located with source

Bad (AI struggles with these):
  - Implicit conventions ("we always do X but never documented it")
  - Complex inheritance hierarchies
  - Tight coupling between modules
  - Circular dependencies
  - Magic strings/numbers without constants
```

---

## ACCESSIBILITY STANDARDS (WCAG 2.2 AA)

### Required for All Web Applications
| Category | Requirement | Implementation |
|----------|------------|----------------|
| **Keyboard** | All interactive elements keyboard-accessible | Tab order, focus indicators, no keyboard traps |
| **Screen reader** | All content has text alternatives | `alt` on images, `aria-label` on icons, semantic HTML |
| **Color** | 4.5:1 contrast ratio (text), 3:1 (large text/UI) | Use contrast checker in Figma/Chrome DevTools |
| **Motion** | Respect `prefers-reduced-motion` | `@media (prefers-reduced-motion: reduce)` |
| **Forms** | Labels, error messages, and instructions | `<label>` elements, `aria-describedby` for errors |
| **Focus** | Visible focus indicator on all interactive elements | `:focus-visible` with 2px+ outline |

### Testing Tools
- **axe-core**: Automated accessibility testing (integrate with Playwright)
- **Lighthouse**: Built-in Chrome accessibility audit
- **NVDA** (Windows) / **VoiceOver** (macOS): Manual screen reader testing
- **Stark** (Figma plugin): Design-time contrast and color blindness checks

### Component Patterns
```typescript
// Good: Accessible button with icon
<Button aria-label="Delete project" onClick={onDelete}>
  <TrashIcon aria-hidden="true" />
</Button>

// Good: Form with accessible error handling
<label htmlFor="email">Email</label>
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <p id="email-error" role="alert">{errors.email.message}</p>
)}

// Good: Skip navigation link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## QUALITY CHECKS

**Done right:**
- Naming conventions specified for the chosen language(s)
- File organization pattern defined
- Testing strategy with tools and priorities
- Linting/formatting configured (ideally Biome)
- Git workflow specified (branching, commits, PRs)
- Error handling patterns established
- Dependency management rules

**Done wrong:**
- Generic "follow best practices" without specifics
- No testing strategy
- No linting configuration
- "Use whatever formatting you prefer"
- No git conventions
- Error handling left to individual preference
