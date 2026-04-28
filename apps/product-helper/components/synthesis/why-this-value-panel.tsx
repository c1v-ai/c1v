'use client';

/**
 * WhyThisValuePanel — side-panel rendered by `WhyThisValueButton`.
 *
 * Five sections (per EC-V21-E.11):
 *   1. Matched rule — rule id + plain-language summary.
 *   2. Math trace — formula + inputs + modifiers + final confidence.
 *   3. KB references — links to chunk source files (resolved via searchKB).
 *   4. Override history — chronological scan of the (project_id, target_field)
 *      audit stream (append-row pattern; see why-this-value-types.ts).
 *   5. Override CTA — opens the modal `OverrideForm` for manual override.
 *
 * Data source:
 *   - `initialPayload` prop when the parent already has it (e.g. preloaded
 *     from a `recommendation_json` artifact).
 *   - Otherwise fetched from
 *     `/api/decision-audit/[projectId]/[targetField]/explain`. The API
 *     resolver is owned by `kb-rewrite` (its `explain_decision` LangGraph
 *     node feeds this endpoint).
 *
 * Layout:
 *   Reuses `components/chat/`-style panel chrome via the shadcn `Sheet`
 *   primitive (D-V21.23). NO new design tokens. NO Figma blocker
 *   (EC-V21-A.11 visual-style lock).
 *
 * @module components/synthesis/why-this-value-panel
 */

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';

import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type {
  ExplainDecisionResponse,
  KbReference,
  OverrideHistoryEntry,
} from './why-this-value-types';
import { OverrideForm } from './override-form';

export interface WhyThisValuePanelProps {
  projectId: number;
  decisionId: string;
  targetField: string;
  storyId: string;
  engineVersion: string;
  initialPayload?: ExplainDecisionResponse;
  onClose: () => void;
}

type PanelState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; payload: ExplainDecisionResponse };

export function WhyThisValuePanel({
  projectId,
  decisionId,
  targetField,
  storyId,
  engineVersion,
  initialPayload,
  onClose,
}: WhyThisValuePanelProps) {
  const [state, setState] = useState<PanelState>(
    initialPayload
      ? { kind: 'ready', payload: initialPayload }
      : { kind: 'loading' },
  );
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const fetchExplain = useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      const url = `/api/decision-audit/${projectId}/${encodeURIComponent(
        targetField,
      )}/explain`;
      const res = await fetch(url, { credentials: 'same-origin' });
      if (res.status === 403) {
        setState({ kind: 'error', message: 'Access denied for this project.' });
        return;
      }
      if (!res.ok) {
        setState({
          kind: 'error',
          message: `Failed to load provenance (HTTP ${res.status}).`,
        });
        return;
      }
      const json = (await res.json()) as ExplainDecisionResponse;
      setState({ kind: 'ready', payload: json });
    } catch (err) {
      setState({
        kind: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Unknown error fetching provenance.',
      });
    }
  }, [projectId, targetField]);

  useEffect(() => {
    if (!initialPayload) {
      void fetchExplain();
    }
  }, [fetchExplain, initialPayload]);

  return (
    <div data-testid="why-this-value-panel" className="flex h-full flex-col">
      <SheetHeader className="border-b border-border">
        <SheetTitle className="text-lg">Why this value?</SheetTitle>
        <SheetDescription>
          {decisionId} · {targetField}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {state.kind === 'loading' && (
          <div
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            Loading provenance…
          </div>
        )}

        {state.kind === 'error' && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground"
          >
            <p className="flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4 w-4" />
              {state.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void fetchExplain()}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {state.kind === 'ready' && (
          <PanelBody
            payload={state.payload}
            onOverrideClick={() => setShowOverrideForm(true)}
          />
        )}
      </div>

      {state.kind === 'ready' && showOverrideForm && (
        <OverrideForm
          projectId={projectId}
          decisionId={decisionId}
          targetField={targetField}
          storyId={storyId}
          engineVersion={engineVersion}
          currentValue={state.payload.value}
          currentUnits={state.payload.units}
          userOverrideable={state.payload.user_overrideable}
          onClose={() => setShowOverrideForm(false)}
          onSubmitted={() => {
            setShowOverrideForm(false);
            void fetchExplain();
          }}
        />
      )}

      <div className="border-t border-border p-4 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function PanelBody({
  payload,
  onOverrideClick,
}: {
  payload: ExplainDecisionResponse;
  onOverrideClick: () => void;
}) {
  return (
    <>
      <SectionMatchedRule payload={payload} />
      <SectionMathTrace payload={payload} />
      <SectionKbReferences refs={payload.kb_references} />
      <SectionOverrideHistory entries={payload.override_history} />
      <SectionOverrideCta
        userOverrideable={payload.user_overrideable}
        onOverrideClick={onOverrideClick}
      />
    </>
  );
}

