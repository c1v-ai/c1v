# Project State: id.c1v.ai

**Project:** id.c1v.ai - Machine-to-Machine Consent Protocol
**Core Value:** Bilateral consent protocol for AI agent data access with identity resolution, cryptographic contracts, and dual audit logging
**Updated:** 2026-02-02 (Phase 5 Plan 01 Complete)

---

## Current Position

**Milestone:** V1 -- Core Protocol Implementation
**Planning System:** GSD + CLEO (unified)
**Last Completed:** Phase 5 Plan 01 - Audit Data Layer
**Status:** Phase 5 in progress (1/2 plans complete)

```
Specification Phase: [##########] 100%
├── PRD-v1.md         ✓ Complete (36 requirements, 20 user stories)
├── API-SPEC.md       ✓ Complete (OpenAPI, Pydantic schemas, auth flow)
└── SCHEMA.sql        ✓ Complete (5 tables, 17 indexes, triggers)

Planning Phase:       [##########] 100%
├── PROJECT.md        ✓ Vision, stack, differentiators
├── REQUIREMENTS.md   ✓ 36 functional requirements mapped
├── ROADMAP.md        ✓ 6 phases with dependencies
└── CLEO Tasks        ✓ T001-T006 registered

Implementation Phase: [█████████ ] 75%
├── T001 Phase 1: Foundation       ✓ Complete
├── T002 Phase 2: Identity         ✓ Complete
│   ├── 02-01 Data Layer           ✓ Complete (GoldenRecordModel, IdentityService)
│   └── 02-02 API Endpoints        ✓ Complete (resolve, match, golden/{uid})
├── T003 Phase 3: Contracts        ✓ Complete (2/2 plans)
│   ├── 03-01 Data Layer           ✓ Complete (ConsentContractModel, CryptoService, ContractService)
│   └── 03-02 API Endpoints        ✓ Complete (POST /contracts, /sign, GET, DELETE)
├── T004 Phase 4: Agent PIN        ✓ Verified (9/9 UAT passed)
│   ├── 04-01 Data Layer           ✓ Complete (AgentPinModel, PinsService)
│   ├── 04-02 API Endpoints        ✓ Complete (POST /pins, /pins/{id}/validate)
│   └── 04-UAT Verification        ✓ All 9 tests passed
├── T005 Phase 5: Audit            ◐ In progress (1/2 plans)  ← CURRENT
│   └── 05-01 Data Layer           ✓ Complete (AuditLogModel, AuditService)
└── T006 Phase 6: Hardening        ○ Not started
```

---

## What Was Built (Specification Sprint)

### PRD-v1.md (Generated 2026-01-31)
- **Problem Statement:** Unilateral agent auth creates security/compliance gaps
- **3 Personas:** AI Agent Developer, Enterprise SI, Compliance Officer
- **20 User Stories** across 4 epics (Identity, Contracts, PIN, Audit)
- **36 Functional Requirements** (SHALL statements)
- **Non-Functional Requirements:** Security, Performance, Compliance
- **Success Metrics:** Adoption, usage, performance targets
- **Out of Scope:** ML matching, multi-party contracts, self-hosted, FedRAMP

### API-SPEC.md (Generated 2026-01-31)
- **10 API Endpoints** across 4 groups:
  - Identity: `/resolve`, `/match`, `/golden/{uid}`
  - Contracts: `/contracts`, `/contracts/{id}/sign`, `/contracts/{id}`
  - PINs: `/pins`, `/pins/{id}/validate`, `/pins/{id}/audit`
  - Audit: `/logs`
- **Pydantic Schemas:** All request/response models defined
- **Auth Flow:** API key + Agent ID + Ed25519 signatures
- **15+ Error Codes:** Contract/PIN/signature specific errors

### SCHEMA.sql (Generated 2026-01-31)
- **5 Core Tables:**
  - `golden_records` - Identity resolution results
  - `api_keys` - System authentication
  - `consent_contracts` - Bilateral agreements
  - `agent_pins` - 60-second TTL tokens
  - `audit_logs` - Immutable, append-only
- **17 Indexes** for query optimization
- **Triggers:** Audit immutability, PIN validation, contract expiration
- **Helper Functions:** `is_pin_valid()`, `find_active_contracts()`, `expire_contracts()`
- **Views:** Active contracts summary, recent audit, PIN statistics

---

## Architecture Overview

### Three-Layer Protocol

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: CONSENT CONTRACTS                                     │
│  Bilateral agreements between systems                           │
│  - Data types, actions, purpose, retention                     │
│  - Cryptographic signatures (Ed25519)                          │
│  - Status: proposed → active → revoked/expired                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Governs
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: AGENT PIN                                             │
│  Short-lived authorization tokens                               │
│  - 60-second TTL                                                │
│  - Scoped to specific data types + actions                     │
│  - Single-use pattern supported                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Enables
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: DUAL AUDIT LOGGING                                    │
│  Both parties independently log                                 │
│  - Immutable, append-only                                      │
│  - Hash-chained for tamper detection                           │
│  - Compliance-ready (HIPAA, SOC2, GDPR)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Core Library** | c1v-id (PyPI) | Identity resolution, v0.1.0 published |
| **API Framework** | FastAPI | Async, OpenAPI auto-docs |
| **Database** | PostgreSQL | Hosted on Supabase |
| **Auth** | API Keys + Ed25519 | Cryptographic signatures |
| **Deployment** | TBD | Vercel/Railway/Fly.io |

