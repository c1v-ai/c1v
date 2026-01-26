# Phase 12: Project Explorer UI (Revised)

**Phase:** 12 - Project Explorer UI
**Priority:** P2
**Status:** Planned
**Dependencies:** Phase 9-11 (requires new data models)
**Goal:** Redesign project view with tree sidebar, chat-centric UX, and journey tracking

---

## Key UX Principles (Revised)

1. **Chat is THE differentiator** - Must be prominent, not hidden
2. **Empty states guide to action** - Every empty section leads to chat
3. **Journey shows progress** - Visual tracker from Discovery → Export Ready
4. **Mobile is first-class** - Specific patterns for chat+explorer on mobile
5. **First impression matters** - New projects need welcoming guidance

---

## Revised Explorer Tree Structure

```
Project Explorer
├── 💬 Chat & Discovery          ← PRIMARY (your differentiator)
│   ├── Current Conversation
│   └── Conversation History
├── 📊 Overview
│   ├── Completion Score (73%)
│   ├── Quick Stats
│   └── Next Steps
├── 📋 Product Requirements
│   ├── Problem Statement
│   ├── Actors (4 discovered)
│   ├── Use Cases (8 discovered)
│   └── System Boundaries
├── 🔧 Technical Specs
│   ├── Tech Stack
│   ├── Database Schema
│   └── API Specification
├── 📐 Architecture
│   └── Diagrams (3)
├── 📝 User Stories (12)
├── ✅ Validation (PRD-SPEC: 78%)
├── 📖 Coding Guidelines
└── 🔗 Connections (MCP)
```

---

## Pre-Requisite: Phase 11.5 (First Impression Polish)

**Must complete BEFORE Phase 12** - These issues happen before explorer is seen.

| Task ID | Name | Priority | Agent |
|---------|------|----------|-------|
| #25 | Fix post-login redirect to /projects | HIGH | devops-engineer |
| #26 | First-time user onboarding flow | HIGH | ui-ux-engineer |
| #27 | Enhanced project creation modal | HIGH | ui-ux-engineer |
| #28 | Social sign-in integration (Google, GitHub) | HIGH | backend-engineer |
| #29 | User type selection UI (Individual/Company) | HIGH | ui-ux-engineer |
| #30 | Role selector component | HIGH | ui-ux-engineer |
| #31 | Sign-up form flow (multi-step) | HIGH | ui-ux-engineer |
| #32 | Sign-in page redesign | MEDIUM | ui-ux-engineer |
| #33 | Workspace name validation | MEDIUM | backend-engineer |
| #34 | Database schema updates for auth | HIGH | backend-engineer |

### 11.5.1 Fix Post-Login Redirect (#25)
- Current: Lands on Team Settings after login
- Fix: Redirect to /projects (project list)
- Location: `middleware.ts` or auth callback

### 11.5.2 First-Time Onboarding (#26)
- Role selection (PM, developer, founder)
- Workspace/team setup
- Brief product tour
- First project CTA

### 11.5.3 Enhanced Project Creation (#27)
Current sparse modal needs:
- Project type (web app, mobile, API, SaaS)
- Project stage (idea, MVP, growth)
- Key constraints (timeline, budget, team size)
- "What you'll get" preview (PRD, diagrams, stories, MCP export)

---

## Authentication & Sign-Up UX Improvements

**Goal:** Improve the sign-in/sign-up user experience to match Epic.dev quality with enhanced authentication options and onboarding flow.

### Reference Design
- Similar to Epic.dev sign-in/sign-up flow (see `/upgrade v2/epic.dev - sign-in:up/`)
- Modern, polished authentication experience
- Clear user type selection and role-based onboarding

### Sign-In / Sign-Up Flow Requirements

#### Authentication Options
1. **Email/Password** - Traditional email-based authentication
2. **Social Sign-In** (NEW)
   - Google OAuth
   - GitHub OAuth
   - Additional providers (future: Microsoft, Apple)

#### User Type Selection
After initial authentication, users select their account type:

**Option 1: Individual**
- Name (required)
- Workspace Name (required)
- Role (required - see role options below)

**Option 2: Company**
- Company Name (required)
- Role (required - see role options below)
- Workspace Name (required)

#### Role Selection Options
Users must select their role from the following options:
- Solutions Architect
- CTO/VP of Engineering
- Software Engineer/Developer
- Product Manager
- Student
- Hobbyist
- Other (with text input)

#### Form Structure

**Individual Flow:**
```
Step 1: Authentication
├── Email/Password OR
├── Google Sign-In OR
└── GitHub Sign-In

Step 2: Account Type Selection
└── [Individual] [Company] (radio buttons or cards)

Step 3: Individual Details
├── Name: [text input]
├── Workspace Name: [text input]
└── Role: [dropdown/select]
    ├── Solutions Architect
    ├── CTO/VP of Engineering
    ├── Software Engineer/Developer
    ├── Product Manager
    ├── Student
    ├── Hobbyist
    └── Other: [text input if selected]
```

