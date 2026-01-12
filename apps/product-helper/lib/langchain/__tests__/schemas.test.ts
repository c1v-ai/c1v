import { describe, it, expect } from '@jest/globals';
import {
  actorSchema,
  useCaseSchema,
  requirementsTableRowSchema,
  constantsTableRowSchema,
  activityDiagramStepSchema,
  activityDiagramSpecSchema,
  extractionSchema,
  type Actor,
  type UseCase,
  type RequirementsTableRow,
  type ConstantsTableRow,
} from '../schemas';

describe('LangChain Schemas', () => {
  describe('actorSchema', () => {
    it('should validate a valid actor', () => {
      const validActor = {
        name: 'Customer',
        role: 'Primary User',
        description: 'End user who purchases products',
        goals: ['Browse products', 'Make purchases'],
      };

      const result = actorSchema.safeParse(validActor);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Customer');
      }
    });

    it('should reject actor without required fields', () => {
      const invalidActor = {
        name: 'Customer',
        // missing role and description
      };

      const result = actorSchema.safeParse(invalidActor);
      expect(result.success).toBe(false);
    });
  });

  describe('useCaseSchema', () => {
    it('should validate a complete use case', () => {
      const validUseCase = {
        id: 'UC1',
        name: 'Place Order',
        description: 'Customer places an order for selected products',
        actor: 'Customer',
        preconditions: ['User is logged in', 'Cart has items'],
        postconditions: ['Order is created', 'Payment is processed'],
        trigger: 'User clicks checkout button',
        outcome: 'Order confirmation displayed',
      };

      const result = useCaseSchema.safeParse(validUseCase);
      expect(result.success).toBe(true);
    });
  });

  describe('requirementsTableRowSchema', () => {
    it('should validate a valid requirement', () => {
      const validRequirement: RequirementsTableRow = {
        id: 'REQ-001',
        name: 'User Authentication',
        description: 'The system SHALL authenticate users via email and password',
        source: 'UC1 - User Login',
        priority: 'Critical',
        testability: 'Test with valid and invalid credentials',
        status: 'Draft',
        category: 'Security',
      };

      const result = requirementsTableRowSchema.safeParse(validRequirement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('Critical');
        expect(result.data.category).toBe('Security');
      }
    });

    it('should reject requirement with invalid priority', () => {
      const invalidRequirement = {
        id: 'REQ-001',
        name: 'User Authentication',
        description: 'The system SHALL authenticate users',
        source: 'UC1',
        priority: 'SuperHigh', // Invalid priority
        testability: 'Test it',
        category: 'Security',
      };

      const result = requirementsTableRowSchema.safeParse(invalidRequirement);
      expect(result.success).toBe(false);
    });
  });

  describe('constantsTableRowSchema', () => {
    it('should validate a valid constant', () => {
      const validConstant: ConstantsTableRow = {
        name: 'MAX_LOGIN_ATTEMPTS',
        value: '5',
        units: 'attempts',
        description: 'Maximum failed login attempts before lockout',
        category: 'Security',
      };

      const result = constantsTableRowSchema.safeParse(validConstant);
      expect(result.success).toBe(true);
    });

    it('should allow constant without units', () => {
      const constant = {
        name: 'DEFAULT_THEME',
        value: 'light',
        description: 'Default UI theme',
        category: 'UI/UX',
      };

      const result = constantsTableRowSchema.safeParse(constant);
      expect(result.success).toBe(true);
    });
  });

  describe('activityDiagramStepSchema', () => {
    it('should validate a decision step with transitions', () => {
      const decisionStep = {
        id: 'STEP-4',
        type: 'decision',
        label: 'Credentials valid?',
        actor: 'System',
        transitions: [
          { targetId: 'STEP-5', condition: 'Valid', label: 'Yes' },
          { targetId: 'STEP-6', condition: 'Invalid', label: 'No' },
        ],
      };

      const result = activityDiagramStepSchema.safeParse(decisionStep);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.transitions).toHaveLength(2);
      }
    });
  });

  describe('activityDiagramSpecSchema', () => {
    it('should validate a complete activity diagram spec', () => {
      const spec = {
        useCaseId: 'UC1',
        useCaseName: 'User Login',
        steps: [
          {
            id: 'STEP-1',
            type: 'start' as const,
            label: 'User initiates login',
            transitions: [{ targetId: 'STEP-2' }],
          },
          {
            id: 'STEP-2',
            type: 'action' as const,
            label: 'Enter credentials',
            actor: 'User',
            transitions: [{ targetId: 'STEP-3' }],
          },
          {
            id: 'STEP-3',
            type: 'end' as const,
            label: 'Login complete',
            transitions: [],
          },
        ],
      };

      const result = activityDiagramSpecSchema.safeParse(spec);
      expect(result.success).toBe(true);
    });
  });

  describe('extractionSchema', () => {
    it('should validate complete extraction result', () => {
      const extraction = {
        actors: [
          {
            name: 'Customer',
            role: 'Primary User',
            description: 'End user',
          },
        ],
        useCases: [
          {
            id: 'UC1',
            name: 'Login',
            description: 'User logs in',
            actor: 'Customer',
          },
        ],
        systemBoundaries: {
          internal: ['User Management', 'Product Catalog'],
          external: ['Payment Gateway', 'Email Service'],
        },
        dataEntities: [
          {
            name: 'User',
            attributes: ['id', 'email', 'password'],
            relationships: ['has many Orders'],
          },
        ],
      };

      const result = extractionSchema.safeParse(extraction);
      expect(result.success).toBe(true);
    });
  });
});
