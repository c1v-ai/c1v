  12 Implementation Phases:
  1. Foundation Setup (saas-starter base)
  2. Custom Theme Integration
  3. Database Schema Extension (PRD tables)
  4. LangChain Dependencies & Configuration
  5. Chat UI Components
  6. Chat API Endpoint (Streaming)
  7. Projects CRUD (UI + API)
  8. Project Chat Integration
  9. SR-CORNELL Validation System
  10. Data Extraction Agent (LangGraph)
  11. Diagram Generation (Mermaid)
  12. Final Integration & Polish

  Key Strategy: Foundation-first approach starting with saas-starter (auth, payments, teams) and incrementally adding AI capabilities.

  Timeline: ~9 days for complete merge, leaving 5 days for testing and deployment in a 2-week sprint.

  The plan preserves the best of both templates while resolving conflicts and integrating your custom theme and SR-CORNELL validation requirements.

──────────────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?

 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Plan: Merge saas-starter + langchain-nextjs-template → product-helper

 Context

 User Request: Merge the saas-starter and langchain-nextjs-template into a production-ready
 product-helper app for PRD generation SaaS.

 Current State:
 - apps/product-helper/ - Empty directory (clean slate)
 - apps/saas-starter/ - Full SaaS foundation with auth, teams, payments, database
 - apps/langchain-nextjs-template/ - AI/chat features with streaming, RAG, agents
 - Custom theme exists at /Users/davidancor/c1v-product-helper/src/styles/theme.css
 - SR-CORNELL spec at /Users/davidancor/c1v-product-helper/SR-CORNELL-PRD-95-V1.json

 Goal: Create a production-ready product-helper app that combines:
 - SaaS infrastructure (auth, teams, payments, database)
 - AI/chat capabilities (streaming, RAG, LangGraph agents)
 - PRD-specific features (conversational intake, diagram generation, SR-CORNELL validation)

 ---
 Template Analysis Summary

 saas-starter Strengths

 Must Preserve:
 1. Database Schema - Users, teams, teamMembers, invitations, activityLogs (Drizzle ORM)
 2. Authentication - JWT-based with bcryptjs, middleware protection
 3. Payment Integration - Stripe checkout, webhooks, subscription management
 4. Server Actions - validatedAction, validatedActionWithUser, withTeam patterns
 5. Activity Logging - Comprehensive audit trail system
 6. Team Management - Invitations, roles, member management
 7. UI Components - shadcn/ui base (Button, Card, Input, Label, Avatar, etc.)
 8. Middleware - Session renewal, route protection

 Tech Stack:
 - Next.js 15.6.0, React 19.1.0, TypeScript 5.8.3
 - PostgreSQL 3.4.5, Drizzle ORM 0.43.1
 - Stripe 18.1.0
 - SWR 2.3.3, Zod 3.24.4
 - Tailwind CSS 4.1.7, shadcn/ui

 langchain-nextjs-template Strengths

 Must Preserve:
 1. Chat Infrastructure - ChatWindow, ChatMessageBubble, streaming with Vercel AI SDK
 2. LangChain Integration - LCEL composition, agents, RAG, structured outputs
 3. API Patterns - Modular endpoints for different AI use cases
 4. Message Conversion - Vercel ↔ LangChain utilities
 5. Source Attribution - Header-based source passing
 6. Intermediate Steps - Agent reasoning visualization
 7. Document Upload - RAG ingestion flow
 8. LangGraph - Modern agent framework with streaming
 9. Edge Runtime - Serverless optimization

 Tech Stack:
 - LangChain 0.3.19, LangGraph 0.2.57
 - Vercel AI SDK 3.1.12
 - Supabase (vector store)
 - Radix UI components

 Key Conflicts to Resolve
 ┌──────────────┬────────────────┬──────────────────────┬──────────────────────────────────────────┐
 │   Feature    │  saas-starter  │  langchain-template  │                Resolution                │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ Auth         │ JWT + bcryptjs │ None                 │ Use saas-starter auth                    │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ UI Library   │ shadcn/ui      │ Radix UI directly    │ Use shadcn/ui (includes Radix)           │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ Data         │ SWR            │ Vercel AI SDK        │ Keep both (different purposes)           │
 │ Fetching     │                │                      │                                          │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ Database     │ Drizzle ORM    │ Supabase (vector     │ Drizzle primary, add vector support      │
 │              │                │ only)                │                                          │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ Styling      │ Tailwind 4.1.7 │ Tailwind 3.3.3       │ Use 4.1.7, migrate custom theme          │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ Navigation   │ Dashboard      │ Simple navbar        │ Use dashboard layout, add chat routes    │
 │              │ layout         │                      │                                          │
 ├──────────────┼────────────────┼──────────────────────┼──────────────────────────────────────────┤
 │ Forms        │ Server actions │ API routes           │ Use server actions for mutations, API    │
 │              │                │                      │ for streaming                            │
 └──────────────┴────────────────┴──────────────────────┴──────────────────────────────────────────┘
 ---
 Recommended Merge Strategy

 Approach: Foundation-First with Incremental AI Integration

 Rationale:
 1. Start with saas-starter as foundation (more complete, production-ready)
 2. Add LangChain/AI capabilities incrementally
 3. Extend database schema for PRD-specific data
 4. Integrate custom theme and SR-CORNELL validation
 5. Build PRD-specific features on top

 Advantages:
 - ✅ Maintains working auth, payments, teams from day 1
 - ✅ Incremental AI integration reduces risk
 - ✅ Can test each integration point
 - ✅ Clear separation of concerns
 - ✅ Easier to debug issues

 Disadvantages:
 - ❌ More steps than "copy everything"
 - ❌ Requires careful dependency management

 ---
 Implementation Plan

 Phase 1: Foundation Setup (saas-starter base)

 Goal: Copy saas-starter to product-helper and verify it works

 Steps:
 1. Copy entire saas-starter directory to product-helper
 2. Update package.json name to "product-helper"
 3. Update database connection to product-helper-specific DB
 4. Test: pnpm --filter product-helper dev should work
 5. Test: Sign up, sign in, subscription flow should work

 Files Modified:
 - apps/product-helper/package.json - Update name, add AI dependencies
 - apps/product-helper/.env.example - Add AI API keys
 - apps/product-helper/drizzle.config.ts - Verify DB connection

 Verification:
 cd apps/product-helper
 pnpm dev
 # Visit http://localhost:3000
 # Test signup → dashboard → pricing → Stripe checkout (test mode)

 ---
 Phase 2: Custom Theme Integration

 Goal: Replace default styling with c1v custom theme (Consolas + Verdana, teal palette)

 Steps:
 1. Copy /Users/davidancor/c1v-product-helper/src/styles/theme.css to
 apps/product-helper/app/theme.css
 2. Import theme.css in app/layout.tsx (before globals.css)
 3. Update Tailwind config to use theme CSS variables
 4. Test light/dark mode switching
 5. Update shadcn/ui components to use theme variables

 Files Modified:
 - apps/product-helper/app/layout.tsx - Import theme.css
 - apps/product-helper/app/globals.css - Ensure compatibility
 - apps/product-helper/tailwind.config.ts - Map theme variables
 - apps/product-helper/app/page.tsx - Update landing page with theme

 Custom Theme Details:
 /* Typography */
 --font-heading: Consolas, "Courier New", monospace
 --font-body: Verdana, Geneva, Tahoma, sans-serif

 /* Colors (Light) */
 --bg-primary: #FFFFFF
 --bg-secondary: #F7F9FC
 --text-primary: #1F2937
 --accent: #0A5C4E (teal)

 /* Colors (Dark) */
 --bg-primary: #0A2F35 (dark teal)
 --bg-secondary: #0D3D47
 --text-primary: #FFFFFF
 --accent: #0ea5e9 (bright blue)

 Verification:
 - Landing page uses Consolas for headings, Verdana for body
 - Light mode shows teal accent (#0A5C4E)
 - Dark mode shows bright blue accent (#0ea5e9)
 - All buttons, cards, inputs respect theme variables

 ---
 Phase 3: Database Schema Extension

 Goal: Add PRD-specific tables while preserving saas-starter schema

 New Tables:
 1. projects - PRD projects
 2. projectData - Extracted data (actors, use cases, entities)
 3. artifacts - Generated diagrams (context, use case, class, sequence, activity)
 4. conversations - Chat history with AI agents

 Schema Design:
 // lib/db/schema.ts (additions)

 export const projects = pgTable('projects', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   vision: text('vision').notNull(),
   status: text('status', {
     enum: ['intake', 'in_progress', 'validation', 'completed', 'archived']
   }).notNull().default('intake'),

   // Validation tracking
   validationScore: integer('validation_score').default(0),
   validationPassed: integer('validation_passed').default(0),
   validationFailed: integer('validation_failed').default(0),

   // Foreign keys
   teamId: integer('team_id').notNull().references(() => teams.id),
   createdBy: text('created_by').notNull(), // User ID

   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow(),
 }, (table) => ({
   teamIdIdx: index('projects_team_id_idx').on(table.teamId),
   statusIdx: index('projects_status_idx').on(table.status),
 }));

 export const artifacts = pgTable('artifacts', {
   id: serial('id').primaryKey(),
   projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
   type: text('type', {
     enum: ['context_diagram', 'use_case', 'class_diagram', 'sequence_diagram', 'activity_diagram']
   }).notNull(),
   content: jsonb('content').notNull(), // Structured diagram data
   imageUrl: text('image_url'), // Generated diagram image URL
   status: text('status', { enum: ['draft', 'validated', 'exported'] }).notNull().default('draft'),
   validationErrors: jsonb('validation_errors'),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow(),
 }, (table) => ({
   projectIdIdx: index('artifacts_project_id_idx').on(table.projectId),
 }));

 export const projectData = pgTable('project_data', {
   id: serial('id').primaryKey(),
   projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade'
 }).unique(),

   // Extracted data
   actors: jsonb('actors').$type<Array<{name: string; role: string; description: string}>>(),
   useCases: jsonb('use_cases').$type<Array<{id: string; name: string; description: string; actor:
 string}>>(),
   systemBoundaries: jsonb('system_boundaries').$type<{internal: string[]; external: string[]}>(),
   dataEntities: jsonb('data_entities').$type<Array<{name: string; attributes: string[];
 relationships: string[]}>>(),

   completeness: integer('completeness').default(0), // 0-100
   lastExtractedAt: timestamp('last_extracted_at'),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow(),
 });

 export const conversations = pgTable('conversations', {
   id: serial('id').primaryKey(),
   projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
   role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
   content: text('content').notNull(),
   tokens: integer('tokens'),
   createdAt: timestamp('created_at').notNull().defaultNow(),
 }, (table) => ({
   projectIdIdx: index('conversations_project_id_idx').on(table.projectId),
 }));

 // Relations
 export const projectsRelations = relations(projects, ({ one, many }) => ({
   team: one(teams, { fields: [projects.teamId], references: [teams.id] }),
   artifacts: many(artifacts),
   conversations: many(conversations),
   projectData: one(projectData),
 }));

 Steps:
 1. Add new table definitions to lib/db/schema.ts
 2. Add relations for eager loading
 3. Generate migration: pnpm db:generate
 4. Review migration SQL
 5. Run migration: pnpm db:migrate
 6. Update seed script with sample PRD project

 Verification:
 pnpm db:studio
 # Verify new tables exist: projects, artifacts, projectData, conversations
 # Check foreign keys and indexes

 ---
 Phase 4: LangChain Dependencies & Configuration

 Goal: Install AI/ML dependencies and configure LangChain

 Steps:
 1. Install LangChain packages:
 pnpm --filter product-helper add langchain @langchain/core @langchain/openai @langchain/community
 @langchain/langgraph ai zod-to-json-schema
 2. Add environment variables to .env.example:
 OPENAI_API_KEY=sk-...
 LANGCHAIN_API_KEY=...
 LANGCHAIN_PROJECT=c1v-product-helper
 3. Create LangChain initialization file lib/langchain/config.ts:
 import { ChatOpenAI } from "@langchain/openai";

 export const llm = new ChatOpenAI({
   modelName: "gpt-4-turbo",
   temperature: 0.7,
   maxTokens: 2000,
 });
 4. Create utility functions lib/langchain/utils.ts:
   - convertVercelMessageToLangChainMessage()
   - convertLangChainMessageToVercelMessage()

 Files Created:
 - lib/langchain/config.ts - LLM configuration
 - lib/langchain/utils.ts - Message conversion utilities
 - lib/langchain/prompts.ts - Prompt templates (to be populated later)

 Verification:
 // Test in Node REPL
 import { llm } from './lib/langchain/config';
 await llm.invoke("Hello, are you working?");
 // Should return response

 ---
 Phase 5: Chat UI Components

 Goal: Integrate chat components from langchain-template

 Steps:
 1. Copy chat components from langchain-template to product-helper:
   - components/chat/ChatWindow.tsx
   - components/chat/ChatMessageBubble.tsx
   - components/chat/ChatInput.tsx (create from ChatWindow)
   - components/chat/ChatMessages.tsx (create from ChatWindow)
   - components/chat/ChatLoading.tsx
   - components/chat/MarkdownRenderer.tsx
   - components/chat/MessageActions.tsx
 2. Adapt components to use shadcn/ui instead of Radix directly:
   - Replace direct Radix imports with shadcn/ui equivalents
   - Use theme.css variables for styling
   - Ensure TypeScript strict mode compatibility
 3. Install missing dependencies:
 pnpm --filter product-helper add react-markdown remark-gfm use-stick-to-bottom sonner
 4. Create demo chat page: app/(dashboard)/test-chat/page.tsx

 Files Created:
 - components/chat/ChatWindow.tsx
 - components/chat/ChatMessageBubble.tsx
 - components/chat/ChatInput.tsx
 - components/chat/ChatMessages.tsx
 - components/chat/ChatLoading.tsx
 - components/chat/MarkdownRenderer.tsx
 - components/chat/MessageActions.tsx
 - app/(dashboard)/test-chat/page.tsx - Demo page

 Adaptations:
 // Example: Update ChatMessageBubble to use theme variables
 // Before (langchain-template):
 <div className="bg-blue-100">

 // After (product-helper with theme):
 <div style={{ background: 'var(--bg-secondary)' }}>
 // Or with Tailwind:
 <div className="bg-secondary"> // If mapped in tailwind.config

 Verification:
 - Navigate to /test-chat
 - Type message and press enter
 - Should show "Hello, world" (hardcoded response for now)
 - Verify message bubbles, loading state, markdown rendering

 ---
 Phase 6: Chat API Endpoint (Simple Streaming)

 Goal: Create working chat API with OpenAI streaming

 Steps:
 1. Create app/api/chat/route.ts based on langchain-template pattern
 2. Implement authentication check (reuse saas-starter auth)
 3. Set up basic streaming with ChatOpenAI
 4. Test with ChatWindow component

 Implementation:
 // app/api/chat/route.ts
 import { NextRequest } from 'next/server';
 import { StreamingTextResponse } from 'ai';
 import { ChatOpenAI } from '@langchain/openai';
 import { HttpResponseOutputParser } from 'langchain/output_parsers';
 import { PromptTemplate } from '@langchain/core/prompts';
 import { getUser } from '@/lib/auth/session';

 export const runtime = 'edge';

 const llm = new ChatOpenAI({
   modelName: 'gpt-4-turbo',
   temperature: 0.7,
   streaming: true,
 });

 export async function POST(req: NextRequest) {
   try {
     // Authentication
     const user = await getUser();
     if (!user) {
       return new Response('Unauthorized', { status: 401 });
     }

     const { messages } = await req.json();
     const lastMessage = messages[messages.length - 1];

     // Simple prompt (will be replaced with PRD-specific prompt)
     const prompt = PromptTemplate.fromTemplate(
       `You are a helpful AI assistant. Respond to: {input}`
     );

     const chain = prompt
       .pipe(llm)
       .pipe(new HttpResponseOutputParser());

     const stream = await chain.stream({
       input: lastMessage.content,
     });

     return new StreamingTextResponse(stream);
   } catch (error) {
     console.error('Chat error:', error);
     return new Response('Internal Server Error', { status: 500 });
   }
 }

 Files Created:
 - app/api/chat/route.ts - Basic streaming chat endpoint

 Verification:
 - Navigate to /test-chat
 - Send message: "Hello, who are you?"
 - Should receive streaming response from GPT-4
 - Check Network tab for SSE streaming

 ---
 Phase 7: Projects CRUD (UI + API)

 Goal: Build project creation and management UI

 Steps:
 1. Create projects list page: app/(dashboard)/projects/page.tsx
 2. Create new project page: app/(dashboard)/projects/new/page.tsx
 3. Create project detail page: app/(dashboard)/projects/[id]/page.tsx
 4. Create API routes:
   - app/api/projects/route.ts (GET all, POST create)
   - app/api/projects/[id]/route.ts (GET one, PUT update, DELETE)
 5. Create server actions in app/actions/projects.ts
 6. Create ProjectCard component
 7. Create ProjectForm component

 Key Components:

 ProjectCard (components/projects/project-card.tsx):
 - Display project name, vision snippet, status badge, validation score
 - Click to navigate to detail page
 - Shows created date

 ProjectForm (components/projects/project-form.tsx):
 - Name input (required, 1-255 chars)
 - Vision textarea (required, 10-5000 chars)
 - Submit button with loading state
 - Client-side validation with React Hook Form + Zod
 - Server action submission

 Projects List Page (app/(dashboard)/projects/page.tsx):
 import { getUser } from '@/lib/auth/session';
 import { db } from '@/lib/db/drizzle';
 import { projects } from '@/lib/db/schema';
 import { eq } from 'drizzle-orm';
 import { ProjectCard } from '@/components/projects/project-card';
 import { Button } from '@/components/ui/button';
 import Link from 'next/link';

 export default async function ProjectsPage() {
   const user = await getUser();
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

 Files Created:
 - app/(dashboard)/projects/page.tsx
 - app/(dashboard)/projects/new/page.tsx
 - app/(dashboard)/projects/[id]/page.tsx
 - app/api/projects/route.ts
 - app/api/projects/[id]/route.ts
 - app/actions/projects.ts
 - components/projects/project-card.tsx
 - components/projects/project-form.tsx

 Verification:
 - Navigate to /projects
 - Click "New Project"
 - Fill in name and vision, submit
 - Redirects to project detail page
 - Project appears in list
 - Verify database entry in Drizzle Studio

 ---
 Phase 8: Project Chat Integration

 Goal: Connect chat interface to specific project context

 Steps:
 1. Create project chat page: app/(dashboard)/projects/[id]/chat/page.tsx
 2. Modify chat API to accept projectId and load project context
 3. Create conversational intake prompt
 4. Save conversation messages to database
 5. Display chat in project detail page

 Conversational Intake Prompt:
 // lib/langchain/prompts.ts
 export const intakePrompt = `You are a helpful AI assistant helping a product manager create a 
 Product Requirements Document (PRD).

 Project: {projectName}
 Vision: {projectVision}

 Your goal is to ask clarifying questions to extract:
 - Actors (users, systems, external entities)
 - Use cases (what users can do)
 - System boundaries (what's in scope vs out of scope)
 - Data entities and their relationships

 Ask one question at a time. Be conversational and friendly.

 Examples of good questions:
 - "Who are the primary users of this product?"
 - "What are the main actions users will take?"
 - "Are there any external systems this will integrate with?"
 - "What data will the system need to store?"

 Current conversation:
 {history}

 User's last message: {input}`;

 Modified Chat API (app/api/chat/projects/[projectId]/route.ts):
 export async function POST(
   req: NextRequest,
   { params }: { params: { projectId: string } }
 ) {
   const user = await getUser();
   if (!user) return new Response('Unauthorized', { status: 401 });

   const projectId = parseInt(params.projectId);
   const { messages } = await req.json();

   // Load project
   const project = await db.query.projects.findFirst({
     where: and(
       eq(projects.id, projectId),
       eq(projects.teamId, user.teamId)
     ),
   });

   if (!project) return new Response('Project not found', { status: 404 });

   // Load conversation history
   const history = await db.query.conversations.findMany({
     where: eq(conversations.projectId, projectId),
     orderBy: asc(conversations.createdAt),
     limit: 20, // Last 20 messages
   });

   const prompt = PromptTemplate.fromTemplate(intakePrompt);
   const chain = prompt.pipe(llm).pipe(new HttpResponseOutputParser());

   const stream = await chain.stream({
     projectName: project.name,
     projectVision: project.vision,
     history: history.map(h => `${h.role}: ${h.content}`).join('\n'),
     input: messages[messages.length - 1].content,
   });

   // Save user message
   await db.insert(conversations).values({
     projectId,
     role: 'user',
     content: messages[messages.length - 1].content,
     createdAt: new Date(),
   });

   // Note: AI response saved in onFinish callback
   return new StreamingTextResponse(stream);
 }

 Files Created:
 - app/(dashboard)/projects/[id]/chat/page.tsx
 - app/api/chat/projects/[projectId]/route.ts
 - lib/langchain/prompts.ts (with intake prompt)

 Verification:
 - Navigate to /projects/{id}/chat
 - AI asks contextual questions about the project
 - Responses are saved to database
 - Conversation persists across page reloads

 ---
 Phase 9: SR-CORNELL Validation System

 Goal: Implement programmatic PRD validation

 Steps:
 1. Copy SR-CORNELL spec from /Users/davidancor/c1v-product-helper/SR-CORNELL-PRD-95-V1.json
 2. Create validation engine in lib/validators/sr-cornell.ts
 3. Create validation UI component
 4. Add validation endpoint
 5. Display validation results on project page

 Validation Engine Structure:
 // lib/validators/sr-cornell.ts
 import { z } from 'zod';

 // Hard gates (10 total)
 export const hardGates = {
   HG1_ACTORS_MINIMUM: 'At least 2 actors defined',
   HG2_USE_CASES_MINIMUM: 'At least 3 use cases defined',
   HG3_SYSTEM_BOUNDARY: 'System boundary clearly defined',
   HG4_CONTEXT_DIAGRAM: 'Context diagram present',
   HG5_USE_CASE_DIAGRAM: 'Use case diagram present',
   HG6_ACTOR_DESCRIPTIONS: 'All actors have descriptions',
   HG7_USE_CASE_DESCRIPTIONS: 'All use cases have descriptions',
   HG8_DATA_ENTITIES: 'At least 1 data entity defined',
   HG9_RELATIONSHIPS: 'Entity relationships defined',
   HG10_VISION_STATEMENT: 'Vision statement present and clear',
 };

 export interface ValidationResult {
   score: number; // 0-100
   passed: number;
   failed: number;
   hardGatesResult: Record<string, boolean>;
   softChecksResult: Record<string, boolean>;
   errors: string[];
   warnings: string[];
 }

 export async function validateProject(projectId: number): Promise<ValidationResult> {
   const project = await db.query.projects.findFirst({
     where: eq(projects.id, projectId),
     with: {
       projectData: true,
       artifacts: true,
     },
   });

   if (!project) throw new Error('Project not found');

   const result: ValidationResult = {
     score: 0,
     passed: 0,
     failed: 0,
     hardGatesResult: {},
     softChecksResult: {},
     errors: [],
     warnings: [],
   };

   // Hard Gate 1: At least 2 actors
   const actorCount = project.projectData?.actors?.length || 0;
   const hg1Pass = actorCount >= 2;
   result.hardGatesResult['HG1_ACTORS_MINIMUM'] = hg1Pass;
   if (!hg1Pass) result.errors.push(`Only ${actorCount} actors defined, need at least 2`);

   // Hard Gate 2: At least 3 use cases
   const useCaseCount = project.projectData?.useCases?.length || 0;
   const hg2Pass = useCaseCount >= 3;
   result.hardGatesResult['HG2_ACTORS_MINIMUM'] = hg2Pass;
   if (!hg2Pass) result.errors.push(`Only ${useCaseCount} use cases defined, need at least 3`);

   // ... continue for all 10 hard gates

   // Calculate score
   const totalChecks = Object.keys(hardGates).length;
   const passedChecks = Object.values(result.hardGatesResult).filter(Boolean).length;
   result.score = Math.round((passedChecks / totalChecks) * 100);
   result.passed = passedChecks;
   result.failed = totalChecks - passedChecks;

   return result;
 }

 Files Created:
 - lib/validators/sr-cornell.ts - Validation engine
 - app/api/projects/[id]/validate/route.ts - Validation endpoint
 - components/validation/validation-report.tsx - Display component
 - SR-CORNELL-PRD-95-V1.json - Spec file (copied)

 Verification:
 - Navigate to project page
 - Click "Validate" button
 - See validation score, passed/failed gates
 - Error messages for failed gates
 - Score updates after data extraction

 ---
 Phase 10: Data Extraction Agent (LangGraph)

 Goal: Extract structured data from conversations automatically

 Steps:
 1. Create extraction agent with LangGraph
 2. Define structured output schema with Zod
 3. Trigger extraction after N conversation messages
 4. Save extracted data to projectData table
 5. Display extracted data on project page

 Extraction Schema:
 // lib/langchain/schemas.ts
 import { z } from 'zod';

 export const actorSchema = z.object({
   name: z.string(),
   role: z.string(),
   description: z.string(),
 });

 export const useCaseSchema = z.object({
   id: z.string(),
   name: z.string(),
   description: z.string(),
   actor: z.string(),
   preconditions: z.array(z.string()).optional(),
   postconditions: z.array(z.string()).optional(),
 });

 export const extractionSchema = z.object({
   actors: z.array(actorSchema),
   useCases: z.array(useCaseSchema),
   systemBoundaries: z.object({
     internal: z.array(z.string()),
     external: z.array(z.string()),
   }),
   dataEntities: z.array(z.object({
     name: z.string(),
     attributes: z.array(z.string()),
     relationships: z.array(z.string()),
   })),
 });

 Extraction Agent:
 // lib/langchain/agents/extraction-agent.ts
 import { ChatOpenAI } from '@langchain/openai';
 import { extractionSchema } from '../schemas';

 const llm = new ChatOpenAI({
   modelName: 'gpt-4-turbo',
   temperature: 0,
 });

 const extractionLLM = llm.withStructuredOutput(extractionSchema);

 export async function extractProjectData(conversationHistory: string) {
   const prompt = `Analyze this conversation between a user and AI about a product, and extract 
 structured PRD data.

 Conversation:
 ${conversationHistory}

 Extract:
 1. Actors (users, systems, external entities)
 2. Use cases (what users can do)
 3. System boundaries (internal vs external components)
 4. Data entities (objects, their attributes, and relationships)

 Be thorough and extract ALL mentioned information.`;

   const result = await extractionLLM.invoke(prompt);
   return result;
 }

 Trigger Logic:
 // After every 5 messages, trigger extraction
 if (messageCount % 5 === 0) {
   const history = await db.query.conversations.findMany({
     where: eq(conversations.projectId, projectId),
     orderBy: asc(conversations.createdAt),
   });

   const extracted = await extractProjectData(
     history.map(h => `${h.role}: ${h.content}`).join('\n')
   );

   await db.insert(projectData).values({
     projectId,
     actors: extracted.actors,
     useCases: extracted.useCases,
     systemBoundaries: extracted.systemBoundaries,
     dataEntities: extracted.dataEntities,
     completeness: calculateCompleteness(extracted),
     lastExtractedAt: new Date(),
   }).onConflictDoUpdate({
     target: projectData.projectId,
     set: {
       actors: extracted.actors,
       useCases: extracted.useCases,
       systemBoundaries: extracted.systemBoundaries,
       dataEntities: extracted.dataEntities,
       completeness: calculateCompleteness(extracted),
       lastExtractedAt: new Date(),
       updatedAt: new Date(),
     },
   });
 }

 Files Created:
 - lib/langchain/schemas.ts - Zod schemas for extraction
 - lib/langchain/agents/extraction-agent.ts - Extraction logic
 - components/extracted-data/data-display.tsx - Display component

 Verification:
 - Chat for 5+ messages
 - Automatic extraction triggers
 - Navigate to project data tab
 - See extracted actors, use cases, entities
 - Validation score updates

 ---
 Phase 11: Diagram Generation (Mermaid)

 Goal: Generate visual diagrams from extracted data

 Steps:
 1. Install Mermaid dependencies: pnpm add mermaid react-markdown
 2. Create diagram generator functions
 3. Create diagram viewer component
 4. Add diagram generation to project page
 5. Implement export (PNG, SVG)

 Diagram Generators:
 // lib/diagrams/generators.ts
 export function generateContextDiagram(
   systemName: string,
   internal: string[],
   external: string[]
 ): string {
   const lines = ['graph TB'];
   lines.push(`  System["${systemName}"]:::system`);

   internal.forEach((sys, i) => {
     lines.push(`  Internal${i}["${sys}"]:::internal`);
     lines.push(`  System --> Internal${i}`);
   });

   external.forEach((sys, i) => {
     lines.push(`  External${i}["${sys}"]:::external`);
     lines.push(`  System -.-> External${i}`);
   });

   lines.push('  classDef system fill:#c8e6c9,stroke:#388e3c,stroke-width:3px');
   lines.push('  classDef internal fill:#bbdefb,stroke:#1976d2,stroke-width:2px');
   lines.push('  classDef external fill:#ffccbc,stroke:#e64a19,stroke-width:2px,stroke-dasharray: 5 
 5');

   return lines.join('\n');
 }

 export function generateUseCaseDiagram(actors, useCases): string {
   const lines = ['graph LR'];

   actors.forEach((actor) => {
     lines.push(`  ${actor.name}["${actor.name}<br/>(${actor.role})"]:::actor`);
   });

   useCases.forEach((uc) => {
     lines.push(`  ${uc.id}("${uc.name}"):::usecase`);
   });

   useCases.forEach((uc) => {
     lines.push(`  ${uc.actor} --> ${uc.id}`);
   });

   lines.push('  classDef actor fill:#e3f2fd,stroke:#1976d2,stroke-width:2px');
   lines.push('  classDef usecase fill:#fff3e0,stroke:#f57c00,stroke-width:2px');

   return lines.join('\n');
 }

 Diagram Viewer:
 // components/diagrams/diagram-viewer.tsx
 'use client';

 import { useEffect, useRef } from 'react';
 import mermaid from 'mermaid';

 export function DiagramViewer({ syntax, type }) {
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
     if (!containerRef.current) return;

     mermaid.initialize({ startOnLoad: true, theme: 'default' });
     mermaid.render(`diagram-${type}`, syntax).then(({ svg }) => {
       if (containerRef.current) {
         containerRef.current.innerHTML = svg;
       }
     });
   }, [syntax, type]);

   return <div ref={containerRef} />;
 }

 Files Created:
 - lib/diagrams/generators.ts - Mermaid syntax generators
 - components/diagrams/diagram-viewer.tsx - Viewer component
 - components/diagrams/diagram-toolbar.tsx - Zoom/export controls
 - app/api/diagrams/export/route.ts - Export endpoint

 Verification:
 - Navigate to project artifacts tab
 - Click "Generate Context Diagram"
 - Diagram renders with Mermaid
 - Zoom in/out works
 - Export to PNG downloads file

 ---
 Phase 12: Final Integration & Polish

 Goal: Connect all pieces and prepare for deployment

 Steps:
 1. Update dashboard to show recent projects
 2. Add navigation links to chat, data, artifacts
 3. Implement project settings page
 4. Add export functionality (Markdown, PDF)
 5. Update landing page with product info
 6. Test full flow end-to-end
 7. Deploy to Vercel

 Dashboard Updates:
 - Recent projects widget
 - Validation score overview
 - Quick actions (New Project, Continue Chat)

 Navigation Structure:
 /dashboard
   /projects
     /new
     /[id]
       /chat          (Conversational intake)
       /data          (Extracted data view)
       /artifacts     (Generated diagrams)
       /settings      (Project settings)
       /export        (Export options)

 Export Functionality:
 - Markdown: All data + embedded diagrams
 - PDF: Professional PRD document
 - Notion: Integration via API

 Files Modified:
 - app/(dashboard)/dashboard/page.tsx - Add widgets
 - app/(dashboard)/layout.tsx - Update sidebar
 - app/page.tsx - Landing page content
 - components/layout/sidebar.tsx - Navigation items

 Verification:
 - Complete end-to-end flow:
   a. Sign up
   b. Create project
   c. Chat with AI (5+ messages)
   d. View extracted data
   e. Generate diagrams
   f. Run validation (should pass 95%+)
   g. Export to Markdown
 - Test all navigation paths
 - Verify responsive design
 - Check dark mode

 ---
 Critical Files Summary

 From saas-starter (Base)

 - All database schema tables: users, teams, teamMembers, invitations, activityLogs
 - Authentication: lib/auth/session.ts, lib/auth/middleware.ts, middleware.ts
 - Payments: lib/payments/stripe.ts, lib/payments/actions.ts
 - UI: All components/ui/* (shadcn/ui)
 - Layouts: app/(login)/, app/(dashboard)/layout.tsx

 From langchain-template (AI Features)

 - Chat components: components/chat/*
 - LangChain utils: lib/langchain/utils.ts
 - Streaming patterns: API route structure

 New Product-Helper Files

 - Database: Extended lib/db/schema.ts with projects, artifacts, projectData, conversations
 - LangChain: lib/langchain/agents/extraction-agent.ts, lib/langchain/prompts.ts
 - Validation: lib/validators/sr-cornell.ts
 - Diagrams: lib/diagrams/generators.ts, components/diagrams/*
 - UI: components/projects/*, components/extracted-data/*, components/validation/*
 - Routes: app/(dashboard)/projects/*, app/api/projects/*, app/api/chat/projects/*

 ---
 Rollback Plan

 If issues arise during merge:
 1. Phase 1-2: Delete product-helper, restart from saas-starter copy
 2. Phase 3-4: Drop new database tables, regenerate migration
 3. Phase 5-8: Remove chat components, keep core CRUD functional
 4. Phase 9-12: Each feature is independent, can be rolled back individually

 ---
 Timeline Estimate

 - Phase 1-3 (Foundation + Theme + Database): 1 day
 - Phase 4-6 (LangChain + Chat UI + API): 2 days
 - Phase 7-8 (Projects CRUD + Chat Integration): 2 days
 - Phase 9-10 (Validation + Extraction): 2 days
 - Phase 11-12 (Diagrams + Polish): 2 days

 Total: ~9 days for complete merge and integration

 For 2-week launch, this leaves 5 days for:
 - Testing and bug fixes
 - Documentation
 - Deployment configuration
 - Performance optimization
 - Security audit

 ---
 Success Criteria

 Functional Requirements

 ✅ User can sign up, sign in, manage subscription
 ✅ User can create and manage PRD projects
 ✅ User can chat with AI to define requirements
 ✅ System automatically extracts structured data
 ✅ System generates diagrams from extracted data
 ✅ System validates PRD against SR-CORNELL spec
 ✅ User can export PRD to Markdown/PDF

 Technical Requirements

 ✅ Authentication working (JWT + bcryptjs)
 ✅ Payments working (Stripe checkout + webhooks)
 ✅ Database migrations applied
 ✅ LangChain streaming functional
 ✅ 90%+ test coverage (target)
 ✅ Custom theme applied correctly
 ✅ Responsive design (mobile + desktop)
 ✅ Dark mode working

 Performance Requirements

 ✅ Page load < 2 seconds
 ✅ Chat streaming latency < 500ms
 ✅ Diagram generation < 2 seconds
 ✅ Validation execution < 1 second

 ---
 Next Steps After Plan Approval

 1. Execute Phase 1: Copy saas-starter to product-helper
 2. Test that foundation works
 3. Proceed incrementally through phases
 4. Test each phase before moving to next
 5. Document any deviations from plan