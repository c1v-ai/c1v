'use client';

/**
 * OverrideForm — modal form for manual override of an auto-filled value.
 *
 * Append-row override pattern (see why-this-value-types.ts):
 *   The `decision_audit` table is APPEND-ONLY. Submitting this form INSERTs
 *   a NEW audit row with `agent_id='user'`, `auto_filled=false`, the new
 *   value, and the rationale embedded in `math_trace`. The hash chain
 *   continues naturally onto the prior row in the same
 *   `(project_id, target_field)` stream.
 *
 * Validation (client-side):
 *   - `newValue` required, non-empty (parsed permissively — JSON if it
 *     parses as such, otherwise raw string).
 *   - `rationale` required, ≥10 characters. Without rationale, override
 *     history loses context per the deliverable spec.
 *
 * RLS: the API route enforces tenant isolation (project ownership check
 * via session → team_id → projects.team_id). The form just submits.
 *
 * @module components/synthesis/override-form
 */

import { useId, useState, type FormEvent } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MIN_RATIONALE_CHARS = 10;

export interface OverrideFormProps {
  projectId: number;
  decisionId: string;
  targetField: string;
  storyId: string;
  engineVersion: string;
  currentValue: unknown;
  currentUnits: string | null;
  /**
   * Engine policy flag. When false the form refuses to submit and shows a
   * read-only state.
   */
  userOverrideable: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function OverrideForm({
  projectId,
  decisionId,
  targetField,
  storyId,
  engineVersion,
  currentValue,
  currentUnits,
  userOverrideable,
  onClose,
  onSubmitted,
}: OverrideFormProps) {
  const valueInputId = useId();
  const rationaleId = useId();

  const initialValue =
    typeof currentValue === 'string'
      ? currentValue
      : currentValue === null || currentValue === undefined
        ? ''
        : JSON.stringify(currentValue);

  const [newValue, setNewValue] = useState<string>(initialValue);
  const [rationale, setRationale] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedRationale = rationale.trim();
  const rationaleTooShort = trimmedRationale.length < MIN_RATIONALE_CHARS;
  const valueEmpty = newValue.trim().length === 0;
  const canSubmit =
    userOverrideable && !rationaleTooShort && !valueEmpty && !submitting;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const url = `/api/decision-audit/${projectId}/${encodeURIComponent(
        targetField,
      )}/override`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId,
          storyId,
          engineVersion,
          newValue: parseValue(newValue),
          rationale: trimmedRationale,
        }),
      });
      if (res.status === 403) {
        setError('Access denied for this project.');
        return;
      }
      if (res.status === 409) {
        setError('Engine policy disallows override on this field.');
        return;
      }
      if (!res.ok) {
        const detail = await safeJson(res);
        setError(
          detail?.error ?? `Failed to write override (HTTP ${res.status}).`,
        );
        return;
      }
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override value</DialogTitle>
          <DialogDescription>
            {decisionId} · <span className="font-mono">{targetField}</span>
          </DialogDescription>
        </DialogHeader>
        <form
          data-testid="override-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor={valueInputId}>
              New value
              {currentUnits ? (
                <span className="text-muted-foreground"> ({currentUnits})</span>
              ) : null}
            </Label>
            <Input
              id={valueInputId}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={!userOverrideable || submitting}
              aria-invalid={valueEmpty}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={rationaleId}>
              Rationale (minimum {MIN_RATIONALE_CHARS} characters)
            </Label>
            <textarea
              id={rationaleId}
              data-testid="override-rationale"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              disabled={!userOverrideable || submitting}
              aria-invalid={rationaleTooShort}
              required
              minLength={MIN_RATIONALE_CHARS}
            />
            {rationaleTooShort && (
              <p
                role="status"
                className="text-xs text-muted-foreground"
                data-testid="rationale-validation"
              >
                {trimmedRationale.length} / {MIN_RATIONALE_CHARS} characters
              </p>
            )}
          </div>
          {!userOverrideable && (
            <p
              role="alert"
              className="rounded-md border border-border bg-muted p-2 text-xs text-muted-foreground"
            >
              This value is not user-overrideable (engine policy).
            </p>
          )}
          {error && (
            <p
              role="alert"
              data-testid="override-error"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-foreground"
            >
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? 'Saving…' : 'Save override'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function parseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  const asNum = Number(trimmed);
  if (!Number.isNaN(asNum) && /^-?\d+(\.\d+)?$/.test(trimmed)) return asNum;
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

async function safeJson(
  res: Response,
): Promise<{ error?: string } | null> {
  try {
    return (await res.json()) as { error?: string };
  } catch {
    return null;
  }
}
