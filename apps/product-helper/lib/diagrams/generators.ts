/**
 * Diagram Generators (Phase 11)
 *
 * Purpose: Generate Mermaid syntax from extracted PRD data
 * Pattern: Pure functions that transform data to Mermaid syntax
 * Team: Frontend (Agent 2.3: Data Visualization Engineer)
 *
 * Diagram Types:
 * - Context Diagram: System boundaries (internal vs external)
 * - Use Case Diagram: Actors and their use cases
 * - Class Diagram: Data entities with attributes and relationships
 */

import type { Actor, UseCase, DataEntity } from '@/lib/langchain/schemas';

/**
 * System Boundaries interface for context diagrams
 */
export interface SystemBoundaries {
  internal: string[];
  external: string[];
}

/**
 * Generate Context Diagram (System Boundary Diagram)
 *
 * Shows what's inside vs outside the system boundary
 * - System: Central node
 * - Internal: Components within system (solid lines)
 * - External: External systems/services (dashed lines)
 *
 * @param systemName - Name of the system
 * @param internal - Array of internal components
 * @param external - Array of external systems
 * @returns Mermaid diagram syntax
 *
 * @example
 * ```typescript
 * const diagram = generateContextDiagram(
 *   "E-commerce Platform",
 *   ["Product Catalog", "Shopping Cart", "Order Management"],
 *   ["Payment Gateway", "Shipping API", "Email Service"]
 * );
 * ```
 */
export function generateContextDiagram(
  systemName: string,
  internal: string[],
  external: string[]
): string {
  const lines: string[] = ['graph TB'];

  // Add central system node
  lines.push(`  System["${escapeLabel(systemName)}"]:::system`);

  // Add internal components
  internal.forEach((component, i) => {
    const nodeId = `Internal${i}`;
    lines.push(`  ${nodeId}["${escapeLabel(component)}"]:::internal`);
    lines.push(`  System --> ${nodeId}`);
  });

  // Add external systems (dashed lines)
  external.forEach((system, i) => {
    const nodeId = `External${i}`;
    lines.push(`  ${nodeId}["${escapeLabel(system)}"]:::external`);
    lines.push(`  System -.-> ${nodeId}`);
  });

  // Add styling
  lines.push('  classDef system fill:#c8e6c9,stroke:#388e3c,stroke-width:3px');
  lines.push('  classDef internal fill:#bbdefb,stroke:#1976d2,stroke-width:2px');
  lines.push('  classDef external fill:#ffccbc,stroke:#e64a19,stroke-width:2px,stroke-dasharray: 5 5');

  return lines.join('\n');
}

/**
 * Generate Use Case Diagram
 *
 * Shows actors and their associated use cases
 * - Actors: Left side (users, systems)
 * - Use Cases: Right side (ovals)
 * - Connections: Arrows from actors to use cases
 *
 * @param actors - Array of Actor objects
 * @param useCases - Array of UseCase objects
 * @returns Mermaid diagram syntax
 *
 * @example
 * ```typescript
 * const diagram = generateUseCaseDiagram(
 *   [{ name: "Customer", role: "Primary User", description: "..." }],
 *   [{ id: "UC1", name: "Place Order", actor: "Customer", description: "..." }]
 * );
 * ```
 */
export function generateUseCaseDiagram(
  actors: Actor[],
  useCases: UseCase[]
): string {
  const lines: string[] = ['graph LR'];

  if (actors.length === 0 && useCases.length === 0) {
    lines.push('  NoData["No data available"]');
    return lines.join('\n');
  }

  // Add actors
  actors.forEach((actor) => {
    const actorId = sanitizeId(actor.name);
    const label = `${escapeLabel(actor.name)}<br/><i>(${escapeLabel(actor.role)})</i>`;
    lines.push(`  ${actorId}["${label}"]:::actor`);
  });

  // Add use cases
  useCases.forEach((uc) => {
    const ucId = sanitizeId(uc.id);
    lines.push(`  ${ucId}("${escapeLabel(uc.name)}"):::usecase`);
  });

  // Add connections from actors to use cases
  useCases.forEach((uc) => {
    const actorId = sanitizeId(uc.actor);
    const ucId = sanitizeId(uc.id);
    lines.push(`  ${actorId} --> ${ucId}`);
  });

  // Add styling
  lines.push('  classDef actor fill:#e3f2fd,stroke:#1976d2,stroke-width:2px');
  lines.push('  classDef usecase fill:#fff3e0,stroke:#f57c00,stroke-width:2px');

  return lines.join('\n');
}

