#!/usr/bin/env tsx
/**
 * Fixture-based tests for dispatch-helper.
 *
 * Run: pnpm tsx scripts/__tests__/dispatch-helper.test.ts
 *
 * Exit: 0 if all cases pass, 1 if any fail.
 */

import {
  CANONICAL_SKILL_INJECTION_HEADER,
  CANONICAL_SKILL_INJECTION_FOOTER,
  composePrompt,
  hasCanonicalInjection,
} from '../dispatch-helper';

interface Case {
  name: string;
  run: () => void;
}

const cases: Case[] = [
  {
    name: 'composePrompt: prepends canonical header',
    run: () => {
      const out = composePrompt({
        agentName: 'langgraph-wirer',
        subagentType: 'langchain-engineer',
        inlineSkills: ['langchain-patterns', 'claude-api'],
        promptBody: 'Wire the 7 GENERATE_* nodes.',
      });
      assert(out.startsWith(CANONICAL_SKILL_INJECTION_HEADER), 'header at start');
      assert(out.includes(CANONICAL_SKILL_INJECTION_FOOTER), 'footer present');
      assert(out.includes("Skill('langchain-patterns')"), 'skill 1 listed');
      assert(out.includes("Skill('claude-api')"), 'skill 2 listed');
      assert(out.includes('name=langgraph-wirer'), 'agentName echoed');
      assert(out.includes('subagent_type=langchain-engineer'), 'subagentType echoed');
      assert(out.endsWith('Wire the 7 GENERATE_* nodes.'), 'promptBody at end');
    },
  },
  {
    name: 'composePrompt: empty inlineSkills emits placeholder line',
    run: () => {
      const out = composePrompt({
        agentName: 'docs',
        subagentType: 'documentation-engineer',
        inlineSkills: [],
        promptBody: 'Update CLAUDE.md.',
      });
      assert(out.includes('(no inline_skills declared for this agent)'), 'placeholder');
    },
  },
  {
    name: 'composePrompt: missing agentName throws',
    run: () => {
      let threw = false;
      try {
        composePrompt({
          agentName: '',
          subagentType: 'qa-engineer',
          inlineSkills: ['testing-strategies'],
          promptBody: 'verify',
        });
      } catch {
        threw = true;
      }
      assert(threw, 'empty agentName must throw');
    },
  },
  {
    name: 'composePrompt: missing subagentType throws',
    run: () => {
      let threw = false;
      try {
        composePrompt({
          agentName: 'verifier',
          subagentType: '',
          inlineSkills: [],
          promptBody: 'verify',
        });
      } catch {
        threw = true;
      }
      assert(threw, 'empty subagentType must throw');
    },
  },
  {
    name: 'composePrompt: empty promptBody throws',
    run: () => {
      let threw = false;
      try {
        composePrompt({
          agentName: 'a',
          subagentType: 'b',
          inlineSkills: [],
          promptBody: '',
        });
      } catch {
        threw = true;
      }
      assert(threw, 'empty promptBody must throw');
    },
  },
  {
    name: 'hasCanonicalInjection: true on canonical prompt',
    run: () => {
      const out = composePrompt({
        agentName: 'verifier',
        subagentType: 'qa-engineer',
        inlineSkills: ['testing-strategies'],
        promptBody: 'Run the suite.',
      });
      assert(hasCanonicalInjection(out), 'must detect canonical');
    },
  },
  {
    name: 'hasCanonicalInjection: false on raw prompt',
    run: () => {
      assert(!hasCanonicalInjection('Just do the thing.'), 'raw is not canonical');
    },
  },
  {
    name: 'composePrompt: round-trips multi-skill list deterministically',
    run: () => {
      const a = composePrompt({
        agentName: 'cache-and-lazy-gen',
        subagentType: 'cache-engineer',
        inlineSkills: ['database-patterns', 'code-quality'],
        promptBody: 'Build inputs_hash cache.',
      });
      const b = composePrompt({
        agentName: 'cache-and-lazy-gen',
        subagentType: 'cache-engineer',
        inlineSkills: ['database-patterns', 'code-quality'],
        promptBody: 'Build inputs_hash cache.',
      });
      assert(a === b, 'composePrompt must be deterministic');
    },
  },
];

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

let passed = 0;
let failed = 0;
for (const c of cases) {
  try {
    c.run();
    console.log(`PASS  ${c.name}`);
    passed += 1;
  } catch (err) {
    console.log(`FAIL  ${c.name}`);
    console.log(`  ${err instanceof Error ? err.message : String(err)}`);
    failed += 1;
  }
}

console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
