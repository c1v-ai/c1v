# Product Helper Frontend V2 - Project Proposal

> **Status**: Draft
> **Created**: 2025-01-25
> **Owner**: UI/UX + Frontend Teams
> **Priority**: High - Blocking backend MCP integration

---

## Executive Summary

This proposal outlines the frontend overhaul for Product Helper to align with the Epic.dev-inspired UI/UX discovered in the `upgrade v2` specifications. The goal is to transform the current basic interface into a polished, professional PRD generation platform.

### Current State vs Target State

| Aspect | Current State | Target State (v2) |
|--------|---------------|-------------------|
| Theme | Light/basic | Dark theme with teal/orange accents |
| Onboarding | Minimal | Multi-step wizard (role, workspace) |
| Project Creation | Simple form | Rich modal with project type, stage, context |
| Chat UI | Basic | Polished conversational AI interface |
| Data Display | Tables | Collapsible sidebar with live extraction |
| Diagrams | Static | Interactive viewer (zoom, export SVG/PNG) |
| Navigation | Basic tabs | Sidebar + top tabs + breadcrumbs |
| Team Features | None | Subscription, members, invites |

---

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: AUTHENTICATION & ONBOARDING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Landing Page → Sign Up → Select User Type → Select Role        │
│       │              │           │                │             │
│       ▼              ▼           ▼                ▼             │
│  "Welcome to    Email/Pass   Individual     Product Manager    │
│   EPIC"         or OAuth     or Company     Engineer, etc.      │
│                                  │                              │
│                                  ▼                              │
│                          Create Workspace                       │
│                          "My Workspace"                         │
│                                  │                              │
│                                  ▼                              │
│                          Complete Setup                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: PROJECTS DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Sidebar          │ Main Content                         │   │
│  │                  │                                       │   │
│  │ 🏠 Home          │  Projects                             │   │
│  │ 📁 Projects ←    │  ┌─────┐ ┌─────┐ ┌─────┐             │   │
│  │ 💬 Chat          │  │Proj1│ │Proj2│ │ + New│             │   │
│  │                  │  └─────┘ └─────┘ └─────┘             │   │
│  │ Team Settings    │                                       │   │
│  │ ├ Subscription   │                                       │   │
│  │ ├ Members        │                                       │   │
│  │ └ Invite         │                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Click "+ New Project")
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: CREATE PROJECT MODAL                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Create New Project                              [X] │      │
│  │                                                       │      │
│  │  Project Name *                                       │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │ Task Management App                           │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │                                                       │      │
│  │  Project Type *              Project Stage            │      │
│  │  ┌──────────────────┐       ┌──────────────────┐     │      │
│  │  │ Web Application ▼│       │ Planning       ▼│     │      │
│  │  └──────────────────┘       └──────────────────┘     │      │
│  │                                                       │      │
│  │  ▼ Additional Context (optional)                      │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │ Budget Range    │ Team Size   │ Company Size │   │      │
│  │  │ $10k-50k     ▼ │ 2-5       ▼│ Startup    ▼│   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │                                                       │      │
│  │  Technical Constraints                                │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │ Must integrate with existing Postgres DB...   │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │                                                       │      │
│  │              [Cancel]  [Create Project]               │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: PROJECT WORKSPACE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ← Back to Projects    Task Management App    [intake]   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Overview │ Chat │ Data │ Diagrams │ Settings            │   │
│  ├──────────┴──────┴──────┴──────────┴─────────────────────┤   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌────────────────────────────────┐    │   │
│  │  │ Sidebar     │  │ Main Content (Overview)        │    │   │
│  │  │             │  │                                │    │   │
│  │  │ 73%         │  │ Vision Statement               │    │   │
│  │  │ ████████░░░│  │ ┌────────────────────────────┐ │    │   │
│  │  │ Completeness│  │ │ Build a task management   │ │    │   │
│  │  │             │  │ │ app for small teams...    │ │    │   │
│  │  │ ▼ Actors (3)│  │ └────────────────────────────┘ │    │   │
│  │  │  • Customer │  │                                │    │   │
│  │  │  • Admin    │  │ Quick Actions                  │    │   │
│  │  │  • System   │  │ ┌────────┐ ┌────────┐         │    │   │
│  │  │             │  │ │Start   │ │View    │         │    │   │
│  │  │ ▼ Use Cases │  │ │Chat    │ │Data    │         │    │   │
│  │  │   (8)       │  │ └────────┘ └────────┘         │    │   │
│  │  │  • UC1      │  │ ┌────────┐ ┌────────┐         │    │   │
│  │  │  • UC2      │  │ │View    │ │Export  │         │    │   │
│  │  │  • ...      │  │ │Diagrams│ │PRD     │         │    │   │
│  │  │             │  │ └────────┘ └────────┘         │    │   │
│  │  │ ▼ Entities  │  │                                │    │   │
│  │  │   (4)       │  │ Statistics                     │    │   │
│  │  │  • User     │  │ ┌───────┬───────┬───────┐     │    │   │
│  │  │  • Task     │  │ │  23   │   5   │  8/10 │     │    │   │
│  │  │  • Project  │  │ │ Msgs  │Artifacts│Checks│     │    │   │
│  │  │             │  │ └───────┴───────┴───────┘     │    │   │
│  │  │ ▼ Diagrams  │  │                                │    │   │
│  │  │   (2)       │  │                                │    │   │
│  │  └─────────────┘  └────────────────────────────────┘    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Click "Start Chat")
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: CONVERSATIONAL INTAKE (Chat Tab)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Chat                                                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ 🤖 AI                                               │ │   │
│  │  │                                                      │ │   │
│  │  │ Welcome to your project! I'll help you define      │ │   │
│  │  │ requirements through conversation.                  │ │   │
│  │  │                                                      │ │   │
│  │  │ We'll identify:                                      │ │   │
│  │  │ • Actors - who uses the system                      │ │   │
│  │  │ • Use Cases - what they can do                      │ │   │
│  │  │ • Boundaries - what's in/out of scope               │ │   │
│  │  │ • Entities - what data matters                      │ │   │
│  │  │                                                      │ │   │
│  │  │ Let's start: Who are the main users of your app?    │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ 👤 You                                              │ │   │
│  │  │                                                      │ │   │
│  │  │ The main users are team members who need to         │ │   │
│  │  │ manage their tasks, and team leads who need to      │ │   │
│  │  │ assign and track work across the team.              │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ 🤖 AI                                               │ │   │
│  │  │                                                      │ │   │
│  │  │ I've identified 2 actors:                           │ │   │
│  │  │ ✅ Team Member - manages their own tasks            │ │   │
│  │  │ ✅ Team Lead - assigns and tracks team work         │ │   │
│  │  │                                                      │ │   │
│  │  │ Are there any external systems this needs to        │ │   │
│  │  │ integrate with? (Slack, email, calendar, etc.)      │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Type your message...                          [Send]│ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Note: Sidebar updates in real-time as entities are extracted  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Click "View Diagrams")
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 6: DIAGRAM VIEWER                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Sequence Diagram                                    [X] │  │
│  │                                                           │  │
│  │  [Zoom: 100%] [+] [-] [⛶ Fullscreen] [↓ SVG] [↓ PNG]    │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │                                                    │   │  │
│  │  │   Team Member        System         Team Lead     │   │  │
│  │  │       │                 │               │         │   │  │
│  │  │       │──Create Task──▶│               │         │   │  │
│  │  │       │                 │               │         │   │  │
│  │  │       │◀──Confirm─────│               │         │   │  │
│  │  │       │                 │               │         │   │  │
│  │  │       │                 │◀─View Tasks──│         │   │  │
│  │  │       │                 │               │         │   │  │
│  │  │       │                 │──Task List──▶│         │   │  │
│  │  │       │                 │               │         │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Design System Specification

