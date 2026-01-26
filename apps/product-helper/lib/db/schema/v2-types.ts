/**
 * Product Helper v2.0 Database Types
 *
 * TypeScript interfaces for the enhanced data models.
 * These types are used for JSONB columns and provide type safety
 * throughout the application.
 *
 * @see ROADMAP-2.0.md Phase 9 for requirements
 */

// ============================================================
// Enhanced Use Cases (9.1)
// ============================================================

/**
 * A single step in the main flow of a use case
 */
export interface FlowStep {
  stepNumber: number;
  actor: string;
  action: string;
  systemResponse?: string;
}

/**
 * An alternative or exception flow
 */
export interface AlternativeFlow {
  id: string;
  name: string;
  branchPoint: number; // Step number where this branches from main flow
  condition: string;
  steps: FlowStep[];
  rejoinsAt?: number; // Step number where this rejoins main flow (null if terminates)
}

/**
 * Enhanced Use Case with full Epic.dev parity
 */
export interface EnhancedUseCase {
  id: string;
  name: string;
  description: string;
  actor: string;

  // New fields for v2.0
  trigger: string;
  outcome: string;
  preconditions: string[];
  postconditions: string[];
  mainFlow: FlowStep[];
  alternativeFlows: AlternativeFlow[];
  acceptanceCriteria: string[];
  priority: UseCasePriority;
  status: UseCaseStatus;
}

export type UseCasePriority = 'must' | 'should' | 'could' | 'wont';
export type UseCaseStatus = 'draft' | 'validated';

// ============================================================
// Full Database Schema Model (9.2)
// ============================================================

/**
 * Database field definition
 */
export interface DatabaseField {
  name: string;
  type: DatabaseFieldType;
  nullable: boolean;
  defaultValue?: string;
  constraints: FieldConstraint[];
  description?: string;
}

export type DatabaseFieldType =
  | 'uuid'
  | 'serial'
  | 'bigserial'
  | 'text'
  | 'varchar'
  | 'char'
  | 'integer'
  | 'bigint'
  | 'smallint'
  | 'decimal'
  | 'numeric'
  | 'real'
  | 'double precision'
  | 'boolean'
  | 'timestamp'
  | 'timestamptz'
  | 'date'
  | 'time'
  | 'timetz'
  | 'interval'
  | 'jsonb'
  | 'json'
  | 'bytea'
  | 'array'
  | 'enum'
  | string; // Allow custom types

export type FieldConstraint =
  | 'PRIMARY KEY'
  | 'UNIQUE'
  | 'NOT NULL'
  | 'CHECK'
  | 'DEFAULT'
  | 'REFERENCES'
  | string; // Allow custom constraints

/**
 * Relationship between database entities
 */
export interface DatabaseRelationship {
  name?: string;
  type: RelationshipType;
  targetEntity: string;
  foreignKey: string;
  targetKey?: string; // Defaults to 'id'
  onDelete?: ReferentialAction;
  onUpdate?: ReferentialAction;
  description?: string;
}

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';
export type ReferentialAction = 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';

/**
 * Database index definition
 */
export interface DatabaseIndex {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: 'btree' | 'hash' | 'gin' | 'gist' | 'brin';
  where?: string; // Partial index condition
}

/**
 * Complete entity definition for the database schema
 */
export interface DatabaseEntity {
  name: string;
  description: string;
  tableName?: string; // Snake_case table name, defaults from name
  fields: DatabaseField[];
  relationships: DatabaseRelationship[];
  indexes: DatabaseIndex[];
  constraints?: string[]; // Table-level constraints (composite keys, checks)
}

/**
 * Complete database schema model
 * Stored in project_data.database_schema JSONB column
 */
export interface DatabaseSchemaModel {
  entities: DatabaseEntity[];
  enums?: DatabaseEnum[];
  version?: string;
  generatedAt?: string;
}

/**
 * PostgreSQL enum definition
 */
export interface DatabaseEnum {
  name: string;
  values: string[];
  description?: string;
}

// ============================================================
// Tech Stack Model (9.3)
// ============================================================

/**
 * A single technology choice with rationale
 */
export interface TechChoice {
  category: TechCategory;
  choice: string;
  version?: string;
  rationale: string;
  alternatives: TechAlternative[];
  documentation?: string; // URL to docs
  license?: string;
}

export type TechCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'auth'
  | 'hosting'
  | 'cache'
  | 'queue'
  | 'monitoring'
  | 'testing'
  | 'ci-cd'
  | 'container'
  | 'cdn'
  | 'email'
  | 'payments'
  | 'analytics'
  | 'search'
  | 'storage'
  | 'ai-ml'
  | 'other';

/**
 * An alternative technology that was considered but not chosen
 */
export interface TechAlternative {
  name: string;
  whyNot: string;
}

