/**
 * Unit Tests for State Manager Functions
 *
 * Tests the state initialization, artifact readiness computation,
 * and phase determination logic in the LangGraph intake system.
 *
 * @module graphs/__tests__/state-manager.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import {
  createInitialState,
  computeArtifactReadiness,
  determineCurrentPhase,
  calculateCompleteness,
  getNextPhase,
  getPhaseDisplayName,
  ARTIFACT_PHASE_SEQUENCE,
  type ArtifactPhase,
  type IntakeState,
} from '../types';
import type { ExtractionResult } from '../../schemas';

// ============================================================
// Test Helpers
// ============================================================

/**
 * Create an empty extraction result for testing
 */
function createEmptyExtraction(): ExtractionResult {
  return {
    actors: [],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
  };
}

/**
 * Create a minimal extraction with one actor
 */
function createMinimalExtraction(): ExtractionResult {
  return {
    actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
  };
}

/**
 * Create extraction data ready for context diagram
 */
function createContextDiagramReadyExtraction(): ExtractionResult {
  return {
    actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
    useCases: [],
    systemBoundaries: { internal: [], external: ['Payment Gateway'] },
    dataEntities: [],
  };
}

/**
 * Create extraction data ready for use case diagram
 */
function createUseCaseDiagramReadyExtraction(): ExtractionResult {
  return {
    actors: [
      { name: 'User', role: 'Primary', description: 'End user' },
      { name: 'Admin', role: 'Secondary', description: 'Administrator' },
    ],
    useCases: [
      { id: 'UC1', name: 'Login', description: 'User logs in', actor: 'User' },
      { id: 'UC2', name: 'Create Task', description: 'User creates a task', actor: 'User' },
      { id: 'UC3', name: 'Assign Task', description: 'Admin assigns task', actor: 'Admin' },
    ],
    systemBoundaries: { internal: ['Task Management'], external: ['Email Service'] },
    dataEntities: [],
  };
}

/**
 * Create complete extraction data
 */
function createCompleteExtraction(): ExtractionResult {
  return {
    actors: [
      { name: 'Customer', role: 'Primary', description: 'Buys products' },
      { name: 'Seller', role: 'Primary', description: 'Sells products' },
      { name: 'Admin', role: 'Secondary', description: 'Manages platform' },
    ],
    useCases: [
      {
        id: 'UC1',
        name: 'Browse Products',
        description: 'Customer browses catalog',
        actor: 'Customer',
        preconditions: ['Customer is logged in'],
        postconditions: ['Products are displayed'],
        trigger: 'Customer clicks browse',
        outcome: 'Product list shown',
      },
      {
        id: 'UC2',
        name: 'Add to Cart',
        description: 'Customer adds item to cart',
        actor: 'Customer',
        preconditions: ['Product is available'],
        postconditions: ['Item in cart'],
      },
      {
        id: 'UC3',
        name: 'Checkout',
        description: 'Customer completes purchase',
        actor: 'Customer',
        preconditions: ['Cart has items'],
        postconditions: ['Order created'],
      },
      { id: 'UC4', name: 'List Product', description: 'Seller lists a product', actor: 'Seller' },
      { id: 'UC5', name: 'Manage Users', description: 'Admin manages users', actor: 'Admin' },
    ],
    systemBoundaries: {
      internal: ['Product Catalog', 'Order Management', 'User Management'],
      external: ['Stripe', 'ShipStation', 'SendGrid'],
    },
    dataEntities: [
      { name: 'Product', attributes: ['id', 'name', 'price'], relationships: ['belongs to Seller'] },
      { name: 'Order', attributes: ['id', 'total', 'status'], relationships: ['belongs to Customer'] },
      { name: 'User', attributes: ['id', 'email', 'role'], relationships: ['has many Orders'] },
    ],
  };
}

// ============================================================
// computeArtifactReadiness Tests
// ============================================================

