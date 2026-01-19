# Intake Agent Implementation Plan

## Overview

This document outlines the design and implementation of a conversational intake agent for PRD requirements gathering. The agent will replace the current prompt-driven approach with a stateful, intelligent questioning system that tracks progress, validates data in real-time, and knows when to stop asking and generate artifacts.

---

## Current State Analysis

### What Exists Today

1. **Prompt-driven chat** (`/api/chat/projects/[projectId]/route.ts`)
   - Single prompt template with project context
   - Completeness calculated from extracted data percentages
   - No question tracking or history awareness
   - Stop triggers embedded in prompt, not enforced programmatically

2. **Extraction Agent** (`lib/langchain/agents/extraction-agent.ts`)
   - Post-hoc extraction from conversation history
   - Calculates completeness score (0-100)
   - No real-time validation integration

3. **SR-CORNELL Validator** (`lib/validation/validator.ts`)
   - 10 hard gates with specific checks
   - Artifact-specific validation
   - Runs separately, not integrated into intake flow

### Problems with Current Approach

- **No question memory**: Same questions may be asked repeatedly
- **No gap awareness**: Agent does not know what data is missing vs collected
- **Validation disconnected**: SR-CORNELL checks run after, not during intake
- **No priority logic**: All questions treated equally regardless of impact
- **Vague answer handling**: No detection or follow-up for unclear responses
- **Stop condition fragile**: Relies on LLM interpreting user intent correctly

---

## Proposed Architecture

### High-Level Design

```
IntakeAgent
    |
    +-- QuestionBank (pre-defined questions per phase)
    +-- StateTracker (tracks collected data, asked questions)
    +-- PriorityScorer (determines next best question)
    +-- ClarificationDetector (identifies vague answers)
    +-- ValidationChecker (real-time SR-CORNELL validation)
    +-- CompletionDetector (knows when to stop and generate)
```

### LangGraph Integration

```
                    +------------------+
                    |   User Message   |
                    +--------+---------+
                             |
                             v
                    +--------+---------+
                    |  Parse & Classify |
                    +--------+---------+
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
   +------+------+    +------+------+    +------+------+
   | Stop Trigger |    | Answer      |    | Question   |
   | Detection    |    | Processing  |    | (new topic)|
   +------+------+    +------+------+    +------+------+
          |                  |                  |
          |                  v                  |
          |         +--------+---------+        |
          |         | Extraction       |        |
          |         | (update state)   |        |
          |         +--------+---------+        |
          |                  |                  |
          +--------+---------+------------------+
                   |
                   v
          +--------+---------+
          | Validation Check |
          | (SR-CORNELL)     |
          +--------+---------+
                   |
         +---------+---------+
         |                   |
         v                   v
  +------+------+     +------+------+
  | Artifact    |     | Next        |
  | Ready       |     | Question    |
  +------+------+     +------+------+
         |                   |
         v                   v
  +------+------+     +------+------+
  | Generate    |     | Ask         |
  | Diagram     |     | Question    |
  +-------------+     +-------------+
```

---

## Phase 1: Question Bank Structure

### Design Principles

1. **Phase-based organization**: Questions grouped by SR-CORNELL artifact sequence
2. **Dependency tracking**: Some questions require prior answers
3. **Priority scoring**: Each question has base priority, adjusted by context
4. **Inference hints**: Suggestions for what can be inferred from vision

### Question Bank Schema

```typescript
// lib/langchain/agents/intake/question-bank.ts

import { z } from 'zod';

export const QuestionPhase = z.enum([
  'actors',
  'external_systems',
  'use_cases',
  'scope',
  'data_entities',
  'constraints',
  'success_criteria',
]);

export type QuestionPhase = z.infer<typeof QuestionPhase>;

export const QuestionSchema = z.object({
  id: z.string(),
  phase: QuestionPhase,
  text: z.string(),
  shortText: z.string(), // For inline clarification

  // Priority and ordering
  basePriority: z.number().min(1).max(10),
  srCornellGate: z.string().optional(), // Which hard gate this addresses

  // Dependencies
  requires: z.array(z.string()).default([]), // Question IDs that must be answered first
  requiresData: z.array(z.string()).default([]), // Data fields that must exist

  // Extraction hints
  extractsTo: z.array(z.string()), // Data fields this question populates
  canInferFrom: z.array(z.string()).default([]), // Fields that might answer this

  // Follow-up
  clarificationPrompts: z.array(z.string()).default([]),
  skipCondition: z.string().optional(), // Expression to skip (e.g., "actors.length >= 3")
});

export type Question = z.infer<typeof QuestionSchema>;
```

### Pre-defined Question Bank

