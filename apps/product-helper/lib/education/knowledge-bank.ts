/**
 * Knowledge Bank Types and Data
 *
 * TypeScript types and hardcoded content extracted from the Phase 12
 * knowledge bank markdown files. These types power the educational
 * UI components (thinking states, tooltips, validation errors) used
 * during the guided project exploration flow.
 */

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

/** A message shown during AI processing to educate the user while they wait. */
export interface ThinkingMessage {
  /** Prominent headline text, e.g. "Identifying actors in your system..." */
  headline: string;
  /** Educational tip shown as secondary text during the wait. */
  tip: string;
  /** Duration in milliseconds to display this message before cycling. */
  duration: number;
}

/** An inline tooltip definition for a key requirements-engineering term. */
export interface TooltipTerm {
  /** The term itself, e.g. "Actor". */
  term: string;
  /** A concise definition (15-word max target). */
  definition: string;
}

/** A validation error shown when a user makes a common mistake. */
export interface ValidationError {
  /** Short error summary with a placeholder for the offending element. */
  error: string;
  /** Explanation of why this is a problem. */
  why: string;
  /** Actionable fix suggestion. */
  fix: string;
}

/** Identifies which knowledge bank step the data belongs to. */
export type KnowledgeBankStep =
  | 'context-diagram'
  | 'use-case-diagram'
  | 'scope-tree'
  | 'ucbd'
  | 'functional-requirements'
  | 'sysml-activity-diagram';

/** A complete knowledge bank entry for a single step. */
export interface KnowledgeBankEntry {
  step: KnowledgeBankStep;
  label: string;
  thinkingMessages: ThinkingMessage[];
  tooltipTerms: TooltipTerm[];
  validationErrors: Record<string, ValidationError>;
}

// ---------------------------------------------------------------------------
// Data: Context Diagram (Step 1.1)
// ---------------------------------------------------------------------------

export const contextDiagramThinking: ThinkingMessage[] = [
  {
    headline: 'Identifying actors in your system...',
    tip: "Actors aren't just users -- they're anyone or anything that interacts with your system directly.",
    duration: 4000,
  },
  {
    headline: 'Mapping system interactions...',
    tip: 'Each line shows what flows TO and FROM your system. We are capturing the boundary of your control.',
    duration: 4000,
  },
  {
    headline: 'Checking for undesired interactions...',
    tip: '"All mistakes are made on the first day" -- by thinking about hackers, failures, and edge cases now, you prevent expensive surprises later.',
    duration: 5000,
  },
  {
    headline: 'Validating the system boundary...',
    tip: "Inside the dashed line = what you control. Outside = what you don't. This distinction prevents scope creep.",
    duration: 4000,
  },
  {
    headline: 'Checking formatting standards...',
    tip: 'Rectilinear lines, square corners, black and white only. Professional standards ensure your work is taken seriously.',
    duration: 4000,
  },
];

export const contextDiagramTooltips: TooltipTerm[] = [
  {
    term: 'The System',
    definition:
      "We don't name it yet because naming narrows your solution space.",
  },
  {
    term: 'Actor',
    definition:
      'Anyone or anything that directly interacts with your system.',
  },
  {
    term: 'System Boundary',
    definition:
      "The dashed line separating what you control from what you don't.",
  },
  {
    term: 'Interaction',
    definition:
      'What flows between your system and an external element.',
  },
  {
    term: 'Primary Stakeholder',
    definition:
      'Someone who directly uses or is immediately affected by your system.',
  },
  {
    term: 'Secondary Stakeholder',
    definition:
      "Someone who doesn't use it directly but influences or is affected by it.",
  },
  {
    term: 'Rectilinear Lines',
    definition:
      'Lines with only 90-degree angles -- the professional standard for diagrams.',
  },
];

