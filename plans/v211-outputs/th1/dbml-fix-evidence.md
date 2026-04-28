# P8 — `@dbml/core` default-import fix — Evidence

**Hotfix:** `wave-b/v2.1.1-hotfix` agent-§2 `dbml-import-fix`
**Worktree branch:** `wave-b/v2.1.1-hotfix-p8`
**Site:** `apps/product-helper/lib/dbml/sql-to-dbml.ts:24` (import) + `:173-174` (call site)
**Package on disk:** `@dbml/core@7.1.1` (matches diagnosed version)

---

## 1. Export-shape verification (`@dbml/core@7.1.1`)

```
$ cd apps/product-helper && node -e "
  const m = require('@dbml/core');
  console.log('keys:', Object.keys(m));
  console.log('default:', typeof m.default);
  console.log('importer:', typeof m.importer);
  console.log('importer.import:', typeof m.importer?.import);
"
keys: [
  'CompilerError', 'ModelExporter', 'Parser', 'VERSION',
  'addDoubleQuoteIfNeeded', 'dbmlMonarchTokensProvider',
  'exporter', 'findDiagramViewBlocks', 'formatRecordValue',
  'importer', 'isBinaryType', 'isBooleanType', 'isDateTimeType',
  'isFloatType', 'isIntegerType', 'isNumericType', 'isSerialType',
  'isStringType', 'renameTable', 'syncDiagramView',
  'tryExtractBoolean', 'tryExtractDateTime', 'tryExtractEnum',
  'tryExtractInteger', 'tryExtractNumeric', 'tryExtractString'
]
default: undefined          ← no default export
importer: object            ← named export exists
importer.import: function   ← method exists
```

Confirms diagnostic: `@dbml/core` ships only named exports. The original `import dbmlCore from '@dbml/core'` was binding `undefined`, the `// @ts-ignore` was hiding it from tsc, and `(dbmlCore as ...).importer` was `undefined.importer` at runtime — a latent crash gated only by P7 (no UI trigger reaches schema-approval today).

The package's own `types/index.d.ts` enumerates `importer` as a named export (`import importer from './import'; export { importer, ... }`), so a named TS import resolves cleanly without `// @ts-ignore`.

---

## 2. Before-state — node-level crash repro (default-import path)

```
$ cd apps/product-helper && node -e "
  const m = require('@dbml/core');
  const dbmlCore = m.default;  // === undefined
  const importer = (dbmlCore || {}).importer;
  importer.import('CREATE TABLE x (id int);', 'postgres');
"
TypeError: Cannot read properties of undefined (reading 'import')
```

This is the runtime that would fire the moment any project reached schema-approval after P7 lands the missing UI trigger.

Webpack/Turbopack additionally surface this as a compile-time warning whenever `sql-to-dbml.ts` is bundled:

```
Attempted import error: '@dbml/core' does not contain a default export
(imported as 'dbmlCore').
```

per the coordinator's diagnostic in `plans/post-v2.1-followups.md` §P8.

---

## 3. After-state — named-import succeeds

```
$ cd apps/product-helper && node -e "
  const { importer: dbmlImporter } = require('@dbml/core');
  const out = dbmlImporter.import('CREATE TABLE x (id int);', 'postgres');
  console.log(out);
"
Table "x" {
  "id" int
}
```

No crash, no warning, real DBML output.

### Realistic round-trip (Drizzle-style fixture, mirrors approved-schema gate)

```
$ node -e "
  const { importer } = require('@dbml/core');
  const ddl = \`CREATE TABLE \"users\" (
    \"id\" uuid PRIMARY KEY, \"email\" text NOT NULL UNIQUE
  );
  CREATE TABLE \"posts\" (
    \"id\" uuid PRIMARY KEY, \"author_id\" uuid NOT NULL,
    \"title\" text NOT NULL,
    FOREIGN KEY (\"author_id\") REFERENCES \"users\"(\"id\")
  );\`;
  console.log(importer.import(ddl, 'postgres'));
"
Table "users" {
  "id" uuid [pk]
  "email" text [unique, not null]
}
Table "posts" {
  "id" uuid [pk]
  "author_id" uuid [not null]
  "title" text [not null]
}
Ref:"users"."id" < "posts"."author_id"
```

`Ref:` line confirms FK survives the transpile.

---

## 4. Test results

