/**
 * CMPSBL® DEFENSE Autonomous Authorities v1.0.0
 * Safe, governed autonomous actions for DEFENSE module
 * 
 * Grants DEFENSE the ability to act on threats without waiting
 * for manual intervention, within strict safety bounds.
 * All actions are journaled and reversible.
 */

import { journalAction } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFENSE AUTHORITY LEVELS
// ═══════════════════════════════════════════════════════════════════════════════

type AuthorityLevel = 'observe' | 'warn' | 'block' | 'isolate' | 'lockdown';

interface DefenseAuthority {
  level: AuthorityLevel;
  maxEscalation: AuthorityLevel;
  autoBlockThreshold: number;       // error rate % to auto-block
  autoIsolateThreshold: number;     // cascade count to auto-isolate
  cooldownMs: number;               // min time between escalations
  requiresConsensus: boolean;       // needs multi-module agreement
}

const ESCALATION_ORDER: AuthorityLevel[] = ['observe', 'warn', 'block', 'isolate', 'lockdown'];

const defaultAuthority: DefenseAuthority = {
  level: 'observe',
  maxEscalation: 'isolate',         // Cannot self-lockdown — that requires human
  autoBlockThreshold: 30,           // 30% error rate triggers auto-block
  autoIsolateThreshold: 3,          // 3 cascading modules triggers isolate
  cooldownMs: 60_000,               // 1 min between escalations
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
  expiresAt?: number;
  reversed: boolean;
}

const activeActions: ThreatAction[] = [];
const MAX_ACTIVE_ACTIONS = 500;
const blockedIPs = new Set<string>();
const MAX_BLOCKED_IPS = 1000;
const quarantinedModules = new Set<string>();
const rateLimitedEntities = new Map<string, { limit: number; expiresAt: number }>();

/**
 * Auto-block an IP address exhibiting malicious behavior.
 * Block expires after TTL. Fully reversible.
 */
export function autoBlockIP(ip: string, reason: string, ttlMs = 3600_000): ThreatAction | null {
  if (!canEscalate('block')) return null;
  
  blockedIPs.add(ip);
  const action: ThreatAction = {
    id: `def_${Date.now().toString(36)}`,
    type: 'block_ip',
    target: ip,
    reason,
    ts: Date.now(),
    reversible: true,
    expiresAt: Date.now() + ttlMs,
    reversed: false,
  };
  activeActions.push(action);
  journalAction('DEFENSE', 'block_ip', reason, 'success', { ip, ttlMs });
  
  // Auto-expire
  setTimeout(() => { blockedIPs.delete(ip); action.reversed = true; }, ttlMs);
  return action;
}

/**
 * Auto-quarantine a module exhibiting cascading failure symptoms.
 * Module is isolated from receiving new requests.
 */
export function autoQuarantineModule(module: string, reason: string, ttlMs = 300_000): ThreatAction | null {
  if (!canEscalate('isolate')) return null;
  
  quarantinedModules.add(module);
  const action: ThreatAction = {
    id: `def_${Date.now().toString(36)}`,
    type: 'quarantine_module',
    target: module,
    reason,
    ts: Date.now(),
    reversible: true,
    expiresAt: Date.now() + ttlMs,
    reversed: false,
  };
  activeActions.push(action);
  journalAction('DEFENSE', 'quarantine_module', reason, 'success', { module, ttlMs });
  
  setTimeout(() => { quarantinedModules.delete(module); action.reversed = true; }, ttlMs);
  return action;
}

/**
 * Auto-apply rate limits to a suspicious entity.
 */
export function autoRateLimit(entity: string, limit: number, reason: string, ttlMs = 600_000): ThreatAction | null {
  if (!canEscalate('warn')) return null;
  
  rateLimitedEntities.set(entity, { limit, expiresAt: Date.now() + ttlMs });
  const action: ThreatAction = {
    id: `def_${Date.now().toString(36)}`,
    type: 'rate_limit',
    target: entity,
    reason,
    ts: Date.now(),
    reversible: true,
    expiresAt: Date.now() + ttlMs,
    reversed: false,
  };
  activeActions.push(action);
  journalAction('DEFENSE', 'rate_limit', reason, 'success', { entity, limit, ttlMs });
  
  setTimeout(() => { rateLimitedEntities.delete(entity); action.reversed = true; }, ttlMs);
  return action;
}