export const contextDiagramValidationErrors: Record<string, ValidationError> = {
  missing_interaction: {
    error: "'{element}' has no interactions defined",
    why: "Every external element affects your system somehow. If it doesn't interact, why is it on the diagram?",
    fix: 'Ask: What does {element} do TO your system? What does your system do FOR {element}?',
  },
  internal_component: {
    error: "'{element}' appears to be an internal component",
    why: "Context diagrams show what you DON'T control. Internal components are things you'll build.",
    fix: "Ask: Can I change the design of this? If yes, it's internal -- remove it.",
  },
  property_not_actor: {
    error: "'{element}' is a property, not an actor",
    why: "Properties like 'security' or 'speed' aren't things that interact -- they're qualities you want.",
    fix: 'What external thing CAUSES you to need this property? Add that instead.',
  },
  system_split: {
    error: 'The System has been split into subsystems',
    why: 'Splitting locks you into a specific architecture too early. Keep all possibilities open.',
    fix: "Merge back into 'The System' -- define subsystems later during detailed design.",
  },
  too_few_elements: {
    error: 'Only {count} external elements -- consider adding more',
    why: 'Professional diagrams have 8-20 elements. Few elements often means missing interactions.',
    fix: 'Consider: user variants, failure modes, regulators, third-party services.',
  },
};

// ---------------------------------------------------------------------------
// Data: Use Case Diagram (Step 1.2)
// ---------------------------------------------------------------------------

export const useCaseDiagramThinking: ThinkingMessage[] = [
  {
    headline: 'Discovering use case scenarios...',
    tip: "Think scenarios, not features. 'Shopping cart' is a feature. 'Customer adds item while comparing prices' is a use case.",
    duration: 4000,
  },
  {
    headline: 'Analyzing actor variants...',
    tip: "A 'student driver' and 'drunk driver' create vastly different requirements. Your system must handle both.",
    duration: 4000,
  },
  {
    headline: 'Identifying undesired use cases...',
    tip: 'What can go wrong? Malicious use? System failures? These often define your most critical requirements.',
    duration: 4000,
  },
  {
    headline: 'Mapping use case relationships...',
    tip: '<<includes>> = required sub-action. <<extends>> = optional variation. The distinction matters for testing and prioritization.',
    duration: 4000,
  },
  {
    headline: 'Validating use case completeness...',
    tip: 'Can you state start/end conditions? Is it the right scope? Does it capture unique requirements?',
    duration: 4000,
  },
];

export const useCaseDiagramTooltips: TooltipTerm[] = [
  {
    term: 'Use Case',
    definition:
      'A situation where your system is used -- think scenarios, not features.',
  },
  {
    term: 'Actor',
    definition:
      'The main stimulus causing the system to act -- person, system, or internal trigger.',
  },
  {
    term: '<<includes>>',
    definition: 'This use case REQUIRES the sub-action to complete.',
  },
  {
    term: '<<extends>>',
    definition: 'This is an OPTIONAL variation that MAY happen.',
  },
  {
    term: '<<generalizes>>',
    definition:
      'A special version that inherits everything from the general case.',
  },
  {
    term: '<<trigger>>',
    definition:
      'Completing this use case automatically starts another.',
  },
  {
    term: 'Primary Actor',
    definition: 'The main user whose actions drive the use case.',
  },
  {
    term: 'Secondary Actor',
    definition:
      'Supporting actors involved but not driving the action.',
  },
];

export const useCaseDiagramValidationErrors: Record<string, ValidationError> = {
  no_start_end: {
    error: "Use case '{name}' has no clear start/end conditions",
    why: "Without boundaries, you can't know when the use case begins or completes.",
    fix: 'Define: What must be true BEFORE? What is true AFTER?',
  },
  too_broad: {
    error: "Use case '{name}' seems too broad",
    why: 'If describing it takes many steps or covers multiple scenarios, break it down.',
    fix: 'Use <<includes>> to break into sub-use cases.',
  },
  feature_not_scenario: {
    error: "'{name}' looks like a feature, not a use case",
    why: 'Features describe WHAT you build. Use cases describe SITUATIONS of use.',
    fix: 'Reframe as: In what situation would someone need this?',
  },
  missing_undesired: {
    error: 'No undesired use cases identified',
    why: 'What can go wrong? Malicious use? These create critical requirements.',
    fix: 'Consider: failures, attacks, edge cases, misuse.',
  },
  wrong_relationship: {
    error: "'{sub}' should be <<extends>> not <<includes>>",
    why: "Can the parent complete WITHOUT this? If yes, it's extends. If no, it's includes.",
    fix: 'Ask: Is this REQUIRED or OPTIONAL for the parent to complete?',
  },
};

