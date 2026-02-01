import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { streamingLLM } from '@/lib/langchain/config';
import { db } from '@/lib/db/drizzle';
import { projects, conversations, artifacts, type NewConversation, type NewArtifact } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { cleanSequenceDiagramSyntax } from '@/lib/diagrams/generators';
import {
  processWithLangGraph,
  streamWithLangGraph,
  isLangGraphEnabled,
  type ProjectContext,
} from './langgraph-handler';
import { buildPromptEducationBlock } from '@/lib/education/phase-mapping';
import type { ArtifactPhase } from '@/lib/langchain/graphs/types';
import type { SystemBoundaries, Actor, UseCase, DataEntity } from '@/lib/langchain/schemas';
import { checkRateLimit } from '@/lib/mcp/rate-limit';

/**
 * Project Chat API Endpoint
 *
 * Authenticated streaming chat with project context.
 * Supports two modes controlled by USE_LANGGRAPH environment variable:
 *
 * 1. LangGraph Mode (USE_LANGGRAPH=true):
 *    - Uses LangGraph state machine for multi-agent orchestration
 *    - Supports conversation checkpointing and resumption
 *    - Automatic data extraction and project data updates
 *    - Full PRD-SPEC pipeline integration
 *
 * 2. Legacy Mode (USE_LANGGRAPH=false or unset):
 *    - Uses simple LangChain chain with prompt-based approach
 *    - Manual extraction trigger via /save endpoint
 *
 * @see langgraph-handler.ts for LangGraph implementation
 * @see PLAN_API_INTEGRATION.md for architecture details
 */