### Color Palette

```css
/* Primary Colors */
--color-bg-primary: #0f0f1a;        /* Dark navy background */
--color-bg-secondary: #1a1a2e;      /* Card backgrounds */
--color-bg-tertiary: #252540;       /* Input backgrounds */

/* Accent Colors */
--color-teal: #0d7377;              /* Primary buttons */
--color-teal-hover: #14919b;        /* Button hover */
--color-orange: #ff6d35;            /* CTA, important actions */
--color-purple: #8b7dd9;            /* Secondary actions */

/* Text Colors */
--color-text-primary: #ffffff;      /* Headings */
--color-text-secondary: #b4b4c7;    /* Body text */
--color-text-muted: #6b6b80;        /* Placeholders */

/* Status Colors */
--color-success: #10b981;           /* Passed, complete */
--color-warning: #f59e0b;           /* In progress */
--color-error: #ef4444;             /* Failed, error */
--color-info: #3b82f6;              /* Informational */

/* Border Colors */
--color-border: #2a2a40;            /* Default borders */
--color-border-focus: #0d7377;      /* Focus state */
```

### Typography

```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Component Specifications

#### Buttons

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| Primary | `--color-teal` | white | none | Main actions |
| Secondary | transparent | `--color-teal` | `--color-teal` | Secondary actions |
| Danger | `--color-error` | white | none | Delete, destructive |
| Ghost | transparent | `--color-text-secondary` | none | Subtle actions |
| CTA | `--color-orange` | white | none | Important CTAs |

#### Form Inputs

```
┌─────────────────────────────────────────┐
│ Label                                   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Placeholder text...                 │ │
│ └─────────────────────────────────────┘ │
│ Helper text or error message            │
└─────────────────────────────────────────┘

