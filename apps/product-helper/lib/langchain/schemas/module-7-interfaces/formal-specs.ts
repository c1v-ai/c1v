/**
 * Module 7b — Formal Interface Specs (T4b Wave 3).
 *
 * Per v2 §0.3.4 ownership decision, M7 splits into:
 *   - M7.a N² matrix (owned by T3, already shipped)
 *   - M7.b formal interface specs (this module, owned by T4b)
 *
 * Every interface row from `n2_matrix.v1.json` (IF.NN) gets a formal
 * contract with:
 *   - SLA: p95 latency, availability %, throughput ceiling
 *   - retry policy
 *   - timeout
 *   - circuit-breaker threshold
 *   - auth mode
 *   - error-handling contract
 *
 * SLA values MUST cite derivation: NFR ref, KB-8 atlas prior, or FMEA-
 * early detectability requirement.
 *
 * Tail-latency chain budget: Σ p95_i across chain ≤ user-facing p95 NFR.
 *
 * @module lib/langchain/schemas/module-7-interfaces/formal-specs
 */

import { z } from 'zod';
import { mathDerivationSchema } from '../module-2/_shared';

export const interfaceIdSchema = z
  .string()
  .regex(/^IF\.[0-9]{2}$/)
  .describe(
    'x-ui-surface=section:Interface Spec > Header — IF.NN matching n2_matrix.v1 row.',
  );
export type InterfaceId = z.infer<typeof interfaceIdSchema>;

export const slaDerivationSourceSchema = z
  .union([
    z.object({ kind: z.literal('nfr'), nfr_id: z.string().regex(/^NFR\.[0-9]{2,}$/) }),
    z.object({ kind: z.literal('kb-8-atlas'), entry_path: z.string().min(3), field_path: z.string().min(1) }),
    z.object({ kind: z.literal('fmea'), fmea_row_id: z.string().min(1), detectability_requirement: z.string().min(1) }),
  ])
  .describe(
    'x-ui-surface=section:Interface Spec > SLA > Source — where the SLA target came from.',
  );
export type SlaDerivationSource = z.infer<typeof slaDerivationSourceSchema>;

export const slaSpecSchema = z
  .object({
    p95_latency_ms: z.number().positive(),
    availability_pct: z.number().min(0).max(100),
    throughput_ceiling_rps: z.number().positive(),
    derivation_sources: z.array(slaDerivationSourceSchema).min(1),
    math_derivation: mathDerivationSchema,
  })
  .describe(
    'x-ui-surface=section:Interface Spec > SLA — per-interface service-level targets.',
  );
export type SlaSpec = z.infer<typeof slaSpecSchema>;

export const retryPolicySchema = z
  .object({
    max_attempts: z.number().int().min(0).max(10),
    backoff_ms: z.number().int().min(0),
    strategy: z.enum(['fixed', 'exponential', 'exponential_jitter']).default('exponential_jitter'),
    retry_on: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Interface Spec > Retry — retry policy contract.',
  );
export type RetryPolicy = z.infer<typeof retryPolicySchema>;

export const circuitBreakerSchema = z
  .object({
    error_rate_threshold_pct: z.number().min(0).max(100),
    min_requests_before_trip: z.number().int().min(1),
    open_state_duration_ms: z.number().int().min(0),
  })
  .describe(
    'x-ui-surface=section:Interface Spec > Circuit Breaker — failure-gate contract.',
  );
export type CircuitBreaker = z.infer<typeof circuitBreakerSchema>;

export const authModeSchema = z.enum([
  'none',
  'api-key',
  'bearer-jwt',
  'oauth2',
  'mtls',
  'session-cookie',
  'in-process',
]);
export type AuthMode = z.infer<typeof authModeSchema>;

export const errorHandlingContractSchema = z
  .object({
    error_schema_ref: z.string().min(3),
    status_codes: z.array(z.number().int().min(100).max(599)).min(1),
    idempotency: z.enum(['required', 'advisory', 'none']).default('advisory'),
  })
  .describe(
    'x-ui-surface=section:Interface Spec > Errors — error contract and idempotency.',
  );
export type ErrorHandlingContract = z.infer<typeof errorHandlingContractSchema>;

export const interfaceSpecSchema = z
  .object({
    interface_id: interfaceIdSchema,
    n2_row_ref: z
      .string()
      .describe(
        'x-ui-surface=internal:cross-ref — path to n2_matrix.v1.json + row id (e.g., "module-7-interfaces/n2_matrix.v1.json#IF.01").',
      ),
    producer: z.string().regex(/^F\.\d+$/),
    consumer: z.string().regex(/^F\.\d+$/),
    payload_name: z.string().min(1),
    protocol: z.string().min(1),
    sync_style: z.enum(['sync', 'async', 'batch', 'streaming']),
    sla: slaSpecSchema,
    retry: retryPolicySchema,
    timeout_ms: z.number().int().positive(),
    circuit_breaker: circuitBreakerSchema,
    auth: authModeSchema,
    error_handling: errorHandlingContractSchema,
  })
  .describe(
    'x-ui-surface=section:Interface Spec — full formal contract per IF.NN.',
  );
export type InterfaceSpec = z.infer<typeof interfaceSpecSchema>;

export const chainLatencyBudgetSchema = z
  .object({
    chain_id: z.string().min(1),
    hops: z.array(interfaceIdSchema).min(1),
    sum_p95_latency_ms: z.number().positive(),
    user_facing_nfr_p95_ms: z.number().positive(),
    budget_ok: z.boolean(),
  })
  .refine((b) => b.budget_ok === b.sum_p95_latency_ms <= b.user_facing_nfr_p95_ms, {
    message: 'budget_ok must match sum_p95_latency_ms ≤ user_facing_nfr_p95_ms',
  })
  .describe(
    'x-ui-surface=section:Latency Chain Budget — Σ p95_i per chain vs NFR target.',
  );
export type ChainLatencyBudget = z.infer<typeof chainLatencyBudgetSchema>;

export const interfaceSpecsV1Schema = z
  .object({
    _schema: z.literal('module-7b.interface-specs.v1'),
    _output_path: z.string(),
    _upstream_refs: z.object({
      n2_matrix: z.string(),
      nfrs: z.string(),
      fmea_early: z.string(),
      decision_network: z.string(),
    }),
    produced_at: z.string(),
    produced_by: z.string(),
    system_name: z.string(),
    interfaces: z.array(interfaceSpecSchema).min(1),
    chain_budgets: z.array(chainLatencyBudgetSchema).default([]),
  })
  .describe(
    'x-ui-surface=page:/system-design/interfaces — interface_specs.v1 root artifact.',
  );
export type InterfaceSpecsV1 = z.infer<typeof interfaceSpecsV1Schema>;
