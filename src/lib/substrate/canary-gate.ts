/**
 * Canary Gate — Progressive rollout controller for substrate changes
 * Routes a percentage of operations through new code paths
 */

interface CanaryConfig {
  id: string;
  description: string;
  percentTraffic: number; // 0-100
  enabled: boolean;
  metrics: { total: number; canary: number; errors: number };
  createdAt: number;
}

const canaries = new Map<string, CanaryConfig>();

export function createCanary(id: string, description: string, percentTraffic = 5): CanaryConfig {
  const config: CanaryConfig = {
    id,
    description,
    percentTraffic,
    enabled: true,
    metrics: { total: 0, canary: 0, errors: 0 },
    createdAt: Date.now(),
  };
  canaries.set(id, config);
  return config;
}

/** Determine if this request should use the canary path */
export function shouldCanary(id: string): boolean {
  const c = canaries.get(id);
  if (!c || !c.enabled) return false;
  c.metrics.total++;
  const isCanary = Math.random() * 100 < c.percentTraffic;
  if (isCanary) c.metrics.canary++;
  return isCanary;
}

/** Execute with canary: runs either stable or canary function */
export async function withCanary<T>(
  id: string,
  stable: () => Promise<T>,
  canary: () => Promise<T>,
): Promise<T> {
  const useCanary = shouldCanary(id);
  try {
    return await (useCanary ? canary() : stable());
  } catch (err) {
    const c = canaries.get(id);
    if (c && useCanary) c.metrics.errors++;
    throw err;
  }
}

export function setCanaryPercent(id: string, percent: number): void {
  const c = canaries.get(id);
  if (c) c.percentTraffic = Math.max(0, Math.min(100, percent));
}

export function disableCanary(id: string): void {
  const c = canaries.get(id);
  if (c) c.enabled = false;
}

export function promoteCanary(id: string): void {
  const c = canaries.get(id);
  if (c) { c.percentTraffic = 100; c.enabled = true; }
}

export function getCanaryMetrics(id: string): CanaryConfig['metrics'] | null {
  return canaries.get(id)?.metrics ?? null;
}

export function getAllCanaries(): CanaryConfig[] {
  return Array.from(canaries.values());
}
