# LangChain Module Documentation

This directory contains all LangChain infrastructure for AI-powered PRD generation.

## Module Overview

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `config.ts` | LLM configurations | 46 | ✅ Complete |
| `utils.ts` | Message converters | 79 | ✅ Complete |
| `prompts.ts` | Prompt templates | 340 | ✅ Complete |
| `schemas.ts` | Zod schemas | 275 | ✅ Complete |

---

## Quick Start

### 1. Import LLM Configurations

```typescript
import {
  llm,           // Standard GPT-4 (temp 0.7)
  streamingLLM,  // Streaming GPT-4
  extractionLLM, // Deterministic (temp 0)
  cheapLLM       // GPT-3.5 for simple tasks
} from '@/lib/langchain/config';
```

### 2. Use Prompt Templates

```typescript
import { intakePrompt } from '@/lib/langchain/prompts';

const response = await intakePrompt.invoke({
  projectName: "My Project",
  projectVision: "Build something amazing",
  completeness: 50,
  history: "Previous conversation...",
  input: "User's latest message",
});
```

### 3. Validate with Schemas

```typescript
import { actorSchema } from '@/lib/langchain/schemas';

const result = actorSchema.safeParse(data);
if (result.success) {
  // data is valid Actor type
  console.log(result.data.name);
}
```

### 4. Convert Messages

```typescript
import { convertVercelMessageToLangChainMessage } from '@/lib/langchain/utils';

const lcMessage = convertVercelMessageToLangChainMessage(vercelMessage);
```

---

## Available LLM Configurations

### `llm` - General Purpose
- **Model:** GPT-4 Turbo
- **Temperature:** 0.7 (balanced creativity)
- **Max Tokens:** 2000
- **Use for:** Conversational intake, general questions

### `streamingLLM` - Real-time Chat
- **Model:** GPT-4 Turbo
- **Temperature:** 0.7
- **Streaming:** Enabled
- **Use for:** Chat UI with live responses

### `extractionLLM` - Structured Data
- **Model:** GPT-4 Turbo
- **Temperature:** 0 (deterministic)
- **Max Tokens:** 3000
- **Use for:** Data extraction, structured outputs

### `cheapLLM` - Cost-Effective
- **Model:** GPT-3.5 Turbo
- **Temperature:** 0.7
- **Max Tokens:** 1000
- **Use for:** Simple validation, basic Q&A

---

## Available Prompts

### Core Prompts

#### `systemPrompt`
Base instructions for AI assistant. Use as context in all interactions.

#### `intakePrompt`
Conversational requirements gathering. Adapts questions based on completeness.

**Variables:**
- `projectName` - Project name
- `projectVision` - Vision statement
- `completeness` - Percentage (0-100)
- `history` - Previous conversation
- `input` - User's latest message

### Extraction Prompts

#### `extractionPrompt`
Extract structured PRD data from conversations.

**Variables:**
- `conversationHistory` - Full conversation text

### Artifact Generation Prompts

#### `requirementsTablePrompt`
Generate PRD-SPEC compliant requirements.

**Variables:**
- `projectName`, `projectVision`
- `useCases` - JSON or formatted string
- `ucbdSteps` - UCBD steps if available

#### `constantsTablePrompt`
Generate system constants and configuration values.

**Variables:**
- `projectName`, `projectVision`
- `requirements` - Requirements list
- `useCases` - Use cases list

#### `activityDiagramPrompt`
Generate SysML Activity Diagram specification.

**Variables:**
- `useCaseId` - Use case ID
- `useCaseName` - Use case name
- `useCaseDescription` - Description
- `actor` - Primary actor
- `ucbdSteps` - UCBD steps if available

#### `validationGuidancePrompt`
Provide suggestions to improve validation score.

**Variables:**
- `score` - Current validation score
- `failedGates` - List of failed gates
- `currentData` - Current PRD data

#### `diagramPrompt`
Generate Mermaid diagram syntax.

**Variables:**
- `diagramType` - Type of diagram
- `prdData` - PRD data as JSON
- `requirements` - Diagram-specific requirements

