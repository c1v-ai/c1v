# Product Helper v2.0 Roadmap

**Created:** 2026-01-25
**Status:** Planning
**Target:** Competitive parity with Epic.dev + differentiation through PRD-SPEC, GSD, and CLEO

---

## Executive Summary

Product Helper v2.0 is a strategic upgrade to achieve competitive parity with Epic.dev while maintaining and emphasizing our unique advantages (PRD-SPEC validation, GSD workflow integration, CLEO task tracking).

**Key Insight:** Epic.dev's killer feature is MCP integration that exports project architecture to Claude Code/Cursor/VS Code. This creates a direct bridge from PRD → coding. We must match this while emphasizing our quality validation approach.

---

## Competitive Gap Analysis

### Epic.dev Strengths (Must Match)

| Feature | Epic.dev | Product Helper Current | Gap |
|---------|----------|------------------------|-----|
| **MCP Connector** | 17 tools, one-click setup | None | 🔴 CRITICAL |
| **User Stories** | Full backlog with status/priority | None | 🔴 HIGH |
| **Tech Stack** | Auto-generated with rationale | None | 🔴 HIGH |
| **Database Schema** | Full fields, types, constraints | Entity names only | 🔴 HIGH |
| **API Specifications** | Endpoint contracts | None | 🟠 MEDIUM |
| **Architecture Diagram** | System architecture | UML only | 🟠 MEDIUM |
| **Infrastructure Spec** | Deployment, CI/CD | None | 🟠 MEDIUM |
| **Coding Guidelines** | Standards doc | None | 🟠 MEDIUM |
| **Project Explorer** | Tree sidebar | Flat tabs | 🟡 LOW |
| **SKILL.md Export** | Downloadable | None | 🟡 LOW |

### Our Unique Advantages (Must Preserve & Emphasize)

| Feature | Product Helper | Epic.dev |
|---------|----------------|----------|
| **PRD-SPEC Validation** | 10 hard gates, quality scoring | None |
| **Completeness Tracking** | Real-time % score | Not visible |
| **GSD Workflow** | Phase-based development | None |
| **CLEO Task Tracking** | Stable IDs, audit trail | None |
| **Conversational Intake** | Adaptive question flow | Single prompt |
| **17 Domain Agents** | Specialized agents | Generic AI |

---

## Phase Structure

### Milestone 2.0: Competitive Catch-Up + Differentiation

```
Phase 9:  Data Model Depth (Backend)         ← Week 1-2
Phase 10: Generators & Agents (Backend)      ← Week 2-3
Phase 11: MCP Server (Backend) [CRITICAL]    ← Week 3-4
Phase 12: Project Explorer UI (Frontend)     ← Week 4-5
Phase 13: Data Views & Diagrams (Frontend)   ← Week 5-6
Phase 14: Polish & Validation (Full Stack)   ← Week 6-7
```

---

## Phase 9: Data Model Depth

**Goal:** Expand data extraction to match Epic.dev's depth
**Effort:** High
**Dependencies:** None (can start immediately)

### 9.1 Enhanced Use Cases Schema

**Current:**
```typescript
{ id, name, description, actor }
```

**Target:**
```typescript
interface UseCase {
  id: string;
  name: string;
  description: string;
  actor: string;
  trigger: string;
  outcome: string;
  preconditions: string[];
  postconditions: string[];
  mainFlow: FlowStep[];
  alternativeFlows: AlternativeFlow[];
  acceptanceCriteria: string[];
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'draft' | 'validated';
}
```

**Tasks:**
- [ ] Update `lib/db/schema.ts` with enhanced use_cases columns
- [ ] Update extraction agent to capture full use case details
- [ ] Add migration for new columns
- [ ] Update validation rules for enhanced fields

### 9.2 Full Database Schema Model

**Current:** Entity names only (["User", "Task", "Project"])

