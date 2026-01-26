# Epic.dev vs Product Helper: Detailed Competitive Analysis

**Created:** 2026-01-25
**Purpose:** Guide v2.0 development priorities

---

## Side-by-Side Feature Comparison

### 1. Project Creation & Onboarding

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| Sign-up flow | Email/OAuth → User type → Role → Workspace | Email → Basic profile | Epic |
| User type selection | Individual / Company | None | Epic |
| Role selection | Dropdown (PM, Engineer, Designer, etc.) | None | Epic |
| Workspace concept | Yes, multi-project container | Team-based | Tie |
| Project type chips | SaaS, API, Event-driven, Admin tool, Marketplace | None | Epic |
| Project stage | Planning, Design, Development, Testing, Launch | None | Epic |
| Budget range | Optional dropdown | None | Epic |
| Initial context | Large textarea for description | Vision statement only | Epic |

**Action:** Add onboarding wizard + project type/stage selection

---

### 2. PRD Content Generation

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| Problem statement | ✅ Generated | ❌ None | Epic |
| Target users | ✅ With personas | ✅ Actors with roles | Tie |
| Goals & metrics | ✅ Generated | ❌ None (in vision) | Epic |
| Scope definition | ✅ In/out of scope | ✅ System boundaries | Tie |
| Use cases | ✅ With acceptance criteria | ⚠️ Basic (name, actor) | Epic |
| Non-functional reqs | ✅ Generated | ❌ None | Epic |
| Completeness score | ❓ Not visible | ✅ 73% real-time | **PH** |
| Validation gates | ❌ None visible | ✅ PRD-SPEC 10 gates | **PH** |

**Action:** Add problem statement, goals, NFRs extraction; enhance use cases

---

### 3. Technical Specifications

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| Tech stack | ✅ Full with rationale per choice | ❌ None | Epic |
| Database schema | ✅ Fields, types, relationships, constraints | ⚠️ Entity names only | Epic |
| API specifications | ✅ Endpoints, methods, bodies, errors | ❌ None | Epic |
| Infrastructure | ✅ Hosting, CI/CD, monitoring | ❌ None | Epic |
| Coding guidelines | ✅ Naming, patterns, forbidden | ❌ None | Epic |

**Action:** Create all 5 generators (Phase 10)

---

### 4. Diagrams

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| System architecture | ✅ Full service diagram | ❌ None | Epic |
| Context diagram | ✅ Via architecture | ✅ Mermaid | Tie |
| Use case diagram | ❓ Not seen | ✅ Mermaid | **PH** |
| Data model / ERD | ✅ With relationships | ✅ Mermaid class | Tie |
| Sequence diagrams | ❓ Not seen | ✅ Mermaid | **PH** |
| Zoom/pan controls | ✅ Yes | ✅ Yes | Tie |
| Export SVG/PNG | ✅ Yes | ✅ Yes | Tie |
| Copy Mermaid code | ✅ Yes | ✅ Yes | Tie |

**Action:** Add system architecture diagram generator

---

### 5. User Stories & Backlog

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| User stories | ✅ Full list | ❌ None | Epic |
| Status tracking | ✅ todo/in-progress/done/stuck | ❌ None | Epic |
| Priority | ✅ Yes | ❌ None | Epic |
| Effort estimates | ✅ Yes | ❌ None | Epic |
| Epic grouping | ✅ Collapsible sections | ❌ None | Epic |
| Story count | 50+ visible | N/A | Epic |

**Action:** Create user stories generator + backlog UI (Phase 9, 13)

---

### 6. MCP Integration [CRITICAL GAP]

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| MCP server | ✅ 17 tools | ❌ None | Epic |
| Claude Code support | ✅ One-click | ❌ None | Epic |
| Cursor support | ✅ Yes | ❌ None | Epic |
| VS Code support | ✅ Yes | ❌ None | Epic |
| Windsurf support | ✅ Yes | ❌ None | Epic |
| ChatGPT support | ✅ Yes | ❌ None | Epic |
| Lovable support | ✅ Yes | ❌ None | Epic |
| SKILL.md export | ✅ Downloadable | ❌ None | Epic |
| CLAUDE.md export | ✅ Downloadable | ❌ None | Epic |
| API key management | ✅ Per-project | ❌ None | Epic |
| Story status sync | ✅ update_user_story_status | ❌ None | Epic |

**Action:** Build full MCP server (Phase 11) - HIGHEST PRIORITY

---

