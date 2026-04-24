/**
 * Submodule 2.1 — Intake → UCBDs
 *
 * Consolidates the intake-arc phase schemas per `plans/reorg-mapping.md` §2.
 * Source-of-truth schemas still live in `phase-*.ts` files (unchanged); this
 * barrel re-exports them so registry lookups + external imports can target
 * the 3-submodule layout.
 *
 * Merges: phase-0, phase-1, phase-2, phase-3, phase-4, phase-5, phase-10,
 * phase-11. Multi-UC expansion (phase-11) and SysML activity (phase-10) are
 * intake-tree / intake-diagram operations, NOT functional-reqs.
 *
 * @module lib/langchain/schemas/module-2/submodule-2-1-intake
 */

export * from './phase-0-ingest';
export * from './phase-1-use-case-priority';
export * from './phase-2-thinking-functionally';
export * from './phase-3-ucbd-setup';
export * from './phase-4-start-end-conditions';
export * from './phase-5-ucbd-step-flow';
export * from './phase-10-sysml-activity';
export * from './phase-11-multi-uc-expansion';
