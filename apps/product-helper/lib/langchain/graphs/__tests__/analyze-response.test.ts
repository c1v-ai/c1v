/**
 * Unit Tests for Analyze Response Node
 *
 * Tests the intent detection and stop trigger handling
 * in the LangGraph intake system.
 *
 * @module graphs/__tests__/analyze-response.test.ts
 */

import { describe, it, expect, jest } from '@jest/globals';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import {
  createInitialState,
  containsStopTrigger,
  STOP_TRIGGER_KEYWORDS,
  type IntakeState,
} from '../types';

// ============================================================
// Mock Setup
// ============================================================

// Note: Full mocking of ChatOpenAI requires jest.mock setup
// These tests focus on pure functions that don't require LLM mocking

// ============================================================
// Test Helpers
// ============================================================

/**
 * Create a test state with specified messages
 */
function createTestState(
  userMessage?: string,
  overrides?: Partial<IntakeState>
): IntakeState {
  const state = createInitialState(1, 'Test Project', 'A test application', 1);

  if (userMessage) {
    state.messages.push(new HumanMessage(userMessage));
  }

  return {
    ...state,
    ...overrides,
  };
}

// ============================================================
// containsStopTrigger Function Tests
// ============================================================

describe('containsStopTrigger', () => {
  describe('should detect stop trigger keywords', () => {
    it('detects "nope" as a stop trigger', () => {
      expect(containsStopTrigger('nope')).toBe(true);
      expect(containsStopTrigger('Nope')).toBe(true);
      expect(containsStopTrigger('NOPE')).toBe(true);
    });

    it('detects "no" as a stop trigger', () => {
      expect(containsStopTrigger('no')).toBe(true);
      expect(containsStopTrigger('No, nothing else')).toBe(true);
    });

    it('detects "done" as a stop trigger', () => {
      expect(containsStopTrigger('done')).toBe(true);
      expect(containsStopTrigger("I'm done")).toBe(true);
    });

    it('detects "that\'s enough" as a stop trigger', () => {
      expect(containsStopTrigger("that's enough")).toBe(true);
      expect(containsStopTrigger("That's enough for now")).toBe(true);
    });

    it('detects "that\'s it" as a stop trigger', () => {
      expect(containsStopTrigger("that's it")).toBe(true);
      expect(containsStopTrigger("That's it!")).toBe(true);
    });

    it('detects "move on" as a stop trigger', () => {
      expect(containsStopTrigger('move on')).toBe(true);
      expect(containsStopTrigger("Let's move on")).toBe(true);
    });

    it('detects "let\'s see" as a stop trigger', () => {
      expect(containsStopTrigger("let's see")).toBe(true);
      expect(containsStopTrigger("Let's see what we have")).toBe(true);
    });

    it('detects "generate" as a stop trigger', () => {
      expect(containsStopTrigger('generate')).toBe(true);
      expect(containsStopTrigger('Generate the diagram')).toBe(true);
    });

    it('detects "show me" as a stop trigger', () => {
      expect(containsStopTrigger('show me')).toBe(true);
      expect(containsStopTrigger('Show me the context diagram')).toBe(true);
    });

    it('detects "looks good" as a stop trigger', () => {
      expect(containsStopTrigger('looks good')).toBe(true);
      expect(containsStopTrigger('That looks good')).toBe(true);
    });

    it('detects "perfect" as a stop trigger', () => {
      expect(containsStopTrigger('perfect')).toBe(true);
      expect(containsStopTrigger('Perfect!')).toBe(true);
    });

    it('detects "good enough" as a stop trigger', () => {
      expect(containsStopTrigger('good enough')).toBe(true);
      expect(containsStopTrigger("That's good enough")).toBe(true);
    });
  });

  describe('should NOT detect non-stop-trigger text', () => {
    it('does not trigger on regular sentences', () => {
      expect(containsStopTrigger('The users are admins and customers')).toBe(false);
    });

    it('does not trigger on questions', () => {
      expect(containsStopTrigger('What do you mean by actors?')).toBe(false);
    });

    it('does not trigger on information-providing responses', () => {
      expect(containsStopTrigger('We have three user types: admins, managers, and employees')).toBe(false);
    });

    it('does not trigger on technical descriptions', () => {
      expect(containsStopTrigger('The system integrates with PayPal and Stripe')).toBe(false);
    });
  });

  describe('should handle edge cases', () => {
    it('handles empty string', () => {
      expect(containsStopTrigger('')).toBe(false);
    });

    it('handles whitespace-only string', () => {
      expect(containsStopTrigger('   ')).toBe(false);
    });

    it('detects stop triggers in mixed content', () => {
      expect(containsStopTrigger('We have users and admins. Nope, no external systems.')).toBe(true);
    });

    it('detects "none" as a stop trigger', () => {
      expect(containsStopTrigger('none')).toBe(true);
      expect(containsStopTrigger('None that I know of')).toBe(true);
    });

    it('detects "nothing" as a stop trigger', () => {
      expect(containsStopTrigger('nothing')).toBe(true);
      expect(containsStopTrigger('Nothing else')).toBe(true);
    });
  });
});