```typescript
// lib/langchain/agents/intake/questions.ts

import { Question, QuestionPhase } from './question-bank';

export const INTAKE_QUESTIONS: Question[] = [
  // ============================================================
  // Phase: Actors (SR-CORNELL HG2, HG3)
  // ============================================================
  {
    id: 'Q_ACTORS_PRIMARY',
    phase: 'actors',
    text: 'Who are the primary users of this system? (e.g., customers, admins, managers)',
    shortText: 'primary users',
    basePriority: 10,
    srCornellGate: 'PRIMARY_ACTORS_DEFINED',
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
    srCornellGate: 'PRIMARY_ACTORS_DEFINED',
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
    srCornellGate: 'ROLES_PERMISSIONS_DEFINED',
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
  // Phase: External Systems (SR-CORNELL HG1, HG4)
  // ============================================================
  {
    id: 'Q_EXTERNAL_SYSTEMS',
    phase: 'external_systems',
    text: 'Does your system integrate with any external services? (e.g., payment gateways, email services, third-party APIs)',
    shortText: 'external integrations',
    basePriority: 9,
    srCornellGate: 'EXTERNAL_ENTITIES_DEFINED',
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
    srCornellGate: 'EXTERNAL_ENTITIES_DEFINED',
    requires: ['Q_EXTERNAL_SYSTEMS'],
    requiresData: [],
    extractsTo: ['systemBoundaries.external'],
    canInferFrom: [],
    clarificationPrompts: [],
  },

  // ============================================================
  // Phase: Use Cases (SR-CORNELL HG5, HG6)
  // ============================================================
  {
    id: 'Q_USE_CASES_CORE',
    phase: 'use_cases',
    text: 'What are the 3-5 most important things a user can do with your system?',
    shortText: 'core use cases',
    basePriority: 10,
    srCornellGate: 'USE_CASE_LIST_5_TO_15',
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
    srCornellGate: 'USE_CASE_LIST_5_TO_15',
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
    srCornellGate: 'USE_CASE_TRIGGER_OUTCOME',
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
    srCornellGate: 'USE_CASE_TRIGGER_OUTCOME',
    requires: ['Q_USE_CASES_CORE'],
    requiresData: ['useCases'],
    extractsTo: ['useCases.outcome'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'useCases.every(uc => uc.outcome)',
  },

  // ============================================================
  // Phase: Scope (SR-CORNELL HG1)
  // ============================================================
  {
    id: 'Q_SCOPE_IN',
    phase: 'scope',
    text: 'What features are definitely IN scope for this release?',
    shortText: 'in-scope features',
    basePriority: 8,
    srCornellGate: 'SYSTEM_BOUNDARY_DEFINED',
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
    srCornellGate: 'SYSTEM_BOUNDARY_DEFINED',
    requires: ['Q_SCOPE_IN'],
    requiresData: ['systemBoundaries.inScope'],
    extractsTo: ['systemBoundaries.outOfScope'],
    canInferFrom: [],
    clarificationPrompts: [
      'Are there features users might expect but you do not plan to build?',
    ],
  },

  // ============================================================
  // Phase: Data Entities (SR-CORNELL HG9)
  // ============================================================
  {
    id: 'Q_DATA_ENTITIES',
    phase: 'data_entities',
    text: 'What are the main data objects in your system? (e.g., User, Order, Product, Report)',
    shortText: 'data objects',
    basePriority: 8,
    srCornellGate: 'CORE_DATA_OBJECTS_DEFINED',
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
    srCornellGate: 'CORE_DATA_OBJECTS_DEFINED',
    requires: ['Q_DATA_ENTITIES'],
    requiresData: ['dataEntities'],
    extractsTo: ['dataEntities.relationships'],
    canInferFrom: [],
    clarificationPrompts: [],
    skipCondition: 'dataEntities.every(e => e.relationships?.length > 0)',
  },

  // ============================================================
  // Phase: Constraints (SR-CORNELL HG8)
  // ============================================================
  {
    id: 'Q_CONSTRAINTS_BUSINESS',
    phase: 'constraints',
    text: 'Are there any business constraints? (e.g., budget limits, timeline, regulatory requirements)',
    shortText: 'business constraints',
    basePriority: 5,
    srCornellGate: 'CONSTRAINTS_PRESENT',
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
    srCornellGate: 'CONSTRAINTS_PRESENT',
    requires: [],
    requiresData: [],
    extractsTo: ['constraints.technical'],
    canInferFrom: [],
    clarificationPrompts: [],
  },

  // ============================================================
  // Phase: Success Criteria (SR-CORNELL HG7)
  // ============================================================
  {
    id: 'Q_SUCCESS_CRITERIA',
    phase: 'success_criteria',
    text: 'How will you measure success for this project? (e.g., user adoption rate, transaction volume, response time)',
    shortText: 'success metrics',
    basePriority: 4,
    srCornellGate: 'SUCCESS_CRITERIA_MEASURABLE',
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

// Phase priority order (for sequential artifact generation)
export const PHASE_ORDER: QuestionPhase[] = [
  'actors',
  'external_systems',
  'use_cases',
  'scope',
  'data_entities',
  'constraints',
  'success_criteria',
];

// Questions per artifact
export const ARTIFACT_QUESTION_MAP: Record<string, QuestionPhase[]> = {
  context_diagram: ['actors', 'external_systems'],
  use_case_diagram: ['actors', 'use_cases'],
  scope_tree: ['scope'],
  ucbd: ['use_cases'],
  requirements_table: ['use_cases', 'constraints'],
  constants_table: ['constraints'],
  sysml_activity_diagram: ['use_cases', 'data_entities'],
};
```

---

## Phase 2: State Tracker

### Design

The State Tracker maintains conversation state across messages, tracking:
- Which questions have been asked
- Which data has been collected
- Current phase in the intake flow
- Validation status per hard gate

### State Schema

```typescript
// lib/langchain/agents/intake/state.ts

import { z } from 'zod';
import { ExtractionResult } from '../../schemas';
import { QuestionPhase } from './question-bank';

export const IntakeStateSchema = z.object({
  // Project reference
  projectId: z.number(),
  projectName: z.string(),
  projectVision: z.string(),

  // Question tracking
  questionsAsked: z.array(z.object({
    questionId: z.string(),
    askedAt: z.string(), // ISO timestamp
    answerReceived: z.boolean(),
    clarificationCount: z.number().default(0),
  })),

  // Current phase
  currentPhase: QuestionPhase,
  phaseProgress: z.record(QuestionPhase, z.object({
    started: z.boolean(),
    completed: z.boolean(),
    questionsAsked: z.number(),
    questionsRemaining: z.number(),
  })),

  // Extracted data (cumulative)
  extractedData: z.object({
    actors: z.array(z.any()),
    useCases: z.array(z.any()),
    systemBoundaries: z.object({
      internal: z.array(z.string()),
      external: z.array(z.string()),
      inScope: z.array(z.string()),
      outOfScope: z.array(z.string()),
    }),
    dataEntities: z.array(z.any()),
    constraints: z.object({
      business: z.array(z.string()),
      technical: z.array(z.string()),
    }).optional(),
    successCriteria: z.array(z.string()).optional(),
  }),

  // Validation status
  validationStatus: z.object({
    overallScore: z.number(),
    hardGates: z.record(z.string(), z.boolean()),
    lastValidatedAt: z.string().optional(),
  }),

  // Artifact readiness
  artifactReadiness: z.record(z.string(), z.object({
    ready: z.boolean(),
    generated: z.boolean(),
    blockedBy: z.array(z.string()).optional(),
  })),

  // Stop detection
  userRequestedStop: z.boolean().default(false),
  stopReason: z.string().optional(),

  // Metadata
  messageCount: z.number(),
  lastUpdatedAt: z.string(),
});

export type IntakeState = z.infer<typeof IntakeStateSchema>;
```

### State Manager Class

