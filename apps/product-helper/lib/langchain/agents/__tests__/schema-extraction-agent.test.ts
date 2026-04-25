/**
 * Schema Extraction Agent — prompt-builder tests.
 *
 * Covers both paths per Phase N critique §5:
 *  - Undefined: `interfacePayloads` / `subsystems` absent → no System Interfaces
 *    section, no Steps-3-6 entity-discovery instructions, pre-Phase-N prompt
 *    shape preserved.
 *  - Populated: payloads + subsystems supplied → section appears, discovery
 *    instructions fire, and an audit-category interface specifically triggers
 *    the append-only AuditEvent guidance.
 *
 * @module lib/langchain/agents/__tests__/schema-extraction-agent.test.ts
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../config', () => ({
  createClaudeAgent: jest.fn(),
}));

import {
  buildSchemaExtractionPromptText,
  databaseSchemaSchema,
  extractDatabaseSchema,
  formatInterfacePayloadsSection,
  inferCardinalityFromString,
  type SchemaExtractionContext,
} from '../schema-extraction-agent';
import { createClaudeAgent } from '../../config';

const mockedCreate = createClaudeAgent as jest.MockedFunction<typeof createClaudeAgent>;

function baseContext(): SchemaExtractionContext {
  return {
    projectName: 'Heat Guard',
    projectVision: 'Predictive heat-safety platform for field workers',
    dataEntities: [{ name: 'Worker', attributes: ['id', 'name'], relationships: [] }],
    useCases: [{ name: 'Predict strain', description: 'Real-time scoring' }],
  };
}

describe('buildSchemaExtractionPromptText — graceful degradation', () => {
  it('omits System Interfaces section when no payloads/subsystems supplied', () => {
    const prompt = buildSchemaExtractionPromptText(baseContext());
    expect(prompt).not.toContain('## System Interfaces & Subsystems (Step 6)');
  });

  it('omits Steps-3-6 Entity Discovery instructions when no payloads supplied', () => {
    const prompt = buildSchemaExtractionPromptText(baseContext());
    expect(prompt).not.toContain('Steps 3-6 Entity Discovery');
    expect(prompt).not.toContain('At least one interface is tagged `category: audit`');
    expect(prompt).not.toContain('## System Interfaces & Subsystems');
  });
});

describe('buildSchemaExtractionPromptText — populated Steps 3-6', () => {
  it('injects section + discovery instructions when interfaces supplied', () => {
    const ctx: SchemaExtractionContext = {
      ...baseContext(),
      interfacePayloads: [
        {
          id: 'IF-01',
          name: 'Submit Reading',
          source: 'SS1',
          destination: 'SS2',
          dataPayload: 'worker_id, core_temp, hr',
          category: 'critical',
        },
        {
          id: 'IF-02',
          name: 'Audit Log Write',
          source: 'SS2',
          destination: 'SS3',
          dataPayload: 'event, actor_id, timestamp',
          category: 'audit',
        },
      ],
      subsystems: [
        { id: 'SS1', name: 'Worker App', description: 'Mobile client' },
        { id: 'SS3', name: 'Audit Store', description: 'Append-only log' },
      ],
    };
    const prompt = buildSchemaExtractionPromptText(ctx);

    expect(prompt).toContain('## System Interfaces & Subsystems (Step 6)');
    expect(prompt).toContain('**Subsystems** (may imply supporting tables):');
    expect(prompt).toContain('**SS1: Worker App** — Mobile client');
    expect(prompt).toContain('**SS3: Audit Store** — Append-only log');
    expect(prompt).toContain('**Interface payloads:**');
    expect(prompt).toContain(
      '- **IF-01**: SS1 → SS2 [critical] — payload: worker_id, core_temp, hr',
    );
    expect(prompt).toContain('- **IF-02**: SS2 → SS3 [audit] — payload: event, actor_id, timestamp');

    expect(prompt).toContain('### Steps 3-6 Entity Discovery (from System Interfaces)');
    expect(prompt).toContain(
      'If a payload mentions a noun that is NOT already listed in Data Entities above, create a supporting entity',
    );
    // Audit guidance fires because one interface has category='audit'
    expect(prompt).toContain('At least one interface is tagged `category: audit`');
    expect(prompt).toContain('no `updated_at`');
    expect(prompt).toContain('index on (actor_id, created_at)');
  });

  it('does not emit audit guidance when no audit-category interface exists', () => {
    const ctx: SchemaExtractionContext = {
      ...baseContext(),
      interfacePayloads: [
        {
          id: 'IF-01',
          name: 'Plain',
          source: 'A',
          destination: 'B',
          dataPayload: 'data',
          category: 'system-flow',
        },
      ],
    };
    const prompt = buildSchemaExtractionPromptText(ctx);
    expect(prompt).toContain('### Steps 3-6 Entity Discovery');
    expect(prompt).not.toContain('category: audit');
  });

  it('renders payloads alone when no subsystems supplied', () => {
    const ctx: SchemaExtractionContext = {
      ...baseContext(),
      interfacePayloads: [
        { id: 'IF-01', name: 'X', source: 'A', destination: 'B', dataPayload: 'x' },
      ],
    };
    const prompt = buildSchemaExtractionPromptText(ctx);
    expect(prompt).toContain('## System Interfaces & Subsystems (Step 6)');
    expect(prompt).not.toContain('**Subsystems** (may imply supporting tables):');
    expect(prompt).toContain('**Interface payloads:**');
  });

  it('injects section between Use Cases and Instructions, not elsewhere', () => {
    const ctx: SchemaExtractionContext = {
      ...baseContext(),
      interfacePayloads: [
        { id: 'IF-01', name: 'X', source: 'A', destination: 'B', dataPayload: 'x' },
      ],
    };
    const prompt = buildSchemaExtractionPromptText(ctx);
    const useCasesIdx = prompt.indexOf('## Use Cases (for additional context)');
    const interfacesIdx = prompt.indexOf('## System Interfaces & Subsystems');
    const instructionsIdx = prompt.indexOf('## Instructions');
    expect(useCasesIdx).toBeGreaterThan(-1);
    expect(interfacesIdx).toBeGreaterThan(useCasesIdx);
    expect(instructionsIdx).toBeGreaterThan(interfacesIdx);
  });
});

describe('schema format helper — isolated', () => {
  it('formatInterfacePayloadsSection empty when both inputs absent/empty', () => {
    expect(formatInterfacePayloadsSection(undefined, undefined)).toBe('');
    expect(formatInterfacePayloadsSection([], [])).toBe('');
  });

  it('renders interface with no category cleanly (no [] bracket)', () => {
    const out = formatInterfacePayloadsSection(
      [{ id: 'IF-01', name: 'Plain', source: 'A', destination: 'B', dataPayload: 'x' }],
      undefined,
    );
    expect(out).toContain('- **IF-01**: A → B — payload: x');
    expect(out).not.toContain('[undefined]');
  });
});

describe('extractDatabaseSchema — runtime', () => {
  beforeEach(() => {
    mockedCreate.mockReset();
  });

  it('normalizes many-to-one to one-to-many via Zod transform', async () => {
    const llmEntities = {
      entities: [
        {
          name: 'Worker',
          description: 'A field worker',
          fields: [
            {
              name: 'id',
              type: 'uuid',
              nullable: false,
              constraints: ['PRIMARY KEY'],
              description: 'PK',
            },
          ],
          relationships: [
            {
              type: 'many-to-one',
              targetEntity: 'Organization',
              foreignKey: 'organization_id',
              description: 'belongs to Organization',
            },
          ],
          indexes: [],
        },
      ],
      enums: [],
    };
    // Simulate LangChain `withStructuredOutput` — invoke returns the
    // Zod-parsed (post-transform) shape. The transform on
    // databaseRelationshipSchema.type rewrites many-to-one → one-to-many.
    mockedCreate.mockReturnValue({
      invoke: jest
        .fn<() => Promise<unknown>>()
        .mockResolvedValue(databaseSchemaSchema.parse(llmEntities)),
    } as never);

    const ctx: SchemaExtractionContext = {
      ...baseContext(),
      dataEntities: [
        { name: 'Worker', attributes: ['id'], relationships: ['belongs_to Organization'] },
      ],
    };
    const result = await extractDatabaseSchema(ctx);
    expect(result.entities[0].relationships[0].type).toBe('one-to-many');

    // Direct schema-level assertion: the transform fires on parse.
    const parsed = databaseSchemaSchema.parse(llmEntities);
    expect(parsed.entities[0].relationships[0].type).toBe('one-to-many');
  });

  it('falls back to inferCardinalityFromString when both LLM attempts fail', async () => {
    mockedCreate.mockReturnValue({
      invoke: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
    } as never);

    const ctx: SchemaExtractionContext = {
      ...baseContext(),
      dataEntities: [
        {
          name: 'Worker',
          attributes: ['name'],
          relationships: ['belongs_to Organization'],
        },
      ],
    };
    const result = await extractDatabaseSchema(ctx);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].relationships[0].type).toBe('one-to-many');
    expect(result.entities[0].relationships[0].targetEntity).toBe('belongs_to Organization');
  });

  it('inferCardinalityFromString covers junction, has_one, and default branches', () => {
    expect(inferCardinalityFromString('junction Worker-Organization')).toBe('many-to-many');
    expect(inferCardinalityFromString('many-to-many Tag')).toBe('many-to-many');
    expect(inferCardinalityFromString('m2m Tag')).toBe('many-to-many');
    expect(inferCardinalityFromString('pivot table')).toBe('many-to-many');
    expect(inferCardinalityFromString('has_one Profile')).toBe('one-to-one');
    expect(inferCardinalityFromString('one-to-one Profile')).toBe('one-to-one');
    expect(inferCardinalityFromString('1:1 Profile')).toBe('one-to-one');
    expect(inferCardinalityFromString('belongs_to Organization')).toBe('one-to-many');
    expect(inferCardinalityFromString('assigned_to Supervisor')).toBe('one-to-many');
    expect(inferCardinalityFromString('has_many Workers')).toBe('one-to-many');
    expect(inferCardinalityFromString('references Foo')).toBe('one-to-many');
  });
});
