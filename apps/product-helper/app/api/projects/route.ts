import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, type NewProject, ProjectStatus } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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
    const { name, vision } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!vision || typeof vision !== 'string' || vision.trim().length < 10) {
      return NextResponse.json(
        { error: 'Vision must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Name must be less than 255 characters' },
        { status: 400 }
      );
    }

    if (vision.length > 5000) {
      return NextResponse.json(
        { error: 'Vision must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Create project
    const newProject: NewProject = {
      name: name.trim(),
      vision: vision.trim(),
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
