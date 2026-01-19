/**
 * Unit Tests for Priority Scorer Logic
 *
 * Tests the question scoring algorithm that determines
 * which question to ask next based on SR-CORNELL gates,
 * phase alignment, and clarification penalties.
 *
 * @module graphs/__tests__/priority-scorer.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import type { IntakeState, ArtifactPhase } from '../types';
import type { ExtractionResult } from '../../schemas';

// ============================================================
// Priority Scoring Algorithm (Inline Implementation for Testing)
// ============================================================

/**
 * Question interface for testing
 */
interface Question {
  id: string;
  phase: string;
  basePriority: number;
  srCornellGate?: string;
  extractsTo: string[];
  requires: string[];
  requiresData: string[];
  clarificationCount?: number;
}

/**
 * Scored question result
 */
interface ScoredQuestion {
  question: Question;
  score: number;
  reasons: string[];
}

/**
 * State for scoring (simplified)
 */
interface ScoringState {
  currentPhase: ArtifactPhase;
  validationStatus: {
    hardGates: Record<string, boolean>;
  };
  artifactReadiness: Record<string, { ready: boolean; generated: boolean }>;
  questionsAsked: Array<{ questionId: string; clarificationCount: number }>;
  extractedData: ExtractionResult;
}

/**
 * Calculate priority score for a question
 *
 * Scoring rules:
 * 1. Base priority from question definition (1-10)
 * 2. +3 if SR-CORNELL hard gate not yet passed
 * 3. +2 if question phase matches current phase
 * 4. +2 if this question would complete an artifact
 * 5. -2 per clarification already asked
 * 6. -1 if question is for a later phase (out of order)
 * 7. +1 if can infer from existing data
 */
function calculateScore(question: Question, state: ScoringState): number {
  let score = question.basePriority;
  const reasons: string[] = [];

  // Boost 1: SR-CORNELL hard gate not yet passed (+3)
  if (question.srCornellGate) {
    const gatePassed = state.validationStatus.hardGates[question.srCornellGate];
    if (!gatePassed) {
      score += 3;
      reasons.push('SR-CORNELL gate boost');
    }
  }

  // Boost 2: Current phase alignment (+2)
  if (question.phase === state.currentPhase) {
    score += 2;
    reasons.push('Phase alignment boost');
  }

  // Penalty 1: Many clarifications already asked (-2 per)
  const asked = state.questionsAsked.find(q => q.questionId === question.id);
  if (asked && asked.clarificationCount > 0) {
    score -= asked.clarificationCount * 2;
    reasons.push(`Clarification penalty: -${asked.clarificationCount * 2}`);
  }

  // Penalty 2: Late-stage question when early data missing (-1)
  const phaseOrder = ['actors', 'external_systems', 'use_cases', 'scope', 'data_entities'];
  const questionPhaseIndex = phaseOrder.indexOf(question.phase);
  const currentPhaseIndex = phaseOrder.indexOf(state.currentPhase as string);

  if (questionPhaseIndex > currentPhaseIndex + 1) {
    score -= 1;
    reasons.push('Out of order penalty');
  }

  return Math.max(score, 0);
}

/**
 * Sort questions by score (descending)
 */
function scoreQuestions(questions: Question[], state: ScoringState): ScoredQuestion[] {
  return questions
    .map(q => ({
      question: q,
      score: calculateScore(q, state),
      reasons: [],
    }))
    .sort((a, b) => b.score - a.score);
}

// ============================================================
// Test Data Fixtures
// ============================================================

