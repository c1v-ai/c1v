/**
 * Diagram Generators (Phase 11)
 *
 * Purpose: Generate Mermaid syntax from extracted PRD data
 * Pattern: Pure functions that transform data to Mermaid syntax
 * Team: Frontend (Agent 2.3: Data Visualization Engineer)
 *
 * Diagram Types:
 * - Context Diagram: System boundaries (Cornell CESYS521 compliant)
 * - Use Case Diagram: Actors and their use cases
 * - Class Diagram: Data entities with attributes and relationships
 *
 * @see /docs/diagrams/context-diagram-spec.md for Cornell specifications
 */

import type { Actor, UseCase, DataEntity } from '@/lib/langchain/schemas';

// ============================================================
// Context Diagram Types (Cornell CESYS521 Compliant)
// ============================================================

/**
 * Interaction direction between external element and the system
 */
export type InteractionDirection = 'inbound' | 'outbound' | 'bidirectional';

/**
 * Category for external elements in context diagrams
 */
export type ContextElementCategory =
  | 'actor'           // Human users
  | 'system'          // External systems
  | 'environment'     // Physical environment
  | 'infrastructure'  // Supporting infrastructure
  | 'regulation'      // Laws, standards, policies
  | 'service';        // External services

/**
 * Interaction between external element and the system
 */
export interface ContextInteraction {
  /** Interaction label (lowercase, verb phrase) */
  label: string;
  /** Direction of the interaction */
  direction: InteractionDirection;
  /** Optional: source requirement or use case ID */
  sourceRef?: string;
}

/**
 * External Element for Context Diagram
 * Represents an entity outside the system boundary
 */
export interface ContextDiagramElement {
  /** Unique identifier for the element */
  id: string;
  /** Display name (will be CAPITALIZED in diagram) */
  name: string;
  /** Category for grouping related elements */
  category: ContextElementCategory;
  /** Interactions with the system */
  interactions: ContextInteraction[];
}

/**
 * Complete Context Diagram specification (Cornell CESYS521)
 */
export interface ContextDiagramSpec {
  /** Project/system identifier */
  projectId: string;
  /** Optional system name (defaults to "THE SYSTEM") */
  systemLabel?: string;
  /** All external elements (target: 8-20) */
  elements: ContextDiagramElement[];
  /** Validation metadata */
  metadata?: {
    elementCount: number;
    categoryCounts: Record<string, number>;
    validationScore: number;
    generatedAt: string;
  };
}

/**
 * Validation result for context diagram generation
 */
export interface ContextDiagramValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  elementCount: number;
  categoryCount: number;
}

/**
 * Result from context diagram generation
 */
export interface ContextDiagramResult {
  mermaidSyntax: string;
  validation: ContextDiagramValidation;
}

/**
 * System Boundaries interface for legacy context diagrams
 * @deprecated Use ContextDiagramSpec for Cornell-compliant diagrams
 */
export interface SystemBoundaries {
  internal: string[];
  external: string[];
}

// ============================================================
// Context Diagram Validation (Cornell Requirements)
// ============================================================

const CONTEXT_MIN_ELEMENTS = 8;
const CONTEXT_MAX_ELEMENTS = 20;
const GENERIC_TERMS = ['users', 'data', 'system', 'service', 'api', 'database'];

/**
 * Validate context diagram specification against Cornell requirements
 */
