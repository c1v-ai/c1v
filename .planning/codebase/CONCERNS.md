# Codebase Concerns

**Analysis Date:** 2026-04-28

## Tech Debt

**Plaintext Password Echoed in Server Action Error Responses:**
- Issue: The `signIn`, `signUp`, and `deleteAccount` server actions in `app/(login)/actions.ts` return the user's plaintext password back to the client in error response objects (e.g., `return { error: '...', email, password }`).
- Files: `app/(login)/actions.ts` (lines 72-75, 87-90, 127-128, 147-148, 155, 194, 319-320)
- Impact: Password values are serialized into the React Server Action response and visible in network payloads.
- Fix approach: Stop returning `password` in error objects. Only return `{ error: '...', email }`.

**Debug Logging Left in Production Code (`[STATE_DEBUG]`):**
- Issue: 27+ `console.log` calls with `[STATE_DEBUG]` prefix remain in the LangGraph handler.
- Files: `app/api/chat/projects/[projectId]/langgraph-handler.ts` (lines 107-239, 558-616, 1087-1088, 1200)
- Impact: Log noise in production, potential performance overhead, information leakage about internal state machine.
- Fix approach: Remove or gate behind `NODE_ENV === 'development'` check.

**251 Unstructured `console.*` Calls Across 55 Source Files:**
- Issue: No structured logging framework. Highest density in `lib/db/setup.ts` (37 calls), `langgraph-handler.ts` (39 calls).
- Fix approach: Adopt pino. Define log levels. Replace `console.*` starting with API routes and agents.

**`as any` Hacks in Quick-Start Orchestrator:**
- Issue: Diagram results stashed onto function objects: `(generateArtifacts as any).__contextDiagram`.
- Files: `lib/langchain/quick-start/orchestrator.ts` (lines 497, 511, 718, 729)
- Fix approach: Return diagram content as part of a structured result object.

**Pervasive `as any` Type Assertions in Project Data Handling (93 occurrences):**
- Issue: Project data fields (`actors`, `useCases`, etc.) cast to `any` in 14 files across `app/actions/`, `app/(dashboard)/projects/`.
- Fix approach: Define proper Drizzle inference types for JSONB columns. Use Zod parsing at the boundary.

**Five `@ts-expect-error` Suppressions in LLM Config:**
- Issue: All 5 LLM instances suppress `cacheControl` type errors (LangChain types lag Anthropic API).
- Files: `lib/langchain/config.ts` (lines 25, 40, 54, 67, 82)
- Fix approach: Check if `@langchain/anthropic` has added `cacheControl` to types; extend locally if not.

**Duplicate Migration File Sequence Number (0004):**
- Issue: Two migration files share the `0004` prefix. `drizzle-kit migrate` is **broken**.
- Files: `lib/db/migrations/0004_elite_naoko.sql`, `lib/db/migrations/0004_v2_data_model_depth.sql`
- Workaround: Use `pnpm db:migrate:sql` (psql loop) or Supabase SQL editor directly.

**Deprecated `StreamingTextResponse` from `ai` Package:**
- Issue: Legacy chat mode uses deprecated `StreamingTextResponse`.
- Files: `app/api/chat/projects/[projectId]/route.ts` (lines 2, 377)
- Fix approach: Migrate to `streamText()` or remove legacy chat path.

**Test Debug Endpoint Exposed in Production:**
- Issue: `/api/test-llm` — unauthenticated, makes real LLM calls, was created for Turbopack debugging.
- Files: `app/api/test-llm/route.ts`
- Fix approach: Gate behind `NODE_ENV === 'development'` or delete entirely.

**Duplicate `getUser()` Calls in `getTeamForUser()`:**
- Issue: Every API route calling both `getUser()` + `getTeamForUser()` executes `getUser()` twice (30 call sites across 11 files).
- Fix approach: Create unified `getAuthContext()` returning `{ user, team }` in one flow.

**Legacy Chat Mode (564 lines of dead-path code):**
- Issue: `route.ts` contains complete legacy chat implementation only running when `USE_LANGGRAPH` is unset.
- Files: `app/api/chat/projects/[projectId]/route.ts` (lines 211-393)
- Fix approach: Remove legacy path or extract to fallback file.

## Known Bugs

**`pnpm build` Failure on Sign-In Page:**
- Symptoms: `createClientModuleProxy` error on `/sign-in` page during `next build`.
- Workaround: App runs fine in development. Pre-existing issue.

**`drizzle-kit migrate` Broken:**
- Symptoms: Migration command fails due to `api_keys` table conflict / duplicate 0004 migrations.
- Workaround: `pnpm db:migrate:sql` or manual psql execution.

