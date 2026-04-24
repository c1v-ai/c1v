import { describe, it, expect } from '@jest/globals';
import {
  NFREngineInterpreter,
  type DecisionRef,
} from '../nfr-engine-interpreter';

// ──────────────────────────────────────────────────────────────────────────
// Sample engine #1 — response latency budget (verbatim from
// plans/schema-first-kb-rewrite-and-nfr-engine.md:131).
// ──────────────────────────────────────────────────────────────────────────

const latencyEngine: DecisionRef = {
  decision_id: 'response-budget-ms',
  target_field: 'constants_table.RESPONSE_BUDGET_MS',
  inputs: [
    { name: 'user_type', source: 'M1.intake.user_class' },
    { name: 'flow_class', source: 'M2.P5.step.criticality' },
    { name: 'regulatory_refs', source: 'M1.hard_constraints' },
  ],
  function: {
    type: 'decision_tree',
    rules: [
      {
        if: {
          user_type: 'consumer_app',
          flow_class: 'user_facing_sync',
          regulatory_refs_contains: 'PCI-DSS',
        },
        value: 500,
        units: 'ms',
        base_confidence: 0.94,
        rule_id: 'consumer-app-user-facing-sync-pci',
      },
      {
        if: { user_type: 'consumer_app', flow_class: 'user_facing_sync' },
        value: 500,
        units: 'ms',
        base_confidence: 0.88,
        rule_id: 'consumer-app-user-facing-sync',
      },
      {
        if: { user_type: 'internal_tool' },
        value: 1500,
        units: 'ms',
        base_confidence: 0.82,
        rule_id: 'internal-tool',
      },
      {
        if: { flow_class: 'batch' },
        value: 5000,
        units: 'ms',
        base_confidence: 0.78,
        rule_id: 'batch',
      },
      { default: { value: 500, units: 'ms', base_confidence: 0.6, rule_id: 'default' } },
    ],
  },
  confidence_modifiers: [
    { when: 'user_explicit', delta: 0.1, cap: 1.0 },
    { when: 'upstream_contradicts_rule', delta: -0.3 },
    { when: 'any_input_is_estimate', delta: -0.05 },
    { when: 'cross_story_agreement', delta: 0.05 },
    { when: 'regulatory_override', delta: 0.08 },
    { when: 'rule_default_branch', delta: -0.1 },
    { when: 'input_missing', delta: -0.15 },
  ],
  auto_fill_threshold: 0.9,
  fallback: { action: 'surface_to_user', question_id: 'ask-response-budget' },
};

// ──────────────────────────────────────────────────────────────────────────
// Sample engine #2 — availability target (uses _in + _gte + default).
// ──────────────────────────────────────────────────────────────────────────

const availabilityEngine: DecisionRef = {
  decision_id: 'availability-target',
  target_field: 'constants_table.AVAILABILITY_TARGET',
  inputs: [
    { name: 'criticality', source: 'M2.ucbd.criticality' },
    { name: 'user_type', source: 'M1.intake.user_class' },
  ],
  function: {
    type: 'decision_tree',
    rules: [
      {
        if: { criticality: 'mission_critical' },
        value: 0.9999,
        base_confidence: 0.92,
        rule_id: 'four-nines',
      },
      {
        if: { criticality_in: ['high', 'business_critical'] },
        value: 0.999,
        base_confidence: 0.88,
        rule_id: 'three-nines',
      },
      {
        if: { user_type: 'internal_tool' },
        value: 0.99,
        base_confidence: 0.8,
        rule_id: 'two-nines-internal',
      },
      { default: { value: 0.995, base_confidence: 0.55, rule_id: 'default' } },
    ],
  },
  confidence_modifiers: [
    { when: 'user_explicit', delta: 0.1, cap: 1.0 },
    { when: 'rule_default_branch', delta: -0.1 },
  ],
  auto_fill_threshold: 0.9,
};

// ──────────────────────────────────────────────────────────────────────────
// Sample engine #3 — RPS capacity (uses _range + numeric value).
// ──────────────────────────────────────────────────────────────────────────

