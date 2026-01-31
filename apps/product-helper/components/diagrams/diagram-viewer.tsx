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
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  AlertCircle,
  Copy,
  Code,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cleanSequenceDiagramSyntax } from '@/lib/diagrams/generators';
import { renderDiagramSvg, type DiagramTheme } from '@/lib/diagrams/beautiful-mermaid';

export interface DiagramViewerProps {
  /** Mermaid syntax string */
  syntax: string;
  /** Diagram type for identification */
  type: 'context' | 'useCase' | 'class' | 'activity';
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional callback to regenerate the diagram */
  onRegenerate?: () => void;
}

export function DiagramViewer({
  syntax,
  type,
  title,
  description,
  className,
  onRegenerate,
}: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Theme support for beautiful-mermaid
  const { resolvedTheme } = useTheme();
  const diagramTheme: DiagramTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // Pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Render diagram when syntax changes
  useEffect(() => {
    // Handle empty or invalid syntax
    if (!syntax || syntax.trim().length < 10) {
      setIsRendering(false);
      setError('No diagram data available yet. Complete the chat to gather requirements.');
      return;
    }

    // Safety net: Clean invalid syntax from sequence diagrams
    // Primary cleanup happens on save (conversations.ts), but this handles:
    // 1. Existing bad data in DB from before the fix was deployed
    // 2. Edge cases where detection might have failed on save
    // The function is idempotent - returns original if no cleanup needed
    const cleanedSyntax = cleanSequenceDiagramSyntax(syntax);

    // Log when safety net catches bad data - helps identify if new bad data is still being saved
    if (cleanedSyntax !== syntax) {
      console.warn(
        '[DiagramViewer] Safety net cleaned invalid syntax from sequence diagram.',
        'This indicates bad data in the database that should have been cleaned on save.',
        { originalLength: syntax.length, cleanedLength: cleanedSyntax.length }
      );
    }

    // Basic validation - check for common mermaid diagram declarations
    // Skip init directives (%%{init: ...}%%) and comments (%% ...) before checking
    const syntaxLines = cleanedSyntax.trim().split('\n');
    const firstContentLine = syntaxLines
      .find(line => {
        const t = line.trim();
        return t.length > 0 && !t.startsWith('%%');
      })
      ?.trim()
      .toLowerCase() ?? '';
    const validStartPatterns = ['graph', 'flowchart', 'sequencediagram', 'classdiagram', 'statediagram', 'erdiagram', 'gantt', 'pie', 'journey'];
    const hasValidStart = validStartPatterns.some(p => firstContentLine.startsWith(p));

    if (!hasValidStart) {
      setIsRendering(false);
      setError('Invalid diagram syntax. Expected mermaid diagram declaration.');
      return;
    }

    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    const renderDiagram = async () => {
      try {
        setIsRendering(true);
        setError(null);

        // Set a hard timeout that will cancel and show error
        timeoutId = setTimeout(() => {
          if (!isCancelled) {
            isCancelled = true;
            setIsRendering(false);
            setError('Diagram rendering timed out after 15 seconds. The syntax may be invalid.');
          }
        }, 15000); // 15 second timeout

        // Render the diagram using beautiful-mermaid with theme support
        const svg = await renderDiagramSvg(cleanedSyntax, diagramTheme);

        clearTimeout(timeoutId);
        if (!isCancelled) {
          setSvgContent(svg);
          setIsRendering(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (!isCancelled) {
          console.error('Beautiful Mermaid rendering error:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setIsRendering(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [syntax, type, diagramTheme]); // Re-render when theme changes

  // Update container with SVG
  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;

      // Apply scale + pan transform
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`;
        svg.style.transformOrigin = 'top left';
        svg.style.transition = isPanningRef.current ? 'none' : 'transform 0.2s ease';
      }
    }
  }, [svgContent, scale, panOffset]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // left click only
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handlePointerUp = () => {
    isPanningRef.current = false;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syntax);
      toast.success('Mermaid code copied to clipboard');
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
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

        // Get dimensions from SVG - handle missing width/height by using viewBox
        let width = parseInt(svg.getAttribute('width') || '0', 10);
        let height = parseInt(svg.getAttribute('height') || '0', 10);

        // Fallback to viewBox dimensions if width/height not set
        if (width === 0 || height === 0) {
          const viewBox = svg.getAttribute('viewBox');
          if (viewBox) {
            const parts = viewBox.split(/[\s,]+/);
            if (parts.length >= 4) {
              width = parseInt(parts[2], 10) || 800;
              height = parseInt(parts[3], 10) || 600;
            }
          }
          // Last resort fallback
          if (width === 0) width = 800;
          if (height === 0) height = 600;

          // Set dimensions on SVG for proper rendering
          svg.setAttribute('width', String(width));
          svg.setAttribute('height', String(height));
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Set up timeout to handle stalled image loads
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(url);
          toast.error('PNG export timed out');
        }, 10000);

        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          toast.error('Failed to convert diagram to PNG');
        };

        img.onload = () => {
          clearTimeout(timeout);

          // Use our calculated dimensions if img dimensions are 0
          const imgWidth = img.width > 0 ? img.width : width;
          const imgHeight = img.height > 0 ? img.height : height;

          canvas.width = imgWidth;
          canvas.height = imgHeight;
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
            } else {
              toast.error('Failed to generate PNG blob');
            }
          }, 'image/png', 1.0);

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
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-destructive">Failed to render diagram</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
            {/* Show raw syntax so user can at least see what was generated */}
            {syntax && syntax.length > 10 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Show raw mermaid syntax
                </summary>
                <pre
                  className="mt-2 p-3 rounded text-xs overflow-x-auto"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {syntax}
                </pre>
              </details>
            )}
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
          <div className="flex items-center gap-1 flex-wrap">
            {/* Zoom controls */}
            <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} title="Reset view">
              <Maximize2 className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* View controls */}
            <Button
              variant={showCode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowCode((prev) => !prev)}
              title="Toggle code view"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyCode} title="Copy Mermaid code">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} title="Toggle fullscreen">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {onRegenerate && (
              <Button variant="outline" size="sm" onClick={onRegenerate} title="Regenerate diagram">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            <div className="w-px h-5 bg-border mx-1" />

            {/* Export controls */}
            <Button variant="outline" size="sm" onClick={() => handleExport('svg')} title="Export SVG">
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('png')} title="Export PNG">
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={showCode ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}>
          {/* Diagram pane */}
          <div
            ref={wrapperRef}
            className={cn(
              'overflow-hidden border rounded-lg p-6',
              'bg-muted/30',
              'min-h-[400px] relative',
              'cursor-grab active:cursor-grabbing',
              'select-none'
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Always render the container to avoid ref deadlock */}
            <div
              ref={containerRef}
              className={cn(
                'diagram-container flex items-center justify-center',
                isRendering && 'invisible'
              )}
            />
            {/* Loading overlay */}
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Rendering diagram...</p>
                </div>
              </div>
            )}
          </div>

          {/* Code pane (D06) */}
          {showCode && (
            <div className="border rounded-lg overflow-hidden">
              <div
                className="px-3 py-2 text-xs font-semibold border-b"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                Mermaid Source
              </div>
              <pre
                className="p-4 text-xs overflow-auto max-h-[500px]"
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              >
                {syntax}
              </pre>
            </div>
          )}
        </div>
      </CardContent>

      {/* Fullscreen overlay (D09) */}
      {isFullscreen && (
        <FullscreenOverlay
          title={title}
          svgContent={svgContent}
          scale={scale}
          panOffset={panOffset}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onCopyCode={handleCopyCode}
          onExportPng={() => handleExport('png')}
          onClose={toggleFullscreen}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}
    </Card>
  );
}

/**
 * Fullscreen Overlay Component
 * Renders SVG diagram in a full-screen view with controls.
 * Uses a ref callback to clone the rendered SVG from the main container.
 */
function FullscreenOverlay({
  title,
  svgContent,
  scale,
  panOffset,
  onZoomIn,
  onZoomOut,
  onReset,
  onCopyCode,
  onExportPng,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  title?: string;
  svgContent: string;
  scale: number;
  panOffset: { x: number; y: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCopyCode: () => void;
  onExportPng: () => void;
  onClose: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}) {
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Clone SVG from the already-rendered mermaid output into the fullscreen container
  useEffect(() => {
    if (!fullscreenRef.current || !svgContent) return;
    // Parse SVG using DOMParser (safe: content comes from mermaid.render, a trusted library)
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (svgEl) {
      fullscreenRef.current.replaceChildren(svgEl);
      svgEl.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`;
      svgEl.style.transformOrigin = 'center center';
    }
  }, [svgContent, scale, panOffset]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          {title && (
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onZoomOut} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={onZoomIn} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} title="Reset view">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={onCopyCode} title="Copy code">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPng} title="Export PNG">
            <Download className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={onClose} title="Exit fullscreen (Esc)">
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={fullscreenRef}
          className="diagram-container w-full h-full flex items-center justify-center p-6"
        />
      </div>
    </div>
  );
}

/**
 * Diagram Grid Component
 * Displays multiple diagrams in a responsive grid
 */
export interface DiagramGridProps {
  diagrams: Array<{
    type: 'context' | 'useCase' | 'class' | 'activity';
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
