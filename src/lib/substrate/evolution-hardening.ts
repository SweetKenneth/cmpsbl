/**
 * EVOLUTION Field Hardening v2.0.0 — Codename "Chrysalis"
 * 27 enterprise-grade features for self-improvement, SEBA pipeline, and mutation governance
 *
 * Non-breaking additive layer — respects substrate core freeze
 */

export const EVOLUTION_HARDENING_VERSION = '2.0.0';
export const EVOLUTION_HARDENING_CODENAME = 'Chrysalis';

// ─── 1. Proposal Integrity Seals ───────────────────────────────────────────
interface ProposalSeal {
  proposalId: string;
  hash: string;
  createdAt: number;
  sealed: boolean;
  fields: string[];
}

const proposalSeals = new Map<string, ProposalSeal>();

function hashProposal(proposalId: string, fields: string[]): string {
  const str = `${proposalId}|${fields.join(',')}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).padStart(8, '0');
}

export function sealProposal(proposalId: string, fields: string[]): string {
  const hash = hashProposal(proposalId, fields);
  proposalSeals.set(proposalId, { proposalId, hash, createdAt: Date.now(), sealed: true, fields });
  return hash;
}

export function verifyProposalSeal(proposalId: string, fields: string[]): boolean {
  const seal = proposalSeals.get(proposalId);
  if (!seal) return false;
  return seal.hash === hashProposal(proposalId, fields);
}

export function getProposalSeals(): ProposalSeal[] {
  return Array.from(proposalSeals.values());
}

// ─── 2. Evolution Cycle Tracker ────────────────────────────────────────────
interface EvolutionCycleRecord {
  cycleId: string;
  phase: 'idle' | 'scanning' | 'planning' | 'shadow_applied' | 'production_applied' | 'verified' | 'failed' | 'aborted';
  startedAt: number;
  completedAt: number | null;
  proposalCount: number;
  appliedCount: number;
  rolledBackCount: number;
}

const cycleHistory: EvolutionCycleRecord[] = [];
let currentCycle: EvolutionCycleRecord | null = null;

export function startCycle(): string {
  const cycleId = `evo_${Date.now()}`;
  currentCycle = { cycleId, phase: 'scanning', startedAt: Date.now(), completedAt: null, proposalCount: 0, appliedCount: 0, rolledBackCount: 0 };
  return cycleId;
}

export function advanceCyclePhase(phase: EvolutionCycleRecord['phase']): void {
  if (currentCycle) currentCycle.phase = phase;
}

export function completeCycle(): void {
  if (currentCycle) {
    currentCycle.completedAt = Date.now();
    cycleHistory.push({ ...currentCycle });
    if (cycleHistory.length > 200) cycleHistory.splice(0, cycleHistory.length - 200);
    currentCycle = null;
  }
}

export function getCurrentCycle(): EvolutionCycleRecord | null {
  return currentCycle ? { ...currentCycle } : null;
}

export function getCycleHistory(limit = 20): EvolutionCycleRecord[] {
  return cycleHistory.slice(-limit);
}

// ─── 3. Risk Budget Manager ────────────────────────────────────────────────
interface RiskBudget {
  totalBudget: number;
  consumed: number;
  maxPerProposal: number;
  resetAt: number;
}

const riskBudget: RiskBudget = { totalBudget: 100, consumed: 0, maxPerProposal: 25, resetAt: Date.now() + 24 * 3600_000 };

export function consumeRiskBudget(amount: number): { allowed: boolean; remaining: number } {
  if (Date.now() > riskBudget.resetAt) {
    riskBudget.consumed = 0;
    riskBudget.resetAt = Date.now() + 24 * 3600_000;
  }
  if (amount > riskBudget.maxPerProposal) return { allowed: false, remaining: riskBudget.totalBudget - riskBudget.consumed };
  if (riskBudget.consumed + amount > riskBudget.totalBudget) return { allowed: false, remaining: riskBudget.totalBudget - riskBudget.consumed };
  riskBudget.consumed += amount;
  return { allowed: true, remaining: riskBudget.totalBudget - riskBudget.consumed };
}

export function getRiskBudgetStatus(): RiskBudget {
  return { ...riskBudget };
}

// ─── 4. Snapshot Integrity Validator ───────────────────────────────────────
interface SnapshotRecord {
  snapshotId: string;
  hash: string;
  createdAt: number;
  modules: string[];
  sizeBytes: number;
}

const snapshots: SnapshotRecord[] = [];

export function recordSnapshot(modules: string[], sizeBytes: number): string {
  const snapshotId = `snap_${Date.now()}`;
  const hash = hashProposal(snapshotId, modules);
  snapshots.push({ snapshotId, hash, createdAt: Date.now(), modules, sizeBytes });
  if (snapshots.length > 100) snapshots.splice(0, snapshots.length - 100);
  return snapshotId;
}

export function getSnapshots(limit = 20): SnapshotRecord[] {
  return snapshots.slice(-limit);
}

export function getLatestSnapshotAge(): number {
  return snapshots.length > 0 ? Date.now() - snapshots[snapshots.length - 1].createdAt : Infinity;
}

// ─── 5. Rollback Safety Net ────────────────────────────────────────────────
interface RollbackRecord {
  id: string;
  snapshotId: string;
  reason: string;
  ts: number;
  success: boolean;
  durationMs: number;
}

const rollbacks: RollbackRecord[] = [];

export function recordRollback(snapshotId: string, reason: string, success: boolean, durationMs: number): void {
  rollbacks.push({ id: `rb_${Date.now()}`, snapshotId, reason, ts: Date.now(), success, durationMs });
  if (rollbacks.length > 100) rollbacks.splice(0, rollbacks.length - 100);
}

export function getRollbackStats(): { total: number; successRate: number; avgDurationMs: number } {
  if (rollbacks.length === 0) return { total: 0, successRate: 1, avgDurationMs: 0 };
  const successes = rollbacks.filter(r => r.success).length;
  return {
    total: rollbacks.length,
    successRate: successes / rollbacks.length,
    avgDurationMs: Math.round(rollbacks.reduce((s, r) => s + r.durationMs, 0) / rollbacks.length),
  };
}

// ─── 6. A/B Test Governor ──────────────────────────────────────────────────
interface ABTest {
  testId: string;
  variantA: string;
  variantB: string;
  startedAt: number;
  endedAt: number | null;
  winner: string | null;
  confidence: number;
  sampleSize: number;
}

const abTests: ABTest[] = [];

export function startABTest(variantA: string, variantB: string): string {
  const testId = `ab_${Date.now()}`;
  abTests.push({ testId, variantA, variantB, startedAt: Date.now(), endedAt: null, winner: null, confidence: 0, sampleSize: 0 });
  return testId;
}

export function concludeABTest(testId: string, winner: string, confidence: number, sampleSize: number): void {
  const test = abTests.find(t => t.testId === testId);
  if (test) {
    test.endedAt = Date.now();
    test.winner = winner;
    test.confidence = confidence;
    test.sampleSize = sampleSize;
  }
}

export function getABTests(): ABTest[] {
  return [...abTests];
}

// ─── 7. Canary Deployment Gate ─────────────────────────────────────────────
interface CanaryState {
  deploymentId: string;
  percentage: number;
  healthScore: number;
  startedAt: number;
  promotedAt: number | null;
  abortedAt: number | null;
}

const canaryDeployments: CanaryState[] = [];

export function startCanary(deploymentId: string, percentage = 5): void {
  canaryDeployments.push({ deploymentId, percentage, healthScore: 100, startedAt: Date.now(), promotedAt: null, abortedAt: null });
}

export function updateCanaryHealth(deploymentId: string, healthScore: number): void {
  const canary = canaryDeployments.find(c => c.deploymentId === deploymentId);
  if (canary) canary.healthScore = healthScore;
}

export function promoteCanary(deploymentId: string): boolean {
  const canary = canaryDeployments.find(c => c.deploymentId === deploymentId);
  if (canary && canary.healthScore >= 80) {
    canary.percentage = 100;
    canary.promotedAt = Date.now();
    return true;
  }
  return false;
}

export function getCanaryDeployments(): CanaryState[] {
  return [...canaryDeployments];
}

// ─── 8. Shadow Mode Validator ──────────────────────────────────────────────
interface ShadowRun {
  proposalId: string;
  ts: number;
  divergence: number;
  passed: boolean;
}

const shadowRuns: ShadowRun[] = [];

export function recordShadowRun(proposalId: string, divergence: number): boolean {
  const passed = divergence < 0.1;
  shadowRuns.push({ proposalId, ts: Date.now(), divergence, passed });
  if (shadowRuns.length > 500) shadowRuns.splice(0, shadowRuns.length - 500);
  return passed;
}

export function getShadowRunStats(): { total: number; passRate: number; avgDivergence: number } {
  if (shadowRuns.length === 0) return { total: 0, passRate: 1, avgDivergence: 0 };
  return {
    total: shadowRuns.length,
    passRate: shadowRuns.filter(s => s.passed).length / shadowRuns.length,
    avgDivergence: shadowRuns.reduce((s, r) => s + r.divergence, 0) / shadowRuns.length,
  };
}

// ─── 9. Entropy Trend Analyzer ─────────────────────────────────────────────
const entropyReadings: Array<{ ts: number; entropy: number }> = [];

export function recordEntropy(entropy: number): void {
  entropyReadings.push({ ts: Date.now(), entropy });
  if (entropyReadings.length > 500) entropyReadings.splice(0, entropyReadings.length - 500);
}

export function getEntropyTrend(): { current: number; avg: number; trend: 'increasing' | 'stable' | 'decreasing'; readings: number } {
  if (entropyReadings.length === 0) return { current: 0, avg: 0, trend: 'stable', readings: 0 };
  const avg = entropyReadings.reduce((s, r) => s + r.entropy, 0) / entropyReadings.length;
  const current = entropyReadings[entropyReadings.length - 1].entropy;
  const recent10 = entropyReadings.slice(-10);
  const firstHalf = recent10.slice(0, 5);
  const secondHalf = recent10.slice(-5);
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, r) => s + r.entropy, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, r) => s + r.entropy, 0) / secondHalf.length : 0;
  const trend = secondAvg > firstAvg * 1.1 ? 'increasing' : secondAvg < firstAvg * 0.9 ? 'decreasing' : 'stable';
  return { current, avg, trend, readings: entropyReadings.length };
}

// ─── 10. Impact Projection Engine ──────────────────────────────────────────
interface ImpactProjection {
  proposalId: string;
  projectedDelta: Record<string, number>;
  riskScore: number;
  confidence: number;
  projectedAt: number;
}

const impactProjections: ImpactProjection[] = [];

export function projectImpact(proposalId: string, delta: Record<string, number>, riskScore: number, confidence: number): void {
  impactProjections.push({ proposalId, projectedDelta: delta, riskScore, confidence, projectedAt: Date.now() });
  if (impactProjections.length > 200) impactProjections.splice(0, impactProjections.length - 200);
}

export function getImpactProjections(limit = 20): ImpactProjection[] {
  return impactProjections.slice(-limit);
}

// ─── 11. Health Regression Blocker ─────────────────────────────────────────
const healthReadings: Array<{ ts: number; score: number }> = [];

export function recordHealthReading(score: number): void {
  healthReadings.push({ ts: Date.now(), score });
  if (healthReadings.length > 200) healthReadings.splice(0, healthReadings.length - 200);
}

export function isHealthDeclining(): boolean {
  if (healthReadings.length < 5) return false;
  const recent = healthReadings.slice(-10);
  const first = recent.slice(0, Math.floor(recent.length / 2));
  const second = recent.slice(Math.floor(recent.length / 2));
  const firstAvg = first.reduce((s, r) => s + r.score, 0) / first.length;
  const secondAvg = second.reduce((s, r) => s + r.score, 0) / second.length;
  return secondAvg < firstAvg * 0.9;
}

// ─── 12. Proposal Deduplication ────────────────────────────────────────────
const proposalHashes = new Set<string>();

export function isDuplicateProposal(hash: string): boolean {
  if (proposalHashes.has(hash)) return true;
  proposalHashes.add(hash);
  if (proposalHashes.size > 1000) {
    const iterator = proposalHashes.values();
    for (let i = 0; i < 200; i++) iterator.next();
  }
  return false;
}

// ─── 13. Gate Compliance Tracker ───────────────────────────────────────────
interface GateResult {
  gateName: string;
  passed: boolean;
  ts: number;
  reason?: string;
}

const gateResults: GateResult[] = [];

export function recordGateResult(gateName: string, passed: boolean, reason?: string): void {
  gateResults.push({ gateName, passed, ts: Date.now(), reason });
  if (gateResults.length > 500) gateResults.splice(0, gateResults.length - 500);
}

export function getGateCompliance(): { total: number; passRate: number; byGate: Record<string, { passed: number; failed: number }> } {
  const byGate: Record<string, { passed: number; failed: number }> = {};
  for (const g of gateResults) {
    if (!byGate[g.gateName]) byGate[g.gateName] = { passed: 0, failed: 0 };
    if (g.passed) byGate[g.gateName].passed++;
    else byGate[g.gateName].failed++;
  }
  return {
    total: gateResults.length,
    passRate: gateResults.length > 0 ? gateResults.filter(g => g.passed).length / gateResults.length : 1,
    byGate,
  };
}

// ─── 14. Skill Tier Tracker ────────────────────────────────────────────────
const skillTiers: Record<string, number> = {};

export function updateSkillTier(executorId: string, tier: number): void {
  skillTiers[executorId] = tier;
}

export function getSkillTierDistribution(): Record<number, number> {
  const dist: Record<number, number> = {};
  for (const tier of Object.values(skillTiers)) {
    dist[tier] = (dist[tier] ?? 0) + 1;
  }
  return dist;
}

// ─── 15. Mutation Rate Limiter ─────────────────────────────────────────────
const mutationTimes: number[] = [];
const MAX_MUTATIONS_PER_HOUR = 50;

export function checkMutationRate(): { allowed: boolean; rate: number; limit: number } {
  const cutoff = Date.now() - 3600_000;
  const recent = mutationTimes.filter(t => t > cutoff);
  return { allowed: recent.length < MAX_MUTATIONS_PER_HOUR, rate: recent.length, limit: MAX_MUTATIONS_PER_HOUR };
}

export function recordMutationEvent(): boolean {
  const { allowed } = checkMutationRate();
  if (allowed) mutationTimes.push(Date.now());
  if (mutationTimes.length > 2000) mutationTimes.splice(0, mutationTimes.length - 2000);
  return allowed;
}

// ─── 16. Receipt Chain Verifier ────────────────────────────────────────────
interface EvolutionReceipt {
  id: string;
  proposalId: string;
  action: string;
  hash: string;
  prevHash: string;
  ts: number;
}

const receiptChain: EvolutionReceipt[] = [];

export function appendReceipt(proposalId: string, action: string): string {
  const prevHash = receiptChain.length > 0 ? receiptChain[receiptChain.length - 1].hash : '00000000';
  const str = `${proposalId}|${action}|${Date.now()}|${prevHash}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  const hash = Math.abs(h).toString(36).padStart(8, '0');
  receiptChain.push({ id: `er_${receiptChain.length}`, proposalId, action, hash, prevHash, ts: Date.now() });
  if (receiptChain.length > 1000) receiptChain.splice(0, receiptChain.length - 1000);
  return hash;
}

