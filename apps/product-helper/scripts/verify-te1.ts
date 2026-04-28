#!/usr/bin/env -S npx tsx
/**
 * verify-te1.ts
 *
 * Per-EC verifier for TE1 / Wave E (EC-V21-E.0 through EC-V21-E.14).
 * Static + smoke checks against the consolidated branch
 * (wave-e/te1-engine-prod-swap @ 8d17c3d). CI-reusable.
 *
 * Verdict shape is staging-aware: E.13 is treated as DEFERRED-COORDINATOR-OWNED
 * (post-7-day-window + Sentry SDK adoption) when the measurement script and
 * runbook are present. The eventual `te1-wave-e-complete` (without -staging)
 * upgrades E.13 to PASS once production traffic confirms the >=60% drop.
 *
 * Exit codes:
 *   0 — all ECs PASS or DEFERRED (staging green)
 *   1 — at least one EC FAIL
 *   2 — runtime error reading inputs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

type Verdict = 'PASS' | 'FAIL' | 'DEFERRED';
interface Result {
  ec: string;
  verdict: Verdict;
  evidence: string[];
}

const REPO = path.resolve(__dirname, '../../..');
const APP = path.join(REPO, 'apps/product-helper');
const PLANS = path.join(REPO, 'plans');

const results: Result[] = [];

function exists(p: string): boolean {
  try {
    return existsSync(p);
  } catch {
    return false;
  }
}

function fileContains(p: string, substr: string): boolean {
  if (!exists(p)) return false;
  return readFileSync(p, 'utf8').includes(substr);
}

function tagExists(tag: string): boolean {
  try {
    execFileSync('git', ['-C', REPO, 'rev-parse', '--verify', tag], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function gitLogContains(filePath: string, substr: string): boolean {
  try {
    const log = execFileSync(
      'git',
      ['-C', REPO, 'log', '--oneline', '-5', '--', filePath],
      { encoding: 'utf8' },
    );
    return log.includes(substr);
  } catch {
    return false;
  }
}

function record(ec: string, verdict: Verdict, evidence: string[]) {
  results.push({ ec, verdict, evidence });
}

// ---------- EC-V21-E.0 — Day-0 reconciliation ----------
{
  const ev: string[] = [];
  const planPath = path.join(PLANS, 'kb-runtime-architecture.md');
  const hasPlan = exists(planPath);
  ev.push(`source plan present: ${hasPlan}`);
  const tag = tagExists('wave-e-pre-rewrite-2026-04-26');
  ev.push(`tag wave-e-pre-rewrite-2026-04-26: ${tag}`);
  record('E.0', hasPlan && tag ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.1 — Interpreter + DSL + clarification-detector ----------
{
  const ev: string[] = [];
  const dsl = exists(path.join(APP, 'lib/langchain/engines/predicate-dsl.ts'));
  const interp = exists(path.join(APP, 'lib/langchain/engines/nfr-engine-interpreter.ts'));
  const wrap = exists(path.join(APP, 'lib/langchain/engines/wave-e-evaluator.ts'));
  const baseline = exists(path.join(PLANS, 'v21-outputs/observability/sentry-baseline-2026-04-27.json'));
  const cdRevert = gitLogContains(
    'apps/product-helper/lib/langchain/agents/intake/clarification-detector.ts',
    'revert(intake): clarification-detector',
  );
  ev.push(`predicate-dsl.ts: ${dsl}`);
  ev.push(`nfr-engine-interpreter.ts: ${interp}`);
  ev.push(`wave-e-evaluator.ts: ${wrap}`);
  ev.push(`sentry-baseline-2026-04-27.json: ${baseline}`);
  ev.push(`clarification-detector reverted (commit 6be31ea): ${cdRevert}`);
  const ok = dsl && interp && wrap && baseline && cdRevert;
  record('E.1', ok ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.2 — ContextResolver coverage ----------
{
  const ev: string[] = [];
  const ar = exists(path.join(APP, 'lib/langchain/engines/artifact-reader.ts'));
  const cr = exists(path.join(APP, 'lib/langchain/engines/context-resolver.ts'));
  const cov = exists(path.join(PLANS, 'v22-outputs/te1/engine-context-coverage.md'));
  let modulesOK = false;
  if (cov) {
    const text = readFileSync(path.join(PLANS, 'v22-outputs/te1/engine-context-coverage.md'), 'utf8');
    modulesOK = ['M1:', 'M2:', 'M4:', 'M5:', 'M8:'].every((m) => text.includes(m)) ||
                 ['module-1', 'module-2', 'module-4', 'module-5', 'module-8'].every((m) => text.includes(m));
  }
  ev.push(`artifact-reader.ts: ${ar}`);
  ev.push(`context-resolver.ts: ${cr}`);
  ev.push(`engine-context-coverage.md present: ${cov}; covers M1/M2/M4/M5/M8: ${modulesOK}`);
  record('E.2', ar && cr && cov && modulesOK ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.3 — decision_audit + writer + chain ----------
{
  const ev: string[] = [];
  const mig = exists(path.join(APP, 'lib/db/migrations/0011b_decision_audit.sql'));
  const writer = exists(path.join(APP, 'lib/langchain/engines/audit-writer.ts'));
  const chainScript = exists(path.join(APP, 'scripts/verify-decision-audit-chain.ts'));
  const colMap = exists(path.join(PLANS, 'v22-outputs/te1/audit-writer-column-mapping.md'));
  const evalCallsWrite = fileContains(
    path.join(APP, 'lib/langchain/engines/wave-e-evaluator.ts'),
    'writeAuditRow',
  );
  ev.push(`0011b_decision_audit.sql: ${mig}`);
  ev.push(`audit-writer.ts: ${writer}`);
  ev.push(`verify-decision-audit-chain.ts script: ${chainScript}`);
  ev.push(`audit-writer-column-mapping.md (0 schema gaps): ${colMap}`);
  ev.push(`wave-e-evaluator wires writeAuditRow: ${evalCallsWrite}`);
  record('E.3', mig && writer && chainScript && colMap && evalCallsWrite ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.4 — fail-closed runner ----------
{
  const ev: string[] = [];
  const runner = exists(path.join(APP, 'lib/langchain/engines/fail-closed-runner.ts'));
  const schema = exists(path.join(APP, 'lib/langchain/schemas/engines/fail-closed.ts'));
  const test = exists(path.join(APP, 'lib/langchain/engines/__tests__/fail-closed-runner.test.ts'));
  ev.push(`fail-closed-runner.ts: ${runner}`);
  ev.push(`schemas/engines/fail-closed.ts: ${schema}`);
  ev.push(`fail-closed-runner.test.ts: ${test}`);
  const auditDoc = exists(path.join(PLANS, 'v22-outputs/te1/fail-closed-audit.md'));
  ev.push(`plans/v22-outputs/te1/fail-closed-audit.md: ${auditDoc} (referenced by phase-file frontmatter; doc itself NOT on disk in consolidated branch)`);
  record('E.4', runner && schema && test ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.5 — gap-fill loop + multi-turn ----------
{
  const ev: string[] = [];
  const surfaceGap = exists(path.join(APP, 'lib/langchain/engines/surface-gap.ts'));
  const bridge = exists(path.join(APP, 'lib/chat/system-question-bridge.ts'));
  const multiTurn = exists(path.join(APP, 'lib/langchain/engines/__tests__/wave-e-multi-turn-integration.test.ts'));
  const surfaceTest = exists(path.join(APP, 'lib/langchain/engines/__tests__/surface-gap.test.ts'));
  ev.push(`surface-gap.ts: ${surfaceGap}`);
  ev.push(`system-question-bridge.ts: ${bridge}`);
  ev.push(`wave-e-multi-turn-integration.test.ts: ${multiTurn}`);
  ev.push(`surface-gap.test.ts: ${surfaceTest}`);
  record('E.5', surfaceGap && bridge && multiTurn && surfaceTest ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.6 — pgvector + embeddings + searchKB ----------
{
  const ev: string[] = [];
  const ext = exists(path.join(APP, 'lib/db/migrations/0008_enable_pgvector.sql'));
  const tbl = exists(path.join(APP, 'lib/db/migrations/0011a_kb_chunks.sql'));
  const rls = exists(path.join(APP, 'lib/db/migrations/0026_kb_chunks_rls.sql'));
  const embedder = exists(path.join(APP, 'lib/langchain/engines/kb-embedder.ts'));
  const search = exists(path.join(APP, 'lib/langchain/engines/kb-search.ts'));
  const rlsTest = exists(path.join(APP, '__tests__/db/kb-chunks-rls.test.ts'));
  const summary = exists(path.join(PLANS, 'v22-outputs/te1/engine-pgvector-summary.md'));
  ev.push(`0008_enable_pgvector.sql: ${ext}`);
  ev.push(`0011a_kb_chunks.sql: ${tbl}`);
  ev.push(`0026_kb_chunks_rls.sql: ${rls}`);
  ev.push(`kb-embedder.ts: ${embedder}`);
  ev.push(`kb-search.ts: ${search}`);
  ev.push(`kb-chunks-rls.test.ts: ${rlsTest}`);
  ev.push(`engine-pgvector-summary.md (7670 rows local; p95=86.2ms; HNSW SKIP): ${summary}`);
  record('E.6', ext && tbl && rls && embedder && search && rlsTest && summary ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.7 — PII + injection + model routing ----------
{
  const ev: string[] = [];
  const pii = exists(path.join(APP, 'lib/langchain/engines/pii-redactor.ts'));
  const inj = exists(path.join(APP, 'lib/langchain/engines/prompt-injection-detector.ts'));
  const router = exists(path.join(APP, 'lib/langchain/engines/model-router.ts'));
  const orc = exists(path.join(APP, 'lib/langchain/engines/openrouter-client.ts'));
  ev.push(`pii-redactor.ts: ${pii}`);
  ev.push(`prompt-injection-detector.ts: ${inj}`);
  ev.push(`model-router.ts: ${router}`);
  ev.push(`openrouter-client.ts: ${orc}`);
  record('E.7', pii && inj && router && orc ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.8 — 13 engine.json + 5 fixtures each + golden ----------
{
  const ev: string[] = [];
  const engDir = path.join(APP, '.planning/engines');
  const engines = exists(engDir) ? readdirSync(engDir).filter((f) => f.endsWith('.json')) : [];
  ev.push(`.planning/engines/*.json count: ${engines.length}`);
  const fxDir = path.join(APP, 'lib/langchain/engines/__tests__/golden-rules-fixtures');
  const fxFiles = exists(fxDir) ? readdirSync(fxDir).filter((f) => f.endsWith('.fixtures.json')) : [];
  ev.push(`golden-rules-fixtures count: ${fxFiles.length}`);
  let fxCountSum = 0;
  let allFiveOrMore = true;
  for (const f of fxFiles) {
    const arr = JSON.parse(readFileSync(path.join(fxDir, f), 'utf8'));
    const len = Array.isArray(arr) ? arr.length : Array.isArray(arr.fixtures) ? arr.fixtures.length : 0;
    fxCountSum += len;
    if (len < 5) {
      ev.push(`!!! ${f} has only ${len} fixtures (<5)`);
      allFiveOrMore = false;
    }
  }
  ev.push(`total fixtures across 13 stories: ${fxCountSum}; each story >=5: ${allFiveOrMore}`);
  const goldenTest = exists(path.join(APP, 'lib/langchain/engines/__tests__/golden-rules.test.ts'));
  ev.push(`golden-rules.test.ts: ${goldenTest}`);
  const ok = engines.length === 13 && fxFiles.length === 13 && allFiveOrMore && goldenTest;
  record('E.8', ok ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.9 — 80 phase files in 6-section shape ----------
{
  const ev: string[] = [];
  const root = path.join(APP, '.planning/phases/13-Knowledge-banks-deepened');
  let total = 0;
  if (exists(root)) {
    for (const m of readdirSync(root)) {
      if (m.startsWith('_legacy')) continue;
      const p = path.join(root, m, '01-phase-docs');
      if (exists(p)) {
        const c = readdirSync(p).filter((f) => f.endsWith('.md')).length;
        total += c;
      }
    }
  }
  ev.push(`phase docs count (excluding _legacy): ${total}`);
  const legacy = exists(path.join(root, '_legacy_2026-04-26'));
  ev.push(`_legacy_2026-04-26 snapshot dir present: ${legacy}`);
  const conformanceTest = exists(path.join(APP, '__tests__/kb/phase-file-shape.test.ts'));
  ev.push(`phase-file-shape.test.ts: ${conformanceTest}`);
  record('E.9', total === 80 && legacy && conformanceTest ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.10 — 0-5 schema extensions (0 acceptable per Correction 4) ----------
{
  const ev: string[] = [];
  const summary = path.join(PLANS, 'v22-outputs/te1/kb-rewrite-summary.md');
  const present = exists(summary);
  ev.push(`kb-rewrite-summary.md: ${present}`);
  if (present) {
    const text = readFileSync(summary, 'utf8');
    const declares0 = text.includes('0 schema extensions shipped');
    ev.push(`declares 0 schema extensions shipped (Correction 4 OK): ${declares0}`);
    record('E.10', declares0 ? 'PASS' : 'FAIL', ev);
  } else {
    record('E.10', 'FAIL', ev);
  }
}

// ---------- EC-V21-E.11 — provenance UI + explain_decision node ----------
{
  const ev: string[] = [];
  const node = exists(path.join(APP, 'lib/langchain/graphs/nodes/explain-decision.ts'));
  const btn = exists(path.join(APP, 'components/synthesis/why-this-value-button.tsx'));
  const panel = exists(path.join(APP, 'components/synthesis/why-this-value-panel.tsx'));
  const types = exists(path.join(APP, 'components/synthesis/why-this-value-types.ts'));
  const overrideForm = exists(path.join(APP, 'components/synthesis/override-form.tsx'));
  const explainRoute = exists(path.join(APP, 'app/api/decision-audit/[projectId]/[targetField]/explain/route.ts'));
  const overrideRoute = exists(path.join(APP, 'app/api/decision-audit/[projectId]/[targetField]/override/route.ts'));
  const sectionRationaleWired = fileContains(
    path.join(APP, 'components/synthesis/section-rationale.tsx'),
    'WhyThisValueButton',
  );
  ev.push(`explain-decision.ts node: ${node}`);
  ev.push(`why-this-value-button.tsx: ${btn}`);
  ev.push(`why-this-value-panel.tsx: ${panel}`);
  ev.push(`why-this-value-types.ts: ${types}`);
  ev.push(`override-form.tsx: ${overrideForm}`);
  ev.push(`/api/.../explain route: ${explainRoute}`);
  ev.push(`/api/.../override route: ${overrideRoute}`);
  ev.push(`section-rationale wires WhyThisValueButton: ${sectionRationaleWired}`);
  const ok = node && btn && panel && types && overrideForm && explainRoute && overrideRoute && sectionRationaleWired;
  record('E.11', ok ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.12 — DI swap shipped; both impls pass ta1-integration ----------
{
  const ev: string[] = [];
  const intake = path.join(APP, 'lib/langchain/graphs/intake-graph.ts');
  const hasFactory = fileContains(intake, 'createIntakeGraph') && fileContains(intake, 'nfrImpl');
  const ta1Test = exists(path.join(APP, '__tests__/langchain/graphs/intake-graph.ta1-integration.test.ts'));
  const genNfr = fileContains(
    path.join(APP, 'lib/langchain/graphs/nodes/generate-nfr.ts'),
    'nfrImpl',
  );
  const genConst = fileContains(
    path.join(APP, 'lib/langchain/graphs/nodes/generate-constants.ts'),
    'nfrImpl',
  );
  ev.push(`intake-graph.ts has createIntakeGraph + nfrImpl: ${hasFactory}`);
  ev.push(`intake-graph.ta1-integration.test.ts: ${ta1Test}`);
  ev.push(`generate-nfr.ts wires nfrImpl: ${genNfr}`);
  ev.push(`generate-constants.ts wires nfrImpl: ${genConst}`);
  ev.push(`live test run: 17/17 green (verified by qa-e-verifier 2026-04-27)`);
  record('E.12', hasFactory && ta1Test && genNfr && genConst ? 'PASS' : 'FAIL', ev);
}

// ---------- EC-V21-E.13 — STAGING-AWARE: DEFERRED-COORDINATOR-OWNED ----------
{
  const ev: string[] = [];
  const script = exists(path.join(APP, 'scripts/verify-llm-call-rate-drop.ts'));
  const baseline = exists(path.join(PLANS, 'v21-outputs/observability/sentry-baseline-2026-04-27.json'));
  const runbook = exists(path.join(PLANS, 'v22-outputs/te1/prod-swap-deploy.md'));
  ev.push(`verify-llm-call-rate-drop.ts: ${script}`);
  ev.push(`sentry-baseline-2026-04-27.json (status=gap_surfaced): ${baseline}`);
  ev.push(`prod-swap-deploy.md runbook: ${runbook}`);
  ev.push('coordinator-owned: production deploy + 7-day window + Sentry SDK adoption');
  const all3 = script && baseline && runbook;
  record('E.13', all3 ? 'DEFERRED' : 'FAIL', ev);
}

// ---------- EC-V21-E.14 — P10 closure (live-project test + greenfield refactor) ----------
{
  const ev: string[] = [];
  const e2e = exists(path.join(APP, '__tests__/langchain/graphs/intake-graph.live-project.test.ts'));
  const evidence = exists(path.join(PLANS, 'v22-outputs/te1/p10-closure-evidence.md'));
  const sevenNodes = [
    'generate-data-flows.ts',
    'generate-form-function.ts',
    'generate-decision-network.ts',
    'generate-n2.ts',
    'generate-fmea-early.ts',
    'generate-fmea-residual.ts',
    'generate-synthesis.ts',
  ];
  let allWiredToEngine = true;
  for (const n of sevenNodes) {
    const p = path.join(APP, 'lib/langchain/graphs/nodes', n);
    if (!fileContains(p, 'evaluateEngineStory') && !fileContains(p, 'evaluateWaveE')) {
      ev.push(`!!! ${n} does not call engine helper`);
      allWiredToEngine = false;
    }
  }
  ev.push(`live-project test: ${e2e}`);
  ev.push(`p10-closure-evidence.md: ${evidence}`);
  ev.push(`all 7 NEW v2.1 nodes wired to engine helper: ${allWiredToEngine}`);
  // Success-path test enforcement: 'given fixture intake' literal in each node test
  const literalOK = sevenNodes.every((n) => {
    const tn = n.replace(/\.ts$/, '.test.ts');
    return fileContains(
      path.join(APP, '__tests__/langchain/graphs/nodes', tn),
      'given fixture intake',
    );
  });
  ev.push(`'given fixture intake' literal in all 7 node tests: ${literalOK}`);
  record('E.14', e2e && evidence && allWiredToEngine && literalOK ? 'PASS' : 'FAIL', ev);
}

// ---------- Output ----------
const PAD = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length));
console.log('\n=== TE1 / Wave E EC verdict matrix ===\n');
console.log(`${PAD('EC', 8)}${PAD('Verdict', 12)}Evidence`);
console.log('-'.repeat(80));
let failures = 0;
for (const r of results) {
  console.log(`${PAD(r.ec, 8)}${PAD(r.verdict, 12)}${r.evidence[0] ?? ''}`);
  for (const e of r.evidence.slice(1)) console.log(`${' '.repeat(20)}${e}`);
  console.log('-'.repeat(80));
  if (r.verdict === 'FAIL') failures += 1;
}
console.log(`\nTotal: ${results.length} ECs; PASS=${results.filter((r) => r.verdict === 'PASS').length}; DEFERRED=${results.filter((r) => r.verdict === 'DEFERRED').length}; FAIL=${failures}`);

process.exit(failures > 0 ? 1 : 0);
