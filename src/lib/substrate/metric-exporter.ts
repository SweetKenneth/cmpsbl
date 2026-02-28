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

function key(name: string, labels: Record<string, string>): string {
  const l = Object.entries(labels).sort().map(([k, v]) => `${k}="${v}"`).join(',');
  return l ? `${name}{${l}}` : name;
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
    if (m.observations.length > 10000) m.observations.splice(0, 5000);
  }
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
      for (const b of m.buckets) {
        const count = m.observations.filter(o => o <= b).length;
        lines.push(`${m.name}_bucket{le="${b}"} ${count}`);
      }
      lines.push(`${m.name}_count ${m.observations.length}`);
      lines.push(`${m.name}_sum ${m.observations.reduce((a, b) => a + b, 0)}`);
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
