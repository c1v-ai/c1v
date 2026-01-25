# Codebase Concerns

**Analysis Date:** 2025-01-25

## Tech Debt

**Extensive `as any` Type Casting (High Priority):**
- Issue: 32+ uses of `as any` to bypass TypeScript type checking for JSONB fields
- Files:
  - `app/actions/conversations.ts` (lines 135-167)
  - `app/api/chat/projects/[projectId]/save/route.ts` (lines 166-200)
  - `app/(dashboard)/projects/[id]/data/page.tsx` (lines 30-33)
  - `app/(dashboard)/projects/[id]/diagrams/page.tsx` (lines 71-89)
  - `app/api/projects/[id]/validate/route.ts` (lines 83-87)
  - `lib/langchain/graphs/channels.ts` (line 378)
  - `app/actions/projects.ts` (line 61)
- Impact: Type safety bypassed for critical project data fields (actors, useCases, systemBoundaries, dataEntities). Runtime type errors possible. Refactoring harder due to unclear types.
- Fix approach: Create proper Zod schemas or TypeScript interfaces for JSONB fields. Use type guards in `lib/db/type-guards.ts` consistently instead of casting.

**TODO Comments (Medium Priority):**
- Issue: Incomplete features marked with TODO comments
- Files:
  - `lib/hooks/use-keyboard-shortcuts.ts:67` - Command palette not implemented
  - `lib/hooks/use-keyboard-shortcuts.ts:83` - New project dialog not implemented
  - `lib/langchain/graphs/nodes/check-sr-cornell.ts:194` - Out-of-scope tracking incomplete
  - `app/(login)/actions.ts:467` - Invitation email not sent
- Impact: User-facing features partially implemented. Keyboard shortcuts do nothing.
- Fix approach: Implement each feature or remove dead code. Priority: invitation emails (blocks team invites).

**Console.log Pollution (Medium Priority):**
- Issue: 143 console.log/warn/error statements across 38 source files
- Files: Distributed across `lib/langchain/`, `app/api/`, `app/actions/`, `components/`
- Impact: Production logs cluttered. Performance impact on high-volume chat endpoints. Potential sensitive data leakage in logs.
- Fix approach: Introduce structured logging library (pino, winston). Replace console.* with logger calls. Add log levels. Strip debug logs in production builds.

**Duplicate Token Estimation Function:**
- Issue: `estimateTokenCount` function duplicated in two files
- Files:
  - `app/api/chat/projects/[projectId]/route.ts` (line 428)
  - `app/actions/conversations.ts` (line 231)
- Impact: Code duplication. Inconsistent behavior if modified in one place.
- Fix approach: Extract to `lib/langchain/utils.ts` and import in both locations.

**Legacy Mode Code Path:**
- Issue: Dual implementation paths controlled by `USE_LANGGRAPH` feature flag
- Files: `app/api/chat/projects/[projectId]/route.ts` (lines 186-316)
- Impact: Increased maintenance burden. Two code paths to test. Legacy prompt-based approach inline in route handler.
- Fix approach: Once LangGraph is stable, remove legacy code path and feature flag.

## Known Bugs

**Streaming Response Not Saved (Critical):**
- Symptoms: AI responses in legacy mode not persisted to database
- Files: `app/api/chat/projects/[projectId]/route.ts` (lines 310-316)
- Trigger: Using chat without LangGraph enabled (`USE_LANGGRAPH=false`)
- Workaround: Comment on lines 312-314 acknowledges issue. Client must make follow-up request.

**Session Not Refreshed on API Routes:**
- Symptoms: Session token refresh only happens on GET requests, not POST/PUT/DELETE
- Files: `middleware.ts` (line 18: `request.method === 'GET'`)
- Trigger: Heavy API usage without page navigations causes session expiry
- Workaround: None currently

## Security Considerations

