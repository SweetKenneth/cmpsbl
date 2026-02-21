/**
 * Clockless Habitat — Compact Metrics Panel
 * vX.UI.REALTIME.1
 *
 * 320px blurred glass side panel for hybrid mode.
 * Displays namespace-scoped real telemetry alongside the habitat canvas.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { HabitatState } from './habitatStateResolver';

interface CompactMetricsPanelProps {
  habitatState: HabitatState | null;
}

export function CompactMetricsPanel({ habitatState }: CompactMetricsPanelProps) {
  const namespace = habitatState?.namespace ?? null;
  const temporal = habitatState?.temporal ?? null;
  const integrity = habitatState?.integrity ?? null;

  const modules = useMemo(() => {
    if (!namespace) return [];
    return Object.entries(namespace.modules);
  }, [namespace]);

  const totalProbes = useMemo(() => {
    let total = 0;
    for (const [, m] of modules) {
      total += m.counters['totalProbes'] ?? m.counters['totalRequests'] ?? 0;
    }
    return total;
  }, [modules]);

  const repairedCount = useMemo(() => {
    let total = 0;
    for (const [, m] of modules) {
      total += m.counters['repairedProbes'] ?? m.counters['successfulRequests'] ?? 0;
    }
    return total;
  }, [modules]);

  const failedCount = useMemo(() => {
    let total = 0;
    for (const [, m] of modules) {
      total += m.counters['failedProbes'] ?? m.counters['authFailures'] ?? m.counters['errors'] ?? 0;
    }
    return total;
  }, [modules]);

  const repairRate = totalProbes > 0 ? Math.round((repairedCount / totalProbes) * 100) : 100;

  if (!habitatState || !namespace || !temporal || !integrity) {
    return (
      <div className="w-80 shrink-0 bg-card/40 backdrop-blur-xl border-l border-border/30 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
      </div>
    );
  }

  const temporalColor =
    temporal.state === 'CALM' ? 'hsl(var(--system-green))'
    : temporal.state === 'ACTIVE' ? 'hsl(var(--neon-cyan))'
    : temporal.state === 'SURGE' ? 'hsl(var(--neon-amber))'
    : 'hsl(var(--destructive))';

  const integrityAccent =
    integrity.state === 'VALID' ? 'text-[hsl(var(--system-green))]'
    : integrity.state === 'MISMATCH' ? 'text-destructive'
    : 'text-muted-foreground';

  return (
    <div className="w-80 shrink-0 bg-card/40 backdrop-blur-xl border-l border-border/30 overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: temporalColor }}
            />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {namespace.namespace.namespaceId}
            </span>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
            Live Telemetry · {temporal.state}
          </p>
        </div>

        {/* System Vitals */}
        <Section title="System Vitals">
          <MetricRow label="Namespace Health" value={`${namespace.healthIndex}%`} />
          <MetricRow label="Active Signals" value={namespace.activeSignals.toString()} />
          <MetricRow label="Repair Velocity" value={`${temporal.repairVelocity.toFixed(1)}/hr`} />
          <MetricRow label="Anomaly Rate" value={`${(temporal.anomalyRate * 100).toFixed(1)}%`} />
          <MetricRow label="Latency Trend" value={`${temporal.latencyTrend.toFixed(0)}ms`} />
          <MetricRow label="CLM Frequency" value={`${temporal.clmFrequency.toFixed(1)}/hr`} />
          <MetricRow label="Escalations" value={temporal.escalationCount.toString()} />
        </Section>

        {/* Integrity */}
        <Section title="Integrity">
          <MetricRow
            label="State"
            value={integrity.state}
            className={integrityAccent}
          />
          <MetricRow label="Modules Checked" value={integrity.modulesChecked.toString()} />
          <MetricRow label="Discrepancies" value={integrity.discrepancyCount.toString()} />
          <MetricRow label="Drift" value={`${integrity.driftPercent}%`} />
        </Section>

        {/* Scoped Metrics */}
        <Section title="Scoped Aggregates">
          <MetricRow label="Repair Rate" value={`${repairRate}%`} />
          <MetricRow label="Failed Count" value={failedCount.toString()} />
          <MetricRow label="Total Probes" value={totalProbes.toString()} />
        </Section>

        {/* Module Health */}
        <Section title="Module Health">
          {modules.map(([id, m]) => (
            <div key={id} className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[160px]">
                {id}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        m.healthScore >= 80 ? 'hsl(var(--system-green))'
                        : m.healthScore >= 60 ? 'hsl(var(--neon-amber))'
                        : 'hsl(var(--destructive))',
                      width: `${m.healthScore}%`,
                    }}
                    initial={false}
                    animate={{ width: `${m.healthScore}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="text-[10px] font-mono text-foreground w-8 text-right">
                  {m.healthScore}
                </span>
              </div>
            </div>
          ))}
        </Section>

        {/* Temporal Expression */}
        <Section title="Temporal Expression">
          <MetricRow label="Light Warmth" value={temporal.lightWarmth.toFixed(2)} />
          <MetricRow label="Pulse Rhythm" value={`${temporal.pulseRhythm.toFixed(1)}s`} />
          <MetricRow label="Motion Density" value={temporal.motionDensity.toFixed(2)} />
          <MetricRow label="Depth Compression" value={temporal.depthCompression.toFixed(2)} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
        {title}
      </p>
      <div className="space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  className = 'text-foreground',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      <span className={`text-[10px] font-mono font-medium ${className}`}>{value}</span>
    </div>
  );
}
