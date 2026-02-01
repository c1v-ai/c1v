# Product Helper

AI-powered PRD (Product Requirements Document) generation SaaS. Transform product ideas into engineering-quality PRD artifacts through conversational AI intake and intelligent validation.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.8
- **Database:** PostgreSQL with Drizzle ORM
- **AI/LLM:** LangChain.js, LangGraph, Anthropic Claude Sonnet 4.5
- **Payments:** Stripe (subscriptions, checkout)
- **UI:** shadcn/ui, Tailwind CSS 4.1
- **Auth:** JWT-based with bcryptjs
- **Diagrams:** Mermaid.js

## Key Features

- **Conversational Intake** - Chat with AI to define product vision, actors, use cases, and system boundaries
- **Automatic Data Extraction** - LangGraph agents extract structured PRD data from conversations
- **PRD-SPEC Validation** - Validate PRDs against 10 hard gates with 95% quality threshold
- **Diagram Generation** - Auto-generate Context, Use Case, and Class diagrams (Mermaid)
- **Export Options** - Export diagrams as SVG/PNG
- **Team Support** - Multi-user teams with role-based access
- **Stripe Payments** - Subscription management with Stripe Checkout

## Getting Started

### Prerequisites

- Node.js >= 20.9.0 (see `.nvmrc`)
- PNPM 9.x
- Docker Desktop (for Supabase local)
- Stripe account (for payments)
- Anthropic API key

### Quick Start (Local Development)

1. **Copy environment template and add your API keys:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your ANTHROPIC_API_KEY and STRIPE keys
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start local Postgres via Supabase:**
   ```bash
   pnpm db:start
   # First run downloads images (~2-3 min)
   ```
   This starts:
   - **Postgres** at `localhost:54322`
   - **Supabase Studio** at [http://localhost:54323](http://localhost:54323)
   - **Email testing** at [http://localhost:54324](http://localhost:54324)

4. **Run database migrations (one-time):**
   ```bash
   # Apply all migrations to local Supabase
   pnpm db:migrate:sql

   # Seed test user (test@test.com / admin123)
   pnpm db:seed
   ```

   > **Note:** If `db:migrate:sql` fails, ensure POSTGRES_URL is set in `.env.local` to `postgresql://postgres:postgres@localhost:54322/postgres`

5. **Start dev server:**
   ```bash
   pnpm dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

6. **Stop local database when done:**
   ```bash
   pnpm db:stop
   ```

### Test Credentials

After running `pnpm db:seed`:
- Email: `test@test.com`
- Password: `admin123`

### Stripe Webhooks (Local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Legacy Environment Setup

For production or non-Supabase setups, use `.env.example`:
```bash
cp .env.example .env
# Configure POSTGRES_URL to your external database
```

## Project Structure

```
apps/product-helper/
├── app/
│   ├── (dashboard)/           # Authenticated routes
│   │   ├── dashboard/         # User dashboard, settings
│   │   ├── projects/          # Project CRUD, detail views
│   │   │   ├── [id]/          # Single project
│   │   │   │   ├── chat/      # Project chat interface
│   │   │   │   └── edit/      # Edit project
│   │   │   └── new/           # Create project
│   │   ├── chat/              # General chat
│   │   └── pricing/           # Subscription plans
│   ├── (login)/               # Auth pages (sign-in, sign-up)
│   ├── api/                   # API routes
│   │   ├── chat/              # Chat streaming endpoints
│   │   ├── projects/          # Project API
│   │   └── stripe/            # Stripe webhooks
│   └── actions/               # Server actions
├── components/
│   ├── chat/                  # Chat UI components
│   ├── diagrams/              # Mermaid diagram viewer
│   ├── extracted-data/        # PRD data display
│   ├── projects/              # Project cards, forms
│   ├── ui/                    # shadcn/ui base components
│   └── validation/            # Validation report UI
├── lib/
│   ├── auth/                  # JWT auth utilities
│   ├── db/                    # Drizzle schema, queries
│   ├── diagrams/              # Mermaid generators
│   ├── langchain/             # LangChain config, agents
│   │   ├── agents/            # Data extraction agent
│   │   ├── config.ts          # LLM configuration
│   │   ├── prompts.ts         # Prompt templates
│   │   └── schemas.ts         # Zod schemas for extraction
│   ├── payments/              # Stripe integration
│   └── validators/            # PRD-SPEC validation
└── public/                    # Static assets
```

## Environment Variables

See `.env.example` for all available variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `BASE_URL` | Yes | Application base URL |
| `LANGCHAIN_API_KEY` | No | LangSmith API key (observability) |
| `LANGCHAIN_PROJECT` | No | LangSmith project name |

## Testing Payments

Use Stripe test cards:
- Card: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3 digits

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Configure production Stripe webhook: `https://yourdomain.com/api/stripe/webhook`

## Related Documentation

- [Implementation Plan](/implementation-plan.md) - Full 12-phase development plan
- [CLAUDE.md](/CLAUDE.md) - Monorepo architecture overview
- [Phase Completion Reports](./PHASE_*_COMPLETION.md) - Detailed phase completion notes
