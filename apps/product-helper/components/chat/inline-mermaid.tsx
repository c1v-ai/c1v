'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface InlineMermaidProps {
  syntax: string;
}

/**
 * Lightweight inline mermaid renderer for chat messages
 * Uses mermaid.run() API which is more reliable than mermaid.render()
 */
export function InlineMermaid({ syntax }: InlineMermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Initialize mermaid on first use
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!syntax || syntax.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Invalid diagram syntax');
      return;
    }

    // Basic validation
    const trimmed = syntax.trim().toLowerCase();
    const validStarts = ['graph', 'flowchart', 'sequencediagram', 'classdiagram', 'statediagram', 'erdiagram', 'gantt', 'pie', 'journey'];
    if (!validStarts.some(s => trimmed.startsWith(s))) {
      setStatus('error');
      setErrorMessage('Invalid mermaid diagram type');
      return;
    }

    setStatus('loading');

    // Create a hidden element in the actual DOM for mermaid to render into
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';

    const mermaidElement = document.createElement('pre');
    mermaidElement.className = 'mermaid';
    mermaidElement.textContent = syntax;

    hiddenContainer.appendChild(mermaidElement);
    document.body.appendChild(hiddenContainer);

    let timeoutId: NodeJS.Timeout;
    let completed = false;

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (!completed) {
            reject(new Error('Rendering timed out after 8 seconds'));
          }
        }, 8000);
      });

      // Use mermaid.run() which is more reliable than mermaid.render()
      const renderPromise = mermaid.run({
        nodes: [mermaidElement],
        suppressErrors: false,
      });

      await Promise.race([renderPromise, timeoutPromise]);
      completed = true;
      clearTimeout(timeoutId!);

      // Extract the rendered SVG
      const svg = mermaidElement.querySelector('svg');
      if (svg && containerRef.current) {
        // Clone and insert the SVG
        const clonedSvg = svg.cloneNode(true) as SVGElement;
        clonedSvg.style.maxWidth = '100%';
        clonedSvg.style.height = 'auto';
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(clonedSvg);
        setStatus('success');
      } else {
        throw new Error('No SVG generated');
      }
    } catch (err) {
      completed = true;
      clearTimeout(timeoutId!);
      console.error('Mermaid render error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to render diagram');
    } finally {
      // Clean up hidden element
      if (document.body.contains(hiddenContainer)) {
        document.body.removeChild(hiddenContainer);
      }
    }
  }, [syntax]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram, retryCount]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  // Generate mermaid.live URL for external viewing
  const getMermaidLiveUrl = () => {
    try {
      const encoded = btoa(encodeURIComponent(syntax));
      return `https://mermaid.live/edit#base64:${encoded}`;
    } catch {
      return 'https://mermaid.live';
    }
  };

  if (status === 'loading') {
    return (
      <div
        className="my-3 p-4 rounded-lg border flex items-center justify-center min-h-[100px]"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span className="text-sm">Rendering diagram...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="my-3 space-y-2">
        <div
          className="p-3 rounded-lg border text-sm flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <span style={{ color: 'rgb(239, 68, 68)' }}>
            Diagram error: {errorMessage}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="px-2 py-1 text-xs rounded hover:bg-white/10"
              style={{ color: 'var(--accent)' }}
            >
              Retry
            </button>
            <a
              href={getMermaidLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs rounded hover:bg-white/10"
              style={{ color: 'var(--accent)' }}
            >
              Open in Mermaid Live
            </a>
          </div>
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Show syntax
          </summary>
          <pre
            className="mt-1 p-2 rounded overflow-x-auto"
            style={{
              fontFamily: 'var(--font-heading)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {syntax}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-3 p-4 rounded-lg border overflow-x-auto"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    />
  );
}
