/**
 * NEXUS — Quota & Rate Limit Synchronizer
 * Real-time tracking of per-provider rate limits with predictive exhaustion warnings.
 */

export interface ProviderQuota {
  providerId: string;
  rpm: { limit: number; used: number; windowStart: number };
  tpm: { limit: number; used: number; windowStart: number };
  daily: { limit: number; used: number; windowStart: number };
}

export interface QuotaStatus {
  providerId: string;
  rpmUtilization: number;
  tpmUtilization: number;
  dailyUtilization: number;
  rpmRemaining: number;
  tpmRemaining: number;
  dailyRemaining: number;
  predictedExhaustionMs: number | null;  // ms until exhaustion at current rate
  isNearLimit: boolean;
  shouldAvoid: boolean;
}

const quotas = new Map<string, ProviderQuota>();
const NEAR_LIMIT_THRESHOLD = 0.8;
const AVOID_THRESHOLD = 0.95;

export function initProviderQuota(
  providerId: string,
  limits: { rpm: number; tpm: number; daily: number }
): void {
  const now = Date.now();
  quotas.set(providerId, {
    providerId,
    rpm: { limit: limits.rpm, used: 0, windowStart: now },
    tpm: { limit: limits.tpm, used: 0, windowStart: now },
    daily: { limit: limits.daily, used: 0, windowStart: now },
  });
}

function resetWindowIfExpired(window: { limit: number; used: number; windowStart: number }, durationMs: number): void {
  if (Date.now() - window.windowStart > durationMs) {
    window.used = 0;
    window.windowStart = Date.now();
  }
}

export function recordUsage(providerId: string, tokens: number): void {
  const q = quotas.get(providerId);
  if (!q) return;

  // Reset expired windows
  resetWindowIfExpired(q.rpm, 60_000);
  resetWindowIfExpired(q.tpm, 60_000);
  resetWindowIfExpired(q.daily, 86_400_000);

  q.rpm.used++;
  q.tpm.used += tokens;
  q.daily.used++;
}

export function getQuotaStatus(providerId: string): QuotaStatus {
  const q = quotas.get(providerId);
  if (!q) {
    return {
      providerId,
      rpmUtilization: 0,
      tpmUtilization: 0,
      dailyUtilization: 0,
      rpmRemaining: Infinity,
      tpmRemaining: Infinity,
      dailyRemaining: Infinity,
      predictedExhaustionMs: null,
      isNearLimit: false,
      shouldAvoid: false,
    };
  }

  // Reset expired windows before checking
  resetWindowIfExpired(q.rpm, 60_000);
  resetWindowIfExpired(q.tpm, 60_000);
  resetWindowIfExpired(q.daily, 86_400_000);

  const rpmUtil = q.rpm.limit > 0 ? q.rpm.used / q.rpm.limit : 0;
  const tpmUtil = q.tpm.limit > 0 ? q.tpm.used / q.tpm.limit : 0;
  const dailyUtil = q.daily.limit > 0 ? q.daily.used / q.daily.limit : 0;

  // Predict exhaustion for RPM
  let predictedExhaustionMs: number | null = null;
  if (q.rpm.used > 0) {
    const elapsed = Date.now() - q.rpm.windowStart;
    const ratePerMs = q.rpm.used / Math.max(1, elapsed);
    const remaining = q.rpm.limit - q.rpm.used;
    if (ratePerMs > 0 && remaining > 0) {
      predictedExhaustionMs = Math.round(remaining / ratePerMs);
    } else if (remaining <= 0) {
      predictedExhaustionMs = 0;
    }
  }

  const maxUtil = Math.max(rpmUtil, tpmUtil, dailyUtil);

  return {
    providerId,
    rpmUtilization: rpmUtil,
    tpmUtilization: tpmUtil,
    dailyUtilization: dailyUtil,
    rpmRemaining: Math.max(0, q.rpm.limit - q.rpm.used),
    tpmRemaining: Math.max(0, q.tpm.limit - q.tpm.used),
    dailyRemaining: Math.max(0, q.daily.limit - q.daily.used),
    predictedExhaustionMs,
    isNearLimit: maxUtil >= NEAR_LIMIT_THRESHOLD,
    shouldAvoid: maxUtil >= AVOID_THRESHOLD,
  };
}

export function getAvailableProviders(providerIds: string[]): string[] {
  return providerIds.filter(id => {
    const status = getQuotaStatus(id);
    return !status.shouldAvoid;
  });
}

export function getAllQuotaStatuses(): QuotaStatus[] {
  return Array.from(quotas.keys()).map(id => getQuotaStatus(id));
}

export function resetQuota(providerId: string): void {
  quotas.delete(providerId);
}
