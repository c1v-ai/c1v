'use client';

/**
 * Open Questions archive viewer — read-only, collapsible-accordion view of
 * the system-question-bridge ledger. Aggregates the three buckets:
 *   - requirements   ← M2 NFR + Wave-E engine
 *   - qfdResolved    ← M6 HoQ
 *   - riskResolved   ← M8 fmea-residual
 */

import { useState } from 'react';
import { ChevronRight, MessageSquareText, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  OpenQuestionLedgerEntry,
  OpenQuestionSource,
} from '@/lib/chat/system-question-bridge.types';

export type OpenQuestionsLedger = {
  requirements?: OpenQuestionLedgerEntry[];
  qfdResolved?: OpenQuestionLedgerEntry[];
  riskResolved?: OpenQuestionLedgerEntry[];
};

interface OpenQuestionsViewerProps {
  projectId: number;
  ledger: OpenQuestionsLedger | undefined | null;
  buildChatUrl?: (projectId: number, conversationId: number) => string;
  /** Optional default-open state for accordion rows (used in tests). */
  defaultOpen?: boolean;
}

const BUCKET_META: Array<{
  key: keyof OpenQuestionsLedger;
  label: string;
  description: string;
}> = [
  {
    key: 'requirements',
    label: 'Requirements (M2 NFR / engine)',
    description: 'Open questions raised when an NFR target could not be inferred with ≥0.90 confidence.',
  },
  {
    key: 'qfdResolved',
    label: 'QFD (M6 House of Quality)',
    description: 'Conflicting customer-vs-engineering signals surfaced during HoQ synthesis.',
  },
  {
    key: 'riskResolved',
    label: 'Risk (M8 FMEA-residual)',
    description: 'Unresolved residual-risk follow-ups from FMEA.',
  },
];

const SOURCE_LABEL: Record<OpenQuestionSource, string> = {
  m2_nfr: 'M2 NFR',
  m2_constants: 'M2 Constants',
  m6_qfd: 'M6 QFD',
  m8_residual: 'M8 Risk',
  wave_e_engine: 'Engine',
};

function defaultBuildChatUrl(projectId: number, conversationId: number) {
  return `/projects/${projectId}/chat?messageId=${conversationId}`;
}

function StatusPill({ status }: { status: 'pending' | 'answered' }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px]',
        status === 'answered'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
      )}
    >
      {status}
    </Badge>
  );
}

function QuestionRow({
  entry,
  projectId,
  buildChatUrl,
  defaultOpen = false,
}: {
  entry: OpenQuestionLedgerEntry;
  projectId: number;
  buildChatUrl: (projectId: number, conversationId: number) => string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li className="rounded-md border bg-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring rounded-md">
          <ChevronRight
            className={cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', open && 'rotate-90')}
            aria-hidden
          />
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            {SOURCE_LABEL[entry.source]}
          </span>
          <span className="text-sm text-foreground flex-1 truncate">{entry.question}</span>
          <StatusPill status={entry.status} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3 pt-1 text-xs">
          <p className="text-foreground">{entry.question}</p>
          {entry.math_trace ? (
            <pre className="mt-2 whitespace-pre-wrap rounded bg-muted/60 p-2 font-mono text-[11px] text-foreground">
              {entry.math_trace}
            </pre>
          ) : null}
          {entry.computed_options && entry.computed_options.length > 0 ? (
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Computed options
              </div>
              <pre className="mt-1 rounded bg-muted/60 p-2 font-mono text-[11px] text-foreground overflow-x-auto">
                {JSON.stringify(entry.computed_options, null, 2)}
              </pre>
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-3 flex-wrap text-muted-foreground">
            <span>Created {new Date(entry.created_at).toLocaleString()}</span>
            {entry.answered_at ? (
              <span>Answered {new Date(entry.answered_at).toLocaleString()}</span>
            ) : null}
            <a
              href={buildChatUrl(projectId, entry.reply_conversation_id ?? entry.conversation_id)}
              className="inline-flex items-center gap-1 text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
            >
              <Link2 className="h-3 w-3" aria-hidden />
              Jump to chat thread
            </a>
            {entry.reply_body ? (
              <span className="inline-flex items-center gap-1">
                <MessageSquareText className="h-3 w-3" aria-hidden />
                Reply: {entry.reply_body.slice(0, 80)}
                {entry.reply_body.length > 80 ? '…' : ''}
              </span>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export function OpenQuestionsViewer({
  projectId,
  ledger,
  buildChatUrl = defaultBuildChatUrl,
  defaultOpen = false,
}: OpenQuestionsViewerProps) {
  const totalCount =
    (ledger?.requirements?.length ?? 0) +
    (ledger?.qfdResolved?.length ?? 0) +
    (ledger?.riskResolved?.length ?? 0);

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Questions</CardTitle>
          <CardDescription>
            System-generated clarification questions surface here as the pipeline runs.
            None recorded yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Open Questions</CardTitle>
          <CardDescription>
            {totalCount} clarification {totalCount === 1 ? 'question' : 'questions'}{' '}
            from the requirements, QFD, and residual-risk passes.
          </CardDescription>
        </CardHeader>
      </Card>

      {BUCKET_META.map(({ key, label, description }) => {
        const entries = ledger?.[key] ?? [];
        if (entries.length === 0) return null;
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-base">{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {entries.map((entry, i) => (
                  <QuestionRow
                    key={`${key}-${entry.conversation_id}-${i}`}
                    entry={entry}
                    projectId={projectId}
                    buildChatUrl={buildChatUrl}
                    defaultOpen={defaultOpen}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
