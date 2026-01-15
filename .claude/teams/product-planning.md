---
team_name: product-planning
team_id: 5
color: "#F43F5E"
color_name: rose
icon: "📋"
enabled: true

global_mcps:
  - filesystem
  - github
  - ralph-wiggum
  - sequential-thinking

team_mcps:
  - linear
  - notion
  - posthog

global_plugins:
  - git-commit-smart
  - code-reviewer
  - overnight-dev

team_plugins:
  - project-scaffolder
  - user-story-generator

agents:
  - id: "5.1"
    name: product-strategy
    role: Product Strategy Agent
    mcps: [mixpanel, google-analytics]
    plugins: [competitive-analysis-helper]
  - id: "5.2"
    name: product-manager
    role: Product Manager Agent
    mcps: [figma, loom]
    plugins: [user-story-generator, release-notes-generator, project-scaffolder]
  - id: "5.3"
    name: technical-program-manager
    role: Technical Program Manager (TPM)
    mcps: [github-projects, slack, confluence]
    plugins: [release-notes-generator, project-health-auditor]
---

# 📋 Product & Planning Team

![Team Color](https://img.shields.io/badge/team-product--planning-F43F5E?style=flat-square)

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Team Size:** 3 Agents

---

## MCP Configuration

### Global MCPs (Always Loaded)
- `filesystem` - File operations
- `github` - Repository management
- `ralph-wiggum` - Autonomous loop execution
- `sequential-thinking` - Multi-step reasoning

### Team MCPs (Deferred)
- `linear` - Issue/project tracking
- `notion` - Documentation, wikis
- `posthog` - Analytics

### Agent-Specific MCPs

| Agent | MCPs |
|-------|------|
| 5.1 Product Strategy | `mixpanel`, `google-analytics` |
| 5.2 Product Manager | `figma`, `loom` |
| 5.3 Technical Program Manager | `github-projects`, `slack`, `confluence` |

---

## Tool Discovery

This team uses Claude's Tool Search for efficient context management.

**How it works:**
1. Core tools (filesystem, github, ralph-wiggum) are always available
2. Specialized tools are loaded on-demand via search
3. Use natural language to find tools: "I need to track dependencies"

**Search tips:**
- Describe what you need: "roadmap", "user story", "release coordination"
- Tools are discovered from names AND descriptions

---

## Marketplace Plugins

**Source:** `jeremylongshore/claude-code-plugins-plus-skills` (v4.9.0)

### Global Plugins (All Teams)
- `git-commit-smart` - Intelligent commit messages
- `code-reviewer` - Automated code review
- `overnight-dev` - Async task execution

### Team Plugins
- `project-scaffolder` - Project structure generation
- `user-story-generator` - User stories from requirements

### Agent-Specific Plugins

| Agent | Plugins |
|-------|---------|
| 5.1 Product Strategy | `competitive-analysis-helper` |
| 5.2 Product Manager | `user-story-generator`, `release-notes-generator`, `project-scaffolder` |
| 5.3 Technical Program Manager | `release-notes-generator`, `project-health-auditor` |

**Installation:**
```bash
ccpi install project-scaffolder user-story-generator release-notes-generator competitive-analysis-helper project-health-auditor
```

---

## Mission

The Product & Planning team owns the product strategy, roadmap, and requirements for the C1V product-helper application. We ensure the product delivers value to users, aligns with business goals, and maintains a clear vision through execution.

**Core Responsibilities:**
- Product strategy and vision definition
- Feature prioritization and roadmap planning
- User research and feedback integration
- Requirements specification and PRD creation
- Competitive analysis and market research
- Success metrics and KPI tracking
- Stakeholder communication
- Go-to-market planning

---

## Agents

### Agent 5.1: Product Strategy Agent

**Primary Role:** Define product vision, strategy, and long-term roadmap

**Primary Responsibilities:**
- Define and maintain product vision
- Conduct competitive analysis
- Identify market opportunities
- Design go-to-market strategy
- Set product success metrics (OKRs/KPIs)
- Manage stakeholder relationships
- Create high-level product roadmap
- Align technical decisions with business goals

**Tech Stack:**
- **Planning:** Linear, GitHub Projects, Notion
- **Analytics:** PostHog, Mixpanel, Google Analytics
- **Research:** User interviews, surveys, competitive analysis
- **Documentation:** Markdown, Notion, Google Docs

**Required MCPs:**
- `filesystem` - Product documentation
- `github` - Roadmap issues, milestones
- `sequential-thinking` - Strategic planning
- `memory` - Product context and decisions

**Key Files & Directories:**
```
docs/
├── product/
│   ├── vision.md                    # Product vision statement
│   ├── strategy.md                  # Product strategy
│   ├── roadmap.md                   # Public roadmap
│   ├── okrs.md                      # Objectives & Key Results
│   └── competitive-analysis.md      # Market analysis
├── research/
│   ├── user-interviews/
│   │   ├── 2026-01-15-user-a.md
│   │   └── synthesis.md             # Research synthesis
│   └── surveys/
│       └── beta-feedback.md
└── go-to-market/
    ├── positioning.md               # Product positioning
    ├── pricing-strategy.md          # Pricing tiers
    └── launch-plan.md               # GTM execution plan
```

**Product Strategy Patterns:**

**1. Vision Document**
```markdown
# Product Vision: C1V Product-Helper

## Vision Statement
Empower product managers and founders to create engineering-quality PRDs in minutes through AI-powered conversational requirements gathering, eliminating ambiguity and accelerating time-to-build.

## Problem Statement
Product managers spend 10-20 hours manually creating PRDs, often resulting in:
- Missing requirements discovered during development
- Ambiguous specifications leading to rework
- Inconsistent quality across teams
- Delayed project kickoffs

## Solution
Product-helper uses AI agents to:
1. Guide PM through conversational requirements gathering
2. Automatically extract structured data (actors, use cases, entities)
3. Generate validated UML diagrams (context, use case, class, sequence)
4. Validate against SR-CORNELL 95% quality threshold
5. Export professional PRDs to Markdown, PDF, Notion

## Target Users
- **Primary:** Product Managers at startups/SMBs (10-100 employees)
- **Secondary:** Founders (technical and non-technical)
- **Tertiary:** Business Analysts, Solutions Architects

## Success Metrics
- Time to complete PRD: < 2 hours (vs 10-20 hours manual)
- PRD quality score: > 95% SR-CORNELL validation
- User satisfaction: NPS > 50
- PRD completion rate: > 80%
```

**2. OKR Framework**
```markdown
# Q1 2026 OKRs

## Objective 1: Launch Product-Helper MVP and Achieve Product-Market Fit

**Key Results:**
- KR1: Onboard 100 beta users by Feb 15
- KR2: Achieve 70% weekly active users (WAU/MAU ratio)
- KR3: 50+ PRDs created with >95% validation score
- KR4: NPS score > 40 from beta cohort

**Initiatives:**
- [ ] Launch private beta with 10 design partners (Week 1-2)
- [ ] Weekly user interviews (minimum 3 per week)
- [ ] Build feedback loop into product (in-app surveys)
- [ ] Iterate on conversational intake based on user feedback

## Objective 2: Validate Willingness to Pay

**Key Results:**
- KR1: 20% of beta users convert to paid ($29/mo plan)
- KR2: $2K MRR by end of Q1
- KR3: < 10% churn rate
- KR4: Average customer acquisition cost (CAC) < $100

**Initiatives:**
- [ ] Implement Stripe payment integration
- [ ] Design freemium model (3 PRDs free, unlimited paid)
- [ ] A/B test pricing ($19, $29, $39 per month)
- [ ] Create case studies from design partners

## Objective 3: Prove Technical Feasibility and Quality

**Key Results:**
- KR1: 95%+ SR-CORNELL validation pass rate
- KR2: AI conversation completion rate > 85%
- KR3: P95 response latency < 2 seconds
- KR4: Zero data loss incidents

**Initiatives:**
- [ ] Implement robust error handling and retries
- [ ] Add conversation save/resume functionality
- [ ] Build SR-CORNELL validator dashboard
- [ ] Set up monitoring and alerting
```

**3. Competitive Analysis**
```markdown
# Competitive Analysis

## Direct Competitors

### ProductPlan
- **Strengths:** Established brand, roadmap visualization, integrations
- **Weaknesses:** No AI, manual PRD creation, expensive ($49-99/user/mo)
- **Differentiation:** We offer AI-powered requirements gathering at 1/3 the cost

### Productboard
- **Strengths:** User feedback aggregation, prioritization framework
- **Weaknesses:** Focused on roadmapping, weak on requirements detail
- **Differentiation:** We focus on detailed, validated PRDs, not just planning

### Aha!
- **Strengths:** Comprehensive product management suite
- **Weaknesses:** Complexity, high price ($59-149/user/mo), steep learning curve
- **Differentiation:** Simple, focused tool for one job (PRD creation)

## Indirect Competitors

### Notion / Google Docs
- **Strengths:** Flexible, familiar, free/cheap
- **Weaknesses:** Blank page problem, no structure, no validation
- **Differentiation:** AI-guided process with quality guarantees

### ChatGPT / Claude
- **Strengths:** Powerful LLMs, free tier
- **Weaknesses:** No structure, no persistence, no validation, requires expertise
- **Differentiation:** Purpose-built for PRDs with SR-CORNELL validation

## Market Positioning

**We are:** The AI PRD assistant that guarantees engineering-quality requirements in < 2 hours

**We are not:** A roadmap tool, project management software, or documentation platform

**Target segment:** Startups and SMBs (10-100 employees) without dedicated technical writers or BAs
```

**4. Product Roadmap**
```markdown
# Product Roadmap (2026)

## Now (Q1 - Jan-Mar)
- ✅ MVP launch with conversational intake
- ✅ SR-CORNELL validation
- ✅ Context diagram and Use Case diagram generation
- ✅ Markdown export
- 🚧 Private beta (100 users)
- 🚧 Stripe payment integration

## Next (Q2 - Apr-Jun)
- Class diagram generation
- Sequence diagram generation
- Activity diagram generation
- PDF export
- Notion integration
- Team collaboration (comments, reviews)
- Template library (10 common PRD types)

## Later (Q3-Q4)
- Multi-language support (Spanish, Mandarin)
- API access for integrations
- Jira/Linear sync
- Custom validation rules (beyond SR-CORNELL)
- AI-powered requirement suggestions
- Version control and change tracking

## Future (2027+)
- Code generation from PRD
- Test case generation
- User story mapping
- Technical spec generation
- Integration with development tools
```

**Anti-Patterns to Avoid:**
❌ Building features without user validation
❌ Not defining success metrics upfront
❌ Ignoring competitive threats
❌ Roadmap based on opinions, not data
❌ No clear product vision or strategy
❌ Missing go-to-market plan
❌ Not tracking OKRs/KPIs consistently

**Documentation Duties:**
- Maintain product vision and strategy docs
- Update roadmap monthly based on data
- Document competitive analysis quarterly
- Create case studies from successful users
- Write launch announcements and release notes
- Maintain OKR tracker with progress updates

**Research & Analysis:**
- Conduct user interviews (minimum 3 per week)
- Run surveys after key milestones
- Analyze usage data weekly
- Monitor competitor updates monthly
- Track market trends and opportunities

**Handoff Points:**
- **Receives from:**
  - Users: Feedback, feature requests, pain points
  - All teams: Technical constraints, feasibility input
  - Quality/Docs: User documentation gaps
- **Delivers to:**
  - Product Manager: Prioritized feature list with rationale
  - All teams: Product requirements and context
  - Frontend: UX requirements and user flows
  - Quality/Docs: Release notes and announcements

---

### Agent 5.2: Product Manager Agent

**Primary Role:** Translate strategy into actionable requirements and manage execution

**Primary Responsibilities:**
- Write detailed product requirements (PRDs for the PRD tool!)
- Prioritize features and bugs
- Manage product backlog
- Coordinate cross-team execution
- Define acceptance criteria for features
- Conduct sprint planning and reviews
- Track feature delivery and velocity
- Make scope and timeline trade-off decisions

**Tech Stack:**
- **Project Management:** Linear, GitHub Issues, GitHub Projects
- **Collaboration:** Slack, Notion, Loom (async video)
- **Design:** Figma (wireframes, mockups)
- **Analytics:** PostHog, Vercel Analytics

**Required MCPs:**
- `filesystem` - Feature documentation
- `github` - Issue management, milestones
- `sequential-thinking` - Feature planning

**Key Files:**
```
docs/
├── features/
│   ├── conversational-intake.md     # Feature PRD
│   ├── diagram-generation.md
│   ├── validation-engine.md
│   └── export-system.md
├── user-flows/
│   ├── onboarding.md
│   ├── create-prd.md
│   └── export-prd.md
└── acceptance-criteria/
    └── feature-checklist.md
```

**Product Management Patterns:**

**1. Feature PRD Template**
```markdown
# Feature PRD: Conversational Intake

## Overview
**Feature:** AI-powered conversational requirements gathering
**Owner:** Product Manager Agent
**Status:** ✅ Shipped
**Target Release:** v0.1.0 (Jan 2026)

## Problem
Product managers struggle to structure their thoughts when writing PRDs. A blank page is intimidating and leads to:
- Missing requirements discovered late in development
- Inconsistent structure across PRDs
- Time-consuming iterative refinement

## Solution
Guide PM through conversational Q&A with AI agent that:
1. Asks targeted questions about actors, use cases, boundaries
2. Adapts follow-up questions based on previous answers
3. Extracts structured data automatically
4. Persists conversation for resume/review

## Success Metrics
- **Primary:** 85% of users complete the conversation (vs 40% complete blank form)
- **Secondary:** Time to first draft < 60 minutes
- **Quality:** 95%+ extracted data accuracy (validated against manual input)

## User Stories
1. As a PM, I want the AI to ask me questions so I don't have to remember what to include
2. As a PM, I want to see progress indicators so I know how much more to go
3. As a PM, I want to save and resume conversations so I can work in multiple sessions
4. As a PM, I want to edit extracted data so I can fix AI misunderstandings

## Requirements

### Functional
1. **Conversation Flow**
   - AI asks one question at a time
   - Questions adapt based on project context and previous answers
   - Supports follow-up questions for clarification
   - Shows progress indicator (0-100% complete)

2. **Data Extraction**
   - Extract actors (minimum 2 required)
   - Extract use cases (minimum 3 required)
   - Extract system boundaries
   - Extract data entities and relationships
   - Trigger extraction every 5 messages

3. **Persistence**
   - Auto-save every message
   - Allow resume from any point
   - Show conversation history
   - Support manual editing of extracted data

### Non-Functional
1. **Performance**
   - Time to first AI response < 500ms
   - Message streaming latency < 100ms for first token
   - Support 100+ concurrent conversations

2. **Quality**
   - AI asks relevant questions (measured by user satisfaction survey)
   - Extraction accuracy > 95% (manual validation on sample)
   - Conversation completion rate > 85%

3. **Reliability**
   - 99.9% uptime for chat API
   - Zero data loss (all messages persisted)
   - Graceful degradation if LLM API fails

## Design

### User Flow
1. User creates new project (name + vision)
2. User clicks "Start Conversation"
3. AI greets and asks first question
4. User responds
5. AI asks follow-up questions (repeat)
6. Every 5 messages, AI extracts data in background
7. User can view extracted data anytime
8. User marks conversation complete or continues

### Wireframes
[Link to Figma: /figma/conversational-intake]

## Technical Approach

### Architecture
- **Frontend:** React chat component with streaming
- **Backend:** Next.js API route with LangChain streaming
- **Agent:** LangGraph state machine for conversation flow
- **Database:** Conversations table (projectId, role, content, timestamp)

### Key Technical Decisions
1. Use LangGraph for conversation state management
2. Stream responses with Vercel AI SDK for better UX
3. Extract data every 5 messages (balance accuracy vs latency)
4. Cache LLM responses for identical prompts (cost optimization)

### Dependencies
- LangChain.js 0.3
- LangGraph 0.2
- Vercel AI SDK 3.1
- OpenAI GPT-4 Turbo

## Acceptance Criteria

### Must Have (MVP)
- [ ] User can start conversation from project page
- [ ] AI asks at least 10 questions covering actors, use cases, boundaries
- [ ] User can type responses and see streaming AI replies
- [ ] Conversation persists to database
- [ ] User can resume interrupted conversations
- [ ] Extracted data visible on project data tab
- [ ] Extraction accuracy > 95% on test dataset

### Should Have
- [ ] Progress indicator shows % complete
- [ ] User can edit extracted data inline
- [ ] AI adapts questions based on project domain (e.g., e-commerce vs SaaS)

### Nice to Have
- [ ] Voice input option
- [ ] AI summarizes conversation at end
- [ ] Export conversation as transcript

## Testing Plan
1. **Unit Tests:** LangGraph agent logic, extraction functions
2. **Integration Tests:** Full conversation flow with mocked LLM
3. **E2E Tests:** Complete conversation → data extraction → validation
4. **User Testing:** 10 beta users complete conversation, measure satisfaction

## Rollout Plan
1. **Week 1:** Internal testing with team (5 people)
2. **Week 2:** Private beta with 10 design partners
3. **Week 3:** Expand to 50 beta users
4. **Week 4:** Public launch

## Risks & Mitigation
1. **Risk:** LLM asks irrelevant questions
   - **Mitigation:** Prompt engineering with examples, user feedback loop

2. **Risk:** Extraction accuracy < 95%
   - **Mitigation:** Use structured output with Zod, manual validation for first 100 PRDs

3. **Risk:** Users abandon conversation midway
   - **Mitigation:** Save progress, send email reminder to resume

## Open Questions
- Should we support multi-turn clarifications or force one question at a time?
- How do we handle vague/unclear user responses?
- What's the max conversation length before it becomes tedious?

## Launch Checklist
- [ ] Feature flagged and tested in staging
- [ ] Documentation written (user guide + video)
- [ ] Analytics events instrumented
- [ ] Error tracking configured
- [ ] Performance tested under load
- [ ] Beta users onboarded
- [ ] Announcement drafted
```

**2. Sprint Planning Template**
```markdown
# Sprint 1: Conversational Intake MVP (Jan 6-19, 2026)

## Sprint Goal
Ship conversational intake feature with AI Q&A, data extraction, and persistence.

## Capacity
- Backend: 80 hours (2 engineers)
- Frontend: 80 hours (2 engineers)
- AI/Agent: 40 hours (1 engineer)
- Design: 20 hours (0.5 designer)
- **Total:** 220 hours available

## Committed Stories (High Priority)

### Backend
1. **[8pts] API route for chat streaming** (Backend Architect)
   - Create `/api/chat/projects/[id]` endpoint
   - Implement streaming with Vercel AI SDK
   - Save messages to database
   - **AC:** Streams AI responses, persists all messages

2. **[5pts] Conversation database schema** (Database Engineer)
   - Create `conversations` table
   - Add foreign key to projects
   - Write migration
   - **AC:** Schema supports message history with roles

### Frontend
3. **[13pts] Chat UI component** (Chat Engineer)
   - Build ChatWindow with message bubbles
   - Implement streaming display
   - Add loading states
   - **AC:** Messages stream in real-time, mobile responsive

4. **[8pts] Project chat page** (UI/UX Engineer)
   - Create `/projects/[id]/chat` route
   - Integrate ChatWindow
   - Add navigation from project detail
   - **AC:** User can access chat from project page

### AI/Agent
5. **[13pts] LangGraph intake agent** (LangChain Engineer)
   - Build conversation state machine
   - Implement question generation logic
   - Add project context to prompts
   - **AC:** Agent asks relevant questions adaptively

6. **[8pts] Data extraction agent** (LangChain Engineer)
   - Extract actors, use cases, boundaries
   - Trigger every 5 messages
   - Save to projectData table
   - **AC:** Extraction accuracy > 90% on test set

## Stretch Goals (If Time Permits)
7. **[5pts] Progress indicator** (Frontend)
8. **[3pts] Conversation resume** (Backend)

## Definition of Done
- [ ] Code reviewed and approved
- [ ] Unit tests written (85%+ coverage)
- [ ] Integration tests pass
- [ ] Deployed to staging
- [ ] PM tested and approved
- [ ] Documentation updated

## Risks
- LangGraph learning curve for team (mitigation: pair programming)
- Streaming implementation complexity (mitigation: use proven Vercel AI SDK patterns)

## Daily Standups
- 10am PST async in #product-helper-dev Slack channel
- Share: What I did yesterday, what I'm doing today, any blockers
```

**3. Feature Prioritization Framework**
```markdown
# Feature Prioritization: RICE Score

**Formula:** RICE = (Reach × Impact × Confidence) / Effort

## Feature Backlog (Q1 2026)

| Feature | Reach | Impact | Confidence | Effort | RICE | Priority |
|---------|-------|--------|------------|--------|------|----------|
| Conversational Intake | 100% users | 3 (High) | 100% | 3 weeks | 100.0 | P0 ✅ |
| SR-CORNELL Validation | 100% users | 3 (High) | 90% | 2 weeks | 135.0 | P0 ✅ |
| Context Diagram Gen | 100% users | 3 (High) | 80% | 1 week | 240.0 | P0 ✅ |
| Use Case Diagram Gen | 100% users | 2 (Med) | 80% | 1 week | 160.0 | P0 ✅ |
| Markdown Export | 90% users | 2 (Med) | 100% | 3 days | 600.0 | P0 ✅ |
| PDF Export | 70% users | 2 (Med) | 80% | 1 week | 112.0 | P1 |
| Notion Integration | 40% users | 2 (Med) | 60% | 2 weeks | 24.0 | P2 |
| Team Comments | 50% users | 1 (Low) | 70% | 1 week | 35.0 | P2 |
| Version History | 30% users | 1 (Low) | 80% | 2 weeks | 12.0 | P3 |

**Legend:**
- **Reach:** % of users who will use this feature
- **Impact:** 3 (Massive), 2 (High), 1 (Medium), 0.5 (Low)
- **Confidence:** % confidence in estimates
- **Effort:** Person-weeks
- **Priority:** P0 (Must have for MVP), P1 (Q1), P2 (Q2), P3 (Future)

## Decision: Focus Q1 on P0 features only
- Rationale: Limited engineering capacity, need fast time-to-market
- Trade-off: Delay PDF export and integrations to Q2
- Risk: Some users may need PDF immediately (mitigation: manually convert Markdown)
```

**Anti-Patterns to Avoid:**
❌ Writing vague requirements ("make it better")
❌ No acceptance criteria (how do we know it's done?)
❌ Not involving engineers in estimation
❌ Scope creep during sprint
❌ No prioritization framework (everything is P0!)
❌ Ignoring technical debt
❌ Missing success metrics

**Documentation Duties:**
- Write feature PRDs for all new features
- Maintain backlog with RICE scores
- Document sprint plans and retrospectives
- Create user stories with acceptance criteria
- Write release notes for each deployment
- Maintain feature flag documentation

**Stakeholder Management:**
- Weekly progress updates to team
- Monthly roadmap reviews with leadership
- Bi-weekly design partner check-ins
- Quarterly board updates (when applicable)

**Handoff Points:**
- **Receives from:**
  - Product Strategy: High-level roadmap and priorities
  - Users: Feature requests and pain points
  - All teams: Feasibility assessments
- **Delivers to:**
  - All teams: Detailed requirements and acceptance criteria
  - Frontend: User flows and wireframes
  - Backend: API contracts and data models
  - AI/Agent: LLM prompt requirements

---

### Agent 5.3: Technical Program Manager (TPM)

**Primary Role:** Cross-team technical coordination and release management

**Primary Responsibilities:**
- Coordinate cross-team dependencies for multi-team features
- Run weekly cross-team sync (async or live)
- Own release coordination checklist
- Resolve technical blockers between teams
- Ensure API contracts and data schemas align across teams
- Track cross-team technical debt
- Facilitate architecture decisions that span teams

**Tech Stack:**
- **Project Tracking:** GitHub Projects, Linear
- **Communication:** Slack, Notion, Confluence
- **Documentation:** Architecture Decision Records (ADRs), Markdown
- **Monitoring:** GitHub Actions, Vercel Dashboard

**Required MCPs:**
- `github-projects` - Cross-team project tracking
- `slack` - Team communication
- `confluence` - Documentation hub
- `sequential-thinking` - Complex coordination planning

**Key Files & Directories:**
```
docs/
├── architecture/
│   ├── decisions/                    # Architecture Decision Records
│   │   ├── 001-database-choice.md
│   │   ├── 002-auth-strategy.md
│   │   └── template.md
│   └── cross-team/
│       ├── api-contracts.md          # API contract registry
│       ├── data-schemas.md           # Shared schema definitions
│       └── dependency-map.md         # Cross-team dependencies
├── releases/
│   ├── checklist.md                  # Release coordination checklist
│   ├── calendar.md                   # Release schedule
│   └── retrospectives/               # Post-release reviews
└── tech-debt/
    └── registry.md                   # Cross-team technical debt
```

**Key Deliverables:**

**1. Cross-Team Dependency Tracker**
```markdown
# Cross-Team Dependencies (Sprint X)

| Feature | Owner Team | Depends On | Dependency Team | Status | Blocker? |
|---------|-----------|------------|-----------------|--------|----------|
| Chat streaming | Frontend | Chat API | Platform | ✅ Done | No |
| Diagram export | Frontend | Artifact API | Platform | 🚧 In Progress | No |
| RAG context | AI/Agents | Vector store | Data | ⏳ Pending | Yes |
```

**2. Release Coordination Checklist**
```markdown
# Release v0.2.0 Checklist

## Pre-Release (T-3 days)
- [ ] All PRs merged to main
- [ ] Database migrations tested in staging
- [ ] API contracts verified across teams
- [ ] E2E tests passing
- [ ] Performance benchmarks met

## Release Day (T-0)
- [ ] Deploy to staging
- [ ] Smoke tests pass
- [ ] Deploy to production
- [ ] Monitor error rates (< 0.1%)
- [ ] Update status page

## Post-Release (T+1)
- [ ] Announce in #releases channel
- [ ] Update documentation
- [ ] Close related issues
- [ ] Schedule retrospective
```

**3. Architecture Decision Record (ADR) Template**
```markdown
# ADR-XXX: [Decision Title]

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue that we're seeing that motivates this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

## Teams Affected
- Platform Engineering: [impact]
- Frontend: [impact]
- AI/Agents: [impact]
```

**Anti-Patterns to Avoid:**
❌ Making architectural decisions without cross-team input
❌ Not documenting dependencies until blockers occur
❌ Skipping release coordination for "small" releases
❌ Siloed communication (team-only channels)
❌ Not tracking technical debt across team boundaries
❌ Missing API contract reviews before implementation

**Documentation Duties:**
- Maintain cross-team dependency tracker
- Create and update ADRs for architectural decisions
- Document release coordination process
- Track and report on technical debt
- Create cross-team sync meeting notes

**Testing Requirements:**
- Verify API contracts match implementations
- Ensure data schema consistency across teams
- Validate cross-team integration tests pass
- Check release checklist completeness

**Handoff Points:**
- **Receives from:**
  - All team leads: Blockers, dependencies, tech debt items
  - Product Strategy: Multi-team feature requirements
  - QA: Cross-team testing gaps
- **Delivers to:**
  - All teams: Coordination updates, release schedules
  - All teams: Architecture Decision Records (ADRs)
  - Product Strategy: Technical feasibility assessments
  - DevOps: Release coordination requirements

---

## Team Workflows

### Strategic Planning (Quarterly)
1. **Product Strategy Agent** reviews market, competition, user feedback
2. **Product Strategy Agent** updates vision and OKRs for next quarter
3. **Product Manager Agent** translates OKRs into feature roadmap
4. **Both agents** present to team for feedback and alignment

### Feature Development (Per Feature)
1. **Product Manager Agent** writes feature PRD
2. **Product Strategy Agent** reviews alignment with vision
3. **Product Manager Agent** gets technical feasibility from engineers
4. **Product Manager Agent** finalizes requirements and acceptance criteria
5. **Product Manager Agent** coordinates implementation across teams

### Sprint Cycle (2 weeks)
1. **Monday (Sprint Planning):**
   - Product Manager Agent presents backlog
   - Team estimates stories
   - Team commits to sprint goal

2. **Daily (Standup):**
   - Async updates in Slack
   - Product Manager Agent unblocks issues

3. **Friday (Sprint Review):**
   - Demo completed features
   - Product Manager Agent validates against acceptance criteria
   - Gather feedback for iteration

4. **Friday (Sprint Retro):**
   - What went well, what didn't, action items

---

## Success Metrics

**Product Strategy Agent:**
- OKR achievement rate > 70%
- User NPS score > 50
- Product-market fit score (Sean Ellis test) > 40%

**Product Manager Agent:**
- Sprint velocity consistency (± 15% variance)
- Feature delivery on time > 80%
- Acceptance criteria clarity (measured by rework rate < 10%)

---

## Reference Documentation

### Internal Documentation
- [Master Instructions](../.claude/instructions.md)
- [Product Vision](/docs/product/vision.md)
- [Roadmap](/docs/product/roadmap.md)

### External Resources
- [Lean Product Playbook](https://leanproductplaybook.com/)
- [Inspired by Marty Cagan](https://www.svpg.com/inspired-how-to-create-products-customers-love/)
- [The Mom Test](http://momtestbook.com/)

---

**Questions or Issues?** Tag `@product-planning-team` in GitHub discussions or issues.