```typescript
// lib/langchain/agents/intake/state-manager.ts

import { IntakeState, IntakeStateSchema } from './state';
import { INTAKE_QUESTIONS, PHASE_ORDER, Question } from './questions';
import { ExtractionResult } from '../../schemas';
import { validateProject } from '../../../validation/validator';
import { ProjectValidationData } from '../../../validation/types';

export class IntakeStateManager {
  private state: IntakeState;

  constructor(initialState: Partial<IntakeState>) {
    this.state = IntakeStateSchema.parse({
      projectId: initialState.projectId!,
      projectName: initialState.projectName || '',
      projectVision: initialState.projectVision || '',
      questionsAsked: [],
      currentPhase: 'actors',
      phaseProgress: this.initializePhaseProgress(),
      extractedData: {
        actors: [],
        useCases: [],
        systemBoundaries: {
          internal: [],
          external: [],
          inScope: [],
          outOfScope: [],
        },
        dataEntities: [],
      },
      validationStatus: {
        overallScore: 0,
        hardGates: {},
      },
      artifactReadiness: this.initializeArtifactReadiness(),
      userRequestedStop: false,
      messageCount: 0,
      lastUpdatedAt: new Date().toISOString(),
      ...initialState,
    });
  }

  private initializePhaseProgress() {
    const progress: Record<string, any> = {};
    for (const phase of PHASE_ORDER) {
      const phaseQuestions = INTAKE_QUESTIONS.filter(q => q.phase === phase);
      progress[phase] = {
        started: false,
        completed: false,
        questionsAsked: 0,
        questionsRemaining: phaseQuestions.length,
      };
    }
    return progress;
  }

  private initializeArtifactReadiness() {
    return {
      context_diagram: { ready: false, generated: false },
      use_case_diagram: { ready: false, generated: false },
      scope_tree: { ready: false, generated: false },
      ucbd: { ready: false, generated: false },
      requirements_table: { ready: false, generated: false },
      constants_table: { ready: false, generated: false },
      sysml_activity_diagram: { ready: false, generated: false },
    };
  }

  // Mark a question as asked
  markQuestionAsked(questionId: string): void {
    const question = INTAKE_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    this.state.questionsAsked.push({
      questionId,
      askedAt: new Date().toISOString(),
      answerReceived: false,
      clarificationCount: 0,
    });

    // Update phase progress
    const phase = question.phase;
    this.state.phaseProgress[phase].started = true;
    this.state.phaseProgress[phase].questionsAsked++;
    this.state.phaseProgress[phase].questionsRemaining--;

    this.state.lastUpdatedAt = new Date().toISOString();
  }

  // Mark last question as answered
  markLastQuestionAnswered(): void {
    const lastQuestion = this.state.questionsAsked[this.state.questionsAsked.length - 1];
    if (lastQuestion) {
      lastQuestion.answerReceived = true;
    }
    this.state.messageCount++;
  }

  // Update extracted data
  updateExtractedData(newData: Partial<ExtractionResult>): void {
    // Merge actors
    if (newData.actors) {
      const actorMap = new Map(this.state.extractedData.actors.map(a => [a.name, a]));
      newData.actors.forEach(a => actorMap.set(a.name, a));
      this.state.extractedData.actors = Array.from(actorMap.values());
    }

    // Merge use cases
    if (newData.useCases) {
      const ucMap = new Map(this.state.extractedData.useCases.map(uc => [uc.id, uc]));
      newData.useCases.forEach(uc => ucMap.set(uc.id, uc));
      this.state.extractedData.useCases = Array.from(ucMap.values());
    }

    // Merge system boundaries
    if (newData.systemBoundaries) {
      const sb = this.state.extractedData.systemBoundaries;
      if (newData.systemBoundaries.internal) {
        sb.internal = [...new Set([...sb.internal, ...newData.systemBoundaries.internal])];
      }
      if (newData.systemBoundaries.external) {
        sb.external = [...new Set([...sb.external, ...newData.systemBoundaries.external])];
      }
    }

    // Merge data entities
    if (newData.dataEntities) {
      const entityMap = new Map(this.state.extractedData.dataEntities.map(e => [e.name, e]));
      newData.dataEntities.forEach(e => entityMap.set(e.name, e));
      this.state.extractedData.dataEntities = Array.from(entityMap.values());
    }

    this.state.lastUpdatedAt = new Date().toISOString();
  }

  // Check if a question should be skipped
  shouldSkipQuestion(question: Question): boolean {
    if (!question.skipCondition) return false;

    // Evaluate skip condition against current state
    const data = this.state.extractedData;
    try {
      // Simple evaluator for common conditions
      const condition = question.skipCondition;

      if (condition.includes('actors.length')) {
        const match = condition.match(/actors\.length\s*>=\s*(\d+)/);
        if (match) return data.actors.length >= parseInt(match[1]);
      }

      if (condition.includes('useCases.length')) {
        const match = condition.match(/useCases\.length\s*>=\s*(\d+)/);
        if (match) return data.useCases.length >= parseInt(match[1]);
      }

      if (condition.includes('dataEntities.length')) {
        const match = condition.match(/dataEntities\.length\s*>=\s*(\d+)/);
        if (match) return data.dataEntities.length >= parseInt(match[1]);
      }

      return false;
    } catch {
      return false;
    }
  }

  // Get questions that haven't been asked yet
  getUnansweredQuestions(): Question[] {
    const askedIds = new Set(this.state.questionsAsked.map(q => q.questionId));
    return INTAKE_QUESTIONS.filter(q => !askedIds.has(q.id) && !this.shouldSkipQuestion(q));
  }

  // Get questions for current phase
  getPhaseQuestions(phase: string): Question[] {
    return this.getUnansweredQuestions().filter(q => q.phase === phase);
  }

  // Check if requirements are met for a specific question
  areRequirementsMet(question: Question): boolean {
    const askedIds = new Set(this.state.questionsAsked.filter(q => q.answerReceived).map(q => q.questionId));

    // Check required questions
    for (const reqId of question.requires) {
      if (!askedIds.has(reqId)) return false;
    }

    // Check required data
    for (const reqData of question.requiresData) {
      const value = this.getNestedValue(this.state.extractedData, reqData);
      if (!value || (Array.isArray(value) && value.length === 0)) return false;
    }

    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }

  // Run validation and update status
  async runValidation(): Promise<void> {
    const validationData: ProjectValidationData = {
      id: this.state.projectId,
      name: this.state.projectName,
      vision: this.state.projectVision,
      status: 'intake',
      actors: this.state.extractedData.actors,
      useCases: this.state.extractedData.useCases,
      systemBoundaries: {
        internal: this.state.extractedData.systemBoundaries.internal,
        external: this.state.extractedData.systemBoundaries.external,
        inScope: this.state.extractedData.systemBoundaries.inScope,
        outOfScope: this.state.extractedData.systemBoundaries.outOfScope,
      },
      dataEntities: this.state.extractedData.dataEntities,
    };

    const result = await validateProject(validationData);

    this.state.validationStatus.overallScore = result.overallScore;
    this.state.validationStatus.lastValidatedAt = new Date().toISOString();

    for (const gate of result.hardGates) {
      this.state.validationStatus.hardGates[gate.gate] = gate.passed;
    }

    // Update artifact readiness based on validation
    this.updateArtifactReadiness();
  }

  private updateArtifactReadiness(): void {
    const data = this.state.extractedData;

    // Context diagram: system name + 1 actor + 1 external
    this.state.artifactReadiness.context_diagram.ready =
      data.actors.length >= 1 && data.systemBoundaries.external.length >= 1;

    // Use case diagram: 2+ actors + 3+ use cases
    this.state.artifactReadiness.use_case_diagram.ready =
      data.actors.length >= 2 && data.useCases.length >= 3;

    // Scope tree: in-scope + out-of-scope
    this.state.artifactReadiness.scope_tree.ready =
      data.systemBoundaries.inScope.length >= 1 &&
      data.systemBoundaries.outOfScope.length >= 1;

    // UCBD: use cases with steps
    this.state.artifactReadiness.ucbd.ready =
      data.useCases.some(uc => uc.preconditions?.length > 0 || uc.postconditions?.length > 0);

    // Requirements table: 5+ use cases
    this.state.artifactReadiness.requirements_table.ready =
      data.useCases.length >= 5;

    // Constants table: constraints present
    this.state.artifactReadiness.constants_table.ready =
      (data.constraints?.technical?.length || 0) > 0 ||
      (data.constraints?.business?.length || 0) > 0;

    // Activity diagram: use cases with workflow steps
    this.state.artifactReadiness.sysml_activity_diagram.ready =
      data.useCases.length >= 3;
  }

  // Mark user stop request
  setUserStop(reason: string): void {
    this.state.userRequestedStop = true;
    this.state.stopReason = reason;
  }

  // Get current state
  getState(): IntakeState {
    return this.state;
  }

  // Serialize for database storage
  serialize(): string {
    return JSON.stringify(this.state);
  }

  // Deserialize from database
  static deserialize(json: string): IntakeStateManager {
    const state = JSON.parse(json);
    const manager = new IntakeStateManager(state);
    return manager;
  }
}
```

