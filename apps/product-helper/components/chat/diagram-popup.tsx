'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiagramViewer } from '@/components/diagrams/diagram-viewer';
import { detectDiagramType } from './diagram-link-card';

/**
 * Diagram Popup Component
 * A modal that displays a Mermaid diagram using the DiagramViewer
 */
export interface DiagramPopupProps {
  isOpen: boolean;
  onClose: () => void;
  syntax: string;
  title?: string;
}

export function DiagramPopup({
  isOpen,
  onClose,
  syntax,
  title,
}: DiagramPopupProps) {
  // Detect diagram type to determine the title and type for DiagramViewer
  const diagramInfo = detectDiagramType(syntax);

  // Map diagram type to DiagramViewer type prop
  const getViewerType = (): 'context' | 'useCase' | 'class' => {
    switch (diagramInfo.type) {
      case 'context':
        return 'context';
      case 'useCase':
        return 'useCase';
      case 'class':
        return 'class';
      case 'sequence':
      case 'activity':
      default:
        // DiagramViewer only supports context, useCase, class
        // Default to 'context' for other types
        return 'context';
    }
  };

  const displayTitle = title || diagramInfo.title.replace('View ', '');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            {displayTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[500px] overflow-auto">
          <DiagramViewer
            syntax={syntax}
            type={getViewerType()}
            className="border-0 shadow-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
