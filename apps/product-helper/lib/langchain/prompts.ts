import { PromptTemplate } from '@langchain/core/prompts';

/**
 * PRD-SPEC Artifact Pipeline (from PRD-SPEC-PRD-95-V1.json)
 * Each artifact has minimum required data before generation
 */
export const PRD_SPEC_PIPELINE = {
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
 * structured requirements Methodology - Question Patterns
 * Used to guide the conversational intake process
 */
export const INTAKE_QUESTION_PATTERNS = {
  // Context Diagram Data Collection
  context_diagram: {
    // Focus on things the system must INTERACT with (not internal components)
    external_elements: [
      'What external systems, services, or entities does {system} need to interact with?',
      'What people, organizations, or systems will use or be affected by {system}?',
      'Are there any third-party services, APIs, or integrations {system} must work with?'
    ],
    // For each external element, ask HOW it interacts (bidirectional)
    interaction_direction: [
      'For {element}, what does it do TO your system?',
      'For {element}, what does your system do TO/FOR it?'
    ],
    // Probe for different TYPES within categories
    type_variants: [
      'Are there different types of {element} that need to be handled differently?',
      'Do any {element} have special requirements or constraints?'
    ],
    // Look for constraints between external elements
    constraints: [
      'What constraints exist between {elementA} and {elementB}?',
      'Does {elementA} affect how your system interacts with {elementB}?'
    ]
  },
  // Use Case Analysis Process
  use_case_diagram: {
    // Start with scenarios from stakeholder interviews
    actor_goals: [
      'What are the main tasks or goals {actor} needs to accomplish?',
      'What does {actor} expect to be able to do with the system?'
    ],
    // Look for include relationships (required sub-use-cases)
    include_relationships: [
      'Does {useCase} require any other actions to happen first?',
      'What must be completed before {useCase} can occur?'
    ],
    // Look for extends relationships (optional extensions)
    extends_relationships: [
      'Are there optional extensions or variations of {useCase}?',
      'Are there special cases or exceptions for {useCase}?'
    ],
    // Look for trigger relationships (automatic consequences)
    trigger_relationships: [
      'Does completing {useCase} automatically trigger another action?',
      'What happens after {useCase} is completed?'
    ],
    // Identify primary vs secondary actors
    actor_classification: [
      'Who is the primary user initiating {useCase}?',
      'Are there other actors involved in {useCase} but not initiating it?'
    ]
  }
};

/**
 * Stop Triggers - When user says these, STOP asking and START generating
 */
export const STOP_TRIGGERS = [
  'nope', 'no', 'none', 'nothing', 'that\'s enough', 'that\'s it',
  'done', 'move on', 'let\'s see', 'let\'s see it', 'generate',
  'show me', 'that\'s all', 'no more', 'enough'
];

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

## PRD-SPEC Artifact Pipeline
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
 * Guides PM through requirements gathering using structured requirements methodology
 * FAST approach: minimal questions, infer aggressively, generate early
 */
export const intakePrompt = PromptTemplate.fromTemplate(`
You are a PRD assistant using the structured requirements methodology. Collect MINIMUM data, then GENERATE artifacts.

## Project Context
Name: {projectName}
Vision: {projectVision}
Completeness: {completeness}%
Current Artifact: {currentArtifact}

## CRITICAL RULES

### Rule 1: STOP TRIGGERS
If user says ANY of: "nope", "no", "none", "nothing", "that's enough", "that's it", "done", "move on", "let's see", "generate", "show me"
→ DO NOT ask another question
→ Say "Got it, generating your [artifact]..." and produce the Mermaid diagram

### Rule 2: GENERATE WHEN READY
For Context Diagram: system name + 1 actor + 1 external interaction (or "none confirmed")
For Use Case Diagram: 2+ actors + 3+ use cases with actor links
For Scope Tree: 1+ in-scope + 1+ out-of-scope items

Once minimums are met → GENERATE THE DIAGRAM. Don't keep asking.

### Rule 3: ONE QUESTION MAX (industry-standard Methodology)
If you must ask, ask exactly ONE question using industry-standard patterns:

**For Context Diagram (focus on EXTERNAL interactions, not internal components):**
- Ask about external elements: "What external systems or people interact with {projectName}?"
- For each element, ask BIDIRECTIONAL interaction: "What does [element] do TO your system? What does your system do FOR [element]?"
- Probe for type variants: "Are there different types of [element] that need different handling?"
- Look for constraints: "Does [elementA] affect how the system interacts with [elementB]?"

**For Use Case Diagram (start from actor goals, find relationships):**
- Ask actor goals: "What are the main tasks [actor] needs to accomplish?"
- Find <<include>> relationships: "Does [useCase] require another action to happen first?"
- Find <<extends>> relationships: "Are there optional variations or special cases for [useCase]?"
- Find <<trigger>> relationships: "Does completing [useCase] automatically start another action?"
- Classify actors: "Who initiates [useCase]? Who else is involved but not initiating?"

### Rule 4: INFER > INTERROGATE
From vision "{projectVision}", infer likely:
- Actors (people, organizations, systems that interact)
- External systems (third-party services, APIs, integrations)
- Use cases (what actors need to accomplish)
Show your inference: "Based on your vision, I'm identifying [X] as a primary actor and [Y] as an external system. Correct?"

### Rule 5: PRIMARY vs SECONDARY ACTORS (industry-standard)
- Primary actors: Directly interact with system, initiate use cases
- Secondary actors: Support the system, provide services, receive outputs
- External systems: Third-party integrations the system depends on

## Artifact Pipeline (strict order)
1. Context Diagram ← YOU ARE HERE if completeness < 30%
2. Use Case Diagram ← after context diagram done (need relationships: include/extends/trigger)
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

{educationBlock}

## Your Response
Either:
A) Generate the artifact if minimums are met (preferred)
B) Make an inference from vision and ask user to confirm
C) Ask ONE specific industry-standard-methodology question (last resort)

Keep response under 3 sentences unless generating a diagram.
`);

/**
 * Data Extraction Prompt
 * Extracts structured data using structured requirements methodology
 * Calculates artifact readiness with specification-compliant relationships
 */
export const extractionPrompt = PromptTemplate.fromTemplate(`
Analyze this conversation using structured requirements methodology. Extract structured PRD data with artifact readiness scores.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## Extract Using industry-standard Methodology

### 1. Actors (industry-standard Classification)
Extract and classify actors:
- **Primary Actors**: Directly interact with system, initiate use cases (e.g., end users, administrators)
- **Secondary Actors**: Support the system, provide services, receive outputs (e.g., support staff, managers)
- **External Systems**: Third-party integrations the system depends on (e.g., payment gateway, email service)

For each actor include:
- Name, role, type (Primary / Secondary / External System)
- What they do TO the system (inputs, requests, triggers)
- What the system does FOR them (outputs, responses, services)
- **goals**: 2-3 specific goals this actor wants to achieve when using the system (e.g., "Complete checkout in under 2 minutes", "View real-time order status"). INFER from use cases and vision if not explicitly stated.
- **painPoints**: 1-3 current frustrations or problems this actor faces that the system aims to solve (e.g., "Manual data entry is slow and error-prone", "No visibility into order progress"). INFER from the problem context and vision statement.
- INFER from vision if not explicit

### 2. Use Cases with Relationships (industry-standard)
Extract use cases with industry-standard relationship types:
- ID (UC1, UC2...), name as verb phrase, linked primary actor
- **<<include>>**: Required sub-use-cases (e.g., "Login" includes "Validate Credentials")
- **<<extends>>**: Optional extensions (e.g., "Checkout" extends with "Apply Coupon")
- **<<trigger>>**: Automatic consequences (e.g., "Place Order" triggers "Send Confirmation")
- Preconditions and postconditions if mentioned

### 3. External Interactions (Context Diagram Data)
For each external element, capture BIDIRECTIONAL interactions:
- Element name and type
- What it does TO the system (data/requests sent to system)
- What the system does TO/FOR it (data/responses sent from system)
- Any constraints between external elements
- If user says "none" or "nope" → mark as "None (confirmed)"

### 4. Scope (for Scope Tree)
- **In Scope**: Features explicitly included, deliverables
- **Out of Scope**: Features explicitly excluded, future phases
- INFER reasonable scope from vision and use cases

### 5. Data Entities
- Objects with their attributes
- Relationships between entities
- Constraints and business rules

### 6. Problem Statement
Every project exists to solve a problem. Extract the core problem being addressed.
- **summary**: 1-2 sentence problem statement capturing what is broken, missing, or suboptimal
- **context**: Background and circumstances creating the problem (market conditions, user pain points, technical debt, regulatory changes)
- **impact**: Business or user consequences if the problem is NOT solved (lost revenue, user churn, compliance risk, operational inefficiency)
- **goals**: Array of 3-5 measurable success criteria that define what "solved" looks like (e.g., "Reduce onboarding time from 30 minutes to under 5 minutes")

IMPORTANT: INFER the problem statement from the project vision and conversation even if not explicitly stated. Every project has a problem — extract it. Use the vision statement, actor goals, and use cases as signals to reconstruct the underlying problem.

### 7. Goals & Success Metrics
Extract 3-5 project-level goals with measurable success criteria. Each goal should define what success looks like in quantifiable terms.

For each goal include:
- **goal**: A clear statement of what the project aims to achieve (e.g., "Reduce user onboarding time")
- **metric**: How success will be measured (e.g., "Average time to complete onboarding flow")
- **target**: Optional specific threshold or benchmark (e.g., "Under 5 minutes")

Guidelines:
- INFER goals from the vision statement, problem statement, actor goals, and use cases if not explicitly stated
- Goals should be SMART: Specific, Measurable, Achievable, Relevant, Time-bound where possible
- Cover different dimensions: user experience, business value, technical performance, adoption
- Each goal must have a corresponding metric; target is optional but preferred
- Examples:
  - Goal: "Increase user self-service resolution" -> Metric: "Percentage of support tickets resolved without agent" -> Target: "70% self-service rate"
  - Goal: "Improve data accuracy" -> Metric: "Error rate in submitted forms" -> Target: "Below 2%"
  - Goal: "Accelerate time to market" -> Metric: "Average feature delivery cycle" -> Target: "2-week sprints"

### 8. Non-Functional Requirements
Extract non-functional requirements (NFRs) across these categories: performance, security, scalability, reliability, usability, maintainability, compliance.

For each NFR, capture:
- **category**: One of performance, security, scalability, reliability, usability, maintainability, compliance
- **requirement**: Clear statement of what the system must achieve (e.g., "Page load time under 3 seconds")
- **metric**: How to measure compliance (e.g., "Time to First Contentful Paint")
- **target**: Specific threshold or benchmark (e.g., "<3s")
- **priority**: critical, high, medium, or low

Guidelines:
- INFER reasonable NFRs from the project type, tech stack, user base, and vision statement even if not explicitly stated in the conversation
- Every project has implicit NFRs — extract them. A web app implies page load requirements; a multi-user system implies concurrency requirements; handling user data implies security requirements.
- Cover at least 3 different categories to ensure breadth
- Each requirement must be specific and measurable, not vague (e.g., "fast" is bad; "response time under 200ms" is good)

Examples:
- Performance: requirement: "Page load time under 3 seconds" -> metric: "Time to First Contentful Paint" -> target: "<3s" -> priority: high
- Security: requirement: "All API endpoints require authentication" -> metric: "Unauthorized access rate" -> target: "0%" -> priority: critical
- Scalability: requirement: "Support 10,000 concurrent users" -> metric: "Concurrent active sessions" -> target: "10,000+" -> priority: high
- Reliability: requirement: "System uptime of 99.9%" -> metric: "Monthly uptime percentage" -> target: ">=99.9%" -> priority: critical
- Usability: requirement: "Core workflows completable in under 3 clicks" -> metric: "Average clicks to task completion" -> target: "<=3" -> priority: medium
- Maintainability: requirement: "Test coverage above 80%" -> metric: "Line coverage percentage" -> target: ">=80%" -> priority: medium
- Compliance: requirement: "GDPR-compliant data handling" -> metric: "Data processing audit pass rate" -> target: "100%" -> priority: critical

## Calculate Artifact Readiness

CONTEXT_DIAGRAM_READY: true/false
- Requires: system_name (always have), 1+ actor, 1+ external interaction OR "none confirmed"
- industry-standard: Must have bidirectional interaction data for each element

USE_CASE_DIAGRAM_READY: true/false
- Requires: 2+ actors, 3+ use cases with actor links
- industry-standard: Should have relationship types (include/extends/trigger) between use cases

SCOPE_TREE_READY: true/false
- Requires: 1+ in_scope, 1+ out_of_scope
- industry-standard: Derived from use cases and stakeholder agreements

UCBD_READY: true/false
- Requires: preconditions, 3+ steps, postconditions for at least 1 use case

## Output Format
Return structured JSON with:
- actors: array of objects with name, role, type, interactsTo, receivesFrom, goals (array of strings), painPoints (array of strings)
- useCases: array of objects with id, name, actor, includes, extends, triggers, preconditions, postconditions
- externalSystems: array of objects with name, type, sendsToSystem, receivesFromSystem (or "none_confirmed")
- inScope: array of strings
- outOfScope: array of strings
- dataEntities: array of objects with name, attributes, relationships
- problemStatement: object with summary (string), context (string), impact (string), goals (array of 3-5 measurable strings)
- goalsMetrics: array of objects with goal (string), metric (string), target (optional string)
- nonFunctionalRequirements: array of objects with category (performance|security|scalability|reliability|usability|maintainability|compliance), requirement (string), metric (optional string), target (optional string), priority (critical|high|medium|low)
- useCaseRelationships: array of objects with from, to, type (include/extends/trigger)
- artifactReadiness: object with context_diagram, use_case_diagram, scope_tree, ucbd as booleans

{educationBlock}

INFER AGGRESSIVELY from the vision statement. Apply structured methodology to identify relationships and bidirectional interactions.
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
Start with the diagram type declaration (e.g., "graph TD" or "sequenceDiagram").
Use clear, descriptive labels.
IMPORTANT: For sequence diagrams, do NOT use classDef or class statements - these are not supported. For other diagram types (graph/flowchart), you may use classDef for styling.
`);

/**
 * Requirements Table Generation Prompt
 * Generates structured requirements from use cases and UCBD
 * PRD-SPEC compliant: singular, testable, unambiguous requirements
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
 * PRD-SPEC compliant: name, value, units present
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
 * PRD-SPEC compliant: workflow steps + decision points
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