**Company Flow:**
```
Step 1: Authentication (same as Individual)

Step 2: Account Type Selection
└── [Individual] [Company] ← Select Company

Step 3: Company Details
├── Company Name: [text input]
├── Role: [dropdown/select]
│   ├── Solutions Architect
│   ├── CTO/VP of Engineering
│   ├── Software Engineer/Developer
│   ├── Product Manager
│   ├── Student
│   ├── Hobbyist
│   └── Other: [text input if selected]
└── Workspace Name: [text input]
```

### Implementation Tasks

| Task ID | Name | Priority | Description |
|---------|------|----------|-------------|
| #28 | Social sign-in integration | HIGH | Integrate Google and GitHub OAuth providers |
| #29 | User type selection UI | HIGH | Individual vs Company selection component |
| #30 | Role selector component | HIGH | Dropdown with all role options + "Other" input |
| #31 | Sign-up form flow | HIGH | Multi-step form with validation |
| #32 | Sign-in page redesign | MEDIUM | Update sign-in page to match Epic.dev style |
| #33 | Workspace name validation | MEDIUM | Unique workspace name checking |
| #34 | Database schema updates | HIGH | Add user type, role, workspace fields to user model |

### Design Specifications

#### Social Sign-In Buttons
- Google: Use Google brand colors and icon
- GitHub: Use GitHub brand colors and icon
- Consistent sizing and spacing
- Clear "or continue with email" divider

#### User Type Selection
- Card-based selection (Individual card | Company card)
- Visual distinction between options
- Clear description of what each option means

#### Role Selector
- Dropdown/select component with search capability
- "Other" option reveals text input when selected
- Helper text explaining role selection purpose

#### Form Validation
- Real-time validation feedback
- Workspace name uniqueness check
- Email format validation
- Required field indicators

### Database Schema Changes

```typescript
// User model additions
{
  accountType: 'individual' | 'company',
  role: 'solutions_architect' | 'cto_vp_engineering' | 'software_engineer' | 'product_manager' | 'student' | 'hobbyist' | 'other',
  roleOther?: string, // if role === 'other'
  companyName?: string, // if accountType === 'company'
  workspaceName: string, // required for all
  // OAuth provider info
  oauthProvider?: 'google' | 'github',
  oauthProviderId?: string,
}
```

### File Structure

```
app/(auth)/
├── sign-in/
│   ├── page.tsx                    # Sign-in page
│   └── sign-in-form.tsx            # Sign-in form component
├── sign-up/
│   ├── page.tsx                    # Sign-up page
│   ├── sign-up-form.tsx            # Multi-step sign-up form
│   ├── auth-providers.tsx          # Social sign-in buttons
│   ├── user-type-selector.tsx      # Individual vs Company selection
│   └── role-selector.tsx            # Role dropdown component
└── actions.ts                      # Server actions for auth

components/auth/
├── social-sign-in-button.tsx       # Reusable social auth button
├── user-type-card.tsx              # Individual/Company card component
└── role-selector.tsx               # Role selection component

lib/auth/
├── oauth.ts                        # OAuth provider configuration
├── google.ts                       # Google OAuth handler
└── github.ts                       # GitHub OAuth handler
```

### Success Criteria

- [ ] Users can sign in with Google OAuth
- [ ] Users can sign in with GitHub OAuth
- [ ] Users can sign in with email/password
- [ ] Clear Individual vs Company selection
- [ ] All role options available in dropdown
- [ ] "Other" role option allows custom input
- [ ] Workspace name validation (uniqueness)
- [ ] Form validation provides clear feedback
- [ ] UI matches Epic.dev design quality
- [ ] Mobile-responsive authentication flow

---

## Task Breakdown

### Wave 0: UX Foundation (Critical - Do First)

| Task ID | Name | Priority | Description |
|---------|------|----------|-------------|
| #20 | Chat panel integration design | HIGH | Design chat's position: persistent panel vs primary section vs floating |
| #21 | Empty state designs | HIGH | Compelling empty states that guide to chat |
| #22 | Journey progress bar | MEDIUM | [Discovery] → [Requirements] → [Technical] → [Validation] → [Export] |
| #23 | First-run experience | HIGH | What new project owners see first |
| #24 | Mobile chat+explorer patterns | MEDIUM | Gesture patterns, bottom nav, tab approach |

**Wave 0 Output:** Design specs and wireframes before building components.

### Wave 1: Core Components

