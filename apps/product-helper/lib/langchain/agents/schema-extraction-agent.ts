/**
 * Database Schema Extraction Agent (Phase 9.2)
 *
 * Purpose: Convert dataEntities from PRD extraction into full DatabaseSchemaModel.
 * Pattern: Structured output with Zod schema validation.
 *
 * Uses Claude Sonnet via central config for deterministic extraction.
 * Analyzes data entities and their relationships to produce:
 * - Database entities with typed fields
 * - Foreign key relationships with proper referential actions
 * - Indexes for common query patterns
 * - PostgreSQL enums for status/type fields
 */

import { createClaudeAgent } from '../config';
import { z } from 'zod';
import type {
  DatabaseSchemaModel,
  DatabaseEntity,
  DatabaseEnum,
  DatabaseFieldType,
} from '../../db/schema/v2-types';
import { getSchemaKnowledge } from '../../education/generator-kb';
import type { KBProjectContext } from '../../education/reference-data/types';

// ============================================================
// Zod Schemas for LLM Structured Output
// ============================================================

const databaseFieldSchema = z.object({
  name: z.string().describe('Snake_case field name (e.g., "user_id", "created_at")'),
  type: z.string().describe('PostgreSQL data type (e.g., "uuid", "text", "timestamp", "integer", "boolean", "jsonb")'),
  nullable: z.boolean().describe('Whether the field can be NULL'),
  defaultValue: z.string().optional().describe('Default value expression (e.g., "gen_random_uuid()", "now()", "false")'),
  constraints: z.array(z.string()).describe('Field constraints (e.g., "PRIMARY KEY", "UNIQUE", "NOT NULL", "REFERENCES")'),
  description: z.string().optional().describe('Brief description of the field purpose'),
});

const databaseRelationshipSchema = z.object({
  name: z.string().optional().describe('Optional relationship name for documentation'),
  type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']).describe('Cardinality of the relationship'),
  targetEntity: z.string().describe('Name of the related entity (e.g., "User", "Order")'),
  foreignKey: z.string().describe('Field name that holds the foreign key (e.g., "user_id")'),
  targetKey: z.string().optional().describe('Target entity key field (defaults to "id")'),
  onDelete: z.enum(['CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT', 'NO ACTION']).optional().describe('Action on parent delete'),
  onUpdate: z.enum(['CASCADE', 'SET NULL', 'SET DEFAULT', 'RESTRICT', 'NO ACTION']).optional().describe('Action on parent update'),
  description: z.string().optional().describe('Description of the relationship'),
});

const databaseIndexSchema = z.object({
  name: z.string().describe('Index name (e.g., "idx_users_email")'),
  columns: z.array(z.string()).describe('Columns included in the index'),
  unique: z.boolean().optional().describe('Whether this is a unique index'),
  type: z.enum(['btree', 'hash', 'gin', 'gist', 'brin']).optional().describe('Index type (default: btree)'),
  where: z.string().optional().describe('Partial index condition'),
});

const databaseEntitySchema = z.object({
  name: z.string().describe('PascalCase entity name (e.g., "User", "OrderItem")'),
  description: z.string().describe('Brief description of what this entity represents'),
  tableName: z.string().optional().describe('Snake_case table name (defaults from name)'),
  fields: z.array(databaseFieldSchema).describe('All fields/columns for this entity'),
  relationships: z.array(databaseRelationshipSchema).describe('Relationships to other entities'),
  indexes: z.array(databaseIndexSchema).describe('Indexes for this table'),
  constraints: z.array(z.string()).optional().describe('Table-level constraints (composite keys, checks)'),
});

const databaseEnumSchema = z.object({
  name: z.string().describe('Enum type name (e.g., "user_status", "order_status")'),
  values: z.array(z.string()).describe('Enum values (e.g., ["active", "inactive", "suspended"])'),
  description: z.string().optional().describe('Description of what this enum represents'),
});

const databaseSchemaSchema = z.object({
  entities: z.array(databaseEntitySchema).describe('All database entities/tables'),
  enums: z.array(databaseEnumSchema).optional().describe('PostgreSQL enum types'),
});

