/**
 * Free-tier synthesis allowance gate (D-V21.10 + EC-V21-B.3).
 *
 * Wave-A pre-stub per handoff Issue 12+16 lock: this file ships the import
 * + invocation surface so /api/projects/[id]/synthesize/route.ts is wired
 * once and never re-edited for the gate. TB1 (Wave B) replaces the stub
 * body with the real DB-backed implementation that counts
 * project_artifacts rows of kind LIKE 'recommendation_%' for the team in
 * the current calendar month and flips the env-var default to 'enabled'.
 *
 * Env var: SYNTHESIS_FREE_TIER_GATE = 'log_only' | 'enabled' | 'disabled'
 *   - 'log_only' (Wave-A default) — always allow; emit a warning when the
 *     real impl WOULD have blocked (so we observe how often it'd fire).
 *   - 'enabled'  — gate active; deny free-tier teams past 1 synthesis/mo.
 *   - 'disabled' — feature flag off; never deny.
 */

export type SynthesisAllowanceReason =
  | 'free_tier_exhausted'
  | 'no_credits';

export interface SynthesisAllowance {
  allowed: boolean;
  reason?: SynthesisAllowanceReason;
  remaining_this_month?: number;
  plan_name?: string;
}

type GateMode = 'log_only' | 'enabled' | 'disabled';

function getGateMode(): GateMode {
  const raw = process.env.SYNTHESIS_FREE_TIER_GATE?.toLowerCase();
  if (raw === 'enabled' || raw === 'disabled') return raw;
  return 'log_only';
}

/**
 * Check whether a team is allowed to start a new synthesis run.
 *
 * Wave-A behavior: returns `{ allowed: true }` for every team. When the gate
 * is in 'log_only' mode (default), a console warning records the would-be
 * 402 so we can observe gate-firing rate without breaking users. TB1
 * replaces this stub with the real check.
 */
export async function checkSynthesisAllowance(
  teamId: number
): Promise<SynthesisAllowance> {
  const mode = getGateMode();

  if (mode === 'disabled') {
    return { allowed: true };
  }

  if (mode === 'enabled') {
    // TB1 (Wave B) replaces this branch with a real DB-backed check.
    // For Wave-A safety we still allow — the real gate ships in TB1.
    console.warn(
      `[synthesis-tier] SYNTHESIS_FREE_TIER_GATE='enabled' but Wave-A stub is in effect; team=${teamId}; install TB1 for real enforcement.`
    );
    return { allowed: true };
  }

  // log_only — record the would-be 402 for observability without blocking.
  console.warn(
    `[synthesis-tier] log_only: would-be allowance check for team=${teamId} (TB1 ships real impl)`
  );
  return { allowed: true };
}
