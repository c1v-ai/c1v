/**
 * update_user_story_status MCP Tool
 *
 * Updates the status of a user story in the user_stories table.
 * This is a WRITE operation that modifies the database.
 */

import { registerTool } from '@/lib/mcp/tool-registry';
import type { ToolDefinition, ToolHandler } from '@/lib/mcp/types';
import { createJsonResult, createTextResult } from '@/lib/mcp/types';
import { db } from '@/lib/db/drizzle';
import { userStories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type UserStoryStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';

interface UpdateUserStoryStatusArgs {
  storyId: number;
  status: UserStoryStatus;
  notes?: string;
  [key: string]: unknown;
}

const definition: ToolDefinition = {
  name: 'update_user_story_status',
  description:
    'Update the status of a user story (e.g., from todo to in-progress or done). ' +
    'Use this when tracking progress on user stories during implementation. ' +
    'Optionally add notes to document the status change.',
  inputSchema: {
    type: 'object',
    properties: {
      storyId: {
        type: 'integer',
        description: 'The ID of the user story to update (required)',
      },
      status: {
        type: 'string',
        enum: ['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked'],
        description:
          'New status for the user story. Options: ' +
          'backlog (not yet planned), ' +
          'todo (ready to start), ' +
          'in-progress (currently being worked on), ' +
          'review (awaiting review), ' +
          'done (completed), ' +
          'blocked (blocked by dependencies)',
      },
      notes: {
        type: 'string',
        description:
          'Optional notes about the status change (e.g., blocking reason, completion notes)',
      },
    },
    required: ['storyId', 'status'],
  },
};

const handler: ToolHandler<UpdateUserStoryStatusArgs> = async (args, context) => {
  const { storyId, status, notes } = args;

  // Validate required fields
  if (!storyId || typeof storyId !== 'number') {
    return createTextResult('Error: storyId is required and must be a number', true);
  }

  if (!status || typeof status !== 'string') {
    return createTextResult('Error: status is required and must be a valid status string', true);
  }

  const validStatuses: UserStoryStatus[] = [
    'backlog',
    'todo',
    'in-progress',
    'review',
    'done',
    'blocked',
  ];
  if (!validStatuses.includes(status as UserStoryStatus)) {
    return createTextResult(
      `Error: Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`,
      true
    );
  }

  try {
    // Find the story and verify it belongs to the current project
    const story = await db.query.userStories.findFirst({
      where: eq(userStories.id, storyId),
    });

    if (!story) {
      return createTextResult(`Error: User story with ID ${storyId} not found`, true);
    }

    if (story.projectId !== context.projectId) {
      return createTextResult(
        `Error: User story ${storyId} does not belong to project ${context.projectId}`,
        true
      );
    }

    const oldStatus = story.status;

    // Update the story
    const [updatedStory] = await db
      .update(userStories)
      .set({
        status: status as UserStoryStatus,
        updatedAt: new Date(),
      })
      .where(eq(userStories.id, storyId))
      .returning();

    return createJsonResult({
      success: true,
      story: {
        id: updatedStory.id,
        title: updatedStory.title,
        oldStatus,
        newStatus: updatedStory.status,
        updatedAt: updatedStory.updatedAt,
      },
      notes: notes || undefined,
      message: `User story ${storyId} status updated from "${oldStatus}" to "${status}"`,
    });
  } catch (error) {
    console.error('Error updating user story status:', error);
    return createTextResult(
      `Error updating user story: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
};

export function registerUpdateUserStoryStatus(): void {
  registerTool(definition, handler);
}

export { definition, handler };
