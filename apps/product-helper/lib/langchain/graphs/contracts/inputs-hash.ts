/**
 * Content-addressed `inputs_hash` (EC-V21-A.12).
 *
 * Stable across re-runs with identical inputs. Hash inputs:
 *   - canonical JSON of the intake payload (project + extractedData snapshot),
 *   - sha256 fingerprints of upstream module artifacts referenced.
 *
 * Caller-supplied; not derived from disk to keep the langgraph runtime
 * fs-free per the audit at `plans/v21-outputs/ta1/agents-audit.md`.
 *
 * @module lib/langchain/graphs/contracts/inputs-hash
 */

import { createHash } from 'node:crypto';

/**
 * Canonical-JSON serializer (sorts object keys recursively). Two inputs that
 * differ only in key order produce the same string.
 */
export function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`).join(',')}}`;
}

export interface InputsHashParts {
  /** Intake payload — typically `{ projectId, projectName, projectVision, extractedData }`. */
  intake: unknown;
  /** Sha256s of upstream module artifacts (key=module slug, value=hex sha256). */
  upstreamShas?: Record<string, string>;
}

export function computeInputsHash(parts: InputsHashParts): string {
  const upstream = parts.upstreamShas ?? {};
  const canonical = canonicalStringify({
    intake: parts.intake,
    upstream,
  });
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/** Convenience: sha256-hex of any value via canonical JSON. */
export function sha256Of(value: unknown): string {
  return createHash('sha256').update(canonicalStringify(value), 'utf8').digest('hex');
}