**Target:**
```typescript
interface DatabaseSchema {
  entities: Entity[];
}

interface Entity {
  name: string;
  description: string;
  fields: Field[];
  relationships: Relationship[];
  indexes: string[];
  constraints: string[];
}

interface Field {
  name: string;
  type: string; // "uuid" | "text" | "timestamp" | "integer" | etc.
  nullable: boolean;
  defaultValue?: string;
  constraints: string[]; // "PRIMARY KEY", "UNIQUE", "NOT NULL"
}

interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetEntity: string;
  foreignKey: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}
```

**Tasks:**
- [ ] Create `lib/db/schema/database-schema.ts` with new schema
- [ ] Create schema extraction agent: `lib/langchain/agents/schema-extraction-agent.ts`
- [ ] Add database_schema JSON column to projects table
- [ ] Update intake flow to capture schema details

### 9.3 Tech Stack with Rationale

**Target:**
```typescript
interface TechStack {
  categories: TechCategory[];
  constraints: string[];
  rationale: string;
}

interface TechCategory {
  category: 'frontend' | 'backend' | 'database' | 'auth' | 'hosting' | 'cache' | 'queue' | 'monitoring';
  choice: string;
  rationale: string;
  alternatives: Alternative[];
}

interface Alternative {
  name: string;
  whyNot: string;
}
```

**Tasks:**
- [ ] Create `lib/langchain/agents/tech-stack-agent.ts`
- [ ] Add tech_stack JSON column to projects table
- [ ] Create tech stack recommendation prompt based on project type/constraints
- [ ] Add tech stack step to intake flow (optional)

### 9.4 User Stories Model

**Target:**
```typescript
interface UserStory {
  id: string;
  useCaseId?: string; // Link to originating use case
  title: string;
  description: string; // "As a [actor], I want [goal], so that [benefit]"
  actor: string;
  epic?: string;
  acceptanceCriteria: string[];
  status: 'todo' | 'in-progress' | 'done' | 'stuck';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: 'small' | 'medium' | 'large';
  order: number;
}
```

**Tasks:**
- [ ] Create `lib/db/schema/user-stories.ts`
- [ ] Create migration for user_stories table
- [ ] Create `lib/langchain/agents/user-stories-agent.ts` to transform use cases
- [ ] Add status update API: `PUT /api/projects/:id/stories/:storyId`

---

## Phase 10: Generators & Agents

**Goal:** Create new AI agents for generating technical specifications
**Effort:** High
**Dependencies:** Phase 9

### 10.1 API Specification Generator

**Target:**
```typescript
interface APISpecification {
  baseUrl: string;
  version: string;
  authentication: AuthConfig;
  endpoints: Endpoint[];
  responseFormat: ResponseFormat;
  errorHandling: ErrorConfig;
}

interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  authentication: boolean;
  requestBody?: JSONSchema;
  responseBody: JSONSchema;
  errorCodes: ErrorCode[];
  rateLimit?: string;
}
```

**Tasks:**
- [ ] Create `lib/langchain/agents/api-spec-agent.ts`
- [ ] Generate endpoints from use cases + data entities
- [ ] Add api_specification JSON column to projects
- [ ] Create OpenAPI 3.0 export option

### 10.2 Infrastructure Specification Generator

**Target:**
```typescript
interface InfrastructureSpec {
  hosting: HostingConfig;
  database: DatabaseConfig;
  caching?: CacheConfig;
  cicd: CICDConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}
```

**Tasks:**
- [ ] Create `lib/langchain/agents/infrastructure-agent.ts`
- [ ] Generate based on tech stack + scale requirements
- [ ] Add infrastructure_spec JSON column

### 10.3 Coding Guidelines Generator

**Target:**
```typescript
interface CodingGuidelines {
  naming: NamingConventions;
  patterns: string[];
  forbidden: string[];
  linting: LintConfig;
  testing: TestingStrategy;
  documentation: DocStrategy;
}
```

