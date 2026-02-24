# C1V Monorepo

> **AI-Powered Product Development Platform**
>
> A modern monorepo for C1V products, built with Turborepo and PNPM workspaces. Designed for rapid deployment with comprehensive testing, documentation standards, and multi-agent AI architecture.

## 🏗️ Structure

```
c1v/
├── apps/
│   └── product-helper/      # PRD generation SaaS (live on Vercel)
│       ├── app/
│       │   ├── (marketing)/     # Public landing page
│       │   ├── (dashboard)/     # Authenticated pages (home, projects, chat)
│       │   ├── (login)/         # Sign-in, sign-up, password reset
│       │   └── api/             # Route handlers (chat, mcp, projects, stripe)
│       ├── components/          # React components by domain (72 files)
│       └── lib/                 # Business logic (agents, db, mcp, education)
├── packages/
│   └── cleo-validator/      # Task state validation library
├── .claude/                 # Agent instructions & MCP configuration
├── .github/
│   └── workflows/           # CI/CD pipelines
├── docs/                    # Development guides
└── scripts/                 # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM 9+

### Installation

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build
```

### Database Setup

```bash
# Generate database migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed development data
pnpm db:seed
```

## 🤖 Agent Architecture

This project uses a **multi-agent system** for development and product features. See [`.claude/instructions.md`](./.claude/instructions.md) for complete details.

### Development Teams (16 Specialized Agents)

| Team | File | Agents | Primary Focus |
|------|------|--------|--------------|
| 🏗️ **Platform Engineering** | [`platform-engineering.md`](./.claude/teams/platform-engineering.md) | 3 | Backend, Database, Security & DevOps |
| 🎨 **Frontend** | [`frontend.md`](./.claude/teams/frontend.md) | 3 | UI/UX, Chat Interface, Data Visualization |
| 🧠 **AI/Agent Engineering** | `ai-agents.md` | 3 | LangChain Integration, LLM Workflows, Validation |
| 💾 **Data & Infrastructure** | `data-infrastructure.md` | 3 | Vector Store, Caching, Observability |
| 📋 **Product & Planning** | `product-planning.md` | 2 | Strategy, Product Management |
| 🔍 **Quality & Documentation** | `quality-docs.md` | 2 | QA, Documentation, Testing Standards |

**Agent Capabilities:**
- Multi-agent collaboration using LangGraph orchestration
- Structured output with Zod schemas
- MCP (Model Context Protocol) integration for tool access
- Autonomous task execution with human oversight
- Cross-team communication protocols

**MCP Servers Available:**
- `filesystem` - File operations
- `github` - Repository management
- `postgres` - Database access
- `puppeteer` - Browser automation
- `memory` - Persistent agent context
- `sequential-thinking` - Extended reasoning

See [MCP configuration](./.claude/mcp-servers.json) for setup details.

---

## 📦 Apps

### Product Helper (Live)

**AI-powered PRD generation SaaS** that transforms conversational input into engineering-quality Product Requirements Documents with validated diagrams and artifacts.

**Core Features:**
- Conversational Intake — chat-based PRD creation with AI agents
- Quick Start Pipeline — SSE-streamed 5-step PRD generation from one sentence
- PRD-SPEC Validation — 95% quality threshold with 10 hard gates
- Diagram Generation — Context, Use Case, Class, Sequence, Activity diagrams (Mermaid)
- MCP Server — 17 tools for IDE integration (CLAUDE.md + SKILL.md export)
- Credit-Based Billing — Stripe, 3 tiers (Free/Base/Plus)
- Marketing Landing Page — 9 animated components, framer-motion