export function verifyReceiptChain(): { valid: boolean; length: number } {
  for (let i = 1; i < receiptChain.length; i++) {
    if (receiptChain[i].prevHash !== receiptChain[i - 1].hash) return { valid: false, length: receiptChain.length };
  }
  return { valid: true, length: receiptChain.length };
}

export function getReceiptTrail(limit = 20): EvolutionReceipt[] {
  return receiptChain.slice(-limit);
}

// ─── 17. Dry-Run Result Cache ──────────────────────────────────────────────
interface DryRunResult {
  proposalId: string;
  healthBefore: number;
  projectedHealthAfter: number;
  ts: number;
  safe: boolean;
}

const dryRunCache: DryRunResult[] = [];

export function cacheDryRun(proposalId: string, healthBefore: number, projectedAfter: number): boolean {
  const safe = projectedAfter >= healthBefore * 0.85;
  dryRunCache.push({ proposalId, healthBefore, projectedHealthAfter: projectedAfter, ts: Date.now(), safe });
  if (dryRunCache.length > 200) dryRunCache.splice(0, dryRunCache.length - 200);
  return safe;
}

export function getDryRunHistory(limit = 20): DryRunResult[] {
  return dryRunCache.slice(-limit);
}

// ─── 18. Proposal Priority Queue ───────────────────────────────────────────
interface PrioritizedProposal {
  proposalId: string;
  priority: number;
  severity: string;
  addedAt: number;
}

