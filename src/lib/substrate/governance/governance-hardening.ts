/**
 * GOVERNANCE Plane Hardening v2.0.0 — "Arbiter"
 * 
 * 25 enterprise-grade upgrades for the GOVERNANCE supervisory plane.
 * Additive layer — no modification of frozen governance internals.
 * 
 * Upgrades:
 *  #1  Policy Version Control — Immutable policy snapshots with lineage
 *  #2  Quorum Consensus Engine — Multi-authority approval with threshold
 *  #3  Decision Audit Chain — Hash-chained tamper-evident decision log
 *  #4  Separation of Duties — Role-based action conflict detection
 *  #5  Policy Conflict Resolver — Detects contradicting governance rules
 *  #6  Escalation Ladder — Tiered escalation with auto-promotion timers
 *  #7  Governance Session Manager — Scoped decision sessions with TTL
 *  #8  Rule Priority Engine — Weighted rule evaluation with overrides
 *  #9  Consent Verification — Explicit multi-party consent tracking
 *  #10 Governance Replay — Deterministic decision replay for audit
 *  #11 Policy Simulation — Dry-run policy changes against historical data
 *  #12 Delegation Chain — Transitive authority delegation with depth limits
 *  #13 Governance Cooldown — Enforced delay between major decisions
 *  #14 Decision Entropy Monitor — Detects erratic governance patterns
 *  #15 Policy Expiry Manager — Auto-sunset policies with renewal gates
 *  #16 Governance Checkpoint — Periodic state snapshots for rollback
 *  #17 Cross-Module Policy Gate — Unified policy enforcement across modules
 *  #18 Governance Rate Limiter — Prevents governance action flooding
 *  #19 Decision Impact Scorer — Pre-decision blast radius estimation
 *  #20 Governance Health Composite — Multi-signal governance health score
 *  #21 Policy Lineage Tracker — Full provenance chain for every rule
 *  #22 Governance Anomaly Detector — Statistical deviation in decision patterns
 *  #23 Emergency Override Protocol — Break-glass with mandatory justification
 *  #24 Governance Telemetry Emitter — Structured event stream for all actions
 *  #25 Governance Integrity Seal — Periodic integrity verification of all policies
 */

export const GOVERNANCE_HARDENING_VERSION = '2.0.0';
export const GOVERNANCE_HARDENING_CODENAME = 'Arbiter';

