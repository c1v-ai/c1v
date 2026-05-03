/**
 * Feature flags
 *
 * Read at call-time (not module-eval) so test environments and runtime
 * overrides take effect without requiring a re-import. Each getter is a
 * thin wrapper around `process.env`.
 */

/**
 * INTAKE_PROMPT_V2 — flips extract-data.ts onto the phase-staged
 * EXTRACTION_PROMPTS selector. Default false; legacy 199-line monolith
 * (extractionPromptLegacy) remains the active path until this flag is
 * promoted to default-true.
 */
export function intakePromptV2(): boolean {
  return process.env.INTAKE_PROMPT_V2 === 'true';
}
