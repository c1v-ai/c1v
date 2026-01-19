# Agent Routing for C1V Platform

**Purpose:** Route plan execution to specialized C1V platform agents instead of generic GSD executors.

**Why:** Specialized agents have domain expertise, know the C1V tech stack, and produce higher quality work than generic agents.

---

## Routing Priority

1. **Explicit override** — Plan frontmatter specifies `agent: <agent-type>`
2. **Subsystem match** — Match `subsystem:` field to agent
3. **Tag match** — Match `tags:` field to agent (first match wins)
4. **Fallback** — Use `gsd-executor` if no match

---

## Subsystem → Agent Mapping

| Subsystem | Agent | Rationale |
|-----------|-------|-----------|
| `testing` | `qa-engineer` | Test strategy, Jest, RTL, Playwright, coverage |
| `security` | `devops-engineer` | Auth, middleware, SSL, secrets, OWASP |
| `auth` | `devops-engineer` | Clerk, session management, RBAC |
| `api` | `backend-architect` | API routes, server actions, error handling |
| `database` | `database-engineer` | Drizzle ORM, migrations, queries, indexes |
| `ui` | `ui-ux-engineer` | React components, shadcn/ui, Tailwind |
| `accessibility` | `ui-ux-engineer` | WCAG, ARIA, keyboard navigation |
| `mobile` | `ui-ux-engineer` | Responsive design, mobile-first |
| `chat` | `chat-engineer` | Chat UI, streaming, Vercel AI SDK |
| `langchain` | `langchain-engineer` | LangGraph, agents, RAG, tools |
| `llm` | `llm-workflow-engineer` | Prompts, token optimization, model selection |
| `vector` | `vector-store-engineer` | pgvector, embeddings, semantic search |
| `diagrams` | `data-viz-engineer` | Mermaid, D3, visualization |
| `validation` | `sr-cornell-validator` | SR-CORNELL gates, validation scoring |
| `cache` | `cache-engineer` | Redis, Upstash, LLM caching |
| `docs` | `documentation-engineer` | User guides, API docs, READMEs |
| `monitoring` | `observability-engineer` | Logging, Sentry, metrics |
| `ci-cd` | `devops-engineer` | GitHub Actions, Vercel, deployment |
| `performance` | `backend-architect` | Optimization, profiling, caching |

---

## Tag → Agent Mapping

When `subsystem` doesn't match, check `tags` array (first match wins):

| Tag Contains | Agent |
|--------------|-------|
| `jest`, `vitest`, `test`, `coverage` | `qa-engineer` |
| `playwright`, `e2e` | `qa-engineer` |
| `security`, `auth`, `ssl`, `secrets` | `devops-engineer` |
| `clerk`, `session`, `rbac` | `devops-engineer` |
| `api`, `route`, `endpoint` | `backend-architect` |
| `drizzle`, `postgres`, `migration`, `schema` | `database-engineer` |
| `react`, `component`, `ui`, `shadcn` | `ui-ux-engineer` |
| `tailwind`, `css`, `styling` | `ui-ux-engineer` |
| `accessibility`, `a11y`, `aria`, `wcag` | `ui-ux-engineer` |
| `mobile`, `responsive` | `ui-ux-engineer` |
| `chat`, `streaming`, `vercel-ai` | `chat-engineer` |
| `langchain`, `langgraph`, `agent` | `langchain-engineer` |
| `prompt`, `llm`, `token` | `llm-workflow-engineer` |
| `vector`, `embedding`, `rag`, `pgvector` | `vector-store-engineer` |
| `mermaid`, `diagram`, `chart`, `d3` | `data-viz-engineer` |
| `sr-cornell`, `validation`, `gates` | `sr-cornell-validator` |
| `redis`, `cache`, `upstash` | `cache-engineer` |
| `docs`, `documentation`, `readme` | `documentation-engineer` |
| `sentry`, `logging`, `metrics` | `observability-engineer` |
| `github-actions`, `ci`, `deploy` | `devops-engineer` |

---

## Explicit Agent Override

Plans can specify exact agent in frontmatter:

```yaml
---
phase: 02-security
plan: 01
agent: devops-engineer  # Explicit override - use this agent
subsystem: security
tags: [auth, ssl, secrets]
---
```

When `agent:` is present, use it directly without routing logic.

---

## Multi-Domain Plans

Some plans span multiple domains. Routing priority:

1. **Security always wins** — If tags include security/auth, use `devops-engineer`
2. **Explicit override** — Use `agent:` if specified
3. **Primary subsystem** — Use `subsystem:` field
4. **First matching tag** — Scan tags in order

For complex multi-domain work, consider splitting into multiple plans with clear domain boundaries.

---

## Fallback Chain

If no routing match found:

1. Check if plan involves code changes → `gsd-executor`
2. Check if plan is research/exploration → `Explore` agent
3. Default → `gsd-executor`

---

## Agent Capabilities Quick Reference

| Agent | Best For | Tech Stack |
|-------|----------|------------|
| `qa-engineer` | Tests, coverage, a11y audits | Jest, Vitest, RTL, Playwright, axe-core |
| `devops-engineer` | Auth, security, CI/CD | Clerk, GitHub Actions, Vercel |
| `backend-architect` | API design, server actions | Next.js API routes, error handling |
| `database-engineer` | Schema, migrations, queries | Drizzle ORM, PostgreSQL |
| `ui-ux-engineer` | Components, accessibility | React, shadcn/ui, Tailwind, WCAG |
| `chat-engineer` | Chat interfaces, streaming | Vercel AI SDK, useChat |
| `langchain-engineer` | AI workflows, agents | LangChain.js, LangGraph |
| `llm-workflow-engineer` | Prompts, token optimization | OpenAI, prompt engineering |
| `vector-store-engineer` | Embeddings, semantic search | pgvector, Supabase |
| `data-viz-engineer` | Diagrams, charts | Mermaid, D3.js |
| `sr-cornell-validator` | PRD validation | SR-CORNELL gates |
| `cache-engineer` | Caching strategies | Redis, Upstash |
| `documentation-engineer` | Docs, guides | MDX, OpenAPI |
| `observability-engineer` | Monitoring, logging | Sentry, Pino |

---

## Usage in execute-phase.md

```javascript
// Pseudocode for agent selection
function selectAgent(plan) {
  // 1. Explicit override
  if (plan.frontmatter.agent) {
    return plan.frontmatter.agent;
  }

  // 2. Subsystem match
  const subsystemAgent = SUBSYSTEM_MAP[plan.frontmatter.subsystem];
  if (subsystemAgent) {
    return subsystemAgent;
  }

  // 3. Tag match (first wins)
  for (const tag of plan.frontmatter.tags || []) {
    for (const [pattern, agent] of TAG_PATTERNS) {
      if (tag.includes(pattern)) {
        return agent;
      }
    }
  }

  // 4. Fallback
  return 'gsd-executor';
}
```

---

## Adding New Agents

When adding a new specialized agent:

1. Add to subsystem mapping table
2. Add relevant tags to tag mapping table
3. Add to capabilities reference
4. Document in agent's `.claude/agents/<agent>.md` file
