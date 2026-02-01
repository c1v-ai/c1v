/**
 * get_user_stories MCP Tool
 *
 * Returns user stories for the current project.
 * Queries the user_stories table with optional filtering.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler, ToolContext } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { userStories } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import type { UserStoryStatus, UserStoryPriority } from '@/lib/db/schema/v2-types';

interface GetUserStoriesArgs {
  status?: 'all' | UserStoryStatus;
  priority?: 'all' | UserStoryPriority;
  epic?: string;
  actor?: string;
  limit?: number;
  sort_by?: 'priority' | 'order' | 'created_at';
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'get_user_stories',
  description:
    'Get user stories for the current project. ' +
    'Returns stories with acceptance criteria, status, and priority. ' +
    'Use this to understand what features to implement and their requirements.',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['all', 'backlog', 'todo', 'in-progress', 'review', 'done', 'blocked'],
        description:
          'Filter by status. Options: all (default), backlog, todo, in-progress, review, done, blocked',
      },
      priority: {
        type: 'string',
        enum: ['all', 'critical', 'high', 'medium', 'low'],
        description: 'Filter by priority. Options: all (default), critical, high, medium, low',
      },
      epic: {
        type: 'string',
        description: 'Filter by epic name. Returns only stories belonging to this epic.',
      },
      actor: {
        type: 'string',
        description:
          'Filter by actor/user type. Returns stories for a specific user persona.',
      },
      limit: {
        type: 'integer',
        description: 'Maximum number of stories to return. Default: 50',
      },
      sort_by: {
        type: 'string',
        enum: ['priority', 'order', 'created_at'],
        description: 'Sort order. Default: order (backlog position)',
      },
    },
  },
};

/**
 * Map priority to numeric value for sorting
 */
function priorityValue(priority: UserStoryPriority): number {
  const values: Record<UserStoryPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return values[priority] ?? 2;
}

const handler: ToolHandler<GetUserStoriesArgs> = async (args, context) => {
  const statusFilter = args.status || 'all';
  const priorityFilter = args.priority || 'all';
  const epicFilter = args.epic?.toLowerCase();
  const actorFilter = args.actor?.toLowerCase();
  const limit = Math.min(args.limit || 50, 100); // Cap at 100
  const sortBy = args.sort_by || 'order';

  // Build base query conditions
  const conditions = [eq(userStories.projectId, context.projectId)];

  // Add status filter
  if (statusFilter !== 'all') {
    conditions.push(eq(userStories.status, statusFilter as UserStoryStatus));
  }

  // Add priority filter
  if (priorityFilter !== 'all') {
    conditions.push(eq(userStories.priority, priorityFilter as UserStoryPriority));
  }

  // Add epic filter (case-insensitive comparison done in JS)
  // Note: For better performance, consider adding a lowercase index

  // Fetch stories
  let stories = await db.query.userStories.findMany({
    where: and(...conditions),
    orderBy:
      sortBy === 'created_at'
        ? [desc(userStories.createdAt)]
        : sortBy === 'priority'
          ? [asc(userStories.priority), asc(userStories.order)]
          : [asc(userStories.order)],
    limit: limit + 20, // Fetch extra for client-side filters
  });

  // Apply client-side filters for epic and actor (case-insensitive)
  if (epicFilter) {
    stories = stories.filter((s) => s.epic?.toLowerCase() === epicFilter);
  }

  if (actorFilter) {
    stories = stories.filter((s) => s.actor.toLowerCase() === actorFilter);
  }

  // Apply limit after filters
  stories = stories.slice(0, limit);

  if (stories.length === 0) {
    const filters: string[] = [];
    if (statusFilter !== 'all') filters.push(`status=${statusFilter}`);
    if (priorityFilter !== 'all') filters.push(`priority=${priorityFilter}`);
    if (epicFilter) filters.push(`epic=${epicFilter}`);
    if (actorFilter) filters.push(`actor=${actorFilter}`);

    const filterMessage = filters.length > 0 ? ` with filters: ${filters.join(', ')}` : '';

    return createTextResult(
      `No user stories found for this project${filterMessage}. ` +
        'User stories may need to be generated from use cases.',
      true
    );
  }

  // Sort by priority if requested (more accurate than DB sort for mixed results)
  if (sortBy === 'priority') {
    stories.sort(
      (a, b) =>
        priorityValue(a.priority as UserStoryPriority) -
        priorityValue(b.priority as UserStoryPriority)
    );
  }

  // Format the response
  const formattedStories = stories.map((story) => ({
    id: story.id,
    title: story.title,
    description: story.description,
    actor: story.actor,
    epic: story.epic,
    useCaseId: story.useCaseId,
    acceptanceCriteria: story.acceptanceCriteria,
    status: story.status,
    priority: story.priority,
    estimatedEffort: story.estimatedEffort,
    assignee: story.assignee,
    labels: story.labels,
    blockedBy: story.blockedBy,
    order: story.order,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
  }));

  // Calculate summary statistics
  const statusCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  const epicCounts: Record<string, number> = {};

  formattedStories.forEach((story) => {
    statusCounts[story.status] = (statusCounts[story.status] || 0) + 1;
    priorityCounts[story.priority] = (priorityCounts[story.priority] || 0) + 1;
    if (story.epic) {
      epicCounts[story.epic] = (epicCounts[story.epic] || 0) + 1;
    }
  });

  return createJsonResult({
    totalCount: formattedStories.length,
    filters: {
      status: statusFilter,
      priority: priorityFilter,
      epic: epicFilter || 'all',
      actor: actorFilter || 'all',
    },
    summary: {
      byStatus: statusCounts,
      byPriority: priorityCounts,
      byEpic: epicCounts,
    },
    stories: formattedStories,
  });
};

/**
 * Register the get_user_stories tool with the MCP server
 */
export function registerGetUserStories(): void {
  registerTool(definition, handler);
}

export { definition, handler };
