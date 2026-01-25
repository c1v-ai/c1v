One-Click Setup
Run this command in your terminal to instantly connect Claude Code to this project:

claude mcp add epic-glp_helper https://mcp.epic.dev/mcp?apiKey=sk-epic-claude-code-vxsexf8rksgm9tkh99q6e --transport http

Copy Command to Connect
Available MCP Tools:

get_project_architecture - Full project context (use first!)
get_prd - Product requirements & user stories
get_tech_stack - Technology decisions
get_infrastructure - Deployment & infrastructure
get_database_schema - Database models
get_api_specs - API documentation
search_project_context - Search all docs
Configuration

{
  "mcpServers": {
    "epic-glp_helper": {
      "transport": "http",
      "url": "https://mcp.epic.dev/mcp?apiKey=sk-epic-claude-code-vxsexf8rksgm9tkh99q6e",
      "headers": {
        "x-api-key": "sk-epic-claude-code-vxsexf8rksgm9tkh99q6e"
      }
    }
  }
}
Add this configuration to your MCP settings file.

Note:

This API key is scoped to this project only. It provides access to this project's architecture and documentation.

Important
Download Claude Code Skill
Teach your AI agent to use EPIC's 17 MCP tools

Recommended
Agent Skill
A comprehensive skill that teaches Claude Code when and how to use all 17 EPIC MCP tools.

How to use:

Download the SKILL.md file
Create a folder named "epic-architecture" in your project
Place SKILL.md inside the folder
Claude Code will discover and load this skill
Download SKILL.md
Alternative: Quick Rules File
Quick setup configuration file for Claude Code.

•Download the CLAUDE.md file

•Place it in your project root

•Claude Code reads this file on startup

Download CLAUDE.md
Skills teach your AI agent to always check EPIC's architecture before writing code

Need a new key?

Revoking will disconnect current sessions. You can then generate a new key.