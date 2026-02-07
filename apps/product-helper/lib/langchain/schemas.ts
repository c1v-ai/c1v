import { z } from 'zod';

/**
 * Zod Schemas for LangChain Structured Outputs
 * Used for data extraction and PRD artifact generation
 *
 * Updated to match Epic.dev output format (2026-02-01)
 */

// ============================================================
// Core PRD Entity Schemas (Epic.dev Parity)
// ============================================================

/**
 * Technical Proficiency Level
 * Matches Epic.dev persona technical proficiency options
 */
export const technicalProficiencySchema = z.enum(['low', 'medium', 'high']);
export type TechnicalProficiency = z.infer<typeof technicalProficiencySchema>;

/**
 * Actor/Persona Schema (Epic.dev: "Target Users")
 * Represents users, systems, or external entities that interact with the product
 * Enhanced to match Epic.dev persona format with demographics, tech proficiency, usage context
 *
 * Epic.dev parity: goals, painPoints, demographics, technicalProficiency, usageContext
 * should all be populated for complete personas. The extraction prompt enforces this.
 */
export const actorSchema = z.object({
  name: z.string().describe('Persona name with descriptor (e.g., "Sarah, The Health Conscious Professional")'),
  role: z.string().describe('Role or job title (e.g., "Marketing Manager", "Software Developer")'),
  description: z.string().describe('Detailed description of the persona and their context'),
  demographics: z.string().optional().describe('Age, background, profession details (e.g., "35 years old, works in tech startup")'),
  goals: z.array(z.string()).optional().describe('What this persona wants to achieve (2-5 specific goals)'),
  painPoints: z.array(z.string()).optional().describe('Current frustrations and problems (2-5 pain points)'),
  technicalProficiency: technicalProficiencySchema.optional().describe('Technical skill level: low, medium, or high'),
  usageContext: z.string().optional().describe('When/where/how they use the product (e.g., "Uses app during commute and lunch breaks")'),
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

// ============================================================
// Database Schema (Epic.dev Parity) - MAJOR UPGRADE
// ============================================================

/**
 * Database Field Type
 * Matches PostgreSQL/common database types
 */
export const dbFieldTypeSchema = z.enum([
  'uuid',
  'varchar',
  'text',
  'integer',
  'bigint',
  'smallint',
  'boolean',
  'timestamp',
  'timestamptz',
  'date',
  'time',
  'jsonb',
  'json',
  'decimal',
  'float',
  'double',
  'enum',
  'array',
]);
export type DbFieldType = z.infer<typeof dbFieldTypeSchema>;

/**
 * Database Field Constraint
 */
export const dbConstraintSchema = z.enum([
  'PK',        // Primary Key
  'FK',        // Foreign Key
  'UNIQUE',    // Unique constraint
  'NOT NULL',  // Not null constraint
  'CHECK',     // Check constraint
  'DEFAULT',   // Has default value
  'INDEX',     // Indexed field
]);
export type DbConstraint = z.infer<typeof dbConstraintSchema>;

/**
 * Database Field Schema (Epic.dev: full field definitions)
 * Represents a single field/column in a database entity
 */
export const databaseFieldSchema = z.object({
  name: z.string().describe('Field name (e.g., "id", "email", "created_at")'),
  type: dbFieldTypeSchema.describe('Data type (uuid, varchar, integer, etc.)'),
  typeParams: z.string().optional().describe('Type parameters (e.g., "(255)" for varchar, "(10,2)" for decimal)'),
  nullable: z.boolean().describe('Whether the field can be null'),
  defaultValue: z.string().optional().describe('Default value if any (e.g., "now()", "true", "\'active\'")'),
  constraints: z.array(dbConstraintSchema).describe('Constraints on this field (PK, FK, UNIQUE, etc.)'),
  foreignKey: z.object({
    table: z.string().describe('Referenced table name'),
    column: z.string().describe('Referenced column name'),
    onDelete: z.enum(['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION']).optional(),
  }).optional().describe('Foreign key reference if this is an FK'),
  description: z.string().describe('Purpose and usage of this field'),
});

export type DatabaseField = z.infer<typeof databaseFieldSchema>;

/**
 * Database Relationship Type
 */
export const dbRelationshipTypeSchema = z.enum(['1:1', '1:N', 'N:1', 'N:M']);
export type DbRelationshipType = z.infer<typeof dbRelationshipTypeSchema>;

/**
 * Database Relationship Schema
 * Represents a relationship between two entities
 */
export const databaseRelationshipSchema = z.object({
  type: dbRelationshipTypeSchema.describe('Relationship cardinality (1:1, 1:N, N:1, N:M)'),
  targetEntity: z.string().describe('Name of the related entity'),
  foreignKey: z.string().describe('Foreign key field name'),
  inverseField: z.string().optional().describe('Field name on the target entity for bidirectional relationships'),
  onDelete: z.enum(['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION']).optional().describe('Delete behavior'),
  description: z.string().optional().describe('Description of the relationship'),
});

export type DatabaseRelationship = z.infer<typeof databaseRelationshipSchema>;

/**
 * Database Index Type
 */
export const dbIndexTypeSchema = z.enum(['btree', 'hash', 'gin', 'gist', 'unique', 'partial']);
export type DbIndexType = z.infer<typeof dbIndexTypeSchema>;

/**
 * Database Index Schema
 * Represents an index on a database entity
 */
export const databaseIndexSchema = z.object({
  name: z.string().optional().describe('Index name (auto-generated if not specified)'),
  columns: z.array(z.string()).describe('Columns included in the index'),
  type: dbIndexTypeSchema.describe('Index type (btree, gin, unique, etc.)'),
  condition: z.string().optional().describe('Partial index condition (e.g., "WHERE is_active = true")'),
});

export type DatabaseIndex = z.infer<typeof databaseIndexSchema>;

/**
 * Database Entity Schema (Epic.dev: "Backend" section)
 * Represents a complete database table with all fields, relationships, and indexes
 * REPLACES the simple dataEntitySchema for generation output
 */
export const databaseEntitySchema = z.object({
  name: z.string().describe('Table name in snake_case (e.g., "app_users", "meal_plans")'),
  description: z.string().describe('Purpose and usage of this entity'),
  fields: z.array(databaseFieldSchema).describe('All fields/columns in this entity'),
  relationships: z.array(databaseRelationshipSchema).optional().describe('Relationships to other entities'),
  indexes: z.array(databaseIndexSchema).optional().describe('Indexes for query optimization'),
});

export type DatabaseEntity = z.infer<typeof databaseEntitySchema>;

/**
 * Complete Database Schema (Epic.dev: "Backend" → full schema view)
 * Collection of all database entities
 */
export const databaseSchemaSchema = z.object({
  entities: z.array(databaseEntitySchema).describe('All database entities/tables'),
  metadata: z.object({
    totalEntities: z.number(),
    totalFields: z.number(),
    generatedAt: z.string(),
  }).optional(),
});

export type DatabaseSchema = z.infer<typeof databaseSchemaSchema>;

/**
 * Simple Data Entity Schema (for extraction - lightweight)
 * Used during conversation extraction before full schema generation
 * Keep for backward compatibility with extraction phase
 */
export const dataEntitySchema = z.object({
  name: z.string().describe('Name of the data entity (e.g., "User", "Order", "Product")'),
  attributes: z.array(z.string()).describe('List of attributes or fields for this entity'),
  relationships: z.array(z.string()).describe('Relationships with other entities'),
});

export type DataEntity = z.infer<typeof dataEntitySchema>;

// ============================================================
// Tech Stack Schema (Epic.dev Parity) - NEW
// ============================================================

/**
 * Tech Stack Category
 * Matches Epic.dev tech stack categories
 */
export const techStackCategoryTypeSchema = z.enum([
  'backend',
  'frontend',
  'database',
  'infrastructure',
  'cicd',
  'thirdParty',
  'devTools',
  'testing',
  'monitoring',
  'security',
]);
export type TechStackCategoryType = z.infer<typeof techStackCategoryTypeSchema>;

/**
 * Tech Stack Alternative
 * Represents an alternative technology that was considered
 */
export const techStackAlternativeSchema = z.object({
  name: z.string().describe('Alternative technology name'),
  reason: z.string().optional().describe('Why this was not chosen as the primary'),
});

export type TechStackAlternative = z.infer<typeof techStackAlternativeSchema>;

/**
 * Tech Stack Item Schema (Epic.dev: individual technology choice)
 * Represents a single technology in the stack
 */
export const techStackItemSchema = z.object({
  name: z.string().describe('Technology name (e.g., "TypeScript", "PostgreSQL", "React Native")'),
  version: z.string().optional().describe('Version or version range (e.g., "9.x", "18.2.0+", "N/A")'),
  role: z.string().describe('Role in the stack (e.g., "Language", "Framework", "ORM", "Cache")'),
  description: z.string().describe('What this technology provides and why it was chosen'),
  rationale: z.string().optional().describe('Detailed reasoning for this choice'),
  alternatives: z.array(techStackAlternativeSchema).optional().describe('Alternative technologies considered'),
  website: z.string().optional().describe('Official website URL'),
});

export type TechStackItem = z.infer<typeof techStackItemSchema>;

/**
 * Tech Stack Category Schema
 * Groups related technologies together
 */
export const techStackCategorySchema = z.object({
  name: techStackCategoryTypeSchema.describe('Category name (backend, frontend, database, etc.)'),
  displayName: z.string().optional().describe('Human-readable category name'),
  items: z.array(techStackItemSchema).describe('Technologies in this category'),
});

export type TechStackCategory = z.infer<typeof techStackCategorySchema>;

/**
 * Risk and Mitigation Schema
 * Represents a potential risk with the tech stack and how to address it
 */
export const riskMitigationSchema = z.object({
  risk: z.string().describe('Description of the potential risk'),
  impact: z.enum(['high', 'medium', 'low']).describe('Impact level if risk materializes'),
  mitigation: z.string().describe('Strategy to mitigate or address this risk'),
});

export type RiskMitigation = z.infer<typeof riskMitigationSchema>;

/**
 * Complete Tech Stack Schema (Epic.dev: "Tech Stack" page)
 * Full technology stack with categories, justification, and risk analysis
 */
export const techStackSchema = z.object({
  categories: z.array(techStackCategorySchema).describe('Technology categories with their items'),
  justification: z.string().optional().describe('Overall architecture justification explaining the tech choices'),
  risksAndMitigations: z.array(riskMitigationSchema).optional().describe('Identified risks and mitigation strategies'),
  metadata: z.object({
    projectType: z.string().optional(),
    targetScale: z.string().optional(),
    generatedAt: z.string(),
  }).optional(),
});

export type TechStack = z.infer<typeof techStackSchema>;

// ============================================================
// User Stories Schema (Epic.dev Parity) - NEW
// ============================================================

/**
 * User Story Priority (Epic.dev format)
 * Includes 'critical' level from Epic.dev
 */
export const userStoryPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type UserStoryPriority = z.infer<typeof userStoryPrioritySchema>;

/**
 * User Story Status
 */
export const userStoryStatusSchema = z.enum(['todo', 'in-progress', 'done', 'blocked']);
export type UserStoryStatus = z.infer<typeof userStoryStatusSchema>;

/**
 * User Story Schema (Epic.dev: "User Stories" page)
 * Represents a single user story with epic grouping
 */
export const userStorySchema = z.object({
  id: z.string().describe('Unique identifier (e.g., "US-001", "US-002")'),
  title: z.string().describe('Story title as user action (e.g., "User Registration and Basic Profile Creation")'),
  epic: z.string().describe('Epic/feature group this story belongs to'),
  description: z.string().optional().describe('Detailed description of the story'),
  status: userStoryStatusSchema.describe('Current status (todo, in-progress, done, blocked)'),
  priority: userStoryPrioritySchema.describe('Priority level (critical, high, medium, low)'),
  estimate: z.string().optional().describe('Time estimate (e.g., "2 days", "4 hours")'),
  acceptanceCriteria: z.array(z.string()).optional().describe('Testable acceptance criteria'),
  assignee: z.string().optional().describe('Assigned team member'),
});

export type UserStory = z.infer<typeof userStorySchema>;

/**
 * Epic Schema
 * Groups related user stories together
 */
export const epicSchema = z.object({
  name: z.string().describe('Epic name (e.g., "User Account & Profile Management")'),
  description: z.string().optional().describe('Description of this epic'),
  stories: z.array(userStorySchema).describe('User stories in this epic'),
  progress: z.object({
    completed: z.number(),
    total: z.number(),
  }).optional().describe('Progress tracking (completed/total)'),
});

export type Epic = z.infer<typeof epicSchema>;

/**
 * User Stories Summary Schema
 * Complete user stories view with all epics
 */
export const userStoriesSummarySchema = z.object({
  totalEstimate: z.string().optional().describe('Total time estimate (e.g., "~30.5 days")'),
  epics: z.array(epicSchema).describe('All epics with their stories'),
  metadata: z.object({
    totalStories: z.number(),
    completedStories: z.number(),
    generatedAt: z.string(),
  }).optional(),
});

export type UserStoriesSummary = z.infer<typeof userStoriesSummarySchema>;

// ============================================================
// Architecture Diagram Schema (Epic.dev Parity) - NEW
// ============================================================

/**
 * Architecture Component Type
 */
export const architectureComponentTypeSchema = z.enum([
  'ui',
  'gateway',
  'service',
  'database',
  'cache',
  'queue',
  'external',
  'storage',
]);
export type ArchitectureComponentType = z.infer<typeof architectureComponentTypeSchema>;

/**
 * Architecture Component Schema
 * Represents a component in the system architecture
 */
export const architectureComponentSchema = z.object({
  id: z.string().describe('Unique identifier for the component'),
  name: z.string().describe('Component name (e.g., "API Gateway", "User Service")'),
  type: architectureComponentTypeSchema.describe('Type of component'),
  layer: z.string().optional().describe('Architecture layer (e.g., "Backend Services", "Databases")'),
  description: z.string().optional().describe('What this component does'),
});

export type ArchitectureComponent = z.infer<typeof architectureComponentSchema>;

/**
 * Architecture Connection Schema
 * Represents a connection between two components
 */
export const architectureConnectionSchema = z.object({
  from: z.string().describe('Source component ID'),
  to: z.string().describe('Target component ID'),
  label: z.string().optional().describe('Connection label (e.g., "Requests data", "Sends notifications")'),
  protocol: z.string().optional().describe('Protocol used (e.g., "REST", "gRPC", "WebSocket")'),
  bidirectional: z.boolean().optional().describe('Whether the connection is bidirectional'),
});

export type ArchitectureConnection = z.infer<typeof architectureConnectionSchema>;

/**
 * Architecture Diagram Schema (Epic.dev: "Architecture Diagram" page)
 * Complete system architecture representation
 */
export const architectureDiagramSchema = z.object({
  name: z.string().describe('Diagram name'),
  description: z.string().optional().describe('Description of the architecture'),
  components: z.array(architectureComponentSchema).describe('All components in the system'),
  connections: z.array(architectureConnectionSchema).describe('Connections between components'),
  layers: z.array(z.object({
    name: z.string(),
    componentIds: z.array(z.string()),
  })).optional().describe('Logical groupings of components'),
});

export type ArchitectureDiagram = z.infer<typeof architectureDiagramSchema>;

// ============================================================
// System Overview Schema (Epic.dev Parity) - NEW
// ============================================================

/**
 * External Integration Schema
 * Represents an external service integration
 */
export const externalIntegrationSchema = z.object({
  name: z.string().describe('Service name (e.g., "Stripe", "SendGrid")'),
  purpose: z.string().describe('What this integration is used for'),
  protocol: z.string().optional().describe('Integration protocol (e.g., "REST API", "Webhook")'),
  category: z.string().optional().describe('Category (e.g., "Payment", "Email", "Analytics")'),
});

export type ExternalIntegration = z.infer<typeof externalIntegrationSchema>;

/**
 * System Overview Schema (Epic.dev: "System Overview" page)
 * High-level system documentation
 */
export const systemOverviewSchema = z.object({
  introduction: z.object({
    purpose: z.string().describe('Purpose of this document'),
    targetAudience: z.string().describe('Who this document is for'),
  }),
  systemOverview: z.object({
    name: z.string().describe('System name'),
    highLevelArchitecture: z.string().describe('Prose description of the architecture'),
    coreFunctionality: z.array(z.string()).describe('Core features as bullet points'),
    keyTechnologies: z.string().describe('Summary of key technologies used'),
    coreDataEntities: z.array(z.string()).describe('Main data entities in the system'),
  }),
  userInteraction: z.object({
    workflow: z.object({
      onboarding: z.string().describe('User onboarding process'),
      dailyInteraction: z.string().describe('Typical daily usage patterns'),
    }),
    externalIntegrations: z.array(externalIntegrationSchema).describe('Third-party integrations'),
  }),
  nonFunctionalConsiderations: z.object({
    securityAndPrivacy: z.string().describe('Security and privacy approach'),
    scalabilityAndPerformance: z.string().describe('Scalability and performance strategy'),
  }),
});

export type SystemOverview = z.infer<typeof systemOverviewSchema>;

// ============================================================
// Goals & Metrics Schema (Epic.dev Parity) - UPDATED
// ============================================================

/**
 * Goal/Success Metric Schema (Epic.dev: "Goals & Success Metrics" section)
 * Structured representation of a project goal with measurable success criteria
 * Updated to include baseline and timeframe from Epic.dev
 *
 * Epic.dev parity: target, baseline, timeframe should all be populated.
 */
export const goalMetricSchema = z.object({
  goal: z.string().describe('The goal/metric name (e.g., "Healthy Daily User MAUs")'),
  metric: z.string().describe('How success will be measured (measurement method)'),
  target: z.string().optional().describe('Target value or threshold (e.g., "10,000 users", "99.9%")'),
  baseline: z.string().optional().describe('Current baseline before solution (e.g., "N/A", "500 users", "TBD")'),
  timeframe: z.string().optional().describe('When to achieve this (e.g., "End of Q2", "Within 6 months")'),
});

export type GoalMetric = z.infer<typeof goalMetricSchema>;

// ============================================================
// Problem Statement Schema (Epic.dev Parity) - UPDATED
// ============================================================

/**
 * Problem Statement Schema (Epic.dev: "Problem Statement" section)
 * Extracted from conversation as a core PRD section
 * Updated to include targetAudience and longer description support
 */
export const problemStatementSchema = z.object({
  summary: z.string().describe('Detailed problem description (can be multiple paragraphs explaining the core problem)'),
  targetAudience: z.string().optional().describe('Who has this problem - specific user groups affected'),
  context: z.string().describe('Background and market context of the problem'),
  impact: z.string().describe('Impact on the business or users if not solved'),
  goals: z.array(z.string()).describe('High-level goals the solution should achieve'),
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
// Extraction Schema (Phase 10) - UPDATED
// ============================================================

/**
 * Complete Extraction Schema
 * Used by the data extraction agent to extract all PRD data from conversations
 * Updated with Epic.dev parity fields
 */
export const extractionSchema = z.object({
  // Core PRD sections
  actors: z.array(actorSchema).default([]).describe('All actors/personas mentioned in the conversation'),
  useCases: z.array(useCaseSchema).default([]).describe('All use cases identified from the conversation'),
  systemBoundaries: systemBoundariesSchema.default({ internal: [], external: [] }).describe('System scope boundaries'),
  dataEntities: z.array(dataEntitySchema).default([]).describe('Core data objects in the system (lightweight for extraction)'),

  // Epic.dev parity sections
  problemStatement: problemStatementSchema.optional().describe('Problem statement with target audience'),
  goalsMetrics: z.array(goalMetricSchema).optional().describe('Goals with measurable success criteria and baselines'),
  nonFunctionalRequirements: z.array(nonFunctionalRequirementSchema).optional().describe('Non-functional requirements'),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

// ============================================================
// Generator Output Schemas (Epic.dev Parity)
// ============================================================

/**
 * Complete PRD Generation Output
 * Full output matching Epic.dev's PRD structure
 */
export const prdGenerationOutputSchema = z.object({
  problemStatement: problemStatementSchema,
  targetUsers: z.array(actorSchema).describe('Personas/actors'),
  goalsAndMetrics: z.array(goalMetricSchema),
  scope: systemBoundariesSchema,
  nonFunctionalRequirements: z.array(nonFunctionalRequirementSchema),
});

export type PrdGenerationOutput = z.infer<typeof prdGenerationOutputSchema>;

/**
 * Complete Backend Generation Output
 * Full output matching Epic.dev's Backend section
 */
export const backendGenerationOutputSchema = z.object({
  databaseSchema: databaseSchemaSchema,
  techStack: techStackSchema,
});

export type BackendGenerationOutput = z.infer<typeof backendGenerationOutputSchema>;

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

/**
 * Type guard to check if an object is a valid DatabaseEntity
 */
export function isDatabaseEntity(obj: unknown): obj is DatabaseEntity {
  return databaseEntitySchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid TechStack
 */
export function isTechStack(obj: unknown): obj is TechStack {
  return techStackSchema.safeParse(obj).success;
}

/**
 * Type guard to check if an object is a valid UserStory
 */
export function isUserStory(obj: unknown): obj is UserStory {
  return userStorySchema.safeParse(obj).success;
}
