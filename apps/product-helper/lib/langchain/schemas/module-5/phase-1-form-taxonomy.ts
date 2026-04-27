/**
 * Module 5 Phase 1 — Form Taxonomy (Crawley Ch 4).
 *
 * @module lib/langchain/schemas/module-5/phase-1-form-taxonomy
 * @source REQUIREMENTS-crawley §2 (M5 phase artifacts)
 * @kbSource apps/product-helper/.planning/phases/13-Knowledge-banks-deepened/5-form-function/01-phase-docs/01-Phase-1-Form-Taxonomy.md
 * @since 2026-04-26
 * @evidenceTier curated
 * @consumers TBD — agent-emitter wiring deferred to v2.2 (Wave D agent rewrite). `form-function-agent.ts` currently emits the c1v-scoped `phase-1-form-inventory.v1` shape. Registered in `lib/langchain/schemas/index.ts` `CRAWLEY_SCHEMAS`.
 * @driftPolicy quarterly (Jan 1 / Apr 1 / Jul 1 / Oct 1 @ 00:00 UTC) via `apps/product-helper/scripts/quarterly-drift-check.ts`; LangSmith project `c1v-v2-eval`. See `.github/workflows/quarterly-drift-check.yml` for the cron expression.
 *
 * NEW Crawley schema. Coexists with phase-1-form-inventory.ts (the c1v-scoped
 * Concept-stage shape). Crawley taxonomy carries OPM entities, formal
 * relationships, boundary interfaces, accompanying systems, use context.
 */

import { z } from 'zod';
import { phaseEnvelopeSchema, sourceRefSchema } from '../module-2/_shared';

export const formalRelationshipKindSchema = z
  .enum([
    'connection',
    'spatial',
    'topological',
    'address',
    'sequence',
    'membership',
    'ownership',
    'human',
  ])
  .describe(
    'x-ui-surface=section:Form Taxonomy > Formal Relationships — Crawley Ch 4 §4.5 three-tier taxonomy flattened to 8 values.',
  );
export type FormalRelationshipKind = z.infer<typeof formalRelationshipKindSchema>;

export const decomposabilitySchema = z
  .enum(['discrete', 'modular', 'integral'])
  .describe(
    'x-ui-surface=section:Form Taxonomy > Decomposability — Crawley Ch 2 line 741–745 classification.',
  );
export type Decomposability = z.infer<typeof decomposabilitySchema>;

