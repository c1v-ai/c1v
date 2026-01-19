# Product Helper v1.1 Roadmap

**Created:** 2026-01-19
**Status:** In Progress (Phase 1 & 2 Complete, Phase 3 Planned)
**Target:** Stabilization, Security Hardening, Quality Improvement

---

## Executive Summary

Product Helper v1.0 is a functional AI-powered PRD generation SaaS with LangGraph-based conversational intake, SR-CORNELL validation, and diagram generation. Version 1.1 focuses on:

1. **Stabilization** - Fix 15 failing tests ✓
2. **Security Hardening** - Address critical vulnerabilities ✓
3. **Mobile-First & Web Revamp** - PWA, dark mode, responsive design
4. **Quality Improvement** - Performance, documentation

---

## Current State Assessment

| Area | Score | Status |
|------|-------|--------|
| Test Suite | 317/317 passing (100%) | ✓ All tests pass |
| Security | Good | ✓ Critical issues addressed |
| Mobile/Responsive | Poor | Missing mobile nav, no dark mode |
| Performance | Good | Some optimization opportunities |
| Documentation | 65/100 | Major gaps in user/API docs |

---

## Phase Breakdown

### Phase 1: Test Stabilization ✓ COMPLETE
**Goal:** 100% passing test suite
**Status:** Complete (2026-01-19)
**Result:** 317/317 tests passing (100%)

Plans:
- [x] 01-01-PLAN.md - Fix 10 failing tests in generators.test.ts
- [x] 01-02-PLAN.md - Fix 2 failing tests in priority-scorer.test.ts
- [x] 01-03-PLAN.md - Fix 3 failing tests in completion-detector.test.ts

---

### Phase 2: Critical Security Fixes ✓ COMPLETE
**Goal:** Address critical security vulnerabilities
**Status:** Complete (2026-01-19)
**Result:** All 3 security tasks implemented and verified

Plans:
- [x] 02-01-PLAN.md — Environment validation setup (Zod schema, startup validation)
- [x] 02-02-PLAN.md — Apply security fixes (passwordHash filtering, database SSL)

#### Completed Tasks

**2.1 Fix /api/user password exposure (CRITICAL)** ✓
- [x] Filter passwordHash from user response in `app/api/user/route.ts`

**2.2 Add database SSL configuration** ✓
- [x] Update `lib/db/drizzle.ts` with SSL config for production
- [x] Add connection pooling configuration (max: 10, idle: 20s, connect: 10s)

**2.3 Validate required environment variables at startup** ✓
- [x] Add startup validation for AUTH_SECRET, OPENAI_API_KEY, POSTGRES_URL
- [x] Fail fast if secrets are missing or weak (AUTH_SECRET ≥32 chars, OPENAI_API_KEY starts with sk-)

---

### Phase 3: Mobile-First & Web Revamp
**Goal:** Modern, responsive, mobile-first experience with PWA capabilities and dark mode
**Effort:** High
**Dependencies:** Phase 2
**Plans:** 6 plans in 3 waves

Plans:
- [x] 03-01-PLAN.md — Light/dark mode with next-themes (Wave 1)
- [x] 03-02-PLAN.md — PWA setup with manifest and service worker (Wave 1)
- [ ] 03-03-PLAN.md — Mobile navigation: bottom nav and hamburger menu (Wave 2)
- [x] 03-04-PLAN.md — Mobile-first design system: touch targets, typography (Wave 2)
- [ ] 03-05-PLAN.md — Desktop enhancements: keyboard shortcuts, multi-column (Wave 3)
- [ ] 03-06-PLAN.md — Cross-platform testing with Playwright and Lighthouse (Wave 3)

#### Success Criteria
1. Web app works seamlessly on mobile devices (< 768px) with native-feel interactions
2. PWA installable with offline capabilities for core features
3. Desktop experience enhanced with modern UI patterns and improved navigation
4. Light/dark mode follows system preference with manual override option
5. Lighthouse mobile score >= 90

#### Wave Structure

| Wave | Plans | Parallel | Focus |
|------|-------|----------|-------|
| 1 | 03-01, 03-02 | Yes | Foundation (theme, PWA) |
| 2 | 03-03, 03-04 | Yes | Mobile (nav, design system) |
| 3 | 03-05, 03-06 | Yes | Desktop + Testing |

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
**Dependencies:** Phase 1

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
**Dependencies:** Phase 5

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
- [ ] Test theme toggle and dark mode switching

---

### Phase 8: Planning Agents & Codebase Upgrade
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
| Phase 3: Mobile-First & Web Revamp | P1 | High | Mobile users blocked, poor UX |
| Phase 4: Backend Hardening | P1 | Medium | Production incidents |
| Phase 5: Performance | P2 | Medium | Poor UX |
| Phase 6: Documentation | P2 | Medium | Onboarding friction |
| Phase 7: Component Testing | P3 | High | Regression risk |
| Phase 8: Planning Agents Upgrade | P2 | Medium | Future planning inefficiency |

---

## Recommended Execution Order

```
Week 1: Phase 1 + Phase 2 (parallel) ✓ COMPLETE
         └── Tests + Critical Security

Week 2-3: Phase 3 + Phase 6.1-6.2 (parallel)
         └── Mobile-First & Web Revamp + User/API Docs

Week 4: Phase 4 + Phase 8 (parallel)
         └── Backend Hardening + Agent Upgrade

Week 5: Phase 5 + Phase 6.3-6.4 (parallel)
         └── Performance + Dev Docs

Week 6+: Phase 7
         └── Component Testing
```

---

## Success Criteria

### Phase 1 Complete When:
- [x] 317/317 tests passing (100%)
- [x] CI pipeline green

### Phase 2 Complete When:
- [x] `/api/user` no longer returns passwordHash
- [x] Database SSL configured for production
- [x] Startup validation prevents missing secrets

### Phase 3 Complete When:
- [ ] Light/dark mode working with system preference detection
- [ ] Theme toggle accessible in header/settings
- [ ] Mobile navigation functional on all screen sizes
- [ ] Bottom navigation bar working on mobile
- [ ] PWA installable and works offline for core features
- [ ] Lighthouse mobile score >= 90

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
| Duplicate CSS variable systems | theme.css + globals.css | Low | Phase 3 (dark mode work) |
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
- Create: `lib/config/env.ts`

### Phase 3
- `app/layout.tsx` (theme provider, viewport, PWA metadata)
- `app/(dashboard)/layout.tsx` (mobile nav, theme toggle, keyboard shortcuts)
- `app/globals.css` (mobile-first utilities)
- `app/theme.css` (mobile form sizing)
- `app/manifest.ts` (create - PWA manifest)
- `app/offline/page.tsx` (create - offline fallback)
- `public/sw.js` (create - service worker)
- `components/theme/theme-provider.tsx` (create)
- `components/theme/mode-toggle.tsx` (create)
- `components/navigation/bottom-nav.tsx` (create)
- `components/navigation/mobile-menu.tsx` (create)
- `components/sw-register.tsx` (create)
- `components/projects/project-card.tsx` (create/enhance)
- `components/chat/chat-window.tsx` (mobile optimizations)
- `components/chat/chat-input.tsx` (mobile keyboard handling)
- `lib/hooks/use-media-query.ts` (create)
- `lib/hooks/use-keyboard-shortcuts.ts` (create)
- `playwright.config.ts` (create)
- `tests/e2e/responsive.spec.ts` (create)
- `tests/e2e/pwa.spec.ts` (create)

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
