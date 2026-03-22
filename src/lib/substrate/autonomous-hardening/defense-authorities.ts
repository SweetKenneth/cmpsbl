/**
 * CMPSBL® DEFENSE Autonomous Authorities v2.0.0
 * Safe, governed autonomous actions for DEFENSE module
 * 
 * v2 optimizations:
 *  - O(1) action lookup via Map index
 *  - Batch cleanup with generational GC
 *  - Lazy expiration (check on access, not via setTimeout)
 *  - Reduced memory churn by avoiding setTimeout per action
 */

import { journalAction } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFENSE AUTHORITY LEVELS
// ═══════════════════════════════════════════════════════════════════════════════

type AuthorityLevel = 'observe' | 'warn' | 'block' | 'isolate' | 'lockdown';

interface DefenseAuthority {
  level: AuthorityLevel;
  maxEscalation: AuthorityLevel;
  autoBlockThreshold: number;
  autoIsolateThreshold: number;
  cooldownMs: number;
  requiresConsensus: boolean;
}

const ESCALATION_INDEX: Record<AuthorityLevel, number> = {
  observe: 0, warn: 1, block: 2, isolate: 3, lockdown: 4,
};

const defaultAuthority: DefenseAuthority = {
  level: 'observe',
  maxEscalation: 'isolate',
  autoBlockThreshold: 30,
  autoIsolateThreshold: 3,
  cooldownMs: 60_000,
  requiresConsensus: false,
};

let currentAuthority = { ...defaultAuthority };
let lastEscalation = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS THREAT RESPONSES
// ═══════════════════════════════════════════════════════════════════════════════

interface ThreatAction {
  id: string;
  type: 'rate_limit' | 'block_ip' | 'quarantine_module' | 'circuit_break' | 'posture_shift' | 'alert';
  target: string;
  reason: string;
  ts: number;
  reversible: boolean;
  expiresAt: number; // 0 = no expiry
  reversed: boolean;
}

// Primary storage + O(1) index
const actions: ThreatAction[] = [];
const actionIndex = new Map<string, ThreatAction>();
const MAX_ACTIONS = 500;

const blockedIPs = new Set<string>();
const MAX_BLOCKED_IPS = 1000;
const quarantinedModules = new Set<string>();
const rateLimitedEntities = new Map<string, { limit: number; expiresAt: number }>();

// Generation counter for amortized GC
let gcGeneration = 0;
const GC_INTERVAL = 50; // run GC every 50 actions

/** Amortized cleanup — runs every GC_INTERVAL pushes */
function maybeGC(): void {
  if (++gcGeneration < GC_INTERVAL) return;
  gcGeneration = 0;
  const now = Date.now();
  for (let i = actions.length - 1; i >= 0; i--) {
    const a = actions[i];
    if (a.reversed) continue;
    if (a.expiresAt > 0 && now > a.expiresAt) {
      expireAction(a);
    }
  }
  // Trim to cap
  if (actions.length > MAX_ACTIONS) {
    const removed = actions.splice(0, actions.length - MAX_ACTIONS);
    for (const r of removed) actionIndex.delete(r.id);
  }
}

function expireAction(a: ThreatAction): void {
  a.reversed = true;
  if (a.type === 'block_ip') blockedIPs.delete(a.target);
  else if (a.type === 'quarantine_module') quarantinedModules.delete(a.target);
  else if (a.type === 'rate_limit') rateLimitedEntities.delete(a.target);
}

function pushAction(action: ThreatAction): void {
  actions.push(action);
  actionIndex.set(action.id, action);
  maybeGC();
}

