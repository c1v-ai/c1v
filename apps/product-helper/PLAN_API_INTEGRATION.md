# LangGraph API Integration Plan

## Executive Summary

This document outlines the integration of LangGraph into the product-helper chat API, replacing the current simple LangChain chain with a stateful, multi-agent graph architecture. The new system will support conversation checkpointing, intelligent routing between specialist agents, and improved streaming integration with the Vercel AI SDK.

---

## 1. Current State Analysis

### Current Architecture

```
+------------------+     +-------------------+     +------------------+
|  ChatWindow.tsx  | --> | /api/chat/[id]    | --> | streamingLLM     |
|  (useChat hook)  |     | route.ts          |     | (simple chain)   |
+------------------+     +-------------------+     +------------------+
         |                        |
         v                        v
+------------------+     +-------------------+
|  /save endpoint  | <-- | conversations DB  |
|  (extraction)    |     | (manual persist)  |
+------------------+     +-------------------+
```

**Key Files:**
- `/apps/product-helper/app/api/chat/projects/[projectId]/route.ts` - Main chat endpoint
- `/apps/product-helper/app/api/chat/projects/[projectId]/save/route.ts` - Message persistence
- `/apps/product-helper/components/chat/chat-window.tsx` - Frontend component
- `/apps/product-helper/lib/langchain/config.ts` - LLM configuration
- `/apps/product-helper/lib/langchain/agents/extraction-agent.ts` - Data extraction

### Current Limitations

1. **No State Management**: Prompt contains all context; no persistent graph state
2. **Manual Extraction Trigger**: Extraction runs every 5 messages via save endpoint
3. **No Agent Specialization**: Single prompt handles intake, extraction, and generation
4. **No Checkpointing**: State lost on server restart; no resumability
5. **No Tool Use**: No structured tool calling for diagram generation
6. **Fragile Streaming**: Custom StreamingTextResponse lacks error recovery

---

## 2. Target Architecture

### LangGraph Multi-Agent Graph

```
                        +------------------+
                        |      START       |
                        +--------+---------+
                                 |
                                 v
                        +------------------+
                        |   Router Agent   |
                        | (intent classify)|
                        +--------+---------+
                                 |
            +--------------------+--------------------+
            |                    |                    |
            v                    v                    v
+------------------+  +------------------+  +------------------+
|   Intake Agent   |  | Extraction Agent |  | Generation Agent |
| (gather reqs)    |  | (extract data)   |  | (create diagrams)|
+--------+---------+  +--------+---------+  +--------+---------+
            |                    |                    |
            +--------------------+--------------------+
                                 |
                                 v
                        +------------------+
                        |  State Persist   |
                        | (checkpoint DB)  |
                        +--------+---------+
                                 |
                                 v
                        +------------------+
                        |   Response       |
                        | (stream to UI)   |
                        +------------------+
```

---

## 3. LangGraph State Schema

### Graph State Annotation

```typescript
// lib/langgraph/state.ts
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

/**
 * PRD Chat Graph State
 * Extends MessagesAnnotation with domain-specific fields
 */
export const PRDGraphState = Annotation.Root({
  // Core message history (provided by MessagesAnnotation)
  messages: MessagesAnnotation.spec["messages"],

  // Project context
  projectId: Annotation<number>,
  projectName: Annotation<string>,
  projectVision: Annotation<string>,

  // Extracted PRD data (accumulated across conversation)
  actors: Annotation<Actor[]>({
    reducer: (existing, update) => mergeActors(existing, update),
    default: () => [],
  }),
  useCases: Annotation<UseCase[]>({
    reducer: (existing, update) => mergeUseCases(existing, update),
    default: () => [],
  }),
  systemBoundaries: Annotation<SystemBoundaries>({
    reducer: (existing, update) => mergeSystemBoundaries(existing, update),
    default: () => ({ internal: [], external: [] }),
  }),
  dataEntities: Annotation<DataEntity[]>({
    reducer: (existing, update) => mergeDataEntities(existing, update),
    default: () => [],
  }),

  // Artifact tracking (SR-CORNELL pipeline)
  currentArtifact: Annotation<ArtifactType>({
    default: () => "context_diagram",
  }),
  completedArtifacts: Annotation<ArtifactType[]>({
    reducer: (existing, update) => [...new Set([...existing, ...update])],
    default: () => [],
  }),
  completeness: Annotation<number>({
    default: () => 0,
  }),

  // Routing metadata
  intent: Annotation<"intake" | "extraction" | "generation" | "clarification">,
  shouldExtract: Annotation<boolean>({
    default: () => false,
  }),
  shouldGenerate: Annotation<boolean>({
    default: () => false,
  }),

  // Response accumulator for streaming
  response: Annotation<string>({
    default: () => "",
  }),

  // Error state
  error: Annotation<string | null>({
    default: () => null,
  }),
});

export type PRDGraphStateType = typeof PRDGraphState.State;
```