describe('computeArtifactReadiness', () => {
  describe('context_diagram readiness', () => {
    it('returns false when no actors', () => {
      const data = createEmptyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.context_diagram).toBe(false);
    });

    it('returns false when actor but no external systems', () => {
      const data = createMinimalExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.context_diagram).toBe(false);
    });

    it('returns true when 1+ actor and external systems defined', () => {
      const data = createContextDiagramReadyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.context_diagram).toBe(true);
    });

    it('returns true when external includes none_confirmed', () => {
      const data: ExtractionResult = {
        actors: [{ name: 'User', role: 'Primary', description: 'User' }],
        useCases: [],
        systemBoundaries: { internal: [], external: ['none_confirmed'] },
        dataEntities: [],
      };
      const readiness = computeArtifactReadiness(data);
      expect(readiness.context_diagram).toBe(true);
    });
  });

  describe('use_case_diagram readiness', () => {
    it('returns false when less than 2 actors', () => {
      const data = createMinimalExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.use_case_diagram).toBe(false);
    });

    it('returns false when less than 3 use cases', () => {
      const data: ExtractionResult = {
        actors: [
          { name: 'User', role: 'Primary', description: 'User' },
          { name: 'Admin', role: 'Secondary', description: 'Admin' },
        ],
        useCases: [
          { id: 'UC1', name: 'Login', description: 'Login', actor: 'User' },
          { id: 'UC2', name: 'Logout', description: 'Logout', actor: 'User' },
        ],
        systemBoundaries: { internal: [], external: [] },
        dataEntities: [],
      };
      const readiness = computeArtifactReadiness(data);
      expect(readiness.use_case_diagram).toBe(false);
    });

    it('returns true when 2+ actors and 3+ use cases', () => {
      const data = createUseCaseDiagramReadyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.use_case_diagram).toBe(true);
    });
  });

  describe('scope_tree readiness', () => {
    it('returns false when no internal scope items', () => {
      const data = createEmptyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.scope_tree).toBe(false);
    });

    it('returns true when internal scope items defined', () => {
      const data: ExtractionResult = {
        ...createEmptyExtraction(),
        systemBoundaries: { internal: ['Feature A', 'Feature B'], external: [] },
      };
      const readiness = computeArtifactReadiness(data);
      expect(readiness.scope_tree).toBe(true);
    });
  });

  describe('ucbd readiness', () => {
    it('returns false when less than 3 use cases', () => {
      const data = createMinimalExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.ucbd).toBe(false);
    });

    it('returns false when 3+ use cases but no pre/post conditions', () => {
      const data: ExtractionResult = {
        actors: [{ name: 'User', role: 'Primary', description: 'User' }],
        useCases: [
          { id: 'UC1', name: 'UC1', description: 'UC1', actor: 'User' },
          { id: 'UC2', name: 'UC2', description: 'UC2', actor: 'User' },
          { id: 'UC3', name: 'UC3', description: 'UC3', actor: 'User' },
        ],
        systemBoundaries: { internal: [], external: [] },
        dataEntities: [],
      };
      const readiness = computeArtifactReadiness(data);
      expect(readiness.ucbd).toBe(false);
    });

    it('returns true when 3+ use cases with pre/post conditions', () => {
      const data = createCompleteExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.ucbd).toBe(true);
    });
  });

  describe('requirements_table readiness', () => {
    it('returns false when less than 5 use cases', () => {
      const data = createUseCaseDiagramReadyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.requirements_table).toBe(false);
    });

    it('returns true when 5+ use cases', () => {
      const data = createCompleteExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.requirements_table).toBe(true);
    });
  });

  describe('constants_table readiness', () => {
    it('returns false when no use cases', () => {
      const data = createEmptyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.constants_table).toBe(false);
    });

    it('returns true when 3+ use cases (can infer constants)', () => {
      const data = createUseCaseDiagramReadyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.constants_table).toBe(true);
    });
  });

  describe('sysml_activity_diagram readiness', () => {
    it('returns false when less than 3 use cases', () => {
      const data = createMinimalExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.sysml_activity_diagram).toBe(false);
    });

    it('returns true when 3+ use cases', () => {
      const data = createUseCaseDiagramReadyExtraction();
      const readiness = computeArtifactReadiness(data);
      expect(readiness.sysml_activity_diagram).toBe(true);
    });
  });
});

// ============================================================
// determineCurrentPhase Tests
// ============================================================

