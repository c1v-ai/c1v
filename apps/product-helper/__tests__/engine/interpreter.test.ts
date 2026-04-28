import {
  evaluate,
  nfrEngineInterpreter,
  type LlmRefineFn,
} from '@/lib/langchain/engine/nfr-engine-interpreter';
import {
  EngineOutputSchema,
  ENGINE_CONTRACT_VERSION,
  type EngineDecision,
  type EvalContext,
} from '@/lib/langchain/engine/types';

const baseDecision = (overrides: Partial<EngineDecision> = {}): EngineDecision => ({
  decision_id: 'd1',
  target_field: 'nfrs[NFR-001].target_value',
  target_artifact: 'module-2/nfrs',
  story_id: 'story-03-latency-budget',
  engine_version: 'v1.0.0',
  llm_assist: true,
  user_overrideable: true,
  rules: [
    {
      rule_id: 'r-high-conf',
      predicate: { op: '_eq', args: ['$.derived.region', 'us-east-1'] },
      value: 200,
      units: 'ms',
      base_confidence: 0.95,
      math_trace: 'us-east-1 region: latency budget = 200ms (Crawley §4.2)',
    },
  ],
  modifiers: [],
  fallback: {
    reason: 'no region match',
    base_confidence: 0,
    math_trace: 'fallback: ask user for latency budget',
    computed_options: [100, 200, 500, 1000],
  },
  ...overrides,
});

const ctx = (overrides: Partial<EvalContext> = {}): EvalContext => ({
  project_id: 1,
  intake: {},
  upstream: {},
  kb_chunks: [],
  rag_attempted: false,
  derived: {},
  ...overrides,
});

describe('NFREngineInterpreter: high-confidence auto-fill (status=ready)', () => {
  it('emits status=ready when rule matches and final_confidence ≥ 0.90', async () => {
    const out = await evaluate(
      baseDecision(),
      ctx({ derived: { region: 'us-east-1' } })
    );
    expect(out.status).toBe('ready');
    expect(out.auto_filled).toBe(true);
    expect(out.needs_user_input).toBe(false);
    expect(out.value).toBe(200);
    expect(out.units).toBe('ms');
    expect(out.matched_rule_id).toBe('r-high-conf');
    expect(out.final_confidence).toBe(0.95);
    expect(out.computed_options).toBeNull();
    expect(out.nfr_engine_contract_version).toBe(ENGINE_CONTRACT_VERSION);
  });

  it('captures inputs_used from referenced paths', async () => {
    const out = await evaluate(
      baseDecision(),
      ctx({ derived: { region: 'us-east-1' } })
    );
    expect(out.inputs_used).toEqual({ 'derived.region': 'us-east-1' });
  });

  it('output is EngineOutputSchema-valid', async () => {
    const out = await evaluate(
      baseDecision(),
      ctx({ derived: { region: 'us-east-1' } })
    );
    expect(EngineOutputSchema.safeParse(out).success).toBe(true);
  });
});

describe('NFREngineInterpreter: confidence boundaries (0.90 / 0.60)', () => {
  it('exactly 0.90 → status=ready (boundary inclusive)', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-090',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'x',
          base_confidence: 0.9,
          math_trace: 'boundary',
        },
      ],
    });
    const out = await evaluate(dec, ctx());
    expect(out.status).toBe('ready');
    expect(out.final_confidence).toBe(0.9);
  });

  it('0.89 + llm_assist=false → routes to user (status=needs_user_input)', async () => {
    const dec = baseDecision({
      llm_assist: false,
      rules: [
        {
          rule_id: 'r-089',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'x',
          base_confidence: 0.89,
          math_trace: 'just below auto-fill',
        },
      ],
    });
    const out = await evaluate(dec, ctx());
    expect(out.status).toBe('needs_user_input');
    expect(out.needs_user_input).toBe(true);
    expect(out.auto_filled).toBe(false);
    expect(out.value).toBeNull();
    expect(out.computed_options).toEqual([100, 200, 500, 1000]);
  });

  it('0.59 + llm_assist=true → user surface (below refine threshold)', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-059',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'x',
          base_confidence: 0.59,
          math_trace: 'below refine threshold',
        },
      ],
    });
    let refineCalls = 0;
    const llmRefine: LlmRefineFn = async ({ candidate }) => {
      refineCalls++;
      return candidate;
    };
    const out = await evaluate(dec, ctx(), { llmRefine });
    expect(out.status).toBe('needs_user_input');
    expect(refineCalls).toBe(0);
  });
});

