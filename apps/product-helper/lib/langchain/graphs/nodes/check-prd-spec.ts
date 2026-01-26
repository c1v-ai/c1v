/**
 * Check PRD-SPEC Node
 *
 * Purpose: Run PRD-SPEC validation to determine if artifact is ready for generation.
 * Evaluates extracted data against hard gates and threshold requirements.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/check-prd-spec
 */

import {
  IntakeState,
  ArtifactPhase,
  ValidationResult as IntakeValidationResult,
  ARTIFACT_PHASE_SEQUENCE,
  getNextPhase,
} from '../types';
import { validateProject } from '@/lib/validation/validator';
import { ProjectValidationData, ValidationResult } from '@/lib/validation/types';

// ============================================================
// Artifact Thresholds
// ============================================================

/**
 * Minimum thresholds for each artifact (from PRD-SPEC spec)
 * Each artifact requires a minimum validation score and specific gates to pass
 */
export const ARTIFACT_THRESHOLDS: Record<ArtifactPhase, {
  minimumScore: number;
  requiredGates: string[];
  description: string;
}> = {
  context_diagram: {
    minimumScore: 20,
    requiredGates: ['system_boundary_defined', 'external_entities_defined'],
    description: 'System boundary with actors and external entities',
  },
  use_case_diagram: {
    minimumScore: 35,
    requiredGates: ['primary_actors_defined', 'use_case_list_5_to_15_defined'],
    description: 'Actors linked to use cases',
  },
  scope_tree: {
    minimumScore: 45,
    requiredGates: ['system_boundary_defined'],
    description: 'In-scope and out-of-scope items defined',
  },
  ucbd: {
    minimumScore: 60,
    requiredGates: ['each_use_case_has_trigger_and_outcome'],
    description: 'Use case behavior with preconditions, steps, postconditions',
  },
  requirements_table: {
    minimumScore: 75,
    requiredGates: ['core_data_objects_defined'],
    description: 'Testable requirements derived from use cases',
  },
  constants_table: {
    minimumScore: 85,
    requiredGates: [],
    description: 'System constants with values and units',
  },
  sysml_activity_diagram: {
    minimumScore: 90,
    requiredGates: [],
    description: 'Activity flow with decision points',
  },
};

/**
 * Overall completion threshold (95% from PRD-SPEC spec)
 */
const COMPLETION_THRESHOLD = 95;

// ============================================================
// Main Node Function
// ============================================================

/**
 * Run PRD-SPEC validation for current phase
 *
 * This node:
 * 1. Transforms extracted data to validation format
 * 2. Runs PRD-SPEC validation
 * 3. Checks if minimum threshold for current artifact is met
 * 4. Sets isComplete if 95%+ reached
 * 5. Advances phase if current artifact is ready
 *
 * @param state - Current intake state
 * @returns Partial state with validationResult, isComplete, and potentially updated currentPhase
 *
 * @example
 * // When context_diagram threshold is met:
 * {
 *   validationResult: { score: 35, passed: 8, failed: 2, ... },
 *   isComplete: false,
 *   currentPhase: 'use_case_diagram' // Advanced to next phase
 * }
 */
