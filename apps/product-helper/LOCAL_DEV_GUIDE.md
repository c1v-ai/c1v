# Local Development Guide - Product Helper

## Quick Start (5 Minutes)

### Prerequisites

1. **Node.js 18+** and **pnpm 9+** installed
2. **Docker Desktop** (for local database) - [Download](https://docs.docker.com/get-docker/)
3. **Stripe CLI** (for payments) - [Install Guide](https://docs.stripe.com/stripe-cli)

---

## Step 1: Database Setup (Choose One)

### Option A: Local PostgreSQL with Docker (Recommended for Development)

The setup script will automatically:
- Create a `docker-compose.yml` file
- Start PostgreSQL in Docker on port `54322`
- Database credentials: `postgres:postgres@localhost:54322/postgres`

**No manual steps needed** - the setup script handles this!

### Option B: Remote PostgreSQL (Vercel, Supabase, etc.)

Get a database URL from:
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com/
- **Neon**: https://neon.tech/

You'll need a connection string like:
```
postgresql://user:password@host:5432/database
```

---

## Step 2: Run Setup Script

This interactive script will set up everything:

```bash
cd /Users/davidancor/Documents/MDR/c1v/apps/product-helper

pnpm db:setup
```

**The script will:**

1. ✅ Check if Stripe CLI is installed and authenticated
2. ✅ Ask: Local Docker DB or Remote DB?
3. ✅ Set up Docker PostgreSQL (if local chosen)
4. ✅ Ask for your Stripe Secret Key
5. ✅ Create Stripe webhook endpoint
6. ✅ Generate secure AUTH_SECRET
7. ✅ Write `.env` file with all variables

**What you'll need:**
- **Stripe Secret Key**: Get from https://dashboard.stripe.com/test/apikeys
- (Optional) **Remote DB URL**: If not using Docker

---

## Step 3: Run Database Migrations

Apply the database schema (creates all tables):

```bash
pnpm db:migrate
```

**This creates:**
- 5 saas-starter tables (users, teams, teamMembers, invitations, activityLogs)
- 4 PRD tables (projects, projectData, artifacts, conversations)

---

## Step 4: Seed Database (Optional but Recommended)

Add sample data for testing:

```bash
pnpm db:seed
```

**This creates:**
- Test user: `test@test.com` / `admin123`
- Test team with subscription
- Sample activity logs
- Stripe test products (Base $8/mo, Plus $12/mo)

---

## Step 5: Start Development Server

```bash
pnpm dev
```

**Server starts at:** http://localhost:3000

**What's running:**
- Next.js dev server with Turbopack (fast!)
- Hot module replacement (changes appear instantly)
- API routes at `/api/*`

---

## Testing Your Setup

### 1. Test Frontend

Open browser: http://localhost:3000

**You should see:**
- Landing page with custom theme (Consolas headings, Verdana body, teal accent)
- Sign in / Sign up buttons

### 2. Test Authentication

**Sign up:**
```
Email: yourname@example.com
Password: password123 (min 8 chars)
Name: Your Name
```

**Or use seeded account:**
```
Email: test@test.com
Password: admin123
```

### 3. Test Database Connection

Open Drizzle Studio (visual database browser):

```bash
pnpm db:studio
```

Opens at: http://local.drizzle.studio

**You'll see all tables:**
- users
- teams
- teamMembers
- projects (NEW!)
- projectData (NEW!)
- artifacts (NEW!)
- conversations (NEW!)

Click any table to view/edit data.

### 4. Test Stripe Integration

**In a separate terminal**, forward webhooks to localhost:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Keep this running while testing payments.

**Then test:**
1. Go to `/pricing` page
2. Click "Subscribe" on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., 12/25)
5. CVC: Any 3 digits (e.g., 123)

---

## Environment Variables Explained

After setup, your `.env` file contains:

```bash
# Database
POSTGRES_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Authentication
AUTH_SECRET="<64-char-hex-string>"  # Auto-generated

# Stripe
STRIPE_SECRET_KEY="sk_test_..."     # Your test key
STRIPE_WEBHOOK_SECRET="whsec_..."   # Auto-generated

# App
BASE_URL="http://localhost:3000"
```

**For Phase 4 (LangChain), you'll add:**

```bash
# OpenAI API (for LangChain)
OPENAI_API_KEY="sk-..."

# LangChain (optional - for observability)
LANGCHAIN_API_KEY="ls_..."
LANGCHAIN_PROJECT="c1v-product-helper"
```

---

## Architecture Overview

### Frontend (Next.js App Router)

```
app/
├── (login)/
│   ├── sign-in/page.tsx         → http://localhost:3000/sign-in
│   └── sign-up/page.tsx         → http://localhost:3000/sign-up
├── (dashboard)/
│   ├── dashboard/page.tsx       → http://localhost:3000/dashboard
│   └── pricing/page.tsx         → http://localhost:3000/pricing
├── layout.tsx                   → Root layout with theme
├── theme.css                    → Custom c1v theme
└── globals.css                  → Tailwind + utilities
```

### Backend (API Routes + Server Actions)

```
app/api/
├── user/route.ts                → GET /api/user
├── team/route.ts                → GET /api/team
└── stripe/
    ├── webhook/route.ts         → POST /api/stripe/webhook
    └── checkout/route.ts        → GET /api/stripe/checkout

app/(login)/actions.ts           → Server actions (signIn, signUp, etc.)
lib/payments/actions.ts          → Payment actions
```

### Database (Drizzle ORM)

```
lib/db/
├── schema.ts                    → All table definitions + types
├── queries.ts                   → Reusable queries
├── drizzle.ts                   → Database client
├── setup.ts                     → Setup script
├── seed.ts                      → Seed data
└── migrations/                  → SQL migration files
    ├── 0000_...sql              → Initial saas-starter tables
    └── 0001_...sql              → PRD tables (NEW!)
```

---

## Common Commands

```bash
# Development
pnpm dev                         # Start dev server
pnpm build                       # Production build
pnpm start                       # Start production server

# Database
pnpm db:generate                 # Generate migration from schema changes
pnpm db:migrate                  # Apply migrations
pnpm db:studio                   # Open visual database browser
pnpm db:seed                     # Seed test data
pnpm db:setup                    # Interactive setup (first time only)

# From monorepo root
cd /Users/davidancor/Documents/MDR/c1v
pnpm --filter product-helper dev       # Run product-helper from root
pnpm --filter product-helper build     # Build from root
```

---

## Testing Checklist

- [ ] Database running (check `pnpm db:studio`)
- [ ] Migrations applied (9 tables should exist)
- [ ] Dev server running at http://localhost:3000
- [ ] Can sign up new user
- [ ] Can sign in with test@test.com / admin123
- [ ] Can view dashboard after login
- [ ] Can view pricing page
- [ ] Stripe webhook listener running (separate terminal)
- [ ] Can create test subscription

---

## Troubleshooting

### "ECONNREFUSED" Database Error

**Problem:** Can't connect to database

**Solutions:**
1. Check Docker is running: `docker ps`
2. Restart container: `docker compose down && docker compose up -d`
3. Verify port: `lsof -i :54322` (should show postgres)
4. Check `.env` has correct `POSTGRES_URL`

### "Stripe CLI not authenticated"

**Problem:** Stripe commands fail

**Solution:**
```bash
stripe login
# Follow prompts to authenticate
```

### "Port 3000 already in use"

**Problem:** Another app using port 3000

**Solutions:**
1. Kill process: `lsof -ti:3000 | xargs kill -9`
2. Or use different port: `PORT=3001 pnpm dev`

### "Module not found" Errors

**Problem:** Dependencies not installed

**Solution:**
```bash
pnpm install
```

### Theme Not Showing

**Problem:** Fonts or colors look wrong

**Check:**
1. `theme.css` imported BEFORE `globals.css` in `app/layout.tsx`
2. Browser hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check `data-theme="light"` on `<html>` tag

---

## Next Steps (After Phase 4)

Once LangChain is integrated:

1. **Add OPENAI_API_KEY** to `.env`
2. **Create first PRD project** at `/projects/new`
3. **Start conversation** with AI agent
4. **Test data extraction** after 5+ messages
5. **Run validation** to see SR-CORNELL score
6. **Generate diagrams** (context, use case)
7. **Export PRD** to Markdown

---

## Production Deployment (Future)

When ready to deploy to production:

1. **Database**: Use Vercel Postgres or Supabase (production-ready)
2. **Deploy**: Push to GitHub → Vercel auto-deploys
3. **Environment**: Set production env vars in Vercel dashboard
4. **Stripe**: Switch to live keys (not test keys)
5. **Domain**: Add custom domain in Vercel

See deployment guide: `/docs/deployment.md` (coming soon)

---

## Questions?

- **Setup Issues**: Check troubleshooting section above
- **Schema Changes**: Run `pnpm db:generate` then `pnpm db:migrate`
- **Seed Data**: Run `pnpm db:seed` anytime to reset test data
- **API Testing**: Use Drizzle Studio or Postman

**Documentation:**
- Drizzle ORM: https://orm.drizzle.team/
- Next.js: https://nextjs.org/docs
- Stripe: https://docs.stripe.com/
