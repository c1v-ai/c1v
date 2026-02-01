/**
 * Clarification Detector
 *
 * Detects vague or incomplete answers that require follow-up questions.
 * Uses a combination of heuristic checks and LLM analysis for accuracy.
 *
 * @module intake/clarification-detector
 * @team AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 */

import { z } from 'zod';
import { cheapLLM } from '../../config';
import { type Question } from './question-bank';

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
   * @param question - The question that was asked
   * @param userAnswer - The user's response
   * @returns Analysis result with vagueness assessment
   */
  async analyze(
    question: Question,
    userAnswer: string
  ): Promise<ClarificationAnalysis> {
    // Quick heuristic checks first
    const heuristicResult = this.heuristicCheck(question, userAnswer);

    // If heuristic is confident enough, use it
    if (heuristicResult.confidence >= 0.9) {
      return heuristicResult;
    }

    // For uncertain cases, use LLM analysis
    return this.llmAnalysis(question, userAnswer);
  }

  /**
   * Perform fast heuristic check for obvious vagueness patterns
   * @param question - Question that was asked
   * @param answer - User's answer
   * @returns Heuristic analysis result
   */
  heuristicCheck(question: Question, answer: string): ClarificationAnalysis {
    const trimmed = answer.trim();

    // Check for very short answers
    if (trimmed.length < TOO_SHORT_THRESHOLD) {
      // Allow short confirmations for yes/no style questions
      if (/confirm|correct|right|agree|proceed/i.test(question.text)) {
        return {
          isVague: false,
          confidence: 0.8,
          reason: 'Short confirmation accepted for yes/no question',
          extractedInfo: [],
        };
      }

      return {
        isVague: true,
        confidence: 0.95,
        reason: 'Answer too short to contain meaningful information',
        suggestedFollowUp:
          question.clarificationPrompts[0] || 'Could you provide more details?',
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
          suggestedFollowUp:
            question.clarificationPrompts[0] || 'Could you be more specific?',
          extractedInfo: [],
        };
      }
    }

    // Check if answer contains expected information types for this phase
    const expectedPatterns = EXPECTED_INFO_PATTERNS[question.phase] || [];
    const matchedPatterns: string[] = [];

    for (const pattern of expectedPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        matchedPatterns.push(match[0]);
      }
    }

    if (matchedPatterns.length === 0 && expectedPatterns.length > 0) {
      return {
        isVague: true,
        confidence: 0.7, // Lower confidence, may need LLM verification
        reason: 'Answer does not contain expected information type for this phase',
        suggestedFollowUp: question.clarificationPrompts[0],
        extractedInfo: [],
      };
    }

    // Check for negation without alternative
    if (/^(no|none|nothing|n\/a|na)\.?$/i.test(trimmed)) {
      // This is actually a valid answer - user is saying there is none
      return {
        isVague: false,
        confidence: 0.85,
        reason: 'User explicitly stated none/nothing',
        extractedInfo: ['none'],
      };
    }

    // Answer seems okay based on heuristics
    return {
      isVague: false,
      confidence: 0.6, // Not highly confident, LLM may override
      reason: 'Heuristic check passed',
      extractedInfo: matchedPatterns,
    };
  }

  /**
   * Use LLM for detailed vagueness analysis
   * @param question - Question that was asked
   * @param answer - User's answer
   * @returns LLM-based analysis result
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

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return ClarificationAnalysisSchema.parse(parsed);
      }
    } catch (error) {
      console.error('LLM clarification analysis failed:', error);
    }

    // Fallback to conservative result
    return {
      isVague: false,
      confidence: 0.5,
      reason: 'LLM analysis inconclusive, defaulting to accept',
      extractedInfo: [],
    };
  }

  /**
   * Check if an answer warrants a clarification request
   * @param analysis - Previous analysis result
   * @param maxClarifications - Maximum clarifications allowed for a question
   * @param currentClarificationCount - How many clarifications have been asked
   * @returns Whether to ask for clarification
   */
  shouldRequestClarification(
    analysis: ClarificationAnalysis,
    maxClarifications: number = 2,
    currentClarificationCount: number = 0
  ): boolean {
    // Don't ask more than max clarifications
    if (currentClarificationCount >= maxClarifications) {
      return false;
    }

    // Only request clarification if vague and confident
    return analysis.isVague && analysis.confidence >= 0.75;
  }

  /**
   * Generate a natural clarification request
   * @param analysis - Analysis result with suggested follow-up
   * @param question - Original question
   * @returns Clarification message
   */
  generateClarificationMessage(
    analysis: ClarificationAnalysis,
    question: Question
  ): string {
    if (analysis.suggestedFollowUp) {
      return analysis.suggestedFollowUp;
    }

    // Use one of the question's clarification prompts
    if (question.clarificationPrompts.length > 0) {
      return question.clarificationPrompts[0];
    }

    // Generic fallback
    return 'Could you provide more specific details about that?';
  }
}