**Tasks:**
- [ ] Create `lib/langchain/agents/guidelines-agent.ts`
- [ ] Generate based on tech stack + team preferences
- [ ] Add coding_guidelines JSON column

### 10.4 System Architecture Diagram Generator

**Current:** Context, Use Case, Class diagrams
**Add:** Full system architecture diagram

**Tasks:**
- [ ] Add `generateSystemArchitectureDiagram()` to `lib/diagrams/generators.ts`
- [ ] Use Mermaid flowchart with subgraphs for services
- [ ] Auto-generate based on tech stack + API specs

---

## Phase 11: MCP Server [CRITICAL]

**Goal:** Export project as MCP server for Claude Code/Cursor/VS Code integration
**Effort:** Very High
**Dependencies:** Phase 9, 10
**Priority:** P0 - This is the competitive differentiator

### 11.1 MCP HTTP Server

**Endpoint:** `POST /api/mcp/[projectId]`

**Architecture:**
```
/app/api/mcp/
├── [projectId]/
│   ├── route.ts           # Main MCP endpoint
│   └── tools/
│       ├── get-prd.ts
│       ├── get-database-schema.ts
│       ├── get-api-specs.ts
│       ├── get-tech-stack.ts
│       ├── get-user-stories.ts
│       ├── get-coding-guidelines.ts
│       ├── get-diagrams.ts
│       ├── get-infrastructure.ts
│       ├── get-validation-status.ts
│       ├── update-story-status.ts
│       ├── search-project.ts
│       ├── ask-question.ts
│       └── invoke-agent.ts        # Our advantage!
├── config/
│   └── route.ts           # Generate MCP config JSON
└── key/
    └── route.ts           # API key management
```

**Tasks:**
- [ ] Create MCP server framework at `/app/api/mcp/`
- [ ] Implement 17+ MCP tools (match Epic + add our unique tools)
- [ ] Add API key generation per project
- [ ] Add API key storage in database
- [ ] Add rate limiting for MCP endpoints

### 11.2 MCP Tool Implementations

**Match Epic.dev (12 tools):**
| Tool | Description |
|------|-------------|
| `get_coding_context` | MUST DO / MUST NOT DO rules |
| `get_project_architecture` | Full architecture overview |
| `get_prd` | Requirements, personas, scope |
| `get_database_schema` | Entity definitions |
| `get_api_specs` | Endpoint contracts |
| `get_tech_stack` | Approved technologies |
| `get_user_stories` | Stories with acceptance criteria |
| `get_diagrams` | Architecture diagrams (Mermaid) |
| `get_coding_guidelines` | Code standards |
| `get_infrastructure` | Deployment config |
| `update_user_story_status` | Track progress |
| `ask_project_question` | AI Q&A about project |

**Our Unique Tools (5 tools):**
| Tool | Description | Advantage |
|------|-------------|-----------|
| `get_validation_status` | PRD-SPEC score + checks | Quality gate |
| `get_gsd_phases` | GSD workflow phases | Structured dev |
| `get_cleo_tasks` | CLEO task list | Stable IDs |
| `invoke_agent` | Trigger domain agent | 17 specialists |
| `search_project_context` | Keyword search | Fast lookup |

### 11.3 One-Click Setup UI

**Connection Page:** `/app/(dashboard)/projects/[id]/connections/page.tsx`

**Features:**
- Display available integrations (Claude Code, Cursor, VS Code, Windsurf)
- One-click copy command: `claude mcp add product-helper-[project] https://...`
- Download SKILL.md (project-specific)
- Download CLAUDE.md (quick reference)
- API key management (generate, revoke)
- Connection status indicator

**Tasks:**
- [ ] Create connections page UI
- [ ] Create SKILL.md generator: `lib/mcp/skill-generator.ts`
- [ ] Create CLAUDE.md generator: `lib/mcp/claude-md-generator.ts`
- [ ] Add API key management UI

---

## Phase 12: Project Explorer UI