### Type Definitions

```typescript
// lib/langgraph/types.ts
export type ArtifactType =
  | "context_diagram"
  | "use_case_diagram"
  | "scope_tree"
  | "ucbd"
  | "requirements_table"
  | "constants_table"
  | "sysml_activity_diagram";

export interface Actor {
  name: string;
  role: string;
  description: string;
  goals?: string[];
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  actor: string;
  preconditions?: string[];
  postconditions?: string[];
}

export interface SystemBoundaries {
  internal: string[];
  external: string[];
}

export interface DataEntity {
  name: string;
  attributes: string[];
  relationships: string[];
}
```

---

## 4. Agent Node Implementations

### 4.1 Router Agent

```typescript
// lib/langgraph/agents/router.ts
import { ChatOpenAI } from "@langchain/openai";
import { PRDGraphStateType } from "../state";

const routerLLM = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
});

const ROUTER_PROMPT = `Classify the user's intent based on their message and conversation context.

Current artifact: {currentArtifact}
Completeness: {completeness}%
Extracted actors: {actorCount}
Extracted use cases: {useCaseCount}

User message: {userMessage}

Respond with exactly one of:
- INTAKE: User is providing requirements information
- EXTRACTION: User wants to review/confirm extracted data
- GENERATION: User wants to generate a diagram or artifact
- CLARIFICATION: User is asking a question or needs clarification

Also indicate:
- SHOULD_EXTRACT: true if enough new information to trigger extraction
- SHOULD_GENERATE: true if minimum data met for current artifact
`;

export async function routerNode(
  state: PRDGraphStateType
): Promise<Partial<PRDGraphStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const userContent = typeof lastMessage.content === "string"
    ? lastMessage.content
    : "";

  // Check for stop triggers
  const stopTriggers = ["nope", "no", "that's enough", "done", "move on", "let's see"];
  const shouldGenerate = stopTriggers.some(trigger =>
    userContent.toLowerCase().includes(trigger)
  ) || checkArtifactReadiness(state);

  // Use structured output for classification
  const routerWithStructure = routerLLM.withStructuredOutput({
    name: "classify_intent",
    schema: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: ["intake", "extraction", "generation", "clarification"]
        },
        shouldExtract: { type: "boolean" },
        shouldGenerate: { type: "boolean" },
        reasoning: { type: "string" },
      },
      required: ["intent", "shouldExtract", "shouldGenerate"],
    },
  });

  const result = await routerWithStructure.invoke(
    ROUTER_PROMPT
      .replace("{currentArtifact}", state.currentArtifact)
      .replace("{completeness}", state.completeness.toString())
      .replace("{actorCount}", state.actors.length.toString())
      .replace("{useCaseCount}", state.useCases.length.toString())
      .replace("{userMessage}", userContent)
  );

  return {
    intent: result.intent,
    shouldExtract: result.shouldExtract,
    shouldGenerate: shouldGenerate || result.shouldGenerate,
  };
}

function checkArtifactReadiness(state: PRDGraphStateType): boolean {
  const { currentArtifact, actors, useCases, systemBoundaries } = state;

  switch (currentArtifact) {
    case "context_diagram":
      return actors.length >= 1 &&
        (systemBoundaries.external.length >= 1 ||
         systemBoundaries.internal.length >= 1);
    case "use_case_diagram":
      return actors.length >= 2 && useCases.length >= 3;
    case "scope_tree":
      return systemBoundaries.internal.length >= 1 &&
        systemBoundaries.external.length >= 1;
    default:
      return false;
  }
}
```

### 4.2 Intake Agent

```typescript
// lib/langgraph/agents/intake.ts
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { PRDGraphStateType } from "../state";

const intakeLLM = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  streaming: true,
});

export async function intakeNode(
  state: PRDGraphStateType
): Promise<Partial<PRDGraphStateType>> {
  const systemPrompt = buildIntakePrompt(state);

  const response = await intakeLLM.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  return {
    messages: [response],
    response: typeof response.content === "string" ? response.content : "",
  };
}

function buildIntakePrompt(state: PRDGraphStateType): string {
  return `You are a PRD assistant. Collect MINIMUM data needed to generate artifacts.

