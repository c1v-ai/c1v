import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { streamingLLM } from '@/lib/langchain/config';
import { intakePrompt } from '@/lib/langchain/prompts';
import { db } from '@/lib/db/drizzle';
import { projects, conversations, type NewConversation } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

/**
 * Project Chat API Endpoint
 * Authenticated streaming chat with project context
 * Uses intakePrompt for conversational requirements gathering
 */

export const runtime = 'edge';

/**
 * POST /api/chat/projects/[projectId]
 * Stream chat responses with project context
 *
 * Request body:
 * {
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>
 * }
 *
 * Response: Streaming text via Server-Sent Events
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Authentication check
    const user = await getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Please sign in to use chat' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get team for authorization
    const team = await getTeamForUser();
    if (!team) {
      return new Response(
        JSON.stringify({ error: 'Team not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse project ID
    const { projectId: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid project ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Load project with data
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
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'No messages provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    // Load conversation history from database
    const dbConversations = await db.query.conversations.findMany({
      where: eq(conversations.projectId, projectId),
      orderBy: [asc(conversations.createdAt)],
      limit: 50, // Last 50 messages
    });

    // Format conversation history for prompt
    const history = dbConversations
      .map((conv) => `${conv.role === 'user' ? 'User' : 'Assistant'}: ${conv.content}`)
      .join('\n');

    // Get completeness score
    const completeness = project.projectData?.completeness || 0;

    // Determine focus area based on completeness
    let focusArea = 'Focus on DATA ENTITIES and relationships.';
    if (completeness < 25) {
      focusArea = 'Focus on identifying PRIMARY ACTORS and their roles.';
    } else if (completeness < 50) {
      focusArea = 'Focus on main USE CASES for each actor.';
    } else if (completeness < 75) {
      focusArea = 'Focus on SYSTEM BOUNDARIES and external integrations.';
    }

    // Create simplified prompt without ICU MessageFormat syntax
    const promptText = `You are a Product Requirements Document (PRD) assistant helping a product manager define their product.

## Context
Project Name: ${project.name}
Vision Statement: ${project.vision}
Current Completeness: ${completeness}%

## Your Goal
Extract the following information through conversational questions:
1. **Actors**: Users, systems, external entities (need at least 2)
2. **Use Cases**: What users can do (need at least 3)
3. **System Boundaries**: What's in scope vs out of scope
4. **Data Entities**: Objects and their relationships

## Conversation Guidelines
- Ask ONE question at a time
- Be conversational and friendly
- Build on previous answers
- Ask clarifying follow-ups
- Don't ask about information already provided

## Priority Based on Completeness
${focusArea}

## Conversation History
${history || 'No previous conversation'}

## User's Last Message
${lastMessage.content}

## Your Response
Ask a single, focused question to move the conversation forward. Be specific and reference the project context.`;

    // Create chain: streamingLLM -> output parser
    const chain = streamingLLM.pipe(new HttpResponseOutputParser());

    // Save user message to database (before streaming response)
    const newUserMessage: NewConversation = {
      projectId,
      role: 'user',
      content: lastMessage.content,
      tokens: estimateTokenCount(lastMessage.content),
    };

    await db.insert(conversations).values(newUserMessage);

    // Stream the response with the formatted prompt
    const stream = await chain.stream(promptText);

    // Note: We'll save the AI response in a separate mechanism
    // For now, the client will need to make a follow-up request to save it
    // Or we implement a callback in the streaming response

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Project chat API error:', error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/chat/projects/[projectId]
 * Health check and project info
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return new Response(
        JSON.stringify({ error: 'Team not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { projectId: projectIdStr } = await params;
    const projectId = parseInt(projectIdStr, 10);

    if (isNaN(projectId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid project ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.teamId, team.id)
      ),
    });

    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Project chat API is running',
        project: {
          id: project.id,
          name: project.name,
        },
        endpoint: `/api/chat/projects/${projectId}`,
        methods: ['POST'],
        authentication: 'required'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Project chat health check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
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
