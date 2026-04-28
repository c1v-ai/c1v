/**
 * synthesis-fixture-project.ts — DB-level fixture helpers for the P9
 * mitigation e2e (`synthesis-clickthrough.spec.ts`).
 *
 * The synthesis click-through requires:
 *   1. A real authenticated user with credits (handled by `auth.setup.ts`)
 *   2. A real project owned by that user, in `status='in progress'` with
 *      enough intake state that the LangGraph can take a turn (the route
 *      itself doesn't enforce intake-completeness, but the graph nodes
 *      gate on `state.extractedData['<kind>']` per P10).
 *   3. Zero `project_artifacts` rows for the fixture project (so the
 *      pre-creation by the route is observable as `0 → 7+ pending`).
 *
 * This helper opens a direct postgres-js connection to local Supabase
 * (:54322 per project memory) and performs steps (2) + (3). The user is
 * resolved from the existing seeded test user (`E2E_TEST_EMAIL`) so we
 * don't fork the auth.setup.ts contract.
 *
 * Why direct DB writes instead of the API:
 *   - The API doesn't expose a "set extractedData" surface; intake is
 *     interactive-chat-driven. We cannot drive a real chat session inside
 *     a 90s e2e budget.
 *   - The whole point of P9 mitigation is to assert the **integration
 *     bridge** between the click-through and the existing route — so we
 *     only need real route handling + real RLS + real DB writes. Intake
 *     pre-population is plumbing.
 *
 * Cleanup contract (hermetic): the spec calls
 * `truncateProjectArtifacts(projectId)` in `test.beforeEach` so each run
 * starts from `0 pending`.
 *
 * @module tests/e2e/fixtures/synthesis-fixture-project
 */

import postgres from 'postgres';

const DEFAULT_LOCAL_DB =
  process.env.POSTGRES_URL ??
  'postgresql://postgres:postgres@localhost:54322/postgres';

let _sql: ReturnType<typeof postgres> | null = null;

function db() {
  if (_sql) return _sql;
  _sql = postgres(DEFAULT_LOCAL_DB, {
    max: 2,
    idle_timeout: 5,
    connect_timeout: 10,
  });
  return _sql;
}

/** Close the shared connection. Call from a global teardown if you wire one. */
export async function closeDb(): Promise<void> {
  if (_sql) {
    await _sql.end({ timeout: 2 });
    _sql = null;
  }
}

export interface SynthesisFixtureProject {
  projectId: number;
  teamId: number;
  userId: number;
  /** Whether this row was created by the fixture (true) or pre-existed (false). */
  created: boolean;
}

/**
 * Resolve (or create) a fixture project owned by the e2e test user.
 *
 * Resolution order:
 *   1. If `E2E_SYNTHESIS_FIXTURE_PROJECT_ID` is set, look it up and return.
 *   2. Otherwise, find the most recently created project owned by the test
 *      user that has the marker name `e2e-synthesis-clickthrough`.
 *   3. Otherwise, INSERT a fresh fixture project + return it.
 */
