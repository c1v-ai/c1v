import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  runQuickStartPipeline,
  type QuickStartStep,
  type StepStatus,
} from '@/lib/langchain/quick-start/orchestrator';

/**
 * Allow long-running generation (up to 2 minutes)
 * Required for Vercel serverless function timeout
 */
export const maxDuration = 120;

/**
 * Input validation schema
 */
const quickStartInputSchema = z.object({
  userInput: z
    .string()
    .min(10, 'Project description must be at least 10 characters')
    .max(500, 'Project description must be at most 500 characters'),
});

/**
 * POST /api/projects/[id]/quick-start
 *
 * Run the Quick Start pipeline for a project.
 * Returns an SSE stream with progress events and a final result.
 *
 * Request body:
 * {
 *   "userInput": "An e-commerce platform for handmade crafts with seller storefronts"
 * }
 *
 * SSE Events:
 * - Progress: data: {"step":"synthesis","status":"running","message":"Analyzing..."}
 * - Error:    data: {"step":"db-schema","status":"error","message":"Schema generation failed..."}
 * - Complete: data: {"step":"complete","status":"complete","prdUrl":"/projects/123","completeness":85,"stats":{...}}
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
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

    // 2. Parse and validate project ID
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // 3. Verify project exists and belongs to team
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

    // 4. Validate input
    const body = await request.json();
    const parseResult = quickStartInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { userInput } = parseResult.data;

    // 5. Create SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        /**
         * Send an SSE event to the client
         */
        function sendEvent(data: Record<string, unknown>) {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }

        /**
         * Progress callback for the pipeline
         */
        function onProgress(
          step: QuickStartStep,
          status: StepStatus,
          message: string,
        ) {
          sendEvent({ step, status, message });
        }

        try {
          // Run the full pipeline
          const result = await runQuickStartPipeline({
            projectId,
            teamId: team.id,
            userId: user.id,
            userInput,
            onProgress,
          });

          // Send final completion event
          sendEvent({
            step: 'complete',
            status: 'complete',
            prdUrl: `/projects/${projectId}`,
            projectName: result.projectName,
            completeness: result.completeness,
            validationScore: result.validationScore,
            suggestGuidedMode: result.suggestGuidedMode,
            validationWarnings: result.validationWarnings,
            stats: result.stats,
            generatedArtifacts: result.generatedArtifacts,
            assumptions: result.assumptions,
          });
        } catch (error) {
          console.error('Quick Start pipeline error:', error);
          const errorMessage = error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

          sendEvent({
            step: 'complete',
            status: 'error',
            message: `Pipeline failed: ${errorMessage}`,
          });
        } finally {
          controller.close();
        }
      },
    });

    // 6. Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    // Handle errors that occur before stream creation
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.error('Quick Start route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
