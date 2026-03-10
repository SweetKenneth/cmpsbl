/**
 * S-Tier 089 — Quota Intelligence Engine
 * CJPI: 91 | Node: ACCESS | ID: S-119
 *
 * Intelligent quota management with predictive exhaustion warnings.
 * Tracks usage trends and alerts before quotas run out.
 */

export interface QuotaConfig {
  id: string;
  resource: string;
  limit: number;
  period: 'hourly' | 'daily' | 'monthly';
  used: number;
  resetAt: number;
}

export interface QuotaWarning {
  quotaId: string;
  resource: string;
  usedPct: number;
  estimatedExhaustionMs: number | null;
  severity: 'ok' | 'warning' | 'critical';
}

const quotas = new Map<string, QuotaConfig>();
const usageHistory = new Map<string, number[]>(); // timestamps of usage

export function registerQuota(config: Omit<QuotaConfig, 'used' | 'resetAt'>): QuotaConfig {
  const periodMs = config.period === 'hourly' ? 3_600_000 : config.period === 'daily' ? 86_400_000 : 2_592_000_000;
  const full: QuotaConfig = { ...config, used: 0, resetAt: Date.now() + periodMs };
  quotas.set(config.id, full);
  return full;
}

export function consumeQuota(id: string, amount = 1): boolean {
  const q = quotas.get(id);
  if (!q) return true;
  // Auto-reset if period expired
  if (Date.now() >= q.resetAt) {
    q.used = 0;
    const periodMs = q.period === 'hourly' ? 3_600_000 : q.period === 'daily' ? 86_400_000 : 2_592_000_000;
    q.resetAt = Date.now() + periodMs;
  }
  if (q.used + amount > q.limit) return false;
  q.used += amount;
  if (!usageHistory.has(id)) usageHistory.set(id, []);
  usageHistory.get(id)!.push(Date.now());
  return true;
}

export function getWarning(id: string): QuotaWarning | null {
  const q = quotas.get(id);
  if (!q) return null;
  const usedPct = Math.round((q.used / q.limit) * 100);

  // Estimate exhaustion based on usage rate
  const history = usageHistory.get(id) ?? [];
  let estimatedExhaustionMs: number | null = null;
  if (history.length >= 2) {
    const ratePerMs = history.length / (Date.now() - history[0]);
    const remaining = q.limit - q.used;
    if (ratePerMs > 0) estimatedExhaustionMs = Math.round(remaining / ratePerMs);
  }

  const severity: QuotaWarning['severity'] = usedPct >= 90 ? 'critical' : usedPct >= 70 ? 'warning' : 'ok';
  return { quotaId: id, resource: q.resource, usedPct, estimatedExhaustionMs, severity };
}

export function listQuotas(): QuotaConfig[] { return [...quotas.values()]; }
