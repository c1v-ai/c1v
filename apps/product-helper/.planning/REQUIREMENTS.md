# Requirements: Product Helper V2

**Defined:** 2025-01-25
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications

## v1 Requirements

Requirements for V2 release. Each maps to roadmap phases.

### Pipeline Training

- [x] **PIPE-01**: System extracts problem/opportunity statement from conversation into structured PRD section
- [x] **PIPE-02**: System extracts full personas with goals, pain points, and behaviors (upgrade from actor extraction)
- [x] **PIPE-03**: System extracts measurable goals and success metrics as structured table
- [x] **PIPE-04**: System extracts non-functional requirements (performance, security, scalability)
- [ ] **PIPE-05**: System enforces staged approval gates (PRD -> Tech -> Implementation -> Stories)
- [ ] **PIPE-06**: System outputs dual-format artifacts (.md + machine-parseable: .mmd, .schema.json, .openapi.json)
- [ ] **PIPE-07**: Knowledge graphs improved for scope definition and requirements training
- [x] **PIPE-08**: Quick Start synthesis agent expands brief input via 2-call context expansion (domain analysis + use case derivation)
- [x] **PIPE-09**: Quick Start orchestrator runs parallel agents with validation path
- [x] **PIPE-10**: Quick Start SSE API route streams generation progress to client

### Explorer UI

- [x] **EXPL-01**: User can navigate project via tree sidebar matching Epic.dev file-tree pattern
- [x] **EXPL-02**: Explorer tree shows all generated sections with expand/collapse
- [x] **EXPL-03**: User can view PRD content in formatted section view
- [x] **EXPL-04**: User can view System Overview section
- [x] **EXPL-05**: User can view Tech Stack section
- [x] **EXPL-06**: User can view Infrastructure & Deployment section
- [x] **EXPL-07**: User can view Architecture Diagram section
- [x] **EXPL-08**: User can view User Stories in table format grouped by feature
- [x] **EXPL-09**: User Stories show badges, status, counters, and time estimates
- [x] **EXPL-10**: User can view Database Schema section
- [x] **EXPL-11**: User can view API Specification section
- [x] **EXPL-12**: Diagram viewer supports zoom, pan, copy Mermaid source, and fullscreen
- [x] **EXPL-13**: Chat panel positioned as persistent right panel (256px explorer + content + 400px chat)
- [x] **EXPL-14**: Empty states guide users to start chat conversation
- [ ] **EXPL-15**: User can edit PRD sections inline within explorer view

### AI Chat

- [ ] **CHAT-01**: Knowledge graphs trained for improved scope definition and requirements building
- [ ] **CHAT-02**: User can select agent role (e.g., "Architect") from dropdown — *deferred to V3*
- [x] **CHAT-03**: Loading states show clear progress indicators during AI processing
- [x] **CHAT-04**: Quick Start button and progress cards UI for one-shot PRD generation

### Onboarding

- [x] **ONBD-01**: User provides project type during setup (SaaS, mobile, marketplace, etc.)
- [x] **ONBD-02**: User provides project stage during setup (idea, prototype, MVP, growth)
- [x] **ONBD-03**: User provides budget range during setup
- [x] **ONBD-04**: User provides their role during setup (founder, PM, developer, designer)
- [x] **ONBD-05**: Post-login redirect correctly goes to /projects instead of Team Settings

### UX Polish (Phase 6 Scope Expansion)

- [x] **UX-01**: Post-login redirect goes to `/home` for all users (new + returning)
- [x] **UX-02**: System prompt metadata (`[Mode: ...]`, context strings) stripped from user-visible fields (vision statement, chat messages)
- [x] **UX-03**: Overview middle section redesigned: 2-step quick instructions, interactive artifact pipeline, compact connector link
- [x] **UX-04**: Explorer tree items show completion status indicators (checkmark / spinner / empty circle)
- [x] **UX-05**: Explorer tree notifies user when new content arrives (spinning loader icons during generation)
- [x] **UX-06**: AI chat responses use plain language for systems engineering concepts with inline explanations
- [x] **UX-07**: Loading states during AI processing show rotating educational micro-content (knowledge bank golden nuggets)
- [x] **UX-08**: PRD-SPEC Validation moved to dev-only (removed from user-facing overview)
- [x] **UX-09**: Remove green hover highlighting on system overview description points

