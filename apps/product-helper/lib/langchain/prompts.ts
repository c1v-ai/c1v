import { PromptTemplate } from '@langchain/core/prompts';

/**
 * SR-CORNELL Artifact Pipeline (from SR-CORNELL-PRD-95-V1.json)
 * Each artifact has minimum required data before generation
 */
export const SR_CORNELL_PIPELINE = {
  sequence: [
    'context_diagram',
    'use_case_diagram',
    'scope_tree',
    'ucbd',
    'requirements_table',
    'constants_table',
    'sysml_activity_diagram'
  ],
  minimums: {
    context_diagram: {
      required: ['system_name', 'actors:1+', 'external_interaction:1+'],
      description: 'System boundary with actors and external entities'
    },
    use_case_diagram: {
      required: ['actors:2+', 'use_cases:3+', 'actor_use_case_links'],
      description: 'Actors linked to use cases'
    },
    scope_tree: {
      required: ['in_scope:1+', 'out_of_scope:1+'],
      description: 'What is and is not included'
    },
    ucbd: {
      required: ['preconditions', 'steps:3+', 'postconditions', 'actors'],
      description: 'User Case Behaviour Document with workflow'
    },
    requirements_table: {
      required: ['requirements:5+', 'traced_to_use_case'],
      description: 'Testable requirements derived from use cases'
    },
    constants_table: {
      required: ['constants:1+', 'name_value_units'],
      description: 'System constants with values and units'
    },
    sysml_activity_diagram: {
      required: ['workflow_steps:3+', 'decision_points:1+'],
      description: 'Activity flow with decisions'
    }
  },
  threshold: 0.95
};

/**
 * System Prompt
 * Base instructions for the AI assistant across all interactions
 */
export const systemPrompt = `You are an expert Product Requirements Document (PRD) assistant that generates artifacts FAST with minimal questions.

## Core Philosophy
- SHOW WORK EARLY: Generate diagrams quickly, then iterate
- MINIMUM VIABLE DATA: Collect just enough to hit 95% confidence
- INFER INTELLIGENTLY: Make reasonable assumptions rather than interrogating
- RESPECT USER TIME: When user says "nope" or "that's enough" - STOP and generate

## SR-CORNELL Artifact Pipeline
Generate artifacts in this strict sequence (each unlocks the next):
1. Context Diagram → 2. Use Case Diagram → 3. Scope Tree → 4. UCBD → 5. Requirements → 6. Constants → 7. SysML Activity

## Artifact Minimum Thresholds (generate when met)
- Context Diagram: system name + 1 actor + 1 external interaction
- Use Case Diagram: 2 actors + 3 use cases linked to actors
- Scope Tree: 1+ in-scope items + 1+ out-of-scope items
- UCBD: preconditions + 3 steps + postconditions
- Requirements: 5+ testable requirements traced to use cases
- Constants: 1+ constant with name/value/units
- SysML Activity: 3+ workflow steps + 1 decision point

## Stop Triggers (STOP asking, START generating)
When user says any of: "nope", "no", "that's enough", "that's it", "done", "move on", "let's see it"
→ STOP asking questions immediately
→ Infer any missing pieces from context
→ Generate the current artifact

Your tone: brief, efficient, bias toward action.`;

/**
 * Conversational Intake Prompt
 * Guides PM through requirements gathering - FAST, with minimal questions
 */
export const intakePrompt = PromptTemplate.fromTemplate(`
You are a PRD assistant. Your job: collect MINIMUM data needed to generate artifacts, then GENERATE them.

## Project Context
Name: {projectName}
Vision: {projectVision}
Completeness: {completeness}%
Current Artifact: {currentArtifact}

## CRITICAL RULES

### Rule 1: STOP TRIGGERS
If user says ANY of: "nope", "no", "that's enough", "that's it", "done", "move on", "let's see"
→ DO NOT ask another question
→ Say "Got it, generating your [artifact]..." and produce the Mermaid diagram

### Rule 2: GENERATE WHEN READY
For Context Diagram, you need:
- System name (have it: {projectName})
- At least 1 actor
- At least 1 external system OR explicit "none"

Once you have these → GENERATE THE DIAGRAM. Don't keep asking.

### Rule 3: ONE QUESTION MAX
If you must ask, ask exactly ONE question. Never multiple.
Better: make an assumption and ask "Does this look right?"

### Rule 4: INFER > INTERROGATE
From vision "{projectVision}", infer likely actors and systems.
Show your inference: "Based on your vision, I'm assuming X and Y are your main users. Correct?"

## Artifact Pipeline (strict order)
1. Context Diagram ← YOU ARE HERE if completeness < 30%
2. Use Case Diagram ← after context diagram done
3. Scope Tree ← after use cases defined
4. UCBD ← after scope defined
5. Requirements ← after UCBD done
6. Constants ← after requirements
7. SysML Activity ← final artifact

## Current Data Extracted
Actors: {extractedActors}
Use Cases: {extractedUseCases}
External Systems: {extractedExternalSystems}
In Scope: {extractedInScope}
Out of Scope: {extractedOutOfScope}

## Conversation History
{history}

## User's Message
{input}

## Your Response
Either:
A) Generate the artifact if you have enough data (preferred)
B) Make an inference and ask user to confirm
C) Ask ONE specific question (last resort)

Keep response under 3 sentences unless generating a diagram.
`);