States:
- Default: border-color: --color-border
- Focus: border-color: --color-teal, ring
- Error: border-color: --color-error
- Disabled: opacity: 0.5
```

#### Cards

```
┌─────────────────────────────────────────┐
│ Card Title                        [⋮]  │
├─────────────────────────────────────────┤
│                                         │
│ Card content goes here                  │
│                                         │
└─────────────────────────────────────────┘

Specs:
- Background: --color-bg-secondary
- Border: 1px solid --color-border
- Border-radius: 12px
- Padding: 20px
- Shadow: 0 4px 6px rgba(0,0,0,0.3)
```

---

## Component Architecture

### Page Components

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + main layout
│   │   ├── page.tsx                # Home/Team settings
│   │   ├── projects/
│   │   │   ├── page.tsx            # Projects list
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx        # Overview tab
│   │   │       ├── chat/page.tsx   # Chat tab
│   │   │       ├── data/page.tsx   # Data tab
│   │   │       ├── diagrams/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── chat/page.tsx           # Global chat
│   └── api/
│       └── ...
├── components/
│   ├── ui/                         # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── modal.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── collapsible.tsx
│   │   └── tabs.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── top-nav.tsx
│   │   ├── breadcrumb.tsx
│   │   └── project-tabs.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── create-project-modal.tsx
│   │   ├── project-header.tsx
│   │   ├── project-sidebar.tsx
│   │   ├── quick-actions.tsx
│   │   └── statistics-cards.tsx
│   ├── chat/
│   │   ├── chat-container.tsx
│   │   ├── message-bubble.tsx
│   │   ├── chat-input.tsx
│   │   ├── welcome-message.tsx
│   │   └── typing-indicator.tsx
│   ├── data/
│   │   ├── actors-list.tsx
│   │   ├── use-cases-list.tsx
│   │   ├── entities-list.tsx
│   │   └── entity-detail.tsx
│   ├── diagrams/
│   │   ├── diagram-viewer.tsx
│   │   ├── diagram-controls.tsx
│   │   ├── mermaid-renderer.tsx
│   │   └── export-buttons.tsx
│   └── team/
│       ├── team-members.tsx
│       ├── invite-modal.tsx
│       └── subscription-card.tsx
└── lib/
    ├── hooks/
    │   ├── useProject.ts
    │   ├── useChat.ts
    │   └── useDiagrams.ts
    └── stores/
        ├── project-store.ts
        └── ui-store.ts
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up dark theme design system (colors, typography)
- [ ] Create base UI components (Button, Input, Card, Modal)
- [ ] Implement layout components (Sidebar, TopNav)
- [ ] Build authentication pages (Login, Signup)

### Phase 2: Onboarding Flow (Week 1-2)
- [ ] Multi-step onboarding wizard
- [ ] User type selection (Individual/Company)
- [ ] Role selection dropdown
- [ ] Workspace creation

### Phase 3: Projects Dashboard (Week 2)
- [ ] Projects list page with grid layout
- [ ] Project card component
- [ ] Create Project modal (full form)
- [ ] Project type/stage selectors

### Phase 4: Project Workspace (Week 2-3)
- [ ] Project layout with tabs
- [ ] Overview tab with Vision, Quick Actions, Statistics
- [ ] Project sidebar with collapsible sections
- [ ] Completeness progress bar

### Phase 5: Chat Interface (Week 3)
- [ ] Chat container with message history
- [ ] Message bubbles (user/AI styling)
- [ ] Chat input with send button
- [ ] Welcome message component
- [ ] Real-time sidebar updates

### Phase 6: Data Views (Week 3-4)
- [ ] Actors list with expand/collapse
- [ ] Use Cases list with details
- [ ] Data Entities list with relationships
- [ ] Entity detail view

### Phase 7: Diagrams (Week 4)
- [ ] Diagram viewer modal
- [ ] Mermaid renderer integration
- [ ] Zoom/pan controls
- [ ] Export (SVG/PNG) functionality

### Phase 8: Team Features (Week 4-5)
- [ ] Team settings page
- [ ] Team members list
- [ ] Invite member modal
- [ ] Subscription display

### Phase 9: Polish & Integration (Week 5)
- [ ] Animations and transitions
- [ ] Error states and loading skeletons
- [ ] Mobile responsiveness
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Success Criteria

### Functional Requirements
- [ ] Complete user journey from signup to PRD export
- [ ] Real-time entity extraction displayed in sidebar
- [ ] Interactive diagram viewing with export
- [ ] PRD-SPEC validation score displayed

### Non-Functional Requirements
- [ ] Page load < 2s (LCP)
- [ ] Time to interactive < 3s
- [ ] Accessibility score > 90 (Lighthouse)
- [ ] Mobile-responsive (down to 375px)

### User Experience Goals
- [ ] Intuitive onboarding (< 2 min to first project)
- [ ] Clear visual feedback for AI extraction
- [ ] Professional, polished appearance matching Epic.dev quality

---

## Dependencies

### Backend APIs Required
1. `POST /api/projects` - Create project with full context
2. `GET /api/projects/:id` - Project with nested data
3. `POST /api/chat/projects/:id` - Chat with streaming response
4. `GET /api/projects/:id/diagrams` - Generated diagrams
5. `GET /api/projects/:id/export` - Export PRD

### External Libraries
- `@radix-ui/react-*` - Accessible primitives
- `framer-motion` - Animations
- `mermaid` - Diagram rendering
- `zustand` - State management
- `react-hot-toast` - Notifications

---

## Next Steps

1. **Approve this proposal** - Confirm scope and timeline
2. **Set up design system** - Create Figma/Storybook with components
3. **Scaffold pages** - Create route structure with placeholders
4. **Build Phase 1** - Foundation components
5. **Weekly demos** - Review progress each phase

---

## Appendix: Project Type Options

| Value | Label |
|-------|-------|
| `web_app` | Web Application |
| `mobile_ios` | Mobile App (iOS) |
| `mobile_android` | Mobile App (Android) |
| `desktop` | Desktop Application |
| `hybrid` | Hybrid App (Web + Mobile) |
| `pwa` | Progressive Web App (PWA) |
| `api` | API / Backend Service |
| `cli` | CLI Tool |
| `extension` | Browser Extension |
| `smart_tv` | Smart TV / OTT App |
| `embedded` | Embedded / IoT |
| `other` | Other |

## Appendix: Project Stage Options

| Value | Label |
|-------|-------|
| `idea` | Idea / Concept |
| `planning` | Planning |
| `design` | Design |
| `development` | Development |
| `testing` | Testing |
| `launch` | Launch |
| `maintenance` | Maintenance |