**No API Rate Limiting:**
- Risk: Chat endpoints vulnerable to abuse. LLM API costs could spike. DoS attacks possible.
- Files:
  - `app/api/chat/projects/[projectId]/route.ts`
  - `app/api/chat/route.ts`
  - All API routes under `app/api/`
- Current mitigation: Authentication required for all API routes
- Recommendations: Add rate limiting middleware (e.g., Upstash ratelimit). Implement per-user daily token limits. Add IP-based throttling for unauthenticated endpoints.

**Stripe Webhook Secret Non-Null Assertion:**
- Risk: Server crashes if `STRIPE_WEBHOOK_SECRET` not set
- Files: `app/api/stripe/webhook/route.ts` (line 5)
- Current mitigation: None - uses `process.env.STRIPE_WEBHOOK_SECRET!`
- Recommendations: Add to `lib/config/env.ts` schema. Fail gracefully with proper error response.

**Password Reset Token Handling:**
- Risk: Token hash storage and verification in plain-code queries
- Files: `app/(login)/actions.ts`, `lib/db/schema.ts`
- Current mitigation: Tokens hashed with crypto, expire after set time
- Recommendations: Review token expiry duration. Add rate limiting on password reset requests.

**Environment Variables Without Validation:**
- Risk: Some env vars accessed directly with `!` assertions, bypassing zod validation
- Files:
  - `app/api/stripe/webhook/route.ts:5` - `STRIPE_WEBHOOK_SECRET!`
  - `lib/payments/stripe.ts:10` - `STRIPE_SECRET_KEY!`
  - `lib/auth/session.ts:6` - `AUTH_SECRET`
- Current mitigation: Partial validation in `lib/config/env.ts` (only validates 4 vars)
- Recommendations: Expand `lib/config/env.ts` to validate ALL required env vars. Remove `!` assertions.

**XSS in Mermaid Diagrams:**
- Risk: User input flows into Mermaid diagram generation. Mermaid renders as SVG.
- Files: `lib/diagrams/generators.ts`, `components/diagrams/diagram-viewer.tsx`
- Current mitigation: Some escaping in generators (line 1225 checks)
- Recommendations: Audit all user input paths to diagram generation. Ensure Mermaid security mode enabled. Sanitize all labels/names.

## Performance Bottlenecks

**Large Files (Potential Complexity):**
- Problem: Several files exceed 400 lines, indicating possible need for refactoring
- Files:
  - `lib/diagrams/generators.ts` (1476 lines)
  - `app/(login)/actions.ts` (664 lines)
  - `lib/validation/validator.ts` (643 lines)
  - `lib/langchain/graphs/types.ts` (585 lines)
  - `lib/langchain/graphs/utils.ts` (572 lines)
  - `lib/langchain/prompts.ts` (553 lines)
  - `lib/langchain/graphs/checkpointer.ts` (553 lines)
- Cause: Monolithic modules accumulating functionality
- Improvement path: Split into focused modules. `generators.ts` could be split by diagram type. `actions.ts` by auth action type.

**Extraction Triggered Every 5 Messages:**
- Problem: Data extraction runs on every 5th message, even if no new extractable content
- Files: `app/actions/conversations.ts` (lines 94-178)
- Cause: Fixed interval extraction regardless of content
- Improvement path: Use LLM to detect if response contains extractable data. Skip extraction for simple confirmations.

**No Database Query Caching:**
- Problem: Repeated queries for same project/user data within single request
- Files: Most API routes call `getUser()` and `getTeamForUser()` separately
- Cause: No request-scoped caching
- Improvement path: Implement React cache() or request-scoped memoization.

## Fragile Areas

**LangGraph State Checkpointing:**
- Files:
  - `lib/langchain/graphs/checkpointer.ts`
  - `lib/langchain/graphs/channels.ts`
  - `lib/langchain/graphs/intake-graph.ts`
- Why fragile: Complex serialization/deserialization of LangChain message types. State migration function handles version changes. Dynamic imports to avoid circular dependencies.
- Safe modification: Always test with existing checkpoints. Add migration tests. Verify message types round-trip correctly.
- Test coverage: `lib/langchain/graphs/__tests__/state-manager.test.ts` exists but may not cover all edge cases.

