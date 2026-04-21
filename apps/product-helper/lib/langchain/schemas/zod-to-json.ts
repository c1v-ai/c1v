import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const DRAFT_07_URI = 'http://json-schema.org/draft-07/schema#';

type JsonObject = Record<string, unknown>;

/**
 * Converts a Zod schema to a strict draft-07 JSON Schema.
 *
 * Contract:
 *   - Top-level `$schema` is forced to the draft-07 URI.
 *   - Top-level `title` is set to `name`.
 *   - `additionalProperties: false` is forced on every object node
 *     where it is not already explicitly set. `.passthrough()` Zod
 *     objects emit `additionalProperties: true` and are preserved
 *     (the strict pass only fills absent slots — it never overwrites
 *     an explicit author intent).
 *   - No `$ref` indirection (`$refStrategy: 'none'` inlines everything).
 *   - Union discrimination is strict (`strictUnions: true`).
 */
export function zodToStrictJsonSchema(
  schema: z.ZodType,
  name: string,
): JsonObject {
  const raw = zodToJsonSchema(schema, {
    name,
    nameStrategy: 'title',
    target: 'jsonSchema7',
    $refStrategy: 'none',
    strictUnions: true,
  }) as JsonObject;

  const strict = forceStrictAdditionalProperties(raw) as JsonObject;

  strict.$schema = DRAFT_07_URI;
  strict.title = name;

  return strict;
}

function forceStrictAdditionalProperties(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(forceStrictAdditionalProperties);
  }

  if (node === null || typeof node !== 'object') {
    return node;
  }

  const input = node as JsonObject;
  const output: JsonObject = {};

  for (const [key, value] of Object.entries(input)) {
    output[key] = forceStrictAdditionalProperties(value);
  }

  if (isObjectSchema(output) && !('additionalProperties' in output)) {
    output.additionalProperties = false;
  }

  return output;
}

function isObjectSchema(node: JsonObject): boolean {
  if (node.type === 'object') return true;
  if (Array.isArray(node.type) && node.type.includes('object')) return true;
  return (
    typeof node.properties === 'object' &&
    node.properties !== null &&
    !Array.isArray(node.properties)
  );
}