**Goal:** Redesign project view with tree sidebar like Epic.dev
**Effort:** High
**Dependencies:** Phase 9-11 (needs new data models)

### 12.1 Project Explorer Sidebar

**Structure:**
```
Project Explorer
├── Overview
├── Product Requirements
│   ├── Problem Statement
│   ├── Target Users (Actors)
│   ├── Goals & Success Metrics
│   ├── Scope (System Boundaries)
│   └── Use Cases
├── Technical Specifications
│   ├── Tech Stack
│   ├── Database Schema
│   ├── API Specifications
│   └── Infrastructure
├── Architecture
│   ├── System Diagram
│   ├── Data Model Diagram
│   └── Context Diagram
├── User Stories
│   ├── Backlog
│   └── In Progress
├── Validation (PRD-SPEC)
├── Coding Guidelines
└── Connections (MCP)
```

**Components:**
- [ ] `components/projects/project-explorer.tsx`
- [ ] `components/projects/explorer-tree-item.tsx`
- [ ] `components/projects/explorer-section.tsx`

### 12.2 Section Content Views

**Tasks:**
- [ ] Create collapsible section content components
- [ ] Wire up to new data models from Phase 9-10
- [ ] Add inline editing capability
- [ ] Add section completion indicators

---

## Phase 13: Data Views & Diagrams

**Goal:** Rich display of all generated content
**Effort:** Medium
**Dependencies:** Phase 12

### 13.1 Database Schema Viewer

- [ ] Create `components/data/schema-viewer.tsx`
- [ ] Display entities with fields, types, relationships
- [ ] Visual ERD rendering option
- [ ] Export to SQL / Drizzle / Prisma format

### 13.2 API Specification Viewer

- [ ] Create `components/data/api-spec-viewer.tsx`
- [ ] Interactive endpoint list
- [ ] Request/response schema display
- [ ] Export to OpenAPI 3.0

### 13.3 User Stories Board

- [ ] Create `components/data/stories-board.tsx`
- [ ] Kanban-style board view
- [ ] List view option
- [ ] Drag-drop status updates
- [ ] Bulk export (Jira, Linear, CSV)

### 13.4 Architecture Diagram Enhancements

- [ ] Add system architecture diagram type
- [ ] Improve diagram viewer with better zoom/pan
- [ ] Add diagram annotations
- [ ] Multiple export formats (SVG, PNG, PDF)

---

## Phase 14: Polish & Validation

**Goal:** Production-ready quality
**Effort:** Medium
**Dependencies:** Phase 9-13

### 14.1 PRD-SPEC Validation Updates

- [ ] Add validation rules for new data types
- [ ] Validate tech stack completeness
- [ ] Validate API spec coverage
- [ ] Add "Validated PRD" badge for MCP export

### 14.2 Error Handling & Edge Cases

- [ ] Add error states for all new components
- [ ] Add loading skeletons
- [ ] Add empty states with CTAs
- [ ] Handle partial data gracefully

### 14.3 Performance Optimization

- [ ] Lazy load heavy components (diagrams, schema viewer)
- [ ] Add SWR caching for new endpoints
- [ ] Optimize MCP endpoint response times

### 14.4 Testing

- [ ] Unit tests for new agents
- [ ] Integration tests for MCP endpoints
- [ ] E2E tests for new user flows
- [ ] Load testing for MCP server

---

## Implementation Timeline

```
Week 1-2: Phase 9 (Data Model Depth)
├── Enhanced use cases schema
├── Full database schema model
├── Tech stack model
└── User stories model

Week 2-3: Phase 10 (Generators)
├── API spec generator
├── Infrastructure spec generator
├── Coding guidelines generator
└── System architecture diagram

Week 3-4: Phase 11 (MCP Server) [CRITICAL]
├── MCP HTTP server framework
├── 17+ tool implementations
├── API key management
└── One-click setup UI

Week 4-5: Phase 12 (Project Explorer UI)
├── Tree sidebar
├── Section content views
└── Navigation integration

Week 5-6: Phase 13 (Data Views)
├── Schema viewer
├── API spec viewer
├── Stories board
└── Diagram enhancements

Week 6-7: Phase 14 (Polish)
├── Validation updates
├── Error handling
├── Performance
└── Testing
```

