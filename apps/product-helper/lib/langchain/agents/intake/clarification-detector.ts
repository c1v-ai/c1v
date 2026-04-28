/**
 * Clarification Detector
 *
 * Detects vague or incomplete answers that require follow-up questions.
 * Uses a combination of heuristic checks and LLM analysis for accuracy.
 *
 * Wave E (v2.2): `heuristicCheck()` is now the FIRST CONSUMER of the
 * NFR engine. The pre-engine inline rule logic was extracted into
 * predicate-DSL data (see `buildClarificationDecision`). The
 * `ClarificationAnalysis` shape is preserved so Wave A's chat flow
 * keeps working without changes.
 *
 * The only public-API change: `heuristicCheck` is now `async` (returns
 * `Promise<ClarificationAnalysis>`). Internal caller `analyze()` was
 * already async; no external callers exist (verified 2026-04-27).
 *
 * @module intake/clarification-detector
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { z } from 'zod';
import { cheapLLM } from '../../config';
import { type Question, type QuestionPhase } from './question-bank';
import { evaluate as engineEvaluate } from '../../engine/nfr-engine-interpreter';
import {
  type EngineDecision,
  type EngineOutput,
  type EvalContext,
  type Predicate,
  type Rule,
} from '../../engine/types';

/**
 * Clarification analysis result schema
 */
export const ClarificationAnalysisSchema = z.object({
  /** Whether the answer is considered vague/incomplete */
  isVague: z.boolean(),

  /** Confidence in the vagueness assessment (0-1) */
  confidence: z.number().min(0).max(1),

  /** Explanation for the assessment */
  reason: z.string(),

  /** Suggested follow-up question if vague */
  suggestedFollowUp: z.string().optional(),

  /** Information that was successfully extracted */
  extractedInfo: z.array(z.string()),
});

export type ClarificationAnalysis = z.infer<typeof ClarificationAnalysisSchema>;

/**
 * Patterns that indicate vague responses
 */
const VAGUE_PATTERNS = [
  /^(yes|no|ok|okay|sure|maybe|i guess|i think so|probably|not sure|idk|dunno)\.?$/i,
  /^(some|a few|several|many|lots|a lot)\.?$/i,
  /^(it depends|depends|that varies|varies)\.?$/i,
  /^(basically|essentially|kind of|sort of)$/i,
  /^(whatever|anything|something|stuff)\.?$/i,
  /^(normal|standard|typical|usual)\.?$/i,
];

/**
 * Minimum character length for a meaningful answer
 */
const TOO_SHORT_THRESHOLD = 15;

/**
 * Expected information patterns by question phase
 * Answers should contain at least one of these patterns to be considered complete
 */
const EXPECTED_INFO_PATTERNS: Record<string, RegExp[]> = {
  actors: [
    /user|admin|customer|manager|employee|guest|visitor|member|operator|owner|staff|agent/i,
  ],
  external_systems: [
    /api|service|gateway|provider|integration|webhook|database|server|cloud|third.?party/i,
  ],
  use_cases: [
    /can|should|will|must|allow|enable|create|update|delete|view|search|login|register|buy|sell|send|receive/i,
  ],
  scope: [
    /include|exclude|in.?scope|out.?of.?scope|will|won't|won\'t|not|later|future|phase/i,
  ],
  data_entities: [
    /entity|object|table|record|user|order|product|item|account|transaction|report|document/i,
  ],
  constraints: [
    /must|cannot|limit|restrict|require|compliance|regulation|budget|deadline|performance/i,
  ],
  success_criteria: [
    /metric|kpi|measure|target|goal|percent|number|rate|time|speed|accuracy|adoption/i,
  ],
};

/** Confirmation-style question detector (e.g. "is this correct?"). */
const CONFIRMATION_RE = /confirm|correct|right|agree|proceed/i;
/** Negation-as-valid-answer detector ("none", "n/a", "no"). */
const NEGATION_RE = /^(no|none|nothing|n\/a|na)\.?$/i;

/**
 * ClarificationDetector
 *
 * Analyzes user answers to determine if they require follow-up clarification.
 * Uses fast heuristics for obvious cases and LLM analysis for uncertain cases.
 */
export class ClarificationDetector {
  private llm = cheapLLM;

  /**
   * Analyze a user's answer for vagueness
   */
  async analyze(
    question: Question,
    userAnswer: string
  ): Promise<ClarificationAnalysis> {
    const heuristicResult = await this.heuristicCheck(question, userAnswer);
    if (heuristicResult.confidence >= 0.9) {
      return heuristicResult;
    }
    return this.llmAnalysis(question, userAnswer);
  }