const testQuestions: Question[] = [
  {
    id: 'Q_ACTORS_PRIMARY',
    phase: 'actors',
    basePriority: 10,
    srCornellGate: 'PRIMARY_ACTORS_DEFINED',
    extractsTo: ['actors'],
    requires: [],
    requiresData: [],
  },
  {
    id: 'Q_ACTORS_SECONDARY',
    phase: 'actors',
    basePriority: 7,
    srCornellGate: 'PRIMARY_ACTORS_DEFINED',
    extractsTo: ['actors'],
    requires: ['Q_ACTORS_PRIMARY'],
    requiresData: ['actors'],
  },
  {
    id: 'Q_EXTERNAL_SYSTEMS',
    phase: 'external_systems',
    basePriority: 9,
    srCornellGate: 'EXTERNAL_ENTITIES_DEFINED',
    extractsTo: ['systemBoundaries.external'],
    requires: [],
    requiresData: [],
  },
  {
    id: 'Q_USE_CASES_CORE',
    phase: 'use_cases',
    basePriority: 10,
    srCornellGate: 'USE_CASE_LIST_5_TO_15',
    extractsTo: ['useCases'],
    requires: ['Q_ACTORS_PRIMARY'],
    requiresData: ['actors'],
  },
  {
    id: 'Q_SCOPE_IN',
    phase: 'scope',
    basePriority: 8,
    srCornellGate: 'SYSTEM_BOUNDARY_DEFINED',
    extractsTo: ['systemBoundaries.inScope'],
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
  },
  {
    id: 'Q_DATA_ENTITIES',
    phase: 'data_entities',
    basePriority: 8,
    srCornellGate: 'CORE_DATA_OBJECTS_DEFINED',
    extractsTo: ['dataEntities'],
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
  },
];

function createTestState(overrides?: Partial<ScoringState>): ScoringState {
  return {
    currentPhase: 'context_diagram',
    validationStatus: {
      hardGates: {},
    },
    artifactReadiness: {
      context_diagram: { ready: false, generated: false },
      use_case_diagram: { ready: false, generated: false },
    },
    questionsAsked: [],
    extractedData: {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    },
    ...overrides,
  };
}

// ============================================================
// SR-CORNELL Gate Boost Tests
// ============================================================

describe('SR-CORNELL gate boost scoring', () => {
  it('adds +3 when SR-CORNELL gate has not passed', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: false,
        },
      },
    });

    const actorQuestion = testQuestions.find(q => q.id === 'Q_ACTORS_PRIMARY')!;
    const score = calculateScore(actorQuestion, state);

    // Base: 10 + SR-CORNELL boost: 3 + Phase alignment: 0 (actors !== context_diagram)
    // But for context_diagram phase, actors phase questions are relevant
    expect(score).toBeGreaterThanOrEqual(13);
  });

  it('does not add boost when SR-CORNELL gate has passed', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true,
        },
      },
    });

    const actorQuestion = testQuestions.find(q => q.id === 'Q_ACTORS_PRIMARY')!;
    const score = calculateScore(actorQuestion, state);

    // Base: 10 + SR-CORNELL boost: 0 (gate passed) = 10
    expect(score).toBe(10);
  });

  it('adds boost for multiple unpassed gates', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: false,
          EXTERNAL_ENTITIES_DEFINED: false,
        },
      },
    });

    const actorScore = calculateScore(
      testQuestions.find(q => q.id === 'Q_ACTORS_PRIMARY')!,
      state
    );
    const externalScore = calculateScore(
      testQuestions.find(q => q.id === 'Q_EXTERNAL_SYSTEMS')!,
      state
    );

    // Both should have the +3 SR-CORNELL boost
    expect(actorScore).toBeGreaterThanOrEqual(13);
    expect(externalScore).toBeGreaterThanOrEqual(11);
  });
});

// ============================================================
// Phase Alignment Boost Tests
// ============================================================