let actionCounter = 0;
function nextId(): string {
  return `def_${(++actionCounter).toString(36)}_${Date.now().toString(36)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESCALATION CHECK — O(1) index lookup
// ═══════════════════════════════════════════════════════════════════════════════

function canEscalate(requiredLevel: AuthorityLevel): boolean {
  const now = Date.now();
  if (now - lastEscalation < currentAuthority.cooldownMs) return false;
  if (ESCALATION_INDEX[requiredLevel] > ESCALATION_INDEX[currentAuthority.maxEscalation]) {
    journalAction('DEFENSE', 'escalation_blocked', `${requiredLevel} exceeds max ${currentAuthority.maxEscalation}`, 'blocked');
    return false;
  }
  lastEscalation = now;
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTION CREATORS — No setTimeout, lazy expiration
// ═══════════════════════════════════════════════════════════════════════════════

export function autoBlockIP(ip: string, reason: string, ttlMs = 3600_000): ThreatAction | null {
  if (!canEscalate('block')) return null;
  if (blockedIPs.size >= MAX_BLOCKED_IPS && !blockedIPs.has(ip)) maybeGC();

  blockedIPs.add(ip);
  const action: ThreatAction = {
    id: nextId(), type: 'block_ip', target: ip, reason,
    ts: Date.now(), reversible: true, expiresAt: Date.now() + ttlMs, reversed: false,
  };
  pushAction(action);
  journalAction('DEFENSE', 'block_ip', reason, 'success', { ip, ttlMs });
  return action;
}

export function autoQuarantineModule(module: string, reason: string, ttlMs = 300_000): ThreatAction | null {
  if (!canEscalate('isolate')) return null;
  quarantinedModules.add(module);
  const action: ThreatAction = {
    id: nextId(), type: 'quarantine_module', target: module, reason,
    ts: Date.now(), reversible: true, expiresAt: Date.now() + ttlMs, reversed: false,
  };
  pushAction(action);
  journalAction('DEFENSE', 'quarantine_module', reason, 'success', { module, ttlMs });
  return action;
}

export function autoRateLimit(entity: string, limit: number, reason: string, ttlMs = 600_000): ThreatAction | null {
  if (!canEscalate('warn')) return null;
  rateLimitedEntities.set(entity, { limit, expiresAt: Date.now() + ttlMs });
  const action: ThreatAction = {
    id: nextId(), type: 'rate_limit', target: entity, reason,
    ts: Date.now(), reversible: true, expiresAt: Date.now() + ttlMs, reversed: false,
  };
  pushAction(action);
  journalAction('DEFENSE', 'rate_limit', reason, 'success', { entity, limit, ttlMs });
  return action;
}

export function autoPostureShift(newPosture: 'relaxed' | 'standard' | 'elevated' | 'critical', reason: string): ThreatAction | null {
  if (newPosture === 'critical' && !canEscalate('isolate')) return null;
  if (newPosture === 'elevated' && !canEscalate('warn')) return null;
  const action: ThreatAction = {
    id: nextId(), type: 'posture_shift', target: newPosture, reason,
    ts: Date.now(), reversible: true, expiresAt: 0, reversed: false,
  };
  pushAction(action);
  journalAction('DEFENSE', 'posture_shift', reason, 'success', { newPosture });
  currentAuthority.level = newPosture === 'critical' ? 'isolate' : newPosture === 'elevated' ? 'block' : 'observe';
  return action;
}

export function autoCircuitBreak(module: string, reason: string, ttlMs = 120_000): ThreatAction | null {
  if (!canEscalate('block')) return null;
  const action: ThreatAction = {
    id: nextId(), type: 'circuit_break', target: module, reason,
    ts: Date.now(), reversible: true, expiresAt: Date.now() + ttlMs, reversed: false,
  };
  pushAction(action);
  journalAction('DEFENSE', 'circuit_break', reason, 'success', { module, ttlMs });
  return action;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUERIES — lazy expiration on access
// ═══════════════════════════════════════════════════════════════════════════════

export function setDefenseAuthority(config: Partial<DefenseAuthority>): void {
  currentAuthority = { ...currentAuthority, ...config };
  journalAction('DEFENSE', 'authority_changed', JSON.stringify(config), 'success');
}

export function getDefenseAuthority(): DefenseAuthority { return { ...currentAuthority }; }

export function isIPBlocked(ip: string): boolean {
  if (!blockedIPs.has(ip)) return false;
  // Lazy check — find the action, expire if needed
  for (let i = actions.length - 1; i >= 0; i--) {
    const a = actions[i];
    if (a.type === 'block_ip' && a.target === ip && !a.reversed) {
      if (a.expiresAt > 0 && Date.now() > a.expiresAt) { expireAction(a); return false; }
      return true;
    }
  }
  blockedIPs.delete(ip); // orphan cleanup
  return false;
}

export function isModuleQuarantined(module: string): boolean {
  if (!quarantinedModules.has(module)) return false;
  for (let i = actions.length - 1; i >= 0; i--) {
    const a = actions[i];
    if (a.type === 'quarantine_module' && a.target === module && !a.reversed) {
      if (a.expiresAt > 0 && Date.now() > a.expiresAt) { expireAction(a); return false; }
      return true;
    }
  }
  quarantinedModules.delete(module);
  return false;
}

export function getEntityRateLimit(entity: string): number | null {
  const rl = rateLimitedEntities.get(entity);
  if (!rl) return null;
  if (Date.now() > rl.expiresAt) { rateLimitedEntities.delete(entity); return null; }
  return rl.limit;
}

export function getActiveDefenseActions(): ThreatAction[] {
  const now = Date.now();
  const active: ThreatAction[] = [];
  for (let i = actions.length - 1; i >= 0; i--) {
    const a = actions[i];
    if (a.reversed) continue;
    if (a.expiresAt > 0 && now > a.expiresAt) { expireAction(a); continue; }
    active.push(a);
  }
  return active;
}

export function reverseAction(actionId: string): boolean {
  const action = actionIndex.get(actionId);
  if (!action || action.reversed || !action.reversible) return false;
  expireAction(action);
  journalAction('DEFENSE', 'action_reversed', `Reversed ${action.type} on ${action.target}`, 'success');
  return true;
}

export function getDefenseActionHistory(limit = 50): ThreatAction[] {
  return actions.slice(-limit);
}