---

## Phase 3: Priority Scorer

### Scoring Algorithm

```typescript
// lib/langchain/agents/intake/priority-scorer.ts

import { IntakeState } from './state';
import { Question, INTAKE_QUESTIONS, ARTIFACT_QUESTION_MAP } from './questions';
import { IntakeStateManager } from './state-manager';

export interface ScoredQuestion {
  question: Question;
  score: number;
  reasons: string[];
}

export class PriorityScorer {
  private stateManager: IntakeStateManager;

  constructor(stateManager: IntakeStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Score all available questions and return sorted list
   */
  scoreQuestions(): ScoredQuestion[] {
    const state = this.stateManager.getState();
    const available = this.stateManager.getUnansweredQuestions()
      .filter(q => this.stateManager.areRequirementsMet(q));

    const scored: ScoredQuestion[] = available.map(q => ({
      question: q,
      score: this.calculateScore(q, state),
      reasons: this.getScoreReasons(q, state),
    }));

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Get the single best next question
   */
  getNextQuestion(): ScoredQuestion | null {
    const scored = this.scoreQuestions();
    return scored.length > 0 ? scored[0] : null;
  }

  private calculateScore(question: Question, state: IntakeState): number {
    let score = question.basePriority;

    // Boost 1: SR-CORNELL hard gate not yet passed (+3)
    if (question.srCornellGate) {
      const gatePassed = state.validationStatus.hardGates[question.srCornellGate];
      if (!gatePassed) {
        score += 3;
      }
    }

    // Boost 2: Current phase alignment (+2)
    if (question.phase === state.currentPhase) {
      score += 2;
    }

    // Boost 3: Artifact near completion (+2)
    const artifactPhases = Object.entries(ARTIFACT_QUESTION_MAP);
    for (const [artifact, phases] of artifactPhases) {
      if (phases.includes(question.phase)) {
        const readiness = state.artifactReadiness[artifact];
        if (readiness && !readiness.ready && !readiness.generated) {
          // Check if this question would complete the artifact
          const blockers = this.getArtifactBlockers(artifact, state);
          if (blockers.length === 1 && question.extractsTo.some(e => blockers.includes(e))) {
            score += 2;
          }
        }
      }
    }

    // Penalty 1: Many clarifications already asked (-2 per)
    const asked = state.questionsAsked.find(q => q.questionId === question.id);
    if (asked && asked.clarificationCount > 0) {
      score -= asked.clarificationCount * 2;
    }

    // Penalty 2: Late-stage question when early data missing (-1)
    const phaseIndex = ['actors', 'external_systems', 'use_cases', 'scope', 'data_entities', 'constraints', 'success_criteria'].indexOf(question.phase);
    const currentPhaseIndex = ['actors', 'external_systems', 'use_cases', 'scope', 'data_entities', 'constraints', 'success_criteria'].indexOf(state.currentPhase);
    if (phaseIndex > currentPhaseIndex + 1) {
      score -= 1;
    }

    // Boost 4: Can infer from existing data (+1)
    if (question.canInferFrom.length > 0) {
      const hasInferenceSource = question.canInferFrom.some(field => {
        const value = this.getNestedValue(state.extractedData, field);
        return value && (typeof value === 'string' ? value.length > 0 : true);
      });
      if (hasInferenceSource) {
        score += 1;
      }
    }

    return Math.max(score, 0);
  }

  private getScoreReasons(question: Question, state: IntakeState): string[] {
    const reasons: string[] = [];

    if (question.srCornellGate && !state.validationStatus.hardGates[question.srCornellGate]) {
      reasons.push(`Required for ${question.srCornellGate} hard gate`);
    }

    if (question.phase === state.currentPhase) {
      reasons.push('Aligned with current phase');
    }

    return reasons;
  }

  private getArtifactBlockers(artifact: string, state: IntakeState): string[] {
    const blockers: string[] = [];
    const data = state.extractedData;

    switch (artifact) {
      case 'context_diagram':
        if (data.actors.length < 1) blockers.push('actors');
        if (data.systemBoundaries.external.length < 1) blockers.push('systemBoundaries.external');
        break;
      case 'use_case_diagram':
        if (data.actors.length < 2) blockers.push('actors');
        if (data.useCases.length < 3) blockers.push('useCases');
        break;
      case 'scope_tree':
        if (data.systemBoundaries.inScope.length < 1) blockers.push('systemBoundaries.inScope');
        if (data.systemBoundaries.outOfScope.length < 1) blockers.push('systemBoundaries.outOfScope');
        break;
    }

    return blockers;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }
}
```

