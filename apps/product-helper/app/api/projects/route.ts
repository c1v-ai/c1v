import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, type NewProject, ProjectStatus } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  vision: z.string().min(10, 'Vision must be at least 10 characters').max(5000, 'Vision must be less than 5000 characters'),
  projectType: z.enum(['saas', 'mobile-app', 'marketplace', 'api-service', 'e-commerce', 'internal-tool', 'open-source', 'other']).optional(),
  projectStage: z.enum(['idea', 'prototype', 'mvp', 'growth', 'mature']).optional(),
  userRole: z.enum(['founder', 'product-manager', 'developer', 'designer', 'other']).optional(),
  budget: z.enum(['bootstrap', 'seed', 'series-a', 'enterprise', 'undecided']).optional(),
});

/**
 * GET /api/projects
 * Get all projects for the user's team
 */
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const teamProjects = await db.query.projects.findMany({
      where: eq(projects.teamId, team.id),
      orderBy: [desc(projects.createdAt)],
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        projectData: true,
      },
    });

    return NextResponse.json(teamProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, vision, projectType, projectStage, userRole, budget } = parsed.data;

    // Create project
    const newProject: NewProject = {
      name: name.trim(),
      vision: vision.trim(),
      projectType,
      projectStage,
      userRole,
      budget,
      status: ProjectStatus.INTAKE,
      teamId: team.id,
      createdBy: user.id,
      validationScore: 0,
      validationPassed: 0,
      validationFailed: 0,
    };

    const [project] = await db.insert(projects).values(newProject).returning();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
