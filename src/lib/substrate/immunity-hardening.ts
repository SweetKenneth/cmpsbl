/**
 * IMMUNITY Field Hardening v2.0.0 — Codename "Watchguard"
 * 27 enterprise-grade features for anomaly detection, drift monitoring, and threat neutralization
 *
 * Non-breaking additive layer — respects substrate core freeze
 */

export const IMMUNITY_HARDENING_VERSION = '2.0.0';
export const IMMUNITY_HARDENING_CODENAME = 'Watchguard';

// ─── 1. Anomaly Signature Registry ─────────────────────────────────────────
interface AnomalySignature {
  id: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: number;
  lastSeen: number;
  hitCount: number;
  autoQuarantineThreshold: number;
}

const anomalySignatures = new Map<string, AnomalySignature>();

export function registerAnomalySignature(pattern: string, severity: AnomalySignature['severity'], threshold = 5): string {
  const id = `anomaly_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  anomalySignatures.set(id, { id, pattern, severity, firstSeen: Date.now(), lastSeen: Date.now(), hitCount: 0, autoQuarantineThreshold: threshold });
  return id;
}

export function getAnomalySignatures(): AnomalySignature[] {
  return Array.from(anomalySignatures.values());
}

// ─── 2. Drift Baseline Tracker ─────────────────────────────────────────────
interface DriftBaseline {
  moduleId: string;
  metrics: Record<string, number>;
  capturedAt: number;
  version: number;
}

const driftBaselines = new Map<string, DriftBaseline>();

export function captureDriftBaseline(moduleId: string, metrics: Record<string, number>): void {
  const existing = driftBaselines.get(moduleId);
  driftBaselines.set(moduleId, { moduleId, metrics, capturedAt: Date.now(), version: (existing?.version ?? 0) + 1 });
}

export function analyzeDrift(moduleId: string, currentMetrics: Record<string, number>): { drifted: boolean; driftPct: number; driftedKeys: string[] } {
  const baseline = driftBaselines.get(moduleId);
  if (!baseline) return { drifted: false, driftPct: 0, driftedKeys: [] };
  const driftedKeys: string[] = [];
  let totalDrift = 0;
  let count = 0;
  for (const [key, baseVal] of Object.entries(baseline.metrics)) {
    const curVal = currentMetrics[key] ?? 0;
    if (baseVal === 0) continue;
    const drift = Math.abs((curVal - baseVal) / baseVal);
    totalDrift += drift;
    count++;
    if (drift > 0.15) driftedKeys.push(key);
  }
  const avgDrift = count > 0 ? totalDrift / count : 0;
  return { drifted: avgDrift > 0.1, driftPct: Math.round(avgDrift * 100), driftedKeys };
}

export function getDriftBaselines(): DriftBaseline[] {
  return Array.from(driftBaselines.values());
}

// ─── 3. Quarantine Registry ────────────────────────────────────────────────
interface QuarantineEntry {
  moduleId: string;
  reason: string;
  quarantinedAt: number;
  severity: string;
  autoRelease: boolean;
  releaseAfterMs: number;
}

const quarantineRegistry = new Map<string, QuarantineEntry>();

export function quarantineModule(moduleId: string, reason: string, severity = 'high', autoRelease = true, releaseAfterMs = 300_000): void {
  quarantineRegistry.set(moduleId, { moduleId, reason, quarantinedAt: Date.now(), severity, autoRelease, releaseAfterMs });
}

export function releaseFromQuarantine(moduleId: string): boolean {
  return quarantineRegistry.delete(moduleId);
}

export function isQuarantined(moduleId: string): boolean {
  const entry = quarantineRegistry.get(moduleId);
  if (!entry) return false;
  if (entry.autoRelease && Date.now() - entry.quarantinedAt > entry.releaseAfterMs) {
    quarantineRegistry.delete(moduleId);
    return false;
  }
  return true;
}

export function getQuarantinedModules(): QuarantineEntry[] {
  return Array.from(quarantineRegistry.values()).filter(e => isQuarantined(e.moduleId));
}

// ─── 4. Threat Intelligence Feed ───────────────────────────────────────────
interface ThreatIntel {
  id: string;
  category: 'injection' | 'escalation' | 'exfiltration' | 'dos' | 'tampering' | 'cascade';
  indicator: string;
  confidence: number;
  ingestedAt: number;
  active: boolean;
}

const threatFeed: ThreatIntel[] = [];

export function ingestThreatIntel(category: ThreatIntel['category'], indicator: string, confidence: number): void {
  threatFeed.push({ id: `ti_${Date.now()}`, category, indicator, confidence, ingestedAt: Date.now(), active: true });
  if (threatFeed.length > 500) threatFeed.splice(0, threatFeed.length - 500);
}

export function getActiveThreatIntel(): ThreatIntel[] {
  const cutoff = Date.now() - 24 * 60 * 60_000;
  return threatFeed.filter(t => t.active && t.ingestedAt > cutoff);
}

// ─── 5. Cross-Sector Correlation Engine ────────────────────────────────────
interface CorrelatedAnomaly {
  id: string;
  modules: string[];
  anomalyTypes: string[];
  correlationScore: number;
  detectedAt: number;
  isCompound: boolean;
}

const correlatedAnomalies: CorrelatedAnomaly[] = [];

export function correlateAnomalies(anomalies: Array<{ module: string; type: string; score: number }>): CorrelatedAnomaly | null {
  if (anomalies.length < 2) return null;
  const avgScore = anomalies.reduce((s, a) => s + a.score, 0) / anomalies.length;
  const correlated: CorrelatedAnomaly = {
    id: `ca_${Date.now()}`,
    modules: anomalies.map(a => a.module),
    anomalyTypes: anomalies.map(a => a.type),
    correlationScore: avgScore,
    detectedAt: Date.now(),
    isCompound: anomalies.length >= 3,
  };
  correlatedAnomalies.push(correlated);
  if (correlatedAnomalies.length > 200) correlatedAnomalies.splice(0, correlatedAnomalies.length - 200);
  return correlated;
}

export function getCorrelatedAnomalies(): CorrelatedAnomaly[] {
  return [...correlatedAnomalies];
}

// ─── 6. Cascade Failure Detector ───────────────────────────────────────────
interface CascadeEvent {
  triggerModule: string;
  affectedModules: string[];
  depth: number;
  detectedAt: number;
  mitigated: boolean;
}

const cascadeEvents: CascadeEvent[] = [];

export function detectCascade(triggerModule: string, failureChain: string[]): CascadeEvent {
  const event: CascadeEvent = {
    triggerModule,
    affectedModules: failureChain,
    depth: failureChain.length,
    detectedAt: Date.now(),
    mitigated: false,
  };
  cascadeEvents.push(event);
  if (cascadeEvents.length > 100) cascadeEvents.splice(0, cascadeEvents.length - 100);
  return event;
}

export function getCascadeEvents(): CascadeEvent[] {
  return [...cascadeEvents];
}

export function getCascadeRate(): number {
  const recent = cascadeEvents.filter(e => Date.now() - e.detectedAt < 3600_000);
  return recent.length;
}

// ─── 7. Healing Pipeline ───────────────────────────────────────────────────
interface HealingAttempt {
  moduleId: string;
  strategy: 'restart' | 'rollback' | 'degrade' | 'isolate' | 'reconfigure';
  success: boolean;
  attemptedAt: number;
  durationMs: number;
  note: string;
}

const healingHistory: HealingAttempt[] = [];

export function recordHealingAttempt(moduleId: string, strategy: HealingAttempt['strategy'], success: boolean, durationMs: number, note = ''): void {
  healingHistory.push({ moduleId, strategy, success, attemptedAt: Date.now(), durationMs, note });
  if (healingHistory.length > 500) healingHistory.splice(0, healingHistory.length - 500);
}

export function getHealingStats(): { total: number; successRate: number; avgDurationMs: number; byStrategy: Record<string, number> } {
  if (healingHistory.length === 0) return { total: 0, successRate: 1, avgDurationMs: 0, byStrategy: {} };
  const byStrategy: Record<string, number> = {};
  let successCount = 0;
  let totalDur = 0;
  for (const h of healingHistory) {
    byStrategy[h.strategy] = (byStrategy[h.strategy] ?? 0) + 1;
    if (h.success) successCount++;
    totalDur += h.durationMs;
  }
  return { total: healingHistory.length, successRate: successCount / healingHistory.length, avgDurationMs: Math.round(totalDur / healingHistory.length), byStrategy };
}

// ─── 8. Sentinel Watchdog ──────────────────────────────────────────────────
interface SentinelPulse {
  ts: number;
  nodesChecked: number;
  anomaliesDetected: number;
  threatsNeutralized: number;
  latencyMs: number;
}

const sentinelPulses: SentinelPulse[] = [];

export function recordSentinelPulse(nodesChecked: number, anomaliesDetected: number, threatsNeutralized: number, latencyMs: number): void {
  sentinelPulses.push({ ts: Date.now(), nodesChecked, anomaliesDetected, threatsNeutralized, latencyMs });
  if (sentinelPulses.length > 500) sentinelPulses.splice(0, sentinelPulses.length - 500);
}

export function getSentinelStats(): { totalPulses: number; avgLatencyMs: number; totalAnomalies: number; totalNeutralized: number } {
  if (sentinelPulses.length === 0) return { totalPulses: 0, avgLatencyMs: 0, totalAnomalies: 0, totalNeutralized: 0 };
  return {
    totalPulses: sentinelPulses.length,
    avgLatencyMs: Math.round(sentinelPulses.reduce((s, p) => s + p.latencyMs, 0) / sentinelPulses.length),
    totalAnomalies: sentinelPulses.reduce((s, p) => s + p.anomaliesDetected, 0),
    totalNeutralized: sentinelPulses.reduce((s, p) => s + p.threatsNeutralized, 0),
  };
}

// ─── 9. Behavioral Fingerprinting ──────────────────────────────────────────
interface BehavioralProfile {
  moduleId: string;
  normalPatterns: string[];
  deviations: number;
  lastAnalyzed: number;
  riskScore: number;
}

const behavioralProfiles = new Map<string, BehavioralProfile>();

export function updateBehavioralProfile(moduleId: string, pattern: string, isDeviation: boolean): void {
  const existing = behavioralProfiles.get(moduleId) ?? { moduleId, normalPatterns: [], deviations: 0, lastAnalyzed: 0, riskScore: 0 };
  if (!isDeviation) {
    if (!existing.normalPatterns.includes(pattern)) existing.normalPatterns.push(pattern);
  } else {
    existing.deviations++;
    existing.riskScore = Math.min(1, existing.deviations / Math.max(1, existing.normalPatterns.length));
  }
  existing.lastAnalyzed = Date.now();
  behavioralProfiles.set(moduleId, existing);
}

export function getBehavioralProfiles(): BehavioralProfile[] {
  return Array.from(behavioralProfiles.values());
}

// ─── 10. Immune Memory (Learned Patterns) ──────────────────────────────────
interface ImmuneMemoryEntry {
  signature: string;
  category: string;
  learnedAt: number;
  effectiveness: number;
  timesApplied: number;
}

const immuneMemory = new Map<string, ImmuneMemoryEntry>();

export function learnPattern(signature: string, category: string, effectiveness: number): void {
  const existing = immuneMemory.get(signature);
  if (existing) {
    existing.effectiveness = (existing.effectiveness * existing.timesApplied + effectiveness) / (existing.timesApplied + 1);
    existing.timesApplied++;
  } else {
    immuneMemory.set(signature, { signature, category, learnedAt: Date.now(), effectiveness, timesApplied: 1 });
  }
}

export function getImmuneMemory(): ImmuneMemoryEntry[] {
  return Array.from(immuneMemory.values());
}

export function getImmuneMemoryEffectiveness(): number {
  const entries = Array.from(immuneMemory.values());
  if (entries.length === 0) return 1;
  return entries.reduce((s, e) => s + e.effectiveness, 0) / entries.length;
}

// ─── 11. Perimeter Scan Scheduler ──────────────────────────────────────────
interface PerimeterScan {
  scanId: string;
  ts: number;
  nodesScanned: number;
  threatsFound: number;
  duration_ms: number;
}

const perimeterScans: PerimeterScan[] = [];

export function recordPerimeterScan(nodesScanned: number, threatsFound: number, duration_ms: number): string {
  const scanId = `ps_${Date.now()}`;
  perimeterScans.push({ scanId, ts: Date.now(), nodesScanned, threatsFound, duration_ms });
  if (perimeterScans.length > 200) perimeterScans.splice(0, perimeterScans.length - 200);
  return scanId;
}

export function getPerimeterScanStats(): { totalScans: number; avgThreats: number; avgDurationMs: number; lastScanAge: number } {
  if (perimeterScans.length === 0) return { totalScans: 0, avgThreats: 0, avgDurationMs: 0, lastScanAge: Infinity };
  return {
    totalScans: perimeterScans.length,
    avgThreats: perimeterScans.reduce((s, p) => s + p.threatsFound, 0) / perimeterScans.length,
    avgDurationMs: Math.round(perimeterScans.reduce((s, p) => s + p.duration_ms, 0) / perimeterScans.length),
    lastScanAge: Date.now() - perimeterScans[perimeterScans.length - 1].ts,
  };
}

// ─── 12. Confidence Aggregator ─────────────────────────────────────────────
const confidenceScores = new Map<string, number[]>();

export function reportConfidence(moduleId: string, confidence: number): void {
  const scores = confidenceScores.get(moduleId) ?? [];
  scores.push(confidence);
  if (scores.length > 100) scores.splice(0, scores.length - 100);
  confidenceScores.set(moduleId, scores);
}

export function getAggregatedConfidence(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [mod, scores] of confidenceScores.entries()) {
    result[mod] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }
  return result;
}

// ─── 13. Escalation Rate Tracker ───────────────────────────────────────────
const escalationTimestamps: number[] = [];

export function recordEscalation(): void {
  escalationTimestamps.push(Date.now());
  if (escalationTimestamps.length > 1000) escalationTimestamps.splice(0, escalationTimestamps.length - 1000);
}

export function getEscalationRate(windowMs = 3600_000): number {
  const cutoff = Date.now() - windowMs;
  return escalationTimestamps.filter(t => t > cutoff).length;
}

// ─── 14. Attack Surface Map ────────────────────────────────────────────────
interface AttackSurface {
  entryPoint: string;
  exposureLevel: 'low' | 'medium' | 'high';
  mitigations: string[];
  lastAssessed: number;
}

const attackSurfaces = new Map<string, AttackSurface>();

export function mapAttackSurface(entryPoint: string, exposureLevel: AttackSurface['exposureLevel'], mitigations: string[]): void {
  attackSurfaces.set(entryPoint, { entryPoint, exposureLevel, mitigations, lastAssessed: Date.now() });
}

export function getAttackSurfaceMap(): AttackSurface[] {
  return Array.from(attackSurfaces.values());
}

// ─── 15. Tamper-Evident Audit Signer ───────────────────────────────────────
interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  ts: number;
  hash: string;
  prevHash: string;
}

const auditChain: AuditEntry[] = [];

function hashAuditEntry(action: string, actor: string, ts: number, prevHash: string): string {
  const str = `${action}|${actor}|${ts}|${prevHash}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).padStart(8, '0');
}

