/**
 * CLAUDE.md Generator
 *
 * Generates a concise CLAUDE.md file for quick project reference.
 * Shorter than SKILL.md, focused on essential context for coding.
 */

import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ClaudeMdGeneratorOptions {
  projectId: number;
  baseUrl: string;
}

/**
 * Generate CLAUDE.md content for a project
 */
export async function generateClaudeMd(options: ClaudeMdGeneratorOptions): Promise<string> {
  const { projectId, baseUrl } = options;

  // Fetch project data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      projectData: true,
    },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const data = project.projectData;
  // PRD data is stored in separate fields
  const actors = data?.actors as Array<{ name: string; role?: string }> | null;
  const techStack = data?.techStack as Record<string, unknown> | null;
  const dbSchema = data?.databaseSchema as Record<string, unknown> | null;
  const guidelines = data?.codingGuidelines as Record<string, unknown> | null;

  // Build the CLAUDE.md content
  const sections: string[] = [];

  // Header
  sections.push(`# ${project.name}`);
  sections.push('');

  // Project summary
  sections.push('## Project Overview');
  sections.push('');
  sections.push(project.vision || 'No project description available.');
  sections.push('');

  // MCP Integration
  sections.push('## MCP Integration');
  sections.push('');
  sections.push('```bash');
  sections.push(`claude mcp add ${slugify(project.name)} ${baseUrl}/api/mcp/${projectId} --key YOUR_API_KEY`);
  sections.push('```');
  sections.push('');
  sections.push('Use `get_prd`, `get_database_schema`, `get_tech_stack`, and `get_coding_context` for project context.');
  sections.push('');

  // Tech Stack summary
  if (techStack) {
    const categories = (techStack as { categories?: Array<{ category: string; choice: string }> }).categories;
    if (categories && Array.isArray(categories) && categories.length > 0) {
      sections.push('## Tech Stack');
      sections.push('');
      const keyTech = categories.slice(0, 6).map(c => `**${c.category}:** ${c.choice}`);
      sections.push(keyTech.join(' | '));
      sections.push('');
    }
  }

  // Key Entities
  if (dbSchema) {
    const entities = (dbSchema as { entities?: Array<{ name: string; description?: string }> }).entities;
    if (entities && Array.isArray(entities) && entities.length > 0) {
      sections.push('## Key Entities');
      sections.push('');
      entities.slice(0, 8).forEach(entity => {
        sections.push(`- **${entity.name}**${entity.description ? `: ${entity.description}` : ''}`);
      });
      sections.push('');
    }
  }

  // Key Actors
  if (actors && Array.isArray(actors) && actors.length > 0) {
    sections.push('## Actors');
    sections.push('');
    actors.forEach(actor => {
      sections.push(`- **${actor.name}**${actor.role ? `: ${actor.role}` : ''}`);
    });
    sections.push('');
  }

  // Coding Conventions (brief)
  if (guidelines) {
    const conventions = (guidelines as { namingConventions?: Array<{ pattern: string }> }).namingConventions;
    if (conventions && Array.isArray(conventions) && conventions.length > 0) {
      sections.push('## Coding Conventions');
      sections.push('');
      conventions.slice(0, 5).forEach(conv => {
        sections.push(`- ${conv.pattern}`);
      });
      sections.push('');
    }
  }

  // Project Status
  sections.push('## Project Status');
  sections.push('');
  sections.push(`- **Status:** ${formatStatus(project.status)}`);
  sections.push(`- **Validation Score:** ${project.validationScore || 0}%`);
  sections.push(`- **Completeness:** ${data?.completeness || 0}%`);
  sections.push('');

  // Footer
  sections.push('---');
  sections.push(`*Auto-generated from Product Helper | Project ID: ${projectId}*`);

  return sections.join('\n');
}

/**
 * Convert project name to URL-safe slug
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Format project status for display
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    intake: 'Intake',
    in_progress: 'In Progress',
    validation: 'Validation',
    completed: 'Completed',
    archived: 'Archived',
  };
  return statusMap[status] || status;
}