function validateContextDiagramSpec(spec: ContextDiagramSpec): ContextDiagramValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const elementCount = spec.elements.length;

  // Count unique categories
  const categories = new Set(spec.elements.map(e => e.category));
  const categoryCount = categories.size;

  // Hard Gate CTX-002: Minimum elements
  if (elementCount < CONTEXT_MIN_ELEMENTS) {
    errors.push(`CTX-002: Insufficient external elements (found: ${elementCount}, min: ${CONTEXT_MIN_ELEMENTS})`);
  }

  // Hard Gate CTX-003: Maximum elements
  if (elementCount > CONTEXT_MAX_ELEMENTS) {
    errors.push(`CTX-003: Too many external elements (found: ${elementCount}, max: ${CONTEXT_MAX_ELEMENTS})`);
  }

  // Hard Gate CTX-004: All elements must have interactions
  spec.elements.forEach(element => {
    if (!element.interactions || element.interactions.length === 0) {
      errors.push(`CTX-004: Element '${element.name}' has no interactions`);
    }
  });

  // Hard Gate CTX-005: No duplicate names
  const names = spec.elements.map(e => e.name.toLowerCase());
  const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicates.length > 0) {
    errors.push(`CTX-005: Duplicate element names: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Hard Gate CTX-006: Interaction labels must be lowercase
  spec.elements.forEach(element => {
    element.interactions.forEach(interaction => {
      if (interaction.label !== interaction.label.toLowerCase()) {
        errors.push(`CTX-006: Interaction label must be lowercase: '${interaction.label}'`);
      }
    });
  });

  // Soft Check CTX-W01: Category diversity
  if (categoryCount < 3) {
    warnings.push(`CTX-W01: Limited category diversity (found: ${categoryCount}, recommended: 3+)`);
  }

  // Soft Check CTX-W04: Generic terms
  spec.elements.forEach(element => {
    if (GENERIC_TERMS.includes(element.name.toLowerCase())) {
      warnings.push(`CTX-W04: '${element.name}' is too generic, consider decomposing further`);
    }
  });

  // Soft Check CTX-W02: Actor decomposition suggestion
  const actorElements = spec.elements.filter(e => e.category === 'actor');
  actorElements.forEach(actor => {
    const genericActorTerms = ['users', 'customers', 'passengers', 'people'];
    if (genericActorTerms.includes(actor.name.toLowerCase())) {
      warnings.push(`CTX-W02: Consider decomposing '${actor.name}' by user type (e.g., admins, guests, etc.)`);
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    elementCount,
    categoryCount,
  };
}

// ============================================================
// Cornell-Compliant Context Diagram Generator
// ============================================================

/**
 * Generate a Cornell CESYS521 Compliant Context Diagram
 *
 * Follows Cornell specifications:
 * - System in center labeled "THE SYSTEM" (generic)
 * - 8-20 external elements in boxes OUTSIDE the boundary
 * - Black and white styling only
 * - Square corners for all boxes
 * - Lowercase interaction labels
 * - No crossing lines (managed via layout)
 *
 * @param spec - Context diagram specification
 * @returns Object containing Mermaid syntax and validation results
 *
 * @example
 * ```typescript
 * const result = generateCornellContextDiagram({
 *   projectId: "my-project",
 *   elements: [
 *     { id: "users", name: "End Users", category: "actor",
 *       interactions: [{ label: "interacts with", direction: "bidirectional" }]
 *     }
 *   ],
 * });
 * ```
 *
 * @see /docs/diagrams/context-diagram-spec.md
 */
export function generateCornellContextDiagram(spec: ContextDiagramSpec): ContextDiagramResult {
  const validation = validateContextDiagramSpec(spec);
  const lines: string[] = [];

  // Mermaid initialization for B&W theme
  lines.push("%%{init: {'theme': 'base', 'themeVariables': { 'lineColor': '#000000', 'primaryColor': '#ffffff', 'primaryTextColor': '#000000', 'primaryBorderColor': '#000000' }}}%%");
  lines.push('graph TB');
  lines.push('');

  // System boundary subgraph (dashed via CSS class)
  lines.push('    subgraph boundary [" "]');
  lines.push('        System["THE SYSTEM"]');
  lines.push('    end');
  lines.push('');

  // Track node IDs for class assignment
  const nodeIds: string[] = ['System'];

  // Generate external elements and their interactions
  spec.elements.forEach((element) => {
    const nodeId = sanitizeId(element.id);
    const displayName = element.name.toUpperCase();
    nodeIds.push(nodeId);

    // Add node definition
    lines.push(`    ${nodeId}["${escapeLabel(displayName)}"]`);

    // Add interactions
    element.interactions.forEach((interaction) => {
      const label = interaction.label.toLowerCase();

      switch (interaction.direction) {
        case 'inbound':
          // External provides input TO the system
          lines.push(`    ${nodeId} -->|"${escapeLabel(label)}"| System`);
          break;
        case 'outbound':
          // System provides output TO external
          lines.push(`    System -->|"${escapeLabel(label)}"| ${nodeId}`);
          break;
        case 'bidirectional':
          // Split into two separate interactions per Cornell spec
          const labels = label.split(',').map(l => l.trim());
          if (labels.length >= 2) {
            lines.push(`    ${nodeId} -->|"${escapeLabel(labels[0])}"| System`);
            lines.push(`    System -->|"${escapeLabel(labels[1])}"| ${nodeId}`);
          } else {
            // Single label bidirectional - show both directions
            lines.push(`    ${nodeId} -->|"${escapeLabel(label)}"| System`);
            lines.push(`    System -->|"${escapeLabel(label)}"| ${nodeId}`);
          }
          break;
      }
    });
  });

  lines.push('');

  // Cornell-compliant styling (B&W, square corners)
  lines.push('    %% Cornell CESYS521 Styling: B&W, square corners');
  lines.push('    classDef system fill:#ffffff,stroke:#000000,stroke-width:3px,color:#000000');
  lines.push('    classDef external fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000');
  lines.push('    classDef boundary fill:none,stroke:#000000,stroke-width:2px,stroke-dasharray:8 4');
  lines.push('');

  // Apply classes
  lines.push('    class System system');
  const externalNodeIds = nodeIds.filter(id => id !== 'System');
  if (externalNodeIds.length > 0) {
    lines.push(`    class ${externalNodeIds.join(',')} external`);
  }
  lines.push('    class boundary boundary');

  return {
    mermaidSyntax: lines.join('\n'),
    validation,
  };
}

// ============================================================
// Legacy Context Diagram Support
// ============================================================

/**
 * Infer category from element name
 * Used for legacy data migration
 */
function inferCategory(name: string): ContextElementCategory {
  const nameLower = name.toLowerCase();

  // Actor patterns
  if (/user|customer|admin|manager|operator|staff|employee|driver|passenger/i.test(nameLower)) {
    return 'actor';
  }

  // System patterns
  if (/api|gateway|service|server|platform|database|system/i.test(nameLower)) {
    return 'system';
  }

  // Environment patterns
  if (/weather|road|terrain|environment|location|physical/i.test(nameLower)) {
    return 'environment';
  }

  // Infrastructure patterns
  if (/station|parking|storage|facility|infrastructure/i.test(nameLower)) {
    return 'infrastructure';
  }

  // Regulation patterns
  if (/law|regulation|policy|standard|compliance|rule/i.test(nameLower)) {
    return 'regulation';
  }

  // Service patterns
  if (/support|maintenance|emergency|helpdesk/i.test(nameLower)) {
    return 'service';
  }

  // Default to system
  return 'system';
}

/**
 * Infer interaction label from element name
 * Used for legacy data migration
 */
function inferInteraction(name: string): string {
  const nameLower = name.toLowerCase();

  if (/user|customer|admin/i.test(nameLower)) {
    return 'interacts with';
  }
  if (/database|storage/i.test(nameLower)) {
    return 'stores data in';
  }
  // Check payment BEFORE gateway to ensure "Payment Gateway" returns "processes payments via"
  if (/payment/i.test(nameLower)) {
    return 'processes payments via';
  }
  if (/email|notification/i.test(nameLower)) {
    return 'sends notifications through';
  }
  if (/auth/i.test(nameLower)) {
    return 'authenticates via';
  }
  // Check api|gateway after more specific patterns
  if (/api|gateway/i.test(nameLower)) {
    return 'integrates with';
  }

  return 'connects to';
}

/**
 * Migrate legacy context data to Cornell-compliant format
 *
 * @param systemName - Original system name (will be ignored per Cornell)
 * @param internal - Internal components (not used in context diagrams)
 * @param external - External systems/elements
 * @returns Cornell-compliant ContextDiagramSpec
 */
export function migrateLegacyContextData(
  systemName: string,
  internal: string[],
  external: string[]
): ContextDiagramSpec {
  // Note: Internal components are part of "THE SYSTEM" and not shown separately
  // per Cornell CESYS521 methodology

  const elements: ContextDiagramElement[] = external.map((name, i) => ({
    id: `ext-${i}`,
    name: name,
    category: inferCategory(name),
    interactions: [
      {
        label: inferInteraction(name),
        direction: 'inbound' as InteractionDirection,
      },
    ],
  }));

  return {
    projectId: 'legacy',
    systemLabel: 'THE SYSTEM',
    elements,
    metadata: {
      elementCount: elements.length,
      categoryCounts: elements.reduce((acc, el) => {
        acc[el.category] = (acc[el.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      validationScore: 0, // Will be calculated on generation
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate Context Diagram (System Boundary Diagram)
 *
 * Shows what's inside vs outside the system boundary.
 * This is the legacy interface maintained for backward compatibility.
 *
 * NOTE: For Cornell-compliant diagrams, use generateCornellContextDiagram()
 *
 * @param systemName - Name of the system
 * @param internal - Array of internal components (not displayed per Cornell)
 * @param external - Array of external systems
 * @returns Mermaid diagram syntax
 *
 * @deprecated Use generateCornellContextDiagram for Cornell-compliant output
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
  // If we have enough external elements, use Cornell-compliant generator
  if (external.length >= CONTEXT_MIN_ELEMENTS) {
    const spec = migrateLegacyContextData(systemName, internal, external);
    const result = generateCornellContextDiagram(spec);
    return result.mermaidSyntax;
  }

  // Fallback to simple diagram for minimal data
  // This allows partial diagrams during data collection
  const lines: string[] = [];

  lines.push("%%{init: {'theme': 'base', 'themeVariables': { 'lineColor': '#000000', 'primaryColor': '#ffffff' }}}%%");
  lines.push('graph TB');
  lines.push('');

  // System boundary
  lines.push('    subgraph boundary [" "]');
  lines.push('        System["THE SYSTEM"]');

  // Show internal components within the boundary (for incomplete diagrams)
  internal.forEach((component, i) => {
    const nodeId = `Internal${i}`;
    lines.push(`        ${nodeId}["${escapeLabel(component.toUpperCase())}"]`);
    lines.push(`        System --- ${nodeId}`);
  });

  lines.push('    end');
  lines.push('');

  // External elements
  external.forEach((system, i) => {
    const nodeId = `External${i}`;
    const label = inferInteraction(system);
    lines.push(`    ${nodeId}["${escapeLabel(system.toUpperCase())}"]`);
    lines.push(`    ${nodeId} -->|"${label}"| System`);
  });

  lines.push('');

  // Styling
  lines.push('    classDef system fill:#ffffff,stroke:#000000,stroke-width:3px,color:#000000');
  lines.push('    classDef internal fill:#f5f5f5,stroke:#000000,stroke-width:1px,color:#000000');
  lines.push('    classDef external fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000');
  lines.push('    classDef boundary fill:none,stroke:#000000,stroke-width:2px,stroke-dasharray:8 4');
  lines.push('');
  lines.push('    class System system');

  if (internal.length > 0) {
    const internalIds = internal.map((_, i) => `Internal${i}`).join(',');
    lines.push(`    class ${internalIds} internal`);
  }

  if (external.length > 0) {
    const externalIds = external.map((_, i) => `External${i}`).join(',');
    lines.push(`    class ${externalIds} external`);
  }

  lines.push('    class boundary boundary');

  // Add warning comment if under minimum
  if (external.length < CONTEXT_MIN_ELEMENTS) {
    lines.push('');
    lines.push(`    %% WARNING: Only ${external.length} external elements. Cornell requires 8-20.`);
  }

  return lines.join('\n');
}

// ============================================================
// Use Case Diagram Types (Cornell CESYS521 Compliant)
// ============================================================

/**
 * Extended Actor interface with Cornell methodology support
 * Supports primary/secondary actor classification and placement
 */
export interface ActorExtended extends Actor {
  /** Actor type determines connection style and placement */
  type?: 'primary' | 'secondary' | 'external';
  /** Diagram placement position */
  position?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Extended Use Case interface with relationship support
 * Supports <<include>>, <<extends>>, and generalization relationships
 */
export interface UseCaseExtended extends UseCase {
  /** Actor type classification */
  actorType?: 'primary' | 'secondary';
  /** IDs of use cases this use case INCLUDES (always required) */
  includes?: string[];
  /** IDs of use cases that EXTEND this use case (optional behavior) */
  extendedBy?: string[];
  /** ID of the use case this EXTENDS */
  extends?: string;
  /** ID of parent use case for inheritance/generalization */
  generalizes?: string;
  /** Event or use case ID that triggers this use case */
  triggeredBy?: string;
  /** Category for grouping (e.g., "Core", "Lifecycle", "Derived") */
  category?: string;
}

/**
 * Use Case Diagram configuration options
 */
export interface UseCaseDiagramOptions {
  /** System name for the boundary title (format: uc.TITLEINALLCAPS) */
  systemName?: string;
  /** Use subgraph for system boundary */
  useSystemBoundary?: boolean;
  /** Graph direction: LR (left-right) or TB (top-bottom) */
  direction?: 'LR' | 'TB';
  /** Show actor roles in labels */
  showActorRoles?: boolean;
  /** Group use cases by category */
  groupByCategory?: boolean;
}

/**
 * Validation result for use case diagram generation
 */
export interface UseCaseDiagramValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  actorCount: number;
  useCaseCount: number;
}

/**
 * Result from use case diagram generation
 */
export interface UseCaseDiagramResult {
  mermaidSyntax: string;
  validation: UseCaseDiagramValidation;
}

// ============================================================
// Use Case Diagram Validation (Cornell Requirements)
// ============================================================

/**
 * Validate use case diagram specification against Cornell requirements
 */
function validateUseCaseDiagramSpec(
  actors: (Actor | ActorExtended)[],
  useCases: (UseCase | UseCaseExtended)[]
): UseCaseDiagramValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Hard Gate UC-001: At least one actor defined
  if (actors.length === 0) {
    errors.push('UC-001: No actors defined. Cannot have use cases without actors.');
  }

  // Hard Gate UC-002: At least one use case defined
  if (useCases.length === 0) {
    errors.push('UC-002: No use cases defined. Cannot have actors without use cases.');
  }

  // Hard Gate UC-003: All use case actors must exist
  const actorNames = new Set(actors.map(a => a.name.toLowerCase()));
  useCases.forEach(uc => {
    if (!actorNames.has(uc.actor.toLowerCase())) {
      errors.push(`UC-003: Use case '${uc.name}' references non-existent actor '${uc.actor}'`);
    }
  });

  // Hard Gate UC-004: No circular includes
  const useCaseMap = new Map(useCases.map(uc => [uc.id, uc as UseCaseExtended]));
  useCases.forEach(uc => {
    const ext = uc as UseCaseExtended;
    if (ext.includes) {
      const visited = new Set<string>();
      const checkCircular = (id: string): boolean => {
        if (visited.has(id)) return true;
        visited.add(id);
        const target = useCaseMap.get(id);
        if (target?.includes) {
          return target.includes.some(checkCircular);
        }
        return false;
      };
      if (ext.includes.some(id => {
        visited.clear();
        visited.add(uc.id);
        return checkCircular(id);
      })) {
        errors.push(`UC-004: Circular include detected starting from '${uc.name}'`);
      }
    }
  });

  // Hard Gate UC-005: No circular extends
  useCases.forEach(uc => {
    const ext = uc as UseCaseExtended;
    if (ext.extends) {
      const visited = new Set<string>();
      let current: string | undefined = ext.extends;
      visited.add(uc.id);
      while (current) {
        if (visited.has(current)) {
          errors.push(`UC-005: Circular extends detected starting from '${uc.name}'`);
          break;
        }
        visited.add(current);
        const target = useCaseMap.get(current) as UseCaseExtended | undefined;
        current = target?.extends;
      }
    }
  });

  // Soft Check UC-W01: Unconnected actors
  const connectedActors = new Set(useCases.map(uc => uc.actor.toLowerCase()));
  actors.forEach(actor => {
    if (!connectedActors.has(actor.name.toLowerCase())) {
      warnings.push(`UC-W01: Actor '${actor.name}' has no associated use cases`);
    }
  });

  // Soft Check UC-W02: Missing descriptions
  useCases.forEach(uc => {
    if (!uc.description || uc.description.trim() === '') {
      warnings.push(`UC-W02: Use case '${uc.name}' has no description`);
    }
  });

  // Soft Check UC-W03: Too many use cases (readability)
  if (useCases.length > 15) {
    warnings.push(`UC-W03: ${useCases.length} use cases may reduce diagram readability. Consider splitting.`);
  }

  // Soft Check UC-W04: Duplicate use case names
  const ucNames = useCases.map(uc => uc.name.toLowerCase());
  const duplicateNames = ucNames.filter((name, i) => ucNames.indexOf(name) !== i);
  if (duplicateNames.length > 0) {
    warnings.push(`UC-W04: Duplicate use case names found: ${[...new Set(duplicateNames)].join(', ')}`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    actorCount: actors.length,
    useCaseCount: useCases.length,
  };
}

// ============================================================
// Use Case Diagram Generator (Cornell CESYS521 Compliant)
// ============================================================

/**
 * Generate Use Case Diagram (Cornell CESYS521 Methodology)
 *
 * Follows UML/SysML standards from Cornell CESYS521 course:
 * - Actors as stick figures OUTSIDE the system boundary
 * - Use cases as ovals/bubbles INSIDE the system boundary
 * - Primary actors on LEFT side with solid connections
 * - Secondary actors elsewhere with DASHED connections
 * - Title format: uc.[TITLEINALLCAPS]
 *
 * Relationship Types:
 * - Association: Actor to Use Case (solid or dashed based on actor type)
 * - <<include>>: Dashed arrow FROM main use case TO included use case
 * - <<extends>>: Dashed arrow FROM extending use case TO base use case
 * - Generalization: Solid line with open triangle (inheritance)
 * - <<trigger>>: Dashed arrow with trigger label
 *
 * @param actors - Array of Actor or ActorExtended objects
 * @param useCases - Array of UseCase or UseCaseExtended objects
 * @param options - Optional diagram configuration
 * @returns Mermaid diagram syntax
 *
 * @see /docs/diagrams/use-case-diagram-spec.md for full specification
 *
 * @example
 * ```typescript
 * // Simple usage (backward compatible)
 * const diagram = generateUseCaseDiagram(
 *   [{ name: "Customer", role: "Primary User", description: "..." }],
 *   [{ id: "UC1", name: "Place Order", actor: "Customer", description: "..." }]
 * );
 *
 * // Advanced usage with relationships (Cornell compliant)
 * const diagram = generateUseCaseDiagram(
 *   [
 *     { name: "Driver", role: "Primary User", description: "...", type: "primary" },
 *     { name: "Navigator", role: "Secondary User", description: "...", type: "secondary" }
 *   ],
 *   [
 *     { id: "UC1", name: "Accelerates", actor: "Driver", description: "..." },
 *     { id: "UC2", name: "Accelerate in Snow", actor: "Driver", description: "...", extends: "UC1" },
 *     { id: "UC3", name: "Passing other Vehicles", actor: "Driver", description: "...", includes: ["UC1"] }
 *   ],
 *   { systemName: "Car System", useSystemBoundary: true }
 * );
 * ```
 */
export function generateUseCaseDiagram(
  actors: (Actor | ActorExtended)[],
  useCases: (UseCase | UseCaseExtended)[],
  options: UseCaseDiagramOptions = {}
): string {
  const {
    systemName,
    useSystemBoundary = false,
    direction = 'LR',
    showActorRoles = true,
    groupByCategory = false,
  } = options;

  const lines: string[] = [];

  // Empty data check
  if (actors.length === 0 && useCases.length === 0) {
    lines.push('graph LR');
    lines.push('  NoData["No data available"]');
    return lines.join('\n');
  }

  // Start graph with direction
  lines.push(`graph ${direction}`);
  lines.push('');

  // Classify actors by type
  const primaryActors = actors.filter((a) => {
    const ext = a as ActorExtended;
    return ext.type === 'primary' || !ext.type; // Default to primary if not specified
  });
  const secondaryActors = actors.filter((a) => {
    const ext = a as ActorExtended;
    return ext.type === 'secondary' || ext.type === 'external';
  });

  // Generate formatted system title (uc.TITLEINALLCAPS)
  const formattedTitle = systemName
    ? `uc.${systemName.toUpperCase().replace(/\s+/g, '')}`
    : 'uc.SYSTEM';

  // Start system boundary subgraph (use cases inside)
  if (useSystemBoundary) {
    lines.push(`  subgraph ${formattedTitle}["${formattedTitle}"]`);
    lines.push('    direction TB');
    lines.push('');
  }

  // Group use cases by category if enabled
  if (groupByCategory) {
    const categorizedUseCases = groupUseCasesByCategory(useCases as UseCaseExtended[]);

    for (const [category, ucs] of Object.entries(categorizedUseCases)) {
      if (category !== 'uncategorized' && ucs.length > 0) {
        lines.push(`    %% ${category} Use Cases`);
      }
      ucs.forEach((uc) => {
        const ucId = sanitizeId(uc.id);
        const indent = useSystemBoundary ? '    ' : '  ';
        lines.push(`${indent}${ucId}("${escapeLabel(uc.name)}"):::useCase`);
      });
      lines.push('');
    }
  } else {
    // Add all use cases without grouping
    lines.push('  %% Use Cases');
    useCases.forEach((uc) => {
      const ucId = sanitizeId(uc.id);
      const indent = useSystemBoundary ? '    ' : '  ';
      lines.push(`${indent}${ucId}("${escapeLabel(uc.name)}"):::useCase`);
    });
    lines.push('');
  }

  // Close system boundary subgraph
  if (useSystemBoundary) {
    lines.push('  end');
    lines.push('');
  }

  // Add primary actors (left side, solid connections)
  if (primaryActors.length > 0) {
    lines.push('  %% Primary Actors (left side)');
    primaryActors.forEach((actor) => {
      const actorId = sanitizeId(actor.name);
      const label = showActorRoles && actor.role
        ? `${escapeLabel(actor.name)}<br/><i>(${escapeLabel(actor.role)})</i>`
        : escapeLabel(actor.name);
      lines.push(`  ${actorId}["${label}"]:::primaryActor`);
    });
    lines.push('');
  }

  // Add secondary actors (typically right side, dashed connections)
  if (secondaryActors.length > 0) {
    lines.push('  %% Secondary Actors');
    secondaryActors.forEach((actor) => {
      const actorId = sanitizeId(actor.name);
      const label = showActorRoles && actor.role
        ? `${escapeLabel(actor.name)}<br/><i>(${escapeLabel(actor.role)})</i>`
        : escapeLabel(actor.name);
      lines.push(`  ${actorId}["${label}"]:::secondaryActor`);
    });
    lines.push('');
  }

  // Create actor lookup for determining connection style
  const actorTypeMap = new Map<string, 'primary' | 'secondary' | 'external'>();
  actors.forEach((actor) => {
    const ext = actor as ActorExtended;
    actorTypeMap.set(actor.name.toLowerCase(), ext.type || 'primary');
  });

  // Add actor-to-use case associations
  lines.push('  %% Actor-UseCase Associations');
  useCases.forEach((uc) => {
    const actorId = sanitizeId(uc.actor);
    const ucId = sanitizeId(uc.id);
    const actorType = actorTypeMap.get(uc.actor.toLowerCase()) || 'primary';

    // Primary actors use solid lines, secondary/external use dashed
    if (actorType === 'primary') {
      lines.push(`  ${actorId} --> ${ucId}`);
    } else {
      lines.push(`  ${actorId} -.-> ${ucId}`);
    }
  });
  lines.push('');

  // Add <<include>> relationships
  // Include: Dashed arrow FROM main use case TO included use case
  const includeRelationships = getIncludeRelationships(useCases as UseCaseExtended[]);
  if (includeRelationships.length > 0) {
    lines.push('  %% Include Relationships (main use case REQUIRES included use case)');
    includeRelationships.forEach(({ from, to }) => {
      lines.push(`  ${from} -.->|"<<include>>"| ${to}`);
    });
    lines.push('');
  }

  // Add <<extends>> relationships
  // Extend: Dashed arrow FROM extending use case TO base use case
  const extendRelationships = getExtendRelationships(useCases as UseCaseExtended[]);
  if (extendRelationships.length > 0) {
    lines.push('  %% Extend Relationships (extending use case is OPTIONAL)');
    extendRelationships.forEach(({ from, to }) => {
      lines.push(`  ${from} -.->|"<<extends>>"| ${to}`);
    });
    lines.push('');
  }

  // Add generalization relationships
  // Generalization: Solid line FROM child TO parent (inheritance)
  const generalizationRelationships = getGeneralizationRelationships(useCases as UseCaseExtended[]);
  if (generalizationRelationships.length > 0) {
    lines.push('  %% Generalization Relationships (inheritance)');
    generalizationRelationships.forEach(({ from, to }) => {
      lines.push(`  ${from} -.->|"generalizes"| ${to}`);
    });
    lines.push('');
  }

  // Add <<trigger>> relationships
  const triggerRelationships = getTriggerRelationships(useCases as UseCaseExtended[]);
  if (triggerRelationships.length > 0) {
    lines.push('  %% Trigger Relationships');
    triggerRelationships.forEach(({ from, to }) => {
      lines.push(`  ${from} -.->|"<<trigger>>"| ${to}`);
    });
    lines.push('');
  }

  // Add styling (Cornell methodology colors)
  lines.push('  %% Styling (Cornell CESYS521)');
  lines.push('  classDef primaryActor fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,font-weight:bold');
  lines.push('  classDef secondaryActor fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,stroke-dasharray:5 5');
  lines.push('  classDef useCase fill:#fff3e0,stroke:#f57c00,stroke-width:2px');

  return lines.join('\n');
}

/**
 * Generate Use Case Diagram with validation (Cornell CESYS521)
 *
 * Returns both the Mermaid syntax and validation results
 *
 * @param actors - Array of Actor or ActorExtended objects
 * @param useCases - Array of UseCase or UseCaseExtended objects
 * @param options - Optional diagram configuration
 * @returns Object containing Mermaid syntax and validation results
 */
export function generateCornellUseCaseDiagram(
  actors: (Actor | ActorExtended)[],
  useCases: (UseCase | UseCaseExtended)[],
  options: UseCaseDiagramOptions = {}
): UseCaseDiagramResult {
  const validation = validateUseCaseDiagramSpec(actors, useCases);
  const mermaidSyntax = generateUseCaseDiagram(actors, useCases, options);

  return {
    mermaidSyntax,
    validation,
  };
}

/**
 * Group use cases by their category
 */
function groupUseCasesByCategory(
  useCases: UseCaseExtended[]
): Record<string, UseCaseExtended[]> {
  const grouped: Record<string, UseCaseExtended[]> = {};

  useCases.forEach((uc) => {
    const category = uc.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(uc);
  });

  return grouped;
}

/**
 * Extract <<include>> relationships from use cases
 * Returns array of { from: mainUseCaseId, to: includedUseCaseId }
 */
function getIncludeRelationships(
  useCases: UseCaseExtended[]
): Array<{ from: string; to: string }> {
  const relationships: Array<{ from: string; to: string }> = [];
  const useCaseIds = new Set(useCases.map((uc) => uc.id));

  useCases.forEach((uc) => {
    if (uc.includes && uc.includes.length > 0) {
      uc.includes.forEach((includedId) => {
        if (useCaseIds.has(includedId)) {
          relationships.push({
            from: sanitizeId(uc.id),
            to: sanitizeId(includedId),
          });
        }
      });
    }
  });

  return relationships;
}

/**
 * Extract <<extends>> relationships from use cases
 * Returns array of { from: extendingUseCaseId, to: baseUseCaseId }
 */
function getExtendRelationships(
  useCases: UseCaseExtended[]
): Array<{ from: string; to: string }> {
  const relationships: Array<{ from: string; to: string }> = [];
  const useCaseIds = new Set(useCases.map((uc) => uc.id));

  useCases.forEach((uc) => {
    if (uc.extends && useCaseIds.has(uc.extends)) {
      relationships.push({
        from: sanitizeId(uc.id),
        to: sanitizeId(uc.extends),
      });
    }
  });

  return relationships;
}

/**
 * Extract generalization relationships from use cases
 * Returns array of { from: childUseCaseId, to: parentUseCaseId }
 */
function getGeneralizationRelationships(
  useCases: UseCaseExtended[]
): Array<{ from: string; to: string }> {
  const relationships: Array<{ from: string; to: string }> = [];
  const useCaseIds = new Set(useCases.map((uc) => uc.id));

  useCases.forEach((uc) => {
    if (uc.generalizes && useCaseIds.has(uc.generalizes)) {
      relationships.push({
        from: sanitizeId(uc.id),
        to: sanitizeId(uc.generalizes),
      });
    }
  });

  return relationships;
}

/**
 * Extract <<trigger>> relationships from use cases
 * Returns array of { from: triggerId, to: useCaseId }
 */
function getTriggerRelationships(
  useCases: UseCaseExtended[]
): Array<{ from: string; to: string }> {
  const relationships: Array<{ from: string; to: string }> = [];
  const useCaseIds = new Set(useCases.map((uc) => uc.id));

  useCases.forEach((uc) => {
    if (uc.triggeredBy && useCaseIds.has(uc.triggeredBy)) {
      relationships.push({
        from: sanitizeId(uc.triggeredBy),
        to: sanitizeId(uc.id),
      });
    }
  });

  return relationships;
}

/**
 * Generate a Cornell Car System example diagram
 * Demonstrates all relationship types per CESYS521 methodology
 *
 * @returns Mermaid diagram syntax for the car system example
 */
export function generateCarSystemExample(): string {
  const actors: ActorExtended[] = [
    {
      name: 'Driver',
      role: 'Primary User',
      description: 'Person operating the vehicle',
      type: 'primary',
    },
    {
      name: 'Navigator',
      role: 'Secondary User',
      description: 'Person providing navigation assistance',
      type: 'secondary',
    },
  ];

  const useCases: UseCaseExtended[] = [
    // Core operations
    { id: 'UC1', name: 'Accelerates', actor: 'Driver', description: 'Driver accelerates the vehicle', category: 'Core' },
    { id: 'UC2', name: 'Brakes', actor: 'Driver', description: 'Driver applies brakes', category: 'Core' },
    { id: 'UC3', name: 'Steers', actor: 'Driver', description: 'Driver steers the vehicle', category: 'Core' },
    { id: 'UC4', name: 'Parks the System', actor: 'Driver', description: 'Driver parks the vehicle', category: 'Core' },

    // Derived operations (extends)
    { id: 'UC5', name: 'Accelerate in Snow', actor: 'Driver', description: 'Accelerating in snowy conditions', extends: 'UC1', category: 'Derived' },
    { id: 'UC6', name: 'Brakes in Snow', actor: 'Driver', description: 'Braking in snowy conditions', extends: 'UC2', category: 'Derived' },
    { id: 'UC7', name: 'Steers in Snow', actor: 'Driver', description: 'Steering in snowy conditions', extends: 'UC3', category: 'Derived' },
    { id: 'UC8', name: 'Changes Lanes', actor: 'Driver', description: 'Driver changes lanes', extends: 'UC3', category: 'Derived' },

    // Complex operations (includes)
    { id: 'UC9', name: 'Passing other Vehicles', actor: 'Driver', description: 'Overtaking other vehicles', includes: ['UC1', 'UC8'], category: 'Complex' },
    { id: 'UC10', name: 'Enters a Highway', actor: 'Driver', description: 'Entering a highway', includes: ['UC1'], category: 'Complex' },
    { id: 'UC11', name: 'Exits a Highway', actor: 'Driver', description: 'Exiting a highway', includes: ['UC2'], category: 'Complex' },

    // Lifecycle
    { id: 'UC12', name: 'Starts Up the System', actor: 'Driver', description: 'Starting the vehicle', category: 'Lifecycle' },
    { id: 'UC13', name: 'Shuts Down the System', actor: 'Driver', description: 'Shutting down the vehicle', category: 'Lifecycle' },

    // Navigator use cases
    { id: 'UC14', name: 'Changes Road', actor: 'Navigator', description: 'Navigator instructs road change', category: 'Navigation' },
  ];

  return generateUseCaseDiagram(actors, useCases, {
    systemName: 'Car System Operations',
    useSystemBoundary: true,
    direction: 'LR',
    showActorRoles: true,
    groupByCategory: true,
  });
}

// ============================================================
// Class Diagram Generator
// ============================================================

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
 * - "User has many Orders" -> User "1" --> "*" Order
 * - "Order belongs to User" -> Order "*" --> "1" User
 * - "Product has many Reviews" -> Product "1" --> "*" Review
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

  // Find target entity mentioned in relationship, excluding the source entity
  // This prevents "User has many Orders" from finding "User" as the target
  const targetEntity = allEntities.find((e) =>
    e.name.toLowerCase() !== sourceEntity.toLowerCase() &&
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

// ============================================================
// Utility Functions
// ============================================================

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

// ============================================================
// Sequence Diagram Cleanup
// ============================================================

/**
 * Detect if a Mermaid diagram is a sequence diagram
 * Handles various formats and edge cases including malformed diagrams
 * 
 * @param syntax - Mermaid diagram syntax
 * @returns True if this appears to be a sequence diagram
 * 
 * @example
 * isSequenceDiagram('sequenceDiagram\n  participant A') // true
 * isSequenceDiagram('%%{init}%%\nsequenceDiagram') // true (init block)
 * isSequenceDiagram('participant User\nUser->>System: action') // true (pattern match)
 * isSequenceDiagram('graph TD\n  A --> B') // false (flowchart)
 */
export function isSequenceDiagram(syntax: string): boolean {
  const normalized = syntax.trim().toLowerCase();
  
  // Check for explicit sequenceDiagram declaration (most reliable)
  if (normalized.startsWith('sequencediagram')) {
    return true;
  }
  
  // Check for sequenceDiagram anywhere (handles init blocks before it)
  if (/^\s*sequencediagram/m.test(normalized)) {
    return true;
  }
  
  // Pattern matching for malformed diagrams that forgot the declaration
  // but have characteristic sequence diagram elements
  // Must be strict to avoid false positives with flowcharts
  
  // Check for participant/actor declarations (not just the word used as a node ID)
  // Pattern: "participant Name" or "actor Name" at start of line
  const hasParticipantDeclaration = /^\s*(participant|actor)\s+[A-Za-z]/m.test(syntax);
  
  // Check for sequence-specific arrows: ->> and -->> are unambiguous
  // Note: --> and -> are also used in flowcharts, so we only use the strict arrows
  const hasSequenceArrows = /(->>|-->>)/.test(syntax);
  
  // If it has participant declarations AND sequence arrows, likely a sequence diagram
  if (hasParticipantDeclaration && hasSequenceArrows) {
    return true;
  }
  
  return false;
}

/**
 * Check if syntax contains invalid classDef/class statements
 * (which are invalid for sequence diagrams)
 * 
 * @param syntax - Mermaid diagram syntax
 * @returns True if invalid syntax is present
 * 
 * @example
 * hasInvalidSequenceSyntax('classDef actor fill:#f9f') // true
 * hasInvalidSequenceSyntax('class Actor1, System actor;') // true
 * hasInvalidSequenceSyntax('participant User') // false (clean)
 */
export function hasInvalidSequenceSyntax(syntax: string): boolean {
  const normalized = syntax.toLowerCase();
  // Check for classDef statements
  if (normalized.includes('classdef')) {
    return true;
  }
  // Check for class assignment statements (e.g., "class Actor1, System actor;")
  if (/^\s*class\s+\w+.*\w+\s*;?\s*$/m.test(syntax)) {
    return true;
  }
  return false;
}

/**
 * Clean invalid syntax from sequence diagrams
 * 
 * Sequence diagrams in Mermaid do NOT support classDef/class statements.
 * These are only valid for flowcharts/graphs. This function removes
 * any classDef and class statements from sequence diagrams.
 * 
 * Strategy:
 * - Only processes if it's actually a sequence diagram
 * - Only removes invalid syntax if present (idempotent)
 * - Returns original syntax unchanged if no cleanup needed
 * 
 * Primary cleanup point: On save to database (conversations.ts)
 * Safety net: On render (diagram-viewer.tsx) for existing bad data
 * 
 * @param syntax - Mermaid diagram syntax
 * @returns Cleaned syntax with invalid classDef/class statements removed, or original if no cleanup needed
 */
export function cleanSequenceDiagramSyntax(syntax: string): string {
  // Early return if not a sequence diagram - no cleanup needed
  if (!isSequenceDiagram(syntax)) {
    return syntax;
  }
  
  // Early return if no invalid syntax present - already clean
  if (!hasInvalidSequenceSyntax(syntax)) {
    return syntax;
  }
  
  // Perform cleanup - only reached if diagram needs cleaning
  const lines = syntax.split('\n');
  const cleanedLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    // Skip classDef statements
    if (trimmed.startsWith('classdef')) {
      continue;
    }
    
    // Skip class assignment statements (e.g., "class Actor1, Actor2 actor;")
    // These follow pattern: class <names> <className>;
    if (trimmed.startsWith('class ') && /class\s+[\w,\s]+\s+\w+\s*;?\s*$/.test(trimmed)) {
      continue;
    }
    
    // Skip styling comments that mention classDef (optional cleanup)
    if (trimmed.startsWith('%%') && (trimmed.includes('styling') || trimmed.includes('classdef'))) {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n').trim();
}

// ============================================================
// Unified Diagram Generator
// ============================================================

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
    actors?: (Actor | ActorExtended)[];
    useCases?: (UseCase | UseCaseExtended)[];
    systemBoundaries?: SystemBoundaries;
    dataEntities?: DataEntity[];
    contextSpec?: ContextDiagramSpec;
    useCaseOptions?: UseCaseDiagramOptions;
  }
): string {
  switch (type) {
    case 'context':
      // Prefer new Cornell spec if provided
      if (data.contextSpec) {
        return generateCornellContextDiagram(data.contextSpec).mermaidSyntax;
      }
      // Fall back to legacy format
      return generateContextDiagram(
        data.projectName || 'System',
        data.systemBoundaries?.internal || [],
        data.systemBoundaries?.external || []
      );

    case 'useCase':
      // Use Cornell-compliant generator with options
      return generateUseCaseDiagram(
        data.actors || [],
        data.useCases || [],
        data.useCaseOptions || {
          systemName: data.projectName,
          useSystemBoundary: true,
          showActorRoles: true,
        }
      );

    case 'class':
      return generateClassDiagram(data.dataEntities || []);

    default:
      return 'graph TD\n  NoData["Unknown diagram type"]';
  }
}