**`cleo session/add` Broken in v0.69.2:**
- Symptoms: Listed in `cleo help` but returns "Unknown command" at runtime.
- Workaround: Use Task tool as fallback.

**Turborepo Silently Filters Env Vars:**
- Symptoms: Vercel build fails with "ENV_VAR Required" even when set in Vercel dashboard.
- Root cause: Turborepo strips any var not declared in `turbo.json` task `env[]`.
- Rule: When adding a build-time env var, update Vercel AND `turbo.json` as a pair.

## Security Considerations

**`projects` Table RLS Gap (P3 — deferred post-v2):**
- Risk: `projects` table has RLS enabled but **zero tenant policies**. EXISTS gates from non-owner roles return 0 rows.
- Files: `lib/db/migrations/` — RLS enabled but policies missing for `projects`.
- Tracked: `plans/post-v2-followups.md`
- Priority: P3 security pass.

**Plaintext Password in Error Responses:**
- Risk: User plaintext passwords visible in browser DevTools Network tab and potentially logged by CDN/proxy.
- Files: `app/(login)/actions.ts`

**No Content Security Policy (CSP):**
- Risk: No CSP headers. XSS attacks could load external scripts. Mermaid evaluates dynamic content.
- Files: `middleware.ts` (sets X-Frame-Options, X-XSS-Protection, X-Content-Type-Options but no CSP)
- Fix: Add CSP header with `script-src 'self'` baseline.

**Direct DOM Manipulation for Mermaid SVG:**
- Risk: LLM-generated Mermaid syntax could contain malicious SVG with embedded scripts.
- Files: `components/diagrams/diagram-viewer.tsx` (line 169)
- Fix: Sanitize SVG output with DOMPurify before DOM injection.

**MCP CORS Allows Fallback Origin `http://localhost:3000`:**
- Risk: If `BASE_URL` env var is unset, CORS allows localhost in production.
- Files: `app/api/mcp/[projectId]/route.ts` (line 112)
- Current mitigation: API key auth + rate limiting (100 req/min).

**In-Memory Rate Limiting Does Not Survive Restarts/Scaling:**
- Risk: `Map` state resets on every cold start. Multiple serverless instances don't share state.
- Files: `lib/mcp/rate-limit.ts` (line 13)
- Scaling path: Migrate to Upstash Redis rate limiting.

**JWT Session Has No Token Rotation / Revocation:**
- Risk: Compromised tokens remain valid for 24 hours. No server-side invalidation.
- Fix: Add session ID in database to enable revocation.

**Middleware Matcher Excludes All `/api` Routes from Security Headers:**
- Risk: Security headers not applied to API responses.
- Files: `middleware.ts` (line 67 — matcher excludes `api`)

## Performance Bottlenecks

**1,202-Line LangGraph Handler (God File):**
- Files: `app/api/chat/projects/[projectId]/langgraph-handler.ts`
- Improvement path: Extract `triggerPostIntakeGeneration()`, entity derivation, diagram save logic into separate modules.

**Post-Intake Generation: 5 Parallel + 1 Sequential LLM Calls:**
- Files: `langgraph-handler.ts` (lines 952-977)
- All generators run every time with no caching. Each is Claude Sonnet. Significant cost + latency.
- Improvement path: Cache individual generator results. Consider Haiku for simpler generators.

**2,035-Line `generators.ts` Diagram Generator:**
- Files: `lib/diagrams/generators.ts`
- Improvement path: Split into one file per diagram type.

**Redundant User Queries on Every Authenticated Request:**
- `getTeamForUser()` calls `getUser()` internally. 30 call sites do both redundantly.
- Improvement path: Create `getAuthContext()` returning `{ user, team }` in one DB flow.

**Turbopack Module Duplication Workarounds:**
- Files: `lib/langchain/graphs/utils.ts` (lines 22-60) — 3 fallback strategies for message type detection
- Root cause: Turbopack ESM bundling creates duplicate `@langchain/core/messages` class instances.

**No Error Boundaries in App Routes:**
- Zero `error.tsx` files in the entire `/app` directory. One `loading.tsx` exists.
- Improvement path: Add `error.tsx` at `app/(dashboard)/error.tsx` and `app/(login)/error.tsx` minimum.

## Fragile Areas