// Using Node.js runtime because this route uses Drizzle ORM with database operations
export const runtime = 'nodejs';

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

    // Rate limit check: 100 requests per minute per user (uses shared rate-limit config)
    const rateLimitKey = `chat-user-${user.id}`;
    const rateLimitResult = checkRateLimit(rateLimitKey);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limited',
          message: 'Too many requests. Please wait a moment before sending another message.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          }
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

    // ============================================================
    // Feature Flag: Use LangGraph State Machine
    // ============================================================
    if (isLangGraphEnabled()) {
      // Prepare project context for LangGraph
      const projectContext: ProjectContext = {
        id: projectId,
        name: project.name,
        vision: project.vision,
        teamId: team.id,
        projectData: project.projectData
          ? {
              actors: project.projectData.actors,
              useCases: project.projectData.useCases,
              systemBoundaries: project.projectData.systemBoundaries,
              dataEntities: project.projectData.dataEntities,
              completeness: project.projectData.completeness ?? 0,
            }
          : null,
      };

      // Check if streaming is requested (default: yes for chat)
      const useStreaming = req.headers.get('Accept')?.includes('text/event-stream') !== false;

      if (useStreaming) {
        // Return streaming response using LangGraph
        const stream = await streamWithLangGraph(projectContext, lastMessage.content);
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
          },
        });
      } else {
        // Return non-streaming response
        const result = await processWithLangGraph(projectContext, lastMessage.content);

        if (result.error) {
          return new Response(
            JSON.stringify({ error: 'Processing Error', message: result.error }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(result.response, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    // ============================================================
    // Legacy Implementation (USE_LANGGRAPH=false or unset)
    // ============================================================

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

    // Get completeness score and extracted data
    const completeness = project.projectData?.completeness || 0;
    const projectData = project.projectData;

    // Parse extracted data from projectData
    const extractedActors = formatExtractedList(projectData?.actors);
    const extractedUseCases = formatExtractedList(projectData?.useCases);
    const extractedExternalSystems = formatExtractedList(projectData?.systemBoundaries, 'external');
    const extractedInScope = formatExtractedList(projectData?.systemBoundaries, 'internal');
    const extractedOutOfScope = projectData?.systemBoundaries
      ? (parseJsonField<SystemBoundaries>(projectData.systemBoundaries)?.outOfScope || []).join(', ') || 'None yet'
      : 'None yet';

    // Determine current artifact based on completeness
    let currentArtifact = 'context_diagram';
    if (completeness >= 30) currentArtifact = 'use_case_diagram';
    if (completeness >= 50) currentArtifact = 'scope_tree';
    if (completeness >= 65) currentArtifact = 'ucbd';
    if (completeness >= 80) currentArtifact = 'requirements_table';
    if (completeness >= 90) currentArtifact = 'constants_table';
    if (completeness >= 95) currentArtifact = 'sysml_activity_diagram';

    // Build the PRD-SPEC aware prompt
    const promptText = `You are a PRD assistant. Your job: collect MINIMUM data needed to generate artifacts, then GENERATE them.

## Project Context
Name: ${project.name}
Vision: ${project.vision}
Completeness: ${completeness}%
Current Artifact: ${currentArtifact}

## CRITICAL RULES

### Rule 1: STOP TRIGGERS
If user says ANY of: "nope", "no", "that's enough", "that's it", "done", "move on", "let's see"
→ DO NOT ask another question
→ Say "Got it, generating your ${currentArtifact.replace('_', ' ')}..." and produce the Mermaid diagram

### Rule 2: GENERATE WHEN READY
For Context Diagram, you need:
- System name (have it: ${project.name})
- At least 1 actor
- At least 1 external system OR explicit "none"

Once you have these → GENERATE THE DIAGRAM immediately. Don't keep asking.

### Rule 3: ONE QUESTION MAX
If you must ask, ask exactly ONE question. Never multiple.
Better: make an assumption and ask "Does this look right?"

### Rule 4: INFER > INTERROGATE
From vision "${project.vision}", infer likely actors and systems.
Show your inference: "Based on your vision, I'm assuming X and Y are your main users. Correct?"

## Artifact Pipeline (PRD-SPEC sequence)
1. Context Diagram ${currentArtifact === 'context_diagram' ? '← CURRENT' : completeness >= 30 ? '✓' : ''}
2. Use Case Diagram ${currentArtifact === 'use_case_diagram' ? '← CURRENT' : completeness >= 50 ? '✓' : ''}
3. Scope Tree ${currentArtifact === 'scope_tree' ? '← CURRENT' : completeness >= 65 ? '✓' : ''}
4. UCBD ${currentArtifact === 'ucbd' ? '← CURRENT' : completeness >= 80 ? '✓' : ''}
5. Requirements ${currentArtifact === 'requirements_table' ? '← CURRENT' : completeness >= 90 ? '✓' : ''}
6. Constants ${currentArtifact === 'constants_table' ? '← CURRENT' : completeness >= 95 ? '✓' : ''}
7. SysML Activity ${currentArtifact === 'sysml_activity_diagram' ? '← CURRENT' : ''}

## Current Data Extracted
Actors: ${extractedActors}
Use Cases: ${extractedUseCases}
External Systems: ${extractedExternalSystems}
In Scope: ${extractedInScope}
Out of Scope: ${extractedOutOfScope}

## Conversation History
${history || 'No previous conversation'}

## User's Message
${lastMessage.content}

## Your Response
Either:
A) Generate the artifact if you have enough data (preferred)
B) Make an inference and ask user to confirm
C) Ask ONE specific question (last resort)

## DIAGRAM FORMAT (CRITICAL)
When generating a diagram, you MUST wrap it in markdown code fences with the mermaid language identifier:

\`\`\`mermaid
graph TD;
    ActorA -->|action| SystemB;
\`\`\`

NEVER output raw mermaid syntax without the code fences. The code fences are required for rendering.

Keep response under 3 sentences unless generating a diagram.`;

    // Create chain: streamingLLM -> string output parser
    const chain = streamingLLM.pipe(new StringOutputParser());

    // Save user message to database (before streaming response)
    const newUserMessage: NewConversation = {
      projectId,
      role: 'user',
      content: lastMessage.content,
      tokens: estimateTokenCount(lastMessage.content),
    };

    await db.insert(conversations).values(newUserMessage);

    // Stream the response, accumulating chunks to save after completion
    const stream = await chain.stream(promptText);
    let fullResponse = '';

    const transformStream = new TransformStream<string, string>({
      transform(chunk, controller) {
        fullResponse += chunk;
        controller.enqueue(chunk);
      },
      async flush() {
        // Save accumulated AI response after stream completes
        if (fullResponse) {
          try {
            await db.insert(conversations).values({
              projectId,
              role: 'assistant',
              content: fullResponse,
              tokens: estimateTokenCount(fullResponse),
            });

            // Extract and save mermaid diagrams
            const mermaidBlocks = extractMermaidBlocks(fullResponse);
            for (const mermaidSyntax of mermaidBlocks) {
              const cleanedSyntax = cleanSequenceDiagramSyntax(mermaidSyntax);
              const diagramType = detectDiagramType(cleanedSyntax);
              const newArtifact: NewArtifact = {
                projectId,
                type: diagramType,
                content: { mermaid: cleanedSyntax },
                status: 'draft',
              };
              await db.insert(artifacts).values(newArtifact);
            }
          } catch (saveError) {
            console.error('[Legacy Chat] Error saving response:', saveError);
          }
        }
      },
    });

    // Pipe the LangChain stream through our transform
    const readableStream = stream.pipeThrough(transformStream);

    return new StreamingTextResponse(readableStream);
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
  return 'context_diagram';
}

/**
 * Parse JSON field that might be string or already parsed
 * Generic version with type parameter for type-safe access
 */
function parseJsonField<T>(field: unknown): T | null {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return null;
    }
  }
  return field as T;
}

/**
 * Type for items that can be extracted and formatted
 * Covers Actor, UseCase, DataEntity, and string arrays
 */
type ExtractableItem = Actor | UseCase | DataEntity | { name?: string };

/**
 * Format extracted list for prompt display
 * Handles both SystemBoundaries subfields (string arrays) and entity arrays
 */
function formatExtractedList(
  field: unknown,
  subfield?: keyof SystemBoundaries
): string {
  // Handle SystemBoundaries subfield access (internal, external, inScope, outOfScope)
  if (subfield) {
    const parsed = parseJsonField<SystemBoundaries>(field);
    if (!parsed) return 'None yet';
    const data = parsed[subfield];
    if (!data || !Array.isArray(data) || data.length === 0) return 'None yet';
    // SystemBoundaries fields are string arrays, can join directly
    return data.join(', ');
  }

  // Handle entity arrays (actors, useCases, dataEntities)
  const parsed = parseJsonField<ExtractableItem[]>(field);
  if (!parsed) return 'None yet';
  if (!Array.isArray(parsed) || parsed.length === 0) return 'None yet';

  return parsed
    .map((item) => typeof item === 'string' ? item : item.name || JSON.stringify(item))
    .join(', ');
}
