/**
 * ask_project_question MCP Tool
 *
 * RAG-powered Q&A about the project using OpenAI.
 * Answers questions using project data as context.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

type QuestionScope = 'all' | 'requirements' | 'technical' | 'architecture';

interface AskQuestionArgs {
  question: string;
  scope?: QuestionScope;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'ask_project_question',
  description:
    'Ask a question about the project and get an AI-powered answer based on project data. ' +
    'Uses RAG (Retrieval Augmented Generation) to provide accurate answers with source references. ' +
    'Use this when you need to understand specific aspects of the project.',
  inputSchema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'The question to ask about the project',
      },
      scope: {
        type: 'string',
        enum: ['all', 'requirements', 'technical', 'architecture'],
        description:
          'Scope of the search: ' +
          'all (entire project), ' +
          'requirements (PRD and user stories), ' +
          'technical (tech stack and implementation), ' +
          'architecture (system design and diagrams)',
      },
    },
    required: ['question'],
  },
};

/**
 * Build project context based on scope
 */
function buildProjectContext(
  project: {
    name: string;
    vision: string | null;
    projectData: Record<string, unknown> | null;
    userStories?: Array<{ title: string; description: string; status: string }>;
  },
  scope: QuestionScope
): string {
  const sections: string[] = [];
  const data = project.projectData || {};

  // Always include basic info
  sections.push(`Project Name: ${project.name}`);
  if (project.vision) {
    sections.push(`Vision: ${project.vision}`);
  }

  if (scope === 'all' || scope === 'requirements') {
    if (data.actors) {
      sections.push(`\nActors:\n${JSON.stringify(data.actors, null, 2)}`);
    }
    if (data.useCases) {
      sections.push(`\nUse Cases:\n${JSON.stringify(data.useCases, null, 2)}`);
    }
    if (data.systemBoundaries) {
      sections.push(`\nSystem Boundaries:\n${JSON.stringify(data.systemBoundaries, null, 2)}`);
    }
    if (data.dataEntities) {
      sections.push(`\nData Entities:\n${JSON.stringify(data.dataEntities, null, 2)}`);
    }
    if (project.userStories && project.userStories.length > 0) {
      const stories = project.userStories.slice(0, 10);
      sections.push(`\nUser Stories (first 10):\n${JSON.stringify(stories, null, 2)}`);
    }
  }

  if (scope === 'all' || scope === 'technical') {
    if (data.techStack) {
      sections.push(`\nTech Stack:\n${JSON.stringify(data.techStack, null, 2)}`);
    }
    if (data.databaseSchema) {
      sections.push(`\nDatabase Schema:\n${JSON.stringify(data.databaseSchema, null, 2)}`);
    }
    if (data.codingGuidelines) {
      sections.push(`\nCoding Guidelines:\n${JSON.stringify(data.codingGuidelines, null, 2)}`);
    }
  }

  if (scope === 'all' || scope === 'architecture') {
    if (data.apiSpecification) {
      sections.push(`\nAPI Specification:\n${JSON.stringify(data.apiSpecification, null, 2)}`);
    }
    if (data.infrastructureSpec) {
      sections.push(`\nInfrastructure:\n${JSON.stringify(data.infrastructureSpec, null, 2)}`);
    }
  }

  return sections.join('\n');
}

/**
 * Extract likely sources from answer
 */
function extractSources(context: string, answer: string): string[] {
  const sources: string[] = [];
  const lowerAnswer = answer.toLowerCase();

  if (lowerAnswer.includes('actor') || context.includes('Actors:')) sources.push('Actors');
  if (lowerAnswer.includes('use case') || context.includes('Use Cases:')) sources.push('Use Cases');
  if (lowerAnswer.includes('user stor') || context.includes('User Stories:'))
    sources.push('User Stories');
  if (lowerAnswer.includes('tech') || context.includes('Tech Stack:')) sources.push('Tech Stack');
  if (lowerAnswer.includes('database') || context.includes('Database Schema:'))
    sources.push('Database Schema');
  if (lowerAnswer.includes('api') || context.includes('API Specification:'))
    sources.push('API Specification');
  if (lowerAnswer.includes('infrastructure') || context.includes('Infrastructure:'))
    sources.push('Infrastructure');

  return sources.length > 0 ? sources : ['Project Data'];
}

/**
 * Estimate confidence in the answer
 */
function estimateConfidence(answer: string): number {
  if (answer.includes("don't") || answer.includes('not enough information')) return 30;
  if (answer.length < 100) return 50;
  if (answer.length > 300 && answer.includes('based on')) return 90;
  if (answer.length > 150) return 70;
  return 60;
}

const handler: ToolHandler<AskQuestionArgs> = async (args, context) => {
  const { question, scope = 'all' } = args;

  if (!question || question.trim().length === 0) {
    return createTextResult('Question is required', true);
  }

  // Fetch project with related data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, context.projectId),
    with: {
      projectData: true,
      userStories: true,
    },
  });

  if (!project) {
    return createTextResult(`Project with ID ${context.projectId} not found`, true);
  }

  // Build context
  const projectContext = buildProjectContext(
    {
      name: project.name,
      vision: project.vision,
      projectData: project.projectData as Record<string, unknown> | null,
      userStories: project.userStories,
    },
    scope
  );

  // Check if OpenAI is available
  if (!process.env.OPENAI_API_KEY) {
    return createJsonResult({
      question,
      answer:
        'OpenAI integration is not configured. To use AI-powered Q&A, set the OPENAI_API_KEY environment variable.',
      sources: ['Project Data'],
      confidence: 0,
      scope,
      fallback: true,
    });
  }

  try {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
    });

    const systemPrompt = `You are a helpful assistant that answers questions about a software project.
You have access to the following project information:

${projectContext}

Answer the user's question based on this information. Be specific and cite relevant details.
If you don't have enough information, say so.`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(question),
    ]);

    const answer = response.content as string;
    const sources = extractSources(projectContext, answer);
    const confidence = estimateConfidence(answer);

    return createJsonResult({
      question,
      answer,
      sources,
      confidence,
      scope,
      metadata: {
        projectId: project.id,
        projectName: project.name,
        answeredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return createTextResult(
      `Error generating answer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
};

export function registerAskQuestion(): void {
  registerTool(definition, handler);
}

export { definition, handler };
