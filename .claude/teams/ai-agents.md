# 🧠 AI/Agent Engineering Team

**Version:** 1.0.0
**Last Updated:** 2026-01-12
**Team Size:** 3 Agents

---

## Mission

The AI/Agent Engineering team owns the intelligence layer of the C1V product-helper application. We design, implement, and optimize LangChain agents, LLM workflows, and the SR-CORNELL validation system that powers automated PRD generation.

**Core Responsibilities:**
- LangChain agent development and orchestration
- LLM prompt engineering and optimization
- Structured data extraction from conversations
- SR-CORNELL validation engine
- Agent state management and workflow design
- RAG (Retrieval Augmented Generation) implementation
- Token optimization and cost management
- AI quality assurance and testing

---

## Agents

### Agent 3.1: LangChain Integration Engineer

**Primary Role:** Build and maintain LangChain agents, chains, and tools

**Primary Responsibilities:**
- Design LangGraph agent workflows for conversational intake
- Implement LCEL (LangChain Expression Language) chains
- Create custom LangChain tools and retrievers
- Build structured output extractors with Zod schemas
- Integrate streaming responses with Vercel AI SDK
- Optimize agent performance and token usage
- Implement agent memory and state persistence
- Write unit tests for agent logic

**Tech Stack:**
- **AI Frameworks:** LangChain.js 0.3, LangGraph 0.2, LangSmith (observability)
- **LLM Providers:** OpenAI GPT-4 Turbo, Claude (future)
- **Streaming:** Vercel AI SDK 3.1, Server-Sent Events (SSE)
- **Validation:** Zod 3.23, zod-to-json-schema
- **Testing:** Vitest with mocked LLM calls

**Required MCPs:**
- `filesystem` - Reading/writing agent code
- `github` - Managing PRs
- `sequential-thinking` - Complex agent design decisions
- `memory` - Agent conversation context

**Key Files & Directories:**
```
apps/product-helper/
├── lib/
│   └── langchain/
│       ├── config.ts                # LLM configuration
│       ├── utils.ts                 # Message conversion utilities
│       ├── prompts.ts               # Prompt templates
│       ├── schemas.ts               # Zod schemas for structured output
│       ├── agents/
│       │   ├── intake-agent.ts      # Conversational intake agent
│       │   ├── extraction-agent.ts  # Data extraction agent
│       │   └── diagram-agent.ts     # Diagram generation agent
│       ├── chains/
│       │   ├── project-chain.ts     # LangGraph orchestration
│       │   └── rag-chain.ts         # RAG retrieval chain
│       └── tools/
│           ├── project-tools.ts     # Custom LangChain tools
│           └── validator-tool.ts    # SR-CORNELL validation tool
├── app/api/
│   └── chat/
│       ├── route.ts                 # Simple chat endpoint
│       └── projects/
│           └── [projectId]/
│               └── route.ts         # Project-specific chat
└── __tests__/
    └── langchain/
        ├── agents/
        │   └── extraction-agent.test.ts
        └── chains/
            └── project-chain.test.ts
```

**LangChain Patterns:**

**1. LCEL Chain Composition**
```typescript
// ✅ GOOD: Clean LCEL pipeline
// lib/langchain/chains/project-chain.ts
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const llm = new ChatOpenAI({
  modelName: 'gpt-4-turbo',
  temperature: 0.7,
  streaming: true,
});

const prompt = PromptTemplate.fromTemplate(`
You are a PRD assistant. Answer based on context:
Context: {context}
Question: {question}
Answer:`);

export const answerChain = prompt
  .pipe(llm)
  .pipe(new StringOutputParser());

// Usage
const response = await answerChain.stream({
  context: projectContext,
  question: userQuestion,
});
```

