/**
 * Module 5 Phase 3 — Form-Function Concept (Crawley Ch 6).
 *
 * @module lib/langchain/schemas/module-5/phase-3-form-function-concept
 * @source REQUIREMENTS-crawley §2 (M5 phase artifacts) + §5 (matrix locality — 9 × `full_dsm_block_derivations` + 1 × scalar `dsm_projection_chain_derivation`)
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/5-form-function/01-phase-docs/03-Phase-3-Form-Function-Concept.md
 * @since 2026-04-26
 * @evidenceTier curated
 * @consumers TBD — agent-emitter wiring deferred to v2.2 (Wave D agent rewrite). Schema gate is closed and rejects emissions that omit/mis-type fields. Registered in `lib/langchain/schemas/index.ts` `CRAWLEY_SCHEMAS`. Hosts 9 × `mathDerivationMatrixSchema` sites + 1 scalar projection chain.
 * @driftPolicy quarterly (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) via `apps/product-helper/scripts/quarterly-drift-check.ts`; LangSmith project `c1v-v2-eval`. See `.github/workflows/quarterly-drift-check.yml` for the cron expression.
 *
 * Architecture triad bridging Phase-1 form ↔ Phase-2 function. Emits 9-block
 * full DSM with 9 mathDerivationMatrixSchema records + 1 scalar projection
 * chain descriptor (REQUIREMENTS-crawley §5 Option Y).
 */

import { z } from 'zod';
import {
  phaseEnvelopeSchema,
  sourceRefSchema,
  mathDerivationSchema,
} from '../module-2/_shared';
import { mathDerivationMatrixSchema } from './_matrix';

export const mappingCardinalitySchema = z
  .enum([
    'no_instrument',
    'operand_as_instrument',
    'one_to_one_same_operand',
    'one_to_one_multiple_operands',
    'one_to_many',
    'many_to_many',
  ])
  .describe(
    'x-ui-surface=section:Form-Function Concept > Mapping — Crawley Figure 6.5 a–f six form-to-process mapping patterns.',
  );
export type MappingCardinality = z.infer<typeof mappingCardinalitySchema>;

export const operandInteractionKindSchema = z.discriminatedUnion('category', [
  z.object({
    category: z.literal('matter'),
    sub_category: z.enum(['mechanical', 'biochemical']),
    interaction: z.enum(['mass_exchange', 'force_momentum', 'chemical', 'biological']),
  }),
  z.object({
    category: z.literal('energy'),
    sub_category: z.literal('none'),
    interaction: z.enum(['work', 'thermal']),
  }),
  z.object({
    category: z.literal('information'),
    sub_category: z.enum(['signal', 'thought']),
    interaction: z.enum(['data', 'commands', 'cognitive', 'affective']),
  }),
]);
export type OperandInteractionKind = z.infer<typeof operandInteractionKindSchema>;

export const structureExceptionSchema = z
  .enum([
    'gravity',
    'electromagnetic',
    'ballistic',
    'software_sequence',
    'software_address',
    'software_location',
    'none',
  ])
  .describe(
    'x-ui-surface=section:Form-Function Concept > Structure Exceptions — Crawley §6.2 non-connection interactions allowed.',
  );
export type StructureException = z.infer<typeof structureExceptionSchema>;

export const formFunctionMapSchema = z
  .object({
    map_id: z.string(),
    process_id: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-2 internal_function.function_id.',
    ),
    instrument_form_ids: z.array(z.string()).describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-1 form_entity.object_id list.',
    ),
    operand_id: z.string(),
    mapping_cardinality: mappingCardinalitySchema,
    figure_6_5_pattern_quote: z.string().describe(
      'x-ui-surface=section:Form-Function Concept > Mapping — short Crawley quote showing why this pattern applies.',
    ),
    structure_exception: structureExceptionSchema.default('none'),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Mapping — one form-to-process allocation (Q 6a).',
  );
export type FormFunctionMap = z.infer<typeof formFunctionMapSchema>;

