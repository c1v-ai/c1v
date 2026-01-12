'use client';

/**
 * Diagram Viewer Component (Phase 11)
 *
 * Purpose: Render Mermaid diagrams with interactive features
 * Pattern: Client component with Mermaid.js integration
 * Team: Frontend (Agent 2.3: Data Visualization Engineer)
 *
 * Features:
 * - Mermaid diagram rendering
 * - Zoom and pan controls
 * - Export to PNG/SVG
 * - Responsive sizing
 * - Error handling
 */

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ZoomIn, ZoomOut, Maximize2, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Initialize Mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
  });
}

export interface DiagramViewerProps {
  /** Mermaid syntax string */
  syntax: string;
  /** Diagram type for identification */
  type: 'context' | 'useCase' | 'class';
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Optional CSS class name */
  className?: string;
}

export function DiagramViewer({
  syntax,
  type,
  title,
  description,
  className,
}: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  // Render diagram when syntax changes
  useEffect(() => {
    if (!syntax || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        setIsRendering(true);
        setError(null);

        // Generate unique ID for this diagram
        const id = `diagram-${type}-${Date.now()}`;

        // Render Mermaid diagram
        const { svg } = await mermaid.render(id, syntax);

        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [syntax, type]);

  // Update container with SVG
  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;

      // Apply scale transform
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'top left';
        svg.style.transition = 'transform 0.2s ease';
      }
    }
  }, [svgContent, scale]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  const handleExport = async (format: 'png' | 'svg') => {
    try {
      if (!containerRef.current) return;

      const svg = containerRef.current.querySelector('svg');
      if (!svg) {
        toast.error('No diagram to export');
        return;
      }

      if (format === 'svg') {
        // Export as SVG
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}-diagram.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Diagram exported as SVG');
      } else {
        // Export as PNG (requires canvas conversion)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `${type}-diagram.png`;
              link.click();
              URL.revokeObjectURL(pngUrl);
              toast.success('Diagram exported as PNG');
            }
          });

          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export diagram');
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-6 border border-destructive/50 rounded-lg bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Failed to render diagram</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>{title}</CardTitle>}
            {description && (
              <CardDescription style={{ fontFamily: 'var(--font-body)' }}>
                {description}
              </CardDescription>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('svg')}
            >
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('png')}
            >
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            'overflow-auto border rounded-lg p-6',
            'bg-muted/30',
            'min-h-[400px] flex items-center justify-center'
          )}
        >
          {isRendering ? (
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Rendering diagram...</p>
            </div>
          ) : (
            <div ref={containerRef} className="diagram-container" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Diagram Grid Component
 * Displays multiple diagrams in a responsive grid
 */
export interface DiagramGridProps {
  diagrams: Array<{
    type: 'context' | 'useCase' | 'class';
    syntax: string;
    title: string;
    description?: string;
  }>;
}

export function DiagramGrid({ diagrams }: DiagramGridProps) {
  if (diagrams.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              No diagrams available
            </p>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
              Complete the chat to gather requirements, then diagrams will be generated automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {diagrams.map((diagram, index) => (
        <DiagramViewer
          key={`${diagram.type}-${index}`}
          type={diagram.type}
          syntax={diagram.syntax}
          title={diagram.title}
          description={diagram.description}
        />
      ))}
    </div>
  );
}
