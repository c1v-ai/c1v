'use server';

import { db } from '@/lib/db/drizzle';
import { conversations, projects, projectData, artifacts, type NewConversation, type NewArtifact } from '@/lib/db/schema';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { eq, and, asc, sql } from 'drizzle-orm';
import { extractProjectData, calculateCompleteness, mergeExtractionData } from '@/lib/langchain/agents/extraction-agent';

/**
 * Extract mermaid code blocks from content
 */
function extractMermaidBlocks(content: string): string[] {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = mermaidRegex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Detect diagram type from mermaid syntax
 */
function detectDiagramType(syntax: string): string {
  const firstLine = syntax.trim().split('\n')[0].toLowerCase();
  if (firstLine.includes('classdiagram')) return 'class_diagram';
  if (firstLine.includes('sequencediagram')) return 'sequence_diagram';
  if (firstLine.includes('graph lr') || firstLine.includes('usecase')) return 'use_case_diagram';
  if (firstLine.includes('flowchart') || firstLine.includes('statediagram')) return 'activity_diagram';
  return 'context_diagram'; // Default for graph TD, etc.
}

/**
 * Save AI assistant message to conversations table
 */
export async function saveAssistantMessage(
  projectId: number,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const team = await getTeamForUser();
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return { success: false, error: 'Project not found or access denied' };
    }

    // Save AI message
    const newMessage: NewConversation = {
      projectId,
      role: 'assistant',
      content,
      tokens: estimateTokenCount(content),
    };

    await db.insert(conversations).values(newMessage);

    // Extract and save any mermaid diagrams from the message
    const mermaidBlocks = extractMermaidBlocks(content);
    if (mermaidBlocks.length > 0) {
      console.log(`[Diagrams] Found ${mermaidBlocks.length} mermaid diagram(s) in message`);
      for (const mermaidSyntax of mermaidBlocks) {
        const diagramType = detectDiagramType(mermaidSyntax);
        const newArtifact: NewArtifact = {
          projectId,
          type: diagramType,
          content: { mermaid: mermaidSyntax },
          status: 'draft',
        };
        await db.insert(artifacts).values(newArtifact);
        console.log(`[Diagrams] Saved ${diagramType} diagram to artifacts`);
      }
    }

    // Check if we should trigger extraction (every 5 messages)
    const messageCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(eq(conversations.projectId, projectId));

    const messageCount = Number(messageCountResult[0]?.count || 0);
    const EXTRACTION_INTERVAL = 5;
    const shouldExtract = messageCount % EXTRACTION_INTERVAL === 0;

    if (shouldExtract) {
      try {
        // Load conversation history for extraction
        const history = await db.query.conversations.findMany({
          where: eq(conversations.projectId, projectId),
          orderBy: [asc(conversations.createdAt)],
        });

        // Format conversation history
        const conversationText = history
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join('\n');

        // Run extraction agent
        console.log(`[Extraction] Triggering for project ${projectId} (${messageCount} messages)`);

        const extraction = await extractProjectData(
          conversationText,
          project.name,
          project.vision
        );

        // Load existing data for merging
        const existingData = await db.query.projectData.findFirst({
          where: eq(projectData.projectId, projectId),
        });

        // Merge with existing data
        const mergedData = existingData
          ? mergeExtractionData(
              {
                actors: (existingData.actors as any) || [],
                useCases: (existingData.useCases as any) || [],
                systemBoundaries: (existingData.systemBoundaries as any) || { internal: [], external: [] },
                dataEntities: (existingData.dataEntities as any) || [],
              },
              extraction
            )
          : extraction;

        // Calculate completeness
        const newCompleteness = calculateCompleteness(mergedData);

        // Upsert projectData
        if (existingData) {
          await db
            .update(projectData)
            .set({
              actors: mergedData.actors as any,
              useCases: mergedData.useCases as any,
              systemBoundaries: mergedData.systemBoundaries as any,
              dataEntities: mergedData.dataEntities as any,
              completeness: newCompleteness,
              lastExtractedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(projectData.projectId, projectId));
        } else {
          await db.insert(projectData).values({
            projectId,
            actors: mergedData.actors as any,
            useCases: mergedData.useCases as any,
            systemBoundaries: mergedData.systemBoundaries as any,
            dataEntities: mergedData.dataEntities as any,
            completeness: newCompleteness,
            lastExtractedAt: new Date(),
          });
        }

        console.log(`[Extraction] Complete for project ${projectId}: ${newCompleteness}% completeness`);
      } catch (extractionError) {
        console.error('[Extraction] Error:', extractionError);
        // Don't fail the entire request if extraction fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving assistant message:', error);
    return { success: false, error: 'Failed to save message' };
  }
}

/**
 * Get conversation history for a project
 */
export async function getConversations(projectId: number) {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const team = await getTeamForUser();
    if (!team) {
      return [];
    }

    // Verify project ownership
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return [];
    }

    // Load conversations
    const convos = await db.query.conversations.findMany({
      where: eq(conversations.projectId, projectId),
      orderBy: [asc(conversations.createdAt)],
    });

    return convos;
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Simple token estimation (rough approximation)
 * GPT models use ~4 characters per token on average
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