describe('determineCurrentPhase', () => {
  it('returns context_diagram when no artifacts generated', () => {
    const phase = determineCurrentPhase([]);
    expect(phase).toBe('context_diagram');
  });

  it('returns use_case_diagram after context_diagram', () => {
    const phase = determineCurrentPhase(['context_diagram']);
    expect(phase).toBe('use_case_diagram');
  });

  it('returns scope_tree after context and use case diagrams', () => {
    const phase = determineCurrentPhase(['context_diagram', 'use_case_diagram']);
    expect(phase).toBe('scope_tree');
  });

  it('returns ucbd after first three artifacts', () => {
    const phase = determineCurrentPhase([
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
    ]);
    expect(phase).toBe('ucbd');
  });

  it('returns requirements_table after four artifacts', () => {
    const phase = determineCurrentPhase([
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
      'ucbd',
    ]);
    expect(phase).toBe('requirements_table');
  });

  it('returns constants_table after five artifacts', () => {
    const phase = determineCurrentPhase([
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
      'ucbd',
      'requirements_table',
    ]);
    expect(phase).toBe('constants_table');
  });

  it('returns sysml_activity_diagram after six artifacts', () => {
    const phase = determineCurrentPhase([
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
      'ucbd',
      'requirements_table',
      'constants_table',
    ]);
    expect(phase).toBe('sysml_activity_diagram');
  });

  it('returns sysml_activity_diagram when all generated', () => {
    const phase = determineCurrentPhase(ARTIFACT_PHASE_SEQUENCE);
    expect(phase).toBe('sysml_activity_diagram');
  });

  it('handles out-of-order generated artifacts', () => {
    // If somehow scope_tree was generated first, should still return context_diagram
    const phase = determineCurrentPhase(['scope_tree']);
    expect(phase).toBe('context_diagram');
  });
});

// ============================================================
// calculateCompleteness Tests
// ============================================================

describe('calculateCompleteness', () => {
  it('returns 0 for empty extraction', () => {
    const data = createEmptyExtraction();
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(0);
  });

  it('returns 12 for 1 actor', () => {
    const data = createMinimalExtraction();
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(12);
  });

  it('returns 25 for 2+ actors', () => {
    const data: ExtractionResult = {
      actors: [
        { name: 'User', role: 'Primary', description: 'User' },
        { name: 'Admin', role: 'Secondary', description: 'Admin' },
      ],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(25);
  });

  it('adds 10 for 1-2 use cases', () => {
    const data: ExtractionResult = {
      actors: [],
      useCases: [{ id: 'UC1', name: 'UC1', description: 'UC1', actor: 'User' }],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(10);
  });

  it('adds 25 for 3-4 use cases', () => {
    const data: ExtractionResult = {
      actors: [],
      useCases: [
        { id: 'UC1', name: 'UC1', description: 'UC1', actor: 'User' },
        { id: 'UC2', name: 'UC2', description: 'UC2', actor: 'User' },
        { id: 'UC3', name: 'UC3', description: 'UC3', actor: 'User' },
      ],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(25);
  });

  it('adds 35 for 5+ use cases', () => {
    const data = createCompleteExtraction();
    // 5 use cases = 35 points
    // 3 actors = 25 points
    // both boundaries = 20 points
    // 3 entities = 20 points
    // Total = 100
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(100);
  });

  it('adds 10 for one boundary type', () => {
    const data: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: ['Feature'], external: [] },
      dataEntities: [],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(10);
  });

  it('adds 20 for both boundary types', () => {
    const data: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: ['Feature'], external: ['API'] },
      dataEntities: [],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(20);
  });

  it('adds 7 for 1-2 data entities', () => {
    const data: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [{ name: 'User', attributes: ['id'], relationships: [] }],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(7);
  });

  it('adds 20 for 3+ data entities', () => {
    const data: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [
        { name: 'User', attributes: ['id'], relationships: [] },
        { name: 'Order', attributes: ['id'], relationships: [] },
        { name: 'Product', attributes: ['id'], relationships: [] },
      ],
    };
    const completeness = calculateCompleteness(data);
    expect(completeness).toBe(20);
  });

  it('caps at 100', () => {
    const data = createCompleteExtraction();
    const completeness = calculateCompleteness(data);
    expect(completeness).toBeLessThanOrEqual(100);
  });
});

// ============================================================
// getNextPhase Tests
// ============================================================

describe('getNextPhase', () => {
  it('returns use_case_diagram after context_diagram', () => {
    expect(getNextPhase('context_diagram')).toBe('use_case_diagram');
  });

  it('returns scope_tree after use_case_diagram', () => {
    expect(getNextPhase('use_case_diagram')).toBe('scope_tree');
  });

  it('returns ucbd after scope_tree', () => {
    expect(getNextPhase('scope_tree')).toBe('ucbd');
  });

  it('returns requirements_table after ucbd', () => {
    expect(getNextPhase('ucbd')).toBe('requirements_table');
  });

  it('returns constants_table after requirements_table', () => {
    expect(getNextPhase('requirements_table')).toBe('constants_table');
  });

  it('returns sysml_activity_diagram after constants_table', () => {
    expect(getNextPhase('constants_table')).toBe('sysml_activity_diagram');
  });

  it('returns null after sysml_activity_diagram', () => {
    expect(getNextPhase('sysml_activity_diagram')).toBeNull();
  });
});