## Project Context
Name: ${state.projectName}
Vision: ${state.projectVision}
Completeness: ${state.completeness}%
Current Artifact: ${state.currentArtifact}

## CRITICAL RULES
1. If user says "nope", "done", "move on" -> Generate immediately
2. Once you have 1 actor + 1 external system -> Generate context diagram
3. Ask ONE question max. Better: infer and confirm.
4. Infer from vision rather than interrogate.

## Current Data
Actors: ${state.actors.map(a => a.name).join(", ") || "None yet"}
Use Cases: ${state.useCases.map(uc => uc.name).join(", ") || "None yet"}
External Systems: ${state.systemBoundaries.external.join(", ") || "None yet"}

## Response
Either generate artifact (preferred) or ask ONE clarifying question.`;
}
```

### 4.3 Extraction Agent (Enhanced)

```typescript
// lib/langgraph/agents/extraction.ts
import { ChatOpenAI } from "@langchain/openai";
import { PRDGraphStateType } from "../state";
import { extractionSchema } from "@/lib/langchain/schemas";

const extractionLLM = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

const structuredExtractionLLM = extractionLLM.withStructuredOutput(
  extractionSchema,
  { name: "extract_prd_data" }
);

export async function extractionNode(
  state: PRDGraphStateType
): Promise<Partial<PRDGraphStateType>> {
  // Build conversation text from messages
  const conversationText = state.messages
    .map(msg => {
      const role = msg._getType() === "human" ? "user" : "assistant";
      const content = typeof msg.content === "string" ? msg.content : "";
      return `${role}: ${content}`;
    })
    .join("\n");

  const extraction = await structuredExtractionLLM.invoke(
    `Extract PRD data from this conversation.

Project: ${state.projectName}
Vision: ${state.projectVision}

Conversation:
${conversationText}

Extract actors, use cases, system boundaries, and data entities.
INFER aggressively from the vision statement.`
  );

  // Calculate new completeness
  const completeness = calculateCompleteness(extraction);

  // Determine next artifact based on completeness
  const currentArtifact = determineCurrentArtifact(completeness, state.completedArtifacts);

  return {
    actors: extraction.actors,
    useCases: extraction.useCases,
    systemBoundaries: extraction.systemBoundaries,
    dataEntities: extraction.dataEntities,
    completeness,
    currentArtifact,
    shouldExtract: false,
  };
}

function calculateCompleteness(extraction: ExtractionResult): number {
  let score = 0;
  if (extraction.actors.length >= 2) score += 25;
  else if (extraction.actors.length === 1) score += 12;
  if (extraction.useCases.length >= 5) score += 35;
  else if (extraction.useCases.length >= 3) score += 25;
  else if (extraction.useCases.length >= 1) score += 10;
  if (extraction.systemBoundaries.internal.length > 0 &&
      extraction.systemBoundaries.external.length > 0) score += 20;
  else if (extraction.systemBoundaries.internal.length > 0 ||
           extraction.systemBoundaries.external.length > 0) score += 10;
  if (extraction.dataEntities.length >= 3) score += 20;
  else if (extraction.dataEntities.length >= 1) score += 7;
  return Math.min(score, 100);
}

function determineCurrentArtifact(
  completeness: number,
  completed: ArtifactType[]
): ArtifactType {
  const pipeline: ArtifactType[] = [
    "context_diagram",
    "use_case_diagram",
    "scope_tree",
    "ucbd",
    "requirements_table",
    "constants_table",
    "sysml_activity_diagram",
  ];

  for (const artifact of pipeline) {
    if (!completed.includes(artifact)) {
      return artifact;
    }
  }
  return "sysml_activity_diagram";
}
```

### 4.4 Generation Agent

```typescript
// lib/langgraph/agents/generation.ts
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { PRDGraphStateType } from "../state";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const generationLLM = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
  streaming: true,
});

// Tool for generating Mermaid diagrams
const generateDiagramTool = new DynamicStructuredTool({
  name: "generate_mermaid_diagram",
  description: "Generate a Mermaid diagram for the specified artifact type",
  schema: z.object({
    artifactType: z.enum([
      "context_diagram",
      "use_case_diagram",
      "scope_tree",
      "activity_diagram",
    ]),
    title: z.string(),
    elements: z.array(z.string()),
  }),
  func: async ({ artifactType, title, elements }) => {
    // This would be called by the LLM to structure diagram generation
    return `Generated ${artifactType} with ${elements.length} elements`;
  },
});

export async function generationNode(
  state: PRDGraphStateType
): Promise<Partial<PRDGraphStateType>> {
  const diagramPrompt = buildDiagramPrompt(state);

  const response = await generationLLM.invoke([
    {
      type: "system",
      content: `You generate Mermaid diagrams for PRD artifacts.