// ---------------------------------------------------------------------------
// Data: Scope Tree (Step 1.3)
// ---------------------------------------------------------------------------

export const scopeTreeThinking: ThinkingMessage[] = [
  {
    headline: 'Building your deliverable breakdown...',
    tip: "Ask: 'What do I need to deliver THIS?' Keep drilling until you reach atomic tasks.",
    duration: 4000,
  },
  {
    headline: 'Identifying unknowns...',
    tip: 'Questions (?) are real deliverables. Someone has to answer them before work proceeds.',
    duration: 4000,
  },
  {
    headline: 'Checking scope boundaries...',
    tip: "If it's not on the tree, it's not in scope. Mark deferred items with dashed lines for Phase 2.",
    duration: 4000,
  },
  {
    headline: 'Validating completeness...',
    tip: 'The contractor test: If you handed this tree to someone, would they know EXACTLY what to deliver?',
    duration: 4000,
  },
];

export const scopeTreeTooltips: TooltipTerm[] = [
  {
    term: 'Scope Tree',
    definition:
      'Hierarchical breakdown of everything needed to deliver the end result.',
  },
  {
    term: 'End Deliverable',
    definition:
      'The actual thing you hand over -- the root of your tree.',
  },
  {
    term: 'Atomic Task',
    definition:
      'A task small enough that you know exactly how to complete it.',
  },
  {
    term: 'Performance Criteria',
    definition:
      "How you'll measure success for a deliverable.",
  },
  {
    term: 'Out of Scope',
    definition:
      'Explicitly deferred to a future phase -- captured but not delivered now.',
  },
  {
    term: 'Question Mark (?)',
    definition:
      'An unknown that needs answering before proceeding.',
  },
];

export const scopeTreeValidationErrors: Record<string, ValidationError> = {
  feature_not_deliverable: {
    error: 'Root appears to be a feature, not a deliverable',
    why: 'The root should be what you hand to the stakeholder, not a capability.',
    fix: "What's the actual thing delivered? 'An app' not 'Login capability'.",
  },
  not_atomic: {
    error: "'{item}' doesn't appear to be atomic",
    why: "If you can't do it tomorrow, it needs further breakdown.",
    fix: "Ask: 'What do I need to deliver THIS?' and keep breaking down.",
  },
  no_criteria: {
    error: "'{deliverable}' has no success criteria",
    why: 'How will you know if it is done well vs poorly?',
    fix: 'Define measurable criteria (speed, accuracy, approval, etc.).',
  },
  no_questions: {
    error: 'No unknowns (?) in tree',
    why: 'Most projects have decisions and research needs.',
    fix: 'What technology choices, business rules, or data gaps exist?',
  },
  deleted_not_deferred: {
    error: 'Items removed instead of marked out-of-scope',
    why: 'Deleted items are rediscovered later. Deferred items become Phase 2.',
    fix: "Use dashed lines for 'not now' instead of deleting.",
  },
};

// ---------------------------------------------------------------------------
// Data: UCBD (Step 2.1)
// ---------------------------------------------------------------------------

export const ucbdThinking: ThinkingMessage[] = [
  {
    headline: 'Extracting functional requirements...',
    tip: "The Delving Technique: 'If it has to do THIS, what else must it do?' This question reveals requirements hiding in every action.",
    duration: 5000,
  },
  {
    headline: 'Applying the Contractor Test...',
    tip: "If a contractor built ONLY what's written, would you be happy? If you'd expect more, there are missing requirements.",
    duration: 5000,
  },
  {
    headline: 'Converting actions to SHALL statements...',
    tip: "'SHALL' is non-negotiable. 'Should' is nice-to-have. 'Will' is ambiguous. Professional requirements use SHALL.",
    duration: 4000,
  },
  {
    headline: 'Checking functional vs structural...',
    tip: 'WHAT the system must do (functional) not HOW to build it (structural). Keep solutions open.',
    duration: 4000,
  },
  {
    headline: 'Validating preconditions and postconditions...',
    tip: 'Every UCBD needs clear start and end states. These become your test boundaries.',
    duration: 4000,
  },
];

