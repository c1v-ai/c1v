# Requirements: c1v v2.2.1+ QA

**Defined:** 2026-05-02
**Core Value:** Intake chat must surface actors/constraints well enough for downstream synthesis to generate non-trivial NFRs and engineering constants

## v1 Requirements

### Intake / LLM Quality

- [ ] **INTK-01**: Extraction pipeline (`extract_data` node) correctly populates `extractedData.actors` from user conversation input
- [ ] **INTK-02**: Extraction pipeline correctly populates `extractedData.systemBoundaries.outOfScope` from user conversation input (currently always empty despite being typed in `ProjectValidationData`)
- [ ] **INTK-03**: Downstream synthesis agents (NFR derivation, engineering constants) receive structured `actors` and `systemBoundaries` from `extractedData` and produce non-trivial output (not "I don't have enough upstream context")

### CI / Developer Workflow

- [ ] **CI-01**: `apps/product-helper/package.json` has a `lint` script (e.g. `next lint`) and the app has an ESLint config (`eslint.config.mjs` or `.eslintrc.js`) so `pnpm turbo run lint --filter=product-helper` passes in CI

### pgvector / KB Ingest

- [ ] **VEC-01**: Root cause of `kb_source + chunk_hash` unique constraint collision in `ingest-kbs.ts` diagnosed and documented
- [ ] **VEC-02**: Phase B ingest runs without silent no-op — new KB content inserts into `kb_chunks` table in both local (Supabase :54322) and production (`yxginqyxtysjdkeymnon`)
- [ ] **VEC-03**: Production `kb_chunks` row count verified ≥1 (embeddings present in prod, not just local)

## v2 Requirements

### Intake / LLM Quality (deferred)

- **INTK-04**: HG7 (success criteria) and HG8 (constraints) soft gates made non-trivial — check actual `extractedData` constraint fields rather than regex on `vision` string
- **INTK-05**: `kbStepConfidence` deterministic floor added for Steps 3-6 (`ffbd`, `decision-matrix`, `qfd-house-of-quality`, `interfaces`) — currently returns 0, making KB confidence override gate unreliable for Phase 2
- **INTK-06**: `check-prd-spec.ts:224` TODO resolved — track `outOfScope` separately in `extractedData` rather than mapping from `internal`

### CI Hygiene (deferred)

- **CI-02**: `test:unit` and `test:integration` npm scripts added, or CI workflow updated to call `test` directly
- **CI-03**: `.github/markdown-link-check-config.json` created so validate-docs job passes
- **CI-04**: `OPENROUTER_API_KEY: stub` replaced with `sk-or-stub` in `quarterly-drift-check.yml` and `v2.1.1-e2e.yml`
- **CI-05**: `scripts/or.ts` created or dead reference removed from `package.json`
- **CI-06**: Duplicate migration numbers resolved — 0004 × 2 (`elite_naoko` + `v2_data_model_depth`) and 0007 × 2 (`add_project_metadata` + `lively_selene`)

### Wave E Eval (deferred)

- **EVAL-01**: E.1 resolved — clarification-detector revert commit traced in git; verifier gate passes
- **EVAL-02**: E.8 resolved — engine JSON count gate in verifier updated to 14 (or extra file removed)

### Observability (deferred)

- **OBS-01**: `setSentryTransport` called at application boot (currently default no-op transport active; nothing reaches Sentry)
- **OBS-02**: `synthesis_metrics_total{module="m2",impl="llm-only"}` counter emits on the LLM-only path
- **OBS-03**: Sentry baseline JSON (`sentry-baseline-2026-04-27.json`) updated with real `total_calls` data after ≥48h prod traffic

## Out of Scope

| Feature | Reason |
|---------|--------|
| HNSW upgrade (ivfflat → HNSW m=16/ef=64) | ivfflat functional; no p95 baseline measurement yet; deferred per T3 |
| Crawley agent emitter migration | Schema gate is in place; emitter sites still pre-Crawley; deferred to future wave |
| E.13 observability 7-day window | Waiting on OBS-01/02 first; can't start clock until instrumentation ships |
| New product features | Pure QA/bug-fix cycle — no capability additions |
| UI changes | UI freeze active for system-design viewers and diagram viewer |
| Marketing / billing changes | Out of QA scope |
| HNSW p95 benchmark | Requires OBS stack to be working first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INTK-01 | Phase 1 | Pending |
| INTK-02 | Phase 1 | Pending |
| INTK-03 | Phase 1 | Pending |
| CI-01 | Phase 2 | Pending |
| VEC-01 | Phase 3 | Pending |
| VEC-02 | Phase 3 | Pending |
| VEC-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-02*
*Last updated: 2026-05-02 after initial definition*
