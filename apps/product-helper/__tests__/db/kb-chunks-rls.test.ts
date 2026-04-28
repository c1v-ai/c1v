/**
 * RLS smoke tests for `kb_chunks` (TE1 v2.2 Wave E — EC-V21-E.6).
 *
 * Runs against the local Supabase instance on
 * `postgresql://postgres:postgres@localhost:54322/postgres` per repo
 * CLAUDE.md. Skipped automatically when no local DB is reachable so CI
 * without docker-supabase still passes.
 *
 * Coverage (KB corpus is GLOBAL — no per-tenant scoping):
 *   - Service role: full INSERT + SELECT.
 *   - Authenticated user (engine context): SELECT visible.
 *   - Authenticated user (tenant context): SELECT visible.
 *   - Anon role: SELECT denied at the grant layer (permission denied).
 *   - Authenticated user with no context flags: 0 rows (RLS-masked).
 *   - Authenticated user (engine + tenant): INSERT denied (no policy + revoked grant).
 *   - Authenticated user: UPDATE blocked (no policy → 0 rows affected).
 *
 * Per memory `reference_postgres_rls_set_config.md`, postgres-js
 * requires `SELECT set_config(...)` — `SET app.current_role = ...`
 * errors under that driver.
 */

import postgres from 'postgres';

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';

let sql: ReturnType<typeof postgres> | null = null;
let dbReachable = false;

beforeAll(async () => {
  // Pin pool to a single connection so SET ROLE / set_config state is
  // deterministic across queries (postgres-js otherwise reuses pooled
  // connections out-of-order, leaking role state between tests).
  sql = postgres(TEST_DB_URL, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 3,
    onnotice: () => {},
  });
  try {
    await sql`SELECT 1`;
    dbReachable = true;
  } catch {
    dbReachable = false;
  }
});

afterAll(async () => {
  if (sql) await sql.end({ timeout: 2 });
});

const itDb = (name: string, fn: () => Promise<void>) =>
  test(name, async () => {
    if (!dbReachable) {
      // eslint-disable-next-line no-console
      console.warn(
        `[kb-chunks-rls] skipping "${name}" — local DB unreachable on ${TEST_DB_URL}`,
      );
      return;
    }
    await fn();
  });

/**
 * 1536-dim unit vector literal (`[v,v,v,...]`) for INSERT fixtures.
 * Real production vectors come from OpenAI's text-embedding-3-small;
 * the RLS path doesn't care about content, only that a value is
 * provided to satisfy the NOT NULL constraint.
 */
function fixtureVector(): string {
  const v = 1 / Math.sqrt(1536);
  return '[' + new Array(1536).fill(v).join(',') + ']';
}

async function setServiceContext(s: ReturnType<typeof postgres>): Promise<void> {
  await s`RESET ROLE`;
  await s`SELECT set_config('app.current_role', 'service', false)`;
  await s`SELECT set_config('app.current_team_id', '', false)`;
}

async function setEngineContext(s: ReturnType<typeof postgres>): Promise<void> {
  // The `authenticated` role holds the SELECT grant from
  // 0026_kb_chunks_rls.sql; `anon` does not. Engine context = a
  // logged-in caller running the runtime path.
  await s`SET ROLE authenticated`;
  await s`SELECT set_config('app.current_role', 'engine', false)`;
  await s`SELECT set_config('app.current_team_id', '', false)`;
}

async function setTenantContext(s: ReturnType<typeof postgres>): Promise<void> {
  await s`SET ROLE authenticated`;
  await s`SELECT set_config('app.current_role', 'tenant', false)`;
  // Real tenant flow always carries a team id; pin a fixture value so
  // the policy's `current_team_id IS NOT NULL` branch evaluates true.
  await s`SELECT set_config('app.current_team_id', '1', false)`;
}

async function setAuthedNoFlagsContext(
  s: ReturnType<typeof postgres>,
): Promise<void> {
  // Authenticated role but no current_role / current_team_id set →
  // the RLS policy condition is false, so SELECT returns 0 rows
  // (grant is present, RLS masks the rows).
  await s`SET ROLE authenticated`;
  await s`SELECT set_config('app.current_role', '', false)`;
  await s`SELECT set_config('app.current_team_id', '', false)`;
}

async function setAnonContext(s: ReturnType<typeof postgres>): Promise<void> {
  // anon has no SELECT grant — every read raises "permission denied".
  // This proves unauthenticated traffic is blocked at the grant layer
  // (defense-in-depth alongside RLS).
  await s`SET ROLE anon`;
  await s`SELECT set_config('app.current_role', '', false)`;
  await s`SELECT set_config('app.current_team_id', '', false)`;
}

