# Product Helper v1.1 Roadmap

**Created:** 2026-01-19
**Status:** Planning
**Target:** Stabilization, Security Hardening, Quality Improvement

---

## Executive Summary

Product Helper v1.0 is a functional AI-powered PRD generation SaaS with LangGraph-based conversational intake, SR-CORNELL validation, and diagram generation. Version 1.1 focuses on:

1. **Stabilization** - Fix 15 failing tests
2. **Security Hardening** - Address critical vulnerabilities
3. **Quality Improvement** - Accessibility, performance, documentation

---

## Current State Assessment

| Area | Score | Status |
|------|-------|--------|
| Test Suite | 257/272 passing (94.5%) | 15 failing tests |
| Security | Moderate | 2 critical issues found |
| Accessibility | Poor | Missing mobile nav, ARIA gaps |
| Performance | Good | Some optimization opportunities |
| Documentation | 65/100 | Major gaps in user/API docs |

---

## Phase Breakdown

### Phase 1: Test Stabilization
**Goal:** 100% passing test suite
**Effort:** Low-Medium
**Dependencies:** None

#### Tasks

**1.1 Fix generators.test.ts (10 tests)**
- [ ] Fix B&W styling test - regex contradiction (line 100)
  - Update regex to exclude white/black: `/fill:#(?!ffffff|000000)[a-f0-9]{6}/i`
- [ ] Fix CTX-* validation tests (7 tests) - wrong Jest matcher
  - Replace `toContain(expect.stringContaining())` with `toEqual(expect.arrayContaining([expect.stringContaining()]))`
- [ ] Fix interaction labels test - pattern order in `inferInteraction()`
  - Decision needed: reorder patterns or update test expectation
- [ ] Fix class diagram test - `parseRelationship()` finds wrong target
  - Exclude source entity when searching for target in relationship text

**1.2 Fix priority-scorer.test.ts (2 tests)**
- [ ] Fix "multiple unpassed gates" test - expected >= 12, received 11
  - Update expectation to >= 11 (penalty applies due to phase distance)
- [ ] Fix "adjacent phase questions" test - phase not in phaseOrder array
  - Add 'context_diagram' to phaseOrder OR change test's currentPhase

**1.3 Fix completion-detector.test.ts (3 tests)**
- [ ] Add regex for bare "generate" command
  - Add `/^generate\.?$/i` to GENERATE_PHRASES
- [ ] Fix "That's enough for now" stop phrase
  - Update regex: `/^that'?s (enough|it|all)(\s+.*)?\s*\.?$/i`
- [ ] Fix "Generate the context diagram" detection
  - Update regex to allow adjectives: `/generate (it|the|a)?\s*(\w+\s+)?(diagram|artifact)?\.?$/i`

---

### Phase 2: Critical Security Fixes
**Goal:** Address critical security vulnerabilities
**Effort:** Low
**Dependencies:** None (can run parallel with Phase 1)

#### Tasks

**2.1 Fix /api/user password exposure (CRITICAL)**
- [ ] Filter passwordHash from user response in `app/api/user/route.ts`
```typescript
// Before: return NextResponse.json(user)
// After:
const { passwordHash, ...safeUser } = user;
return NextResponse.json(safeUser);
```

**2.2 Add database SSL configuration**
- [ ] Update `lib/db/drizzle.ts` with SSL config for production
- [ ] Add connection pooling configuration

**2.3 Validate required environment variables at startup**
- [ ] Add startup validation for AUTH_SECRET, OPENAI_API_KEY, DATABASE_URL
- [ ] Fail fast if secrets are missing or weak

---

### Phase 3: Accessibility & Mobile UX
**Goal:** WCAG compliance, mobile usability
**Effort:** Medium
**Dependencies:** None

#### Tasks

**3.1 Add mobile navigation (CRITICAL)**
- [ ] Create hamburger menu component for header
- [ ] Add mobile navigation drawer/sheet
- [ ] Ensure proper ARIA attributes (role, aria-expanded, aria-controls)

**3.2 Fix chat accessibility**
- [ ] Add `aria-live="polite"` region for new messages
- [ ] Add `aria-label` to loading indicators
- [ ] Fix auto-scroll useEffect dependency array (line 64-68 in chat-window.tsx)

**3.3 Fix form accessibility**
- [ ] Add `aria-describedby` linking inputs to error messages
- [ ] Add `aria-required="true"` to required fields
- [ ] Implement focus management on validation errors

