import { NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  generateMarkdownExport,
  generateExportFilename,
} from '@/lib/export/markdown';

/**
 * GET /api/projects/[id]/export
 * Generate and download a Markdown PRD document for a project
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Fetch project with data, verifying it belongs to the user's team
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

    // Generate the Markdown document
    const markdown = generateMarkdownExport({
      project,
      projectData: project.projectData,
    });

    // Generate filename
    const filename = generateExportFilename(project.name);

    // Return the file with proper headers for download
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
);
