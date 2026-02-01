'use client';

import React, { useMemo, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiagramLinkCard } from './diagram-link-card';
import { TooltipTerm } from '@/components/education/tooltip-term';
import { getEducationContext } from '@/lib/education/phase-mapping';
import type { ArtifactPhase } from '@/lib/langchain/graphs/types';
import type { TooltipTerm as TooltipTermData } from '@/lib/education/knowledge-bank';

/**
 * Markdown Renderer Component
 * Renders markdown content with GitHub Flavored Markdown support
 * Includes Mermaid diagram support via clickable link cards
 * Styled to match the custom theme
 */
export interface MarkdownRendererProps {
  content: string;
  onDiagramClick?: (syntax: string) => void;
  currentPhase?: ArtifactPhase;
}

/** Escape special regex characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scan `text` for tooltip terms and return a ReactNode array where
 * the first occurrence of each term is wrapped in a <TooltipTerm>.
 * Only the first match per term is wrapped to avoid noise.
 */
function processTextWithTooltips(
  text: string,
  tooltipTerms: TooltipTermData[],
): ReactNode {
  if (tooltipTerms.length === 0) return text;

  // Collect first-occurrence matches with their positions
  const matches: { index: number; length: number; term: TooltipTermData }[] = [];

  for (const t of tooltipTerms) {
    const regex = new RegExp(`\\b${escapeRegExp(t.term)}\\b`, 'i');
    const m = regex.exec(text);
    if (m) {
      matches.push({ index: m.index, length: m[0].length, term: t });
    }
  }

  if (matches.length === 0) return text;

  // Sort by position, then remove overlaps
  matches.sort((a, b) => a.index - b.index);
  const filtered: typeof matches = [];
  for (const m of matches) {
    const prev = filtered[filtered.length - 1];
    if (!prev || m.index >= prev.index + prev.length) {
      filtered.push(m);
    }
  }

  // Build segments: plain text interspersed with TooltipTerm elements
  const segments: ReactNode[] = [];
  let cursor = 0;

  for (const m of filtered) {
    if (m.index > cursor) {
      segments.push(text.slice(cursor, m.index));
    }
    segments.push(
      <TooltipTerm
        key={`tt-${m.index}`}
        term={text.slice(m.index, m.index + m.length)}
        definition={m.term.definition}
      />,
    );
    cursor = m.index + m.length;
  }

  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }

  return <>{segments}</>;
}

/**
 * Iterate React children and process only string children through
 * tooltip matching, leaving React elements untouched.
 */
function processChildrenWithTooltips(
  children: ReactNode,
  tooltipTerms: TooltipTermData[],
): ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return processTextWithTooltips(child, tooltipTerms);
    }
    return child;
  });
}

export function MarkdownRenderer({ content, onDiagramClick, currentPhase }: MarkdownRendererProps) {
  const tooltipTerms = useMemo(
    () => (currentPhase ? getEducationContext(currentPhase).tooltipTerms : []),
    [currentPhase],
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ node, ...props }) => (
          <h1
            className="text-2xl font-bold mt-6 mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl font-bold mt-5 mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-lg font-bold mt-4 mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
            {...props}
          />
        ),

        // Paragraphs — apply tooltip processing
        p: ({ node, children, ...props }) => (
          <p className="mb-3 leading-relaxed" {...props}>
            {tooltipTerms.length > 0
              ? processChildrenWithTooltips(children, tooltipTerms)
              : children}
          </p>
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
        ),
        // List items — apply tooltip processing
        li: ({ node, children, ...props }) => (
          <li className="ml-4" {...props}>
            {tooltipTerms.length > 0
              ? processChildrenWithTooltips(children, tooltipTerms)
              : children}
          </li>
        ),

        // Code - with mermaid diagram support
        code: ({ node, inline, className, children, ...props }: any) => {
          // Check if this is a mermaid code block
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const codeContent = String(children).replace(/\n$/, '');

          // Render mermaid diagrams as clickable link cards
          if (!inline && language === 'mermaid') {
            return (
              <DiagramLinkCard
                syntax={codeContent}
                onViewClick={() => onDiagramClick?.(codeContent)}
              />
            );
          }

          if (inline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded text-sm"
                style={{
                  fontFamily: 'var(--font-heading)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                }}
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className="block p-3 rounded my-3 text-sm overflow-x-auto"
              style={{
                fontFamily: 'var(--font-heading)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ node, children, ...props }: any) => {
          // Check if the child is a mermaid code block - if so, don't wrap in pre
          const childrenArray = Array.isArray(children) ? children : [children];
          const hasOnlyMermaidChild = childrenArray.length === 1 &&
            childrenArray[0]?.props?.className?.includes('language-mermaid');

          if (hasOnlyMermaidChild) {
            // Return just the children (DiagramLinkCard) without pre wrapper
            return <>{children}</>;
          }

          return <pre className="my-3" {...props}>{children}</pre>;
        },

        // Links
        a: ({ node, ...props }) => (
          <a
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent)' }}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 pl-4 py-2 my-3 italic"
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--text-muted)',
            }}
            {...props}
          />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-3">
            <table
              className="min-w-full border"
              style={{ borderColor: 'var(--border)' }}
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-4 py-2 text-left font-bold border"
            style={{ borderColor: 'var(--border)' }}
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="px-4 py-2 border"
            style={{ borderColor: 'var(--border)' }}
            {...props}
          />
        ),

        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr
            className="my-6"
            style={{ borderColor: 'var(--border)' }}
            {...props}
          />
        ),

        // Strong/Bold — no tooltip processing
        strong: ({ node, ...props }) => (
          <strong className="font-bold" {...props} />
        ),

        // Emphasis/Italic — no tooltip processing
        em: ({ node, ...props }) => (
          <em className="italic" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
