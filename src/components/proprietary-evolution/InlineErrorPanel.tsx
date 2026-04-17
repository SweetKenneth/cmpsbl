/**
 * InlineErrorPanel — persistent, copyable error surface for the Ascension lifecycle
 *
 * Toasts auto-dismiss in ~5s — too fast to read, copy, or act on.
 * This panel sticks until manually dismissed and shows:
 *   · phase that failed (Ingest / Ascend / Export …)
 *   · short message
 *   · expandable details (stack, response body, hint)
 *   · copy-to-clipboard for bug reports
 *   · optional retry callback
 */

import { useState, useCallback } from 'react';
import { AlertOctagon, ChevronDown, ChevronUp, Copy, Check, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InlineError {
  phase: string;          // e.g. "Ingest · Register Node"
  message: string;        // primary user-facing message
  details?: string;       // stack, response body, JSON, etc.
  hint?: string;          // actionable next step
  timestamp?: number;     // defaults to Date.now()
}

interface Props {
  error: InlineError | null;
  onDismiss: () => void;
  onRetry?: () => void;
  className?: string;
}

export function InlineErrorPanel({ error, onDismiss, onRetry, className }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!error) return;
    const ts = new Date(error.timestamp ?? Date.now()).toISOString();
    const payload = [
      `[${ts}] ${error.phase}`,
      `Message: ${error.message}`,
      error.hint ? `Hint:    ${error.hint}` : null,
      error.details ? `\nDetails:\n${error.details}` : null,
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard may be blocked — silently fall through
    }
  }, [error]);

  if (!error) return null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-destructive/40 bg-destructive/5 backdrop-blur-sm overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <AlertOctagon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-destructive/80">
            {error.phase}
          </p>
          <p className="text-sm font-medium text-foreground mt-0.5 break-words">
            {error.message}
          </p>
          {error.hint && (
            <p className="text-xs text-muted-foreground mt-1.5 italic">
              → {error.hint}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {error.details && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(v => !v)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Copy error details"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Details */}
      {expanded && error.details && (
        <pre className="mx-4 mb-3 rounded-md bg-background/60 border border-border/40 p-3 text-[11px] leading-relaxed font-mono text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
          {error.details}
        </pre>
      )}

      {/* Footer actions */}
      {onRetry && (
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-destructive/20 bg-destructive/[0.03]">
          <Button size="sm" variant="outline" onClick={onRetry} className="h-7 text-xs gap-1.5">
            <RefreshCw className="w-3 h-3" /> Retry
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Helper — normalize any thrown value into a structured InlineError.
 * Captures stack traces, Supabase error shapes, and raw strings.
 */
export function toInlineError(
  phase: string,
  err: unknown,
  hint?: string,
): InlineError {
  let message = 'Unknown error';
  let details: string | undefined;

  if (err instanceof Error) {
    message = err.message || err.name || 'Error';
    details = err.stack;
  } else if (typeof err === 'string') {
    message = err;
  } else if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    message = String(obj.message ?? obj.error ?? obj.statusText ?? 'Error');
    try {
      details = JSON.stringify(err, null, 2);
    } catch {
      details = String(err);
    }
  } else {
    message = String(err);
  }

  return {
    phase,
    message,
    details,
    hint,
    timestamp: Date.now(),
  };
}