// ============================================================
// Type Inference Utilities
// ============================================================

const FIELD_TYPE_PATTERNS: Array<{ pattern: RegExp; type: DatabaseFieldType }> = [
  { pattern: /^id$/i, type: 'uuid' },
  { pattern: /_id$/i, type: 'uuid' },
  { pattern: /uuid/i, type: 'uuid' },
  { pattern: /created_at/i, type: 'timestamptz' },
  { pattern: /updated_at/i, type: 'timestamptz' },
  { pattern: /deleted_at/i, type: 'timestamptz' },
  { pattern: /_at$/i, type: 'timestamptz' },
  { pattern: /^is_/i, type: 'boolean' },
  { pattern: /^has_/i, type: 'boolean' },
  { pattern: /count$/i, type: 'integer' },
  { pattern: /amount/i, type: 'decimal' },
  { pattern: /price/i, type: 'decimal' },
  { pattern: /metadata/i, type: 'jsonb' },
  { pattern: /settings/i, type: 'jsonb' },
  { pattern: /email/i, type: 'text' },
  { pattern: /name$/i, type: 'text' },
  { pattern: /description/i, type: 'text' },
  { pattern: /status$/i, type: 'enum' },
  { pattern: /type$/i, type: 'enum' },
  { pattern: /role$/i, type: 'enum' },
];

export function inferFieldType(attributeName: string): DatabaseFieldType {
  const normalized = attributeName.toLowerCase().replace(/\s+/g, '_');
  for (const { pattern, type } of FIELD_TYPE_PATTERNS) {
    if (pattern.test(normalized)) {
      return type;
    }
  }
  return 'text';
}

// ============================================================
// Schema Extraction Context
// ============================================================

export interface SchemaExtractionContext {
  projectName: string;
  projectVision: string;
  dataEntities: Array<{
    name: string;
    attributes: string[];
    relationships: string[];
  }>;
  useCases?: Array<{
    name: string;
    description: string;
  }>;
  projectContext?: Partial<KBProjectContext>;
}

// ============================================================
// Main Extraction Function
// ============================================================

