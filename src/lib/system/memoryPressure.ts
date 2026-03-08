/**
 * SYSTEM — Memory Pressure Detector
 * Monitors JS heap usage and DOM complexity for proactive alerts.
 */

export type PressureLevel = 'normal' | 'elevated' | 'high' | 'critical';

export interface MemoryPressureReport {
  level: PressureLevel;
  heapUsedMB: number;
  heapLimitMB: number;
  heapUtilization: number;
  domNodeCount: number;
  domDepth: number;
  recommendations: string[];
  timestamp: string;
}

/**
 * Detect current memory pressure level.
 */
export function detectMemoryPressure(): MemoryPressureReport {
  const mem = (performance as any)?.memory;
  const heapUsedMB = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 0;
  const heapLimitMB = mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : 512;
  const heapUtilization = heapLimitMB > 0 ? heapUsedMB / heapLimitMB : 0;

  const domNodeCount = typeof document !== 'undefined' ? document.querySelectorAll('*').length : 0;
  const domDepth = typeof document !== 'undefined' ? getMaxDOMDepth(document.body) : 0;

  const recommendations: string[] = [];
  let level: PressureLevel = 'normal';

  if (heapUtilization > 0.9) {
    level = 'critical';
    recommendations.push('Heap utilization above 90%. Consider clearing caches or reducing in-memory data.');
  } else if (heapUtilization > 0.75) {
    level = 'high';
    recommendations.push('Heap utilization above 75%. Monitor for memory leaks.');
  } else if (heapUtilization > 0.5) {
    level = 'elevated';
  }

  if (domNodeCount > 5000) {
    if (level === 'normal') level = 'elevated';
    recommendations.push(`DOM has ${domNodeCount} nodes. Consider virtualizing long lists.`);
  }

  if (domDepth > 32) {
    recommendations.push(`DOM depth is ${domDepth}. Flatten component hierarchy.`);
  }

  return {
    level,
    heapUsedMB,
    heapLimitMB,
    heapUtilization,
    domNodeCount,
    domDepth,
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

function getMaxDOMDepth(node: Element | null, current = 0): number {
  if (!node) return current;
  let max = current;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    max = Math.max(max, getMaxDOMDepth(children[i], current + 1));
  }
  return max;
}

/**
 * Check if memory pressure warrants action.
 */
export function shouldShedLoad(): boolean {
  const report = detectMemoryPressure();
  return report.level === 'critical' || report.level === 'high';
}
