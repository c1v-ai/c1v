# Agent Teams Index

## Overview

C1V uses a multi-agent architecture with **6 specialized teams** and **17 agents** to deliver the product-helper application.

---

## Teams at a Glance

| # | Team | Color | Icon | Agents | Lead Agent | Team MCPs |
|---|------|-------|------|--------|------------|-----------|
| 1 | [Platform Engineering](./platform-engineering.md) | ![Blue](https://img.shields.io/badge/-3B82F6?style=flat-square) | 🏗️ | 3 | Backend Architect | postgres, docker, sentry |
| 2 | [Frontend](./frontend.md) | ![Purple](https://img.shields.io/badge/-8B5CF6?style=flat-square) | 🎨 | 3 | UI/UX Engineer | vercel, puppeteer, front-end-plugin |
| 3 | [AI/Agent Engineering](./ai-agents.md) | ![Emerald](https://img.shields.io/badge/-10B981?style=flat-square) | 🧠 | 3 | LangChain Engineer | langsmith, openai, context7 |
| 4 | [Data & Infrastructure](./data-infrastructure.md) | ![Amber](https://img.shields.io/badge/-F59E0B?style=flat-square) | 💾 | 3 | Vector Store Engineer | redis, postgres, prometheus |
| 5 | [Product & Planning](./product-planning.md) | ![Rose](https://img.shields.io/badge/-F43F5E?style=flat-square) | 📋 | 3 | Product Strategy | linear, notion, posthog |
| 6 | [Quality & Documentation](./quality-docs.md) | ![Cyan](https://img.shields.io/badge/-06B6D4?style=flat-square) | 🔍 | 2 | QA Engineer | puppeteer, playwright, nextra |

**Total: 17 Agents across 6 Teams**

---

## Global Configuration (All Teams)

### Global MCPs (Always Loaded)
- `filesystem` - File operations
- `github` - Repository management
- `ralph-wiggum` - Autonomous loop execution
- `sequential-thinking` - Multi-step reasoning

### Global Plugins (All Teams)
- `git-commit-smart` - Intelligent commit messages
- `code-reviewer` - Automated code review
- `overnight-dev` - Async task execution

---

## Color Reference

| Team | Color Name | Hex Code | Terminal ANSI |
|------|------------|----------|---------------|
| Platform Engineering | Blue | `#3B82F6` | `\033[38;2;59;130;246m` |
| Frontend | Purple | `#8B5CF6` | `\033[38;2;139;92;246m` |
| AI/Agent Engineering | Emerald | `#10B981` | `\033[38;2;16;185;129m` |
| Data & Infrastructure | Amber | `#F59E0B` | `\033[38;2;245;158;11m` |
| Product & Planning | Rose | `#F43F5E` | `\033[38;2;244;63;94m` |
| Quality & Documentation | Cyan | `#06B6D4` | `\033[38;2;6;182;212m` |

---

## All Agents

### Team 1: Platform Engineering 🏗️
| Agent ID | Name | Role | Plugins |
|----------|------|------|---------|
| 1.1 | backend-architect | Backend Architect | `docker-compose-generator` |
| 1.2 | database-engineer | Database Engineer | `database-migration-helper` |
| 1.3 | devops-engineer | Security & DevOps | `ansible-playbook-creator`, `security-pack` |

### Team 2: Frontend 🎨
| Agent ID | Name | Role | Plugins |
|----------|------|------|---------|
| 2.1 | ui-ux-engineer | UI/UX Engineer | `accessibility-auditor`, `component-documenter` |
| 2.2 | chat-engineer | Chat Engineer | `api-development-pack` |
| 2.3 | data-viz-engineer | Data Visualization | `mermaid-diagram-generator` |

### Team 3: AI/Agent Engineering 🧠
| Agent ID | Name | Role | Plugins |
|----------|------|------|---------|
| 3.1 | langchain-engineer | LangChain Engineer | `api-development-pack`, `structured-output-helper` |
| 3.2 | llm-workflow-engineer | LLM Workflow | `prompt-engineering-toolkit` |
| 3.3 | sr-cornell-validator | SR-CORNELL Validator | `test-generator`, `json-schema-validator` |

### Team 4: Data & Infrastructure 💾
| Agent ID | Name | Role | Plugins |
|----------|------|------|---------|
| 4.1 | vector-store-engineer | Vector Store Engineer | `database-query-optimizer` |
| 4.2 | cache-engineer | Cache Engineer | `redis-helper` |
| 4.3 | observability-engineer | Observability | `monitoring-setup`, `cost-attribution-system` |

### Team 5: Product & Planning 📋
| Agent ID | Name | Role | Plugins |
|----------|------|------|---------|
| 5.1 | product-strategy | Product Strategy | `competitive-analysis-helper` |
| 5.2 | product-manager | Product Manager | `user-story-generator`, `release-notes-generator`, `project-scaffolder` |
| 5.3 | technical-program-manager | **TPM** | `release-notes-generator`, `project-health-auditor` |

### Team 6: Quality & Documentation 🔍
| Agent ID | Name | Role | Plugins |
|----------|------|------|---------|
| 6.1 | qa-engineer | QA Engineer | `project-health-auditor`, `test-coverage-analyzer` |
| 6.2 | documentation-engineer | Documentation | `documentation-generator`, `api-docs-generator`, `prettier-markdown-hook` |

---

## Plugin Marketplace Setup

**Source Repository:** `jeremylongshore/claude-code-plugins-plus-skills` (v4.9.0)

### Add Marketplace Source
```json
// .claude/settings.json
{
  "extraKnownMarketplaces": {
    "claude-code-plugins": {
      "source": {
        "source": "github",
        "repo": "jeremylongshore/claude-code-plugins"
      }
    }
  }
}
```

### Install CLI
```bash
pnpm add -g @intentsolutionsio/ccpi
```

### Install All Plugins (Global)
```bash
ccpi install git-commit-smart code-reviewer overnight-dev
```

---

## Architecture Notes

### Tool Search Pattern
- **Always Loaded** (`defer_loading: false`): Core tools every agent needs
- **Deferred** (`defer_loading: true`): Team/agent-specific tools discovered on-demand

### Cross-Team Coordination
- **TPM Agent (5.3)** coordinates dependencies across all teams
- Weekly cross-team sync (async or live)
- Architecture Decision Records (ADRs) for cross-team decisions

---

**Last Updated:** 2026-01-15