function SectionMatchedRule({ payload }: { payload: ExplainDecisionResponse }) {
  const rule = payload.matched_rule;
  return (
    <section
      data-testid="section-matched-rule"
      aria-labelledby="why-rule-heading"
      className="space-y-2"
    >
      <h3 id="why-rule-heading" className="text-sm font-semibold text-foreground">
        Matched rule
      </h3>
      <div className="flex flex-wrap items-baseline gap-2">
        <Badge variant={rule.rule_id ? 'secondary' : 'outline'}>
          {rule.rule_id ?? 'fallback'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {rule.story_id} · engine {rule.engine_version}
        </span>
      </div>
      <p className="text-sm text-foreground">{rule.summary}</p>
    </section>
  );
}

function SectionMathTrace({ payload }: { payload: ExplainDecisionResponse }) {
  const m = payload.math;
  return (
    <section
      data-testid="section-math-trace"
      aria-labelledby="why-math-heading"
      className="space-y-2"
    >
      <h3 id="why-math-heading" className="text-sm font-semibold text-foreground">
        Math trace
      </h3>
      <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs text-foreground font-mono">
        {m.trace}
      </pre>
      {Object.keys(m.inputs_used).length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Inputs</p>
          <ul className="space-y-0.5">
            {Object.entries(m.inputs_used).map(([k, v]) => (
              <li key={k}>
                <span className="font-mono">{k}</span>:{' '}
                <span className="font-mono">{stringifyShort(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {m.modifiers_applied.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Modifiers</p>
          <ul className="space-y-0.5">
            {m.modifiers_applied.map((mod, i) => (
              <li key={i}>
                <span className="font-mono">{mod.id ?? mod.modifier ?? '?'}</span>
                {typeof mod.delta === 'number' && (
                  <>
                    {' '}
                    <span className="font-mono">
                      {mod.delta >= 0 ? '+' : ''}
                      {mod.delta.toFixed(3)}
                    </span>
                  </>
                )}
                {mod.reason && <> — {mod.reason}</>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Confidence: base {(m.base_confidence * 100).toFixed(0)}% → final{' '}
        {(m.final_confidence * 100).toFixed(0)}%
      </p>
    </section>
  );
}

function SectionKbReferences({ refs }: { refs: KbReference[] }) {
  return (
    <section
      data-testid="section-kb-references"
      aria-labelledby="why-kb-heading"
      className="space-y-2"
    >
      <h3 id="why-kb-heading" className="text-sm font-semibold text-foreground">
        KB references
      </h3>
      {refs.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No KB chunks fed this decision (deterministic rule path).
        </p>
      ) : (
        <ul className="space-y-2">
          {refs.map((r) => (
            <li
              key={r.chunk_id}
              className="rounded-md border border-border p-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-foreground">{r.kb_source}</span>
                {typeof r.score === 'number' && (
                  <Badge variant="outline" className="text-xs">
                    {(r.score * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-muted-foreground line-clamp-3">
                {r.excerpt}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {r.chunk_id}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SectionOverrideHistory({
  entries,
}: {
  entries: OverrideHistoryEntry[];
}) {
  return (
    <section
      data-testid="section-override-history"
      aria-labelledby="why-history-heading"
      className="space-y-2"
    >
      <h3
        id="why-history-heading"
        className="text-sm font-semibold text-foreground"
      >
        Override history
      </h3>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No prior writes on this stream.
        </p>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-1 pr-2 text-left font-medium">When</th>
              <th className="py-1 pr-2 text-left font-medium">By</th>
              <th className="py-1 pr-2 text-left font-medium">Value</th>
              <th className="py-1 text-left font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.audit_id} className="border-b border-border/50">
                <td className="py-1 pr-2 font-mono text-muted-foreground">
                  {new Date(e.evaluated_at).toLocaleString()}
                </td>
                <td className="py-1 pr-2 font-mono text-foreground">
                  {e.agent_id}
                </td>
                <td className="py-1 pr-2 font-mono text-foreground">
                  {stringifyShort(e.value)}
                  {e.units ? ` ${e.units}` : ''}
                </td>
                <td className="py-1 text-muted-foreground">
                  {e.auto_filled ? 'auto-fill' : e.rationale ?? 'override'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function SectionOverrideCta({
  userOverrideable,
  onOverrideClick,
}: {
  userOverrideable: boolean;
  onOverrideClick: () => void;
}) {
  return (
    <section
      data-testid="section-override-cta"
      aria-labelledby="why-cta-heading"
      className="space-y-2"
    >
      <h3 id="why-cta-heading" className="text-sm font-semibold text-foreground">
        Override
      </h3>
      {userOverrideable ? (
        <Button onClick={onOverrideClick} size="sm" variant="default">
          Override this value
        </Button>
      ) : (
        <p
          className={cn(
            'rounded-md border border-border bg-muted p-2 text-xs text-muted-foreground',
          )}
        >
          This value is not user-overrideable (engine policy).
        </p>
      )}
    </section>
  );
}

function stringifyShort(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    const s = JSON.stringify(v);
    return s.length > 80 ? `${s.slice(0, 77)}…` : s;
  } catch {
    return '[unserializable]';
  }
}
