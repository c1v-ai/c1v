/**
 * Prompt-injection detector — heuristic signals for the F3 RAG-injection
 * security finding.
 *
 * Non-blocking by contract: the detector logs + surfaces risk so upstream
 * guardrails can route high-risk payloads to stricter validation or flag
 * them in the audit trail. It does NOT gate the pipeline.
 *
 * Signals (OWASP LLM01 — Prompt Injection):
 *   - boundary_tokens        user content contains system/assistant delimiters
 *   - instruction_override   imperative phrases asking the model to change
 *                            prior instructions ("ignore", "disregard", ...)
 *   - system_prompt_exfil    attempts to elicit the system prompt itself
 *   - role_impersonation     role markers trying to escalate (`[system]`,
 *                            `<|im_start|>system`, ...)
 *   - context_break          markdown fences / code blocks paired with
 *                            directive phrases (common jailbreak shape)
 *   - nested_instruction     user content echoes fragments of the system
 *                            prompt verbatim (potential context leak)
 *
 * Risk levels map to signal count + weight:
 *   0 signals        → 'low'
 *   1 low-weight     → 'low'
 *   1 high-weight OR 2+ low-weight → 'medium'
 *   2+ high-weight OR any 3+ signals → 'high'
 *
 * @module lib/langchain/engines/prompt-injection-detector
 */

export type InjectionRisk = 'low' | 'medium' | 'high';

export type InjectionSignalKind =
  | 'boundary_tokens'
  | 'instruction_override'
  | 'system_prompt_exfil'
  | 'role_impersonation'
  | 'context_break'
  | 'nested_instruction';

export interface InjectionSignal {
  kind: InjectionSignalKind;
  excerpt: string;
  /** Relative weight in risk scoring (1 = low, 2 = high). */
  weight: 1 | 2;
}

export interface InjectionDetectionResult {
  risk: InjectionRisk;
  signals: InjectionSignal[];
}

const MAX_EXCERPT_LEN = 120;

interface SignalProbe {
  kind: InjectionSignalKind;
  pattern: RegExp;
  weight: 1 | 2;
}

const PROBES: readonly SignalProbe[] = [
  {
    kind: 'boundary_tokens',
    pattern:
      /(<\|im_(?:start|end)\|>|<\/?(?:system|assistant|user)>|\[INST\]|\[\/INST\])/gi,
    weight: 2,
  },
  {
    kind: 'role_impersonation',
    pattern: /(^|\n)\s*\[?(system|assistant|developer)\]?\s*[:>]\s*/gi,
    weight: 2,
  },
  {
    kind: 'instruction_override',
    pattern:
      /\b(ignore|disregard|forget|override|overwrite|bypass)\b[^.?!\n]{0,80}\b(previous|prior|above|earlier|system|all)\s+(instructions?|rules?|prompts?|messages?|commands?|directives?)\b/gi,
    weight: 2,
  },
  {
    kind: 'instruction_override',
    pattern:
      /\b(you\s+(?:are|will|must)\s+now|from\s+now\s+on|new\s+(?:instructions?|rules?|system))\b/gi,
    weight: 1,
  },
  {
    kind: 'system_prompt_exfil',
    pattern:
      /\b(?:print|show|reveal|repeat|output|display|tell\s+me|what\s+(?:is|are|were))\b[^.?!\n]{0,60}\b(?:system\s+prompt|initial\s+prompt|instructions?|rules?|training|your\s+(?:instructions?|rules?|prompt))\b/gi,
    weight: 2,
  },
  {
    kind: 'context_break',
    pattern: /```[a-zA-Z]*\s*\n[^`]{0,400}\b(ignore|override|you\s+are)\b/gi,
    weight: 1,
  },
];

/**
 * Analyzes `userContent` for prompt-injection signals. `systemPrompt` is
 * used only for the `nested_instruction` probe (detects verbatim echoes of
 * system-prompt fragments inside user content).
 *
 * Does not throw on malformed input; returns `{ risk: 'low', signals: [] }`
 * for empty strings.
 */
export function detectInjection(
  userContent: string,
  systemPrompt: string,
): InjectionDetectionResult {
  if (typeof userContent !== 'string' || userContent.length === 0) {
    return { risk: 'low', signals: [] };
  }

  const signals: InjectionSignal[] = [];

  for (const probe of PROBES) {
    const matches = userContent.matchAll(probe.pattern);
    let guard = 0;
    for (const m of matches) {
      if (guard >= 50) break;
      if (m[0].length === 0) continue;
      signals.push({
        kind: probe.kind,
        excerpt: clipExcerpt(m[0]),
        weight: probe.weight,
      });
      guard += 1;
    }
  }

  const nested = detectNestedInstruction(userContent, systemPrompt);
  if (nested) signals.push(nested);

  return { risk: scoreRisk(signals), signals };
}

function detectNestedInstruction(
  userContent: string,
  systemPrompt: string,
): InjectionSignal | null {
  if (!systemPrompt || systemPrompt.length < 20) return null;
  const grams = sentenceNgrams(systemPrompt, 4);
  const haystackNorm = normalizeForMatch(userContent);
  for (const g of grams) {
    const gNorm = normalizeForMatch(g);
    if (gNorm.length < 20) continue;
    if (haystackNorm.includes(gNorm)) {
      return {
        kind: 'nested_instruction',
        excerpt: clipExcerpt(g),
        weight: 2,
      };
    }
  }
  return null;
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceNgrams(text: string, wordsPerGram: number): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const out: string[] = [];
  for (let i = 0; i + wordsPerGram <= words.length; i += 1) {
    out.push(words.slice(i, i + wordsPerGram).join(' '));
  }
  return out;
}

function scoreRisk(signals: InjectionSignal[]): InjectionRisk {
  if (signals.length === 0) return 'low';
  const highCount = signals.filter((s) => s.weight === 2).length;
  const lowCount = signals.filter((s) => s.weight === 1).length;
  if (highCount >= 2 || signals.length >= 3) return 'high';
  if (highCount >= 1 || lowCount >= 2) return 'medium';
  return 'low';
}

function clipExcerpt(s: string): string {
  const trimmed = s.replace(/\s+/g, ' ').trim();
  return trimmed.length > MAX_EXCERPT_LEN
    ? trimmed.slice(0, MAX_EXCERPT_LEN - 1) + '…'
    : trimmed;
}
