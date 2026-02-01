/**
 * Zod validation schemas for v2.0 JSONB data
 *
 * These schemas validate data before insertion and provide
 * type-safe parsing when reading from the database.
 */

import { z } from 'zod';

// ============================================================
// Enhanced Use Case Validators (9.1)
// ============================================================

export const flowStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  actor: z.string().min(1),
  action: z.string().min(1),
  systemResponse: z.string().optional(),
});

export const alternativeFlowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  branchPoint: z.number().int().positive(),
  condition: z.string().min(1),
  steps: z.array(flowStepSchema),
  rejoinsAt: z.number().int().positive().optional(),
});

export const useCasePrioritySchema = z.enum(['must', 'should', 'could', 'wont']);
export const useCaseStatusSchema = z.enum(['draft', 'validated']);

export const enhancedUseCaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  actor: z.string().min(1),
  trigger: z.string().min(1),
  outcome: z.string().min(1),
  preconditions: z.array(z.string()),
  postconditions: z.array(z.string()),
  mainFlow: z.array(flowStepSchema),
  alternativeFlows: z.array(alternativeFlowSchema),
  acceptanceCriteria: z.array(z.string()),
  priority: useCasePrioritySchema,
  status: useCaseStatusSchema,
});

// ============================================================
// Database Schema Model Validators (9.2)
// ============================================================

export const fieldConstraintSchema = z.string();

export const databaseFieldSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  nullable: z.boolean(),
  defaultValue: z.string().optional(),
  constraints: z.array(fieldConstraintSchema),
  description: z.string().optional(),
});

export const referentialActionSchema = z.enum([
  'CASCADE',
  'SET NULL',
  'SET DEFAULT',
  'RESTRICT',
  'NO ACTION',
]);

export const relationshipTypeSchema = z.enum([
  'one-to-one',
  'one-to-many',
  'many-to-many',
]);

export const databaseRelationshipSchema = z.object({
  name: z.string().optional(),
  type: relationshipTypeSchema,
  targetEntity: z.string().min(1),
  foreignKey: z.string().min(1),
  targetKey: z.string().optional(),
  onDelete: referentialActionSchema.optional(),
  onUpdate: referentialActionSchema.optional(),
  description: z.string().optional(),
});

export const databaseIndexSchema = z.object({
  name: z.string().min(1),
  columns: z.array(z.string().min(1)).min(1),
  unique: z.boolean().optional(),
  type: z.enum(['btree', 'hash', 'gin', 'gist', 'brin']).optional(),
  where: z.string().optional(),
});

export const databaseEntitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  tableName: z.string().optional(),
  fields: z.array(databaseFieldSchema),
  relationships: z.array(databaseRelationshipSchema),
  indexes: z.array(databaseIndexSchema),
  constraints: z.array(z.string()).optional(),
});

export const databaseEnumSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
  description: z.string().optional(),
});

export const databaseSchemaModelSchema = z.object({
  entities: z.array(databaseEntitySchema),
  enums: z.array(databaseEnumSchema).optional(),
  version: z.string().optional(),
  generatedAt: z.string().optional(),
});

// ============================================================
// Tech Stack Model Validators (9.3)
// ============================================================

export const techCategorySchema = z.enum([
  'frontend',
  'backend',
  'database',
  'auth',
  'hosting',
  'cache',
  'queue',
  'monitoring',
  'testing',
  'ci-cd',
  'container',
  'cdn',
  'email',
  'payments',
  'analytics',
  'search',
  'storage',
  'ai-ml',
  'other',
]);

export const techAlternativeSchema = z.object({
  name: z.string().min(1),
  whyNot: z.string().min(1),
});

export const techChoiceSchema = z.object({
  category: techCategorySchema,
  choice: z.string().min(1),
  version: z.string().optional(),
  rationale: z.string().min(1),
  alternatives: z.array(techAlternativeSchema),
  documentation: z.string().url().optional(),
  license: z.string().optional(),
});

export const techStackModelSchema = z.object({
  categories: z.array(techChoiceSchema),
  constraints: z.array(z.string()),
  rationale: z.string().min(1),
  estimatedCost: z.string().optional(),
  scalability: z.string().optional(),
  generatedAt: z.string().optional(),
});

// ============================================================
// User Story Validators (9.4)
// ============================================================

export const userStoryStatusSchema = z.enum([
  'backlog',
  'todo',
  'in-progress',
  'review',
  'done',
  'blocked',
]);

export const userStoryPrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
]);

export const userStoryEffortSchema = z.enum([
  'xs',
  'small',
  'medium',
  'large',
  'xl',
]);

