/**
 * audit-trail.test.ts
 *
 * End-to-end smoke for the `evaluateWaveE` → `writeAuditRow` hot path
 * (EC-V21-E.3). Runs N=10 evaluations against a fixture
 * (project_id, target_field) stream and asserts:
 *
 *   1. Every call writes one decision_audit row.
 *   2. The hash chain holds: row[i].hash_chain_curr === row[i+1].hash_chain_prev
 *      (verified via plural's audit-writer `verifyChain()` helper).
 *
 * Skipped automatically when local Supabase is unreachable, mirroring the
 * project-artifacts-rls.test.ts skip pattern. CI without docker-supabase
 * still passes.
 *
 * Per repo CLAUDE.md: local Supabase runs on
 * `postgresql://postgres:postgres@localhost:54322/postgres` — set
 * `POSTGRES_URL` to that before invoking jest for this file.
 */

import postgres from 'postgres';

import { canonicalHash, verifyChain } from '@/lib/langchain/engines/audit-writer';
import {
  evaluateWaveE,
  type AuditContext,
  type EvaluateOptions,
} from '@/lib/langchain/engines/wave-e-evaluator';
import type { DecisionRef, EngineInputs } from '@/lib/langchain/engines/nfr-engine-interpreter';

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';
const N_EVALS = 10;

let admin: ReturnType<typeof postgres> | null = null;
let dbReachable = false;

beforeAll(async () => {
  admin = postgres(TEST_DB_URL, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 3,
    onnotice: () => {},
  });
  try {
    await admin`SELECT 1`;
    dbReachable = true;
  } catch {
    dbReachable = false;
  }
});

afterAll(async () => {
  if (admin) await admin.end({ timeout: 2 });
});

const itDb = (name: string, fn: () => Promise<void>) =>
  test(name, async () => {
    if (!dbReachable) {
      // eslint-disable-next-line no-console
      console.warn(
        `[audit-trail] skipping "${name}" — local DB unreachable on ${TEST_DB_URL}`,
      );
      return;
    }
    await fn();
  });

async function bootstrapProject(
  s: ReturnType<typeof postgres>,
  suffix: string,
): Promise<{ teamId: number; userId: number; projectId: number }> {
  await s`RESET ROLE`;
  await s`SELECT set_config('app.current_role', 'service', false)`;

  const [team] = await s<{ id: number }[]>`
    INSERT INTO teams (name) VALUES (${'audit-test-team-' + suffix}) RETURNING id
  `;
  const [user] = await s<{ id: number }[]>`
    INSERT INTO users (email, password_hash, role)
    VALUES (${'audit-' + suffix + '@example.test'}, 'x', 'member')
    RETURNING id
  `;
  const [project] = await s<{ id: number }[]>`
    INSERT INTO projects (name, vision, team_id, created_by)
    VALUES (${'audit-test-project-' + suffix}, 'audit smoke', ${team.id}, ${user.id})
    RETURNING id
  `;
  return { teamId: team.id, userId: user.id, projectId: project.id };
}

/**
 * High-confidence decision fixture — produces `status='ready'` rows so the
 * audit write path runs with non-null `value` + `auto_filled=true`.
 */
function buildDecision(): DecisionRef {
  return {
    decision_id: 'AUDIT_SMOKE_DECISION',
    target_field: 'constants_table.AUDIT_SMOKE_FIELD',
    inputs: [{ name: 'flow_class', source: 'M2.test' }],
    function: {
      type: 'decision_tree',
      rules: [
        {
          if: { flow_class: 'matches' },
          value: 42,
          base_confidence: 0.95,
          rule_id: 'audit-smoke-high-conf',
        },
        { default: { value: 0, base_confidence: 0.5, rule_id: 'default' } },
      ],
    },
  };
}

const matchingInputs: EngineInputs = { flow_class: 'matches' };

// ──────────────────────────────────────────────────────────────────────────
// E2E hot-path smoke: 10 evaluations → 10 rows → chain holds
// ──────────────────────────────────────────────────────────────────────────

