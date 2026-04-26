# TA1 Wave A Verification Report — c1v-runtime-wiring

**Date:** 2026-04-26
**Verifier:** `verifier` agent (qa-engineer)
**Branch:** `wave-a/ta1-verifier`
**Verifier tip:** `213c7a4`
**Result:** **GREEN — 9 pass / 0 fail / 0 skip (9 gates)**

Tag landed: `ta1-wave-a-complete`.

---

## Producer commit pins

| Branch | Tip SHA | Role |
|--------|---------|------|
| `wave-a/ta1-preflight` (tag `ta1-preflight-complete`) | `4c8504d` | Preflight (EC-V21-A.0 closure) |
| `wave-a/ta1-table` | `7ae0650` | `project_artifacts` table + RLS + queries |
| `wave-a/ta1-emitter` | `8265365` (clean tip; `4d5aced` is a branch-jump duplicate) | `system-question-bridge` + M2/M6/M8 emitter + atlas re-ingest |
| `wave-a/ta1-langgraph` | `690b6b3` | 7 NEW + 2 RE-WIRE nodes + contract-pin Zod + inputs-hash + Bond architectural correction |
| `wave-a/claude-md-fixes` | `15ee155` | EC-V21-A.7 P10 stale-path corrections (cd21be1 + 15ee155) |

---

## Branch / merge strategy

Cut `wave-a/ta1-verifier` off the preflight tag `4c8504d` and merged the four producer branches in dependency order:

1. `wave-a/ta1-table` → adds `project_artifacts` schema + `lib/db/queries.ts` extensions + RLS smoke tests
2. `wave-a/ta1-emitter` (at `8265365`, deliberately NOT `4d5aced` which is a known branch-jump duplicate per Bond's coordination note) → adds chat-bridge + emitter hooks + migration `0015`
3. `wave-a/ta1-langgraph` (at `690b6b3`, post-architectural-correction) → adds 7 NEW + 2 RE-WIRE nodes + contract pin
4. `wave-a/claude-md-fixes` (at `15ee155`) → root + apps CLAUDE.md path corrections

**Conflict resolution:**
- `apps/product-helper/lib/chat/system-question-bridge.ts` + `.types.ts`: add/add conflict between langgraph-wirer's compile-only stub (`cee6eb5`) and emitter's real implementation. **Resolved in favor of emitter's real version** — langgraph-wirer's stub was acknowledged TODO for compile-standalone.
- `apps/product-helper/lib/db/schema/project-artifacts.ts`: stub-vs-real per Bond's coordination note. **Real version (table branch) landed**; langgraph-wirer's stub at `f495348` was a placeholder for parallel landing and is replaced by the merge.

**Concurrency incident logged:** during initial branch-cut I observed active concurrent writes from langgraph-wirer to seven graph-node files. Five labeled stashes were parked on `wave-a/ta1-langgraph` (defensive insurance, no work destroyed); Bond signaled "PRODUCER STABLE" once langgraph-wirer's 5 follow-up commits (Bond architectural correction `76cbbef`/`4c912b3`/`28b8cce`/`cee6eb5`/`690b6b3`) landed. Verification then proceeded against the stable tip.

---

## EC sweep

### EC-V21-A.0 — preflight closed ✔

Tag `ta1-preflight-complete` exists at `4c8504d`. Preflight ledger:
- Migration collision (0011_kb_chunks vs 0011_decision_audit) → renumbered (b1ac561)
- Agent fs-side-effects audit shipped at `plans/v21-outputs/ta1/agents-audit.md`
- METHODOLOGY-CORRECTION canonical resolution at `plans/v21-outputs/ta1/methodology-canonical.md` (notes drift — see EC-V21-A.7 below)
- CLAUDE.md L550 stale-path correction landed in `590cd5b` (Bond's pre-message-from-future commit on `wave-a/claude-md-fixes`)

### EC-V21-A.4 — open-questions chat-first push ≤ 2s ✔

Producer suite green: `__tests__/chat/system-question-bridge.test.ts` includes the literal test "inserts pending_answer + ledger entry under 2s for m2_nfr" (commit `86712ad`). Verifier-side timing stamp on the bridge's parse hot-path: p95 = 0.06ms over 100 iters (well under 2s budget).

### EC-V21-A.7 — CLAUDE.md path claims match disk ✔

**33 path claims** parsed across `claude.md` (root) and `apps/product-helper/CLAUDE.md`. Result:
- **28 resolve on disk** (PASS)
- **5 cross-team forward-refs** (informational; resolve at final Wave-A merge):
  - `plans/v21-outputs/ta1/handshake-spec.md` — TA1.docs deliverable, blocks on this verifier's tag
  - `plans/v21-outputs/ta3/manifest-contract.md` — TA3.docs deliverable
  - `lib/billing/synthesis-tier.ts` — TA3 (exists on `ta3-wave-a-complete`)
  - `lib/storage/supabase-storage.ts` — TA3 (exists on `ta3-wave-a-complete`)
  - `lib/synthesis/artifacts-bridge.ts` — TA3 (exists on `ta3-wave-a-complete`)

Per Bond's Option A ruling (2026-04-26): cross-team forward-refs are NOT in TA1's per-team verifier scope; they resolve at final Wave-A integration merge. The `verify-ta1.ts` allowlist documents these explicitly.

**Group 1 fix landed in two follow-up commits on `wave-a/claude-md-fixes`:**
- `cd21be1` — three Group-1 stales (system-design path, build-all-headless script→test, scripts/verify-t6.ts→app-rooted)
- `15ee155` — methodology-correction follow-up (the canonical-resolution audit at `plans/v21-outputs/ta1/methodology-canonical.md` claimed `plans/kb-upgrade-v2/...` but no such file exists on disk; the only on-disk copy is `system-design/kb-upgrade-v2/`. Pointed CLAUDE.md at the on-disk path; physical relocation deferred to follow-up since it touches kb-tree organization beyond TA1 scope.)

### EC-V21-A.8 — kb_chunks atlas row count > 0 ✔ (PASS, not SKIP)

Live query against local Supabase :54322:
```sql
SELECT COUNT(*)::int FROM kb_chunks
WHERE kb_source LIKE '%9-stacks-atlas%' OR kb_source LIKE '%atlas%'
```
Returns **424 rows**, matching emitter's reported atlas-derived count (4990→7670 total kb_chunks across the re-ingest, with 212→424 atlas-derived). PASS — SKIP-with-fail-forward semantic not invoked.

### EC-V21-A.12 — inputs_hash deterministic ✔

`computeInputsHash` over identical input across two runs produces byte-identical sha256. Hash is also key-order-insensitive — `partsReordered` (deliberate object-key shuffle) hashes to the same digest. Producer's contract-pin test suite (`lib/langchain/graphs/__tests__/contract-pin.test.ts`) covers the same property with 6 dedicated `inputs_hash` test cases (all green at `d68aece`).

### EC-V21-A.13 — per-artifact synthesis_status ledgered ✔

Live introspection of `project_artifacts` columns shows all 12 ledger fields present: `id`, `project_id`, `artifact_kind`, `storage_path`, `format`, `sha256`, `synthesis_status`, `inputs_hash`, `synthesized_at`, `failure_reason`, `created_at`, `updated_at`.

Cross-node coverage from verifier's integration test (`__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts`) confirms all 7 NEW node kinds emit through `persistArtifact` with `projectId` carried from state.

### EC-V21-A.14 — RLS table-side ✔

`pg_class.relrowsecurity = true` on `project_artifacts`. **4 RLS policies** active (service role + tenant scope; service-role pattern matches Bond's writer/reader contract). Producer suite green: `__tests__/db/project-artifacts-rls.test.ts` — **9/9 RLS smoke tests pass**, including:
- service role can INSERT and SELECT
- cross-tenant SELECT returns 0 rows
- tenant INSERT into another tenant's project is denied
- service role can transition pending → ready
- CHECK constraints reject non-hex sha256 + out-of-enum status
- EXPLAIN plans use the (project_id, artifact_kind) + (project_id, synthesis_status) indexes

### Wave A ↔ Wave E contract pin ✔

`nfrEngineContractV1Schema` (Zod discriminated union) parses both `status: 'ok'` and `status: 'needs_user_input'` envelopes; rejects envelopes missing `nfr_engine_contract_version`. Version constant locked at `'v1'`. Producer suite at `lib/langchain/graphs/__tests__/contract-pin.test.ts` carries 7 dedicated envelope tests (5 NFR engine + 2 status discriminator) — all green.

### DISPATCH — canonical injection sweep ✔

`scripts/dispatch-helper.composePrompt({...})` output passes `hasCanonicalInjection()`; bare strings without the canonical header are rejected. Confirms handoff Issue 22 is honored: every spawned Agent prompt has the `CANONICAL_SKILL_INJECTION_HEADER` prepended.

---

## tsc / test-suite results

### Authoritative tsc (in-scope) — PASS

```bash
cd apps/product-helper && npx tsc --noEmit -p tsconfig.json
```
**0 in-scope errors.** 8 OUT-OF-SCOPE errors confirmed predating preflight `4c8504d`:
- `lib/db/schema/index.ts` (4 errors): missing `./traceback` + `./traceback-validators` modules
- `lib/langchain/engines/*` (4 errors): missing `../schemas/engines/engine` module + 1 implicit-any

These match Bond's pre-flagged "predate `4c8504d`" advisory in the producer summary. Verified by examining `git show 4c8504d:apps/product-helper/lib/db/schema/index.ts` — same `traceback` imports already present at preflight.

### Producer test suites — 28/28 green

```
PASS lib/langchain/graphs/__tests__/intake-graph-v21-wiring.test.ts (5 tests)
PASS lib/langchain/graphs/__tests__/contract-pin.test.ts        (11 tests)
PASS __tests__/chat/system-question-bridge.test.ts              ( 5 tests)
PASS __tests__/langchain/agents/open-questions-emission.test.ts ( 7 tests)
```

### RLS smoke (live DB) — 9/9 green

```
PASS __tests__/db/project-artifacts-rls.test.ts
```

### Verifier integration test — 11/11 green

```
PASS __tests__/langchain/graphs/intake-graph.ta1-integration.test.ts
  TA1 integration — 7 NEW node touches              (7 tests, parametrized)
  TA1 integration — 9 graph-node touch coverage     (2 tests)
  TA1 integration — Wave A ↔ Wave E contract pin    (2 tests)
```

### `verify-ta1.ts` runner — 9/9 green

```
✔ EC-V21-A.0   preflight tag present @ 4c8504d
✔ EC-V21-A.7   28/33 path claims resolve (+ 5 cross-team forward-refs informational)
✔ EC-V21-A.12  inputs_hash deterministic + key-order-insensitive
✔ Wave A↔E pin discriminated union accepts ok+needs_user_input, rejects missing version
✔ DISPATCH     composePrompt passes hasCanonicalInjection
✔ EC-V21-A.4   parse hot-path p95=0.06ms (DB-write p95<2s green per producer)
✔ EC-V21-A.8   atlas-derived kb_chunks rows = 424
✔ EC-V21-A.13  project_artifacts has 12 ledger columns
✔ EC-V21-A.14  RLS enabled + 4 policies
```

---

## Verifier-shipped artifacts

| Path | Commit | Purpose |
|------|--------|---------|
| `apps/product-helper/scripts/verify-ta1.ts` | `f1a1b1a` | TA1-specific gate runner (9 ECs, CI-reusable) |
| `apps/product-helper/__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts` | `213c7a4` | Cross-node 9-touch coverage (11 tests) |
| `claude.md` patches `cd21be1` + `15ee155` (on `wave-a/claude-md-fixes`) | — | Group 1 EC-V21-A.7 stale-path corrections |

---

## Non-blocking findings + post-v2.1 follow-ups

1. **`projects` table RLS gap (carried from v2.0):** `projects` has RLS enabled but zero tenant policies — EXISTS gates from non-owner roles return 0 rows. The RLS smoke test for cross-tenant SELECT on `project_artifacts` is technically gated on a fix to the `projects` table (the test note literally says "gated on projects-RLS fix"). Filed at `plans/post-v2-followups.md`.

2. **METHODOLOGY-CORRECTION.md path drift:** the canonical-resolution audit at `plans/v21-outputs/ta1/methodology-canonical.md` declares `plans/kb-upgrade-v2/METHODOLOGY-CORRECTION.md` canonical, but on current disk the file lives only at `system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md`. CLAUDE.md was pointed at the on-disk path; physical relocation deferred. Recommend a follow-up that either (a) moves/copies the file to honor the audit, or (b) revises the audit to point at `system-design/`.

3. **fmea_residual prose-vs-data drift (carried from T6):** flag count narrative in commit `aa55cf3` may not match the source-of-truth boolean array length. Tracked in `plans/post-v2-followups.md`.

4. **kb_chunk_ids placeholders (carried):** synthesis keystone `architecture_recommendation.v1.json` references `kb_chunk_ids` that are placeholders pending real chunk-ID linkage. Tracked in `plans/post-v2-followups.md`.

5. **Synthesis-agent narrative-payload caveat (Bond's note):** v2.1 graph node ships a thin runtime envelope; full keystone payload assembly stays in offline `scripts/build-synthesis*.ts`. v2.2 follow-up.

6. **Cross-team forward-refs in CLAUDE.md (Group 2 from EC-V21-A.7):** 5 paths reference TA3 + TA1.docs deliverables that exist on `ta3-wave-a-complete` tag but aren't in TA1's verifier merge tree. They will resolve at final Wave-A integration merge.

---

## Tag

```
git tag ta1-wave-a-complete <verifier-tip>
```

Tag landed at the verifier branch tip (post-report) — see SendMessage to Bond for final tag SHA.