/**
 * Data Extraction Prompt
 * Extracts structured data AND calculates artifact readiness
 */
export const extractionPrompt = PromptTemplate.fromTemplate(`
Analyze this conversation and extract structured PRD data with artifact readiness scores.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## Extract These Data Points

### 1. Actors (need 2+ for use case diagram)
- Name, role, type (Primary User / Secondary User / External System)
- INFER from vision if not explicit (e.g., vision mentions "managers" → add Manager actor)

### 2. Use Cases (need 3+ for use case diagram)
- ID (UC1, UC2...), name as verb phrase, linked actor
- Trigger and outcome if mentioned

### 3. External Systems (need 1+ for context diagram)
- Any third-party services, APIs, integrations
- If user says "none" or "nope" to external systems → mark as "None (confirmed)"

### 4. Scope (need both for scope tree)
- In Scope: features explicitly included
- Out of Scope: features explicitly excluded

### 5. Data Entities
- Objects and their attributes
- Relationships between entities

## ALSO Calculate Artifact Readiness

For each artifact, calculate if minimum data is met:

CONTEXT_DIAGRAM_READY: true/false
- Requires: system_name (always have), 1+ actor, 1+ external system OR "none confirmed"

USE_CASE_DIAGRAM_READY: true/false
- Requires: 2+ actors, 3+ use cases with actor links

SCOPE_TREE_READY: true/false
- Requires: 1+ in_scope, 1+ out_of_scope

UCBD_READY: true/false
- Requires: preconditions, 3+ steps, postconditions for at least 1 use case

## Output Format
Return structured JSON with:
- actors: [...]
- useCases: [...]
- externalSystems: [...] or "none_confirmed"
- inScope: [...]
- outOfScope: [...]
- dataEntities: [...]
- artifactReadiness: { context_diagram: bool, use_case_diagram: bool, scope_tree: bool, ucbd: bool }

INFER AGGRESSIVELY from the vision statement. Don't leave fields empty if you can make reasonable assumptions.
`);

/**
 * Validation Guidance Prompt
 * Provides suggestions to improve validation score
 */
export const validationGuidancePrompt = PromptTemplate.fromTemplate(`
Review this PRD data and validation results, then provide specific suggestions to reach 95%+ score.

## Current Validation Score: {score}%

## Failed Gates
{failedGates}

## Current Data
{currentData}

## Instructions
For each failed gate, provide:
1. **What's missing**: Specific information needed
2. **Suggested questions**: 1-2 questions to ask the user to gather this information
3. **Priority**: Critical vs Important vs Nice-to-have

Be concise and actionable. Focus on what will have the biggest impact on the validation score.
`);

/**
 * Diagram Generation Prompt
 * Generates Mermaid syntax from structured data
 */
export const diagramPrompt = PromptTemplate.fromTemplate(`
Generate a {diagramType} diagram in Mermaid syntax from this PRD data.

## Data
{prdData}

## Requirements for {diagramType}
{requirements}

## Output
Return ONLY the Mermaid syntax, no explanations or markdown code fences.
Start with the diagram type declaration (e.g., "graph TD").
Use clear, descriptive labels.
Apply appropriate styling with classDef.
`);

/**
 * Requirements Table Generation Prompt
 * Generates structured requirements from use cases and UCBD
 * SR-CORNELL compliant: singular, testable, unambiguous requirements
 */