export async function ensureSynthesisFixtureProject(
  testUserEmail: string,
): Promise<SynthesisFixtureProject> {
  const sql = db();

  // 1. Resolve the test user
  const userRows = await sql<
    { id: number; email: string }[]
  >`SELECT id, email FROM users WHERE email = ${testUserEmail} LIMIT 1`;
  if (userRows.length === 0) {
    throw new Error(
      `[ensureSynthesisFixtureProject] Test user not found: ${testUserEmail}. ` +
        `Run auth.setup.ts at least once to create one, or seed manually.`,
    );
  }
  const user = userRows[0];

  // 2. Resolve their team (the first team they're a member of).
  const teamRows = await sql<{ team_id: number }[]>`
    SELECT team_id FROM team_members WHERE user_id = ${user.id} LIMIT 1
  `;
  if (teamRows.length === 0) {
    throw new Error(
      `[ensureSynthesisFixtureProject] Test user has no team membership. ` +
        `Run auth.setup.ts to provision one.`,
    );
  }
  const teamId = teamRows[0].team_id;

  // 3. Honor explicit env override
  const envOverride = process.env.E2E_SYNTHESIS_FIXTURE_PROJECT_ID;
  if (envOverride) {
    const projectId = Number.parseInt(envOverride, 10);
    if (Number.isNaN(projectId)) {
      throw new Error(
        `[ensureSynthesisFixtureProject] E2E_SYNTHESIS_FIXTURE_PROJECT_ID is not numeric: ${envOverride}`,
      );
    }
    return { projectId, teamId, userId: user.id, created: false };
  }

  const FIXTURE_NAME = 'e2e-synthesis-clickthrough';

  // 4. Try to find an existing fixture row
  const existing = await sql<{ id: number }[]>`
    SELECT id FROM projects
    WHERE team_id = ${teamId} AND name = ${FIXTURE_NAME}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (existing.length > 0) {
    return {
      projectId: existing[0].id,
      teamId,
      userId: user.id,
      created: false,
    };
  }

  // 5. Insert a fresh fixture project. `projects` has no jsonb columns;
  // intake state lives in the related `project_data` table (one-to-one).
  // The shape inserted into `project_data.intake_state` must match what
  // the langgraph reads on kickoff — minimal viable shape only.
  //
  // Intentionally NO upstream stubs for the 7 NEW v2.1 nodes per P10.
  // This is the *real* runtime shape — those nodes will hit the no-stub
  // branch and persist `pending`. That's the EXPECTED outcome the
  // verifier asserts on.
  const inserted = await sql<{ id: number }[]>`
    INSERT INTO projects (
      team_id, name, vision, status, created_by, updated_at
    ) VALUES (
      ${teamId},
      ${FIXTURE_NAME},
      ${'P9-mitigation e2e fixture: minimal intake to drive synthesis click-through.'},
      ${'in progress'},
      ${user.id},
      now()
    )
    RETURNING id
  `;
  const projectId = inserted[0].id;

  const intakeState = {
    messages: [],
    extractedData: {
      actors: [
        {
          name: 'User',
          role: 'Primary',
          description: 'End user of the system',
        },
      ],
      useCases: [{ id: 'UC-01', name: 'Sample Use Case', actor: 'User' }],
    },
    completeness: 0.5,
    artifactReadiness: {},
    generatedArtifacts: [],
  };

  await sql`
    INSERT INTO project_data (project_id, intake_state, completeness)
    VALUES (
      ${projectId},
      ${sql.json(intakeState) as unknown as string},
      ${50}
    )
    ON CONFLICT (project_id) DO UPDATE
      SET intake_state = EXCLUDED.intake_state,
          completeness = EXCLUDED.completeness,
          updated_at = now()
  `;

  return {
    projectId,
    teamId,
    userId: user.id,
    created: true,
  };
}

/**
 * Hermetic-slate helper. Removes every `project_artifacts` row for the
 * fixture project so the click-through test observes the full lifecycle
 * `0 → N pending → {ready + stuck-pending}` from a clean baseline.
 */
export async function truncateProjectArtifacts(
  projectId: number,
): Promise<number> {
  const sql = db();
  const result = await sql`
    DELETE FROM project_artifacts WHERE project_id = ${projectId}
  `;
  return result.count;
}

/** Helper for evidence capture — group rows by status for the timeline. */
export interface ArtifactRowSnapshot {
  total: number;
  pending: number;
  ready: number;
  failed: number;
  byKind: Record<string, string>;
}

export async function snapshotProjectArtifacts(
  projectId: number,
): Promise<ArtifactRowSnapshot> {
  const sql = db();
  const rows = await sql<
    { artifact_kind: string; synthesis_status: string }[]
  >`
    SELECT artifact_kind, synthesis_status
    FROM project_artifacts
    WHERE project_id = ${projectId}
  `;
  const snap: ArtifactRowSnapshot = {
    total: rows.length,
    pending: 0,
    ready: 0,
    failed: 0,
    byKind: {},
  };
  for (const r of rows) {
    snap.byKind[r.artifact_kind] = r.synthesis_status;
    if (r.synthesis_status === 'pending') snap.pending++;
    else if (r.synthesis_status === 'ready') snap.ready++;
    else if (r.synthesis_status === 'failed') snap.failed++;
  }
  return snap;
}

/**
 * Refund / top-up credits on the test user's team so the route's 1000-credit
 * deduction never trips the `insufficient_credits` 402 path during the test.
 * Credit accounting itself is exercised by other tests; we just need the
 * gate to pass here.
 */
export async function ensureCredits(
  teamId: number,
  minimum = 5000,
): Promise<void> {
  const sql = db();
  await sql`
    UPDATE teams
    SET credits_used = 0, credit_limit = GREATEST(credit_limit, ${minimum})
    WHERE id = ${teamId}
  `;
}