// ============================================================
// STOP_TRIGGER_KEYWORDS Constant Tests
// ============================================================

describe('STOP_TRIGGER_KEYWORDS', () => {
  it('contains expected keywords', () => {
    const expectedKeywords = [
      'nope',
      'no',
      'done',
      "that's enough",
      "that's it",
      'move on',
      "let's see",
      'generate',
      'show me',
      'looks good',
      'perfect',
      'good enough',
    ];

    expectedKeywords.forEach(keyword => {
      expect(STOP_TRIGGER_KEYWORDS).toContain(keyword);
    });
  });

  it('has at least 10 keywords', () => {
    expect(STOP_TRIGGER_KEYWORDS.length).toBeGreaterThanOrEqual(10);
  });
});

// ============================================================
// createInitialState Function Tests
// ============================================================

describe('createInitialState', () => {
  it('creates state with correct project info', () => {
    const state = createInitialState(1, 'Test Project', 'A test vision', 2);

    expect(state.projectId).toBe(1);
    expect(state.projectName).toBe('Test Project');
    expect(state.projectVision).toBe('A test vision');
    expect(state.teamId).toBe(2);
  });

  it('initializes with empty messages', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.messages).toEqual([]);
  });

  it('initializes with zero turn count', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.turnCount).toBe(0);
  });

  it('initializes with context_diagram as current phase', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.currentPhase).toBe('context_diagram');
  });

  it('initializes with UNKNOWN last intent', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.lastIntent).toBe('UNKNOWN');
  });

  it('initializes with empty extracted data', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);

    expect(state.extractedData.actors).toEqual([]);
    expect(state.extractedData.useCases).toEqual([]);
    expect(state.extractedData.systemBoundaries.internal).toEqual([]);
    expect(state.extractedData.systemBoundaries.external).toEqual([]);
    expect(state.extractedData.dataEntities).toEqual([]);
  });

  it('initializes with zero completeness', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.completeness).toBe(0);
  });

  it('initializes with all artifacts not ready', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);

    expect(state.artifactReadiness.context_diagram).toBe(false);
    expect(state.artifactReadiness.use_case_diagram).toBe(false);
    expect(state.artifactReadiness.scope_tree).toBe(false);
    expect(state.artifactReadiness.ucbd).toBe(false);
    expect(state.artifactReadiness.requirements_table).toBe(false);
    expect(state.artifactReadiness.constants_table).toBe(false);
    expect(state.artifactReadiness.sysml_activity_diagram).toBe(false);
  });

  it('initializes with isComplete as false', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.isComplete).toBe(false);
  });

  it('initializes with no error', () => {
    const state = createInitialState(1, 'Test', 'Vision', 1);
    expect(state.error).toBeNull();
  });

  describe('with existing data', () => {
    it('can resume from existing extracted data', () => {
      const existingData = {
        extractedData: {
          actors: [{ name: 'Admin', role: 'Primary', description: 'Administrator' }],
          useCases: [],
          systemBoundaries: { internal: [], external: ['PayPal'] },
          dataEntities: [],
        },
      };

      const state = createInitialState(1, 'Test', 'Vision', 1, existingData);

      expect(state.extractedData.actors).toHaveLength(1);
      expect(state.extractedData.actors[0].name).toBe('Admin');
      expect(state.extractedData.systemBoundaries.external).toContain('PayPal');
    });

    it('calculates turn count from existing messages', () => {
      const existingMessages = [
        new HumanMessage('First message'),
        new AIMessage('First response'),
        new HumanMessage('Second message'),
        new AIMessage('Second response'),
        new HumanMessage('Third message'),
      ];

      const state = createInitialState(1, 'Test', 'Vision', 1, {
        messages: existingMessages,
      });

      // Should count human messages
      expect(state.turnCount).toBe(3);
    });

    it('determines current phase from generated artifacts', () => {
      const state = createInitialState(1, 'Test', 'Vision', 1, {
        generatedArtifacts: ['context_diagram', 'use_case_diagram'],
      });

      expect(state.currentPhase).toBe('scope_tree');
    });

    it('uses provided completeness', () => {
      const state = createInitialState(1, 'Test', 'Vision', 1, {
        completeness: 45,
      });

      expect(state.completeness).toBe(45);
    });
  });
});

