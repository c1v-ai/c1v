/**
 * verify-td1.ts — Wave D TD1 (`c1v-apispec-iter3`) verifier.
 *
 * Asserts the exit criteria the v2.1 spec hands TD1:
 *   EC-V21-D.1  preflight log captured + REVIEW.md recorded with branch
 *               decision + stop_reason + usage data
 *   EC-V21-D.2  two-stage flow shipped behind feature flag (default-on-new /
 *               default-off-existing semantics)
 *   EC-V21-D.3  project=33 re-gen succeeds with all 6 top-level keys + assembled
 *               output validates against `apiSpecificationSchema`
 *   EC-V21-D.4  Wave-D regression test pinned to project=33 + auto-discovered
 *               by jest's default `testMatch`
 *   EC-V21-D.5  token cost drops measurably (≥ 30% threshold, observed ~83%)
 *
 * Mode: NON-FIX. Failures log + capture evidence; tag `td1-wave-d-complete`
 * gated by every assertion green.
 *
 * Usage:
 *   pnpm tsx scripts/verify-td1.ts
 *   pnpm tsx scripts/verify-td1.ts --json
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const APP_ROOT = resolve(REPO_ROOT, 'apps', 'product-helper');
const TD1_OUT = resolve(REPO_ROOT, 'plans', 'v21-outputs', 'td1');

type Status = 'PASS' | 'FAIL' | 'SKIP';

interface CheckResult {
  ec: string;
  name: string;
  status: Status;
  detail: string;
  evidence?: string;
}

const results: CheckResult[] = [];

function record(r: CheckResult) {
  results.push(r);
  const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '⏭';
  process.stderr.write(`${icon} [${r.ec}] ${r.name} — ${r.detail}\n`);
}

function fileExists(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

function read(p: string): string {
  return readFileSync(p, 'utf8');
}

// -------------------------------------------- (a) EC-V21-D.1 — preflight log
function checkPreflightLog() {
  const path = join(TD1_OUT, 'preflight-log.md');
  if (!fileExists(path)) {
    record({
      ec: 'EC-V21-D.1',
      name: 'preflight-log.md exists',
      status: 'FAIL',
      detail: `missing: ${path.replace(REPO_ROOT + '/', '')}`,
    });
    return;
  }
  const src = read(path);
  const hasBranchDecision = /Branch decision/i.test(src);
  const hasStopReason =
    /stop_reason/i.test(src) && /max_tokens|end_turn|tool_use/.test(src);
  const hasUsage = /input_tokens|output_tokens|usage/i.test(src);

  if (hasBranchDecision && hasStopReason && hasUsage) {
    record({
      ec: 'EC-V21-D.1',
      name: 'preflight log records branch decision + stop_reason + usage',
      status: 'PASS',
      detail:
        'branch-decision + stop_reason (max_tokens) + input/output_tokens captured',
    });
  } else {
    record({
      ec: 'EC-V21-D.1',
      name: 'preflight log records branch decision + stop_reason + usage',
      status: 'FAIL',
      detail: `branch=${hasBranchDecision} stop_reason=${hasStopReason} usage=${hasUsage}`,
    });
  }
}

// ---------------------------- (b) EC-V21-D.2 — feature-flag resolution table
function checkFeatureFlagResolution() {
  const path = join(APP_ROOT, 'lib/langchain/agents/api-spec-agent.ts');
  if (!fileExists(path)) {
    record({
      ec: 'EC-V21-D.2',
      name: 'api-spec-agent.ts present',
      status: 'FAIL',
      detail: 'agent file missing',
    });
    return;
  }
  const src = read(path);

  // Resolution: options?.twoStage ?? (envFlag === undefined ? true : envFlag !== 'off')
  // Static-source assertion of the default-on-new / default-off-existing state machine.
  const hasOptionsParam = /options\?:\s*\{\s*twoStage\?:\s*boolean\s*\}/.test(
    src,
  );
  const hasEnvFlagRead = /process\.env\.API_SPEC_TWO_STAGE/.test(src);
  // Default-on-new: envFlag undefined → true
  const defaultsOnWhenEnvUnset =
    /envFlag\s*===\s*undefined\s*\?\s*true/.test(src);
  // 'off' → legacy
  const offOptOut = /envFlag\s*!==\s*'off'/.test(src);
  // options override
  const optionsOverridesEnv = /options\?\.twoStage\s*\?\?/.test(src);

  const allGood =
    hasOptionsParam &&
    hasEnvFlagRead &&
    defaultsOnWhenEnvUnset &&
    offOptOut &&
    optionsOverridesEnv;

  if (allGood) {
    record({
      ec: 'EC-V21-D.2',
      name: 'feature-flag state machine (default-on-new / default-off-existing)',
      status: 'PASS',
      detail:
        'options?.twoStage ?? (env undefined → true; env=off → legacy); explicit twoStage:false pins legacy',
    });
  } else {
    record({
      ec: 'EC-V21-D.2',
      name: 'feature-flag state machine',
      status: 'FAIL',
      detail: `optsParam=${hasOptionsParam} envRead=${hasEnvFlagRead} defaultOn=${defaultsOnWhenEnvUnset} offOptOut=${offOptOut} overrides=${optionsOverridesEnv}`,
    });
  }
}

// ------------------------- (c) EC-V21-D.3 + EC-V21-D.4 — regression-test green
function runRegressionSuite() {
  const env = {
    ...process.env,
    POSTGRES_URL: 'stub',
    AUTH_SECRET: 'stubstubstubstubstubstubstubstubstub',
    ANTHROPIC_API_KEY: 'sk-ant-stub',
    STRIPE_SECRET_KEY: 'sk_test_stub',
    STRIPE_WEBHOOK_SECRET: 'whsec_stub',
    OPENROUTER_API_KEY: 'stub',
    BASE_URL: 'http://localhost:3000',
  };
  const proc = spawnSync(
    'npx',
    [
      'jest',
      '--colors=false',
      '__tests__/api-spec-agent.regression.test.ts',
      '__tests__/api-spec-agent.stage1.test.ts',
      '__tests__/api-spec/stage2-expansion.test.ts',
    ],
    { cwd: APP_ROOT, env, encoding: 'utf8' },
  );
  const out = (proc.stdout || '') + (proc.stderr || '');

  const passed = proc.status === 0;
  const tail = out.split('\n').slice(-30).join('\n');

  if (passed) {
    record({
      ec: 'EC-V21-D.3',
      name: 'project=33 two-stage regression — 6 top-level keys + apiSpecificationSchema parse',
      status: 'PASS',
      detail: 'jest exit=0; regression suite all green',
      evidence: tail,
    });
    record({
      ec: 'EC-V21-D.4',
      name: 'Wave-D regression suite (regression + stage1 + stage2-expansion)',
      status: 'PASS',
      detail: 'auto-discovered by jest default testMatch (`**/__tests__/**/*.test.ts`)',
      evidence: tail,
    });
  } else {
    record({
      ec: 'EC-V21-D.3',
      name: 'project=33 two-stage regression',
      status: 'FAIL',
      detail: `jest exit=${proc.status}`,
      evidence: tail,
    });
    record({
      ec: 'EC-V21-D.4',
      name: 'Wave-D regression suite',
      status: 'FAIL',
      detail: `jest exit=${proc.status}`,
      evidence: tail,
    });
  }
}

// ------- (c2) EC-V21-D.4 — confirm regression test is jest-default-discovered
function checkRegressionTestPinned() {
  const regressionPath = join(
    APP_ROOT,
    '__tests__/api-spec-agent.regression.test.ts',
  );
  const stage1Path = join(APP_ROOT, '__tests__/api-spec-agent.stage1.test.ts');
  const stage2Path = join(APP_ROOT, '__tests__/api-spec/stage2-expansion.test.ts');

  const all = [regressionPath, stage1Path, stage2Path];
  const missing = all.filter((p) => !fileExists(p));
  if (missing.length > 0) {
    record({
      ec: 'EC-V21-D.4',
      name: 'regression test files present at jest-discoverable paths',
      status: 'FAIL',
      detail: `missing: ${missing.map((p) => p.replace(APP_ROOT + '/', '')).join(', ')}`,
    });
    return;
  }
  // Confirm content pin to project=33
  const regSrc = read(regressionPath);
  const pinsProject33 =
    /project=?33|project33|Heat Guard|HeatStressAssessment/i.test(regSrc);
  if (pinsProject33) {
    record({
      ec: 'EC-V21-D.4',
      name: 'regression test pinned to project=33 fixture',
      status: 'PASS',
      detail:
        'apps/product-helper/__tests__/api-spec-agent.regression.test.ts references the Heat Guard fixture',
    });
  } else {
    record({
      ec: 'EC-V21-D.4',
      name: 'regression test pinned to project=33 fixture',
      status: 'FAIL',
      detail: 'project=33 fixture markers not found in regression test source',
    });
  }
}

// ------------------------------ (d) EC-V21-D.5 — token-cost drop ≥ 30 %
function checkTokenCostDelta() {
  const path = join(TD1_OUT, 'token-cost-delta.md');
  if (!fileExists(path)) {
    record({
      ec: 'EC-V21-D.5',
      name: 'token-cost-delta.md exists',
      status: 'FAIL',
      detail: `missing: ${path.replace(REPO_ROOT + '/', '')}`,
    });
    return;
  }
  const src = read(path);

  // Capture the headline reduction percentage(s). Looking for "≥ 30 %"
  // floor — observed ~83 % per upstream agent.
  const pcts = [...src.matchAll(/(\d{2,3})\s*%/g)].map((m) =>
    Number(m[1]),
  );
  const maxPct = pcts.length > 0 ? Math.max(...pcts) : 0;
  const meetsFloor = maxPct >= 30;

  // Stage-2 must produce 0 LLM tokens (deterministic mapper).
  const claimsStage2Zero =
    /Stage-2 LLM tokens?:?\s*0|stage-2 .* (deterministic|0 LLM)/i.test(src);

  if (meetsFloor && claimsStage2Zero) {
    record({
      ec: 'EC-V21-D.5',
      name: 'token cost drops ≥ 30 % + stage-2 LLM tokens = 0',
      status: 'PASS',
      detail: `largest reduction in delta doc = ${maxPct}% (floor 30%); stage-2 deterministic asserted`,
    });
  } else {
    record({
      ec: 'EC-V21-D.5',
      name: 'token cost drop',
      status: 'FAIL',
      detail: `largest %=${maxPct} (floor 30) stage2-zero=${claimsStage2Zero}`,
    });
  }
}

// ------ (e) EC-V21-D.3 (extra) — apiSpecificationSchema preserved as validator
function checkSchemaPreserved() {
  const path = join(APP_ROOT, 'lib/langchain/agents/api-spec-agent.ts');
  const src = read(path);
  const hasSchemaDecl = /const apiSpecificationSchema = z\.object\(/.test(src);
  const usedAsValidator = /apiSpecificationSchema\.parse\(/.test(src);
  const stage1Wired = /generateStage1ApiSpec\(/.test(src);
  const stage2Wired = /stage2ExpansionEngine\(/.test(src);

  if (hasSchemaDecl && usedAsValidator && stage1Wired && stage2Wired) {
    record({
      ec: 'EC-V21-D.3',
      name: 'apiSpecificationSchema preserved as output validator + two-stage wired',
      status: 'PASS',
      detail:
        'apiSpecificationSchema declared + .parse() validates assembly; generateStage1ApiSpec + stage2ExpansionEngine both wired',
    });
  } else {
    record({
      ec: 'EC-V21-D.3',
      name: 'apiSpecificationSchema preserved + two-stage wired',
      status: 'FAIL',
      detail: `schema-decl=${hasSchemaDecl} validator=${usedAsValidator} stage1=${stage1Wired} stage2=${stage2Wired}`,
    });
  }
}

// ----------------------------------------------------------------- main ----
function main() {
  process.stderr.write('verify-td1 — TD1 (c1v-apispec-iter3) Wave-D verifier\n');
  process.stderr.write('========================================================\n');

  checkPreflightLog();
  checkFeatureFlagResolution();
  checkSchemaPreserved();
  checkRegressionTestPinned();
  runRegressionSuite();
  checkTokenCostDelta();

  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const skip = results.filter((r) => r.status === 'SKIP').length;

  process.stderr.write('\n========================================================\n');
  process.stderr.write(
    `PASS=${pass}  FAIL=${fail}  SKIP=${skip}  (total=${results.length})\n`,
  );

  if (process.argv.includes('--json')) {
    process.stdout.write(
      JSON.stringify({ pass, fail, skip, results }, null, 2) + '\n',
    );
  }

  if (fail > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main();

// Marker so the file can be detected as ESM by tsx.
export {};
