/**
 * Phase Mapping
 *
 * Bridges the ArtifactPhase enum (used by the LangGraph state machine
 * and legacy completeness logic) with the KnowledgeBankStep type (used
 * by the educational content system).
 *
 * Provides helpers to:
 * - Map an artifact phase to its knowledge bank step
 * - Retrieve education context (thinking messages, tooltips, validation errors)
 * - Build a prompt-ready text block for LLM injection
 */

import type { ArtifactPhase } from '@/lib/langchain/graphs/types';
import {
  type KnowledgeBankStep,
  type ThinkingMessage,
  type TooltipTerm,
  type ValidationError,
  knowledgeBank,
} from './knowledge-bank';

// ---------------------------------------------------------------------------
// Phase -> Step mapping
// ---------------------------------------------------------------------------

const PHASE_TO_STEP: Record<ArtifactPhase, KnowledgeBankStep> = {
  context_diagram: 'context-diagram',
  use_case_diagram: 'use-case-diagram',
  scope_tree: 'scope-tree',
  ucbd: 'ucbd',
  requirements_table: 'functional-requirements',
  constants_table: 'functional-requirements', // fallback
  sysml_activity_diagram: 'sysml-activity-diagram',
};

/**
 * Convert an ArtifactPhase to its corresponding KnowledgeBankStep.
 */
export function phaseToStep(phase: ArtifactPhase): KnowledgeBankStep {
  return PHASE_TO_STEP[phase];
}

// ---------------------------------------------------------------------------
// Education context retrieval
// ---------------------------------------------------------------------------

export interface EducationContext {
  thinkingMessages: ThinkingMessage[];
  tooltipTerms: TooltipTerm[];
  validationErrors: Record<string, ValidationError>;
}

/**
 * Get the full education context for a given artifact phase.
 */
export function getEducationContext(phase: ArtifactPhase): EducationContext {
  const step = phaseToStep(phase);
  const entry = knowledgeBank[step];
  return {
    thinkingMessages: entry.thinkingMessages,
    tooltipTerms: entry.tooltipTerms,
    validationErrors: entry.validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Prompt block builder
// ---------------------------------------------------------------------------

/**
 * Build a text block suitable for injection into an LLM system/user prompt.
 *
 * The block contains:
 * - Key terminology with definitions (so the LLM uses correct terms)
 * - Common validation mistakes with educational guidance (so the LLM
 *   can proactively warn users)
 */
export function buildPromptEducationBlock(phase: ArtifactPhase): string {
  const { tooltipTerms, validationErrors } = getEducationContext(phase);
  const entry = knowledgeBank[phaseToStep(phase)];

  const lines: string[] = [];

  lines.push(`## Educational Context: ${entry.label}`);
  lines.push('');

  // Key terms
  lines.push('### Key Terms (use these terms correctly in your responses)');
  for (const t of tooltipTerms) {
    lines.push(`- **${t.term}**: ${t.definition}`);
  }
  lines.push('');

  // Common mistakes
  const errorEntries = Object.entries(validationErrors);
  if (errorEntries.length > 0) {
    lines.push('### Common Mistakes (proactively warn users about these)');
    for (const [, v] of errorEntries) {
      lines.push(`- ${v.error}`);
      lines.push(`  Why: ${v.why}`);
      lines.push(`  Fix: ${v.fix}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
