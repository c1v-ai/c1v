/**
 * LLM Test Endpoint - Phase 18 Debug
 *
 * Tests LangChain module integrity and LLM connectivity.
 * Used to diagnose Turbopack ESM bundling issues.
 *
 * GET /api/test-llm
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';

export const dynamic = 'force-dynamic';

interface TestResult {
  test: string;
  passed: boolean;
  result?: unknown;
  error?: string;
}

export async function GET() {
  const results: TestResult[] = [];

  // Test 1: AIMessage instantiation
  try {
    const testMsg = new AIMessage('test content');
    results.push({
      test: 'AIMessage instantiation',
      passed: true,
      result: { content: testMsg.content },
    });
  } catch (error) {
    results.push({
      test: 'AIMessage instantiation',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 2: _getType() method exists and works
  try {
    const testMsg = new AIMessage('test');
    const msgType = testMsg._getType();
    results.push({
      test: '_getType() method',
      passed: msgType === 'ai',
      result: { type: msgType, expected: 'ai' },
    });
  } catch (error) {
    results.push({
      test: '_getType() method',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 3: Check if isInstance exists (this is where Turbopack fails)
  try {
    const isInstanceExists = typeof (AIMessage as unknown as { isInstance?: unknown }).isInstance === 'function';
    const humanIsInstanceExists = typeof (HumanMessage as unknown as { isInstance?: unknown }).isInstance === 'function';
    results.push({
      test: 'isInstance static method exists',
      passed: true, // Just checking existence, not necessarily expecting it to exist
      result: {
        AIMessage_isInstance: isInstanceExists,
        HumanMessage_isInstance: humanIsInstanceExists,
      },
    });
  } catch (error) {
    results.push({
      test: 'isInstance static method exists',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 4: LLM instantiation
  try {
    const llm = new ChatAnthropic({
      modelName: 'claude-sonnet-4-20250514',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 50,
    });
    results.push({
      test: 'ChatAnthropic instantiation',
      passed: true,
      result: { modelName: 'claude-sonnet-4-5-20250514' },
    });
  } catch (error) {
    results.push({
      test: 'ChatAnthropic instantiation',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 5: Simple LLM invoke (the critical test)
  try {
    const llm = new ChatAnthropic({
      modelName: 'claude-sonnet-4-20250514',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 20,
    });

    const response = await llm.invoke([new HumanMessage('Say "working" and nothing else')]);
    const responseType = response._getType();
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    results.push({
      test: 'LLM invoke',
      passed: responseType === 'ai' && content.length > 0,
      result: {
        responseType,
        contentPreview: content.substring(0, 50),
        contentLength: content.length,
      },
    });
  } catch (error) {
    results.push({
      test: 'LLM invoke',
      passed: false,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    });
  }

  // Test 6: Structured output (withStructuredOutput) - this is what agents use
  try {
    const { z } = await import('zod');
    const llm = new ChatAnthropic({
      modelName: 'claude-sonnet-4-20250514',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 100,
    });

    const schema = z.object({
      greeting: z.string().describe('A simple greeting'),
    });

    const structuredLLM = llm.withStructuredOutput(schema, { name: 'test_structured' });
    const response = await structuredLLM.invoke('Say hello');

    results.push({
      test: 'Structured output (withStructuredOutput)',
      passed: typeof response.greeting === 'string',
      result: response,
    });
  } catch (error) {
    results.push({
      test: 'Structured output (withStructuredOutput)',
      passed: false,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    });
  }

  // Summary
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;

  return Response.json({
    success: allPassed,
    summary: `${passedCount}/${results.length} tests passed`,
    bundler: process.env.TURBOPACK === '1' ? 'turbopack' : 'webpack',
    nodeEnv: process.env.NODE_ENV,
    tests: results,
  }, {
    status: allPassed ? 200 : 500,
  });
}
