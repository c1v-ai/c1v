/**
 * Database Schema Extraction Agent (Phase 9.2)
 *
 * Purpose: Convert dataEntities from PRD extraction into full DatabaseSchemaModel.
 * Pattern: Structured output with Zod schema validation.
 *
 * This agent uses GPT-4o with temperature=0 for deterministic extraction.
 * It analyzes data entities and their relationships to produce:
 * - Database entities with typed fields
 * - Foreign key relationships with proper referential actions
 * - Indexes for common query patterns
 * - PostgreSQL enums for status/type fields
 */

import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import type {
  DatabaseSchemaModel,
  DatabaseEntity,
  DatabaseEnum,
  DatabaseFieldType,
} from '../../db/schema/v2-types';

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
}

// ============================================================
// Main Extraction Function
// ============================================================

export async function extractDatabaseSchema(
  context: SchemaExtractionContext
): Promise<DatabaseSchemaModel> {
  try {
    const model = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });

    const structuredModel = model.withStructuredOutput(databaseSchemaSchema, {
      name: 'extract_database_schema',
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

    const prompt = `You are a database architect converting PRD data entities into a complete PostgreSQL database schema.

## Project Context
Project Name: ${context.projectName}
Vision: ${context.projectVision}

## Data Entities from PRD
${dataEntitiesText}

## Use Cases (for additional context)
${useCasesText}

## Instructions

Convert the data entities into a complete PostgreSQL database schema:

### Field Naming and Types
- Use snake_case for all field and table names
- Use PascalCase for entity names
- Infer appropriate PostgreSQL types from attribute names

### Standard Fields (add to EVERY entity)
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- created_at: timestamptz NOT NULL DEFAULT now()
- updated_at: timestamptz NOT NULL DEFAULT now()

### Relationships
- Parse relationship strings to determine cardinality and foreign keys
- Set appropriate onDelete action (CASCADE for child tables)

### Indexes
- Add indexes for foreign keys and commonly queried fields
- Add unique indexes for unique fields (email, username)

### Enums
- Create PostgreSQL enums for status/type fields

Generate the complete database schema now.`;

    const result = await structuredModel.invoke(prompt);

    return {
      entities: result.entities as DatabaseEntity[],
      enums: (result.enums as DatabaseEnum[]) || [],
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Schema extraction error:', error);
    return {
      entities: [],
      enums: [],
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
    };
  }
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
