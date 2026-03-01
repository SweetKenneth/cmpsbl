/**
 * ATLAS Hardening v2.0.0 — Codename "Prometheus"
 * 25 enterprise-grade features for centralized governance and approval workflows
 *
 * Non-breaking additive layer
 */

export const ATLAS_HARDENING_VERSION = '2.0.0';
export const ATLAS_HARDENING_CODENAME = 'Prometheus';

// ─── 1. Approval Chain Logger ──────────────────────────────────────────────
interface ApprovalChain { id: string; messageId: string; action: 'approved' | 'rejected'; note: string; ts: number; }
const approvalChain: ApprovalChain[] = [];
export function logApproval(messageId: string, action: 'approved' | 'rejected', note: string): void {
  approvalChain.push({ id: `ac_${Date.now()}`, messageId, action, note, ts: Date.now() });
  if (approvalChain.length > 500) approvalChain.splice(0, approvalChain.length - 500);
}
export function getApprovalChain(limit = 20): ApprovalChain[] { return approvalChain.slice(-limit); }
export function getApprovalStats(): { total: number; approved: number; rejected: number } {
  return { total: approvalChain.length, approved: approvalChain.filter(a => a.action === 'approved').length, rejected: approvalChain.filter(a => a.action === 'rejected').length };
}

// ─── 2. Session Security Tracker ───────────────────────────────────────────
const sessionTracker: Array<{ sessionId: string; startedAt: number; lastActivity: number; commandCount: number }> = [];
export function trackSession(sessionId: string): void {
  const existing = sessionTracker.find(s => s.sessionId === sessionId);
  if (existing) { existing.lastActivity = Date.now(); existing.commandCount++; }
  else sessionTracker.push({ sessionId, startedAt: Date.now(), lastActivity: Date.now(), commandCount: 1 });
}
export function getActiveSessions(): number { return sessionTracker.filter(s => Date.now() - s.lastActivity < 1800_000).length; }

// ─── 3. Command Rate Limiter ───────────────────────────────────────────────
const commandTimestamps: number[] = [];
export function checkCommandRateLimit(maxPerMinute = 30): boolean {
  const now = Date.now();
  commandTimestamps.push(now);
  const recent = commandTimestamps.filter(t => now - t < 60_000);
  commandTimestamps.length = 0;
  commandTimestamps.push(...recent);
  return recent.length <= maxPerMinute;
}

// ─── 4. Policy Enforcement Audit ───────────────────────────────────────────
interface PolicyAudit { policy: string; enforced: boolean; target: string; ts: number; }
const policyAudits: PolicyAudit[] = [];
export function auditPolicyEnforcement(policy: string, enforced: boolean, target: string): void {
  policyAudits.push({ policy, enforced, target, ts: Date.now() });
  if (policyAudits.length > 300) policyAudits.splice(0, policyAudits.length - 300);
}
export function getPolicyAudits(limit = 20): PolicyAudit[] { return policyAudits.slice(-limit); }

// ─── 5. Mode Transition Logger ─────────────────────────────────────────────
const modeTransitions: Array<{ from: string; to: string; ts: number; reason: string }> = [];
export function logModeTransition(from: string, to: string, reason: string): void {
  modeTransitions.push({ from, to, ts: Date.now(), reason });
}
export function getModeTransitions(limit = 10) { return modeTransitions.slice(-limit); }

// ─── 6. Capability Usage Counter ───────────────────────────────────────────
const capUsage = new Map<string, number>();
export function recordCapabilityUsage(capId: string): void { capUsage.set(capId, (capUsage.get(capId) ?? 0) + 1); }
export function getCapabilityUsageRanking(): Array<{ capId: string; uses: number }> {
  return Array.from(capUsage.entries()).map(([capId, uses]) => ({ capId, uses })).sort((a, b) => b.uses - a.uses);
}

// ─── 7. Escalation Tracker ─────────────────────────────────────────────────
const escalations: Array<{ source: string; reason: string; ts: number; resolved: boolean }> = [];
export function escalateToAtlas(source: string, reason: string): void {
  escalations.push({ source, reason, ts: Date.now(), resolved: false });
}
export function getUnresolvedEscalations() { return escalations.filter(e => !e.resolved); }
export function resolveEscalation(source: string): void {
  const e = escalations.find(e => e.source === source && !e.resolved);
  if (e) e.resolved = true;
}

