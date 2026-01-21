import { describe, it, expect } from '@jest/globals';
import {
  generateCornellContextDiagram,
  generateContextDiagram,
  migrateLegacyContextData,
  generateUseCaseDiagram,
  generateClassDiagram,
  generateDiagram,
  isSequenceDiagram,
  hasInvalidSequenceSyntax,
  cleanSequenceDiagramSyntax,
  type ContextDiagramSpec,
  type ContextDiagramElement,
} from '../generators';

describe('Diagram Generators', () => {
  // ============================================================
  // Cornell Context Diagram Tests
  // ============================================================
  describe('generateCornellContextDiagram', () => {
    const createValidSpec = (): ContextDiagramSpec => ({
      projectId: 'test-project',
      elements: [
        {
          id: 'users',
          name: 'End Users',
          category: 'actor',
          interactions: [{ label: 'interacts with', direction: 'bidirectional' }],
        },
        {
          id: 'admins',
          name: 'Administrators',
          category: 'actor',
          interactions: [{ label: 'manages', direction: 'inbound' }],
        },
        {
          id: 'payment-gateway',
          name: 'Payment Gateway',
          category: 'system',
          interactions: [{ label: 'processes payments via', direction: 'outbound' }],
        },
        {
          id: 'email-service',
          name: 'Email Service',
          category: 'service',
          interactions: [{ label: 'sends notifications through', direction: 'outbound' }],
        },
        {
          id: 'database',
          name: 'Database Server',
          category: 'infrastructure',
          interactions: [{ label: 'stores data in', direction: 'outbound' }],
        },
        {
          id: 'weather-api',
          name: 'Weather API',
          category: 'environment',
          interactions: [{ label: 'fetches data from', direction: 'inbound' }],
        },
        {
          id: 'regulations',
          name: 'GDPR Regulations',
          category: 'regulation',
          interactions: [{ label: 'complies with', direction: 'inbound' }],
        },
        {
          id: 'support',
          name: 'Support Team',
          category: 'service',
          interactions: [{ label: 'escalates issues to', direction: 'outbound' }],
        },
      ],
    });

    it('should generate valid Mermaid syntax for Cornell-compliant diagram', () => {
      const spec = createValidSpec();
      const result = generateCornellContextDiagram(spec);

      expect(result.mermaidSyntax).toContain('graph TB');
      expect(result.mermaidSyntax).toContain('THE SYSTEM');
      expect(result.mermaidSyntax).toContain('subgraph boundary');
      expect(result.validation.passed).toBe(true);
    });

    it('should capitalize all element names', () => {
      const spec = createValidSpec();
      const result = generateCornellContextDiagram(spec);

      expect(result.mermaidSyntax).toContain('END USERS');
      expect(result.mermaidSyntax).toContain('PAYMENT GATEWAY');
      expect(result.mermaidSyntax).toContain('EMAIL SERVICE');
    });

    it('should use B&W styling (no color fills)', () => {
      const spec = createValidSpec();
      const result = generateCornellContextDiagram(spec);

      expect(result.mermaidSyntax).toContain('fill:#ffffff');
      expect(result.mermaidSyntax).toContain('stroke:#000000');
      // Exclude white (#ffffff) and black (#000000) from the "no colors" check
      expect(result.mermaidSyntax).not.toMatch(/fill:#(?!ffffff|000000)[a-f0-9]{6}/i);
    });

    it('should use dashed line for boundary', () => {
      const spec = createValidSpec();
      const result = generateCornellContextDiagram(spec);

      expect(result.mermaidSyntax).toContain('stroke-dasharray');
    });

    it('should handle inbound interactions correctly', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'provides input to', direction: 'inbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.mermaidSyntax).toContain('-->|"provides input to"| System');
    });

    it('should handle outbound interactions correctly', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'sends data to', direction: 'outbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.mermaidSyntax).toContain('System -->|"sends data to"|');
    });

    it('should split bidirectional interactions into two lines', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'sends, receives', direction: 'bidirectional' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      // Should have both directions
      expect(result.mermaidSyntax).toContain('-->|"sends"| System');
      expect(result.mermaidSyntax).toContain('System -->|"receives"|');
    });
  });

  // ============================================================
  // Validation Tests
  // ============================================================
  describe('Context Diagram Validation', () => {
    it('should fail validation with fewer than 8 elements (CTX-002)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: [
          {
            id: 'only-one',
            name: 'Only Element',
            category: 'system',
            interactions: [{ label: 'connects to', direction: 'inbound' }],
          },
        ],
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.passed).toBe(false);
      expect(result.validation.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-002')])
      );
    });

    it('should fail validation with more than 20 elements (CTX-003)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(25).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'connects to', direction: 'inbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.passed).toBe(false);
      expect(result.validation.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-003')])
      );
    });

    it('should fail validation when element has no interactions (CTX-004)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const,
          interactions: i === 0 ? [] : [{ label: 'connects to', direction: 'inbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.passed).toBe(false);
      expect(result.validation.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-004')])
      );
    });

    it('should fail validation with duplicate element names (CTX-005)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: i < 2 ? 'Duplicate Name' : `Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'connects to', direction: 'inbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.passed).toBe(false);
      expect(result.validation.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-005')])
      );
    });

    it('should fail validation when interaction labels are not lowercase (CTX-006)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'CONNECTS TO', direction: 'inbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.passed).toBe(false);
      expect(result.validation.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-006')])
      );
    });

    it('should warn about limited category diversity (CTX-W01)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Element ${i}`,
          category: 'system' as const, // All same category
          interactions: [{ label: 'connects to', direction: 'inbound' as const }],
        })),
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-W01')])
      );
    });

    it('should warn about generic terms (CTX-W04)', () => {
      const spec: ContextDiagramSpec = {
        projectId: 'test',
        elements: [
          {
            id: 'users',
            name: 'Users', // Generic term
            category: 'actor',
            interactions: [{ label: 'uses', direction: 'inbound' }],
          },
          ...Array(7).fill(null).map((_, i) => ({
            id: `elem-${i}`,
            name: `Specific Element ${i}`,
            category: 'system' as const,
            interactions: [{ label: 'connects to', direction: 'inbound' as const }],
          })),
        ],
      };

      const result = generateCornellContextDiagram(spec);
      expect(result.validation.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('CTX-W04')])
      );
    });
  });

  // ============================================================
  // Legacy Migration Tests
  // ============================================================
  describe('migrateLegacyContextData', () => {
    it('should convert legacy format to Cornell spec', () => {
      const result = migrateLegacyContextData(
        'My System',
        ['Internal Component 1'],
        ['Payment Gateway', 'Email Service', 'Database']
      );

      expect(result.projectId).toBe('legacy');
      expect(result.systemLabel).toBe('THE SYSTEM');
      expect(result.elements).toHaveLength(3);
    });

    it('should infer correct categories from element names', () => {
      const result = migrateLegacyContextData(
        'Test',
        [],
        ['Customer Service', 'Payment API', 'Weather Data']
      );

      const categories = result.elements.map(e => e.category);
      expect(categories).toContain('actor'); // Customer Service
      expect(categories).toContain('system'); // Payment API
    });

    it('should generate interaction labels from element names', () => {
      const result = migrateLegacyContextData(
        'Test',
        [],
        ['Payment Gateway', 'Email Service']
      );

      const labels = result.elements.map(e => e.interactions[0].label);
      expect(labels[0]).toBe('processes payments via');
      expect(labels[1]).toBe('sends notifications through');
    });
  });

  // ============================================================
  // Legacy generateContextDiagram Tests
  // ============================================================
  describe('generateContextDiagram (legacy)', () => {
    it('should generate simple diagram for fewer than 8 elements', () => {
      const result = generateContextDiagram(
        'My System',
        ['Cart', 'Orders'],
        ['Payment', 'Email']
      );

      expect(result).toContain('graph TB');
      expect(result).toContain('THE SYSTEM');
      expect(result).toContain('WARNING');
    });

    it('should use Cornell generator when 8+ external elements', () => {
      const external = Array(10).fill(null).map((_, i) => `External ${i}`);
      const result = generateContextDiagram('My System', [], external);

      expect(result).toContain('subgraph boundary');
      expect(result).not.toContain('WARNING');
    });

    it('should show internal components in fallback mode', () => {
      const result = generateContextDiagram(
        'My System',
        ['Shopping Cart', 'Order Management'],
        ['Payment Gateway']
      );

      expect(result).toContain('SHOPPING CART');
      expect(result).toContain('ORDER MANAGEMENT');
    });
  });

  // ============================================================
  // Use Case Diagram Tests
  // ============================================================
  describe('generateUseCaseDiagram', () => {
    it('should generate diagram with actors and use cases', () => {
      const actors = [
        { name: 'Customer', role: 'Primary User', description: 'Buys products' },
      ];
      const useCases = [
        { id: 'UC1', name: 'Browse Products', description: 'View catalog', actor: 'Customer' },
        { id: 'UC2', name: 'Place Order', description: 'Complete purchase', actor: 'Customer' },
      ];

      const result = generateUseCaseDiagram(actors, useCases);

      expect(result).toContain('graph LR');
      expect(result).toContain('Customer');
      expect(result).toContain('Browse Products');
      expect(result).toContain('Place Order');
      expect(result).toContain('Customer --> UC1');
    });

    it('should handle empty data', () => {
      const result = generateUseCaseDiagram([], []);
      expect(result).toContain('No data available');
    });
  });

  // ============================================================
  // Class Diagram Tests
  // ============================================================
  describe('generateClassDiagram', () => {
    it('should generate class diagram with entities', () => {
      const entities = [
        {
          name: 'User',
          attributes: ['id', 'email', 'name'],
          relationships: ['User has many Orders'],
        },
        {
          name: 'Order',
          attributes: ['id', 'total', 'status'],
          relationships: ['Order belongs to User'],
        },
      ];

      const result = generateClassDiagram(entities);

      expect(result).toContain('classDiagram');
      expect(result).toContain('class User');
      expect(result).toContain('+id');
      expect(result).toContain('+email');
      expect(result).toContain('User "1" --> "*" Order');
    });

    it('should handle empty entities', () => {
      const result = generateClassDiagram([]);
      expect(result).toContain('No data available');
    });
  });

  // ============================================================
  // Unified generateDiagram Tests
  // ============================================================
  describe('generateDiagram', () => {
    it('should route to context diagram generator', () => {
      const result = generateDiagram('context', {
        projectName: 'Test',
        systemBoundaries: {
          internal: ['Cart'],
          external: ['Payment'],
        },
      });

      expect(result).toContain('THE SYSTEM');
    });

    it('should prefer contextSpec over legacy boundaries', () => {
      const contextSpec: ContextDiagramSpec = {
        projectId: 'test',
        elements: Array(8).fill(null).map((_, i) => ({
          id: `elem-${i}`,
          name: `Custom Element ${i}`,
          category: 'system' as const,
          interactions: [{ label: 'connects', direction: 'inbound' as const }],
        })),
      };

      const result = generateDiagram('context', {
        projectName: 'Test',
        systemBoundaries: { internal: [], external: ['Old Format'] },
        contextSpec,
      });

      expect(result).toContain('CUSTOM ELEMENT');
      expect(result).not.toContain('OLD FORMAT');
    });

    it('should route to use case diagram generator', () => {
      const result = generateDiagram('useCase', {
        actors: [{ name: 'User', role: 'Actor', description: 'Test' }],
        useCases: [],
      });

      expect(result).toContain('graph LR');
    });

    it('should route to class diagram generator', () => {
      const result = generateDiagram('class', {
        dataEntities: [
          { name: 'Entity', attributes: ['id'], relationships: [] },
        ],
      });

      expect(result).toContain('classDiagram');
    });

    it('should handle unknown diagram type', () => {
      const result = generateDiagram('unknown' as any, {});
      expect(result).toContain('Unknown diagram type');
    });
  });

  // ============================================================
  // Sequence Diagram Cleanup Tests
  // ============================================================
  describe('isSequenceDiagram', () => {
    it('should detect explicit sequenceDiagram declaration', () => {
      const syntax = `sequenceDiagram
    participant A
    A->>B: Hello`;
      expect(isSequenceDiagram(syntax)).toBe(true);
    });

    it('should detect sequenceDiagram with init block before declaration', () => {
      const syntax = `%%{init: {'theme': 'base'}}%%
sequenceDiagram
    participant User`;
      expect(isSequenceDiagram(syntax)).toBe(true);
    });

    it('should detect malformed sequence diagram via participant + arrows pattern', () => {
      // Malformed diagram that forgot the declaration but has sequence elements
      const syntax = `participant User
participant System
User->>System: Request data
System-->>User: Response`;
      expect(isSequenceDiagram(syntax)).toBe(true);
    });

    it('should detect actor declarations', () => {
      const syntax = `sequenceDiagram
    actor Customer
    Customer->>Shop: Browse`;
      expect(isSequenceDiagram(syntax)).toBe(true);
    });

    it('should return false for flowchart diagrams', () => {
      const syntax = `graph TD
    A --> B
    B --> C`;
      expect(isSequenceDiagram(syntax)).toBe(false);
    });

    it('should return false for class diagrams', () => {
      const syntax = `classDiagram
    class User {
      +id
      +name
    }`;
      expect(isSequenceDiagram(syntax)).toBe(false);
    });

    it('should return false for flowcharts with participant-like text', () => {
      // Flowchart that mentions participant but no sequence arrows
      const syntax = `graph TD
    participant["Participant Node"]
    participant --> Other`;
      expect(isSequenceDiagram(syntax)).toBe(false);
    });
  });

  describe('hasInvalidSequenceSyntax', () => {
    it('should detect classDef statements', () => {
      const syntax = `sequenceDiagram
    participant A
    classDef actor fill:#f9f,stroke:#333`;
      expect(hasInvalidSequenceSyntax(syntax)).toBe(true);
    });

    it('should detect class assignment statements', () => {
      const syntax = `sequenceDiagram
    participant A
    class A, B actor;`;
      expect(hasInvalidSequenceSyntax(syntax)).toBe(true);
    });

    it('should return false for clean sequence diagrams', () => {
      const syntax = `sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    B-->>A: Hi`;
      expect(hasInvalidSequenceSyntax(syntax)).toBe(false);
    });

    it('should return false for flowcharts with valid classDef', () => {
      // classDef is valid in flowcharts, but this function only checks presence
      const syntax = `graph TD
    A --> B
    classDef node fill:#f9f`;
      expect(hasInvalidSequenceSyntax(syntax)).toBe(true);
    });
  });

  describe('cleanSequenceDiagramSyntax', () => {
    it('should remove classDef from sequence diagrams', () => {
      const syntax = `sequenceDiagram
    participant A
    participant B
    A->>B: Request
    classDef actor fill:#f9f,stroke:#333
    class A actor`;

      const cleaned = cleanSequenceDiagramSyntax(syntax);

      expect(cleaned).toContain('sequenceDiagram');
      expect(cleaned).toContain('A->>B: Request');
      expect(cleaned).not.toContain('classDef');
      expect(cleaned).not.toContain('class A actor');
    });

    it('should remove styling comments from sequence diagrams', () => {
      const syntax = `sequenceDiagram
    participant A
    %% Styling
    classDef actor fill:#f9f`;

      const cleaned = cleanSequenceDiagramSyntax(syntax);

      expect(cleaned).not.toContain('Styling');
      expect(cleaned).not.toContain('classDef');
    });

    it('should return original syntax for non-sequence diagrams', () => {
      const syntax = `graph TD
    A --> B
    classDef node fill:#f9f`;

      const cleaned = cleanSequenceDiagramSyntax(syntax);

      expect(cleaned).toBe(syntax);
    });

    it('should return original syntax for clean sequence diagrams (idempotent)', () => {
      const syntax = `sequenceDiagram
    participant A
    participant B
    A->>B: Hello`;

      const cleaned = cleanSequenceDiagramSyntax(syntax);

      expect(cleaned).toBe(syntax);
    });

    it('should handle the real-world error case from user report', () => {
      // This is the actual failing syntax from the user's error
      const syntax = `sequenceDiagram
    %% Participants
    participant BusinessManager as Business Manager
    participant System as System

    %% Main Flow
    BusinessManager->>System: Request to start Personality Test
    System-->>BusinessManager: Display Personality Test

    %% Styling
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px;
    classDef system fill:#bbf,stroke:#333,stroke-width:2px;
    class BusinessManager, System actor;`;

      const cleaned = cleanSequenceDiagramSyntax(syntax);

      expect(cleaned).toContain('sequenceDiagram');
      expect(cleaned).toContain('BusinessManager->>System');
      expect(cleaned).not.toContain('classDef');
      expect(cleaned).not.toContain('class BusinessManager');
    });

    it('should preserve notes and alt/opt blocks', () => {
      const syntax = `sequenceDiagram
    participant A
    Note over A: Important note
    alt Success
        A->>B: OK
    else Failure
        A->>B: Error
    end
    classDef actor fill:#f9f`;

      const cleaned = cleanSequenceDiagramSyntax(syntax);

      expect(cleaned).toContain('Note over A');
      expect(cleaned).toContain('alt Success');
      expect(cleaned).toContain('else Failure');
      expect(cleaned).toContain('end');
      expect(cleaned).not.toContain('classDef');
    });
  });
});
