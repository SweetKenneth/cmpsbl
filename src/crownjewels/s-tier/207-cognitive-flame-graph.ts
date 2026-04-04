/**
 * S-Tier 207 — Cognitive Flame Graph Generator
 * ID: S-OBS03 | CJPI: 91 | Module: OBSERVABILITY
 *
 * Hierarchical span-based profiling with flame graph generation,
 * hotspot detection, category-level aggregation, and anomaly flagging.
 */

export interface FlameSpan {
  id: string;
  parent?: string;
  label: string;
  startMs: number;
  durationMs: number;
  category: string;
  metadata: Record<string, unknown>;
  children: string[];
}

export interface FlameGraph {
  roots: string[];
  totalDuration: number;
  hotspots: { label: string; percentage: number; selfTime: number; totalTime: number }[];
  categoryBreakdown: Record<string, { totalMs: number; percentage: number; spanCount: number }>;
  anomalies: { spanId: string; label: string; reason: string }[];
}

export class CognitiveFlameGraphGenerator {
  private spans: Map<string, Span> = new Map();
  private activeSpans: Map<string, number> = new Map(); // spanId → startTime

  startSpan(label: string, category: string, parentId?: string, metadata: Record<string, unknown> = {}): string {
    const id = crypto.randomUUID();
    const now = Date.now();
    this.spans.set(id, { id, parent: parentId, label, startMs: now, durationMs: 0, category, metadata, children: [] });
    this.activeSpans.set(id, now);

    if (parentId) {
      const parent = this.spans.get(parentId);
      if (parent) parent.children.push(id);
    }

    return id;
  }

  endSpan(spanId: string): number {
    const span = this.spans.get(spanId);
    const startTime = this.activeSpans.get(spanId);
    if (span && startTime !== undefined) {
      span.durationMs = Date.now() - startTime;
      this.activeSpans.delete(spanId);
    }
    return span?.durationMs ?? 0;
  }

  addMetadata(spanId: string, key: string, value: unknown): void {
    const span = this.spans.get(spanId);
    if (span) span.metadata[key] = value;
  }

  generateFlameGraph(anomalyThresholdMs: number = 1000): FlameGraph {
    const allSpans = [...this.spans.values()];
    const roots = allSpans.filter(s => !s.parent).map(s => s.id);
    const totalDuration = allSpans.reduce((s, sp) => s + sp.durationMs, 0);

    // Compute self-time (total time minus children time)
    const selfTimes = new Map<string, number>();
    for (const span of allSpans) {
      const childTime = span.children.reduce((s, cid) => s + (this.spans.get(cid)?.durationMs ?? 0), 0);
      selfTimes.set(span.id, Math.max(0, span.durationMs - childTime));
    }

    // Hotspots by self-time
    const hotspots = allSpans
      .map(s => ({
        label: s.label,
        percentage: totalDuration > 0 ? (selfTimes.get(s.id) ?? 0) / totalDuration * 100 : 0,
        selfTime: selfTimes.get(s.id) ?? 0,
        totalTime: s.durationMs,
      }))
      .sort((a, b) => b.selfTime - a.selfTime)
      .slice(0, 10);

    // Category breakdown
    const categoryBreakdown: Record<string, { totalMs: number; percentage: number; spanCount: number }> = {};
    for (const span of allSpans) {
      const existing = categoryBreakdown[span.category] ?? { totalMs: 0, percentage: 0, spanCount: 0 };
      existing.totalMs += span.durationMs;
      existing.spanCount++;
      categoryBreakdown[span.category] = existing;
    }
    for (const cat of Object.values(categoryBreakdown)) {
      cat.percentage = totalDuration > 0 ? cat.totalMs / totalDuration * 100 : 0;
    }

    // Anomaly detection: spans exceeding threshold
    const anomalies = allSpans
      .filter(s => s.durationMs > anomalyThresholdMs)
      .map(s => ({ spanId: s.id, label: s.label, reason: `Duration ${s.durationMs}ms exceeds ${anomalyThresholdMs}ms threshold` }));

    return { roots, totalDuration, hotspots, categoryBreakdown, anomalies };
  }

  getSpan(spanId: string): Span | null {
    const s = this.spans.get(spanId);
    return s ? { ...s, children: [...s.children] } : null;
  }

  getStats(): { totalSpans: number; activeSpans: number; categories: number; totalDurationMs: number } {
    return {
      totalSpans: this.spans.size,
      activeSpans: this.activeSpans.size,
      categories: new Set([...this.spans.values()].map(s => s.category)).size,
      totalDurationMs: [...this.spans.values()].reduce((s, sp) => s + sp.durationMs, 0),
    };
  }

  reset(): void {
    this.spans.clear();
    this.activeSpans.clear();
  }
}
