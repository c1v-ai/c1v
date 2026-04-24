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

// SS7 Traceback citation schema (W0A, v1 hardening sprint)
export {
  tracebackCitations,
  EMBEDDING_DIMENSIONS,
  DEFAULT_CITATION_TTL_HOURS,
} from './traceback';

// KB-8 Atlas entries (Module 8 — Public Stacks & Priors Atlas)
export {
  atlasEntries,
  ATLAS_ENTRY_KINDS,
  ATLAS_VERIFICATION_STATUSES,
  ATLAS_DAU_BANDS,
  ATLAS_DATA_QUALITY_GRADES,
  ATLAS_MIN_CORPUS_SIZE,
} from './atlas-entries';
export type {
  AtlasEntryRow,
  NewAtlasEntryRow,
  AtlasEntryKind,
  AtlasVerificationStatus,
  AtlasDauBand,
  AtlasDataQualityGrade,
} from './atlas-entries';

// RAG chunk store (7 modules + KB-8 atlas + KB-9 AI sysdesign corpus)
export { kbChunks, KB_EMBEDDING_DIMENSIONS } from './kb-chunks';
export type { KBChunkRow, NewKBChunkRow } from './kb-chunks';

// NFR-engine decision audit sink (G5 — append-only, hash-chained)
export { decisionAudit } from './decision-audit';
export type {
  DecisionAuditRow,
  NewDecisionAuditRow,
} from './decision-audit';
export type {
  TracebackCitation,
  NewTracebackCitation,
} from './traceback';
export {
  citationEmbeddingSchema,
  nullableCitationEmbeddingSchema,
  citationInputSchema,
  citationRowSchema,
  invalidateSourceInputSchema,
} from './traceback-validators';
export type {
  CitationInput,
  CitationRow,
  InvalidateSourceInput,
} from './traceback-validators';

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
