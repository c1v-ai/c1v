import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { SynthesisResult } from '@/lib/langchain/agents/quick-start-synthesis-agent';

// Mock createClaudeAgent before importing the module under test
const mockInvoke = jest.fn();
jest.mock('@/lib/langchain/config', () => ({
  createClaudeAgent: jest.fn(() => ({
    invoke: mockInvoke,
  })),
  CLAUDE_MODELS: {
    OPUS: 'claude-opus-4-20250514',
    SONNET: 'claude-sonnet-4-20250514',
    HAIKU: 'claude-3-5-haiku-20241022',
  },
}));

import { inferProjectContext } from '../context-inference';
import { createClaudeAgent } from '@/lib/langchain/config';

// Helper: build a SynthesisResult for testing
function buildSynthesis(overrides: {
  projectName?: string;
  projectVision?: string;
  platform?: string;
  scale?: string;
  actors?: Array<{ name: string; type: string; role: string }>;
  entities?: Array<{ name: string; attributes: string[]; relationships: string[] }>;
  useCases?: Array<{ id: string; name: string; description: string; actor: string; trigger: string; outcome: string; preconditions: string[]; postconditions: string[]; priority: 'must' | 'should' | 'could' }>;
} = {}): SynthesisResult {
  return {
    userInput: 'test project',
    domainAnalysis: {
      projectName: overrides.projectName ?? 'Test Project',
      projectVision: overrides.projectVision ?? 'A test project for unit testing',
      actors: overrides.actors ?? [
        { name: 'User', type: 'human', role: 'Primary user' },
        { name: 'Admin', type: 'human', role: 'System administrator' },
        { name: 'Database', type: 'system', role: 'Data storage' },
      ],
      systemBoundaries: {
        internal: ['Core features'],
        external: ['External API'],
      },
      technicalContext: {
        platform: overrides.platform ?? 'Web application',
        scale: overrides.scale ?? 'Small team tool',
        architectureStyle: 'Monolithic web app',
      },
    },
    useCaseDerivation: {
      useCases: overrides.useCases ?? [
        {
          id: 'UC1',
          name: 'Test Use Case',
          description: 'A test use case for validation',
          actor: 'User',
          trigger: 'User action',
          outcome: 'Expected result',
          preconditions: ['User is logged in'],
          postconditions: ['Action is complete'],
          priority: 'must' as const,
        },
      ],
      features: [{ name: 'Core', description: 'Core feature', category: 'Core' }],
      assumptions: ['Standard web application'],
      dataEntities: overrides.entities ?? [
        { name: 'User', attributes: ['id', 'email', 'name'], relationships: ['has many Projects'] },
        { name: 'Project', attributes: ['id', 'name', 'status'], relationships: ['belongs to User'] },
      ],
    },
  };
}

