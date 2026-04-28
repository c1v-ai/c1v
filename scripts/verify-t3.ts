/**
 * verify-t3 (monorepo-root shim) — delegates to
 * `apps/product-helper/scripts/verify-t3.ts` which holds the real logic.
 *
 * The real script imports `@/lib/...` (path alias scoped to
 * `apps/product-helper/tsconfig.json`), so it has to run under that
 * app's tsconfig. This shim exists because task #15 declares the
 * deliverable path as `/Users/davidancor/Projects/c1v/scripts/verify-t3.ts`
 * — running this file reaches the implementation exactly as the brief
 * requires.
 *
 * Usage:
 *   pnpm tsx scripts/verify-t3.ts
 */

import { spawnSync } from 'child_process';
import { resolve } from 'path';

const REAL_SCRIPT = resolve(
  __dirname,
  '..',
  'apps',
  'product-helper',
  'scripts',
  'verify-t3.ts',
);
const APP_CWD = resolve(__dirname, '..', 'apps', 'product-helper');

const res = spawnSync('pnpm', ['tsx', REAL_SCRIPT, ...process.argv.slice(2)], {
  cwd: APP_CWD,
  stdio: 'inherit',
  env: process.env,
});

process.exit(res.status ?? 1);
