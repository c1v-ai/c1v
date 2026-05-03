/**
 * Intake / Extraction Prompt Module (v2)
 *
 * Replaces the legacy 199-line monolith with phase-staged extraction prompts +
 * shared utilities. Legacy export preserved as `extractionPromptLegacy` until
 * the `INTAKE_PROMPT_V2` flag flips on (see step 3).
 *
 * Design rules — every new prompt slice MUST:
 *   - Avoid MUST/REQUIRED-minimum/Every-X inference cascades.
 *   - Avoid the "industry-standard" boilerplate phrasing.
 *   - Allow empty arrays / null fields when the user has not stated something.
 *   - Stay focused on its slice (don't re-extract upstream phases).
 *   - Keep examples illustrative (1 short snippet max) — never prescriptive.
 */

import { PromptTemplate } from '@langchain/core/prompts';
import type { KnowledgeBankStep } from '@/lib/education/knowledge-bank';
import type { IntakeState } from './graphs/types';

// ============================================================
// Shared Utilities
// ============================================================

/**
 * Escape curly braces so PromptTemplate doesn't interpret them as variables.
 * Doubles BOTH `{` and `}`. Important: doing only one side mangles JSON-shaped
 * inputs and was the root cause of the qfd / interfaces template parse bug.
 */
export function escapeBraces(str: string): string {
  return str.replace(/\{/g, '{{').replace(/\}/g, '}}');
}

/**
 * Render the project-context preamble that prefixes every intake prompt.
 * v1 returns plain text; caching across turns is deferred per plan §6.1.
 */
export function buildProjectContextPreamble(args: {
  projectName: string;
  projectVision: string;
  projectType?: string | null;
}): string {
  const { projectName, projectVision, projectType } = args;
  const typeLine = projectType
    ? `Project Type: ${projectType}`
    : 'Project Type: (not specified)';
  return [
    '## Project Context',
    `Project Name: ${projectName}`,
    typeLine,
    `Vision Statement: ${projectVision || '(not provided)'}`,
    '',
    'Use this context to ground your extraction. Do not invent details the',
    'user has not stated. Empty fields are valid output when the user has not',
    'covered that topic yet — the conversation will continue.',
  ].join('\n');
}

/**
 * Render a focused upstream-context summary for downstream phase prompts.
 * Reads only the requested slices to keep token usage minimal.
 */
export function summarizeUpstream(
  state: IntakeState | { extractedData?: Partial<IntakeState['extractedData']> },
  deps: Array<
    | 'actors'
    | 'useCases'
    | 'systemBoundaries'
    | 'ffbd'
    | 'NFRs'
    | 'decisionMatrix'
  >,
): string {
  const ed = (state as { extractedData?: Partial<IntakeState['extractedData']> })
    .extractedData;
  if (!ed || deps.length === 0) {
    return '';
  }

  const sections: string[] = [];

  for (const dep of deps) {
    if (dep === 'actors') {
      const actors = ed.actors ?? [];
      if (actors.length > 0) {
        sections.push(
          ['### Actors', ...actors.map((a) => `- ${a.name} (${a.role})`)].join('\n'),
        );
      }
    } else if (dep === 'useCases') {
      const ucs = ed.useCases ?? [];
      if (ucs.length > 0) {
        sections.push(
          [
            '### Use Cases',
            ...ucs.map(
              (uc) =>
                `- ${uc.name} [actor: ${uc.actor}]${uc.description ? ` — ${uc.description}` : ''}`,
            ),
          ].join('\n'),
        );
      }
    } else if (dep === 'systemBoundaries') {
      const sb = ed.systemBoundaries;
      if (sb) {
        const internal = sb.internal ?? [];
        const external = sb.external ?? [];
        const inScope = sb.inScope ?? [];
        const outOfScope = sb.outOfScope ?? [];
        if (
          internal.length ||
          external.length ||
          inScope.length ||
          outOfScope.length
        ) {
          const lines = ['### System Boundaries'];
          if (internal.length) lines.push(`- Internal: ${internal.join(', ')}`);
          if (external.length) lines.push(`- External: ${external.join(', ')}`);
          if (inScope.length) lines.push(`- In Scope: ${inScope.join(', ')}`);
          if (outOfScope.length)
            lines.push(`- Out of Scope: ${outOfScope.join(', ')}`);
          sections.push(lines.join('\n'));
        }
      }
    } else if (dep === 'NFRs') {
      const nfrs = ed.nonFunctionalRequirements ?? [];
      if (nfrs.length > 0) {
        sections.push(
          [
            '### Non-Functional Requirements',
            ...nfrs.map(
              (n) => `- [${n.category}] ${n.requirement} (priority: ${n.priority})`,
            ),
          ].join('\n'),
        );
      }
    } else if (dep === 'ffbd') {
      const ffbd = ed.ffbd as { topLevelBlocks?: Array<{ name?: string }> } | undefined;
      const blocks = ffbd?.topLevelBlocks ?? [];
      if (blocks.length > 0) {
        sections.push(
          [
            '### FFBD (top-level functions)',
            ...blocks.map((b, i) => `- F.${i + 1}: ${b.name ?? '(unnamed)'}`),
          ].join('\n'),
        );
      }
    } else if (dep === 'decisionMatrix') {
      const dm = ed.decisionMatrix as
        | { recommendation?: string; alternatives?: Array<{ name?: string }> }
        | undefined;
      if (dm && (dm.recommendation || (dm.alternatives?.length ?? 0) > 0)) {
        const lines = ['### Decision Matrix'];
        if (dm.recommendation) lines.push(`- Recommended: ${dm.recommendation}`);
        if (dm.alternatives?.length) {
          lines.push(
            `- Alternatives: ${dm.alternatives.map((a) => a.name ?? '(unnamed)').join(', ')}`,
          );
        }
        sections.push(lines.join('\n'));
      }
    }
  }

  if (sections.length === 0) {
    return '## Upstream context\n_(none yet)_';
  }
  return ['## Upstream context', ...sections].join('\n\n');
}

