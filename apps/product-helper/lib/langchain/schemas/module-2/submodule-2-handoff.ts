/**
 * Submodule 2.handoff — FFBD Handoff + Final Review
 *
 * Gate handoff artifacts synthesize M2.1 + M2.2 + M2.3 into
 * `ffbd_handoff.v1`. Per `plans/reorg-mapping.md` §2, the handoff is its own
 * top-level submodule file to keep the 3×8 accounting clean while retaining
 * emittable JSON Schemas for both handoff artifacts.
 *
 * Merges: phase-12-ffbd-handoff, phase-12-final-review.
 *
 * @module lib/langchain/schemas/module-2/submodule-2-handoff
 */

export * from './phase-12-ffbd-handoff';
export * from './phase-12-final-review';
