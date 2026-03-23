/**
 * ADA — Autonomous Decision Engine
 * Core decision pipeline: Request → Validate → Evaluate → Verdict → Audit
 * Enterprise-grade with trust calibration and governance guardrails.
 */

import type {
  DecisionRequest,
  DecisionVerdict,
  DecisionOutcome,
  NodeAutonomy,
  ADAMetrics,
  DecisionDomain,
} from './types';
import { getScopeForDomain, isActionAllowed, getDomainsForNode } from './scopes';

const MAX_AUDIT_LOG = 2000;
const MAX_AUTONOMY_ENTRIES = 80;
const TRUST_DECAY_RATE = 0.02;
const TRUST_GROWTH_RATE = 0.01;
const COOLDOWN_MS = 60_000;
const HOUR_MS = 3_600_000;

/** FNV-1a for audit hashes */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** In-memory autonomy state per node */
const autonomyMap = new Map<string, NodeAutonomy>();

/** Audit trail (ring buffer) */
const auditLog: DecisionVerdict[] = [];
let auditCursor = 0;

/** Metrics counters */
const metrics: ADAMetrics = {
  totalDecisions: 0,
  approvedCount: 0,
  deniedCount: 0,
  deferredCount: 0,
  escalatedCount: 0,
  avgConfidence: 0,
  trustScoreDistribution: {},
  domainActivity: {} as Record<DecisionDomain, number>,
  hourlyRate: 0,
};
let metricsWindowStart = Date.now();
let metricsWindowCount = 0;

function getOrCreateAutonomy(nodeId: string): NodeAutonomy {
  let a = autonomyMap.get(nodeId);
  if (!a) {
    if (autonomyMap.size >= MAX_AUTONOMY_ENTRIES) {
      // Evict least recently active
      let oldest: string | null = null;
      let oldestTime = Infinity;
      for (const [k, v] of autonomyMap) {
        if (v.lastDecisionAt < oldestTime) {
          oldestTime = v.lastDecisionAt;
          oldest = k;
        }
      }
      if (oldest) autonomyMap.delete(oldest);
    }
    a = {
      nodeId,
      domains: getDomainsForNode(nodeId) as DecisionDomain[],
      trustScore: 50, // Start neutral
      decisionsThisHour: 0,
      successCount: 0,
      failureCount: 0,
      lastDecisionAt: 0,
      suspended: false,
    };
    autonomyMap.set(nodeId, a);
  }
  return a;
}

function resetHourlyCounterIfNeeded(a: NodeAutonomy): void {
  if (Date.now() - a.lastDecisionAt > HOUR_MS) {
    a.decisionsThisHour = 0;
  }
}

function recordAudit(verdict: DecisionVerdict): void {
  if (auditLog.length < MAX_AUDIT_LOG) {
    auditLog.push(verdict);
  } else {
    auditLog[auditCursor % MAX_AUDIT_LOG] = verdict;
  }
  auditCursor++;
}

function updateMetrics(verdict: DecisionVerdict): void {
  metrics.totalDecisions++;
  switch (verdict.outcome) {
    case 'approved': metrics.approvedCount++; break;
    case 'denied': metrics.deniedCount++; break;
    case 'deferred': metrics.deferredCount++; break;
    case 'escalated': metrics.escalatedCount++; break;
  }

  // Rolling average confidence
  metrics.avgConfidence =
    metrics.avgConfidence + (verdict.confidence - metrics.avgConfidence) / metrics.totalDecisions;

  // Domain activity
  const d = verdict.domain;
  metrics.domainActivity[d] = (metrics.domainActivity[d] || 0) + 1;

  // Hourly rate
  const now = Date.now();
  if (now - metricsWindowStart > HOUR_MS) {
    metrics.hourlyRate = metricsWindowCount;
    metricsWindowStart = now;
    metricsWindowCount = 0;
  }
  metricsWindowCount++;
}

/**
 * Core decision pipeline
 */