/**
 * Complete tech stack model
 * Stored in project_data.tech_stack JSONB column
 */
export interface TechStackModel {
  categories: TechChoice[];
  constraints: string[]; // e.g., "Must be open source", "Must support SSO"
  rationale: string; // Overall tech stack rationale
  estimatedCost?: string; // Monthly infrastructure cost estimate
  scalability?: string; // Notes on scaling considerations
  generatedAt?: string;
}

// ============================================================
// User Stories Model (9.4)
// ============================================================

/**
 * User story status for kanban-style tracking
 */
export type UserStoryStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';

/**
 * User story priority levels
 */
export type UserStoryPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Estimated effort for a user story (t-shirt sizing)
 */
export type UserStoryEffort = 'xs' | 'small' | 'medium' | 'large' | 'xl';

/**
 * User story stored in the user_stories table
 */
export interface UserStory {
  id: number;
  projectId: number;
  useCaseId?: string; // Optional link to originating use case

  // Story content
  title: string;
  description: string; // "As a [actor], I want [goal], so that [benefit]"
  actor: string;
  epic?: string;

  // Acceptance criteria stored as JSONB
  acceptanceCriteria: string[];

  // Tracking
  status: UserStoryStatus;
  priority: UserStoryPriority;
  estimatedEffort: UserStoryEffort;

  // Ordering for backlog/kanban
  order: number;

  // Optional fields
  assignee?: string;
  labels?: string[];
  blockedBy?: number[]; // IDs of blocking stories

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// API Specification (Phase 10)
// ============================================================

/**
 * Authentication configuration for API
 */
export interface AuthConfig {
  type: AuthType;
  headerName?: string; // For api-key or bearer
  cookieName?: string; // For cookie-based
  oauth?: OAuthConfig;
}

export type AuthType = 'none' | 'api-key' | 'bearer' | 'oauth2' | 'basic' | 'cookie';

export interface OAuthConfig {
  provider: string;
  scopes: string[];
  tokenUrl?: string;
  authorizationUrl?: string;
}

/**
 * HTTP method for API endpoints
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Parameter location in HTTP request
 */
export type ParameterLocation = 'path' | 'query' | 'header' | 'body';

/**
 * API endpoint parameter
 */
export interface EndpointParameter {
  name: string;
  location: ParameterLocation;
  type: string; // e.g., 'string', 'number', 'boolean', 'object', 'array'
  required: boolean;
  description?: string;
  example?: unknown;
  schema?: object; // JSON Schema for complex types
}

/**
 * API response definition
 */
export interface EndpointResponse {
  statusCode: number;
  description: string;
  contentType: string;
  schema?: object; // JSON Schema
  example?: unknown;
}

/**
 * API endpoint definition
 */
export interface Endpoint {
  path: string;
  method: HttpMethod;
  operationId: string;
  summary: string;
  description?: string;
  tags: string[];
  parameters: EndpointParameter[];
  requestBody?: {
    contentType: string;
    schema: object;
    required: boolean;
    example?: unknown;
  };
  responses: EndpointResponse[];
  security?: string[]; // References to security schemes
  deprecated?: boolean;
  rateLimit?: {
    requests: number;
    windowSeconds: number;
  };
}

/**
 * Standard response format configuration
 */
export interface ResponseFormat {
  envelope: boolean; // Wrap responses in standard envelope
  successField?: string; // e.g., 'data'
  errorField?: string; // e.g., 'error'
  metaField?: string; // e.g., 'meta'
  paginationStyle?: 'cursor' | 'offset' | 'page';
}

/**
 * Error handling configuration
 */
export interface ErrorConfig {
  format: 'rfc7807' | 'custom' | 'simple';
  includeStack?: boolean; // Only for development
  errorCodes: ErrorCode[];
}

export interface ErrorCode {
  code: string;
  httpStatus: number;
  message: string;
  description?: string;
}

/**
 * Complete API specification
 * Stored in project_data.api_specification JSONB column
 */
export interface APISpecification {
  title: string;
  version: string;
  baseUrl: string;
  description?: string;
  authentication: AuthConfig;
  endpoints: Endpoint[];
  responseFormat: ResponseFormat;
  errorHandling: ErrorConfig;
  tags?: Array<{
    name: string;
    description: string;
  }>;
  servers?: Array<{
    url: string;
    description: string;
    environment: 'development' | 'staging' | 'production';
  }>;
  generatedAt?: string;
}

// ============================================================
// Infrastructure Specification (Phase 10)
// ============================================================

/**
 * Hosting configuration
 */
export interface HostingConfig {
  provider: HostingProvider;
  region: string;
  tier?: string;
  autoscaling?: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization?: number;
  };
  domains: string[];
}