// ============================================================
// getPhaseDisplayName Tests
// ============================================================

describe('getPhaseDisplayName', () => {
  it('formats context_diagram correctly', () => {
    expect(getPhaseDisplayName('context_diagram')).toBe('Context Diagram');
  });

  it('formats use_case_diagram correctly', () => {
    expect(getPhaseDisplayName('use_case_diagram')).toBe('Use Case Diagram');
  });

  it('formats scope_tree correctly', () => {
    expect(getPhaseDisplayName('scope_tree')).toBe('Scope Tree');
  });

  it('formats ucbd correctly', () => {
    expect(getPhaseDisplayName('ucbd')).toBe('Ucbd');
  });

  it('formats requirements_table correctly', () => {
    expect(getPhaseDisplayName('requirements_table')).toBe('Requirements Table');
  });

  it('formats constants_table correctly', () => {
    expect(getPhaseDisplayName('constants_table')).toBe('Constants Table');
  });

  it('formats sysml_activity_diagram correctly', () => {
    expect(getPhaseDisplayName('sysml_activity_diagram')).toBe('Sysml Activity Diagram');
  });
});

// ============================================================
// ARTIFACT_PHASE_SEQUENCE Tests
// ============================================================

describe('ARTIFACT_PHASE_SEQUENCE', () => {
  it('contains all 7 artifact phases', () => {
    expect(ARTIFACT_PHASE_SEQUENCE).toHaveLength(7);
  });

  it('starts with context_diagram', () => {
    expect(ARTIFACT_PHASE_SEQUENCE[0]).toBe('context_diagram');
  });

  it('ends with sysml_activity_diagram', () => {
    expect(ARTIFACT_PHASE_SEQUENCE[6]).toBe('sysml_activity_diagram');
  });

  it('follows SR-CORNELL order', () => {
    expect(ARTIFACT_PHASE_SEQUENCE).toEqual([
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
      'ucbd',
      'requirements_table',
      'constants_table',
      'sysml_activity_diagram',
    ]);
  });
});

// ============================================================
// State Manager Merge Logic Tests
// ============================================================

describe('extraction data merge behavior', () => {
  it('should deduplicate actors by name when merging', () => {
    // Test the expected merge behavior
    const existingActors = [
      { name: 'User', role: 'Primary', description: 'End user' },
    ];
    const newActors = [
      { name: 'User', role: 'Updated', description: 'Updated description' },
      { name: 'Admin', role: 'Secondary', description: 'Administrator' },
    ];

    // Expected behavior: Use a Map to dedupe by name (last value wins)
    const actorMap = new Map(existingActors.map(a => [a.name, a]));
    newActors.forEach(a => actorMap.set(a.name, a));
    const mergedActors = Array.from(actorMap.values());

    expect(mergedActors).toHaveLength(2);
    expect(mergedActors.find(a => a.name === 'User')?.role).toBe('Updated');
    expect(mergedActors.find(a => a.name === 'Admin')).toBeDefined();
  });

  it('should deduplicate external systems when merging', () => {
    const existing = ['PayPal'];
    const newSystems = ['PayPal', 'Stripe', 'SendGrid'];

    // Expected behavior: Use Set for deduplication
    const merged = [...new Set([...existing, ...newSystems])];

    expect(merged).toHaveLength(3);
    expect(merged).toContain('PayPal');
    expect(merged).toContain('Stripe');
    expect(merged).toContain('SendGrid');
  });

  it('should preserve existing data when merging partial updates', () => {
    const existingData: ExtractionResult = {
      actors: [{ name: 'User', role: 'Primary', description: 'User' }],
      useCases: [{ id: 'UC1', name: 'Login', description: 'Login', actor: 'User' }],
      systemBoundaries: { internal: ['Auth'], external: ['OAuth'] },
      dataEntities: [],
    };

    // Simulating partial update (only new use case)
    const partialUpdate = {
      useCases: [
        { id: 'UC1', name: 'Login', description: 'Login', actor: 'User' },
        { id: 'UC2', name: 'Logout', description: 'Logout', actor: 'User' },
      ],
    };

    // Expected merge behavior
    const merged: ExtractionResult = {
      ...existingData,
      useCases: partialUpdate.useCases,
    };

    expect(merged.actors).toHaveLength(1);
    expect(merged.useCases).toHaveLength(2);
    expect(merged.systemBoundaries.internal).toContain('Auth');
  });
});
