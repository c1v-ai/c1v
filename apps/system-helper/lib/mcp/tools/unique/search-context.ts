/**
 * search_project_context MCP Tool
 *
 * Keyword search across project data.
 * Returns matching results with excerpts and relevance scores.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type SearchType = 'all' | 'use_cases' | 'entities' | 'stories' | 'endpoints';

interface SearchContextArgs {
  query: string;
  type?: SearchType;
  limit?: number;
  [key: string]: unknown;
}

interface SearchResult {
  type: string;
  title: string;
  excerpt: string;
  score: number;
  metadata?: Record<string, unknown>;
}

const definition: ToolDefinition = {
  name: 'search_project_context',
  description:
    'Search across all project data using keywords. ' +
    'Returns matching results with excerpts and relevance scores. ' +
    'Use this to find specific information within the project.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query (keywords or phrase)',
      },
      type: {
        type: 'string',
        enum: ['all', 'use_cases', 'entities', 'stories', 'endpoints'],
        description:
          'Type of content to search: ' +
          'all (search everything), ' +
          'use_cases (use cases only), ' +
          'entities (data entities only), ' +
          'stories (user stories only), ' +
          'endpoints (API endpoints only)',
      },
      limit: {
        type: 'integer',
        description: 'Maximum number of results to return (default: 10)',
      },
    },
    required: ['query'],
  },
};

/**
 * Calculate relevance score for a search result
 */
function calculateScore(searchTerm: string, obj: Record<string, unknown>): number {
  let score = 0;
  const searchWords = searchTerm.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const searchInValue = (value: unknown, key: string, depth = 0): void => {
    if (depth > 3) return;

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      searchWords.forEach((word) => {
        if (lowerValue.includes(word)) {
          // Title/name matches get higher score
          if (key === 'name' || key === 'title') {
            score += 10;
          } else if (key === 'description') {
            score += 5;
          } else {
            score += 2;
          }
        }
      });

      // Exact phrase bonus
      if (lowerValue.includes(searchTerm.toLowerCase())) {
        score += 15;
      }
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string') {
          searchWords.forEach((word) => {
            if (item.toLowerCase().includes(word)) score += 2;
          });
        } else if (typeof item === 'object' && item !== null) {
          Object.entries(item as Record<string, unknown>).forEach(([k, v]) => {
            searchInValue(v, k, depth + 1);
          });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
        searchInValue(v, k, depth + 1);
      });
    }
  };

  Object.entries(obj).forEach(([key, value]) => {
    searchInValue(value, key, 0);
  });

  return score;
}

/**
 * Generate excerpt with context around match
 */
function generateExcerpt(text: string, searchTerm: string, maxLength = 150): string {
  if (!text) return '';

  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerTerm);

  if (index === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + searchTerm.length + 100);

  let excerpt = text.substring(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  return excerpt;
}

const handler: ToolHandler<SearchContextArgs> = async (args, context) => {
  const { query, type = 'all', limit = 10 } = args;

  if (!query || query.trim().length === 0) {
    return createTextResult('Search query cannot be empty', true);
  }

  // Fetch project with searchable data
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

  const data = project.projectData as Record<string, unknown> | null;
  const results: SearchResult[] = [];
  const searchTerm = query.toLowerCase();

  // Search Use Cases
  if (type === 'all' || type === 'use_cases') {
    const useCases = (data?.useCases as Array<Record<string, unknown>>) || [];
    useCases.forEach((uc) => {
      const score = calculateScore(searchTerm, uc);
      if (score > 0) {
        results.push({
          type: 'use_case',
          title: (uc.name as string) || (uc.id as string) || 'Unknown',
          excerpt: generateExcerpt((uc.description as string) || '', searchTerm),
          score,
          metadata: { id: uc.id, actor: uc.actor },
        });
      }
    });
  }

  // Search Data Entities
  if (type === 'all' || type === 'entities') {
    const entities = (data?.dataEntities as Array<Record<string, unknown>>) || [];
    entities.forEach((entity) => {
      const score = calculateScore(searchTerm, entity);
      if (score > 0) {
        const attrs = entity.attributes as string[] | undefined;
        results.push({
          type: 'data_entity',
          title: (entity.name as string) || 'Unknown',
          excerpt: `Attributes: ${attrs?.join(', ') || 'none'}`,
          score,
          metadata: { relationships: entity.relationships },
        });
      }
    });
  }

  // Search User Stories
  if (type === 'all' || type === 'stories') {
    const stories = project.userStories || [];
    stories.forEach((story) => {
      const score = calculateScore(searchTerm, story as unknown as Record<string, unknown>);
      if (score > 0) {
        results.push({
          type: 'user_story',
          title: story.title,
          excerpt: generateExcerpt(story.description || '', searchTerm),
          score,
          metadata: {
            id: story.id,
            status: story.status,
            priority: story.priority,
            epic: story.epic,
          },
        });
      }
    });
  }

  // Search API Endpoints
  if (type === 'all' || type === 'endpoints') {
    const apiSpec = data?.apiSpecification as { endpoints?: Array<Record<string, unknown>> };
    if (apiSpec?.endpoints) {
      apiSpec.endpoints.forEach((endpoint) => {
        const score = calculateScore(searchTerm, endpoint);
        if (score > 0) {
          results.push({
            type: 'api_endpoint',
            title: `${endpoint.method} ${endpoint.path}`,
            excerpt: (endpoint.description as string) || '',
            score,
            metadata: { method: endpoint.method, path: endpoint.path },
          });
        }
      });
    }
  }

  // Search Actors
  if (type === 'all') {
    const actors = (data?.actors as Array<Record<string, unknown>>) || [];
    actors.forEach((actor) => {
      const score = calculateScore(searchTerm, actor);
      if (score > 0) {
        results.push({
          type: 'actor',
          title: (actor.name as string) || 'Unknown',
          excerpt: (actor.description as string) || '',
          score,
          metadata: { role: actor.role },
        });
      }
    });
  }

  // Sort by score and limit
  results.sort((a, b) => b.score - a.score);
  const limitedResults = results.slice(0, limit);

  // Group by type for summary
  const byType = limitedResults.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return createJsonResult({
    query,
    type,
    limit,
    total: results.length,
    results: limitedResults,
    summary: { byType },
  });
};

export function registerSearchContext(): void {
  registerTool(definition, handler);
}

export { definition, handler };