export async function extractDatabaseSchema(
  context: SchemaExtractionContext
): Promise<DatabaseSchemaModel> {
  const structuredModel = createClaudeAgent(databaseSchemaSchema, 'extract_database_schema', {
    temperature: 0.2,
    maxTokens: 8000, // Schema generation needs more output tokens
  });

  const dataEntitiesText = context.dataEntities
    .map((entity, idx) => {
      const attrs = entity.attributes.length > 0
        ? `Attributes: ${entity.attributes.join(', ')}`
        : 'Attributes: (none specified)';
      const rels = entity.relationships.length > 0
        ? `Relationships: ${entity.relationships.join('; ')}`
        : 'Relationships: (none specified)';
      return `${idx + 1}. ${entity.name}\n   ${attrs}\n   ${rels}`;
    })
    .join('\n\n');

  const useCasesText = context.useCases
    ? context.useCases
        .map((uc, idx) => `${idx + 1}. ${uc.name}: ${uc.description}`)
        .join('\n')
    : '(No use cases provided)';

  // Keep vision concise to avoid overwhelming the model
  const visionText = context.projectVision.length > 1500
    ? context.projectVision.slice(0, 1500) + '...'
    : context.projectVision;

  const prompt = `You are a database architect converting PRD data entities into a complete PostgreSQL database schema.

${getSchemaKnowledge(context.projectContext)}

## Project Context
Project Name: ${context.projectName}
Vision: ${visionText}

## Data Entities from PRD
${dataEntitiesText}

## Use Cases (for additional context)
${useCasesText}

## Instructions

Use the Knowledge Bank above as your primary reference for PostgreSQL 18 best practices, field types, constraints, and patterns.

Convert EACH data entity above into a database table with proper fields and relationships.
You MUST generate at least one entity in the "entities" array for every data entity listed above.

### Field Naming and Types
- Use snake_case for all field and table names
- Use PascalCase for entity names
- Use the Knowledge Bank field type rules to infer PostgreSQL types from attribute names

### Standard Fields (add to EVERY entity)
- id: uuid PRIMARY KEY DEFAULT uuidv7() (PostgreSQL 18 native)
- created_at: timestamptz NOT NULL DEFAULT now()
- updated_at: timestamptz NOT NULL DEFAULT now()

### Relationships
- Parse relationship strings to determine cardinality and foreign keys
- Use Knowledge Bank relationship patterns (CASCADE for children, SET NULL for optional, RESTRICT to prevent orphans)

### Indexes
- Index ALL foreign keys (PostgreSQL does NOT auto-index FKs)
- Add indexes for commonly queried fields (status, type, email)
- Use partial indexes for filtered queries (e.g., WHERE status = 'active')
- Add unique indexes for unique fields (email, username, slug)

### Enums
- Create PostgreSQL enums for status/type fields

### Domain Patterns
- Match the project type to Knowledge Bank domain entity patterns for completeness
- For B2B SaaS: include organization_id for multi-tenancy
- For AI products: include vector embedding fields where appropriate

Generate the complete database schema now. Remember: the "entities" array is REQUIRED and must contain one entity per data entity above.`;

  // Attempt 1
  try {
    const result = await structuredModel.invoke(prompt);
    if (result.entities && (result.entities as DatabaseEntity[]).length > 0) {
      return {
        entities: result.entities as DatabaseEntity[],
        enums: (result.enums as DatabaseEnum[]) || [],
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      };
    }
    console.warn('[Schema] First attempt returned empty entities, retrying...');
  } catch (error) {
    console.warn('[Schema] First attempt failed, retrying...', (error as Error).message?.slice(0, 100));
  }

  // Attempt 2: Shorter, more focused prompt
  try {
    const retryPrompt = `Generate a PostgreSQL database schema for these entities. Return them in the "entities" array.

Project: ${context.projectName}

Entities to convert:
${context.dataEntities.map(e => `- ${e.name} (fields: ${e.attributes.join(', ')})`).join('\n')}

For each entity, include: name (PascalCase), description, fields array (with name in snake_case, type as PostgreSQL type, nullable, description), indexes array, and relationships array.
Add id (uuid), created_at, updated_at to every entity.`;

    const result = await structuredModel.invoke(retryPrompt);
    if (result.entities && (result.entities as DatabaseEntity[]).length > 0) {
      return {
        entities: result.entities as DatabaseEntity[],
        enums: (result.enums as DatabaseEnum[]) || [],
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Schema extraction error (retry):', error);
  }

  // Fallback: construct minimal schema from input entities
  console.warn('[Schema] Both attempts failed, constructing from input entities');
  const fallbackEntities: DatabaseEntity[] = context.dataEntities.map(e => ({
    name: e.name.replace(/\s+/g, ''),
    description: `${e.name} entity`,
    fields: [
      { name: 'id', type: 'uuid' as DatabaseFieldType, nullable: false, constraints: ['PRIMARY KEY' as const, 'NOT NULL' as const], description: 'Primary key' },
      ...e.attributes.map(attr => ({
        name: attr.replace(/\s+/g, '_').toLowerCase(),
        type: inferPostgresType(attr) as DatabaseFieldType,
        nullable: true,
        constraints: [],
        description: attr,
      })),
      { name: 'created_at', type: 'timestamptz' as DatabaseFieldType, nullable: false, constraints: ['NOT NULL' as const], description: 'Creation timestamp' },
      { name: 'updated_at', type: 'timestamptz' as DatabaseFieldType, nullable: false, constraints: ['NOT NULL' as const], description: 'Last update timestamp' },
    ],
    indexes: [],
    relationships: e.relationships.map(r => ({
      type: 'many-to-many' as const,
      targetEntity: r,
      foreignKey: `${r.toLowerCase().replace(/\s+/g, '_')}_id`,
      description: `References ${r}`,
    })),
  }));

  return {
    entities: fallbackEntities,
    enums: [],
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Infer PostgreSQL type from attribute name heuristics
 */
function inferPostgresType(attr: string): string {
  const lower = attr.toLowerCase().replace(/\s+/g, '_');
  if (lower.includes('id') && !lower.includes('video')) return 'uuid';
  if (lower.includes('email')) return 'text';
  if (lower.includes('name') || lower.includes('title') || lower.includes('description')) return 'text';
  if (lower.includes('url') || lower.includes('path') || lower.includes('link')) return 'text';
  if (lower.includes('date') || lower.includes('_at') || lower.includes('time') || lower.includes('timestamp')) return 'timestamptz';
  if (lower.includes('count') || lower.includes('quantity') || lower.includes('number') || lower.includes('age')) return 'integer';
  if (lower.includes('price') || lower.includes('amount') || lower.includes('cost') || lower.includes('rate')) return 'numeric';
  if (lower.includes('is_') || lower.includes('has_') || lower.includes('active') || lower.includes('enabled')) return 'boolean';
  if (lower.includes('status') || lower.includes('type') || lower.includes('role') || lower.includes('level')) return 'text';
  if (lower.includes('data') || lower.includes('config') || lower.includes('metadata') || lower.includes('preferences')) return 'jsonb';
  return 'text';
}

// ============================================================
// Utility Functions
// ============================================================

export function mergeSchemaData(
  existing: DatabaseSchemaModel,
  newSchema: DatabaseSchemaModel
): DatabaseSchemaModel {
  const entityMap = new Map(existing.entities.map(e => [e.name, e]));
  newSchema.entities.forEach(entity => {
    entityMap.set(entity.name, entity);
  });

  const enumMap = new Map((existing.enums || []).map(e => [e.name, e]));
  (newSchema.enums || []).forEach(newEnum => {
    const existingEnum = enumMap.get(newEnum.name);
    if (existingEnum) {
      const mergedValues = Array.from(new Set([...existingEnum.values, ...newEnum.values]));
      enumMap.set(newEnum.name, { ...newEnum, values: mergedValues });
    } else {
      enumMap.set(newEnum.name, newEnum);
    }
  });

  return {
    entities: Array.from(entityMap.values()),
    enums: Array.from(enumMap.values()),
    version: newSchema.version || existing.version,
    generatedAt: new Date().toISOString(),
  };
}

export function getSchemaSummary(schema: DatabaseSchemaModel): string {
  const entitySummary = schema.entities
    .map(e => `  - ${e.name} (${e.fields.length} fields, ${e.relationships.length} relationships)`)
    .join('\n');

  const enumSummary = (schema.enums || [])
    .map(e => `  - ${e.name}: [${e.values.join(', ')}]`)
    .join('\n');

  return [
    `Database Schema Summary`,
    `Entities (${schema.entities.length}):`,
    entitySummary || '  (none)',
    `Enums (${(schema.enums || []).length}):`,
    enumSummary || '  (none)',
    `Generated: ${schema.generatedAt}`,
  ].join('\n');
}

export function validateSchemaStructure(schema: DatabaseSchemaModel): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema.entities || schema.entities.length === 0) {
    errors.push('Schema must have at least one entity');
  }

  schema.entities.forEach(entity => {
    if (!entity.name) {
      errors.push('Entity missing name');
    }
    if (!entity.fields || entity.fields.length === 0) {
      errors.push(`Entity "${entity.name}" has no fields`);
    }

    const fieldNames = entity.fields.map(f => f.name);
    if (!fieldNames.includes('id')) {
      errors.push(`Entity "${entity.name}" missing "id" field`);
    }
    if (!fieldNames.includes('created_at')) {
      errors.push(`Entity "${entity.name}" missing "created_at" field`);
    }

    entity.relationships.forEach(rel => {
      if (!fieldNames.includes(rel.foreignKey)) {
        errors.push(`Entity "${entity.name}" missing foreign key field "${rel.foreignKey}"`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

export { databaseSchemaSchema };
