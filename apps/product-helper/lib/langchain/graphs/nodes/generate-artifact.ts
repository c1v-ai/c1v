/**
 * Generate Artifact Node
 *
 * Purpose: Generate the current artifact using PRD-SPEC templates.
 * Produces Mermaid diagrams or markdown tables based on extracted data.
 *
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * @module graphs/nodes/generate-artifact
 */

import { extractionLLM } from '../../config';
import { AIMessage } from '@langchain/core/messages';
import { IntakeState, ArtifactPhase, getPhaseDisplayName, getNextPhase, phaseToKBStep } from '../types';
import { ExtractionResult } from '../../schemas';
import { getNextKBStep } from '../../agents/intake/kb-question-generator';

// ============================================================
// LLM Configuration
// ============================================================

/**
 * LLM for artifact generation
 * Uses Claude Sonnet via central config (extractionLLM has temp 0.2 for consistent output)
 */
const artifactLLM = extractionLLM;

// ============================================================
// Diagram Templates
// ============================================================

/**
 * Mermaid diagram templates by artifact type
 * Each template includes the diagram type and generation instructions
 */
export const DIAGRAM_TEMPLATES: Record<ArtifactPhase, {
  type: string;
  instructions: string;
}> = {
  context_diagram: {
    type: 'C4Context',
    instructions: `Generate a C4 Context diagram showing:
- Central system in the middle (as a rectangle)
- External actors around the system (as person shapes)
- External systems with labeled interactions (as rectangles)
- Arrows showing data/interaction flow with labels
Use: graph TB with clear labels and styling`,
  },
  use_case_diagram: {
    type: 'Use Case',
    instructions: `Generate a Use Case diagram showing:
- System boundary box (as a subgraph)
- Actors on the left (as text nodes)
- Use cases as ovals/rounded rectangles inside boundary
- Actor-usecase connections with arrows
- Include <<include>> and <<extends>> relationships if present
Use proper UML notation with graph LR or TB`,
  },
  scope_tree: {
    type: 'Mindmap',
    instructions: `Generate a scope tree showing:
- Root: System name at center
- Branch 1: "In Scope" (with all in-scope items as children)
- Branch 2: "Out of Scope" (with excluded items, or "To be defined")
Use: mindmap syntax or graph TD with clear hierarchy`,
  },
  ucbd: {
    type: 'Sequence',
    instructions: `Generate a UCBD (Use Case Behavior Document) diagram showing:
- Actors as participants on the left
- System as participant on the right
- Steps as messages between actors and system
- Preconditions as notes at top
- Postconditions as notes at bottom
- Alt/opt boxes for conditional flows
Use: sequenceDiagram syntax`,
  },
  requirements_table: {
    type: 'Table',
    instructions: `Generate a requirements table (not a diagram).
Return a markdown table with columns:
| ID | Name | Description | Source | Priority | Testability |

Requirements should:
- Use "shall" language (The system SHALL...)
- Be traceable to use cases
- Be testable
- Have clear priorities (Critical/High/Medium/Low)`,
  },
  constants_table: {
    type: 'Table',
    instructions: `Generate a constants table (not a diagram).
Return a markdown table with columns:
| Name | Value | Units | Description | Category |

Constants should include:
- Performance limits (timeouts, rate limits)
- Security parameters (session duration, max attempts)
- Business rules (min/max values)
- UI defaults (page sizes, display limits)`,
  },
  sysml_activity_diagram: {
    type: 'Activity',
    instructions: `Generate a SysML Activity diagram showing:
- Start node (filled circle)
- Action nodes for each step (rectangles)
- Decision diamonds for branches
- Fork/join bars for parallel flows
- End node (bullseye)
Use: flowchart TD syntax with clear labels and proper decision notation`,
  },
};

// ============================================================
// Main Node Function
// ============================================================

/**
 * Generate an artifact for the current phase
 *
 * This node:
 * 1. Selects appropriate diagram template for current phase
 * 2. Formats extracted data for the diagram
 * 3. Generates Mermaid syntax (or markdown table)
 * 4. Returns artifact content for rendering
 *
 * @param state - Current intake state
 * @returns Partial state with pendingArtifact, messages, and generatedArtifacts
 *
 * @example
 * // For context_diagram phase:
 * {
 *   pendingArtifact: { type: 'context_diagram', content: '```mermaid\ngraph TB...' },
 *   messages: [AIMessage: "Here's your context diagram:..."],
 *   generatedArtifacts: ['context_diagram']
 * }
 */