**LangGraph Intake State Machine (Edges + Checkpointer):**
- Files: `lib/langchain/graphs/edges.ts`, `checkpointer.ts`, `channels.ts`, `intake-graph.ts`
- Why fragile: 4 routing functions with complex conditional chains (intent + artifactReadiness + completeness + generatedArtifacts + approvalPending + kbStepConfidence). Custom checkpointer (not LangGraph built-in).
- Safe modification: Always run `intake-graph.test.ts` (739 lines) + `completion-detector.test.ts` (744 lines) before changing routing.

**Wave E Evaluator (wave-e/te1-integration branch):**
- Files: `lib/engines/wave-e-evaluator.ts` — 2-band routing + LLM-refine hook + contract envelope
- Why fragile: LLM-refine hook is a stub (`TODO: wire real LLM`). Confidence band boundaries are hardcoded thresholds. Contract envelope version is frozen at v1.
- Status: 13/13 tests green on branch. Not yet merged to main.
- Safe modification: Run `lib/engines/__tests__/` before any change. LLM-refine stub must be wired before production use.

**Custom Channel Reducers (State Merge Logic):**
- Files: `lib/langchain/graphs/channels.ts` (521 lines)
- Why fragile: Bypasses LangGraph's built-in Annotation system. If a channel key is added to `IntakeState` but not to `intakeStateChannels`, updates silently fail.
- Safe modification: Add new channels to BOTH `IntakeState` type AND `intakeStateChannels` object.

**Post-Intake Entity Derivation (Regex-Based Inference):**
- Files: `langgraph-handler.ts` (lines 655-806)
- Why fragile: 150+ lines of hardcoded regex patterns (`/authenticat/i`, `/trust/i`, etc.) domain-specific to auth projects. Wrong results for e-commerce, social media, etc.
- No dedicated tests. Replace with LLM-based derivation.

**Duplicate State Manager Implementations:**
- Files: `lib/langchain/agents/intake/state-manager.ts` (492 lines) vs `lib/langchain/graphs/channels.ts` (521 lines)
- Two separate state management systems with overlapping but different state shapes.
- Determine which is active; deprecate the other.

**Knowledge Bank Token Budget (No Guard):**
- Files: `lib/education/generator-kb.ts` (894 lines of content)
- KB content injected via string interpolation into PromptTemplate. No token counting before injection.
- Risk: As KB grows, agent calls may silently exceed context window limits.

## Scaling Limits

**In-Memory Rate Limiting:** Works for single-instance. Scaling path: Upstash/Vercel KV.

**DB Connection Pool (10 connections):** Exhaustion possible under heavy concurrent chat. Supabase PgBouncer available.

**Checkpoint Storage (Single Row Per Project):** No history. Concurrent chat tabs overwrite each other. `threadId` column exists but only `'main'` is used.

**Token Estimation is Crude:** `Math.ceil(text.length / 4)` — GPT-era approximation, inaccurate for Claude.

## Dependencies at Risk

**LangChain Ecosystem Rapid Versioning:** 4 interrelated packages (`@langchain/anthropic@0.3.14`, `@langchain/core@0.3.40`, `@langchain/langgraph@0.2.60`, `langchain@0.3.26`). Pin exact versions.

**`ai` Package `StreamingTextResponse` Deprecation:** Version 3.4.33. Will be removed in future updates.

**`beautiful-mermaid@0.1.3`:** Very early version of niche package. Unknown maintenance status. Fallback: direct `mermaid` 11.12.2 rendering.

## Missing Critical Features

**No CSRF Protection on Mutation Routes:** Server actions and API POST routes have no CSRF token validation.

**No Request Validation on Chat API Body:** Missing body shape validation before processing in `app/api/chat/projects/[projectId]/route.ts`.

**No Health Check Endpoint:** No `/api/health` for database connectivity, LLM API availability, or Stripe webhook status.

**No Error Boundaries:** Zero `error.tsx` files. Unhandled errors crash pages with Next.js default error UI.

## Test Coverage Gaps

**No Tests for Post-Intake Generation Pipeline:** `triggerPostIntakeGeneration()` (430+ lines) orchestrating 6 LLM agents — zero test coverage. **High priority.**

**No Tests for Chat API Route Handler:** Auth flow, rate limiting, LangGraph vs legacy switching, streaming. **High priority.**

**No Tests for Auth Actions:** Sign-in/sign-up/password-reset flows in `app/(login)/actions.ts` (692 lines).

**No Tests for Entity Derivation Logic:** Regex-based entity inference (lines 655-806 of langgraph-handler.ts).

**Wave E / qa-bot App:** `apps/qa-bot/` has no test coverage. Wave E evaluator has 13 unit tests but zero integration/E2E coverage.

---

*Concerns audit: 2026-04-28*
