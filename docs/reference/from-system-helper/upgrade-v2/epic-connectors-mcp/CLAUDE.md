# GLP Helper Development Guide

> This file configures Claude Code to work with EPIC architecture documentation.
> **MCP Server**: `epic-mcp_GLP_Helper`

## Project Context

**GLP Helper**: An AI meal and workout planner

**Tech Stack**: React Native, TypeScript, NestJS, PostgreSQL, Tailwind CSS (for Web) / NativeWind (for React Native), OpenAI API / Mistral API (or similar LLM provider), Auth0

---

## Why EPIC?

EPIC is the **single source of truth** for this project's architecture. Using these tools prevents common AI coding mistakes:

| Without EPIC | With EPIC |
|--------------|-----------|
| Guessing tech stack → Wrong libraries | `get_tech_stack` → Approved technologies |
| Inventing data models → Schema mismatches | `get_database_schema` → Exact fields, types |
| Creating random APIs → Inconsistent endpoints | `get_api_specs` → Established patterns |
| Missing requirements → Wrong behavior | `get_prd` → User personas, success metrics |
| Violating conventions → Technical debt | `get_coding_guidelines` → Team standards |

**Always check EPIC first.** The few seconds spent calling these tools saves hours of rework.

---

## Required: Use EPIC MCP Tools (17 Available)

This project's architecture is documented in EPIC. You MUST use the `epic-mcp_GLP_Helper` MCP server tools to stay aligned with the project architecture.

### Before ANY Coding Task

**Always start by calling these tools:**

1. **`get_coding_context`** - Returns:
   - MUST DO rules (follow these strictly)
   - MUST NOT DO rules (never violate these)
   - Current tech stack constraints
   - Active work items

2. **`get_project_architecture`** - Returns combined view of:
   - PRD (requirements and scope)
   - Tech Stack (technology decisions)
   - Database Schema (app_users, meals, workouts, plans, preferences, ingredients, exercises, meal_categories, and 10 more)
   - API Specifications (REST)
   - Infrastructure (deployment config)

### Tool Usage by Task Type

| Task Type | Required Tools |
|-----------|----------------|
| Any coding task | `get_coding_context` (always first) |
| Data/model work | `get_database_schema` |
| API endpoints | `get_api_specs` |
| New feature | `get_user_stories` → `update_user_story_status` |
| When unsure | `ask_project_question` |
| General questions | `ask_project_question` |
| Finding information | `search_project_context` |

---

## Complete Tool Reference (17 Tools)

### Primary Context (Call First)
- `get_coding_context` - MUST/MUST NOT rules, tech stack, work items
- `get_project_architecture` - Full architecture context
- `get_project_info` - Basic project information
- `read_project` - Detailed project info with document structure

### Architecture Documents
- `get_prd` - Business requirements, user personas, scope
- `get_tech_stack` - Technology decisions and rationale
- `get_infrastructure` - Deployment, CI/CD, monitoring
- `get_database_schema` - Entity models and relationships
- `get_api_specs` - API endpoints and contracts
- `get_diagrams` - Visual architecture diagrams
- `get_coding_guidelines` - Actionable coding standards
- `read_document` - Read any document by ID

### User Stories & Features
- `get_user_stories` - Stories with acceptance criteria and status
- `get_features` - Feature groupings with progress
- `update_user_story_status` - Track work progress

### Search & Query
- `search_project_context` - Keyword search across documents
- `ask_project_question` - AI-powered Q&A

---

## Tech Stack Details

| Component | Technology |
|-----------|------------|
| **Language** | TypeScript |
| **Framework** | NestJS + React Native |
| **Database** | PostgreSQL with Prisma, Cache: Redis |
| **API Style** | REST |
| **Authentication** | Auth0 |

### Coding Conventions
- Use functional components with hooks
- Use Zustand for state management
- Use Tailwind CSS (for Web) / NativeWind (for React Native) for styling
- Use Prisma for database operations

---

## Workflow

### Starting Work on a Feature
```
1. get_coding_context
   → Read all MUST DO and MUST NOT DO rules

2. get_user_stories
   → Find the story matching your task
   → Read acceptance criteria carefully

3. update_user_story_status(storyId, "in-progress")
   → Mark that you're working on it
```

### During Implementation
```
- Before models: get_database_schema → Match existing patterns
- Before APIs: get_api_specs → Follow conventions
- When unsure: ask_project_question → Get context
```

### When Unsure
```
ask_project_question
→ Ask any question about the project
→ Get context-aware answers
```

### Completing Work
```
update_user_story_status(storyId, "done")
```

---

## Critical Rules

### ALWAYS
1. Call `get_coding_context` before writing code
2. Check `get_database_schema` before creating/modifying data models
3. Check `get_api_specs` before creating/modifying API endpoints
4. Read acceptance criteria from user stories before implementing
5. Update story status when starting and completing work
6. Use `ask_project_question` when unsure about anything

### NEVER
1. Write code without consulting EPIC context first
2. Create patterns that conflict with existing architecture
3. Use technologies not approved in the tech stack
4. Skip story status updates
5. Ignore warnings from architecture validation
6. Make assumptions without checking documentation