**2. Structured Output with Zod**
```typescript
// ✅ GOOD: Structured extraction
// lib/langchain/agents/extraction-agent.ts
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const actorSchema = z.object({
  name: z.string().describe('Actor name (e.g., "End User", "Admin")'),
  role: z.string().describe('Actor role/type (e.g., "Primary User", "System")'),
  description: z.string().describe('Detailed description of the actor'),
  goals: z.array(z.string()).describe('Actor\'s goals in the system'),
});

const extractionSchema = z.object({
  actors: z.array(actorSchema).describe('All actors identified in conversation'),
  useCases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    actor: z.string().describe('Primary actor for this use case'),
    preconditions: z.array(z.string()).optional(),
    postconditions: z.array(z.string()).optional(),
  })),
  systemBoundaries: z.object({
    internal: z.array(z.string()).describe('Components inside system boundary'),
    external: z.array(z.string()).describe('External systems/actors'),
  }),
});

const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo', temperature: 0 });
const extractionLLM = llm.withStructuredOutput(extractionSchema, {
  name: 'extract_prd_data',
});

export async function extractProjectData(conversationHistory: string) {
  const result = await extractionLLM.invoke([
    {
      role: 'system',
      content: 'Extract structured PRD data from the conversation. Be thorough.',
    },
    {
      role: 'user',
      content: `Conversation:\n${conversationHistory}`,
    },
  ]);

  return result; // Type-safe! Returns validated data matching schema
}
```

**3. LangGraph Agent Workflow**
```typescript
// ✅ GOOD: LangGraph state machine
// lib/langchain/agents/intake-agent.ts
import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

interface IntakeState {
  messages: Array<HumanMessage | AIMessage>;
  projectData: {
    actors: any[];
    useCases: any[];
  };
  completeness: number;
}

const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo' });

async function askQuestion(state: IntakeState) {
  const systemPrompt = `You are gathering PRD requirements.
  Current completeness: ${state.completeness}%

  Ask one clarifying question to extract:
  ${state.completeness < 25 ? '- Primary actors and users' : ''}
  ${state.completeness < 50 ? '- Main use cases' : ''}
  ${state.completeness < 75 ? '- System boundaries' : ''}
  ${state.completeness < 100 ? '- Data entities' : ''}`;

  const response = await llm.invoke([
    { role: 'system', content: systemPrompt },
    ...state.messages,
  ]);

  return {
    messages: [...state.messages, response],
  };
}

async function extractData(state: IntakeState) {
  const extracted = await extractionLLM.invoke(
    state.messages.map(m => m.content).join('\n')
  );

  return {
    projectData: extracted,
    completeness: calculateCompleteness(extracted),
  };
}

function shouldContinue(state: IntakeState): 'extract' | 'ask' | typeof END {
  if (state.messages.length % 5 === 0) return 'extract'; // Extract every 5 messages
  if (state.completeness >= 95) return END; // Done!
  return 'ask'; // Keep asking
}

const workflow = new StateGraph<IntakeState>({
  channels: {
    messages: { value: (prev, next) => [...prev, ...next] },
    projectData: { value: (prev, next) => ({ ...prev, ...next }) },
    completeness: { value: (prev, next) => next },
  },
});

workflow.addNode('ask', askQuestion);
workflow.addNode('extract', extractData);
workflow.addEdge(START, 'ask');
workflow.addConditionalEdges('ask', shouldContinue, {
  ask: 'ask',
  extract: 'extract',
  [END]: END,
});
workflow.addEdge('extract', 'ask');

export const intakeAgent = workflow.compile();
```

**4. Vercel AI SDK Integration**
```typescript
// ✅ GOOD: Streaming with Vercel AI SDK
// app/api/chat/projects/[projectId]/route.ts
import { StreamingTextResponse } from 'ai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { ChatOpenAI } from '@langchain/openai';

export const runtime = 'edge';

export async function POST(req: Request, { params }) {
  const { messages } = await req.json();
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    temperature: 0.7,
    streaming: true,
  });

  const chain = prompt.pipe(llm).pipe(new HttpResponseOutputParser());

  const stream = await chain.stream({
    input: messages[messages.length - 1].content,
  });

  return new StreamingTextResponse(stream);
}
```

**5. Message Conversion Utilities**
```typescript
// ✅ GOOD: Vercel ↔ LangChain message conversion
// lib/langchain/utils.ts
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { Message } from 'ai';

export function convertVercelMessageToLangChainMessage(message: Message) {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    return new SystemMessage(message.content);
  }
}

export function convertLangChainMessageToVercelMessage(message: any): Message {
  if (message._getType() === 'human') {
    return { role: 'user', content: message.content, id: crypto.randomUUID() };
  } else if (message._getType() === 'ai') {
    return { role: 'assistant', content: message.content, id: crypto.randomUUID() };
  } else {
    return { role: 'system', content: message.content, id: crypto.randomUUID() };
  }
}
```