**Project Data JSONB Fields:**
- Files:
  - `lib/db/schema.ts` (projectData table: actors, useCases, systemBoundaries, dataEntities)
  - `lib/db/type-guards.ts`
- Why fragile: Schema-less JSONB storage. Type guards exist but not consistently used. Any code change must handle malformed data.
- Safe modification: Always use type guards. Add validation before writes. Test with corrupted data scenarios.
- Test coverage: Limited - type guards not unit tested.

**Chat API Route (Dual Mode):**
- Files: `app/api/chat/projects/[projectId]/route.ts`
- Why fragile: 466-line file with two separate implementation paths. Feature flag switches behavior. Legacy mode inline, LangGraph mode in handler.
- Safe modification: Test both paths. Consider splitting into separate route handlers.
- Test coverage: No direct tests for route handlers.

## Scaling Limits

**Database Connection Pool:**
- Current capacity: 10 connections (`lib/db/drizzle.ts` line 14)
- Limit: With 10 concurrent users doing chat, pool could saturate during extraction
- Scaling path: Increase pool size. Add connection pooler (pgBouncer). Consider serverless Postgres.

**LangGraph Singleton Pattern:**
- Current capacity: Single compiled graph instance (`lib/langchain/graphs/intake-graph.ts` lines 323-344)
- Limit: Graph instance holds no state, but compilation happens once per cold start
- Scaling path: Current pattern is fine for serverless. Consider if custom checkpointer needs scaling.

## Dependencies at Risk

**`ai` Package (Vercel AI SDK):**
- Risk: Import used for `StreamingTextResponse` which is deprecated pattern
- Impact: May need refactoring for newer streaming patterns
- Migration plan: Move to native Web Streams API or updated ai SDK streaming utilities

## Missing Critical Features

**Error Tracking:**
- Problem: No Sentry or similar error tracking configured
- Blocks: Production debugging. Understanding error frequency.

**Structured Logging:**
- Problem: Only console.log statements. No log aggregation.
- Blocks: Production monitoring. Log search/analysis.

**API Documentation:**
- Problem: No OpenAPI/Swagger spec for API routes
- Blocks: Client integration. API testing tools.

## Test Coverage Gaps

**API Route Tests:**
- What's not tested: All route handlers under `app/api/`
- Files: `app/api/chat/projects/[projectId]/route.ts`, `app/api/projects/`, etc.
- Risk: Authentication, authorization, error handling untested
- Priority: High

**Authentication Flow:**
- What's not tested: `app/(login)/actions.ts` sign-in/sign-up/password-reset flows
- Files: `app/(login)/actions.ts`, `lib/auth/session.ts`
- Risk: Critical security flows not verified
- Priority: High

**Component Tests:**
- What's not tested: React components under `components/`
- Files: `components/chat/`, `components/diagrams/`, `components/ui/`
- Risk: UI regressions undetected
- Priority: Medium

**Database Queries:**
- What's not tested: `lib/db/queries.ts`
- Risk: Query logic changes could break silently
- Priority: Medium

**Current Test Files:**
- `lib/langchain/__tests__/schemas.test.ts`
- `lib/langchain/graphs/__tests__/analyze-response.test.ts`
- `lib/langchain/graphs/__tests__/intake-graph.test.ts`
- `lib/langchain/graphs/__tests__/state-manager.test.ts`
- `lib/langchain/graphs/__tests__/completion-detector.test.ts`
- `lib/langchain/graphs/__tests__/priority-scorer.test.ts`
- `lib/diagrams/__tests__/generators.test.ts`
- `tests/e2e/responsive.spec.ts`
- `tests/e2e/pwa.spec.ts`

Coverage is concentrated in LangGraph/LangChain logic. API routes, auth, and components have no unit tests.

---

*Concerns audit: 2025-01-25*
