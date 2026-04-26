/**
 * Shared types for the Architecture & Database section (TA2 Wave A).
 *
 * Mirrors the shape emitted by the synthesizer (`architecture_recommendation.v1.json`)
 * and `decision_network.v1.json`. Local to TA2 — do NOT re-export across the app;
 * synthesis-stage types eventually consolidate in `lib/synthesis/types.ts`.
 */

export interface SentinelMetric {
  value: number;
  units: string;
  derivation?: string;
  sentinel?: boolean;
}

export interface ArchitectureAlternative {
  id: string;
  name: string;
  summary?: string;
  cost?: SentinelMetric;
  latency?: SentinelMetric;
  availability?: SentinelMetric;
  dominates?: string[];
  is_recommended?: boolean;
  /** Optional Mermaid syntax for this alternative's architecture diagram. */
  mermaid?: string;
}

export interface DecisionNetworkLike {
  alternatives?: ArchitectureAlternative[];
  /** Architecture-recommendation v1 carries this as `pareto_frontier`. */
  pareto_frontier?: ArchitectureAlternative[];
  mermaid_diagrams?: {
    decision_network?: string;
    [key: string]: string | undefined;
  };
}

export interface SchemaApprovalState {
  approvedAt?: string | null;
  approvedBy?: number | null;
  /** SHA of the schema content at approval time. Re-extraction breaks this. */
  approvedSha?: string | null;
}
