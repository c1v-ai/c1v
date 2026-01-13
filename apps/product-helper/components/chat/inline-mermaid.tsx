'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Track initialization
let isInitialized = false;

interface InlineMermaidProps {
  syntax: string;
}

/**
 * Lightweight inline mermaid renderer for chat messages
 */
export function InlineMermaid({ syntax }: InlineMermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Initialize mermaid once
    if (!isInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        logLevel: 'error',
      });
      isInitialized = true;
    }

    // Render the diagram
    let cancelled = false;

    const render = async () => {
      if (!syntax || syntax.trim().length < 10) {
        setStatus('error');
        setErrorMessage('No diagram syntax provided');
        return;
      }

      // Basic validation
      const trimmed = syntax.trim().toLowerCase();
      const validStarts = ['graph', 'flowchart', 'sequencediagram', 'classdiagram', 'statediagram', 'erdiagram', 'gantt', 'pie', 'journey', 'mindmap', 'timeline', 'sankey', 'xy'];
      if (!validStarts.some(s => trimmed.startsWith(s))) {
        setStatus('error');
        setErrorMessage(`Invalid diagram type. Must start with: ${validStarts.slice(0, 5).join(', ')}...`);
        return;
      }

      setStatus('loading');

      // Generate unique ID
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      try {
        // Use mermaid.render() which returns SVG string directly
        const { svg } = await mermaid.render(id, syntax);

        if (!cancelled) {
          setSvgContent(svg);
          setStatus('success');
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    };

    // Small delay to let React finish rendering
    const timeoutId = setTimeout(render, 50);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [syntax, retryCount]);

  // Update container when SVG changes
  useEffect(() => {
    if (svgContent && containerRef.current) {
      containerRef.current.innerHTML = svgContent;
      // Make SVG responsive
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.removeAttribute('height');
      }
    }
  }, [svgContent]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  // Generate mermaid.live URL for external viewing
  const getMermaidLiveUrl = () => {
    try {
      // Use pako compression like mermaid.live does
      const encoded = btoa(unescape(encodeURIComponent(syntax)));
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
          className="p-3 rounded-lg border text-sm flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <span style={{ color: 'rgb(239, 68, 68)' }} className="flex-1">
            Diagram error: {errorMessage}
          </span>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleRetry}
              className="px-2 py-1 text-xs rounded hover:bg-black/5"
              style={{ color: 'var(--accent)' }}
            >
              Retry
            </button>
            <a
              href={getMermaidLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs rounded hover:bg-black/5"
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
            className="mt-1 p-2 rounded overflow-x-auto whitespace-pre-wrap"
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
