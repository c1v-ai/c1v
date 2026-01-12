'use server';

import { db } from '@/lib/db/drizzle';
import { conversations, projects, type NewConversation } from '@/lib/db/schema';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { eq, and, asc } from 'drizzle-orm';

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
