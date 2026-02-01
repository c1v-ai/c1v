/**
 * get_database_schema MCP Tool
 *
 * Returns the database schema model including entities, fields, types, and relationships.
 * Queries project_data.database_schema or falls back to data_entities.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { DatabaseSchemaModel, DatabaseEntity } from '@/lib/db/schema/v2-types';
import type { DataEntity } from '@/lib/langchain/schemas';

interface GetDatabaseSchemaArgs {
  format?: 'full' | 'summary' | 'drizzle';
  entity?: string;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_database_schema',
  description:
    'Get the database schema for the current project. ' +
    'Returns entities with their fields, types, and relationships. ' +
    'Use this when implementing data models, writing queries, or understanding data structure.',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['full', 'summary', 'drizzle'],
        description:
          'Output format. Options: ' +
          'full (default, complete schema with all details), ' +
          'summary (entity names and field counts), ' +
          'drizzle (Drizzle ORM compatible format)',
      },
      entity: {
        type: 'string',
        description:
          'Optional: specific entity name to retrieve. If provided, returns only that entity.',
      },
    },
  },
};

/**
 * Convert legacy DataEntity to simplified format
 */
function convertLegacyEntity(entity: DataEntity): object {
  return {
    name: entity.name,
    tableName: entity.name.toLowerCase().replace(/\s+/g, '_'),
    fields: entity.attributes.map((attr) => ({
      name: attr,
      type: 'text', // Default type for legacy data
      nullable: true,
    })),
    relationships: entity.relationships.map((rel) => ({
      description: rel,
      type: 'unknown',
    })),
  };
}

/**
 * Generate Drizzle-compatible schema hints
 */
function toDrizzleFormat(schema: DatabaseSchemaModel): object {
  return {
    entities: schema.entities.map((entity) => ({
      tableName: entity.tableName || entity.name.toLowerCase().replace(/\s+/g, '_'),
      columns: entity.fields.map((field) => ({
        name: field.name,
        drizzleType: mapToDrizzleType(field.type),
        nullable: field.nullable,
        constraints: field.constraints,
        defaultValue: field.defaultValue,
      })),
      relations: entity.relationships.map((rel) => ({
        name: rel.name || rel.targetEntity,
        type: rel.type,
        target: rel.targetEntity,
        foreignKey: rel.foreignKey,
        onDelete: rel.onDelete,
      })),
      indexes: entity.indexes,
    })),
    enums: schema.enums || [],
  };
}

/**
 * Map database types to Drizzle ORM types
 */
function mapToDrizzleType(dbType: string): string {
  const typeMap: Record<string, string> = {
    uuid: 'uuid',
    serial: 'serial',
    bigserial: 'bigserial',
    text: 'text',
    varchar: 'varchar',
    char: 'char',
    integer: 'integer',
    bigint: 'bigint',
    smallint: 'smallint',
    decimal: 'numeric',
    numeric: 'numeric',
    real: 'real',
    'double precision': 'doublePrecision',
    boolean: 'boolean',
    timestamp: 'timestamp',
    timestamptz: 'timestamp',
    date: 'date',
    time: 'time',
    timetz: 'time',
    interval: 'interval',
    jsonb: 'jsonb',
    json: 'json',
    bytea: 'bytea',
    array: 'array',
    enum: 'enum',
  };

  return typeMap[dbType.toLowerCase()] || 'text';
}

const handler: ToolHandler<GetDatabaseSchemaArgs> = async (args, context) => {
  const format = args.format || 'full';
  const entityFilter = args.entity?.toLowerCase();

  // Fetch project data
  const data = await db.query.projectData.findFirst({
    where: eq(projectData.projectId, context.projectId),
  });

  if (!data) {
    return createTextResult(`No project data found for project ID ${context.projectId}`, true);
  }

  // Prefer v2 database schema, fall back to legacy data entities
  const databaseSchema = data.databaseSchema as DatabaseSchemaModel | null;
  const dataEntities = data.dataEntities as DataEntity[] | null;

  if (!databaseSchema && (!dataEntities || dataEntities.length === 0)) {
    return createTextResult(
      'No database schema defined for this project. ' +
        'The PRD may need more details about data entities.',
      true
    );
  }

  // Use v2 schema if available
  if (databaseSchema) {
    let entities = databaseSchema.entities;

    // Filter by entity name if specified
    if (entityFilter) {
      entities = entities.filter(
        (e) =>
          e.name.toLowerCase() === entityFilter ||
          e.tableName?.toLowerCase() === entityFilter
      );

      if (entities.length === 0) {
        return createTextResult(
          `Entity "${args.entity}" not found. Available entities: ${databaseSchema.entities.map((e) => e.name).join(', ')}`,
          true
        );
      }
    }

    switch (format) {
      case 'summary': {
        const summary = entities.map((e) => ({
          name: e.name,
          tableName: e.tableName,
          fieldCount: e.fields.length,
          relationshipCount: e.relationships.length,
          indexCount: e.indexes.length,
          fields: e.fields.map((f) => f.name),
        }));
        return createJsonResult({
          entityCount: summary.length,
          entities: summary,
          enums: databaseSchema.enums?.map((en) => ({
            name: en.name,
            valueCount: en.values.length,
          })),
        });
      }

      case 'drizzle': {
        const drizzleSchema = toDrizzleFormat({
          ...databaseSchema,
          entities,
        });
        return createJsonResult(drizzleSchema);
      }

      case 'full':
      default: {
        return createJsonResult({
          version: databaseSchema.version,
          generatedAt: databaseSchema.generatedAt,
          entityCount: entities.length,
          entities,
          enums: databaseSchema.enums,
        });
      }
    }
  }

  // Fall back to legacy data entities
  let legacyEntities = dataEntities || [];

  if (entityFilter) {
    legacyEntities = legacyEntities.filter(
      (e) => e.name.toLowerCase() === entityFilter
    );

    if (legacyEntities.length === 0) {
      return createTextResult(
        `Entity "${args.entity}" not found. Available entities: ${(dataEntities || []).map((e) => e.name).join(', ')}`,
        true
      );
    }
  }

  const convertedEntities = legacyEntities.map(convertLegacyEntity);

  switch (format) {
    case 'summary': {
      const summary = legacyEntities.map((e) => ({
        name: e.name,
        fieldCount: e.attributes.length,
        relationshipCount: e.relationships.length,
        fields: e.attributes,
      }));
      return createJsonResult({
        entityCount: summary.length,
        entities: summary,
        note: 'This is legacy data. Full schema details may not be available.',
      });
    }

    case 'drizzle':
    case 'full':
    default: {
      return createJsonResult({
        entityCount: convertedEntities.length,
        entities: convertedEntities,
        note: 'This is converted from legacy data entities. Some type information may be incomplete.',
      });
    }
  }
};

/**
 * Register the get_database_schema tool with the MCP server
 */
export function registerGetDatabaseSchema(): void {
  registerTool(definition, handler);
}

export { definition, handler };