export function appendAuditEntry(action: string, actor: string): string {
  const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : '00000000';
  const ts = Date.now();
  const hash = hashAuditEntry(action, actor, ts, prevHash);
  const id = `iae_${auditChain.length}`;
  auditChain.push({ id, action, actor, ts, hash, prevHash });
  if (auditChain.length > 1000) auditChain.splice(0, auditChain.length - 1000);
  return hash;
}

export function verifyAuditChain(): { valid: boolean; length: number; brokenAt?: number } {
  for (let i = 1; i < auditChain.length; i++) {
    const expected = hashAuditEntry(auditChain[i].action, auditChain[i].actor, auditChain[i].ts, auditChain[i - 1].hash);
    if (expected !== auditChain[i].hash) return { valid: false, length: auditChain.length, brokenAt: i };
  }
  return { valid: true, length: auditChain.length };
}

export function getAuditTrail(limit = 20): AuditEntry[] {
  return auditChain.slice(-limit);
}

// ─── 16. Immune Response Time Tracker ──────────────────────────────────────
const responseTimes: number[] = [];

export function recordResponseTime(ms: number): void {
  responseTimes.push(ms);
  if (responseTimes.length > 500) responseTimes.splice(0, responseTimes.length - 500);
}

export function getResponseTimeStats(): { avg: number; p95: number; p99: number; min: number; max: number } {
  if (responseTimes.length === 0) return { avg: 0, p95: 0, p99: 0, min: 0, max: 0 };
  const sorted = [...responseTimes].sort((a, b) => a - b);
  return {
    avg: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    p99: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

// ─── 17. Vaccine Registry (Pre-learned Defenses) ───────────────────────────
interface Vaccine {
  id: string;
  threatType: string;
  countermeasure: string;
  effectivenessRate: number;
  deployedAt: number;
}

const vaccines = new Map<string, Vaccine>();

export function deployVaccine(threatType: string, countermeasure: string, effectivenessRate = 0.95): string {
  const id = `vax_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  vaccines.set(id, { id, threatType, countermeasure, effectivenessRate, deployedAt: Date.now() });
  return id;
}

export function getVaccines(): Vaccine[] {
  return Array.from(vaccines.values());
}

// ─── 18. Zero-Day Detector ─────────────────────────────────────────────────
interface ZeroDayAlert {
  signatureHash: string;
  firstObserved: number;
  observations: number;
  category: string;
  severity: 'unknown' | 'potential' | 'confirmed';
}

const zeroDayAlerts = new Map<string, ZeroDayAlert>();

export function reportZeroDay(signatureHash: string, category: string): void {
  const existing = zeroDayAlerts.get(signatureHash);
  if (existing) {
    existing.observations++;
    if (existing.observations >= 3) existing.severity = 'confirmed';
    else if (existing.observations >= 2) existing.severity = 'potential';
  } else {
    zeroDayAlerts.set(signatureHash, { signatureHash, firstObserved: Date.now(), observations: 1, category, severity: 'unknown' });
  }
}

export function getZeroDayAlerts(): ZeroDayAlert[] {
  return Array.from(zeroDayAlerts.values());
}

// ─── 19. Immunity Score (per-module) ───────────────────────────────────────
const moduleImmunityScores = new Map<string, number>();

export function updateImmunityScore(moduleId: string, score: number): void {
  moduleImmunityScores.set(moduleId, Math.max(0, Math.min(100, score)));
}

export function getImmunityScores(): Record<string, number> {
  return Object.fromEntries(moduleImmunityScores);
}

// ─── 20. Anomaly Suppression (False Positive Management) ───────────────────
const suppressedSignatures = new Set<string>();

export function suppressAnomaly(signatureHash: string): void {
  suppressedSignatures.add(signatureHash);
}

export function isSuppressed(signatureHash: string): boolean {
  return suppressedSignatures.has(signatureHash);
}

export function getSuppressedCount(): number {
  return suppressedSignatures.size;
}

// ─── 21. Circuit Breaker for Immune Actions ────────────────────────────────
interface ImmuneCircuitBreaker {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  threshold: number;
  openedAt: number | null;
  cooldownMs: number;
}

const immuneCircuitBreaker: ImmuneCircuitBreaker = { state: 'closed', failures: 0, threshold: 10, openedAt: null, cooldownMs: 60_000 };

export function recordImmuneFailure(): void {
  immuneCircuitBreaker.failures++;
  if (immuneCircuitBreaker.failures >= immuneCircuitBreaker.threshold) {
    immuneCircuitBreaker.state = 'open';
    immuneCircuitBreaker.openedAt = Date.now();
  }
}

export function canExecuteImmuneAction(): boolean {
  if (immuneCircuitBreaker.state === 'closed') return true;
  if (immuneCircuitBreaker.state === 'open' && immuneCircuitBreaker.openedAt && Date.now() - immuneCircuitBreaker.openedAt > immuneCircuitBreaker.cooldownMs) {
    immuneCircuitBreaker.state = 'half-open';
    return true;
  }
  return immuneCircuitBreaker.state === 'half-open';
}

export function recordImmuneSuccess(): void {
  if (immuneCircuitBreaker.state === 'half-open') {
    immuneCircuitBreaker.state = 'closed';
    immuneCircuitBreaker.failures = 0;
    immuneCircuitBreaker.openedAt = null;
  }
}

export function getImmuneCircuitBreakerState(): ImmuneCircuitBreaker {
  return { ...immuneCircuitBreaker };
}

// ─── 22. Threat Neutralization Counter ─────────────────────────────────────
const neutralizationCounters: Record<string, number> = {};

export function recordNeutralization(threatType: string): void {
  neutralizationCounters[threatType] = (neutralizationCounters[threatType] ?? 0) + 1;
}

export function getNeutralizationStats(): Record<string, number> {
  return { ...neutralizationCounters };
}

// ─── 23. Field Permeation Monitor ──────────────────────────────────────────
interface PermeationPulse {
  targetNode: string;
  lastPermeated: number;
  permeationCount: number;
  latencyMs: number;
}

const permeationMap = new Map<string, PermeationPulse>();

export function recordPermeation(targetNode: string, latencyMs: number): void {
  const existing = permeationMap.get(targetNode);
  permeationMap.set(targetNode, {
    targetNode,
    lastPermeated: Date.now(),
    permeationCount: (existing?.permeationCount ?? 0) + 1,
    latencyMs,
  });
}

export function getPermeationMap(): PermeationPulse[] {
  return Array.from(permeationMap.values());
}

export function getPermeationCoverage(totalNodes: number): number {
  return totalNodes > 0 ? permeationMap.size / totalNodes : 0;
}

// ─── 24. Mutation Velocity Limiter ─────────────────────────────────────────
const mutationTimestamps: number[] = [];
const MAX_MUTATIONS_PER_MINUTE = 20;

export function checkMutationVelocity(): { allowed: boolean; currentRate: number; limit: number } {
  const cutoff = Date.now() - 60_000;
  const recent = mutationTimestamps.filter(t => t > cutoff);
  return { allowed: recent.length < MAX_MUTATIONS_PER_MINUTE, currentRate: recent.length, limit: MAX_MUTATIONS_PER_MINUTE };
}

export function recordMutation(): boolean {
  const { allowed } = checkMutationVelocity();
  if (allowed) mutationTimestamps.push(Date.now());
  if (mutationTimestamps.length > 1000) mutationTimestamps.splice(0, mutationTimestamps.length - 1000);
  return allowed;
}

// ─── 25. Immune Fatigue Detector ───────────────────────────────────────────
export function getImmuneFatigue(): { fatigueLevel: number; recommendation: 'continue' | 'reduce_sensitivity' | 'pause_scanning' } {
  const healStats = getHealingStats();
  const cascadeRate = getCascadeRate();
  const escalRate = getEscalationRate();
  const fatigueLevel = Math.min(1, (healStats.total * 0.01) + (cascadeRate * 0.05) + (escalRate * 0.02));
  const recommendation = fatigueLevel > 0.8 ? 'pause_scanning' : fatigueLevel > 0.5 ? 'reduce_sensitivity' : 'continue';
  return { fatigueLevel: Math.round(fatigueLevel * 100), recommendation };
}

// ─── 26. Threat Heatmap Generator ──────────────────────────────────────────
export function generateThreatHeatmap(): Record<string, { threats: number; severity: number }> {
  const heatmap: Record<string, { threats: number; severity: number }> = {};
  for (const threat of getActiveThreatIntel()) {
    if (!heatmap[threat.category]) heatmap[threat.category] = { threats: 0, severity: 0 };
    heatmap[threat.category].threats++;
    heatmap[threat.category].severity += threat.confidence;
  }
  for (const key of Object.keys(heatmap)) {
    heatmap[key].severity = Math.round(heatmap[key].severity / heatmap[key].threats * 100) / 100;
  }
  return heatmap;
}

// ─── 27. Immunity Health Composite ─────────────────────────────────────────
export interface ImmunityHealthReport {
  grade: string;
  score: number;
  factors: {
    auditIntegrity: number;
    healingSuccessRate: number;
    cascadeRateInverse: number;
    immuneMemoryEffectiveness: number;
    permeationCoverage: number;
    circuitBreakerHealth: number;
  };
}

export function calculateImmunityHealth(): ImmunityHealthReport {
  const auditResult = verifyAuditChain();
  const healStats = getHealingStats();
  const cascadeRate = getCascadeRate();
  const memoryEff = getImmuneMemoryEffectiveness();
  const permeation = getPermeationCoverage(24);
  const cbState = getImmuneCircuitBreakerState();

  const auditIntegrity = auditResult.valid ? 100 : 40;
  const healingSuccessRate = Math.round(healStats.successRate * 100);
  const cascadeRateInverse = Math.max(0, 100 - cascadeRate * 10);
  const immuneMemoryEffectiveness = Math.round(memoryEff * 100);
  const permeationCoverage = Math.round(permeation * 100);
  const circuitBreakerHealth = cbState.state === 'closed' ? 100 : cbState.state === 'half-open' ? 60 : 20;

  const score = Math.round(
    auditIntegrity * 0.2 +
    healingSuccessRate * 0.2 +
    cascadeRateInverse * 0.15 +
    immuneMemoryEffectiveness * 0.15 +
    permeationCoverage * 0.15 +
    circuitBreakerHealth * 0.15
  );

  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    grade, score,
    factors: { auditIntegrity, healingSuccessRate, cascadeRateInverse, immuneMemoryEffectiveness, permeationCoverage, circuitBreakerHealth },
  };
}
