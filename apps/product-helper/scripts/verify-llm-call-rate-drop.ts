/**
 * verify-llm-call-rate-drop.ts — EC-V21-E.13 measurement script.
 *
 * Compares post-deploy `synthesis_metrics_total{module="m2",impl="engine-first"}`
 * against the pre-deploy baseline `synthesis_metrics_total{module="m2",impl="llm-only"}`.
 * Emits PASS / FAIL per the >=60% LLM-call-rate-drop threshold.
 *
 * Usage:
 *   pnpm tsx scripts/verify-llm-call-rate-drop.ts \
 *     --baseline=plans/v21-outputs/observability/sentry-baseline-2026-04-27.json \
 *     --postswap=path/to/postswap-export.json \
 *     --threshold=0.60
 *
 * Inputs:
 *   --baseline   Path to the pre-swap Sentry baseline JSON (engine-core
 *                writes this; status field MUST be `captured` to evaluate).
 *   --postswap   Path to the post-swap export. Same JSON shape as baseline,
 *                with `total_calls` + `projects_observed` populated and
 *                `label` containing `impl=engine-first`. Production
 *                operators dump this from Sentry's API after the 7-day
 *                window closes.
 *   --threshold  Drop threshold as a decimal in [0, 1]. Default 0.60.
 *
 * Output:
 *   Exit 0 — drop >= threshold AND non-overlapping confidence intervals.
 *   Exit 1 — drop < threshold OR overlapping CIs.
 *   Exit 2 — input file unreadable / status='gap_surfaced' on baseline /
 *            JSON shape invalid.
 *
 * The CI bound is a Wilson interval on the per-project call rate
 * (calls / projects_observed). We use a 95% z (1.96) two-sided. If
 * `projects_observed` is null we fall back to assuming `total_calls`
 * IS the project count — conservative, widens the CI.
 *
 * @module scripts/verify-llm-call-rate-drop
 */

import { readFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';

interface BaselineFile {
  baseline_window: string;
  counter: string;
  label: string;
  total_calls: number | null;
  projects_observed: number | null;
  captured_at: string;
  status: 'captured' | 'gap_surfaced' | string;
  schema_version: string;
}

interface CliArgs {
  baselinePath: string;
  postswapPath: string;
  threshold: number;
}

function parseArgs(): CliArgs {
  const args: Record<string, string> = {};
  for (const a of argv.slice(2)) {
    const m = /^--([^=]+)=(.*)$/.exec(a);
    if (m) args[m[1]] = m[2];
  }
  if (!args.baseline || !args.postswap) {
    process.stderr.write(
      'usage: verify-llm-call-rate-drop --baseline=<path> --postswap=<path> [--threshold=0.60]\n',
    );
    exit(2);
  }
  const threshold = args.threshold ? Number(args.threshold) : 0.6;
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    process.stderr.write(`invalid --threshold: ${args.threshold}\n`);
    exit(2);
  }
  return {
    baselinePath: args.baseline,
    postswapPath: args.postswap,
    threshold,
  };
}

async function loadJson(path: string): Promise<BaselineFile> {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw) as BaselineFile;
}

function rateAndCi(
  total: number,
  n: number,
): { rate: number; lo: number; hi: number } {
  if (n === 0) return { rate: 0, lo: 0, hi: 0 };
  const p = total / n;
  if (p <= 1) {
    const z = 1.96;
    const denom = 1 + (z * z) / n;
    const center = (p + (z * z) / (2 * n)) / denom;
    const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
    return { rate: p, lo: Math.max(0, center - margin), hi: Math.min(1, center + margin) };
  }
  const z = 1.96;
  const margin = z * Math.sqrt(p / n);
  return { rate: p, lo: Math.max(0, p - margin), hi: p + margin };
}

interface VerdictInput {
  baseline: BaselineFile;
  postswap: BaselineFile;
  threshold: number;
}

