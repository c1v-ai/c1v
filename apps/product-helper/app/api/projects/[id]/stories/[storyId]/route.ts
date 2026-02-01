import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects, userStories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Helper to extract storyId from URL path
 */
function extractStoryId(url: string): number | null {
  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split('/');
  const storiesIndex = pathParts.indexOf('stories');
  if (storiesIndex === -1 || storiesIndex + 1 >= pathParts.length) {
    return null;
  }
  const storyIdStr = pathParts[storiesIndex + 1];
  const storyIdNum = parseInt(storyIdStr, 10);
  return isNaN(storyIdNum) ? null : storyIdNum;
}

/**
 * GET /api/projects/[id]/stories/[storyId]
 * Get a single user story
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Extract storyId from URL
    const storyIdNum = extractStoryId(req.url);
    if (storyIdNum === null) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Get the story
    const story = await db.query.userStories.findFirst({
      where: and(
        eq(userStories.id, storyIdNum),
        eq(userStories.projectId, projectId)
      ),
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  }
);

/**
 * PUT /api/projects/[id]/stories/[storyId]
 * Update a user story
 */
export const PUT = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Extract storyId from URL
    const storyIdNum = extractStoryId(req.url);
    if (storyIdNum === null) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Verify story exists
    const existingStory = await db.query.userStories.findFirst({
      where: and(
        eq(userStories.id, storyIdNum),
        eq(userStories.projectId, projectId)
      ),
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      actor,
      epic,
      acceptanceCriteria,
      status,
      priority,
      estimatedEffort,
      order,
      assignee,
      labels,
      blockedBy,
    } = body;

    // Build updates
    const updates: Partial<typeof userStories.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (actor !== undefined) updates.actor = actor;
    if (epic !== undefined) updates.epic = epic;
    if (acceptanceCriteria !== undefined) updates.acceptanceCriteria = acceptanceCriteria;
    if (status !== undefined) {
      const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done', 'blocked'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    if (priority !== undefined) {
      const validPriorities = ['critical', 'high', 'medium', 'low'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority' },
          { status: 400 }
        );
      }
      updates.priority = priority;
    }
    if (estimatedEffort !== undefined) {
      const validEfforts = ['xs', 'small', 'medium', 'large', 'xl'];
      if (!validEfforts.includes(estimatedEffort)) {
        return NextResponse.json(
          { error: 'Invalid effort' },
          { status: 400 }
        );
      }
      updates.estimatedEffort = estimatedEffort;
    }
    if (order !== undefined) updates.order = order;
    if (assignee !== undefined) updates.assignee = assignee;
    if (labels !== undefined) updates.labels = labels;
    if (blockedBy !== undefined) updates.blockedBy = blockedBy;

    const [updatedStory] = await db.update(userStories)
      .set(updates)
      .where(eq(userStories.id, storyIdNum))
      .returning();

    return NextResponse.json(updatedStory);
  }
);

/**
 * DELETE /api/projects/[id]/stories/[storyId]
 * Delete a user story
 */
export const DELETE = withProjectAuth(
  async (req, { team, projectId }) => {
    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Extract storyId from URL
    const storyIdNum = extractStoryId(req.url);
    if (storyIdNum === null) {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Verify story exists
    const existingStory = await db.query.userStories.findFirst({
      where: and(
        eq(userStories.id, storyIdNum),
        eq(userStories.projectId, projectId)
      ),
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Delete the story
    await db.delete(userStories)
      .where(eq(userStories.id, storyIdNum));

    return NextResponse.json({ success: true });
  }
);
