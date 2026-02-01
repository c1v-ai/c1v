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

### 6. Problem Statement
Every project exists to solve a problem. Extract the core problem being addressed.
- **summary**: 1-2 sentence problem statement capturing what is broken, missing, or suboptimal
- **context**: Background and circumstances creating the problem (market conditions, user pain points, technical debt, regulatory changes)
- **impact**: Business or user consequences if the problem is NOT solved (lost revenue, user churn, compliance risk, operational inefficiency)
- **goals**: Array of 3-5 measurable success criteria that define what "solved" looks like (e.g., "Reduce onboarding time from 30 minutes to under 5 minutes")

IMPORTANT: INFER the problem statement from the project vision and conversation even if not explicitly stated. Every project has a problem -- extract it. Use the vision statement, actor goals, and use cases as signals to reconstruct the underlying problem.

### 7. Goals & Success Metrics
Extract 3-5 project-level goals with measurable success criteria. Each goal should define what success looks like in quantifiable terms.

For each goal include:
- **goal**: A clear statement of what the project aims to achieve (e.g., "Reduce user onboarding time")
- **metric**: How success will be measured (e.g., "Average time to complete onboarding flow")
- **target**: Optional specific threshold or benchmark (e.g., "Under 5 minutes")

Guidelines:
- INFER goals from the vision statement, problem statement, actor goals, and use cases if not explicitly stated
- Goals should be SMART: Specific, Measurable, Achievable, Relevant, Time-bound where possible
- Cover different dimensions: user experience, business value, technical performance, adoption
- Each goal must have a corresponding metric; target is optional but preferred
- Examples:
  - Goal: "Increase user self-service resolution" -> Metric: "Percentage of support tickets resolved without agent" -> Target: "70% self-service rate"
  - Goal: "Improve data accuracy" -> Metric: "Error rate in submitted forms" -> Target: "Below 2%"
  - Goal: "Accelerate time to market" -> Metric: "Average feature delivery cycle" -> Target: "2-week sprints"

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
