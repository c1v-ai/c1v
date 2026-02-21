import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { db } from '@/lib/db/drizzle';
import { projects, projectData } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  generateAPISpecification,
  validateAPISpecification,
} from '@/lib/langchain/agents/api-spec-agent';
import {
  exportToOpenAPIYAML,
  convertToOpenAPI,
} from '@/lib/langchain/agents/api-spec-openapi-export';
import type {
  APISpecification,
  APISpecGenerationContext,
} from '@/lib/types/api-specification';
import { checkAndDeductCredits } from '@/lib/db/queries';

/**
 * GET /api/projects/[id]/api-spec
 * Get the existing API specification for a project
 *
 * Query params:
 * - format: 'json' | 'openapi' | 'openapi-yaml' (default: 'json')
 */
export const GET = withProjectAuth(
  async (req, { team, projectId }) => {
    // Fetch project with projectData
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

    // Check if API spec exists
    const apiSpec = project.projectData?.apiSpecification as APISpecification | null;

    if (!apiSpec) {
      return NextResponse.json(
        { error: 'No API specification found. Generate one using POST.' },
        { status: 404 }
      );
    }

    // Check format query param
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    if (format === 'openapi' || format === 'openapi-json') {
      // Return OpenAPI 3.0 JSON
      const openAPIDoc = convertToOpenAPI(apiSpec, project.name, project.vision);
      return NextResponse.json(openAPIDoc, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (format === 'openapi-yaml') {
      // Return OpenAPI 3.0 YAML
      const yamlString = exportToOpenAPIYAML(apiSpec, project.name, project.vision);
      return new NextResponse(yamlString, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Content-Disposition': `attachment; filename="${project.name.toLowerCase().replace(/\s+/g, '-')}-api-spec.yaml"`,
        },
      });
    }

    // Default: return raw API specification
    return NextResponse.json({
      projectId,
      apiSpecification: apiSpec,
      format: 'json',
    });
  }
);

/**
 * POST /api/projects/[id]/api-spec
 * Generate a new API specification from project data
 *
 * Query params:
 * - format: 'json' | 'openapi' | 'openapi-yaml' (default: 'json')
 *
 * The generated spec is saved to project_data.api_specification
 */
export const POST = withProjectAuth(
  async (req, { team, projectId }) => {
    // Fetch project with projectData
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

    // Get project data for generation context
    const data = project.projectData;
    if (!data) {
      return NextResponse.json(
        { error: 'No project data available. Complete the intake process first.' },
        { status: 400 }
      );
    }

    // Credit gate: API spec generation costs 100 credits
    const creditResult = await checkAndDeductCredits(team.id, 100);
    if (!creditResult.allowed) {
      return NextResponse.json(
        {
          error: 'Credit limit reached',
          creditsUsed: creditResult.creditsUsed,
          creditLimit: creditResult.creditLimit,
        },
        { status: 402 }
      );
    }

    // Extract use cases (required for API generation)
    const useCases = (data.useCases as Array<{
      id: string;
      name: string;
      description: string;
      actor: string;
      preconditions?: string[];
      postconditions?: string[];
    }>) || [];

    if (useCases.length === 0) {
      return NextResponse.json(
        { error: 'No use cases available. Add use cases before generating API specification.' },
        { status: 400 }
      );
    }

    // Extract data entities (required for schema generation)
    const dataEntities = (data.dataEntities as Array<{
      name: string;
      attributes: string[];
      relationships: string[];
    }>) || [];

    if (dataEntities.length === 0) {
      return NextResponse.json(
        { error: 'No data entities available. Add data entities before generating API specification.' },
        { status: 400 }
      );
    }

    // Extract tech stack context if available
    const techStack = data.techStack as {
      backend?: string;
      database?: string;
      auth?: string;
    } | null;

    // Build generation context
    const context: APISpecGenerationContext = {
      projectName: project.name,
      projectVision: project.vision,
      useCases,
      dataEntities,
      techStack: techStack ? {
        backend: techStack.backend,
        database: techStack.database,
        auth: techStack.auth,
      } : undefined,
    };

    // Generate API specification
    const apiSpec = await generateAPISpecification(context);

    // Validate the generated spec
    const validation = validateAPISpecification(apiSpec);
    if (!validation.valid) {
      console.warn('Generated API spec has validation issues:', validation.errors);
      // Continue anyway - the spec is still usable
    }

    // Add project ID to metadata
    if (apiSpec.metadata) {
      apiSpec.metadata.projectId = projectId;
    }

    // Save to database
    await db
      .update(projectData)
      .set({
        apiSpecification: apiSpec,
        updatedAt: new Date(),
      })
      .where(eq(projectData.projectId, projectId));

    // Check format query param for response
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    if (format === 'openapi' || format === 'openapi-json') {
      const openAPIDoc = convertToOpenAPI(apiSpec, project.name, project.vision);
      return NextResponse.json({
        projectId,
        generated: true,
        validationErrors: validation.errors,
        openapi: openAPIDoc,
      });
    }

    if (format === 'openapi-yaml') {
      const yamlString = exportToOpenAPIYAML(apiSpec, project.name, project.vision);
      return NextResponse.json({
        projectId,
        generated: true,
        validationErrors: validation.errors,
        openapi: yamlString,
        format: 'yaml',
      });
    }

    // Default: return the raw API specification
    return NextResponse.json({
      projectId,
      generated: true,
      validationErrors: validation.errors,
      apiSpecification: apiSpec,
    });
  }
);
