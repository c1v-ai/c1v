/**
 * System Design Diagram Generators (Steps 3-6)
 *
 * Purpose: Generate Mermaid syntax and HTML for system design artifacts
 * Pattern: Pure functions that transform extracted data to visual representations
 * Team: Frontend (Agent 2.3: Data Visualization Engineer)
 *
 * Diagram Types:
 * - FFBD (Step 3): Functional Flow Block Diagram — flowchart LR
 * - DFD (Step 6): Data Flow Diagram — flowchart TB
 * - Sequence Diagram (Step 6): Interface interaction sequences
 * - N2 Chart (Step 6): Interface matrix as HTML table
 *
 * @see /lib/langchain/schemas.ts for type definitions
 */

import type {
  Ffbd,
  FfbdBlock,
  FfbdConnection,
  Interfaces,
  Subsystem,
  InterfaceSpec,
} from '@/lib/langchain/schemas';

// ============================================================
// Shared Utilities
// ============================================================

/**
 * Escape text for Mermaid labels — prevents syntax breaks from
 * quotes, brackets, and newlines.
 */
function escapeLabel(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/\n/g, '<br/>');
}

/**
 * Sanitize a string for use as a Mermaid node ID.
 * Strips special characters and ensures the ID does not start with a digit.
 */
function sanitizeId(id: string): string {
  return id
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^[0-9]/, '_$&');
}

/**
 * Escape text for safe inclusion inside HTML attributes and content.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// 1. FFBD Generator (Step 3)
// ============================================================

/**
 * Validation result for FFBD diagram generation
 */
export interface FFBDValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  blockCount: number;
  gateCount: number;
}

/**
 * Result from FFBD diagram generation
 */
export interface FFBDGeneratorResult {
  mermaidSyntax: string;
  validation: FFBDValidation;
}

const FFBD_MIN_BLOCKS = 3;
const FFBD_WARN_MAX_BLOCKS = 10;

/**
 * Validate FFBD data for diagram generation.
 *
 * Hard gates:
 * - FFBD-001: At least 3 blocks
 * - FFBD-002: No orphan blocks (every block must appear in at least one connection)
 *
 * Warnings:
 * - FFBD-W01: More than 10 blocks at one level
 * - FFBD-W02: No core value function marked
 */
function validateFFBD(
  blocks: FfbdBlock[],
  connections: FfbdConnection[],
): FFBDValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Hard Gate FFBD-001: Minimum blocks
  if (blocks.length < FFBD_MIN_BLOCKS) {
    errors.push(
      `FFBD-001: Insufficient blocks (found: ${blocks.length}, min: ${FFBD_MIN_BLOCKS})`,
    );
  }

  // Hard Gate FFBD-002: No orphan blocks
  const connectedIds = new Set<string>();
  connections.forEach((c) => {
    connectedIds.add(c.from);
    connectedIds.add(c.to);
  });
  if (blocks.length > 1) {
    blocks.forEach((block) => {
      if (!connectedIds.has(block.id)) {
        errors.push(`FFBD-002: Orphan block '${block.id}' (${block.name}) has no connections`);
      }
    });
  }

  // Count gates
  const gateCount = connections.filter(
    (c) => c.gateType && c.gateType !== 'sequence',
  ).length;

  // Warning FFBD-W01: Too many blocks at one level
  if (blocks.length > FFBD_WARN_MAX_BLOCKS) {
    warnings.push(
      `FFBD-W01: High block count (${blocks.length}), consider decomposing into sub-levels`,
    );
  }

  // Warning FFBD-W02: No core value marked
  const hasCoreValue = blocks.some((b) => b.isCoreValue);
  if (!hasCoreValue) {
    warnings.push(
      'FFBD-W02: No core value function marked — identify the primary value-delivering block',
    );
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    blockCount: blocks.length,
    gateCount,
  };
}