export async function generateArtifact(
  state: IntakeState
): Promise<Partial<IntakeState>> {
  const { currentPhase, extractedData, projectName } = state;
  const template = DIAGRAM_TEMPLATES[currentPhase];
  const displayName = getPhaseDisplayName(currentPhase);

  // Format data for prompt
  const dataContext = formatDataForArtifact(currentPhase, extractedData, projectName);

  try {
    const prompt = `Generate a ${template.type} for "${projectName}".

${template.instructions}

## Data to Include:
${dataContext}

## Output Rules:
1. If generating a diagram, wrap in \`\`\`mermaid code fences
2. If generating a table, use proper markdown table syntax
3. Include all relevant data points from the provided data
4. Use clear, professional labels
5. Add appropriate Mermaid styling (classDef, style)
6. Keep node labels concise but descriptive

Generate the ${displayName} now:`;

    const response = await artifactLLM.invoke(prompt);
    const content = response.content as string;

    // Build summary of extracted data
    const actorsSummary = extractedData.actors.length > 0
      ? `**${extractedData.actors.length} Actors:** ${extractedData.actors.map(a => `${a.name} (${a.role})`).join(', ')}`
      : '';

    const useCasesSummary = extractedData.useCases.length > 0
      ? `**${extractedData.useCases.length} Use Cases:** ${extractedData.useCases.map(uc => uc.name).join(', ')}`
      : '';

    const entitiesSummary = extractedData.dataEntities.length > 0
      ? `**${extractedData.dataEntities.length} Data Entities:** ${extractedData.dataEntities.map(e => e.name).join(', ')}`
      : '';

    const summaryParts = [actorsSummary, useCasesSummary, entitiesSummary].filter(Boolean);
    const extractionSummary = summaryParts.length > 0
      ? `Based on your input, I've identified:\n${summaryParts.join('\n')}\n\n`
      : '';

    // Create AI message with the artifact
    const aiMessage = new AIMessage(
      `${extractionSummary}Here's your ${displayName}:\n\n${content}\n\nWould you like me to refine this, or shall we continue to the next artifact?`
    );

    // Advance to the next KB step and phase after artifact generation
    const nextPhase = getNextPhase(currentPhase);
    const nextKBStep = getNextKBStep(state.currentKBStep);

    return {
      pendingArtifact: {
        type: currentPhase,
        content,
      },
      messages: [aiMessage],
      generatedArtifacts: [currentPhase],
      // Advance phase and KB step
      ...(nextPhase ? { currentPhase: nextPhase } : {}),
      ...(nextKBStep ? {
        currentKBStep: nextKBStep,
        kbStepConfidence: 0,
        kbStepData: {},
        approvalPending: false,
      } : {}),
    };
  } catch (error) {
    console.error('Artifact generation error:', error);

    // Return error message
    const errorMessage = new AIMessage(
      `I encountered an issue generating the ${displayName}. Let me try a simpler version or we can continue gathering more information.`
    );

    return {
      error: `Failed to generate ${currentPhase}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      messages: [errorMessage],
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format extracted data for artifact generation
 * Creates a structured context string for each artifact type
 *
 * @param phase - Current artifact phase
 * @param data - Extracted PRD data
 * @param projectName - Name of the project
 * @returns Formatted string for inclusion in prompt
 */
export function formatDataForArtifact(
  phase: ArtifactPhase,
  data: ExtractionResult,
  projectName: string
): string {
  switch (phase) {
    case 'context_diagram':
      return `
System: ${projectName}

Actors:
${data.actors.map(a => `- ${a.name} (${a.role}): ${a.description}`).join('\n') || '- No actors defined'}

External Systems:
${data.systemBoundaries.external.map(e => `- ${e}`).join('\n') || '- None identified (standalone system)'}

Internal Components:
${data.systemBoundaries.internal.map(i => `- ${i}`).join('\n') || '- Core system functionality'}
`;

    case 'use_case_diagram':
      return `
System: ${projectName}

Actors:
${data.actors.map(a => `- ${a.name} (${a.role})`).join('\n') || '- User'}

Use Cases:
${data.useCases.map(uc => `- ${uc.id}: ${uc.name} (Actor: ${uc.actor || 'User'})`).join('\n') || '- No use cases defined'}

Relationships:
${data.useCases
  .filter(uc => uc.preconditions?.length)
  .map(uc => `- ${uc.name} <<include>> ${uc.preconditions?.[0]}`)
  .join('\n') || '- Standard relationships'}
`;

    case 'scope_tree':
      return `
System: ${projectName}

In Scope:
${data.systemBoundaries.internal.map(s => `- ${s}`).join('\n') || '- Core features (to be defined)'}

Out of Scope:
- Future enhancements
- Advanced integrations
- (To be refined based on requirements)

Actors/Users:
${data.actors.map(a => `- ${a.name}`).join('\n') || '- End users'}
`;

    case 'ucbd':
      // Find the most detailed use case
      const primaryUC = data.useCases.find(uc =>
        (uc.preconditions?.length ?? 0) > 0 || (uc.postconditions?.length ?? 0) > 0
      ) || data.useCases[0];

      return `
Use Case: ${primaryUC?.name || 'Primary Flow'}
ID: ${primaryUC?.id || 'UC1'}
Actor: ${primaryUC?.actor || data.actors[0]?.name || 'User'}

Preconditions:
${primaryUC?.preconditions?.map(p => `- ${p}`).join('\n') || '- User is authenticated\n- System is available'}

Main Steps:
${primaryUC?.description || '1. User initiates action\n2. System processes request\n3. System returns result\n4. User views result'}

Postconditions:
${primaryUC?.postconditions?.map(p => `- ${p}`).join('\n') || '- Operation completed successfully\n- State updated'}

Alternative Flows:
- Error handling for invalid input
- Timeout handling
`;

    case 'requirements_table':
      return `
Project: ${projectName}

Use Cases for Derivation:
${data.useCases.map(uc => `- ${uc.id}: ${uc.name} - ${uc.description || 'No description'}`).join('\n') || '- Standard CRUD operations'}

Actors:
${data.actors.map(a => `- ${a.name}: ${a.description}`).join('\n') || '- End User'}

System Boundaries:
- Internal: ${data.systemBoundaries.internal.join(', ') || 'Core functionality'}
- External: ${data.systemBoundaries.external.join(', ') || 'Standalone'}

Data Entities:
${data.dataEntities.map(e => `- ${e.name}: ${e.attributes.join(', ')}`).join('\n') || '- Core data objects'}
`;

    case 'constants_table':
      return `
Project: ${projectName}

Context:
- Use Cases: ${data.useCases.length}
- Actors: ${data.actors.map(a => a.name).join(', ') || 'User'}
- External Systems: ${data.systemBoundaries.external.join(', ') || 'None'}

Consider constants for:
- Authentication/session management
- Rate limiting and performance
- Business rule thresholds
- UI/UX defaults
- Integration timeouts
`;

    case 'sysml_activity_diagram':
      // Use the most detailed use case for activity diagram
      const uc = data.useCases[0];
      return `
Use Case: ${uc?.name || 'Main Flow'}
Description: ${uc?.description || 'Primary workflow'}
Actor: ${uc?.actor || 'User'}

Preconditions:
${uc?.preconditions?.map(p => `- ${p}`).join('\n') || '- User is logged in'}

Expected Steps:
1. User initiates the action
2. System validates the request
3. Decision: Is request valid?
   - Yes: Process the request
   - No: Show error, return to step 1
4. System updates state
5. System confirms completion
6. End

Postconditions:
${uc?.postconditions?.map(p => `- ${p}`).join('\n') || '- Action completed'}
`;

    default:
      return `Project: ${projectName}\nPhase: ${phase}`;
  }
}

/**
 * Validate generated artifact content
 * Checks for proper Mermaid syntax or markdown table format
 *
 * @param content - Generated artifact content
 * @param phase - Artifact phase (diagram vs table)
 * @returns True if content appears valid
 */
export function validateArtifactContent(content: string, phase: ArtifactPhase): boolean {
  // Check for mermaid code fence
  const isMermaidPhase = !['requirements_table', 'constants_table'].includes(phase);

  if (isMermaidPhase) {
    return content.includes('```mermaid') || content.includes('graph ') || content.includes('sequenceDiagram');
  }

  // Check for markdown table
  return content.includes('|') && content.includes('---');
}
