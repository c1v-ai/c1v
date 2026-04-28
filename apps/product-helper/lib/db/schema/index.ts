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

// SS7 Traceback citation schema (W0A, v1 hardening sprint) — design hook
// only; underlying ./traceback module never landed. Re-exports commented
// out so `next build` (Vercel) doesn't fail type-check on a missing module.
// Real embedding-dim constant in production use is `KB_EMBEDDING_DIMENSIONS`
// from './kb-chunks' (line 67 below). Restore this block when the SS7 W0A
// traceback schema actually lands.
// export {
//   tracebackCitations,
//   EMBEDDING_DIMENSIONS,
//   DEFAULT_CITATION_TTL_HOURS,
// } from './traceback';

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

// Wave C — Crawley artifact tables (REQUIREMENTS-crawley §6, EC-V21-C.3)
export {
  m5Phase1FormTaxonomy,
  m5Phase2FunctionTaxonomy,
  m5Phase3FormFunctionConcept,
  m5Phase4SolutionNeutralConcept,
  m5Phase5ConceptExpansion,
  m3DecompositionPlane,
  m4DecisionNetworkFoundations,
  m4TradespaceParetoSensitivity,
  m4OptimizationPatterns,
  m2RequirementsCrawleyExtension,
  CRAWLEY_TABLES,
  CRAWLEY_PHASE_STATUSES,
  DECOMPOSITION_PLANES,
} from './crawley';
export type {
  CrawleyPhaseStatus,
  DecompositionPlane,
  M5Phase1FormTaxonomyRow,
  NewM5Phase1FormTaxonomyRow,
  M5Phase2FunctionTaxonomyRow,
  NewM5Phase2FunctionTaxonomyRow,
  M5Phase3FormFunctionConceptRow,
  NewM5Phase3FormFunctionConceptRow,
  M5Phase4SolutionNeutralConceptRow,
  NewM5Phase4SolutionNeutralConceptRow,
  M5Phase5ConceptExpansionRow,
  NewM5Phase5ConceptExpansionRow,
  M3DecompositionPlaneRow,
  NewM3DecompositionPlaneRow,
  M4DecisionNetworkFoundationsRow,
  NewM4DecisionNetworkFoundationsRow,
  M4TradespaceParetoSensitivityRow,
  NewM4TradespaceParetoSensitivityRow,
  M4OptimizationPatternsRow,
  NewM4OptimizationPatternsRow,
  M2RequirementsCrawleyExtensionRow,
  NewM2RequirementsCrawleyExtensionRow,
} from './crawley';
// SS7 Traceback type/validator re-exports — same gap as above; ./traceback
// and ./traceback-validators modules never landed. Commented out so the
// production type-check passes. Restore alongside the line ~46 block when
// the SS7 W0A traceback schema actually ships.
// export type {
//   TracebackCitation,
//   NewTracebackCitation,
// } from './traceback';
// export {
//   citationEmbeddingSchema,
//   nullableCitationEmbeddingSchema,
//   citationInputSchema,
//   citationRowSchema,
//   invalidateSourceInputSchema,
// } from './traceback-validators';
// export type {
//   CitationInput,
//   CitationRow,
//   InvalidateSourceInput,
// } from './traceback-validators';

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
