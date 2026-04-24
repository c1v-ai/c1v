import { describe, it, expect } from '@jest/globals';
import { redactInput } from '../pii-redactor';

describe('redactInput — basic detections', () => {
  it('empty input', () => {
    expect(redactInput('')).toEqual({ clean: '', redactions: [] });
  });

  it('redacts email', () => {
    const r = redactInput('contact me at user.name+tag@example.co.uk please');
    expect(r.clean).toBe('contact me at [EMAIL] please');
    expect(r.redactions).toHaveLength(1);
    expect(r.redactions[0]?.kind).toBe('email');
  });

  it('redacts E.164 and US phone', () => {
    const r1 = redactInput('call +1-415-555-0100 or 415-555-0199');
    expect(r1.redactions.every((x) => x.kind === 'phone')).toBe(true);
    expect(r1.redactions).toHaveLength(2);
    expect(r1.clean).toBe('call [PHONE] or [PHONE]');
  });

  it('redacts SSN', () => {
    const r = redactInput('SSN 123-45-6789 is sensitive');
    expect(r.clean).toBe('SSN [SSN] is sensitive');
    expect(r.redactions[0]?.kind).toBe('ssn');
  });

  it('does not redact invalid SSN shapes', () => {
    const r = redactInput('SSN 000-00-0000');
    expect(r.redactions.some((x) => x.kind === 'ssn')).toBe(false);
  });

  it('redacts credit card (Luhn-valid) but skips invalid digit runs', () => {
    const r1 = redactInput('card 4242 4242 4242 4242 on file');
    expect(r1.redactions.some((x) => x.kind === 'credit_card')).toBe(true);

    const r2 = redactInput('number 1234 5678 9012 3456 fails Luhn');
    expect(r2.redactions.some((x) => x.kind === 'credit_card')).toBe(false);
  });

  it('redacts Anthropic API key', () => {
    const key = 'sk-ant-api03-' + 'a'.repeat(80);
    const r = redactInput(`key=${key} end`);
    expect(r.redactions[0]?.kind).toBe('anthropic_api_key');
    expect(r.clean).toBe('key=[ANTHROPIC_API_KEY] end');
  });

  it('redacts GitHub token', () => {
    const tok = 'ghp_' + 'a'.repeat(40);
    const r = redactInput(`tok=${tok}`);
    expect(r.redactions[0]?.kind).toBe('github_token');
  });

  it('redacts AWS access key id', () => {
    const r = redactInput('AKIAIOSFODNN7EXAMPLE leaked');
    expect(r.redactions[0]?.kind).toBe('aws_access_key_id');
  });

  it('redacts JWT', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmn';
    const r = redactInput(`token ${jwt}`);
    expect(r.redactions[0]?.kind).toBe('jwt');
  });

  it('redacts Bearer token', () => {
    const r = redactInput('Authorization: Bearer abcdef1234567890xxxxx');
    expect(r.redactions.some((x) => x.kind === 'bearer_token')).toBe(true);
  });
});

describe('redactInput — idempotency', () => {
  it('is idempotent: second pass yields same clean and no new redactions', () => {
    const raw =
      'Email user@example.com and call +1-212-555-1234 with SSN 123-45-6789';
    const first = redactInput(raw);
    const second = redactInput(first.clean);
    expect(second.clean).toBe(first.clean);
    expect(second.redactions).toEqual([]);
  });

  it('placeholders do not match any detector', () => {
    const placeholders =
      '[EMAIL] [PHONE] [SSN] [CREDIT_CARD] [ANTHROPIC_API_KEY] [OPENAI_API_KEY] [AWS_ACCESS_KEY_ID] [GITHUB_TOKEN] [JWT] [BEARER_TOKEN]';
    const r = redactInput(placeholders);
    expect(r.clean).toBe(placeholders);
    expect(r.redactions).toEqual([]);
  });

  it('idempotent on mixed content with surrounding text', () => {
    const raw = 'Please reach ceo@acme.co or +44 20 7946 0958 soon.';
    const once = redactInput(raw);
    const twice = redactInput(once.clean);
    expect(twice.clean).toBe(once.clean);
    expect(twice.redactions).toEqual([]);
  });
});

describe('redactInput — overlap resolution', () => {
  it('prefers high-specificity detector on overlap (anthropic beats generic sk-)', () => {
    const key = 'sk-ant-api03-' + 'b'.repeat(80);
    const r = redactInput(`k=${key}`);
    const kinds = r.redactions.map((x) => x.kind);
    expect(kinds).toContain('anthropic_api_key');
    expect(kinds).not.toContain('openai_api_key');
  });

  it('no overlapping placeholders emitted', () => {
    const raw =
      'Reach user@example.com or +1-415-555-0100 — details at user@other.com';
    const r = redactInput(raw);
    const placeholderCount = (r.clean.match(/\[(EMAIL|PHONE)\]/g) ?? []).length;
    expect(placeholderCount).toBe(r.redactions.length);
  });
});

describe('redactInput — audit metadata', () => {
  it('reports offsets and originalLength for audit logging', () => {
    const raw = 'x=user@example.com';
    const r = redactInput(raw);
    expect(r.redactions[0]?.offset).toBe(2);
    expect(r.redactions[0]?.originalLength).toBe('user@example.com'.length);
    expect(r.redactions[0]?.placeholder).toBe('[EMAIL]');
  });
});
