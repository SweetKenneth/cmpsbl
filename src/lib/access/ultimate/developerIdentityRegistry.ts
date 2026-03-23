/**
 * ACCESS Ultimate — System 6: Developer Identity Registry
 * 
 * Developer profiles with status lifecycle, multi-key management,
 * reputation scoring, and self-service portal data.
 * 
 * @module access/ultimate/developerIdentityRegistry
 */

// ── Types ────────────────────────────────────────────────────────

export type DevStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface DevProfile {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  status: DevStatus;
  keyCount: number;
  reputation: number;           // 0-100
  usageConsistency: number;     // 0-1 (EMA-smoothed)
  errorRate: number;            // 0-1
  abuseFlags: number;
  registeredAt: number;
  lastActiveAt: number;
  metadata: Record<string, unknown>;
}

export interface ReputationFactors {
  usageConsistency: number;     // Weight: 0.3
  errorRate: number;            // Weight: 0.25 (inverted)
  paymentHistory: number;       // Weight: 0.25
  abuseScore: number;           // Weight: 0.2 (inverted)
}

export interface DevRegistryStats {
  totalDevelopers: number;
  activeDevelopers: number;
  suspendedDevelopers: number;
  bannedDevelopers: number;
  avgReputation: number;
  highReputationCount: number;  // reputation > 80
}

// ── Constants ────────────────────────────────────────────────────

const EMA_ALPHA = 0.15;
const MAX_DEVELOPERS = 5000;

// ── State ────────────────────────────────────────────────────────

const developers: Map<string, DevProfile> = new Map();

// ── Core API ────────────────────────────────────────────────────

/** Register a new developer */
export function registerDev(
  userId: string, displayName: string, email: string,
  metadata: Record<string, unknown> = {},
): DevProfile {
  const profile: DevProfile = {
    id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId, displayName, email,
    status: 'active',
    keyCount: 0,
    reputation: 50,             // Start at neutral
    usageConsistency: 0.5,
    errorRate: 0,
    abuseFlags: 0,
    registeredAt: Date.now(),
    lastActiveAt: Date.now(),
    metadata,
  };

  developers.set(profile.id, profile);
  if (developers.size > MAX_DEVELOPERS) evictBanned();

  return profile;
}

/** Update developer status with lifecycle rules */
export function updateDevStatus(devId: string, newStatus: DevStatus): boolean {
  const dev = developers.get(devId);
  if (!dev) return false;

  // Enforce valid transitions
  const validTransitions: Record<DevStatus, DevStatus[]> = {
    pending: ['active', 'banned'],
    active: ['suspended', 'banned'],
    suspended: ['active', 'banned'],
    banned: [], // Terminal state
  };

  if (!validTransitions[dev.status]?.includes(newStatus)) return false;
  dev.status = newStatus;
  return true;
}

/** Record activity and update EMA-smoothed metrics */
export function recordDevActivity(devId: string, success: boolean): void {
  const dev = developers.get(devId);
  if (!dev) return;

  dev.lastActiveAt = Date.now();

  // Update error rate with EMA
  const errorVal = success ? 0 : 1;
  dev.errorRate = EMA_ALPHA * errorVal + (1 - EMA_ALPHA) * dev.errorRate;

  // Update consistency (regular usage = higher consistency)
  const timeSinceLast = Date.now() - dev.lastActiveAt;
  const consistencyVal = timeSinceLast < 3_600_000 ? 1.0 : // < 1 hour
    timeSinceLast < 86_400_000 ? 0.8 :                      // < 1 day
      timeSinceLast < 604_800_000 ? 0.5 : 0.2;              // < 1 week
  dev.usageConsistency = EMA_ALPHA * consistencyVal + (1 - EMA_ALPHA) * dev.usageConsistency;

  // Recompute reputation
  dev.reputation = computeReputation(dev);
}

/** Flag developer for abuse */
export function flagAbuse(devId: string): { flagged: boolean; autoSuspended: boolean } {
  const dev = developers.get(devId);
  if (!dev) return { flagged: false, autoSuspended: false };

  dev.abuseFlags++;

  // Auto-suspend after 3 flags
  let autoSuspended = false;
  if (dev.abuseFlags >= 3 && dev.status === 'active') {
    dev.status = 'suspended';
    autoSuspended = true;
  }

  dev.reputation = computeReputation(dev);
  return { flagged: true, autoSuspended };
}

/** Clear abuse flags (after review) */
export function clearAbuseFlags(devId: string): boolean {
  const dev = developers.get(devId);
  if (!dev) return false;
  dev.abuseFlags = 0;
  dev.reputation = computeReputation(dev);
  return true;
}

/** Compute composite reputation score */
function computeReputation(dev: DevProfile): number {
  const factors: ReputationFactors = {
    usageConsistency: dev.usageConsistency,
    errorRate: 1 - dev.errorRate,           // Invert: lower error = higher score
    paymentHistory: 0.8,                     // Placeholder: would come from billing
    abuseScore: Math.max(0, 1 - dev.abuseFlags * 0.2), // Each flag reduces by 20%
  };

  const score = Math.round(
    factors.usageConsistency * 30 +
    factors.errorRate * 25 +
    factors.paymentHistory * 25 +
    factors.abuseScore * 20
  );

  return Math.max(0, Math.min(100, score));
}

function evictBanned(): void {
  for (const [id, dev] of developers) {
    if (dev.status === 'banned') { developers.delete(id); return; }
  }
  // If no banned, evict oldest inactive
  const oldest = [...developers.values()].sort((a, b) => a.lastActiveAt - b.lastActiveAt)[0];
  if (oldest) developers.delete(oldest.id);
}

// ── Query ────────────────────────────────────────────────────────

export function getDev(id: string): DevProfile | undefined { return developers.get(id); }
export function getDevByUserId(userId: string): DevProfile | undefined {
  return [...developers.values()].find(d => d.userId === userId);
}
export function getAllDevs(status?: DevStatus): DevProfile[] {
  const all = [...developers.values()];
  return status ? all.filter(d => d.status === status) : all;
}

export function getDevRegistryStats(): DevRegistryStats {
  const all = [...developers.values()];
  return {
    totalDevelopers: all.length,
    activeDevelopers: all.filter(d => d.status === 'active').length,
    suspendedDevelopers: all.filter(d => d.status === 'suspended').length,
    bannedDevelopers: all.filter(d => d.status === 'banned').length,
    avgReputation: all.length > 0
      ? Math.round(all.reduce((s, d) => s + d.reputation, 0) / all.length)
      : 0,
    highReputationCount: all.filter(d => d.reputation > 80).length,
  };
}

export function resetDevRegistry(): void {
  developers.clear();
}
