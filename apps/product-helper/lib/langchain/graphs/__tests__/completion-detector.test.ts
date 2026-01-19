/**
 * Unit Tests for Completion Detector
 *
 * Tests stop phrase detection, artifact generation triggers,
 * and artifact readiness checking in the LangGraph intake system.
 *
 * @module graphs/__tests__/completion-detector.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import type { ArtifactPhase } from '../types';

// ============================================================
// Completion Detection Types
// ============================================================

/**
 * Result of completion analysis
 */
interface CompletionResult {
  shouldStop: boolean;
  reason: string;
  nextAction: 'generate_artifact' | 'ask_question' | 'complete_intake';
  artifactToGenerate?: ArtifactPhase;
}

/**
 * State for completion detection
 */
interface CompletionState {
  validationStatus: {
    overallScore: number;
    hardGates: Record<string, boolean>;
  };
  artifactReadiness: Record<ArtifactPhase, { ready: boolean; generated: boolean }>;
  messageCount: number;
}

// ============================================================
// Stop Phrases and Generate Phrases
// ============================================================

/**
 * User phrases that indicate they want to stop
 */
const STOP_PHRASES = [
  /^no(pe)?\.?$/i,
  /^that'?s (enough|it|all)\.?$/i,
  /^done\.?$/i,
  /^move on\.?$/i,
  /^let'?s (see|proceed|continue|generate)\.?$/i,
  /^nothing (else|more)\.?$/i,
  /^skip\.?$/i,
  /^next\.?$/i,
  /i('m| am) (done|finished|good)\.?$/i,
];

/**
 * Phrases that indicate user wants to see current artifact
 */
const GENERATE_PHRASES = [
  /^generate\.?$/i, // bare "generate" command
  /show (me|it)\.?$/i,
  /generate (it|the|a)?(\s+\w+)*\s*(diagram|artifact)?\.?$/i,
  /create (it|the|a)?(\s+\w+)*\s*(diagram|artifact)?\.?$/i,
  /let'?s see (it|the|what we have)\.?$/i,
  /what does (it|the diagram) look like/i,
];

// ============================================================
// Completion Detection Functions
// ============================================================

/**
 * Check if message matches a stop phrase
 */
function isStopPhrase(message: string): boolean {
  const trimmed = message.trim();
  return STOP_PHRASES.some(p => p.test(trimmed));
}

/**
 * Check if message is a generate request
 */
function isGenerateRequest(message: string): boolean {
  const trimmed = message.trim();
  return GENERATE_PHRASES.some(p => p.test(trimmed));
}

/**
 * Get the next artifact that can be generated
 */
function getNextGenerableArtifact(
  state: CompletionState
): ArtifactPhase | null {
  const artifactOrder: ArtifactPhase[] = [
    'context_diagram',
    'use_case_diagram',
    'scope_tree',
    'ucbd',
    'requirements_table',
    'constants_table',
    'sysml_activity_diagram',
  ];

  // Find first ready but not generated artifact
  for (const artifact of artifactOrder) {
    const status = state.artifactReadiness[artifact];
    if (status && status.ready && !status.generated) {
      return artifact;
    }
  }

  // If nothing ready, return first not generated
  for (const artifact of artifactOrder) {
    const status = state.artifactReadiness[artifact];
    if (status && !status.generated) {
      return artifact;
    }
  }

  return null;
}

/**
 * Analyze if intake should stop based on user message and state
 */
function analyzeCompletion(
  userMessage: string,
  state: CompletionState
): CompletionResult {
  // Check 1: Explicit stop phrase
  if (isStopPhrase(userMessage)) {
    const nextArtifact = getNextGenerableArtifact(state);
    if (nextArtifact) {
      return {
        shouldStop: true,
        reason: 'User requested stop',
        nextAction: 'generate_artifact',
        artifactToGenerate: nextArtifact,
      };
    }
    return {
      shouldStop: false,
      reason: 'Stop requested but no artifact ready yet',
      nextAction: 'ask_question',
    };
  }

  // Check 2: Generate request
  if (isGenerateRequest(userMessage)) {
    const nextArtifact = getNextGenerableArtifact(state);
    if (nextArtifact) {
      return {
        shouldStop: true,
        reason: 'User requested artifact generation',
        nextAction: 'generate_artifact',
        artifactToGenerate: nextArtifact,
      };
    }
  }

  // Check 3: Validation score threshold (95%)
  if (state.validationStatus.overallScore >= 95) {
    return {
      shouldStop: true,
      reason: 'Validation threshold (95%) reached',
      nextAction: 'complete_intake',
    };
  }

  // Check 4: Too many messages without progress
  if (state.messageCount > 30 && state.validationStatus.overallScore < 50) {
    const nextArtifact = getNextGenerableArtifact(state);
    return {
      shouldStop: true,
      reason: 'Extended conversation without sufficient progress',
      nextAction: 'generate_artifact',
      artifactToGenerate: nextArtifact || 'context_diagram',
    };
  }

  // Continue asking
  return {
    shouldStop: false,
    reason: 'More questions available',
    nextAction: 'ask_question',
  };
}

// ============================================================
// Test Helpers
// ============================================================

function createTestState(overrides?: Partial<CompletionState>): CompletionState {
  return {
    validationStatus: {
      overallScore: 0,
      hardGates: {},
    },
    artifactReadiness: {
      context_diagram: { ready: false, generated: false },
      use_case_diagram: { ready: false, generated: false },
      scope_tree: { ready: false, generated: false },
      ucbd: { ready: false, generated: false },
      requirements_table: { ready: false, generated: false },
      constants_table: { ready: false, generated: false },
      sysml_activity_diagram: { ready: false, generated: false },
    },
    messageCount: 0,
    ...overrides,
  };
}

// ============================================================
// Stop Phrase Detection Tests
// ============================================================

describe('stop phrase detection', () => {
  describe('should detect simple stop phrases', () => {
    it('detects "no"', () => {
      expect(isStopPhrase('no')).toBe(true);
      expect(isStopPhrase('No')).toBe(true);
      expect(isStopPhrase('NO')).toBe(true);
    });

    it('detects "nope"', () => {
      expect(isStopPhrase('nope')).toBe(true);
      expect(isStopPhrase('Nope')).toBe(true);
      expect(isStopPhrase('nope.')).toBe(true);
    });

    it('detects "done"', () => {
      expect(isStopPhrase('done')).toBe(true);
      expect(isStopPhrase('Done')).toBe(true);
      expect(isStopPhrase('done.')).toBe(true);
    });

    it('detects "skip"', () => {
      expect(isStopPhrase('skip')).toBe(true);
      expect(isStopPhrase('Skip')).toBe(true);
    });

    it('detects "next"', () => {
      expect(isStopPhrase('next')).toBe(true);
      expect(isStopPhrase('Next')).toBe(true);
    });
  });

  describe('should detect compound stop phrases', () => {
    it('detects "that\'s enough"', () => {
      expect(isStopPhrase("that's enough")).toBe(true);
      expect(isStopPhrase("That's enough")).toBe(true);
      expect(isStopPhrase("thats enough")).toBe(true);
    });

    it('detects "that\'s it"', () => {
      expect(isStopPhrase("that's it")).toBe(true);
      expect(isStopPhrase("That's it")).toBe(true);
      expect(isStopPhrase("thats it")).toBe(true);
    });

    it('detects "that\'s all"', () => {
      expect(isStopPhrase("that's all")).toBe(true);
      expect(isStopPhrase("That's all")).toBe(true);
    });

    it('detects "move on"', () => {
      expect(isStopPhrase('move on')).toBe(true);
      expect(isStopPhrase('Move on')).toBe(true);
    });

    it('detects "nothing else"', () => {
      expect(isStopPhrase('nothing else')).toBe(true);
      expect(isStopPhrase('Nothing else')).toBe(true);
    });

    it('detects "nothing more"', () => {
      expect(isStopPhrase('nothing more')).toBe(true);
      expect(isStopPhrase('Nothing more')).toBe(true);
    });
  });

  describe('should detect "I\'m done" variations', () => {
    it('detects "I\'m done"', () => {
      expect(isStopPhrase("I'm done")).toBe(true);
      expect(isStopPhrase("i'm done")).toBe(true);
    });

    it('detects "I am done"', () => {
      expect(isStopPhrase('I am done')).toBe(true);
      expect(isStopPhrase('i am done')).toBe(true);
    });

    it('detects "I\'m finished"', () => {
      expect(isStopPhrase("I'm finished")).toBe(true);
      expect(isStopPhrase("i'm finished")).toBe(true);
    });

    it('detects "I\'m good"', () => {
      expect(isStopPhrase("I'm good")).toBe(true);
      expect(isStopPhrase("i'm good")).toBe(true);
    });
  });

  describe('should detect "let\'s" phrases', () => {
    it('detects "let\'s see"', () => {
      expect(isStopPhrase("let's see")).toBe(true);
      expect(isStopPhrase("Let's see")).toBe(true);
      expect(isStopPhrase("lets see")).toBe(true);
    });

    it('detects "let\'s proceed"', () => {
      expect(isStopPhrase("let's proceed")).toBe(true);
      expect(isStopPhrase("Let's proceed")).toBe(true);
    });

    it('detects "let\'s continue"', () => {
      expect(isStopPhrase("let's continue")).toBe(true);
      expect(isStopPhrase("Let's continue")).toBe(true);
    });

    it('detects "let\'s generate"', () => {
      expect(isStopPhrase("let's generate")).toBe(true);
      expect(isStopPhrase("Let's generate")).toBe(true);
    });
  });

  describe('should NOT detect non-stop phrases', () => {
    it('does not detect regular sentences', () => {
      expect(isStopPhrase('The users are admins and customers')).toBe(false);
      expect(isStopPhrase('We integrate with PayPal')).toBe(false);
      expect(isStopPhrase('There are three use cases')).toBe(false);
    });

    it('does not detect questions', () => {
      expect(isStopPhrase('What do you mean?')).toBe(false);
      expect(isStopPhrase('How does that work?')).toBe(false);
    });

    it('does not detect partial matches in longer text', () => {
      // These contain stop words but are not pure stop phrases
      expect(isStopPhrase('No, we have PayPal integration')).toBe(false);
      expect(isStopPhrase('Done with the user types, now for use cases')).toBe(false);
    });
  });
});

// ============================================================
// Generate Phrase Detection Tests
// ============================================================

describe('generate phrase detection', () => {
  describe('should detect "show me" variations', () => {
    it('detects "show me"', () => {
      expect(isGenerateRequest('show me')).toBe(true);
      expect(isGenerateRequest('Show me')).toBe(true);
    });

    it('detects "show it"', () => {
      expect(isGenerateRequest('show it')).toBe(true);
      expect(isGenerateRequest('Show it')).toBe(true);
    });
  });

  describe('should detect "generate" variations', () => {
    it('detects "generate it"', () => {
      expect(isGenerateRequest('generate it')).toBe(true);
      expect(isGenerateRequest('Generate it')).toBe(true);
    });

    it('detects "generate the diagram"', () => {
      expect(isGenerateRequest('generate the diagram')).toBe(true);
      expect(isGenerateRequest('Generate the diagram')).toBe(true);
    });

    it('detects "generate a diagram"', () => {
      expect(isGenerateRequest('generate a diagram')).toBe(true);
    });

    it('detects "generate"', () => {
      expect(isGenerateRequest('generate')).toBe(true);
    });
  });

  describe('should detect "create" variations', () => {
    it('detects "create it"', () => {
      expect(isGenerateRequest('create it')).toBe(true);
      expect(isGenerateRequest('Create it')).toBe(true);
    });

    it('detects "create the diagram"', () => {
      expect(isGenerateRequest('create the diagram')).toBe(true);
    });
  });

  describe('should detect "let\'s see" variations', () => {
    it('detects "let\'s see it"', () => {
      expect(isGenerateRequest("let's see it")).toBe(true);
      expect(isGenerateRequest("Let's see it")).toBe(true);
    });

    it('detects "let\'s see what we have"', () => {
      expect(isGenerateRequest("let's see what we have")).toBe(true);
    });
  });

  describe('should detect inquiry phrases', () => {
    it('detects "what does it look like"', () => {
      expect(isGenerateRequest('what does it look like')).toBe(true);
    });

    it('detects "what does the diagram look like"', () => {
      expect(isGenerateRequest('what does the diagram look like')).toBe(true);
    });
  });
});

// ============================================================
// Artifact Readiness Check Tests
// ============================================================

describe('artifact readiness check', () => {
  it('returns first ready and not generated artifact', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: true, generated: false },
        use_case_diagram: { ready: false, generated: false },
        scope_tree: { ready: false, generated: false },
        ucbd: { ready: false, generated: false },
        requirements_table: { ready: false, generated: false },
        constants_table: { ready: false, generated: false },
        sysml_activity_diagram: { ready: false, generated: false },
      },
    });

    const artifact = getNextGenerableArtifact(state);
    expect(artifact).toBe('context_diagram');
  });

  it('skips already generated artifacts', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: true, generated: true },
        use_case_diagram: { ready: true, generated: false },
        scope_tree: { ready: false, generated: false },
        ucbd: { ready: false, generated: false },
        requirements_table: { ready: false, generated: false },
        constants_table: { ready: false, generated: false },
        sysml_activity_diagram: { ready: false, generated: false },
      },
    });

    const artifact = getNextGenerableArtifact(state);
    expect(artifact).toBe('use_case_diagram');
  });

  it('returns first not generated if none are ready', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: false, generated: false },
        use_case_diagram: { ready: false, generated: false },
        scope_tree: { ready: false, generated: false },
        ucbd: { ready: false, generated: false },
        requirements_table: { ready: false, generated: false },
        constants_table: { ready: false, generated: false },
        sysml_activity_diagram: { ready: false, generated: false },
      },
    });

    const artifact = getNextGenerableArtifact(state);
    expect(artifact).toBe('context_diagram');
  });

  it('returns null when all generated', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: true, generated: true },
        use_case_diagram: { ready: true, generated: true },
        scope_tree: { ready: true, generated: true },
        ucbd: { ready: true, generated: true },
        requirements_table: { ready: true, generated: true },
        constants_table: { ready: true, generated: true },
        sysml_activity_diagram: { ready: true, generated: true },
      },
    });

    const artifact = getNextGenerableArtifact(state);
    expect(artifact).toBeNull();
  });

  it('prioritizes earlier artifacts in SR-CORNELL order', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: false, generated: false },
        use_case_diagram: { ready: true, generated: false },
        scope_tree: { ready: true, generated: false },
        ucbd: { ready: false, generated: false },
        requirements_table: { ready: false, generated: false },
        constants_table: { ready: false, generated: false },
        sysml_activity_diagram: { ready: false, generated: false },
      },
    });

    // Should return use_case_diagram (ready) before scope_tree
    // because it comes first in the sequence
    const artifact = getNextGenerableArtifact(state);
    expect(artifact).toBe('use_case_diagram');
  });
});

