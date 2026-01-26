/**
 * Quick Start Synthesis Agent (Phase 12 - Quick Start Mode)
 *
 * Purpose: Expand a single user sentence into full project context
 * Pattern: Two sequential structured LLM calls with Zod validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * This agent takes a one-sentence project description and performs:
 * 1. Domain Analysis: Identify actors, system boundaries, and technical context
 * 2. Use Case Derivation: Derive use cases, features, and assumptions
 *
 * Uses Claude (ChatAnthropic) with structured output for deterministic results.
 */

import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';
import { createClaudeAgent } from '../config';

// ============================================================
// Zod Schemas for Structured Output
// ============================================================

/**
 * Schema for Call 1: Domain Analysis
 * Identifies the core structure of the project from a single sentence
 */
const domainAnalysisActorSchema = z.object({
  name: z.string().describe('Actor name (e.g., "Customer", "Admin", "Payment Gateway")'),
  role: z.string().describe('Role description (e.g., "Primary User", "System Administrator", "External Service")'),
  type: z.enum(['human', 'system', 'external']).describe('Whether this is a human user, internal system, or external system'),
});

const domainAnalysisSchema = z.object({
  actors: z.array(domainAnalysisActorSchema)
    .min(3)
    .max(8)
    .describe('3-8 actors identified from the project description'),
  systemBoundaries: z.object({
    internal: z.array(z.string())
      .min(2)
      .describe('Internal system components and features (what the system does)'),
    external: z.array(z.string())
      .min(1)
      .describe('External systems, APIs, and services the system interacts with'),
  }).describe('System boundary classification'),
  technicalContext: z.object({
    platform: z.string().describe('Target platform (e.g., "Web application", "Mobile app", "SaaS platform")'),
    scale: z.string().describe('Expected scale/audience (e.g., "Small team tool", "Enterprise SaaS", "Consumer marketplace")'),
    architectureStyle: z.string().describe('Suggested architecture style (e.g., "Monolithic web app", "Microservices", "Serverless")'),
  }).describe('Inferred technical context'),
  projectName: z.string().describe('A clean, professional project name derived from the description'),
  projectVision: z.string().describe('An expanded 2-3 sentence vision statement'),
});

export type DomainAnalysis = z.infer<typeof domainAnalysisSchema>;

/**
 * Schema for Call 2: Use Case Derivation
 * Derives detailed use cases and features from the domain analysis
 */
const derivedUseCaseSchema = z.object({
  id: z.string().describe('Unique identifier (e.g., "UC1", "UC2")'),
  name: z.string().describe('Use case name as verb phrase (e.g., "Place Order", "Manage Users")'),
  description: z.string().describe('Detailed description of the use case'),
  actor: z.string().describe('Primary actor for this use case'),
  trigger: z.string().describe('What initiates this use case'),
  outcome: z.string().describe('Expected result after successful completion'),
  preconditions: z.array(z.string()).describe('Conditions that must be true before this use case'),
  postconditions: z.array(z.string()).describe('Conditions that are true after completion'),
  priority: z.enum(['must', 'should', 'could']).describe('MoSCoW priority'),
});

const derivedFeatureSchema = z.object({
  name: z.string().describe('Feature name'),
  description: z.string().describe('What this feature does'),
  category: z.string().describe('Feature category (e.g., "Core", "Admin", "Integration", "Analytics")'),
});

const useCaseDerivationSchema = z.object({
  useCases: z.array(derivedUseCaseSchema)
    .min(6)
    .max(15)
    .describe('6-15 use cases grounded in the identified actors'),
  features: z.array(derivedFeatureSchema)
    .min(5)
    .max(12)
    .describe('5-12 key features of the system'),
  assumptions: z.array(z.string())
    .min(3)
    .describe('Assumptions made during derivation that the user should validate'),
  dataEntities: z.array(z.object({
    name: z.string().describe('Entity name (e.g., "User", "Order", "Product")'),
    attributes: z.array(z.string()).describe('Key attributes of this entity'),
    relationships: z.array(z.string()).describe('Relationships to other entities'),
  })).min(2).describe('Core data entities identified'),
});

export type UseCaseDerivation = z.infer<typeof useCaseDerivationSchema>;

/**
 * Combined synthesis result from both LLM calls
 */
export interface SynthesisResult {
  domainAnalysis: DomainAnalysis;
  useCaseDerivation: UseCaseDerivation;
  /** Original user input preserved for reference */
  userInput: string;
}

// ============================================================
// Prompt Templates
// ============================================================