---

## Phase 4: Clarification Detection

### Vague Answer Detection

```typescript
// lib/langchain/agents/intake/clarification-detector.ts

import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { Question } from './questions';

export const ClarificationAnalysisSchema = z.object({
  isVague: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  suggestedFollowUp: z.string().optional(),
  extractedInfo: z.array(z.string()),
});

export type ClarificationAnalysis = z.infer<typeof ClarificationAnalysisSchema>;

const VAGUE_PATTERNS = [
  /^(yes|no|ok|okay|sure|maybe|i guess|i think so|probably|not sure|idk|dunno)\.?$/i,
  /^(some|a few|several|many|lots|a lot)\.?$/i,
  /^(it depends|depends|that varies|varies)\.?$/i,
  /^(basically|essentially|kind of|sort of)$/i,
];

const TOO_SHORT_THRESHOLD = 15; // characters
const EXPECTED_INFO_PATTERNS: Record<string, RegExp[]> = {
  actors: [/user|admin|customer|manager|employee|guest|visitor|member|operator/i],
  external_systems: [/api|service|gateway|provider|integration|webhook|database/i],
  use_cases: [/can|should|will|must|allow|enable|create|update|delete|view|search/i],
};

export class ClarificationDetector {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo', // Fast, cheap for this task
      temperature: 0,
      maxTokens: 500,
    });
  }

  /**
   * Analyze user answer for vagueness
   */
  async analyze(
    question: Question,
    userAnswer: string
  ): Promise<ClarificationAnalysis> {
    // Quick heuristic checks first
    const heuristicResult = this.heuristicCheck(question, userAnswer);
    if (heuristicResult.confidence > 0.9) {
      return heuristicResult;
    }

    // LLM-based analysis for uncertain cases
    return this.llmAnalysis(question, userAnswer);
  }

  private heuristicCheck(question: Question, answer: string): ClarificationAnalysis {
    const trimmed = answer.trim();

    // Check for very short answers
    if (trimmed.length < TOO_SHORT_THRESHOLD) {
      // Allow short confirmations for yes/no style questions
      if (/confirm|correct|right|agree|proceed/i.test(question.text)) {
        return {
          isVague: false,
          confidence: 0.8,
          reason: 'Short confirmation accepted',
          extractedInfo: [],
        };
      }

      return {
        isVague: true,
        confidence: 0.95,
        reason: 'Answer too short to contain meaningful information',
        suggestedFollowUp: question.clarificationPrompts[0] || 'Could you provide more details?',
        extractedInfo: [],
      };
    }

    // Check for known vague patterns
    for (const pattern of VAGUE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isVague: true,
          confidence: 0.9,
          reason: 'Answer matches vague response pattern',
          suggestedFollowUp: question.clarificationPrompts[0] || 'Could you be more specific?',
          extractedInfo: [],
        };
      }
    }

    // Check if answer contains expected information types
    const expectedPatterns = EXPECTED_INFO_PATTERNS[question.phase] || [];
    const hasExpectedInfo = expectedPatterns.some(p => p.test(trimmed));

    if (!hasExpectedInfo && expectedPatterns.length > 0) {
      return {
        isVague: true,
        confidence: 0.7,
        reason: 'Answer does not contain expected information type',
        suggestedFollowUp: question.clarificationPrompts[0],
        extractedInfo: [],
      };
    }

    return {
      isVague: false,
      confidence: 0.6, // Not confident enough, use LLM
      reason: 'Heuristic check inconclusive',
      extractedInfo: [],
    };
  }

  private async llmAnalysis(question: Question, answer: string): Promise<ClarificationAnalysis> {
    const prompt = `Analyze if this user answer provides enough specific information to answer the question.

Question: "${question.text}"
User's Answer: "${answer}"

Analyze:
1. Is the answer vague, incomplete, or non-committal?
2. What specific information was provided?
3. If vague, what follow-up question would help?

Respond in JSON format:
{
  "isVague": boolean,
  "confidence": number (0-1),
  "reason": "why vague or not",
  "suggestedFollowUp": "follow-up question if vague",
  "extractedInfo": ["list", "of", "extracted", "items"]
}`;

    try {
      const response = await this.llm.invoke(prompt);
      const content = typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return ClarificationAnalysisSchema.parse(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('LLM clarification analysis failed:', error);
    }

    // Fallback
    return {
      isVague: false,
      confidence: 0.5,
      reason: 'Analysis inconclusive',
      extractedInfo: [],
    };
  }
}
```

---

## Phase 5: Completion Detector

### Stop Condition Detection