**Tech Stack:**
- **Frontend:** Next.js 15.5.9, React 19.1, Tailwind CSS 4.1, shadcn/ui, framer-motion 12
- **AI/Agents:** LangChain.js 0.3.26, LangGraph 0.2.60, `@langchain/anthropic` 0.3.14
- **LLM:** Anthropic Claude (via `@langchain/anthropic`)
- **Backend:** Next.js App Router (RSC), Server Actions
- **Database:** PostgreSQL via Drizzle ORM 0.43.1, hosted on Supabase
- **Auth:** Custom JWT (jose 6.1) + bcryptjs
- **Payments:** Stripe 18.5 + credit-based usage gating
- **Validation:** Zod 3.25, TypeScript 5.9 strict mode
- **Testing:** Jest 30 + Playwright 1.57
- **Email:** Resend 6.7

**Brand:**
- Typography: Space Grotesk (headings), Consolas (body)
- Colors: Firefly #0B2C29 (dark bg), Porcelain #FBFCFC (light bg), Tangerine #F18F01 (accent)
- Dark/light mode via CSS custom properties

## 🛠️ Development

### Available Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm format           # Format all code with Prettier

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run E2E tests with Playwright
pnpm test:coverage    # Generate coverage report
pnpm test:watch       # Run tests in watch mode

# Database
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:seed          # Seed development data
pnpm db:reset         # Reset database (caution!)

# Utilities
pnpm clean            # Clean all build artifacts
pnpm typecheck        # Type check all packages
```

### Working with Apps

```bash
# Run specific app
pnpm --filter product-helper dev

# Build specific app
pnpm --filter product-helper build

# Test specific app
pnpm --filter product-helper test

# Add dependency to specific app
pnpm --filter product-helper add langchain
```

### Testing Standards

This project follows a **test pyramid approach** with comprehensive testing requirements:

- **Unit Tests:** 85% coverage minimum (Vitest + React Testing Library)
- **Integration Tests:** 70% coverage (API routes, database operations)
- **E2E Tests:** Critical user flows only (Playwright)

**Coverage Requirements:**
- Overall: 80% minimum
- Critical paths (auth, payments, validation): 100%
- New features: 90% required before merge

See [Testing Standards Guide](./docs/guides/testing-standards.md) for detailed patterns and examples.

**Key Testing Principles:**
- ✅ Write tests before or alongside code
- ✅ All bug fixes must include regression tests
- ✅ Mock external services (OpenAI, Stripe)
- ✅ Use test database for integration tests
- ✅ No flaky tests - fix or remove
- ❌ Don't skip tests to merge faster

### Code Quality & CI/CD

All code changes go through automated checks:

**Pre-commit Hooks:**
- ESLint + TypeScript type checking
- Prettier formatting
- Staged file testing

**GitHub Actions (Automated):**
- **Testing Pipeline:** Runs on every PR
  - Lint checks
  - Unit tests
  - Integration tests (with PostgreSQL service)
  - E2E tests (Playwright)
  - Coverage reporting to Codecov

- **Documentation Validation:** Runs on every PR
  - Changelog update check
  - ADR validation for architecture changes
  - Agent instruction format validation
  - Markdown link checking

- **Release Automation:** Manual trigger
  - Version bumping (patch/minor/major)
  - Changelog generation
  - Git tagging
  - GitHub release creation
  - Slack notifications

See [GitHub Actions workflows](./.github/workflows/) for configuration details.

## 🏛️ Architecture

This monorepo uses:

- **Turborepo** - Fast build system with intelligent caching
- **PNPM Workspaces** - Efficient package management
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety across the monorepo
- **Drizzle ORM** - Type-safe database access
- **LangChain.js** - AI agent orchestration

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Each app requires its own `.env.local` file:

```bash
# Database
POSTGRES_URL=postgresql://...

