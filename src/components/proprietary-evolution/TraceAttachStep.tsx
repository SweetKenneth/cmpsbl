/**
 * TraceAttachStep — Optional trace context attachment
 * Users can attach a trace ID for provenance tracking, or skip.
 */

import { useState } from 'react';
import { Link2, SkipForward, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { startTrace, type TraceContext } from '@/lib/vision/trace';

interface Props {
  onAttach: (trace: TraceContext) => void;
  onSkip: () => void;
}

export function TraceAttachStep({ onAttach, onSkip }: Props) {
  const [traceId, setTraceId] = useState('');
  const [attached, setAttached] = useState(false);

  const handleAttach = () => {
    const trace = traceId.trim()
      ? {
          trace_id: traceId.trim(),
          span_id: crypto.randomUUID(),
          source_operation: 'ascension_user_attached',
          correlation_keys: { origin: 'user_input' },
        }
      : startTrace('ascension_auto', { origin: 'auto_generated' });

    setAttached(true);
    setTimeout(() => onAttach(trace), 500);
  };

  if (attached) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Trace attached</p>
        <p className="text-xs text-muted-foreground">Provenance tracking enabled</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Attach a Trace</h2>
        <p className="text-sm text-muted-foreground">
          Link this analysis to an existing trace for end-to-end provenance tracking.
        </p>
      </div>

      {/* Explainer card */}
      <div className="rounded-xl border border-border/20 bg-card/40 p-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              A <span className="text-foreground font-medium">trace</span> connects this analysis
              to a broader workflow — so you can track where discoveries came from and how they
              were used downstream.
            </p>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              If you don't have a trace ID, you can skip this step. One will be generated
              automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Trace input */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-foreground">
          Trace ID <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
          value={traceId}
          onChange={(e) => setTraceId(e.target.value)}
          className="h-11 rounded-xl font-mono text-xs"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full h-12 rounded-xl text-sm font-semibold gap-2"
          onClick={handleAttach}
        >
          <Link2 className="w-4 h-4" />
          {traceId.trim() ? 'Attach Trace' : 'Generate & Attach Trace'}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="w-full h-12 rounded-xl text-sm text-muted-foreground gap-2 hover:text-foreground"
          onClick={onSkip}
        >
          <SkipForward className="w-4 h-4" />
          Skip — auto-generate later
        </Button>
      </div>
    </div>
  );
}
