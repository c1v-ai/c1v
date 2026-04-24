/**
 * Submodule 2.2 — Functional Requirements
 *
 * Consolidates the requirements-table output per `plans/reorg-mapping.md` §2.
 * Re-exports phase-6 (requirements table artifact) and the
 * requirements-table-base primitives used by it. The
 * `.innerType().extend().superRefine()` pattern (`applyNumericMathGate`) is
 * preserved verbatim in its source file `requirements-table-base.ts`.
 *
 * Merges: phase-6, requirements-table-base.
 *
 * @module lib/langchain/schemas/module-2/submodule-2-2-functional-reqs
 */

export { phase6Schema, type Phase6Artifact } from './phase-6-requirements-table';
export * from './requirements-table-base';