describe('NFREngineInterpreter: llm-refine fallback band (0.60–0.90)', () => {
  it('invokes llmRefine hook and returns its output', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-mid',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'mid-value',
          base_confidence: 0.75,
          math_trace: 'mid-band candidate',
        },
      ],
    });
    let receivedCandidate = false;
    const llmRefine: LlmRefineFn = async ({ candidate, decision, context }) => {
      receivedCandidate =
        candidate.matched_rule_id === 'r-mid' &&
        decision.decision_id === 'd1' &&
        context.project_id === 1;
      // Engine refines into a high-confidence ready value.
      return EngineOutputSchema.parse({
        ...candidate,
        status: 'ready',
        value: 'refined-value',
        final_confidence: 0.92,
        auto_filled: true,
        needs_user_input: false,
        computed_options: null,
        math_trace: candidate.math_trace + ' | llm-refined: bumped to 0.92',
      });
    };
    const out = await evaluate(dec, ctx(), { llmRefine });
    expect(receivedCandidate).toBe(true);
    expect(out.status).toBe('ready');
    expect(out.value).toBe('refined-value');
    expect(out.final_confidence).toBe(0.92);
  });

  it('default stub llmRefine downgrades to needs_user_input', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-mid',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'mid-value',
          base_confidence: 0.7,
          math_trace: 'mid-band',
        },
      ],
    });
    const out = await evaluate(dec, ctx());
    expect(out.status).toBe('needs_user_input');
    expect(out.needs_user_input).toBe(true);
    expect(out.value).toBeNull();
  });
});

describe('NFREngineInterpreter: no rule matches (fallback)', () => {
  it('emits status=needs_user_input with computed_options from fallback', async () => {
    const out = await evaluate(
      baseDecision(),
      ctx({ derived: { region: 'eu-west-1' } })
    );
    expect(out.status).toBe('needs_user_input');
    expect(out.matched_rule_id).toBeNull();
    expect(out.computed_options).toEqual([100, 200, 500, 1000]);
    expect(out.value).toBeNull();
  });

  it('records missing path in missing_inputs when context lacks it', async () => {
    const out = await evaluate(baseDecision(), ctx());
    expect(out.missing_inputs).toContain('derived.region');
  });
});

describe('NFREngineInterpreter: modifiers stack', () => {
  it('applies modifier delta to base_confidence', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-base',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'x',
          base_confidence: 0.7,
          math_trace: 'base',
        },
      ],
      modifiers: [
        {
          id: 'mod-known-region',
          delta: 0.25,
          applies_when: { op: '_eq', args: ['$.derived.region', 'us-east-1'] },
          reason: 'high-traffic region boost',
        },
      ],
    });
    const out = await evaluate(dec, ctx({ derived: { region: 'us-east-1' } }));
    expect(out.final_confidence).toBeCloseTo(0.95, 5);
    expect(out.status).toBe('ready');
    expect(out.modifiers_applied).toEqual([
      { id: 'mod-known-region', delta: 0.25, reason: 'high-traffic region boost' },
    ]);
  });

  it('does not apply modifier when applies_when predicate is false', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-base',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'x',
          base_confidence: 0.7,
          math_trace: 'base',
        },
      ],
      modifiers: [
        {
          id: 'mod-unrelated',
          delta: 0.25,
          applies_when: { op: '_eq', args: ['$.derived.region', 'us-east-1'] },
        },
      ],
    });
    const out = await evaluate(dec, ctx({ derived: { region: 'eu-west-1' } }));
    expect(out.final_confidence).toBeCloseTo(0.7, 5);
    expect(out.modifiers_applied).toEqual([]);
  });

  it('clamps final_confidence to [0, 1]', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-base',
          predicate: { op: '_eq', args: [1, 1] },
          value: 'x',
          base_confidence: 0.95,
          math_trace: 'base',
        },
      ],
      modifiers: [
        { id: 'mod-overflow', delta: 0.5 },
      ],
    });
    const out = await evaluate(dec, ctx());
    expect(out.final_confidence).toBe(1);
  });
});

describe('NFREngineInterpreter: never throws on confidence failure', () => {
  it('emits EngineOutput even when fallback has zero confidence', async () => {
    const dec = baseDecision({
      rules: [
        {
          rule_id: 'r-no-match',
          predicate: { op: '_eq', args: ['$.derived.absent', 'foo'] },
          value: 'x',
          base_confidence: 0.95,
          math_trace: 'will not match',
        },
      ],
      fallback: {
        reason: 'nothing matched',
        base_confidence: 0,
        math_trace: 'must surface to user',
        computed_options: [],
      },
    });
    const out = await evaluate(dec, ctx());
    expect(out.status).toBe('needs_user_input');
    expect(EngineOutputSchema.safeParse(out).success).toBe(true);
  });
});

describe('NFREngineInterpreter: object-form export', () => {
  it('nfrEngineInterpreter.evaluate matches the function export', async () => {
    const out = await nfrEngineInterpreter.evaluate(
      baseDecision(),
      ctx({ derived: { region: 'us-east-1' } })
    );
    expect(out.status).toBe('ready');
    expect(out.value).toBe(200);
  });
});

describe('NFREngineInterpreter: RAG context propagation', () => {
  it('echoes kb_chunk_ids when rag_attempted=true', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    const out = await evaluate(
      baseDecision(),
      ctx({
        derived: { region: 'us-east-1' },
        rag_attempted: true,
        kb_chunks: [{ id, kb_source: 'kb-9', text: 'snippet', score: 0.8 }],
      })
    );
    expect(out.rag_attempted).toBe(true);
    expect(out.kb_chunk_ids).toEqual([id]);
  });

  it('keeps kb_chunk_ids empty when rag_attempted=false', async () => {
    const out = await evaluate(
      baseDecision(),
      ctx({ derived: { region: 'us-east-1' } })
    );
    expect(out.rag_attempted).toBe(false);
    expect(out.kb_chunk_ids).toEqual([]);
  });
});