---

## Available Schemas

### Core Entity Schemas

#### `actorSchema`
```typescript
{
  name: string,
  role: string,
  description: string,
  goals?: string[]
}
```

#### `useCaseSchema`
```typescript
{
  id: string,
  name: string,
  description: string,
  actor: string,
  preconditions?: string[],
  postconditions?: string[],
  trigger?: string,
  outcome?: string
}
```

#### `systemBoundariesSchema`
```typescript
{
  internal: string[],
  external: string[]
}
```

#### `dataEntitySchema`
```typescript
{
  name: string,
  attributes: string[],
  relationships: string[]
}
```

### Artifact Schemas

#### `requirementsTableRowSchema`
```typescript
{
  id: string,              // "REQ-001"
  name: string,            // Short abstract name
  description: string,     // "The system SHALL..."
  source: string,          // "UC1.3" or "UC1"
  priority: 'Critical' | 'High' | 'Medium' | 'Low',
  testability: string,     // How to verify
  status: 'Draft' | 'Approved' | 'Implemented' | 'Verified',
  category: 'Functional' | 'Performance' | 'Security' | 'Usability' | 'Reliability' | 'Other'
}
```

#### `constantsTableRowSchema`
```typescript
{
  name: string,            // "MAX_LOGIN_ATTEMPTS"
  value: string,           // "5"
  units?: string,          // "attempts"
  description: string,     // Purpose
  category: 'Performance' | 'Security' | 'Business Logic' | 'UI/UX' | 'Integration' | 'Other'
}
```

#### `activityDiagramStepSchema`
```typescript
{
  id: string,              // "STEP-1"
  type: 'start' | 'end' | 'action' | 'decision' | 'merge' | 'fork' | 'join',
  label: string,           // Step description
  actor?: string,          // Actor responsible
  precondition?: string,
  postcondition?: string,
  transitions: [{
    targetId: string,
    condition?: string,
    label?: string
  }]
}
```

### Collection Schemas

#### `extractionSchema`
Combines actors, useCases, systemBoundaries, dataEntities.

#### `requirementsTableSchema`
Array of requirements + metadata.

#### `constantsTableSchema`
Array of constants + metadata.

#### `activityDiagramSpecSchema`
Complete workflow with steps and swimlanes.

---

## Common Patterns

### Pattern 1: Structured Output Extraction

```typescript
import { extractionLLM } from '@/lib/langchain/config';
import { extractionSchema, type ExtractionResult } from '@/lib/langchain/schemas';
import { extractionPrompt } from '@/lib/langchain/prompts';

async function extractPRDData(conversation: string): Promise<ExtractionResult> {
  // Configure LLM for structured output
  const structuredLLM = extractionLLM.withStructuredOutput(extractionSchema);

  // Format prompt
  const prompt = await extractionPrompt.invoke({
    conversationHistory: conversation,
  });

  // Get typed result
  const result = await structuredLLM.invoke(prompt);
  return result; // Fully typed ExtractionResult
}
```

### Pattern 2: Streaming Chat Response

```typescript
import { streamingLLM } from '@/lib/langchain/config';
import { intakePrompt } from '@/lib/langchain/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

export async function POST(req: NextRequest) {
  const { messages, projectData } = await req.json();

  const chain = intakePrompt
    .pipe(streamingLLM)
    .pipe(new HttpResponseOutputParser());

  const stream = await chain.stream({
    projectName: projectData.name,
    projectVision: projectData.vision,
    completeness: projectData.completeness || 0,
    history: formatHistory(messages),
    input: messages[messages.length - 1].content,
  });

  return new StreamingTextResponse(stream);
}
```

### Pattern 3: Requirements Generation

