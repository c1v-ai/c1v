# Agent Skill Matrix

Comprehensive mapping of GSD agents to skills, MCP tools, and Claude plugins for **enterprise-grade performance**.

## Quick Reference

| Agent | Primary Skills | MCP Tools | Claude Plugins |
|-------|----------------|-----------|----------------|
| gsd-project-researcher | All domain research | Context7 | - |
| gsd-phase-researcher | Domain-specific | Context7 | - |
| gsd-planner | Phase-relevant | Context7 (L1) | - |
| gsd-executor | All quality | Supabase (DB tasks) | - |
| gsd-debugger | code-quality, domain | Context7 | - |
| gsd-verifier | testing-strategies | - | - |
| gsd-codebase-mapper | code-quality | - | - |
| gsd-integration-checker | api-design | - | - |

## Available Skills

Located in `.claude/skills/`:

| Skill File | Purpose | Key Standards |
|------------|---------|---------------|
| `nextjs-best-practices.md` | Next.js 15 App Router | Server/Client components, data fetching |
| `langchain-patterns.md` | LangChain.js/LangGraph | State management, nodes, streaming |
| `testing-strategies.md` | Vitest/RTL testing | Unit tests, mocking, 70%+ coverage |
| `database-patterns.md` | Drizzle ORM/PostgreSQL | Schemas, migrations, transactions |
| `api-design.md` | Next.js API routes | Validation, error handling, auth |
| `security-patterns.md` | Enterprise security | Auth, XSS, CSRF, OWASP Top 10 |
| `code-quality.md` | Code maintainability | Naming, functions, types, readability |

Root level (applies to all apps):
| `react-best-practices.md` | React performance | Waterfalls, bundle size, re-renders |

## Available MCP Tools

**CRITICAL:** Use MCPSearch BEFORE invoking any MCP tool.

| MCP Server | Tool Prefix | Purpose |
|------------|-------------|---------|
| Context7 | `mcp__plugin_context7_context7__` | Library documentation |
| Supabase | `mcp__plugin_supabase_supabase__` | Database operations |
| Playwright | `mcp__plugin_playwright_playwright__` | Browser automation |
| Memory | `mcp__memory__` | Knowledge graph |

Reference: `.claude/get-shit-done/references/mcp-tools.md`

## Available Claude Plugins

Installed plugins for specialized tasks:

| Plugin | Command | Purpose |
|--------|---------|---------|
| feature-dev | `/feature-dev` | Guided feature development |
| security-guidance | `/security-guidance` | Security vulnerability analysis |
| code-simplifier | `/code-simplifier` | Code complexity analysis |
| agent-sdk-dev | `/agent-sdk-dev:new-sdk-app` | Create Agent SDK apps |
| atlassian | `/atlassian:*` | Jira/Confluence integration |
| serena | - | (To be documented) |

## Agent → Skill Mapping

### gsd-project-researcher

**Role:** Research domain ecosystem before roadmap creation

**Skills to Reference:**
- All skills for comprehensive ecosystem understanding
- Emphasis on identifying which skills apply to the project domain

**MCP Tools:**
- Context7 (library documentation)

**MCPSearch Pattern:**
```
MCPSearch: "select:mcp__plugin_context7_context7__resolve-library-id"
MCPSearch: "select:mcp__plugin_context7_context7__query-docs"
```

---

### gsd-phase-researcher

**Role:** Research how to implement a specific phase

**Skills to Reference:**
- Domain-specific skills based on phase type
- `security-patterns.md` for any auth/API work

**MCP Tools:**
- Context7 (verify library capabilities)

**Skill Selection by Phase:**
| Phase Type | Skills |
|------------|--------|
| UI/Frontend | nextjs-best-practices, react-best-practices |
| API/Backend | api-design, security-patterns |
| Database | database-patterns |
| LangGraph/AI | langchain-patterns |
| Testing | testing-strategies |

---

### gsd-planner

**Role:** Create executable phase plans with task breakdown

**Skills to Reference:**
- Include relevant skills in plan context section
- 1-2 skills max per plan (avoid context bloat)
- **ALWAYS** include `security-patterns.md` for API tasks

**MCP Tools:**
- Context7 (Level 1 quick verification only)

**Enterprise Quality Enforcement:**
```markdown
# In plan context:
@.claude/skills/api-design.md
@.claude/skills/security-patterns.md  # REQUIRED for API tasks
```