/** Insert one chunk under service role and return its id. */
async function insertFixtureChunk(
  s: ReturnType<typeof postgres>,
  suffix: string,
): Promise<{ id: string; kbSource: string; chunkHash: string }> {
  await setServiceContext(s);
  const kbSource = 'rls-test-' + suffix;
  // 64-hex chunk_hash satisfies the format CHECK constraint.
  const chunkHash = (suffix + 'a'.repeat(64)).slice(-64).replace(/[^a-f0-9]/g, 'a');
  const vec = fixtureVector();
  const [row] = await s<{ id: string }[]>`
    INSERT INTO kb_chunks
      (kb_source, module, phase, section, content, embedding, chunk_index, chunk_hash)
    VALUES
      (${kbSource}, 'rls-test', '', NULL, ${'rls test content ' + suffix},
       ${vec}::vector, 0, ${chunkHash})
    ON CONFLICT (kb_source, chunk_hash) DO UPDATE SET module = EXCLUDED.module
    RETURNING id
  `;
  return { id: row.id, kbSource, chunkHash };
}

describe('kb_chunks — RLS policies (EC-V21-E.6)', () => {
  itDb('service role can INSERT and SELECT', async () => {
    if (!sql) throw new Error('sql not initialized');
    const f = await insertFixtureChunk(sql, 'svc-' + Date.now());

    const rows = await sql<{ id: string }[]>`
      SELECT id FROM kb_chunks WHERE id = ${f.id}
    `;
    expect(rows.length).toBe(1);
  });

  itDb('engine context (current_role=engine) can SELECT', async () => {
    if (!sql) throw new Error('sql not initialized');
    const f = await insertFixtureChunk(sql, 'eng-' + Date.now());

    await setEngineContext(sql);
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM kb_chunks WHERE id = ${f.id}
    `;
    expect(rows.length).toBe(1);
  });

  itDb('tenant context (current_team_id set) can SELECT', async () => {
    if (!sql) throw new Error('sql not initialized');
    const f = await insertFixtureChunk(sql, 'tnt-' + Date.now());

    await setTenantContext(sql);
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM kb_chunks WHERE id = ${f.id}
    `;
    expect(rows.length).toBe(1);
  });

  itDb('anon role is denied SELECT entirely (no grant)', async () => {
    if (!sql) throw new Error('sql not initialized');
    await insertFixtureChunk(sql, 'anon-' + Date.now());

    await setAnonContext(sql);
    // anon got REVOKE ALL in 0026 — postgres raises "permission denied"
    // before RLS even evaluates. This is the defense-in-depth layer.
    await expect(
      sql`SELECT id FROM kb_chunks LIMIT 1`,
    ).rejects.toThrow(/permission denied/i);
  });

  itDb('authenticated role with no context flags sees zero rows', async () => {
    if (!sql) throw new Error('sql not initialized');
    const f = await insertFixtureChunk(sql, 'noflags-' + Date.now());

    await setAuthedNoFlagsContext(sql);
    // Grant is present, but the policy condition is false (neither
    // current_role IN ('engine','tenant') nor current_team_id set).
    // Query succeeds but RLS masks all rows.
    const rows = await sql<{ id: string }[]>`
      SELECT id FROM kb_chunks WHERE id = ${f.id}
    `;
    expect(rows.length).toBe(0);
  });

  itDb('engine context cannot INSERT (no insert policy + grant revoked)', async () => {
    if (!sql) throw new Error('sql not initialized');
    await setEngineContext(sql);
    const vec = fixtureVector();

    await expect(
      sql`
        INSERT INTO kb_chunks
          (kb_source, module, phase, content, embedding, chunk_index, chunk_hash)
        VALUES
          ('rls-test-engine-insert', 'rls-test', '', 'should fail',
           ${vec}::vector, 0, ${'b'.repeat(64)})
      `,
    ).rejects.toThrow();
  });

  itDb('tenant context cannot INSERT (no insert policy + grant revoked)', async () => {
    if (!sql) throw new Error('sql not initialized');
    await setTenantContext(sql);
    const vec = fixtureVector();

    await expect(
      sql`
        INSERT INTO kb_chunks
          (kb_source, module, phase, content, embedding, chunk_index, chunk_hash)
        VALUES
          ('rls-test-tenant-insert', 'rls-test', '', 'should fail',
           ${vec}::vector, 0, ${'c'.repeat(64)})
      `,
    ).rejects.toThrow();
  });

  itDb('engine context cannot UPDATE existing row', async () => {
    if (!sql) throw new Error('sql not initialized');
    const f = await insertFixtureChunk(sql, 'upd-' + Date.now());
    await setEngineContext(sql);

    // No UPDATE policy → RLS treats the row as invisible for UPDATE;
    // statement succeeds but matches 0 rows. (Some Supabase setups
    // reject outright when grant is revoked — we accept either signal.)
    let updateBlocked = false;
    try {
      const result = await sql`
        UPDATE kb_chunks SET module = 'tampered' WHERE id = ${f.id}
      `;
      // postgres-js returns affectedRows on the result; 0 means RLS-masked.
      const affected = (result as unknown as { count?: number }).count;
      if (affected === 0) updateBlocked = true;
    } catch {
      updateBlocked = true;
    }
    expect(updateBlocked).toBe(true);

    // Verify the row still has its original `module` under service-role read.
    await setServiceContext(sql);
    const [row] = await sql<{ module: string }[]>`
      SELECT module FROM kb_chunks WHERE id = ${f.id}
    `;
    expect(row.module).toBe('rls-test');
  });
});