interface Verdict {
  pass: boolean;
  reason: string;
  drop: number;
  baseline_rate: number;
  postswap_rate: number;
  baseline_ci: [number, number];
  postswap_ci: [number, number];
}

export function computeVerdict(input: VerdictInput): Verdict {
  const { baseline, postswap, threshold } = input;
  const baseTotal = baseline.total_calls ?? 0;
  const baseN = baseline.projects_observed ?? baseTotal;
  const postTotal = postswap.total_calls ?? 0;
  const postN = postswap.projects_observed ?? postTotal;

  const base = rateAndCi(baseTotal, baseN);
  const post = rateAndCi(postTotal, postN);

  const drop = base.rate === 0 ? 0 : (base.rate - post.rate) / base.rate;
  const nonOverlap = post.hi < base.lo;

  if (drop < threshold) {
    return {
      pass: false,
      reason: `drop ${(drop * 100).toFixed(1)}% < threshold ${(threshold * 100).toFixed(0)}%`,
      drop,
      baseline_rate: base.rate,
      postswap_rate: post.rate,
      baseline_ci: [base.lo, base.hi],
      postswap_ci: [post.lo, post.hi],
    };
  }
  if (!nonOverlap) {
    return {
      pass: false,
      reason: `drop ${(drop * 100).toFixed(1)}% but CIs overlap (baseline=[${base.lo.toFixed(3)},${base.hi.toFixed(3)}], postswap=[${post.lo.toFixed(3)},${post.hi.toFixed(3)}])`,
      drop,
      baseline_rate: base.rate,
      postswap_rate: post.rate,
      baseline_ci: [base.lo, base.hi],
      postswap_ci: [post.lo, post.hi],
    };
  }
  return {
    pass: true,
    reason: `drop ${(drop * 100).toFixed(1)}% >= threshold ${(threshold * 100).toFixed(0)}% with non-overlapping 95% CIs`,
    drop,
    baseline_rate: base.rate,
    postswap_rate: post.rate,
    baseline_ci: [base.lo, base.hi],
    postswap_ci: [post.lo, post.hi],
  };
}

async function main(): Promise<void> {
  const cli = parseArgs();
  let baseline: BaselineFile;
  let postswap: BaselineFile;
  try {
    baseline = await loadJson(cli.baselinePath);
  } catch (err) {
    process.stderr.write(`baseline read failed: ${err instanceof Error ? err.message : String(err)}\n`);
    exit(2);
    return;
  }
  try {
    postswap = await loadJson(cli.postswapPath);
  } catch (err) {
    process.stderr.write(`postswap read failed: ${err instanceof Error ? err.message : String(err)}\n`);
    exit(2);
    return;
  }

  if (baseline.status === 'gap_surfaced') {
    process.stderr.write(
      'baseline.status === "gap_surfaced" -- pre-deploy capture incomplete. ' +
        'See plans/v21-outputs/observability/sentry-baseline-2026-04-27.json next_action block. ' +
        'Wait for the 7-day post-deploy window + re-scrape, then re-run.\n',
    );
    exit(2);
    return;
  }

  if (baseline.total_calls === null || postswap.total_calls === null) {
    process.stderr.write('total_calls is null on baseline or postswap -- measurement not yet evaluable.\n');
    exit(2);
    return;
  }

  const v = computeVerdict({ baseline, postswap, threshold: cli.threshold });
  process.stdout.write(
    JSON.stringify(
      {
        pass: v.pass,
        reason: v.reason,
        drop_fraction: v.drop,
        threshold: cli.threshold,
        baseline_rate: v.baseline_rate,
        postswap_rate: v.postswap_rate,
        baseline_ci_95: v.baseline_ci,
        postswap_ci_95: v.postswap_ci,
        baseline_window: baseline.baseline_window,
        baseline_label: baseline.label,
        postswap_label: postswap.label,
      },
      null,
      2,
    ) + '\n',
  );
  exit(v.pass ? 0 : 1);
}

if (require.main === module) {
  void main();
}