---

### gsd-executor

**Role:** Execute plans with atomic commits

**Skills to Reference:**
- All quality skills (applied during execution)
- `security-patterns.md` - Input validation, no injection
- `code-quality.md` - Naming, types, functions
- `react-best-practices.md` - Performance patterns

**MCP Tools:**
- Supabase (for database migration tasks)

**Enterprise Quality Checklist:**
- [ ] Input validation on all user data
- [ ] No `any` types
- [ ] Functions < 30 lines
- [ ] Proper error handling
- [ ] Rate limiting on public endpoints

---

### gsd-debugger

**Role:** Investigate bugs systematically

**Skills to Reference:**
- `code-quality.md` - Code structure issues
- `security-patterns.md` - Auth/security issues
- `api-design.md` - API route issues
- `database-patterns.md` - Database issues

**MCP Tools:**
- Context7 (verify library behavior)

**When to use Context7:**
- Library behavior doesn't match expectations
- Verifying correct API usage
- Checking for breaking changes

---

### gsd-verifier

**Role:** Verify phase goal achievement

**Skills to Reference:**
- `testing-strategies.md` - Testing patterns to verify
- `security-patterns.md` - Security checklist
- `code-quality.md` - Quality checklist

**Quality Checks:**
```bash
# Security: Missing validation
grep -rn "req\.(body|query|params)" | grep -v "safeParse"

# Quality: Any type usage
grep -rn ": any" --include="*.ts"

# Performance: Unnecessary client components
grep -l "'use client'" | xargs grep -L "useState\|useEffect"
```

---

### gsd-codebase-mapper

**Role:** Analyze codebase and write structured documents

**Skills to Reference:**
- `code-quality.md` - Benchmarks for quality analysis
- `security-patterns.md` - Security anti-patterns to flag
- `testing-strategies.md` - Testing patterns to document

**Focus Area → Skills:**
| Focus | Skills |
|-------|--------|
| tech | All (for stack recommendations) |
| arch | api-design, database-patterns |
| quality | code-quality, testing-strategies |
| concerns | security-patterns, code-quality |

---

## Skill Selection by Task Type

| Task Keywords | Include These Skills |
|---------------|---------------------|
| UI, frontend, components | nextjs-best-practices, react-best-practices |
| API, backend, endpoints | api-design, security-patterns |
| database, schema, models | database-patterns |
| testing, tests | testing-strategies |
| LangGraph, AI, agents | langchain-patterns |
| auth, security, validation | security-patterns |
| refactor, cleanup | code-quality |

## Enterprise Quality Standards

All agents should enforce these standards:

### Security (BLOCKER)
- [ ] Input validation (Zod schemas)
- [ ] No SQL injection (use ORM)
- [ ] Authentication on protected routes
- [ ] Authorization for resources
- [ ] Secrets not hardcoded
- [ ] Rate limiting on public endpoints

### Code Quality (WARNING)
- [ ] No `any` types
- [ ] Functions < 30 lines
- [ ] Descriptive names
- [ ] Early returns (no deep nesting)
- [ ] Proper error handling

### Performance (INFO)
- [ ] Server components where possible
- [ ] No async waterfalls
- [ ] Dynamic imports for heavy deps
- [ ] Memoization for expensive ops

## Plugin Usage Guidelines

### When to Suggest Plugins

| Situation | Plugin |
|-----------|--------|
| User asks about security review | Suggest `/security-guidance` |
| Complex feature development | Suggest `/feature-dev` |
| Code feels complex/messy | Suggest `/code-simplifier` |
| Creating Agent SDK app | Use `/agent-sdk-dev:new-sdk-app` |
| Jira/Confluence tasks | Use `/atlassian:*` commands |

### Plugin Invocation

Plugins are invoked via the Skill tool:
```
Skill tool with skill: "feature-dev"
Skill tool with skill: "security-guidance"
Skill tool with skill: "code-simplifier"
```

## MCP Tool Loading Pattern

**Always load MCP tools via MCPSearch before invoking:**

```
# Step 1: Load the tool
MCPSearch with query: "select:mcp__plugin_context7_context7__resolve-library-id"

# Step 2: Now you can invoke it
mcp__plugin_context7_context7__resolve-library-id with libraryName: "react"
```

**Never invoke MCP tools directly without loading first.**
