import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Data Extraction Prompt
 * Extracts structured data using structured requirements methodology
 * Calculates artifact readiness with specification-compliant relationships
 */
export const extractionPrompt = PromptTemplate.fromTemplate(`
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
{
  "summary": "Small business owners spend 5+ hours/week on manual invoicing, causing delayed payments and cash flow issues.",
  "context": "Most small businesses use spreadsheets or paper invoices. This leads to errors, lost invoices, and no visibility into outstanding payments.",
  "impact": "Average 15-day delay in payment collection, 12% of invoices never collected, $50K+ annual revenue leakage for typical SMB.",
  "goals": ["Reduce invoicing time from 5 hours to 30 minutes per week", "Decrease average payment collection time from 45 to 15 days", "Achieve 98%+ invoice delivery rate"]
}

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
  { "goal": "Reduce invoice creation time", "metric": "Average time per invoice", "target": "Under 2 minutes" },
  { "goal": "Improve payment collection rate", "metric": "Percentage of invoices paid within 30 days", "target": "85%" },
  { "goal": "Increase user adoption", "metric": "Monthly active users", "target": "500 within 6 months" },
  { "goal": "Achieve platform reliability", "metric": "Monthly uptime percentage", "target": "99.9%" }
]

CRITICAL: Do NOT return empty array. Every project has goals - extract at least 3.

### 8. Non-Functional Requirements
Extract non-functional requirements (NFRs) across these categories: performance, security, scalability, reliability, usability, maintainability, compliance.

For each NFR, capture:
- **category**: One of performance, security, scalability, reliability, usability, maintainability, compliance
- **requirement**: Clear statement of what the system must achieve (e.g., "Page load time under 3 seconds")
- **metric**: How to measure compliance (e.g., "Time to First Contentful Paint")
- **target**: Specific threshold or benchmark (e.g., "<3s")
- **priority**: critical, high, medium, or low

Guidelines:
- INFER reasonable NFRs from the project type, tech stack, user base, and vision statement even if not explicitly stated in the conversation
- Every project has implicit NFRs -- extract them. A web app implies page load requirements; a multi-user system implies concurrency requirements; handling user data implies security requirements.
- Cover at least 3 different categories to ensure breadth
- Each requirement must be specific and measurable, not vague (e.g., "fast" is bad; "response time under 200ms" is good)

Examples:
- Performance: requirement: "Page load time under 3 seconds" -> metric: "Time to First Contentful Paint" -> target: "<3s" -> priority: high
- Security: requirement: "All API endpoints require authentication" -> metric: "Unauthorized access rate" -> target: "0%" -> priority: critical
- Scalability: requirement: "Support 10,000 concurrent users" -> metric: "Concurrent active sessions" -> target: "10,000+" -> priority: high
- Reliability: requirement: "System uptime of 99.9%" -> metric: "Monthly uptime percentage" -> target: ">=99.9%" -> priority: critical
- Usability: requirement: "Core workflows completable in under 3 clicks" -> metric: "Average clicks to task completion" -> target: "<=3" -> priority: medium
- Maintainability: requirement: "Test coverage above 80%" -> metric: "Line coverage percentage" -> target: ">=80%" -> priority: medium
- Compliance: requirement: "GDPR-compliant data handling" -> metric: "Data processing audit pass rate" -> target: "100%" -> priority: critical

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

INFER AGGRESSIVELY from the vision statement. Apply structured methodology to identify relationships and bidirectional interactions.
`);
