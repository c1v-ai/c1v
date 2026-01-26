# Requirements: Product Helper V2

**Defined:** 2025-01-25
**Core Value:** Conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications

## v1 Requirements

Requirements for V2 release. Each maps to roadmap phases.

### Pipeline Training

- [ ] **PIPE-01**: System extracts problem/opportunity statement from conversation into structured PRD section
- [ ] **PIPE-02**: System extracts full personas with goals, pain points, and behaviors (upgrade from actor extraction)
- [ ] **PIPE-03**: System extracts measurable goals and success metrics as structured table
- [ ] **PIPE-04**: System extracts non-functional requirements (performance, security, scalability)
- [ ] **PIPE-05**: System enforces staged approval gates (PRD -> Tech -> Implementation -> Stories)
- [ ] **PIPE-06**: System outputs dual-format artifacts (.md + machine-parseable: .mmd, .schema.json, .openapi.json)
- [ ] **PIPE-07**: Knowledge graphs improved for scope definition and requirements training
- [ ] **PIPE-08**: Quick Start synthesis agent expands brief input via 2-call context expansion (domain analysis + use case derivation)
- [ ] **PIPE-09**: Quick Start orchestrator runs parallel agents with validation path
- [ ] **PIPE-10**: Quick Start SSE API route streams generation progress to client

### Explorer UI

- [ ] **EXPL-01**: User can navigate project via tree sidebar matching Epic.dev file-tree pattern
- [ ] **EXPL-02**: Explorer tree shows all generated sections with expand/collapse
- [ ] **EXPL-03**: User can view PRD content in formatted section view
- [ ] **EXPL-04**: User can view System Overview section
- [ ] **EXPL-05**: User can view Tech Stack section
- [ ] **EXPL-06**: User can view Infrastructure & Deployment section
- [ ] **EXPL-07**: User can view Architecture Diagram section
- [ ] **EXPL-08**: User can view User Stories in table format grouped by feature
- [ ] **EXPL-09**: User Stories show badges, status, counters, and time estimates
- [ ] **EXPL-10**: User can view Database Schema section
- [ ] **EXPL-11**: User can view API Specification section
- [ ] **EXPL-12**: Diagram viewer supports zoom, pan, copy Mermaid source, and fullscreen
- [ ] **EXPL-13**: Chat panel positioned as persistent right panel (256px explorer + content + 400px chat)
- [ ] **EXPL-14**: Empty states guide users to start chat conversation
- [ ] **EXPL-15**: User can edit PRD sections inline within explorer view

### AI Chat

- [ ] **CHAT-01**: Knowledge graphs trained for improved scope definition and requirements building
- [ ] **CHAT-02**: User can select agent role (e.g., "Architect") from dropdown
- [ ] **CHAT-03**: Loading states show clear progress indicators during AI processing
- [ ] **CHAT-04**: Quick Start button and progress cards UI for one-shot PRD generation

### Onboarding

- [ ] **ONBD-01**: User provides project type during setup (SaaS, mobile, marketplace, etc.)
- [ ] **ONBD-02**: User provides project stage during setup (idea, prototype, MVP, growth)
- [ ] **ONBD-03**: User provides budget range during setup
- [ ] **ONBD-04**: User provides their role during setup (founder, PM, developer, designer)
- [ ] **ONBD-05**: Post-login redirect correctly goes to /projects instead of Team Settings

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
| Custom AI model selection | OpenAI + Claude (for Quick Start) covers needs; model marketplace deferred |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 3: PRD Extraction Agents | Pending |
| PIPE-02 | Phase 3: PRD Extraction Agents | Pending |
| PIPE-03 | Phase 3: PRD Extraction Agents | Pending |
| PIPE-04 | Phase 3: PRD Extraction Agents | Pending |
| PIPE-05 | Phase 4: Pipeline Orchestration & Quality | Pending |
| PIPE-06 | Phase 4: Pipeline Orchestration & Quality | Pending |
| PIPE-07 | Phase 4: Pipeline Orchestration & Quality | Pending |
| PIPE-08 | Phase 2: Quick Start Pipeline | In Progress |
| PIPE-09 | Phase 2: Quick Start Pipeline | Pending |
| PIPE-10 | Phase 2: Quick Start Pipeline | Pending |
| EXPL-01 | Phase 5: Explorer Shell & Layout | Pending |
| EXPL-02 | Phase 5: Explorer Shell & Layout | Pending |
| EXPL-03 | Phase 6: Content Section Views | Pending |
| EXPL-04 | Phase 6: Content Section Views | Pending |
| EXPL-05 | Phase 6: Content Section Views | Pending |
| EXPL-06 | Phase 6: Content Section Views | Pending |
| EXPL-07 | Phase 6: Content Section Views | Pending |
| EXPL-08 | Phase 7: Rich Data Views | Pending |
| EXPL-09 | Phase 7: Rich Data Views | Pending |
| EXPL-10 | Phase 7: Rich Data Views | Pending |
| EXPL-11 | Phase 7: Rich Data Views | Pending |
| EXPL-12 | Phase 7: Rich Data Views | Pending |
| EXPL-13 | Phase 5: Explorer Shell & Layout | Pending |
| EXPL-14 | Phase 5: Explorer Shell & Layout | Pending |
| EXPL-15 | Phase 9: Inline Section Editing | Pending |
| CHAT-01 | Phase 4: Pipeline Orchestration & Quality | Pending |
| CHAT-02 | Phase 8: Chat Enhancements | Pending |
| CHAT-03 | Phase 8: Chat Enhancements | Pending |
| CHAT-04 | Phase 2: Quick Start Pipeline | Pending |
| ONBD-01 | Phase 1: Onboarding & First Impressions | Pending |
| ONBD-02 | Phase 1: Onboarding & First Impressions | Pending |
| ONBD-03 | Phase 1: Onboarding & First Impressions | Pending |
| ONBD-04 | Phase 1: Onboarding & First Impressions | Pending |
| ONBD-05 | Phase 1: Onboarding & First Impressions | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2025-01-25*
*Last updated: 2026-01-26 after roadmap creation*