CRITICAL: Always wrap diagrams in \`\`\`mermaid code fences.

Current artifact to generate: ${state.currentArtifact}`,
    },
    {
      type: "human",
      content: diagramPrompt,
    },
  ]);

  // Mark artifact as completed
  const newCompletedArtifacts = [
    ...state.completedArtifacts,
    state.currentArtifact,
  ];

  return {
    messages: [response],
    response: typeof response.content === "string" ? response.content : "",
    completedArtifacts: newCompletedArtifacts,
    shouldGenerate: false,
  };
}

function buildDiagramPrompt(state: PRDGraphStateType): string {
  switch (state.currentArtifact) {
    case "context_diagram":
      return `Generate a Context Diagram showing:
- System: ${state.projectName}
- Actors: ${state.actors.map(a => a.name).join(", ")}
- External Systems: ${state.systemBoundaries.external.join(", ")}

Use Mermaid graph TD syntax with clear actor->system->external relationships.`;

    case "use_case_diagram":
      return `Generate a Use Case Diagram showing:
- Actors: ${state.actors.map(a => `${a.name} (${a.role})`).join(", ")}
- Use Cases: ${state.useCases.map(uc => `${uc.id}: ${uc.name}`).join(", ")}

Use Mermaid graph LR or flowchart syntax.`;

    case "scope_tree":
      return `Generate a Scope Tree showing:
- In Scope: ${state.systemBoundaries.internal.join(", ")}
- Out of Scope: ${state.systemBoundaries.external.join(", ")}

Use Mermaid mindmap or graph TD syntax.`;

    default:
      return `Generate artifact: ${state.currentArtifact}`;
  }
}
```

---

## 5. Graph Construction

### Main Graph Definition

```typescript
// lib/langgraph/graph.ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { PRDGraphState, type PRDGraphStateType } from "./state";
import { routerNode } from "./agents/router";
import { intakeNode } from "./agents/intake";
import { extractionNode } from "./agents/extraction";
import { generationNode } from "./agents/generation";

/**
 * Build the PRD Chat Graph
 *
 * Flow:
 * START -> router -> (intake | extraction | generation) -> persist -> END
 */
export function buildPRDGraph() {
  const builder = new StateGraph(PRDGraphState)
    // Add nodes
    .addNode("router", routerNode)
    .addNode("intake", intakeNode)
    .addNode("extraction", extractionNode)
    .addNode("generation", generationNode)
    .addNode("persist", persistNode)

    // Entry point
    .addEdge(START, "router")

    // Conditional routing based on intent
    .addConditionalEdges("router", routeByIntent, {
      intake: "intake",
      extraction: "extraction",
      generation: "generation",
      clarification: "intake",
    })

    // After intake, check if extraction needed
    .addConditionalEdges("intake", shouldExtractAfterIntake, {
      extract: "extraction",
      persist: "persist",
    })

    // After extraction, check if generation ready
    .addConditionalEdges("extraction", shouldGenerateAfterExtraction, {
      generate: "generation",
      persist: "persist",
    })

    // After generation, always persist
    .addEdge("generation", "persist")

    // Persist leads to end
    .addEdge("persist", END);

  return builder.compile();
}

// Routing functions
function routeByIntent(state: PRDGraphStateType): string {
  if (state.shouldGenerate) return "generation";
  return state.intent || "intake";
}

function shouldExtractAfterIntake(state: PRDGraphStateType): string {
  return state.shouldExtract ? "extract" : "persist";
}

function shouldGenerateAfterExtraction(state: PRDGraphStateType): string {
  return state.shouldGenerate ? "generate" : "persist";
}

// Persistence node
async function persistNode(
  state: PRDGraphStateType
): Promise<Partial<PRDGraphStateType>> {
  // This node triggers database persistence
  // Actual persistence happens in the API route after graph execution
  return {};
}

// Export compiled graph
export const prdGraph = buildPRDGraph();
```

---

## 6. Checkpointing & State Persistence

### Database Schema Changes

```sql
-- Add checkpoint table for LangGraph state persistence
CREATE TABLE graph_checkpoints (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  channel_values JSONB NOT NULL,
  channel_versions JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, thread_id, checkpoint_ns, checkpoint_id)
);