const domainAnalysisPrompt = PromptTemplate.fromTemplate(`
You are an expert software architect and product analyst. Given a single sentence describing a project idea, perform a thorough domain analysis.

## User Input
"{userInput}"

## Instructions

Analyze this project description and identify:

### 1. Actors (3-8)
Identify ALL actors that would interact with this system:
- **Human actors**: End users, administrators, moderators, etc.
- **System actors**: Internal services, background workers, etc.
- **External actors**: Third-party APIs, payment gateways, email services, etc.

### 2. System Boundaries
Classify components as internal (what the system builds) vs external (what it integrates with):
- **Internal**: Core features, modules, and capabilities the system provides
- **External**: Third-party services, APIs, and systems it connects to

### 3. Technical Context
Infer the most likely:
- **Platform**: Web app, mobile app, SaaS, CLI tool, etc.
- **Scale**: Small team, startup, enterprise, consumer, etc.
- **Architecture**: Monolith, microservices, serverless, etc.

### 4. Project Identity
- Generate a clean, professional **project name**
- Write an expanded **vision statement** (2-3 sentences) that captures the full scope

Be specific and practical. Avoid generic placeholders. Ground everything in the user's actual description.
`);

const useCaseDerivationPrompt = PromptTemplate.fromTemplate(`
You are an expert product manager and systems analyst. Using the domain analysis below, derive detailed use cases, features, and identify core data entities.

## Project Context
**Name:** {projectName}
**Vision:** {projectVision}
**Platform:** {platform}
**Scale:** {scale}

## Identified Actors
{actorsFormatted}

## System Boundaries
**Internal Components:**
{internalFormatted}

**External Systems:**
{externalFormatted}

## Instructions

### Use Cases (6-15)
For each use case:
- Ground it in a specific actor from the list above
- Write a clear trigger (what starts it) and outcome (what results)
- Include realistic preconditions and postconditions
- Assign MoSCoW priority: "must" for core functionality, "should" for important features, "could" for nice-to-haves
- Use verb phrases for names (e.g., "Register Account", "Process Payment")

### Features (5-12)
Identify key features grouped by category:
- **Core**: Essential functionality
- **Admin**: Management and configuration
- **Integration**: External service connections
- **Analytics**: Reporting and insights

### Data Entities
Identify the core data objects with their key attributes and relationships.
These should map naturally to database tables.

### Assumptions
List 3+ assumptions you made that the user should validate.
Be honest about what you inferred vs what was explicitly stated.

Derive comprehensive, realistic use cases and features now.
`);

// ============================================================
// Structured LLM Agents
// ============================================================

const domainAnalysisAgent = createClaudeAgent(domainAnalysisSchema, 'analyze_domain', {
  temperature: 0.2,
  maxTokens: 4000,
});

const useCaseDerivationAgent = createClaudeAgent(useCaseDerivationSchema, 'derive_use_cases', {
  temperature: 0.2,
  maxTokens: 4000,
});

// ============================================================
// Fallback Data
// ============================================================

/**
 * Minimal valid domain analysis for fallback on failure
 */
function getDefaultDomainAnalysis(userInput: string): DomainAnalysis {
  return {
    actors: [
      { name: 'User', role: 'Primary end user of the system', type: 'human' },
      { name: 'Admin', role: 'System administrator', type: 'human' },
      { name: 'System', role: 'Internal background processing', type: 'system' },
    ],
    systemBoundaries: {
      internal: ['Core application logic', 'User management'],
      external: ['Authentication service'],
    },
    technicalContext: {
      platform: 'Web application',
      scale: 'Small to medium',
      architectureStyle: 'Monolithic web app',
    },
    projectName: 'New Project',
    projectVision: userInput,
  };
}

/**
 * Minimal valid use case derivation for fallback on failure
 */