### Mobile Redesign (Phase 10)

- [ ] **MOB-01**: Bottom nav "Chat" navigates to current project chat (not new chat)
- [ ] **MOB-02**: Bottom nav restructured: Explorer replaces Projects, Account moves to profile menu, Home removed
- [ ] **MOB-03**: Research and implement mobile chatbot UX best practices
- [ ] **MOB-04**: Consolidate three navigation layers into coherent hierarchy

### Generator Quality (Phase 13)

- [x] **GEN-01**: 6 new Knowledge Banks (07-12) created for technical decision guidance, bridging systems engineering methodology to generator agent output
- [x] **GEN-02**: Schema agent outputs full fields, types, constraints, relationships (KB 07+08 wired)
- [x] **GEN-03**: Tech stack agent outputs categories with rationale, alternatives, and "why not" explanations (KB 09 wired)
- [x] **GEN-04**: API spec agent outputs complete OpenAPI-compatible endpoint definitions (KB 10 wired)
- [x] **GEN-05**: Infrastructure agent outputs deployment architecture with cost estimates (KB 11 wired)
- [x] **GEN-06**: Guidelines agent outputs comprehensive conventions tailored to selected tech stack (KB 12 wired)
- [x] **GEN-07**: Post-intake completion message accurately reflects which artifacts were generated vs failed

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Export & Distribution

- **EXPRT-01**: User can download project as ZIP matching Epic.dev export structure
- **EXPRT-02**: Export dropdown with format selection (ZIP, individual files)
- **EXPRT-03**: PDF export of PRD document

### Advanced Backlog

- **BKLG-01**: Kanban board view for user stories
- **BKLG-02**: Drag-drop story prioritization
- **BKLG-03**: Bulk story export to project management tools

### Collaboration

- **COLLAB-01**: Real-time collaborative editing
- **COLLAB-02**: Comment threads on PRD sections
- **COLLAB-03**: Activity feed showing team changes

### Platform

- **PLAT-01**: OAuth sign-up (Google, GitHub)
- **PLAT-02**: Pricing/credits system with Stripe integration
- **PLAT-03**: Journey progress tracker (Discovery -> Requirements -> Technical -> Validation -> Export Ready)
- **PLAT-04**: Online research validation (Reddit, X, HN)

## Out of Scope