/**
 * Generate a Functional Flow Block Diagram (FFBD) in Mermaid flowchart LR syntax.
 *
 * Supports two modes:
 * - `top`: Renders all top-level blocks (F.1, F.2, ... F.N)
 * - `decomposed`: Renders sub-function blocks for a specific parent (e.g., F.1.1, F.1.2)
 *
 * Gate rendering:
 * - IT gates: subgraph with "IT" label and a loop-back arrow
 * - AND gates: subgraph with parallel branches that fork and rejoin
 * - OR gates: subgraph with conditional branches
 *
 * Core value blocks receive highlighted styling.
 *
 * @param ffbd - The complete FFBD data structure
 * @param level - Whether to render top-level or decomposed view
 * @param parentId - Required when level is 'decomposed' (e.g., "F.1")
 * @returns FFBD generator result with Mermaid syntax and validation
 *
 * @example
 * ```typescript
 * const result = generateFFBDDiagram(ffbd, 'top');
 * // result.mermaidSyntax contains flowchart LR Mermaid code
 * ```
 */
export function generateFFBDDiagram(
  ffbd: Ffbd,
  level: 'top' | 'decomposed',
  parentId?: string,
): FFBDGeneratorResult {
  // Select blocks based on level
  const blocks: FfbdBlock[] =
    level === 'top'
      ? ffbd.topLevelBlocks
      : ffbd.decomposedBlocks.filter((b) => b.parentId === parentId);

  // Filter connections to only those relevant to visible blocks
  const blockIds = new Set(blocks.map((b) => b.id));
  const connections = ffbd.connections.filter(
    (c) => blockIds.has(c.from) || blockIds.has(c.to),
  );

  const validation = validateFFBD(blocks, connections);
  const lines: string[] = [];

  lines.push('flowchart LR');
  lines.push('');

  // Collect gate-involved blocks to render them inside subgraphs
  const gatedConnections = connections.filter(
    (c) => c.gateType && c.gateType !== 'sequence',
  );

  // Group gated connections by source (fork point)
  const gateGroups = new Map<string, FfbdConnection[]>();
  gatedConnections.forEach((c) => {
    const existing = gateGroups.get(c.from) ?? [];
    existing.push(c);
    gateGroups.set(c.from, existing);
  });

  // Track blocks rendered inside gate subgraphs so we skip duplicates
  const renderedInGate = new Set<string>();

  // Render gate subgraphs
  let gateIdx = 0;
  gateGroups.forEach((gateConns, fromId) => {
    const gateType = gateConns[0].gateType;
    if (!gateType || gateType === 'sequence') return;

    gateIdx++;
    const gateId = `gate_${gateIdx}`;

    if (gateType === 'IT') {
      // IT gate: subgraph with loop-back
      const targetBlock = blocks.find((b) => b.id === gateConns[0].to);
      if (targetBlock) {
        const nodeId = sanitizeId(targetBlock.id);
        lines.push(`    subgraph ${gateId}["IT: ${escapeLabel(gateConns[0].condition ?? 'iterate')}"]`);
        lines.push(`        ${nodeId}["${escapeLabel(targetBlock.id)}\\n${escapeLabel(targetBlock.name)}"]`);
        lines.push('    end');
        lines.push(`    ${nodeId} -.->|"loop"| ${nodeId}`);
        renderedInGate.add(targetBlock.id);
      }
    } else if (gateType === 'AND') {
      // AND gate: parallel branches that fork and rejoin
      lines.push(`    subgraph ${gateId}["AND: parallel"]`);
      gateConns.forEach((gc) => {
        const targetBlock = blocks.find((b) => b.id === gc.to);
        if (targetBlock) {
          const nodeId = sanitizeId(targetBlock.id);
          lines.push(`        ${nodeId}["${escapeLabel(targetBlock.id)}\\n${escapeLabel(targetBlock.name)}"]`);
          renderedInGate.add(targetBlock.id);
        }
      });
      lines.push('    end');

      // Fork arrows from source to each parallel block
      const sourceNodeId = sanitizeId(fromId);
      gateConns.forEach((gc) => {
        const targetNodeId = sanitizeId(gc.to);
        lines.push(`    ${sourceNodeId} --> ${targetNodeId}`);
      });

      // Find the rejoin point — the next block after the gate targets
      const gateTargetIds = new Set(gateConns.map((gc) => gc.to));
      const rejoinConn = connections.find(
        (c) => gateTargetIds.has(c.from) && !gateTargetIds.has(c.to) && c.to !== fromId,
      );
      if (rejoinConn) {
        const rejoinNodeId = sanitizeId(rejoinConn.to);
        gateConns.forEach((gc) => {
          lines.push(`    ${sanitizeId(gc.to)} --> ${rejoinNodeId}`);
        });
      }
    } else if (gateType === 'OR') {
      // OR gate: conditional branches
      lines.push(`    subgraph ${gateId}["OR: decision"]`);
      gateConns.forEach((gc) => {
        const targetBlock = blocks.find((b) => b.id === gc.to);
        if (targetBlock) {
          const nodeId = sanitizeId(targetBlock.id);
          lines.push(`        ${nodeId}["${escapeLabel(targetBlock.id)}\\n${escapeLabel(targetBlock.name)}"]`);
          renderedInGate.add(targetBlock.id);
        }
      });
      lines.push('    end');

      // Conditional arrows from source
      const sourceNodeId = sanitizeId(fromId);
      gateConns.forEach((gc) => {
        const condLabel = gc.condition ? `|"${escapeLabel(gc.condition)}"| ` : '';
        lines.push(`    ${sourceNodeId} --> ${condLabel}${sanitizeId(gc.to)}`);
      });
    }

    lines.push('');
  });

  // Render non-gated blocks
  blocks.forEach((block) => {
    if (renderedInGate.has(block.id)) return;
    const nodeId = sanitizeId(block.id);
    lines.push(
      `    ${nodeId}["${escapeLabel(block.id)}\\n${escapeLabel(block.name)}"]`,
    );
  });

  lines.push('');

  // Render sequence connections (skip gate connections already rendered)
  const gateFromIds = new Set(gateGroups.keys());
  connections.forEach((conn) => {
    if (conn.gateType && conn.gateType !== 'sequence') return;
    // Skip if this connection's source is a gate fork point (already handled)
    if (gateFromIds.has(conn.from) && gatedConnections.some((gc) => gc.from === conn.from && gc.to === conn.to)) return;

    const fromNode = sanitizeId(conn.from);
    const toNode = sanitizeId(conn.to);

    if (conn.condition) {
      lines.push(`    ${fromNode} -->|"${escapeLabel(conn.condition)}"| ${toNode}`);
    } else {
      lines.push(`    ${fromNode} --> ${toNode}`);
    }
  });

  lines.push('');

  // Core value highlighting
  blocks.forEach((block) => {
    if (block.isCoreValue) {
      const nodeId = sanitizeId(block.id);
      lines.push(
        `    style ${nodeId} fill:#ffe0e0,stroke:#cc0000,stroke-width:3px`,
      );
    }
  });

  return {
    mermaidSyntax: lines.join('\n'),
    validation,
  };
}

