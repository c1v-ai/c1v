# C1V Project - Agent Instructions

> **Version:** 1.0.0
> **Last Updated:** 2026-01-12
> **Maintainer:** Product Team

## 🎯 Project Overview

### Mission
Build and launch **Product Helper** - an AI-powered SaaS that helps founders, entrepreneurs, and product managers generate engineering-quality PRD (Product Requirements Document) artifacts through conversational intake and intelligent validation.

### Current Phase
**Phase:** Foundation & Template Merge
**Target Launch:** 2 weeks
**Priority:** Speed to market with quality

### Key Objectives
1. Merge saas-starter + langchain-nextjs-template into product-helper app
2. Implement conversational intake system with LangChain agents
3. Build SR-CORNELL-PRD-95-V1 validation engine
4. Generate artifacts: Context Diagram, Use Cases, UCBD, Requirements, SysML
5. Deploy to Vercel with Stripe payments

---

## 🏗️ Architecture

### Monorepo Structure
```
c1v/
├── apps/
│   ├── product-helper/      # Main SaaS app (merging templates)
│   ├── saas-starter/        # Auth, billing, DB (to be merged)
│   └── langchain-nextjs-template/  # LangChain agents (to be merged)
├── packages/
│   └── config/              # Shared configs (future)
├── .claude/
│   ├── instructions.md      # THIS FILE
│   ├── teams/               # Team-specific instructions
│   └── mcp-servers.json     # MCP configuration
└── docs/                    # Documentation
```

### Tech Stack
**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5.8
- Tailwind CSS 4.1
- shadcn/ui (Radix UI primitives)

**Backend:**
- Next.js API Routes & Server Actions
- Drizzle ORM 0.43
- PostgreSQL
- Stripe 18.1
- Auth with JWTs (jose 6.0)

**AI/Agents:**
- LangChain.js 0.3
- LangGraph 0.2 (agent orchestration)
- OpenAI GPT-4o
- Vercel AI SDK 3.1 (streaming)
- Zod 3.23 (structured outputs)

**Infrastructure:**
- PNPM 9.15 (package manager)
- Turborepo 2.7 (build system)
- Vercel (deployment)

---

## 🤖 Agent Teams

| Team | File | Agents | Primary Focus |
|------|------|--------|--------------|
| 🏗️ **Platform Engineering** | [platform-engineering.md](./teams/platform-engineering.md) | 3 | Backend, Database, Security |
| 🎨 **Frontend** | [frontend.md](./teams/frontend.md) | 3 | UI/UX, Chat, Visualization |
| 🧠 **AI/Agent Engineering** | [ai-agents.md](./teams/ai-agents.md) | 3 | LangChain, LLMs, Validation |
| 💾 **Data & Infrastructure** | [data-infrastructure.md](./teams/data-infrastructure.md) | 3 | Vector Store, Caching, Analytics |
| 📋 **Product & Planning** | [product-planning.md](./teams/product-planning.md) | 2 | Strategy, PM |
| 🔍 **Quality & Documentation** | [quality-docs.md](./teams/quality-docs.md) | 2 | QA, Documentation |

**Total:** 16 specialized agents

### When to Use Which Team
- **Need API/database work?** → Platform Engineering
- **Need UI components?** → Frontend
- **Need AI agents/LLM integration?** → AI/Agent Engineering
- **Need performance/caching?** → Data & Infrastructure
- **Need feature prioritization?** → Product & Planning
- **Need tests/documentation?** → Quality & Documentation

---

## 📋 Shared Conventions

### Code Style

**TypeScript:**
- Strict mode enabled
- Use type inference where possible
- Prefer interfaces over types for object shapes
- Use const assertions for literal types

**File Naming:**
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `route.ts` (Next.js convention)
- Server actions: `actions.ts`
- Types: `types.ts` or inline with code

**Imports:**
```typescript
// External libraries first
import { useState } from 'react';
import { z } from 'zod';

// Internal absolute imports
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db/drizzle';

// Relative imports (same directory)
import { helperFunction } from './utils';
```

**Formatting:**
- Use Prettier (configured in `.prettierrc`)
- 2-space indentation
- Single quotes
- Semicolons required
- 100 character line length

### Git Workflow

**Branch Naming:**
```
team/agent-name/feature-description

Examples:
- platform/backend-architect/add-project-api
- frontend/ui-engineer/create-chat-interface
- ai/validation-engineer/implement-sr-cornell
```

**Commit Messages (Conventional Commits):**
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scopes: api, db, ui, agents, validation, etc.