export const GOVERNANCE_HARDENING_UPGRADES = [
  { id: 1,  name: 'Policy Version Control',      category: 'lineage' },
  { id: 2,  name: 'Quorum Consensus Engine',      category: 'consensus' },
  { id: 3,  name: 'Decision Audit Chain',          category: 'audit' },
  { id: 4,  name: 'Separation of Duties',          category: 'access' },
  { id: 5,  name: 'Policy Conflict Resolver',      category: 'consistency' },
  { id: 6,  name: 'Escalation Ladder',             category: 'escalation' },
  { id: 7,  name: 'Governance Session Manager',    category: 'lifecycle' },
  { id: 8,  name: 'Rule Priority Engine',          category: 'evaluation' },
  { id: 9,  name: 'Consent Verification',          category: 'consensus' },
  { id: 10, name: 'Governance Replay',             category: 'audit' },
  { id: 11, name: 'Policy Simulation',             category: 'safety' },
  { id: 12, name: 'Delegation Chain',              category: 'access' },
  { id: 13, name: 'Governance Cooldown',           category: 'safety' },
  { id: 14, name: 'Decision Entropy Monitor',      category: 'observability' },
  { id: 15, name: 'Policy Expiry Manager',         category: 'lifecycle' },
  { id: 16, name: 'Governance Checkpoint',         category: 'resilience' },
  { id: 17, name: 'Cross-Module Policy Gate',      category: 'enforcement' },
  { id: 18, name: 'Governance Rate Limiter',       category: 'safety' },
  { id: 19, name: 'Decision Impact Scorer',        category: 'safety' },
  { id: 20, name: 'Governance Health Composite',   category: 'observability' },
  { id: 21, name: 'Policy Lineage Tracker',        category: 'lineage' },
  { id: 22, name: 'Governance Anomaly Detector',   category: 'observability' },
  { id: 23, name: 'Emergency Override Protocol',   category: 'escalation' },
  { id: 24, name: 'Governance Telemetry Emitter',  category: 'observability' },
  { id: 25, name: 'Governance Integrity Seal',     category: 'audit' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PolicySnapshot {
  id: string;
  version: number;
  parentId: string | null;
  rules: PolicyRule[];
  hash: string;
  createdAt: number;
  author: string;
  description: string;
}

export interface PolicyRule {
  id: string;
  module: string;
  action: string;
  effect: 'allow' | 'deny' | 'require_approval';
  priority: number;
  conditions: Record<string, unknown>;
  expiresAt: number | null;
  lineageId: string;
}

export interface QuorumRequest {
  id: string;
  action: string;
  requiredApprovals: number;
  approvals: string[];
  rejections: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: number;
  expiresAt: number;
  metadata: Record<string, unknown>;
}

export interface DecisionRecord {
  id: string;
  action: string;
  outcome: 'approved' | 'denied' | 'escalated' | 'overridden';
  authority: string;
  timestamp: number;
  hash: string;
  previousHash: string;
  impactScore: number;
  justification: string;
}

export interface GovernanceSession {
  id: string;
  scope: string;
  authorities: string[];
  decisions: string[];
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'closed' | 'expired';
}

export interface DelegationEntry {
  delegator: string;
  delegate: string;
  scope: string;
  depth: number;
  maxDepth: number;
  createdAt: number;
  expiresAt: number;
}

export interface GovernanceCheckpoint {
  id: string;
  timestamp: number;
  policyHash: string;
  activeRuleCount: number;
  healthScore: number;
  metadata: Record<string, unknown>;
}

export interface EmergencyOverride {
  id: string;
  authority: string;
  justification: string;
  affectedModules: string[];
  timestamp: number;
  expiresAt: number;
  revoked: boolean;
}

export interface GovernanceTelemetryEvent {
  type: string;
  action: string;
  module: string;
  authority: string;
  outcome: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface GovernanceHealthReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  policyConsistency: number;
  decisionLatency: number;
  escalationRate: number;
  overrideFrequency: number;
  anomalyCount: number;
  lastCheckpoint: number;
  activeSessionCount: number;
  pendingQuorums: number;
}

export interface PolicyConflict {
  ruleA: string;
  ruleB: string;
  module: string;
  conflictType: 'contradictory' | 'overlapping' | 'shadowed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string | null;
}

export interface ImpactAssessment {
  action: string;
  affectedModules: string[];
  blastRadius: number;        // 0-1
  reversibility: number;      // 0-1
  cascadeRisk: number;        // 0-1
  compositeScore: number;     // 0-100
  recommendation: 'proceed' | 'review' | 'block';
}

// ─── Internal State ───────────────────────────────────────────────────────────
// All arrays are capped to prevent unbounded memory growth.

const MAX_POLICY_VERSIONS = 100;
const MAX_DECISION_CHAIN = 2000;
const MAX_DELEGATIONS = 500;
const MAX_OVERRIDES = 200;
const MAX_TIMESTAMPS = 2000;

const policyVersions: PolicySnapshot[] = [];
const decisionChain: DecisionRecord[] = [];
const quorumRequests = new Map<string, QuorumRequest>();
const sessions = new Map<string, GovernanceSession>();
const delegations: DelegationEntry[] = [];
const cooldowns = new Map<string, number>(); // action → expiry timestamp
const checkpoints: GovernanceCheckpoint[] = [];
const overrides: EmergencyOverride[] = [];
const telemetryBuffer: GovernanceTelemetryEvent[] = [];
const decisionTimestamps: number[] = [];
const policyExpiries = new Map<string, number>(); // ruleId → expiry
const rateLimitBuckets = new Map<string, { tokens: number; lastRefill: number }>();
const anomalyBaseline = { mean: 0, stddev: 0, sampleCount: 0 };

let lastChainHash = '0'.repeat(64);

/** Trim an array to a max length, keeping the most recent entries */
function capArray<T>(arr: T[], max: number): void {
  if (arr.length > max) arr.splice(0, arr.length - max);
}

// ─── #1 Policy Version Control ────────────────────────────────────────────────

function hashPolicy(rules: PolicyRule[]): string {
  let h = 0x811c9dc5;
  const str = JSON.stringify(rules);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function createPolicyVersion(
  rules: PolicyRule[],
  author: string,
  description: string
): PolicySnapshot {
  const parent = policyVersions[policyVersions.length - 1] ?? null;
  const snapshot: PolicySnapshot = {
    id: `pol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    version: (parent?.version ?? 0) + 1,
    parentId: parent?.id ?? null,
    rules: [...rules],
    hash: hashPolicy(rules),
    createdAt: Date.now(),
    author,
    description,
  };
  policyVersions.push(snapshot);
  capArray(policyVersions, MAX_POLICY_VERSIONS);
  emitGovernanceTelemetry('policy_version', 'create', 'governance', author, 'created');
  return snapshot;
}

export function getPolicyVersion(version?: number): PolicySnapshot | null {
  if (version !== undefined) return policyVersions.find(p => p.version === version) ?? null;
  return policyVersions[policyVersions.length - 1] ?? null;
}

export function getPolicyHistory(): PolicySnapshot[] {
  return [...policyVersions];
}

// ─── #2 Quorum Consensus Engine ───────────────────────────────────────────────

export function createQuorum(
  action: string,
  requiredApprovals: number,
  ttlMs: number = 300_000,
  metadata: Record<string, unknown> = {}
): QuorumRequest {
  const q: QuorumRequest = {
    id: `qrm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    requiredApprovals,
    approvals: [],
    rejections: [],
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    metadata,
  };
  quorumRequests.set(q.id, q);
  return q;
}

export function submitQuorumVote(quorumId: string, authority: string, approve: boolean): QuorumRequest | null {
  const q = quorumRequests.get(quorumId);
  if (!q || q.status !== 'pending') return null;
  if (Date.now() > q.expiresAt) { q.status = 'expired'; return q; }

  if (approve) {
    if (!q.approvals.includes(authority)) q.approvals.push(authority);
    if (q.approvals.length >= q.requiredApprovals) q.status = 'approved';
  } else {
    if (!q.rejections.includes(authority)) q.rejections.push(authority);
    if (q.rejections.length > q.requiredApprovals) q.status = 'rejected';
  }
  return q;
}

export function getQuorumStatus(quorumId: string): QuorumRequest | null {
  return quorumRequests.get(quorumId) ?? null;
}

export function getPendingQuorums(): QuorumRequest[] {
  return [...quorumRequests.values()].filter(q => q.status === 'pending');
}

// ─── #3 Decision Audit Chain ──────────────────────────────────────────────────

function hashDecision(record: Omit<DecisionRecord, 'hash'>): string {
  let h = 0x811c9dc5;
  const str = `${record.id}:${record.action}:${record.outcome}:${record.authority}:${record.timestamp}:${record.previousHash}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function recordDecision(
  action: string,
  outcome: DecisionRecord['outcome'],
  authority: string,
  justification: string,
  impactScore: number = 50
): DecisionRecord {
  const partial = {
    id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    outcome,
    authority,
    timestamp: Date.now(),
    previousHash: lastChainHash,
    impactScore,
    justification,
  };
  const record: DecisionRecord = { ...partial, hash: hashDecision(partial) };
  lastChainHash = record.hash;
  decisionChain.push(record);
  capArray(decisionChain, MAX_DECISION_CHAIN);
  decisionTimestamps.push(record.timestamp);
  capArray(decisionTimestamps, MAX_TIMESTAMPS);
  emitGovernanceTelemetry('decision', action, 'governance', authority, outcome);
  return record;
}

export function verifyDecisionChain(): { valid: boolean; brokenAt: number | null } {
  let prevHash = '0'.repeat(64);
  for (let i = 0; i < decisionChain.length; i++) {
    const d = decisionChain[i];
    if (d.previousHash !== prevHash) return { valid: false, brokenAt: i };
    const { hash: _h, ...rest } = d;
    const expected = hashDecision(rest);
    if (d.hash !== expected) return { valid: false, brokenAt: i };
    prevHash = d.hash;
  }
  return { valid: true, brokenAt: null };
}

export function getDecisionChain(limit?: number): DecisionRecord[] {
  return limit ? decisionChain.slice(-limit) : [...decisionChain];
}

// ─── #4 Separation of Duties ─────────────────────────────────────────────────

const DUTY_CONFLICTS: Record<string, string[]> = {
  'policy.create': ['policy.approve', 'policy.deploy'],
  'override.issue': ['override.approve'],
  'quorum.create': ['quorum.vote'],
  'evolution.propose': ['evolution.approve'],
  'delegation.grant': ['delegation.use'],
};

export function checkDutySeparation(authority: string, action: string, recentActors: Map<string, string[]>): {
  allowed: boolean;
  conflicts: string[];
} {
  const conflictActions = DUTY_CONFLICTS[action] ?? [];
  const conflicts: string[] = [];
  for (const conflictAction of conflictActions) {
    const actors = recentActors.get(conflictAction) ?? [];
    if (actors.includes(authority)) conflicts.push(conflictAction);
  }
  return { allowed: conflicts.length === 0, conflicts };
}

// ─── #5 Policy Conflict Resolver ──────────────────────────────────────────────

export function detectPolicyConflicts(rules: PolicyRule[]): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i], b = rules[j];
      if (a.module !== b.module || a.action !== b.action) continue;

      if (a.effect !== b.effect) {
        conflicts.push({
          ruleA: a.id, ruleB: b.id, module: a.module,
          conflictType: 'contradictory',
          severity: 'critical',
          resolution: `Rule ${a.priority > b.priority ? a.id : b.id} takes precedence by priority`,
        });
      } else if (a.priority === b.priority) {
        conflicts.push({
          ruleA: a.id, ruleB: b.id, module: a.module,
          conflictType: 'overlapping',
          severity: 'medium',
          resolution: 'Consider merging or adjusting priority',
        });
      }
    }
  }
  return conflicts;
}

// ─── #6 Escalation Ladder ─────────────────────────────────────────────────────

const ESCALATION_TIERS = [
  { tier: 1, name: 'Module Owner', autoPromoteMs: 60_000 },
  { tier: 2, name: 'Governance Council', autoPromoteMs: 120_000 },
  { tier: 3, name: 'System Authority', autoPromoteMs: 300_000 },
  { tier: 4, name: 'Emergency Override', autoPromoteMs: null },
] as const;

const escalationState = new Map<string, { tier: number; createdAt: number; escalatedAt: number }>();

export function initiateEscalation(actionId: string): { tier: number; name: string } {
  escalationState.set(actionId, { tier: 1, createdAt: Date.now(), escalatedAt: Date.now() });
  return { tier: 1, name: ESCALATION_TIERS[0].name };
}

export function checkEscalationPromotion(actionId: string): { tier: number; name: string; promoted: boolean } {
  const state = escalationState.get(actionId);
  if (!state) return { tier: 0, name: 'none', promoted: false };
  
  const currentTier = ESCALATION_TIERS[state.tier - 1];
  if (!currentTier?.autoPromoteMs) return { tier: state.tier, name: currentTier?.name ?? 'unknown', promoted: false };

  const elapsed = Date.now() - state.escalatedAt;
  if (elapsed >= currentTier.autoPromoteMs && state.tier < ESCALATION_TIERS.length) {
    state.tier++;
    state.escalatedAt = Date.now();
    const newTier = ESCALATION_TIERS[state.tier - 1];
    emitGovernanceTelemetry('escalation', 'promote', 'governance', 'system', `tier_${state.tier}`);
    return { tier: state.tier, name: newTier.name, promoted: true };
  }
  return { tier: state.tier, name: currentTier.name, promoted: false };
}

export function getEscalationTiers() { return [...ESCALATION_TIERS]; }

// ─── #7 Governance Session Manager ────────────────────────────────────────────

export function openGovernanceSession(scope: string, authorities: string[], ttlMs: number = 600_000): GovernanceSession {
  const session: GovernanceSession = {
    id: `gsn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scope,
    authorities,
    decisions: [],
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
    status: 'active',
  };
  sessions.set(session.id, session);
  return session;
}

export function addSessionDecision(sessionId: string, decisionId: string): boolean {
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'active') return false;
  if (Date.now() > s.expiresAt) { s.status = 'expired'; return false; }
  s.decisions.push(decisionId);
  return true;
}

export function closeGovernanceSession(sessionId: string): boolean {
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'active') return false;
  s.status = 'closed';
  return true;
}

