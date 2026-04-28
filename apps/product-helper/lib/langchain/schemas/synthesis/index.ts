/**
 * Synthesis — barrel + registry for schema generation.
 *
 * @module lib/langchain/schemas/synthesis
 */

export * from './architecture-recommendation';
export {
  SYNTHESIS_SCHEMAS,
  architectureRecommendationSchema,
  derivationChainEntrySchema,
  tailLatencyBudgetSchema,
  residualRiskSchema,
  residualFlagSchema,
  hoqSummarySchema,
} from './architecture-recommendation';
