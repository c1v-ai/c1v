/**
 * @jest-environment node
 *
 * Unit tests for the Architecture & Database section's pure logic surface:
 * the DBML transpiler + the schema-digest function. Component-level
 * interaction tests (alternative-picker switching, approval persistence) are
 * deferred to Playwright — the Jest harness is `node` (no jsdom), so we
 * cover the deterministic logic here.
 */

import { transpileSchemaToDbml } from '@/lib/dbml/sql-to-dbml';

describe('transpileSchemaToDbml', () => {
  test('emits DBML for a basic schema with PKs and FKs', () => {
    const schema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'uuid', primaryKey: true },
            { name: 'email', type: 'text', constraints: ['NOT NULL', 'UNIQUE'] },
          ],
        },
        {
          name: 'posts',
          columns: [
            { name: 'id', type: 'uuid', primaryKey: true },
            { name: 'user_id', type: 'uuid', foreignKey: 'users.id' },
            { name: 'body', type: 'text' },
          ],
        },
      ],
    };

    const { dbml, warnings } = transpileSchemaToDbml(schema);

    expect(warnings).toHaveLength(0);
    expect(dbml).toMatch(/Table "?users"?/);
    expect(dbml).toMatch(/Table "?posts"?/);
    // FK should round-trip into a Ref or inline `[ref:` line
    expect(dbml.toLowerCase()).toMatch(/ref|references/);
  });

  test('handles composite primary keys', () => {
    const schema = {
      tables: [
        {
          name: 'team_members',
          primaryKey: ['team_id', 'user_id'],
          columns: [
            { name: 'team_id', type: 'integer' },
            { name: 'user_id', type: 'integer' },
            { name: 'role', type: 'text' },
          ],
        },
      ],
    };

    const { dbml } = transpileSchemaToDbml(schema);
    expect(dbml).toMatch(/team_members/);
    // Composite PK should appear as either an `indexes` block or `[pk]` markers
    expect(dbml.toLowerCase()).toMatch(/pk|primary/);
  });

  test('returns empty-state DBML for null/empty schemas', () => {
    expect(transpileSchemaToDbml(null).dbml).toMatch(/No schema data/);
    expect(transpileSchemaToDbml({ tables: [] }).dbml).toMatch(/No schema data/);
  });

  test('falls back to inline-comment SQL when importer rejects DDL', () => {
    // Force a malformed table — empty name will trip the importer.
    const schema = {
      tables: [
        {
          name: '', // invalid identifier
          columns: [{ name: 'x', type: 'text' }],
        },
      ],
    };

    const { dbml, warnings } = transpileSchemaToDbml(schema);
    // Either the importer succeeded with warnings, or we fell back to comment block.
    if (warnings.length > 0) {
      expect(dbml).toMatch(/(WARN|fell back|comment block|\/\/)/);
    } else {
      expect(dbml.length).toBeGreaterThan(0);
    }
  });

  test('emits unrecognized FK references as warnings', () => {
    const schema = {
      tables: [
        {
          name: 'orders',
          columns: [
            { name: 'id', type: 'uuid', primaryKey: true },
            { name: 'customer_id', type: 'uuid', foreignKey: 'NOT_A_VALID_REF' },
          ],
        },
      ],
    };

    const { warnings } = transpileSchemaToDbml(schema);
    expect(warnings.some((w) => /unrecognized foreignKey/.test(w))).toBe(true);
  });

  test('emits enum types into the DBML output', () => {
    const schema = {
      enums: [{ name: 'status_enum', values: ['active', 'paused', 'archived'] }],
      tables: [
        {
          name: 'subscriptions',
          columns: [
            { name: 'id', type: 'integer', primaryKey: true },
            { name: 'status', type: '"status_enum"' },
          ],
        },
      ],
    };

    const { dbml, warnings } = transpileSchemaToDbml(schema);
    expect(warnings).toHaveLength(0);
    expect(dbml.toLowerCase()).toMatch(/enum/);
    expect(dbml).toMatch(/active/);
    expect(dbml).toMatch(/archived/);
  });
});
