/**
 * CLAUDE.md Export Route
 *
 * GET /api/projects/[id]/exports/claude-md
 * Downloads CLAUDE.md for quick project reference
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateClaudeMd } from '@/lib/mcp/claude-md-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Verify user has access to project
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get base URL from request
    const baseUrl = new URL(request.url).origin;

    // Generate CLAUDE.md content
    const content = await generateClaudeMd({ projectId, baseUrl });

    // Return as downloadable file
    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="CLAUDE.md"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating CLAUDE.md:', error);
    return NextResponse.json(
      { error: 'Failed to generate CLAUDE.md' },
      { status: 500 }
    );
  }
}
