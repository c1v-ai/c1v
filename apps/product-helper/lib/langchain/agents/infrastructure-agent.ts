/**
 * Infrastructure Specification Agent (Phase 10.2)
 *
 * Purpose: Generate infrastructure recommendations based on tech stack and requirements
 * Pattern: Structured output with Zod schema validation
 * Team: AI/Agent Engineering (Agent 3.1: LangChain Integration Engineer)
 *
 * Uses Claude Sonnet via central config for consistent but slightly
 * creative infrastructure recommendations. Analyzes the project's tech stack,
 * scale requirements, and compliance needs to recommend infrastructure configuration.
 */

import { createClaudeAgent } from '../config';
import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  infrastructureSpecSchema,
  hostingConfigSchema,
  databaseInfraConfigSchema,
  cacheConfigSchema,
  cicdConfigSchema,
  monitoringConfigSchema,
  securityConfigSchema,
} from '../../db/schema/v2-validators';
import type {
  InfrastructureSpec,
  TechStackModel,
  HostingProvider,
  DatabaseProvider,
  CacheProvider,
  CICDProvider,
  MonitoringProvider,
} from '../../db/schema/v2-types';
import { getInfrastructureKnowledge } from '../../education/generator-kb';

// ============================================================
// Context Interface
// ============================================================

/**
 * Context provided to the infrastructure specification agent
 */
export interface InfrastructureContext {
  projectName: string;
  projectDescription: string;
  techStack?: TechStackModel;
  scaleRequirements?: ScaleRequirements;
  complianceRequirements?: string[];
  budgetConstraints?: string;
}

/**
 * Scale requirements for the infrastructure
 */
export interface ScaleRequirements {
  expectedUsers?: number;
  peakConcurrentUsers?: number;
  dataVolumeGb?: number;
  requestsPerSecond?: number;
  globalDistribution?: boolean;
}

// ============================================================
// LLM Configuration
// ============================================================

/**
 * Structured output LLM with Zod schema validation
 * Uses Claude Sonnet via central config
 * Temperature: 0.3 for consistent but slightly creative suggestions
 */
const structuredInfrastructureLLM = createClaudeAgent(infrastructureSpecSchema, 'recommend_infrastructure', {
  temperature: 0.3,
});

// ============================================================
// Prompt Template
// ============================================================

const infrastructurePrompt = PromptTemplate.fromTemplate(`
You are a senior DevOps and cloud infrastructure architect recommending infrastructure for a new project.
Analyze the project requirements and provide well-reasoned infrastructure recommendations.

${getInfrastructureKnowledge()}

## Project Context
**Name:** {projectName}
**Description:** {projectDescription}

## Tech Stack
{techStackFormatted}

## Scale Requirements
{scaleFormatted}

## Compliance Requirements
{complianceFormatted}

## Budget Constraints
{budgetFormatted}

## Instructions

Use the Knowledge Bank above as your primary reference for platform selection, cost estimates, monitoring stack, and security checklist.
Match the project stage and type to KB recommendations, then customize based on specific requirements.

Recommend a complete infrastructure specification covering:

### 1. Hosting Configuration
- Choose provider: vercel, aws, gcp, azure, railway, render, fly, heroku, digitalocean, cloudflare, or self-hosted
- Specify region(s) based on user distribution
- Configure autoscaling if needed (min/max instances, CPU threshold)
- List domains (use example.com as placeholder)

### 2. Database Infrastructure
- Choose provider: vercel-postgres, supabase, neon, planetscale, aws-rds, aws-aurora, gcp-cloudsql, azure-cosmosdb, mongodb-atlas, upstash, or self-hosted
- Specify database type: postgresql, mysql, mongodb, sqlite, redis, other
- Configure connection pooling
- Configure backups (frequency, retention)
- Configure replication if needed (read replicas)

### 3. Caching (if needed)
- Choose provider: redis, upstash, memcached, vercel-kv, cloudflare-kv, memory
- Strategy: cache-aside, read-through, write-through, write-behind
- TTL and max memory

### 4. CI/CD Pipeline
- Choose provider: github-actions, gitlab-ci, circleci, jenkins, vercel, other
- Define branches (production, staging, development)
- Triggers: push, pull_request, schedule, manual
- Steps: build, test, lint, security-scan, deploy
- Environments with approvals

### 5. Monitoring & Observability
- Choose provider: vercel-analytics, datadog, newrelic, sentry, grafana, prometheus, aws-cloudwatch, gcp-stackdriver, other
- Logging: level, structured, retention
- Metrics: enabled, custom metrics
- Tracing: enabled, sample rate
- Alerting: channels (email, slack, pagerduty, webhook)

### 6. Security
- SSL: enabled, provider
- WAF: enabled/disabled
- DDoS protection: enabled/disabled
- Secrets management: env-vars, aws-secrets, gcp-secrets, vault, doppler, vercel
- CORS: allowed origins, methods, credentials
- Rate limiting: enabled, requests per minute

Also provide:
- **Estimated monthly cost** - Infrastructure cost estimate for production
- **Scalability notes** - How the infrastructure handles growth

Base your recommendations on:
- The tech stack choices (ensure compatibility)
- Scale requirements (right-size for expected load)
- Compliance needs (GDPR, SOC2, HIPAA requirements)
- Budget constraints
- Best practices for reliability and performance
- Developer experience and operational simplicity

For smaller projects or startups, prefer managed services over self-hosted.
For enterprise projects, consider compliance, support, and SLAs.
`);

