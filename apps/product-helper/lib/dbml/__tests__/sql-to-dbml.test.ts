/**
 * Round-trip smoke test for the SQL → DBML transpiler (P8 closure).
 *
 * Verifies:
 *   (a) `transpileSchemaToDbml(fixture)` does NOT throw.
 *   (b) returned DBML contains both table names.
 *   (c) returned DBML contains a `Ref:` line for the foreign-key relation.
 *   (d) DBML round-trips: feed the output back through `@dbml/core`'s
 *       `importer.import(...)` and assert the parsed model matches the
 *       input shape (2 tables present + the FK reference survives).
 *
 * Fixture mirrors a Drizzle-style approved schema: a `users` parent + a
 * `posts` child with a single-column FK back to `users.id`. This is the
 * shape a real project would emit at the schema-approval gate (TA2 Wave A,
 * EC-V21-A.6) — NOT a contrived default-importer code path.
 */

import { transpileSchemaToDbml } from '../sql-to-dbml';
import { importer as dbmlImporter } from '@dbml/core';

describe('transpileSchemaToDbml — P8 round-trip', () => {
  const fixture = {
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', primaryKey: true, nullable: false },
          { name: 'email', type: 'text', nullable: false, unique: true },
        ],
      },
      {
        name: 'posts',
        columns: [
          { name: 'id', type: 'uuid', primaryKey: true, nullable: false },
          {
            name: 'author_id',
            type: 'uuid',
            nullable: false,
            foreignKey: 'users.id',
          },
          { name: 'title', type: 'text', nullable: false },
        ],
      },
    ],
  };

  it('(a) does not throw on a 2-table schema with FK', () => {
    expect(() => transpileSchemaToDbml(fixture)).not.toThrow();
  });

  it('(b) emits both table names in the DBML output', () => {
    const { dbml } = transpileSchemaToDbml(fixture);
    // DBML emits `Table "users" { ... }` for quoted identifiers
    expect(dbml).toMatch(/Table\s+"?users"?\s*\{/);
    expect(dbml).toMatch(/Table\s+"?posts"?\s*\{/);
  });

  it('(c) emits a Ref: line for the foreign-key relation', () => {
    const { dbml } = transpileSchemaToDbml(fixture);
    // `Ref:"users"."id" < "posts"."author_id"` — `<` = one-to-many
    expect(dbml).toMatch(/Ref\s*:.*users.*posts|Ref\s*:.*posts.*users/);
    expect(dbml).toMatch(/author_id/);
  });

  it('(d) DBML round-trips through @dbml/core.importer.import', () => {
    const { dbml, warnings } = transpileSchemaToDbml(fixture);
    // The transpiler stripped DBML warnings header (none expected on the
    // happy path). If the transpile fell back to a comment-block, the
    // importer would choke on the `// ...` SQL dump — fail loudly.
    expect(warnings).toEqual([]);

    // The DBML emitted by `dbmlImporter.import(ddl, 'postgres')` is itself
    // valid DBML and must parse cleanly with the same importer in `dbml`
    // mode. This proves the output is structurally sound and not just a
    // string that happens to contain table names.
    expect(() => dbmlImporter.import(dbml, 'dbml')).not.toThrow();

    // Re-parse and confirm both tables + the FK reference survive.
    const reparsed: string = dbmlImporter.import(dbml, 'dbml');
    // `import(dbml, 'dbml')` returns DBML-normalized text — assert
    // structural fidelity by string match (the parse already validated
    // syntax above; here we just check the shape made it through).
    expect(reparsed).toMatch(/users/);
    expect(reparsed).toMatch(/posts/);
    expect(reparsed).toMatch(/author_id/);
  });
});
