# Product Helper V2

## What This Is

Product Helper is an AI-powered PRD generation platform that guides users through conversational intake to produce comprehensive product requirements documents, technical specifications, architecture diagrams, database schemas, API specs, and user stories. V2 is about achieving feature parity with Epic.dev through two parallel tracks: training the agent pipeline to produce Epic-quality output end-to-end, and building a Project Explorer UI to display that output.

## Core Value

The conversational AI intake pipeline that transforms a product idea into a complete, validated PRD with technical specifications -- one conversation produces everything a developer needs to build.

## Requirements

### Validated

- ✓ Conversational PRD intake via LangGraph 7-node state machine -- existing
- ✓ 7 intake agents (clarification-detector, completion-detector, priority-scorer, question-bank, questions, state-manager, state) -- existing
- ✓ 6 generator agents (extraction, user-stories, api-spec, tech-stack, infrastructure, guidelines, schema-extraction) -- existing
- ✓ PRD-SPEC 10 hard-gate validation engine (95% threshold) -- existing
- ✓ Real-time completeness % tracking during intake -- existing
- ✓ Adaptive question bank with priority scoring -- existing
- ✓ SSE streaming for LLM responses -- existing
- ✓ Conversation checkpointing and resume -- existing
- ✓ JWT-based authentication with session management -- existing
- ✓ Teams with invitations (Resend email integration) -- existing
- ✓ API key CRUD with rate limiting (100 req/min) -- existing
- ✓ 17 MCP tools registered (Claude Code, Cursor, VS Code, Windsurf integrations) -- existing
- ✓ SKILL.md and CLAUDE.md export generators -- existing
- ✓ Mermaid diagram rendering (context, use case, class diagrams) -- existing
- ✓ 13 database tables with Drizzle ORM -- existing
- ✓ PWA with bottom nav and offline support -- existing
- ✓ Dark/light theme toggle -- existing

### Active

**Track A: Agent Pipeline Training**
- [ ] Problem statement extraction agent
- [ ] Target users / full personas extraction (goals, pain points, behaviors)
- [ ] Goals & success metrics table extraction
- [ ] Scope in/out format extraction (matching Epic.dev format)
- [ ] Non-functional requirements extraction agent
- [ ] Quick Start orchestrator (one-shot PRD from brief input)
- [ ] Staged approval gates (PRD -> Tech -> Impl -> Stories)
- [ ] Dual-format output (.md + .mmd, .schema.json, .openapi.json)
- [ ] End-to-end pipeline orchestration matching Epic.dev output quality

**Track B: Explorer UI**
- [ ] Project Explorer tree sidebar navigation (Epic.dev paradigm)
- [ ] Section content views (PRD, System Overview, Tech Stack, etc.)
- [ ] User Stories table view with grouping by feature
- [ ] Story UI (badges, status counters, time estimates)
- [ ] Diagram viewer controls (zoom, pan, copy, fullscreen)
- [ ] Progress cards during generation ("Creating API Spec -- Done")
- [ ] Export dropdown with ZIP generation (matching Epic.dev export format)
- [ ] Chat positioned as persistent right panel (256px explorer + content + 400px chat)
- [ ] Empty states that guide users to chat
- [ ] Journey progress tracker (Discovery -> Requirements -> Technical -> Validation -> Export Ready)
- [ ] First-run experience for new projects

**Convergence: Pipeline + UI**
- [ ] Explorer renders improved pipeline output
- [ ] Real-time entity extraction displayed in sidebar
- [ ] Interactive diagram viewing with export
- [ ] PRD-SPEC validation score displayed in explorer

### Out of Scope

- OAuth sign-up (Google/GitHub) -- sufficient with email/password for V2 scope
- Pricing/credits system -- separate monetization sprint after V2
- Real-time collaboration / comments -- high complexity, defer to V3
- ChatGPT/Lovable IDE integrations -- current 4 integrations sufficient
- Kanban board / drag-drop story management -- advanced backlog feature for V3
- PDF export -- ZIP with markdown + machine-parseable formats covers needs
- Online research validation (Reddit/X/HN) -- future differentiator
- Mobile-specific layouts -- PWA bottom nav exists, explorer is desktop-first

## Context

**Competitive Landscape:** Epic.dev is the primary competitor. Their strength is a trained end-to-end pipeline that produces a complete product development artifact from a single button press. Their UI organizes output in a file-tree explorer. PH's advantage is conversational adaptive intake with real-time validation -- Epic has no equivalent.

**Current State:** 47% feature parity with Epic.dev (73/155 features built, 14 partial, 68 missing). Backend/pipeline is ~80% complete. Frontend is ~20% complete. The data exists but the views don't.

**Epic.dev Export as Training Data:** Downloaded Epic.dev export provides the answer key for target output format:
```
project-name-export/
├── README.md
└── Product_Requirements_Document/
    ├── Product_Requirements_Document.md (full PRD)
    ├── Architecture_Diagram.md + .mmd
    ├── System_Overview.md
    ├── Tech_Stack.md
    ├── Infrastructure_&_Deployment.md
    ├── User_Stories.md (largest file)
    └── Backend/
        ├── Database_Schema.md + .schema.json
        ├── API_Specification.md + .openapi.json
```

**Design System:** Dark theme, teal (#0d7377) / orange (#ff6d35) accents, Inter font, JetBrains Mono for code, card-based UI with #1a1a2e backgrounds, #2a2a40 borders, 12px border radius.

**Reference Materials:** Epic.dev screenshots, export ZIP, user journey docs, 12 phase planning docs, 6 knowledge bank educational diagrams, frontend V2 proposal with full design specs.

## Constraints

- **Tech Stack**: Next.js 15 App Router, LangGraph/LangChain (TypeScript), Drizzle ORM + PostgreSQL, Vercel deployment -- all existing and committed
- **Architecture**: LangGraph 7-node state machine is the backbone -- extend, don't replace
- **Performance**: Page load < 2s (LCP), time to interactive < 3s, accessibility score > 90
- **Compatibility**: Must maintain all 17 existing MCP tool registrations
- **Pipeline**: Existing 7 intake + 6 generator agents must continue working -- additive changes only
- **Deployment**: Vercel with Turborepo monorepo (c1v parent repo)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Parallel tracks (pipeline + UI simultaneously) | Both tracks are independent until convergence; maximizes throughput | -- Pending |
| Explorer tree as primary navigation | Epic.dev's strongest UX pattern; replaces PH's flat 5-tab navigation | -- Pending |
| Chat as persistent right panel | Chat is PH's differentiator; must be prominent, not hidden | -- Pending |
| Epic.dev export as pipeline training data | Their export IS the target output format; literal answer key | -- Pending |
| Additive pipeline changes only | Existing agents work; add new extraction agents and orchestrator | -- Pending |
| Dual-format output (.md + machine-parseable) | Epic exports both; developers need JSON/OpenAPI, PMs need markdown | -- Pending |

---
*Last updated: 2025-01-25 after initialization*
