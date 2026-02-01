# Product Helper

AI-powered PRD (Product Requirements Document) generation SaaS. Transform product ideas into engineering-quality PRD artifacts through conversational AI intake and intelligent validation.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.8
- **Database:** PostgreSQL with Drizzle ORM
- **AI/LLM:** LangChain.js, LangGraph, OpenAI GPT-4
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

- Node.js >= 20.9.0
- PNPM 9.x
- PostgreSQL database
- Stripe account (for payments)
- OpenAI API key

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure required variables in `.env`:
```
POSTGRES_URL=postgresql://...
AUTH_SECRET=your-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
BASE_URL=http://localhost:3000
```

### Database Setup

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with test data (optional)
pnpm db:seed
```

Default test user:
- Email: `test@test.com`
- Password: `admin123`

### Running Development Server

```bash
# From monorepo root
pnpm dev --filter product-helper

# Or from this directory
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Stripe Webhooks (Local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
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
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4 |
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
