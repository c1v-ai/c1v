/**
 * get_cleo_tasks MCP Tool
 *
 * Returns CLEO-style task list with stable IDs.
 * Maps user stories to a task format compatible with CLEO task management.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { userStories } from '@/lib/db/schema';
import { eq, and, SQL } from 'drizzle-orm';

type TaskStatus = 'all' | 'pending' | 'in-progress' | 'completed';

interface GetCleoTasksArgs {
  status?: TaskStatus;
  epic?: string;
  limit?: number;
  [key: string]: unknown;
}

interface CleoTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  epic?: string;
  estimatedEffort?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export const definition: ToolDefinition = {
  name: 'get_cleo_tasks',
  description:
    'Get CLEO-style task list with stable IDs. ' +
    'Returns user stories formatted as tasks with status, priority, and epic information. ' +
    'Use this when integrating with CLEO task management or referencing tasks in commits/PRs.',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['all', 'pending', 'in-progress', 'completed'],
        description:
          'Filter by status. Options: ' +
          'all (default, all tasks), ' +
          'pending (backlog + todo), ' +
          'in-progress (currently being worked on), ' +
          'completed (done tasks)',
      },
      epic: {
        type: 'string',
        description: 'Filter by epic/feature name',
      },
      limit: {
        type: 'integer',
        description: 'Maximum number of tasks to return (default: 50)',
      },
    },
  },
};

/**
 * Map user story status to CLEO task status
 */
function mapStatus(storyStatus: string): string {
  switch (storyStatus) {
    case 'done':
      return 'completed';
    case 'in-progress':
    case 'review':
      return 'in-progress';
    case 'blocked':
      return 'blocked';
    case 'backlog':
    case 'todo':
    default:
      return 'pending';
  }
}

/**
 * Generate stable CLEO-style task ID
 */
function generateTaskId(storyId: number): string {
  return `T${storyId.toString().padStart(3, '0')}`;
}

export const handler: ToolHandler<GetCleoTasksArgs> = async (args, context) => {
  const statusFilter = args.status || 'all';
  const epicFilter = args.epic;
  const limit = args.limit ?? 50;

  // Build query conditions
  const conditions: SQL[] = [eq(userStories.projectId, context.projectId)];

  // Apply status filter in SQL where possible
  if (statusFilter === 'in-progress') {
    conditions.push(eq(userStories.status, 'in-progress'));
  } else if (statusFilter === 'completed') {
    conditions.push(eq(userStories.status, 'done'));
  }

  // Fetch stories
  let stories = await db.query.userStories.findMany({
    where: and(...conditions),
    orderBy: (stories, { desc }) => [desc(stories.updatedAt)],
    limit: limit,
  });

  // Apply epic filter if specified
  if (epicFilter) {
    stories = stories.filter(
      (s) => s.epic && s.epic.toLowerCase().includes(epicFilter.toLowerCase())
    );
  }

  // Apply pending filter (backlog + todo) post-query
  if (statusFilter === 'pending') {
    stories = stories.filter((s) => s.status === 'backlog' || s.status === 'todo');
  }

  // Map to CLEO task format
  const tasks: CleoTask[] = stories.map((story) => ({
    id: generateTaskId(story.id),
    title: story.title,
    status: mapStatus(story.status),
    priority: story.priority || 'medium',
    epic: story.epic || undefined,
    estimatedEffort: story.estimatedEffort || undefined,
    assignee: undefined, // User stories don't have assignees in our schema
    createdAt: story.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: story.updatedAt?.toISOString() || new Date().toISOString(),
  }));

  // Calculate summary stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  return createJsonResult({
    projectId: context.projectId,
    filter: {
      status: statusFilter,
      epic: epicFilter || null,
      limit,
    },
    stats,
    tasks,
  });
};

export function registerGetCleoTasks(): void {
  registerTool(definition, handler);
}
