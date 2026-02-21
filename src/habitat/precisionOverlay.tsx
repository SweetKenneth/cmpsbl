/**
 * Clockless Habitat — Precision Overlay
 * vX.UI.ULTIMATE
 *
 * Tier-based inspection overlay triggered on node click.
 * Slides in organically. Background dims subtly.
 * CREATOR → summary. ARCHITECT → attribution. ENTERPRISE → full telemetry.
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModuleLiveMetrics } from '@/core/metrics/metricsSchema';
import type { UserTier } from '@/core/decode/depthResolver';
import type { HabitatIntegrity } from './integrityLayer';
import { getLatestSnapshot } from '@/core/metrics/snapshotEngine';
import { getTrend } from '@/core/metrics/snapshotEngine';

// ═══ Types ═════════════════════════════════════════════════════════

interface PrecisionOverlayProps {
  moduleId: string | null;
  moduleMetrics: ModuleLiveMetrics | null;
  tier: UserTier;
  integrity: HabitatIntegrity;
  isStrictMode: boolean;
  onClose: () => void;
}

// ═══ Component ════════════════════════════════════════════════════

export function PrecisionOverlay({
  moduleId,
  moduleMetrics,
  tier,
  integrity,
  isStrictMode,
  onClose,
}: PrecisionOverlayProps) {
  const snapshot = useMemo(() => getLatestSnapshot(), [moduleId]);

  // Compute deltas from last snapshot — all hooks before any return
  const healthDelta = useMemo(() => {
    if (!moduleId || !moduleMetrics || !snapshot?.modules[moduleId]) return 0;
    return moduleMetrics.healthScore - snapshot.modules[moduleId].healthScore;
  }, [snapshot, moduleId, moduleMetrics]);

  const trend = useMemo(() => {
    if (tier !== 'ENTERPRISE' || !moduleId) return null;
    return getTrend(moduleId, 'healthScore');
  }, [tier, moduleId]);

  const failedCount = useMemo(() => {
    if (!moduleMetrics) return 0;
    return moduleMetrics.counters['failedProbes'] ??
      moduleMetrics.counters['authFailures'] ??
      moduleMetrics.counters['errors'] ?? 0;
  }, [moduleMetrics]);

  const repairPercent = useMemo(() => {
    if (!moduleMetrics) return 100;
    const total = moduleMetrics.counters['totalProbes'] ?? moduleMetrics.counters['totalRequests'] ?? 0;
    const repaired = moduleMetrics.counters['repairedProbes'] ?? moduleMetrics.counters['successfulRequests'] ?? 0;
    return total > 0 ? Math.round((repaired / total) * 100) : 100;
  }, [moduleMetrics]);

  if (!moduleId || !moduleMetrics) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80 max-h-[80vh] overflow-y-auto"
      >
        <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-lg p-5 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono font-medium text-foreground uppercase tracking-wider">
                {moduleId}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Precision Inspection
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs font-mono"
            >
              ✕
            </button>
          </div>

          {/* LEVEL 1: CREATOR — Summary */}
          <div className="space-y-3">
            <MetricRow label="Health" value={`${moduleMetrics.healthScore}%`} />
            <MetricRow label="Repair Rate" value={`${repairPercent}%`} />
            <MetricRow label="Failed" value={failedCount.toString()} />
            <MetricRow
              label="Delta"
              value={`${healthDelta >= 0 ? '+' : ''}${healthDelta}`}
              accent={healthDelta > 0 ? 'positive' : healthDelta < 0 ? 'negative' : 'neutral'}
            />
          </div>

          {/* LEVEL 2: ARCHITECT — Attribution */}
          {(tier === 'ARCHITECT' || tier === 'ENTERPRISE') && (
            <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                Module Attribution
              </p>
              {Object.entries(moduleMetrics.counters).slice(0, 6).map(([key, val]) => (
                <MetricRow key={key} label={key} value={val.toString()} />
              ))}
              {Object.entries(moduleMetrics.rates).slice(0, 4).map(([key, val]) => (
                <MetricRow key={key} label={key} value={`${val.toFixed(2)}/s`} />
              ))}
            </div>
          )}

          {/* LEVEL 3: ENTERPRISE — Full telemetry */}
          {tier === 'ENTERPRISE' && (
            <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                Cross-Module Telemetry
              </p>
              {snapshot && (
                <MetricRow label="Snapshot" value={snapshot.snapshotId.slice(0, 8)} />
              )}
              <MetricRow label="Integrity" value={integrity.state} accent={integrity.state === 'VALID' ? 'positive' : 'negative'} />
              <MetricRow label="Drift" value={`${integrity.driftPercent}%`} />
              {trend && trend.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] font-mono text-muted-foreground mb-1">Trend ({trend.length} points)</p>
                  <div className="flex items-end gap-px h-8">
                    {trend.slice(-20).map((point, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/50 rounded-t-sm min-w-[2px]"
                        style={{ height: `${(point.value / 100) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STRICT Footer */}
          {isStrictMode && tier === 'ENTERPRISE' && snapshot && (
            <div className="mt-4 pt-3 border-t border-border/20">
              <div className="font-mono text-[9px] text-muted-foreground space-y-0.5 leading-tight">
                <p>[Snapshot: {snapshot.timestamp}]</p>
                <p>[Scope: {tier === 'ENTERPRISE' ? 'GLOBAL' : 'NAMESPACE'}]</p>
                <p>[Integrity: {integrity.state}]</p>
                <p>[Drift: {integrity.driftPercent}%]</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══ Metric Row ═══════════════════════════════════════════════════

function MetricRow({
  label,
  value,
  accent = 'neutral',
}: {
  label: string;
  value: string;
  accent?: 'positive' | 'negative' | 'neutral';
}) {
  const accentClass =
    accent === 'positive'
      ? 'text-[hsl(var(--system-green))]'
      : accent === 'negative'
        ? 'text-destructive'
        : 'text-foreground';

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
      <span className={`text-[11px] font-mono font-medium ${accentClass}`}>{value}</span>
    </div>
  );
}