const proposalQueue: PrioritizedProposal[] = [];

export function enqueueProposal(proposalId: string, priority: number, severity: string): void {
  proposalQueue.push({ proposalId, priority, severity, addedAt: Date.now() });
  proposalQueue.sort((a, b) => b.priority - a.priority);
}

export function dequeueProposal(): PrioritizedProposal | null {
  return proposalQueue.shift() ?? null;
}

export function getProposalQueueDepth(): number {
  return proposalQueue.length;
}

// ─── 19. Evolution Cooldown Timer ──────────────────────────────────────────
let lastEvolutionTs = 0;
const EVOLUTION_COOLDOWN_MS = 300_000; // 5min

export function canEvolve(): boolean {
  return Date.now() - lastEvolutionTs > EVOLUTION_COOLDOWN_MS;
}

export function markEvolutionComplete(): void {
  lastEvolutionTs = Date.now();
}

export function getCooldownRemaining(): number {
  return Math.max(0, EVOLUTION_COOLDOWN_MS - (Date.now() - lastEvolutionTs));
}

// ─── 20. Scan Frequency Controller ─────────────────────────────────────────
const scanTimestamps: number[] = [];

export function recordScan(): void {
  scanTimestamps.push(Date.now());
  if (scanTimestamps.length > 200) scanTimestamps.splice(0, scanTimestamps.length - 200);
}

