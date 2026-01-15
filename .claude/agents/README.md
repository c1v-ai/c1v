# C1V Agent Registry

**17 Agents | 6 Teams | 1 Product**

This directory contains individual agent configuration files for the C1V product-helper multi-agent system.

---

## Quick Links

| Team | Agents | Lead |
|------|--------|------|
| [Platform Engineering](#platform-engineering-) | 3 | Backend Architect |
| [Frontend](#frontend-) | 3 | UI/UX Engineer |
| [AI/Agent Engineering](#aiagent-engineering-) | 3 | LangChain Engineer |
| [Data & Infrastructure](#data--infrastructure-) | 3 | Vector Store Engineer |
| [Product & Planning](#product--planning-) | 3 | Product Strategy |
| [Quality & Documentation](#quality--documentation-) | 2 | QA Engineer |

---

## Platform Engineering 🏗️

![Team](https://img.shields.io/badge/team-platform--engineering-3B82F6?style=flat-square)

| ID | Agent | File |
|----|-------|------|
| 1.1 | Backend Architect | [1.1-backend-architect.md](./1.1-backend-architect.md) |
| 1.2 | Database Engineer | [1.2-database-engineer.md](./1.2-database-engineer.md) |
| 1.3 | DevOps Engineer | [1.3-devops-engineer.md](./1.3-devops-engineer.md) |

---

## Frontend 🎨

![Team](https://img.shields.io/badge/team-frontend-8B5CF6?style=flat-square)

| ID | Agent | File |
|----|-------|------|
| 2.1 | UI/UX Engineer | [2.1-ui-ux-engineer.md](./2.1-ui-ux-engineer.md) |
| 2.2 | Chat Engineer | [2.2-chat-engineer.md](./2.2-chat-engineer.md) |
| 2.3 | Data Viz Engineer | [2.3-data-viz-engineer.md](./2.3-data-viz-engineer.md) |

---

## AI/Agent Engineering 🧠

![Team](https://img.shields.io/badge/team-ai--agents-10B981?style=flat-square)

| ID | Agent | File |
|----|-------|------|
| 3.1 | LangChain Engineer | [3.1-langchain-engineer.md](./3.1-langchain-engineer.md) |
| 3.2 | LLM Workflow Engineer | [3.2-llm-workflow-engineer.md](./3.2-llm-workflow-engineer.md) |
| 3.3 | SR-CORNELL Validator | [3.3-sr-cornell-validator.md](./3.3-sr-cornell-validator.md) |

---

## Data & Infrastructure 💾

![Team](https://img.shields.io/badge/team-data--infrastructure-F59E0B?style=flat-square)

| ID | Agent | File |
|----|-------|------|
| 4.1 | Vector Store Engineer | [4.1-vector-store-engineer.md](./4.1-vector-store-engineer.md) |
| 4.2 | Cache Engineer | [4.2-cache-engineer.md](./4.2-cache-engineer.md) |
| 4.3 | Observability Engineer | [4.3-observability-engineer.md](./4.3-observability-engineer.md) |

---

## Product & Planning 📋

![Team](https://img.shields.io/badge/team-product--planning-F43F5E?style=flat-square)

| ID | Agent | File |
|----|-------|------|
| 5.1 | Product Strategy | [5.1-product-strategy.md](./5.1-product-strategy.md) |
| 5.2 | Product Manager | [5.2-product-manager.md](./5.2-product-manager.md) |
| 5.3 | Technical Program Manager | [5.3-technical-program-manager.md](./5.3-technical-program-manager.md) |

---

## Quality & Documentation 🔍

![Team](https://img.shields.io/badge/team-quality--docs-06B6D4?style=flat-square)

| ID | Agent | File |
|----|-------|------|
| 6.1 | QA Engineer | [6.1-qa-engineer.md](./6.1-qa-engineer.md) |
| 6.2 | Documentation Engineer | [6.2-documentation-engineer.md](./6.2-documentation-engineer.md) |

---

## File Structure

```
.claude/agents/
├── README.md                           # This file
├── registry.json                       # Machine-readable agent registry
├── 1.1-backend-architect.md
├── 1.2-database-engineer.md
├── 1.3-devops-engineer.md
├── 2.1-ui-ux-engineer.md
├── 2.2-chat-engineer.md
├── 2.3-data-viz-engineer.md
├── 3.1-langchain-engineer.md
├── 3.2-llm-workflow-engineer.md
├── 3.3-sr-cornell-validator.md
├── 4.1-vector-store-engineer.md
├── 4.2-cache-engineer.md
├── 4.3-observability-engineer.md
├── 5.1-product-strategy.md
├── 5.2-product-manager.md
├── 5.3-technical-program-manager.md
├── 6.1-qa-engineer.md
└── 6.2-documentation-engineer.md
```

---

## Agent File Format

Each agent file contains:

```yaml
---
agent_id: "X.Y"
agent_name: agent-name
team_id: X
team_name: team-name
role: Agent Role
color: "#HEXCODE"
icon: "emoji"
enabled: true

mcps:
  global: [...]
  team: [...]
  agent: [...]

plugins:
  global: [...]
  team: [...]
  agent: [...]
---

# Agent X.Y: Agent Name

## Primary Role
## Primary Responsibilities
## Tech Stack
## Key Files & Directories
## Code Conventions / Patterns
## Anti-Patterns to Avoid
## Testing Requirements
## Handoff Points
## Success Metrics
```

---

## Global Configuration

### Global MCPs (All Agents)
- `filesystem` - File operations
- `github` - Repository management
- `ralph-wiggum` - Autonomous loop execution
- `sequential-thinking` - Multi-step reasoning

### Global Plugins (All Agents)
- `git-commit-smart` - Intelligent commit messages
- `code-reviewer` - Automated code review
- `overnight-dev` - Async task execution

### Agent Skills
Skills are comprehensive knowledge files that agents can reference. Located in `.claude/skills/`.

| Skill | Teams | Source | Description |
|-------|-------|--------|-------------|
| [react-best-practices](../skills/react-best-practices.md) | Frontend (2) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 40+ React/Next.js performance rules |

**Install more skills:**
```bash
npx add-skill vercel-labs/agent-skills
```

---

## Color Reference

| Team | Hex | ANSI |
|------|-----|------|
| Platform Engineering | `#3B82F6` | `\033[38;2;59;130;246m` |
| Frontend | `#8B5CF6` | `\033[38;2;139;92;246m` |
| AI/Agent Engineering | `#10B981` | `\033[38;2;16;185;129m` |
| Data & Infrastructure | `#F59E0B` | `\033[38;2;245;158;11m` |
| Product & Planning | `#F43F5E` | `\033[38;2;244;63;94m` |
| Quality & Documentation | `#06B6D4` | `\033[38;2;6;182;212m` |

---

## Related Documentation

- [Team Index](../teams/index.md) - Team-level documentation
- [Master Instructions](../instructions.md) - Project-wide instructions

---

**Last Updated:** 2026-01-15
