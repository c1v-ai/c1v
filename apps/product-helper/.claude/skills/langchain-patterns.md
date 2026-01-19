# LangChain & LangGraph Patterns

Best practices for LangChain.js and LangGraph development in the product-helper codebase.

## LangGraph State Management

### Define Typed State
```typescript
// lib/langchain/graphs/state.ts
import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

// Extend MessagesAnnotation for chat-based workflows
export const IntakeStateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  projectId: Annotation<string>(),
  phase: Annotation<string>(),
  collectedData: Annotation<Record<string, unknown>>({
    default: () => ({}),
    reducer: (current, update) => ({ ...current, ...update }),
  }),
  validationScore: Annotation<number>({
    default: () => 0,
  }),
});

export type IntakeState = typeof IntakeStateAnnotation.State;
```

### Build Graphs with Clear Node Structure
```typescript
// lib/langchain/graphs/intake-graph.ts
import { StateGraph, START, END } from '@langchain/langgraph';

const graph = new StateGraph(IntakeStateAnnotation)
  .addNode('analyze', analyzeResponseNode)
  .addNode('validate', validateDataNode)
  .addNode('generate_question', generateQuestionNode)
  .addNode('complete', completeIntakeNode)
  .addEdge(START, 'analyze')
  .addEdge('analyze', 'validate')
  .addConditionalEdges('validate', routeAfterValidation, {
    continue: 'generate_question',
    complete: 'complete',
  })
  .addEdge('generate_question', END)
  .addEdge('complete', END);

export const intakeGraph = graph.compile();
```

### Conditional Routing
```typescript
// Return literal string keys matching addConditionalEdges options
function routeAfterValidation(state: IntakeState): 'continue' | 'complete' {
  if (state.validationScore >= 80 && hasRequiredFields(state)) {
    return 'complete';
  }
  return 'continue';
}
```

## Node Implementation

### Node Structure Pattern
```typescript
// lib/langchain/graphs/nodes/analyze-response.ts
import { IntakeState } from '../state';

export async function analyzeResponseNode(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const lastMessage = state.messages[state.messages.length - 1];

  if (!lastMessage || lastMessage.getType() !== 'human') {
    return {}; // No update needed
  }

  const analysis = await analyzeWithLLM(lastMessage.content);

  // Return only the fields to update (reducer handles merge)
  return {
    collectedData: analysis.extractedData,
    phase: analysis.suggestedPhase,
  };
}
```

### Error Handling in Nodes
```typescript
export async function analyzeResponseNode(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  try {
    const result = await performAnalysis(state);
    return result;
  } catch (error) {
    console.error('[analyze-response] Error:', error);
    // Return safe defaults, don't crash the graph
    return {
      collectedData: { error: 'Analysis failed' },
    };
  }
}
```

## LLM Configuration

### Model Initialization
```typescript
// lib/langchain/models.ts
import { ChatOpenAI } from '@langchain/openai';

// For analysis/extraction tasks
export const analysisModel = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.1,  // Low temperature for consistent extraction
  maxTokens: 1000,
});

// For generation tasks
export const generationModel = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,  // Higher for creative responses
  maxTokens: 2000,
});
```

### Structured Output with Zod
```typescript
import { z } from 'zod';

const extractionSchema = z.object({
  actors: z.array(z.object({
    name: z.string(),
    type: z.enum(['human', 'system', 'external']),
  })),
  useCases: z.array(z.string()),
  boundaries: z.array(z.string()),
});

export async function extractProjectData(text: string) {
  const structuredModel = analysisModel.withStructuredOutput(extractionSchema);
  return await structuredModel.invoke([
    { role: 'system', content: EXTRACTION_PROMPT },
    { role: 'user', content: text },
  ]);
}
```

## Prompt Engineering

### System Prompts as Constants
```typescript
// lib/langchain/prompts/intake-prompts.ts
export const INTAKE_SYSTEM_PROMPT = `You are a product requirements analyst helping users define their software projects.

Your role:
1. Ask clarifying questions to understand the project
2. Extract actors, use cases, and system boundaries
3. Validate completeness against SR-CORNELL criteria

Guidelines:
- Ask ONE question at a time
- Reference previous answers to show understanding
- Focus on concrete, measurable requirements`;

export const EXTRACTION_PROMPT = `Extract structured data from the user's response.

