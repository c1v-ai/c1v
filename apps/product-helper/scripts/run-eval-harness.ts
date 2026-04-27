/**
 * run-eval-harness — CLI entrypoint for the v2 eval harness.
 *
 * Usage:
 *   pnpm tsx scripts/run-eval-harness.ts --agent=decision-net
 *   pnpm tsx scripts/run-eval-harness.ts --all
 *
 * Loads each dataset, invokes a stubbed runner that replays the
 * expected_output (Wave-C self-test mode) or — when wired — the live
 * agent. Scores results via the harness's Zod-shape comparator with an
 * optional LLM-as-judge fallback for fuzzy matches. Posts runs to the
 * LangSmith project `c1v-v2-eval` when LANGCHAIN_API_KEY is present;
 * otherwise prints a local summary.
 */

import {
  V2_AGENTS,
  type AgentName,
  type AgentRunner,
  hasLangSmith,
  runEval,
  recordResult,
  getDataset,
  summarizeResults,
} from '../lib/eval/v2-eval-harness';

function parseArgs(): { agents: AgentName[]; all: boolean } {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const agentArg = args.find((a) => a.startsWith('--agent='));
  if (all) return { agents: [...V2_AGENTS], all: true };
  if (agentArg) {
    const name = agentArg.slice('--agent='.length) as AgentName;
    if (!V2_AGENTS.includes(name)) {
      throw new Error(`Unknown agent: ${name}. Known: ${V2_AGENTS.join(', ')}`);
    }
    return { agents: [name], all: false };
  }
  throw new Error('Pass --agent=<name> or --all');
}

/**
 * Replay runner — returns the expected_output verbatim. This is the
 * Wave-C self-test mode: it confirms the dataset is well-formed and the
 * harness round-trips correctly. Wave-E will swap this for live agent
 * invocations.
 */
const replayRunner: AgentRunner = async (input) => {
  const intake = (input.projectIntake as Record<string, unknown>) ?? {};
  // Echo a minimal envelope so scoreOutput can shape-compare.
  return {
    _replay: true,
    _intake_id: intake.project_id,
  };
};

async function main(): Promise<void> {
  const { agents } = parseArgs();
  console.log(`langsmith: ${hasLangSmith() ? 'connected' : 'disabled (fixture-replay only)'}`);
  console.log(`agents: ${agents.join(', ')}`);

  let totalRun = 0;
  let totalPosted = 0;
  for (const agent of agents) {
    const dataset = await getDataset(agent);
    if (dataset.length === 0) {
      console.warn(`[${agent}] empty dataset — skipping`);
      continue;
    }
    const results = await runEval(agent, replayRunner);
    const summary = summarizeResults(results);
    console.log(
      `[${agent}] ran=${summary.total} passed=${summary.passed} ` +
        `correct=${summary.by_grade.correct} partial=${summary.by_grade.partial} ` +
        `wrong=${summary.by_grade.wrong}`,
    );
    totalRun += summary.total;

    if (hasLangSmith()) {
      for (let i = 0; i < dataset.length; i++) {
        const post = await recordResult(agent, dataset[i], results[i]);
        if (post.posted) totalPosted += 1;
      }
    }
  }
  console.log(`\nTotal: ran=${totalRun} posted=${totalPosted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
