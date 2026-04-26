/**
 * SectionFigures — renders the recommendation's Mermaid diagrams via the
 * FROZEN diagram-viewer (import only, never modify).
 *
 * Mermaid keys per architecture_recommendation.v1: context | use_case |
 * class | sequence | decision_network. The FROZEN DiagramViewer accepts
 * type='context'|'useCase'|'class'|'activity' — `sequence` and
 * `decision_network` are rendered with the closest-fit `activity` type
 * (still raw Mermaid text per D-V21.03).
 */

import { DiagramViewer } from '@/components/diagrams/diagram-viewer';

import type { MermaidDiagramKey } from './types';

interface SectionFiguresProps {
  diagrams: Record<MermaidDiagramKey, string>;
}

const FIGURE_ORDER: {
  key: MermaidDiagramKey;
  title: string;
  type: 'context' | 'useCase' | 'class' | 'activity';
}[] = [
  { key: 'context', title: 'Context Diagram', type: 'context' },
  { key: 'use_case', title: 'Use Case Diagram', type: 'useCase' },
  { key: 'class', title: 'Class Diagram', type: 'class' },
  { key: 'sequence', title: 'Sequence Diagram', type: 'activity' },
  { key: 'decision_network', title: 'Decision Network', type: 'activity' },
];

export function SectionFigures({ diagrams }: SectionFiguresProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Figures</h2>
      {FIGURE_ORDER.map(({ key, title, type }) => {
        const syntax = diagrams[key];
        if (!syntax) return null;
        return (
          <DiagramViewer
            key={key}
            syntax={syntax}
            type={type}
            title={title}
          />
        );
      })}
    </div>
  );
}