// ============================================================
// 2. DFD Generator (Step 6)
// ============================================================

/**
 * Validation result for DFD diagram generation
 */
export interface DFDValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  subsystemCount: number;
  interfaceCount: number;
}

/**
 * Result from DFD diagram generation
 */
export interface DFDGeneratorResult {
  mermaidSyntax: string;
  validation: DFDValidation;
}

const DFD_MIN_SUBSYSTEMS = 2;
const DFD_MIN_INTERFACES = 1;

/** Color palette for interface categories */
const CATEGORY_COLORS: Record<string, string> = {
  'system-flow': '#2563eb',
  'critical': '#dc2626',
  'auth': '#7c3aed',
  'audit': '#059669',
};

/**
 * Validate Interfaces data for DFD generation.
 *
 * Hard gates:
 * - DFD-001: At least 2 subsystems
 * - DFD-002: At least 1 interface
 *
 * Warnings:
 * - DFD-W01: Subsystem with no interfaces (isolated)
 */
function validateDFD(interfaces: Interfaces): DFDValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const subsystemCount = interfaces.subsystems.length;
  const interfaceCount = interfaces.interfaces.length;

  // Hard Gate DFD-001
  if (subsystemCount < DFD_MIN_SUBSYSTEMS) {
    errors.push(
      `DFD-001: Insufficient subsystems (found: ${subsystemCount}, min: ${DFD_MIN_SUBSYSTEMS})`,
    );
  }

  // Hard Gate DFD-002
  if (interfaceCount < DFD_MIN_INTERFACES) {
    errors.push(
      `DFD-002: No interfaces defined (min: ${DFD_MIN_INTERFACES})`,
    );
  }

  // Warning DFD-W01: Isolated subsystems
  const connectedSubsystems = new Set<string>();
  interfaces.interfaces.forEach((iface) => {
    connectedSubsystems.add(iface.source);
    connectedSubsystems.add(iface.destination);
  });
  interfaces.subsystems.forEach((ss) => {
    if (!connectedSubsystems.has(ss.id)) {
      warnings.push(
        `DFD-W01: Subsystem '${ss.id}' (${ss.name}) has no interfaces — consider removing or connecting it`,
      );
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    subsystemCount,
    interfaceCount,
  };
}

/**
 * Generate a Data Flow Diagram (DFD) in Mermaid flowchart TB syntax.
 *
 * Layout:
 * - Internal subsystems are rectangles inside a "SYSTEM BOUNDARY" subgraph
 * - External entities (subsystem IDs referenced in interfaces but not in
 *   subsystems list) appear as rounded boxes outside the boundary
 * - Arrows are labeled with the data payload from each interface
 * - Arrows are color-coded by interface category
 *
 * @param interfaces - The complete Interfaces data structure
 * @returns DFD generator result with Mermaid syntax and validation
 *
 * @example
 * ```typescript
 * const result = generateDFDDiagram(interfaces);
 * // result.mermaidSyntax contains flowchart TB Mermaid code
 * ```
 */
export function generateDFDDiagram(interfaces: Interfaces): DFDGeneratorResult {
  const validation = validateDFD(interfaces);
  const lines: string[] = [];

  lines.push('flowchart TB');
  lines.push('');

  const subsystemIds = new Set(interfaces.subsystems.map((ss) => ss.id));

  // Identify external entities — sources or destinations not in subsystems
  const externalIds = new Set<string>();
  interfaces.interfaces.forEach((iface) => {
    if (!subsystemIds.has(iface.source)) externalIds.add(iface.source);
    if (!subsystemIds.has(iface.destination)) externalIds.add(iface.destination);
  });

  // External entities (outside boundary)
  externalIds.forEach((extId) => {
    const nodeId = sanitizeId(extId);
    lines.push(`    ${nodeId}(["${escapeLabel(extId)}"])`);
  });

  if (externalIds.size > 0) {
    lines.push('');
  }

  // System boundary subgraph
  lines.push('    subgraph SB["SYSTEM BOUNDARY"]');
  interfaces.subsystems.forEach((ss) => {
    const nodeId = sanitizeId(ss.id);
    lines.push(
      `        ${nodeId}["${escapeLabel(ss.id)}\\n${escapeLabel(ss.name)}"]`,
    );
  });
  lines.push('    end');
  lines.push('');

  // Interface arrows with labels
  interfaces.interfaces.forEach((iface) => {
    const fromNode = sanitizeId(iface.source);
    const toNode = sanitizeId(iface.destination);
    const label = escapeLabel(iface.dataPayload);

    lines.push(`    ${fromNode} -->|"${label}"| ${toNode}`);
  });

  lines.push('');

  // Category-based link styling
  interfaces.interfaces.forEach((iface, idx) => {
    const color = iface.category ? CATEGORY_COLORS[iface.category] : null;
    if (color) {
      lines.push(`    linkStyle ${idx} stroke:${color},stroke-width:2px`);
    }
  });

  return {
    mermaidSyntax: lines.join('\n'),
    validation,
  };
}

// ============================================================
// 3. Sequence Diagram Generator (Step 6)
// ============================================================

/**
 * Validation result for sequence diagram generation
 */
export interface SequenceDiagramValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  participantCount: number;
  messageCount: number;
}