Output ONLY valid JSON matching this schema:
- actors: Array of {name, type}
- useCases: Array of strings
- boundaries: Array of strings

If information is not present, use empty arrays.`;
```

### Dynamic Prompt Building
```typescript
export function buildQuestionPrompt(
  phase: string,
  collectedData: Record<string, unknown>,
  validationGaps: string[]
): string {
  const context = Object.entries(collectedData)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `Current phase: ${phase}

Collected data so far:
${context}

Validation gaps to address:
${validationGaps.map(g => `- ${g}`).join('\n')}

Generate the next question to fill these gaps.`;
}
```

## Streaming Responses

### Stream Graph Execution
```typescript
// app/api/chat/route.ts
import { intakeGraph } from '@/lib/langchain/graphs/intake-graph';

export async function POST(request: Request) {
  const { messages, projectId } = await request.json();

  const stream = intakeGraph.stream(
    { messages, projectId },
    { streamMode: 'messages' }
  );

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const data = JSON.stringify(chunk) + '\n';
          controller.enqueue(new TextEncoder().encode(data));
        }
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}
```

### Client-Side Stream Handling
```typescript
'use client';

export function useIntakeChat(projectId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [...messages, { role: 'user', content }], projectId }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      // Process streaming chunk
      handleStreamChunk(chunk);
    }
    setIsLoading(false);
  };

  return { messages, sendMessage, isLoading };
}
```

## Testing LangGraph

### Unit Testing Nodes
```typescript
// lib/langchain/graphs/__tests__/analyze-response.test.ts
import { describe, it, expect, vi } from 'vitest';
import { analyzeResponseNode } from '../nodes/analyze-response';

describe('analyzeResponseNode', () => {
  it('should extract actors from user message', async () => {
    const state = {
      messages: [
        { getType: () => 'human', content: 'The admin manages users' },
      ],
      collectedData: {},
    };

    const result = await analyzeResponseNode(state as any);

    expect(result.collectedData).toHaveProperty('actors');
    expect(result.collectedData.actors).toContainEqual(
      expect.objectContaining({ name: 'admin' })
    );
  });

  it('should handle empty messages gracefully', async () => {
    const state = { messages: [], collectedData: {} };
    const result = await analyzeResponseNode(state as any);
    expect(result).toEqual({});
  });
});
```

### Integration Testing Graphs
```typescript
// lib/langchain/graphs/__tests__/intake-graph.test.ts
import { describe, it, expect } from 'vitest';
import { intakeGraph } from '../intake-graph';

describe('intakeGraph', () => {
  it('should complete intake flow with sufficient data', async () => {
    const initialState = {
      messages: [
        { role: 'user', content: 'I want to build a todo app' },
      ],
      projectId: 'test-project',
    };

    // Run graph to completion
    const result = await intakeGraph.invoke(initialState);

    expect(result.phase).toBe('complete');
    expect(result.validationScore).toBeGreaterThan(0);
  });
});
```

## Common Pitfalls

### Avoid These Patterns

```typescript
// BAD: Mutating state directly
function badNode(state: IntakeState) {
  state.collectedData.actors = []; // Mutation!
  return state;
}

// GOOD: Return partial updates
function goodNode(state: IntakeState) {
  return {
    collectedData: { actors: [] }, // Reducer handles merge
  };
}
```

```typescript
// BAD: Synchronous LLM calls without error handling
function badNode(state: IntakeState) {
  const result = model.invoke(prompt); // Missing await, no try/catch
  return { data: result };
}

// GOOD: Async with proper error handling
async function goodNode(state: IntakeState) {
  try {
    const result = await model.invoke(prompt);
    return { data: result };
  } catch (error) {
    console.error('[node-name]', error);
    return { error: 'LLM call failed' };
  }
}
```

```typescript
// BAD: Hardcoded model in node
function badNode(state: IntakeState) {
  const model = new ChatOpenAI({ modelName: 'gpt-4o' });
  // ...
}

// GOOD: Import configured model
import { analysisModel } from '@/lib/langchain/models';

function goodNode(state: IntakeState) {
  // Use shared, configured model instance
  const result = await analysisModel.invoke(prompt);
}
```

## References

- See `lib/langchain/graphs/` for graph implementations
- See `lib/langchain/agents/` for agent patterns
- See `lib/langchain/prompts/` for prompt templates