# Auth
AUTH_SECRET=your-secret-key

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI
ANTHROPIC_API_KEY=sk-ant-...
```

## 📚 Documentation

### Agent Instructions
- [Master Instructions](./.claude/instructions.md) - Project overview, architecture, conventions
- [Platform Engineering Team](./.claude/teams/platform-engineering.md) - Backend, Database, DevOps
- [Frontend Team](./.claude/teams/frontend.md) - UI/UX, Chat, Data Visualization
- [MCP Configuration](./.claude/mcp-servers.json) - Tool server setup

### Development Guides
- [Testing Standards](./docs/guides/testing-standards.md) - Comprehensive testing guide with examples
- [ADR Template](./docs/templates/ADR-template.md) - Architecture Decision Record template
- [Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md) - PR checklist and guidelines

### Standards & Conventions
- **Code Style:** TypeScript strict mode, ESLint, Prettier
- **Git Workflow:** Conventional Commits, feature branches, PR reviews
- **Documentation:** Keep a Changelog format, ADRs for architecture decisions
- **Testing:** Test pyramid (many unit, some integration, few E2E)
- **Versioning:** Semantic Versioning 2.0.0

### Coming Soon
- API Documentation (auto-generated from JSDoc)
- Deployment Guide (Vercel + database)
- Playbooks (backend, frontend, security, database operations)

## 🎯 PRD-SPEC Validation

Product Helper implements the **PRD-SPEC-PRD-95-V1** validation framework - a rigorous quality standard for PRD artifacts.

**Validation Criteria:**
- **95% Score Threshold:** Overall quality gate
- **10 Hard Gates:** Non-negotiable requirements (actors, use cases, system boundary, etc.)
- **Artifact Minimums:** Required diagrams and documentation sections
- **Programmatic Validation:** No LLM guessing - deterministic rule checking

**Validation Categories:**
1. **Completeness:** All required sections present
2. **Consistency:** Cross-artifact referential integrity
3. **Clarity:** Unambiguous requirements and descriptions
4. **Coverage:** All actors, use cases, and entities documented
5. **Traceability:** Requirements linked to business goals

Specification: `/apps/product-helper/PRD-SPEC-PRD-95-V1.json`

---

## 🤝 Contributing

### Getting Started

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd c1v
   pnpm install
   ```

2. **Set Up Environment**
   ```bash
   cp apps/product-helper/.env.example apps/product-helper/.env.local
   # Fill in required environment variables
   ```

3. **Run Development Server**
   ```bash
   pnpm dev
   ```

4. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Pull Request Process

1. **Write Tests:** Ensure 90% coverage for new features
2. **Update Documentation:**
   - Update CHANGELOG.md under `[Unreleased]`
   - Create ADR if architectural change
   - Update relevant agent instructions if workflow changes
3. **Run Quality Checks:**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
4. **Create PR:** Use the [PR template](./.github/PULL_REQUEST_TEMPLATE.md)
5. **Request Review:** Tag relevant agent team (e.g., `@frontend-team`)
6. **Address Feedback:** Respond to review comments
7. **Merge:** Squash and merge after approval + passing CI

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvement
- `test:` Adding missing tests
- `chore:` Maintain, dependencies, tooling

**Examples:**
```bash
feat(chat): add streaming response support
fix(auth): resolve Clerk webhook signature validation
docs(testing): add integration test examples
chore(deps): upgrade langchain to 0.3.5
```

### Release Process

1. **Trigger Release Workflow:** GitHub Actions (manual)
2. **Choose Version Bump:** patch (0.0.X), minor (0.X.0), or major (X.0.0)
3. **Review Changelog:** Automatically moves `[Unreleased]` to new version
4. **Git Tag Created:** `v0.1.0` format
5. **GitHub Release:** Created with changelog notes

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## 📞 Support & Contact

- **Issues:** Create GitHub issue with appropriate label
- **Agent Teams:** Tag team in issues/PRs (e.g., `@platform-engineering-team`)
- **Documentation Questions:** Label with `documentation`
- **Security Issues:** Email security team directly (do not create public issue)

**Common Labels:**
- `architecture` - Architectural changes requiring ADR
- `skip-changelog` - Skip changelog validation (docs-only, deps)
- `breaking-change` - Breaking API changes
- `good-first-issue` - Good for newcomers
- `help-wanted` - Need assistance

## 📝 License

Proprietary - All rights reserved