export const ucbdTooltips: TooltipTerm[] = [
  {
    term: 'UCBD',
    definition:
      'Use Case Behavioral Diagram -- step-by-step breakdown of a use case.',
  },
  {
    term: 'Precondition',
    definition:
      'What must be true BEFORE this use case begins.',
  },
  {
    term: 'Postcondition',
    definition:
      'What is true AFTER this use case completes successfully.',
  },
  {
    term: 'SHALL Statement',
    definition:
      '"SHALL" means non-negotiable requirement. The professional standard.',
  },
  {
    term: 'Delving',
    definition:
      'Asking "If it has to do this, what else must it do?" recursively.',
  },
  {
    term: 'Swimlane',
    definition:
      'A column representing who is responsible for each action.',
  },
  {
    term: 'Contractor Test',
    definition:
      'Would a contractor know exactly what to build from these requirements?',
  },
];

export const ucbdValidationErrors: Record<string, ValidationError> = {
  system_split: {
    error: 'The System has been split into multiple columns',
    why: 'Splitting locks in architecture too early. Keep all possibilities open.',
    fix: "Merge into single 'The System' column. Subsystems come later.",
  },
  missing_shall: {
    error: "System action doesn't use 'SHALL' language",
    why: "'SHALL' is the professional standard for requirements.",
    fix: "Change 'The system validates' to 'The System SHALL validate'.",
  },
  structural_requirement: {
    error: "'{requirement}' describes HOW, not WHAT",
    why: 'Structural requirements lock you into specific solutions.',
    fix: 'What NEED does this address? Write that instead.',
  },
  no_precondition: {
    error: 'UCBD has no preconditions defined',
    why: "Without a starting state, you can't test when the use case begins.",
    fix: 'Define: What must be true BEFORE this use case can start?',
  },
  no_postcondition: {
    error: 'UCBD has no postconditions defined',
    why: "Without an ending state, you can't test when the use case completes.",
    fix: 'Define: What is true AFTER this use case succeeds?',
  },
  shallow_delving: {
    error: "'{action}' may have hidden requirements",
    why: 'High-level actions often hide 5-10 specific functions.',
    fix: "Ask: 'If the system has to do this, what else must it do?'",
  },
};

// ---------------------------------------------------------------------------
// Data: Functional Requirements (Step 2.2)
// ---------------------------------------------------------------------------

export const requirementsThinking: ThinkingMessage[] = [
  {
    headline: 'Extracting requirements from UCBDs...',
    tip: "Every 'SHALL' statement becomes a formal requirement with a unique ID.",
    duration: 4000,
  },
  {
    headline: 'Applying the AND test...',
    tip: "If a requirement has 'and,' it's probably two requirements. Each should be independently testable.",
    duration: 4000,
  },
  {
    headline: 'Checking for ambiguity...',
    tip: "'Fast,' 'easy,' 'user-friendly' aren't measurable. Convert to specific, testable criteria.",
    duration: 4000,
  },
  {
    headline: 'Identifying requirement constants...',
    tip: "Don't know the exact value? Use a constant like MAX_RESPONSE_TIME. Decide the specific value later.",
    duration: 4000,
  },
  {
    headline: 'Validating against the 10 properties...',
    tip: 'SHALL statement? Clear? Unambiguous? Verifiable? Consistent? Implementation-independent?',
    duration: 5000,
  },
];

