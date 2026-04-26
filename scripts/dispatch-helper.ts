#!/usr/bin/env tsx
/**
 * dispatch-helper — canonical Skill-injection composer for v2.1 multi-agent dispatch.
 *
 * Pins the exact text of the Skill-injection block prepended to every Agent({prompt})
 * body at dispatch time. Prevents per-agent prompt drift across the 25 agents in v2.1
 * Waves A + B + D and any future multi-team dispatch.
 *
 * Usage at dispatch time (Bond / coordinator):
 *
 *   import { composePrompt } from './dispatch-helper';
 *
 *   const promptBody = composePrompt({
 *     agentName: 'langgraph-wirer',
 *     subagentType: 'langchain-engineer',
 *     inlineSkills: ['langchain-patterns', 'claude-api', 'code-quality'],
 *     promptBody: 'Wire the 7 GENERATE_* nodes...',
 *   });
 *
 * Verifier check (TA1/TA2/TA3/TB1/TD1 verifiers): every spawned Agent's prompt MUST
 * contain CANONICAL_SKILL_INJECTION_HEADER (regex match on the leading "MANDATORY"
 * line). FAIL if missing.
 *
 * Origin: handoff plans/HANDOFF-2026-04-25-v2.1-fixup.md §"dispatch-helper.ts spec"
 * (Group D / Issue 22). David ruling 2026-04-25 19:50 EDT — "ship the dispatch helper.ts".
 */

export const CANONICAL_SKILL_INJECTION_HEADER =
  'MANDATORY — Before writing any code or invoking any tool that exercises the listed skills, invoke each of the following via the Skill tool (in order):';

export const CANONICAL_SKILL_INJECTION_FOOTER =
  'Each skill must be invoked at least once before its first relevant action. Skills do NOT propagate across agents — if your team\'s other agents need the same skill, each invokes it independently.';

export interface ComposePromptOptions {
  agentName: string;
  subagentType: string;
  inlineSkills: string[];
  promptBody: string;
}

export function composePrompt(opts: ComposePromptOptions): string {
  const { agentName, subagentType, inlineSkills, promptBody } = opts;

  if (!agentName || agentName.trim().length === 0) {
    throw new Error('composePrompt: agentName is required');
  }
  if (!subagentType || subagentType.trim().length === 0) {
    throw new Error('composePrompt: subagentType is required');
  }
  if (!Array.isArray(inlineSkills)) {
    throw new Error('composePrompt: inlineSkills must be an array');
  }
  if (typeof promptBody !== 'string' || promptBody.length === 0) {
    throw new Error('composePrompt: promptBody is required');
  }

  const skillLines =
    inlineSkills.length === 0
      ? '  (no inline_skills declared for this agent)'
      : inlineSkills.map((s) => `  Skill('${s}')`).join('\n');

  const block = [
    CANONICAL_SKILL_INJECTION_HEADER,
    '',
    skillLines,
    '',
    CANONICAL_SKILL_INJECTION_FOOTER,
    '',
    `Agent identity: name=${agentName}, subagent_type=${subagentType}.`,
    '',
    '---',
    '',
    promptBody,
  ].join('\n');

  return block;
}

/**
 * Verifier helper — returns true iff `prompt` carries the canonical injection
 * header. Per-team verifiers call this against every Agent prompt they observe.
 */
export function hasCanonicalInjection(prompt: string): boolean {
  return prompt.startsWith(CANONICAL_SKILL_INJECTION_HEADER);
}