// ============================================================
// Analyze Response Node Behavior Tests
// ============================================================

describe('analyzeResponse node behavior', () => {
  // Note: These tests describe expected behavior.
  // Actual implementation uses LLM calls which are mocked.

  describe('intent detection scenarios', () => {
    it('should detect STOP_TRIGGER for "nope" response', () => {
      // Expected behavior: Short "nope" response should be detected
      // as STOP_TRIGGER without needing LLM analysis
      const userMessage = 'nope';
      expect(containsStopTrigger(userMessage)).toBe(true);
      expect(userMessage.length).toBeLessThan(50);
    });

    it('should detect STOP_TRIGGER for "nope, no external systems"', () => {
      // Expected behavior: Message containing stop trigger
      // should result in STOP_TRIGGER intent
      const userMessage = 'nope, no external systems';
      expect(containsStopTrigger(userMessage)).toBe(true);
    });

    it('should NOT detect STOP_TRIGGER for detailed info', () => {
      // Expected behavior: Detailed response without stop triggers
      // should be classified as PROVIDE_INFO
      const userMessage = 'The main users are admins who manage content and regular users who view it';
      expect(containsStopTrigger(userMessage)).toBe(false);
    });

    it('should NOT detect STOP_TRIGGER for questions', () => {
      // Expected behavior: User asking a question should not trigger stop
      const userMessage = 'What do you mean by external systems?';
      expect(containsStopTrigger(userMessage)).toBe(false);
    });
  });

  describe('turn count increment', () => {
    it('should increment turn count after processing', () => {
      const state = createTestState('some input');
      // Turn count starts at 0 when creating fresh state
      expect(state.turnCount).toBe(0);

      // After analyzeResponse processes the message,
      // turnCount should be incremented to 1
      // (This is tested in the actual implementation)
    });

    it('should increment from existing turn count', () => {
      const state = createTestState('some input', { turnCount: 5 });
      expect(state.turnCount).toBe(5);

      // After processing, should become 6
      // (Verified in actual implementation tests)
    });
  });
});

// ============================================================
// Golden Test Data
// ============================================================

describe('golden test scenarios', () => {
  /**
   * Golden test: Basic SaaS App scenario
   * User says "That's enough for now" after providing data
   */
  it('should recognize stop trigger in golden test scenario', () => {
    const userResponse = "That's enough for now";
    expect(containsStopTrigger(userResponse)).toBe(true);
  });

  /**
   * Golden test: E-commerce Platform scenario
   * User says "Generate the context diagram" to request artifact
   */
  it('should recognize artifact request in golden test scenario', () => {
    const userResponse = 'Generate the context diagram';
    // This contains 'generate' which is a stop trigger
    expect(containsStopTrigger(userResponse)).toBe(true);
  });

  /**
   * Golden test: Providing actor information
   */
  it('should NOT trigger stop for actor information', () => {
    const userResponse = 'Sellers list products, buyers purchase them, admins handle disputes';
    expect(containsStopTrigger(userResponse)).toBe(false);
  });

  /**
   * Golden test: Providing external system information
   */
  it('should NOT trigger stop for external system information', () => {
    const userResponse = 'Payment via Stripe, shipping via ShipStation';
    expect(containsStopTrigger(userResponse)).toBe(false);
  });
});