// ============================================================
// Phase-Staged Extraction Prompts
// ============================================================

const SHARED_OUTPUT_NOTE = `
## Output

Return structured JSON matching the extraction schema. Empty arrays and
null/empty strings are valid for fields the user has not covered. Do not
fabricate content to "fill" the schema.
`.trim();

const contextDiagramPrompt = PromptTemplate.fromTemplate(`
You are extracting context-diagram data from a conversation. Focus ONLY on
actors and external systems — leave all other fields empty for now.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## What to extract

1. **Actors** the user has named or clearly implied:
   - name, role (Primary / Secondary / External System)
   - Optional: a short description if the user gave one
   - goals / painPoints: include only if the user has stated them.
     Return empty arrays if not stated. Do not infer.

2. **External systems / interactions** the user has named:
   - name, what flows to/from it (only if stated)
   - If the user said "none" or "nope", capture that as confirmed-none.

If the user has not yet named any actors or external systems, return empty
arrays. The conversation will continue.

Illustrative only (do not copy): if the user said "users sign up and we email
them via SendGrid", you might extract one Primary actor "User" and one
External System "SendGrid".

${SHARED_OUTPUT_NOTE}

{educationBlock}
`.trim());

const useCaseDiagramPrompt = PromptTemplate.fromTemplate(`
You are extracting use-case-diagram data from a conversation. Focus on use
cases and their relationships — assume actors already captured upstream.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## What to extract

1. **Use cases** the user has described:
   - id (UC1, UC2, ...), name as a verb phrase, primary actor
   - preconditions / postconditions only if stated
   - <<include>> / <<extends>> / <<trigger>> relationships only if stated

Return an empty useCases array if the user has not described any concrete
scenarios yet. Do not invent use cases from a vision statement alone.

Illustrative only: if the user said "buyers add items to a cart and check out",
you might extract UC1 "Add to cart" and UC2 "Check out" linked to actor
"Buyer".

${SHARED_OUTPUT_NOTE}

{educationBlock}
`.trim());

const scopeTreePrompt = PromptTemplate.fromTemplate(`
You are extracting scope and data-entity information from a conversation.
Focus on what the user has explicitly placed in or out of scope, and on data
objects they have named.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## What to extract

1. **systemBoundaries.inScope** — features / deliverables the user has stated
   are part of this build.
2. **systemBoundaries.outOfScope** — features / deliverables the user has
   explicitly deferred or excluded.
3. **dataEntities** — named objects with attributes / relationships the user
   has described.

Return empty arrays if the user has not yet drawn these boundaries. The
conversation will surface this content over time.

Illustrative only: if the user said "we'll launch with read-only dashboards
and add editing later", inScope might be ["Read-only dashboards"] and
outOfScope might be ["Editing"].

${SHARED_OUTPUT_NOTE}

{educationBlock}
`.trim());

