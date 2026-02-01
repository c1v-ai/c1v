import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, userStories, projectData } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { generateUserStories, prepareStoriesForInsert, type UserStoriesContext } from '@/lib/langchain/agents/user-stories-agent';

/**
 * GET /api/projects/[id]/stories
 * Get all user stories for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

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

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const epic = searchParams.get('epic');
    const sortBy = searchParams.get('sortBy') || 'order';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    let query = db.select()
      .from(userStories)
      .where(eq(userStories.projectId, projectId));

    // Fetch all and filter in memory (Drizzle limitation with dynamic where)
    const allStories = await query;

    let filteredStories = allStories;

    if (status) {
      filteredStories = filteredStories.filter(s => s.status === status);
    }

    if (epic) {
      filteredStories = filteredStories.filter(s => s.epic === epic);
    }

    // Sort
    filteredStories.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] || 0;
      const bVal = b[sortBy as keyof typeof b] || 0;
      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : 1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Get unique epics for filtering UI
    const epics = [...new Set(allStories.map(s => s.epic).filter(Boolean))];

    return NextResponse.json({
      projectId,
      stories: filteredStories,
      total: filteredStories.length,
      epics,
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/stories
 * Generate user stories from use cases or create a single story
 *
 * Request body options:
 * 1. Generate from use cases: { generate: true }
 * 2. Create single story: { title, description, actor, ... }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to team
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
      with: {
        projectData: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Option 1: Generate stories from use cases
    if (body.generate === true) {
      const data = project.projectData;
      if (!data) {
        return NextResponse.json(
          { error: 'No project data available for story generation' },
          { status: 400 }
        );
      }

      const useCases = (data.useCases as Array<{
        id: string;
        name: string;
        description: string;
        actor: string;
        trigger?: string;
        outcome?: string;
        preconditions?: string[];
        postconditions?: string[];
        priority?: 'must' | 'should' | 'could' | 'wont';
      }>) || [];

      const actors = (data.actors as Array<{
        name: string;
        role: string;
        description?: string;
      }>) || [];

      if (useCases.length === 0) {
        return NextResponse.json(
          { error: 'No use cases available for story generation' },
          { status: 400 }
        );
      }

      const context: UserStoriesContext = {
        projectName: project.name,
        projectVision: project.vision,
        useCases,
        actors,
      };

      // Generate stories
      const generatedStories = await generateUserStories(context);

      if (generatedStories.length === 0) {
        return NextResponse.json(
          { error: 'No stories generated from use cases' },
          { status: 500 }
        );
      }

      // Get current max order
      const existingStories = await db.select()
        .from(userStories)
        .where(eq(userStories.projectId, projectId));

      const maxOrder = existingStories.reduce((max, s) => Math.max(max, s.order), -1);

      // Prepare stories for insert
      const storiesToInsert = prepareStoriesForInsert(projectId, generatedStories)
        .map((s, i) => ({ ...s, order: maxOrder + 1 + i }));

      // Insert stories
      const insertedStories = await db.insert(userStories)
        .values(storiesToInsert)
        .returning();

      return NextResponse.json({
        projectId,
        generated: true,
        count: insertedStories.length,
        stories: insertedStories,
      });
    }

    // Option 2: Create single story
    const { title, description, actor, epic, acceptanceCriteria, status, priority, estimatedEffort, useCaseId } = body;

    if (!title || !description || !actor) {
      return NextResponse.json(
        { error: 'Title, description, and actor are required' },
        { status: 400 }
      );
    }

    // Get next order
    const existingStories = await db.select()
      .from(userStories)
      .where(eq(userStories.projectId, projectId));

    const maxOrder = existingStories.reduce((max, s) => Math.max(max, s.order), -1);

    const [newStory] = await db.insert(userStories)
      .values({
        projectId,
        useCaseId: useCaseId || null,
        title,
        description,
        actor,
        epic: epic || null,
        acceptanceCriteria: acceptanceCriteria || [],
        status: status || 'backlog',
        priority: priority || 'medium',
        estimatedEffort: estimatedEffort || 'medium',
        order: maxOrder + 1,
      })
      .returning();

    return NextResponse.json({
      projectId,
      story: newStory,
    });
  } catch (error) {
    console.error('Error creating stories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