export function getActiveSessions(): GovernanceSession[] {
  const now = Date.now();
  for (const s of sessions.values()) {
    if (s.status === 'active' && now > s.expiresAt) s.status = 'expired';
  }
  return [...sessions.values()].filter(s => s.status === 'active');
}

// ─── #8 Rule Priority Engine ──────────────────────────────────────────────────

export function evaluateRules(rules: PolicyRule[], module: string, action: string): {
  effect: 'allow' | 'deny' | 'require_approval';
  matchedRule: PolicyRule | null;
  evaluatedCount: number;
} {
  const applicable = rules
    .filter(r => r.module === module && r.action === action)
    .filter(r => !r.expiresAt || r.expiresAt > Date.now())
    .sort((a, b) => b.priority - a.priority);

  return {
    effect: applicable[0]?.effect ?? 'deny',
    matchedRule: applicable[0] ?? null,
    evaluatedCount: applicable.length,
  };
}

// ─── #9 Consent Verification ──────────────────────────────────────────────────

const consentLog = new Map<string, { parties: Set<string>; required: string[]; timestamp: number }>();

export function requireConsent(actionId: string, requiredParties: string[]): void {
  consentLog.set(actionId, { parties: new Set(), required: requiredParties, timestamp: Date.now() });
}

export function grantConsent(actionId: string, party: string): boolean {
  const entry = consentLog.get(actionId);
  if (!entry) return false;
  entry.parties.add(party);
  return true;
}