export function evaluateDecision(request: DecisionRequest): DecisionVerdict {
  const autonomy = getOrCreateAutonomy(request.nodeId);
  resetHourlyCounterIfNeeded(autonomy);

  const now = Date.now();
  let outcome: DecisionOutcome;
  let reasoning: string;
  let governanceCheck = true;

  // ── Gate 1: Suspension check ──
  if (autonomy.suspended) {
    if (autonomy.suspendedUntil && now > autonomy.suspendedUntil) {
      autonomy.suspended = false;
      autonomy.suspendedUntil = undefined;
    } else {
      outcome = 'denied';
      reasoning = `Node ${request.nodeId} is temporarily suspended`;
      return buildVerdict(request, outcome, reasoning, false, autonomy);
    }
  }

  // ── Gate 2: Domain authorization ──
  if (!autonomy.domains.includes(request.domain)) {
    outcome = 'denied';
    reasoning = `Node ${request.nodeId} has no authority over domain '${request.domain}'`;
    return buildVerdict(request, outcome, reasoning, false, autonomy);
  }

  // ── Gate 3: Action allowlist/blocklist ──
  if (!isActionAllowed(request.domain, request.action)) {
    outcome = 'denied';
    reasoning = `Action '${request.action}' is not permitted in domain '${request.domain}'`;
    return buildVerdict(request, outcome, reasoning, false, autonomy);
  }

  // ── Gate 4: Evolution block (absolute) ──
  if (
    request.action.includes('evolve') ||
    request.action.includes('evolution') ||
    request.action.includes('mutate-live') ||
    request.action.includes('self-modify')
  ) {
    outcome = 'denied';
    reasoning = 'Evolution and self-modification are prohibited in ADA';
    return buildVerdict(request, outcome, reasoning, true, autonomy);
  }

  // ── Gate 5: Rate limit ──
  const scope = getScopeForDomain(request.domain);
  if (scope && autonomy.decisionsThisHour >= scope.rateLimit) {
    outcome = 'deferred';
    reasoning = `Rate limit reached (${scope.rateLimit}/hr) for domain '${request.domain}'`;
    return buildVerdict(request, outcome, reasoning, true, autonomy);
  }

  // ── Gate 6: Confidence threshold (trust-adjusted) ──
  const trustMultiplier = 0.8 + (autonomy.trustScore / 500); // 0.8–1.0
  const effectiveThreshold = scope
    ? scope.autonomyThreshold * trustMultiplier
    : 0.85;

  if (request.confidence < effectiveThreshold) {
    // Below threshold — escalate for urgent, defer for routine
    if (request.urgency === 'critical' || request.urgency === 'urgent') {
      outcome = 'escalated';
      reasoning = `Confidence ${(request.confidence * 100).toFixed(1)}% below threshold ${(effectiveThreshold * 100).toFixed(1)}% — escalated due to urgency`;
    } else {
      outcome = 'deferred';
      reasoning = `Confidence ${(request.confidence * 100).toFixed(1)}% below threshold ${(effectiveThreshold * 100).toFixed(1)}%`;
    }
    return buildVerdict(request, outcome, reasoning, true, autonomy);
  }

  // ── Gate 7: Critical urgency requires higher bar ──
  if (request.urgency === 'critical' && request.confidence < 0.95) {
    outcome = 'escalated';
    reasoning = 'Critical decisions require ≥95% confidence for autonomous execution';
    return buildVerdict(request, outcome, reasoning, true, autonomy);
  }

  // ── All gates passed: APPROVE ──
  outcome = 'approved';
  reasoning = `Autonomous approval: confidence ${(request.confidence * 100).toFixed(1)}% meets threshold ${(effectiveThreshold * 100).toFixed(1)}% in domain '${request.domain}'`;
  governanceCheck = true;

  return buildVerdict(request, outcome, reasoning, governanceCheck, autonomy);
}