// ─── 8. Dry Run Success Tracker ────────────────────────────────────────────
let dryRunSuccess = 0, dryRunFail = 0;
export function recordDryRunOutcome(success: boolean): void { if (success) dryRunSuccess++; else dryRunFail++; }
export function getDryRunSuccessRate(): number {
  const t = dryRunSuccess + dryRunFail;
  return t > 0 ? Math.round((dryRunSuccess / t) * 100) : 100;
}

// ─── 9. Node Communication Frequency ──────────────────────────────────────
const nodeComFreq = new Map<string, number>();
export function recordNodeCommunication(node: string): void { nodeComFreq.set(node, (nodeComFreq.get(node) ?? 0) + 1); }
export function getNodeCommunicationFrequency(): Record<string, number> { return Object.fromEntries(nodeComFreq); }

// ─── 10. Response Time Monitor ─────────────────────────────────────────────
const responseTimes: number[] = [];
export function recordResponseTime(ms: number): void {
  responseTimes.push(ms);
  if (responseTimes.length > 500) responseTimes.splice(0, responseTimes.length - 500);
}
export function getAvgResponseTime(): number { return responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0; }

// ─── 11. Conversation Thread Tracker ───────────────────────────────────────
const threads = new Map<string, { messageCount: number; startedAt: number; lastAt: number }>();
export function trackThread(threadId: string): void {
  const existing = threads.get(threadId);
  if (existing) { existing.messageCount++; existing.lastAt = Date.now(); }
  else threads.set(threadId, { messageCount: 1, startedAt: Date.now(), lastAt: Date.now() });
}
export function getActiveThreadCount(): number { return threads.size; }

// ─── 12. Human Approval Latency ────────────────────────────────────────────
const approvalLatencies: number[] = [];
export function recordApprovalLatency(ms: number): void {
  approvalLatencies.push(ms);
  if (approvalLatencies.length > 200) approvalLatencies.splice(0, approvalLatencies.length - 200);
}
export function getAvgApprovalLatency(): number {
  return approvalLatencies.length > 0 ? Math.round(approvalLatencies.reduce((a, b) => a + b, 0) / approvalLatencies.length) : 0;
}

// ─── 13. Auto-Expiry Monitor ───────────────────────────────────────────────
let totalExpired = 0;
export function recordExpiry(): void { totalExpired++; }
export function getTotalExpiredMessages(): number { return totalExpired; }

// ─── 14. Atlas Uptime Tracker ──────────────────────────────────────────────
const atlasStartTime = Date.now();
export function getAtlasUptime(): number { return Date.now() - atlasStartTime; }
export function getAtlasUptimeHours(): number { return Math.round(getAtlasUptime() / 3_600_000 * 10) / 10; }

// ─── 15. Priority Queue Depth ──────────────────────────────────────────────
const queueDepths: Array<{ ts: number; depth: number }> = [];
export function recordQueueDepth(depth: number): void {
  queueDepths.push({ ts: Date.now(), depth });
  if (queueDepths.length > 100) queueDepths.splice(0, queueDepths.length - 100);
}
export function getQueueDepthTrend(limit = 20) { return queueDepths.slice(-limit); }

// ─── 16. Node Satisfaction Score ───────────────────────────────────────────
const nodeSatisfaction = new Map<string, number[]>();
export function rateNodeSatisfaction(node: string, score: number): void {
  const scores = nodeSatisfaction.get(node) ?? [];
  scores.push(Math.max(0, Math.min(100, score)));
  if (scores.length > 50) scores.splice(0, scores.length - 50);
  nodeSatisfaction.set(node, scores);
}
export function getNodeSatisfaction(node: string): number {
  const scores = nodeSatisfaction.get(node) ?? [];
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;
}

// ─── 17. Governance Compliance Score ───────────────────────────────────────
export function calculateGovernanceCompliance(): number {
  const enforcementRate = policyAudits.length > 0 ? policyAudits.filter(p => p.enforced).length / policyAudits.length * 100 : 100;
  const escalationRate = escalations.length > 0 ? (1 - escalations.filter(e => !e.resolved).length / escalations.length) * 100 : 100;
  return Math.round((enforcementRate * 0.6 + escalationRate * 0.4));
}