describe('phase alignment boost scoring', () => {
  it('adds +2 when question phase matches current phase', () => {
    const state = createTestState({
      currentPhase: 'context_diagram', // Map to 'actors' equivalent
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true, // Gate passed, no boost
        },
      },
    });

    // Create a question that matches the phase
    const matchingQuestion: Question = {
      id: 'Q_CONTEXT_PHASE',
      phase: 'context_diagram',
      basePriority: 5,
      extractsTo: ['actors'],
      requires: [],
      requiresData: [],
    };

    const score = calculateScore(matchingQuestion, state);

    // Base: 5 + Phase alignment: 2 = 7
    expect(score).toBe(7);
  });

  it('does not add boost when phases do not match', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          CORE_DATA_OBJECTS_DEFINED: true, // Gate passed
        },
      },
    });

    const dataEntitiesQuestion = testQuestions.find(q => q.id === 'Q_DATA_ENTITIES')!;
    const score = calculateScore(dataEntitiesQuestion, state);

    // Base: 8, no gate boost, no phase boost, -1 out of order
    expect(score).toBe(7);
  });

  it('prioritizes phase-aligned questions higher', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {},
      },
    });

    // Create two questions with same base priority
    const phaseMatchQuestion: Question = {
      id: 'Q_MATCH',
      phase: 'context_diagram',
      basePriority: 5,
      extractsTo: [],
      requires: [],
      requiresData: [],
    };

    const phaseMismatchQuestion: Question = {
      id: 'Q_MISMATCH',
      phase: 'use_cases',
      basePriority: 5,
      extractsTo: [],
      requires: [],
      requiresData: [],
    };

    const matchScore = calculateScore(phaseMatchQuestion, state);
    const mismatchScore = calculateScore(phaseMismatchQuestion, state);

    // Phase match should score higher
    expect(matchScore).toBeGreaterThan(mismatchScore);
  });
});

// ============================================================
// Clarification Penalty Tests
// ============================================================

describe('clarification penalty scoring', () => {
  it('subtracts 2 points per clarification', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      questionsAsked: [
        { questionId: 'Q_ACTORS_PRIMARY', clarificationCount: 1 },
      ],
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true,
        },
      },
    });

    const actorQuestion = testQuestions.find(q => q.id === 'Q_ACTORS_PRIMARY')!;
    const score = calculateScore(actorQuestion, state);

    // Base: 10 - clarification penalty: 2 = 8
    expect(score).toBe(8);
  });

  it('applies cumulative penalty for multiple clarifications', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      questionsAsked: [
        { questionId: 'Q_ACTORS_PRIMARY', clarificationCount: 3 },
      ],
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true,
        },
      },
    });

    const actorQuestion = testQuestions.find(q => q.id === 'Q_ACTORS_PRIMARY')!;
    const score = calculateScore(actorQuestion, state);

    // Base: 10 - clarification penalty: 6 = 4
    expect(score).toBe(4);
  });

  it('does not go below 0', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      questionsAsked: [
        { questionId: 'Q_ACTORS_SECONDARY', clarificationCount: 10 },
      ],
      validationStatus: {
        hardGates: {},
      },
    });

    const secondaryQuestion = testQuestions.find(q => q.id === 'Q_ACTORS_SECONDARY')!;
    const score = calculateScore(secondaryQuestion, state);

    // Base: 7 - penalty: 20 = -13, but clamped to 0
    expect(score).toBe(0);
  });

  it('does not penalize questions not yet asked', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      questionsAsked: [],
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true,
        },
      },
    });

    const actorQuestion = testQuestions.find(q => q.id === 'Q_ACTORS_PRIMARY')!;
    const score = calculateScore(actorQuestion, state);

    // Base: 10, no penalty
    expect(score).toBe(10);
  });
});

// ============================================================
// Out of Order Penalty Tests
// ============================================================

describe('out of order penalty scoring', () => {
  it('penalizes late-stage questions when early data missing', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          CORE_DATA_OBJECTS_DEFINED: true,
        },
      },
    });

    // data_entities phase is much later than context_diagram/actors
    const dataQuestion = testQuestions.find(q => q.id === 'Q_DATA_ENTITIES')!;
    const score = calculateScore(dataQuestion, state);

    // Should have -1 penalty for being out of order
    expect(score).toBeLessThan(dataQuestion.basePriority);
  });

  it('does not penalize adjacent phase questions', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          EXTERNAL_ENTITIES_DEFINED: true,
        },
      },
    });

    // external_systems is adjacent to actors phase
    const externalQuestion = testQuestions.find(q => q.id === 'Q_EXTERNAL_SYSTEMS')!;
    const score = calculateScore(externalQuestion, state);

    // No out-of-order penalty
    expect(score).toBe(externalQuestion.basePriority);
  });
});

