/**
 * Metric Exporter — Prometheus-style metric export for substrate observability
 * Provides counters, gauges, histograms in text exposition format
 */

type MetricType = 'counter' | 'gauge' | 'histogram';

interface Metric {
  name: string;
  type: MetricType;
  help: string;
  labels: Record<string, string>;
  value: number;
  buckets?: number[]; // histogram only
  observations?: number[]; // histogram only
}

const metrics = new Map<string, Metric>();

/** Cache label strings to avoid re-sorting and re-joining on every call */
const labelKeyCache = new Map<string, string>();

function key(name: string, labels: Record<string, string>): string {
  const labelKeys = Object.keys(labels);
  if (labelKeys.length === 0) return name;
  
  // Cache the label string computation
  const labelId = labelKeys.sort().map(k => `${k}="${labels[k]}"`).join(',');
  const cacheKey = `${name}{${labelId}}`;
  if (!labelKeyCache.has(cacheKey)) {
    labelKeyCache.set(cacheKey, cacheKey);
  }
  return labelKeyCache.get(cacheKey)!;
}

export function counter(name: string, help: string, labels: Record<string, string> = {}): void {
  const k = key(name, labels);
  if (!metrics.has(k)) {
    metrics.set(k, { name, type: 'counter', help, labels, value: 0 });
  }
}

export function inc(name: string, labels: Record<string, string> = {}, amount = 1): void {
  const k = key(name, labels);
  const m = metrics.get(k);
  if (m && m.type === 'counter') m.value += amount;
}

export function gauge(name: string, help: string, labels: Record<string, string> = {}): void {
  const k = key(name, labels);
  if (!metrics.has(k)) {
    metrics.set(k, { name, type: 'gauge', help, labels, value: 0 });
  }
}

export function set(name: string, value: number, labels: Record<string, string> = {}): void {
  const k = key(name, labels);
  const m = metrics.get(k);
  if (m && m.type === 'gauge') m.value = value;
}

export function histogram(name: string, help: string, buckets = [5, 10, 25, 50, 100, 250, 500, 1000]): void {
  const k = key(name, {});
  if (!metrics.has(k)) {
    metrics.set(k, { name, type: 'histogram', help, labels: {}, value: 0, buckets, observations: [] });
  }
}

export function observe(name: string, value: number): void {
  const k = key(name, {});
  const m = metrics.get(k);
  if (m && m.type === 'histogram' && m.observations) {
    m.observations.push(value);
    // Ring-buffer style eviction
    if (m.observations.length > 10000) {
      m.observations.splice(0, 5000);
    }
  }
}

/** Reset all metrics (for testing / session boundaries) */
export function resetMetrics(): void {
  metrics.clear();
  labelKeyCache.clear();
  // Re-register defaults
  counter('substrate_invocations_total', 'Total substrate invocations');
  counter('substrate_errors_total', 'Total substrate errors');
  gauge('substrate_active_modules', 'Currently active modules');
  histogram('substrate_latency_ms', 'Substrate invocation latency');
}

/** Export all metrics in Prometheus text exposition format */
export function exportMetrics(): string {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const m of metrics.values()) {
    if (!seen.has(m.name)) {
      lines.push(`# HELP ${m.name} ${m.help}`);
      lines.push(`# TYPE ${m.name} ${m.type}`);
      seen.add(m.name);
    }

    const labelStr = Object.entries(m.labels).map(([k, v]) => `${k}="${v}"`).join(',');
    const fqn = labelStr ? `${m.name}{${labelStr}}` : m.name;

    if (m.type === 'histogram' && m.buckets && m.observations) {
      // Pre-sort once, then single-pass bucket counting
      const sorted = m.observations.slice().sort((a, b) => a - b);
      let sum = 0;
      let bucketIdx = 0;
      for (let bi = 0; bi < m.buckets.length; bi++) {
        while (bucketIdx < sorted.length && sorted[bucketIdx] <= m.buckets[bi]) {
          sum += sorted[bucketIdx];
          bucketIdx++;
        }
        lines.push(`${m.name}_bucket{le="${m.buckets[bi]}"} ${bucketIdx}`);
      }
      // Sum remaining
      while (bucketIdx < sorted.length) { sum += sorted[bucketIdx]; bucketIdx++; }
      lines.push(`${m.name}_count ${sorted.length}`);
      lines.push(`${m.name}_sum ${sum}`);
    } else {
      lines.push(`${fqn} ${m.value}`);
    }
  }

  return lines.join('\n');
}

export function getMetricValue(name: string, labels: Record<string, string> = {}): number | null {
  return metrics.get(key(name, labels))?.value ?? null;
}

// Pre-register substrate metrics
counter('substrate_invocations_total', 'Total substrate invocations');
counter('substrate_errors_total', 'Total substrate errors');
gauge('substrate_active_modules', 'Currently active modules');
histogram('substrate_latency_ms', 'Substrate invocation latency');
