import { PromptTemplate } from '@langchain/core/prompts';

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