CREATE INDEX idx_graph_checkpoints_project ON graph_checkpoints(project_id);
CREATE INDEX idx_graph_checkpoints_thread ON graph_checkpoints(project_id, thread_id);
```

### Drizzle Schema Addition

```typescript
// lib/db/schema.ts (additions)
export const graphCheckpoints = pgTable('graph_checkpoints', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').notNull(),
  checkpointNs: text('checkpoint_ns').default(''),
  checkpointId: text('checkpoint_id').notNull(),
  parentCheckpointId: text('parent_checkpoint_id'),
  channelValues: jsonb('channel_values').notNull(),
  channelVersions: jsonb('channel_versions').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  projectIdx: index('graph_checkpoints_project_idx').on(table.projectId),
  threadIdx: index('graph_checkpoints_thread_idx').on(table.projectId, table.threadId),
  uniqueCheckpoint: uniqueIndex('graph_checkpoints_unique').on(
    table.projectId,
    table.threadId,
    table.checkpointNs,
    table.checkpointId
  ),
}));
```

### Custom PostgreSQL Checkpointer

```typescript
// lib/langgraph/checkpointer.ts
import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata } from "@langchain/langgraph";
import { db } from "@/lib/db/drizzle";
import { graphCheckpoints } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export class PostgresCheckpointer extends BaseCheckpointSaver {
  private projectId: number;

  constructor(projectId: number) {
    super();
    this.projectId = projectId;
  }

  async getTuple(config: { configurable?: { thread_id?: string; checkpoint_ns?: string; checkpoint_id?: string } }): Promise<{
    checkpoint: Checkpoint;
    metadata: CheckpointMetadata;
    config: any;
    parentConfig?: any;
  } | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns || "";
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId) return undefined;

    let query = db
      .select()
      .from(graphCheckpoints)
      .where(
        and(
          eq(graphCheckpoints.projectId, this.projectId),
          eq(graphCheckpoints.threadId, threadId),
          eq(graphCheckpoints.checkpointNs, checkpointNs)
        )
      )
      .orderBy(desc(graphCheckpoints.createdAt))
      .limit(1);

    const [row] = await query;
    if (!row) return undefined;

    return {
      checkpoint: {
        v: 1,
        id: row.checkpointId,
        ts: row.createdAt.toISOString(),
        channel_values: row.channelValues as Record<string, unknown>,
        channel_versions: row.channelVersions as Record<string, number>,
        versions_seen: {},
        pending_sends: [],
      },
      metadata: (row.metadata as CheckpointMetadata) || {},
      config: {
        configurable: {
          thread_id: row.threadId,
          checkpoint_ns: row.checkpointNs,
          checkpoint_id: row.checkpointId,
        },
      },
      parentConfig: row.parentCheckpointId
        ? {
            configurable: {
              thread_id: row.threadId,
              checkpoint_ns: row.checkpointNs,
              checkpoint_id: row.parentCheckpointId,
            },
          }
        : undefined,
    };
  }

  async put(
    config: any,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<any> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns || "";
    const parentCheckpointId = config.configurable?.checkpoint_id;

    await db.insert(graphCheckpoints).values({
      projectId: this.projectId,
      threadId,
      checkpointNs,
      checkpointId: checkpoint.id,
      parentCheckpointId,
      channelValues: checkpoint.channel_values,
      channelVersions: checkpoint.channel_versions,
      metadata,
    });

    return {
      configurable: {
        thread_id: threadId,
        checkpoint_ns: checkpointNs,
        checkpoint_id: checkpoint.id,
      },
    };
  }

  async *list(
    config: any,
    options?: { limit?: number; before?: any }
  ): AsyncGenerator<{
    checkpoint: Checkpoint;
    metadata: CheckpointMetadata;
    config: any;
    parentConfig?: any;
  }> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return;

    const rows = await db
      .select()
      .from(graphCheckpoints)
      .where(
        and(
          eq(graphCheckpoints.projectId, this.projectId),
          eq(graphCheckpoints.threadId, threadId)
        )
      )
      .orderBy(desc(graphCheckpoints.createdAt))
      .limit(options?.limit || 10);

    for (const row of rows) {
      yield {
        checkpoint: {
          v: 1,
          id: row.checkpointId,
          ts: row.createdAt.toISOString(),
          channel_values: row.channelValues as Record<string, unknown>,
          channel_versions: row.channelVersions as Record<string, number>,
          versions_seen: {},
          pending_sends: [],
        },
        metadata: (row.metadata as CheckpointMetadata) || {},
        config: {
          configurable: {
            thread_id: row.threadId,
            checkpoint_ns: row.checkpointNs,
            checkpoint_id: row.checkpointId,
          },
        },
        parentConfig: row.parentCheckpointId
          ? {
              configurable: {
                thread_id: row.threadId,
                checkpoint_ns: row.checkpointNs,
                checkpoint_id: row.parentCheckpointId,
              },
            }
          : undefined,
      };
    }
  }
}
```

---

## 7. Refactored API Route

### New Route Implementation

```typescript
// app/api/chat/projects/[projectId]/route.ts
import { NextRequest } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { projects, conversations, projectData } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { buildPRDGraph } from "@/lib/langgraph/graph";
import { PostgresCheckpointer } from "@/lib/langgraph/checkpointer";
import { PRDGraphStateType } from "@/lib/langgraph/state";

