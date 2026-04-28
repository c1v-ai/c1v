'use client';

import { MarkdownRenderer } from '@/components/chat/markdown-renderer';

const THREE_PASS_OVERVIEW_MERMAID = `flowchart LR
  subgraph P1["Pass 1 — Functional Understanding"]
    P1A[Actors + Context] --> P1B[Use Cases + Data Flows]
    P1B --> P1C[Scope Tree + FFBD + N2]
    P1C --> P1D[FMEA v1 — instrumental]
  end
  subgraph P2["Pass 2 — Requirements Synthesis"]
    P2A[Functional Reqs]
    P2B[NFRs ← FMEA v1]
    P2C[Constants ← NFRs]
  end
  subgraph P3["Pass 3 — Decision"]
    P3A[Alternatives]
    P3B[Decision Matrix + QFD]
    P3C[Interface Specs]
    P3D[FMEA v2 residual]
    P3E[Architecture Recommendation]
  end
  P1 --> P2 --> P3
`;

export interface MethodologyRendererProps {
  /** Raw markdown source from the canonical METHODOLOGY-CORRECTION.md. */
  source: string;
}

export function MethodologyRenderer({ source }: MethodologyRendererProps) {
  const overviewMd = [
    '## Three-pass overview',
    '',
    '```mermaid',
    THREE_PASS_OVERVIEW_MERMAID.trimEnd(),
    '```',
    '',
  ].join('\n');

  return (
    <div className="prose-methodology text-foreground">
      <MarkdownRenderer content={overviewMd} />
      <MarkdownRenderer content={source} />
    </div>
  );
}
