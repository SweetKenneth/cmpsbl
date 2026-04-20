/**
 * V2FunnelChart — Governor view of the Ascension V2 conversion funnel.
 *
 * Reads `analytics_events` where category='funnel' and renders the six
 * canonical pipeline events with conversion rates + median duration.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingDown } from 'lucide-react';

const FUNNEL_STEPS: { key: string; label: string }[] = [
  { key: 'upload_started', label: 'Upload Started' },
  { key: 'gate_passed', label: 'Gate Passed' },
  { key: 'discovery_complete', label: 'Discovery Complete' },
  { key: 'layer_attached', label: 'Layer Attached' },
  { key: 'export_clicked', label: 'Export Clicked' },
  { key: 'export_complete', label: 'Export Complete' },
];

interface FunnelRow {
  event_type: string;
  value: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[m - 1] + s[m]) / 2) : s[m];
}

interface Props {
  windowDays?: number;
}

export function V2FunnelChart({ windowDays = 30 }: Props) {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();
      const { data } = await supabase
        .from('analytics_events')
        .select('event_type,value,metadata,created_at')
        .eq('category', 'funnel')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(2000);
      if (!cancelled) {
        setRows((data ?? []) as FunnelRow[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [windowDays]);

  const stats = useMemo(() => {
    // Distinct run_ids per event step.
    const runsByStep: Record<string, Set<string>> = {};
    for (const step of FUNNEL_STEPS) runsByStep[step.key] = new Set();
    for (const r of rows) {
      const runId = (r.metadata?.run_id as string | undefined) ?? null;
      if (!runId) continue;
      if (runsByStep[r.event_type]) runsByStep[r.event_type].add(runId);
    }
    const counts = FUNNEL_STEPS.map(s => ({
      key: s.key,
      label: s.label,
      count: runsByStep[s.key].size,
    }));

    // Median end-to-end duration: from earliest upload_started to latest
    // export_complete per run_id.
    const startTimes: Record<string, number> = {};
    const endTimes: Record<string, number> = {};
    for (const r of rows) {
      const runId = (r.metadata?.run_id as string | undefined) ?? null;
      if (!runId) continue;
      const t = new Date(r.created_at).getTime();
      if (r.event_type === 'upload_started') {
        startTimes[runId] = Math.min(startTimes[runId] ?? Infinity, t);
      } else if (r.event_type === 'export_complete') {
        endTimes[runId] = Math.max(endTimes[runId] ?? -Infinity, t);
      }
    }
    const durations: number[] = [];
    for (const runId of Object.keys(endTimes)) {
      if (startTimes[runId] !== undefined) {
        durations.push(endTimes[runId] - startTimes[runId]);
      }
    }
    const medianDurationMs = median(durations);
    const completedRuns = durations.length;
    const startedRuns = counts[0].count;
    const overallConversion = startedRuns > 0
      ? Math.round((counts[counts.length - 1].count / startedRuns) * 100)
      : 0;

    return { counts, medianDurationMs, completedRuns, startedRuns, overallConversion };
  }, [rows]);

  const top = stats.counts[0]?.count ?? 0;

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-mono text-muted-foreground flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-primary" />
            Ascension V2 Funnel · last {windowDays}d
          </span>
          <span className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {stats.completedRuns} completed
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${
                stats.overallConversion >= 50 ? 'border-neon-green/30 text-neon-green' :
                stats.overallConversion >= 20 ? 'border-neon-amber/30 text-neon-amber' :
                'border-destructive/30 text-destructive'
              }`}
            >
              {stats.overallConversion}% e2e
            </Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {loading ? (
          <div className="text-xs text-muted-foreground font-mono py-6 text-center">
            Loading funnel data…
          </div>
        ) : top === 0 ? (
          <div className="text-xs text-muted-foreground font-mono py-6 text-center">
            No funnel events yet. First run will populate this chart.
          </div>
        ) : (
          <>
            {stats.counts.map((step, i) => {
              const pct = top > 0 ? Math.round((step.count / top) * 100) : 0;
              const prev = i > 0 ? stats.counts[i - 1].count : null;
              const dropPct = prev !== null && prev > 0
                ? Math.round(((prev - step.count) / prev) * 100)
                : 0;
              return (
                <div key={step.key} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-foreground">{step.label}</span>
                    <span className="flex items-center gap-2">
                      {dropPct > 0 && (
                        <span className="text-destructive flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" />
                          -{dropPct}%
                        </span>
                      )}
                      <span className="text-muted-foreground">{step.count}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Median end-to-end</span>
              <span className="text-foreground">
                {stats.medianDurationMs > 0
                  ? `${(stats.medianDurationMs / 1000).toFixed(1)}s`
                  : '—'}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