const rpsEngine: DecisionRef = {
  decision_id: 'rps-headroom-multiplier',
  target_field: 'constants_table.RPS_HEADROOM',
  inputs: [
    { name: 'baseline_qps', source: 'M1.traffic.baseline' },
    { name: 'flow_class', source: 'M2.P5.step.criticality' },
  ],
  function: {
    type: 'decision_tree',
    rules: [
      {
        if: { flow_class: 'batch' },
        value: 1.5,
        base_confidence: 0.9,
        rule_id: 'batch-small-headroom',
      },
      {
        if: { baseline_qps_range: [1, 100] },
        value: 3.0,
        base_confidence: 0.85,
        rule_id: 'small-traffic-generous-headroom',
      },
      {
        if: { baseline_qps_range: [101, 10000] },
        value: 2.0,
        base_confidence: 0.88,
        rule_id: 'medium-traffic',
      },
      {
        if: { baseline_qps_gt: 10000 },
        value: 1.5,
        base_confidence: 0.82,
        rule_id: 'large-traffic',
      },
      { default: { value: 2.0, base_confidence: 0.5, rule_id: 'default' } },
    ],
  },
  confidence_modifiers: [
    { when: 'user_explicit', delta: 0.1, cap: 1.0 },
    { when: 'input_missing', delta: -0.15 },
    { when: 'rule_default_branch', delta: -0.1 },
  ],
  auto_fill_threshold: 0.9,
};

// ──────────────────────────────────────────────────────────────────────────
// Tests.
// ──────────────────────────────────────────────────────────────────────────

