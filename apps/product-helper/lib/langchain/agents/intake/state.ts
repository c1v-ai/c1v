/**
 * Intake State Schema
 *
 * Defines the complete state structure for tracking conversation progress,
 * extracted data, validation status, and artifact readiness during intake.
 *
 * @module intake/state
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { z } from 'zod';
import { QuestionPhase } from './question-bank';

/**
 * Question tracking entry
 * Records when a question was asked and its answer status
 */
export const QuestionTrackingSchema = z.object({
  /** Question ID from INTAKE_QUESTIONS */
  questionId: z.string(),

  /** ISO timestamp when question was asked */
  askedAt: z.string(),

  /** Whether an answer has been received */
  answerReceived: z.boolean(),

  /** Number of clarification follow-ups for this question */
  clarificationCount: z.number().default(0),
});

export type QuestionTracking = z.infer<typeof QuestionTrackingSchema>;

/**
 * Phase progress tracking
 * Tracks completion status for each question phase
 */
export const PhaseProgressSchema = z.object({
  /** Whether any question in this phase has been asked */
  started: z.boolean(),

  /** Whether all questions in this phase are complete */
  completed: z.boolean(),

  /** Number of questions asked in this phase */
  questionsAsked: z.number(),

  /** Number of questions remaining in this phase */
  questionsRemaining: z.number(),
});

export type PhaseProgress = z.infer<typeof PhaseProgressSchema>;

/**
 * Extracted data structure
 * Matches the ExtractionResult schema from langchain/schemas.ts
 * with additional fields for constraints and success criteria
 */
export const ExtractedDataSchema = z.object({
  actors: z.array(z.any()),
  useCases: z.array(z.any()),
  systemBoundaries: z.object({
    internal: z.array(z.string()),
    external: z.array(z.string()),
    inScope: z.array(z.string()),
    outOfScope: z.array(z.string()),
  }),
  dataEntities: z.array(z.any()),
  constraints: z.object({
    business: z.array(z.string()),
    technical: z.array(z.string()),
  }).optional(),
  successCriteria: z.array(z.string()).optional(),
});

export type ExtractedData = z.infer<typeof ExtractedDataSchema>;

/**
 * Validation status tracking
 * Records validation score and hard gate results
 */
export const ValidationStatusSchema = z.object({
  /** Overall validation score (0-100) */
  overallScore: z.number(),

  /** Map of hard gate ID to pass/fail status */
  hardGates: z.record(z.string(), z.boolean()),

  /** ISO timestamp of last validation */
  lastValidatedAt: z.string().optional(),
});

export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

/**
 * Artifact readiness tracking
 * Tracks which artifacts are ready to generate
 */
export const ArtifactReadinessSchema = z.object({
  /** Whether enough data exists to generate this artifact */
  ready: z.boolean(),

  /** Whether this artifact has been generated */
  generated: z.boolean(),

  /** Data fields blocking this artifact from being ready */
  blockedBy: z.array(z.string()).optional(),
});

export type ArtifactReadiness = z.infer<typeof ArtifactReadinessSchema>;

/**
 * Complete Intake State Schema
 * Full state for tracking a conversation through the intake process
 */
export const IntakeStateSchema = z.object({
  // Project reference
  /** Project ID in database */
  projectId: z.number(),

  /** Project name */
  projectName: z.string(),

  /** Project vision statement */
  projectVision: z.string(),

  // Question tracking
  /** History of questions asked */
  questionsAsked: z.array(QuestionTrackingSchema),

  // Current phase
  /** Current question phase */
  currentPhase: QuestionPhase,

  /** Progress per phase */
  phaseProgress: z.record(QuestionPhase, PhaseProgressSchema),

  // Extracted data (cumulative)
  /** All extracted PRD data */
  extractedData: ExtractedDataSchema,

  // Validation status
  /** SR-CORNELL validation status */
  validationStatus: ValidationStatusSchema,

  // Artifact readiness
  /** Readiness status per artifact type */
  artifactReadiness: z.record(z.string(), ArtifactReadinessSchema),

  // Stop detection
  /** Whether user has requested to stop */
  userRequestedStop: z.boolean().default(false),

  /** Reason for stop if requested */
  stopReason: z.string().optional(),

  // Metadata
  /** Total messages exchanged */
  messageCount: z.number(),

  /** ISO timestamp of last update */
  lastUpdatedAt: z.string(),
});

export type IntakeState = z.infer<typeof IntakeStateSchema>;

/**
 * Create an empty extracted data structure
 * @returns Empty ExtractedData
 */
export function createEmptyExtractedData(): ExtractedData {
  return {
    actors: [],
    useCases: [],
    systemBoundaries: {
      internal: [],
      external: [],
      inScope: [],
      outOfScope: [],
    },
    dataEntities: [],
    constraints: {
      business: [],
      technical: [],
    },
    successCriteria: [],
  };
}

/**
 * Create an empty validation status
 * @returns Empty ValidationStatus
 */
export function createEmptyValidationStatus(): ValidationStatus {
  return {
    overallScore: 0,
    hardGates: {},
  };
}

/**
 * Default artifact types that can be generated
 */
export const ARTIFACT_TYPES = [
  'context_diagram',
  'use_case_diagram',
  'scope_tree',
  'ucbd',
  'requirements_table',
  'constants_table',
  'sysml_activity_diagram',
] as const;

export type ArtifactType = typeof ARTIFACT_TYPES[number];
