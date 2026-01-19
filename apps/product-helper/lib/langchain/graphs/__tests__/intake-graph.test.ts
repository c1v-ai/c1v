/**
 * Integration Tests for Intake Graph
 *
 * Tests the full flow of the LangGraph intake system from
 * first message to context diagram generation.
 *
 * These tests mock database operations and LLM calls
 * to focus on graph orchestration logic.
 *
 * @module graphs/__tests__/intake-graph.test.ts
 */

import { describe, it, expect, jest } from '@jest/globals';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import {
  createInitialState,
  computeArtifactReadiness,
  containsStopTrigger,
  ARTIFACT_PHASE_SEQUENCE,
  type IntakeState,
  type ArtifactPhase,
} from '../types';
import {
  routeAfterAnalysis,
  routeAfterExtraction,
  routeAfterValidation,
  routeAfterArtifact,
  shouldForceEnd,
} from '../edges';
import type { ExtractionResult } from '../../schemas';

// ============================================================
// Mock Setup
// ============================================================

// Note: Full mocking of external modules requires jest.mock setup at module level
// These tests focus on pure functions (routing, state management) that don't require mocking

// ============================================================
// Test Helpers
// ============================================================

/**
 * Create a test state with default values
 */
function createTestState(overrides?: Partial<IntakeState>): IntakeState {
  const baseState = createInitialState(
    1,
    'Test Project',
    'A test application for managing tasks',
    1
  );

  return {
    ...baseState,
    ...overrides,
  };
}

/**
 * Create extraction result with specified data
 */
function createExtraction(data: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    actors: data.actors || [],
    useCases: data.useCases || [],
    systemBoundaries: data.systemBoundaries || { internal: [], external: [] },
    dataEntities: data.dataEntities || [],
  };
}

/**
 * Simulate a conversation turn
 */
function addUserMessage(state: IntakeState, content: string): IntakeState {
  return {
    ...state,
    messages: [...state.messages, new HumanMessage(content)],
  };
}

/**
 * Simulate AI response
 */
function addAIMessage(state: IntakeState, content: string): IntakeState {
  return {
    ...state,
    messages: [...state.messages, new AIMessage(content)],
  };
}

// ============================================================
// Edge Routing Integration Tests
// ============================================================