### 7. UI/UX

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| Theme | Dark with purple accents | Light/dark (toggle) | Tie |
| Navigation | Sidebar + tree explorer | Tabs | Epic |
| Project explorer | ✅ Expandable tree | ❌ Flat tabs | Epic |
| Collapsible sections | ✅ Throughout | ⚠️ In chat sidebar | Epic |
| Mobile support | ❓ Not tested | ✅ PWA, bottom nav | **PH** |
| Real-time updates | ❓ Unknown | ✅ Sidebar during chat | **PH** |
| AI chat interface | ✅ Sidebar panel | ✅ Full page | Tie |

**Action:** Add project explorer tree (Phase 12)

---

### 8. Collaboration

| Aspect | Epic.dev | Product Helper | Winner |
|--------|----------|----------------|--------|
| Team members | ✅ With roles | ✅ Basic | Tie |
| Invite system | ✅ Yes | ✅ Basic | Tie |
| Collaborators list | ✅ Visible | ✅ In team page | Tie |
| Real-time collab | ❓ Unknown (Pro feature) | ❌ None | Unknown |

**Action:** Team features are sufficient for now

---

### 9. Pricing & Credits

| Aspect | Epic.dev | Product Helper |
|--------|----------|----------------|
| Free tier | 4,000 credits, 3 projects | TBD |
| Starter | $20/mo, 20k credits | TBD |
| Pro | $30/mo, 50k credits + rollover | TBD |
| Credit display | ✅ Header bar | ❌ None |

**Action:** Define pricing model, add credit display

---

## Epic.dev MCP Tools (17 Total)

Based on their SKILL.md and CLAUDE.md exports:

### Context Tools
1. `get_coding_context` - MUST/MUST NOT rules, tech stack constraints
2. `get_project_architecture` - Full architecture overview
3. `get_project_info` - Basic project information
4. `read_project` - Detailed project with document structure

### Architecture Tools
5. `get_prd` - Business requirements, user personas, scope
6. `get_tech_stack` - Technology decisions and rationale
7. `get_infrastructure` - Deployment, CI/CD, monitoring
8. `get_database_schema` - Entity models and relationships
9. `get_api_specs` - API endpoints and contracts
10. `get_diagrams` - Visual architecture diagrams
11. `get_coding_guidelines` - Actionable coding standards
12. `read_document` - Read any document by ID

### Task Management Tools
13. `get_user_stories` - Stories with acceptance criteria and status
14. `get_features` - Feature groupings with progress
15. `update_user_story_status` - Track work progress (todo/in-progress/done/stuck)

### Search Tools
16. `search_project_context` - Keyword search across documents
17. `ask_project_question` - AI-powered Q&A about project

---

## Our Proposed MCP Tools (22 Total)

### Match Epic (17 tools)
All 17 Epic tools replicated

### Our Unique Tools (+5)
18. `get_validation_status` - PRD-SPEC score and check results
19. `get_gsd_phases` - GSD workflow phases with status
20. `get_cleo_tasks` - CLEO task list with stable IDs
21. `invoke_agent` - Trigger one of 17 domain agents
22. `get_completeness_score` - Real-time intake completeness %

---

## Priority Action Items

### P0 - Critical (Week 3-4)
1. **MCP Server** - The killer feature. Without this, we lose.

### P1 - High (Week 1-3)
2. **Enhanced Data Models** - Use cases, schema, tech stack, user stories
3. **Technical Spec Generators** - API, infrastructure, guidelines

### P2 - Medium (Week 4-5)
4. **Project Explorer UI** - Tree navigation
5. **System Architecture Diagram** - Full service diagram

### P3 - Low (Week 5-7)
6. **Onboarding Flow** - Role selection, workspace
7. **Stories Board** - Kanban-style backlog
8. **Export Enhancements** - Multiple formats

---

## Differentiation Strategy

**Don't just copy Epic - beat them on quality:**

1. **PRD-SPEC Validation**
   - Epic has no visible validation
   - We validate before MCP export
   - "Validated PRD" badge = trust signal

2. **GSD Workflow Integration**
   - Epic exports static docs
   - We export living workflow
   - Phase progress syncs with Claude Code

3. **CLEO Task Tracking**
   - Epic has basic story status
   - We have stable IDs, audit trail
   - Full traceability

4. **17 Domain Agents**
   - Epic has generic AI
   - We have specialists (backend-architect, qa-engineer, etc.)
   - `invoke_agent` MCP tool = unique capability

5. **Conversational Intake**
   - Epic uses single prompt
   - We have adaptive question flow
   - Better requirement coverage

---

## Conclusion

Epic.dev is ahead on:
- Technical specification depth
- MCP integration
- Project navigation UI

Product Helper is ahead on:
- Validation and quality gates
- Real-time extraction feedback
- Mobile experience
- Workflow integration (GSD/CLEO)

**Strategy:** Match their depth, emphasize our quality. MCP is the bridge.