export const userStoryInputSchema = z.object({
  projectId: z.number().int().positive(),
  useCaseId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  actor: z.string().min(1).max(100),
  epic: z.string().max(100).optional(),
  acceptanceCriteria: z.array(z.string()),
  status: userStoryStatusSchema.default('backlog'),
  priority: userStoryPrioritySchema.default('medium'),
  estimatedEffort: userStoryEffortSchema.default('medium'),
  order: z.number().int().default(0),
  assignee: z.string().max(100).optional(),
  labels: z.array(z.string()).optional(),
  blockedBy: z.array(z.number().int().positive()).optional(),
});

export const userStoryUpdateSchema = userStoryInputSchema
  .partial()
  .omit({ projectId: true });

// ============================================================
// API Key Validators
// ============================================================

export const apiKeyScopeSchema = z.enum([
  'read:prd',
  'read:schema',
  'read:api',
  'read:stories',
  'write:stories',
  'read:validation',
  'invoke:agents',
  'admin',
]);

export const apiKeyInputSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  expiresAt: z.date().optional(),
  scopes: z.array(apiKeyScopeSchema).min(1),
});

// ============================================================
// Infrastructure Specification Validators (10.2)
// ============================================================

export const hostingProviderSchema = z.enum([
  'vercel',
  'aws',
  'gcp',
  'azure',
  'railway',
  'render',
  'fly',
  'heroku',
  'digitalocean',
  'cloudflare',
  'self-hosted',
]);

export const hostingConfigSchema = z.object({
  provider: hostingProviderSchema,
  region: z.string().min(1),
  tier: z.string().optional(),
  autoscaling: z.object({
    enabled: z.boolean(),
    minInstances: z.number().int().nonnegative(),
    maxInstances: z.number().int().positive(),
    targetCpuUtilization: z.number().min(0).max(100).optional(),
  }).optional(),
  domains: z.array(z.string()),
});

export const databaseProviderSchema = z.enum([
  'vercel-postgres',
  'supabase',
  'neon',
  'planetscale',
  'aws-rds',
  'aws-aurora',
  'gcp-cloudsql',
  'azure-cosmosdb',
  'mongodb-atlas',
  'upstash',
  'self-hosted',
]);

export const databaseTypeSchema = z.enum([
  'postgresql',
  'mysql',
  'mongodb',
  'sqlite',
  'redis',
  'other',
]);

export const databaseInfraConfigSchema = z.object({
  provider: databaseProviderSchema,
  type: databaseTypeSchema,
  version: z.string().optional(),
  tier: z.string().optional(),
  region: z.string().optional(),
  connectionPooling: z.object({
    enabled: z.boolean(),
    maxConnections: z.number().int().positive(),
  }).optional(),
  backup: z.object({
    enabled: z.boolean(),
    frequency: z.string(),
    retention: z.string(),
  }).optional(),
  replication: z.object({
    enabled: z.boolean(),
    readReplicas: z.number().int().nonnegative(),
  }).optional(),
});

export const cacheProviderSchema = z.enum([
  'redis',
  'upstash',
  'memcached',
  'vercel-kv',
  'cloudflare-kv',
  'memory',
]);

export const cacheStrategySchema = z.enum([
  'cache-aside',
  'read-through',
  'write-through',
  'write-behind',
]);

export const cacheConfigSchema = z.object({
  provider: cacheProviderSchema,
  strategy: cacheStrategySchema,
  ttlSeconds: z.number().int().positive().optional(),
  maxMemoryMb: z.number().int().positive().optional(),
});

export const cicdProviderSchema = z.enum([
  'github-actions',
  'gitlab-ci',
  'circleci',
  'jenkins',
  'vercel',
  'other',
]);

export const cicdTriggerSchema = z.enum([
  'push',
  'pull_request',
  'schedule',
  'manual',
]);

export const cicdStepTypeSchema = z.enum([
  'build',
  'test',
  'lint',
  'security-scan',
  'deploy',
  'custom',
]);

export const cicdStepSchema = z.object({
  name: z.string().min(1),
  type: cicdStepTypeSchema,
  command: z.string().optional(),
  required: z.boolean(),
});

export const cicdEnvironmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().optional(),
  requiredApprovals: z.number().int().nonnegative().optional(),
  protectedSecrets: z.array(z.string()).optional(),
});

export const cicdConfigSchema = z.object({
  provider: cicdProviderSchema,
  branches: z.object({
    production: z.string().min(1),
    staging: z.string().optional(),
    development: z.string().optional(),
  }),
  triggers: z.array(cicdTriggerSchema),
  steps: z.array(cicdStepSchema),
  environments: z.array(cicdEnvironmentSchema),
});