export type HostingProvider =
  | 'vercel'
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'railway'
  | 'render'
  | 'fly'
  | 'heroku'
  | 'digitalocean'
  | 'cloudflare'
  | 'self-hosted';

/**
 * Database infrastructure configuration
 */
export interface DatabaseInfraConfig {
  provider: DatabaseProvider;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis' | 'other';
  version?: string;
  tier?: string;
  region?: string;
  connectionPooling?: {
    enabled: boolean;
    maxConnections: number;
  };
  backup?: {
    enabled: boolean;
    frequency: string;
    retention: string;
  };
  replication?: {
    enabled: boolean;
    readReplicas: number;
  };
}

export type DatabaseProvider =
  | 'vercel-postgres'
  | 'supabase'
  | 'neon'
  | 'planetscale'
  | 'aws-rds'
  | 'aws-aurora'
  | 'gcp-cloudsql'
  | 'azure-cosmosdb'
  | 'mongodb-atlas'
  | 'upstash'
  | 'self-hosted';

/**
 * Caching configuration
 */
export interface CacheConfig {
  provider: CacheProvider;
  strategy: 'cache-aside' | 'read-through' | 'write-through' | 'write-behind';
  ttlSeconds?: number;
  maxMemoryMb?: number;
}

export type CacheProvider = 'redis' | 'upstash' | 'memcached' | 'vercel-kv' | 'cloudflare-kv' | 'memory';

/**
 * CI/CD pipeline configuration
 */
export interface CICDConfig {
  provider: CICDProvider;
  branches: {
    production: string;
    staging?: string;
    development?: string;
  };
  triggers: Array<'push' | 'pull_request' | 'schedule' | 'manual'>;
  steps: CICDStep[];
  environments: CICDEnvironment[];
}

export type CICDProvider = 'github-actions' | 'gitlab-ci' | 'circleci' | 'jenkins' | 'vercel' | 'other';

export interface CICDStep {
  name: string;
  type: 'build' | 'test' | 'lint' | 'security-scan' | 'deploy' | 'custom';
  command?: string;
  required: boolean;
}

export interface CICDEnvironment {
  name: string;
  url?: string;
  requiredApprovals?: number;
  protectedSecrets?: string[];
}

/**
 * Monitoring and observability configuration
 */
export interface MonitoringConfig {
  provider: MonitoringProvider;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    structured: boolean;
    retention?: string;
  };
  metrics: {
    enabled: boolean;
    customMetrics?: string[];
  };
  tracing?: {
    enabled: boolean;
    sampleRate?: number;
  };
  alerting?: {
    enabled: boolean;
    channels: Array<'email' | 'slack' | 'pagerduty' | 'webhook'>;
  };
}

export type MonitoringProvider =
  | 'vercel-analytics'
  | 'datadog'
  | 'newrelic'
  | 'sentry'
  | 'grafana'
  | 'prometheus'
  | 'aws-cloudwatch'
  | 'gcp-stackdriver'
  | 'other';

/**
 * Security configuration
 */
export interface SecurityConfig {
  ssl: {
    enabled: boolean;
    provider?: 'letsencrypt' | 'cloudflare' | 'aws-acm' | 'custom';
  };
  waf?: {
    enabled: boolean;
    provider?: string;
  };
  ddosProtection?: {
    enabled: boolean;
    provider?: string;
  };
  secrets: {
    manager: 'env-vars' | 'aws-secrets' | 'gcp-secrets' | 'vault' | 'doppler' | 'vercel';
  };
  cors?: {
    allowedOrigins: string[];
    allowedMethods: HttpMethod[];
    allowCredentials: boolean;
  };
  rateLimit?: {
    enabled: boolean;
    requestsPerMinute: number;
  };
}

/**
 * Complete infrastructure specification
 * Stored in project_data.infrastructure_spec JSONB column
 */
export interface InfrastructureSpec {
  hosting: HostingConfig;
  database: DatabaseInfraConfig;
  caching?: CacheConfig;
  cicd: CICDConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  estimatedMonthlyCost?: string;
  scalabilityNotes?: string;
  generatedAt?: string;
}

// ============================================================
// Coding Guidelines (Phase 10)
// ============================================================

/**
 * Naming convention rules
 */
export interface NamingConventions {
  variables: NamingStyle;
  functions: NamingStyle;
  classes: NamingStyle;
  constants: NamingStyle;
  files: NamingStyle;
  directories: NamingStyle;
  components?: NamingStyle; // For React/Vue
  hooks?: NamingStyle; // For React
  types?: NamingStyle; // For TypeScript
  interfaces?: NamingStyle; // For TypeScript
  enums?: NamingStyle;
  database?: {
    tables: NamingStyle;
    columns: NamingStyle;
  };
}