const functionalRequirementsPrompt = PromptTemplate.fromTemplate(`
You are extracting problem framing, project-level goals, and non-functional
requirements from a conversation.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## What to extract

1. **problemStatement** (summary, context, impact, goals): only what the user
   has stated. If the user has not described the problem yet, return an
   object with empty strings and an empty goals array. Do not paraphrase the
   vision statement back as a "problem".

2. **goalsMetrics**: project-level goals the user has stated, with metrics /
   targets they have specified. Return an empty array if not stated.

3. **nonFunctionalRequirements**: NFRs the user has stated (performance,
   security, scalability, reliability, usability, maintainability,
   compliance). Each NFR needs category, requirement, priority. Metrics and
   targets are optional. Return an empty array if no NFRs have been stated.

Do not infer NFRs from project type, domain, or general "best practices". If
the user said nothing about uptime, latency, or compliance, leave the array
empty. The downstream NFR-resynth agent and chat bridge will surface gaps.

Illustrative only: if the user said "we need PCI compliance for payments",
you might add one NFR with category "compliance", requirement
"PCI-DSS compliant payment processing", priority "critical".

${SHARED_OUTPUT_NOTE}

{educationBlock}
`.trim());

/**
 * Phase-staged extraction prompts keyed by KnowledgeBankStep.
 *
 * Only 4 KB steps are mapped — the others (ucbd, sysml-activity-diagram,
 * ffbd, decision-matrix, qfd-house-of-quality, interfaces) have dedicated
 * generator agents and don't run through extract-data. The selector in
 * extraction-agent falls back to 'context-diagram' for unmapped steps.
 */
export const EXTRACTION_PROMPTS: Partial<Record<KnowledgeBankStep, PromptTemplate>> = {
  'context-diagram': contextDiagramPrompt,
  'use-case-diagram': useCaseDiagramPrompt,
  'scope-tree': scopeTreePrompt,
  'functional-requirements': functionalRequirementsPrompt,
};

// ============================================================
// Per-Agent Rules Blocks (consumed by step 4-5 agent rewrites)
// ============================================================

export const FFBD_RULES = `
FFBD extraction rules (functional decomposition, Crawley discipline):

- Each block must describe WHAT the system does (verb phrase), not what
  component does it. "Store prediction result" is functional; "Database" is
  structural and should be rejected.
- Use AND for parallel paths, OR for alternative paths, IT for iteration.
  Every opening gate needs a matching close gate (parenthesis discipline).
- IT gates require a termination condition. Loops without one are infinite.
- Hierarchical numbering: F.1, F.1.1, F.1.2. Keep ≤ 10 sub-functions per
  parent — beyond that, add a decomposition level.
- Mark exactly one block as the core value function (the function that IS the
  product's primary value proposition).
- Connections describe the flow between blocks, including the gate type when
  the flow is parallel / alternative / iterative.

If the user has not described enough behavior to decompose into functions,
return a minimal top-level block list reflecting what was stated. Do not
fabricate sub-functions.
`.trim();

export const QFD_RULES = `
QFD House-of-Quality extraction rules:

- Customer needs are stated in user language ("accurate predictions"), not
  engineering language. Pull them from the conversation, not from a generic
  template.
- Engineering characteristics are measurable system properties the team can
  control. Each one must have units (e.g. "MAE in degrees C", "p95 latency
  in ms").
- Relationship strengths: strong (9), moderate (3), weak (1). Cells default
  to no-relationship; only fill when there is a defensible link.
- Roof correlations capture trade-offs between engineering characteristics
  (e.g. accuracy vs compute time). Use strong-positive / positive / negative
  / strong-negative.
- Importance weights for customer needs sum to 1.0. If the user has not
  ranked them, leave the weights null and surface a clarifying question via
  the chat bridge rather than guessing.
- Competitor scoring is honest. If the user has not benchmarked anything,
  emit an empty competitors array.
`.trim();

export const DECISION_MATRIX_RULES = `
Decision Matrix extraction rules:

- Performance criteria are measurable, solution-agnostic properties (response
  time, cost, accuracy). Reject anything that names a specific feature.
- Each criterion needs a measurement scale: defined conditions that map
  real-world values to scores. "4 out of 5" is meaningless without saying
  what earns a 4.
- Weights are percentages summing to 100%. If the user has not ranked
  criteria, leave the matrix in a draft state and surface a clarifying
  question rather than fabricating weights.
- Each alternative scores against every criterion using the defined scale.
  Document the source of the score (measurement, benchmark, estimate).
- Weighted totals are derived; do not back-fill a winner before the math
  resolves. Run a sensitivity check — if a 5% weight nudge flips the winner,
  flag the decision as fragile.
- A criterion may carry a minimum acceptable threshold. Alternatives below
  the threshold are eliminated regardless of weighted score.
`.trim();