export async function checkPRDSpec(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const { extractedData, projectId, projectName, projectVision, currentPhase } = state;

  // Transform to validation data format
  const validationData: ProjectValidationData = transformToValidationData(
    state
  );

  try {
    // Run validation
    const result = await validateProject(validationData);

    // Check if current artifact threshold is met
    const threshold = ARTIFACT_THRESHOLDS[currentPhase];
    const artifactReady = result.overallScore >= threshold.minimumScore;

    // Check if overall 95% threshold is met
    const isComplete = result.overallScore >= COMPLETION_THRESHOLD;

    // Transform validation result to our format
    const validationResult = transformValidationResult(result);

    // Determine next phase if current is ready
    let nextPhase = currentPhase;
    if (artifactReady && !isComplete) {
      const potentialNextPhase = getNextPhase(currentPhase);
      if (potentialNextPhase) {
        nextPhase = potentialNextPhase;
      }
    }

    return {
      validationResult,
      isComplete,
      currentPhase: nextPhase,
      completeness: result.overallScore,
    };
  } catch (error) {
    console.error('PRD-SPEC validation error:', error);

    return {
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Transform intake state to ProjectValidationData format
 *
 * @param state - Current intake state
 * @returns ProjectValidationData for the validator
 */
function transformToValidationData(state: IntakeState): ProjectValidationData {
  const { extractedData, projectId, projectName, projectVision, completeness } = state;

  return {
    id: projectId,
    name: projectName,
    vision: projectVision,
    status: 'intake',

    // Map actors
    actors: extractedData.actors.map(a => ({
      name: a.name,
      role: a.role,
      description: a.description,
      // Permissions not tracked in extraction result
    })),

    // Map use cases
    useCases: extractedData.useCases.map(uc => ({
      id: uc.id,
      name: uc.name,
      description: uc.description,
      actor: uc.actor,
      trigger: uc.trigger,
      outcome: uc.outcome,
      preconditions: uc.preconditions,
      postconditions: uc.postconditions,
    })),

    // Map system boundaries
    systemBoundaries: {
      internal: extractedData.systemBoundaries.internal,
      external: extractedData.systemBoundaries.external,
      inScope: extractedData.systemBoundaries.internal, // Map internal to inScope
      outOfScope: [], // TODO: Track out-of-scope separately
    },

    // Map data entities
    dataEntities: extractedData.dataEntities.map(e => ({
      name: e.name,
      attributes: e.attributes,
      relationships: e.relationships,
    })),

    completeness,
  };
}

/**
 * Transform ValidationResult to our IntakeValidationResult format
 *
 * @param result - Result from the validator
 * @returns IntakeValidationResult for the state
 */
function transformValidationResult(result: ValidationResult): IntakeValidationResult {
  // Build hard gates result map
  const hardGatesResult: Record<string, boolean> = {};
  for (const hg of result.hardGates) {
    hardGatesResult[hg.gate] = hg.passed;
  }

  return {
    score: result.overallScore,
    passed: result.passedChecks,
    failed: result.failedChecks,
    hardGatesResult,
    errors: result.errors,
    warnings: result.warnings,
  };
}

/**
 * Check if a specific artifact is ready for generation
 *
 * @param phase - The artifact phase to check
 * @param validationScore - Current validation score
 * @param hardGatesResult - Results of hard gate checks
 * @returns True if artifact can be generated
 */
export function isArtifactReady(
  phase: ArtifactPhase,
  validationScore: number,
  hardGatesResult: Record<string, boolean>
): boolean {
  const threshold = ARTIFACT_THRESHOLDS[phase];

  // Check minimum score
  if (validationScore < threshold.minimumScore) {
    return false;
  }

  // Check required gates (if any)
  for (const gate of threshold.requiredGates) {
    if (hardGatesResult[gate] === false) {
      return false;
    }
  }

  return true;
}

/**
 * Get missing requirements for an artifact phase
 *
 * @param phase - The artifact phase
 * @param state - Current intake state
 * @returns Array of missing requirement descriptions
 */
export function getMissingRequirements(
  phase: ArtifactPhase,
  state: IntakeState
): string[] {
  const missing: string[] = [];
  const threshold = ARTIFACT_THRESHOLDS[phase];
  const data = state.extractedData;

  // Check based on phase
  switch (phase) {
    case 'context_diagram':
      if (data.actors.length < 1) {
        missing.push('At least 1 actor required');
      }
      if (data.systemBoundaries.external.length === 0) {
        missing.push('External entities must be defined (or confirmed none)');
      }
      break;

    case 'use_case_diagram':
      if (data.actors.length < 2) {
        missing.push(`At least 2 actors required (have ${data.actors.length})`);
      }
      if (data.useCases.length < 3) {
        missing.push(`At least 3 use cases required (have ${data.useCases.length})`);
      }
      break;

    case 'scope_tree':
      if (data.systemBoundaries.internal.length === 0) {
        missing.push('In-scope items must be defined');
      }
      break;

    case 'ucbd':
      const hasComplete = data.useCases.some(
        uc => (uc.preconditions?.length ?? 0) > 0 && (uc.postconditions?.length ?? 0) > 0
      );
      if (!hasComplete) {
        missing.push('At least one use case needs preconditions and postconditions');
      }
      break;

    case 'requirements_table':
      if (data.useCases.length < 5) {
        missing.push(`At least 5 use cases required (have ${data.useCases.length})`);
      }
      break;

    case 'constants_table':
    case 'sysml_activity_diagram':
      // These have minimal requirements - can always attempt generation
      break;
  }

  // Check score threshold
  if (state.completeness < threshold.minimumScore) {
    missing.push(`Minimum score of ${threshold.minimumScore}% required (have ${state.completeness}%)`);
  }

  return missing;
}