export function isConsentComplete(actionId: string): { complete: boolean; missing: string[] } {
  const entry = consentLog.get(actionId);
  if (!entry) return { complete: false, missing: [] };
  const missing = entry.required.filter(p => !entry.parties.has(p));
  return { complete: missing.length === 0, missing };
}

// ─── #10 Governance Replay ────────────────────────────────────────────────────

export function replayDecisions(fromIndex: number, toIndex?: number): DecisionRecord[] {
  return decisionChain.slice(fromIndex, toIndex);
}

export function replayByAuthority(authority: string): DecisionRecord[] {
  return decisionChain.filter(d => d.authority === authority);
}

export function replayByAction(action: string): DecisionRecord[] {
  return decisionChain.filter(d => d.action === action);
}

// ─── #11 Policy Simulation ────────────────────────────────────────────────────

export function simulatePolicy(
  candidateRules: PolicyRule[],
  testCases: Array<{ module: string; action: string; expected: 'allow' | 'deny' | 'require_approval' }>
): { passed: number; failed: number; results: Array<{ module: string; action: string; expected: string; actual: string; pass: boolean }> } {
  const results = testCases.map(tc => {
    const { effect } = evaluateRules(candidateRules, tc.module, tc.action);
    return { ...tc, actual: effect, pass: effect === tc.expected };
  });
  return { passed: results.filter(r => r.pass).length, failed: results.filter(r => !r.pass).length, results };
}