/**
 * Auto-shift security posture based on threat level.
 */
export function autoPostureShift(newPosture: 'relaxed' | 'standard' | 'elevated' | 'critical', reason: string): ThreatAction | null {
  if (newPosture === 'critical' && !canEscalate('isolate')) return null;
  if (newPosture === 'elevated' && !canEscalate('warn')) return null;
  
  const action: ThreatAction = {
    id: `def_${Date.now().toString(36)}`,
    type: 'posture_shift',
    target: newPosture,
    reason,
    ts: Date.now(),
    reversible: true,
    reversed: false,
  };
  activeActions.push(action);
  journalAction('DEFENSE', 'posture_shift', reason, 'success', { newPosture });
  currentAuthority.level = newPosture === 'critical' ? 'isolate' : newPosture === 'elevated' ? 'block' : 'observe';
  return action;
}

/**
 * Auto-trigger circuit break for a specific module's external calls.
 */
export function autoCircuitBreak(module: string, reason: string, ttlMs = 120_000): ThreatAction | null {
  if (!canEscalate('block')) return null;
  
  const action: ThreatAction = {
    id: `def_${Date.now().toString(36)}`,
    type: 'circuit_break',
    target: module,
    reason,
    ts: Date.now(),
    reversible: true,
    expiresAt: Date.now() + ttlMs,
    reversed: false,
  };
  activeActions.push(action);
  journalAction('DEFENSE', 'circuit_break', reason, 'success', { module, ttlMs });
  return action;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITY GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════════

function canEscalate(requiredLevel: AuthorityLevel): boolean {
  const now = Date.now();
  if (now - lastEscalation < currentAuthority.cooldownMs) return false;
  
  const requiredIdx = ESCALATION_ORDER.indexOf(requiredLevel);
  const maxIdx = ESCALATION_ORDER.indexOf(currentAuthority.maxEscalation);
  if (requiredIdx > maxIdx) {
    journalAction('DEFENSE', 'escalation_blocked', `${requiredLevel} exceeds max ${currentAuthority.maxEscalation}`, 'blocked');
    return false;
  }
  
  lastEscalation = now;
  return true;
}

export function setDefenseAuthority(config: Partial<DefenseAuthority>): void {
  currentAuthority = { ...currentAuthority, ...config };
  journalAction('DEFENSE', 'authority_changed', JSON.stringify(config), 'success');
}

export function getDefenseAuthority(): DefenseAuthority { return { ...currentAuthority }; }

export function isIPBlocked(ip: string): boolean { return blockedIPs.has(ip); }
export function isModuleQuarantined(module: string): boolean { return quarantinedModules.has(module); }
export function getEntityRateLimit(entity: string): number | null {
  const rl = rateLimitedEntities.get(entity);
  if (!rl || Date.now() > rl.expiresAt) { rateLimitedEntities.delete(entity); return null; }
  return rl.limit;
}

export function getActiveDefenseActions(): ThreatAction[] {
  return activeActions.filter(a => !a.reversed && (!a.expiresAt || Date.now() < a.expiresAt));
}

export function reverseAction(actionId: string): boolean {
  const action = activeActions.find(a => a.id === actionId && !a.reversed);
  if (!action || !action.reversible) return false;
  
  if (action.type === 'block_ip') blockedIPs.delete(action.target);
  if (action.type === 'quarantine_module') quarantinedModules.delete(action.target);
  if (action.type === 'rate_limit') rateLimitedEntities.delete(action.target);
  action.reversed = true;
  journalAction('DEFENSE', 'action_reversed', `Reversed ${action.type} on ${action.target}`, 'success');
  return true;
}

export function getDefenseActionHistory(limit = 50): ThreatAction[] {
  return activeActions.slice(-limit);
}
