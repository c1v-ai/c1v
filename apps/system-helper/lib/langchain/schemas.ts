import { z } from 'zod';

/**
 * Zod Schemas for LangChain Structured Outputs
 * Used for data extraction and PRD artifact generation
 */

// ============================================================
// Core PRD Entity Schemas
// ============================================================

/**
 * Actor Schema
 * Represents users, systems, or external entities that interact with the product
 */
export const actorSchema = z.object({
  name: z.string().describe('Name of the actor (e.g., "Customer", "Admin", "Payment Gateway")'),
  role: z.string().describe('Role or type of actor (e.g., "Primary User", "External System")'),
  description: z.string().describe('Detailed description of the actor and their purpose'),
  goals: z.array(z.string()).optional().describe('Optional list of actor goals'),
  painPoints: z.array(z.string()).optional().describe('Pain points or frustrations this actor experiences'),
});

export type Actor = z.infer<typeof actorSchema>;

/**
 * Flow Step Schema
 * Represents a single step in the main flow of a use case
 */
export const flowStepSchema = z.object({
  stepNumber: z.number().describe('Step number in the flow sequence'),
  actor: z.string().describe('Actor performing this step (user or system)'),
  action: z.string().describe('Action taken in this step'),
  systemResponse: z.string().optional().describe('System response to the action (if applicable)'),
});

export type FlowStep = z.infer<typeof flowStepSchema>;

/**
 * Alternative Flow Schema
 * Represents an alternative or exception flow branching from the main flow
 */
export const alternativeFlowSchema = z.object({
  id: z.string().describe('Unique identifier for the alternative flow (e.g., "AF1", "EF1")'),
  name: z.string().describe('Name describing the alternative flow'),
  branchPoint: z.number().describe('Step number in main flow where this branches off'),
  condition: z.string().describe('Condition that triggers this alternative flow'),
  steps: z.array(flowStepSchema).describe('Steps in this alternative flow'),
  rejoinsAt: z.number().optional().describe('Step number in main flow where this rejoins (null if terminates)'),
});

export type AlternativeFlow = z.infer<typeof alternativeFlowSchema>;

/**
 * Use Case Priority (MoSCoW method)
 */
export const useCasePrioritySchema = z.enum(['must', 'should', 'could', 'wont']);
export type UseCasePriority = z.infer<typeof useCasePrioritySchema>;

/**
 * Use Case Status
 */
export const useCaseStatusSchema = z.enum(['draft', 'validated']);
export type UseCaseStatus = z.infer<typeof useCaseStatusSchema>;

/**
 * Use Case Schema
 * Represents a specific action or workflow a user can perform
 * Enhanced with v2.0 fields for mainFlow, alternativeFlows, acceptanceCriteria
 */
export const useCaseSchema = z.object({
  id: z.string().describe('Unique identifier (e.g., "UC1", "UC2")'),
  name: z.string().describe('Name as verb phrase (e.g., "Place Order", "View Dashboard")'),
  description: z.string().describe('Detailed description of what happens in this use case'),
  actor: z.string().describe('Name of the primary actor for this use case'),
  preconditions: z.array(z.string()).optional().describe('Conditions that must be true before this use case'),
  postconditions: z.array(z.string()).optional().describe('Conditions that are true after successful completion'),
  trigger: z.string().optional().describe('Event or action that initiates this use case'),
  outcome: z.string().optional().describe('Expected result or outcome of this use case'),
  // Enhanced v2.0 fields (all optional for backward compatibility)
  mainFlow: z.array(flowStepSchema).optional().describe('Main flow steps with actor, action, and system response'),
  alternativeFlows: z.array(alternativeFlowSchema).optional().describe('Alternative or exception flows'),
  acceptanceCriteria: z.array(z.string()).optional().describe('Testable acceptance criteria for this use case'),
  priority: useCasePrioritySchema.optional().describe('MoSCoW priority (must/should/could/wont)'),
  status: useCaseStatusSchema.optional().describe('Draft or validated status'),
});

export type UseCase = z.infer<typeof useCaseSchema>;