**3.4 Fix tab navigation**
- [ ] Add `role="tablist"` to project tabs in `[id]/layout.tsx`
- [ ] Add proper `role="tab"`, `aria-selected`, `aria-controls`

---

### Phase 4: Backend Hardening
**Goal:** Production-ready backend
**Effort:** Medium-High
**Dependencies:** Phase 2

#### Tasks

**4.1 Add rate limiting**
- [ ] Install `@upstash/ratelimit`
- [ ] Add rate limiting middleware to all API routes
- [ ] Configure limits: 100 req/min for auth, 30 req/min for chat

**4.2 Add LLM timeouts and sanitization**
- [ ] Add timeout to all ChatOpenAI calls (30s default)
- [ ] Sanitize user input before interpolating into prompts
- [ ] Add request body size limits to chat endpoints

**4.3 Implement session revocation**
- [ ] Add session store or blacklist table
- [ ] Implement logout endpoint that invalidates session
- [ ] Add session validation on each request

**4.4 Standardize error handling**
- [ ] Create error response utility with consistent format
- [ ] Add request ID tracking middleware
- [ ] Implement proper error codes (not just 500)

---

### Phase 5: Performance Optimization
**Goal:** Faster, more efficient application
**Effort:** Medium
**Dependencies:** Phase 1, 3

#### Tasks

**5.1 Frontend performance**
- [ ] Add `React.memo` to ChatMessages component
- [ ] Virtualize message list with `react-window` for long conversations
- [ ] Dynamic import mermaid.js with `next/dynamic`
- [ ] Dedupe SWR calls in dashboard layout

**5.2 Backend performance**
- [ ] Move LangGraph node imports to static (not dynamic in hot path)
- [ ] Add pagination to conversation history (currently loads all 50)
- [ ] Configure database query timeouts

**5.3 Caching layer (optional)**
- [ ] Add Upstash Redis for LLM response caching
- [ ] Implement stale-while-revalidate for project list

---

### Phase 6: Documentation
**Goal:** Complete documentation coverage
**Effort:** Medium
**Dependencies:** None (can run parallel)

#### Tasks

**6.1 User documentation (CRITICAL)**
- [ ] Create `docs/user-guide/getting-started.md`
- [ ] Create `docs/user-guide/creating-your-first-prd.md`
- [ ] Create `docs/user-guide/understanding-validation.md` (SR-CORNELL explained)
- [ ] Create `docs/user-guide/generating-diagrams.md`

**6.2 API documentation (CRITICAL)**
- [ ] Create `docs/api/overview.md` with auth, errors, rate limits
- [ ] Document all endpoints with request/response examples
- [ ] Generate OpenAPI 3.0 spec from routes

**6.3 Developer documentation**
- [ ] Create `docs/developer/architecture.md` with system diagrams
- [ ] Create `docs/deployment.md` (referenced but missing)
- [ ] Create `CONTRIBUTING.md`
- [ ] Create `CHANGELOG.md` from phase completion reports

**6.4 Code documentation**
- [ ] Add complete JSDoc to all API routes
- [ ] Document return types and error responses
- [ ] Create `TESTING.md` with test strategy

---

### Phase 7: Component Testing
**Goal:** Frontend test coverage
**Effort:** High
**Dependencies:** Phase 3, 5

#### Tasks

**7.1 Set up testing infrastructure**
- [ ] Configure React Testing Library with Jest
- [ ] Add `@testing-library/jest-dom` matchers
- [ ] Set up test utilities for SWR mocking

**7.2 Component tests**
- [ ] Test ChatWindow component (message rendering, auto-scroll)
- [ ] Test ChatInput component (submit, keyboard handling)
- [ ] Test ArtifactsSidebar (collapse, data display)
- [ ] Test DiagramViewer (rendering, zoom, export)

**7.3 Accessibility tests**
- [ ] Add axe-core for automated a11y testing
- [ ] Test keyboard navigation flows
- [ ] Test screen reader announcements

---

### Phase 8: Complete Web-App & Mobile Revamp
**Goal:** Modern, responsive, mobile-first experience with PWA capabilities
**Effort:** High
**Dependencies:** Phase 3 (Accessibility), Phase 5 (Performance)