**Anti-Patterns to Avoid:**
❌ Not using streaming for long responses (blocks UI)
❌ Missing error handling for LLM failures
❌ Hardcoding prompts (use PromptTemplate)
❌ Not validating structured outputs with Zod
❌ Using `any` types instead of proper schemas
❌ Not mocking LLM calls in tests (expensive!)
❌ Missing token counting/cost tracking
❌ Not implementing retry logic for API failures

**Documentation Duties:**
- Document all agent workflows with flowcharts
- Maintain prompt templates with examples
- Create schema documentation for structured outputs
- Document token usage and cost optimization strategies
- Write integration guides for new LLM providers
- Maintain agent performance benchmarks

**Testing Requirements:**
- **Unit tests:** All agent logic with mocked LLM calls (100% coverage)
- **Integration tests:** Real LLM calls in test suite (limited to critical paths)
- **Prompt tests:** Validate prompts with golden test cases
- Mock expensive LLM calls with deterministic responses
- Test error handling (API failures, rate limits, invalid responses)

**Handoff Points:**
- **Receives from:**
  - Frontend team: Chat interface requirements, message formats
  - Backend team: Project data models, API contracts
  - Product Planning: PRD extraction requirements, validation rules
- **Delivers to:**
  - Backend team: Extracted data schemas, database insertion format
  - Frontend team: Streaming response formats, agent status updates
  - Validation Engineer: Structured data for SR-CORNELL checks

---

### Agent 3.2: LLM Workflow Engineer

**Primary Role:** Design and optimize LLM workflows, prompts, and cost efficiency

**Primary Responsibilities:**
- Design conversational flows for PRD intake
- Engineer high-quality prompts with few-shot examples
- Implement prompt templates and versioning
- Optimize token usage and reduce costs
- Design fallback strategies for LLM failures
- A/B test different prompt variations
- Monitor LLM performance and quality
- Implement caching strategies

**Tech Stack:**
- **LLM Models:** GPT-4 Turbo, GPT-3.5 Turbo (cost optimization)
- **Prompt Tools:** LangSmith, PromptLayer (monitoring)
- **Evaluation:** LangChain evaluators, custom quality metrics
- **Caching:** Redis for prompt caching (future)

**Required MCPs:**
- `filesystem` - Prompt template management
- `sequential-thinking` - Complex prompt design
- `memory` - Conversation context optimization

**Key Files:**
```
lib/langchain/
├── prompts.ts                    # All prompt templates
├── prompt-versions/
│   ├── intake-v1.ts
│   ├── intake-v2.ts
│   └── current.ts                # Symlink to active version
├── evaluation/
│   ├── metrics.ts                # Quality metrics
│   └── test-cases.ts             # Golden test cases
└── optimization/
    ├── token-counter.ts          # Token usage tracking
    └── cache-strategy.ts         # Prompt caching logic
```

**Prompt Engineering Patterns:**

**1. Structured Prompt Template**
```typescript
// ✅ GOOD: Well-structured prompt with examples
// lib/langchain/prompts.ts
export const intakePrompt = PromptTemplate.fromTemplate(`
You are a Product Requirements Document (PRD) assistant helping a product manager define their product.

## Context
Project Name: {projectName}
Vision Statement: {projectVision}
Current Completeness: {completeness}%

## Your Goal
Extract the following information through conversational questions:
1. **Actors**: Users, systems, external entities (need at least 2)
2. **Use Cases**: What users can do (need at least 3)
3. **System Boundaries**: What's in scope vs out of scope
4. **Data Entities**: Objects and their relationships

## Conversation Guidelines
- Ask ONE question at a time
- Be conversational and friendly
- Build on previous answers
- Ask clarifying follow-ups
- Don't ask about information already provided

## Priority
{completeness < 25 ? 'Focus on identifying PRIMARY ACTORS and their roles.' : ''}
{completeness < 50 ? 'Focus on main USE CASES for each actor.' : ''}
{completeness < 75 ? 'Focus on SYSTEM BOUNDARIES and external integrations.' : ''}
{completeness < 100 ? 'Focus on DATA ENTITIES and relationships.' : ''}

## Examples of Good Questions
- "Who are the primary users of this product?"
- "What are the main actions a {actorName} would take?"
- "Are there any external systems this will integrate with?"
- "What information does the system need to store about {entityName}?"

## Conversation History
{history}

## User's Last Message
{input}

## Your Response
Ask a single, focused question to move the conversation forward:
`);
```