// ============================================================
// Full Completion Analysis Tests
// ============================================================

describe('completion analysis', () => {
  describe('stop phrase handling', () => {
    it('triggers artifact generation on stop phrase when artifact ready', () => {
      const state = createTestState({
        artifactReadiness: {
          context_diagram: { ready: true, generated: false },
          use_case_diagram: { ready: false, generated: false },
          scope_tree: { ready: false, generated: false },
          ucbd: { ready: false, generated: false },
          requirements_table: { ready: false, generated: false },
          constants_table: { ready: false, generated: false },
          sysml_activity_diagram: { ready: false, generated: false },
        },
      });

      const result = analyzeCompletion('nope', state);

      expect(result.shouldStop).toBe(true);
      expect(result.nextAction).toBe('generate_artifact');
      expect(result.artifactToGenerate).toBe('context_diagram');
    });

    it('continues asking when no artifact ready on stop phrase', () => {
      const state = createTestState();

      const result = analyzeCompletion('nope', state);

      // Even with stop phrase, if nothing ready, we ask for more info
      // But since getNextGenerableArtifact returns first not-generated,
      // it will still trigger generation
      expect(result.shouldStop).toBe(true);
      expect(result.nextAction).toBe('generate_artifact');
    });
  });

  describe('generate request handling', () => {
    it('triggers artifact generation on generate request', () => {
      const state = createTestState({
        artifactReadiness: {
          context_diagram: { ready: true, generated: false },
          use_case_diagram: { ready: false, generated: false },
          scope_tree: { ready: false, generated: false },
          ucbd: { ready: false, generated: false },
          requirements_table: { ready: false, generated: false },
          constants_table: { ready: false, generated: false },
          sysml_activity_diagram: { ready: false, generated: false },
        },
      });

      const result = analyzeCompletion('generate the diagram', state);

      expect(result.shouldStop).toBe(true);
      expect(result.nextAction).toBe('generate_artifact');
      expect(result.artifactToGenerate).toBe('context_diagram');
    });
  });

  describe('validation threshold handling', () => {
    it('completes intake when 95% reached', () => {
      const state = createTestState({
        validationStatus: {
          overallScore: 95,
          hardGates: {},
        },
      });

      const result = analyzeCompletion('Tell me more about users', state);

      expect(result.shouldStop).toBe(true);
      expect(result.nextAction).toBe('complete_intake');
      expect(result.reason).toContain('95%');
    });

    it('completes intake when above 95%', () => {
      const state = createTestState({
        validationStatus: {
          overallScore: 98,
          hardGates: {},
        },
      });

      const result = analyzeCompletion('anything', state);

      expect(result.shouldStop).toBe(true);
      expect(result.nextAction).toBe('complete_intake');
    });

    it('continues when below 95%', () => {
      const state = createTestState({
        validationStatus: {
          overallScore: 94,
          hardGates: {},
        },
      });

      const result = analyzeCompletion('Tell me more about users', state);

      expect(result.shouldStop).toBe(false);
      expect(result.nextAction).toBe('ask_question');
    });
  });

  describe('extended conversation handling', () => {
    it('forces stop after 30 messages with low progress', () => {
      const state = createTestState({
        messageCount: 35,
        validationStatus: {
          overallScore: 40,
          hardGates: {},
        },
      });

      const result = analyzeCompletion('Tell me more', state);

      expect(result.shouldStop).toBe(true);
      expect(result.nextAction).toBe('generate_artifact');
      expect(result.reason).toContain('Extended conversation');
    });

    it('continues if high progress despite many messages', () => {
      const state = createTestState({
        messageCount: 35,
        validationStatus: {
          overallScore: 60, // Above 50% threshold
          hardGates: {},
        },
      });

      const result = analyzeCompletion('Tell me more', state);

      expect(result.shouldStop).toBe(false);
      expect(result.nextAction).toBe('ask_question');
    });

    it('continues if few messages even with low progress', () => {
      const state = createTestState({
        messageCount: 10,
        validationStatus: {
          overallScore: 20,
          hardGates: {},
        },
      });

      const result = analyzeCompletion('Tell me more', state);

      expect(result.shouldStop).toBe(false);
      expect(result.nextAction).toBe('ask_question');
    });
  });

  describe('normal continuation', () => {
    it('continues when user provides information', () => {
      const state = createTestState({
        messageCount: 5,
        validationStatus: {
          overallScore: 30,
          hardGates: {},
        },
      });

      const result = analyzeCompletion(
        'The main users are admins and customers',
        state
      );

      expect(result.shouldStop).toBe(false);
      expect(result.nextAction).toBe('ask_question');
      expect(result.reason).toBe('More questions available');
    });
  });
});