| Task ID | Name | Description | Estimate |
|---------|------|-------------|----------|
| #5 | Define explorer tree structure data | TypeScript types including chat section | S |
| #3 | Create ExplorerTreeItem component | Tree node with expand/collapse, icons, counts | S |
| #4 | Create ExplorerSection component | Section wrapper with completion badge | S |
| #2 | Create ProjectExplorer component shell | Main sidebar with chat prominence | M |

**Dependencies:** #5 → #3, #4 → #2

### Wave 2: Section Content Views

| Task ID | Name | Description | Estimate |
|---------|------|-------------|----------|
| #6 | Overview section | Completion score, stats, next steps, journey bar | M |
| #7 | Product Requirements sections | Problem, Actors, Use Cases with empty states | M |
| #8 | Technical Specifications sections | Tech Stack, Schema, API with empty states | M |
| #9 | Architecture section | Diagram previews with empty states | M |
| #10 | User Stories section | Backlog mini-list with empty state | S |
| #11 | Validation section (PRD-SPEC) | Score, gates, recommendations | S |
| #12 | Coding Guidelines section | Conventions summary | S |
| #13 | Connections section (MCP) | Status, integrations, API key | S |

**All include empty states that CTA to chat.**

### Wave 3: Integration

| Task ID | Name | Description | Estimate |
|---------|------|-------------|----------|
| #14 | Integrate into project layout | Sidebar + chat panel positioning | M |
| #15 | URL-based section navigation | Route updates, deep linking | M |
| #16 | Data fetching and loading states | SWR hooks, skeletons | M |
| #17 | Section completion indicators | Calculate status from data | S |
| #18 | Inline editing capability | Double-click edit, optimistic updates | M |
| #19 | Unit tests | Tests for all components | M |

---

## Chat Integration Options

### Option A: Persistent Right Panel (Recommended)
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
├──────────┬────────────────────────┬─────────────────┤
│ Explorer │    Content Area        │   Chat Panel    │
│ (256px)  │                        │   (400px)       │
│          │                        │                 │
│ 💬 Chat  │                        │   [Messages]    │
│ 📊 Over  │   [Section Content]    │                 │
│ 📋 Reqs  │                        │   [Input...]    │
│ ...      │                        │                 │
└──────────┴────────────────────────┴─────────────────┘
```
- Chat always visible
- Explorer selects what content to show
- Chat contextually aware of current section

### Option B: Chat as Primary Section
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
├──────────┬──────────────────────────────────────────┤
│ Explorer │    Content Area (full width)              │
│ (256px)  │                                          │
│          │   When "Chat & Discovery" selected:      │
│ 💬 Chat◄─│   [Full Chat Interface]                  │
│ 📊 Over  │                                          │
│ 📋 Reqs  │   When other section selected:           │
│ ...      │   [Section Content]                      │
└──────────┴──────────────────────────────────────────┘
```
- Chat is first/default section
- More content space when not chatting
- Requires section switching

### Option C: Floating Chat (Not Recommended)
- Overlays content
- Can feel intrusive
- Hard to reference content while chatting

**Decision Needed:** Which option best serves the conversational extraction workflow?

---

## Empty State Design Pattern

Each section follows this pattern:

```tsx
<EmptyState
  icon={<ActorsIcon />}
  title="No actors discovered yet"
  description="Start a conversation to identify who will use your product"
  progress="0/5 actors identified"
  cta={{
    label: "Continue Discovery",
    action: () => focusChat("Let's identify who will use this product")
  }}
/>
```

Key principles:
- Encouraging, not discouraging
- Clear CTA to chat
- Progress hint showing what's expected
- Context-aware prompts

---

## Journey Progress Component

```tsx
<JourneyProgress
  stages={[
    { id: 'discovery', label: 'Discovery', status: 'complete' },
    { id: 'requirements', label: 'Requirements', status: 'current' },
    { id: 'technical', label: 'Technical', status: 'pending' },
    { id: 'validation', label: 'Validation', status: 'pending' },
    { id: 'export', label: 'Export Ready', status: 'pending' },
  ]}
  overallPercentage={42}
/>
```

Visual:
```
[Discovery] → [Requirements] → [Technical] → [Validation] → [Export Ready]
     ✓             ●               ○              ○              ○
                         42% Complete
```

---

## Mobile Design (Specific Patterns)

### Layout
```
┌─────────────────────┐
│ Header + Progress   │
├─────────────────────┤
│                     │
│   Content Area      │
│   (swipeable)       │
│                     │
├─────────────────────┤
│ [Explorer] [Chat]   │  ← Bottom tab bar
└─────────────────────┘
```

### Interactions
- **Bottom tabs:** Explorer | Chat (always visible)
- **Swipe:** Left/right between explorer and content
- **Chat input:** Fixed at bottom when in chat tab
- **Section switch:** Tap explorer item → shows content → can swipe to chat