export const INTERFACES_RULES = `
Interface specification extraction rules:

- Subsystems are grouped by FUNCTION, not by component or by team. Functions
  that share data and run on similar cadences belong together.
- Every interface gets a unique ID (IF-01, IF-02, ...) used consistently
  across DFD, N2 chart, sequence diagrams, and the interface matrix.
- Each interface specifies: source subsystem, destination subsystem, data
  payload, protocol, frequency / trigger. Operational interfaces describe
  runtime data flow; design interfaces describe constraints (size, weight,
  voltage, schema versions).
- The N2 chart and the interface specs must agree. A mismatch is a real bug,
  not a documentation issue.
- Most subsystems both send and receive. A send-only subsystem usually means
  a missing return / acknowledgment interface — surface that as a question
  rather than silently emitting a one-way contract.
- Sequence diagrams cover primary use cases end-to-end and label every
  message with its IF-ID.
`.trim();

export const NFR_RULES = `
NFR extraction rules:

- Capture only NFRs the user has stated or that are unambiguously implied by
  a stated requirement (e.g. "must be PCI compliant" implies the compliance
  NFR). Do not append a generic "every system needs availability" baseline.
- Each NFR has: category (performance | security | scalability | reliability
  | usability | maintainability | compliance), requirement (specific
  statement), priority (critical | high | medium | low). Metrics and targets
  are optional and should reflect what the user actually quantified.
- When the user gestures at a quality attribute without quantifying it
  ("should be fast"), record the category and requirement but leave metric
  and target null. The chat bridge will surface the gap as an open question
  rather than guessing a number.
- Avoid stacking duplicate NFRs in the same category unless they describe
  meaningfully different concerns (e.g. read latency vs write latency).
`.trim();

// ============================================================
// Legacy export (preserved until INTAKE_PROMPT_V2 flips on)
// ============================================================

/**
 * Legacy 199-line monolith extraction prompt.
 *
 * Reachable via the `INTAKE_PROMPT_V2=false` (default) code path in
 * `extract-data.ts`. Retained verbatim so flag-off behavior is byte-identical
 * to pre-step-3 behavior. Will be removed in a follow-up commit once the
 * flag flips on by default.
 */