/**
 * Result from sequence diagram generation
 */
export interface SequenceDiagramResult {
  mermaidSyntax: string;
  validation: SequenceDiagramValidation;
}

const SEQ_MIN_PARTICIPANTS = 2;
const SEQ_MIN_MESSAGES = 3;

/**
 * Validate inputs for sequence diagram generation.
 *
 * Hard gates:
 * - SEQ-001: At least 2 participants
 * - SEQ-002: At least 3 messages
 *
 * Warnings:
 * - SEQ-W01: Referenced interface ID not found in interfaces list
 */
function validateSequenceDiagram(
  participants: Subsystem[],
  relevantInterfaces: InterfaceSpec[],
  allInterfaceIds: Set<string>,
  relevantInterfaceIds: string[],
): SequenceDiagramValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Hard Gate SEQ-001
  if (participants.length < SEQ_MIN_PARTICIPANTS) {
    errors.push(
      `SEQ-001: Insufficient participants (found: ${participants.length}, min: ${SEQ_MIN_PARTICIPANTS})`,
    );
  }

  // Hard Gate SEQ-002
  if (relevantInterfaces.length < SEQ_MIN_MESSAGES) {
    errors.push(
      `SEQ-002: Insufficient messages (found: ${relevantInterfaces.length}, min: ${SEQ_MIN_MESSAGES})`,
    );
  }

  // Warning SEQ-W01: Missing interface references
  relevantInterfaceIds.forEach((ifId) => {
    if (!allInterfaceIds.has(ifId)) {
      warnings.push(
        `SEQ-W01: Interface ID '${ifId}' referenced but not found in interfaces list`,
      );
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    participantCount: participants.length,
    messageCount: relevantInterfaces.length,
  };
}

/**
 * Generate a Sequence Diagram in Mermaid sequenceDiagram syntax for a
 * specific use case.
 *
 * Renders the interaction flow between subsystems for a given use case,
 * with messages labeled by interface ID and data payload.
 *
 * @param interfaces - The complete Interfaces data structure
 * @param useCaseId - Identifier for the use case (e.g., "UC-01")
 * @param useCaseName - Human-readable use case name
 * @param relevantInterfaceIds - Interface IDs involved in this use case, in order
 * @returns Sequence diagram result with Mermaid syntax and validation
 *
 * @example
 * ```typescript
 * const result = generateSequenceDiagram(
 *   interfaces,
 *   'UC-01',
 *   'Request Heat Prediction',
 *   ['IF-01', 'IF-02', 'IF-03', 'IF-04'],
 * );
 * ```
 */
export function generateSequenceDiagram(
  interfaces: Interfaces,
  useCaseId: string,
  useCaseName: string,
  relevantInterfaceIds: string[],
): SequenceDiagramResult {
  // Build lookup maps
  const subsystemMap = new Map<string, Subsystem>();
  interfaces.subsystems.forEach((ss) => subsystemMap.set(ss.id, ss));

  const interfaceMap = new Map<string, InterfaceSpec>();
  interfaces.interfaces.forEach((iface) => interfaceMap.set(iface.id, iface));

  const allInterfaceIds = new Set(interfaces.interfaces.map((i) => i.id));

  // Resolve relevant interfaces in order
  const relevantInterfaces = relevantInterfaceIds
    .map((id) => interfaceMap.get(id))
    .filter((iface): iface is InterfaceSpec => iface !== undefined);

  // Collect unique participants from relevant interfaces
  const participantIds = new Set<string>();
  relevantInterfaces.forEach((iface) => {
    participantIds.add(iface.source);
    participantIds.add(iface.destination);
  });
  const participants = Array.from(participantIds)
    .map((id) => subsystemMap.get(id))
    .filter((ss): ss is Subsystem => ss !== undefined);

  const validation = validateSequenceDiagram(
    participants,
    relevantInterfaces,
    allInterfaceIds,
    relevantInterfaceIds,
  );

  const lines: string[] = [];

  lines.push('sequenceDiagram');
  lines.push(`    title ${useCaseId}: ${escapeLabel(useCaseName)}`);
  lines.push('');

  // Declare participants
  participants.forEach((ss) => {
    lines.push(`    participant ${sanitizeId(ss.id)} as ${escapeLabel(ss.name)}`);
  });
  lines.push('');

  // Note block for use case context
  if (participants.length >= 2) {
    const firstParticipant = sanitizeId(participants[0].id);
    const lastParticipant = sanitizeId(participants[participants.length - 1].id);
    lines.push(
      `    Note over ${firstParticipant},${lastParticipant}: ${escapeLabel(useCaseName)}`,
    );
    lines.push('');
  }

  // Messages in order
  relevantInterfaces.forEach((iface) => {
    const fromNode = sanitizeId(iface.source);
    const toNode = sanitizeId(iface.destination);
    const label = `${iface.id}: ${iface.name} (${iface.dataPayload})`;

    lines.push(`    ${fromNode}->>+${toNode}: ${escapeLabel(label)}`);
  });

  // Add deactivations (simple: deactivate each destination after all messages)
  const activatedIds = new Set<string>();
  relevantInterfaces.forEach((iface) => activatedIds.add(sanitizeId(iface.destination)));
  lines.push('');
  activatedIds.forEach((nodeId) => {
    lines.push(`    deactivate ${nodeId}`);
  });

  return {
    mermaidSyntax: lines.join('\n'),
    validation,
  };
}

// ============================================================
// 4. N2 Chart Generator (Step 6)
// ============================================================

/**
 * Validation result for N2 chart generation
 */
export interface N2ChartValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  subsystemCount: number;
  cellCount: number;
}