function buildVerdict(
  request: DecisionRequest,
  outcome: DecisionOutcome,
  reasoning: string,
  governanceCheck: boolean,
  autonomy: NodeAutonomy,
): DecisionVerdict {
  const now = Date.now();

  // Update autonomy state
  autonomy.decisionsThisHour++;
  autonomy.lastDecisionAt = now;

  if (outcome === 'approved') {
    autonomy.successCount++;
    autonomy.trustScore = Math.min(100, autonomy.trustScore + TRUST_GROWTH_RATE * (100 - autonomy.trustScore));
  } else if (outcome === 'denied') {
    autonomy.failureCount++;
    autonomy.trustScore = Math.max(0, autonomy.trustScore - TRUST_DECAY_RATE * autonomy.trustScore);

    // Auto-suspend after 5 consecutive denials in an hour
    if (autonomy.failureCount > 5 && autonomy.decisionsThisHour > 5) {
      const recentDenialRate = autonomy.failureCount / (autonomy.successCount + autonomy.failureCount);
      if (recentDenialRate > 0.7) {
        autonomy.suspended = true;
        autonomy.suspendedUntil = now + COOLDOWN_MS;
      }
    }
  }

  // Audit hash
  const auditPayload = `${request.id}:${outcome}:${request.nodeId}:${now}`;
  const auditHash = fnv1a(auditPayload);

  const verdict: DecisionVerdict = {
    requestId: request.id,
    outcome,
    nodeId: request.nodeId,
    domain: request.domain,
    action: request.action,
    confidence: request.confidence,
    reasoning,
    governanceCheck,
    auditHash,
    timestamp: now,
  };

  if (outcome === 'deferred') {
    verdict.cooldownUntil = now + COOLDOWN_MS;
  }

  recordAudit(verdict);
  updateMetrics(verdict);

  return verdict;
}

/** Report a decision outcome for trust calibration */
export function reportOutcome(
  nodeId: string,
  success: boolean,
): void {
  const a = autonomyMap.get(nodeId);
  if (!a) return;
  if (success) {
    a.successCount++;
    a.trustScore = Math.min(100, a.trustScore + TRUST_GROWTH_RATE * 2 * (100 - a.trustScore));
  } else {
    a.failureCount++;
    a.trustScore = Math.max(0, a.trustScore - TRUST_DECAY_RATE * 2 * a.trustScore);
  }
}

/** Get autonomy state for a node */
export function getNodeAutonomy(nodeId: string): NodeAutonomy | undefined {
  return autonomyMap.get(nodeId);
}

/** Get recent audit log */
export function getAuditLog(limit = 50): DecisionVerdict[] {
  const start = Math.max(0, auditLog.length - limit);
  return auditLog.slice(start);
}

/** Get ADA metrics snapshot */
export function getMetrics(): Readonly<ADAMetrics> {
  // Update trust distribution
  metrics.trustScoreDistribution = {};
  for (const [id, a] of autonomyMap) {
    metrics.trustScoreDistribution[id] = a.trustScore;
  }
  return metrics;
}

/** Suspend a node's autonomous decision-making */
export function suspendNode(nodeId: string, durationMs: number): void {
  const a = getOrCreateAutonomy(nodeId);
  a.suspended = true;
  a.suspendedUntil = Date.now() + durationMs;
}

/** Reinstate a suspended node */
export function reinstateNode(nodeId: string): void {
  const a = autonomyMap.get(nodeId);
  if (a) {
    a.suspended = false;
    a.suspendedUntil = undefined;
  }
}

/** Reset all autonomy state (for testing / governance reset) */
export function resetAll(): void {
  autonomyMap.clear();
  auditLog.length = 0;
  auditCursor = 0;
  metrics.totalDecisions = 0;
  metrics.approvedCount = 0;
  metrics.deniedCount = 0;
  metrics.deferredCount = 0;
  metrics.escalatedCount = 0;
  metrics.avgConfidence = 0;
  metrics.trustScoreDistribution = {};
  metrics.domainActivity = {} as Record<DecisionDomain, number>;
  metrics.hourlyRate = 0;
}
