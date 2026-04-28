/**
 * PII redactor — regex-based input sanitization.
 *
 * Per `plans/kb-runtime-architecture.md` §2.3 (Input guardrails) and gap G10,
 * strips common PII patterns from free-text before the payload flows to
 * audit logs, LLM prompts, or downstream storage.
 *
 * Scope (V1): email, phone (E.164 + common US formats), SSN, credit card
 * (Luhn-validated), Anthropic/OpenAI/AWS/GitHub API keys, generic bearer
 * tokens, JWTs. Full DLP/HIPAA-grade scrubbing is explicitly out of scope.
 *
 * Guarantees:
 *   - Idempotent: redacting an already-redacted string yields the same
 *     string and an empty redactions list. Replacement tokens ([EMAIL],
 *     [PHONE], ...) are designed not to re-match any detector.
 *   - Order-stable: detectors run in a fixed order so overlapping matches
 *     resolve predictably (high-specificity patterns first — API keys
 *     before generic tokens, SSN before phone).
 *   - Pure: no I/O; caller is responsible for writing the redactions array
 *     to the audit log.
 *
 * @module lib/langchain/engines/pii-redactor
 */

export type RedactionKind =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'credit_card'
  | 'anthropic_api_key'
  | 'openai_api_key'
  | 'aws_access_key_id'
  | 'github_token'
  | 'jwt'
  | 'bearer_token';

export interface Redaction {
  kind: RedactionKind;
  placeholder: string;
  /** Index in the cleaned output where the placeholder was inserted. */
  offset: number;
  /** Length of the original matched substring (for audit only). */
  originalLength: number;
}

export interface RedactInputResult {
  clean: string;
  redactions: Redaction[];
}

interface Detector {
  kind: RedactionKind;
  pattern: RegExp;
  /** Optional secondary filter (e.g. Luhn for credit cards). */
  validate?: (match: string) => boolean;
}

const DETECTORS: readonly Detector[] = [
  {
    kind: 'anthropic_api_key',
    pattern: /sk-ant-[A-Za-z0-9_-]{20,200}/g,
  },
  {
    kind: 'openai_api_key',
    pattern: /sk-(?:proj-)?[A-Za-z0-9_-]{20,200}/g,
  },
  {
    kind: 'github_token',
    pattern: /gh[pousr]_[A-Za-z0-9]{36,255}/g,
  },
  {
    kind: 'aws_access_key_id',
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
  },
  {
    kind: 'jwt',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    kind: 'bearer_token',
    pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g,
  },
  {
    kind: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    kind: 'ssn',
    pattern: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
  },
  {
    kind: 'credit_card',
    pattern: /\b(?:\d[ -]?){12,18}\d\b/g,
    validate: luhnValid,
  },
  {
    kind: 'phone',
    pattern:
      /(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{3}\)?[ .-]?)\d{3}[ .-]?\d{4}\b/g,
  },
];

const PLACEHOLDERS: Record<RedactionKind, string> = {
  email: '[EMAIL]',
  phone: '[PHONE]',
  ssn: '[SSN]',
  credit_card: '[CREDIT_CARD]',
  anthropic_api_key: '[ANTHROPIC_API_KEY]',
  openai_api_key: '[OPENAI_API_KEY]',
  aws_access_key_id: '[AWS_ACCESS_KEY_ID]',
  github_token: '[GITHUB_TOKEN]',
  jwt: '[JWT]',
  bearer_token: '[BEARER_TOKEN]',
};

/**
 * Redacts PII from `raw` and returns the cleaned string plus an audit list.
 * Idempotent: `redactInput(redactInput(x).clean)` yields the same `clean`
 * and an empty `redactions` array.
 */
export function redactInput(raw: string): RedactInputResult {
  if (typeof raw !== 'string' || raw.length === 0) {
    return { clean: raw ?? '', redactions: [] };
  }

  type RawMatch = {
    kind: RedactionKind;
    start: number;
    end: number;
    original: string;
  };
  const matches: RawMatch[] = [];

  for (const det of DETECTORS) {
    det.pattern.lastIndex = 0;
    const globalRe = det.pattern;
    let m: RegExpExecArray | null = globalRe.exec(raw);
    while (m !== null) {
      if (m[0].length === 0) {
        globalRe.lastIndex += 1;
      } else if (!det.validate || det.validate(m[0])) {
        matches.push({
          kind: det.kind,
          start: m.index,
          end: m.index + m[0].length,
          original: m[0],
        });
      }
      m = globalRe.exec(raw);
    }
  }

  const kindOrder = new Map<RedactionKind, number>();
  DETECTORS.forEach((d, i) => kindOrder.set(d.kind, i));
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const ao = kindOrder.get(a.kind) ?? Infinity;
    const bo = kindOrder.get(b.kind) ?? Infinity;
    if (ao !== bo) return ao - bo;
    return b.end - a.end;
  });

  const selected: RawMatch[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    selected.push(m);
    cursor = m.end;
  }

  if (selected.length === 0) {
    return { clean: raw, redactions: [] };
  }

  const redactions: Redaction[] = [];
  const pieces: string[] = [];
  let lastEnd = 0;
  let cleanOffset = 0;

  for (const m of selected) {
    const pre = raw.slice(lastEnd, m.start);
    pieces.push(pre);
    cleanOffset += pre.length;
    const placeholder = PLACEHOLDERS[m.kind];
    pieces.push(placeholder);
    redactions.push({
      kind: m.kind,
      placeholder,
      offset: cleanOffset,
      originalLength: m.original.length,
    });
    cleanOffset += placeholder.length;
    lastEnd = m.end;
  }
  pieces.push(raw.slice(lastEnd));

  return { clean: pieces.join(''), redactions };
}

function luhnValid(candidate: string): boolean {
  const digits = candidate.replace(/[^\d]/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (n < 0 || n > 9) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}
