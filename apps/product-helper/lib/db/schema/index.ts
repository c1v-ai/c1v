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

// Module 0 — signup enrichment cache + per-project entry states
export {
  userSignals,
  USER_SIGNALS_TTL_DAYS,
  USER_SIGNAL_STATUSES,
} from './user-signals';
export type {
  UserSignalRow,
  NewUserSignalRow,
  UserSignalStatus,
} from './user-signals';
export {
  projectEntryStates,
  ENTRY_PATTERNS,
  PIPELINE_START_SUBMODULES,
} from './project-entry-states';
export type {
  ProjectEntryStateRow,
  NewProjectEntryStateRow,
  EntryPattern,
  PipelineStartSubmodule,
} from './project-entry-states';

// T6 Wave-4 — pipeline-wide run state (v1 §8.2)
export { projectRunState } from './project-run-state';
export type {
  ProjectRunStateRow,
  NewProjectRunStateRow,
  RevisionDelta,
} from './project-run-state';

// TA1 v2.1 Wave A — per-tenant synthesis artifact metadata (D-V21.04)
export {
  projectArtifacts,
  SYNTHESIS_STATUSES,
  EXPECTED_ARTIFACT_KINDS,
} from './project-artifacts';
export type {
  ProjectArtifactRow,
  NewProjectArtifactRow,
  SynthesisStatus,
  ExpectedArtifactKind,
} from './project-artifacts';
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