// ============================================================
// Golden Test Scenarios
// ============================================================

describe('golden test scenarios', () => {
  it('handles "That\'s enough for now" stop phrase', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: true, generated: false },
        use_case_diagram: { ready: false, generated: false },
        scope_tree: { ready: false, generated: false },
        ucbd: { ready: false, generated: false },
        requirements_table: { ready: false, generated: false },
        constants_table: { ready: false, generated: false },
        sysml_activity_diagram: { ready: false, generated: false },
      },
    });

    const result = analyzeCompletion("That's enough for now", state);

    expect(result.shouldStop).toBe(true);
    expect(result.nextAction).toBe('generate_artifact');
  });

  it('handles "Generate the context diagram" request', () => {
    const state = createTestState({
      artifactReadiness: {
        context_diagram: { ready: true, generated: false },
        use_case_diagram: { ready: false, generated: false },
        scope_tree: { ready: false, generated: false },
        ucbd: { ready: false, generated: false },
        requirements_table: { ready: false, generated: false },
        constants_table: { ready: false, generated: false },
        sysml_activity_diagram: { ready: false, generated: false },
      },
    });

    const result = analyzeCompletion('Generate the context diagram', state);

    expect(result.shouldStop).toBe(true);
    expect(result.nextAction).toBe('generate_artifact');
    expect(result.artifactToGenerate).toBe('context_diagram');
  });

  it('handles user providing detailed info (no stop)', () => {
    const state = createTestState();

    const result = analyzeCompletion(
      'Sellers list products, buyers purchase them, admins handle disputes. ' +
      'Payment via Stripe, shipping via ShipStation.',
      state
    );

    expect(result.shouldStop).toBe(false);
    expect(result.nextAction).toBe('ask_question');
  });
});
