# `apps/product-helper/CLAUDE.md` — Proposed Diff (TA1, Wave A)

> **STATUS: pending-david-review.** Per file-safety rule, no CLAUDE.md edits land without explicit David authorization. Bond surfaces this diff to David; on approval, `docs` applies the patch in a follow-up commit.

**Scope:** add two new sections under `## Architecture` and amend the existing `## System-Design Data Path` section. NO new top-level sections beyond the two named in the TA1 spec.

**Coordination with TA3:** TA3's spawn-prompt referenced a sibling `plans/v21-outputs/ta3/claude-md-diff.md` but no such file exists on disk as of `wave-a/ta1-docs` branch start. This diff is therefore standalone. If TA3 ships a diff later, both must be reviewed together for conflicts in the `## Architecture` section anchor.

---

## Diff 1 — Insert `### Project Artifacts Table` under `## Architecture`

**Anchor:** insert AFTER the `### Educational Content System (Phase 12 - Active)` block and BEFORE `### Key Directories`. Reasoning: the Architecture section currently lists subsystems in dependency order (agents → MCP → education → directories); `project_artifacts` is a runtime persistence subsystem that fits before the directory listing.

**New content:**

```markdown
### Project Artifacts Table (`lib/db/schema/project-artifacts.ts`)

Per-tenant artifact persistence for synthesis outputs. Replaces the previous
"single `extractedData` blob" pattern for synthesis-stage artifacts (legacy M0–M2
intake data still lives in `extractedData`; M3–M8 + synthesis live here).

- **Shape:** one row per `(project_id, artifact_kind)`. Columns include `synthesis_status`
  (`pending` | `running` | `succeeded` | `failed` | `needs_user_input`), `sha256`
  (content hash for idempotency), `storage_url` (signed URL to Supabase Storage),
  `inputs_hash` (deterministic re-run key), `created_at`, `updated_at`.
- **RLS:** tenant-scoped via `project_id` → `projects.organization_id` → session role.
  Read access is RLS-gated; write access is service-role only (sidecar writer).
- **Sidecar writer pattern:** TA3's Cloud Run Python sidecar
  (`services/python-sidecar/orchestrator.py`) owns writes — it renders the artifact,
  uploads to Storage, and updates the row via service-role. TA1 owns the table schema +
  RLS + read-side queries (`getLatestSynthesis`, `getProjectArtifacts`).
- **Query helpers:** `apps/product-helper/lib/db/queries.ts` exports
  `getLatestSynthesis(projectId)` and `getProjectArtifacts(projectId)` — both honor RLS.
```

---

## Diff 2 — Insert `### Open-Question Chat Bridge` under `## Architecture`

**Anchor:** insert AFTER `### Project Artifacts Table` (Diff 1) and BEFORE `### Key Directories`.

**New content:**

```markdown
### Open-Question Chat Bridge (`lib/chat/system-question-bridge.ts`)

Transport for system-generated open questions (M2 NFR clarifications, QFD
disambiguations, FMEA risk follow-ups) into the user-facing chat thread.

- **Producers (v2.1):** M2 NFR emitter (when `final_confidence < 0.90`), HoQ emitter
  (M6, on conflicting customer-engineering signals), FMEA-residual emitter (M8.b, on
  unresolved risk).
- **Producers (v2.2):** Wave E `surface-gap.ts` (engine-driven gap-fill).
- **Bridge contract:** `emitOpenQuestion(input)` validates against
  `system-question-bridge.types.ts` Zod, persists into the chat thread (assistant
  message), and updates the open-questions ledger.
- **Ledger keys:** `extractedData.openQuestions.{requirements | qfdResolved | riskResolved}`.
  Each entry: `{ id, question, source, status: 'open' | 'resolved' | 'deferred',
  resolvedBy?, resolvedAt? }`.
- **Latency target:** p95 < 2s end-to-end (emit → chat row visible). Anchored by EC-V21-A.4.
- **Wave A ↔ Wave E handshake:** the bridge is the SHARED transport. Wave A
  producers ship in v2.1; Wave E `surface-gap.ts` producer ships in v2.2.
  See `plans/v21-outputs/ta1/handshake-spec.md` for the full contract.
```

---

## Diff 3 — Amend `## System-Design Data Path`

**Anchor:** the existing section (line 118 in CLAUDE.md as of `wave-a/ta1-docs` branch start) reads:

```markdown
## System-Design Data Path

All 4 system-design routes read from `(project as any).projectData?.intakeState?.extractedData?.<module>`. **TODO:** the `any` cast is a type hole — type it properly when extending the shape. Single `extractedData` blob — not separate artifacts per module. Crawley pivot / v2 pipeline must EXTEND this shape (add `extractedData.decisionNetwork`, `.formFunction`, `.fmea`), not replace it.
```

**Replacement:**

```markdown
## System-Design Data Path

**Pre-Wave-A (legacy):** all 4 system-design routes read from `(project as any).projectData?.intakeState?.extractedData?.<module>`. Single `extractedData` blob — not separate artifacts per module.

**Post-Wave-A (v2.1):** synthesis artifacts (M3–M8 + architecture-recommendation keystone) now live in the `project_artifacts` table (see `### Project Artifacts Table` above). Routes read via `getLatestSynthesis(projectId)` / `getProjectArtifacts(projectId)` from `lib/db/queries.ts`. Legacy M0–M2 intake data continues to live in `extractedData` (open-questions ledger, NFR scratch, intake state) — those reads are unchanged.

**TODO:** the `any` cast on `extractedData` is a type hole — type it properly when extending the shape. Crawley pivot / v2 pipeline EXTENDS the legacy shape (added `extractedData.openQuestions.{requirements | qfdResolved | riskResolved}` for the chat-bridge ledger); synthesis-stage shapes live on `project_artifacts` instead.
```

---

## Review checklist for David

- [ ] Diff 1 placement (after Education, before Key Directories) is correct.
- [ ] Diff 2 placement (after Diff 1, before Key Directories) is correct.
- [ ] Diff 3 wording correctly captures the legacy-vs-post-Wave-A split.
- [ ] No new top-level `##` headers introduced (constraint per spawn-prompt guardrail).
- [ ] No conflict with a future TA3 `claude-md-diff.md` (none on disk currently).

On approval, `docs` will apply the patch in a single commit `docs(ta1): CLAUDE.md additions for project_artifacts + chat-bridge` and tag along with the rest of the TA1 docs deliverables.
