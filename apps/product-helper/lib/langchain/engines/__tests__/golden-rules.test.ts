/**
 * golden-rules.test.ts — Pin every engine.json story tree against fixtures.
 *
 * For each of the 13 stories at `apps/product-helper/.planning/engines/`:
 *   1. Load + Zod-validate via `engineDocSchema` (= `storyTreeSchema`).
 *   2. For each fixture in the matching `*.fixtures.json` file:
 *      - Find the named decision + rule.
 *      - For default rules, assert the EngineRule.value matches expected.
 *      - For non-default rules, evaluate `rule.if` against the fixture
 *        input via `evaluatePredicate` and assert the matched flag.
 *      - Assert the EngineRule.value matches `fixture.expected_output.value`.
 *      - When `fixture.expected_output.units` is present, assert it matches.
 *
 * Decoupled by design — invokes the predicate evaluator only, NOT the live
 * `NFREngineInterpreter`. This unblocks parallel work with `audit-writer`
 * (per critique #10 in the engine-stories spec).
 *
 * @module lib/langchain/engines/__tests__/golden-rules.test
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { evaluatePredicate, type Predicate } from '../predicate-dsl';
import { engineDocSchema } from '../../schemas/engines/engine';
import type {
  EngineDoc,
  DecisionRef,
  EngineRule,
  EngineRuleMatch,
  EngineRuleDefault,
} from '../../schemas/engines/engine';

const ENGINES_DIR = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '.planning',
  'engines',
);

const FIXTURES_DIR = join(__dirname, 'golden-rules-fixtures');

const EXPECTED_STORIES = [
  'm1-data-flows',
  'm2-constants',
  'm2-nfr',
  'm3-ffbd',
  'm4-decision-network',
  'm4-synthesis-keystone',
  'm5-form-function',
  'm5-form-function-morphological',
  'm6-qfd',
  'm7-interfaces',
  'm7-n2',
  'm8-fmea-early',
  'm8-fmea-residual',
] as const;

interface Fixture {
  name: string;
  decision_id: string;
  rule_id: string;
  input: Record<string, unknown>;
  expected_output: { value: number | string; units?: string; matched: boolean };
}

function isDefaultRule(r: EngineRule): r is EngineRuleDefault {
  return Object.prototype.hasOwnProperty.call(r, 'default');
}

function findDecision(doc: EngineDoc, decisionId: string): DecisionRef | undefined {
  return doc.decisions.find((d) => d.decision_id === decisionId);
}

function findRule(decision: DecisionRef, ruleId: string): EngineRule | undefined {
  return decision.function.rules.find((r, i) => {
    if (isDefaultRule(r)) {
      return (r.default.rule_id ?? 'default') === ruleId;
    }
    return (r.rule_id ?? `rule_${i}`) === ruleId;
  });
}

async function loadStory(slug: string): Promise<EngineDoc> {
  const raw = await readFile(join(ENGINES_DIR, `${slug}.json`), 'utf8');
  const parsed = JSON.parse(raw);
  const result = engineDocSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `engine.json validation failed for ${slug}: ${JSON.stringify(result.error.issues, null, 2)}`,
    );
  }
  return result.data as EngineDoc;
}

async function loadFixtures(slug: string): Promise<Fixture[]> {
  const raw = await readFile(join(FIXTURES_DIR, `${slug}.fixtures.json`), 'utf8');
  return JSON.parse(raw) as Fixture[];
}

describe('golden-rules: engine.json story trees', () => {
  it('finds 13 expected stories on disk', async () => {
    const files = await readdir(ENGINES_DIR);
    const stories = files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''));
    for (const expected of EXPECTED_STORIES) {
      expect(stories).toContain(expected);
    }
  });

  for (const slug of EXPECTED_STORIES) {
    describe(`story: ${slug}`, () => {
      let doc: EngineDoc;
      let fixtures: Fixture[];

      beforeAll(async () => {
        doc = await loadStory(slug);
        fixtures = await loadFixtures(slug);
      });

      it('Zod-validates against engineDocSchema', () => {
        expect(doc.story_id).toBe(slug);
        expect(doc.decisions.length).toBeGreaterThan(0);
      });

      it('ships at least 5 fixtures', () => {
        expect(fixtures.length).toBeGreaterThanOrEqual(5);
      });

      it('every fixture passes the predicate-evaluator + value-pin', () => {
        for (const fx of fixtures) {
          const decision = findDecision(doc, fx.decision_id);
          expect(decision).toBeDefined();
          if (!decision) continue;

          const rule = findRule(decision, fx.rule_id);
          expect(rule).toBeDefined();
          if (!rule) continue;

          if (isDefaultRule(rule)) {
            // Default rule — value-pin only; evaluator is not called.
            expect(rule.default.value).toEqual(fx.expected_output.value);
            if (fx.expected_output.units !== undefined) {
              expect(rule.default.units).toEqual(fx.expected_output.units);
            }
            // Default rules typically appear as fixture.matched=false (no
            // earlier rule fired); we don't assert evaluator behavior here.
          } else {
            const matchRule = rule as EngineRuleMatch;
            const matched = evaluatePredicate(
              matchRule.if as Predicate,
              fx.input,
            );
            expect(matched).toBe(fx.expected_output.matched);
            expect(matchRule.value).toEqual(fx.expected_output.value);
            if (fx.expected_output.units !== undefined) {
              expect(matchRule.units).toEqual(fx.expected_output.units);
            }
          }
        }
      });
    });
  }
});
