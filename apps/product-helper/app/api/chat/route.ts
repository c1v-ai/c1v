import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { getUser } from '@/lib/auth/session';
import { streamingLLM } from '@/lib/langchain/config';
import { systemPrompt } from '@/lib/langchain/prompts';

/**
 * Authenticated Chat API Endpoint
 * Basic streaming chat with authentication
 * Uses LangChain + GPT-4 Turbo for PRD assistance
 */

export const runtime = 'edge';

/**
 * POST /api/chat
 * Handles chat messages with streaming responses
 *
 * Request body:
 * {
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>
 * }
 *
 * Response: Streaming text via Server-Sent Events
 */
export async function POST(req: NextRequest) {
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

    // Create conversational prompt
    // This is a simple version - Phase 8 will add project context
    const prompt = PromptTemplate.fromTemplate(`
${systemPrompt}

Conversation history:
{history}

User's message: {input}

Respond helpfully and conversationally.
`);

    // Build conversation history from previous messages
    const history = messages
      .slice(0, -1) // Exclude the last message
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Create chain: prompt -> LLM -> output parser
    const chain = prompt
      .pipe(streamingLLM)
      .pipe(new HttpResponseOutputParser());

    // Stream the response
    const stream = await chain.stream({
      history: history || 'No previous conversation',
      input: lastMessage.content,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API error:', error);

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
 * GET /api/chat
 * Health check endpoint
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Chat API is running',
      endpoint: '/api/chat',
      methods: ['POST'],
      authentication: 'required'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