describe('evaluateWaveE → writeAuditRow E2E (EC-V21-E.3)', () => {
  itDb(
    `${N_EVALS} sequential evaluations write ${N_EVALS} chained rows`,
    async () => {
      if (!admin) throw new Error('admin sql not initialized');
      const f = await bootstrapProject(admin, 'chain-' + Date.now());

      const decision = buildDecision();
      const targetField = decision.target_field;
      const auditCtx: AuditContext = {
        projectId: f.projectId,
        agentId: 'agent:audit-writer-smoke',
        targetArtifact: 'module_2_requirements/constants_table.json',
        storyId: 'story-audit-smoke',
        engineVersion: 'audit-trail-test-v1',
        modelVersion: 'deterministic-rule-tree',
        ragAttempted: false,
        kbChunkIds: [],
        userOverrideable: true,
      };
      const options: EvaluateOptions = { auditContext: auditCtx };

      // Sequential — concurrent writes can branch the chain (acceptable per
      // audit-writer's docstring), but the smoke test asserts strict linear
      // hash propagation, so we serialize.
      for (let i = 0; i < N_EVALS; i++) {
        const out = await evaluateWaveE(decision, matchingInputs, {}, options);
        expect(out.status).toBe('ready');
      }

      // Row-count assertion: every evaluate wrote exactly one row.
      const [{ count }] = await admin<{ count: string }[]>`
        SELECT count(*)::text AS count FROM decision_audit
        WHERE project_id = ${f.projectId} AND target_field = ${targetField}
      `;
      expect(Number(count)).toBe(N_EVALS);

      // Chain assertion: every row's hash_chain_prev = canonicalHash(prev).
      const result = await verifyChain(f.projectId, targetField);
      expect(result.valid).toBe(true);
      expect(result.rowsChecked).toBe(N_EVALS);
      expect(result.brokenAt).toBeUndefined();
    },
  );

  itDb(
    'tampering a prior row breaks the chain (verifyChain detects)',
    async () => {
      if (!admin) throw new Error('admin sql not initialized');
      const f = await bootstrapProject(admin, 'tamper-' + Date.now());

      const decision = buildDecision();
      const targetField = decision.target_field;
      const auditCtx: AuditContext = {
        projectId: f.projectId,
        agentId: 'agent:audit-writer-tamper',
        targetArtifact: 'module_2_requirements/constants_table.json',
        storyId: 'story-tamper-detect',
        engineVersion: 'audit-trail-test-v1',
        modelVersion: 'deterministic-rule-tree',
      };

      // 3 honest evaluations.
      for (let i = 0; i < 3; i++) {
        await evaluateWaveE(decision, matchingInputs, {}, { auditContext: auditCtx });
      }

      const initial = await verifyChain(f.projectId, targetField);
      expect(initial.valid).toBe(true);

      // The DB revokes UPDATE — but a superuser bypasses the role grant. Use
      // SET session_replication_role to satisfy the smoke (REVOKE is on the
      // role grant, not a constraint, so superuser tampering is possible —
      // exactly the scenario the hash chain catches).
      await admin`RESET ROLE`;
      const [{ id: tamperedId }] = await admin<{ id: string }[]>`
        SELECT id FROM decision_audit
        WHERE project_id = ${f.projectId} AND target_field = ${targetField}
        ORDER BY evaluated_at ASC, id ASC
        LIMIT 1
      `;
      // Mutate the math_trace of the first row — this column is in the
      // canonical-byte set so canonicalHash(row1) changes, breaking row2's
      // hash_chain_prev.
      await admin`
        UPDATE decision_audit
        SET math_trace = math_trace || ' [TAMPERED]'
        WHERE id = ${tamperedId}
      `;

      const after = await verifyChain(f.projectId, targetField);
      expect(after.valid).toBe(false);
      expect(after.brokenAt).toBeDefined();
    },
  );

  itDb('canonicalHash is deterministic across reads', async () => {
    if (!admin) throw new Error('admin sql not initialized');
    const f = await bootstrapProject(admin, 'det-' + Date.now());

    const decision = buildDecision();
    const auditCtx: AuditContext = {
      projectId: f.projectId,
      agentId: 'agent:audit-writer-det',
      targetArtifact: 'module_2_requirements/constants_table.json',
      storyId: 'story-determinism',
      engineVersion: 'audit-trail-test-v1',
      modelVersion: 'deterministic-rule-tree',
    };

    await evaluateWaveE(decision, matchingInputs, {}, { auditContext: auditCtx });

    // Read the row twice; canonicalHash must be byte-identical.
    const reader = async () =>
      admin!`SELECT * FROM decision_audit WHERE project_id = ${f.projectId} LIMIT 1`;

    const [r1] = (await reader()) as unknown as Parameters<typeof canonicalHash>[0][];
    const [r2] = (await reader()) as unknown as Parameters<typeof canonicalHash>[0][];
    expect(canonicalHash(r1)).toBe(canonicalHash(r2));
  });
});
