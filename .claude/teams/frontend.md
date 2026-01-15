---
team_name: frontend
team_id: 2
color: "#8B5CF6"
color_name: purple
icon: "🎨"
enabled: true

global_mcps:
  - filesystem
  - github
  - ralph-wiggum
  - sequential-thinking

team_mcps:
  - vercel
  - puppeteer
  - cursor-ide-browser
  - front-end-plugin

global_plugins:
  - git-commit-smart
  - code-reviewer
  - overnight-dev

team_plugins:
  - frontend-skills

team_skills:
  - react-best-practices  # Vercel's 40+ React/Next.js performance rules

agents:
  - id: "2.1"
    name: ui-ux-engineer
    role: UI/UX Engineer
    mcps: [figma, lighthouse]
    plugins: [accessibility-auditor, component-documenter]
  - id: "2.2"
    name: chat-engineer
    role: Chat Engineer
    mcps: [websocket-tools, vercel-ai-sdk]
    plugins: [api-development-pack]
  - id: "2.3"
    name: data-viz-engineer
    role: Data Visualization Engineer
    mcps: [mermaid, d3-tools]
    plugins: [mermaid-diagram-generator]
---

# 🎨 Frontend Team

![Team Color](https://img.shields.io/badge/team-frontend-8B5CF6?style=flat-square)

**Version:** 1.0.0
**Last Updated:** 2026-01-12
**Team Size:** 3 Agents

---

## MCP Configuration

### Global MCPs (Always Loaded)
- `filesystem` - File operations
- `github` - Repository management
- `ralph-wiggum` - Autonomous loop execution
- `sequential-thinking` - Multi-step reasoning

### Team MCPs (Deferred)
- `vercel` - Deployment, preview URLs
- `puppeteer` - Browser automation, screenshots
- `cursor-ide-browser` - Web interaction, frontend testing
- `front-end-plugin` - Frontend development utilities

### Agent-Specific MCPs

| Agent | MCPs |
|-------|------|
| 2.1 UI/UX Engineer | `figma`, `lighthouse` |
| 2.2 Chat Engineer | `websocket-tools`, `vercel-ai-sdk` |
| 2.3 Data Viz Engineer | `mermaid`, `d3-tools` |

---

## Tool Discovery

This team uses Claude's Tool Search for efficient context management.

**How it works:**
1. Core tools (filesystem, github, ralph-wiggum) are always available
2. Specialized tools are loaded on-demand via search
3. Use natural language to find tools: "I need to take a screenshot"

**Search tips:**
- Describe what you need: "deployment", "accessibility audit", "diagram generation"
- Tools are discovered from names AND descriptions

---

## Marketplace Plugins

**Source:** `jeremylongshore/claude-code-plugins-plus-skills` (v4.9.0)

### Global Plugins (All Teams)
- `git-commit-smart` - Intelligent commit messages
- `code-reviewer` - Automated code review
- `overnight-dev` - Async task execution

### Team Plugins
- `frontend-skills` - UI/UX improvements, responsive design, accessibility

### Team Skills (Agent Skills)
- `react-best-practices` - [Vercel's React Best Practices](https://github.com/vercel-labs/agent-skills) with 40+ performance rules across 8 categories:
  1. Eliminating async waterfalls (CRITICAL)
  2. Bundle size optimization (CRITICAL)
  3. Server-side performance (HIGH)
  4. Client-side data fetching (HIGH)
  5. Re-render optimization (MEDIUM)
  6. Rendering performance (MEDIUM)
  7. JavaScript performance (LOW)
  8. Advanced patterns (LOW)

**Skill file:** [@.claude/skills/react-best-practices.md](../skills/react-best-practices.md)

### Agent-Specific Plugins

| Agent | Plugins |
|-------|---------|
| 2.1 UI/UX Engineer | `accessibility-auditor`, `component-documenter` |
| 2.2 Chat Engineer | `api-development-pack` |
| 2.3 Data Viz Engineer | `mermaid-diagram-generator` |

**Installation:**
```bash
ccpi install frontend-skills accessibility-auditor component-documenter api-development-pack mermaid-diagram-generator
```

---

## Mission

The Frontend team owns the user experience, interface design, and client-side interactions for the C1V product-helper application. We create intuitive, accessible, and performant user interfaces that make PRD creation delightful.

**Core Responsibilities:**
- React component development (Next.js App Router + React 19)
- UI/UX design implementation with shadcn/ui
- Real-time chat interface with streaming AI responses
- Data visualization and diagram rendering
- Client-side state management and caching
- Accessibility (WCAG 2.1 AA compliance)
- Frontend performance optimization
- Component testing with React Testing Library

---

## Agents

### Agent 2.1: UI/UX Engineer

**Primary Role:** Design and implement user interfaces, component library, and layouts

**Primary Responsibilities:**
- Implement shadcn/ui components and create custom variants
- Design and build responsive layouts (mobile-first)
- Ensure accessibility compliance (WCAG 2.1 AA)
- Implement design system and component library
- Create reusable form components with validation
- Build navigation, authentication flows, and onboarding
- Optimize UI performance (lazy loading, code splitting)
- Write component tests with React Testing Library

**Tech Stack:**
- **Framework:** Next.js 15 (App Router), React 19 (RSC + Client Components)
- **Styling:** Tailwind CSS 4.0, CSS Modules, shadcn/ui components
- **Forms:** React Hook Form 7.53, Zod validation
- **State:** React hooks (useState, useContext), SWR for data fetching
- **Icons:** Lucide React
- **Animations:** Framer Motion (optional)
- **Testing:** Vitest, React Testing Library, Playwright

**Required MCPs:**
- `filesystem` - Reading/writing component files
- `github` - Managing PRs, code review
- `puppeteer` - Visual regression testing, accessibility audits
- `memory` - Remembering design patterns and component APIs

**Key Files & Directories:**
```
apps/product-helper/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx             # Sign in page
│   │   └── sign-up/
│   │       └── page.tsx             # Sign up page
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard home
│   │   └── projects/
│   │       ├── page.tsx             # Projects list
│   │       ├── new/
│   │       │   └── page.tsx         # New project form
│   │       └── [id]/
│   │           ├── page.tsx         # Project detail page
│   │           └── edit/
│   │               └── page.tsx     # Edit project
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx               # App header
│   │   ├── sidebar.tsx              # Dashboard sidebar
│   │   ├── footer.tsx               # App footer
│   │   └── mobile-nav.tsx           # Mobile navigation
│   ├── projects/
│   │   ├── project-card.tsx         # Project list card
│   │   ├── project-form.tsx         # Create/edit project form
│   │   ├── project-header.tsx       # Project detail header
│   │   └── project-status-badge.tsx # Status indicator
│   ├── forms/
│   │   ├── controlled-input.tsx     # Reusable form input
│   │   ├── controlled-textarea.tsx  # Reusable textarea
│   │   └── form-error.tsx           # Error message display
│   └── providers/
│       ├── theme-provider.tsx       # Dark mode provider
│       └── toast-provider.tsx       # Toast notifications
└── __tests__/
    └── components/
        ├── project-card.test.tsx    # Component tests
        └── project-form.test.tsx
```

**Component Development Patterns:**
```typescript
// ✅ GOOD: Server Component for data fetching
// app/(dashboard)/projects/page.tsx
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProjectsPage() {
  const user = await auth();
  if (!user) redirect('/sign-in');

  const userProjects = await db.query.projects.findMany({
    where: eq(projects.teamId, user.teamId),
    orderBy: desc(projects.createdAt),
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button asChild>
          <Link href="/projects/new">New Project</Link>
        </Button>
      </div>

      {userProjects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
```

```typescript
// ✅ GOOD: Client Component with form validation
// components/projects/project-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  vision: z.string().min(10, 'Vision must be at least 10 characters').max(5000),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormData>;
  projectId?: number;
  onSuccess?: () => void;
}

export function ProjectForm({ defaultValues, projectId, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
      const method = projectId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const project = await response.json();
      onSuccess?.();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error saving project:', error);
      // TODO: Show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="My Awesome Product"
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vision">Vision Statement</Label>
        <Textarea
          id="vision"
          {...register('vision')}
          placeholder="Describe your product vision..."
          rows={6}
          aria-invalid={errors.vision ? 'true' : 'false'}
        />
        {errors.vision && (
          <p className="text-sm text-destructive" role="alert">
            {errors.vision.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : projectId ? 'Update Project' : 'Create Project'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

```typescript
// ✅ GOOD: Reusable card component
// components/projects/project-card.tsx
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Project } from '@/lib/db/schema';

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  validation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            <Badge className={statusColors[project.status]}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {project.vision}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Score: {project.validationScore}%</span>
            <span>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Accessibility Best Practices:**
```typescript
// ✅ GOOD: Accessible modal dialog
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function AccessibleDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn">Open Dialog</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg"
          aria-describedby="dialog-description"
        >
          <Dialog.Title className="text-lg font-semibold">
            Dialog Title
          </Dialog.Title>
          <Dialog.Description id="dialog-description" className="text-sm text-gray-600 mt-2">
            Dialog description for screen readers
          </Dialog.Description>
          <div className="mt-4">{children}</div>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Anti-Patterns to Avoid:**
❌ Mixing server and client components incorrectly (use 'use client' directive)
❌ Inline styles instead of Tailwind classes
❌ Missing alt text for images
❌ No keyboard navigation support
❌ Using `<div>` for interactive elements (use `<button>`)
❌ Missing loading and error states
❌ Not memoizing expensive computations (use React.memo, useMemo)
❌ Accessibility violations (missing labels, low contrast)

**Documentation Duties:**
- Document component APIs with JSDoc comments (props, usage examples)
- Create Storybook stories for reusable components (future)
- Update design system documentation when adding new variants
- Document accessibility features and keyboard shortcuts
- Maintain component test coverage

**Testing Requirements:**
- **Unit tests:** All reusable components (85% coverage)
- **Accessibility tests:** Automated checks with axe-core
- **Visual regression tests:** Playwright screenshots for critical pages
- Test keyboard navigation and screen reader announcements
- Test responsive behavior (mobile, tablet, desktop)

**Handoff Points:**
- **Receives from:**
  - Product Planning: UI/UX requirements, wireframes
  - Backend: API contracts, data types
  - Chat Engineer: Chat component integration requirements
- **Delivers to:**
  - Backend: API requirements, data fetching patterns
  - Chat Engineer: Layout and styling for chat interface
  - Data Viz Engineer: Container components for diagrams

---

### Agent 2.2: Chat Engineer

**Primary Role:** Implement real-time conversational interface with AI streaming

**Primary Responsibilities:**
- Build chat UI with message history and streaming responses
- Integrate Vercel AI SDK for streaming LLM responses
- Implement message state management and optimistic updates
- Handle chat interruptions, cancellations, and retries
- Build conversational intake flow for PRD data collection
- Implement chat persistence and session management
- Add code syntax highlighting and markdown rendering
- Write integration tests for chat flows

**Tech Stack:**
- **AI SDK:** Vercel AI SDK 3.1 (useChat hook, streaming)
- **Markdown:** react-markdown, remark-gfm
- **Code Highlighting:** Prism.js or Shiki
- **State Management:** SWR for message history
- **WebSockets:** Server-Sent Events (SSE) for streaming
- **Testing:** Vitest, Playwright for E2E chat tests

**Required MCPs:**
- `filesystem` - Reading/writing chat components
- `github` - Managing PRs
- `memory` - Chat session context
- `sequential-thinking` - Complex conversational flows

**Key Files & Directories:**
```
apps/product-helper/
├── app/
│   └── (dashboard)/
│       └── projects/
│           └── [id]/
│               └── chat/
│                   └── page.tsx      # Chat interface page
├── components/
│   └── chat/
│       ├── chat-interface.tsx        # Main chat container
│       ├── chat-messages.tsx         # Message list
│       ├── chat-message.tsx          # Single message
│       ├── chat-input.tsx            # Message input with send button
│       ├── chat-loading.tsx          # Loading indicator
│       ├── message-actions.tsx       # Copy, retry, feedback
│       └── markdown-renderer.tsx     # Markdown + code highlighting
├── app/api/
│   └── chat/
│       └── route.ts                  # Chat streaming endpoint
└── __tests__/
    ├── components/
    │   └── chat/
    │       └── chat-interface.test.tsx
    └── e2e/
        └── chat-flow.spec.ts         # E2E chat tests
```

**Chat Interface Implementation:**
```typescript
// ✅ GOOD: Chat interface with streaming
// components/chat/chat-interface.tsx
'use client';

import { useChat } from 'ai/react';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ChatLoading } from './chat-loading';
import { useEffect, useRef } from 'react';

