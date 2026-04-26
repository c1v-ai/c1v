/**
 * Wave D Step D-0 — Preflight harness.
 *
 * Replays project=33 api-spec generation against ChatAnthropic + the
 * existing apiSpecificationSchema (line 127 of api-spec-agent.ts) and
 * captures stop_reason + usage from raw response_metadata.
 *
 * Used by both the FIXTURE preflight (offline / mock) and the LIVE
 * preflight (real Anthropic API). Mode controlled by env var:
 *
 *   PREFLIGHT_MODE=fixture pnpm tsx scripts/preflight-api-spec.ts
 *   PREFLIGHT_MODE=live    pnpm tsx scripts/preflight-api-spec.ts
 *
 * Output: pretty-printed JSON to stdout — caller pipes to a markdown
 * codefence in plans/v21-outputs/td1/preflight-log-{fixture,live}.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ChatAnthropic } from '@langchain/anthropic';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { apiSpecificationSchema } from '../lib/langchain/agents/api-spec-agent';
import { CLAUDE_MODELS } from '../lib/langchain/config';

const FIXTURE_PATH = path.resolve(
  __dirname,
  '../__tests__/fixtures/api-spec/project-33-input.json',
);

interface Fixture {
  renderedPrompt: string;
  renderedPromptLength: number;
}

async function main() {
  const mode = process.env.PREFLIGHT_MODE ?? 'fixture';
  const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8')) as Fixture;

  const modelName = CLAUDE_MODELS.SONNET;
  const temperature = 0.2;
  const maxTokens = 12000;

  if (mode === 'fixture') {
    // Offline replay: cannot exercise the model, but can verify
    // the schema serialization and prompt size — which is the
    // structural half of the cutoff hypothesis.
    const jsonSchema = zodToJsonSchema(apiSpecificationSchema, {
      $refStrategy: 'none',
    });
    const serialized = JSON.stringify(jsonSchema);
    const result = {
      mode,
      modelName,
      temperature,
      maxTokens,
      promptChars: fixture.renderedPrompt.length,
      schemaJsonChars: serialized.length,
      // Heuristic: ~3.5 chars/token for English+JSON
      promptApproxTokens: Math.round(fixture.renderedPrompt.length / 3.5),
      schemaApproxTokens: Math.round(serialized.length / 3.5),
      jsonSchemaSchemaEmbedSites: countOccurrences(serialized, '"properties"'),
      observation:
        'Offline. Captured prompt + serialized schema sizes. Live replay needed for stop_reason.',
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mode === 'live') {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-stub')) {
      throw new Error('PREFLIGHT_MODE=live requires real ANTHROPIC_API_KEY');
    }

    const llm = new ChatAnthropic({
      modelName,
      temperature,
      maxTokens,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Mirror createClaudeAgent: bind the schema as a tool, force its use.
    // Going under withStructuredOutput so we can read the raw AIMessage
    // (response_metadata.stop_reason, usage_metadata.{input,output}_tokens).
    const tool = {
      name: 'generate_api_specification',
      description: 'Emit the API specification matching the schema.',
      schema: apiSpecificationSchema,
    };
    const bound = llm.bindTools([tool], {
      tool_choice: { type: 'tool', name: 'generate_api_specification' },
    });

    const t0 = Date.now();
    const response = await bound.invoke(fixture.renderedPrompt);
    const elapsedMs = Date.now() - t0;

    const meta = (response as unknown as { response_metadata?: Record<string, unknown> }).response_metadata ?? {};
    const usage = (response as unknown as { usage_metadata?: Record<string, unknown> }).usage_metadata ?? {};
    const toolCalls = (response as unknown as { tool_calls?: Array<{ name: string; args: unknown }> }).tool_calls ?? [];

    const firstToolCallArgs = toolCalls[0]?.args as Record<string, unknown> | undefined;
    const topLevelKeysEmitted = firstToolCallArgs ? Object.keys(firstToolCallArgs) : [];
    const endpointsEmitted =
      Array.isArray(firstToolCallArgs?.endpoints) ? (firstToolCallArgs!.endpoints as unknown[]).length : 0;

    const stopReason = meta.stop_reason ?? meta['stop_reason'] ?? null;

    const result = {
      mode,
      modelName,
      temperature,
      maxTokens,
      promptChars: fixture.renderedPrompt.length,
      elapsedMs,
      stop_reason: stopReason,
      usage,
      response_metadata: meta,
      toolCallsCount: toolCalls.length,
      topLevelKeysEmitted,
      topLevelKeysEmittedCount: topLevelKeysEmitted.length,
      endpointsEmitted,
      branchDecision: deriveBranchDecision(stopReason),
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  throw new Error(`Unknown PREFLIGHT_MODE=${mode}; use 'fixture' or 'live'`);
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count++;
    idx += needle.length;
  }
  return count;
}

function deriveBranchDecision(stopReason: unknown): string {
  if (stopReason === 'max_tokens' || stopReason === 'tool_use') {
    return 'CUTOFF — split-only fix sufficient. Default stage-1 schema (path,method,description,auth,tags,operationId).';
  }
  if (stopReason === 'end_turn') {
    return 'INSTRUCTION_BIAS — model satisfied tool-use early. Trim stage-1 floor to (path,method,operationId only).';
  }
  return `UNKNOWN stop_reason=${String(stopReason)} — escalate.`;
}

main().catch((err) => {
  console.error('preflight failed:', err);
  process.exit(1);
});
