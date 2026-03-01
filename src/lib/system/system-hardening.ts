/**
 * SYSTEM Hardening v2.0.0 — "Bastion"
 * Enterprise-grade lifecycle, diagnostics, and configuration hardening
 * 
 * Additive layer — does NOT modify frozen substrate internals.
 * All 25 features are pure functions or self-contained state machines.
 */

import { fnv1aHash, boundArray } from './hardening';

export const SYSTEM_HARDENING_VERSION = '2.0.0';
export const SYSTEM_HARDENING_CODENAME = 'Bastion';

// ─── 1. Boot Integrity Seal ──────────────────────────────────────────────────
// Hash-chains each boot step to detect skipped or tampered phases.

interface BootSeal {
  step: string;
  hash: number;
  prevHash: number;
  durationMs: number;
  timestamp: string;
}

const bootChain: BootSeal[] = [];

export function sealBootStep(step: string, durationMs: number): BootSeal {
  const prevHash = bootChain.length > 0 ? bootChain[bootChain.length - 1].hash : 0;
  const seal: BootSeal = {
    step,
    hash: fnv1aHash(`${prevHash}:${step}:${durationMs}`),
    prevHash,
    durationMs,
    timestamp: new Date().toISOString(),
  };
  bootChain.push(seal);
  return seal;
}

export function verifyBootChain(): { valid: boolean; brokenAt?: string } {
  for (let i = 1; i < bootChain.length; i++) {
    if (bootChain[i].prevHash !== bootChain[i - 1].hash) {
      return { valid: false, brokenAt: bootChain[i].step };
    }
  }
  return { valid: true };
}

export function getBootChain(): readonly BootSeal[] {
  return [...bootChain];
}

// ─── 2. Configuration Validator ──────────────────────────────────────────────
// Schema-based validation before hot-reload application.