export const architectureLayersSchema = z
  .object({
    value_operands: z.array(z.string()),
    value_processes: z.array(z.string()),
    value_instruments: z.array(z.string()),
    supporting_processes: z.array(z.array(z.string())).describe(
      'x-ui-surface=section:Form-Function Concept > Layers — ordered supporting-process layers.',
    ),
    supporting_instruments: z.array(z.array(z.string())).describe(
      'x-ui-surface=section:Form-Function Concept > Layers — ordered supporting-instrument layers paralleling supporting_processes.',
    ),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Layers — Crawley §6.3 layered architecture.',
  );
export type ArchitectureLayers = z.infer<typeof architectureLayersSchema>;

export const nonIdealitySchema = z
  .object({
    kind: z.enum([
      'moving',
      'containing',
      'storing',
      'monitoring',
      'error_correction',
      'data_movement',
      'other',
    ]),
    description: z.string(),
    added_operand_ids: z.array(z.string()).default([]),
    added_process_ids: z.array(z.string()).default([]),
    added_form_ids: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Non-Idealities — Q 6b additions along the realistic value path.',
  );
export type NonIdeality = z.infer<typeof nonIdealitySchema>;

export const interfaceSpecSchema = z
  .object({
    interface_id: z.string().describe(
      'x-ui-surface=internal:cross-phase-ref — Phase-1 interface.interface_id.',
    ),
    passing_operand_id: z.string(),
    passing_process_id: z.string(),
    self_instrument_id: z.string(),
    context_instrument_id: z.string(),
    interface_kind: z
      .enum(['androgynous', 'compatible'])
      .describe(
        'x-ui-surface=section:Form-Function Concept > Interfaces — Crawley §6.3.',
      ),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Interfaces — Q 6d interface with full form + function spec.',
  );
export type InterfaceSpec = z.infer<typeof interfaceSpecSchema>;

export const operationalBehaviorSchema = z
  .object({
    operator: z
      .object({
        kind: z.enum(['active', 'supervisory', 'absent_but_essential']),
        role_description: z.string(),
      })
      .describe('x-ui-surface=section:Form-Function Concept > Operations — Q 6e operator.'),
    sequence: z
      .array(z.string())
      .describe(
        'x-ui-surface=section:Form-Function Concept > Operations — Q 6e process execution order.',
      ),
    parallel_threads: z
      .array(z.array(z.string()))
      .default([])
      .describe(
        'x-ui-surface=section:Form-Function Concept > Operations — Q 6f parallel threads.',
      ),
    clock_time_critical: z.boolean().describe(
      'x-ui-surface=section:Form-Function Concept > Operations — Q 6g clock time importance.',
    ),
    timing_constraints: z.array(z.string()).default([]),
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > Operations — Crawley §6.4.',
  );
export type OperationalBehavior = z.infer<typeof operationalBehaviorSchema>;

export const dsmBlockKindSchema = z
  .enum(['pp', 'po', 'pf', 'op', 'oo', 'of', 'fp', 'fo', 'ff'])
  .describe(
    'x-ui-surface=section:Form-Function Concept > DSM — Crawley Table 6.3 nine block kinds.',
  );
export type DsmBlockKind = z.infer<typeof dsmBlockKindSchema>;

export const dsmBlockSchema = z
  .record(z.string(), z.record(z.string(), z.string()))
  .describe('x-ui-surface=internal:dsm-block — row_id → col_id → cell notation.');
export type DsmBlock = z.infer<typeof dsmBlockSchema>;

export const fullDsmSchema = z
  .object({
    pp: dsmBlockSchema,
    po: dsmBlockSchema,
    pf: dsmBlockSchema,
    op: dsmBlockSchema,
    oo: dsmBlockSchema,
    of: dsmBlockSchema,
    fp: dsmBlockSchema,
    fo: dsmBlockSchema,
    ff: dsmBlockSchema,
  })
  .describe(
    'x-ui-surface=section:Form-Function Concept > DSM — Crawley Table 6.3 full 9-block DSM.',
  );
export type FullDsm = z.infer<typeof fullDsmSchema>;

export const fullDsmBlockDerivationEntrySchema = z.object({
  block_kind: dsmBlockKindSchema,
  derivation: mathDerivationMatrixSchema,
});
export type FullDsmBlockDerivationEntry = z.infer<typeof fullDsmBlockDerivationEntrySchema>;

export const phase3FormFunctionConceptSchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-3-form-function-concept.v1'),
    form_function_maps: z.array(formFunctionMapSchema).min(1),
    architecture_layers: architectureLayersSchema,
    non_idealities: z.array(nonIdealitySchema).default([]),
    interfaces: z.array(interfaceSpecSchema).default([]),
    operational_behavior: operationalBehaviorSchema,
    full_dsm: fullDsmSchema,
    full_dsm_block_derivations: z
      .array(fullDsmBlockDerivationEntrySchema)
      .length(9)
      .describe(
        'x-ui-surface=section:Form-Function Concept > DSM — 9 matrix derivations (one per Table 6.3 block kind).',
      ),
    dsm_projection_chain_derivation: mathDerivationSchema.describe(
      'x-ui-surface=internal:math-derivation-resolver — SCALAR chain-descriptor referencing the 9 block derivations.',
    ),
    operand_interactions: z.array(operandInteractionKindSchema).default([]),
    form_count_ratio: z.number().nonnegative(),
    crawley_glossary_refs: z.array(sourceRefSchema).default([]),
  })
  .describe(
    'x-ui-surface=page-header — M5 Phase 3: form-function concept triad per Crawley Ch 6.',
  )
  .superRefine((val, ctx) => {
    // Frozen phases must have an instrument for every process (Crawley line 2620).
    if (val._phase_status === 'complete') {
      const noInstrument = val.form_function_maps.filter(
        (m) => m.mapping_cardinality === 'no_instrument',
      );
      if (noInstrument.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['form_function_maps'],
          message: `Crawley line 2620: "there must always be an instrument." ${noInstrument.length} process(es) lack an instrument in a complete phase.`,
        });
      }
    }
    // Supporting layers parallelism (§6.3).
    if (
      val.architecture_layers.supporting_processes.length !==
      val.architecture_layers.supporting_instruments.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['architecture_layers'],
        message:
          'supporting_processes and supporting_instruments must have the same number of layers (Crawley §6.3).',
      });
    }
    // Form-count ratio warning (Box 6.2).
    if (val.form_count_ratio > 3.0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['form_count_ratio'],
        message: `Crawley Box 6.2: form_count_ratio=${val.form_count_ratio} > 3.0 — architectural waste suspected.`,
      });
    }
    // Block-derivations enumerate all 9 distinct kinds.
    const seen = new Set(val.full_dsm_block_derivations.map((e) => e.block_kind));
    if (seen.size !== 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['full_dsm_block_derivations'],
        message: `Crawley Table 6.3: full_dsm_block_derivations must cover all 9 block kinds (got ${seen.size} distinct).`,
      });
    }
  });
export type Phase3FormFunctionConcept = z.infer<typeof phase3FormFunctionConceptSchema>;
