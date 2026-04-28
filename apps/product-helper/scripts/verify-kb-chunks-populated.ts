/**
 * verify-kb-chunks-populated — sanity check that the T3 Phase B ingest
 * actually populated `kb_chunks`.
 *
 * Brief: c1v v2.2 Wave E TE1 — engine-pgvector (EC-V21-E.6).
 *
 * Day-0 inventory (`plans/wave-e-day-0-inventory.md` line 120) records
 * the table + ivfflat index as shipped, and CLAUDE.md notes that T3
 * Phase B ran 0/3289 (a documented dedup no-op). Before the runtime
 * relies on retrieval, confirm rows actually exist — a silent zero-row
 * state means searchKB will return empty for every query and the engine
 * will fall through to rule-tree defaults forever.
 *
 * Usage:
 *   # Local Supabase (default)
 *   pnpm tsx scripts/verify-kb-chunks-populated.ts
 *
 *   # Production (or any other target) — pass POSTGRES_URL explicitly
 *   POSTGRES_URL=postgresql://... pnpm tsx scripts/verify-kb-chunks-populated.ts
 *
 *   # Verify both in one invocation
 *   pnpm tsx scripts/verify-kb-chunks-populated.ts --both
 *
 * Exit codes:
 *   0  — at least one chunk present in every checked target
 *   1  — at least one target has zero rows (BLOCKER — surface to coordinator)
 *   2  — connection failure on a target the caller asked for explicitly
 */

import postgres from 'postgres';

const LOCAL_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';

interface TargetResult {
  label: string;
  url: string;
  reachable: boolean;
  rowCount: number;
  byModule: Array<{ module: string; n: number }>;
  bySource: Array<{ kbSource: string; n: number }>;
  error?: string;
}

async function checkTarget(label: string, url: string): Promise<TargetResult> {
  const sql = postgres(url, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 5,
    onnotice: () => {},
  });

  try {
    await sql`SELECT 1`;
  } catch (err) {
    await sql.end({ timeout: 1 }).catch(() => {});
    return {
      label,
      url,
      reachable: false,
      rowCount: 0,
      byModule: [],
      bySource: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }

  try {
    // Service-role context so the upcoming kb_chunks RLS policy doesn't
    // mask the count under a non-bypass connection. `postgres` superuser
    // has rolbypassrls=true, which makes this a no-op locally; on
    // production with the service-role key it sets the app.current_role
    // expected by the policy.
    await sql`SELECT set_config('app.current_role', 'service', false)`;

    const [{ count }] = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM kb_chunks
    `;

    const byModule = await sql<{ module: string; n: number }[]>`
      SELECT module, COUNT(*)::int AS n
      FROM kb_chunks
      GROUP BY module
      ORDER BY module ASC
    `;

    const bySource = await sql<{ kb_source: string; n: number }[]>`
      SELECT kb_source, COUNT(*)::int AS n
      FROM kb_chunks
      GROUP BY kb_source
      ORDER BY kb_source ASC
    `;

    return {
      label,
      url,
      reachable: true,
      rowCount: count,
      byModule: byModule.map((r) => ({ module: r.module, n: r.n })),
      bySource: bySource.map((r) => ({ kbSource: r.kb_source, n: r.n })),
    };
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

function fmtTable(rows: Array<{ k: string; n: number }>): string {
  if (rows.length === 0) return '   (no rows)';
  const w = Math.max(...rows.map((r) => r.k.length));
  return rows.map((r) => `   ${r.k.padEnd(w)}  ${String(r.n).padStart(6)}`).join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const wantBoth = argv.includes('--both');
  const envUrl = process.env.POSTGRES_URL;

  // Build target list. Defaults to local when no env override.
  // --both implies local + (envUrl ?? error).
  const targets: Array<{ label: string; url: string }> = [];
  if (wantBoth) {
    targets.push({ label: 'local-supabase', url: LOCAL_URL });
    if (!envUrl) {
      console.error(
        '[verify-kb-chunks] --both requires POSTGRES_URL set to the second target (production).',
      );
      process.exit(2);
    }
    targets.push({ label: 'env-supplied', url: envUrl });
  } else if (envUrl) {
    targets.push({ label: 'env-supplied', url: envUrl });
  } else {
    targets.push({ label: 'local-supabase', url: LOCAL_URL });
  }

  let blockerHit = false;
  let unreachableExplicit = false;

  for (const t of targets) {
    const r = await checkTarget(t.label, t.url);
    console.log(`\n=== ${r.label} (${maskUrl(r.url)}) ===`);
    if (!r.reachable) {
      console.log(`   UNREACHABLE: ${r.error}`);
      // env-supplied unreachable is a hard fail; local unreachable when
      // the caller didn't ask for it is just a "skipped".
      if (r.label !== 'local-supabase' || envUrl !== undefined) {
        unreachableExplicit = true;
      }
      continue;
    }

    console.log(`   row count : ${r.rowCount}`);
    console.log('   by module :');
    console.log(fmtTable(r.byModule.map((x) => ({ k: x.module, n: x.n }))));
    console.log('   by source :');
    console.log(fmtTable(r.bySource.map((x) => ({ k: x.kbSource, n: x.n }))));

    if (r.rowCount === 0) {
      blockerHit = true;
      console.log(
        `   ⚠ BLOCKER: kb_chunks empty on ${r.label}. T3 Phase B ingest may have silently no-op'd ` +
          `(see CLAUDE.md: "Phase B ingest landed 2026-04-24: 0/3289 insert (dedup no-op)"). ` +
          `Surface to coordinator. Do NOT silently re-run ingest — investigate the dedup-key bug first.`,
      );
    }
  }

  if (blockerHit) {
    console.log('\nFAIL: at least one target has zero kb_chunks rows.');
    process.exit(1);
  }
  if (unreachableExplicit) {
    console.log('\nFAIL: at least one explicitly-requested target was unreachable.');
    process.exit(2);
  }
  console.log('\nOK: all checked targets have kb_chunks rows.');
  process.exit(0);
}

function maskUrl(u: string): string {
  // Hide passwords in console output.
  return u.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
}

main().catch((err) => {
  console.error('[verify-kb-chunks] unexpected error:', err);
  process.exit(2);
});