### Gestures
- Swipe right on content → reveal explorer
- Swipe left on explorer → show content
- Pull down on chat → conversation history
- Long press section → quick actions

---

## First-Run Experience

When opening a brand new project:

```tsx
<FirstRunOverlay>
  <WelcomeMessage>
    "Let's build your PRD together"
  </WelcomeMessage>

  <WhatYoullGet>
    ✓ Product requirements
    ✓ Technical specifications
    ✓ Architecture diagrams
    ✓ User stories backlog
    ✓ MCP server for Claude Code
  </WhatYoullGet>

  <StartButton onClick={openChat}>
    "Start Discovery Conversation"
  </StartButton>

  <SkipLink>
    "I'll explore on my own"
  </SkipLink>
</FirstRunOverlay>
```

---

## File Structure (Revised)

```
components/projects/
├── project-explorer.tsx           # Main sidebar container
├── explorer-tree-item.tsx         # Reusable tree node
├── explorer-section.tsx           # Section wrapper
├── explorer-types.ts              # TypeScript types
├── chat-panel.tsx                 # Persistent chat (Option A)
├── journey-progress.tsx           # Stage progress bar
├── empty-state.tsx                # Reusable empty state
├── first-run-overlay.tsx          # New project welcome
└── sections/
    ├── chat-section.tsx           # Chat & Discovery
    ├── overview-section.tsx
    ├── requirements-section.tsx
    ├── tech-specs-section.tsx
    ├── architecture-section.tsx
    ├── stories-section.tsx
    ├── validation-section.tsx
    ├── guidelines-section.tsx
    └── connections-section.tsx

components/onboarding/
├── onboarding-flow.tsx            # First-time user flow
├── role-selector.tsx
├── workspace-setup.tsx
└── project-creation-enhanced.tsx  # Better create modal
```

---

## Success Criteria (Revised)

### Must Have
- [ ] Chat prominently positioned (not hidden)
- [ ] Empty states guide users to chat
- [ ] Journey progress visible
- [ ] First-run experience for new projects
- [ ] Mobile-specific interaction patterns
- [ ] Post-login redirects to /projects

### Should Have
- [ ] Onboarding flow for new users
- [ ] Enhanced project creation
- [ ] Social sign-in (Google, GitHub)
- [ ] User type selection (Individual/Company)
- [ ] Role-based onboarding
- [ ] Section completion indicators
- [ ] URL-based navigation

### Could Have
- [ ] Inline editing
- [ ] Keyboard shortcuts
- [ ] Drag to reorder sections

---

## Execution Order

```
Phase 11.5 (Pre-requisite) - 3 tasks
├── #25 Fix post-login redirect
├── #26 Onboarding flow
└── #27 Enhanced project creation

Phase 11.6 (Authentication Improvements) - 7 tasks
├── #34 Database schema updates (foundation)
├── #28 Social sign-in integration (backend)
├── #29 User type selection UI
├── #30 Role selector component
├── #31 Sign-up form flow
├── #32 Sign-in page redesign
└── #33 Workspace name validation

Phase 12 Wave 0 (UX Foundation) - 5 tasks
├── #20 Chat panel integration design
├── #21 Empty state designs
├── #22 Journey progress bar
├── #23 First-run experience
└── #24 Mobile chat+explorer patterns

Phase 12 Wave 1 (Core Components) - 4 tasks
├── #5 Tree structure types
├── #3 ExplorerTreeItem
├── #4 ExplorerSection
└── #2 ProjectExplorer shell

Phase 12 Wave 2 (Section Views) - 8 tasks (parallel)
├── #6-#13 All section content views

Phase 12 Wave 3 (Integration) - 6 tasks
├── #14-#19 Layout, navigation, testing
```

---

## Agent Assignment

| Phase/Wave | Agent | Tasks |
|------------|-------|-------|
| 11.5 | devops-engineer | #25 |
| 11.5 | ui-ux-engineer | #26, #27 |
| 11.6 | backend-engineer | #28, #33, #34 |
| 11.6 | ui-ux-engineer | #29, #30, #31, #32 |
| 12 Wave 0 | ui-ux-engineer | #20-#24 (design specs) |
| 12 Wave 1-3 | ui-ux-engineer | #2-#19 |

---

*Plan revised: 2026-01-25*
*Incorporates: Chat prominence, empty states, journey tracking, first impressions, mobile patterns, authentication improvements*

---

## Related Documentation

- **Frontend V2 Proposal**: See `.planning/PROJECT-PROPOSAL-FRONTEND-V2.md` for overall frontend redesign context
- **Epic.dev Reference**: See `upgrade v2/epic.dev - sign-in:up/` for sign-in/sign-up design inspiration