  /**
   * Build an EngineDecision from the question + answer, route through the
   * engine, and map the EngineOutput back to ClarificationAnalysis. The
   * engine is the single source of truth for rule semantics; this method
   * is the FIRST CONSUMER pattern.
   */
  async heuristicCheck(
    question: Question,
    answer: string
  ): Promise<ClarificationAnalysis> {
    const trimmed = answer.trim();
    const matchedExpected = collectMatches(
      trimmed,
      EXPECTED_INFO_PATTERNS[question.phase] || []
    );

    const decision = buildClarificationDecision({
      question,
      trimmed,
      matchedExpected,
    });

    const context = buildClarificationContext({
      question,
      trimmed,
      matchedExpected,
    });

    const output = await engineEvaluate(decision, context, { skipAudit: true });
    return mapEngineOutputToAnalysis(output, question, matchedExpected);
  }

  /**
   * Use LLM for detailed vagueness analysis
   */
  async llmAnalysis(
    question: Question,
    answer: string
  ): Promise<ClarificationAnalysis> {
    const prompt = `You are analyzing if a user's answer provides enough specific information.

Question asked: "${question.text}"
User's answer: "${answer}"
Question phase: ${question.phase}
Expected to extract: ${question.extractsTo.join(', ')}

Analyze:
1. Is the answer vague, incomplete, or non-committal?
2. What specific information was successfully provided?
3. If vague, what follow-up question would help get more detail?

Respond in JSON format only:
{
  "isVague": boolean,
  "confidence": number (0-1),
  "reason": "explanation",
  "suggestedFollowUp": "follow-up question if vague, or null",
  "extractedInfo": ["list", "of", "extracted", "items"]
}`;

    try {
      const response = await this.llm.invoke(prompt);
      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return ClarificationAnalysisSchema.parse(parsed);
      }
    } catch (error) {
      console.error('LLM clarification analysis failed:', error);
    }

    return {
      isVague: false,
      confidence: 0.5,
      reason: 'LLM analysis inconclusive, defaulting to accept',
      extractedInfo: [],
    };
  }

  shouldRequestClarification(
    analysis: ClarificationAnalysis,
    maxClarifications: number = 2,
    currentClarificationCount: number = 0
  ): boolean {
    if (currentClarificationCount >= maxClarifications) return false;
    return analysis.isVague && analysis.confidence >= 0.75;
  }

  generateClarificationMessage(
    analysis: ClarificationAnalysis,
    question: Question
  ): string {
    if (analysis.suggestedFollowUp) return analysis.suggestedFollowUp;
    if (question.clarificationPrompts.length > 0) {
      return question.clarificationPrompts[0];
    }
    return 'Could you provide more specific details about that?';
  }
}

// ─── engine wiring ──────────────────────────────────────────────────────

interface ClarificationBuildArgs {
  question: Question;
  trimmed: string;
  matchedExpected: string[];
}

function collectMatches(answer: string, patterns: RegExp[]): string[] {
  const out: string[] = [];
  for (const re of patterns) {
    const m = answer.match(re);
    if (m) out.push(m[0]);
  }
  return out;
}

/**
 * Build the EvalContext that the rule predicates evaluate against.
 * Pre-computed flags (isShort, isConfirmation, etc.) live in `derived`
 * so predicates can reference them via `$.derived.<flag>`.
 */
function buildClarificationContext(
  args: ClarificationBuildArgs
): EvalContext {
  const { question, trimmed, matchedExpected } = args;
  const expectedPatterns = EXPECTED_INFO_PATTERNS[question.phase] || [];

  return {
    project_id: 0, // unused for clarification path; not persisted
    intake: {},
    upstream: {},
    kb_chunks: [],
    rag_attempted: false,
    derived: {
      length: trimmed.length,
      is_short: trimmed.length < TOO_SHORT_THRESHOLD,
      is_confirmation_question: CONFIRMATION_RE.test(question.text),
      matches_vague_pattern: VAGUE_PATTERNS.some((re) => re.test(trimmed)),
      matches_negation: NEGATION_RE.test(trimmed),
      has_expected_patterns: expectedPatterns.length > 0,
      matched_expected_count: matchedExpected.length,
    },
  };
}

/**
 * Build the rule list. Rule order matters — the engine returns the
 * first match. Mirrors the pre-Wave-E inline logic 1:1:
 *
 *   1. short + confirmation question  → not vague (0.80)
 *   2. short                           → vague (0.95)
 *   3. matches vague pattern           → vague (0.90)
 *   4. expected patterns missing       → vague (0.70)  [LLM may override]
 *   5. negation as valid answer        → not vague (0.85)
 *   6. otherwise (heuristic passed)    → not vague (0.60)
 */