export const monitoringProviderSchema = z.enum([
  'vercel-analytics',
  'datadog',
  'newrelic',
  'sentry',
  'grafana',
  'prometheus',
  'aws-cloudwatch',
  'gcp-stackdriver',
  'other',
]);

export const loggingLevelSchema = z.enum([
  'debug',
  'info',
  'warn',
  'error',
]);

export const alertChannelSchema = z.enum([
  'email',
  'slack',
  'pagerduty',
  'webhook',
]);

export const monitoringConfigSchema = z.object({
  provider: monitoringProviderSchema,
  logging: z.object({
    level: loggingLevelSchema,
    structured: z.boolean(),
    retention: z.string().optional(),
  }),
  metrics: z.object({
    enabled: z.boolean(),
    customMetrics: z.array(z.string()).optional(),
  }),
  tracing: z.object({
    enabled: z.boolean(),
    sampleRate: z.number().min(0).max(1).optional(),
  }).optional(),
  alerting: z.object({
    enabled: z.boolean(),
    channels: z.array(alertChannelSchema),
  }).optional(),
});

export const sslProviderSchema = z.enum([
  'letsencrypt',
  'cloudflare',
  'aws-acm',
  'custom',
]);

export const secretsManagerSchema = z.enum([
  'env-vars',
  'aws-secrets',
  'gcp-secrets',
  'vault',
  'doppler',
  'vercel',
]);

export const httpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

export const securityConfigSchema = z.object({
  ssl: z.object({
    enabled: z.boolean(),
    provider: sslProviderSchema.optional(),
  }),
  waf: z.object({
    enabled: z.boolean(),
    provider: z.string().optional(),
  }).optional(),
  ddosProtection: z.object({
    enabled: z.boolean(),
    provider: z.string().optional(),
  }).optional(),
  secrets: z.object({
    manager: secretsManagerSchema,
  }),
  cors: z.object({
    allowedOrigins: z.array(z.string()),
    allowedMethods: z.array(httpMethodSchema),
    allowCredentials: z.boolean(),
  }).optional(),
  rateLimit: z.object({
    enabled: z.boolean(),
    requestsPerMinute: z.number().int().positive(),
  }).optional(),
});

export const infrastructureSpecSchema = z.object({
  hosting: hostingConfigSchema,
  database: databaseInfraConfigSchema,
  caching: cacheConfigSchema.optional(),
  cicd: cicdConfigSchema,
  monitoring: monitoringConfigSchema,
  security: securityConfigSchema,
  estimatedMonthlyCost: z.string().optional(),
  scalabilityNotes: z.string().optional(),
  generatedAt: z.string().optional(),
});

// ============================================================
// Type Exports
// ============================================================

export type FlowStep = z.infer<typeof flowStepSchema>;
export type AlternativeFlow = z.infer<typeof alternativeFlowSchema>;
export type EnhancedUseCase = z.infer<typeof enhancedUseCaseSchema>;
export type DatabaseField = z.infer<typeof databaseFieldSchema>;
export type DatabaseRelationship = z.infer<typeof databaseRelationshipSchema>;
export type DatabaseIndex = z.infer<typeof databaseIndexSchema>;
export type DatabaseEntity = z.infer<typeof databaseEntitySchema>;
export type DatabaseSchemaModel = z.infer<typeof databaseSchemaModelSchema>;
export type TechChoice = z.infer<typeof techChoiceSchema>;
export type TechStackModel = z.infer<typeof techStackModelSchema>;
export type UserStoryInput = z.infer<typeof userStoryInputSchema>;
export type UserStoryUpdate = z.infer<typeof userStoryUpdateSchema>;
export type ApiKeyInput = z.infer<typeof apiKeyInputSchema>;

// Infrastructure types (10.2)
export type HostingConfig = z.infer<typeof hostingConfigSchema>;
export type DatabaseInfraConfig = z.infer<typeof databaseInfraConfigSchema>;
export type CacheConfig = z.infer<typeof cacheConfigSchema>;
export type CICDConfig = z.infer<typeof cicdConfigSchema>;
export type CICDStep = z.infer<typeof cicdStepSchema>;
export type CICDEnvironment = z.infer<typeof cicdEnvironmentSchema>;
export type MonitoringConfig = z.infer<typeof monitoringConfigSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type InfrastructureSpec = z.infer<typeof infrastructureSpecSchema>;

// ============================================================
// Coding Guidelines Validators (10.3)
// ============================================================

export const namingStyleSchema = z.enum([
  'camelCase',
  'PascalCase',
  'snake_case',
  'SCREAMING_SNAKE_CASE',
  'kebab-case',
]);

