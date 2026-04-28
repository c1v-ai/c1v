#!/usr/bin/env -S npx tsx
/**
 * verify-decision-audit-chain.ts
 *
 * CLI walker for the `decision_audit` hash chain. Loads every row for a
 * given project and confirms `row[i].canonicalHash === row[i+1].hash_chain_prev`.
 * Used by `qa-e-verifier` for the EC-V21-E.3 ledger check.
 *
 * Usage:
 *   pnpm tsx scripts/verify-decision-audit-chain.ts --projectId=<int>
 *   pnpm tsx scripts/verify-decision-audit-chain.ts --projectId=<int> --targetField=<text>
 *
 * Exit codes:
 *   0 — chain valid (all rows hash through)
 *   1 — argument error (missing/invalid --projectId)
 *   2 — chain BROKEN at one or more streams (tamper detected)
 *   3 — DB unreachable / runtime error
 *
 * Stream semantics:
 *   The hash chain is keyed on (project_id, target_field). Without
 *   --targetField the script discovers every distinct target_field for
 *   the project and verifies each stream independently. Reports per-stream.
 *
 * @module scripts/verify-decision-audit-chain
 */

import process from 'node:process';

import { db } from '@/lib/db/drizzle';
import { decisionAudit } from '@/lib/db/schema/decision-audit';
import { verifyChain } from '@/lib/langchain/engines/audit-writer';
import { eq, sql } from 'drizzle-orm';

interface CliArgs {
  projectId: number;
  targetField?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const out: Partial<CliArgs> = {};
  for (const arg of argv.slice(2)) {
    const [key, value] = arg.split('=', 2);
    if (key === '--projectId') {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) {
        process.stderr.write(`error: --projectId must be a positive integer (got: ${value})\n`);
        process.exit(1);
      }
      out.projectId = n;
    } else if (key === '--targetField') {
      out.targetField = value;
    } else if (key === '--help' || key === '-h') {
      printUsage();
      process.exit(0);
    } else {
      process.stderr.write(`error: unknown argument: ${arg}\n`);
      printUsage();
      process.exit(1);
    }
  }
  if (out.projectId == null) {
    process.stderr.write('error: --projectId=<int> is required\n');
    printUsage();
    process.exit(1);
  }
  return out as CliArgs;
}

function printUsage(): void {
  process.stdout.write(
    [
      'Usage: pnpm tsx scripts/verify-decision-audit-chain.ts --projectId=<int> [--targetField=<text>]',
      '',
      'Walks every (projectId, targetField) hash-chain stream for the given project',
      'and confirms each row\'s hash_chain_prev matches canonicalHash(prev).',
      '',
      'Exit: 0=valid, 1=usage, 2=broken, 3=runtime',
      '',
    ].join('\n'),
  );
}

async function discoverStreams(projectId: number): Promise<string[]> {
  const rows = await db
    .selectDistinct({ targetField: decisionAudit.targetField })
    .from(decisionAudit)
    .where(eq(decisionAudit.projectId, projectId));
  return rows.map((r) => r.targetField);
}

async function rowCount(projectId: number, targetField: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<string>`count(*)::text` })
    .from(decisionAudit)
    .where(
      sql`${decisionAudit.projectId} = ${projectId} AND ${decisionAudit.targetField} = ${targetField}`,
    );
  return Number(row?.count ?? '0');
}

async function main(): Promise<void> {
  const { projectId, targetField } = parseArgs(process.argv);

  const streams = targetField ? [targetField] : await discoverStreams(projectId);
  if (streams.length === 0) {
    process.stdout.write(
      `[verify-chain] project ${projectId}: 0 decision_audit rows found — nothing to verify.\n`,
    );
    return;
  }

  let brokenStreams = 0;
  let totalRows = 0;

  for (const stream of streams) {
    const result = await verifyChain(projectId, stream);
    totalRows += result.rowsChecked;
    if (result.valid) {
      process.stdout.write(
        `[verify-chain] project ${projectId} target_field=${stream}: VALID (${result.rowsChecked} rows)\n`,
      );
    } else {
      brokenStreams += 1;
      const at = result.brokenAt;
      process.stdout.write(
        `[verify-chain] project ${projectId} target_field=${stream}: BROKEN ` +
          `at row ${at?.id} (expected hash_chain_prev=${at?.expected ?? 'NULL'}, ` +
          `actual=${at?.actual ?? 'NULL'}); ${result.rowsChecked} rows checked.\n`,
      );
    }
  }

  process.stdout.write(
    `[verify-chain] project ${projectId}: ${streams.length} stream(s), ${totalRows} row(s), ` +
      `${brokenStreams === 0 ? 'ALL VALID' : `${brokenStreams} BROKEN`}.\n`,
  );

  // Sanity: cross-check streams discovered match row counts (smoke for the
  // discoverStreams query in case a future schema change breaks distinct).
  if (!targetField) {
    let counted = 0;
    for (const stream of streams) counted += await rowCount(projectId, stream);
    if (counted !== totalRows) {
      process.stderr.write(
        `[verify-chain] WARNING: stream-row sum (${counted}) != verifier rowsChecked sum (${totalRows}) — ` +
          'verifyChain may have skipped rows.\n',
      );
    }
  }

  if (brokenStreams > 0) process.exit(2);
}

main().catch((err) => {
  process.stderr.write(`[verify-chain] runtime error: ${(err as Error).message}\n`);
  process.exit(3);
});
