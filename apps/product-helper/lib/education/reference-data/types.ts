/**
 * Knowledge Bank Project Context Types
 *
 * Defines the dimensions used to parameterize Knowledge Bank content.
 * Named KBProjectContext to avoid collision with the existing
 * ProjectContext in langgraph-handler.ts.
 */

export interface KBProjectContext {
  projectType?:
    | 'saas'
    | 'marketplace'
    | 'mobile'
    | 'api-platform'
    | 'ai-product'
    | 'e-commerce'
    | 'internal-tool'
    | 'open-source';

  market?: 'b2b' | 'b2c' | 'b2b2c';

  stage?: 'idea' | 'mvp' | 'growth' | 'mature';

  budget?: 'bootstrap' | 'seed' | 'series-a' | 'enterprise';

  industry?:
    | 'healthcare'
    | 'fintech'
    | 'education'
    | 'real-estate'
    | 'automotive'
    | 'general';
}

/** Entity catalog entry for an industry vertical */
export interface IndustryEntityCatalog {
  industry: NonNullable<KBProjectContext['industry']>;
  entities: IndustryEntity[];
  complianceRequirements: string[];
  apiPatterns: string[];
}

export interface IndustryEntity {
  name: string;
  description: string;
  keyFields: string[];
  relationships: string[];
  sqlSnippet?: string;
}

/** Tech influencer with recommendations and counter-arguments */
export interface TechInfluencer {
  name: string;
  platform: string;
  recommendations: string[];
  counterArguments?: string[];
}

/** Budget-tier stack recommendation */
export interface BudgetStack {
  tier: NonNullable<KBProjectContext['budget']>;
  stage: NonNullable<KBProjectContext['stage']>;
  monthlyCost: string;
  stack: Record<string, string>;
  tradeoffs: string[];
}

/** Market-specific architectural patterns */
export interface MarketPattern {
  market: NonNullable<KBProjectContext['market']>;
  authPatterns: string[];
  billingPatterns: string[];
  architecturePatterns: string[];
  keyEntities: string[];
}

/** System design reference example */
export interface SystemDesignExample {
  name: string;
  category: string;
  entities: string[];
  actors: string[];
  apiPatterns: string[];
  concurrencyPatterns: string[];
}