// ─── 18. Audit Log Integrity ───────────────────────────────────────────────
let auditEntryCount = 0;
export function incrementAuditCount(): void { auditEntryCount++; }
export function getAuditEntryCount(): number { return auditEntryCount; }

// ─── 19. Command Classification ────────────────────────────────────────────
const commandClasses = new Map<string, number>();
export function classifyCommand(cls: string): void { commandClasses.set(cls, (commandClasses.get(cls) ?? 0) + 1); }
export function getCommandClassification(): Record<string, number> { return Object.fromEntries(commandClasses); }

// ─── 20. SLA Monitor ──────────────────────────────────────────────────────
const slaBreaches: Array<{ type: string; ts: number }> = [];
export function recordSLABreach(type: string): void { slaBreaches.push({ type, ts: Date.now() }); }
export function getSLABreachCount(): number { return slaBreaches.length; }

// ─── 21. Human Decision Quality ────────────────────────────────────────────
const decisionQuality: Array<{ decision: string; confidence: number; ts: number }> = [];
export function recordDecisionQuality(decision: string, confidence: number): void {
  decisionQuality.push({ decision, confidence, ts: Date.now() });
  if (decisionQuality.length > 200) decisionQuality.splice(0, decisionQuality.length - 200);
}
export function getAvgDecisionConfidence(): number {
  return decisionQuality.length > 0 ? Math.round(decisionQuality.reduce((s, d) => s + d.confidence, 0) / decisionQuality.length) : 100;
}

// ─── 22. Node Engagement Heatmap ───────────────────────────────────────────
export function getNodeEngagementHeatmap(): Record<string, { messages: number; approvals: number; rejections: number }> {
  const heatmap: Record<string, { messages: number; approvals: number; rejections: number }> = {};
  for (const [node, count] of nodeComFreq.entries()) {
    heatmap[node] = { messages: count, approvals: 0, rejections: 0 };
  }
  for (const a of approvalChain) {
    const node = a.messageId.split('_')[0] || 'unknown';
    if (!heatmap[node]) heatmap[node] = { messages: 0, approvals: 0, rejections: 0 };
    if (a.action === 'approved') heatmap[node].approvals++;
    else heatmap[node].rejections++;
  }
  return heatmap;
}

// ─── 23. Intent Integration Health ─────────────────────────────────────────
let intentSyncSuccess = 0, intentSyncFail = 0;
export function recordIntentSync(success: boolean): void { if (success) intentSyncSuccess++; else intentSyncFail++; }
export function getIntentSyncRate(): number {
  const t = intentSyncSuccess + intentSyncFail;
  return t > 0 ? Math.round((intentSyncSuccess / t) * 100) : 100;
}

// ─── 24. Emergency Override Counter ────────────────────────────────────────
let emergencyOverrides = 0;
export function recordEmergencyOverride(): void { emergencyOverrides++; }
export function getEmergencyOverrideCount(): number { return emergencyOverrides; }

// ─── 25. ATLAS Health Composite ────────────────────────────────────────────
export interface AtlasHealthReport { grade: string; score: number; factors: Record<string, number>; }

export function calculateAtlasHealth(): AtlasHealthReport {
  const approvalRate = getApprovalStats();
  const compliance = calculateGovernanceCompliance();
  const dryRun = getDryRunSuccessRate();
  const intentSync = getIntentSyncRate();
  const breaches = getSLABreachCount();

  const approvalFactor = approvalRate.total > 0 ? Math.round((approvalRate.approved / approvalRate.total) * 100) : 100;
  const complianceFactor = compliance;
  const dryRunFactor = dryRun;
  const intentFactor = intentSync;
  const slaFactor = Math.max(0, 100 - breaches * 10);

  const score = Math.round(
    approvalFactor * 0.2 + complianceFactor * 0.25 + dryRunFactor * 0.2 + intentFactor * 0.2 + slaFactor * 0.15
  );
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return { grade, score, factors: { approvalFactor, complianceFactor, dryRunFactor, intentFactor, slaFactor } };
}