export const formalRelationshipRecordSchema = z
  .object({
    target_entity_id: z.string().describe(
      'x-ui-surface=section:Form Taxonomy > Formal Relationships — id of target form_entity at same or adjacent decomposition_level.',
    ),
    kind: formalRelationshipKindSchema,
    label: z.string().describe(
      'x-ui-surface=section:Form Taxonomy > Formal Relationships — lowercase noun-phrase naming the relationship.',
    ),
    is_physical: z.boolean().describe(
      'x-ui-surface=section:Form Taxonomy > Dualism — true for physical-form relationships, false for purely informational (Box 4.7).',
    ),
    crawley_glossary_ref: sourceRefSchema.optional().describe(
      'x-ui-surface=internal:provenance — pointer back to GLOSSARY-crawley when useful.',
    ),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Formal Relationships — one edge in the form-entity graph.',
  );
export type FormalRelationshipRecord = z.infer<typeof formalRelationshipRecordSchema>;

export const formEntitySchema = z
  .object({
    object_id: z.string().describe(
      'x-ui-surface=section:Form Taxonomy > Entities — stable unique id for the form entity.',
    ),
    name: z
      .string()
      .regex(/^[A-Z]/, 'Form entity name must be a noun phrase (Crawley Box 4.2 line 1471)')
      .describe(
        'x-ui-surface=section:Form Taxonomy > Entities — noun phrase naming the entity (Box 4.2 — no verbs).',
      ),
    decomposition_level: z.number().int().min(0).max(4).describe(
      'x-ui-surface=section:Form Taxonomy > Entities — 0 = system, 1 = principal elements, 2+ = lower decompositions.',
    ),
    parent_entity_id: z.string().nullable().describe(
      'x-ui-surface=internal:tree-render — parent form_entity.object_id; null for Level-0 only.',
    ),
    attributes: z
      .record(
        z.string(),
        z.object({
          states: z.array(z.string()).default([]),
          category: z.enum(['physical', 'electrical', 'logical']).optional(),
        }),
      )
      .default({})
      .describe(
        'x-ui-surface=section:Form Taxonomy > Attributes — Crawley Box 4.2: attributes with optional state enumerations.',
      ),
    formal_relationships: z
      .array(formalRelationshipRecordSchema)
      .default([])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Formal Relationships — edges to other form_entity objects.',
      ),
    is_physical: z.boolean().describe(
      'x-ui-surface=section:Form Taxonomy > Dualism — true = physical embodiment, false = informational. ≥1 true required per Box 4.7.',
    ),
    decomposability: decomposabilitySchema,
    notes: z.string().optional(),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Entities — a single object in the form of the system (Crawley Box 4.2).',
  );
export type FormEntity = z.infer<typeof formEntitySchema>;

export const interfaceRecordSchema = z
  .object({
    interface_id: z.string(),
    boundary_side_entity_id: z.string(),
    external_entity_id: z.string(),
    formal_relationship_ref: z.string().describe(
      'x-ui-surface=internal:provenance — id of the formal_relationship crossing the boundary (Box 4.4).',
    ),
    description: z.string(),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Interfaces — a formal relationship that crosses the system boundary.',
  );
export type InterfaceRecord = z.infer<typeof interfaceRecordSchema>;

export const accompanyingSystemSchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    role: z.string().describe(
      'x-ui-surface=section:Form Taxonomy > Whole Product System — why this accompanying system is essential to value delivery (Q 4d).',
    ),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Whole Product System — Crawley §4.6 accompanying system.',
  );
export type AccompanyingSystem = z.infer<typeof accompanyingSystemSchema>;

export const useContextEntitySchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    establishes: z
      .enum(['place', 'informs_function', 'influences_design'])
      .describe(
        'x-ui-surface=section:Form Taxonomy > Use Context — which of three roles Crawley §4.6 names for use-context entities.',
      ),
  })
  .describe(
    'x-ui-surface=section:Form Taxonomy > Use Context — Crawley §4.6 use-context entity.',
  );
export type UseContextEntity = z.infer<typeof useContextEntitySchema>;

export const phase1FormTaxonomySchema = phaseEnvelopeSchema
  .extend({
    _schema: z.literal('module-5.phase-1-form-taxonomy.v1'),
    form_entities: z
      .array(formEntitySchema)
      .min(2, 'At least Level-0 + one Level-1 entity required')
      .describe(
        'x-ui-surface=section:Form Taxonomy > Entities — all form entities at all decomposition levels.',
      ),
    interfaces: z.array(interfaceRecordSchema).default([]).describe(
      'x-ui-surface=section:Form Taxonomy > Interfaces — boundary-crossing relationships (Box 4.4 + §4.6).',
    ),
    accompanying_systems: z.array(accompanyingSystemSchema).default([]).describe(
      'x-ui-surface=section:Form Taxonomy > Whole Product System — Q 4d accompanying systems.',
    ),
    use_context_entities: z.array(useContextEntitySchema).default([]).describe(
      'x-ui-surface=section:Form Taxonomy > Use Context — Q 4f non-essential context entities.',
    ),
    crawley_glossary_refs: z.array(sourceRefSchema).default([]).describe(
      'x-ui-surface=internal:provenance — cross-references into GLOSSARY-crawley terms.',
    ),
  })
  .describe('x-ui-surface=page-header — M5 Phase 1: form taxonomy per Crawley Ch 4.')
  .superRefine((val, ctx) => {
    // Box 4.7 Principle of Dualism — at least one physical entity.
    const hasPhysical = val.form_entities.some((e) => e.is_physical === true);
    if (!hasPhysical) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['form_entities'],
        message:
          'Crawley Box 4.7 Principle of Dualism: every built system must have at least one physical-form entity.',
      });
    }
    // Box 4.1 — exactly one Level-0 entity.
    const level0 = val.form_entities.filter((e) => e.decomposition_level === 0);
    if (level0.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['form_entities'],
        message: `Exactly one Level-0 form_entity required (Crawley Box 4.1). Got ${level0.length}.`,
      });
    }
  });
export type Phase1FormTaxonomy = z.infer<typeof phase1FormTaxonomySchema>;
