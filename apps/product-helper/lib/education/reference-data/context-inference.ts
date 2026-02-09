/**
 * Project Context Inference
 *
 * Uses Claude Haiku with structured output to classify a project's
 * synthesis result into KBProjectContext dimensions.
 *
 * Pipeline position: runs once after synthesis, before parallel generators.
 * Cost: ~$0.001 per call. Latency: ~200-400ms.
 *
 * Fallback: if classification fails, returns empty object.
 * All KB functions treat empty context as "use generic content".
 */

import { z } from 'zod';
import { createClaudeAgent } from '@/lib/langchain/config';
import type { SynthesisResult } from '@/lib/langchain/agents/quick-start-synthesis-agent';
import type { KBProjectContext } from './types';

// Zod schema for structured output
const projectContextSchema = z.object({
  projectType: z
    .enum(['saas', 'marketplace', 'mobile', 'api-platform', 'ai-product', 'e-commerce', 'internal-tool', 'open-source'])
    .nullable()
    .describe('Project archetype based on use case patterns. null if unclear.'),
  market: z
    .enum(['b2b', 'b2c', 'b2b2c'])
    .nullable()
    .describe('Target market based on actor types. null if unclear.'),
  stage: z
    .enum(['idea', 'mvp', 'growth', 'mature'])
    .nullable()
    .describe('Project maturity stage. null if not mentioned.'),
  budget: z
    .enum(['bootstrap', 'seed', 'series-a', 'enterprise'])
    .nullable()
    .describe('Budget tier. null if not mentioned.'),
  industry: z
    .enum(['healthcare', 'fintech', 'education', 'real-estate', 'automotive', 'general'])
    .nullable()
    .describe('Industry vertical based on domain entities and terminology. null if general-purpose.'),
});

const INFERENCE_PROMPT = `You are a project classifier. Given a synthesis of a project idea, classify it into the dimensions below.

RULES:
- Only set a field if you are confident (>80% certainty)
- Set to null if ambiguous or not enough information
- "general" for industry means it doesn't clearly fit any specific vertical
- Look at actors, entities, and use cases for signals

CLASSIFICATION SIGNALS:
- projectType: buyer+seller actors → marketplace, subscription/billing → saas, native app focus → mobile, public API → api-platform, LLM/ML focus → ai-product, product catalog+cart → e-commerce
- market: organizations/teams → b2b, individual consumers → b2c, both → b2b2c
- industry: patient/encounter/medication → healthcare, transaction/ledger/account → fintech, course/enrollment/student → education, property/listing/agent → real-estate, vehicle/dealer/vin → automotive
- stage/budget: only set if explicitly mentioned in the input

PROJECT SYNTHESIS:
Project Name: {projectName}
Vision: {projectVision}
Platform: {platform}
Scale: {scale}

Actors:
{actors}

Data Entities:
{entities}

Use Cases:
{useCases}

Classify this project now.`;

/**
 * Infer project context dimensions from synthesis result.
 * Uses Claude Haiku for fast, cheap classification.
 *
 * @returns Partial<KBProjectContext> — only fields with high confidence are set.
 * Returns empty object on any failure (safe fallback).
 */
export async function inferProjectContext(
  synthesis: SynthesisResult,
): Promise<Partial<KBProjectContext>> {
  try {
    const { domainAnalysis, useCaseDerivation } = synthesis;

    const structuredModel = createClaudeAgent(
      projectContextSchema,
      'classify_project_context',
      { model: 'HAIKU', temperature: 0.1, maxTokens: 500 },
    );

    const actors = domainAnalysis.actors
      .map(a => `- ${a.name} (${a.type}): ${a.role}`)
      .join('\n');

    const entities = useCaseDerivation.dataEntities
      .map(e => `- ${e.name}: ${e.attributes.slice(0, 5).join(', ')}`)
      .join('\n');

    const useCases = useCaseDerivation.useCases
      .slice(0, 8)
      .map(uc => `- ${uc.name}: ${uc.description.slice(0, 100)}`)
      .join('\n');

    const prompt = INFERENCE_PROMPT
      .replace('{projectName}', domainAnalysis.projectName)
      .replace('{projectVision}', domainAnalysis.projectVision)
      .replace('{platform}', domainAnalysis.technicalContext.platform)
      .replace('{scale}', domainAnalysis.technicalContext.scale)
      .replace('{actors}', actors)
      .replace('{entities}', entities)
      .replace('{useCases}', useCases);

    const result = await structuredModel.invoke(prompt);

    // Convert nulls to undefined (Partial<KBProjectContext> uses undefined, not null)
    const context: Partial<KBProjectContext> = {};
    if (result.projectType) context.projectType = result.projectType;
    if (result.market) context.market = result.market;
    if (result.stage) context.stage = result.stage;
    if (result.budget) context.budget = result.budget;
    if (result.industry) context.industry = result.industry;

    return context;
  } catch (error) {
    console.warn('[inferProjectContext] Classification failed, falling back to generic:', error);
    return {};
  }
}