export const requirementsTooltips: TooltipTerm[] = [
  {
    term: 'SHALL',
    definition:
      'Non-negotiable requirement -- the professional standard word.',
  },
  {
    term: 'Originating Requirement (OR)',
    definition:
      'A requirement that comes directly from stakeholders or use cases.',
  },
  {
    term: 'Derived Requirement (DR)',
    definition:
      'A requirement discovered through analysis of other requirements.',
  },
  {
    term: 'Requirement Constant',
    definition:
      'A placeholder for a value not yet finalized (e.g., MAX_RESPONSE_TIME).',
  },
  {
    term: 'Verification Method',
    definition:
      'How you prove a requirement is met -- the test.',
  },
  {
    term: 'Functional Requirement',
    definition: 'Describes WHAT the system must do, not HOW.',
  },
  {
    term: 'Traceability',
    definition:
      'Linking requirements back to their source (use case, stakeholder).',
  },
];

export const requirementsValidationErrors: Record<string, ValidationError> = {
  contains_and: {
    error: "Requirement contains 'and' -- consider splitting",
    why: 'If either part fails testing, which failed? Split for independent testability.',
    fix: 'Create separate requirements for each part.',
  },
  no_shall: {
    error: "Requirement doesn't use 'SHALL' language",
    why: "'SHALL' is the professional standard. 'Should' = nice-to-have. 'Will' = ambiguous.",
    fix: "Change 'The system validates' to 'The System SHALL validate'.",
  },
  unmeasurable: {
    error: "'{requirement}' cannot be objectively measured",
    why: "If you can't test it, you can't prove it's met.",
    fix: 'Define specific, measurable criteria.',
  },
  structural: {
    error: "'{requirement}' describes HOW, not WHAT",
    why: 'Implementation details lock you into specific solutions.',
    fix: 'What NEED does this address? Write that instead.',
  },
  undefined_constant: {
    error: "Constant '{name}' has no entry in Constants Table",
    why: 'Every constant needs a defined value (even if estimated).',
    fix: 'Add to Constants Table with value, units, source.',
  },
  contradicts: {
    error: "'{req1}' may contradict '{req2}'",
    why: 'Conflicting requirements cause implementation confusion.',
    fix: 'Review both requirements and resolve the conflict.',
  },
};

// ---------------------------------------------------------------------------
// Data: SysML Activity Diagram (Step 2.3)
// ---------------------------------------------------------------------------

export const sysmlThinking: ThinkingMessage[] = [
  {
    headline: 'Converting UCBD to SysML notation...',
    tip: 'Each UCBD row becomes an action. Swimlanes match your UCBD columns.',
    duration: 4000,
  },
  {
    headline: 'Linking actions to requirements...',
    tip: "Every system action links to a requirement ID: 'Validate cart [OR.5]'.",
    duration: 4000,
  },
  {
    headline: 'Identifying decision points...',
    tip: 'Where does the flow branch? These become diamonds with labeled paths.',
    duration: 4000,
  },
  {
    headline: 'Checking for parallel actions...',
    tip: 'Can any actions happen simultaneously? Use fork/join bars for parallel flows.',
    duration: 4000,
  },
  {
    headline: 'Validating flow completeness...',
    tip: 'Every path must reach an end. No dead ends allowed.',
    duration: 4000,
  },
];

export const sysmlTooltips: TooltipTerm[] = [
  {
    term: 'SysML',
    definition:
      'Systems Modeling Language -- an industry standard for system diagrams.',
  },
  {
    term: 'Activity Diagram',
    definition:
      'Shows the flow of actions in a process, with decisions and parallel paths.',
  },
  {
    term: 'Swimlane',
    definition:
      'A vertical partition showing which actor is responsible for each action.',
  },
  {
    term: 'Fork',
    definition:
      'Splits one flow into multiple parallel flows.',
  },
  {
    term: 'Join',
    definition:
      'Merges parallel flows back together (waits for all to complete).',
  },
  {
    term: 'Decision Diamond',
    definition:
      'A branch point where the flow takes different paths based on a condition.',
  },
  {
    term: 'Requirement Link [OR.X]',
    definition:
      'Connects an action to its formal requirement in the Requirements Table.',
  },
];