// ============================================================
// Main Function
// ============================================================

/**
 * Generate infrastructure specification based on project context
 *
 * @param context - Project context including tech stack, scale, and compliance requirements
 * @returns InfrastructureSpec with validated recommendations
 */
export async function generateInfrastructureSpec(
  context: InfrastructureContext
): Promise<InfrastructureSpec> {
  try {
    // Format tech stack for prompt
    const techStackFormatted = context.techStack
      ? formatTechStack(context.techStack)
      : 'No tech stack specified - recommend based on project description';

    // Format scale requirements for prompt
    const scaleFormatted = context.scaleRequirements
      ? formatScaleRequirements(context.scaleRequirements)
      : 'No specific scale requirements - assume small to medium project';

    // Format compliance requirements for prompt
    const complianceFormatted = context.complianceRequirements && context.complianceRequirements.length > 0
      ? context.complianceRequirements.map(c => `- ${c}`).join('\n')
      : 'No specific compliance requirements';

    // Format budget constraints for prompt
    const budgetFormatted = context.budgetConstraints || 'No specific budget constraints';

    // Build prompt
    const promptText = await infrastructurePrompt.format({
      projectName: context.projectName,
      projectDescription: context.projectDescription,
      techStackFormatted,
      scaleFormatted,
      complianceFormatted,
      budgetFormatted,
    });

    // Invoke structured LLM
    const result = await structuredInfrastructureLLM.invoke(promptText);

    // Add generation timestamp
    return {
      ...result,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Infrastructure specification error:', error);

    // Return a minimal fallback infrastructure on failure
    return getDefaultInfrastructure(context);
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format tech stack for the prompt
 */
function formatTechStack(techStack: TechStackModel): string {
  return techStack.categories
    .map(c => `- **${c.category}**: ${c.choice}${c.version ? ` v${c.version}` : ''}`)
    .join('\n');
}

/**
 * Format scale requirements for the prompt
 */
function formatScaleRequirements(scale: ScaleRequirements): string {
  const parts: string[] = [];
  if (scale.expectedUsers) {
    parts.push(`Expected users: ${scale.expectedUsers.toLocaleString()}`);
  }
  if (scale.peakConcurrentUsers) {
    parts.push(`Peak concurrent users: ${scale.peakConcurrentUsers.toLocaleString()}`);
  }
  if (scale.dataVolumeGb) {
    parts.push(`Data volume: ${scale.dataVolumeGb} GB`);
  }
  if (scale.requestsPerSecond) {
    parts.push(`Requests per second: ${scale.requestsPerSecond.toLocaleString()}`);
  }
  if (scale.globalDistribution) {
    parts.push('Global distribution: Yes');
  }
  return parts.length > 0 ? parts.map(p => `- ${p}`).join('\n') : 'No specific scale requirements';
}

/**
 * Get a default infrastructure specification when LLM call fails
 * Provides a sensible modern infrastructure as fallback
 */
function getDefaultInfrastructure(context: InfrastructureContext): InfrastructureSpec {
  // Detect hosting provider from tech stack if available
  const hostingChoice = context.techStack?.categories.find(c => c.category === 'hosting');
  const hostingProvider: HostingProvider = (hostingChoice?.choice.toLowerCase() as HostingProvider) || 'vercel';

  return {
    hosting: {
      provider: hostingProvider,
      region: 'us-east-1',
      tier: 'pro',
      autoscaling: {
        enabled: true,
        minInstances: 1,
        maxInstances: 10,
        targetCpuUtilization: 70,
      },
      domains: ['example.com', 'www.example.com'],
    },
    database: {
      provider: 'supabase',
      type: 'postgresql',
      version: '16',
      tier: 'pro',
      region: 'us-east-1',
      connectionPooling: {
        enabled: true,
        maxConnections: 100,
      },
      backup: {
        enabled: true,
        frequency: 'daily',
        retention: '30 days',
      },
      replication: {
        enabled: false,
        readReplicas: 0,
      },
    },
    caching: {
      provider: 'upstash',
      strategy: 'cache-aside',
      ttlSeconds: 3600,
      maxMemoryMb: 256,
    },
    cicd: {
      provider: 'github-actions',
      branches: {
        production: 'main',
        staging: 'staging',
        development: 'develop',
      },
      triggers: ['push', 'pull_request'],
      steps: [
        { name: 'Install dependencies', type: 'build', command: 'npm ci', required: true },
        { name: 'Type check', type: 'lint', command: 'npm run type-check', required: true },
        { name: 'Lint', type: 'lint', command: 'npm run lint', required: true },
        { name: 'Test', type: 'test', command: 'npm test', required: true },
        { name: 'Build', type: 'build', command: 'npm run build', required: true },
        { name: 'Deploy', type: 'deploy', command: 'vercel deploy --prod', required: true },
      ],
      environments: [
        { name: 'development', url: 'https://dev.example.com' },
        { name: 'staging', url: 'https://staging.example.com', requiredApprovals: 1 },
        { name: 'production', url: 'https://example.com', requiredApprovals: 2, protectedSecrets: ['DATABASE_URL', 'API_KEY'] },
      ],
    },
    monitoring: {
      provider: 'sentry',
      logging: {
        level: 'info',
        structured: true,
        retention: '30 days',
      },
      metrics: {
        enabled: true,
        customMetrics: ['api_latency', 'error_rate', 'active_users'],
      },
      tracing: {
        enabled: true,
        sampleRate: 0.1,
      },
      alerting: {
        enabled: true,
        channels: ['email', 'slack'],
      },
    },
    security: {
      ssl: {
        enabled: true,
        provider: 'letsencrypt',
      },
      waf: {
        enabled: false,
      },
      ddosProtection: {
        enabled: true,
        provider: 'cloudflare',
      },
      secrets: {
        manager: 'vercel',
      },
      cors: {
        allowedOrigins: ['https://example.com'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowCredentials: true,
      },
      rateLimit: {
        enabled: true,
        requestsPerMinute: 100,
      },
    },
    estimatedMonthlyCost: '$50-200/month for small to medium traffic',
    scalabilityNotes: 'Vercel handles auto-scaling automatically. Database can be upgraded to larger tiers as needed. Consider adding read replicas for high-read workloads.',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validate an infrastructure specification against the schema
 */
export function validateInfrastructureSpec(data: unknown): InfrastructureSpec | null {
  const result = infrastructureSpecSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('Infrastructure spec validation failed:', result.error);
  return null;
}

/**
 * Calculate estimated monthly cost based on infrastructure choices
 */
export function estimateMonthlyCost(spec: InfrastructureSpec): string {
  let minCost = 0;
  let maxCost = 0;

  // Hosting costs
  switch (spec.hosting.provider) {
    case 'vercel':
      minCost += 20;
      maxCost += 100;
      break;
    case 'aws':
    case 'gcp':
    case 'azure':
      minCost += 50;
      maxCost += 500;
      break;
    case 'railway':
    case 'render':
    case 'fly':
      minCost += 10;
      maxCost += 50;
      break;
    default:
      minCost += 20;
      maxCost += 100;
  }

  // Database costs
  switch (spec.database.provider) {
    case 'supabase':
    case 'neon':
      minCost += 25;
      maxCost += 100;
      break;
    case 'planetscale':
      minCost += 29;
      maxCost += 200;
      break;
    case 'aws-rds':
    case 'aws-aurora':
      minCost += 50;
      maxCost += 500;
      break;
    default:
      minCost += 25;
      maxCost += 100;
  }

  // Caching costs
  if (spec.caching) {
    switch (spec.caching.provider) {
      case 'upstash':
      case 'vercel-kv':
        minCost += 10;
        maxCost += 50;
        break;
      case 'redis':
        minCost += 25;
        maxCost += 100;
        break;
      default:
        minCost += 10;
        maxCost += 50;
    }
  }

  // Monitoring costs
  switch (spec.monitoring.provider) {
    case 'sentry':
      minCost += 26;
      maxCost += 80;
      break;
    case 'datadog':
    case 'newrelic':
      minCost += 50;
      maxCost += 300;
      break;
    case 'vercel-analytics':
      minCost += 0;
      maxCost += 20;
      break;
    default:
      minCost += 0;
      maxCost += 50;
  }

  return `$${minCost}-${maxCost}/month`;
}

/**
 * Get hosting recommendation based on tech stack
 */
export function getRecommendedHosting(techStack: TechStackModel): HostingProvider {
  const frontend = techStack.categories.find(c => c.category === 'frontend');
  const backend = techStack.categories.find(c => c.category === 'backend');

  // Next.js or similar frameworks work best with Vercel
  if (frontend?.choice.toLowerCase().includes('next') ||
      backend?.choice.toLowerCase().includes('next')) {
    return 'vercel';
  }

  // AWS for enterprise or complex backends
  if (backend?.choice.toLowerCase().includes('express') ||
      backend?.choice.toLowerCase().includes('fastify')) {
    return 'aws';
  }

  // Railway/Render for simpler deployments
  if (backend?.choice.toLowerCase().includes('node')) {
    return 'railway';
  }

  return 'vercel';
}

/**
 * Get database recommendation based on tech stack
 */
export function getRecommendedDatabase(techStack: TechStackModel): DatabaseProvider {
  const db = techStack.categories.find(c => c.category === 'database');
  const choice = db?.choice.toLowerCase() || '';

  if (choice.includes('postgres')) {
    return 'supabase';
  }
  if (choice.includes('mysql')) {
    return 'planetscale';
  }
  if (choice.includes('mongo')) {
    return 'mongodb-atlas';
  }

  return 'supabase';
}
