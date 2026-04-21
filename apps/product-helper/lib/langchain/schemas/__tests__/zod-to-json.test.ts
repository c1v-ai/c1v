import { z } from 'zod';

import { zodToStrictJsonSchema } from '../zod-to-json';

describe('zodToStrictJsonSchema', () => {
  it('emits draft-07 $schema, title, required, and additionalProperties:false for a simple object', () => {
    const schema = z.object({
      foo: z.string(),
      bar: z.number().optional(),
    });

    const result = zodToStrictJsonSchema(schema, 'Simple') as Record<string, unknown>;

    expect(result.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(result.title).toBe('Simple');
    expect(result.type).toBe('object');
    expect(result.additionalProperties).toBe(false);
    expect(result.required).toEqual(['foo']);
  });

  it('recursively forces additionalProperties:false on nested objects', () => {
    const schema = z.object({
      outer: z.object({
        inner: z.object({
          deep: z.string(),
        }),
      }),
    });

    const result = zodToStrictJsonSchema(schema, 'Nested') as Record<string, unknown>;
    const props = result.properties as Record<string, Record<string, unknown>>;
    const outer = props.outer;
    const innerProps = outer.properties as Record<string, Record<string, unknown>>;
    const inner = innerProps.inner;

    expect(result.additionalProperties).toBe(false);
    expect(outer.additionalProperties).toBe(false);
    expect(inner.additionalProperties).toBe(false);
  });

  it('forces additionalProperties:false on objects nested inside arrays', () => {
    const schema = z.object({
      items: z.array(
        z.object({
          id: z.string(),
          count: z.number(),
        }),
      ),
    });

    const result = zodToStrictJsonSchema(schema, 'ArrayOfObjects') as Record<string, unknown>;
    const props = result.properties as Record<string, Record<string, unknown>>;
    const items = props.items;
    const elementSchema = items.items as Record<string, unknown>;

    expect(result.additionalProperties).toBe(false);
    expect(items.type).toBe('array');
    expect(elementSchema.type).toBe('object');
    expect(elementSchema.additionalProperties).toBe(false);
    expect(elementSchema.required).toEqual(['id', 'count']);
  });
});
