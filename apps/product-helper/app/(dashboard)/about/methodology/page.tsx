import fs from 'node:fs';
import path from 'node:path';
import { MethodologyRenderer } from '@/components/about/methodology-renderer';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Methodology — Product Helper',
  description:
    'Three-pass systems-engineering ordering used by c1v. Supersedes the linear M1→M7 sequence.',
};

const CANONICAL_REL = 'system-design/kb-upgrade-v2/METHODOLOGY-CORRECTION.md';

function loadCanonicalMethodology(): string {
  const repoRoot = path.resolve(process.cwd(), '..', '..');
  const abs = path.join(repoRoot, CANONICAL_REL);
  return fs.readFileSync(abs, 'utf8');
}

export default function MethodologyPage() {
  const source = loadCanonicalMethodology();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Methodology</h1>
        <p className="text-muted-foreground leading-relaxed">
          c1v uses a three-pass systems-engineering ordering (understand →
          synthesize requirements → decide architecture) instead of the linear
          eCornell M1→M7 sequence. FMEA fires <em>instrumentally</em> at the
          end of Pass 1 so failure modes can shape requirements, rather than
          terminally where they cannot.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Source:{' '}
          <code className="px-1.5 py-0.5 rounded bg-muted border border-border">
            {CANONICAL_REL}
          </code>
        </p>
      </header>
      <MethodologyRenderer source={source} />
    </main>
  );
}