/**
 * Generate Class Diagram (Data Model)
 *
 * Shows data entities with their attributes and relationships
 * - Entities: Classes with attributes
 * - Relationships: Arrows with labels
 *
 * @param entities - Array of DataEntity objects
 * @returns Mermaid diagram syntax
 *
 * @example
 * ```typescript
 * const diagram = generateClassDiagram([
 *   {
 *     name: "User",
 *     description: "System user",
 *     attributes: ["id", "email", "name"],
 *     relationships: ["User has many Orders"]
 *   }
 * ]);
 * ```
 */
export function generateClassDiagram(entities: DataEntity[]): string {
  const lines: string[] = ['classDiagram'];

  if (entities.length === 0) {
    lines.push('  class NoData {');
    lines.push('    No data available');
    lines.push('  }');
    return lines.join('\n');
  }

  // Add classes with attributes
  entities.forEach((entity) => {
    const className = sanitizeClassName(entity.name);
    lines.push(`  class ${className} {`);

    // Add attributes
    if (entity.attributes && entity.attributes.length > 0) {
      entity.attributes.forEach((attr) => {
        lines.push(`    +${sanitizeAttribute(attr)}`);
      });
    } else {
      lines.push('    +id');
    }

    lines.push('  }');
  });

  // Add relationships
  entities.forEach((entity) => {
    if (entity.relationships && entity.relationships.length > 0) {
      entity.relationships.forEach((rel) => {
        const relationship = parseRelationship(rel, entity.name, entities);
        if (relationship) {
          lines.push(`  ${relationship}`);
        }
      });
    }
  });

  return lines.join('\n');
}

/**
 * Parse relationship string and generate Mermaid syntax
 *
 * Supports patterns like:
 * - "User has many Orders" → User "1" --> "*" Order
 * - "Order belongs to User" → Order "*" --> "1" User
 * - "Product has many Reviews" → Product "1" --> "*" Review
 *
 * @param relationshipText - Natural language relationship
 * @param sourceEntity - Source entity name
 * @param allEntities - All available entities
 * @returns Mermaid relationship syntax or null
 */
function parseRelationship(
  relationshipText: string,
  sourceEntity: string,
  allEntities: DataEntity[]
): string | null {
  const text = relationshipText.toLowerCase();

  // Find target entity mentioned in relationship
  const targetEntity = allEntities.find((e) =>
    text.includes(e.name.toLowerCase())
  );

  if (!targetEntity) return null;

  const source = sanitizeClassName(sourceEntity);
  const target = sanitizeClassName(targetEntity.name);

  // Parse cardinality
  if (text.includes('has many') || text.includes('have many')) {
    return `  ${source} "1" --> "*" ${target} : has`;
  } else if (text.includes('belongs to')) {
    return `  ${source} "*" --> "1" ${target} : belongs to`;
  } else if (text.includes('has one') || text.includes('has a')) {
    return `  ${source} "1" --> "1" ${target} : has`;
  } else {
    // Default: many-to-many
    return `  ${source} "*" --> "*" ${target}`;
  }
}

/**
 * Escape special characters in Mermaid labels
 * Handles quotes, brackets, and other special chars
 */
function escapeLabel(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\n/g, '<br/>');
}

/**
 * Sanitize ID for Mermaid node IDs
 * Removes spaces and special characters
 */
function sanitizeId(id: string): string {
  return id
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^[0-9]/, '_$&'); // IDs can't start with number
}

/**
 * Sanitize class name for Mermaid class diagrams
 */
function sanitizeClassName(name: string): string {
  return name
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Sanitize attribute name for Mermaid class diagrams
 */
function sanitizeAttribute(attr: string): string {
  return attr
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Generate diagram from extracted project data
 * Convenience function that selects the appropriate generator
 *
 * @param type - Diagram type ('context' | 'useCase' | 'class')
 * @param data - Project data with actors, useCases, boundaries, entities
 * @returns Mermaid diagram syntax
 */
export function generateDiagram(
  type: 'context' | 'useCase' | 'class',
  data: {
    projectName?: string;
    actors?: Actor[];
    useCases?: UseCase[];
    systemBoundaries?: SystemBoundaries;
    dataEntities?: DataEntity[];
  }
): string {
  switch (type) {
    case 'context':
      return generateContextDiagram(
        data.projectName || 'System',
        data.systemBoundaries?.internal || [],
        data.systemBoundaries?.external || []
      );

    case 'useCase':
      return generateUseCaseDiagram(
        data.actors || [],
        data.useCases || []
      );

    case 'class':
      return generateClassDiagram(data.dataEntities || []);

    default:
      return 'graph TD\n  NoData["Unknown diagram type"]';
  }
}
