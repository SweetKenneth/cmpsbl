/**
 * VISION — Ascension Effect Visibility Panel
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Surfaces Universal Effect Injection v2 results:
 *  - Human-readable status per node
 *  - Demo-ready badges + scores
 *  - Investor-understandable at a glance
 *
 * Reads from artifact_registry metadata where effect
 * summaries are stored during the Ascension memory chain.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useEffect, useMemo } from 'react';
import { Eye, Zap, AlertTriangle, RotateCw, Activity, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EffectUIContract, EffectStatus, EffectSummary } from '@/lib/ascension/effect-injection';
import type { ExecutionStrategy } from '@/lib/ascension/execution-binding';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES + CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

interface AscensionEffectEntry {
  nodeId: string;
  nodeName: string;
  language: string;
  ingestedAt: string;
  effect: EffectUIContract | null;
  summary: EffectSummary | null;
}

const STATUS_CONFIG: Record<EffectStatus, { label: string; badge: string; color: string; icon: typeof Zap }> = {
  executed: {
    label: 'Healthy Execution',
    badge: '✅',
    color: 'text-neon-green dark:text-neon-green bg-neon-green/10 border-neon-green/20',
    icon: Zap,
  },
  degraded: {
    label: 'Degraded — Failed Safely',
    badge: '⚠️',
    color: 'text-neon-amber dark:text-neon-amber bg-neon-amber/10 border-neon-amber/20',
    icon: AlertTriangle,
  },
  fallback: {
    label: 'Fallback — Passthrough',
    badge: '🔄',
    color: 'text-muted-foreground bg-muted/50 border-border/30',
    icon: RotateCw,
  },
};

const STRATEGY_LABELS: Record<ExecutionStrategy, string> = {
  local: 'Local Runtime',
  bridge: 'Bridge Execution',
  fallback: 'Passthrough',
};

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — DATA FETCHING
// ═══════════════════════════════════════════════════════════════════════════════

function parseEffectFromMetadata(meta: Record<string, unknown>): { effect: EffectUIContract | null; summary: EffectSummary | null } {
  // Effect data is stored under _effect_summary_ASCENSION_MODULENAME in memory chain ctx.data
  // or under effect_summary in metadata during node registration
  const effectSummary = meta.effect_summary as EffectSummary | undefined;
  if (effectSummary?.uiContract) {
    return { effect: effectSummary.uiContract, summary: effectSummary };
  }

  // Fallback: derive from capability_surface
  const capSurface = meta.capability_surface as Record<string, unknown> | undefined;
  if (capSurface) {
    const nodeName = String(capSurface.nodeName || 'UNKNOWN');
    return {
      effect: {
        module: nodeName,
        status: 'fallback' as EffectStatus,
        strategy: 'fallback' as ExecutionStrategy,
        executed: false,
        degraded: false,
        signals: 0,
        errors: 0,
        timing: 0,
        score: 0.4,
      },
      summary: {
        status: 'fallback',
        strategy: 'fallback',
        primary: nodeName,
        category: String(capSurface.primaryCategory || 'unknown'),
        confidenceScore: 0,
        shortSummary: `${nodeName} — awaiting discovery cycle`,
        badge: '🔄 Pending',
        score: 0.4,
        uiContract: {
          module: nodeName,
          status: 'fallback',
          strategy: 'fallback',
          executed: false,
          degraded: false,
          signals: 0,
          errors: 0,
          timing: 0,
          score: 0.4,
        },
      },
    };
  }

  return { effect: null, summary: null };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function AscensionEffectPanel() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AscensionEffectEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('artifact_registry')
        .select('id, name, description, metadata, created_at')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-evolution')
        .order('created_at', { ascending: false })
        .limit(20);

      if (cancelled || !data) {
        setLoading(false);
        return;
      }

      const parsed: AscensionEffectEntry[] = data.map((row) => {
        const meta = (row.metadata ?? {}) as Record<string, unknown>;
        const { effect, summary } = parseEffectFromMetadata(meta);
        const capSurface = meta.capability_surface as Record<string, unknown> | undefined;

        return {
          nodeId: row.id,
          nodeName: String(capSurface?.nodeName || row.name || 'Unknown'),
          language: String(meta.language || 'unknown'),
          ingestedAt: row.created_at,
          effect,
          summary,
        };
      });

      setEntries(parsed);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = entries.length;
    const executed = entries.filter(e => e.effect?.status === 'executed').length;
    const degraded = entries.filter(e => e.effect?.status === 'degraded').length;
    const fallback = entries.filter(e => !e.effect || e.effect.status === 'fallback').length;
    const avgScore = total > 0
      ? entries.reduce((sum, e) => sum + (e.effect?.score ?? 0.4), 0) / total
      : 0;
    return { total, executed, degraded, fallback, avgScore };
  }, [entries]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-neon-blue" />
        <h3 className="text-sm font-bold text-foreground tracking-tight">
          Ascension Effect Monitor
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          VISION · v2
        </span>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Primitives" value={stats.total} icon={Activity} />
        <StatCard label="Executed" value={stats.executed} icon={Zap} color="text-neon-green" />
        <StatCard label="Degraded" value={stats.degraded} icon={AlertTriangle} color="text-neon-amber" />
        <StatCard
          label="Avg Score"
          value={`${(stats.avgScore * 100).toFixed(0)}%`}
          icon={TrendingUp}
          color="text-neon-blue"
        />
      </div>

      {/* Node List */}
      {loading ? (
        <div className="text-center py-6 text-xs text-muted-foreground font-mono">
          Loading effect data…
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No ascension primitives yet. Upload code in the Ingest phase.
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <EffectRow key={entry.nodeId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-2.5 text-center">
      <Icon className={cn('w-3.5 h-3.5 mx-auto mb-1', color || 'text-muted-foreground')} />
      <div className="text-sm font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function EffectRow({ entry }: { entry: AscensionEffectEntry }) {
  const status: EffectStatus = entry.effect?.status ?? 'fallback';
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const summary = entry.summary;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
        config.color
      )}
    >
      {/* Badge */}
      <span className="text-base leading-none" aria-hidden>{config.badge}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold truncate">{entry.nodeName}</span>
          <span className="text-[10px] font-mono opacity-60">{entry.language}</span>
        </div>
        <p className="text-[11px] opacity-80 truncate mt-0.5">
          {summary?.shortSummary ?? `${entry.nodeName} — awaiting effect injection`}
        </p>
      </div>

      {/* Strategy pill */}
      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-current/20 whitespace-nowrap opacity-70">
        {STRATEGY_LABELS[entry.effect?.strategy ?? 'fallback']}
      </span>

      {/* Timing */}
      {(entry.effect?.timing ?? 0) > 0 && (
        <span className="flex items-center gap-0.5 text-[10px] font-mono tabular-nums opacity-60">
          <Clock className="w-2.5 h-2.5" />
          {entry.effect!.timing.toFixed(1)}ms
        </span>
      )}

      {/* Score */}
      <div className="text-right min-w-[32px]">
        <div className="text-xs font-bold tabular-nums">
          {((entry.effect?.score ?? 0.4) * 100).toFixed(0)}
        </div>
        <div className="text-[8px] opacity-50">SCORE</div>
      </div>
    </div>
  );
}