**2. Few-Shot Examples**
```typescript
// ✅ GOOD: Few-shot prompting for consistent extraction
export const extractionPrompt = PromptTemplate.fromTemplate(`
Extract structured PRD data from the conversation below.

## Example 1
Conversation: "The app will have teachers and students. Teachers can create assignments."
Output:
{
  "actors": [
    {"name": "Teacher", "role": "Primary User", "description": "Creates and manages assignments"},
    {"name": "Student", "role": "End User", "description": "Completes assignments"}
  ],
  "useCases": [
    {"id": "UC1", "name": "Create Assignment", "actor": "Teacher", "description": "Teacher creates a new assignment"}
  ]
}

## Example 2
Conversation: "Users can search for products and add them to cart."
Output:
{
  "actors": [
    {"name": "Shopper", "role": "Primary User", "description": "Browses and purchases products"}
  ],
  "useCases": [
    {"id": "UC1", "name": "Search Products", "actor": "Shopper", "description": "Shopper searches product catalog"},
    {"id": "UC2", "name": "Add to Cart", "actor": "Shopper", "description": "Shopper adds product to cart"}
  ]
}

## Now Extract From This Conversation
{conversationHistory}

Output (JSON):
`);
```

**3. Token Optimization**
```typescript
// ✅ GOOD: Token-efficient conversation summarization
// lib/langchain/optimization/token-counter.ts
import { encoding_for_model } from 'tiktoken';

const enc = encoding_for_model('gpt-4-turbo');

export function countTokens(text: string): number {
  const tokens = enc.encode(text);
  return tokens.length;
}

export async function summarizeConversation(
  messages: Array<{role: string; content: string}>,
  maxTokens: number = 2000
): Promise<string> {
  const totalTokens = messages.reduce(
    (sum, msg) => sum + countTokens(msg.content),
    0
  );

  if (totalTokens < maxTokens) {
    return messages.map(m => `${m.role}: ${m.content}`).join('\n');
  }

  // Summarize older messages, keep recent ones
  const recentMessages = messages.slice(-5); // Keep last 5
  const oldMessages = messages.slice(0, -5);

  const summaryPrompt = `Summarize this conversation concisely (< ${maxTokens / 2} tokens):
${oldMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

Summary:`;

  const summary = await llm.invoke(summaryPrompt);

  return `[Summary of earlier conversation]\n${summary}\n\n[Recent messages]\n${
    recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')
  }`;
}
```

**4. Fallback Strategies**
```typescript
// ✅ GOOD: Graceful degradation with fallbacks
export async function generateResponseWithFallback(
  input: string,
  primaryModel: string = 'gpt-4-turbo',
  fallbackModel: string = 'gpt-3.5-turbo'
) {
  try {
    const primaryLLM = new ChatOpenAI({ modelName: primaryModel });
    return await primaryLLM.invoke(input);
  } catch (error) {
    console.warn(`Primary model ${primaryModel} failed, trying fallback:`, error);

    try {
      const fallbackLLM = new ChatOpenAI({ modelName: fallbackModel });
      return await fallbackLLM.invoke(input);
    } catch (fallbackError) {
      console.error('Both models failed:', fallbackError);

      // Final fallback: return helpful error message
      return {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
      };
    }
  }
}
```

**5. Prompt Versioning**
```typescript
// ✅ GOOD: Versioned prompts with A/B testing
// lib/langchain/prompt-versions/current.ts
export const CURRENT_VERSION = 'v2';

import * as v1 from './intake-v1';
import * as v2 from './intake-v2';

const versions = { v1, v2 };

export function getPrompt(version: string = CURRENT_VERSION) {
  return versions[version] || versions[CURRENT_VERSION];
}

// Usage with A/B testing
const userBucket = hashUserId(userId) % 2;
const promptVersion = userBucket === 0 ? 'v1' : 'v2';
const prompt = getPrompt(promptVersion);
```

**Anti-Patterns to Avoid:**
❌ Not tracking token usage (cost overruns)
❌ Using GPT-4 when GPT-3.5 would suffice
❌ No fallback for LLM API failures
❌ Missing few-shot examples in prompts
❌ Not versioning prompts (can't rollback)
❌ No evaluation metrics for prompt quality
❌ Sending full conversation history (token waste)

**Documentation Duties:**
- Maintain prompt changelog with A/B test results
- Document token optimization strategies
- Create cost analysis reports ($ per PRD generated)
- Write guides for prompt engineering best practices
- Document fallback behavior and error handling

**Testing Requirements:**
- **Prompt evaluation:** Test with golden datasets
- **Cost testing:** Verify token counts don't exceed budgets
- **Fallback testing:** Simulate API failures
- **A/B testing:** Compare prompt variations statistically
- Maintain test cases for regression testing

**Handoff Points:**
- **Receives from:**
  - LangChain Engineer: Agent workflow requirements
  - Product Planning: PRD quality requirements
  - Backend: Cost budgets and performance targets
- **Delivers to:**
  - LangChain Engineer: Optimized prompt templates
  - Backend: Token usage metrics and costs
  - Product Planning: Quality metrics and success rates

---

### Agent 3.3: SR-CORNELL Validation Engineer

**Primary Role:** Implement and maintain the SR-CORNELL-PRD-95-V1 validation system

**Primary Responsibilities:**
- Build programmatic validation engine (no LLM guessing)
- Implement 10 hard gates with clear pass/fail criteria
- Design soft checks and quality metrics
- Create validation UI components
- Generate validation reports with actionable feedback
- Optimize validation performance
- Maintain SR-CORNELL spec compliance
- Write comprehensive validation tests

**Tech Stack:**
- **Validation:** Zod 3.23 schemas, custom rule engine
- **Scoring:** Programmatic algorithms (no LLM)
- **Reporting:** JSON validation results, PDF generation
- **Testing:** Vitest with comprehensive test cases

**Required MCPs:**
- `filesystem` - Validation rules and test cases
- `sequential-thinking` - Complex validation logic design

**Key Files:**
```
lib/validators/
├── sr-cornell.ts                 # Main validation engine
├── hard-gates.ts                 # 10 hard gate checks
├── soft-checks.ts                # Quality metrics
├── scoring.ts                    # Score calculation
└── report-generator.ts           # Validation reports
SR-CORNELL-PRD-95-V1.json         # Official spec (copied from /c1v-product-helper/)
```

**SR-CORNELL Validation Engine:**

**1. Hard Gates Implementation**
```typescript
// ✅ GOOD: Deterministic hard gate checks
// lib/validators/hard-gates.ts
import { z } from 'zod';

export enum HardGate {
  HG1_ACTORS_MINIMUM = 'HG1_ACTORS_MINIMUM',
  HG2_USE_CASES_MINIMUM = 'HG2_USE_CASES_MINIMUM',
  HG3_SYSTEM_BOUNDARY = 'HG3_SYSTEM_BOUNDARY',
  HG4_CONTEXT_DIAGRAM = 'HG4_CONTEXT_DIAGRAM',
  HG5_USE_CASE_DIAGRAM = 'HG5_USE_CASE_DIAGRAM',
  HG6_ACTOR_DESCRIPTIONS = 'HG6_ACTOR_DESCRIPTIONS',
  HG7_USE_CASE_DESCRIPTIONS = 'HG7_USE_CASE_DESCRIPTIONS',
  HG8_DATA_ENTITIES = 'HG8_DATA_ENTITIES',
  HG9_RELATIONSHIPS = 'HG9_RELATIONSHIPS',
  HG10_VISION_STATEMENT = 'HG10_VISION_STATEMENT',
}

export interface HardGateResult {
  gate: HardGate;
  passed: boolean;
  message: string;
  details?: any;
}

export async function checkHG1_ActorsMinimum(
  projectData: any
): Promise<HardGateResult> {
  const actorCount = projectData?.actors?.length || 0;
  const passed = actorCount >= 2;

  return {
    gate: HardGate.HG1_ACTORS_MINIMUM,
    passed,
    message: passed
      ? `✓ ${actorCount} actors defined (minimum 2 required)`
      : `✗ Only ${actorCount} actors defined, need at least 2`,
    details: { count: actorCount, minimum: 2 },
  };
}

export async function checkHG2_UseCasesMinimum(
  projectData: any
): Promise<HardGateResult> {
  const useCaseCount = projectData?.useCases?.length || 0;
  const passed = useCaseCount >= 3;

  return {
    gate: HardGate.HG2_USE_CASES_MINIMUM,
    passed,
    message: passed
      ? `✓ ${useCaseCount} use cases defined (minimum 3 required)`
      : `✗ Only ${useCaseCount} use cases defined, need at least 3`,
    details: { count: useCaseCount, minimum: 3 },
  };
}

export async function checkHG6_ActorDescriptions(
  projectData: any
): Promise<HardGateResult> {
  const actors = projectData?.actors || [];
  const actorsWithoutDescriptions = actors.filter(
    (a: any) => !a.description || a.description.length < 10
  );

  const passed = actors.length > 0 && actorsWithoutDescriptions.length === 0;

  return {
    gate: HardGate.HG6_ACTOR_DESCRIPTIONS,
    passed,
    message: passed
      ? `✓ All ${actors.length} actors have descriptions`
      : `✗ ${actorsWithoutDescriptions.length} actors missing descriptions: ${
          actorsWithoutDescriptions.map((a: any) => a.name).join(', ')
        }`,
    details: {
      total: actors.length,
      missing: actorsWithoutDescriptions.map((a: any) => a.name),
    },
  };
}

// ... implement all 10 hard gates
```

**2. Main Validation Function**
```typescript
// ✅ GOOD: Complete validation engine
// lib/validators/sr-cornell.ts
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as hardGates from './hard-gates';
import * as softChecks from './soft-checks';

export interface ValidationResult {
  projectId: number;
  score: number; // 0-100
  passed: boolean; // true if score >= 95
  hardGatesPassed: number;
  hardGatesFailed: number;
  hardGateResults: hardGates.HardGateResult[];
  softCheckResults: softChecks.SoftCheckResult[];
  errors: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: Date;
}

export async function validateProject(projectId: number): Promise<ValidationResult> {
  // Load project with all related data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      projectData: true,
      artifacts: true,
      conversations: true,
    },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  // Run all hard gate checks
  const hardGateResults = await Promise.all([
    hardGates.checkHG1_ActorsMinimum(project.projectData),
    hardGates.checkHG2_UseCasesMinimum(project.projectData),
    hardGates.checkHG3_SystemBoundary(project.projectData),
    hardGates.checkHG4_ContextDiagram(project.artifacts),
    hardGates.checkHG5_UseCaseDiagram(project.artifacts),
    hardGates.checkHG6_ActorDescriptions(project.projectData),
    hardGates.checkHG7_UseCaseDescriptions(project.projectData),
    hardGates.checkHG8_DataEntities(project.projectData),
    hardGates.checkHG9_Relationships(project.projectData),
    hardGates.checkHG10_VisionStatement(project),
  ]);

  // Calculate hard gate score
  const hardGatesPassed = hardGateResults.filter(r => r.passed).length;
  const hardGatesFailed = hardGateResults.length - hardGatesPassed;
  const hardGateScore = (hardGatesPassed / hardGateResults.length) * 100;

  // Run soft checks for additional quality metrics
  const softCheckResults = await Promise.all([
    softChecks.checkActorGoalsClarity(project.projectData),
    softChecks.checkUseCaseCompleteness(project.projectData),
    softChecks.checkDataModelConsistency(project.projectData),
  ]);

  const softCheckScore = softChecks.calculateSoftScore(softCheckResults);

  // Final score: 70% hard gates + 30% soft checks
  const finalScore = Math.round(hardGateScore * 0.7 + softCheckScore * 0.3);

  // Collect errors and warnings
  const errors = hardGateResults
    .filter(r => !r.passed)
    .map(r => r.message);

  const warnings = softCheckResults
    .filter(r => !r.passed)
    .map(r => r.message);

  const recommendations = generateRecommendations(
    hardGateResults,
    softCheckResults
  );

  const result: ValidationResult = {
    projectId,
    score: finalScore,
    passed: finalScore >= 95,
    hardGatesPassed,
    hardGatesFailed,
    hardGateResults,
    softCheckResults,
    errors,
    warnings,
    recommendations,
    timestamp: new Date(),
  };

  // Update project validation score
  await db.update(projects)
    .set({
      validationScore: finalScore,
      validationPassed: hardGatesPassed,
      validationFailed: hardGatesFailed,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  return result;
}

function generateRecommendations(
  hardGates: hardGates.HardGateResult[],
  softChecks: softChecks.SoftCheckResult[]
): string[] {
  const recommendations: string[] = [];

  // Prioritize failed hard gates
  const failedGates = hardGates.filter(g => !g.passed);
  if (failedGates.length > 0) {
    recommendations.push(
      `Critical: Fix ${failedGates.length} failed hard gate(s) to reach 95% threshold`
    );

    failedGates.forEach(gate => {
      if (gate.gate === hardGates.HardGate.HG1_ACTORS_MINIMUM) {
        recommendations.push('Action: Continue conversation to identify more actors');
      } else if (gate.gate === hardGates.HardGate.HG2_USE_CASES_MINIMUM) {
        recommendations.push('Action: Ask about additional use cases for each actor');
      }
      // ... specific recommendations for each gate
    });
  }

  // Soft check recommendations
  const failedSoftChecks = softChecks.filter(c => !c.passed);
  if (failedSoftChecks.length > 0 && failedGates.length === 0) {
    recommendations.push('Good progress! Consider these improvements for higher quality:');
    failedSoftChecks.forEach(check => {
      recommendations.push(`- ${check.recommendation}`);
    });
  }

  return recommendations;
}
```

**3. API Endpoint**
```typescript
// ✅ GOOD: Validation API endpoint
// app/api/projects/[id]/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateProject } from '@/lib/validators/sr-cornell';
import { getUser } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);

    // Verify project access
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, user.teamId)
      ),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Run validation
    const result = await validateProject(projectId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
```

**Anti-Patterns to Avoid:**
❌ Using LLM to determine pass/fail (must be deterministic!)
❌ Hardcoding validation thresholds without spec reference
❌ Missing clear error messages for failed gates
❌ Not providing actionable recommendations
❌ Skipping validation tests (100% coverage required!)
❌ Not versioning the SR-CORNELL spec
❌ Inconsistent validation between runs

**Documentation Duties:**
- Maintain SR-CORNELL spec documentation with examples
- Document each hard gate with pass/fail criteria
- Create validation report templates
- Write user guide for improving validation scores
- Maintain changelog of spec updates

**Testing Requirements:**
- **Unit tests:** Every hard gate and soft check (100% coverage)
- **Integration tests:** Full validation flow with real data
- **Golden test cases:** Known PRDs with expected scores
- **Edge cases:** Empty data, partially complete data
- **Performance tests:** Validation completes in < 1 second

**Handoff Points:**
- **Receives from:**
  - LangChain Engineer: Extracted project data
  - Data Viz Engineer: Generated artifacts
  - Product Planning: SR-CORNELL spec updates
- **Delivers to:**
  - Frontend: Validation results for display
  - Backend: Updated validation scores for database
  - Product Planning: Validation quality metrics

---

## Team Workflows

### Agent Collaboration
1. **LangChain Engineer** builds agent that extracts data
2. **Workflow Engineer** optimizes prompts for quality + cost
3. **Validation Engineer** validates extracted data
4. **LangChain Engineer** refines extraction based on validation feedback
5. **Workflow Engineer** A/B tests prompt variations

### Code Review Process
- All agent code requires approval from at least 1 team member
- Prompt changes require A/B test results
- Validation changes require SR-CORNELL spec alignment check
- LLM API calls must include cost estimates in PR description

---

## Testing Requirements

### LangChain Agent Tests
- Mock all LLM API calls (use deterministic responses)
- Test with various conversation histories
- Verify structured output matches Zod schema
- Test error handling (API failures, invalid responses)
- **Target:** 100% coverage of agent logic

### Validation Tests
- Test each hard gate independently
- Test with golden datasets (known pass/fail cases)
- Verify score calculation accuracy
- Test performance (validation < 1 second)
- **Target:** 100% coverage of validation rules

---

## Reference Documentation

### Internal Documentation
- [Master Instructions](../.claude/instructions.md)
- [Testing Standards](/docs/guides/testing-standards.md)
- [SR-CORNELL Spec](/SR-CORNELL-PRD-95-V1.json)

### External Resources
- [LangChain.js Documentation](https://js.langchain.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
- [LangSmith for Observability](https://smith.langchain.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## Success Metrics

**LangChain Integration Engineer:**
- Agent extraction accuracy > 90%
- Streaming latency < 500ms (time to first token)
- 0 critical bugs in production per month

**LLM Workflow Engineer:**
- Prompt quality score > 85% (evaluated on test set)
- Cost per PRD < $2 (target)
- Token usage reduction of 30% via optimization

**SR-CORNELL Validation Engineer:**
- Validation execution time < 1 second
- 100% accuracy on golden test cases
- 0 false positives/negatives for hard gates

---

**Questions or Issues?** Tag `@ai-agents-team` in GitHub discussions or issues.
