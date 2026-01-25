/**
 * v2.0 Schema Exports
 *
 * Re-exports all v2.0 types and validators for easy importing
 * Types come from v2-types.ts (interfaces)
 * Validators come from v2-validators.ts (Zod schemas)
 */

// Type definitions from v2-types.ts
export type {
  FlowStep,
  AlternativeFlow,
  EnhancedUseCase,
  UseCasePriority,
  UseCaseStatus,
  DatabaseField,
  DatabaseFieldType,
  FieldConstraint,
  DatabaseRelationship,
  RelationshipType,
  ReferentialAction,
  DatabaseIndex,
  DatabaseEntity,
  DatabaseSchemaModel,
  DatabaseEnum,
  TechChoice,
  TechCategory,
  TechAlternative,
  TechStackModel,
  UserStoryStatus,
  UserStoryPriority,
  UserStoryEffort,
  UserStory,
  ApiKey,
  ApiKeyScope,
  DeepPartial,
  NewUserStory,
  UserStoryUpdate,
} from './v2-types';

// Zod validators (schemas only, not types)
export {
  flowStepSchema,
  alternativeFlowSchema,
  useCasePrioritySchema,
  useCaseStatusSchema,
  enhancedUseCaseSchema,
  fieldConstraintSchema,
  databaseFieldSchema,
  referentialActionSchema,
  relationshipTypeSchema,
  databaseRelationshipSchema,
  databaseIndexSchema,
  databaseEntitySchema,
  databaseEnumSchema,
  databaseSchemaModelSchema,
  techCategorySchema,
  techAlternativeSchema,
  techChoiceSchema,
  techStackModelSchema,
  userStoryStatusSchema,
  userStoryPrioritySchema,
  userStoryEffortSchema,
  userStoryInputSchema,
  userStoryUpdateSchema,
  apiKeyScopeSchema,
  apiKeyInputSchema,
} from './v2-validators';