#### Success Criteria
1. Web app works seamlessly on mobile devices (< 768px) with native-feel interactions
2. PWA installable with offline capabilities for core features
3. Desktop experience enhanced with modern UI patterns and improved navigation
4. Performance metrics meet mobile-first standards (Lighthouse mobile score >= 90)
5. Cross-platform design system implemented (consistent across web/mobile)

#### Tasks

**8.1 Mobile-First Design System**
- [ ] Audit current responsive breakpoints and mobile UX patterns
- [ ] Create comprehensive mobile design system (spacing, typography, touch targets)
- [ ] Implement mobile-first component library updates
- [ ] Add touch gesture support (swipe, pull-to-refresh where appropriate)

**8.2 PWA Implementation**
- [ ] Add Next.js PWA plugin (`next-pwa`)
- [ ] Create service worker for offline functionality
- [ ] Implement app manifest with proper icons and metadata
- [ ] Add install prompt and offline fallback pages
- [ ] Cache strategy for API calls and static assets

**8.3 Mobile Navigation Overhaul**
- [ ] Replace basic hamburger menu with modern mobile navigation
- [ ] Implement bottom navigation bar for mobile (common pattern)
- [ ] Add swipe gestures for navigation
- [ ] Improve mobile chat interface (larger touch targets, better keyboard handling)

**8.4 Desktop Experience Enhancement**
- [ ] Modernize desktop navigation (sidebar improvements, keyboard shortcuts)
- [ ] Enhance dashboard layout for larger screens
- [ ] Add desktop-specific features (multi-column views, advanced filtering)
- [ ] Improve desktop chat experience (better message threading, keyboard navigation)

**8.5 Cross-Platform Testing**
- [ ] Set up device testing (iOS Safari, Android Chrome, desktop browsers)
- [ ] Implement responsive testing automation
- [ ] Performance testing on real devices
- [ ] Accessibility testing across platforms

---

### Phase 9: Planning Agents & Codebase Upgrade
**Goal:** Upgrade planning agents to fully leverage get-shit-done methodology and create comprehensive skill library
**Effort:** Medium
**Dependencies:** None (can run parallel with other phases)

#### Success Criteria
1. All planning agents reference and use get-shit-done templates consistently
2. Comprehensive skill library created covering key domains (React, Next.js, LangChain, Testing, etc.)
3. Planning agents can autonomously use skills without manual reference
4. Documentation consolidated and accessible to agents

#### Tasks

**9.1 Get-Shit-Done Skills Library Creation**
- [ ] Audit existing templates and workflows in `.claude/get-shit-done/`
- [ ] Create skill files:
  - `nextjs-best-practices.md` (App Router, Server Components, etc.)
  - `langchain-patterns.md` (LangGraph, agent patterns, state management)
  - `testing-strategies.md` (Jest, React Testing Library, E2E patterns)
  - `database-patterns.md` (Drizzle ORM, migrations, type safety)
  - `api-design.md` (Next.js API routes, error handling, validation)
- [ ] Document skill integration pattern for agents

**9.2 Planning Agent Upgrades**
- [ ] Update `gsd-planner.md` to reference skills library
- [ ] Update `gsd-roadmapper.md` to use roadmap template format
- [ ] Add skill discovery mechanism to agent prompts

**9.3 Documentation Consolidation**
- [ ] Consolidate get-shit-done templates into agent-accessible format
- [ ] Create agent skill index/registry (README.md)
- [ ] Document how agents should discover and use skills
- [ ] Create skill contribution guidelines

**9.4 Agent Testing & Validation**
- [ ] Test planning agents with new skills
- [ ] Validate roadmap generation matches template
- [ ] Verify skill references work correctly

---

## Priority Matrix

| Phase | Priority | Effort | Risk if Skipped |
|-------|----------|--------|-----------------|
| Phase 1: Test Stabilization | P0 | Low | Bugs ship to prod |
| Phase 2: Critical Security | P0 | Low | Data breach |
| Phase 3: Accessibility | P1 | Medium | Users blocked, legal risk |
| Phase 4: Backend Hardening | P1 | Medium | Production incidents |
| Phase 5: Performance | P2 | Medium | Poor UX |
| Phase 6: Documentation | P2 | Medium | Onboarding friction |
| Phase 7: Component Testing | P3 | High | Regression risk |
| Phase 8: Web/Mobile Revamp | P1 | High | Mobile users blocked, competitive disadvantage |
| Phase 9: Planning Agents Upgrade | P2 | Medium | Future planning inefficiency |