Examples:
- feat(api): add projects CRUD endpoints
- fix(db): correct foreign key constraints
- docs(agents): update LangChain integration guide
```

**Pull Request Process:**
1. Create feature branch from `main`
2. Make changes with atomic commits
3. Create PR with descriptive title and description
4. Request review from relevant team
5. Address feedback
6. Merge via squash commit (keep history clean)

### Documentation Requirements

**What to Document:**
- API endpoints (OpenAPI spec comments)
- Complex algorithms or business logic
- Agent workflows and state machines
- Database schema changes (migration notes)
- Environment variables (in `.env.example`)
- Architectural decisions (ADRs in `/docs/architecture/`)

**Where to Document:**
- **Code comments:** Complex logic, non-obvious decisions
- **Team files:** Update `.claude/teams/` when responsibilities change
- **README:** High-level features and setup
- **API docs:** OpenAPI/Swagger comments in route files
- **ADRs:** Major architectural decisions in `/docs/architecture/adr-NNNN-title.md`

**Documentation Duties by Team:**
- Platform Engineering: API docs, database schema
- Frontend: Component library, design system
- AI/Agent Engineering: Agent workflows, prompt templates
- Data & Infrastructure: Performance benchmarks, caching strategies
- Product & Planning: Product roadmap, feature specs
- Quality & Documentation: Test strategies, central documentation hub

---

## 🔄 Agent Communication Protocol

### Message Format
When communicating between agents, use this structure:

```typescript
interface AgentHandoff {
  from: {
    team: string;      // e.g., "Platform Engineering"
    agent: string;     // e.g., "Backend Architect"
  };
  to: {
    team: string;
    agent: string;
  };
  handoff_type: "schema" | "api_contract" | "component_spec" | "documentation";
  deliverable: {
    description: string;
    files: string[];          // File paths
    validation_criteria: string[];
    dependencies?: string[];  // Other handoffs this depends on
  };
  status: "proposed" | "in_progress" | "ready_for_review" | "complete";
}
```

### Key Handoff Points

**1. Database Schema → Backend API**
- **From:** Platform Engineering → Database Engineer
- **To:** Platform Engineering → Backend Architect
- **Deliverable:** Migration files, Drizzle schema types
- **Contract:** Type-safe schema exports, query helpers

**2. Backend API → Frontend**
- **From:** Platform Engineering → Backend Architect
- **To:** Frontend → UI/UX Engineer or Chat Engineer
- **Deliverable:** API route specs, TypeScript types, example requests
- **Contract:** OpenAPI spec, Zod schemas for validation

**3. AI Agent Workflows → Backend Integration**
- **From:** AI/Agent Engineering → LangChain Orchestrator
- **To:** Platform Engineering → Backend Architect
- **Deliverable:** Agent state machine, tool definitions
- **Contract:** API endpoints for agent execution, webhook handlers

**4. Validation Rules → AI Agents**
- **From:** AI/Agent Engineering → Validation Engineer
- **To:** AI/Agent Engineering → LangChain Orchestrator
- **Deliverable:** SR-CORNELL validator, quality score calculator
- **Contract:** Validation function signatures, error formats

**5. UI Components → Frontend Integration**
- **From:** Frontend → UI/UX Engineer
- **To:** Frontend → Chat Engineer or Viz Engineer
- **Deliverable:** Reusable React components, design tokens
- **Contract:** Component props, shadcn/ui patterns

**6. Diagram Generation → Frontend Display**
- **From:** AI/Agent Engineering → LangChain Orchestrator
- **To:** Frontend → Data Visualization Engineer
- **Deliverable:** PlantUML/Mermaid code, validation status
- **Contract:** Diagram format spec, rendering requirements

### Dependency Coordination

**Always check dependencies before starting work:**
1. Review handoff dependencies in your team file
2. Verify deliverables from upstream agents
3. Notify downstream agents when your work is ready
4. Update handoff status in team file or project board

---

## ✅ SR-CORNELL Validation

### Overview
**SR-CORNELL-PRD-95-V1** is our quality standard for PRD artifacts.

**Threshold:** 95% compliance required
**Spec Location:** `/Users/davidancor/c1v-product-helper/SR-CORNELL-PRD-95-V1.json`

### Hard Gates (10 Required)
1. System boundary defined
2. Primary actors defined (≥1)
3. Roles & permissions defined
4. External entities defined (≥1)
5. Use cases defined (5-15)
6. Each use case has trigger + outcome
7. Success criteria measurable
8. Business + technical constraints present
9. Core data objects defined (≥3)
10. At least one source reference

### Artifact Requirements

**Context Diagram:**
- Single system boundary
- All external entities have labeled interactions

**Use Case Diagram:**
- Each use case linked to an actor
- Use cases named as verb phrases

**UCBD (Use Case Behavior Diagram):**
- Preconditions present
- Ending conditions present
- Actors identified
- External elements identified

**Requirements Table:**
- Derived from UCBD "system shall" statements
- Each requirement is testable, singular, unambiguous
- ID and abstract name present

**SysML Activity Diagram:**
- Workflow steps defined
- Decision points identified

### Consistency Checks
- System name consistent across artifacts
- No new actors in UCBD without definition
- Context entities align with UC actors
- Scope in/out not contradicted by use cases
- Requirements trace back to UCBD steps

**Validation Agent:** AI/Agent Engineering → Validation Engineer
**Reference:** See [ai-agents.md](./teams/ai-agents.md) for validation implementation

---

## 🛠️ Available Tools & MCPs

### Installed MCP Servers
See [mcp-servers.json](./mcp-servers.json) for full configuration.

| MCP Server | Purpose | Primary Users |
|------------|---------|--------------|
| **filesystem** | Read/write codebase files | All agents |
| **github** | PR reviews, issues, project boards | All agents |
| **postgres** | Database queries, schema inspection | Platform Engineering, Data & Infrastructure |
| **puppeteer** | E2E testing, PDF generation, screenshots | Frontend, Quality & Documentation |
| **memory** | Long-term pattern tracking | All agents |
| **sequential-thinking** | Complex reasoning, architecture design | Platform Engineering, AI/Agent Engineering |

### When to Use Each MCP

**filesystem:**
- Reading/writing code files
- Exploring codebase structure
- Managing configuration files

**github:**
- Creating issues for bugs or features
- Reviewing PRs
- Managing project milestones
- Checking CI/CD status

**postgres:**
- Inspecting database schema
- Running read-only queries for debugging
- Validating migration results
- Analyzing query performance

**puppeteer:**
- Generating screenshots for documentation
- Running E2E tests
- Creating PDF exports
- Visual regression testing

**memory:**
- Tracking patterns across sessions
- Remembering user preferences
- Maintaining context about ongoing work
- Logging errors and resolutions

**sequential-thinking:**
- Designing complex architectures
- Multi-step reasoning for validation logic
- Security threat modeling
- Performance optimization strategies

---

## 🚨 Escalation & Support

### When to Ask the User
- **Ambiguous requirements:** Need clarification on feature behavior
- **Design choices:** Multiple valid approaches, need user preference
- **Scope questions:** Unclear if something is in/out of scope
- **Breaking changes:** Changes that affect existing behavior
- **Security concerns:** Potential vulnerabilities need user awareness

### When to Coordinate with Other Agents
- **Dependencies:** Your work depends on another agent's deliverable
- **Conflicts:** Overlapping responsibilities or contradictory approaches
- **Shared resources:** Multiple agents need to modify same files
- **Architecture changes:** Changes that affect multiple teams

### When to Proceed Independently
- **Implementation details:** Technical decisions within your expertise
- **Code style:** Following established conventions
- **Refactoring:** Improving code quality without changing behavior
- **Bug fixes:** Fixing obvious errors
- **Tests:** Adding test coverage

### Emergency Contacts
- **Blocker:** Tag @product-team in issue or PR
- **Security:** Immediately notify user + tag @security-team
- **Production incident:** Notify user + check Vercel dashboard
- **Critical bug:** Create GitHub issue with `priority:critical` label

---

## 🎓 Learning Resources

### Next.js 15
- [App Router Documentation](https://nextjs.org/docs/app)
- [Server Actions Guide](https://nextjs.org/docs/app/api-reference/functions/server-actions)
- [Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching)

### LangChain.js
- [LangChain Docs](https://js.langchain.com/docs/)
- [LangGraph Tutorial](https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/)
- [Structured Output Guide](https://js.langchain.com/docs/how_to/structured_output)

### Drizzle ORM
- [Drizzle Documentation](https://orm.drizzle.team/)
- [PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [Schema Definition](https://orm.drizzle.team/docs/sql-schema-declaration)

### Stripe Integration
- [Stripe Docs](https://stripe.com/docs)
- [Subscription Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhook Handling](https://stripe.com/docs/webhooks)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | Initial version - Foundation phase |

---

## 📝 Notes

**Philosophy:**
- Move fast but don't break things
- Document as you build
- Ask questions early
- Prefer simplicity over cleverness
- Ship iteratively

**Quality Standards:**
- All code must pass TypeScript compilation
- All PRs require tests for new features
- SR-CORNELL validation at 95% threshold
- Accessibility (WCAG) for UI components

**Remember:**
- You're building a product, not a perfect codebase
- Launch in 2 weeks is the goal
- Focus on core features: intake → validation → diagram generation → export
- Nice-to-haves can wait for v2

---

For team-specific instructions, see [.claude/teams/](./.claude/teams/).