function buildClarificationDecision(
  args: ClarificationBuildArgs
): EngineDecision {
  const { question } = args;
  const fallbackPrompt =
    question.clarificationPrompts[0] || 'Could you provide more details?';

  const rules: Rule[] = [
    {
      rule_id: 'clarify-short-confirmation',
      predicate: and([
        eqPath('$.derived.is_short', true),
        eqPath('$.derived.is_confirmation_question', true),
      ]),
      value: { isVague: false, suggestedFollowUp: undefined },
      base_confidence: 0.8,
      math_trace: 'short answer + confirmation question → accept',
    },
    {
      rule_id: 'clarify-too-short',
      predicate: eqPath('$.derived.is_short', true),
      value: { isVague: true, suggestedFollowUp: fallbackPrompt },
      base_confidence: 0.95,
      math_trace: `length < ${TOO_SHORT_THRESHOLD} → too short to be meaningful`,
    },
    {
      rule_id: 'clarify-vague-pattern',
      predicate: eqPath('$.derived.matches_vague_pattern', true),
      value: {
        isVague: true,
        suggestedFollowUp:
          question.clarificationPrompts[0] || 'Could you be more specific?',
      },
      base_confidence: 0.9,
      math_trace: 'answer matches a known vague-response regex',
    },
    {
      rule_id: 'clarify-missing-expected-patterns',
      predicate: and([
        eqPath('$.derived.has_expected_patterns', true),
        eqPath('$.derived.matched_expected_count', 0),
      ]),
      value: {
        isVague: true,
        suggestedFollowUp: question.clarificationPrompts[0],
      },
      base_confidence: 0.7,
      math_trace: `no expected-pattern match for phase=${question.phase}; LLM may verify`,
    },
    {
      rule_id: 'clarify-negation-as-valid',
      predicate: eqPath('$.derived.matches_negation', true),
      value: { isVague: false, suggestedFollowUp: undefined },
      base_confidence: 0.85,
      math_trace: 'explicit none/n.a. is a valid answer',
    },
    {
      rule_id: 'clarify-heuristic-pass',
      // Always-true sentinel — eval-true predicate to act as the "default" branch.
      predicate: eqPath('$.derived.has_expected_patterns', false),
      value: { isVague: false, suggestedFollowUp: undefined },
      base_confidence: 0.6,
      math_trace: 'no phase-specific patterns to check; heuristic passes',
    },
    {
      rule_id: 'clarify-heuristic-pass-with-matches',
      predicate: and([
        eqPath('$.derived.has_expected_patterns', true),
        gtPath('$.derived.matched_expected_count', 0),
      ]),
      value: { isVague: false, suggestedFollowUp: undefined },
      base_confidence: 0.6,
      math_trace: 'expected pattern matched; LLM may still refine',
    },
  ];

  return {
    decision_id: `clarification:${question.id}`,
    target_field: 'clarification.assessment',
    target_artifact: 'intake/clarification',
    story_id: 'intake-clarification-detector',
    engine_version: 'v1.0.0',
    llm_assist: false, // ClarificationDetector owns the LLM path itself
    user_overrideable: false,
    rules,
    modifiers: [],
    fallback: {
      reason: 'no clarification rule matched',
      base_confidence: 0.6,
      math_trace: 'fallback: deferring to LLM analysis',
    },
  };
}

/**
 * Map EngineOutput → ClarificationAnalysis. Preserves the legacy shape
 * so existing callers don't break. The engine's `value` carries the
 * `isVague` + `suggestedFollowUp` from the matched rule.
 */
function mapEngineOutputToAnalysis(
  output: EngineOutput,
  question: Question,
  matchedExpected: string[]
): ClarificationAnalysis {
  // ready: rule matched and final_confidence ≥ 0.90
  // needs_user_input: low confidence (engine routes to user-surface)
  if (output.status === 'ready' && output.value && typeof output.value === 'object') {
    const v = output.value as { isVague?: boolean; suggestedFollowUp?: string };
    const isVague = Boolean(v.isVague);
    return {
      isVague,
      confidence: output.final_confidence,
      reason: output.math_trace,
      ...(v.suggestedFollowUp ? { suggestedFollowUp: v.suggestedFollowUp } : {}),
      extractedInfo: isVague
        ? []
        : output.matched_rule_id === 'clarify-negation-as-valid'
          ? ['none']
          : matchedExpected,
    };
  }

  // Engine routed to needs_user_input — confidence < 0.90 OR fallback path.
  // Surface this back as the "may need LLM verification" branch.
  if (output.matched_rule_id) {
    const v = (output.value ?? {}) as {
      isVague?: boolean;
      suggestedFollowUp?: string;
    };
    return {
      isVague: Boolean(v.isVague),
      confidence: output.final_confidence,
      reason: output.math_trace,
      ...(v.suggestedFollowUp ? { suggestedFollowUp: v.suggestedFollowUp } : {}),
      extractedInfo: matchedExpected,
    };
  }

  // Fallback — no rule matched at all.
  return {
    isVague: false,
    confidence: output.final_confidence,
    reason: output.math_trace,
    suggestedFollowUp: question.clarificationPrompts[0],
    extractedInfo: matchedExpected,
  };
}

// ─── tiny predicate-builder helpers ─────────────────────────────────────

function eqPath(path: string, value: unknown): Predicate {
  return { op: '_eq', args: [path, value] };
}

function gtPath(path: string, value: number): Predicate {
  return { op: '_gt', args: [path, value] };
}

function and(children: Predicate[]): Predicate {
  return { op: '_and', args: children };
}

// Re-export used types for downstream test files / consumers.
export type { Question, QuestionPhase };
