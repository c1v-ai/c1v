'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Markdown Renderer Component
 * Renders markdown content with GitHub Flavored Markdown support
 * Styled to match the custom theme
 */
export function MarkdownRenderer({ content }: { content: string }) {
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

        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="mb-3 leading-relaxed" {...props} />
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="ml-4" {...props} />
        ),

        // Code
        code: ({ node, inline, ...props }: any) => {
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
              />
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
            />
          );
        },
        pre: ({ node, ...props }) => (
          <pre className="my-3" {...props} />
        ),

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

        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong className="font-bold" {...props} />
        ),

        // Emphasis/Italic
        em: ({ node, ...props }) => (
          <em className="italic" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