```
$ POSTGRES_URL=stub AUTH_SECRET=stubstubstubstubstubstubstubstubstub \
  ANTHROPIC_API_KEY=sk-ant-stub STRIPE_SECRET_KEY=sk_test_stub \
  STRIPE_WEBHOOK_SECRET=whsec_stub OPENROUTER_API_KEY=stub \
  BASE_URL=http://localhost:3000 npx jest lib/dbml

PASS lib/dbml/__tests__/sql-to-dbml.test.ts
  transpileSchemaToDbml — P8 round-trip
    ✓ (a) does not throw on a 2-table schema with FK (99 ms)
    ✓ (b) emits both table names in the DBML output (2 ms)
    ✓ (c) emits a Ref: line for the foreign-key relation (1 ms)
    ✓ (d) DBML round-trips through @dbml/core.importer.import (4 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Time:        0.528 s
```

Downstream consumer test still green (no behavior regression):

```
$ npx jest components/projects/sections/__tests__/architecture-and-database-section.test.tsx

PASS components/projects/sections/__tests__/architecture-and-database-section.test.tsx
  transpileSchemaToDbml
    ✓ emits DBML for a basic schema with PKs and FKs (108 ms)
    ✓ handles composite primary keys (2 ms)
    ✓ returns empty-state DBML for null/empty schemas
    ✓ falls back to inline-comment SQL when importer rejects DDL (2 ms)
    ✓ emits unrecognized FK references as warnings (1 ms)
    ✓ emits enum types into the DBML output (18 ms)

Tests:       6 passed, 6 total
```

---

## 5. tsc verification

```
$ cd apps/product-helper && npx tsc --noEmit --project tsconfig.json 2>&1 \
    | grep "dbml/sql-to-dbml"
(no output)
```

`sql-to-dbml.ts` is tsc-clean after dropping the `// @ts-ignore`. The remaining tsc errors in the project (lib/db/schema, lib/langchain/engines, scripts/atlas) are pre-existing and unrelated to P8.

---

## 6. Dev-server verification

Started `pnpm dev` from `apps/product-helper/` (port 3001 — 3000 occupied by another process):

```
> next dev
 ⚠ turbopack.root should be absolute, using: /Users/davidancor/Projects/c1v/.claude/worktrees/agent-ab004f7ea7d434a56
 ⚠ Port 3000 is in use by process 70122, using available port 3001 instead.
   ▲ Next.js 15.5.9
   - Local:        http://localhost:3001
 ✓ Starting...
 ✓ Ready in 1102ms
 ✓ Compiled /middleware in 385ms (223 modules)
 ○ Compiling / ...
 ✓ Compiled / in 4.9s (2311 modules)
 GET / 200 in 5407ms
```

Grep for the bug signature:

```
$ grep -i "default export\|@dbml" /tmp/p8-dev-after.log
(no output)
```

No `Attempted import error: '@dbml/core' does not contain a default export` warning.

Routes that import `sql-to-dbml.ts` transitively:
- `app/(dashboard)/projects/[id]/backend/schema/page.tsx`
- `app/(dashboard)/projects/[id]/requirements/architecture/page.tsx`

Both redirected at middleware (HTTP 307 → `/sign-in`) since dev-mode is unauthenticated; the relevant compile signal is unit + downstream-consumer test (covered above) + the bundler-level grep on the dev log (clean).

---

## 7. Diff summary (`apps/product-helper/lib/dbml/sql-to-dbml.ts`)

```diff
-// Importing without types — `@dbml/core` ships a CJS bundle with no
-// TypeScript declarations.
-//
-// eslint-disable-next-line @typescript-eslint/ban-ts-comment
-// @ts-ignore
-import dbmlCore from '@dbml/core';
+// `@dbml/core` ships only named exports (verified against 7.1.1):
+// `{ importer, exporter, Parser, ModelExporter, ... }`. No default export.
+import { importer as dbmlImporter } from '@dbml/core';

   let dbml: string;
   try {
     // dbml-core API: importer.import(content, format) → DBML string
-    const importer = (dbmlCore as { importer: { import: (sql: string, fmt: string) => string } }).importer;
-    dbml = importer.import(ddl, 'postgres');
+    dbml = dbmlImporter.import(ddl, 'postgres');
   } catch (err) {
```

Drops: `// @ts-ignore`, the `as { importer: ... }` cast, the eslint-disable hint, and the dead `importer` local.
Adds: a named-import binding + a one-line type-anchor comment.

The `// @ts-ignore` was hiding only the bogus default-import error (verified via tsc post-fix); no separate type error surfaces.