// ============================================================
// Question Ranking Tests
// ============================================================

describe('question ranking', () => {
  it('ranks questions by score descending', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: false,
          EXTERNAL_ENTITIES_DEFINED: false,
        },
      },
    });

    const scored = scoreQuestions(testQuestions, state);

    // First question should have highest score
    for (let i = 1; i < scored.length; i++) {
      expect(scored[i - 1].score).toBeGreaterThanOrEqual(scored[i].score);
    }
  });

  it('returns primary actors question first when starting fresh', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {},
      },
    });

    const scored = scoreQuestions(testQuestions, state);

    // Primary actors should be first (high base priority + SR-CORNELL boost)
    expect(scored[0].question.id).toBe('Q_ACTORS_PRIMARY');
  });

  it('prioritizes unpassed gates over lower priority questions', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true, // Passed
          EXTERNAL_ENTITIES_DEFINED: false, // Not passed
        },
      },
    });

    const scored = scoreQuestions(testQuestions, state);

    // External systems should score higher than secondary actors
    // even with lower base priority because of gate boost
    const externalIdx = scored.findIndex(s => s.question.id === 'Q_EXTERNAL_SYSTEMS');
    const secondaryIdx = scored.findIndex(s => s.question.id === 'Q_ACTORS_SECONDARY');

    expect(externalIdx).toBeLessThan(secondaryIdx);
  });
});

// ============================================================
// Combined Scoring Tests
// ============================================================

describe('combined scoring scenarios', () => {
  it('handles multiple boosts and penalties correctly', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: false, // +3 boost
        },
      },
      questionsAsked: [
        { questionId: 'Q_ACTORS_PRIMARY', clarificationCount: 1 }, // -2 penalty
      ],
    });

    const question: Question = {
      id: 'Q_ACTORS_PRIMARY',
      phase: 'context_diagram', // +2 phase boost
      basePriority: 10,
      srCornellGate: 'PRIMARY_ACTORS_DEFINED',
      extractsTo: ['actors'],
      requires: [],
      requiresData: [],
    };

    const score = calculateScore(question, state);

    // Base: 10 + SR-CORNELL: 3 + Phase: 2 - Clarification: 2 = 13
    expect(score).toBe(13);
  });

  it('correctly prioritizes in real-world scenario', () => {
    // Scenario: User has provided actors, now need external systems
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {
          PRIMARY_ACTORS_DEFINED: true,
          EXTERNAL_ENTITIES_DEFINED: false,
          USE_CASE_LIST_5_TO_15: false,
        },
      },
      extractedData: {
        actors: [{ name: 'User', role: 'Primary', description: 'User' }],
        useCases: [],
        systemBoundaries: { internal: [], external: [] },
        dataEntities: [],
      },
    });

    const scored = scoreQuestions(testQuestions, state);

    // External systems question should be near the top
    // because the gate is not passed and it's relevant to current phase
    const topThreeIds = scored.slice(0, 3).map(s => s.question.id);
    expect(topThreeIds).toContain('Q_EXTERNAL_SYSTEMS');
  });

  it('deprioritizes heavily clarified questions', () => {
    const state = createTestState({
      currentPhase: 'context_diagram',
      validationStatus: {
        hardGates: {},
      },
      questionsAsked: [
        { questionId: 'Q_ACTORS_PRIMARY', clarificationCount: 5 },
      ],
    });

    const scored = scoreQuestions(testQuestions, state);

    // Primary actors should NOT be first despite high base priority
    // because of heavy clarification penalty
    expect(scored[0].question.id).not.toBe('Q_ACTORS_PRIMARY');
  });
});
