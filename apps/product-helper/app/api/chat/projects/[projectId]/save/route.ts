/**
 * Chat Message Save & Extraction Trigger API
 *
 * Purpose: Save assistant responses and trigger data extraction on every message
 * Pattern: Backend Architect - API endpoint with business logic separation
 * Team: Platform Engineering (Agent 1.1: Backend Architect)
 *
 * Flow:
 * 1. Save assistant message to database
 * 2. Trigger extraction agent (incremental - only processes new messages)
 * 3. Update projectData with extracted information
 * 4. Recalculate completeness score
 *
 * Note: Extraction runs on every message since 16-06 (incremental extraction)
 * prevents cost explosion by only processing delta messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { projects, conversations, projectData, type NewConversation } from '@/lib/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { extractProjectData, calculateCompleteness, mergeExtractionData } from '@/lib/langchain/agents/extraction-agent';
import { z } from 'zod';

// Using Node.js runtime because this route uses Drizzle ORM with database operations
export const runtime = 'nodejs';

/**
 * Request schema validation
 */
const saveMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  role: z.enum(['assistant']).default('assistant'),
  tokens: z.number().optional(),
});

/**
 * POST /api/chat/projects/[projectId]/save
 * Save assistant response and optionally trigger extraction
 *
 * Request body:
 * {
 *   content: string,
 *   role: 'assistant',
 *   tokens?: number
 * }
 *
 * Response:
 * {
 *   message: 'Message saved',
 *   messageCount: number,
 *   extracted?: boolean,
 *   completeness?: number
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // 1. Authentication check
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to save messages' },
        { status: 401 }
      );
    }

    // 2. Get team for authorization
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // 3. Parse and validate project ID
    const { projectId: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // 4. Verify project access
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
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // 5. Parse and validate request body
    const body = await req.json();
    const validatedData = saveMessageSchema.parse(body);

    // 6. Estimate tokens if not provided
    const tokens = validatedData.tokens || estimateTokenCount(validatedData.content);

    // 7. Save assistant message to database
    const newMessage: NewConversation = {
      projectId,
      role: 'assistant',
      content: validatedData.content,
      tokens,
    };

    await db.insert(conversations).values(newMessage);

    // 8. Get total message count
    const messageCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(eq(conversations.projectId, projectId));

    const messageCount = Number(messageCountResult[0]?.count || 0);

    // 9. Run incremental extraction on every message
    // Note: Modulo-5 gate removed (16-07). Incremental extraction (16-06) ensures
    // only NEW messages are processed, preventing cost explosion.
    let extractedData = false;
    let newCompleteness = project.projectData?.completeness || 0;

    try {
      // 10. Get last extracted index for incremental extraction
      const lastIndex = project.projectData?.lastExtractedMessageIndex || 0;

      // 11. Load ALL conversation history (ordered by creation time)
      const allHistory = await db.query.conversations.findMany({
        where: eq(conversations.projectId, projectId),
        orderBy: [asc(conversations.createdAt)],
      });

      // 12. Calculate which messages are new vs context
      // Keep last 5 messages before lastIndex as context
      const contextStart = Math.max(0, lastIndex - 5);
      const contextMessages = allHistory.slice(contextStart, lastIndex);
      const newMessages = allHistory.slice(lastIndex);

      // 13. Skip extraction if no new messages
      if (newMessages.length === 0) {
        console.log(`[Extraction] No new messages to extract for project ${projectId}`);
        return NextResponse.json({
          message: 'Message saved successfully',
          messageCount,
          extracted: false,
          completeness: project.projectData?.completeness || 0,
        });
      }

      // 14. Format conversation text with context and new messages marked
      const conversationText = [
        ...(contextMessages.length > 0 ? [
          '## Prior Context (for reference only):',
          ...contextMessages.map((msg) => `${msg.role}: ${msg.content}`),
          '',
        ] : []),
        '## New Messages (extract from these):',
        ...newMessages.map((msg) => `${msg.role}: ${msg.content}`),
      ].join('\n');

      // 15. Run extraction agent (incremental - every message)
      console.log(`[Extraction] Running incremental extraction for project ${projectId} (message ${messageCount}, index ${lastIndex} to ${allHistory.length})`);

      const extraction = await extractProjectData(
        conversationText,
        project.name,
        project.vision
      );

      // 16. Merge with existing data if available
      const existingData = project.projectData;
      const mergedData = existingData
        ? mergeExtractionData(
            {
              actors: (existingData.actors as any) || [],
              useCases: (existingData.useCases as any) || [],
              systemBoundaries: (existingData.systemBoundaries as any) || { internal: [], external: [] },
              dataEntities: (existingData.dataEntities as any) || [],
              problemStatement: (existingData.problemStatement as any) || undefined,
              nonFunctionalRequirements: (existingData.nonFunctionalRequirements as any) || undefined,
            },
            extraction
          )
        : extraction;

      // 17. Calculate new completeness score
      newCompleteness = calculateCompleteness(mergedData);

      // 18. Update projectData table (upsert) with lastExtractedMessageIndex
      if (existingData) {
        // Update existing
        await db
          .update(projectData)
          .set({
            actors: mergedData.actors as any,
            useCases: mergedData.useCases as any,
            systemBoundaries: mergedData.systemBoundaries as any,
            dataEntities: mergedData.dataEntities as any,
            problemStatement: mergedData.problemStatement as any,
            nonFunctionalRequirements: mergedData.nonFunctionalRequirements as any,
            completeness: newCompleteness,
            lastExtractedAt: new Date(),
            lastExtractedMessageIndex: allHistory.length,
            updatedAt: new Date(),
          })
          .where(eq(projectData.projectId, projectId));
      } else {
        // Insert new
        await db.insert(projectData).values({
          projectId,
          actors: mergedData.actors as any,
          useCases: mergedData.useCases as any,
          systemBoundaries: mergedData.systemBoundaries as any,
          dataEntities: mergedData.dataEntities as any,
          problemStatement: mergedData.problemStatement as any,
          nonFunctionalRequirements: mergedData.nonFunctionalRequirements as any,
          completeness: newCompleteness,
          lastExtractedAt: new Date(),
          lastExtractedMessageIndex: allHistory.length,
        });
      }

      extractedData = true;

      console.log(`[Extraction] Complete for project ${projectId}: ${newCompleteness}% completeness`);
    } catch (extractionError) {
      console.error('[Extraction] Error:', extractionError);
      // Don't fail the entire request if extraction fails
      // Just log and continue
    }

    // 19. Return success response
    return NextResponse.json({
      message: 'Message saved successfully',
      messageCount,
      extracted: extractedData,
      completeness: newCompleteness,
    });
  } catch (error) {
    console.error('Save message API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Simple token estimation (rough approximation)
 * GPT models use ~4 characters per token on average
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