export const sysmlValidationErrors: Record<string, ValidationError> = {
  dead_end: {
    error: "Path from decision '{condition}' leads to dead end",
    why: 'Every path must reach an end node or merge with another path.',
    fix: 'Add missing actions or connect to end node.',
  },
  missing_link: {
    error: "System action '{action}' has no requirement link",
    why: 'Every system action should trace to a formal requirement.',
    fix: "Add requirement ID in brackets: 'Action [OR.X]'.",
  },
  fork_join_mismatch: {
    error: 'Fork has {X} exits but Join has {Y} entries',
    why: 'Fork and Join must balance -- same number of parallel paths.',
    fix: 'Ensure all forked paths reach the same join.',
  },
  no_start: {
    error: 'Diagram has no start node',
    why: 'Every activity diagram needs a clear entry point.',
    fix: 'Add filled circle at the beginning of the flow.',
  },
  no_end: {
    error: 'Diagram has no end node',
    why: 'Every path must terminate at an end node.',
    fix: 'Add end circle where the flow completes.',
  },
  unlabeled_decision: {
    error: 'Decision diamond has unlabeled exit paths',
    why: "Without labels, it's unclear which path to take.",
    fix: 'Label each exit path (Yes/No, Valid/Invalid, etc.).',
  },
};

// ---------------------------------------------------------------------------
// Aggregated Lookup
// ---------------------------------------------------------------------------

/** All knowledge bank entries indexed by step. */
export const knowledgeBank: Record<KnowledgeBankStep, KnowledgeBankEntry> = {
  'context-diagram': {
    step: 'context-diagram',
    label: 'Context Diagram',
    thinkingMessages: contextDiagramThinking,
    tooltipTerms: contextDiagramTooltips,
    validationErrors: contextDiagramValidationErrors,
  },
  'use-case-diagram': {
    step: 'use-case-diagram',
    label: 'Use Case Diagram',
    thinkingMessages: useCaseDiagramThinking,
    tooltipTerms: useCaseDiagramTooltips,
    validationErrors: useCaseDiagramValidationErrors,
  },
  'scope-tree': {
    step: 'scope-tree',
    label: 'Scope Tree',
    thinkingMessages: scopeTreeThinking,
    tooltipTerms: scopeTreeTooltips,
    validationErrors: scopeTreeValidationErrors,
  },
  ucbd: {
    step: 'ucbd',
    label: 'UCBD',
    thinkingMessages: ucbdThinking,
    tooltipTerms: ucbdTooltips,
    validationErrors: ucbdValidationErrors,
  },
  'functional-requirements': {
    step: 'functional-requirements',
    label: 'Functional Requirements',
    thinkingMessages: requirementsThinking,
    tooltipTerms: requirementsTooltips,
    validationErrors: requirementsValidationErrors,
  },
  'sysml-activity-diagram': {
    step: 'sysml-activity-diagram',
    label: 'SysML Activity Diagram',
    thinkingMessages: sysmlThinking,
    tooltipTerms: sysmlTooltips,
    validationErrors: sysmlValidationErrors,
  },
};

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/** Get thinking messages for a given step. */
export function getThinkingMessages(step: KnowledgeBankStep): ThinkingMessage[] {
  return knowledgeBank[step].thinkingMessages;
}

/** Get tooltip terms for a given step. */
export function getTooltipTerms(step: KnowledgeBankStep): TooltipTerm[] {
  return knowledgeBank[step].tooltipTerms;
}

/** Alias for getTooltipTerms - for consistency with generate-response.ts usage. */
export function getTooltipTermsForStep(step: KnowledgeBankStep): TooltipTerm[] {
  return knowledgeBank[step].tooltipTerms;
}

/** Get validation errors for a given step. */
export function getValidationErrors(
  step: KnowledgeBankStep,
): Record<string, ValidationError> {
  return knowledgeBank[step].validationErrors;
}

/**
 * Look up a tooltip definition by term across all steps.
 * Returns the first match or undefined if not found.
 */
export function findTooltipByTerm(term: string): TooltipTerm | undefined {
  const normalised = term.toLowerCase();
  for (const entry of Object.values(knowledgeBank)) {
    const match = entry.tooltipTerms.find(
      (t) => t.term.toLowerCase() === normalised,
    );
    if (match) return match;
  }
  return undefined;
}