| Feature | Reason |
|---------|--------|
| ChatGPT/Lovable IDE integrations | Current 4 integrations (Claude Code, Cursor, VS Code, Windsurf) sufficient |
| Mobile-specific explorer layouts | Explorer is desktop-first; PWA bottom nav handles mobile basics |
| Video/audio intake | Text conversation is core value; multimedia adds complexity without clear value |
| Multi-language PRD output | English-only for V2; internationalization is significant effort |
| Custom AI model selection | Claude (Anthropic) covers needs; model marketplace deferred |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 3: PRD Extraction Agents | Complete |
| PIPE-02 | Phase 3: PRD Extraction Agents | Complete |
| PIPE-03 | Phase 3: PRD Extraction Agents | Complete |
| PIPE-04 | Phase 3: PRD Extraction Agents | Complete |
| PIPE-05 | Phase 4: Pipeline Orchestration & Quality | Pending |
| PIPE-06 | Phase 4: Pipeline Orchestration & Quality | Pending |
| PIPE-07 | Phase 4: Pipeline Orchestration & Quality | Pending |
| PIPE-08 | Phase 2: Quick Start Pipeline | Complete |
| PIPE-09 | Phase 2: Quick Start Pipeline | Complete |
| PIPE-10 | Phase 2: Quick Start Pipeline | Complete |
| EXPL-01 | Phase 4: Epic.dev Navigation Pattern | Complete |
| EXPL-02 | Phase 4: Epic.dev Navigation Pattern | Complete |
| EXPL-03 | Phase 6: Content Section Views | Complete |
| EXPL-04 | Phase 6: Content Section Views | Complete |
| EXPL-05 | Phase 6: Content Section Views | Complete |
| EXPL-06 | Phase 6: Content Section Views | Complete |
| EXPL-07 | Phase 6: Content Section Views | Complete |
| EXPL-08 | Phase 7: Rich Data Views | Complete |
| EXPL-09 | Phase 7: Rich Data Views | Complete |
| EXPL-10 | Phase 7: Rich Data Views | Complete |
| EXPL-11 | Phase 7: Rich Data Views | Complete |
| EXPL-12 | Phase 7: Rich Data Views | Complete |
| EXPL-13 | Phase 5: Explorer Shell & Layout | Complete |
| EXPL-14 | Phase 5: Explorer Shell & Layout | Complete |
| EXPL-15 | Phase 9: Inline Section Editing | Pending |
| CHAT-01 | Phase 4: Pipeline Orchestration & Quality | Pending |
| CHAT-02 | Phase 8: Chat Enhancements | Deferred V3 |
| CHAT-03 | Phase 6-05: Plain Language + Loading States | Complete |
| CHAT-04 | Phase 2: Quick Start Pipeline | Complete |
| ONBD-01 | Phase 1: Onboarding & First Impressions | Complete |
| ONBD-02 | Phase 1: Onboarding & First Impressions | Complete |
| ONBD-03 | Phase 1: Onboarding & First Impressions | Complete |
| ONBD-04 | Phase 1: Onboarding & First Impressions | Complete |
| ONBD-05 | Phase 1: Onboarding & First Impressions | Complete |

| UX-01 | Phase 6-01 + Route Consolidation | Complete |
| UX-02 | Phase 6-04: Overview Redesign | Complete |
| UX-03 | Phase 6-04: Overview Redesign | Complete |
| UX-04 | Phase 6-03 + 6-04: Status Indicators | Complete |
| UX-05 | Phase 6-04: Overview Redesign | Complete |
| UX-06 | Phase 6-05: Plain Language Prompts | Complete |
| UX-07 | Phase 6-05: Educational Loading States | Complete |
| UX-08 | Phase 6-01: Validation Dev-Only | Complete |
| UX-09 | Phase 6-01: Green Hover Removal | Complete |
| MOB-01 | Phase 10: Mobile Redesign | Pending |
| MOB-02 | Phase 10: Mobile Redesign | Pending |
| MOB-03 | Phase 10: Mobile Redesign | Pending |
| MOB-04 | Phase 10: Mobile Redesign | Pending |
| GEN-01 | KB 07-12 Creation (2026-02-08) | Complete |
| GEN-02 | Generator Agent KB Wiring (2026-02-08) | Complete |
| GEN-03 | Generator Agent KB Wiring (2026-02-08) | Complete |
| GEN-04 | Generator Agent KB Wiring (2026-02-08) | Complete |
| GEN-05 | Generator Agent KB Wiring (2026-02-08) | Complete |
| GEN-06 | Generator Agent KB Wiring (2026-02-08) | Complete |
| GEN-07 | Phase 6-06: buildCompletionMessage | Complete |

**Coverage:**
- v1 requirements: 34 total, mapped: 34
- UX requirements: 9 total, mapped: 9
- Mobile requirements: 4 total, mapped: 4
- Generator quality requirements: 7 total, mapped: 7
- Total: 54 mapped, 0 unmapped

---
*Requirements defined: 2025-01-25*
*Last updated: 2026-02-08 - marked EXPL-03-12, CHAT-03, UX-01-09, GEN-01-07 complete*