/**
 * Enhanced Use Case Schema (requires all v2.0 fields)
 * Use this for validated use cases with complete data
 */
export const enhancedUseCaseSchema = z.object({
  id: z.string().describe('Unique identifier (e.g., "UC1", "UC2")'),
  name: z.string().describe('Name as verb phrase (e.g., "Place Order", "View Dashboard")'),
  description: z.string().describe('Detailed description of what happens in this use case'),
  actor: z.string().describe('Name of the primary actor for this use case'),
  trigger: z.string().describe('Event or action that initiates this use case'),
  outcome: z.string().describe('Expected result or outcome of this use case'),
  preconditions: z.array(z.string()).describe('Conditions that must be true before this use case'),
  postconditions: z.array(z.string()).describe('Conditions that are true after successful completion'),
  mainFlow: z.array(flowStepSchema).describe('Main flow steps with actor, action, and system response'),
  alternativeFlows: z.array(alternativeFlowSchema).describe('Alternative or exception flows'),
  acceptanceCriteria: z.array(z.string()).describe('Testable acceptance criteria for this use case'),
  priority: useCasePrioritySchema.describe('MoSCoW priority (must/should/could/wont)'),
  status: useCaseStatusSchema.describe('Draft or validated status'),
});

export type EnhancedUseCase = z.infer<typeof enhancedUseCaseSchema>;

/**
 * System Boundaries Schema
 * Defines what is inside vs outside the system scope
 */
export const systemBoundariesSchema = z.object({
  internal: z.array(z.string()).describe('Components/features that are part of the system'),
  external: z.array(z.string()).describe('External systems, APIs, or services'),
  inScope: z.array(z.string()).optional().describe('Deliverables explicitly in scope'),
  outOfScope: z.array(z.string()).optional().describe('Deliverables explicitly out of scope'),
});

export type SystemBoundaries = z.infer<typeof systemBoundariesSchema>;

/**
 * Data Entity Schema
 * Represents core data objects in the system
 */
export const dataEntitySchema = z.object({
  name: z.string().describe('Name of the data entity (e.g., "User", "Order", "Product")'),
  attributes: z.array(z.string()).describe('List of attributes or fields for this entity'),
  relationships: z.array(z.string()).describe('Relationships with other entities'),
});

export type DataEntity = z.infer<typeof dataEntitySchema>;

// ============================================================
// Goals & Metrics Schema
// ============================================================

/**
 * Goal/Success Metric Schema
 * Structured representation of a project goal with measurable success criteria
 */
export const goalMetricSchema = z.object({
  goal: z.string().describe('The goal statement'),
  metric: z.string().describe('How success will be measured'),
  target: z.string().optional().describe('Target value or threshold for the metric'),
});

export type GoalMetric = z.infer<typeof goalMetricSchema>;

// ============================================================
// Problem Statement Schema
// ============================================================

/**
 * Problem Statement Schema
 * Extracted from conversation as a core PRD section
 */
export const problemStatementSchema = z.object({
  summary: z.string().describe('Concise 1-2 sentence problem summary'),
  context: z.string().describe('Background and context of the problem'),
  impact: z.string().describe('Impact on the business or users if not solved'),
  goals: z.array(z.string()).describe('Goals the solution should achieve'),
});

export type ProblemStatement = z.infer<typeof problemStatementSchema>;

// ============================================================
// Non-Functional Requirements Schema
// ============================================================

/**
 * NFR Category
 * Categories of non-functional requirements
 */
export const nfrCategorySchema = z.enum([
  'performance',
  'security',
  'scalability',
  'reliability',
  'usability',
  'maintainability',
  'compliance',
]);

export type NfrCategory = z.infer<typeof nfrCategorySchema>;

/**
 * Non-Functional Requirement Schema
 * Represents a single non-functional requirement with measurable criteria
 */
export const nonFunctionalRequirementSchema = z.object({
  category: nfrCategorySchema.describe('Category of the non-functional requirement'),
  requirement: z.string().describe('The requirement statement'),
  metric: z.string().optional().describe('How this requirement will be measured'),
  target: z.string().optional().describe('Target value or threshold'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).describe('Priority level'),
});

