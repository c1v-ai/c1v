/**
 * story-tree.ts — Convenience alias for `engineDocSchema`.
 *
 * Engine.json files at `.planning/engines/<story_slug>.json` are story trees:
 * named bundles of `DecisionRef` rule trees. The shape is identical to
 * `EngineDoc` (defined in `nfr-engine-interpreter.ts`, Zod-pinned in
 * `engine.ts`). This module re-exports the Zod boundary under a name that
 * reads cleanly from the consumer side (`engine-stories`,
 * `golden-rules.test.ts`, `agent-greenfield-refactor`):
 *
 *   import { storyTreeSchema, type StoryTree } from '@/lib/langchain/schemas/engines/story-tree';
 *   const result = storyTreeSchema.safeParse(parsed);
 *
 * Per the engine-stories spec (Wave E, v2.2): no duplicate Zod shape — this
 * is a re-export, not a rewrite. Touching this file forces a contract bump.
 *
 * @module lib/langchain/schemas/engines/story-tree
 */

export { engineDocSchema as storyTreeSchema } from './engine';
export type {
  EngineDoc as StoryTree,
  DecisionRef,
  EngineRule,
  EngineRuleMatch,
  EngineRuleDefault,
  EngineDecisionFunction,
  EngineInputSpec,
  ConfidenceModifier,
} from './engine';
