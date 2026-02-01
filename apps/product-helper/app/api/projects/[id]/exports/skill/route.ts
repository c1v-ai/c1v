/**
 * SKILL.md Export Route
 *
 * GET /api/projects/[id]/exports/skill
 * Downloads SKILL.md for Claude Code integration
 */

import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateSkillMd } from '@/lib/mcp/skill-generator';

export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.teamId, team.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get base URL from request
    const baseUrl = new URL(req.url).origin;

    // Generate SKILL.md content
    const content = await generateSkillMd({ projectId, baseUrl });

    // Return as downloadable file
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="SKILL.md"`,
        'Cache-Control': 'no-cache',
      },
    });
  }
);
