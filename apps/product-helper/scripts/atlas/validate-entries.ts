import { readFileSync } from 'fs';
// @ts-expect-error -- js-yaml not in package.json; script is dead code.
// Restore by adding `js-yaml` + `@types/js-yaml` to devDependencies if/when
// this validator gets reactivated. Suppression keeps `next build` lint pass
// green; runtime invocation via `pnpm tsx` would fail on missing module.
import { load, JSON_SCHEMA } from 'js-yaml';
import { companyAtlasEntrySchema } from '../../lib/langchain/schemas/atlas/entry';

const paths = process.argv.slice(2);
let failed = 0;
for (const p of paths) {
  const raw = readFileSync(p, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    console.log(`${p}: NO FRONTMATTER`);
    failed++;
    continue;
  }
  const data = load(m[1], { schema: JSON_SCHEMA });
  const r = companyAtlasEntrySchema.safeParse(data);
  if (r.success) {
    console.log(`${p}: CLEAN`);
  } else {
    console.log(`${p}: FAIL`);
    console.log(JSON.stringify(r.error.issues, null, 2));
    failed++;
  }
}
process.exit(failed > 0 ? 1 : 0);
