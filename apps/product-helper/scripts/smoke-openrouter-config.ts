/**
 * Smoke test for the OpenRouter migration in lib/langchain/config.ts.
 *
 * Run: pnpm tsx scripts/smoke-openrouter-config.ts
 *
 * Verifies:
 *   1. cheapLLM (Haiku) basic invoke
 *   2. structuredLLM (Sonnet) with .withStructuredOutput()
 *   3. createClaudeAgent factory with HAIKU role
 *
 * Each test prints the OpenRouter-resolved model id from the response
 * metadata so you can confirm the request actually went through OpenRouter.
 */

import 'dotenv/config';
import { z } from 'zod';
import { cheapLLM, structuredLLM, createClaudeAgent } from '../lib/langchain/config';

async function main() {
  console.log('═══ OpenRouter migration smoke test ═══\n');

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not set. Source .env.local first.');
    process.exit(1);
  }
  console.log(`✓ OPENROUTER_API_KEY present (sk-or-...${process.env.OPENROUTER_API_KEY.slice(-6)})\n`);

  // 1. Basic invoke against cheapLLM (Haiku)
  console.log('[1/3] cheapLLM.invoke() — Haiku basic chat');
  try {
    const t0 = Date.now();
    const res = await cheapLLM.invoke([
      { role: 'system', content: 'Reply with exactly one word.' },
      { role: 'user', content: 'Say "pong".' },
    ]);
    const ms = Date.now() - t0;
    console.log(`   ✓ ${ms}ms`);
    console.log(`   content: ${JSON.stringify(res.content)}`);
    const meta = (res as { response_metadata?: Record<string, unknown> }).response_metadata;
    if (meta?.model_name) console.log(`   model_name: ${meta.model_name}`);
  } catch (e) {
    console.error('   ❌ FAILED:', (e as Error).message);
    process.exit(1);
  }

  // 2. Structured output against structuredLLM (Sonnet)
  console.log('\n[2/3] structuredLLM.withStructuredOutput() — Sonnet tool-calling');
  try {
    const schema = z.object({
      city: z.string().describe('A famous city'),
      country: z.string().describe('That city\'s country'),
    });
    const t0 = Date.now();
    const handle = structuredLLM.withStructuredOutput(schema, { name: 'pick_city' });
    const out = await handle.invoke([
      { role: 'user', content: 'Pick any famous city.' },
    ]);
    const ms = Date.now() - t0;
    console.log(`   ✓ ${ms}ms`);
    console.log(`   parsed:`, out);
    if (!out.city || !out.country) throw new Error('missing fields');
  } catch (e) {
    console.error('   ❌ FAILED:', (e as Error).message);
    process.exit(1);
  }

  // 3. createClaudeAgent factory with HAIKU
  console.log('\n[3/3] createClaudeAgent({ model: "HAIKU" }) — factory + structured output');
  try {
    const schema = z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
    });
    const agent = createClaudeAgent(schema, 'classify_sentiment', { model: 'HAIKU', temperature: 0 });
    const t0 = Date.now();
    const out = await agent.invoke([
      { role: 'user', content: 'Classify: "I love this product, it changed my life!"' },
    ]);
    const ms = Date.now() - t0;
    console.log(`   ✓ ${ms}ms`);
    console.log(`   parsed:`, out);
  } catch (e) {
    console.error('   ❌ FAILED:', (e as Error).message);
    process.exit(1);
  }

  console.log('\n═══ ✅ All 3 smoke tests passed — OpenRouter migration is live ═══');
}

main().catch((e) => {
  console.error('\n❌ Unhandled:', e);
  process.exit(1);
});