```typescript
// lib/langchain/agents/intake/completion-detector.ts

import { IntakeState } from './state';
import { IntakeStateManager } from './state-manager';

export interface CompletionResult {
  shouldStop: boolean;
  reason: string;
  nextAction: 'generate_artifact' | 'ask_question' | 'complete_intake';
  artifactToGenerate?: string;
}

// User phrases that indicate they want to stop
const STOP_PHRASES = [
  /^no(pe)?\.?$/i,
  /^that'?s (enough|it|all)\.?$/i,
  /^done\.?$/i,
  /^move on\.?$/i,
  /^let'?s (see|proceed|continue|generate)\.?$/i,
  /^nothing (else|more)\.?$/i,
  /^skip\.?$/i,
  /^next\.?$/i,
  /i('m| am) (done|finished|good)\.?$/i,
];

// Phrases that indicate user wants to see current artifact
const GENERATE_PHRASES = [
  /show (me|it)\.?$/i,
  /generate (it|the|a)?\s*(diagram|artifact)?\.?$/i,
  /create (it|the|a)?\s*(diagram|artifact)?\.?$/i,
  /let'?s see (it|the|what we have)\.?$/i,
  /what does (it|the diagram) look like/i,
];

export class CompletionDetector {
  private stateManager: IntakeStateManager;

  constructor(stateManager: IntakeStateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Analyze if intake should stop based on user message and state
   */
  analyze(userMessage: string): CompletionResult {
    const state = this.stateManager.getState();

    // Check 1: Explicit stop phrase
    const isStopPhrase = STOP_PHRASES.some(p => p.test(userMessage.trim()));
    if (isStopPhrase) {
      return this.handleStopRequest(state, 'User requested stop');
    }

    // Check 2: Generate request
    const isGenerateRequest = GENERATE_PHRASES.some(p => p.test(userMessage.trim()));
    if (isGenerateRequest) {
      const nextArtifact = this.getNextGenerableArtifact(state);
      if (nextArtifact) {
        return {
          shouldStop: true,
          reason: 'User requested artifact generation',
          nextAction: 'generate_artifact',
          artifactToGenerate: nextArtifact,
        };
      }
    }

    // Check 3: Validation score threshold reached (95%)
    if (state.validationStatus.overallScore >= 95) {
      return {
        shouldStop: true,
        reason: 'Validation threshold (95%) reached',
        nextAction: 'complete_intake',
      };
    }

    // Check 4: All questions asked
    const remaining = this.stateManager.getUnansweredQuestions();
    if (remaining.length === 0) {
      return {
        shouldStop: true,
        reason: 'All questions have been asked',
        nextAction: 'complete_intake',
      };
    }

    // Check 5: Too many messages without progress
    if (state.messageCount > 30 && state.validationStatus.overallScore < 50) {
      return {
        shouldStop: true,
        reason: 'Extended conversation without sufficient progress',
        nextAction: 'generate_artifact',
        artifactToGenerate: this.getNextGenerableArtifact(state) || 'context_diagram',
      };
    }

    // Continue asking
    return {
      shouldStop: false,
      reason: 'More questions available',
      nextAction: 'ask_question',
    };
  }

  private handleStopRequest(state: IntakeState, reason: string): CompletionResult {
    // Find the best artifact to generate
    const nextArtifact = this.getNextGenerableArtifact(state);

    if (nextArtifact) {
      return {
        shouldStop: true,
        reason,
        nextAction: 'generate_artifact',
        artifactToGenerate: nextArtifact,
      };
    }

    // No artifact ready - ask if user wants to provide more info
    return {
      shouldStop: false,
      reason: 'Stop requested but no artifact ready yet',
      nextAction: 'ask_question',
    };
  }

  private getNextGenerableArtifact(state: IntakeState): string | null {
    const artifacts = [
      'context_diagram',
      'use_case_diagram',
      'scope_tree',
      'ucbd',
      'requirements_table',
      'constants_table',
      'sysml_activity_diagram',
    ];

    for (const artifact of artifacts) {
      const status = state.artifactReadiness[artifact];
      if (status && status.ready && !status.generated) {
        return artifact;
      }
    }

    // If nothing ready, return first incomplete
    for (const artifact of artifacts) {
      const status = state.artifactReadiness[artifact];
      if (status && !status.generated) {
        return artifact;
      }
    }

    return null;
  }
}
```

---

## Phase 6: LangGraph Integration

### Graph Definition

```typescript
// lib/langchain/graphs/intake-graph.ts

import { StateGraph, END, START } from '@langchain/langgraph';
import { Annotation } from '@langchain/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { IntakeStateManager } from '../agents/intake/state-manager';
import { PriorityScorer } from '../agents/intake/priority-scorer';
import { ClarificationDetector } from '../agents/intake/clarification-detector';
import { CompletionDetector } from '../agents/intake/completion-detector';
import { extractProjectData } from '../agents/extraction-agent';
import { streamingLLM } from '../config';

// Define the graph state annotation
const IntakeGraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  projectId: Annotation<number>(),
  projectName: Annotation<string>(),
  projectVision: Annotation<string>(),
  stateManager: Annotation<IntakeStateManager>(),
  lastUserMessage: Annotation<string>(),
  currentArtifact: Annotation<string>(),
  shouldGenerate: Annotation<boolean>({
    default: () => false,
  }),
  response: Annotation<string>({
    default: () => '',
  }),
});

type IntakeState = typeof IntakeGraphState.State;

// Node: Parse and classify user message
async function parseMessage(state: IntakeState): Promise<Partial<IntakeState>> {
  const lastMessage = state.lastUserMessage;
  const stateManager = state.stateManager;

  // Mark last question as answered
  stateManager.markLastQuestionAnswered();

  // Run extraction on new message
  const conversationText = state.messages
    .map(m => `${m._getType()}: ${m.content}`)
    .join('\n');

  const extraction = await extractProjectData(
    conversationText,
    state.projectName,
    state.projectVision
  );

  // Update state with extracted data
  stateManager.updateExtractedData(extraction);

  // Run validation
  await stateManager.runValidation();

  return { stateManager };
}

// Node: Check completion conditions
async function checkCompletion(state: IntakeState): Promise<Partial<IntakeState>> {
  const stateManager = state.stateManager;
  const detector = new CompletionDetector(stateManager);
  const result = detector.analyze(state.lastUserMessage);

  if (result.shouldStop && result.nextAction === 'generate_artifact') {
    return {
      shouldGenerate: true,
      currentArtifact: result.artifactToGenerate || 'context_diagram',
    };
  }

  return { shouldGenerate: false };
}

// Node: Check if clarification needed
async function checkClarification(state: IntakeState): Promise<Partial<IntakeState>> {
  const stateManager = state.stateManager;
  const questions = stateManager.getState().questionsAsked;

  if (questions.length === 0) {
    return {}; // First message, no clarification needed
  }

  const lastQuestion = questions[questions.length - 1];
  const questionDef = INTAKE_QUESTIONS.find(q => q.id === lastQuestion.questionId);

  if (!questionDef) {
    return {};
  }

  const detector = new ClarificationDetector();
  const analysis = await detector.analyze(questionDef, state.lastUserMessage);

  if (analysis.isVague && analysis.confidence > 0.8) {
    // Need clarification
    const followUp = analysis.suggestedFollowUp || 'Could you provide more details?';
    return {
      response: followUp,
    };
  }

  return {};
}

// Node: Select and ask next question
async function askQuestion(state: IntakeState): Promise<Partial<IntakeState>> {
  // If we already have a clarification response, use it
  if (state.response) {
    return {
      messages: [new AIMessage(state.response)],
    };
  }

  const stateManager = state.stateManager;
  const scorer = new PriorityScorer(stateManager);
  const nextQuestion = scorer.getNextQuestion();

  if (!nextQuestion) {
    // No more questions, generate current artifact
    return {
      shouldGenerate: true,
      currentArtifact: 'context_diagram',
    };
  }

  // Mark question as asked
  stateManager.markQuestionAsked(nextQuestion.question.id);

  // Generate natural question with context
  const currentData = stateManager.getState().extractedData;
  const prompt = buildQuestionPrompt(nextQuestion.question, currentData, state.projectVision);

  const response = await streamingLLM.invoke(prompt);
  const responseText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  return {
    messages: [new AIMessage(responseText)],
    stateManager,
  };
}

// Node: Generate artifact
async function generateArtifact(state: IntakeState): Promise<Partial<IntakeState>> {
  const stateManager = state.stateManager;
  const artifactType = state.currentArtifact;
  const data = stateManager.getState().extractedData;

  const prompt = buildArtifactPrompt(artifactType, data, state.projectName);
  const response = await streamingLLM.invoke(prompt);
  const responseText = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  // Mark artifact as generated
  const artifactReadiness = stateManager.getState().artifactReadiness;
  if (artifactReadiness[artifactType]) {
    artifactReadiness[artifactType].generated = true;
  }

  return {
    messages: [new AIMessage(responseText)],
    stateManager,
  };
}

// Router: Decide next step
function routeAfterParse(state: IntakeState): string {
  if (state.shouldGenerate) {
    return 'generate_artifact';
  }

  // Check if clarification response was set
  if (state.response) {
    return 'ask_question';
  }

  return 'check_clarification';
}

function routeAfterClarification(state: IntakeState): string {
  if (state.response) {
    return 'ask_question';
  }
  return 'check_completion';
}

function routeAfterCompletion(state: IntakeState): string {
  if (state.shouldGenerate) {
    return 'generate_artifact';
  }
  return 'ask_question';
}

// Build the graph
const workflow = new StateGraph(IntakeGraphState)
  .addNode('parse_message', parseMessage)
  .addNode('check_clarification', checkClarification)
  .addNode('check_completion', checkCompletion)
  .addNode('ask_question', askQuestion)
  .addNode('generate_artifact', generateArtifact)
  .addEdge(START, 'parse_message')
  .addConditionalEdges('parse_message', routeAfterParse, {
    generate_artifact: 'generate_artifact',
    check_clarification: 'check_clarification',
    ask_question: 'ask_question',
  })
  .addConditionalEdges('check_clarification', routeAfterClarification, {
    ask_question: 'ask_question',
    check_completion: 'check_completion',
  })
  .addConditionalEdges('check_completion', routeAfterCompletion, {
    generate_artifact: 'generate_artifact',
    ask_question: 'ask_question',
  })
  .addEdge('ask_question', END)
  .addEdge('generate_artifact', END);

export const intakeGraph = workflow.compile();

// Helper functions
function buildQuestionPrompt(
  question: Question,
  currentData: any,
  vision: string
): string {
  return `You are a PRD assistant asking questions to gather requirements.

