'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Plug } from 'lucide-react';

export function QuickInstructions({ projectId }: { projectId: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          How It Works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div
            className="flex gap-3 rounded-lg border p-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              1
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                <MessageSquare className="inline h-4 w-4 mr-1 -mt-0.5" />
                Chat with Product Helper
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Describe your product idea — the AI builds your PRD as you talk.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="flex gap-3 rounded-lg border p-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            >
              2
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                <Plug className="inline h-4 w-4 mr-1 -mt-0.5" />
                Export to Your IDE
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Go to{' '}
                <Link
                  href={`/projects/${projectId}/connections`}
                  className="underline font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  Connectors
                </Link>
                {' '}to export your PRD to your IDE.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