export function getScanFrequency(windowMs = 3600_000): number {
  return scanTimestamps.filter(t => Date.now() - t < windowMs).length;
}

// ─── 21. Improvement Velocity Tracker ──────────────────────────────────────
const improvementEvents: Array<{ ts: number; delta: number }> = [];

export function recordImprovement(delta: number): void {
  improvementEvents.push({ ts: Date.now(), delta });
  if (improvementEvents.length > 500) improvementEvents.splice(0, improvementEvents.length - 500);
}

export function getImprovementVelocity(): { totalDelta: number; avgDelta: number; count: number; trend: 'accelerating' | 'stable' | 'decelerating' } {
  if (improvementEvents.length === 0) return { totalDelta: 0, avgDelta: 0, count: 0, trend: 'stable' };
  const totalDelta = improvementEvents.reduce((s, e) => s + e.delta, 0);
  const avgDelta = totalDelta / improvementEvents.length;
  const recent = improvementEvents.slice(-10);
  const firstHalf = recent.slice(0, 5);
  const secondHalf = recent.slice(-5);
  const fAvg = firstHalf.length > 0 ? firstHalf.reduce((s, r) => s + r.delta, 0) / firstHalf.length : 0;
  const sAvg = secondHalf.length > 0 ? secondHalf.reduce((s, r) => s + r.delta, 0) / secondHalf.length : 0;
  const trend = sAvg > fAvg * 1.1 ? 'accelerating' : sAvg < fAvg * 0.9 ? 'decelerating' : 'stable';
  return { totalDelta, avgDelta, count: improvementEvents.length, trend };
}