export type NonFunctionalRequirement = z.infer<typeof nonFunctionalRequirementSchema>;

// ============================================================
// Extraction Schema (Phase 10)
// ============================================================

/**
 * Complete Extraction Schema
 * Used by the data extraction agent to extract all PRD data from conversations
 */
export const extractionSchema = z.object({
  actors: z.array(actorSchema).describe('All actors mentioned in the conversation'),
  useCases: z.array(useCaseSchema).describe('All use cases identified from the conversation'),
  systemBoundaries: systemBoundariesSchema.describe('System scope boundaries'),
  dataEntities: z.array(dataEntitySchema).describe('Core data objects in the system'),
  problemStatement: problemStatementSchema.optional().describe('Problem statement extracted from conversation'),
  goalsMetrics: z.array(goalMetricSchema).optional().describe('Goals with measurable success criteria'),
  nonFunctionalRequirements: z.array(nonFunctionalRequirementSchema).optional().describe('Non-functional requirements extracted from conversation'),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

// ============================================================
// PRD Artifact Schemas (PRD-SPEC Compliance)
// ============================================================

/**
 * Requirements Table Row Schema
 * Structured representation of a single requirement
 * Aligns with PRD-SPEC requirements_table artifact minimum
 */
export const requirementsTableRowSchema = z.object({
  id: z.string().describe('Unique requirement ID (e.g., "REQ-001")'),
  name: z.string().describe('Short abstract name for the requirement'),
  description: z.string().describe('Full requirement statement using "shall" language'),
  source: z.string().describe('Source use case or UCBD step (e.g., "UC1.3")'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).describe('Requirement priority'),
  testability: z.string().describe('How this requirement can be tested/verified'),
  status: z.enum(['Draft', 'Approved', 'Implemented', 'Verified']).default('Draft'),
  category: z.enum([
    'Functional',
    'Performance',
    'Security',
    'Usability',
    'Reliability',
    'Other'
  ]).describe('Requirement category'),
});

export type RequirementsTableRow = z.infer<typeof requirementsTableRowSchema>;

/**
 * Requirements Table Schema
 * Collection of all requirements
 */
export const requirementsTableSchema = z.object({
  projectId: z.number().describe('Associated project ID'),
  requirements: z.array(requirementsTableRowSchema).describe('List of all requirements'),
  metadata: z.object({
    totalCount: z.number(),
    byPriority: z.record(z.number()),
    byCategory: z.record(z.number()),
    generatedAt: z.string(),
  }).optional(),
});

export type RequirementsTable = z.infer<typeof requirementsTableSchema>;

/**
 * Constants Table Row Schema
 * Represents system constants and configuration values
 * Aligns with PRD-SPEC constants_table artifact minimum
 */
export const constantsTableRowSchema = z.object({
  name: z.string().describe('Constant name (e.g., "MAX_LOGIN_ATTEMPTS")'),
  value: z.string().describe('Constant value (can be number, string, or expression)'),
  units: z.string().optional().describe('Units if applicable (e.g., "seconds", "MB", "requests/min")'),
  description: z.string().describe('Purpose and usage of this constant'),
  category: z.enum([
    'Performance',
    'Security',
    'Business Logic',
    'UI/UX',
    'Integration',
    'Other'
  ]).describe('Constant category'),
});

export type ConstantsTableRow = z.infer<typeof constantsTableRowSchema>;

/**
 * Constants Table Schema
 * Collection of all system constants
 */
export const constantsTableSchema = z.object({
  projectId: z.number().describe('Associated project ID'),
  constants: z.array(constantsTableRowSchema).describe('List of all constants'),
  metadata: z.object({
    totalCount: z.number(),
    byCategory: z.record(z.number()),
    generatedAt: z.string(),
  }).optional(),
});

export type ConstantsTable = z.infer<typeof constantsTableSchema>;

/**
 * Activity Diagram Step Schema
 * Represents a single step/node in a SysML Activity Diagram
 */
export const activityDiagramStepSchema = z.object({
  id: z.string().describe('Unique step ID (e.g., "STEP-1")'),
  type: z.enum([
    'start',
    'end',
    'action',
    'decision',
    'merge',
    'fork',
    'join'
  ]).describe('Type of activity node'),
  label: z.string().describe('Step label or description'),
  actor: z.string().optional().describe('Actor responsible for this step (if applicable)'),
  precondition: z.string().optional().describe('Condition required before this step'),
  postcondition: z.string().optional().describe('Condition after this step completes'),
  transitions: z.array(z.object({
    targetId: z.string().describe('ID of the next step'),
    condition: z.string().optional().describe('Condition for this transition (for decision nodes)'),
    label: z.string().optional().describe('Transition label'),
  })).describe('Outgoing transitions to other steps'),
});

export type ActivityDiagramStep = z.infer<typeof activityDiagramStepSchema>;

/**
 * Activity Diagram Spec Schema
 * Complete structured representation of a SysML Activity Diagram
 * Aligns with PRD-SPEC sysml_activity_diagram artifact minimum
 */
export const activityDiagramSpecSchema = z.object({
  useCaseId: z.string().describe('Associated use case ID'),
  useCaseName: z.string().describe('Name of the use case this diagram represents'),
  swimlanes: z.array(z.object({
    id: z.string(),
    actor: z.string(),
    steps: z.array(z.string()).describe('Step IDs in this swimlane'),
  })).optional().describe('Optional swimlanes for multi-actor workflows'),
  steps: z.array(activityDiagramStepSchema).describe('All workflow steps'),
  metadata: z.object({
    description: z.string().optional(),
    complexity: z.enum(['Simple', 'Moderate', 'Complex']).optional(),
    estimatedDuration: z.string().optional(),
  }).optional(),
});

export type ActivityDiagramSpec = z.infer<typeof activityDiagramSpecSchema>;

// ============================================================
// Validation Schemas
// ============================================================

/**
 * Validation Result Schema
 * Used by PRD-SPEC validation system
 */
export const validationResultSchema = z.object({
  score: z.number().min(0).max(100).describe('Overall validation score (0-100)'),
  passed: z.number().describe('Number of checks passed'),
  failed: z.number().describe('Number of checks failed'),
  hardGatesResult: z.record(z.boolean()).describe('Results for each hard gate'),
  softChecksResult: z.record(z.boolean()).optional().describe('Results for soft consistency checks'),
  errors: z.array(z.string()).describe('Critical errors (hard gate failures)'),
  warnings: z.array(z.string()).describe('Non-critical warnings'),
  suggestions: z.array(z.string()).optional().describe('Suggestions for improvement'),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;

// ============================================================
// Helper Type Guards
// ============================================================

/**
 * Type guard to check if an object is a valid Actor
 */
export function isActor(obj: unknown): obj is Actor {
  return actorSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid UseCase
 */
export function isUseCase(obj: unknown): obj is UseCase {
  return useCaseSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid EnhancedUseCase
 * Validates that all enhanced v2.0 fields are present and valid
 */
export function isEnhancedUseCase(obj: unknown): obj is EnhancedUseCase {
  return enhancedUseCaseSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid FlowStep
 */
export function isFlowStep(obj: unknown): obj is FlowStep {
  return flowStepSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid AlternativeFlow
 */
export function isAlternativeFlow(obj: unknown): obj is AlternativeFlow {
  return alternativeFlowSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid RequirementsTableRow
 */
export function isRequirementsTableRow(obj: unknown): obj is RequirementsTableRow {
  return requirementsTableRowSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid ConstantsTableRow
 */
export function isConstantsTableRow(obj: unknown): obj is ConstantsTableRow {
  return constantsTableRowSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid ActivityDiagramSpec
 */
export function isActivityDiagramSpec(obj: unknown): obj is ActivityDiagramSpec {
  return activityDiagramSpecSchema.safeParse(obj).success;
}