export const namingConventionsSchema = z.object({
  variables: namingStyleSchema,
  functions: namingStyleSchema,
  classes: namingStyleSchema,
  constants: namingStyleSchema,
  files: namingStyleSchema,
  directories: namingStyleSchema,
  components: namingStyleSchema.optional(),
  hooks: namingStyleSchema.optional(),
  types: namingStyleSchema.optional(),
  interfaces: namingStyleSchema.optional(),
  enums: namingStyleSchema.optional(),
  database: z
    .object({
      tables: namingStyleSchema,
      columns: namingStyleSchema,
    })
    .optional(),
});

export const designPatternSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  when: z.string().min(1),
  example: z.string().optional(),
});

export const forbiddenPatternSchema = z.object({
  name: z.string().min(1),
  reason: z.string().min(1),
  alternative: z.string().optional(),
  lintRule: z.string().optional(),
});

export const lintRuleSchema = z.object({
  name: z.string().min(1),
  level: z.enum(['off', 'warn', 'error']),
  options: z.unknown().optional(),
});

export const lintConfigSchema = z.object({
  tool: z.enum(['eslint', 'biome', 'oxlint', 'tslint', 'custom']),
  extends: z.array(z.string()).optional(),
  rules: z.array(lintRuleSchema),
  ignorePatterns: z.array(z.string()).optional(),
  formatOnSave: z.boolean(),
  formatter: z.enum(['prettier', 'biome', 'dprint', 'none']).optional(),
});

export const testTypeSchema = z.object({
  type: z.enum([
    'unit',
    'integration',
    'e2e',
    'performance',
    'security',
    'accessibility',
  ]),
  required: z.boolean(),
  coverage: z.number().min(0).max(100).optional(),
  tools: z.array(z.string()).optional(),
});

export const testingStrategySchema = z.object({
  framework: z.enum([
    'vitest',
    'jest',
    'mocha',
    'playwright',
    'cypress',
    'other',
  ]),
  coverage: z.object({
    minimum: z.number().min(0).max(100),
    enforced: z.boolean(),
    excludePatterns: z.array(z.string()).optional(),
  }),
  types: z.array(testTypeSchema),
  patterns: z.object({
    unitTestLocation: z.enum(['co-located', 'separate-directory']),
    testFileSuffix: z.string(),
    mockNaming: z.string().optional(),
  }),
  ci: z.object({
    runOnPush: z.boolean(),
    runOnPr: z.boolean(),
    parallelization: z.boolean().optional(),
  }),
});

export const docStrategySchema = z.object({
  codeComments: z.object({
    style: z.enum(['jsdoc', 'tsdoc', 'custom']),
    required: z.enum(['all-public', 'complex-only', 'none']),
  }),
  apiDocs: z.object({
    tool: z.enum(['swagger', 'redoc', 'readme', 'postman', 'none']).optional(),
    autoGenerate: z.boolean(),
  }),
  readme: z.object({
    required: z.boolean(),
    sections: z.array(z.string()),
  }),
  changelog: z.object({
    enabled: z.boolean(),
    format: z.enum(['keep-a-changelog', 'conventional', 'custom']).optional(),
  }),
  adr: z
    .object({
      enabled: z.boolean(),
      location: z.string(),
    })
    .optional(),
});

export const codingGuidelinesSchema = z.object({
  naming: namingConventionsSchema,
  patterns: z.array(designPatternSchema),
  forbidden: z.array(forbiddenPatternSchema),
  linting: lintConfigSchema,
  testing: testingStrategySchema,
  documentation: docStrategySchema,
  imports: z
    .object({
      style: z.enum(['absolute', 'relative', 'aliases']),
      aliases: z.record(z.string()).optional(),
      sortOrder: z.array(z.string()).optional(),
    })
    .optional(),
  commits: z
    .object({
      style: z.enum(['conventional', 'gitmoji', 'custom']),
      enforced: z.boolean(),
      scopes: z.array(z.string()).optional(),
    })
    .optional(),
  generatedAt: z.string().optional(),
});

// Coding Guidelines types (10.3)
export type NamingStyle = z.infer<typeof namingStyleSchema>;
export type NamingConventions = z.infer<typeof namingConventionsSchema>;
export type DesignPattern = z.infer<typeof designPatternSchema>;
export type ForbiddenPattern = z.infer<typeof forbiddenPatternSchema>;
export type LintRule = z.infer<typeof lintRuleSchema>;
export type LintConfig = z.infer<typeof lintConfigSchema>;
export type TestType = z.infer<typeof testTypeSchema>;
export type TestingStrategy = z.infer<typeof testingStrategySchema>;
export type DocStrategy = z.infer<typeof docStrategySchema>;
export type CodingGuidelines = z.infer<typeof codingGuidelinesSchema>;
