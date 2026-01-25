/**
 * invoke_agent MCP Tool
 *
 * Invokes a specialized domain agent to get expert guidance.
 * Returns recommendations, best practices, and next steps from the agent.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';

type AgentType =
  | 'backend-architect'
  | 'database-engineer'
  | 'devops-engineer'
  | 'ui-ux-engineer'
  | 'chat-engineer'
  | 'data-viz-engineer'
  | 'langchain-engineer'
  | 'llm-workflow-engineer'
  | 'sr-cornell-validator'
  | 'vector-store-engineer'
  | 'cache-engineer'
  | 'observability-engineer'
  | 'product-manager'
  | 'product-strategy'
  | 'technical-program-manager'
  | 'qa-engineer'
  | 'documentation-engineer';

interface InvokeAgentArgs {
  agent: AgentType;
  task: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AgentInfo {
  name: string;
  specialty: string;
  skills: string[];
}

const definition: ToolDefinition = {
  name: 'invoke_agent',
  description:
    'Invoke a specialized domain agent to get expert guidance on a specific task. ' +
    'Returns recommendations, best practices, and suggested next steps from the agent. ' +
    'Use this when you need specialized expertise in a particular domain.',
  inputSchema: {
    type: 'object',
    properties: {
      agent: {
        type: 'string',
        enum: [
          'backend-architect',
          'database-engineer',
          'devops-engineer',
          'ui-ux-engineer',
          'chat-engineer',
          'data-viz-engineer',
          'langchain-engineer',
          'llm-workflow-engineer',
          'sr-cornell-validator',
          'vector-store-engineer',
          'cache-engineer',
          'observability-engineer',
          'product-manager',
          'product-strategy',
          'technical-program-manager',
          'qa-engineer',
          'documentation-engineer',
        ],
        description: 'The specialized agent to invoke for this task',
      },
      task: {
        type: 'string',
        description: 'The task or question for the agent to address',
      },
      context: {
        type: 'object',
        description: 'Optional context object with additional information for the agent',
      },
    },
    required: ['agent', 'task'],
  },
};

/**
 * Agent registry with metadata
 */
