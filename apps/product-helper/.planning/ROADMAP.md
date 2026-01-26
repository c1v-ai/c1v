# Roadmap: Product Helper V2

**Created:** 2026-01-26
**Depth:** Comprehensive
**Phases:** 9
**Coverage:** 34/34 v1 requirements mapped

---

## Overview

Product Helper V2 closes the competitive gap with Epic.dev across two parallel tracks: training the agent pipeline to produce Epic-quality output (extraction agents, Quick Start, dual-format artifacts) and building the Project Explorer UI to display that output (tree navigation, content views, user stories, diagrams). The nine phases below are derived from natural delivery boundaries -- onboarding fixes, Quick Start completion, extraction agents, pipeline orchestration, explorer shell, content views, rich data views, chat enhancements, and inline editing -- ordered by dependencies and designed for parallel execution where tracks are independent.

---

## Phase 1: Onboarding & First Impressions

**Goal:** New users land in the right place with context that improves pipeline output quality

**Dependencies:** None (can start immediately)

**Requirements:** ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05

**Success Criteria:**
1. User who just signed in lands on /projects (not Team Settings)
2. User can select project type (SaaS, mobile, marketplace, etc.) during project setup
3. User can select project stage (idea, prototype, MVP, growth) during project setup
4. User can provide budget range during project setup
5. User can select their role (founder, PM, developer, designer) during project setup

---

## Phase 2: Quick Start Pipeline ✓

**Goal:** Users can generate a complete PRD from a single brief input in under 60 seconds

**Dependencies:** None (independent of other phases)

**Requirements:** PIPE-08, PIPE-09, PIPE-10, CHAT-04

**Status:** Complete. All 4 subtasks done (T029-T032). Synthesis agent, orchestrator, SSE route, and progress cards UI shipped.

**Success Criteria:**
1. ✓ User can click "Quick Start" and provide a one-sentence product description
2. ✓ System expands brief input into full project context via 2-call synthesis (domain analysis + use case derivation)
3. ✓ User sees real-time progress cards ("Creating PRD... Done", "Creating API Spec... Done") as each artifact generates
4. ✓ All standard artifacts (PRD, tech stack, schema, API spec, user stories, diagrams) generate from the Quick Start flow
5. ✓ SSE stream delivers generation progress to the client in real time

---

## Phase 3: PRD Extraction Agents

**Goal:** Pipeline produces Epic-quality PRD sections that were previously missing from output

**Dependencies:** None (parallel with Phase 1, 2)

**Requirements:** PIPE-01, PIPE-02, PIPE-03, PIPE-04

**Success Criteria:**
1. Generated PRD contains a structured problem/opportunity statement section extracted from conversation
2. Generated PRD contains full personas with names, goals, pain points, and behaviors (not just actor names)
3. Generated PRD contains a goals and success metrics table with measurable outcomes
4. Generated PRD contains non-functional requirements (performance, security, scalability) as a distinct section

---

## Phase 4: Pipeline Orchestration & Quality

**Goal:** Pipeline enforces quality gates, outputs machine-parseable formats, and uses improved knowledge graphs

**Dependencies:** Phase 3 (extraction agents must exist before gates validate them)

**Requirements:** PIPE-05, PIPE-06, PIPE-07, CHAT-01

**Success Criteria:**
1. System enforces staged approval gates: user must approve PRD before Tech Specs generate, Tech Specs before Implementation, Implementation before Stories
2. Each artifact outputs in dual format: human-readable markdown (.md) plus machine-parseable format (.mmd for diagrams, .schema.json for DB, .openapi.json for API)
3. Knowledge graphs produce more accurate scope definitions and requirements from conversation context
4. Chat responses demonstrate improved requirements-building capability informed by trained knowledge graphs

---

## Phase 5: Explorer Shell & Layout

**Goal:** Users navigate their project through a tree sidebar with persistent chat panel and guided empty states

**Dependencies:** None for UI shell (data already exists from phases 9-11). Logically Track B starts here.

**Requirements:** EXPL-01, EXPL-02, EXPL-13, EXPL-14

**Success Criteria:**
1. User sees a tree sidebar (left panel, ~256px) listing all project sections with expand/collapse behavior
2. Explorer tree shows generated sections with item counts and completion indicators
3. Chat panel is persistently visible as a right panel (~400px) alongside the content area
4. When a section has no generated content, user sees an empty state with a call-to-action that focuses the chat on that topic

---

## Phase 6: Content Section Views

**Goal:** Users can view all generated PRD and technical specification content in formatted, section-specific views

**Dependencies:** Phase 5 (explorer shell must exist to host content views)

**Requirements:** EXPL-03, EXPL-04, EXPL-05, EXPL-06, EXPL-07

**Success Criteria:**
1. User can select "Product Requirements" in the tree and view the full PRD content in a formatted markdown view
2. User can view System Overview section with project summary, actors, and system boundaries
3. User can view Tech Stack section showing recommended technologies with rationale and alternatives
4. User can view Infrastructure & Deployment section showing hosting, CI/CD, monitoring, and environments
5. User can view Architecture Diagram section with the rendered system architecture Mermaid diagram

---

## Phase 7: Rich Data Views (Stories, Schema, API, Diagrams)

**Goal:** Users can interact with structured data views -- user stories table, database schema, API spec, and enhanced diagram controls

**Dependencies:** Phase 5 (explorer shell). Phase 6 recommended but not blocking.

