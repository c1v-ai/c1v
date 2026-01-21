# Skills Library

This directory contains skill files that provide domain-specific best practices and patterns for the product-helper codebase. These skills ensure **enterprise-grade performance** with highest quality, scalable, reliable, and understandable code.

## Available Skills

| Skill | Description | Key Topics |
|-------|-------------|------------|
| [nextjs-best-practices.md](./nextjs-best-practices.md) | Next.js 15 App Router patterns | Server/Client Components, Data Fetching, File Organization |
| [langchain-patterns.md](./langchain-patterns.md) | LangChain.js and LangGraph patterns | State Management, Nodes, Streaming, Testing |
| [testing-strategies.md](./testing-strategies.md) | Testing with Vitest/Jest and RTL | Unit Tests, Component Tests, Mocking, Coverage |
| [database-patterns.md](./database-patterns.md) | Drizzle ORM with PostgreSQL | Schemas, Queries, Migrations, Transactions |
| [api-design.md](./api-design.md) | Next.js API route patterns | Validation, Error Handling, Auth, Rate Limiting |
| [security-patterns.md](./security-patterns.md) | Enterprise security patterns | Auth, XSS, CSRF, Injection, OWASP Top 10 |
| [code-quality.md](./code-quality.md) | Code quality & simplification | Naming, Functions, Types, Maintainability |

## Related Skills (Root Level)

The monorepo root also contains skills that apply across all apps:

| Skill | Location | Description |
|-------|----------|-------------|
| react-best-practices.md | `/.claude/skills/` | React performance patterns (from Vercel Labs) |

## Plugin & Skill Mapping

Use the appropriate Claude plugins/skills based on task type:

| Task Domain | Local Skills | Claude Plugins |
|-------------|--------------|----------------|
| **Feature Development** | nextjs-best-practices, api-design | `/feature-dev` |
| **Security Review** | security-patterns, api-design | `/security-guidance` |
| **Code Simplification** | code-quality | `/code-simplifier` |
| **React Performance** | react-best-practices (root) | - |
| **LangGraph/AI** | langchain-patterns | - |
| **Testing** | testing-strategies | - |
| **Database** | database-patterns | Supabase MCP |
| **Agent Development** | - | `/agent-sdk-dev:new-sdk-app` |
| **Jira/Confluence** | - | `/atlassian:*` skills |

## MCP Tools Available

Agents should use MCPSearch before invoking MCP tools. See `.claude/get-shit-done/references/mcp-tools.md` for details.

| MCP Server | Purpose | When to Use |
|------------|---------|-------------|
| **Context7** | Library documentation | Verify library APIs, get current syntax |
| **Supabase** | Database operations | Migrations, queries, edge functions |
| **Playwright** | Browser automation | E2E testing, visual verification |
| **Memory** | Knowledge graph | Persistent entities across sessions |

## How to Use Skills

### For Planning Agents

Planning agents (like `gsd-planner`) should reference relevant skills when creating phase plans:

```markdown
<context>
@.claude/skills/nextjs-best-practices.md
@.claude/skills/testing-strategies.md
@.claude/skills/security-patterns.md
</context>
```

### For Developers

When working on a feature, reference the appropriate skill file to follow established patterns:

1. **Building UI components** → `nextjs-best-practices.md` + `react-best-practices.md` (root)
2. **Implementing LangGraph workflows** → `langchain-patterns.md`
3. **Writing tests** → `testing-strategies.md`
4. **Database operations** → `database-patterns.md`
5. **API routes** → `api-design.md`
6. **Security hardening** → `security-patterns.md`
7. **Code review/refactoring** → `code-quality.md`

### For Claude Plugins

Invoke plugins for specialized analysis:

```
/feature-dev          - Guided feature development with architecture focus
/security-guidance    - Security vulnerability analysis
/code-simplifier      - Code complexity analysis and simplification
/agent-sdk-dev        - Create Agent SDK applications
/atlassian:*          - Jira/Confluence integrations
```

## Agent → Skill Matrix

Which skills each GSD agent should reference:

| Agent | Primary Skills | MCP Tools | Plugins |
|-------|----------------|-----------|---------|
| **gsd-phase-researcher** | Domain-specific research | Context7 | - |
| **gsd-project-researcher** | All (ecosystem survey) | Context7 | - |
| **gsd-planner** | Relevant to phase type | Context7 (L1 verify) | - |
| **gsd-executor** | Relevant to tasks | Supabase (if DB tasks) | - |
| **gsd-debugger** | code-quality, relevant domain | Context7 (verify behavior) | - |
| **gsd-verifier** | testing-strategies | - | - |
| **gsd-codebase-mapper** | code-quality, architecture | - | - |

## Skill Selection by Phase Type

| Phase Keywords | Skills to Include |
|----------------|-------------------|
| UI, frontend, components | nextjs-best-practices, react-best-practices |
| API, backend, endpoints | api-design, security-patterns |
| database, schema, models | database-patterns |
| testing, tests | testing-strategies |
| LangGraph, AI, agents | langchain-patterns |
| auth, security | security-patterns, api-design |
| refactor, cleanup | code-quality |

## Skill File Structure

Each skill file follows this structure:

```markdown
# Skill Name

Brief description of the skill's purpose.

## Section 1: [Topic]
### Pattern/Rule Name
**Bad:** (anti-pattern example)
**Good:** (recommended pattern)

## Section 2: [Topic]
...

## References
- Links to relevant code in the codebase
- External documentation
```

## Enterprise Quality Standards

All code should meet these standards (enforced through skills):

### Security (security-patterns.md)
- [ ] Input validation on all user data
- [ ] No SQL injection vulnerabilities
- [ ] XSS prevention with proper escaping
- [ ] Authentication on protected routes
- [ ] Authorization checks for resources
- [ ] Secrets not hardcoded
- [ ] Security headers configured

### Code Quality (code-quality.md)
- [ ] Descriptive variable/function names
- [ ] Functions < 30 lines
- [ ] No deeply nested conditionals
- [ ] Strict TypeScript (no `any`)
- [ ] Proper error handling
- [ ] Self-documenting code

### Performance (react-best-practices.md)
- [ ] No async waterfalls
- [ ] Bundle size optimized
- [ ] Server components where possible
- [ ] Memoization for expensive ops
- [ ] Virtualization for long lists

### Testing (testing-strategies.md)
- [ ] Unit tests for business logic
- [ ] Component tests for UI
- [ ] 70%+ code coverage
- [ ] No flaky tests

## Contributing New Skills

When adding a new skill:

1. **Create the skill file** in this directory with a descriptive name
2. **Follow the structure** shown above
3. **Include code examples** from the actual codebase when possible
4. **Add tests** to validate the skill file exists and has expected sections
5. **Update this README** to include the new skill in the table
6. **Update agent files** to reference the skill when relevant
7. **Map to plugins** if a related Claude plugin exists

### Skill File Checklist

- [ ] Clear, actionable title
- [ ] Brief overview paragraph
- [ ] Organized sections by topic
- [ ] Good/Bad code examples
- [ ] References to actual codebase files
- [ ] No broken internal links
- [ ] Mapped to relevant plugins (if any)

## Testing Skills

Skills are validated by the test suite to ensure:

- All expected skill files exist
- Files are not empty
- Files contain expected sections
- No broken file references

Run tests with:

```bash
npm test -- skills
```

## Maintenance

Skills should be updated when:

- New patterns are established in the codebase
- Libraries are upgraded (e.g., Next.js 15 → 16)
- Anti-patterns are discovered
- Better approaches are found
- New Claude plugins are installed

Keep skills concise and focused on patterns that are actually used in the codebase.
