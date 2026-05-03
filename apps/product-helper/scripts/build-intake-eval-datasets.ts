/**
 * One-off generator for the 6 intake-agent eval datasets.
 *
 * Hand-authors 10 graded samples per dataset (60 total) with a 6/3/1
 * correct/partial/wrong distribution, then writes them to
 * `lib/eval/datasets/<agent>.jsonl` with deterministic `id` hashes.
 *
 * Run once: `pnpm tsx scripts/build-intake-eval-datasets.ts`
 * Then validate: `pnpm tsx scripts/validate-intake-eval-datasets.ts`
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import type { IntakeAgentName } from '../lib/eval/v2-eval-harness';

const DATASETS_DIR = join(__dirname, '..', 'lib', 'eval', 'datasets');
const NOW = '2026-05-02T00:00:00.000Z';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}
function hashInput(input: unknown): string {
  return createHash('sha256').update(stableStringify(input)).digest('hex').slice(0, 16);
}

interface Sample {
  agent: IntakeAgentName;
  input: { projectIntake: Record<string, unknown>; upstreamArtifacts: Record<string, unknown> };
  expected_output: unknown;
  grade: 'correct' | 'partial' | 'wrong';
  notes: string;
}

// 10 archetypes spanning project types / industries.
const ARCHETYPES = [
  { id: 'meal-planner', vision: 'AI-powered meal planning assistant', industry: 'consumer', scale: 'medium', projectType: 'saas' },
  { id: 'invoice-classifier', vision: 'Automated invoice classification for SMB accountants', industry: 'fintech', scale: 'small', projectType: 'saas' },
  { id: 'retro-summarizer', vision: 'AI summarizer for engineering team retrospectives', industry: 'devtools', scale: 'small', projectType: 'internal-tool' },
  { id: 'code-reviewer', vision: 'AI code review assistant integrated with GitHub PRs', industry: 'devtools', scale: 'medium', projectType: 'saas' },
  { id: 'b2b-marketplace', vision: 'B2B marketplace for spec-built CNC parts', industry: 'manufacturing', scale: 'medium', projectType: 'marketplace' },
  { id: 'ecom-storefront', vision: 'D2C wellness ecommerce storefront with subscriptions', industry: 'consumer', scale: 'medium', projectType: 'ecommerce' },
  { id: 'hr-internal', vision: 'Internal HR onboarding portal with workflow automation', industry: 'enterprise', scale: 'small', projectType: 'internal-tool' },
  { id: 'analytics-dashboard', vision: 'Self-serve analytics dashboard for product managers', industry: 'devtools', scale: 'large', projectType: 'saas' },
  { id: 'tutoring-marketplace', vision: 'Two-sided tutoring marketplace matching K-12 students with tutors', industry: 'education', scale: 'medium', projectType: 'marketplace' },
  { id: 'health-tracker', vision: 'Heat-strain prediction system for industrial workers', industry: 'health', scale: 'medium', projectType: 'saas' },
] as const;

// ─────────────────────────────────────────────────────────────────────────
// EXTRACTION
// ─────────────────────────────────────────────────────────────────────────

function buildExtractionExpected(arc: typeof ARCHETYPES[number]): unknown {
  return {
    actors: [
      { name: 'Primary User', role: 'End User', description: `Uses ${arc.vision} day-to-day` },
      { name: 'System Admin', role: 'Administrator', description: 'Manages tenant configuration and access' },
    ],
    useCases: [
      { id: 'UC1', name: 'Sign Up', description: 'User creates an account', actor: 'Primary User' },
      { id: 'UC2', name: 'Use Core Feature', description: `Primary action for ${arc.vision}`, actor: 'Primary User' },
    ],
    systemBoundaries: {
      internal: ['Web app', 'API server', 'Postgres database'],
      external: ['Stripe', 'Email provider'],
      inScope: ['User auth', 'Core feature'],
      outOfScope: ['Mobile native app v1'],
    },
    dataEntities: [
      { name: 'User', attributes: ['id', 'email', 'createdAt'], relationships: ['has many Sessions'] },
      { name: 'Session', attributes: ['id', 'userId', 'expiresAt'], relationships: ['belongs to User'] },
    ],
    problemStatement: {
      summary: `Users currently lack a way to ${arc.vision.toLowerCase()}.`,
      context: `${arc.industry} space; ${arc.scale} scale.`,
      impact: 'Productivity loss and frustration.',
      goals: ['Reduce time-to-value', 'Improve accuracy'],
    },
    goalsMetrics: [
      { goal: 'Adoption', metric: 'Weekly active users / monthly active users', target: '60%', baseline: '0%', timeframe: 'End of Q2' },
    ],
    nonFunctionalRequirements: [
      { category: 'performance' as const, requirement: 'p95 chat response < 2s', metric: 'p95 latency', target: '2000ms', priority: 'high' as const },
    ],
  };
}

function buildExtractionPartial(arc: typeof ARCHETYPES[number]): unknown {
  // Same shape but missing some fields' richness — still passes schema (defaults).
  return {
    actors: [{ name: 'Primary User', role: 'User', description: 'Primary persona' }],
    useCases: [],
    systemBoundaries: { internal: [], external: [] },
    dataEntities: [],
    problemStatement: { summary: arc.vision, context: '', impact: '', goals: [] },
    goalsMetrics: [],
    nonFunctionalRequirements: [],
  };
}

function buildExtractionWrong(): unknown {
  // Deliberately broken — `actors` must be an array, send a string.
  return {
    actors: 'not-an-array',
    useCases: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// FFBD
// ─────────────────────────────────────────────────────────────────────────

function buildFfbdExpected(): unknown {
  return {
    topLevelBlocks: [
      { id: 'F.1', name: 'Authenticate User' },
      { id: 'F.2', name: 'Capture Input' },
      { id: 'F.3', name: 'Process Request' },
      { id: 'F.4', name: 'Persist Result' },
      { id: 'F.5', name: 'Notify User' },
    ],
    decomposedBlocks: [
      { id: 'F.3.1', name: 'Validate Input', parentId: 'F.3' },
      { id: 'F.3.2', name: 'Run Business Logic', parentId: 'F.3' },
    ],
    connections: [
      { from: 'F.1', to: 'F.2', gateType: 'sequence' as const },
      { from: 'F.2', to: 'F.3', gateType: 'sequence' as const },
      { from: 'F.3', to: 'F.4', gateType: 'sequence' as const },
      { from: 'F.4', to: 'F.5', gateType: 'sequence' as const },
    ],
  };
}

function buildFfbdPartial(): unknown {
  return {
    topLevelBlocks: [{ id: 'F.1', name: 'Authenticate User' }],
    decomposedBlocks: [],
    connections: [],
  };
}

function buildFfbdWrong(): unknown {
  return { topLevelBlocks: 'not-an-array' };
}

// ─────────────────────────────────────────────────────────────────────────
// QFD
// ─────────────────────────────────────────────────────────────────────────

function buildQfdExpected(): unknown {
  return {
    customerNeeds: [
      { id: 'CN-01', name: 'Fast response', relativeImportance: 0.4 },
      { id: 'CN-02', name: 'Accurate output', relativeImportance: 0.4 },
      { id: 'CN-03', name: 'Low cost', relativeImportance: 0.2 },
    ],
    engineeringCharacteristics: [
      { id: 'EC-01', name: 'Latency p95', unit: 'ms', directionOfImprovement: 'lower' as const, designTarget: '≤ 2000ms' },
      { id: 'EC-02', name: 'Accuracy', unit: '%', directionOfImprovement: 'higher' as const, designTarget: '≥ 95%' },
      { id: 'EC-03', name: 'Cost per request', unit: 'USD', directionOfImprovement: 'lower' as const, designTarget: '≤ 0.01' },
    ],
    relationships: [
      { needId: 'CN-01', charId: 'EC-01', strength: 'strong' as const },
      { needId: 'CN-02', charId: 'EC-02', strength: 'strong' as const },
      { needId: 'CN-03', charId: 'EC-03', strength: 'strong' as const },
    ],
    roof: [],
    competitors: [],
  };
}

function buildQfdPartial(): unknown {
  return {
    customerNeeds: [{ id: 'CN-01', name: 'Fast response', relativeImportance: 1.0 }],
    engineeringCharacteristics: [
      { id: 'EC-01', name: 'Latency p95', unit: 'ms', directionOfImprovement: 'lower' as const, designTarget: '≤ 2000ms' },
    ],
    relationships: [],
    roof: [],
    competitors: [],
  };
}

function buildQfdWrong(): unknown {
  return { customerNeeds: [{ id: 'CN-01' }] }; // missing required fields
}

// ─────────────────────────────────────────────────────────────────────────
// DECISION MATRIX
// ─────────────────────────────────────────────────────────────────────────

function buildDecisionMatrixExpected(): unknown {
  return {
    criteria: [
      { id: 'PC-01', name: 'Latency', unit: 'ms', weight: 0.3 },
      { id: 'PC-02', name: 'Cost', unit: 'USD/mo', weight: 0.3 },
      { id: 'PC-03', name: 'Accuracy', unit: '%', weight: 0.4 },
    ],
    alternatives: [
      { id: 'ALT-01', name: 'Managed cloud', scores: { 'PC-01': 0.8, 'PC-02': 0.5, 'PC-03': 0.9 } },
      { id: 'ALT-02', name: 'Self-hosted', scores: { 'PC-01': 0.6, 'PC-02': 0.8, 'PC-03': 0.85 } },
    ],
    recommendation: 'ALT-01 — best on latency + accuracy at acceptable cost.',
  };
}

function buildDecisionMatrixPartial(): unknown {
  return {
    criteria: [{ id: 'PC-01', name: 'Latency', unit: 'ms', weight: 1.0 }],
    alternatives: [{ id: 'ALT-01', name: 'Managed cloud', scores: { 'PC-01': 0.8 } }],
  };
}

function buildDecisionMatrixWrong(): unknown {
  return { criteria: [{ id: 'PC-01' }] };
}

// ─────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────

function buildInterfacesExpected(): unknown {
  return {
    subsystems: [
      { id: 'SS1', name: 'Web Frontend', description: 'Next.js app shell', allocatedFunctions: ['F.1', 'F.2'] },
      { id: 'SS2', name: 'API Server', description: 'Stateless API', allocatedFunctions: ['F.3'] },
      { id: 'SS3', name: 'Database', description: 'Postgres', allocatedFunctions: ['F.4'] },
    ],
    interfaces: [
      { id: 'IF-01', name: 'User → Frontend', source: 'SS1', destination: 'SS2', dataPayload: 'User actions, form data' },
      { id: 'IF-02', name: 'Frontend → API', source: 'SS1', destination: 'SS2', dataPayload: 'JSON requests' },
      { id: 'IF-03', name: 'API → DB', source: 'SS2', destination: 'SS3', dataPayload: 'SQL queries' },
    ],
    n2Chart: {
      SS1: { SS2: 'JSON over HTTPS' },
      SS2: { SS3: 'SQL via connection pool' },
    },
  };
}

function buildInterfacesPartial(): unknown {
  return {
    subsystems: [{ id: 'SS1', name: 'Frontend', description: 'shell', allocatedFunctions: [] }],
    interfaces: [],
    n2Chart: {},
  };
}

function buildInterfacesWrong(): unknown {
  return { subsystems: [{ id: 'SS1' }] };
}

// ─────────────────────────────────────────────────────────────────────────
// NFR runLlmOnly
// ─────────────────────────────────────────────────────────────────────────

function buildNfrExpected(): unknown {
  return {
    nfrs: [
      { category: 'performance', requirement: 'p95 chat response < 2s', metric: 'p95 latency', target: '2000ms', priority: 'high' },
      { category: 'security', requirement: 'TLS 1.2+ for all traffic', metric: 'TLS version', target: '>= 1.2', priority: 'critical' },
      { category: 'scalability', requirement: 'Support 1000 concurrent users', metric: 'concurrent connections', target: '1000', priority: 'high' },
    ],
    constants: [],
  };
}

function buildNfrPartial(): unknown {
  return {
    nfrs: [{ category: 'performance', requirement: 'fast response', priority: 'medium' }],
  };
}

function buildNfrWrong(): unknown {
  return { nfrs: [{ category: 'not-a-real-category', requirement: 'foo', priority: 'high' }] };
}

// ─────────────────────────────────────────────────────────────────────────
// Sample plan: 10 per agent (6 correct / 3 partial / 1 wrong).
// ─────────────────────────────────────────────────────────────────────────

interface AgentPlan {
  name: IntakeAgentName;
  buildCorrect: (arc: typeof ARCHETYPES[number]) => unknown;
  buildPartial: (arc: typeof ARCHETYPES[number]) => unknown;
  buildWrong: () => unknown;
  upstream: (arc: typeof ARCHETYPES[number]) => Record<string, unknown>;
}

const PLANS: AgentPlan[] = [
  {
    name: 'extraction',
    buildCorrect: (a) => buildExtractionExpected(a),
    buildPartial: (a) => buildExtractionPartial(a),
    buildWrong: () => buildExtractionWrong(),
    upstream: (a) => ({ conversationHistory: `user: I want to build ${a.vision}\nassistant: Tell me more.` }),
  },
  {
    name: 'ffbd-intake',
    buildCorrect: () => buildFfbdExpected(),
    buildPartial: () => buildFfbdPartial(),
    buildWrong: () => buildFfbdWrong(),
    upstream: (a) => ({ useCases: [{ id: 'UC1', name: 'Sign Up', actor: 'User' }], systemBoundaries: { internal: [], external: [] }, projectType: a.projectType }),
  },
  {
    name: 'qfd-intake',
    buildCorrect: () => buildQfdExpected(),
    buildPartial: () => buildQfdPartial(),
    buildWrong: () => buildQfdWrong(),
    upstream: (a) => ({ ffbd: { topLevelBlocks: [{ id: 'F.1', name: 'Auth' }] }, projectType: a.projectType }),
  },
  {
    name: 'decision-matrix-intake',
    buildCorrect: () => buildDecisionMatrixExpected(),
    buildPartial: () => buildDecisionMatrixPartial(),
    buildWrong: () => buildDecisionMatrixWrong(),
    upstream: (a) => ({ qfd: { engineeringCharacteristics: [{ id: 'EC-01', name: 'Latency', unit: 'ms' }] }, projectType: a.projectType }),
  },
  {
    name: 'interfaces-intake',
    buildCorrect: () => buildInterfacesExpected(),
    buildPartial: () => buildInterfacesPartial(),
    buildWrong: () => buildInterfacesWrong(),
    upstream: (a) => ({ ffbd: { topLevelBlocks: [{ id: 'F.1', name: 'Auth' }] }, decisionMatrix: { criteria: [], alternatives: [] }, projectType: a.projectType }),
  },
  {
    name: 'nfr-runllmonly',
    buildCorrect: () => buildNfrExpected(),
    buildPartial: () => buildNfrPartial(),
    buildWrong: () => buildNfrWrong(),
    upstream: (a) => ({ extractedData: { problemStatement: { summary: a.vision } }, projectType: a.projectType }),
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Build samples per agent. 10 per dataset.
// Distribution: archetypes 0..5 → correct, 6..8 → partial, 9 → wrong.
// ─────────────────────────────────────────────────────────────────────────

function buildSamples(plan: AgentPlan): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i < ARCHETYPES.length; i += 1) {
    const arc = ARCHETYPES[i];
    let grade: 'correct' | 'partial' | 'wrong';
    let expected: unknown;
    if (i < 6) {
      grade = 'correct';
      expected = plan.buildCorrect(arc);
    } else if (i < 9) {
      grade = 'partial';
      expected = plan.buildPartial(arc);
    } else {
      grade = 'wrong';
      expected = plan.buildWrong();
    }
    const projectIntake = {
      project_id: arc.id,
      vision: arc.vision,
      industry: arc.industry,
      scale: arc.scale,
      projectType: arc.projectType,
    };
    const upstreamArtifacts = plan.upstream(arc);
    out.push({
      agent: plan.name,
      input: { projectIntake, upstreamArtifacts },
      expected_output: expected,
      grade,
      notes: `archetype=${arc.id} grade=${grade}`,
    });
  }
  return out;
}

const FILE_BY_AGENT: Record<IntakeAgentName, string> = {
  extraction: 'extraction.jsonl',
  'ffbd-intake': 'ffbd-intake.jsonl',
  'qfd-intake': 'qfd-intake.jsonl',
  'decision-matrix-intake': 'decision-matrix-intake.jsonl',
  'interfaces-intake': 'interfaces-intake.jsonl',
  'nfr-runllmonly': 'nfr-runllmonly.jsonl',
};

function main(): void {
  for (const plan of PLANS) {
    const samples = buildSamples(plan);
    const lines = samples.map((s) => {
      const id = hashInput(s.input);
      const row = {
        id,
        agent: s.agent,
        input: s.input,
        expected_output: s.expected_output,
        grade: s.grade,
        graded_at: NOW,
        grader: 'self-application' as const,
        metadata: {
          source: 'hand-authored-v1',
          notes: s.notes,
        },
      };
      return JSON.stringify(row);
    });
    const path = join(DATASETS_DIR, FILE_BY_AGENT[plan.name]);
    writeFileSync(path, `${lines.join('\n')}\n`, 'utf8');
    console.log(`wrote ${lines.length} samples → ${path}`);
  }
  console.log('\nDone. Run: pnpm tsx scripts/validate-intake-eval-datasets.ts');
}

main();
