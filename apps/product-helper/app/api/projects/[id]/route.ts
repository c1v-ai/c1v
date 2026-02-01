import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/projects/[id]
 * Get a single project by ID with all related data
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        projectData: true,
        artifacts: true,
        conversations: {
          orderBy: (conversations, { asc }) => [asc(conversations.createdAt)],
          limit: 50,
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  }
);

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export const PUT = withProjectAuth(
  async (req, { projectId, project }) => {
    const body = await req.json();
    const { name, vision, status } = body;

    // Validation
    const updates: Partial<typeof projects.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name is required' },
          { status: 400 }
        );
      }
      if (name.length > 255) {
        return NextResponse.json(
          { error: 'Name must be less than 255 characters' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (vision !== undefined) {
      if (typeof vision !== 'string' || vision.trim().length < 10) {
        return NextResponse.json(
          { error: 'Vision must be at least 10 characters' },
          { status: 400 }
        );
      }
      if (vision.length > 5000) {
        return NextResponse.json(
          { error: 'Vision must be less than 5000 characters' },
          { status: 400 }
        );
      }
      updates.vision = vision.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['intake', 'in_progress', 'validation', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // Update project
    const [updatedProject] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json(updatedProject);
  },
  { withProject: true }
);

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export const DELETE = withProjectAuth(
  async (req, { projectId, project }) => {
    // Delete project (cascade will handle related data)
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  },
  { withProject: true }
);
