/**
 * SKILL.md Generator
 *
 * Generates a comprehensive SKILL.md file for Claude Code integration.
 * This file provides project context, available MCP tools, and development guidelines.
 */

import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ALL_TOOL_NAMES } from './tools';

interface SkillGeneratorOptions {
  projectId: number;
  baseUrl: string;
}

interface ToolDescription {
  name: string;
  description: string;
  category: 'core' | 'generator' | 'unique';
}

const TOOL_DESCRIPTIONS: ToolDescription[] = [
  // Core tools
  { name: 'get_prd', description: 'Get product requirements document with problem statement, actors, use cases, and scope', category: 'core' },
  { name: 'get_database_schema', description: 'Get database entity definitions, relationships, and constraints', category: 'core' },
  { name: 'get_tech_stack', description: 'Get technology choices with rationale and alternatives considered', category: 'core' },
  { name: 'get_user_stories', description: 'Get user stories with acceptance criteria and priority', category: 'core' },
  { name: 'get_coding_context', description: 'Get coding guidelines, patterns, and conventions', category: 'core' },
  { name: 'get_project_architecture', description: 'Get system architecture overview and component structure', category: 'core' },
  { name: 'get_diagrams', description: 'Get Mermaid diagrams (context, use case, class, sequence)', category: 'core' },
  // Generator tools
  { name: 'get_api_specs', description: 'Generate or retrieve REST API specifications in OpenAPI format', category: 'generator' },
  { name: 'get_infrastructure', description: 'Generate infrastructure specifications for deployment', category: 'generator' },
  { name: 'get_coding_guidelines', description: 'Generate coding guidelines based on tech stack and project type', category: 'generator' },
  { name: 'update_story_status', description: 'Update user story status (todo, in_progress, done, blocked)', category: 'generator' },
  // Unique tools
  { name: 'get_validation_status', description: 'Get PRD-SPEC validation score and gate status', category: 'unique' },
  { name: 'get_gsd_phases', description: 'Get GSD phase information for project planning', category: 'unique' },
  { name: 'get_cleo_tasks', description: 'Get CLEO task management integration data', category: 'unique' },
  { name: 'invoke_agent', description: 'Invoke a specialized agent for specific tasks', category: 'unique' },
  { name: 'ask_question', description: 'Ask a question about the project to get AI-powered answers', category: 'unique' },
  { name: 'search_context', description: 'Search project context for relevant information', category: 'unique' },
];

/**
 * Generate SKILL.md content for a project
 */