interface ChatInterfaceProps {
  projectId: number;
  initialMessages?: Message[];
}

export function ChatInterface({ projectId, initialMessages = [] }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/chat',
    body: {
      projectId,
    },
    initialMessages,
    onFinish: (message) => {
      // Optional: Trigger data extraction after AI response
      console.log('Message finished:', message);
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatMessages
          messages={messages}
          onRetry={reload}
        />
        {isLoading && <ChatLoading />}
        {error && (
          <div className="text-destructive text-sm" role="alert">
            Error: {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
        />
      </div>
    </div>
  );
}
```

```typescript
// ✅ GOOD: Message component with markdown rendering
// components/chat/chat-message.tsx
'use client';

import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { MarkdownRenderer } from './markdown-renderer';
import { MessageActions } from './message-actions';
import type { Message } from 'ai';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-muted ml-auto max-w-[80%]' : 'bg-background'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <span className="text-xs">AI</span>
        </Avatar>
      )}

      <div className="flex-1 space-y-2">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer content={message.content} />
        </div>

        {!isUser && (
          <MessageActions
            message={message}
            onRetry={onRetry}
          />
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <span className="text-xs">You</span>
        </Avatar>
      )}
    </div>
  );
}
```

```typescript
// ✅ GOOD: Streaming chat API route
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { conversations, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const user = await auth();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, projectId } = await req.json();

    // Verify project access
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project || project.teamId !== user.teamId) {
      return new Response('Forbidden', { status: 403 });
    }

    // Build system prompt with project context
    const systemPrompt = `You are a helpful AI assistant helping a product manager create a Product Requirements Document (PRD).

Project: ${project.name}
Vision: ${project.vision}

Your goal is to ask clarifying questions to extract:
- Actors (users, systems)
- Use cases
- System boundaries
- Data entities and relationships

Ask one question at a time. Be conversational and friendly.`;

    // Stream response
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: async ({ text, usage }) => {
        // Save conversation to database
        await db.insert(conversations).values({
          projectId,
          role: 'assistant',
          content: text,
          tokens: usage.totalTokens,
          createdAt: new Date(),
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

**Anti-Patterns to Avoid:**
❌ Not handling streaming errors gracefully
❌ No loading indicators during AI generation
❌ Missing cancel/stop button for long responses
❌ Not persisting chat history to database
❌ No retry mechanism for failed messages
❌ Blocking UI during message submission
❌ Not sanitizing user input before displaying

**Documentation Duties:**
- Document chat component APIs and props
- Create user guide for chat features (markdown support, commands)
- Document chat state management patterns
- Maintain examples of conversational flows
- Document error handling and edge cases

**Testing Requirements:**
- **Unit tests:** Chat components (message rendering, input handling)
- **Integration tests:** Chat API endpoints with mocked LLM
- **E2E tests:** Full chat flow from user input to AI response
- Test streaming behavior (partial messages, cancellation)
- Test message persistence and history loading

**Handoff Points:**
- **Receives from:**
  - Backend: Chat API endpoints, message schemas
  - AI/Agent team: Prompt templates, agent workflows
  - UI/UX Engineer: Layout and styling requirements
- **Delivers to:**
  - AI/Agent team: User messages and conversation context
  - Data Viz Engineer: Extracted data for diagram generation
  - Backend: Chat session management requirements

---

### Agent 2.3: Data Visualization Engineer

**Primary Role:** Render PRD diagrams and enable interactive visualizations

**Primary Responsibilities:**
- Implement diagram rendering for UML diagrams (context, use case, class, sequence, activity)
- Build interactive diagram viewers with zoom, pan, and navigation
- Export diagrams to multiple formats (PNG, SVG, PDF)
- Integrate Mermaid.js or similar for diagram generation
- Build diagram editor for manual adjustments (future)
- Optimize diagram rendering performance
- Implement responsive diagram layouts
- Write visual regression tests

**Tech Stack:**
- **Diagrams:** Mermaid.js, D3.js, or PlantUML
- **Canvas:** HTML Canvas API or SVG
- **Export:** html2canvas, jsPDF
- **Interactions:** Zoom/pan libraries (panzoom, d3-zoom)
- **Rendering:** Server-side diagram generation (Puppeteer)
- **Testing:** Playwright for visual regression

**Required MCPs:**
- `filesystem` - Reading/writing diagram components
- `puppeteer` - Server-side diagram rendering
- `github` - Managing PRs

**Key Files & Directories:**
```
apps/product-helper/
├── components/
│   └── diagrams/
│       ├── diagram-viewer.tsx        # Main diagram viewer
│       ├── diagram-toolbar.tsx       # Zoom, pan, export controls
│       ├── diagram-renderer.tsx      # Mermaid/D3 renderer
│       ├── context-diagram.tsx       # Context diagram specific
│       ├── use-case-diagram.tsx      # Use case diagram
│       ├── class-diagram.tsx         # Class diagram
│       ├── sequence-diagram.tsx      # Sequence diagram
│       ├── activity-diagram.tsx      # Activity diagram
│       └── diagram-export.tsx        # Export functionality
├── lib/
│   └── diagrams/
│       ├── mermaid-config.ts         # Mermaid configuration
│       ├── diagram-generator.ts      # Generate diagram syntax from data
│       └── diagram-exporter.ts       # Export to PNG/SVG/PDF
├── app/api/
│   └── diagrams/
│       └── export/
│           └── route.ts              # Server-side export endpoint
└── __tests__/
    └── components/
        └── diagrams/
            └── diagram-viewer.test.tsx
```

**Diagram Rendering Implementation:**
```typescript
// ✅ GOOD: Mermaid diagram renderer
// components/diagrams/diagram-renderer.tsx
'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramRendererProps {
  syntax: string;
  type: 'context' | 'useCase' | 'class' | 'sequence' | 'activity';
  className?: string;
}

export function DiagramRenderer({ syntax, type, className }: DiagramRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });

    mermaid.render(`diagram-${type}`, syntax).then(({ svg }) => {
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    });
  }, [syntax, type]);

  return (
    <div
      ref={containerRef}
      className={cn('diagram-container', className)}
      role="img"
      aria-label={`${type} diagram`}
    />
  );
}
```

```typescript
// ✅ GOOD: Interactive diagram viewer with zoom
// components/diagrams/diagram-viewer.tsx
'use client';

import { useState } from 'react';
import { DiagramRenderer } from './diagram-renderer';
import { DiagramToolbar } from './diagram-toolbar';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface DiagramViewerProps {
  diagramId: number;
  type: string;
  syntax: string;
  imageUrl?: string;
}

export function DiagramViewer({ diagramId, type, syntax, imageUrl }: DiagramViewerProps) {
  const [scale, setScale] = useState(1);

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    const response = await fetch('/api/diagrams/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagramId,
        format,
        syntax,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram-${diagramId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <DiagramToolbar
        onZoomIn={() => setScale((s) => Math.min(s + 0.2, 3))}
        onZoomOut={() => setScale((s) => Math.max(s - 0.2, 0.5))}
        onReset={() => setScale(1)}
        onExport={handleExport}
        scale={scale}
      />

      <div className="bg-muted p-4 min-h-[400px]">
        <TransformWrapper
          initialScale={scale}
          minScale={0.5}
          maxScale={3}
          onTransformed={(ref) => setScale(ref.state.scale)}
        >
          <TransformComponent>
            <DiagramRenderer syntax={syntax} type={type} />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
```

```typescript
// ✅ GOOD: Generate Mermaid syntax from structured data
// lib/diagrams/diagram-generator.ts
interface Actor {
  name: string;
  role: string;
  description: string;
}

interface UseCase {
  id: string;
  name: string;
  actor: string;
  description: string;
}

export function generateUseCaseDiagram(actors: Actor[], useCases: UseCase[]): string {
  const lines: string[] = ['graph LR'];

  // Add actors
  actors.forEach((actor) => {
    lines.push(`  ${actor.name}["${actor.name}<br/>(${actor.role})"]:::actor`);
  });

  // Add use cases
  useCases.forEach((useCase) => {
    lines.push(`  ${useCase.id}("${useCase.name}"):::usecase`);
  });

  // Add connections
  useCases.forEach((useCase) => {
    lines.push(`  ${useCase.actor} --> ${useCase.id}`);
  });

  // Add styles
  lines.push('  classDef actor fill:#e3f2fd,stroke:#1976d2,stroke-width:2px');
  lines.push('  classDef usecase fill:#fff3e0,stroke:#f57c00,stroke-width:2px');

  return lines.join('\n');
}

export function generateContextDiagram(
  systemName: string,
  internalSystems: string[],
  externalSystems: string[]
): string {
  const lines: string[] = ['graph TB'];

  lines.push(`  System["${systemName}"]:::system`);

  internalSystems.forEach((sys, i) => {
    lines.push(`  Internal${i}["${sys}"]:::internal`);
    lines.push(`  System --> Internal${i}`);
  });

  externalSystems.forEach((sys, i) => {
    lines.push(`  External${i}["${sys}"]:::external`);
    lines.push(`  System -.-> External${i}`);
  });

  lines.push('  classDef system fill:#c8e6c9,stroke:#388e3c,stroke-width:3px');
  lines.push('  classDef internal fill:#bbdefb,stroke:#1976d2,stroke-width:2px');
  lines.push('  classDef external fill:#ffccbc,stroke:#e64a19,stroke-width:2px,stroke-dasharray: 5 5');

  return lines.join('\n');
}
```

**Anti-Patterns to Avoid:**
❌ Rendering large diagrams synchronously (blocks UI)
❌ No fallback for browsers without SVG support
❌ Missing accessibility attributes (alt text, ARIA labels)
❌ Not optimizing diagram complexity (too many nodes)
❌ No error handling for invalid diagram syntax
❌ Exporting low-resolution images
❌ Not caching rendered diagrams

**Documentation Duties:**
- Document diagram component APIs
- Create examples of all diagram types
- Document export functionality and formats
- Maintain diagram syntax reference
- Document performance optimization techniques

**Testing Requirements:**
- **Visual regression tests:** Playwright screenshots for all diagram types
- **Unit tests:** Diagram generation functions
- **Integration tests:** Export functionality
- Test responsive behavior and zoom/pan interactions
- Test accessibility (keyboard navigation, screen reader support)

**Handoff Points:**
- **Receives from:**
  - AI/Agent team: Extracted data for diagram generation
  - Backend: Diagram data from database
  - UI/UX Engineer: Layout containers and styling
- **Delivers to:**
  - Backend: Export requests, diagram preferences
  - UI/UX Engineer: Diagram embedding requirements
  - Chat Engineer: Diagram preview in chat

---

## Team Workflows

### Component Development Process
1. UI/UX Engineer: Design component API and create basic structure
2. Chat Engineer / Data Viz Engineer: Integrate specialized functionality
3. All: Review for accessibility and performance
4. UI/UX Engineer: Write component tests
5. All: Code review and merge

### Chat Feature Development
1. Chat Engineer: Implement chat UI and streaming
2. UI/UX Engineer: Style and polish chat components
3. Backend: Provide chat API endpoints
4. Chat Engineer: Integrate and test end-to-end
5. All: Review and merge

### Diagram Implementation
1. Data Viz Engineer: Implement diagram renderer
2. AI/Agent team: Provide structured data format
3. Data Viz Engineer: Generate diagram syntax from data
4. UI/UX Engineer: Integrate into page layouts
5. All: Visual regression testing

---

## Testing Requirements

### Unit Tests (React Testing Library)
- All reusable components
- Form validation logic
- Diagram generation functions
- **Target:** 85% coverage

### Accessibility Tests
- Automated axe-core tests for all pages
- Keyboard navigation testing
- Screen reader compatibility
- **Target:** 0 accessibility violations

### E2E Tests (Playwright)
- Critical user flows (sign up, create project, chat, export diagram)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness
- **Target:** All critical flows covered

### Visual Regression Tests
- Diagram rendering for all types
- Component styling across themes (light/dark)
- Responsive layouts
- **Target:** All visual components covered

---

## Reference Documentation

### Internal Documentation
- [Master Instructions](../.claude/instructions.md)
- [Testing Standards](/docs/guides/testing-standards.md)
- [Component Library](/docs/components/) (TODO)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Mermaid.js Documentation](https://mermaid.js.org/)
- [React Testing Library](https://testing-library.com/react)

### Playbooks
- Frontend Development Playbook: `/docs/playbooks/frontend-playbook.md` (TODO)
- Accessibility Checklist: `/docs/playbooks/accessibility-playbook.md` (TODO)
- Performance Optimization: `/docs/playbooks/performance-playbook.md` (TODO)

---

## Success Metrics

**UI/UX Engineer:**
- 0 accessibility violations (automated)
- Page load time < 2 seconds
- Lighthouse score > 90

**Chat Engineer:**
- Time to first token < 500ms
- 0 chat errors per 1000 messages
- Message delivery success rate > 99%

**Data Viz Engineer:**
- Diagram generation time < 2 seconds
- Export success rate > 99%
- Visual regression test pass rate 100%

---

**Questions or Issues?** Tag `@frontend-team` in GitHub discussions or issues.
