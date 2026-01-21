# MCP Tools Usage Guide

**CRITICAL:** MCP tools are NOT preloaded. You MUST use MCPSearch to load them before invoking.

## The Golden Rule

```
NEVER invoke mcp__* tools directly without first loading them via MCPSearch.
```

Why? MCP tools are deferred to avoid bloating context. Calling them without loading will fail.

## Available MCP Servers

| Server | Prefix | Purpose | When to Use |
|--------|--------|---------|-------------|
| **Context7** | `mcp__plugin_context7_context7__` | Library documentation | Research library APIs, verify capabilities |
| **Supabase** | `mcp__plugin_supabase_supabase__` | Database operations | Schema, migrations, queries, edge functions |
| **Playwright** | `mcp__plugin_playwright_playwright__` | Browser automation | E2E testing, screenshots, web interactions |
| **Claude-in-Chrome** | `mcp__claude-in-chrome__` | Chrome automation | Browser tasks, form filling, page reading |
| **Memory** | `mcp__memory__` | Knowledge graph | Persistent entities, relations, observations |
| **Sequential Thinking** | `mcp__sequential-thinking__` | Structured reasoning | Complex multi-step analysis |

## Usage Pattern

### Step 1: Load the Tool

```
MCPSearch with query: "select:mcp__plugin_context7_context7__resolve-library-id"
```

Or search by keyword:
```
MCPSearch with query: "supabase migration"
```

### Step 2: Invoke the Tool

Only AFTER MCPSearch returns the tool, you can invoke it.

## Context7 (Documentation)

**Use for:** Library APIs, framework features, current version capabilities.

### Loading Context7

```
# Load resolve-library-id
MCPSearch: "select:mcp__plugin_context7_context7__resolve-library-id"

# Load query-docs
MCPSearch: "select:mcp__plugin_context7_context7__query-docs"
```

### Usage Flow

1. **Resolve library ID first:**
   ```
   mcp__plugin_context7_context7__resolve-library-id
   libraryName: "react"
   ```

2. **Query documentation:**
   ```
   mcp__plugin_context7_context7__query-docs
   libraryId: [resolved ID from step 1]
   query: "useEffect cleanup"
   ```

### When to Use Context7

| Scenario | Use Context7 |
|----------|--------------|
| Verify library capability | YES |
| Check current API syntax | YES |
| Find configuration options | YES |
| General ecosystem survey | NO (use WebSearch) |
| Compare multiple libraries | NO (use WebSearch first) |

## Supabase (Database)

**Use for:** PostgreSQL schemas, migrations, queries, edge functions.

### Key Tools

| Tool | Purpose |
|------|---------|
| `search_docs` | Search Supabase documentation |
| `list_tables` | List database tables |
| `list_migrations` | List existing migrations |
| `apply_migration` | Apply a new migration |
| `execute_sql` | Run SQL queries |
| `list_edge_functions` | List edge functions |
| `deploy_edge_function` | Deploy edge function |

### Loading Supabase

```
# Load specific tool
MCPSearch: "select:mcp__plugin_supabase_supabase__list_tables"

# Or search by need
MCPSearch: "supabase execute sql"
```

### When to Use Supabase MCP

| Scenario | Use Supabase MCP |
|----------|------------------|
| Create/apply migrations | YES |
| Query production data | YES (with caution) |
| Deploy edge functions | YES |
| Development schema changes | Consider using Drizzle locally |

## Playwright (Browser Automation)

**Use for:** E2E testing, visual verification, web automation.

### Key Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to URL |
| `browser_click` | Click element |
| `browser_fill_form` | Fill form fields |
| `browser_take_screenshot` | Capture screenshot |
| `browser_snapshot` | Get DOM snapshot |

### Loading Playwright

```
MCPSearch: "select:mcp__plugin_playwright_playwright__browser_navigate"
```

## Memory (Knowledge Graph)

**Use for:** Persistent storage of entities, relations, and observations across sessions.

### Key Tools

| Tool | Purpose |
|------|---------|
| `create_entities` | Store new entities |
| `create_relations` | Link entities |
| `add_observations` | Add facts to entities |
| `search_nodes` | Find entities |
| `read_graph` | Get full graph |

### Loading Memory

```
MCPSearch: "select:mcp__memory__create_entities"
```

## Agent-Specific MCP Usage

### Research Agents (gsd-phase-researcher, gsd-project-researcher)

**Primary MCP:** Context7

**Pattern:**
1. MCPSearch to load resolve-library-id
2. Resolve libraries mentioned in research scope
3. MCPSearch to load query-docs
4. Query for specific information
5. Trust Context7 over training data

### Planner Agent (gsd-planner)

**Primary MCP:** Context7 (for Level 1 quick verification)

**Pattern:**
1. Only load when discovery_level >= 1
2. Use for confirming syntax/version of known libraries
3. Don't load for pure planning work

### Executor Agent (gsd-executor)

**Primary MCP:** Usually none (execution is local)

**Exception:** If plan requires:
- Supabase migrations → Load Supabase MCP
- E2E verification → Load Playwright MCP

### Debugger Agent (gsd-debugger)

**Primary MCP:** Context7 (for library behavior verification)

**Pattern:**
1. When library behavior doesn't match expectations
2. MCPSearch to load Context7
3. Query official docs to verify correct usage

## Error Handling

### "Tool not found" Error

```
ERROR: mcp__plugin_context7_context7__query-docs not available
```

**Fix:** You forgot to load it first!
```
MCPSearch: "select:mcp__plugin_context7_context7__query-docs"
```

### "Server not connected" Error

The MCP server may not be running. Check:
1. Plugin is enabled in settings
2. Server process is running
3. Authentication is valid (for Supabase)

## Best Practices

1. **Load on demand** - Only load tools when you actually need them
2. **Load once per session** - Don't re-load the same tool repeatedly
3. **Use select: for known tools** - Faster than keyword search
4. **Use keyword search for discovery** - When unsure which tool exists
5. **Batch load related tools** - If you need resolve-library-id AND query-docs, load both

## Quick Reference

```markdown
# Context7 - Library Docs
MCPSearch: "select:mcp__plugin_context7_context7__resolve-library-id"
MCPSearch: "select:mcp__plugin_context7_context7__query-docs"

# Supabase - Database
MCPSearch: "select:mcp__plugin_supabase_supabase__list_tables"
MCPSearch: "select:mcp__plugin_supabase_supabase__execute_sql"
MCPSearch: "select:mcp__plugin_supabase_supabase__apply_migration"

# Playwright - Browser
MCPSearch: "select:mcp__plugin_playwright_playwright__browser_navigate"
MCPSearch: "select:mcp__plugin_playwright_playwright__browser_take_screenshot"

# Memory - Knowledge Graph
MCPSearch: "select:mcp__memory__search_nodes"
MCPSearch: "select:mcp__memory__create_entities"
```
