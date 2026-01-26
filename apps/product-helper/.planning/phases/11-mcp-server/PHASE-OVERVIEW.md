# Phase 11: MCP Server [P0 CRITICAL]

**Goal:** Export project as MCP server for Claude Code/Cursor/VS Code integration
**Priority:** P0 - Competitive differentiator (Epic.dev parity + our unique tools)
**Dependencies:** Phase 9 ✅, Phase 10 ✅

---

## Wave Structure

```
Wave 1: Foundation (can run in parallel)
├── 11-01: MCP Server Framework     → backend-architect
├── 11-02: API Key Management       → devops-engineer
└── 11-03: Core MCP Tools (7)       → backend-architect

Wave 2: Generator Tools (parallel after Wave 1)
├── 11-04: Generator-Based Tools (4) → backend-architect
└── 11-05: Unique Tools (5)          → langchain-engineer

Wave 3: UI & Export (after Wave 2)
└── 11-06: Connections UI & Exports  → ui-ux-engineer
```

---

## Tool Inventory (17 total)

### Match Epic.dev (12 tools)

| Tool | Category | Wave |
|------|----------|------|
| `get_prd` | Core | 1 |
| `get_database_schema` | Core | 1 |
| `get_tech_stack` | Core | 1 |
| `get_user_stories` | Core | 1 |
| `get_coding_context` | Core | 1 |
| `get_project_architecture` | Core | 1 |
| `get_diagrams` | Core | 1 |
| `get_api_specs` | Generator | 2 |
| `get_infrastructure` | Generator | 2 |
| `get_coding_guidelines` | Generator | 2 |
| `update_user_story_status` | Generator | 2 |
| `ask_project_question` | Unique | 2 |

### Our Unique Advantage (5 tools)

| Tool | Description | Wave |
|------|-------------|------|
| `get_validation_status` | PRD-SPEC score + checks | 2 |
| `get_gsd_phases` | GSD workflow phases | 2 |
| `get_cleo_tasks` | CLEO task list (stable IDs) | 2 |
| `invoke_agent` | Trigger domain agent (17 specialists) | 2 |
| `search_project_context` | Semantic search across project | 2 |

---

## Architecture

```
app/api/mcp/
├── [projectId]/
│   └── route.ts              # Main MCP endpoint (JSON-RPC)
├── tools/                    # Tool implementations
│   ├── core/                 # Wave 1 tools
│   │   ├── get-prd.ts
│   │   ├── get-database-schema.ts
│   │   ├── get-tech-stack.ts
│   │   ├── get-user-stories.ts
│   │   ├── get-coding-context.ts
│   │   ├── get-project-architecture.ts
│   │   └── get-diagrams.ts
│   ├── generators/           # Wave 2 generator tools
│   │   ├── get-api-specs.ts
│   │   ├── get-infrastructure.ts
│   │   ├── get-coding-guidelines.ts
│   │   └── update-story-status.ts
│   └── unique/               # Wave 2 our tools
│       ├── get-validation-status.ts
│       ├── get-gsd-phases.ts
│       ├── get-cleo-tasks.ts
│       ├── invoke-agent.ts
│       ├── ask-question.ts
│       └── search-context.ts
├── config/
│   └── route.ts              # Generate MCP config JSON
└── keys/
    └── route.ts              # API key management

lib/mcp/
├── server.ts                 # MCP protocol handler
├── tool-registry.ts          # Tool registration
├── auth.ts                   # API key validation
├── skill-generator.ts        # SKILL.md export
└── claude-md-generator.ts    # CLAUDE.md export
```

---

## Success Criteria

- [ ] MCP server responds to all 17 tools
- [ ] One-click setup works with Claude Code
- [ ] SKILL.md downloads with correct project tools
- [ ] API keys generate and authenticate correctly
- [ ] Response time < 500ms per tool