function getDefaultUseCaseDerivation(domainAnalysis: DomainAnalysis): UseCaseDerivation {
  const primaryActor = domainAnalysis.actors[0]?.name || 'User';
  return {
    useCases: [
      {
        id: 'UC1', name: 'Register Account', description: 'User creates a new account',
        actor: primaryActor, trigger: 'User navigates to registration page',
        outcome: 'Account created and user logged in',
        preconditions: ['User has valid email'], postconditions: ['Account exists in system'],
        priority: 'must',
      },
      {
        id: 'UC2', name: 'Log In', description: 'User authenticates to access the system',
        actor: primaryActor, trigger: 'User navigates to login page',
        outcome: 'User authenticated and redirected to dashboard',
        preconditions: ['Account exists'], postconditions: ['Session established'],
        priority: 'must',
      },
      {
        id: 'UC3', name: 'View Dashboard', description: 'User views main dashboard',
        actor: primaryActor, trigger: 'User logs in',
        outcome: 'Dashboard displayed with relevant data',
        preconditions: ['User authenticated'], postconditions: ['Dashboard loaded'],
        priority: 'must',
      },
      {
        id: 'UC4', name: 'Manage Profile', description: 'User updates their profile information',
        actor: primaryActor, trigger: 'User navigates to profile settings',
        outcome: 'Profile updated successfully',
        preconditions: ['User authenticated'], postconditions: ['Profile data saved'],
        priority: 'should',
      },
      {
        id: 'UC5', name: 'Manage Users', description: 'Admin manages user accounts',
        actor: 'Admin', trigger: 'Admin navigates to user management',
        outcome: 'User accounts updated',
        preconditions: ['Admin authenticated'], postconditions: ['Changes saved'],
        priority: 'should',
      },
      {
        id: 'UC6', name: 'View Reports', description: 'User views analytics and reports',
        actor: primaryActor, trigger: 'User navigates to reports section',
        outcome: 'Reports displayed with current data',
        preconditions: ['User authenticated', 'Data available'], postconditions: ['Reports rendered'],
        priority: 'could',
      },
    ],
    features: [
      { name: 'User Authentication', description: 'Registration, login, and session management', category: 'Core' },
      { name: 'Dashboard', description: 'Main overview interface', category: 'Core' },
      { name: 'User Management', description: 'Admin user administration', category: 'Admin' },
      { name: 'Profile Management', description: 'User profile editing', category: 'Core' },
      { name: 'Reporting', description: 'Analytics and data visualization', category: 'Analytics' },
    ],
    assumptions: [
      'The system is a web application accessible via modern browsers',
      'User authentication is required for all features',
      'An admin role exists for system management',
    ],
    dataEntities: [
      { name: 'User', attributes: ['id', 'email', 'name', 'role', 'created_at'], relationships: ['Has many sessions'] },
      { name: 'Session', attributes: ['id', 'user_id', 'token', 'expires_at'], relationships: ['Belongs to User'] },
    ],
  };
}

// ============================================================
// Main Function
// ============================================================

/**
 * Synthesize full project context from a single user sentence
 *
 * Performs two sequential LLM calls:
 * 1. Domain Analysis: Actors, boundaries, technical context
 * 2. Use Case Derivation: Use cases, features, assumptions, data entities
 *
 * @param userInput - A single sentence describing the project idea (10-500 chars)
 * @returns SynthesisResult with domain analysis and derived use cases
 *
 * @example
 * ```typescript
 * const result = await synthesizeProjectContext(
 *   "An e-commerce platform for handmade crafts with seller storefronts and buyer reviews"
 * );
 * // result.domainAnalysis.actors = [{ name: "Buyer", ... }, { name: "Seller", ... }, ...]
 * // result.useCaseDerivation.useCases = [{ id: "UC1", name: "Browse Products", ... }, ...]
 * ```
 */
export async function synthesizeProjectContext(
  userInput: string
): Promise<SynthesisResult> {
  // ---- Call 1: Domain Analysis ----
  let domainAnalysis: DomainAnalysis;
  try {
    const domainPromptText = await domainAnalysisPrompt.format({ userInput });
    domainAnalysis = await domainAnalysisAgent.invoke(domainPromptText);
  } catch (error) {
    console.error('Domain analysis failed, using fallback:', error);
    domainAnalysis = getDefaultDomainAnalysis(userInput);
  }

  // ---- Call 2: Use Case Derivation ----
  let useCaseDerivation: UseCaseDerivation;
  try {
    const actorsFormatted = domainAnalysis.actors
      .map((a, i) => `${i + 1}. **${a.name}** (${a.type}): ${a.role}`)
      .join('\n');

    const internalFormatted = domainAnalysis.systemBoundaries.internal
      .map(c => `- ${c}`)
      .join('\n');

    const externalFormatted = domainAnalysis.systemBoundaries.external
      .map(c => `- ${c}`)
      .join('\n');

    const derivationPromptText = await useCaseDerivationPrompt.format({
      projectName: domainAnalysis.projectName,
      projectVision: domainAnalysis.projectVision,
      platform: domainAnalysis.technicalContext.platform,
      scale: domainAnalysis.technicalContext.scale,
      actorsFormatted,
      internalFormatted,
      externalFormatted,
    });

    useCaseDerivation = await useCaseDerivationAgent.invoke(derivationPromptText);
  } catch (error) {
    console.error('Use case derivation failed, using fallback:', error);
    useCaseDerivation = getDefaultUseCaseDerivation(domainAnalysis);
  }

  return {
    domainAnalysis,
    useCaseDerivation,
    userInput,
  };
}

// Export schemas for testing
export {
  domainAnalysisSchema,
  useCaseDerivationSchema,
  domainAnalysisActorSchema,
  derivedUseCaseSchema,
  derivedFeatureSchema,
};