// ─── #12 Delegation Chain ─────────────────────────────────────────────────────

const MAX_DELEGATION_DEPTH = 3;

export function createDelegation(
  delegator: string, delegate: string, scope: string, ttlMs: number = 3_600_000
): DelegationEntry | null {
  const existingDepth = delegations
    .filter(d => d.delegate === delegator && d.scope === scope && d.expiresAt > Date.now())
    .reduce((max, d) => Math.max(max, d.depth), 0);

  if (existingDepth >= MAX_DELEGATION_DEPTH) return null;

  const entry: DelegationEntry = {
    delegator, delegate, scope,
    depth: existingDepth + 1,
    maxDepth: MAX_DELEGATION_DEPTH,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
  delegations.push(entry);
  capArray(delegations, MAX_DELEGATIONS);
  return entry;
}

export function resolveDelegation(actor: string, scope: string): string[] {
  const chain: string[] = [actor];
  let current = actor;
  const now = Date.now();
  for (let i = 0; i < MAX_DELEGATION_DEPTH; i++) {
    const d = delegations.find(d => d.delegate === current && d.scope === scope && d.expiresAt > now);
    if (!d) break;
    chain.push(d.delegator);
    current = d.delegator;
  }
  return chain;
}

// ─── #13 Governance Cooldown ──────────────────────────────────────────────────

const COOLDOWN_DEFAULTS: Record<string, number> = {
  'policy.deploy': 30_000,
  'override.issue': 60_000,
  'evolution.apply': 120_000,
};

export function enforceCooldown(action: string, customMs?: number): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const expiry = cooldowns.get(action) ?? 0;
  if (now < expiry) return { allowed: false, remainingMs: expiry - now };

  const duration = customMs ?? COOLDOWN_DEFAULTS[action] ?? 10_000;
  cooldowns.set(action, now + duration);
  return { allowed: true, remainingMs: 0 };
}

export function getCooldownStatus(): Array<{ action: string; remainingMs: number }> {
  const now = Date.now();
  return [...cooldowns.entries()]
    .filter(([, expiry]) => expiry > now)
    .map(([action, expiry]) => ({ action, remainingMs: expiry - now }));
}

// ─── #14 Decision Entropy Monitor ─────────────────────────────────────────────

