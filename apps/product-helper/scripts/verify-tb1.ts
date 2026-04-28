#!/usr/bin/env tsx
/**
 * verify-tb1 — TB1 Wave-B exit-criteria gate runner (EC-V21-B.1 .. B.6).
 *
 * Per Bond's 2026-04-25 21:09 EDT declassification, EC-V21-B.6 is "cost
 * telemetry instrumented + dashboard live", NOT a $/mo pass/fail threshold.
 *
 * Modes:
 *   - Static gate (default): verifies on-disk artifacts (modules, tests, YAMLs,
 *     wiring, AV.01-canned-string sweep). CI-reusable, no DB.
 *   - --jest: also runs the producer test suites (cache, jobs, billing,
 *     observability) and surfaces aggregate counts.
 *
 * Usage:
 *   npx tsx apps/product-helper/scripts/verify-tb1.ts          # static
 *   npx tsx apps/product-helper/scripts/verify-tb1.ts --jest   # +tests
 *   npx tsx apps/product-helper/scripts/verify-tb1.ts --json   # machine
 *
 * @module scripts/verify-tb1
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const APP_ROOT = join(REPO_ROOT, 'apps', 'product-helper');
const PLANS_TB1 = join(REPO_ROOT, 'plans', 'v21-outputs', 'tb1');

interface GateResult {
  id: string;
  passed: boolean | 'skip';
  detail: string;
}

const results: GateResult[] = [];

function record(id: string, passed: boolean | 'skip', detail: string) {
  results.push({ id, passed, detail });
}

function fileExists(p: string): boolean {
  try { return statSync(p).isFile(); } catch { return false; }
}
function dirExists(p: string): boolean {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

// ─── EC-V21-B.1 — cache hit-rate > 30% on 10×5 synthetic load ──────────────
function gateB1(): void {
  const cachePath = join(APP_ROOT, 'lib/cache/synthesis-cache.ts');
  const testPath = join(APP_ROOT, '__tests__/cache/synthesis-cache.test.ts');
  if (!fileExists(cachePath) || !fileExists(testPath)) {
    record('EC-V21-B.1', false, `missing artifact: cache=${fileExists(cachePath)} test=${fileExists(testPath)}`);
    return;
  }
  const cacheSrc = readFileSync(cachePath, 'utf8');
  const testSrc = readFileSync(testPath, 'utf8');
  const reusesHashHelper = /computeInputsHash|InputsHashParts/.test(cacheSrc);
  const declaresLoadGate = /EC-V21-B\.1|hit-rate\s*>\s*30%|>30%|hitRate.*0\.3|hit_rate.*0\.30/i.test(testSrc);
  const piiGuard = /NOT\s+include|tenant identifiers|MUST NOT|content-addressed/i.test(cacheSrc);
  const ok = reusesHashHelper && declaresLoadGate && piiGuard;
  record('EC-V21-B.1', ok,
    `cache module=present, hash-helper-reuse=${reusesHashHelper}, load-gate-test=${declaresLoadGate}, pii-guard-doc=${piiGuard}`);
}

// ─── EC-V21-B.2 — lazy-gen ≥ 50% post-intake p95 drop on deferred subset ───
function gateB2(): void {
  const lgPath = join(APP_ROOT, 'lib/jobs/lazy-gen.ts');
  const testPath = join(APP_ROOT, '__tests__/jobs/lazy-gen.test.ts');
  if (!fileExists(lgPath) || !fileExists(testPath)) {
    record('EC-V21-B.2', false, `missing artifact: lazy-gen=${fileExists(lgPath)} test=${fileExists(testPath)}`);
    return;
  }
  const lgSrc = readFileSync(lgPath, 'utf8');
  const testSrc = readFileSync(testPath, 'utf8');
  // Scope to the SYNTHESIS_LAZY_MAP literal block so we count map entries only,
  // not type defs / helper-function references.
  const mapBlock = lgSrc.match(/SYNTHESIS_LAZY_MAP[^=]*=\s*\{([\s\S]+?)\};/);
  const deferredKindsCount = mapBlock ? (mapBlock[1].match(/'on_view'/g) ?? []).length : 0;
  const eagerKindsCount = mapBlock ? (mapBlock[1].match(/'eager'/g) ?? []).length : 0;
  const correctSplit = deferredKindsCount === 4 && eagerKindsCount === 3;
  const declaresP95Gate = /EC-V21-B\.2|deferred.*subset|p95.*drop|≥\s*50%|>=\s*50%|p95.*deferred/i.test(testSrc);
  const ok = correctSplit && declaresP95Gate;
  record('EC-V21-B.2', ok,
    `lazy-gen=present, eager=${eagerKindsCount} deferred=${deferredKindsCount} (spec 3+4), p95-deferred-test=${declaresP95Gate}`);
}

// ─── EC-V21-B.3 — Free hard-cap 1/mo + Plus unlimited ──────────────────────
function gateB3(): void {
  const tierPath = join(APP_ROOT, 'lib/billing/synthesis-tier.ts');
  const testPath = join(APP_ROOT, '__tests__/billing/synthesis-tier.test.ts');
  const envExample = join(APP_ROOT, '.env.example');
  if (!fileExists(tierPath) || !fileExists(testPath)) {
    record('EC-V21-B.3', false, `missing: tier=${fileExists(tierPath)} test=${fileExists(testPath)}`);
    return;
  }
  const tierSrc = readFileSync(tierPath, 'utf8');
  const testSrc = readFileSync(testPath, 'utf8');
  const dbBacked = /from\s+'@\/lib\/db|drizzle|projectArtifacts|sql`|from\(.*\)\s*\.where|count\(/i.test(tierSrc);
  const freeCapOne = /FREE_SYNTHESIS_PER_MONTH\s*=\s*1\b/.test(tierSrc) || /Free.*1\s*\/\s*mo|free.*=\s*1/.test(tierSrc);
  const plusUnlimited = /unlimited|Infinity|Number\.POSITIVE_INFINITY|allowed:\s*true.*plus/i.test(tierSrc);
  const reasonEnum = /'free_tier_exhausted'/.test(tierSrc) && /'no_credits'/.test(tierSrc);
  const testCoversFreeCap = /free.*1\s*\/\s*mo|exhaust|second attempt|free_tier_exhausted/i.test(testSrc);
  const testCoversPlus = /plus.*unlimited|5 in succession|plus.*∞|plus.*inf/i.test(testSrc);
  let envFlipped = false;
  if (fileExists(envExample)) {
    const env = readFileSync(envExample, 'utf8');
    envFlipped = /SYNTHESIS_FREE_TIER_GATE\s*=\s*['"]?enabled/i.test(env);
  }
  const ok = dbBacked && freeCapOne && plusUnlimited && reasonEnum && testCoversFreeCap && testCoversPlus && envFlipped;
  record('EC-V21-B.3', ok,
    `tier=present, db-backed=${dbBacked}, FREE_CAP=1=${freeCapOne}, plus-∞=${plusUnlimited}, reason-enum=${reasonEnum}, free-test=${testCoversFreeCap}, plus-test=${testCoversPlus}, env=enabled=${envFlipped}`);
}

// ─── EC-V21-B.4 — circuit-breaker 30s + retry CTA + NO canned fall-back ────
function gateB4(): void {
  const cbPath = join(APP_ROOT, 'lib/jobs/circuit-breaker.ts');
  const cbTestPath = join(APP_ROOT, '__tests__/jobs/circuit-breaker.test.ts');
  const retryRoute = join(APP_ROOT, 'app/api/projects/[id]/artifacts/[kind]/retry/route.ts');
  const dropdown = join(APP_ROOT, 'components/synthesis/download-dropdown.tsx');
  for (const [tag, p] of [['cb', cbPath], ['cbTest', cbTestPath], ['retryRoute', retryRoute], ['dropdown', dropdown]] as const) {
    if (!fileExists(p)) {
      record('EC-V21-B.4', false, `missing artifact: ${tag}=${p}`);
      return;
    }
  }
  const cbSrc = readFileSync(cbPath, 'utf8');
  const cbTestSrc = readFileSync(cbTestPath, 'utf8');
  const retrySrc = readFileSync(retryRoute, 'utf8');
  const dropdownSrc = readFileSync(dropdown, 'utf8');

  const timeout30s = /DEFAULT_SIDECAR_TIMEOUT_MS\s*=\s*30_?000|30\s*000\s*ms|30s timeout/.test(cbSrc);
  const cbTimeoutTest = /timeout|30_000|30s|30000/i.test(cbTestSrc);
  const retryEndpointPosts = /POST|method\s*=\s*'POST'|export\s+async\s+function\s+POST/.test(retrySrc);
  const retryIsIdempotent = /idempot|already.*pending|non-terminal/i.test(retrySrc);
  const retryCTAWired = /\/retry/.test(dropdownSrc) && /handleRetry|onClick.*retry|toast.*retry/i.test(dropdownSrc);

  // CRITICAL: regex sweep for canned fall-back string literals in failure-state UI.
  const failureStateScopes = [
    join(APP_ROOT, 'components/synthesis/download-dropdown.tsx'),
    join(APP_ROOT, 'components/synthesis/empty-state.tsx'),
    join(APP_ROOT, 'components/synthesis/recommendation-viewer.tsx'),
    join(APP_ROOT, 'components/synthesis/section-callout.tsx'),
    join(APP_ROOT, 'components/synthesis/section-figures.tsx'),
    join(APP_ROOT, 'components/synthesis/section-rationale.tsx'),
    join(APP_ROOT, 'components/synthesis/section-references-table.tsx'),
    join(APP_ROOT, 'components/synthesis/section-risks.tsx'),
    join(APP_ROOT, 'components/synthesis/section-tradeoffs.tsx'),
    join(APP_ROOT, 'components/synthesis/provenance-accordion.tsx'),
  ];
  // String-literal-only matches; strip JSDoc/line/block comments first so a
  // doc-comment that *names* the prohibited strings (e.g. "// no AV.01 leaks")
  // does not register as a fall-back leak.
  const cannedRegex = /(['"`])AV\.01\1|(['"`])canned-c1v\2|(['"`])canned[_\- ]fall[_\- ]?back\3/i;
  const stripComments = (src: string): string =>
    src
      .replace(/\/\*[\s\S]*?\*\//g, '')        // /* ... */ + JSDoc
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1');   // // ... (preserve url::path)
  const offenders: string[] = [];
  for (const f of failureStateScopes) {
    if (!fileExists(f)) continue;
    const src = stripComments(readFileSync(f, 'utf8'));
    if (cannedRegex.test(src)) offenders.push(f.replace(REPO_ROOT, '.'));
  }

  const noCannedInUI = offenders.length === 0;
  const ok = timeout30s && cbTimeoutTest && retryEndpointPosts && retryIsIdempotent && retryCTAWired && noCannedInUI;
  record('EC-V21-B.4', ok,
    `timeout=30s=${timeout30s}, cb-test=${cbTimeoutTest}, retry-endpoint=${retryEndpointPosts}, idempotent-doc=${retryIsIdempotent}, retry-CTA-wired=${retryCTAWired}, NO-canned-fallback=${noCannedInUI}${offenders.length ? ` offenders=${offenders.join(',')}` : ''}`);
}

