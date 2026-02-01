/**
 * Pre-defined Question Bank
 *
 * Contains all intake questions organized by PRD-SPEC artifact phases.
 * Each question is tied to specific hard gates and extraction targets.
 *
 * @module intake/questions
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { type Question, type QuestionPhase } from './question-bank';

// Re-export Question type for convenience
export type { Question } from './question-bank';

/**
 * Complete question bank for intake conversations.
 * Questions are organized by phase and include:
 * - PRD-SPEC hard gate references
 * - Dependencies on prior questions
 * - Skip conditions for efficiency
 * - Clarification prompts for vague answers
 */
export const INTAKE_QUESTIONS: Question[] = [
  // ============================================================
  // Phase: Actors (PRD-SPEC HG2, HG3)
  // ============================================================
  {
    id: 'Q_ACTORS_PRIMARY',
    phase: 'actors',
    text: 'Who are the primary users of this system? (e.g., customers, admins, managers)',
    shortText: 'primary users',
    basePriority: 10,
    prdSpecGate: 'PRIMARY_ACTORS_DEFINED',
    requires: [],
    requiresData: [],
    extractsTo: ['actors'],
    canInferFrom: ['vision'],
    clarificationPrompts: [
      'Can you describe what each user type does?',
      'Are there different permission levels for these users?',
    ],
    skipCondition: 'actors.length >= 2',
  },
  {
    id: 'Q_ACTORS_SECONDARY',
    phase: 'actors',
    text: 'Are there any secondary users or support roles? (e.g., support staff, auditors)',
    shortText: 'secondary users',
    basePriority: 7,
    prdSpecGate: 'PRIMARY_ACTORS_DEFINED',
    requires: ['Q_ACTORS_PRIMARY'],
    requiresData: ['actors'],
    extractsTo: ['actors'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'actors.length >= 3',
  },
  {
    id: 'Q_ACTORS_ROLES',
    phase: 'actors',
    text: 'What permissions does each user type have? What can they do vs. what is restricted?',
    shortText: 'user permissions',
    basePriority: 8,
    prdSpecGate: 'ROLES_PERMISSIONS_DEFINED',
    requires: ['Q_ACTORS_PRIMARY'],
    requiresData: ['actors'],
    extractsTo: ['actors.permissions'],
    canInferFrom: [],
    clarificationPrompts: [
      'Are there any admin-only features?',
      'Can all users access all data?',
    ],
  },

  // ============================================================
  // Phase: External Systems (PRD-SPEC HG1, HG4)
  // ============================================================
  {
    id: 'Q_EXTERNAL_SYSTEMS',
    phase: 'external_systems',
    text: 'Does your system integrate with any external services? (e.g., payment gateways, email services, third-party APIs)',
    shortText: 'external integrations',
    basePriority: 9,
    prdSpecGate: 'EXTERNAL_ENTITIES_DEFINED',
    requires: [],
    requiresData: [],
    extractsTo: ['systemBoundaries.external'],
    canInferFrom: ['vision'],
    clarificationPrompts: [
      'How does your system communicate with these services?',
      'Are these integrations required or optional?',
    ],
  },
  {
    id: 'Q_EXTERNAL_DATA',
    phase: 'external_systems',
    text: 'Does your system receive data from external sources? (e.g., imports, webhooks, feeds)',
    shortText: 'external data sources',
    basePriority: 6,
    prdSpecGate: 'EXTERNAL_ENTITIES_DEFINED',
    requires: ['Q_EXTERNAL_SYSTEMS'],
    requiresData: [],
    extractsTo: ['systemBoundaries.external'],
    canInferFrom: [],
    clarificationPrompts: [],
  },

  // ============================================================
  // Phase: Use Cases (PRD-SPEC HG5, HG6)
  // ============================================================
  {
    id: 'Q_USE_CASES_CORE',
    phase: 'use_cases',
    text: 'What are the 3-5 most important things a user can do with your system?',
    shortText: 'core use cases',
    basePriority: 10,
    prdSpecGate: 'USE_CASE_LIST_5_TO_15',
    requires: ['Q_ACTORS_PRIMARY'],
    requiresData: ['actors'],
    extractsTo: ['useCases'],
    canInferFrom: ['vision'],
    clarificationPrompts: [
      'What triggers this action?',
      'What is the expected outcome?',
    ],
    skipCondition: 'useCases.length >= 5',
  },
  {
    id: 'Q_USE_CASES_SECONDARY',
    phase: 'use_cases',
    text: 'What are some additional actions users might take? Think about settings, reports, or edge cases.',
    shortText: 'additional use cases',
    basePriority: 6,
    prdSpecGate: 'USE_CASE_LIST_5_TO_15',
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
    extractsTo: ['useCases'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'useCases.length >= 8',
  },
  {
    id: 'Q_USE_CASE_TRIGGERS',
    phase: 'use_cases',
    text: 'For each action, what triggers it? (e.g., user clicks button, scheduled job, webhook)',
    shortText: 'triggers',
    basePriority: 7,
    prdSpecGate: 'USE_CASE_TRIGGER_OUTCOME',
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
    extractsTo: ['useCases.trigger'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'useCases.every(uc => uc.trigger)',
  },
  {
    id: 'Q_USE_CASE_OUTCOMES',
    phase: 'use_cases',
    text: 'What is the expected outcome when each action completes successfully?',
    shortText: 'outcomes',
    basePriority: 7,
    prdSpecGate: 'USE_CASE_TRIGGER_OUTCOME',
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
    extractsTo: ['useCases.outcome'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'useCases.every(uc => uc.outcome)',
  },

  // ============================================================
  // Phase: Scope (PRD-SPEC HG1)
  // ============================================================
  {
    id: 'Q_SCOPE_IN',
    phase: 'scope',
    text: 'What features are definitely IN scope for this release?',
    shortText: 'in-scope features',
    basePriority: 8,
    prdSpecGate: 'SYSTEM_BOUNDARY_DEFINED',
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
    extractsTo: ['systemBoundaries.inScope'],
    canInferFrom: ['useCases'],
    clarificationPrompts: [],
  },
  {
    id: 'Q_SCOPE_OUT',
    phase: 'scope',
    text: 'What features are explicitly OUT of scope or deferred to a future release?',
    shortText: 'out-of-scope features',
    basePriority: 8,
    prdSpecGate: 'SYSTEM_BOUNDARY_DEFINED',
    requires: ['Q_SCOPE_IN'],
    requiresData: ['systemBoundaries.inScope'],
    extractsTo: ['systemBoundaries.outOfScope'],
    canInferFrom: [],
    clarificationPrompts: [
      'Are there features users might expect but you do not plan to build?',
    ],
  },

  // ============================================================
  // Phase: Data Entities (PRD-SPEC HG9)
  // ============================================================
  {
    id: 'Q_DATA_ENTITIES',
    phase: 'data_entities',
    text: 'What are the main data objects in your system? (e.g., User, Order, Product, Report)',
    shortText: 'data objects',
    basePriority: 8,
    prdSpecGate: 'CORE_DATA_OBJECTS_DEFINED',
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
    extractsTo: ['dataEntities'],
    canInferFrom: ['useCases'],
    clarificationPrompts: [
      'What attributes does each object have?',
      'How do these objects relate to each other?',
    ],
    skipCondition: 'dataEntities.length >= 3',
  },
  {
    id: 'Q_DATA_RELATIONSHIPS',
    phase: 'data_entities',
    text: 'How do these data objects relate to each other? (e.g., User has many Orders)',
    shortText: 'data relationships',
    basePriority: 6,
    prdSpecGate: 'CORE_DATA_OBJECTS_DEFINED',
    requires: ['Q_DATA_ENTITIES'],
    requiresData: ['dataEntities'],
    extractsTo: ['dataEntities.relationships'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'dataEntities.every(e => e.relationships?.length > 0)',
  },

  // ============================================================
  // Phase: Constraints (PRD-SPEC HG8)
  // ============================================================
  {
    id: 'Q_CONSTRAINTS_BUSINESS',
    phase: 'constraints',
    text: 'Are there any business constraints? (e.g., budget limits, timeline, regulatory requirements)',
    shortText: 'business constraints',
    basePriority: 5,
    prdSpecGate: 'CONSTRAINTS_PRESENT',
    requires: [],
    requiresData: [],
    extractsTo: ['constraints.business'],
    canInferFrom: [],
    clarificationPrompts: [],
  },
  {
    id: 'Q_CONSTRAINTS_TECHNICAL',
    phase: 'constraints',
    text: 'Are there any technical constraints? (e.g., must use specific tech stack, integrate with legacy systems)',
    shortText: 'technical constraints',
    basePriority: 5,
    prdSpecGate: 'CONSTRAINTS_PRESENT',
    requires: [],
    requiresData: [],
    extractsTo: ['constraints.technical'],
    canInferFrom: [],
    clarificationPrompts: [],
  },

  // ============================================================
  // Phase: Success Criteria (PRD-SPEC HG7)
  // ============================================================
  {
    id: 'Q_SUCCESS_CRITERIA',
    phase: 'success_criteria',
    text: 'How will you measure success for this project? (e.g., user adoption rate, transaction volume, response time)',
    shortText: 'success metrics',
    basePriority: 4,
    prdSpecGate: 'SUCCESS_CRITERIA_MEASURABLE',
    requires: [],
    requiresData: [],
    extractsTo: ['successCriteria'],
    canInferFrom: [],
    clarificationPrompts: [
      'Do you have specific target numbers in mind?',
      'Who is responsible for tracking these metrics?',
    ],
  },
];

/**
 * Phase priority order for sequential artifact generation.
 * Questions in earlier phases should generally be asked before later phases.
 */
export const PHASE_ORDER: QuestionPhase[] = [
  'actors',
  'external_systems',
  'use_cases',
  'scope',
  'data_entities',
  'constraints',
  'success_criteria',
];

/**
 * Mapping of artifacts to required question phases.
 * Used to determine when an artifact can be generated.
 */
export const ARTIFACT_QUESTION_MAP: Record<string, QuestionPhase[]> = {
  context_diagram: ['actors', 'external_systems'],
  use_case_diagram: ['actors', 'use_cases'],
  scope_tree: ['scope'],
  ucbd: ['use_cases'],
  requirements_table: ['use_cases', 'constraints'],
  constants_table: ['constraints'],
  sysml_activity_diagram: ['use_cases', 'data_entities'],
};

/**
 * Get questions for a specific phase
 * @param phase - The question phase to filter by
 * @returns Array of questions in that phase
 */
export function getQuestionsByPhase(phase: QuestionPhase): Question[] {
  return INTAKE_QUESTIONS.filter(q => q.phase === phase);
}

/**
 * Get a question by its ID
 * @param id - Question ID
 * @returns Question or undefined if not found
 */
export function getQuestionById(id: string): Question | undefined {
  return INTAKE_QUESTIONS.find(q => q.id === id);
}

/**
 * Get questions that target a specific PRD-SPEC gate
 * @param gate - The hard gate identifier
 * @returns Array of questions addressing that gate
 */
export function getQuestionsByGate(gate: string): Question[] {
  return INTAKE_QUESTIONS.filter(q => q.prdSpecGate === gate);
}