export type NamingStyle = 'camelCase' | 'PascalCase' | 'snake_case' | 'SCREAMING_SNAKE_CASE' | 'kebab-case';

/**
 * Linting configuration
 */
export interface LintConfig {
  tool: 'eslint' | 'biome' | 'oxlint' | 'tslint' | 'custom';
  extends?: string[]; // e.g., ['eslint:recommended', 'plugin:@typescript-eslint/recommended']
  rules: LintRule[];
  ignorePatterns?: string[];
  formatOnSave: boolean;
  formatter?: 'prettier' | 'biome' | 'dprint' | 'none';
}

export interface LintRule {
  name: string;
  level: 'off' | 'warn' | 'error';
  options?: unknown;
}

/**
 * Testing strategy configuration
 */
export interface TestingStrategy {
  framework: TestFramework;
  coverage: {
    minimum: number;
    enforced: boolean;
    excludePatterns?: string[];
  };
  types: TestType[];
  patterns: {
    unitTestLocation: 'co-located' | 'separate-directory';
    testFileSuffix: string; // e.g., '.test.ts', '.spec.ts'
    mockNaming?: string; // e.g., '__mocks__'
  };
  ci: {
    runOnPush: boolean;
    runOnPr: boolean;
    parallelization?: boolean;
  };
}

export type TestFramework = 'vitest' | 'jest' | 'mocha' | 'playwright' | 'cypress' | 'other';

export interface TestType {
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
  required: boolean;
  coverage?: number;
  tools?: string[];
}

/**
 * Documentation strategy
 */
export interface DocStrategy {
  codeComments: {
    style: 'jsdoc' | 'tsdoc' | 'custom';
    required: 'all-public' | 'complex-only' | 'none';
  };
  apiDocs: {
    tool?: 'swagger' | 'redoc' | 'readme' | 'postman' | 'none';
    autoGenerate: boolean;
  };
  readme: {
    required: boolean;
    sections: string[]; // e.g., ['Installation', 'Usage', 'API', 'Contributing']
  };
  changelog: {
    enabled: boolean;
    format?: 'keep-a-changelog' | 'conventional' | 'custom';
  };
  adr?: {
    enabled: boolean;
    location: string;
  };
}

/**
 * Complete coding guidelines
 * Stored in project_data.coding_guidelines JSONB column
 */
export interface CodingGuidelines {
  naming: NamingConventions;
  patterns: DesignPattern[];
  forbidden: ForbiddenPattern[];
  linting: LintConfig;
  testing: TestingStrategy;
  documentation: DocStrategy;
  imports?: {
    style: 'absolute' | 'relative' | 'aliases';
    aliases?: Record<string, string>;
    sortOrder?: string[];
  };
  commits?: {
    style: 'conventional' | 'gitmoji' | 'custom';
    enforced: boolean;
    scopes?: string[];
  };
  generatedAt?: string;
}

export interface DesignPattern {
  name: string;
  description: string;
  example?: string;
  when: string;
}

export interface ForbiddenPattern {
  name: string;
  reason: string;
  alternative?: string;
  lintRule?: string;
}

// ============================================================
// API Keys for MCP (Phase 11 preparation)
// ============================================================

/**
 * API key for MCP server access
 */
export interface ApiKey {
  id: number;
  projectId: number;
  keyHash: string; // Hashed API key (never store plain text)
  name: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
  scopes: ApiKeyScope[];
  createdAt: Date;
  revokedAt?: Date;
}

export type ApiKeyScope =
  | 'read:prd'
  | 'read:schema'
  | 'read:api'
  | 'read:stories'
  | 'write:stories'
  | 'read:validation'
  | 'invoke:agents'
  | 'admin';

// ============================================================
// Section Review Workflow (Per-Section Approval)
// ============================================================

/**
 * Review status for an individual PRD section.
 * Transitions: draft -> awaiting-review -> approved
 */
export type SectionReviewStatus = 'draft' | 'awaiting-review' | 'approved';

/**
 * Keys identifying each reviewable PRD section.
 */
export type SectionKey =
  | 'problem-statement'
  | 'system-overview'
  | 'architecture'
  | 'tech-stack'
  | 'user-stories'
  | 'schema'
  | 'api-spec'
  | 'infrastructure'
  | 'guidelines'
  | 'nfr';

/**
 * Map of section keys to their current review status.
 * Stored in project_data.review_status JSONB column.
 */
export type SectionStatuses = Partial<Record<SectionKey, SectionReviewStatus>>;

// ============================================================
// Utility Types
// ============================================================

/**
 * Deep partial type for updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Type for inserting a new user story (without auto-generated fields)
 */
export type NewUserStory = Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating a user story
 */
export type UserStoryUpdate = DeepPartial<Omit<UserStory, 'id' | 'projectId' | 'createdAt'>>;
