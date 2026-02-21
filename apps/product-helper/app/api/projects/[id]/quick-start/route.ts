import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withProjectAuth } from '@/lib/api/with-project-auth';
import { checkAndDeductCredits } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  runQuickStartPipeline,
  type QuickStartStep,
  type StepStatus,
} from '@/lib/langchain/quick-start/orchestrator';
import { checkAndDeductCredits } from '@/lib/db/queries';

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
export const POST = withProjectAuth(
  async (req, { user, team, projectId }) => {
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

    // Credit check — before any AI generation
    const creditResult = await checkAndDeductCredits(team.id, 1250);
    if (!creditResult.allowed) {
      return NextResponse.json(
        { error: 'credit_limit_reached', creditsUsed: creditResult.creditsUsed, creditLimit: creditResult.creditLimit },
        { status: 402 }
      );
    }

    // Validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

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

    // Credit gate: Quick Start costs 1250 credits
    const creditResult = await checkAndDeductCredits(team.id, 1250);
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

    // Create SSE stream
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

    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
);