/**
 * Result from N2 chart generation (HTML table, not Mermaid)
 */
export interface N2ChartResult {
  htmlTable: string;
  validation: N2ChartValidation;
}

const N2_MIN_SUBSYSTEMS = 2;

/**
 * Validate Interfaces data for N2 chart generation.
 *
 * Hard gates:
 * - N2-001: At least 2 subsystems
 *
 * Warnings:
 * - N2-W01: Row with all empty cells (isolated subsystem)
 */
function validateN2Chart(interfaces: Interfaces): N2ChartValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const subsystemCount = interfaces.subsystems.length;

  // Hard Gate N2-001
  if (subsystemCount < N2_MIN_SUBSYSTEMS) {
    errors.push(
      `N2-001: Insufficient subsystems (found: ${subsystemCount}, min: ${N2_MIN_SUBSYSTEMS})`,
    );
  }

  // Count non-empty cells and check for isolated rows
  let cellCount = 0;
  const n2 = interfaces.n2Chart ?? {};
  interfaces.subsystems.forEach((ss) => {
    const row = n2[ss.id] ?? {};
    const rowValues = Object.values(row).filter((v) => v && v.trim() !== '');
    cellCount += rowValues.length;

    // Also check if this subsystem appears as a destination in any other row
    const isDestination = Object.values(n2).some(
      (fromRow) => fromRow[ss.id] && fromRow[ss.id].trim() !== '',
    );

    if (rowValues.length === 0 && !isDestination) {
      warnings.push(
        `N2-W01: Subsystem '${ss.id}' (${ss.name}) has no N2 entries — isolated in the chart`,
      );
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    subsystemCount,
    cellCount,
  };
}

/**
 * Generate an N2 Chart as an HTML table string.
 *
 * N2 charts are interface matrices where:
 * - Diagonal cells show subsystem names (highlighted)
 * - Off-diagonal cells show the data payload flowing from the row
 *   subsystem to the column subsystem
 * - Empty cells are displayed as "---"
 *
 * CSS classes are applied for interface category color-coding:
 * - `.n2-system-flow` — blue
 * - `.n2-critical` — red
 * - `.n2-auth` — purple
 * - `.n2-audit` — green
 *
 * @param interfaces - The complete Interfaces data structure
 * @returns N2 chart result with HTML table string and validation
 *
 * @example
 * ```typescript
 * const result = generateN2Chart(interfaces);
 * // result.htmlTable contains a complete <table> element
 * ```
 */
export function generateN2Chart(interfaces: Interfaces): N2ChartResult {
  const validation = validateN2Chart(interfaces);
  const subsystems = interfaces.subsystems;
  const n2 = interfaces.n2Chart ?? {};

  // Build a lookup from (source, dest) to interface category
  const categoryLookup = new Map<string, string>();
  interfaces.interfaces.forEach((iface) => {
    const key = `${iface.source}::${iface.destination}`;
    if (iface.category) {
      categoryLookup.set(key, iface.category);
    }
  });

  const rows: string[] = [];

  // Inline styles for the table
  rows.push('<table class="n2-chart" style="border-collapse:collapse;width:100%;font-size:13px;">');

  // CSS class styles embedded as a style block
  rows.push('<style>');
  rows.push('  .n2-chart th, .n2-chart td { border:1px solid #d1d5db; padding:8px 10px; text-align:center; vertical-align:middle; }');
  rows.push('  .n2-chart th { background:#f3f4f6; font-weight:600; }');
  rows.push('  .n2-diagonal { background:#e0e7ff; font-weight:700; }');
  rows.push('  .n2-empty { color:#9ca3af; }');
  rows.push('  .n2-system-flow { background:#eff6ff; color:#1d4ed8; }');
  rows.push('  .n2-critical { background:#fef2f2; color:#b91c1c; }');
  rows.push('  .n2-auth { background:#f5f3ff; color:#6d28d9; }');
  rows.push('  .n2-audit { background:#ecfdf5; color:#047857; }');
  rows.push('</style>');

  // Header row
  rows.push('<thead><tr>');
  rows.push(`  <th>FROM &#x2193; / &#x2192; TO &#x2192;</th>`);
  subsystems.forEach((ss) => {
    rows.push(`  <th>${escapeHtml(ss.id)}<br/>${escapeHtml(ss.name)}</th>`);
  });
  rows.push('</tr></thead>');

  // Data rows
  rows.push('<tbody>');
  subsystems.forEach((fromSs) => {
    rows.push('<tr>');
    rows.push(`  <th>${escapeHtml(fromSs.id)}<br/>${escapeHtml(fromSs.name)}</th>`);

    subsystems.forEach((toSs) => {
      if (fromSs.id === toSs.id) {
        // Diagonal cell
        rows.push(`  <td class="n2-diagonal">${escapeHtml(fromSs.name)}</td>`);
      } else {
        const payload = n2[fromSs.id]?.[toSs.id];
        if (payload && payload.trim() !== '') {
          // Determine CSS class from interface category
          const catKey = `${fromSs.id}::${toSs.id}`;
          const category = categoryLookup.get(catKey);
          const cssClass = category ? ` n2-${category}` : '';
          rows.push(`  <td class="n2-cell${cssClass}">${escapeHtml(payload)}</td>`);
        } else {
          rows.push('  <td class="n2-empty">&mdash;</td>');
        }
      }
    });

    rows.push('</tr>');
  });
  rows.push('</tbody>');

  rows.push('</table>');

  return {
    htmlTable: rows.join('\n'),
    validation,
  };
}