Current project vision: "${vision}"

Data already collected:
- Actors: ${currentData.actors.map((a: any) => a.name).join(', ') || 'None yet'}
- Use Cases: ${currentData.useCases.map((uc: any) => uc.name).join(', ') || 'None yet'}
- External Systems: ${currentData.systemBoundaries.external.join(', ') || 'None yet'}

Your task: Ask this question naturally, possibly with inferences from the vision.

Question to ask: "${question.text}"

Rules:
1. Be concise (1-2 sentences max)
2. If you can infer likely answers from the vision, offer them as suggestions
3. Do not ask multiple questions
4. Use a friendly, professional tone

Your question:`;
}

function buildArtifactPrompt(
  artifactType: string,
  data: any,
  projectName: string
): string {
  return `Generate a ${artifactType.replace('_', ' ')} for project "${projectName}".

Data:
${JSON.stringify(data, null, 2)}

Generate the artifact as a Mermaid diagram wrapped in code fences.

\`\`\`mermaid
... your diagram here ...
\`\`\`

Be comprehensive but concise.`;
}

// Import needed in the file
import { INTAKE_QUESTIONS } from '../agents/intake/questions';
import { Question } from '../agents/intake/question-bank';
```

---

## Phase 7: API Integration

### Updated Route Handler

```typescript
// app/api/chat/projects/[projectId]/route.ts (updated)

import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { intakeGraph } from '@/lib/langchain/graphs/intake-graph';
import { IntakeStateManager } from '@/lib/langchain/agents/intake/state-manager';
import { db } from '@/lib/db/drizzle';
import { projects, conversations, projectData, type NewConversation } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Authentication (unchanged)
    const user = await getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return new Response(JSON.stringify({ error: 'Team not found' }), { status: 404 });
    }

    const { projectId: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return new Response(JSON.stringify({ error: 'Invalid project ID' }), { status: 400 });
    }

    // Load project
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
      with: { projectData: true },
    });

    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];

    // Load or create intake state
    let stateManager: IntakeStateManager;
    const existingState = project.projectData?.intakeState as string | undefined;

    if (existingState) {
      stateManager = IntakeStateManager.deserialize(existingState);
    } else {
      stateManager = new IntakeStateManager({
        projectId,
        projectName: project.name,
        projectVision: project.vision,
      });
    }

    // Load conversation history
    const dbConversations = await db.query.conversations.findMany({
      where: eq(conversations.projectId, projectId),
      orderBy: [asc(conversations.createdAt)],
      limit: 50,
    });

    const historyMessages = dbConversations.map(conv =>
      conv.role === 'user'
        ? new HumanMessage(conv.content)
        : new AIMessage(conv.content)
    );

    // Save user message
    await db.insert(conversations).values({
      projectId,
      role: 'user',
      content: lastMessage.content,
      tokens: Math.ceil(lastMessage.content.length / 4),
    });

    // Run the intake graph
    const result = await intakeGraph.invoke({
      messages: historyMessages,
      projectId,
      projectName: project.name,
      projectVision: project.vision,
      stateManager,
      lastUserMessage: lastMessage.content,
      currentArtifact: 'context_diagram',
    });

    // Get the AI response
    const aiMessages = result.messages.filter((m: any) => m._getType() === 'ai');
    const aiResponse = aiMessages.length > 0
      ? (typeof aiMessages[aiMessages.length - 1].content === 'string'
          ? aiMessages[aiMessages.length - 1].content
          : JSON.stringify(aiMessages[aiMessages.length - 1].content))
      : 'I understand. Let me process that information.';

    // Save AI response
    await db.insert(conversations).values({
      projectId,
      role: 'assistant',
      content: aiResponse,
      tokens: Math.ceil(aiResponse.length / 4),
    });

    // Save updated state
    const updatedState = result.stateManager.getState();
    await db
      .update(projectData)
      .set({
        actors: updatedState.extractedData.actors,
        useCases: updatedState.extractedData.useCases,
        systemBoundaries: updatedState.extractedData.systemBoundaries,
        dataEntities: updatedState.extractedData.dataEntities,
        completeness: updatedState.validationStatus.overallScore,
        intakeState: result.stateManager.serialize(),
        lastExtractedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projectData.projectId, projectId));

    // Return streaming response
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(aiResponse));
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Intake agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