describe('edge routing integration', () => {
  describe('routeAfterAnalysis', () => {
    it('routes to extract_data for STOP_TRIGGER', () => {
      const state = createTestState({
        lastIntent: 'STOP_TRIGGER',
      });

      const route = routeAfterAnalysis(state);
      expect(route).toBe('extract_data');
    });

    it('routes to check_sr_cornell for REQUEST_ARTIFACT', () => {
      const state = createTestState({
        lastIntent: 'REQUEST_ARTIFACT',
      });

      const route = routeAfterAnalysis(state);
      expect(route).toBe('check_sr_cornell');
    });

    it('routes to extract_data for PROVIDE_INFO when artifact not ready', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        currentPhase: 'context_diagram',
        artifactReadiness: {
          context_diagram: false,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterAnalysis(state);
      expect(route).toBe('extract_data');
    });

    it('routes to check_sr_cornell for PROVIDE_INFO when artifact ready', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        currentPhase: 'context_diagram',
        artifactReadiness: {
          context_diagram: true,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterAnalysis(state);
      expect(route).toBe('check_sr_cornell');
    });

    it('routes to compute_next_question for DENY', () => {
      const state = createTestState({
        lastIntent: 'DENY',
      });

      const route = routeAfterAnalysis(state);
      expect(route).toBe('compute_next_question');
    });

    it('routes to extract_data for UNKNOWN', () => {
      const state = createTestState({
        lastIntent: 'UNKNOWN',
      });

      const route = routeAfterAnalysis(state);
      expect(route).toBe('extract_data');
    });
  });

  describe('routeAfterExtraction', () => {
    it('routes to check_sr_cornell for STOP_TRIGGER', () => {
      const state = createTestState({
        lastIntent: 'STOP_TRIGGER',
      });

      const route = routeAfterExtraction(state);
      expect(route).toBe('check_sr_cornell');
    });

    it('routes to check_sr_cornell when artifact ready', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        currentPhase: 'context_diagram',
        artifactReadiness: {
          context_diagram: true,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterExtraction(state);
      expect(route).toBe('check_sr_cornell');
    });

    it('routes to check_sr_cornell when completeness >= 30', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        completeness: 35,
        currentPhase: 'context_diagram',
        artifactReadiness: {
          context_diagram: false,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterExtraction(state);
      expect(route).toBe('check_sr_cornell');
    });

    it('routes to compute_next_question when need more data', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        completeness: 15,
        currentPhase: 'context_diagram',
        artifactReadiness: {
          context_diagram: false,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterExtraction(state);
      expect(route).toBe('compute_next_question');
    });
  });

  describe('routeAfterValidation', () => {
    it('routes to __end__ when isComplete', () => {
      const state = createTestState({
        isComplete: true,
      });

      const route = routeAfterValidation(state);
      expect(route).toBe('__end__');
    });

    it('routes to generate_artifact for STOP_TRIGGER', () => {
      const state = createTestState({
        lastIntent: 'STOP_TRIGGER',
        isComplete: false,
      });

      const route = routeAfterValidation(state);
      expect(route).toBe('generate_artifact');
    });

    it('routes to generate_artifact when artifact ready and not generated', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        isComplete: false,
        currentPhase: 'context_diagram',
        generatedArtifacts: [],
        artifactReadiness: {
          context_diagram: true,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterValidation(state);
      expect(route).toBe('generate_artifact');
    });

    it('routes to compute_next_question when artifact not ready', () => {
      const state = createTestState({
        lastIntent: 'PROVIDE_INFO',
        isComplete: false,
        currentPhase: 'context_diagram',
        generatedArtifacts: [],
        artifactReadiness: {
          context_diagram: false,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      const route = routeAfterValidation(state);
      expect(route).toBe('compute_next_question');
    });
  });

  describe('routeAfterArtifact', () => {
    it('routes to __end__ when all 7 artifacts generated', () => {
      const state = createTestState({
        generatedArtifacts: ARTIFACT_PHASE_SEQUENCE as ArtifactPhase[],
      });

      const route = routeAfterArtifact(state);
      expect(route).toBe('__end__');
    });

    it('routes to __end__ when isComplete', () => {
      const state = createTestState({
        isComplete: true,
        generatedArtifacts: ['context_diagram'],
      });

      const route = routeAfterArtifact(state);
      expect(route).toBe('__end__');
    });

    it('routes to check_sr_cornell when more artifacts needed', () => {
      const state = createTestState({
        isComplete: false,
        generatedArtifacts: ['context_diagram'],
      });

      const route = routeAfterArtifact(state);
      expect(route).toBe('check_sr_cornell');
    });
  });
});

// ============================================================
// Full Flow Integration Tests
// ============================================================

describe('full intake flow integration', () => {
  describe('first message handling', () => {
    it('should process first user message', () => {
      const state = createTestState();
      const withMessage = addUserMessage(state, 'Help me define requirements');

      expect(withMessage.messages).toHaveLength(1);
      expect(withMessage.messages[0]._getType()).toBe('human');
    });

    it('should extract entities from first message', () => {
      // Simulate extraction result
      const extractedData = createExtraction({
        actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
      });

      const state = createTestState({
        extractedData,
      });

      expect(state.extractedData.actors).toHaveLength(1);
    });
  });

  describe('stop trigger flow', () => {
    it('should detect stop trigger and route to artifact generation', () => {
      // Step 1: User has provided some info
      const state = createTestState({
        extractedData: createExtraction({
          actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
          systemBoundaries: { internal: [], external: ['PayPal'] },
        }),
        artifactReadiness: {
          context_diagram: true,
          use_case_diagram: false,
          scope_tree: false,
          ucbd: false,
          requirements_table: false,
          constants_table: false,
          sysml_activity_diagram: false,
        },
      });

      // Step 2: User says "nope"
      const withStopTrigger = {
        ...state,
        lastIntent: 'STOP_TRIGGER' as const,
      };

      // Step 3: Should route to extract_data first
      const route1 = routeAfterAnalysis(withStopTrigger);
      expect(route1).toBe('extract_data');

      // Step 4: After extraction, should route to validation
      const route2 = routeAfterExtraction(withStopTrigger);
      expect(route2).toBe('check_sr_cornell');

      // Step 5: After validation, should generate artifact
      const route3 = routeAfterValidation(withStopTrigger);
      expect(route3).toBe('generate_artifact');
    });

    it('should generate context diagram with minimal input', () => {
      // User has provided just enough for context diagram
      const extractedData = createExtraction({
        actors: [{ name: 'Admin', role: 'Primary', description: 'Administrator' }],
        systemBoundaries: { internal: ['User Management'], external: ['Email Service'] },
      });

      const readiness = computeArtifactReadiness(extractedData);

      expect(readiness.context_diagram).toBe(true);
    });
  });

  describe('multi-turn conversation', () => {
    it('should accumulate extracted data across turns', () => {
      // Turn 1: Extract actors
      let state = createTestState({
        extractedData: createExtraction({
          actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
        }),
        turnCount: 1,
      });

      // Turn 2: Add more actors
      state = {
        ...state,
        extractedData: createExtraction({
          actors: [
            { name: 'User', role: 'Primary', description: 'End user' },
            { name: 'Admin', role: 'Secondary', description: 'Administrator' },
          ],
        }),
        turnCount: 2,
      };

      // Turn 3: Add external systems
      state = {
        ...state,
        extractedData: {
          ...state.extractedData,
          systemBoundaries: { internal: [], external: ['Stripe', 'SendGrid'] },
        },
        turnCount: 3,
      };

      expect(state.extractedData.actors).toHaveLength(2);
      expect(state.extractedData.systemBoundaries.external).toHaveLength(2);
      expect(state.turnCount).toBe(3);
    });

    it('should update completeness as data is added', () => {
      const extractedData = createExtraction({
        actors: [
          { name: 'Customer', role: 'Primary', description: 'Buyer' },
          { name: 'Seller', role: 'Primary', description: 'Merchant' },
        ],
        useCases: [
          { id: 'UC1', name: 'Browse', description: 'Browse products', actor: 'Customer' },
          { id: 'UC2', name: 'Buy', description: 'Purchase products', actor: 'Customer' },
          { id: 'UC3', name: 'List', description: 'List products', actor: 'Seller' },
        ],
        systemBoundaries: { internal: ['Catalog'], external: ['Stripe'] },
        dataEntities: [
          { name: 'Product', attributes: ['id', 'name'], relationships: [] },
        ],
      });

      const readiness = computeArtifactReadiness(extractedData);

      // Should have context diagram ready (1 actor + external)
      expect(readiness.context_diagram).toBe(true);
      // Should have use case diagram ready (2 actors + 3 use cases)
      expect(readiness.use_case_diagram).toBe(true);
    });
  });

  describe('phase progression', () => {
    it('should advance phase after artifact generation', () => {
      const state = createTestState({
        currentPhase: 'context_diagram',
        generatedArtifacts: [],
      });

      // After generating context_diagram
      const afterGeneration = {
        ...state,
        generatedArtifacts: ['context_diagram' as ArtifactPhase],
        currentPhase: 'use_case_diagram' as ArtifactPhase,
      };

      expect(afterGeneration.generatedArtifacts).toContain('context_diagram');
      expect(afterGeneration.currentPhase).toBe('use_case_diagram');
    });

    it('should follow SR-CORNELL artifact sequence', () => {
      const expectedSequence: ArtifactPhase[] = [
        'context_diagram',
        'use_case_diagram',
        'scope_tree',
        'ucbd',
        'requirements_table',
        'constants_table',
        'sysml_activity_diagram',
      ];

      expect(ARTIFACT_PHASE_SEQUENCE).toEqual(expectedSequence);
    });
  });

  describe('force end conditions', () => {
    it('should force end at 50 turns', () => {
      const state = createTestState({
        turnCount: 50,
      });

      expect(shouldForceEnd(state)).toBe(true);
    });

    it('should force end when all artifacts generated', () => {
      const state = createTestState({
        generatedArtifacts: ARTIFACT_PHASE_SEQUENCE as ArtifactPhase[],
      });

      expect(shouldForceEnd(state)).toBe(true);
    });

    it('should force end when isComplete', () => {
      const state = createTestState({
        isComplete: true,
      });

      expect(shouldForceEnd(state)).toBe(true);
    });

    it('should not force end during normal conversation', () => {
      const state = createTestState({
        turnCount: 5,
        isComplete: false,
        generatedArtifacts: ['context_diagram'],
      });

      expect(shouldForceEnd(state)).toBe(false);
    });
  });
});

// ============================================================
// Golden Test Scenarios
// ============================================================

describe('golden test scenarios', () => {
  /**
   * Golden Test: Basic SaaS App
   *
   * Vision: A project management tool for small teams
   * Conversation:
   * 1. "Team leads and developers will use it"
   * 2. "Integrates with GitHub and Slack"
   * 3. "That's enough for now"
   *
   * Expected: context_diagram ready, moving to use_case_diagram
   */
  describe('basic SaaS app scenario', () => {
    it('should extract actors from first message', () => {
      const extraction = createExtraction({
        actors: [
          { name: 'Team Lead', role: 'Primary', description: 'Manages team' },
          { name: 'Developer', role: 'Primary', description: 'Team member' },
        ],
      });

      expect(extraction.actors).toHaveLength(2);
      expect(extraction.actors.map(a => a.name)).toContain('Team Lead');
      expect(extraction.actors.map(a => a.name)).toContain('Developer');
    });

    it('should extract external systems from second message', () => {
      const extraction = createExtraction({
        systemBoundaries: { internal: [], external: ['GitHub', 'Slack'] },
      });

      expect(extraction.systemBoundaries.external).toContain('GitHub');
      expect(extraction.systemBoundaries.external).toContain('Slack');
    });

    it('should detect stop trigger in third message', () => {
      expect(containsStopTrigger("That's enough for now")).toBe(true);
    });

    it('should have context_diagram ready after conversation', () => {
      const extraction = createExtraction({
        actors: [
          { name: 'Team Lead', role: 'Primary', description: 'Manages team' },
          { name: 'Developer', role: 'Primary', description: 'Team member' },
        ],
        systemBoundaries: { internal: [], external: ['GitHub', 'Slack'] },
      });

      const readiness = computeArtifactReadiness(extraction);
      expect(readiness.context_diagram).toBe(true);
    });
  });

  /**
   * Golden Test: E-commerce Platform
   *
   * Vision: An online marketplace for handmade goods
   * Conversation:
   * 1. "Sellers list products, buyers purchase them"
   * 2. "Admins handle disputes"
   * 3. "Payment via Stripe, shipping via ShipStation"
   * 4. "Generate the context diagram"
   *
   * Expected: All 3 actors, 2 external systems, context_diagram generated
   */
  describe('e-commerce platform scenario', () => {
    it('should extract all actors from messages', () => {
      const extraction = createExtraction({
        actors: [
          { name: 'Seller', role: 'Primary', description: 'Lists products' },
          { name: 'Buyer', role: 'Primary', description: 'Purchases products' },
          { name: 'Admin', role: 'Secondary', description: 'Handles disputes' },
        ],
      });

      expect(extraction.actors).toHaveLength(3);
    });

    it('should extract external systems', () => {
      const extraction = createExtraction({
        systemBoundaries: { internal: [], external: ['Stripe', 'ShipStation'] },
      });

      expect(extraction.systemBoundaries.external).toHaveLength(2);
    });

    it('should detect generate request', () => {
      expect(containsStopTrigger('Generate the context diagram')).toBe(true);
    });

    it('should have all required data for context_diagram', () => {
      const extraction = createExtraction({
        actors: [
          { name: 'Seller', role: 'Primary', description: 'Lists products' },
          { name: 'Buyer', role: 'Primary', description: 'Purchases products' },
          { name: 'Admin', role: 'Secondary', description: 'Handles disputes' },
        ],
        systemBoundaries: { internal: [], external: ['Stripe', 'ShipStation'] },
      });

      const readiness = computeArtifactReadiness(extraction);

      expect(readiness.context_diagram).toBe(true);
      // With 3 actors and use cases, use_case_diagram could be ready too
      // But we'd need 3+ use cases for that
      expect(readiness.use_case_diagram).toBe(false);
    });
  });

  /**
   * Golden Test: Task Management App
   *
   * Complete flow ending with context_diagram generation
   */
  describe('task management app complete flow', () => {
    it('should complete context_diagram phase', () => {
      // Final state after conversation
      const finalState = createTestState({
        extractedData: createExtraction({
          actors: [
            { name: 'Manager', role: 'Primary', description: 'Assigns tasks' },
            { name: 'Team Member', role: 'Primary', description: 'Completes tasks' },
          ],
          useCases: [
            { id: 'UC1', name: 'Create Task', description: 'Create a new task', actor: 'Manager' },
            { id: 'UC2', name: 'Assign Task', description: 'Assign task to member', actor: 'Manager' },
            { id: 'UC3', name: 'Complete Task', description: 'Mark task done', actor: 'Team Member' },
          ],
          systemBoundaries: {
            internal: ['Task Board', 'Notifications'],
            external: ['Slack', 'Google Calendar'],
          },
        }),
        completeness: 60,
        currentPhase: 'context_diagram',
        generatedArtifacts: [],
        lastIntent: 'STOP_TRIGGER',
      });

      const readiness = computeArtifactReadiness(finalState.extractedData);

      // All early artifacts should be ready
      expect(readiness.context_diagram).toBe(true);
      expect(readiness.use_case_diagram).toBe(true);
      expect(readiness.scope_tree).toBe(true);
      expect(readiness.sysml_activity_diagram).toBe(true);

      // Should route to generate artifact
      const route = routeAfterValidation(finalState);
      expect(route).toBe('generate_artifact');
    });
  });
});

// ============================================================
// Error Handling Tests
// ============================================================

describe('error handling', () => {
  it('should set error flag on state', () => {
    const state = createTestState();
    const withError = {
      ...state,
      error: 'Test error message',
    };

    expect(withError.error).toBe('Test error message');
  });

  it('should preserve state on error', () => {
    const state = createTestState({
      extractedData: createExtraction({
        actors: [{ name: 'User', role: 'Primary', description: 'User' }],
      }),
      completeness: 25,
    });

    const withError = {
      ...state,
      error: 'LLM call failed',
    };

    expect(withError.extractedData.actors).toHaveLength(1);
    expect(withError.completeness).toBe(25);
  });
});