---

## Success Criteria

### Phase 9 Complete When:
- [ ] Use cases have trigger, outcome, acceptance criteria
- [ ] Database schema has fields, types, relationships
- [ ] Tech stack has choices with rationale
- [ ] User stories table created with status tracking

### Phase 10 Complete When:
- [ ] API spec generated from use cases
- [ ] Infrastructure spec generated from tech stack
- [ ] Coding guidelines generated from tech stack
- [ ] System architecture diagram renders correctly

### Phase 11 Complete When: [CRITICAL]
- [ ] MCP server responds to all 17 tools
- [ ] One-click setup works with Claude Code
- [ ] SKILL.md downloads with correct project tools
- [ ] API keys generate and authenticate correctly

### Phase 12 Complete When:
- [ ] Project Explorer shows tree navigation
- [ ] All sections expandable/collapsible
- [ ] Navigation updates URL correctly

### Phase 13 Complete When:
- [ ] Schema viewer displays all entities
- [ ] API spec viewer shows all endpoints
- [ ] Stories board supports drag-drop status
- [ ] All diagram types render and export

### Phase 14 Complete When:
- [ ] All new data types validate
- [ ] No console errors in production
- [ ] MCP response time < 500ms
- [ ] Test coverage > 80% for new code

---

## Files to Create/Modify

### Database Schema
- `lib/db/schema.ts` - Add new columns
- `lib/db/migrations/` - New migration files

### Agents
- `lib/langchain/agents/schema-extraction-agent.ts`
- `lib/langchain/agents/tech-stack-agent.ts`
- `lib/langchain/agents/user-stories-agent.ts`
- `lib/langchain/agents/api-spec-agent.ts`
- `lib/langchain/agents/infrastructure-agent.ts`
- `lib/langchain/agents/guidelines-agent.ts`

### MCP Server
- `app/api/mcp/[projectId]/route.ts`
- `app/api/mcp/[projectId]/tools/*.ts`
- `app/api/mcp/config/route.ts`
- `app/api/mcp/key/route.ts`
- `lib/mcp/skill-generator.ts`
- `lib/mcp/claude-md-generator.ts`

### Components
- `components/projects/project-explorer.tsx`
- `components/projects/explorer-tree-item.tsx`
- `components/data/schema-viewer.tsx`
- `components/data/api-spec-viewer.tsx`
- `components/data/stories-board.tsx`
- `app/(dashboard)/projects/[id]/connections/page.tsx`

### Diagrams
- `lib/diagrams/generators.ts` - Add system architecture

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| MCP spec changes | High | Monitor MCP spec, abstract implementation |
| Agent quality | Medium | Extensive prompt engineering, human review |
| Performance | Medium | Caching, lazy loading, pagination |
| Scope creep | High | Strict phase gates, weekly reviews |

---

## Dependencies on v1.1

This v2.0 roadmap assumes v1.1 Phases 1-3 are complete:
- ✅ Test stabilization (317/317 passing)
- ✅ Security hardening (env validation, SSL)
- ✅ Mobile-first web revamp (PWA, dark mode)

Phase 4-8 from v1.1 can run in parallel or be deferred:
- Phase 4 (Backend Hardening) - Can run parallel with Phase 9
- Phase 5 (Performance) - Defer to Phase 14
- Phase 6 (Documentation) - Can run parallel
- Phase 7 (Component Testing) - Include in Phase 14
- Phase 8 (Planning Agents) - Include agent updates in Phase 10

---

*Plan created: 2026-01-25*
*Version: 2.0.0-planning*