**Requirements:** EXPL-08, EXPL-09, EXPL-10, EXPL-11, EXPL-12

**Success Criteria:**
1. User can view User Stories in a table grouped by feature/epic with columns for ID, title, status, and priority
2. User Stories display priority badges (color-coded), status indicators, completion counters ("0/32 completed"), and time estimates ("~17.5 days estimated")
3. User can view Database Schema section showing entities with fields, types, constraints, and relationships
4. User can view API Specification section showing endpoints with methods, request/response schemas, and auth requirements
5. Diagram viewer supports zoom (+/- with percentage), pan (drag), copy Mermaid source, and fullscreen mode

---

## Phase 8: Chat Enhancements

**Goal:** Chat panel provides agent specialization and clear feedback during AI processing

**Dependencies:** Phase 5 (chat panel must be positioned in explorer layout)

**Requirements:** CHAT-02, CHAT-03

**Success Criteria:**
1. User can select an agent role (e.g., "Architect", "Product Manager") from a dropdown in the chat panel header
2. Loading states show clear, contextual progress indicators during AI processing (not just a generic spinner)

---

## Phase 9: Inline Section Editing

**Goal:** Users can edit generated PRD content directly within the explorer without switching to a separate editing mode

**Dependencies:** Phase 6 (content views must exist to enable inline editing)

**Requirements:** EXPL-15

**Success Criteria:**
1. User can click on a PRD section within the explorer view and edit the content inline
2. Edits persist and are reflected when the section is next viewed

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Onboarding & First Impressions | ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05 | Pending |
| 2 | Quick Start Pipeline | PIPE-08, PIPE-09, PIPE-10, CHAT-04 | ✓ Complete |
| 3 | PRD Extraction Agents | PIPE-01, PIPE-02, PIPE-03, PIPE-04 | Pending |
| 4 | Pipeline Orchestration & Quality | PIPE-05, PIPE-06, PIPE-07, CHAT-01 | Pending |
| 5 | Explorer Shell & Layout | EXPL-01, EXPL-02, EXPL-13, EXPL-14 | Pending |
| 6 | Content Section Views | EXPL-03, EXPL-04, EXPL-05, EXPL-06, EXPL-07 | Pending |
| 7 | Rich Data Views | EXPL-08, EXPL-09, EXPL-10, EXPL-11, EXPL-12 | Pending |
| 8 | Chat Enhancements | CHAT-02, CHAT-03 | Pending |
| 9 | Inline Section Editing | EXPL-15 | Pending |

---

## Parallel Execution Map

Track A (Pipeline) and Track B (Explorer UI) are independent until convergence (when UI renders pipeline output).

```
Track A (Pipeline):                 Track B (Explorer UI):

Phase 1: Onboarding --------+
                             |
Phase 2: Quick Start -----+ |      Phase 5: Explorer Shell ----+
(IN PROGRESS)              | |                                  |
                           | |      Phase 6: Content Views -----+---> CONVERGENCE
Phase 3: Extraction -------+-+                                  |     (UI renders
                           |        Phase 7: Rich Data Views ---+      pipeline output)
Phase 4: Orchestration ----+                                    |
                                    Phase 8: Chat Enhancements -+
                                                                |
                                    Phase 9: Inline Editing ----+
```

**Phase 1** can run in parallel with everything (no dependencies).
**Phases 2, 3** can run in parallel with each other and with Phase 5.
**Phase 4** depends on Phase 3.
**Phases 6, 7, 8** depend on Phase 5 but can run in parallel with each other.
**Phase 9** depends on Phase 6.

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 3 | Pending |
| PIPE-02 | Phase 3 | Pending |
| PIPE-03 | Phase 3 | Pending |
| PIPE-04 | Phase 3 | Pending |
| PIPE-05 | Phase 4 | Pending |
| PIPE-06 | Phase 4 | Pending |
| PIPE-07 | Phase 4 | Pending |
| PIPE-08 | Phase 2 | Complete |
| PIPE-09 | Phase 2 | Complete |
| PIPE-10 | Phase 2 | Complete |
| EXPL-01 | Phase 5 | Pending |
| EXPL-02 | Phase 5 | Pending |
| EXPL-03 | Phase 6 | Pending |
| EXPL-04 | Phase 6 | Pending |
| EXPL-05 | Phase 6 | Pending |
| EXPL-06 | Phase 6 | Pending |
| EXPL-07 | Phase 6 | Pending |
| EXPL-08 | Phase 7 | Pending |
| EXPL-09 | Phase 7 | Pending |
| EXPL-10 | Phase 7 | Pending |
| EXPL-11 | Phase 7 | Pending |
| EXPL-12 | Phase 7 | Pending |
| EXPL-13 | Phase 5 | Pending |
| EXPL-14 | Phase 5 | Pending |
| EXPL-15 | Phase 9 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 8 | Pending |
| CHAT-03 | Phase 8 | Pending |
| CHAT-04 | Phase 2 | Complete |
| ONBD-01 | Phase 1 | Pending |
| ONBD-02 | Phase 1 | Pending |
| ONBD-03 | Phase 1 | Pending |
| ONBD-04 | Phase 1 | Pending |
| ONBD-05 | Phase 1 | Pending |

**Mapped: 34/34** -- all v1 requirements covered, no orphans.

---

*Roadmap created: 2026-01-26*
*Derived from 34 requirements across 4 categories*