describe('inferProjectContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('classifies a healthcare project', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: 'saas',
      market: 'b2b',
      stage: null,
      budget: null,
      industry: 'healthcare',
    });

    const synthesis = buildSynthesis({
      projectName: 'Hospital Patient Management System',
      projectVision: 'A comprehensive system for managing patient records, appointments, and clinical workflows',
      actors: [
        { name: 'Doctor', type: 'human', role: 'Primary clinician' },
        { name: 'Nurse', type: 'human', role: 'Clinical support' },
        { name: 'Patient', type: 'human', role: 'Care recipient' },
      ],
      entities: [
        { name: 'Patient', attributes: ['mrn', 'name', 'dob', 'blood_type'], relationships: ['has many Encounters'] },
        { name: 'Encounter', attributes: ['type', 'status', 'started_at'], relationships: ['belongs to Patient'] },
        { name: 'Medication', attributes: ['drug_code', 'dosage'], relationships: ['prescribed for Patient'] },
      ],
    });

    const result = await inferProjectContext(synthesis);

    expect(result.projectType).toBe('saas');
    expect(result.market).toBe('b2b');
    expect(result.industry).toBe('healthcare');
    expect(result.stage).toBeUndefined();
    expect(result.budget).toBeUndefined();

    // Verify createClaudeAgent was called with HAIKU model
    expect(createClaudeAgent).toHaveBeenCalledWith(
      expect.any(Object), // Zod schema
      'classify_project_context',
      expect.objectContaining({ model: 'HAIKU', temperature: 0.1 }),
    );
  });

  it('classifies a fintech marketplace', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: 'marketplace',
      market: 'b2b2c',
      stage: null,
      budget: null,
      industry: 'fintech',
    });

    const synthesis = buildSynthesis({
      projectName: 'Peer-to-Peer Lending Platform',
      actors: [
        { name: 'Borrower', type: 'human', role: 'Seeks loans' },
        { name: 'Lender', type: 'human', role: 'Provides capital' },
        { name: 'Payment Gateway', type: 'external', role: 'Processes payments' },
      ],
      entities: [
        { name: 'Account', attributes: ['type', 'balance', 'currency'], relationships: ['has many Transactions'] },
        { name: 'Transaction', attributes: ['amount', 'type', 'status'], relationships: ['creates LedgerEntries'] },
        { name: 'LedgerEntry', attributes: ['amount', 'direction'], relationships: ['belongs to Transaction'] },
      ],
    });

    const result = await inferProjectContext(synthesis);

    expect(result.projectType).toBe('marketplace');
    expect(result.market).toBe('b2b2c');
    expect(result.industry).toBe('fintech');
  });

  it('converts null values to undefined (Partial<KBProjectContext> semantics)', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: 'saas',
      market: null,
      stage: null,
      budget: null,
      industry: null,
    });

    const synthesis = buildSynthesis();
    const result = await inferProjectContext(synthesis);

    expect(result.projectType).toBe('saas');
    expect(result).not.toHaveProperty('market');
    expect(result).not.toHaveProperty('stage');
    expect(result).not.toHaveProperty('budget');
    expect(result).not.toHaveProperty('industry');
  });

  it('returns all fields when fully classified', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: 'e-commerce',
      market: 'b2c',
      stage: 'mvp',
      budget: 'seed',
      industry: 'general',
    });

    const synthesis = buildSynthesis();
    const result = await inferProjectContext(synthesis);

    expect(result.projectType).toBe('e-commerce');
    expect(result.market).toBe('b2c');
    expect(result.stage).toBe('mvp');
    expect(result.budget).toBe('seed');
    expect(result.industry).toBe('general');
  });

  it('returns empty object when all fields are null', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: null,
      market: null,
      stage: null,
      budget: null,
      industry: null,
    });

    const synthesis = buildSynthesis();
    const result = await inferProjectContext(synthesis);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns empty object on LLM error (safe fallback)', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('LLM timeout'));

    const synthesis = buildSynthesis();
    const result = await inferProjectContext(synthesis);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns empty object on network error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('fetch failed'));

    const synthesis = buildSynthesis();
    const result = await inferProjectContext(synthesis);

    expect(result).toEqual({});
  });

  it('formats actors in prompt correctly', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: null,
      market: null,
      stage: null,
      budget: null,
      industry: null,
    });

    const synthesis = buildSynthesis({
      actors: [
        { name: 'Doctor', type: 'human', role: 'Primary clinician' },
        { name: 'EHR System', type: 'system', role: 'Electronic health records' },
      ],
    });

    await inferProjectContext(synthesis);

    // Verify invoke was called with prompt containing formatted actors
    const promptArg = mockInvoke.mock.calls[0][0] as string;
    expect(promptArg).toContain('- Doctor (human): Primary clinician');
    expect(promptArg).toContain('- EHR System (system): Electronic health records');
  });

  it('formats entities in prompt correctly', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: null,
      market: null,
      stage: null,
      budget: null,
      industry: null,
    });

    const synthesis = buildSynthesis({
      entities: [
        { name: 'Patient', attributes: ['mrn', 'name', 'dob', 'blood_type', 'email', 'phone'], relationships: [] },
      ],
    });

    await inferProjectContext(synthesis);

    const promptArg = mockInvoke.mock.calls[0][0] as string;
    // Should only include first 5 attributes
    expect(promptArg).toContain('- Patient: mrn, name, dob, blood_type, email');
    expect(promptArg).not.toContain('phone');
  });

  it('truncates use cases to first 8', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: null,
      market: null,
      stage: null,
      budget: null,
      industry: null,
    });

    const useCases = Array.from({ length: 12 }, (_, i) => ({
      id: `UC${i + 1}`,
      name: `Use Case ${i + 1}`,
      description: `Description for use case ${i + 1}`,
      actor: 'User',
      trigger: 'Action',
      outcome: 'Result',
      preconditions: [] as string[],
      postconditions: [] as string[],
      priority: 'must' as const,
    }));

    const synthesis = buildSynthesis({ useCases });
    await inferProjectContext(synthesis);

    const promptArg = mockInvoke.mock.calls[0][0] as string;
    expect(promptArg).toContain('Use Case 8');
    expect(promptArg).not.toContain('Use Case 9');
  });

  it('includes project metadata in prompt', async () => {
    mockInvoke.mockResolvedValueOnce({
      projectType: null,
      market: null,
      stage: null,
      budget: null,
      industry: null,
    });

    const synthesis = buildSynthesis({
      projectName: 'HealthTracker Pro',
      projectVision: 'A comprehensive health monitoring platform',
      platform: 'Mobile app',
      scale: 'Consumer marketplace',
    });

    await inferProjectContext(synthesis);

    const promptArg = mockInvoke.mock.calls[0][0] as string;
    expect(promptArg).toContain('HealthTracker Pro');
    expect(promptArg).toContain('A comprehensive health monitoring platform');
    expect(promptArg).toContain('Mobile app');
    expect(promptArg).toContain('Consumer marketplace');
  });
});
