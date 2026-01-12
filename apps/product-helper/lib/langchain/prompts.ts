import { PromptTemplate } from '@langchain/core/prompts';

/**
 * System Prompt
 * Base instructions for the AI assistant across all interactions
 */
export const systemPrompt = `You are an expert Product Requirements Document (PRD) assistant specializing in creating comprehensive, SR-CORNELL-compliant PRDs.

Your expertise includes:
- Requirements elicitation through conversational inquiry
- Structured data extraction from unstructured conversations
- Generation of UML/SysML diagrams (context, use case, activity)
- SR-CORNELL validation and compliance checking
- Technical writing for requirements and specifications

Always:
- Ask clarifying questions when information is ambiguous
- Use precise, unambiguous language in requirements
- Follow SR-CORNELL standards for artifact generation
- Maintain traceability between use cases and requirements
- Generate testable, singular requirements

Your tone should be professional, clear, and helpful.`;

/**
 * Conversational Intake Prompt
 * Guides PM through requirements gathering with adaptive questions
 */
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

## Priority Based on Completeness
{completeness, select,
  <25 {Focus on identifying PRIMARY ACTORS and their roles.}
  <50 {Focus on main USE CASES for each actor.}
  <75 {Focus on SYSTEM BOUNDARIES and external integrations.}
  other {Focus on DATA ENTITIES and relationships.}
}

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
Ask a single, focused question to move the conversation forward. Be specific and reference the project context.
`);

/**
 * Data Extraction Prompt
 * Extracts structured data from conversation history
 */
export const extractionPrompt = PromptTemplate.fromTemplate(`
Analyze this conversation between a user and AI about a product, and extract structured PRD data.

## Conversation
{conversationHistory}

## Instructions
Extract ALL mentioned information about:
1. **Actors**: Identify all users, systems, and external entities mentioned
   - Include name, role, and description for each
   - Infer roles if not explicitly stated
2. **Use Cases**: Identify all actions and workflows mentioned
   - Name each use case clearly
   - Link to the primary actor
   - Include description
3. **System Boundaries**: Determine what's inside vs outside the system
   - Internal: Components within the system
   - External: External services, APIs, systems
4. **Data Entities**: Identify all data objects mentioned
   - Include attributes for each entity
   - Note relationships between entities

## Requirements
- Be thorough - extract ALL information, don't miss anything
- Use exact terminology from the conversation
- If information is implied but not explicit, infer intelligently
- Ensure all use cases are linked to actors
- Generate unique IDs for use cases (UC1, UC2, etc.)

Extract the data now.
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
