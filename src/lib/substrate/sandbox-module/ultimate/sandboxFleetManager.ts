/**
 * Sandbox Fleet Manager
 * 
 * Manages the lifecycle of all active sandboxes across the substrate.
 * Pool management, lifecycle states, GC, priority preemption.
 * 
 * @module sandbox/ultimate/sandboxFleetManager
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export type SandboxLifecycleState = 'PROVISIONING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'ARCHIVED';

export interface ManagedSandbox {
  id: string;
  state: SandboxLifecycleState;
  priority: number; // 1–10 (10 = highest)
  tier: 'builder' | 'evolution' | 'chaos' | 'experiment' | 'system';
  createdAt: number;
  activatedAt: number | null;
  terminatedAt: number | null;
  archivedAt: number | null;
  preWarmed: boolean;
}

export interface FleetConfig {
  /** Max total sandboxes across fleet */
  maxFleetSize: number;
  /** Pre-warmed pool size */
  warmPoolSize: number;
  /** Grace period before GC of terminated sandboxes (ms) */
  gcGracePeriodMs: number;
  /** Max resource allocation to sandboxes as % of substrate total */
  resourceCeilingPct: number;
}

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_CONFIG: FleetConfig = {
  maxFleetSize: 100,
  warmPoolSize: 5,
  gcGracePeriodMs: 300_000, // 5 minutes
  resourceCeilingPct: 40,
};

// ── State ──────────────────────────────────────────────────────

const fleet = new Map<string, ManagedSandbox>();
const warmPool: ManagedSandbox[] = [];
let config = { ...DEFAULT_CONFIG };
let sandboxCounter = 0;

// ── Core ───────────────────────────────────────────────────────

/** Pre-warm the sandbox pool */
export function warmPool_fill(): ManagedSandbox[] {
  const created: ManagedSandbox[] = [];
  while (warmPool.length < config.warmPoolSize) {
    const sb = createManagedSandbox('system', 1, true);
    warmPool.push(sb);
    created.push(sb);
  }
  return created;
}

function createManagedSandbox(tier: ManagedSandbox['tier'], priority: number, preWarmed: boolean): ManagedSandbox {
  const sb: ManagedSandbox = {
    id: `sb-${++sandboxCounter}`,
    state: preWarmed ? 'PROVISIONING' : 'PROVISIONING',
    priority, tier,
    createdAt: Date.now(),
    activatedAt: null, terminatedAt: null, archivedAt: null,
    preWarmed,
  };
  fleet.set(sb.id, sb);
  return sb;
}

/** Provision a sandbox (from pool if available, else create) */
export function provision(tier: ManagedSandbox['tier'], priority: number): ManagedSandbox | null {
  // Check fleet ceiling
  const activeCount = Array.from(fleet.values()).filter(s => s.state === 'ACTIVE' || s.state === 'PROVISIONING').length;
  if (activeCount >= config.maxFleetSize) {
    // Try preemption
    const preempted = tryPreempt(priority);
    if (!preempted) return null;
  }

  // Try warm pool first
  if (warmPool.length > 0) {
    const sb = warmPool.pop()!;
    sb.tier = tier;
    sb.priority = priority;
    sb.state = 'ACTIVE';
    sb.activatedAt = Date.now();
    sb.preWarmed = true;
    return sb;
  }

  // Create new
  const sb = createManagedSandbox(tier, priority, false);
  sb.state = 'ACTIVE';
  sb.activatedAt = Date.now();
  return sb;
}

/** Suspend a sandbox */
export function suspend(sandboxId: string): boolean {
  const sb = fleet.get(sandboxId);
  if (!sb || sb.state !== 'ACTIVE') return false;
  sb.state = 'SUSPENDED';
  return true;
}

/** Resume a sandbox */
export function resume(sandboxId: string): boolean {
  const sb = fleet.get(sandboxId);
  if (!sb || sb.state !== 'SUSPENDED') return false;
  sb.state = 'ACTIVE';
  return true;
}

/** Terminate a sandbox */
export function terminate(sandboxId: string): boolean {
  const sb = fleet.get(sandboxId);
  if (!sb || sb.state === 'TERMINATED' || sb.state === 'ARCHIVED') return false;
  sb.state = 'TERMINATED';
  sb.terminatedAt = Date.now();
  return true;
}

/** Run garbage collection on terminated sandboxes */
export function runGC(): number {
  const now = Date.now();
  let collected = 0;
  for (const sb of fleet.values()) {
    if (sb.state === 'TERMINATED' && sb.terminatedAt && (now - sb.terminatedAt) > config.gcGracePeriodMs) {
      sb.state = 'ARCHIVED';
      sb.archivedAt = now;
      collected++;
    }
  }
  return collected;
}

/** Try to preempt a low-priority sandbox */
function tryPreempt(requiredPriority: number): boolean {
  let lowestPriority = Infinity;
  let lowestId: string | null = null;
  for (const sb of fleet.values()) {
    if (sb.state === 'ACTIVE' && sb.priority < lowestPriority && sb.priority < requiredPriority) {
      lowestPriority = sb.priority;
      lowestId = sb.id;
    }
  }
  if (lowestId) {
    terminate(lowestId);
    return true;
  }
  return false;
}

/** Update fleet configuration */
export function configureFleet(partial: Partial<FleetConfig>): void {
  config = { ...config, ...partial };
}

export function getSandbox(id: string): ManagedSandbox | undefined { return fleet.get(id); }

export function getFleetHealth() {
  const all = Array.from(fleet.values());
  return {
    totalSandboxes: all.length,
    active: all.filter(s => s.state === 'ACTIVE').length,
    suspended: all.filter(s => s.state === 'SUSPENDED').length,
    terminated: all.filter(s => s.state === 'TERMINATED').length,
    archived: all.filter(s => s.state === 'ARCHIVED').length,
    warmPoolSize: warmPool.length,
    fleetUtilization: Math.round((all.filter(s => s.state === 'ACTIVE').length / config.maxFleetSize) * 100),
  };
}

export function resetFleetManager(): void {
  fleet.clear();
  warmPool.length = 0;
  config = { ...DEFAULT_CONFIG };
  sandboxCounter = 0;
}
