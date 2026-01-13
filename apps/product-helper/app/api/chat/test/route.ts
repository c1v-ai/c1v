import { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Test Chat API Endpoint
 * Simple streaming chat endpoint for testing chat UI components
 * Does NOT require authentication (test only)
 */

export const runtime = 'edge';

// Simple test LLM configuration
const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];

    // Simple prompt for testing
    const prompt = PromptTemplate.fromTemplate(
      `You are a helpful AI assistant for a Product Requirements Document (PRD) generation tool.

You help product managers create comprehensive PRDs by:
- Asking clarifying questions about requirements
- Extracting structured data from conversations
- Providing guidance on best practices
- Being friendly and conversational

User's message: {input}

Respond helpfully and ask follow-up questions when appropriate.`
    );

    const chain = prompt
      .pipe(llm)
      .pipe(new HttpResponseOutputParser());

    const stream = await chain.stream({
      input: lastMessage.content,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Test chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
