# EPIC-DEV-PARITY: Complete Feature Inventory

**Purpose:** Every Epic.dev feature numbered and status-mapped for GSD+CLEO task execution.
**Updated:** 2026-01-25
**Source:** Epic.dev screenshots, export analysis, competitive research

---

## Status Legend

| Tag | Meaning |
|-----|---------|
| ✅ | **BUILT** — Working in PH today |
| ⚠️ | **PARTIAL** — Exists but incomplete or needs significant work |
| ❌ | **MISSING** — Not built yet |
| 🟢 | **PH-ONLY** — Our differentiator (Epic doesn't have) |

---

## Summary

| Area | Total | ✅ Built | ⚠️ Partial | ❌ Missing |
|------|-------|---------|-----------|-----------|
| A. Onboarding & Account | 13 | 4 | 2 | 7 |
| B. PRD Content Generation | 16 | 7 | 3 | 6 |
| C. Technical Specifications | 20 | 16 | 0 | 4 |
| D. Architecture & Diagrams | 12 | 5 | 0 | 7 |
| E. User Stories & Backlog | 15 | 3 | 3 | 9 |
| F. MCP & Connections | 16 | 14 | 0 | 2 |
| G. Project Explorer UI | 10 | 6 | 1 | 3 |
| H. Chat & AI Interface | 15 | 9 | 0 | 6 |
| I. Export System | 9 | 2 | 1 | 6 |
| J. Collaboration | 7 | 4 | 1 | 2 |
| K. Pricing & Credits | 7 | 0 | 1 | 6 |
| L. Settings & Admin | 5 | 2 | 2 | 1 |
| M. PH Differentiators | 10 | 7 | 1 | 2 |
| **TOTAL** | **155** | **80** | **15** | **60** |

**Parity Score: 52% Built, 10% Partial, 39% Missing**

---

## A. Onboarding & Account (13 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| A01 | Email sign-up | ✅ | ✅ | JWT-based auth working |
| A02 | OAuth sign-up (Google/GitHub) | ✅ | ❌ | No OAuth providers configured |
| A03 | User type selection (Individual/Company) | ✅ | ❌ | Not in sign-up flow |
| A04 | Role selection (PM/Engineer/Designer/etc.) | ✅ | ❌ | No role taxonomy |
| A05 | Workspace/Team concept | ✅ | ✅ | Team model exists |
| A06 | Project type chips (SaaS, API, Admin, Marketplace) | ✅ | ❌ | No project type taxonomy |
| A07 | Project stage selection (Planning/Development/etc.) | ✅ | ❌ | No stage selection |
| A08 | Budget range input | ✅ | ❌ | No budget field |
| A09 | Initial description textarea | ✅ | ✅ | Vision statement field |
| A10 | Welcome/onboarding page | ✅ | ⚠️ | `/welcome-test` exists but incomplete |
| A11 | Post-login redirect to projects | ✅ | ⚠️ | Redirect exists but broken on Vercel |
| A12 | Project name + description on creation | ✅ | ✅ | Project form works |
| A13 | "What are you building?" prompt with quick-start chips | ✅ | ❌ | Planned for welcome page |

---

## B. PRD Content Generation (16 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| B01 | Problem statement section | ✅ | ❌ | Not extracted separately |
| B02 | Target users with full personas (name, goals, pain points) | ✅ | ⚠️ | Actors exist but not full persona format |
| B03 | Goals & success metrics table | ✅ | ❌ | Not a separate extraction |
| B04 | Scope definition (in-scope / out-of-scope) | ✅ | ⚠️ | System boundaries exist, not in/out format |
| B05 | Non-functional requirements section | ✅ | ❌ | Not extracted |
| B06 | Use cases with acceptance criteria | ✅ | ✅ | Enhanced in Phase 9 |
| B07 | Use case main flow + alternative flows | ✅ | ✅ | Phase 9 schema has flows |
| B08 | Conversational intake flow | ✅ | ✅ | LangGraph state machine |
| B09 | Adaptive question generation | ✅ | ✅ | Question bank + priority scorer |
| B10 | Quick Start mode (one-shot PRD from brief input) | ✅ | ✅ | T022 complete — synthesis agent + orchestrator + SSE API + UI |
| B11 | Staged approval gates (PRD → Tech → Impl → Stories) | ✅ | ❌ | No approval gate pattern |
| B12 | Section-level editing (edit any PRD section inline) | ✅ | ❌ | No inline editing UI |
| B13 | Auto-save with "Saved Xm ago" indicator | ✅ | ⚠️ | Conversations save, no visible indicator |
| B14 | Completeness score display | ✅ | ✅ | Real-time % (PH advantage) |
| B15 | PRD-SPEC validation gates | ❌ | ✅ 🟢 | 10 hard gates — PH only |
| B16 | "Awaiting Review" state on generated PRD | ✅ | ❌ | No review workflow state |

---

## C. Technical Specifications (20 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| C01 | Tech stack recommendation with rationale | ✅ | ✅ | `tech-stack-agent.ts` |
| C02 | Tech stack per-category breakdown (frontend/backend/db/etc.) | ✅ | ✅ | Categories in output |
| C03 | Tech stack alternatives with "why not" | ✅ | ✅ | Agent generates alternatives |
| C04 | Tech stack risks & mitigations table | ✅ | ❌ | Not in current output |
| C05 | Database schema with fields, types, constraints | ✅ | ✅ | `schema-extraction-agent.ts` |
| C06 | Database entity relationships | ✅ | ✅ | Relationships in schema |
| C07 | Database indexes and constraints | ✅ | ✅ | In extraction output |
| C08 | API specification (endpoints, methods, schemas) | ✅ | ✅ | `api-spec-agent.ts` |
| C09 | API request/response body schemas | ✅ | ✅ | Full JSON schemas |
| C10 | API error codes and handling | ✅ | ✅ | Error codes in spec |
| C11 | API authentication configuration | ✅ | ✅ | Auth config in spec |
| C12 | Infrastructure hosting specification | ✅ | ✅ | `infrastructure-agent.ts` |
| C13 | Infrastructure cost estimates per service | ✅ | ❌ | No cost breakdown |
| C14 | Infrastructure environments (dev/staging/prod) | ✅ | ✅ | Environment configs |
| C15 | CI/CD pipeline steps | ✅ | ✅ | In infrastructure spec |
| C16 | Monitoring & alerting with severity thresholds | ✅ | ✅ | In infrastructure spec |
| C17 | Backup & recovery strategy | ✅ | ✅ | In infrastructure spec |
| C18 | SLO targets table | ✅ | ❌ | Not explicitly generated |
| C19 | Coding guidelines (naming, patterns, forbidden) | ✅ | ✅ | `guidelines-agent.ts` |
| C20 | Testing strategy in guidelines | ✅ | ✅ | Test config in guidelines |

---

## D. Architecture & Diagrams (12 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| D01 | System architecture diagram | ✅ | ✅ | Phase 10.4 complete |
| D02 | Context diagram | ✅ | ✅ | Mermaid generator |
| D03 | Use case diagram | ❌ | ✅ 🟢 | PH has this, Epic doesn't |
| D04 | Sequence diagram | ❌ | ✅ 🟢 | PH has this, Epic doesn't |
| D05 | Data model / ERD diagram | ✅ | ✅ | Mermaid class diagram |
| D06 | "Show Code" toggle (view Mermaid source) | ✅ | ❌ | No toggle in UI |
| D07 | Zoom controls (+/- with percentage display) | ✅ | ❌ | No zoom controls |
| D08 | Refresh/regenerate diagram button | ✅ | ❌ | No refresh action |
| D09 | Fullscreen diagram view | ✅ | ❌ | No fullscreen mode |
| D10 | Copy diagram code button | ✅ | ❌ | No copy action |
| D11 | Drag to pan interaction | ✅ | ❌ | No pan interaction |
| D12 | Diagram annotations / labels | ✅ | ❌ | No annotation layer |

---

## E. User Stories & Backlog (15 features)

*Source: Epic.dev screenshots showing User Stories table view*

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| E01 | User story generation from use cases | ✅ | ✅ | `user-stories-agent.ts` |
| E02 | Story acceptance criteria (Gherkin-style) | ✅ | ✅ | In story schema |
| E03 | Story effort estimates (S/M/L) | ✅ | ✅ | In story schema |
| E04 | Story table view (ID, Title, Status, Priority columns) | ✅ | ❌ | No dedicated stories UI |
| E05 | Story grouping by feature/epic ("User Auth & Profile (0/5)") | ✅ | ❌ | No grouping UI |
| E06 | Story priority badges (critical=red, high=orange, medium=gray) | ✅ | ⚠️ | Data exists, no badge UI |
| E07 | Story status tracking (Todo/In Progress/Done/Stuck) | ✅ | ⚠️ | API exists (`PUT stories/:id`), no UI |
| E08 | Story completion counter ("0/32 completed") | ✅ | ❌ | No counter UI |
| E09 | Time estimate display ("~17.5 days estimated") | ✅ | ❌ | No time estimation |
| E10 | Manual story creation ("+ Add" button) | ✅ | ❌ | No manual add UI |
| E11 | Story ID format (US-001, US-002, ...) | ✅ | ⚠️ | Stories have IDs but no formatted display |
| E12 | Story technical notes (implementation details) | ✅ | ❌ | Not in current schema |
| E13 | Story drag-drop reorder | ✅ | ❌ | No drag-drop |
| E14 | Kanban board view option | ✅ | ❌ | No kanban view |
| E15 | Story bulk export (Jira, Linear, CSV) | ✅ | ❌ | No bulk export |

---

## F. MCP Integration & Connections (16 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| F01 | MCP HTTP server (JSON-RPC 2.0) | ✅ | ✅ | Phase 11 complete |
| F02 | 17 MCP tools (core + generators + unique) | ✅ | ✅ | All 17 registered |
| F03 | API key creation per project | ✅ | ✅ | Full CRUD |
| F04 | API key revocation | ✅ | ✅ | Working |
| F05 | API key list with usage stats | ✅ | ✅ | Usage count, last used |
| F06 | Rate limiting | ✅ | ✅ | 100 req/min per key |
| F07 | Claude Code integration card + one-click copy | ✅ | ✅ | Integration cards UI |
| F08 | Cursor integration card | ✅ | ✅ | Integration cards UI |
| F09 | VS Code integration card | ✅ | ✅ | Integration cards UI |
| F10 | Windsurf integration card | ✅ | ✅ | Integration cards UI |
| F11 | SKILL.md export/download | ✅ | ✅ | `skill-generator.ts` |
| F12 | CLAUDE.md export/download | ✅ | ✅ | `claude-md-generator.ts` |
| F13 | Connection status indicator | ✅ | ✅ | Status component |
| F14 | MCP story status sync (update_user_story_status) | ✅ | ✅ | Tool implemented |
| F15 | ChatGPT integration | ✅ | ❌ | Not supported |
| F16 | Lovable integration | ✅ | ❌ | Not supported |

---

## G. Project Explorer UI (10 features)

*Source: Epic.dev left sidebar tree — the main navigation paradigm*

```
Epic.dev Explorer Tree (from screenshots):
PROJECT EXPLORER
├── Overview (+)
├── Product Requirements D...
│   ├── Architecture Diagram
│   ├── Tech Stack
│   ├── User Stories
│   └── System Overview
├── Backend
│   ├── Database Schema
│   ├── {API Specification}
│   └── Infrastructure & Deplo...
├── Connect to Cursor, Claude Code, Windsurf & more
├── 🔗 Connections (MCP)
MANAGEMENT
├── Collaborators
└── Settings
```

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| G01 | Tree sidebar navigation (collapsible sections) | ✅ | ✅ | ExplorerSidebar + ExplorerTree (T021) |
| G02 | Tree item expand/collapse with child counts | ✅ | ✅ | ExplorerNode with counts, localStorage persist |
| G03 | Section completion indicators (dots/icons) | ✅ | ✅ | hasData green dots via ExplorerNode |
| G04 | Active section highlighting | ✅ | ✅ | usePathname-based active route detection |
| G05 | URL-based section navigation (click tree → load content) | ✅ | ✅ | Link-based routing to 7+ section pages |
| G06 | Overview dashboard (project summary + stats) | ✅ | ⚠️ | page.tsx exists, needs enrichment |
| G07 | Section content views (PRD, Tech Stack, etc. as pages) | ✅ | ✅ | 7 section components + route pages |
| G08 | Inline section editing (click to edit any field) | ✅ | ❌ | No inline editing |
| G09 | "+" button to add new sections/items | ✅ | ❌ | No add actions in sidebar |
| G10 | Journey/progress tracking across sections | ✅ | ❌ | No journey bar |

---

## H. Chat & AI Interface (15 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| H01 | Chat interface with message bubbles | ✅ | ✅ | `chat-window.tsx` |
| H02 | Streaming LLM responses | ✅ | ✅ | SSE streaming |
| H03 | Message history persistence | ✅ | ✅ | `conversations` table |
| H04 | Conversation checkpointing & resume | ✅ | ✅ | `graphCheckpoints` table |
| H05 | LangGraph state machine orchestration | ❌ | ✅ 🟢 | PH advantage |
| H06 | Markdown rendering in messages | ✅ | ✅ | `markdown-renderer.tsx` |
| H07 | Chat artifacts sidebar (generated diagrams/docs) | ✅ | ✅ | `artifacts-sidebar.tsx` |
| H08 | Diagram link cards in chat | ✅ | ✅ | `diagram-link-card.tsx` |
| H09 | Agent type selector dropdown ("Architect", etc.) | ✅ | ❌ | No agent role selection |
| H10 | Progress cards during generation ("Creating API Spec — Done") | ✅ | ❌ | No progress card UI |
| H11 | Generation loading states with status messages | ✅ | ❌ | Basic loading only |
| H12 | "Scroll to bottom" button in chat | ✅ | ✅ | Auto-scroll |
| H13 | Credit cost display per generation | ✅ | ❌ | No credit tracking |
| H14 | Graceful error handling ("insufficient credits") | ✅ | ❌ | No credit-based errors |
| H15 | Chat input placeholder ("Describe what you want to build...") | ✅ | ❌ | Generic placeholder |

---

## I. Export System (9 features)

*Source: Epic.dev export dropdown and ZIP structure analysis*

```
Epic.dev Export ZIP:
project-name-export/
├── README.md
└── Product_Requirements_Document/
    ├── Product_Requirements_Document.md
    ├── Architecture_Diagram.md
    ├── Architecture_Diagram.mmd
    ├── System_Overview.md
    ├── Tech_Stack.md
    ├── Infrastructure_&_Deployment.md
    ├── User_Stories.md
    └── Backend/
        ├── Database_Schema.md
        ├── Database_Schema.schema.json
        ├── API_Specification.md
        └── API_Specification.openapi.json
```

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| I01 | Export dropdown in header | ✅ | ❌ | No export menu |
| I02 | Full ZIP export with organized folder structure | ✅ | ❌ | No ZIP generation |
| I03 | PRD as Markdown (.md) | ✅ | ⚠️ | MCP returns it, no download button |
| I04 | Architecture diagram as Mermaid (.mmd) | ✅ | ❌ | No .mmd export |
| I05 | Database schema as JSON Schema (.schema.json) | ✅ | ❌ | No JSON Schema format |
| I06 | API spec as OpenAPI JSON (.openapi.json) | ✅ | ✅ | API route generates OpenAPI |
| I07 | User Stories as Markdown | ✅ | ❌ | No stories export |
| I08 | PDF export option | ✅ | ❌ | No PDF generation |
| I09 | SKILL.md + CLAUDE.md downloads | ✅ | ✅ | Export section on connections page |

---

## J. Collaboration (7 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| J01 | Team creation | ✅ | ✅ | Teams model |
| J02 | Invite button in header | ✅ | ✅ | Invite system works |
| J03 | Team member roles (Admin/Member) | ✅ | ✅ | Role field exists |
| J04 | Invitation emails | ✅ | ✅ | Resend integration |
| J05 | Collaborators page/panel | ✅ | ⚠️ | Basic page exists |
| J06 | Real-time collaborative editing | ✅ | ❌ | No real-time sync |
| J07 | Comment/review system on sections | ✅ | ❌ | No commenting |

---

## K. Pricing & Credits (7 features)

*Source: Epic.dev header showing "19,680 credits" and "Starter Plan"*

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| K01 | Credit-based usage system | ✅ | ❌ | No credit model |
| K02 | Credit display in header bar | ✅ | ❌ | No header credit counter |
| K03 | "Claim Your Free Credits" CTA | ✅ | ❌ | No free credit flow |
| K04 | Starter/Pro plan tiers ($20/$30/mo) | ✅ | ❌ | Plans not defined |
| K05 | Stripe checkout integration | ✅ | ⚠️ | Stripe code exists, not wired |
| K06 | Insufficient credit handling (graceful skip) | ✅ | ❌ | No credit gating |
| K07 | Plan upgrade CTA | ✅ | ❌ | No upgrade flow |

---

## L. Settings & Admin (5 features)

| # | Feature | Epic.dev | PH Status | Notes |
|---|---------|----------|-----------|-------|
| L01 | Theme toggle (dark/light) | ✅ | ✅ | `mode-toggle.tsx` |
| L02 | Account settings page | ✅ | ⚠️ | Stub page exists |
| L03 | Security settings (password change) | ✅ | ⚠️ | Stub page exists |
| L04 | Activity log | ✅ | ❌ | DB exists, no UI |
| L05 | PWA / offline support | ❌ | ✅ 🟢 | PH has PWA |

---

## M. PH-Only Differentiators (10 features)

*Features Epic.dev does NOT have — our competitive advantages*

| # | Feature | PH Status | Epic.dev | Notes |
|---|---------|-----------|----------|-------|
| M01 | PRD-SPEC 10 hard-gate validation | ✅ 🟢 | ❌ | Quality scoring engine |
| M02 | Real-time completeness % tracking | ✅ 🟢 | ❌ | Live % during intake |
| M03 | Conversational adaptive intake (question bank) | ✅ 🟢 | ❌ | Priority scorer + clarification |
| M04 | LangGraph multi-node state machine | ✅ 🟢 | ❌ | 7-node graph |
| M05 | Educational content during intake | ⚠️ 🟢 | ❌ | Knowledge banks created, no UI |
| M06 | Online research validation (Reddit/X/HN) | ❌ 🟢 | ❌ | Planned differentiator |
| M07 | GSD workflow phases via MCP | ✅ 🟢 | ❌ | `get_gsd_phases` tool |
| M08 | CLEO task tracking via MCP | ✅ 🟢 | ❌ | `get_cleo_tasks` tool |
| M09 | 17 specialized domain agents via MCP | ✅ 🟢 | ❌ | `invoke_agent` tool |
| M10 | Mobile-first PWA with bottom nav | ✅ 🟢 | ❌ | Responsive + offline |

---

## Gap Analysis by Priority

### P0 — CRITICAL (blocks competitive positioning)

| # | Feature | Area | Why Critical |
|---|---------|------|-------------|
| G01-G10 | Project Explorer UI (entire section) | G | Epic's primary navigation; PH has none |
| E04-E05 | User Stories table + grouping UI | E | Screenshot shows Epic's strongest output |
| B10 | Quick Start mode (one-shot PRD) | B | Epic's "wow" moment — one sentence → full PRD |
| B11 | Staged approval gates | B | Controls generation flow |
| H10 | Progress cards during generation | H | Visible progress = perceived value |

### P1 — HIGH (significant quality gap)

| # | Feature | Area | Why Important |
|---|---------|------|--------------|
| E06-E11 | Story UI (badges, status, counter, time est.) | E | Data exists, just needs frontend |
| B01 | Problem statement section | B | Core PRD section Epic generates |
| B03 | Goals & success metrics | B | Core PRD section |
| B05 | Non-functional requirements | B | Core PRD section |
| D06-D11 | Diagram viewer controls (zoom/pan/copy/fullscreen) | D | Polish that signals quality |
| I01-I02 | Export dropdown + ZIP | I | Key output delivery mechanism |
| H09 | Agent role selector | H | Epic has "Architect" dropdown |

### P2 — MEDIUM (nice to have for parity)

| # | Feature | Area | Notes |
|---|---------|------|-------|
| A02 | OAuth sign-up | A | Convenience |
| A03-A08 | Onboarding enrichment (type/stage/budget/role) | A | Better initial context |
| B12 | Inline section editing | B | Edit in place |
| C04, C13, C18 | Tech stack risks, cost estimates, SLOs | C | Depth details |
| E12-E15 | Story tech notes, drag-drop, kanban, bulk export | E | Advanced backlog management |
| K01-K07 | Entire pricing/credits system | K | Monetization |

### P3 — LOW (future enhancement)

| # | Feature | Area | Notes |
|---|---------|------|-------|
| F15-F16 | ChatGPT/Lovable integration | F | Additional IDE targets |
| J06-J07 | Real-time collab + comments | J | Multi-user features |
| I08 | PDF export | I | Nice format option |
| H13-H14 | Credit cost display + insufficient handling | H | Requires K first |

---

## Execution Wave Map (GSD)

```
WAVE 0 — FOUNDATIONS (unblocks everything)
├── G01-G05: Explorer tree shell + navigation
├── B10: Quick Start mode (one-shot generation)
└── B11: Staged approval gate pattern

WAVE 1 — CORE VIEWS (parallel, fills explorer sections)
├── Agent A: G06-G08 Overview + section content views
├── Agent B: E04-E11 User Stories table UI (data already exists)
├── Agent C: D06-D11 Diagram viewer controls
└── Agent D: H10-H11 Progress cards + loading states

WAVE 2 — PRD DEPTH (parallel, adds missing extractions)
├── Agent A: B01 Problem statement extraction
├── Agent B: B02-B04 Personas, goals, scope enhancement
├── Agent C: B05 Non-functional requirements extraction
└── Agent D: B16 Review/approval workflow state

WAVE 3 — EXPORT & POLISH (parallel)
├── Agent A: I01-I07 Export dropdown + ZIP generation
├── Agent B: H09 Agent role selector
├── Agent C: G09-G10 Explorer add/progress features
└── Agent D: B12-B13 Inline editing + auto-save indicator

WAVE 4 — MONETIZATION & ONBOARDING
├── A02-A08: Onboarding enrichment
├── K01-K07: Credits/pricing system
└── L04: Activity log UI

WAVE 5 — ADVANCED (future)
├── E12-E15: Advanced backlog (kanban, drag-drop, bulk export)
├── J06-J07: Real-time collab + comments
├── F15-F16: Additional IDE integrations
└── M06: Online research validation
```

---

## Reference: Epic.dev Explorer Tree (from screenshots)

```
PROJECT EXPLORER
├── Overview                            (+)
├── Product Requirements D...
│   ├── Architecture Diagram
│   ├── Tech Stack
│   ├── User Stories                    ← Currently selected
│   └── System Overview
├── Backend
│   ├── Database Schema
│   ├── {API Specification}             ← Curly braces = different icon
│   └── Infrastructure & Deplo...
│
├── "Connect to Cursor, Claude Code,
│    Windsurf & more"                   ← Marketing text
├── 🔗 Connections (MCP)
│
MANAGEMENT
├── Collaborators
└── Settings
```

### User Stories View (from screenshot)
- **Header:** "User Stories" | "~17.5 days estimated" badge | "+ Add" button
- **Subheader:** "0/32 completed"
- **Table columns:** ID | TITLE | STATUS | PRIORITY
- **Grouping:** Collapsible sections by feature ("User Authentication & Profile (0/5)", "Interactive PRD Drafting Interface (0/8)")
- **Story format:** US-001, US-002, ... US-010+
- **Priority badges:** critical (red), high (orange), medium (gray)
- **Status:** "Todo" with empty circle icon

### Chat Panel (right sidebar)
- **Header:** "EPIC AI" / "Architect" with agent role dropdown
- **Progress cards:** "Creating API Spec — Done ✅", "Creating User Stories — Done ✅"
- **Completion message:** Lists completed docs + pending docs
- **Credit display:** "Starter Plan | 19,680 credits" at bottom
- **Input:** "Describe what you want to build..."

### Header Bar
- **Left:** Project name ("I want to build an AI chatbot t...")
- **Center:** "Saved 15m ago" | "Invite" button | "Export" dropdown
- **Right:** "Claim Your Free 2500 Credits" CTA | Theme toggle | Avatar

---

## Key Strategic Insight

**Backend is 80% done. Frontend is 20% done.**

The heavy backend lift (Phases 9-11) gave PH:
- 10 specialized LLM agents
- 17 MCP tools
- 13 database tables with full schemas
- Complete data extraction pipeline

What's missing is almost entirely **frontend/UX work**:
- Explorer tree navigation (G01-G10)
- User Stories table UI (E04-E11)
- Diagram viewer controls (D06-D11)
- Export system UI (I01-I07)
- Progress cards (H10-H11)
- PRD content sections (B01-B05 need both extraction + display)

**The data exists. The views don't.**

---

*Last updated: 2026-01-26*
*Feature count: 155 total (80 built, 15 partial, 60 missing)*