describe('NFREngineInterpreter', () => {
  const engine = new NFREngineInterpreter();

  describe('latency engine — rule matching', () => {
    it('matches the PCI-specific rule over the base consumer-app rule (order wins)', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'consumer_app',
        flow_class: 'user_facing_sync',
        regulatory_refs: ['PCI-DSS'],
      });
      expect(out.matched_rule_id).toBe('consumer-app-user-facing-sync-pci');
      expect(out.value).toBe(500);
      expect(out.units).toBe('ms');
      expect(out.base_confidence).toBe(0.94);
    });

    it('falls through to consumer-app-user-facing-sync when no PCI', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'consumer_app',
        flow_class: 'user_facing_sync',
        regulatory_refs: [],
      });
      expect(out.matched_rule_id).toBe('consumer-app-user-facing-sync');
      expect(out.base_confidence).toBe(0.88);
    });

    it('matches internal_tool rule when user_type=internal_tool', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'internal_tool',
        flow_class: 'user_facing_sync',
        regulatory_refs: [],
      });
      expect(out.matched_rule_id).toBe('internal-tool');
      expect(out.value).toBe(1500);
    });

    it('falls back to default when no specific rule matches', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'embedded_device',
        flow_class: 'streaming',
        regulatory_refs: [],
      });
      expect(out.matched_rule_id).toBe('default');
      expect(out.base_confidence).toBe(0.6);
    });
  });

  describe('latency engine — modifiers', () => {
    it('applies +0.05 cross-story-agreement + +0.08 regulatory bump and clamps to 1.0', () => {
      const out = engine.evaluateRule(
        latencyEngine,
        {
          user_type: 'consumer_app',
          flow_class: 'user_facing_sync',
          regulatory_refs: ['PCI-DSS'],
        },
        { cross_story_agreement: true, regulatory_override: true },
      );
      // Base 0.94 + 0.05 + 0.08 = 1.07 → clamped to 1.00.
      expect(out.final_confidence).toBe(1);
      expect(out.auto_filled).toBe(true);
      const applied = out.modifiers_applied.map((m) => m.modifier);
      expect(applied).toContain('cross_story_agreement');
      expect(applied).toContain('regulatory_override');
    });

    it('applies rule_default_branch penalty when default fires', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'embedded_device',
        flow_class: 'streaming',
        regulatory_refs: [],
      });
      const applied = out.modifiers_applied.find((m) => m.modifier === 'rule_default_branch');
      expect(applied).toBeDefined();
      expect(applied?.delta).toBe(-0.1);
      // Base 0.60 − 0.10 = 0.50, below 0.9 threshold.
      expect(out.final_confidence).toBeCloseTo(0.5, 5);
      expect(out.auto_filled).toBe(false);
      expect(out.needs_user_input).toBe(true);
    });

    it('emits top-3 computed_options when below threshold', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'embedded_device',
        flow_class: 'streaming',
        regulatory_refs: [],
      });
      expect(out.needs_user_input).toBe(true);
      expect(out.computed_options).toBeDefined();
      expect(out.computed_options!.length).toBeLessThanOrEqual(3);
      expect(out.computed_options!.length).toBeGreaterThan(0);
      // Options sorted descending by confidence.
      const confs = out.computed_options!.map((c) => c.confidence);
      for (let i = 1; i < confs.length; i++) {
        expect(confs[i - 1]).toBeGreaterThanOrEqual(confs[i]);
      }
    });

    it('penalises missing inputs via input_missing modifier', () => {
      const out = engine.evaluateRule(latencyEngine, {
        // flow_class missing on purpose
        user_type: 'consumer_app',
        regulatory_refs: [],
      });
      // PCI + consumer rules require flow_class, so they won't match; fall to default.
      expect(out.matched_rule_id).toBe('default');
      const applied = out.modifiers_applied.find((m) => m.modifier === 'input_missing');
      expect(applied).toBeDefined();
      expect(applied?.delta).toBe(-0.15);
      expect(out.missing_inputs).toContain('flow_class');
    });

    it('respects the per-modifier cap on positive deltas', () => {
      const cappedEngine: DecisionRef = {
        ...latencyEngine,
        confidence_modifiers: [{ when: 'user_explicit', delta: 0.5, cap: 0.1 }],
      };
      const out = engine.evaluateRule(
        cappedEngine,
        {
          user_type: 'consumer_app',
          flow_class: 'user_facing_sync',
          regulatory_refs: ['PCI-DSS'],
        },
        { user_explicit: true },
      );
      const applied = out.modifiers_applied.find((m) => m.modifier === 'user_explicit');
      expect(applied?.delta).toBe(0.1); // cap honoured
    });
  });

  describe('availability engine', () => {
    it('auto-fills when criticality=mission_critical + user_explicit bump', () => {
      const out = engine.evaluateRule(
        availabilityEngine,
        { criticality: 'mission_critical', user_type: 'enterprise_app' },
        { user_explicit: true },
      );
      expect(out.matched_rule_id).toBe('four-nines');
      expect(out.value).toBe(0.9999);
      // 0.92 + 0.10 = 1.02 → clamp 1.00
      expect(out.final_confidence).toBe(1);
      expect(out.auto_filled).toBe(true);
    });

    it('uses _in list to match business_critical → three-nines', () => {
      const out = engine.evaluateRule(availabilityEngine, {
        criticality: 'business_critical',
        user_type: 'consumer_app',
      });
      expect(out.matched_rule_id).toBe('three-nines');
      expect(out.value).toBe(0.999);
    });

    it('default branch without bumps falls below threshold → needs_user_input', () => {
      const out = engine.evaluateRule(availabilityEngine, {
        criticality: 'unknown',
        user_type: 'consumer_app',
      });
      expect(out.matched_rule_id).toBe('default');
      // 0.55 − 0.10 = 0.45 < 0.9
      expect(out.final_confidence).toBeCloseTo(0.45, 5);
      expect(out.needs_user_input).toBe(true);
    });
  });

  describe('rps engine — range & gt operators', () => {
    it('matches small-traffic range', () => {
      const out = engine.evaluateRule(rpsEngine, {
        baseline_qps: 50,
        flow_class: 'user_facing_sync',
      });
      expect(out.matched_rule_id).toBe('small-traffic-generous-headroom');
      expect(out.value).toBe(3.0);
    });

    it('matches medium-traffic range', () => {
      const out = engine.evaluateRule(rpsEngine, {
        baseline_qps: 500,
        flow_class: 'user_facing_sync',
      });
      expect(out.matched_rule_id).toBe('medium-traffic');
      expect(out.value).toBe(2.0);
    });

    it('matches large-traffic via _gt', () => {
      const out = engine.evaluateRule(rpsEngine, {
        baseline_qps: 50000,
        flow_class: 'user_facing_sync',
      });
      expect(out.matched_rule_id).toBe('large-traffic');
    });

    it('batch takes priority over range-based rules (order wins)', () => {
      const out = engine.evaluateRule(rpsEngine, {
        baseline_qps: 500,
        flow_class: 'batch',
      });
      expect(out.matched_rule_id).toBe('batch-small-headroom');
    });
  });

  describe('audit-row shape (for audit-db team)', () => {
    it('populates inputs_used with {value, source} per declared input', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'consumer_app',
        flow_class: 'user_facing_sync',
        regulatory_refs: ['PCI-DSS'],
      });
      expect(out.inputs_used).toEqual({
        user_type: { value: 'consumer_app', source: 'M1.intake.user_class' },
        flow_class: { value: 'user_facing_sync', source: 'M2.P5.step.criticality' },
        regulatory_refs: { value: ['PCI-DSS'], source: 'M1.hard_constraints' },
      });
    });

    it('emits math_trace that is human-readable and mentions threshold comparison', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'consumer_app',
        flow_class: 'user_facing_sync',
        regulatory_refs: ['PCI-DSS'],
      });
      expect(out.math_trace).toContain('Base 0.94');
      expect(out.math_trace).toContain('consumer-app-user-facing-sync-pci');
      expect(out.math_trace).toMatch(/(≥|<)\s+0\.90/);
    });

    it('includes missing_inputs list in the output', () => {
      const out = engine.evaluateRule(latencyEngine, {
        user_type: 'consumer_app',
        // flow_class + regulatory_refs missing
      });
      expect(out.missing_inputs).toEqual(expect.arrayContaining(['flow_class', 'regulatory_refs']));
    });
  });

  describe('confidence clamping', () => {
    it('clamps negative finals to 0', () => {
      const negEngine: DecisionRef = {
        ...availabilityEngine,
        function: {
          type: 'decision_tree',
          rules: [
            { if: { criticality: 'low' }, value: 0.95, base_confidence: 0.2, rule_id: 'low' },
          ],
        },
        confidence_modifiers: [
          { when: 'upstream_contradicts_rule', delta: -0.3 },
        ],
      };
      const out = engine.evaluateRule(
        negEngine,
        { criticality: 'low' },
        { upstream_contradicts_rule: true },
      );
      expect(out.final_confidence).toBe(0);
    });

    it('clamps above-1 finals to 1', () => {
      const bigEngine: DecisionRef = {
        ...availabilityEngine,
        function: {
          type: 'decision_tree',
          rules: [
            { if: { criticality: 'mission_critical' }, value: 1, base_confidence: 0.95, rule_id: 'mc' },
          ],
        },
        confidence_modifiers: [
          { when: 'user_explicit', delta: 0.5 },
          { when: 'cross_story_agreement', delta: 0.5 },
        ],
      };
      const out = engine.evaluateRule(
        bigEngine,
        { criticality: 'mission_critical' },
        { user_explicit: true, cross_story_agreement: true },
      );
      expect(out.final_confidence).toBe(1);
    });
  });

  describe('no-match-no-default safety', () => {
    it('returns a no-match output when no rule fires and no default exists', () => {
      const sparseEngine: DecisionRef = {
        decision_id: 'x',
        target_field: 'x',
        inputs: [{ name: 'a', source: 'nowhere' }],
        function: {
          type: 'decision_tree',
          rules: [{ if: { a: 'yes' }, value: 1, base_confidence: 0.8, rule_id: 'r1' }],
        },
      };
      const out = engine.evaluateRule(sparseEngine, { a: 'no' });
      expect(out.matched_rule_id).toBeNull();
      expect(out.value).toBeNull();
      expect(out.needs_user_input).toBe(true);
      expect(out.final_confidence).toBe(0);
    });
  });
});
