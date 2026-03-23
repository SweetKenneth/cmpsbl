/**
 * Resource Metering & Quotas
 * 
 * Every sandbox has a budget — CPU, memory, I/O, wall-clock time.
 * Real-time tracking with graceful termination and cost attribution.
 * 
 * @module sandbox/ultimate/resourceMetering
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface ResourceQuota {
  sandboxId: string;
  tier: 'builder' | 'evolution' | 'chaos' | 'experiment' | 'system';
  cpuMs: number;
  memoryBytes: number;
  ioOps: number;
  wallClockMs: number;
  burstAllowance: number; // multiplier (e.g., 1.5)
  burstDurationMs: number;
}

export interface ResourceUsage {
  sandboxId: string;
  cpuMsUsed: number;
  memoryBytesUsed: number;
  ioOpsUsed: number;
  wallClockMsUsed: number;
  burstActive: boolean;
  burstStartedAt: number | null;
  attributedTo: string; // entity that requested the sandbox
  status: 'within_budget' | 'warning' | 'burst' | 'exceeded' | 'terminated';
}

// ── Constants ──────────────────────────────────────────────────

const WARNING_THRESHOLD = 0.80;
const BURST_DURATION_DEFAULT = 10_000;

const TIER_DEFAULTS: Record<ResourceQuota['tier'], Omit<ResourceQuota, 'sandboxId' | 'tier'>> = {
  builder:    { cpuMs: 30_000, memoryBytes: 64 * 1024 * 1024,  ioOps: 500,  wallClockMs: 60_000,  burstAllowance: 1.5, burstDurationMs: BURST_DURATION_DEFAULT },
  experiment: { cpuMs: 60_000, memoryBytes: 128 * 1024 * 1024, ioOps: 1000, wallClockMs: 120_000, burstAllowance: 1.5, burstDurationMs: BURST_DURATION_DEFAULT },
  evolution:  { cpuMs: 90_000, memoryBytes: 256 * 1024 * 1024, ioOps: 2000, wallClockMs: 180_000, burstAllowance: 1.3, burstDurationMs: BURST_DURATION_DEFAULT },
  chaos:      { cpuMs: 45_000, memoryBytes: 128 * 1024 * 1024, ioOps: 1500, wallClockMs: 90_000,  burstAllowance: 1.2, burstDurationMs: 5_000 },
  system:     { cpuMs: 120_000, memoryBytes: 512 * 1024 * 1024, ioOps: 5000, wallClockMs: 300_000, burstAllowance: 2.0, burstDurationMs: 15_000 },
};

// ── State ──────────────────────────────────────────────────────

const quotas = new Map<string, ResourceQuota>();
const usage = new Map<string, ResourceUsage>();

// ── Core ───────────────────────────────────────────────────────

/** Allocate quota for a sandbox */
export function allocateQuota(sandboxId: string, tier: ResourceQuota['tier'], attributedTo: string): ResourceQuota {
  const defaults = TIER_DEFAULTS[tier];
  const quota: ResourceQuota = { sandboxId, tier, ...defaults };
  quotas.set(sandboxId, quota);

  usage.set(sandboxId, {
    sandboxId, cpuMsUsed: 0, memoryBytesUsed: 0, ioOpsUsed: 0, wallClockMsUsed: 0,
    burstActive: false, burstStartedAt: null, attributedTo, status: 'within_budget',
  });

  return quota;
}

/** Record resource consumption and check status */
export function recordConsumption(
  sandboxId: string,
  delta: { cpuMs?: number; memoryBytes?: number; ioOps?: number; wallClockMs?: number },
): ResourceUsage | null {
  const u = usage.get(sandboxId);
  const q = quotas.get(sandboxId);
  if (!u || !q) return null;

  u.cpuMsUsed += delta.cpuMs ?? 0;
  u.memoryBytesUsed += delta.memoryBytes ?? 0;
  u.ioOpsUsed += delta.ioOps ?? 0;
  u.wallClockMsUsed += delta.wallClockMs ?? 0;

  // Calculate max utilization across all dimensions
  const utilizations = [
    u.cpuMsUsed / q.cpuMs,
    u.memoryBytesUsed / q.memoryBytes,
    u.ioOpsUsed / q.ioOps,
    u.wallClockMsUsed / q.wallClockMs,
  ];
  const maxUtil = Math.max(...utilizations);

  const now = Date.now();
  const burstLimit = q.burstAllowance;

  if (maxUtil >= burstLimit) {
    u.status = 'exceeded';
    u.burstActive = false;
  } else if (maxUtil >= 1.0) {
    // In burst zone
    if (!u.burstActive) {
      u.burstActive = true;
      u.burstStartedAt = now;
      u.status = 'burst';
    } else if (u.burstStartedAt && (now - u.burstStartedAt) > q.burstDurationMs) {
      u.status = 'exceeded';
      u.burstActive = false;
    } else {
      u.status = 'burst';
    }
  } else if (maxUtil >= WARNING_THRESHOLD) {
    u.status = 'warning';
  } else {
    u.status = 'within_budget';
  }

  return { ...u };
}

/** Get usage for a sandbox */
export function getUsage(sandboxId: string): ResourceUsage | undefined { return usage.get(sandboxId); }
export function getQuota(sandboxId: string): ResourceQuota | undefined { return quotas.get(sandboxId); }

/** Get cost attribution summary */
export function getCostAttribution(): Array<{ attributedTo: string; totalCpuMs: number; totalMemoryBytes: number; sandboxCount: number }> {
  const grouped = new Map<string, { totalCpuMs: number; totalMemoryBytes: number; sandboxCount: number }>();
  for (const u of usage.values()) {
    const existing = grouped.get(u.attributedTo) ?? { totalCpuMs: 0, totalMemoryBytes: 0, sandboxCount: 0 };
    existing.totalCpuMs += u.cpuMsUsed;
    existing.totalMemoryBytes += u.memoryBytesUsed;
    existing.sandboxCount++;
    grouped.set(u.attributedTo, existing);
  }
  return Array.from(grouped.entries()).map(([attributedTo, stats]) => ({ attributedTo, ...stats }));
}

export function getMeteringHealth() {
  const all = Array.from(usage.values());
  return {
    activeSandboxes: all.length,
    warningCount: all.filter(u => u.status === 'warning').length,
    burstCount: all.filter(u => u.status === 'burst').length,
    exceededCount: all.filter(u => u.status === 'exceeded').length,
  };
}

export function resetMetering(): void {
  quotas.clear();
  usage.clear();
}
