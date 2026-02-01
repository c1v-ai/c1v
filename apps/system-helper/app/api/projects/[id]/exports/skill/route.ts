/**
 * SKILL.md Export Route
 *
 * GET /api/projects/[id]/exports/skill
 * Downloads SKILL.md for Claude Code integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateSkillMd } from '@/lib/mcp/skill-generator';

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

    // Generate SKILL.md content
    const content = await generateSkillMd({ projectId, baseUrl });

    // Return as downloadable file
    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="SKILL.md"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating SKILL.md:', error);
    return NextResponse.json(
      { error: 'Failed to generate SKILL.md' },
      { status: 500 }
    );
  }
}