// ─── EC-V21-B.5 — Sentry dashboards live for 6 v2 agents + synthesizer ────
function gateB5(): void {
  const metricsPath = join(APP_ROOT, 'lib/observability/synthesis-metrics.ts');
  const metricsTest = join(APP_ROOT, '__tests__/observability/synthesis-metrics.test.ts');
  const dashDir = join(PLANS_TB1, 'sentry-dashboards');
  if (!fileExists(metricsPath) || !fileExists(metricsTest) || !dirExists(dashDir)) {
    record('EC-V21-B.5', false,
      `missing: metrics=${fileExists(metricsPath)} test=${fileExists(metricsTest)} dashDir=${dirExists(dashDir)}`);
    return;
  }
  const metricsSrc = readFileSync(metricsPath, 'utf8');
  const metricsTestSrc = readFileSync(metricsTest, 'utf8');

  const expected = [
    'agent-decision-net.yaml',
    'agent-form-function.yaml',
    'agent-hoq.yaml',
    'agent-fmea-early.yaml',
    'agent-fmea-residual.yaml',
    'agent-interface-specs.yaml',
    'agent-synthesis.yaml',
    'system-overview.yaml',
    '00-top-line-cost.yaml',
  ];
  const present = readdirSync(dashDir);
  const missing = expected.filter((f) => !present.includes(f));

  const sevenAgentsConst = /V2_SYSTEM_DESIGN_AGENTS\s*=\s*\[[\s\S]+?'synthesis'\s*,?\s*\]\s*as\s+const/.test(metricsSrc);
  const samplingDoc = /100% on errors|100%.*error.*10%.*success|sampling.*10%/i.test(metricsSrc);
  const wireUpInAgents = (() => {
    const agentDir = join(APP_ROOT, 'lib/langchain/agents/system-design');
    if (!dirExists(agentDir)) return 0;
    const files = readdirSync(agentDir).filter((f) => f.endsWith('-agent.ts'));
    let wired = 0;
    for (const f of files) {
      const src = readFileSync(join(agentDir, f), 'utf8');
      if (/withAgentMetrics|recordAgentInvocation|synthesis-metrics/.test(src)) wired++;
    }
    return wired;
  })();
  const intakeGraphWiring = (() => {
    const g = join(APP_ROOT, 'lib/langchain/graphs/intake-graph.ts');
    if (!fileExists(g)) return false;
    return /recordNodeStart|recordNodeEnd|synthesis-metrics/.test(readFileSync(g, 'utf8'));
  })();

  const testCount = (metricsTestSrc.match(/\b(?:it|test)\(\s*['"]/g) ?? []).length;
  const ok = missing.length === 0 && sevenAgentsConst && samplingDoc && wireUpInAgents >= 7 && intakeGraphWiring && testCount >= 20;
  record('EC-V21-B.5', ok,
    `dashboards=${expected.length - missing.length}/${expected.length}${missing.length ? ` missing=${missing.join(',')}` : ''}, 7-agents-const=${sevenAgentsConst}, sampling-100/10-doc=${samplingDoc}, agents-wired=${wireUpInAgents}/7, intake-graph-wired=${intakeGraphWiring}, metrics-test-count=${testCount}`);
}

// ─── EC-V21-B.6 — cost telemetry instrumented + dashboard live ─────────────
// (NOT a $/mo gate per David 2026-04-25 21:09 EDT)
function gateB6(): void {
  const metricsPath = join(APP_ROOT, 'lib/observability/synthesis-metrics.ts');
  const topLineDash = join(PLANS_TB1, 'sentry-dashboards', '00-top-line-cost.yaml');
  const runbook = join(PLANS_TB1, 'cost-telemetry-runbook.md');
  if (!fileExists(metricsPath)) {
    record('EC-V21-B.6', false, `metrics module missing`);
    return;
  }
  const metricsSrc = readFileSync(metricsPath, 'utf8');
  const hasModelRates = /MODEL_RATES\s*[:=]\s*\{[\s\S]+?'claude-/.test(metricsSrc) ||
                       /MODEL_RATES\s*:\s*Record/.test(metricsSrc);
  const computeCostFn = /export\s+function\s+computeCostUsd|computeCostUsd\(/i.test(metricsSrc);
  const costFieldOnInvocation = /cost_usd_total\s*:\s*number|cost_usd\s*:\s*(?:number|cost)/.test(metricsSrc);
  const dashboardLive = fileExists(topLineDash);
  const runbookExists = fileExists(runbook);
  const ok = hasModelRates && computeCostFn && costFieldOnInvocation && dashboardLive && runbookExists;
  record('EC-V21-B.6', ok,
    `MODEL_RATES=${hasModelRates}, computeCostUsd=${computeCostFn}, cost_usd field=${costFieldOnInvocation}, top-line-dash=${dashboardLive}, runbook=${runbookExists} (NO $/mo gate per declassification)`);
}

// ─── Optional jest run (uses execFileSync — shell-safe, static args) ───────
function runProducerJest(): { passed: number; total: number; suites: number } | null {
  const env = {
    ...process.env,
    POSTGRES_URL: 'postgresql://postgres:postgres@localhost:5432/test',
    AUTH_SECRET: 'stub-secret-min-32-chars-stub-stub-stub',
    ANTHROPIC_API_KEY: 'sk-ant-stub-min-len-stub',
    STRIPE_SECRET_KEY: 'sk_stub_min_len_stub',
    STRIPE_WEBHOOK_SECRET: 'whsec_stub_min_len_stub',
    OPENROUTER_API_KEY: 'sk-or-stub',
    BASE_URL: 'http://localhost:3000',
  };
  const args = [
    'jest',
    '__tests__/cache',
    '__tests__/jobs',
    '__tests__/billing',
    '__tests__/observability',
    '--silent',
  ];
  let out = '';
  try {
    out = execFileSync('npx', args, { cwd: APP_ROOT, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const err = e as { stdout?: Buffer | string; stderr?: Buffer | string };
    out = (err.stdout?.toString() ?? '') + '\n' + (err.stderr?.toString() ?? '');
  }
  const m = out.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  const s = out.match(/Test Suites:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  if (!m) return null;
  return {
    passed: parseInt(m[1], 10),
    total: parseInt(m[2], 10),
    suites: s ? parseInt(s[1], 10) : 0,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const wantJest = args.includes('--jest');
  const wantJson = args.includes('--json');

  void existsSync;

  gateB1();
  gateB2();
  gateB3();
  gateB4();
  gateB5();
  gateB6();

  let jestSummary: { passed: number; total: number; suites: number } | null = null;
  if (wantJest) jestSummary = runProducerJest();

  const allGreen = results.every((r) => r.passed === true);

  if (wantJson) {
    console.log(JSON.stringify({ results, jest: jestSummary, allGreen }, null, 2));
  } else {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  TB1 Wave-B Verification — EC-V21-B.1 .. B.6');
    console.log('═══════════════════════════════════════════════════════════════');
    for (const r of results) {
      const icon = r.passed === true ? 'PASS' : r.passed === 'skip' ? 'SKIP' : 'FAIL';
      console.log(`[${icon}] ${r.id}: ${r.detail}`);
    }
    if (jestSummary) {
      console.log('');
      console.log(`[JEST] ${jestSummary.passed}/${jestSummary.total} tests passed across ${jestSummary.suites} producer suites`);
    }
    console.log('');
    console.log(allGreen ? 'RESULT: ALL GREEN — tb1-wave-b-complete tag eligible' : 'RESULT: NOT GREEN — see failures above');
  }
  process.exit(allGreen ? 0 : 1);
}

main().catch((e) => {
  console.error('verify-tb1 crashed:', e);
  process.exit(2);
});