// ─── 22. Governance Veto Tracker ───────────────────────────────────────────
const vetoEvents: Array<{ proposalId: string; reason: string; ts: number }> = [];

export function recordVeto(proposalId: string, reason: string): void {
  vetoEvents.push({ proposalId, reason, ts: Date.now() });
  if (vetoEvents.length > 200) vetoEvents.splice(0, vetoEvents.length - 200);
}

export function getVetoStats(): { total: number; recentVetos: number; topReasons: Array<{ reason: string; count: number }> } {
  const recentCutoff = Date.now() - 3600_000;
  const reasonCounts: Record<string, number> = {};
  for (const v of vetoEvents) reasonCounts[v.reason] = (reasonCounts[v.reason] ?? 0) + 1;
  const topReasons = Object.entries(reasonCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  return { total: vetoEvents.length, recentVetos: vetoEvents.filter(v => v.ts > recentCutoff).length, topReasons };
}

// ─── 23. Pre-Apply Diff Validator ──────────────────────────────────────────
interface DiffValidation {
  proposalId: string;
  linesChanged: number;
  filesAffected: number;
  valid: boolean;
  ts: number;
}

const diffValidations: DiffValidation[] = [];

export function validateDiff(proposalId: string, linesChanged: number, filesAffected: number, maxLines = 500, maxFiles = 20): boolean {
  const valid = linesChanged <= maxLines && filesAffected <= maxFiles;
  diffValidations.push({ proposalId, linesChanged, filesAffected, valid, ts: Date.now() });
  if (diffValidations.length > 200) diffValidations.splice(0, diffValidations.length - 200);
  return valid;
}

export function getDiffValidationStats(): { total: number; passRate: number; avgLines: number; avgFiles: number } {
  if (diffValidations.length === 0) return { total: 0, passRate: 1, avgLines: 0, avgFiles: 0 };
  return {
    total: diffValidations.length,
    passRate: diffValidations.filter(d => d.valid).length / diffValidations.length,
    avgLines: Math.round(diffValidations.reduce((s, d) => s + d.linesChanged, 0) / diffValidations.length),
    avgFiles: Math.round(diffValidations.reduce((s, d) => s + d.filesAffected, 0) / diffValidations.length),
  };
}

// ─── 24. SEBA Confidence Scorer ────────────────────────────────────────────
const sebaConfidenceReadings: Array<{ ts: number; confidence: number; proposalId: string }> = [];

export function recordSEBAConfidence(proposalId: string, confidence: number): void {
  sebaConfidenceReadings.push({ ts: Date.now(), confidence, proposalId });
  if (sebaConfidenceReadings.length > 500) sebaConfidenceReadings.splice(0, sebaConfidenceReadings.length - 500);
}

export function getSEBAConfidenceStats(): { avg: number; min: number; max: number; trend: string } {
  if (sebaConfidenceReadings.length === 0) return { avg: 1, min: 1, max: 1, trend: 'stable' };
  const vals = sebaConfidenceReadings.map(r => r.confidence);
  return {
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
    trend: 'stable',
  };
}

// ─── 25. Evolution Audit Log ───────────────────────────────────────────────
interface EvolutionAuditEntry {
  action: string;
  actor: string;
  ts: number;
  meta: Record<string, unknown>;
}

const evolutionAuditLog: EvolutionAuditEntry[] = [];

export function logEvolutionAction(action: string, actor: string, meta: Record<string, unknown> = {}): void {
  evolutionAuditLog.push({ action, actor, ts: Date.now(), meta });
  if (evolutionAuditLog.length > 500) evolutionAuditLog.splice(0, evolutionAuditLog.length - 500);
}

export function getEvolutionAuditLog(limit = 20): EvolutionAuditEntry[] {
  return evolutionAuditLog.slice(-limit);
}

// ─── 26. Promotion Pipeline Stats ──────────────────────────────────────────
interface PromotionRecord {
  stage: 'shadow' | 'simulation' | 'preflight' | 'canary' | 'production';
  proposalId: string;
  ts: number;
  success: boolean;
}

const promotionRecords: PromotionRecord[] = [];

export function recordPromotion(stage: PromotionRecord['stage'], proposalId: string, success: boolean): void {
  promotionRecords.push({ stage, proposalId, ts: Date.now(), success });
  if (promotionRecords.length > 500) promotionRecords.splice(0, promotionRecords.length - 500);
}

export function getPromotionFunnel(): Record<string, { total: number; passRate: number }> {
  const funnel: Record<string, { total: number; passed: number }> = {};
  for (const r of promotionRecords) {
    if (!funnel[r.stage]) funnel[r.stage] = { total: 0, passed: 0 };
    funnel[r.stage].total++;
    if (r.success) funnel[r.stage].passed++;
  }
  const result: Record<string, { total: number; passRate: number }> = {};
  for (const [stage, data] of Object.entries(funnel)) {
    result[stage] = { total: data.total, passRate: data.total > 0 ? data.passed / data.total : 1 };
  }
  return result;
}

// ─── 27. Evolution Health Composite ────────────────────────────────────────
export interface EvolutionHealthReport {
  grade: string;
  score: number;
  factors: {
    receiptChainIntegrity: number;
    rollbackReadiness: number;
    riskBudgetHealth: number;
    shadowPassRate: number;
    gateCompliance: number;
    entropyStability: number;
  };
}

export function calculateEvolutionHealth(): EvolutionHealthReport {
  const receiptResult = verifyReceiptChain();
  const rollbackStats = getRollbackStats();
  const riskStatus = getRiskBudgetStatus();
  const shadowStats = getShadowRunStats();
  const gateStats = getGateCompliance();
  const entropy = getEntropyTrend();

  const receiptChainIntegrity = receiptResult.valid ? 100 : 30;
  const rollbackReadiness = Math.round(rollbackStats.successRate * 100);
  const riskBudgetHealth = riskStatus.totalBudget > 0 ? Math.round(((riskStatus.totalBudget - riskStatus.consumed) / riskStatus.totalBudget) * 100) : 100;
  const shadowPassRate = Math.round(shadowStats.passRate * 100);
  const gateCompliance = Math.round(gateStats.passRate * 100);
  const entropyStability = entropy.trend === 'stable' ? 100 : entropy.trend === 'decreasing' ? 80 : 50;

  const score = Math.round(
    receiptChainIntegrity * 0.2 +
    rollbackReadiness * 0.15 +
    riskBudgetHealth * 0.2 +
    shadowPassRate * 0.15 +
    gateCompliance * 0.15 +
    entropyStability * 0.15
  );

  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    grade, score,
    factors: { receiptChainIntegrity, rollbackReadiness, riskBudgetHealth, shadowPassRate, gateCompliance, entropyStability },
  };
}
