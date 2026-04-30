import { readFileSync } from 'fs';
import { parse } from 'yaml';
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
  const data = parse(m[1]);
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