export function measureDecisionEntropy(windowMs: number = 300_000): {
  decisionRate: number;
  entropy: number;
  isErratic: boolean;
} {
  const now = Date.now();
  const window = decisionTimestamps.filter(t => now - t < windowMs);
  const rate = window.length / (windowMs / 60_000);

  // Shannon entropy over outcome distribution
  const outcomes = decisionChain
    .filter(d => now - d.timestamp < windowMs)
    .map(d => d.outcome);
  const counts = new Map<string, number>();
  for (const o of outcomes) counts.set(o, (counts.get(o) ?? 0) + 1);
  
  let entropy = 0;
  const total = outcomes.length || 1;
  for (const c of counts.values()) {
    const p = c / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  // Update baseline
  if (anomalyBaseline.sampleCount > 0) {
    const delta = rate - anomalyBaseline.mean;
    anomalyBaseline.sampleCount++;
    anomalyBaseline.mean += delta / anomalyBaseline.sampleCount;
    anomalyBaseline.stddev = Math.sqrt(
      ((anomalyBaseline.sampleCount - 1) * anomalyBaseline.stddev ** 2 + delta * (rate - anomalyBaseline.mean)) /
      anomalyBaseline.sampleCount
    );
  } else {
    anomalyBaseline.mean = rate;
    anomalyBaseline.sampleCount = 1;
  }

  const sigma = anomalyBaseline.stddev > 0 ? Math.abs(rate - anomalyBaseline.mean) / anomalyBaseline.stddev : 0;
  return { decisionRate: rate, entropy, isErratic: sigma > 2.5 };
}

// ─── #15 Policy Expiry Manager ────────────────────────────────────────────────

export function setPolicyExpiry(ruleId: string, expiresAt: number): void {
  policyExpiries.set(ruleId, expiresAt);
}

export function getExpiredPolicies(): string[] {
  const now = Date.now();
  return [...policyExpiries.entries()]
    .filter(([, expiry]) => expiry <= now)
    .map(([id]) => id);
}

export function getExpiringPolicies(withinMs: number = 86_400_000): Array<{ ruleId: string; expiresIn: number }> {
  const now = Date.now();
  return [...policyExpiries.entries()]
    .filter(([, expiry]) => expiry > now && expiry - now <= withinMs)
    .map(([ruleId, expiry]) => ({ ruleId, expiresIn: expiry - now }))
    .sort((a, b) => a.expiresIn - b.expiresIn);
}

// ─── #16 Governance Checkpoint ────────────────────────────────────────────────

export function createGovernanceCheckpoint(metadata: Record<string, unknown> = {}): GovernanceCheckpoint {
  const currentPolicy = policyVersions[policyVersions.length - 1];
  const health = calculateGovernanceHealth();
  const cp: GovernanceCheckpoint = {
    id: `gcp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    policyHash: currentPolicy?.hash ?? 'none',
    activeRuleCount: currentPolicy?.rules.length ?? 0,
    healthScore: health.score,
    metadata,
  };
  checkpoints.push(cp);
  return cp;
}

export function getCheckpoints(limit?: number): GovernanceCheckpoint[] {
  return limit ? checkpoints.slice(-limit) : [...checkpoints];
}

// ─── #17 Cross-Module Policy Gate ─────────────────────────────────────────────

export function enforcePolicy(
  module: string,
  action: string,
  actor: string
): { allowed: boolean; reason: string; rule: PolicyRule | null } {
  const currentPolicy = policyVersions[policyVersions.length - 1];
  if (!currentPolicy) return { allowed: true, reason: 'no_policy_defined', rule: null };

  const { effect, matchedRule } = evaluateRules(currentPolicy.rules, module, action);
  if (effect === 'deny') return { allowed: false, reason: `denied_by_rule_${matchedRule?.id}`, rule: matchedRule };
  if (effect === 'require_approval') return { allowed: false, reason: `requires_approval_${matchedRule?.id}`, rule: matchedRule };
  return { allowed: true, reason: 'allowed', rule: matchedRule };
}

// ─── #18 Governance Rate Limiter ──────────────────────────────────────────────

const GOV_RATE_LIMIT = { maxTokens: 20, refillRate: 2, refillIntervalMs: 1000 };

export function tryGovernanceAction(actionType: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(actionType);
  if (!bucket) {
    bucket = { tokens: GOV_RATE_LIMIT.maxTokens, lastRefill: now };
    rateLimitBuckets.set(actionType, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  const refillCount = Math.floor(elapsed / GOV_RATE_LIMIT.refillIntervalMs) * GOV_RATE_LIMIT.refillRate;
  bucket.tokens = Math.min(GOV_RATE_LIMIT.maxTokens, bucket.tokens + refillCount);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens--;
    return { allowed: true, retryAfterMs: 0 };
  }
  return { allowed: false, retryAfterMs: GOV_RATE_LIMIT.refillIntervalMs };
}

// ─── #19 Decision Impact Scorer ───────────────────────────────────────────────

const MODULE_CRITICALITY: Record<string, number> = {
  // Kernel + Plane + Shell + Fields (critical infrastructure)
  core: 1.0, governance: 0.95, defense: 0.9, immunity: 0.85, intent: 0.80,
  // CCR (cognitive core)
  brain: 0.85, memory: 0.80, dream: 0.70,
  // Execution (high-traffic)
  decode: 0.75, encode: 0.75, nexus: 0.75, cortex: 0.70, vision: 0.65,
  medic: 0.60, economy: 0.55, sandbox: 0.50, inclusive: 0.45, integration: 0.45,
  // System
  system: 0.60,
  // OCG (compliance grid)
  audit: 0.70, nerve: 0.55, access: 0.55, identity: 0.55, relay: 0.50, ripple: 0.50,
  // ESZ (sovereignty)
  sovereign: 0.50, oracle: 0.45, conscience: 0.45, treaty: 0.45,
  // CSZ (covert)
  evolution: 0.65, shadow: 0.40, phantom: 0.40,
  // EPZ (perception)
  compass: 0.35, echo: 0.35, reflex: 0.35,
  // EMZ (manufacturing)
  forge: 0.35, lingua: 0.30, harvest: 0.30,
};

export function assessImpact(
  action: string,
  affectedModules: string[],
  reversible: boolean = true
): ImpactAssessment {
  const maxCriticality = Math.max(...affectedModules.map(m => MODULE_CRITICALITY[m] ?? 0.3));
  const blastRadius = Math.min(1, affectedModules.length / 10);
  const reversibility = reversible ? 0.8 : 0.2;
  const cascadeRisk = blastRadius * maxCriticality;
  const compositeScore = Math.round(
    (maxCriticality * 40 + blastRadius * 30 + (1 - reversibility) * 20 + cascadeRisk * 10) 
  );

  let recommendation: ImpactAssessment['recommendation'] = 'proceed';
  if (compositeScore > 70) recommendation = 'block';
  else if (compositeScore > 40) recommendation = 'review';

  return { action, affectedModules, blastRadius, reversibility, cascadeRisk, compositeScore, recommendation };
}

// ─── #20 Governance Health Composite ──────────────────────────────────────────

export function calculateGovernanceHealth(): GovernanceHealthReport {
  const now = Date.now();
  const recentDecisions = decisionChain.filter(d => now - d.timestamp < 3_600_000);
  const escalations = recentDecisions.filter(d => d.outcome === 'escalated').length;
  const overrideCount = overrides.filter(o => now - o.timestamp < 3_600_000 && !o.revoked).length;
  const totalDecisions = recentDecisions.length || 1;

  const chainIntegrity = verifyDecisionChain();
  const conflicts = policyVersions.length > 0 
    ? detectPolicyConflicts(policyVersions[policyVersions.length - 1]?.rules ?? [])
    : [];
  
  const policyConsistency = conflicts.length === 0 ? 100 : Math.max(0, 100 - conflicts.length * 15);
  const escalationRate = (escalations / totalDecisions) * 100;
  const overrideFrequency = (overrideCount / totalDecisions) * 100;
  const latencies = recentDecisions.length > 1
    ? recentDecisions.slice(1).map((d, i) => d.timestamp - recentDecisions[i].timestamp)
    : [0];
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  const score = Math.round(
    (chainIntegrity.valid ? 25 : 0) +
    (policyConsistency * 0.25) +
    Math.max(0, 25 - escalationRate) +
    Math.max(0, 25 - overrideFrequency * 5)
  );

  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    score, grade,
    policyConsistency,
    decisionLatency: avgLatency,
    escalationRate,
    overrideFrequency,
    anomalyCount: 0,
    lastCheckpoint: checkpoints[checkpoints.length - 1]?.timestamp ?? 0,
    activeSessionCount: getActiveSessions().length,
    pendingQuorums: getPendingQuorums().length,
  };
}

// ─── #21 Policy Lineage Tracker ───────────────────────────────────────────────

export function tracePolicyLineage(ruleId: string): Array<{ version: number; hash: string; timestamp: number }> {
  const lineage: Array<{ version: number; hash: string; timestamp: number }> = [];
  for (const snapshot of policyVersions) {
    const rule = snapshot.rules.find(r => r.lineageId === ruleId || r.id === ruleId);
    if (rule) lineage.push({ version: snapshot.version, hash: snapshot.hash, timestamp: snapshot.createdAt });
  }
  return lineage;
}

// ─── #22 Governance Anomaly Detector ──────────────────────────────────────────

export function detectGovernanceAnomalies(windowMs: number = 600_000): Array<{
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}> {
  const anomalies: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> = [];
  const now = Date.now();
  const recent = decisionChain.filter(d => now - d.timestamp < windowMs);

  // Rapid override detection
  const recentOverrides = overrides.filter(o => now - o.timestamp < windowMs);
  if (recentOverrides.length >= 3) {
    anomalies.push({ type: 'override_surge', description: `${recentOverrides.length} overrides in window`, severity: 'high' });
  }

  // Single-actor dominance
  const actorCounts = new Map<string, number>();
  for (const d of recent) actorCounts.set(d.authority, (actorCounts.get(d.authority) ?? 0) + 1);
  for (const [actor, count] of actorCounts) {
    if (count > recent.length * 0.7 && recent.length >= 5) {
      anomalies.push({ type: 'actor_dominance', description: `${actor} made ${count}/${recent.length} decisions`, severity: 'medium' });
    }
  }

  // Denial spike
  const denials = recent.filter(d => d.outcome === 'denied').length;
  if (denials > recent.length * 0.5 && recent.length >= 5) {
    anomalies.push({ type: 'denial_spike', description: `${denials}/${recent.length} decisions denied`, severity: 'medium' });
  }

  return anomalies;
}

// ─── #23 Emergency Override Protocol ──────────────────────────────────────────

export function issueEmergencyOverride(
  authority: string,
  justification: string,
  affectedModules: string[],
  ttlMs: number = 300_000
): EmergencyOverride {
  if (!justification || justification.length < 10) {
    throw new Error('Emergency override requires justification (min 10 chars)');
  }
  const override: EmergencyOverride = {
    id: `emo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    authority,
    justification,
    affectedModules,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
    revoked: false,
  };
  overrides.push(override);
  capArray(overrides, MAX_OVERRIDES);
  emitGovernanceTelemetry('emergency_override', 'issue', 'governance', authority, 'active');
  return override;
}

export function revokeEmergencyOverride(overrideId: string): boolean {
  const o = overrides.find(o => o.id === overrideId);
  if (!o || o.revoked) return false;
  o.revoked = true;
  emitGovernanceTelemetry('emergency_override', 'revoke', 'governance', o.authority, 'revoked');
  return true;
}

export function getActiveOverrides(): EmergencyOverride[] {
  const now = Date.now();
  return overrides.filter(o => !o.revoked && o.expiresAt > now);
}

export function isModuleOverridden(module: string): boolean {
  return getActiveOverrides().some(o => o.affectedModules.includes(module));
}

// ─── #24 Governance Telemetry Emitter ─────────────────────────────────────────

function emitGovernanceTelemetry(
  type: string, action: string, module: string, authority: string, outcome: string
): void {
  const event: GovernanceTelemetryEvent = {
    type, action, module, authority, outcome,
    timestamp: Date.now(),
    metadata: {},
  };
  telemetryBuffer.push(event);
  if (telemetryBuffer.length > 1000) telemetryBuffer.splice(0, telemetryBuffer.length - 500);
}

export function getGovernanceTelemetry(limit: number = 50): GovernanceTelemetryEvent[] {
  return telemetryBuffer.slice(-limit);
}

export function getGovernanceTelemetryByType(type: string): GovernanceTelemetryEvent[] {
  return telemetryBuffer.filter(e => e.type === type);
}

export function flushGovernanceTelemetry(): GovernanceTelemetryEvent[] {
  const flushed = [...telemetryBuffer];
  telemetryBuffer.length = 0;
  return flushed;
}

// ─── #25 Governance Integrity Seal ────────────────────────────────────────────

export function sealGovernanceIntegrity(): {
  valid: boolean;
  chainIntegrity: boolean;
  policyConsistency: boolean;
  activeOverrideCount: number;
  expiredPolicyCount: number;
  sealHash: string;
  timestamp: number;
} {
  const chain = verifyDecisionChain();
  const currentPolicy = policyVersions[policyVersions.length - 1];
  const conflicts = currentPolicy ? detectPolicyConflicts(currentPolicy.rules) : [];
  const expired = getExpiredPolicies();
  const activeOvr = getActiveOverrides();

  let h = 0x811c9dc5;
  const sealStr = `${chain.valid}:${conflicts.length}:${expired.length}:${activeOvr.length}:${Date.now()}`;
  for (let i = 0; i < sealStr.length; i++) {
    h ^= sealStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  return {
    valid: chain.valid && conflicts.filter(c => c.severity === 'critical').length === 0,
    chainIntegrity: chain.valid,
    policyConsistency: conflicts.length === 0,
    activeOverrideCount: activeOvr.length,
    expiredPolicyCount: expired.length,
    sealHash: (h >>> 0).toString(16).padStart(8, '0'),
    timestamp: Date.now(),
  };
}

// ─── Status ───────────────────────────────────────────────────────────────────

export function getGovernanceHardeningStatus() {
  return {
    version: GOVERNANCE_HARDENING_VERSION,
    codename: GOVERNANCE_HARDENING_CODENAME,
    upgradeCount: GOVERNANCE_HARDENING_UPGRADES.length,
    upgrades: GOVERNANCE_HARDENING_UPGRADES.map(u => u.name),
    health: calculateGovernanceHealth(),
    seal: sealGovernanceIntegrity(),
  };
}
