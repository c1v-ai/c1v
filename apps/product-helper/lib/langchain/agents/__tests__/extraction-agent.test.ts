/**
 * Extraction Agent Unit Tests
 *
 * Tests completeness scoring and merge logic.
 * Does NOT test LLM extraction (that requires integration tests).
 */

// Mock the LangChain config to avoid requiring API keys
jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn().mockReturnValue({
    invoke: jest.fn().mockResolvedValue({}),
  }),
}));

import { calculateCompleteness, mergeExtractionData } from '../extraction-agent';
import type { ExtractionResult } from '../../schemas';

describe('calculateCompleteness', () => {
  const baseExtraction: ExtractionResult = {
    actors: [],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
  };

  it('returns 0 for empty extraction', () => {
    expect(calculateCompleteness(baseExtraction)).toBe(0);
  });

  it('scores actors correctly', () => {
    const withOneActor = {
      ...baseExtraction,
      actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
    };
    expect(calculateCompleteness(withOneActor)).toBe(8); // 1 actor = 8 points

    const withTwoActors = {
      ...baseExtraction,
      actors: [
        { name: 'User', role: 'Primary', description: 'End user' },
        { name: 'Admin', role: 'Primary', description: 'Admin user' },
      ],
    };
    expect(calculateCompleteness(withTwoActors)).toBe(15); // 2+ actors = 15 points
  });

  it('scores actor depth (goals/painPoints)', () => {
    const withActorDepth = {
      ...baseExtraction,
      actors: [
        {
          name: 'User',
          role: 'Primary',
          description: 'End user',
          goals: ['Complete tasks quickly'],
          painPoints: ['Current process is slow'],
        },
      ],
    };
    // 1 actor (8) + 100% depth (5) = 13
    expect(calculateCompleteness(withActorDepth)).toBe(13);
  });

  it('scores problem statement correctly', () => {
    const withPartialPS = {
      ...baseExtraction,
      problemStatement: {
        summary: 'Users struggle with manual processes',
        context: '',
        impact: '',
        goals: [],
      },
    };
    expect(calculateCompleteness(withPartialPS)).toBe(5); // summary only = 5

    const withFullPS = {
      ...baseExtraction,
      problemStatement: {
        summary: 'Users struggle with manual processes',
        context: 'Current tools are outdated',
        impact: 'Lost productivity and revenue',
        goals: ['Reduce time', 'Improve accuracy'],
      },
    };
    expect(calculateCompleteness(withFullPS)).toBe(10); // full statement = 10
  });

  it('scores goals/metrics correctly', () => {
    const withThreeGoals = {
      ...baseExtraction,
      goalsMetrics: [
        { goal: 'Reduce time', metric: 'Minutes per task' },
        { goal: 'Improve accuracy', metric: 'Error rate' },
        { goal: 'Increase adoption', metric: 'MAU' },
      ],
    };
    expect(calculateCompleteness(withThreeGoals)).toBe(15); // 3+ goals = 15
  });

  it('scores NFRs by category diversity', () => {
    const withThreeCategories = {
      ...baseExtraction,
      nonFunctionalRequirements: [
        { category: 'performance' as const, requirement: 'Fast', priority: 'high' as const },
        { category: 'security' as const, requirement: 'Secure', priority: 'critical' as const },
        { category: 'scalability' as const, requirement: 'Scalable', priority: 'high' as const },
      ],
    };
    expect(calculateCompleteness(withThreeCategories)).toBe(10); // 3 categories = 10

    const withOneCategory = {
      ...baseExtraction,
      nonFunctionalRequirements: [
        { category: 'performance' as const, requirement: 'Fast', priority: 'high' as const },
        { category: 'performance' as const, requirement: 'Faster', priority: 'high' as const },
      ],
    };
    expect(calculateCompleteness(withOneCategory)).toBe(3); // 1 category = 3
  });

  it('calculates comprehensive score for complete extraction', () => {
    const completeExtraction: ExtractionResult = {
      actors: [
        { name: 'User', role: 'Primary', description: 'End user', goals: ['Goal 1'], painPoints: ['Pain 1'] },
        { name: 'Admin', role: 'Primary', description: 'Admin', goals: ['Goal 2'], painPoints: ['Pain 2'] },
      ],
      useCases: [
        { id: 'UC1', name: 'Login', description: 'User logs in', actor: 'User' },
        { id: 'UC2', name: 'Dashboard', description: 'View dashboard', actor: 'User' },
        { id: 'UC3', name: 'Settings', description: 'Manage settings', actor: 'Admin' },
        { id: 'UC4', name: 'Reports', description: 'View reports', actor: 'Admin' },
        { id: 'UC5', name: 'Export', description: 'Export data', actor: 'User' },
      ],
      systemBoundaries: { internal: ['Auth', 'Dashboard'], external: ['Email Service'] },
      dataEntities: [
        { name: 'User', attributes: ['id', 'email'], relationships: ['has Projects'] },
        { name: 'Project', attributes: ['id', 'name'], relationships: ['belongs to User'] },
        { name: 'Task', attributes: ['id', 'title'], relationships: ['belongs to Project'] },
      ],
      problemStatement: {
        summary: 'Teams struggle with project coordination',
        context: 'Remote work has increased',
        impact: 'Delays and miscommunication',
        goals: ['Improve coordination', 'Reduce delays'],
      },
      goalsMetrics: [
        { goal: 'Reduce coordination time', metric: 'Hours per week', target: '<2 hours' },
        { goal: 'Improve visibility', metric: 'Tasks with status', target: '100%' },
        { goal: 'Increase adoption', metric: 'DAU', target: '80% of team' },
      ],
      nonFunctionalRequirements: [
        { category: 'performance', requirement: 'Page load <3s', priority: 'high' },
        { category: 'security', requirement: 'Encrypted data', priority: 'critical' },
        { category: 'reliability', requirement: '99.9% uptime', priority: 'critical' },
      ],
    };

    // 15 (actors) + 5 (depth) + 20 (use cases) + 15 (boundaries) + 10 (entities) + 10 (PS) + 15 (goals) + 10 (NFRs) = 100
    expect(calculateCompleteness(completeExtraction)).toBe(100);
  });
});

