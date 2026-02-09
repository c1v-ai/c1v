/**
 * Reference Data Module
 *
 * Re-exports all reference data and types for KB functions.
 */

// Types
export type {
  KBProjectContext,
  IndustryEntityCatalog,
  IndustryEntity,
  TechInfluencer,
  BudgetStack,
  MarketPattern,
  SystemDesignExample,
} from './types';

// Data
export { industryPatterns, getIndustryEntities } from './industry-patterns';
export { influencers, counterArguments, getInfluencerQuotes } from './influencer-data';
export { budgetStacks, getBudgetStack } from './budget-stacks';
export { marketPatterns, marketplacePatterns, getMarketPattern } from './market-patterns';
export { systemDesignExamples, getDesignExamples } from './system-design-examples';

// Inference
export { inferProjectContext } from './context-inference';