---

## Key Differentiators

| Feature | Current Agent Auth | id.c1v.ai |
|---------|-------------------|-----------|
| **Consent Model** | Unilateral (API key = access) | Bilateral (both parties agree) |
| **Authorization** | Persistent tokens | 60-second PINs |
| **Audit** | Optional, single-sided | Mandatory, dual-sided |
| **Embedding Security** | Vulnerable to vec2vec | No embeddings (vec2vec resistant) |
| **Compliance** | Manual | Built-in (HIPAA, SOC2, GDPR mapping) |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| c1v-id | 0.1.0 | Identity resolution (PyPI) |
| FastAPI | 0.109+ | API framework |
| Pydantic | 2.0+ | Data validation |
| SQLAlchemy | 2.0+ | ORM (optional) |
| cryptography | 42.0+ | Ed25519 signatures |
| python-jose | 3.3+ | JWT handling |

---

## Implementation Phases

### Phase 1: Foundation (Complete)
- [x] Create FastAPI project structure
- [x] Set up PostgreSQL with SCHEMA.sql
- [x] Implement API key authentication
- [x] Basic health/version endpoints

### Phase 2: Identity Resolution (Complete)
- [x] Create GoldenRecordModel (02-01)
- [x] Create IdentityService business logic (02-01)
- [x] Implement `/resolve`, `/match`, `/golden/{uid}` endpoints (02-02)
- [x] Store golden records in database (02-02)

### Phase 3: Consent Contracts (Complete)
- [x] Create ConsentContractModel (03-01)
- [x] Create CryptoService for Ed25519 (03-01)
- [x] Create ContractService business logic (03-01)
- [x] Implement contract API endpoints (03-02)

### Phase 4: Agent PIN (Complete)
- [x] Create AgentPinModel (04-01)
- [x] Create PinsService with HMAC-SHA256 signing (04-01)
- [x] Implement PIN API endpoints (04-02)

### Phase 5: Audit Logging (In Progress)
- [x] Create AuditLogModel with hash-chain fields (05-01)
- [x] Create AuditService with per-agent chains (05-01)
- [x] Update SCHEMA.sql with prev_hash/entry_hash (05-01)
- [ ] Implement audit API endpoints (05-02)
- [ ] Query endpoints with filtering (05-02)

### Phase 6: Hardening
- [ ] Rate limiting
- [ ] Input validation
- [ ] Error handling
- [ ] Comprehensive tests

---

## Phase 4 Summary (Verified)

### Plan 04-01: PIN Data Layer
- AgentPinModel SQLAlchemy ORM matching SCHEMA.sql
- PinsService with HMAC-SHA256 signing
- Atomic single-use enforcement via SELECT FOR UPDATE

### Plan 04-02: PIN API Endpoints
- POST `/api/v1/pins` - Create PIN (201 Created)
- POST `/api/v1/pins/{id}/validate` - Validate PIN (200)
- Wired into v1 router with OpenAPI documentation

### UAT Verification (9/9 passed)
1. ✓ Create PIN against active contract
2. ✓ PIN creation rejected for inactive contract
3. ✓ PIN creation rejected for non-party agent
4. ✓ PIN creation rejected for scope exceeding contract
5. ✓ Validate PIN successfully
6. ✓ Validate expired PIN (60s TTL)
7. ✓ Single-use PIN consumed after first validation
8. ✓ Validate PIN with scope mismatch
9. ✓ Validate PIN with invalid signature

**Phase 4 Files:**
```
src/models/pin.py              ✓ AgentPinModel
src/models/contract.py         ✓ Fixed enum values_callable
src/services/pins_service.py   ✓ PinsService
src/api/v1/pins.py             ✓ PIN endpoints
src/api/v1/router.py           ✓ Updated - includes pins_router
src/core/config.py             ✓ Updated - pin_signing_key
```

---

## Session Continuity

**Last session:** 2026-02-02
**Stopped at:** Phase 5 Plan 01 complete (Audit Data Layer)
**Resume file:** .planning/phases/05-audit/05-02-PLAN.md (next)

**Resume action:**
1. Execute Phase 5 Plan 02 (Audit API Endpoints)
2. Wire AuditService into FastAPI router
3. Test audit log submission and querying

**Recent Commits:**
- 469a65d: feat(05-01): add hash-chain columns to audit_logs schema
- d5c1fd6: feat(05-01): create AuditService with hash-chain logic
- ba1e292: feat(05-01): create AuditLogModel with hash-chain fields
- 9c4893f: test(04): complete UAT - 9/9 passed

**Phase 5 Plan 01 Summary:**
- AuditLogModel with prev_hash/entry_hash for tamper detection
- AuditService with per-agent hash chains (create_log, get_logs, verify_chain)
- GENESIS_HASH = 64 zeros for first entry in chain
- Canonical JSON + SHA256 for deterministic hashing

---

## Related Projects

| Project | Relationship | Status |
|---------|--------------|--------|
| **c1v-id** | Core library (PyPI) | v0.1.0 published |
| **product-helper** | Used to generate specs | V2 complete |
| **c1v-identity (monorepo)** | Original full app | Being refactored |

---

*State updated: 2026-02-02 via GSD execute-plan (Phase 5 Plan 01 Complete)*