describe('mergeExtractionData', () => {
  it('merges actors by name (newer wins)', () => {
    const existing: ExtractionResult = {
      actors: [{ name: 'User', role: 'Old Role', description: 'Old desc' }],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };
    const newData: ExtractionResult = {
      actors: [{ name: 'User', role: 'New Role', description: 'New desc' }],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };

    const merged = mergeExtractionData(existing, newData);
    expect(merged.actors).toHaveLength(1);
    expect(merged.actors[0].role).toBe('New Role');
  });

  it('preserves problem statement when new extraction is empty', () => {
    const existing: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      problemStatement: { summary: 'Existing', context: 'ctx', impact: 'imp', goals: ['g1'] },
    };
    const newData: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      // No problemStatement
    };

    const merged = mergeExtractionData(existing, newData);
    expect(merged.problemStatement?.summary).toBe('Existing');
  });

  it('replaces problem statement when new extraction has it', () => {
    const existing: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      problemStatement: { summary: 'Old', context: 'ctx', impact: 'imp', goals: ['g1'] },
    };
    const newData: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      problemStatement: { summary: 'New', context: 'ctx2', impact: 'imp2', goals: ['g2'] },
    };

    const merged = mergeExtractionData(existing, newData);
    expect(merged.problemStatement?.summary).toBe('New');
  });

  it('merges use cases by id (newer wins)', () => {
    const existing: ExtractionResult = {
      actors: [],
      useCases: [{ id: 'UC1', name: 'Old', description: 'Old desc', actor: 'User' }],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };
    const newData: ExtractionResult = {
      actors: [],
      useCases: [{ id: 'UC1', name: 'New', description: 'New desc', actor: 'User' }],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };

    const merged = mergeExtractionData(existing, newData);
    expect(merged.useCases).toHaveLength(1);
    expect(merged.useCases[0].name).toBe('New');
  });

  it('unions system boundaries without duplicates', () => {
    const existing: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: ['Auth'], external: ['Email'] },
      dataEntities: [],
    };
    const newData: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: ['Auth', 'DB'], external: ['SMS'] },
      dataEntities: [],
    };

    const merged = mergeExtractionData(existing, newData);
    expect(merged.systemBoundaries.internal).toHaveLength(2);
    expect(merged.systemBoundaries.internal).toContain('Auth');
    expect(merged.systemBoundaries.internal).toContain('DB');
    expect(merged.systemBoundaries.external).toHaveLength(2);
    expect(merged.systemBoundaries.external).toContain('Email');
    expect(merged.systemBoundaries.external).toContain('SMS');
  });

  it('preserves NFRs when new extraction is empty', () => {
    const existing: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
      nonFunctionalRequirements: [
        { category: 'security', requirement: 'Encrypted', priority: 'critical' },
      ],
    };
    const newData: ExtractionResult = {
      actors: [],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    };

    const merged = mergeExtractionData(existing, newData);
    expect(merged.nonFunctionalRequirements).toHaveLength(1);
    expect(merged.nonFunctionalRequirements![0].category).toBe('security');
  });
});