export async function generateSkillMd(options: SkillGeneratorOptions): Promise<string> {
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
  // PRD data is stored in separate fields, not a combined 'prd' field
  const actors = data?.actors as Array<{ name: string; role?: string }> | null;
  const useCases = data?.useCases as Array<{ name: string; description?: string }> | null;
  const systemBoundaries = data?.systemBoundaries as { description?: string } | null;
  const techStack = data?.techStack as Record<string, unknown> | null;
  const guidelines = data?.codingGuidelines as Record<string, unknown> | null;

  // Build the SKILL.md content
  const sections: string[] = [];

  // Header
  sections.push(`# ${project.name} - Development Skills`);
  sections.push('');
  sections.push('> Auto-generated SKILL.md for Claude Code integration');
  sections.push(`> Generated: ${new Date().toISOString()}`);
  sections.push('');

  // MCP Server Setup
  sections.push('## MCP Server Setup');
  sections.push('');
  sections.push('Add this project as an MCP server in Claude Code:');
  sections.push('');
  sections.push('```bash');
  sections.push(`claude mcp add ${slugify(project.name)} ${baseUrl}/api/mcp/${projectId} --key YOUR_API_KEY`);
  sections.push('```');
  sections.push('');

  // Project Context
  sections.push('## Project Context');
  sections.push('');
  sections.push(project.vision || 'No project description available.');
  sections.push('');

  if (systemBoundaries?.description) {
    sections.push('### System Boundary');
    sections.push('');
    sections.push(systemBoundaries.description);
    sections.push('');
  }

  if (actors && actors.length > 0) {
    sections.push('### Actors');
    sections.push('');
    actors.forEach(actor => {
      sections.push(`- **${actor.name}**${actor.role ? `: ${actor.role}` : ''}`);
    });
    sections.push('');
  }

  if (useCases && useCases.length > 0) {
    sections.push('### Key Use Cases');
    sections.push('');
    useCases.slice(0, 10).forEach(uc => {
      sections.push(`- **${uc.name}**${uc.description ? `: ${uc.description}` : ''}`);
    });
    sections.push('');
  }

  // Available Tools
  sections.push('## Available MCP Tools');
  sections.push('');
  sections.push('### Core Tools');
  sections.push('');
  TOOL_DESCRIPTIONS.filter(t => t.category === 'core').forEach(tool => {
    sections.push(`- \`${tool.name}\` - ${tool.description}`);
  });
  sections.push('');

  sections.push('### Generator Tools');
  sections.push('');
  TOOL_DESCRIPTIONS.filter(t => t.category === 'generator').forEach(tool => {
    sections.push(`- \`${tool.name}\` - ${tool.description}`);
  });
  sections.push('');

  sections.push('### Unique Tools');
  sections.push('');
  TOOL_DESCRIPTIONS.filter(t => t.category === 'unique').forEach(tool => {
    sections.push(`- \`${tool.name}\` - ${tool.description}`);
  });
  sections.push('');

  // Tech Stack (if available)
  if (techStack) {
    sections.push('## Tech Stack');
    sections.push('');
    const categories = (techStack as { categories?: Array<{ category: string; choice: string; rationale?: string }> }).categories;
    if (categories && Array.isArray(categories)) {
      categories.forEach(cat => {
        sections.push(`### ${cat.category}`);
        sections.push(`**Choice:** ${cat.choice}`);
        if (cat.rationale) {
          sections.push(`**Rationale:** ${cat.rationale}`);
        }
        sections.push('');
      });
    }
  }

  // Coding Guidelines (if available)
  if (guidelines) {
    sections.push('## Development Guidelines');
    sections.push('');

    const namingConventions = (guidelines as { namingConventions?: Array<{ pattern: string; example?: string }> }).namingConventions;
    if (namingConventions && Array.isArray(namingConventions)) {
      sections.push('### Naming Conventions');
      sections.push('');
      namingConventions.forEach(conv => {
        sections.push(`- ${conv.pattern}${conv.example ? ` (e.g., \`${conv.example}\`)` : ''}`);
      });
      sections.push('');
    }

    const patterns = (guidelines as { patterns?: Array<{ name: string; description?: string }> }).patterns;
    if (patterns && Array.isArray(patterns)) {
      sections.push('### Design Patterns');
      sections.push('');
      patterns.forEach(pattern => {
        sections.push(`- **${pattern.name}**${pattern.description ? `: ${pattern.description}` : ''}`);
      });
      sections.push('');
    }
  }

  // Quick Reference
  sections.push('## Quick Reference');
  sections.push('');
  sections.push('### Common Workflows');
  sections.push('');
  sections.push('1. **Get project context:** `get_prd` → understand requirements');
  sections.push('2. **Check data model:** `get_database_schema` → understand entities');
  sections.push('3. **Review architecture:** `get_diagrams` → visual overview');
  sections.push('4. **Start coding:** `get_coding_context` → follow conventions');
  sections.push('5. **Track progress:** `update_story_status` → update user stories');
  sections.push('');

  sections.push('### Validation');
  sections.push('');
  sections.push('Use `get_validation_status` to check PRD-SPEC compliance before major changes.');
  sections.push('');

  // Footer
  sections.push('---');
  sections.push('');
  sections.push(`*Generated by Product Helper MCP Server*`);
  sections.push(`*Project ID: ${projectId}*`);

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

export { TOOL_DESCRIPTIONS };
