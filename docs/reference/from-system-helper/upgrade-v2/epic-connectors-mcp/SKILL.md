---
name: epic-glp-helper
description: Provides architecture context for GLP Helper via MCP. Use when writing code, creating data models, building APIs, or choosing technologies. Enforces database schema, tech stack, and API specifications.
metadata:
  author: epic
  version: "1.0"
---

# GLP Helper Architecture

**MCP Server**: `epic-mcp_GLP_Helper`

## When to Use

- Writing code → `epic-mcp_GLP_Helper:get_coding_context`
- Data models/schemas → `epic-mcp_GLP_Helper:get_database_schema`
- API endpoints → `epic-mcp_GLP_Helper:get_api_specs`
- Choosing technologies → `epic-mcp_GLP_Helper:get_tech_stack`
- Implementing features → `epic-mcp_GLP_Helper:get_user_stories`

## How to Use

1. **Before coding**: Call `epic-mcp_GLP_Helper:get_coding_context` to get MUST DO / MUST NOT DO rules
2. **Check architecture**: Call relevant tools based on your task:
   - Data work → `epic-mcp_GLP_Helper:get_database_schema`
   - API work → `epic-mcp_GLP_Helper:get_api_specs`
   - Tech decisions → `epic-mcp_GLP_Helper:get_tech_stack`
3. **For features**: Call `epic-mcp_GLP_Helper:get_user_stories` to find acceptance criteria
4. **Track progress**: Call `epic-mcp_GLP_Helper:update_user_story_status` with "in-progress" or "done"
5. **When unsure**: Call `epic-mcp_GLP_Helper:ask_project_question` with your question

## Strict Enforcement

### Database Schema
Before ANY data model work:
1. Call `epic-mcp_GLP_Helper:get_database_schema`
2. Use ONLY defined entities, fields, and relationships
3. Match field names, types, and constraints exactly
4. Do NOT invent new fields or entities

### Tech Stack
Before using ANY library or framework:
1. Call `epic-mcp_GLP_Helper:get_tech_stack`
2. Use ONLY approved technologies
3. Do NOT use alternatives not in the approved stack

### API Specifications
Before ANY API work:
1. Call `epic-mcp_GLP_Helper:get_api_specs`
2. Follow existing endpoint patterns and naming
3. Use established authentication and error handling
4. Do NOT create conflicting endpoints

## Available Tools

### Context (Start Here)
- `epic-mcp_GLP_Helper:get_coding_context` - MUST/MUST NOT rules
- `epic-mcp_GLP_Helper:get_project_architecture` - Full architecture overview

### Architecture
- `epic-mcp_GLP_Helper:get_database_schema` - Entity definitions and relationships
- `epic-mcp_GLP_Helper:get_api_specs` - Endpoint patterns and contracts
- `epic-mcp_GLP_Helper:get_tech_stack` - Approved technologies
- `epic-mcp_GLP_Helper:get_prd` - Requirements and user personas
- `epic-mcp_GLP_Helper:get_infrastructure` - Deployment and CI/CD
- `epic-mcp_GLP_Helper:get_diagrams` - Architecture diagrams
- `epic-mcp_GLP_Helper:get_coding_guidelines` - Coding standards

### Tasks
- `epic-mcp_GLP_Helper:get_user_stories` - Stories with acceptance criteria
- `epic-mcp_GLP_Helper:get_features` - Feature groupings
- `epic-mcp_GLP_Helper:update_user_story_status` - Update status (todo/in-progress/done/stuck)

### Search
- `epic-mcp_GLP_Helper:search_project_context` - Search documents
- `epic-mcp_GLP_Helper:ask_project_question` - AI Q&A about project
- `epic-mcp_GLP_Helper:read_document` - Read document by ID
- `epic-mcp_GLP_Helper:get_project_info` - Project info
- `epic-mcp_GLP_Helper:read_project` - Full document list

## Rules

**Always:**
- Call `get_coding_context` before writing code
- Call `get_database_schema` before data model changes
- Call `get_api_specs` before API changes
- Call `get_tech_stack` before choosing technologies

**Never:**
- Write code without checking context first
- Create data models not in the schema
- Use unapproved technologies
- Create conflicting API patterns