---

## Recommended Execution Order

```
Week 1: Phase 1 + Phase 2 (parallel)
         └── Tests + Critical Security

Week 2: Phase 3 + Phase 6.1-6.2 + Phase 9 (parallel)
         └── Accessibility + User/API Docs + Agent Upgrade

Week 3: Phase 4
         └── Backend Hardening

Week 4: Phase 5 + Phase 6.3-6.4 (parallel)
         └── Performance + Dev Docs

Week 5+: Phase 7
         └── Component Testing

Week 6+: Phase 8 (after Phase 3 & 5 complete)
         └── Web/Mobile Revamp
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] 272/272 tests passing (100%)
- [ ] CI pipeline green

### Phase 2 Complete When:
- [ ] `/api/user` no longer returns passwordHash
- [ ] Database SSL configured for production
- [ ] Startup validation prevents missing secrets

### Phase 3 Complete When:
- [ ] Mobile navigation functional on all screen sizes
- [ ] Lighthouse accessibility score >= 90
- [ ] No WCAG 2.1 AA violations

### Phase 4 Complete When:
- [ ] Rate limiting active on all endpoints
- [ ] LLM calls have timeouts
- [ ] Session logout implemented

### Phase 5 Complete When:
- [ ] Chat scroll performance improved (no unnecessary re-renders)
- [ ] Message list virtualized for 100+ messages
- [ ] Mermaid dynamically imported

### Phase 6 Complete When:
- [ ] User guide: 4+ pages published
- [ ] API docs: All endpoints documented
- [ ] CHANGELOG.md exists and is current

### Phase 7 Complete When:
- [ ] Component test coverage >= 70%
- [ ] Accessibility tests in CI

### Phase 8 Complete When:
- [ ] Lighthouse mobile score >= 90
- [ ] PWA installable and works offline for core features
- [ ] Mobile navigation fully functional with bottom nav bar
- [ ] Desktop experience enhanced with keyboard shortcuts
- [ ] Cross-platform design consistency verified across iOS/Android/desktop

### Phase 9 Complete When:
- [ ] 5+ skill files created and documented in `.claude/skills/`
- [ ] Skills README.md with index and usage guide exists
- [ ] gsd-planner.md references skills library
- [ ] gsd-roadmapper.md references skills and templates
- [ ] Planning agents can discover and use skills automatically

---

## Technical Debt Tracker

| Item | Location | Severity | Phase to Address |
|------|----------|----------|------------------|
| Duplicate `teamsRelations` definition | lib/db/schema.ts:88,296 | Low | Phase 4 |
| `as any` casts in validation | app/api/projects/[id]/validate/route.ts | Medium | Phase 4 |
| Dual chat mode (LangGraph + legacy) | Multiple files | Medium | Future |
| Duplicate CSS variable systems | theme.css + globals.css | Low | Phase 3 |
| `estimateTokenCount` in 3 files | Multiple | Low | Phase 5 |

---

## Files to Modify (Quick Reference)

### Phase 1
- `lib/diagrams/__tests__/generators.test.ts`
- `lib/diagrams/generators.ts` (parseRelationship fix)
- `lib/langchain/graphs/__tests__/priority-scorer.test.ts`
- `lib/langchain/graphs/__tests__/completion-detector.test.ts`
- `lib/langchain/agents/intake/completion-detector.ts`

### Phase 2
- `app/api/user/route.ts`
- `lib/db/drizzle.ts`
- Create: `lib/startup-validation.ts`

### Phase 3
- `app/(dashboard)/layout.tsx`
- `components/chat/chat-window.tsx`
- `app/(dashboard)/projects/[id]/layout.tsx`
- `components/projects/project-form.tsx`

### Phase 4
- Create: `lib/middleware/rate-limit.ts`
- `lib/langchain/graphs/nodes/analyze-response.ts`
- `lib/auth/session.ts`
- Create: `app/api/auth/logout/route.ts`

---

## Appendix: Agent Reports

### A. QA Engineer Report
See: 15 test failures analyzed with root causes and fix approaches

### B. Backend Architect Report
See: Security issues, performance concerns, technical debt assessment

### C. UI/UX Engineer Report
See: Accessibility gaps, mobile issues, performance optimizations

### D. Documentation Engineer Report
See: Documentation gaps matrix with priority recommendations

---

*Plan created: 2026-01-19*
*Version: 1.1.0-planning*
