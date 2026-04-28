/**
 * SQL → DBML transpiler for the schema-approval gate (TA2 Wave A, EC-V21-A.6).
 *
 * Strategy: feed `@dbml/core`'s PostgreSQL importer with a normalized DDL
 * string built from the schema JSON. Supported subset (locked in master plan
 * v2.1):
 *   - tables + PKs (single-column + composite)
 *   - single-column FKs (Refs)
 *   - enum types
 *   - unique indexes
 *   - optional FK relationships
 *
 * Anything we cannot lower into the supported subset is emitted as a DBML
 * line comment carrying the source SQL inline so the operator can audit.
 *
 * @module lib/dbml/sql-to-dbml
 */

// `@dbml/core` ships only named exports (verified against 7.1.1):
// `{ importer, exporter, Parser, ModelExporter, ... }`. No default export.
import { importer as dbmlImporter } from '@dbml/core';

interface SchemaColumnInput {
  name: string;
  type: string;
  constraints?: string | string[];
  nullable?: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
  default?: string;
  unique?: boolean;
}

interface SchemaTableInput {
  name: string;
  columns?: SchemaColumnInput[];
  fields?: SchemaColumnInput[];
  primaryKey?: string[];
}

interface SchemaInput {
  tables?: SchemaTableInput[];
  entities?: SchemaTableInput[];
  enums?: Array<{ name: string; values: string[] }>;
}

export interface TranspileResult {
  dbml: string;
  warnings: string[];
}

function quoteIdent(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

function normalizeConstraints(c: SchemaColumnInput['constraints']): string[] {
  if (!c) return [];
  return typeof c === 'string' ? [c] : c;
}

function buildCreateTable(t: SchemaTableInput, warnings: string[]): string {
  const cols = t.columns ?? t.fields ?? [];
  const lines: string[] = [];
  const inlinePks: string[] = [];
  const fks: string[] = [];

  for (const col of cols) {
    const parts: string[] = [quoteIdent(col.name), col.type || 'text'];
    const constraints = normalizeConstraints(col.constraints);
    const cLower = constraints.map((s) => s.toLowerCase());

    if (col.primaryKey || cLower.some((c) => c.includes('primary'))) {
      inlinePks.push(quoteIdent(col.name));
    }
    if (col.unique || cLower.some((c) => c === 'unique')) {
      parts.push('UNIQUE');
    }
    if (col.nullable === false || cLower.some((c) => c.includes('not null'))) {
      parts.push('NOT NULL');
    }
    if (col.default !== undefined) {
      parts.push(`DEFAULT ${col.default}`);
    }
    if (col.foreignKey) {
      // Format: "other_table.id" or "other_table(id)"
      const m = col.foreignKey.match(/^([\w.]+?)[.(]([\w]+)\)?$/);
      if (m) {
        fks.push(
          `  FOREIGN KEY (${quoteIdent(col.name)}) REFERENCES ${quoteIdent(m[1])}(${quoteIdent(m[2])})`
        );
      } else {
        warnings.push(
          `Table ${t.name}: unrecognized foreignKey reference "${col.foreignKey}" — emitted as DBML comment`
        );
      }
    }

    lines.push('  ' + parts.join(' '));
  }

  // Composite PK
  if (t.primaryKey && t.primaryKey.length > 0) {
    lines.push(
      `  PRIMARY KEY (${t.primaryKey.map(quoteIdent).join(', ')})`
    );
  } else if (inlinePks.length > 1) {
    lines.push(`  PRIMARY KEY (${inlinePks.join(', ')})`);
  } else if (inlinePks.length === 1) {
    // Re-tag the matching column with PRIMARY KEY (DBML importer prefers it inline)
    const pk = inlinePks[0];
    const idx = lines.findIndex((l) => l.trim().startsWith(pk + ' '));
    if (idx >= 0 && !lines[idx].includes('PRIMARY KEY')) {
      lines[idx] += ' PRIMARY KEY';
    }
  }

  return [
    `CREATE TABLE ${quoteIdent(t.name)} (`,
    [...lines, ...fks].join(',\n'),
    `);`,
  ].join('\n');
}

function buildEnum(e: { name: string; values: string[] }): string {
  const vals = e.values.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');
  return `CREATE TYPE ${quoteIdent(e.name)} AS ENUM (${vals});`;
}

/**
 * Transpile a schema JSON object into DBML text.
 *
 * Returns the DBML source plus any per-row warnings. Caller may append the
 * warnings array to a UI panel; warnings are also embedded as inline DBML
 * comments at the top of the output so a downloaded `.dbml` file is
 * self-describing.
 */
export function transpileSchemaToDbml(schema: SchemaInput | null | undefined): TranspileResult {
  const warnings: string[] = [];
  const tables = schema?.tables ?? schema?.entities ?? [];
  const enums = schema?.enums ?? [];

  if (tables.length === 0 && enums.length === 0) {
    return {
      dbml: '// No schema data available.\n',
      warnings: ['Schema is empty — nothing to transpile.'],
    };
  }

  const ddlParts: string[] = [];
  for (const e of enums) {
    try {
      ddlParts.push(buildEnum(e));
    } catch (err) {
      warnings.push(`Enum ${e.name}: failed to lower — ${(err as Error).message}`);
    }
  }
  for (const t of tables) {
    try {
      ddlParts.push(buildCreateTable(t, warnings));
    } catch (err) {
      warnings.push(`Table ${t.name}: failed to lower — ${(err as Error).message}`);
    }
  }

  const ddl = ddlParts.join('\n\n');

  let dbml: string;
  try {
    // dbml-core API: importer.import(content, format) → DBML string
    dbml = dbmlImporter.import(ddl, 'postgres');
  } catch (err) {
    // Importer rejected our DDL — fall back to inline-comment dump so the
    // operator at least sees the source. This is the "unsupported → emit
    // DBML comment with source SQL inline" branch from the spec.
    warnings.push(
      `DBML importer rejected generated DDL: ${(err as Error).message}. Source SQL embedded below.`
    );
    const commented = ddl
      .split('\n')
      .map((line) => '// ' + line)
      .join('\n');
    return {
      dbml: `// DBML transpile fell back to source-SQL comment block.\n${commented}\n`,
      warnings,
    };
  }

  const header =
    warnings.length > 0
      ? warnings.map((w) => `// WARN: ${w}`).join('\n') + '\n\n'
      : '';

  return { dbml: header + dbml, warnings };
}