export const runtime = "nodejs";

/**
 * POST /api/chat/projects/[projectId]
 * LangGraph-powered streaming chat with state persistence
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // 1. Authentication
    const user = await getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return new Response(
        JSON.stringify({ error: "Team not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Parse project ID
    const { projectId: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return new Response(
        JSON.stringify({ error: "Invalid project ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Load project with data
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        projectData: true,
      },
    });

    if (!project) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { messages } = body;

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Save user message to conversations table
    const lastMessage = messages[messages.length - 1];
    await db.insert(conversations).values({
      projectId,
      role: "user",
      content: lastMessage.content,
      tokens: Math.ceil(lastMessage.content.length / 4),
    });

    // 6. Build initial state from project data
    const initialState: Partial<PRDGraphStateType> = {
      messages: [new HumanMessage(lastMessage.content)],
      projectId,
      projectName: project.name,
      projectVision: project.vision,
      actors: (project.projectData?.actors as any[]) || [],
      useCases: (project.projectData?.useCases as any[]) || [],
      systemBoundaries: (project.projectData?.systemBoundaries as any) || {
        internal: [],
        external: [],
      },
      dataEntities: (project.projectData?.dataEntities as any[]) || [],
      completeness: project.projectData?.completeness || 0,
      currentArtifact: determineCurrentArtifact(
        project.projectData?.completeness || 0,
        []
      ),
      completedArtifacts: [],
    };

    // 7. Create checkpointer and graph
    const checkpointer = new PostgresCheckpointer(projectId);
    const graph = buildPRDGraph();
    const graphWithCheckpointer = graph.withConfig({
      checkpointer,
    });

    // 8. Stream the response
    const threadId = `project-${projectId}`;
    const eventStream = await graphWithCheckpointer.streamEvents(
      initialState,
      {
        version: "v2",
        configurable: { thread_id: threadId },
      }
    );

    // 9. Transform to streaming response
    const textEncoder = new TextEncoder();
    let fullResponse = "";

    const transformStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const { event, data } of eventStream) {
            // Stream content from LLM chunks
            if (event === "on_chat_model_stream") {
              const content = data.chunk?.content;
              if (content && typeof content === "string") {
                fullResponse += content;
                controller.enqueue(textEncoder.encode(content));
              }
            }

            // Capture final state for persistence
            if (event === "on_chain_end" && data.output) {
              // Update projectData with extracted data
              await updateProjectData(projectId, data.output);
            }
          }

          // Save assistant message after stream completes
          if (fullResponse) {
            await db.insert(conversations).values({
              projectId,
              role: "assistant",
              content: fullResponse,
              tokens: Math.ceil(fullResponse.length / 4),
            });
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(transformStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Helper functions
function determineCurrentArtifact(completeness: number, completed: string[]): string {
  if (completeness >= 95) return "sysml_activity_diagram";
  if (completeness >= 90) return "constants_table";
  if (completeness >= 80) return "requirements_table";
  if (completeness >= 65) return "ucbd";
  if (completeness >= 50) return "scope_tree";
  if (completeness >= 30) return "use_case_diagram";
  return "context_diagram";
}

async function updateProjectData(projectId: number, output: Partial<PRDGraphStateType>) {
  const existing = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, projectId),
  });

  const updateData = {
    actors: output.actors,
    useCases: output.useCases,
    systemBoundaries: output.systemBoundaries,
    dataEntities: output.dataEntities,
    completeness: output.completeness,
    lastExtractedAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(projectData)
      .set(updateData)
      .where(eq(projectData.projectId, projectId));
  } else {
    await db.insert(projectData).values({
      projectId,
      ...updateData,
    });
  }
}
```

---

## 8. Frontend Integration

### Updated ChatWindow (Minimal Changes)

```typescript
// components/chat/chat-window.tsx
// The existing ChatWindow component works with minimal changes.
// Key updates:

export function ChatWindow({ ... }: ChatWindowProps) {
  const chat = useChat({
    api: endpoint,
    initialMessages: chatOptions.initialMessages,
    headers: chatOptions.headers,
    body: chatOptions.body,
    streamMode: 'text', // Keep text mode for LangGraph streaming
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Error while processing your request');
    },
    onFinish: async (message) => {
      // The new API route handles saving automatically
      // No need to call /save endpoint separately

      // Optionally refresh project data to show updated completeness
      if (projectId) {
        mutate(`/api/projects/${projectId}`);
      }
    },
  });

  // ... rest remains the same
}
```

---

## 9. Migration Path

### Phase 1: Infrastructure (Week 1)

1. **Add Database Schema**
   ```bash
   # Add graphCheckpoints table to schema.ts
   # Generate migration
   pnpm db:generate
   pnpm db:migrate
   ```

2. **Create LangGraph Directory Structure**
   ```
   lib/langgraph/
   +-- state.ts           # State annotation
   +-- types.ts           # Type definitions
   +-- graph.ts           # Graph builder
   +-- checkpointer.ts    # Postgres checkpointer
   +-- agents/
       +-- router.ts
       +-- intake.ts
       +-- extraction.ts
       +-- generation.ts
   ```

3. **Add Feature Flag**
   ```typescript
   // lib/config.ts
   export const FEATURES = {
     USE_LANGGRAPH: process.env.USE_LANGGRAPH === 'true',
   };
   ```

### Phase 2: Agent Implementation (Week 2)

1. **Port Existing Logic**
   - Move extraction agent logic to new structure
   - Create router agent with intent classification
   - Implement generation agent with tool calling

2. **Build Graph**
   - Construct StateGraph with all nodes
   - Add conditional routing
   - Test with mocked database

### Phase 3: API Integration (Week 3)

1. **Create New Route Version**
   ```typescript
   // app/api/chat/projects/[projectId]/v2/route.ts
   // New LangGraph-based implementation
   ```

2. **A/B Testing**
   ```typescript
   // Route based on feature flag or user segment
   if (FEATURES.USE_LANGGRAPH) {
     return handleLangGraphRequest(req, params);
   }
   return handleLegacyRequest(req, params);
   ```

3. **Gradual Rollout**
   - 10% traffic -> monitor errors
   - 50% traffic -> compare latency
   - 100% traffic -> deprecate legacy

### Phase 4: Cleanup (Week 4)

1. **Remove Legacy Code**
   - Delete old route.ts implementation
   - Remove /save endpoint (now integrated)
   - Update frontend to remove save callback

2. **Documentation**
   - Update API docs
   - Add architecture diagrams
   - Write runbook for debugging

---

## 10. Error Handling & Recovery

### Retry Logic

```typescript
// lib/langgraph/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; delay: number } = { maxRetries: 3, delay: 1000 }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt < options.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, options.delay * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
```

### Graceful Degradation

```typescript
// In API route
try {
  // Attempt LangGraph execution
  const result = await withRetry(() => graph.invoke(state, config));
  return streamResponse(result);
} catch (graphError) {
  console.error('LangGraph failed, falling back to simple chain:', graphError);

  // Fallback to simple LLM call
  const fallbackResponse = await streamingLLM.stream(buildSimplePrompt(state));
  return streamFallbackResponse(fallbackResponse);
}
```

---

## 11. Monitoring & Observability

### LangSmith Integration

```typescript
// lib/langgraph/tracing.ts
import { Client } from "langsmith";

export const langsmithClient = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

// In graph nodes
export async function intakeNode(state: PRDGraphStateType) {
  return await langsmithClient.trace(
    "intake-node",
    async () => {
      // ... node logic
    },
    { metadata: { projectId: state.projectId } }
  );
}
```

### Metrics

```typescript
// Key metrics to track:
// - Graph execution time (p50, p95, p99)
// - Token usage per node
// - Routing distribution (intake vs extraction vs generation)
// - Checkpoint save/load latency
// - Error rates by node type
```

---

## 12. Testing Strategy

### Unit Tests

```typescript
// __tests__/langgraph/agents/router.test.ts
import { describe, it, expect, vi } from 'vitest';
import { routerNode } from '@/lib/langgraph/agents/router';
import { HumanMessage } from '@langchain/core/messages';

describe('Router Agent', () => {
  it('routes to generation on stop trigger', async () => {
    const state = {
      messages: [new HumanMessage("nope, that's enough")],
      projectName: 'Test',
      projectVision: 'A test app',
      actors: [{ name: 'User', role: 'Primary' }],
      useCases: [],
      systemBoundaries: { internal: [], external: ['API'] },
      currentArtifact: 'context_diagram',
      completeness: 20,
    };

    const result = await routerNode(state);
    expect(result.shouldGenerate).toBe(true);
  });

  it('routes to intake for new requirements', async () => {
    const state = {
      messages: [new HumanMessage("We need user authentication")],
      // ... minimal state
    };

    const result = await routerNode(state);
    expect(result.intent).toBe('intake');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/langgraph/full-flow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildPRDGraph } from '@/lib/langgraph/graph';
import { HumanMessage } from '@langchain/core/messages';

describe('PRD Graph Full Flow', () => {
  let graph: ReturnType<typeof buildPRDGraph>;

  beforeEach(() => {
    graph = buildPRDGraph();
  });

  it('completes intake -> extraction -> generation flow', async () => {
    const initialState = {
      messages: [new HumanMessage("Build a task management app for teams")],
      projectName: 'TaskFlow',
      projectVision: 'A collaborative task manager',
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      currentArtifact: 'context_diagram',
      completeness: 0,
    };

    const result = await graph.invoke(initialState);

    expect(result.actors.length).toBeGreaterThan(0);
    expect(result.response).toBeDefined();
    expect(result.completeness).toBeGreaterThan(0);
  });
});
```

---

## 13. File Structure Summary

```
apps/product-helper/
+-- app/
|   +-- api/
|       +-- chat/
|           +-- projects/
|               +-- [projectId]/
|                   +-- route.ts        # Refactored with LangGraph
+-- lib/
|   +-- langgraph/                       # NEW DIRECTORY
|   |   +-- state.ts                     # Graph state annotation
|   |   +-- types.ts                     # Type definitions
|   |   +-- graph.ts                     # Graph builder
|   |   +-- checkpointer.ts              # Postgres checkpointer
|   |   +-- utils/
|   |   |   +-- retry.ts
|   |   |   +-- reducers.ts
|   |   +-- agents/
|   |       +-- router.ts                # Intent classification
|   |       +-- intake.ts                # Requirements gathering
|   |       +-- extraction.ts            # Data extraction
|   |       +-- generation.ts            # Artifact generation
|   +-- db/
|       +-- schema.ts                    # + graphCheckpoints table
+-- __tests__/
    +-- langgraph/
        +-- agents/
        |   +-- router.test.ts
        |   +-- intake.test.ts
        +-- integration/
            +-- full-flow.test.ts
```

---

## 14. Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Response latency (p95) | ~800ms | <500ms | LangSmith traces |
| Extraction accuracy | Manual | 85%+ | Validation against gold set |
| Artifact generation rate | N/A | 3 artifacts/session | DB analytics |
| Error rate | 2% | <0.5% | Error logging |
| State recovery success | N/A | 99.9% | Checkpoint restore tests |

---

## 15. Open Questions

1. **Checkpointing Frequency**: Should we checkpoint after every node or only at persist node?
   - Recommendation: Every node for full recovery capability

2. **Message Retention**: How long to keep graph checkpoints?
   - Recommendation: 30 days, then archive to cold storage

3. **Concurrent Edits**: How to handle multiple users on same project?
   - Recommendation: Optimistic locking with conflict detection

4. **Streaming Granularity**: Stream individual tokens or batched chunks?
   - Recommendation: Individual tokens for responsive UX

---

## Appendix A: Dependencies

```json
{
  "dependencies": {
    "@langchain/langgraph": "^0.2.57",
    "@langchain/core": "^0.3.43",
    "@langchain/openai": "^0.4.9",
    "ai": "^3.1.12"
  }
}
```

Dependencies already present in `package.json`. No new packages required.

---

## Appendix B: Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...

# Optional (for LangSmith tracing)
LANGSMITH_API_KEY=ls-...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=product-helper-prd
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-16
**Author**: Backend Architect (Agent 1.1)
**Reviewed By**: Platform Engineering Team