```typescript
import { llm } from '@/lib/langchain/config';
import { requirementsTablePrompt } from '@/lib/langchain/prompts';
import { requirementsTableSchema, type RequirementsTable } from '@/lib/langchain/schemas';

async function generateRequirements(project: Project): Promise<RequirementsTable> {
  const structuredLLM = llm.withStructuredOutput(requirementsTableSchema);

  const prompt = await requirementsTablePrompt.invoke({
    projectName: project.name,
    projectVision: project.vision,
    useCases: JSON.stringify(project.projectData.useCases),
    ucbdSteps: formatUCBDSteps(project),
  });

  const result = await structuredLLM.invoke(prompt);
  return result;
}
```

### Pattern 4: Message Conversion

```typescript
import {
  convertVercelMessageToLangChainMessage,
  convertLangChainMessageToVercelMessage,
} from '@/lib/langchain/utils';
import type { Message } from 'ai';
import type { BaseMessage } from '@langchain/core/messages';

// Frontend → LangChain
const vercelMessages: Message[] = [...];
const lcMessages: BaseMessage[] = vercelMessages.map(
  convertVercelMessageToLangChainMessage
);

// LangChain → Frontend
const lcResponse: BaseMessage = await llm.invoke(lcMessages);
const vercelResponse: Message = convertLangChainMessageToVercelMessage(lcResponse);
```

### Pattern 5: Runtime Validation

```typescript
import { requirementsTableRowSchema, isRequirementsTableRow } from '@/lib/langchain/schemas';

// Validate user input
function processRequirement(data: unknown) {
  const result = requirementsTableRowSchema.safeParse(data);

  if (!result.success) {
    throw new Error(`Invalid requirement: ${result.error.message}`);
  }

  // Now data is typed as RequirementsTableRow
  const req = result.data;
  console.log(`Processing requirement ${req.id}: ${req.name}`);
}

// Type guard in conditional
if (isRequirementsTableRow(unknownData)) {
  // TypeScript knows unknownData is RequirementsTableRow
  console.log(unknownData.priority); // OK
}
```

---

## Testing

Test suite is located in `__tests__/schemas.test.ts`.

To run tests (once Jest is configured):
```bash
pnpm test lib/langchain
```

To check TypeScript compilation:
```bash
npx tsc --noEmit lib/langchain/*.ts
```

---

## Environment Variables

Required in `.env`:
```bash
OPENAI_API_KEY="sk-..."           # Required for all LLMs
LANGCHAIN_API_KEY="ls_..."        # Optional (LangSmith tracing)
LANGCHAIN_PROJECT="product-helper" # Optional (project name)
LANGCHAIN_TRACING_V2="true"       # Optional (enable tracing)
```

---

## PRD-SPEC Compliance

All prompts and schemas are designed for PRD-SPEC PRD validation:

**Hard Gates Addressed:**
- System boundary (systemBoundariesSchema)
- Actors defined (actorSchema)
- Use cases 5-15 (useCaseSchema)
- Trigger + outcome (useCaseSchema fields)
- Measurable criteria (requirementsTableRowSchema.testability)
- Data objects (dataEntitySchema)

**Artifact Minimums:**
- Requirements traceable (requirementsTableRowSchema.source)
- Requirements testable (requirementsTableRowSchema.testability)
- Constants with units (constantsTableRowSchema.units)
- Activity diagram steps (activityDiagramStepSchema)
- Decision points (activityDiagramStepSchema.type === 'decision')

---

## Performance Notes

- Use `cheapLLM` for simple tasks to reduce costs
- Use `extractionLLM` (temp 0) for consistent structured outputs
- Use `streamingLLM` for real-time chat experiences
- Cache prompt templates (they're singletons)
- Validate data with Zod before sending to database

---

## Next Steps

1. **Phase 5**: Integrate prompts with Chat UI components
2. **Phase 6**: Create API endpoints using these configs
3. **Phase 10**: Implement extraction agent with schemas
4. **Phase 9**: Use validation schemas for PRD-SPEC checking

---

## Support

For questions or issues:
1. Check `PHASE_4_COMPLETION.md` for detailed documentation
2. Review test examples in `__tests__/schemas.test.ts`
3. Refer to implementation plan at `/Users/davidancor/Documents/MDR/c1v/implementation-plan.md`