export const requirementsTablePrompt = PromptTemplate.fromTemplate(`
Generate a comprehensive requirements table from the following PRD data.

## Project Context
Project: {projectName}
Vision: {projectVision}

## Use Cases
{useCases}

## UCBD Steps (if available)
{ucbdSteps}

## Instructions
Generate requirements following these rules:
1. **Derivation**: Each requirement must trace to a UCBD step or use case
2. **Language**: Use "The system SHALL..." format (mandatory "shall" language)
3. **Singularity**: Each requirement must specify ONE capability only
4. **Testability**: Each requirement must be verifiable through testing
5. **Unambiguous**: Use precise, clear language with no room for interpretation
6. **Completeness**: Cover all functional and non-functional aspects

## Requirement Categories
- **Functional**: What the system does (user actions, workflows)
- **Performance**: Speed, throughput, response times
- **Security**: Authentication, authorization, data protection
- **Usability**: User experience, accessibility
- **Reliability**: Uptime, error handling, recovery

## Output Format
Generate requirements as a structured list with:
- ID (REQ-001, REQ-002, etc.)
- Name (short abstract name)
- Description (full "shall" statement)
- Source (trace to UC ID or UCBD step)
- Priority (Critical/High/Medium/Low)
- Testability (how to verify)
- Category (Functional/Performance/Security/Usability/Reliability)

Example:
ID: REQ-001
Name: User Login Authentication
Description: The system SHALL authenticate users via email and password before granting access to protected resources.
Source: UC1 - User Login
Priority: Critical
Testability: Test with valid/invalid credentials, verify access control
Category: Security

Generate the complete requirements table now.
`);

/**
 * Constants Table Generation Prompt
 * Generates system constants and configuration values
 * SR-CORNELL compliant: name, value, units present
 */
export const constantsTablePrompt = PromptTemplate.fromTemplate(`
Generate a constants table for this product based on the PRD data and requirements.

## Project Context
Project: {projectName}
Vision: {projectVision}

## Requirements
{requirements}

## Use Cases
{useCases}

## Instructions
Identify and define system constants including:
1. **Performance Limits**: Timeouts, max concurrent users, rate limits
2. **Security Parameters**: Session duration, max login attempts, token expiry
3. **Business Logic**: Minimum/maximum values for business rules
4. **UI/UX**: Page sizes, default values, display limits
5. **Integration**: API rate limits, retry counts, timeouts

## Output Format
For each constant, provide:
- Name (UPPER_SNAKE_CASE)
- Value (actual value or reasonable default)
- Units (if applicable: seconds, MB, requests/min, etc.)
- Description (purpose and usage)
- Category (Performance/Security/Business Logic/UI-UX/Integration)

Example:
Name: MAX_LOGIN_ATTEMPTS
Value: 5
Units: attempts
Description: Maximum number of failed login attempts before account lockout
Category: Security

Name: SESSION_TIMEOUT
Value: 3600
Units: seconds
Description: User session expires after this duration of inactivity
Category: Security

Name: API_RATE_LIMIT
Value: 100
Units: requests/minute
Description: Maximum API requests allowed per user per minute
Category: Performance

Only include constants that are actually relevant to the requirements. Do not invent unnecessary constants.
Generate the constants table now.
`);

/**
 * Activity Diagram Spec Generation Prompt
 * Generates structured SysML Activity Diagram specification
 * SR-CORNELL compliant: workflow steps + decision points
 */
export const activityDiagramPrompt = PromptTemplate.fromTemplate(`
Generate a SysML Activity Diagram specification for the following use case.

## Use Case
ID: {useCaseId}
Name: {useCaseName}
Description: {useCaseDescription}
Actor: {actor}

## UCBD Steps (if available)
{ucbdSteps}

## Instructions
Create a structured activity diagram that shows:
1. **Workflow Steps**: All actions from start to end
2. **Decision Points**: Conditional branches and choices
3. **Actors**: Who performs each step (use swimlanes if multiple actors)
4. **Flow**: Sequential, parallel, and conditional transitions

## Step Types
- **start**: Single starting point
- **end**: Termination point(s)
- **action**: Regular activity step
- **decision**: Conditional branch (diamond shape)
- **merge**: Converging branches
- **fork**: Parallel split
- **join**: Parallel merge

## Output Format
Generate a structured specification with:
- Steps (id, type, label, actor, transitions)
- Decision conditions for each branch
- Swimlanes (if multiple actors involved)
- Preconditions and postconditions for key steps

Example:
Step 1:
  ID: STEP-1
  Type: start
  Label: User initiates login
  Actor: User
  Transitions: [STEP-2]

Step 2:
  ID: STEP-2
  Type: action
  Label: Enter credentials
  Actor: User
  Transitions: [STEP-3]

Step 3:
  ID: STEP-3
  Type: action
  Label: Validate credentials
  Actor: System
  Transitions: [STEP-4]

Step 4:
  ID: STEP-4
  Type: decision
  Label: Credentials valid?
  Actor: System
  Transitions:
    - Target: STEP-5, Condition: "Valid", Label: "Yes"
    - Target: STEP-6, Condition: "Invalid", Label: "No"

Generate the complete activity diagram specification now.
`);