interface ConfigRule {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

const configSchemas = new Map<string, ConfigRule[]>();

export function registerConfigSchema(domain: string, rules: ConfigRule[]): void {
  configSchemas.set(domain, rules);
}

export function validateConfig(
  domain: string,
  config: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const rules = configSchemas.get(domain);
  if (!rules) return { valid: true, errors: [] };

  const errors: string[] = [];
  for (const rule of rules) {
    const val = config[rule.key];
    if (rule.required && (val === undefined || val === null)) {
      errors.push(`Missing required key: ${rule.key}`);
      continue;
    }
    if (val !== undefined && val !== null) {
      if (typeof val !== rule.type) {
        errors.push(`${rule.key}: expected ${rule.type}, got ${typeof val}`);
      }
      if (rule.type === 'number' && typeof val === 'number') {
        if (rule.min !== undefined && val < rule.min) errors.push(`${rule.key}: below min ${rule.min}`);
        if (rule.max !== undefined && val > rule.max) errors.push(`${rule.key}: above max ${rule.max}`);
      }
      if (rule.type === 'string' && typeof val === 'string' && rule.pattern && !rule.pattern.test(val)) {
        errors.push(`${rule.key}: does not match pattern`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

// ─── 3. Config Change Audit Trail ────────────────────────────────────────────
// Immutable log of every configuration change with rollback support.

interface ConfigChangeEntry {
  domain: string;
  key: string;
  oldValue: unknown;
  newValue: unknown;
  hash: number;
  prevHash: number;
  timestamp: string;
  actor: string;
}

const configAuditTrail: ConfigChangeEntry[] = [];
const MAX_CONFIG_AUDIT = 500;

export function recordConfigChange(
  domain: string,
  key: string,
  oldValue: unknown,
  newValue: unknown,
  actor = 'system'
): ConfigChangeEntry {
  const prevHash = configAuditTrail.length > 0
    ? configAuditTrail[configAuditTrail.length - 1].hash
    : 0;
  const entry: ConfigChangeEntry = {
    domain,
    key,
    oldValue,
    newValue,
    hash: fnv1aHash(`${prevHash}:${domain}:${key}:${JSON.stringify(newValue)}`),
    prevHash,
    timestamp: new Date().toISOString(),
    actor,
  };
  configAuditTrail.push(entry);
  if (configAuditTrail.length > MAX_CONFIG_AUDIT) {
    configAuditTrail.splice(0, configAuditTrail.length - MAX_CONFIG_AUDIT);
  }
  return entry;
}

export function getConfigAuditTrail(domain?: string): readonly ConfigChangeEntry[] {
  if (domain) return configAuditTrail.filter(e => e.domain === domain);
  return [...configAuditTrail];
}

export function verifyConfigAuditChain(): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < configAuditTrail.length; i++) {
    if (configAuditTrail[i].prevHash !== configAuditTrail[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

// ─── 4. Diagnostic Snapshot Engine ───────────────────────────────────────────
// Point-in-time system snapshots for post-mortem analysis.

interface DiagnosticSnapshot {
  id: string;
  timestamp: string;
  modules: Record<string, unknown>;
  metrics: Record<string, number>;
  alerts: string[];
  memoryEstimate: number;
  hash: number;
}

const snapshots: DiagnosticSnapshot[] = [];
const MAX_SNAPSHOTS = 50;

export function captureDiagnosticSnapshot(
  modules: Record<string, unknown>,
  metrics: Record<string, number>,
  alerts: string[]
): DiagnosticSnapshot {
  const memoryEstimate = typeof performance !== 'undefined' && 'memory' in performance
    ? (performance as any).memory?.usedJSHeapSize ?? 0
    : 0;

  const snapshot: DiagnosticSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    modules,
    metrics,
    alerts,
    memoryEstimate,
    hash: fnv1aHash(JSON.stringify({ modules, metrics, alerts })),
  };
  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);
  return snapshot;
}

export function getSnapshots(): readonly DiagnosticSnapshot[] {
  return [...snapshots];
}

export function getSnapshotById(id: string): DiagnosticSnapshot | undefined {
  return snapshots.find(s => s.id === id);
}

// ─── 5. Health Aggregation Pipeline ──────────────────────────────────────────
// Weighted health scoring across all reporting modules.

interface ModuleHealthReport {
  module: string;
  score: number; // 0.0–1.0
  weight: number;
  status: 'healthy' | 'degraded' | 'critical';
  lastReport: string;
}

const healthReports = new Map<string, ModuleHealthReport>();

export function reportModuleHealth(module: string, score: number, weight = 1.0): void {
  const clamped = Math.max(0, Math.min(1, score));
  healthReports.set(module, {
    module,
    score: clamped,
    weight,
    status: clamped >= 0.8 ? 'healthy' : clamped >= 0.5 ? 'degraded' : 'critical',
    lastReport: new Date().toISOString(),
  });
}

export function getAggregatedHealth(): {
  score: number;
  status: 'healthy' | 'degraded' | 'critical';
  reports: ModuleHealthReport[];
  staleModules: string[];
} {
  const reports = Array.from(healthReports.values());
  if (reports.length === 0) return { score: 1.0, status: 'healthy', reports: [], staleModules: [] };

  const totalWeight = reports.reduce((s, r) => s + r.weight, 0);
  const weightedScore = totalWeight > 0
    ? reports.reduce((s, r) => s + r.score * r.weight, 0) / totalWeight
    : 0;

  const staleThreshold = Date.now() - 5 * 60 * 1000; // 5 min
  const staleModules = reports
    .filter(r => new Date(r.lastReport).getTime() < staleThreshold)
    .map(r => r.module);

  return {
    score: weightedScore,
    status: weightedScore >= 0.8 ? 'healthy' : weightedScore >= 0.5 ? 'degraded' : 'critical',
    reports,
    staleModules,
  };
}

// ─── 6. Lifecycle State Machine ──────────────────────────────────────────────
// Enforces valid state transitions during boot/shutdown.

type LifecyclePhase = 'uninitialized' | 'booting' | 'ready' | 'degraded' | 'shutting_down' | 'terminated';

const VALID_TRANSITIONS: Record<LifecyclePhase, LifecyclePhase[]> = {
  uninitialized: ['booting'],
  booting: ['ready', 'degraded', 'terminated'],
  ready: ['degraded', 'shutting_down'],
  degraded: ['ready', 'shutting_down'],
  shutting_down: ['terminated'],
  terminated: ['booting'], // allow restart
};

let currentPhase: LifecyclePhase = 'uninitialized';
const phaseHistory: Array<{ from: LifecyclePhase; to: LifecyclePhase; timestamp: string }> = [];

export function transitionPhase(to: LifecyclePhase): { success: boolean; error?: string } {
  const allowed = VALID_TRANSITIONS[currentPhase];
  if (!allowed?.includes(to)) {
    return { success: false, error: `Invalid transition: ${currentPhase} → ${to}` };
  }
  phaseHistory.push({ from: currentPhase, to, timestamp: new Date().toISOString() });
  currentPhase = to;
  return { success: true };
}

export function getCurrentPhase(): LifecyclePhase {
  return currentPhase;
}

export function getPhaseHistory(): readonly typeof phaseHistory {
  return [...phaseHistory];
}

// ─── 7. Shutdown Coordinator ─────────────────────────────────────────────────
// Graceful shutdown with deadline enforcement and drain tracking.

interface ShutdownTask {
  name: string;
  handler: () => Promise<void>;
  priority: number; // lower = runs first
  timeoutMs: number;
}

const shutdownTasks: ShutdownTask[] = [];

export function registerShutdownTask(task: ShutdownTask): void {
  shutdownTasks.push(task);
  shutdownTasks.sort((a, b) => a.priority - b.priority);
}

export async function executeShutdown(deadlineMs = 30_000): Promise<{
  completed: string[];
  failed: Array<{ name: string; error: string }>;
  timedOut: boolean;
}> {
  const completed: string[] = [];
  const failed: Array<{ name: string; error: string }> = [];
  const start = Date.now();

  for (const task of shutdownTasks) {
    if (Date.now() - start > deadlineMs) {
      return { completed, failed, timedOut: true };
    }
    try {
      await Promise.race([
        task.handler(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Shutdown task timeout')), task.timeoutMs)
        ),
      ]);
      completed.push(task.name);
    } catch (err) {
      failed.push({ name: task.name, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { completed, failed, timedOut: false };
}

// ─── 8. Module Dependency Validator ──────────────────────────────────────────
// Validates boot order respects declared dependencies.

const moduleDeps = new Map<string, string[]>();

export function declareModuleDependency(module: string, dependsOn: string[]): void {
  moduleDeps.set(module, dependsOn);
}

export function validateBootOrder(bootOrder: string[]): {
  valid: boolean;
  violations: Array<{ module: string; missingDep: string }>;
} {
  const violations: Array<{ module: string; missingDep: string }> = [];
  const booted = new Set<string>();

  for (const mod of bootOrder) {
    const deps = moduleDeps.get(mod) || [];
    for (const dep of deps) {
      if (!booted.has(dep)) {
        violations.push({ module: mod, missingDep: dep });
      }
    }
    booted.add(mod);
  }
  return { valid: violations.length === 0, violations };
}

export function detectDependencyCycles(): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) cycles.push(path.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const dep of moduleDeps.get(node) || []) {
      dfs(dep, [...path, node]);
    }
    stack.delete(node);
  }

  for (const mod of moduleDeps.keys()) {
    dfs(mod, []);
  }
  return cycles;
}

// ─── 9. Heartbeat Monitor ────────────────────────────────────────────────────
// Tracks module heartbeats and detects unresponsive nodes.

interface HeartbeatEntry {
  module: string;
  lastBeat: number;
  intervalMs: number;
  missedBeats: number;
}

const heartbeats = new Map<string, HeartbeatEntry>();
const MAX_MISSED_BEATS = 3;

export function registerHeartbeat(module: string, intervalMs = 30_000): void {
  heartbeats.set(module, { module, lastBeat: Date.now(), intervalMs, missedBeats: 0 });
}

export function recordHeartbeat(module: string): void {
  const entry = heartbeats.get(module);
  if (entry) {
    entry.lastBeat = Date.now();
    entry.missedBeats = 0;
  }
}

export function checkHeartbeats(): Array<{ module: string; missedBeats: number; lastBeatAgo: number }> {
  const now = Date.now();
  const unresponsive: Array<{ module: string; missedBeats: number; lastBeatAgo: number }> = [];

  for (const entry of heartbeats.values()) {
    const elapsed = now - entry.lastBeat;
    const missed = Math.floor(elapsed / entry.intervalMs);
    entry.missedBeats = missed;
    if (missed >= MAX_MISSED_BEATS) {
      unresponsive.push({ module: entry.module, missedBeats: missed, lastBeatAgo: elapsed });
    }
  }
  return unresponsive;
}

// ─── 10. Resource Quota Enforcer ─────────────────────────────────────────────
// Per-module resource quotas with enforcement.

interface ResourceQuota {
  module: string;
  maxMemoryMB: number;
  maxConcurrentOps: number;
  currentOps: number;
  violations: number;
}

const quotas = new Map<string, ResourceQuota>();

export function setResourceQuota(module: string, maxMemoryMB: number, maxConcurrentOps: number): void {
  quotas.set(module, { module, maxMemoryMB, maxConcurrentOps, currentOps: 0, violations: 0 });
}

export function acquireResourceSlot(module: string): { granted: boolean; reason?: string } {
  const quota = quotas.get(module);
  if (!quota) return { granted: true };
  if (quota.currentOps >= quota.maxConcurrentOps) {
    quota.violations++;
    return { granted: false, reason: `Concurrency limit (${quota.maxConcurrentOps}) reached` };
  }
  quota.currentOps++;
  return { granted: true };
}

export function releaseResourceSlot(module: string): void {
  const quota = quotas.get(module);
  if (quota && quota.currentOps > 0) quota.currentOps--;
}

export function getQuotaStatus(): readonly ResourceQuota[] {
  return Array.from(quotas.values());
}

// ─── 11. Canary Flag Manager ─────────────────────────────────────────────────
// Feature flags with percentage-based rollouts.

interface CanaryFlag {
  key: string;
  enabled: boolean;
  rolloutPercent: number; // 0–100
  description: string;
  createdAt: string;
}

const canaryFlags = new Map<string, CanaryFlag>();

export function setCanaryFlag(key: string, rolloutPercent: number, description = ''): void {
  canaryFlags.set(key, {
    key,
    enabled: rolloutPercent > 0,
    rolloutPercent: Math.max(0, Math.min(100, rolloutPercent)),
    description,
    createdAt: new Date().toISOString(),
  });
}

export function isCanaryEnabled(key: string, discriminator?: string): boolean {
  const flag = canaryFlags.get(key);
  if (!flag || !flag.enabled) return false;
  if (flag.rolloutPercent >= 100) return true;
  const hash = fnv1aHash(discriminator || key);
  return (hash % 100) < flag.rolloutPercent;
}

export function getCanaryFlags(): readonly CanaryFlag[] {
  return Array.from(canaryFlags.values());
}

// ─── 12. Maintenance Window Scheduler ────────────────────────────────────────
// Declares and enforces maintenance windows.

interface MaintenanceWindow {
  id: string;
  reason: string;
  startsAt: string;
  endsAt: string;
  affectedModules: string[];
}

const maintenanceWindows: MaintenanceWindow[] = [];

export function scheduleMaintenanceWindow(
  reason: string,
  startsAt: Date,
  endsAt: Date,
  affectedModules: string[]
): MaintenanceWindow {
  const window: MaintenanceWindow = {
    id: `mw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    reason,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    affectedModules,
  };
  maintenanceWindows.push(window);
  return window;
}

export function isInMaintenanceWindow(module?: string): MaintenanceWindow | null {
  const now = new Date();
  for (const w of maintenanceWindows) {
    if (now >= new Date(w.startsAt) && now <= new Date(w.endsAt)) {
      if (!module || w.affectedModules.includes(module) || w.affectedModules.includes('*')) {
        return w;
      }
    }
  }
  return null;
}

// ─── 13. Version Compatibility Gate ──────────────────────────────────────────
// Prevents incompatible module versions from interacting.

interface CompatibilityRule {
  module: string;
  minVersion: string;
  maxVersion?: string;
  reason: string;
}

const compatRules: CompatibilityRule[] = [];

export function addCompatibilityRule(rule: CompatibilityRule): void {
  compatRules.push(rule);
}

export function checkCompatibility(
  module: string,
  version: string
): { compatible: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const rule of compatRules.filter(r => r.module === module)) {
    const [major, minor = 0, patch = 0] = version.split('.').map(Number);
    const [rMajor, rMinor = 0, rPatch = 0] = rule.minVersion.split('.').map(Number);
    const v = major * 10000 + minor * 100 + patch;
    const rv = rMajor * 10000 + rMinor * 100 + rPatch;
    if (v < rv) {
      violations.push(`${module} v${version} below minimum ${rule.minVersion}: ${rule.reason}`);
    }
    if (rule.maxVersion) {
      const [mMajor, mMinor = 0, mPatch = 0] = rule.maxVersion.split('.').map(Number);
      const mv = mMajor * 10000 + mMinor * 100 + mPatch;
      if (v > mv) {
        violations.push(`${module} v${version} above maximum ${rule.maxVersion}: ${rule.reason}`);
      }
    }
  }
  return { compatible: violations.length === 0, violations };
}

// ─── 14. Diagnostic Event Bus ────────────────────────────────────────────────
// Lightweight pub/sub for system diagnostic events.

type DiagnosticEventType = 'health_change' | 'config_change' | 'phase_change' | 'alert' | 'heartbeat_lost' | 'quota_violation';

interface DiagnosticEvent {
  type: DiagnosticEventType;
  source: string;
  data: unknown;
  timestamp: string;
}

type DiagnosticListener = (event: DiagnosticEvent) => void;
const diagListeners = new Map<DiagnosticEventType, DiagnosticListener[]>();
const diagEventLog: DiagnosticEvent[] = [];
const MAX_DIAG_EVENTS = 200;

export function onDiagnosticEvent(type: DiagnosticEventType, listener: DiagnosticListener): () => void {
  const list = diagListeners.get(type) || [];
  list.push(listener);
  diagListeners.set(type, list);
  return () => {
    const idx = list.indexOf(listener);
    if (idx >= 0) list.splice(idx, 1);
  };
}

export function emitDiagnosticEvent(type: DiagnosticEventType, source: string, data: unknown): void {
  const event: DiagnosticEvent = { type, source, data, timestamp: new Date().toISOString() };
  diagEventLog.push(event);
  if (diagEventLog.length > MAX_DIAG_EVENTS) diagEventLog.splice(0, diagEventLog.length - MAX_DIAG_EVENTS);
  for (const listener of diagListeners.get(type) || []) {
    try { listener(event); } catch { /* swallow */ }
  }
}

export function getDiagnosticEventLog(type?: DiagnosticEventType): readonly DiagnosticEvent[] {
  if (type) return diagEventLog.filter(e => e.type === type);
  return [...diagEventLog];
}

// ─── 15. Drift Detector ─────────────────────────────────────────────────────
// Detects configuration drift between expected and actual state.

export function detectConfigDrift(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): Array<{ key: string; expected: unknown; actual: unknown }> {
  const drifts: Array<{ key: string; expected: unknown; actual: unknown }> = [];
  const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  for (const key of allKeys) {
    if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
      drifts.push({ key, expected: expected[key], actual: actual[key] });
    }
  }
  return drifts;
}

// ─── 16. Boot Timing Profiler ────────────────────────────────────────────────
// Captures per-module boot timing for optimization.

interface BootTiming {
  module: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

const bootTimings: BootTiming[] = [];

export function recordBootTiming(module: string, startMs: number, endMs: number): BootTiming {
  const timing: BootTiming = { module, startMs, endMs, durationMs: endMs - startMs };
  bootTimings.push(timing);
  return timing;
}

export function getBootTimings(): readonly BootTiming[] {
  return [...bootTimings];
}

export function getBootTimingSummary(): {
  totalMs: number;
  slowest: string;
  fastest: string;
  breakdown: Record<string, number>;
} {
  if (bootTimings.length === 0) return { totalMs: 0, slowest: '', fastest: '', breakdown: {} };
  const sorted = [...bootTimings].sort((a, b) => b.durationMs - a.durationMs);
  const breakdown: Record<string, number> = {};
  for (const t of bootTimings) breakdown[t.module] = t.durationMs;
  return {
    totalMs: bootTimings.reduce((s, t) => s + t.durationMs, 0),
    slowest: sorted[0].module,
    fastest: sorted[sorted.length - 1].module,
    breakdown,
  };
}

// ─── 17. Degradation Escalation Policy ───────────────────────────────────────
// Tiered response to system degradation.

type EscalationTier = 'monitor' | 'warn' | 'throttle' | 'shed_load' | 'emergency';

interface EscalationPolicy {
  tier: EscalationTier;
  threshold: number; // health score below this triggers tier
  actions: string[];
}

const ESCALATION_POLICIES: EscalationPolicy[] = [
  { tier: 'monitor',    threshold: 0.8, actions: ['increase_log_verbosity'] },
  { tier: 'warn',       threshold: 0.6, actions: ['notify_admin', 'increase_polling'] },
  { tier: 'throttle',   threshold: 0.4, actions: ['reduce_concurrency', 'disable_non_critical'] },
  { tier: 'shed_load',  threshold: 0.2, actions: ['reject_new_requests', 'drain_queues'] },
  { tier: 'emergency',  threshold: 0.1, actions: ['circuit_break_all', 'snapshot_diagnostics'] },
];

export function getEscalationTier(healthScore: number): EscalationPolicy {
  for (const policy of ESCALATION_POLICIES) {
    if (healthScore < policy.threshold) continue;
    return policy;
  }
  return ESCALATION_POLICIES[ESCALATION_POLICIES.length - 1];
}

export function evaluateEscalation(healthScore: number): {
  tier: EscalationTier;
  actions: string[];
  severity: number;
} {
  const policy = getEscalationTier(healthScore);
  return {
    tier: policy.tier,
    actions: policy.actions,
    severity: ESCALATION_POLICIES.indexOf(policy),
  };
}

// ─── 18. Hot-Reload Guard ────────────────────────────────────────────────────
// Prevents config hot-reloads during critical operations.

let hotReloadLocked = false;
let hotReloadLockReason = '';

export function lockHotReload(reason: string): void {
  hotReloadLocked = true;
  hotReloadLockReason = reason;
}

export function unlockHotReload(): void {
  hotReloadLocked = false;
  hotReloadLockReason = '';
}

export function isHotReloadLocked(): { locked: boolean; reason: string } {
  return { locked: hotReloadLocked, reason: hotReloadLockReason };
}

// ─── 19. Module Registry Snapshot ────────────────────────────────────────────
// Captures module registry state for comparison across restarts.

interface RegistrySnapshot {
  timestamp: string;
  modules: Record<string, { version: string; status: string }>;
  hash: number;
}

const registrySnapshots: RegistrySnapshot[] = [];

export function captureRegistrySnapshot(
  modules: Record<string, { version: string; status: string }>
): RegistrySnapshot {
  const snapshot: RegistrySnapshot = {
    timestamp: new Date().toISOString(),
    modules: { ...modules },
    hash: fnv1aHash(JSON.stringify(modules)),
  };
  registrySnapshots.push(snapshot);
  return snapshot;
}

export function compareRegistrySnapshots(
  a: RegistrySnapshot,
  b: RegistrySnapshot
): Array<{ module: string; field: string; before: unknown; after: unknown }> {
  const diffs: Array<{ module: string; field: string; before: unknown; after: unknown }> = [];
  const allMods = new Set([...Object.keys(a.modules), ...Object.keys(b.modules)]);
  for (const mod of allMods) {
    const am = a.modules[mod];
    const bm = b.modules[mod];
    if (!am) { diffs.push({ module: mod, field: 'existence', before: 'absent', after: 'present' }); continue; }
    if (!bm) { diffs.push({ module: mod, field: 'existence', before: 'present', after: 'absent' }); continue; }
    if (am.version !== bm.version) diffs.push({ module: mod, field: 'version', before: am.version, after: bm.version });
    if (am.status !== bm.status) diffs.push({ module: mod, field: 'status', before: am.status, after: bm.status });
  }
  return diffs;
}

// ─── 20. Operational Readiness Check ─────────────────────────────────────────
// Pre-flight checklist before declaring system 'ready'.

interface ReadinessCheck {
  name: string;
  check: () => boolean | Promise<boolean>;
  critical: boolean;
}

const readinessChecks: ReadinessCheck[] = [];

export function registerReadinessCheck(check: ReadinessCheck): void {
  readinessChecks.push(check);
}

export async function runReadinessChecks(): Promise<{
  ready: boolean;
  results: Array<{ name: string; passed: boolean; critical: boolean }>;
}> {
  const results: Array<{ name: string; passed: boolean; critical: boolean }> = [];
  for (const check of readinessChecks) {
    try {
      const passed = await Promise.resolve(check.check());
      results.push({ name: check.name, passed, critical: check.critical });
    } catch {
      results.push({ name: check.name, passed: false, critical: check.critical });
    }
  }
  const ready = results.every(r => !r.critical || r.passed);
  return { ready, results };
}

// ─── 21. Telemetry Sampling Controller ───────────────────────────────────────
// Adaptive sampling to reduce telemetry volume under load.

let samplingRate = 1.0; // 1.0 = 100%

export function setSamplingRate(rate: number): void {
  samplingRate = Math.max(0.01, Math.min(1.0, rate));
}

export function getSamplingRate(): number {
  return samplingRate;
}

export function shouldSample(discriminator?: string): boolean {
  if (samplingRate >= 1.0) return true;
  const hash = discriminator ? fnv1aHash(discriminator) : Math.random() * 100;
  return (hash % 100) / 100 < samplingRate;
}

export function adaptSamplingRate(currentLoad: number, maxLoad: number): void {
  const ratio = currentLoad / Math.max(1, maxLoad);
  if (ratio > 0.9) samplingRate = Math.max(0.1, samplingRate * 0.5);
  else if (ratio > 0.7) samplingRate = Math.max(0.25, samplingRate * 0.75);
  else if (ratio < 0.3) samplingRate = Math.min(1.0, samplingRate * 1.25);
}

// ─── 22. Module Quarantine Manager ───────────────────────────────────────────
// Isolates misbehaving modules without full shutdown.

interface QuarantineEntry {
  module: string;
  reason: string;
  quarantinedAt: string;
  autoRelease?: string; // ISO timestamp
}

const quarantine = new Map<string, QuarantineEntry>();

export function quarantineModule(module: string, reason: string, autoReleaseMs?: number): void {
  quarantine.set(module, {
    module,
    reason,
    quarantinedAt: new Date().toISOString(),
    autoRelease: autoReleaseMs ? new Date(Date.now() + autoReleaseMs).toISOString() : undefined,
  });
}

export function releaseFromQuarantine(module: string): boolean {
  return quarantine.delete(module);
}

export function isQuarantined(module: string): boolean {
  const entry = quarantine.get(module);
  if (!entry) return false;
  if (entry.autoRelease && new Date() >= new Date(entry.autoRelease)) {
    quarantine.delete(module);
    return false;
  }
  return true;
}

export function getQuarantinedModules(): readonly QuarantineEntry[] {
  return Array.from(quarantine.values());
}

// ─── 23. Config Rollback Engine ──────────────────────────────────────────────
// Stores config snapshots for instant rollback.

const configSnapshots = new Map<string, Array<{ config: Record<string, unknown>; timestamp: string }>>();
const MAX_CONFIG_SNAPSHOTS = 10;

export function snapshotConfig(domain: string, config: Record<string, unknown>): void {
  const list = configSnapshots.get(domain) || [];
  list.push({ config: structuredClone(config), timestamp: new Date().toISOString() });
  configSnapshots.set(domain, boundArray(list, MAX_CONFIG_SNAPSHOTS));
}

export function rollbackConfig(domain: string, steps = 1): Record<string, unknown> | null {
  const list = configSnapshots.get(domain);
  if (!list || list.length < steps + 1) return null;
  return structuredClone(list[list.length - 1 - steps].config);
}

export function getConfigSnapshots(domain: string): readonly Array<{ config: Record<string, unknown>; timestamp: string }> {
  return configSnapshots.get(domain) || [];
}

// ─── 24. SLA Monitor ────────────────────────────────────────────────────────
// Tracks system-level SLA compliance.

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  samples: number;
  violations: number;
}

const slaMetrics = new Map<string, SLAMetric>();

export function defineSLA(name: string, target: number): void {
  slaMetrics.set(name, { name, target, current: target, samples: 0, violations: 0 });
}

export function recordSLASample(name: string, value: number): void {
  const metric = slaMetrics.get(name);
  if (!metric) return;
  metric.samples++;
  metric.current = (metric.current * (metric.samples - 1) + value) / metric.samples;
  if (value < metric.target) metric.violations++;
}

export function getSLACompliance(): readonly SLAMetric[] {
  return Array.from(slaMetrics.values());
}

export function isSLABreached(name: string): boolean {
  const metric = slaMetrics.get(name);
  if (!metric) return false;
  return metric.current < metric.target;
}

// ─── 25. SYSTEM Health Composite ─────────────────────────────────────────────
// A–F grading based on boot chain integrity, health aggregation, and lifecycle.

export type SystemGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface SystemHealthComposite {
  grade: SystemGrade;
  score: number;
  bootChainValid: boolean;
  configAuditValid: boolean;
  aggregatedHealth: number;
  lifecyclePhase: LifecyclePhase;
  quarantinedCount: number;
  slaBreaches: number;
  unresponsiveModules: number;
}

export function calculateSystemHealth(): SystemHealthComposite {
  const bootCheck = verifyBootChain();
  const auditCheck = verifyConfigAuditChain();
  const health = getAggregatedHealth();
  const unresponsive = checkHeartbeats();
  const slaBreaches = Array.from(slaMetrics.values()).filter(m => m.current < m.target).length;
  const quarantinedCount = quarantine.size;

  let score = 100;

  // Boot chain integrity (20 pts)
  if (!bootCheck.valid) score -= 20;

  // Config audit integrity (10 pts)
  if (!auditCheck.valid) score -= 10;

  // Aggregated health (30 pts)
  score -= Math.round((1 - health.score) * 30);

  // Lifecycle phase (15 pts)
  if (currentPhase === 'degraded') score -= 10;
  if (currentPhase === 'shutting_down' || currentPhase === 'terminated') score -= 15;

  // Quarantined modules (10 pts)
  score -= Math.min(10, quarantinedCount * 3);

  // SLA breaches (10 pts)
  score -= Math.min(10, slaBreaches * 5);

  // Unresponsive modules (5 pts)
  score -= Math.min(5, unresponsive.length * 2);

  score = Math.max(0, Math.min(100, score));

  const grade: SystemGrade =
    score >= 90 ? 'A' :
    score >= 75 ? 'B' :
    score >= 60 ? 'C' :
    score >= 40 ? 'D' : 'F';

  return {
    grade,
    score,
    bootChainValid: bootCheck.valid,
    configAuditValid: auditCheck.valid,
    aggregatedHealth: health.score,
    lifecyclePhase: currentPhase,
    quarantinedCount,
    slaBreaches,
    unresponsiveModules: unresponsive.length,
  };
}
