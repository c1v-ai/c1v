'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid once
let mermaidInitialized = false;
if (typeof window !== 'undefined' && !mermaidInitialized) {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
  });
  mermaidInitialized = true;
}

interface InlineMermaidProps {
  syntax: string;
}

/**
 * Lightweight inline mermaid renderer for chat messages
 * No zoom/export controls - just renders the diagram
 */
export function InlineMermaid({ syntax }: InlineMermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!syntax || syntax.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Invalid diagram syntax');
      return;
    }

    let isCancelled = false;
    const timeoutId = setTimeout(() => {
      if (!isCancelled && status === 'loading') {
        setStatus('error');
        setErrorMessage('Rendering timed out');
      }
    }, 5000);

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Parse first to catch errors quickly
        await mermaid.parse(syntax);

        const { svg } = await mermaid.render(id, syntax);

        if (!isCancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
          setStatus('success');
        }
      } catch (err) {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Failed to render');
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [syntax]);

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
          className="p-3 rounded-lg border text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: 'rgb(239, 68, 68)',
          }}
        >
          Diagram error: {errorMessage}
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
