/**
 * Secret Rotation Manager
 * v1.0.0 — Automated credential and API key rotation
 * 
 * Manages rotation schedules, generates new credentials,
 * and coordinates zero-downtime secret transitions.
 */

export interface RotationPolicy {
  secretId: string;
  rotationIntervalDays: number;
  lastRotatedAt: number | null;
  nextRotationAt: number;
  autoRotate: boolean;
  notifyBeforeDays: number;
  status: 'active' | 'overdue' | 'disabled';
}

export interface RotationEvent {
  id: string;
  secretId: string;
  rotatedAt: number;
  success: boolean;
  previousExpiry: number | null;
  newExpiry: number | null;
  triggeredBy: 'auto' | 'manual';
}

const policies = new Map<string, RotationPolicy>();
const events: RotationEvent[] = [];

export function createPolicy(secretId: string, intervalDays: number, autoRotate: boolean = false): RotationPolicy {
  const p: RotationPolicy = {
    secretId, rotationIntervalDays: intervalDays,
    lastRotatedAt: null,
    nextRotationAt: Date.now() + intervalDays * 86_400_000,
    autoRotate, notifyBeforeDays: 7, status: 'active',
  };
  policies.set(secretId, p);
  return p;
}

export function recordRotation(secretId: string, success: boolean, triggeredBy: 'auto' | 'manual' = 'manual'): RotationEvent {
  const policy = policies.get(secretId);
  const event: RotationEvent = {
    id: `rot-${Date.now()}`,
    secretId, rotatedAt: Date.now(), success,
    previousExpiry: policy?.nextRotationAt ?? null,
    newExpiry: success && policy ? Date.now() + policy.rotationIntervalDays * 86_400_000 : null,
    triggeredBy,
  };
  events.push(event);

  if (policy && success) {
    policy.lastRotatedAt = Date.now();
    policy.nextRotationAt = Date.now() + policy.rotationIntervalDays * 86_400_000;
    policy.status = 'active';
  }

  return event;
}

export function getOverdueRotations(): RotationPolicy[] {
  const now = Date.now();
  return Array.from(policies.values()).filter(p => p.status === 'active' && p.nextRotationAt < now);
}

export function getUpcomingRotations(withinDays: number = 7): RotationPolicy[] {
  const cutoff = Date.now() + withinDays * 86_400_000;
  return Array.from(policies.values()).filter(p => p.status === 'active' && p.nextRotationAt < cutoff);
}

export function getPolicies(): RotationPolicy[] { return Array.from(policies.values()); }
export function getRotationHistory(): RotationEvent[] { return [...events]; }
