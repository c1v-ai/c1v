/**
 * Question Bank Schema and Types
 *
 * Defines the structure for intake questions used in the conversational
 * requirements gathering process. Questions are organized by phase and
 * tied to PRD-SPEC hard gates for validation.
 *
 * @module intake/question-bank
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { z } from 'zod';

/**
 * Question Phase Enum
 * Represents the different phases of requirements gathering,
 * ordered by dependency and artifact generation sequence.
 */
export const QuestionPhase = z.enum([
  'actors',
  'external_systems',
  'use_cases',
  'scope',
  'data_entities',
  'constraints',
  'success_criteria',
]);

export type QuestionPhase = z.infer<typeof QuestionPhase>;

/**
 * Question Schema
 * Complete definition for an intake question including priority,
 * dependencies, and extraction hints.
 */
export const QuestionSchema = z.object({
  /** Unique identifier for this question (e.g., 'Q_ACTORS_PRIMARY') */
  id: z.string(),

  /** Phase this question belongs to */
  phase: QuestionPhase,

  /** Full question text to display or use as prompt basis */
  text: z.string(),

  /** Short description for inline clarification or logs */
  shortText: z.string(),

  /**
   * Base priority score (1-10)
   * Higher values = more important to ask early
   */
  basePriority: z.number().min(1).max(10),

  /**
   * PRD-SPEC hard gate this question addresses
   * Used to boost priority when gate is not yet passed
   */
  prdSpecGate: z.string().optional(),

  /**
   * Question IDs that must be answered before this one
   * @default []
   */
  requires: z.array(z.string()).default([]),

  /**
   * Data fields that must exist before asking this question
   * Uses dot notation (e.g., 'actors', 'useCases.length')
   * @default []
   */
  requiresData: z.array(z.string()).default([]),

  /**
   * Data fields this question populates
   * Used for tracking extraction targets
   */
  extractsTo: z.array(z.string()),

  /**
   * Fields that might already contain an answer to this question
   * Used for inference and skip logic
   * @default []
   */
  canInferFrom: z.array(z.string()).default([]),

  /**
   * Follow-up prompts for vague or incomplete answers
   * @default []
   */
  clarificationPrompts: z.array(z.string()).default([]),

  /**
   * Expression to evaluate for skipping this question
   * Simple expressions like 'actors.length >= 3'
   * @optional
   */
  skipCondition: z.string().optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

/**
 * Validate that a question object conforms to the schema
 * @param obj - Object to validate
 * @returns True if valid Question
 */
export function isValidQuestion(obj: unknown): obj is Question {
  return QuestionSchema.safeParse(obj).success;
}

/**
 * Parse and validate a question, returning errors if invalid
 * @param obj - Object to parse
 * @returns Parsed Question or throws ZodError
 */
export function parseQuestion(obj: unknown): Question {
  return QuestionSchema.parse(obj);
}