// Import at top of file
import { AIMessage } from '@langchain/core/messages';
```

---

## Database Schema Update

Add `intakeState` column to `project_data` table:

```typescript
// lib/db/schema.ts (addition)

export const projectData = pgTable('project_data', {
  // ... existing columns ...

  // Add this new column
  intakeState: jsonb('intake_state'), // Serialized IntakeState
});
```

Migration:

```sql
-- migrations/add_intake_state.sql
ALTER TABLE project_data ADD COLUMN intake_state JSONB;
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/langchain/agents/intake/state-manager.test.ts

import { IntakeStateManager } from '@/lib/langchain/agents/intake/state-manager';
import { INTAKE_QUESTIONS } from '@/lib/langchain/agents/intake/questions';

describe('IntakeStateManager', () => {
  let manager: IntakeStateManager;

  beforeEach(() => {
    manager = new IntakeStateManager({
      projectId: 1,
      projectName: 'Test Project',
      projectVision: 'A test application',
    });
  });

  test('initializes with empty state', () => {
    const state = manager.getState();
    expect(state.questionsAsked).toHaveLength(0);
    expect(state.extractedData.actors).toHaveLength(0);
    expect(state.currentPhase).toBe('actors');
  });

  test('marks question as asked', () => {
    manager.markQuestionAsked('Q_ACTORS_PRIMARY');
    const state = manager.getState();
    expect(state.questionsAsked).toHaveLength(1);
    expect(state.questionsAsked[0].questionId).toBe('Q_ACTORS_PRIMARY');
  });

  test('updates extracted data with merge', () => {
    manager.updateExtractedData({
      actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    });

    manager.updateExtractedData({
      actors: [{ name: 'Admin', role: 'Secondary', description: 'Administrator' }],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    });

    const state = manager.getState();
    expect(state.extractedData.actors).toHaveLength(2);
  });

  test('checks skip conditions correctly', () => {
    // Add enough actors to trigger skip
    manager.updateExtractedData({
      actors: [
        { name: 'User', role: 'Primary', description: '' },
        { name: 'Admin', role: 'Primary', description: '' },
      ],
      useCases: [],
      systemBoundaries: { internal: [], external: [] },
      dataEntities: [],
    });

    const question = INTAKE_QUESTIONS.find(q => q.id === 'Q_ACTORS_PRIMARY')!;
    expect(manager.shouldSkipQuestion(question)).toBe(true);
  });
});
```

### Integration Tests

```typescript
// __tests__/lib/langchain/graphs/intake-graph.test.ts

import { intakeGraph } from '@/lib/langchain/graphs/intake-graph';
import { IntakeStateManager } from '@/lib/langchain/agents/intake/state-manager';
import { HumanMessage } from '@langchain/core/messages';

describe('IntakeGraph', () => {
  test('processes first message and asks initial question', async () => {
    const stateManager = new IntakeStateManager({
      projectId: 1,
      projectName: 'E-commerce App',
      projectVision: 'An online marketplace for handmade goods',
    });

    const result = await intakeGraph.invoke({
      messages: [],
      projectId: 1,
      projectName: 'E-commerce App',
      projectVision: 'An online marketplace for handmade goods',
      stateManager,
      lastUserMessage: 'Help me define requirements for my app',
      currentArtifact: 'context_diagram',
    });

    expect(result.messages.length).toBeGreaterThan(0);
    // Should ask about actors (first phase)
    const lastMessage = result.messages[result.messages.length - 1];
    expect(lastMessage.content.toLowerCase()).toContain('user');
  });

  test('detects stop phrases and generates artifact', async () => {
    const stateManager = new IntakeStateManager({
      projectId: 1,
      projectName: 'Test App',
      projectVision: 'A test application',
    });

    // Pre-populate some data
    stateManager.updateExtractedData({
      actors: [{ name: 'User', role: 'Primary', description: 'End user' }],
      useCases: [],
      systemBoundaries: { internal: [], external: ['PayPal API'] },
      dataEntities: [],
    });

    const result = await intakeGraph.invoke({
      messages: [new HumanMessage('We have users and PayPal integration')],
      projectId: 1,
      projectName: 'Test App',
      projectVision: 'A test application',
      stateManager,
      lastUserMessage: 'nope, that\'s it',
      currentArtifact: 'context_diagram',
    });

    // Should generate artifact
    const lastMessage = result.messages[result.messages.length - 1];
    expect(lastMessage.content).toContain('mermaid');
  });
});
```

---

## Implementation Timeline

| Week | Task | Deliverables |
|------|------|--------------|
| 1 | Question Bank & State Manager | `questions.ts`, `state.ts`, `state-manager.ts` |
| 2 | Priority Scorer & Clarification Detector | `priority-scorer.ts`, `clarification-detector.ts` |
| 3 | Completion Detector & LangGraph | `completion-detector.ts`, `intake-graph.ts` |
| 4 | API Integration & Testing | Updated route, unit tests, integration tests |
| 5 | Database Migration & Polish | Schema update, migration, bug fixes |

---

## Success Criteria

1. **Question Tracking**: No question asked twice unless clarification needed
2. **Data Awareness**: Agent accurately reports what data is collected vs missing
3. **Validation Integration**: SR-CORNELL gates checked in real-time
4. **Priority Scoring**: Questions asked in optimal order
5. **Clarification Detection**: Vague answers detected with 90%+ accuracy
6. **Stop Detection**: User stop phrases detected with 95%+ accuracy
7. **Artifact Generation**: Correct artifact generated when ready
8. **Performance**: P95 response time < 3 seconds

---

## Open Questions

1. **State Persistence**: Should intake state be stored in a separate table vs jsonb column?
2. **Multi-session Continuity**: How to handle users resuming after days/weeks?
3. **Inference Confidence**: Should inferred data be marked differently from explicit data?
4. **Rollback**: Should users be able to undo/revise previous answers?

---

## References

- SR-CORNELL-PRD-95-V1 Specification
- LangGraph Documentation: https://langchain-ai.github.io/langgraph/
- Existing Codebase:
  - `/Users/davidancor/Documents/MDR/c1v/apps/product-helper/lib/langchain/prompts.ts`
  - `/Users/davidancor/Documents/MDR/c1v/apps/product-helper/lib/validation/validator.ts`
  - `/Users/davidancor/Documents/MDR/c1v/apps/product-helper/lib/langchain/agents/extraction-agent.ts`