export const extractionPromptLegacy = PromptTemplate.fromTemplate(`
Analyze this conversation using structured requirements methodology. Extract structured PRD data with artifact readiness scores.

## Project Context
Project Name: {projectName}
Vision Statement: {projectVision}

## Conversation
{conversationHistory}

## Extract Using industry-standard Methodology

### 1. Actors (industry-standard Classification)
Extract and classify actors:
- **Primary Actors**: Directly interact with system, initiate use cases (e.g., end users, administrators)
- **Secondary Actors**: Support the system, provide services, receive outputs (e.g., support staff, managers)
- **External Systems**: Third-party integrations the system depends on (e.g., payment gateway, email service)

For each actor include:
- Name, role, type (Primary / Secondary / External System)
- What they do TO the system (inputs, requests, triggers)
- What the system does FOR them (outputs, responses, services)
- **goals**: MUST include 2-3 specific goals this actor wants to achieve. Always infer from use cases, vision statement, and problem context - even if not explicitly stated. Every actor has goals.
  Examples: "Complete checkout in under 2 minutes", "Track order status in real-time", "Manage team permissions without IT support"
- **painPoints**: MUST include 1-3 current frustrations or problems. Always infer from the problem context - every actor using a new system has pain points with the current state.
  Examples: "Manual data entry is slow and error-prone", "No visibility into order progress", "Cannot access reports on mobile"
- INFER from vision if not explicit

CRITICAL: Every actor MUST have at least 2 goals and 1 painPoint populated. If the user hasn't stated them explicitly, INFER them from:
- The vision statement (what problem does this solve for them?)
- The use cases (what are they trying to accomplish?)
- The project type (what are typical goals for this type of user?)
Do NOT leave goals or painPoints empty.

### 2. Use Cases with Relationships (industry-standard)
Extract use cases with industry-standard relationship types:
- ID (UC1, UC2...), name as verb phrase, linked primary actor
- **<<include>>**: Required sub-use-cases (e.g., "Login" includes "Validate Credentials")
- **<<extends>>**: Optional extensions (e.g., "Checkout" extends with "Apply Coupon")
- **<<trigger>>**: Automatic consequences (e.g., "Place Order" triggers "Send Confirmation")
- Preconditions and postconditions if mentioned

### 3. External Interactions (Context Diagram Data)
For each external element, capture BIDIRECTIONAL interactions:
- Element name and type
- What it does TO the system (data/requests sent to system)
- What the system does TO/FOR it (data/responses sent from system)
- Any constraints between external elements
- If user says "none" or "nope" -> mark as "None (confirmed)"

### 4. Scope (for Scope Tree)
- **In Scope**: Features explicitly included, deliverables
- **Out of Scope**: Features explicitly excluded, future phases
- INFER reasonable scope from vision and use cases

### 5. Data Entities
- Objects with their attributes
- Relationships between entities
- Constraints and business rules

### 6. Problem Statement (REQUIRED)
Every project exists to solve a problem. This section is MANDATORY - extract or infer it.

Extract:
- **summary**: 1-2 sentence problem statement. Format: "[Target users] currently struggle with [problem] which causes [negative outcome]."
- **context**: Background and circumstances creating the problem. Include market conditions, user pain points, technical limitations, or regulatory factors.
- **impact**: Business or user consequences if the problem is NOT solved. Be specific about costs, time, risk, or lost opportunities.
- **goals**: Array of 3-5 measurable success criteria. Format: "[Action verb] [measurable outcome] by/to/within [target]"

INFERENCE RULES:
1. If user states a vision ("Build a task management app"), infer the problem ("Teams lack efficient task coordination")
2. If user mentions actors, infer their problems ("Managers can't track team progress")
3. If user mentions use cases, infer what's broken without them ("Users must manually check multiple systems")

Example output:
{{
  "summary": "Small business owners spend 5+ hours/week on manual invoicing, causing delayed payments and cash flow issues.",
  "context": "Most small businesses use spreadsheets or paper invoices. This leads to errors, lost invoices, and no visibility into outstanding payments.",
  "impact": "Average 15-day delay in payment collection, 12% of invoices never collected, $50K+ annual revenue leakage for typical SMB.",
  "goals": ["Reduce invoicing time from 5 hours to 30 minutes per week", "Decrease average payment collection time from 45 to 15 days", "Achieve 98%+ invoice delivery rate"]
}}

CRITICAL: Do NOT return empty or null for problemStatement. Every project has a problem - extract or infer it.

### 7. Goals & Success Metrics (REQUIRED - minimum 3)
Extract 3-5 project-level goals with measurable success criteria. MUST return at least 3 goals.

For each goal:
- **goal**: Clear outcome statement (e.g., "Reduce user onboarding time")
- **metric**: How success is measured (e.g., "Average time to complete onboarding flow")
- **target**: Specific threshold (e.g., "Under 5 minutes") - include when inferable

INFERENCE SOURCES (use ALL of these):
1. Vision statement: "Modern invoicing SaaS" -> Goal: "Automate invoice generation"
2. Problem statement: "Manual process takes hours" -> Goal: "Reduce processing time by 80%"
3. Actor goals: "Manager wants visibility" -> Goal: "Real-time dashboard for team status"
4. Use cases: "User can export reports" -> Goal: "Enable self-service reporting"
5. Project type: SaaS implies "Achieve 99.9% uptime", E-commerce implies "Increase conversion rate"

REQUIRED COVERAGE - extract goals across these dimensions:
- User Experience (speed, ease of use, satisfaction)
- Business Value (revenue, cost savings, efficiency)
- Technical Performance (speed, reliability, scalability)
- Adoption (user growth, engagement, retention)

Example output:
[
  {{ "goal": "Reduce invoice creation time", "metric": "Average time per invoice", "target": "Under 2 minutes" }},
  {{ "goal": "Improve payment collection rate", "metric": "Percentage of invoices paid within 30 days", "target": "85%" }},
  {{ "goal": "Increase user adoption", "metric": "Monthly active users", "target": "500 within 6 months" }},
  {{ "goal": "Achieve platform reliability", "metric": "Monthly uptime percentage", "target": "99.9%" }}
]

CRITICAL: Do NOT return empty array. Every project has goals - extract at least 3.

### 8. Non-Functional Requirements (REQUIRED - minimum 5 items)

CRITICAL: nonFunctionalRequirements MUST contain at least 5 items by completeness 60%. Every system has NFRs - infer from vision, use cases, and problem domain. Do NOT return empty.

Extract:
- **category**: One of performance, security, scalability, reliability, usability, maintainability, compliance
- **requirement**: Specific statement (e.g., "API response time under 200ms at 95th percentile")
- **metric**: How to measure (e.g., "p99 API response latency")
- **target**: Specific threshold (e.g., "<200ms", "99.9%", "10,000 concurrent users")
- **priority**: critical, high, medium, or low

INFERENCE RULES:
1. If user mentions payments -> add PCI-DSS compliance NFR (critical priority)
2. If user mentions real-time or live -> add latency NFR (<200ms p99, high priority)
3. If user mentions healthcare or medical -> add HIPAA compliance NFR + audit logging NFR (both critical priority)
4. If no domain mentioned -> add baseline NFRs: availability (99.9%), latency (<500ms p99), security (authN required)

Example output:
[
  {{ "category": "reliability", "requirement": "System uptime of 99.9%", "metric": "Monthly uptime percentage", "target": ">=99.9%", "priority": "critical" }},
  {{ "category": "performance", "requirement": "API response time under 200ms at 95th percentile", "metric": "p99 API response latency", "target": "<200ms", "priority": "high" }},
  {{ "category": "compliance", "requirement": "PCI-DSS compliant payment processing", "metric": "PCI-DSS audit pass rate", "target": "100%", "priority": "critical" }}
]

REQUIRED COVERAGE: 5+ NFRs spanning 4+ distinct categories. ALWAYS include reliability (availability) and security (authN). Add compliance when healthcare/finance/payments are mentioned. Add performance/latency when real-time or user-facing interactivity is mentioned.

CRITICAL: Do NOT return empty or fewer than 5. Every system has NFRs - infer from vision, use cases, and problem domain.

## Calculate Artifact Readiness

CONTEXT_DIAGRAM_READY: true/false
- Requires: system_name (always have), 1+ actor, 1+ external interaction OR "none confirmed"
- industry-standard: Must have bidirectional interaction data for each element

USE_CASE_DIAGRAM_READY: true/false
- Requires: 2+ actors, 3+ use cases with actor links
- industry-standard: Should have relationship types (include/extends/trigger) between use cases

SCOPE_TREE_READY: true/false
- Requires: 1+ in_scope, 1+ out_of_scope
- industry-standard: Derived from use cases and stakeholder agreements

UCBD_READY: true/false
- Requires: preconditions, 3+ steps, postconditions for at least 1 use case

## Output Format
Return structured JSON with:
- actors: array of objects with name, role, type, interactsTo, receivesFrom, goals (array of strings), painPoints (array of strings)
- useCases: array of objects with id, name, actor, includes, extends, triggers, preconditions, postconditions
- externalSystems: array of objects with name, type, sendsToSystem, receivesFromSystem (or "none_confirmed")
- inScope: array of strings
- outOfScope: array of strings
- dataEntities: array of objects with name, attributes, relationships
- problemStatement: object with summary (string), context (string), impact (string), goals (array of 3-5 measurable strings)
- goalsMetrics: array of objects with goal (string), metric (string), target (optional string)
- nonFunctionalRequirements: array of objects with category (performance|security|scalability|reliability|usability|maintainability|compliance), requirement (string), metric (optional string), target (optional string), priority (critical|high|medium|low)
- useCaseRelationships: array of objects with from, to, type (include/extends/trigger)
- artifactReadiness: object with context_diagram, use_case_diagram, scope_tree, ucbd as booleans

{educationBlock}

## MANDATORY EXTRACTION RULES

1. **Problem Statement**: REQUIRED. Infer from vision/actors/use cases if not stated.
2. **Actor Goals & PainPoints**: REQUIRED for every actor. Infer from problem context.
3. **Goals & Metrics**: REQUIRED minimum 3. Cover user experience, business value, technical performance.
4. **Non-Functional Requirements**: REQUIRED minimum 5 items across 4+ categories. Infer from vision, use cases, and domain.

INFERENCE STRATEGY:
- Vision statement is the primary inference source
- Actor goals derive from use cases they perform
- Pain points derive from what the system solves
- Project-level goals derive from problem statement impact
- NFRs derive from project type and user expectations

Do NOT return empty or null for ANY of these four sections. Every project has problems, goals, and quality requirements - extract or infer them.
`);

/**
 * @deprecated Use `extractionPromptLegacy` (current default behind
 * `INTAKE_PROMPT_V2=false`) or the phase-staged `EXTRACTION_PROMPTS` map
 * (active when `INTAKE_PROMPT_V2=true`).
 */
export const extractionPrompt = extractionPromptLegacy;