const AGENT_REGISTRY: Record<AgentType, AgentInfo> = {
  'backend-architect': {
    name: 'Backend Architect',
    specialty: 'API design, system architecture, service patterns',
    skills: ['REST API', 'GraphQL', 'Microservices', 'SOLID principles', 'Design patterns'],
  },
  'database-engineer': {
    name: 'Database Engineer',
    specialty: 'Schemas, migrations, query optimization, Drizzle/Prisma',
    skills: ['PostgreSQL', 'Drizzle ORM', 'Migrations', 'Indexing', 'Query optimization'],
  },
  'devops-engineer': {
    name: 'DevOps Engineer',
    specialty: 'CI/CD, Docker, auth setup, security',
    skills: ['GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'Security'],
  },
  'ui-ux-engineer': {
    name: 'UI/UX Engineer',
    specialty: 'React components, accessibility, responsive design',
    skills: ['React', 'Tailwind CSS', 'Accessibility', 'Responsive design', 'shadcn/ui'],
  },
  'chat-engineer': {
    name: 'Chat Engineer',
    specialty: 'Chat UI, streaming, Vercel AI SDK',
    skills: ['Vercel AI SDK', 'Streaming', 'WebSockets', 'Chat interfaces'],
  },
  'data-viz-engineer': {
    name: 'Data Visualization Engineer',
    specialty: 'Charts, Mermaid diagrams, dashboards',
    skills: ['Mermaid.js', 'D3.js', 'Recharts', 'Dashboard design'],
  },
  'langchain-engineer': {
    name: 'LangChain Engineer',
    specialty: 'LangChain, LangGraph, agent workflows',
    skills: ['LangChain.js', 'LangGraph', 'Agents', 'Tools', 'Memory'],
  },
  'llm-workflow-engineer': {
    name: 'LLM Workflow Engineer',
    specialty: 'Prompt engineering, model selection',
    skills: ['Prompt design', 'Model selection', 'Token optimization', 'Fallback strategies'],
  },
  'sr-cornell-validator': {
    name: 'SR-CORNELL Validator',
    specialty: 'Validation rules, quality gates',
    skills: ['Requirements validation', 'Quality gates', 'Completeness checks'],
  },
  'vector-store-engineer': {
    name: 'Vector Store Engineer',
    specialty: 'pgvector, embeddings, semantic search',
    skills: ['pgvector', 'OpenAI embeddings', 'Semantic search', 'RAG'],
  },
  'cache-engineer': {
    name: 'Cache Engineer',
    specialty: 'Redis, caching strategies',
    skills: ['Redis', 'Upstash', 'Cache invalidation', 'TTL strategies'],
  },
  'observability-engineer': {
    name: 'Observability Engineer',
    specialty: 'Logging, monitoring, metrics',
    skills: ['Pino', 'Sentry', 'OpenTelemetry', 'Dashboards', 'Alerting'],
  },
  'product-manager': {
    name: 'Product Manager',
    specialty: 'PRDs, user stories, acceptance criteria',
    skills: ['PRD writing', 'User stories', 'RICE scoring', 'Sprint planning'],
  },
  'product-strategy': {
    name: 'Product Strategy',
    specialty: 'Vision, OKRs, competitive analysis',
    skills: ['Product vision', 'OKRs', 'Market research', 'Go-to-market'],
  },
  'technical-program-manager': {
    name: 'Technical Program Manager',
    specialty: 'Cross-team coordination, ADRs, releases',
    skills: ['ADRs', 'Release planning', 'Dependency management', 'Coordination'],
  },
  'qa-engineer': {
    name: 'QA Engineer',
    specialty: 'Test strategies, E2E, coverage',
    skills: ['Vitest', 'Playwright', 'Test coverage', 'E2E testing'],
  },
  'documentation-engineer': {
    name: 'Documentation Engineer',
    specialty: 'API docs, guides, READMEs',
    skills: ['API documentation', 'User guides', 'OpenAPI', 'MDX'],
  },
};

/**
 * Generate structured guidance based on agent type and task
 */
function generateGuidance(agent: AgentType, task: string): {
  summary: string;
  recommendations: string[];
  bestPractices: string[];
  nextSteps: string[];
  warnings: string[];
} {
  const info = AGENT_REGISTRY[agent];

  // Agent-specific recommendations (could be expanded with LLM in production)
  const baseGuidance = {
    summary: `As a ${info.name}, here is my guidance on: "${task}"`,
    recommendations: [
      `Consider the key aspects of ${info.specialty}`,
      `Review existing patterns and conventions in the codebase`,
      `Ensure alignment with project requirements`,
    ],
    bestPractices: info.skills.map((skill) => `Apply ${skill} best practices where applicable`),
    nextSteps: [
      'Define clear acceptance criteria',
      'Create a technical design if needed',
      'Implement incrementally with tests',
      'Review and iterate based on feedback',
    ],
    warnings: [
      'Avoid premature optimization',
      'Consider security implications',
      'Document decisions for future reference',
    ],
  };

  return baseGuidance;
}

const handler: ToolHandler<InvokeAgentArgs> = async (args, context) => {
  const { agent, task, context: taskContext } = args;

  // Validate agent
  if (!AGENT_REGISTRY[agent]) {
    return createTextResult(
      `Unknown agent type: "${agent}". Available agents: ${Object.keys(AGENT_REGISTRY).join(', ')}`,
      true
    );
  }

  // Validate task
  if (!task || task.trim().length === 0) {
    return createTextResult('Task description is required', true);
  }

  const info = AGENT_REGISTRY[agent];
  const guidance = generateGuidance(agent, task);

  return createJsonResult({
    agent: {
      type: agent,
      name: info.name,
      specialty: info.specialty,
      skills: info.skills,
    },
    task,
    context: taskContext || null,
    response: {
      summary: guidance.summary,
      recommendations: guidance.recommendations,
      bestPractices: guidance.bestPractices,
      nextSteps: guidance.nextSteps,
      warnings: guidance.warnings,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      projectId: context.projectId,
      note: 'For deeper analysis, consider using the actual agent via Task tool',
    },
  });
};

export function registerInvokeAgent(): void {
  registerTool(definition, handler);
}

export { definition, handler };
