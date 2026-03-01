/**
 * ENCODE Module — Hardening Layer v2.0.0 ("Forge")
 * 25 enterprise-grade code execution safety, integrity, and intelligence features.
 * Non-breaking additive layer — all existing ENCODE internals remain frozen.
 *
 * © 2025–2026 PromptFluid®. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION
// ═══════════════════════════════════════════════════════════════════════════════

export const ENCODE_HARDENING_VERSION = '2.0.0';
export const ENCODE_HARDENING_CODENAME = 'Forge';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ARTIFACT INTEGRITY SEAL — hash-chain generated code artifacts
// ═══════════════════════════════════════════════════════════════════════════════

export interface ArtifactSeal {
  artifactId: string;
  contentHash: string;
  previousHash: string;
  taskId: string;
  sealedAt: string;
  operation: 'create' | 'modify' | 'delete';
}

const artifactSealChain: ArtifactSeal[] = [];

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function sealArtifact(taskId: string, content: string, operation: ArtifactSeal['operation']): ArtifactSeal {
  const previousHash = artifactSealChain.length > 0
    ? artifactSealChain[artifactSealChain.length - 1].contentHash
    : '00000000';
  const seal: ArtifactSeal = {
    artifactId: `art-${Date.now()}-${artifactSealChain.length}`,
    contentHash: fnv1a(`${previousHash}:${content}`),
    previousHash,
    taskId,
    sealedAt: new Date().toISOString(),
    operation,
  };
  artifactSealChain.push(seal);
  return seal;
}

export function verifyArtifactChain(): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < artifactSealChain.length; i++) {
    if (artifactSealChain[i].previousHash !== artifactSealChain[i - 1].contentHash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

export function getArtifactSealChain(): ArtifactSeal[] {
  return [...artifactSealChain];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CODE GENERATION BUDGET — prevent runaway generation
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerationBudget {
  maxArtifactsPerTask: number;
  maxLinesPerArtifact: number;
  maxTotalLinesPerSession: number;
  currentSessionLines: number;
  enforced: boolean;
}

const generationBudget: GenerationBudget = {
  maxArtifactsPerTask: 25,
  maxLinesPerArtifact: 2000,
  maxTotalLinesPerSession: 50000,
  currentSessionLines: 0,
  enforced: true,
};

export function checkGenerationBudget(artifactCount: number, lineCount: number): { allowed: boolean; reason?: string } {
  if (!generationBudget.enforced) return { allowed: true };
  if (artifactCount > generationBudget.maxArtifactsPerTask) {
    return { allowed: false, reason: `Artifact count ${artifactCount} exceeds budget (${generationBudget.maxArtifactsPerTask})` };
  }
  if (lineCount > generationBudget.maxLinesPerArtifact) {
    return { allowed: false, reason: `Line count ${lineCount} exceeds per-artifact limit (${generationBudget.maxLinesPerArtifact})` };
  }
  if (generationBudget.currentSessionLines + lineCount > generationBudget.maxTotalLinesPerSession) {
    return { allowed: false, reason: `Session line budget exhausted (${generationBudget.currentSessionLines}/${generationBudget.maxTotalLinesPerSession})` };
  }
  return { allowed: true };
}

export function recordGeneratedLines(lines: number): void {
  generationBudget.currentSessionLines += lines;
}

export function resetSessionBudget(): void {
  generationBudget.currentSessionLines = 0;
}

export function getGenerationBudget(): GenerationBudget {
  return { ...generationBudget };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DESTRUCTIVE CHANGE GUARD — extra validation for risky operations
// ═══════════════════════════════════════════════════════════════════════════════

export type DestructiveCategory = 'file_delete' | 'schema_drop' | 'rls_remove' | 'api_key_expose' | 'bulk_overwrite';

export interface DestructiveChangeRequest {
  category: DestructiveCategory;
  targetPath: string;
  impactDescription: string;
  requestedAt: string;
  approved: boolean;
  approvedBy?: string;
}

const destructiveLog: DestructiveChangeRequest[] = [];

const DESTRUCTIVE_PATTERNS: Record<DestructiveCategory, RegExp> = {
  file_delete: /\b(delete|remove|unlink)\b.*\.(ts|tsx|sql|json)/i,
  schema_drop: /\b(DROP\s+TABLE|DROP\s+COLUMN|TRUNCATE)\b/i,
  rls_remove: /\bDROP\s+POLICY\b/i,
  api_key_expose: /\b(service_role|secret_key|private_key)\b/i,
  bulk_overwrite: /\b(overwrite|replace\s+all|force\s+push)\b/i,
};

export function detectDestructiveIntent(content: string): DestructiveCategory[] {
  const found: DestructiveCategory[] = [];
  for (const [cat, pattern] of Object.entries(DESTRUCTIVE_PATTERNS)) {
    if (pattern.test(content)) found.push(cat as DestructiveCategory);
  }
  return found;
}

export function requestDestructiveApproval(category: DestructiveCategory, targetPath: string, impactDescription: string): DestructiveChangeRequest {
  const req: DestructiveChangeRequest = {
    category,
    targetPath,
    impactDescription,
    requestedAt: new Date().toISOString(),
    approved: false,
  };
  destructiveLog.push(req);
  return req;
}

export function approveDestructiveChange(index: number, approver: string): boolean {
  if (index < 0 || index >= destructiveLog.length) return false;
  destructiveLog[index].approved = true;
  destructiveLog[index].approvedBy = approver;
  return true;
}

export function getDestructiveLog(): DestructiveChangeRequest[] {
  return [...destructiveLog];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PATCH VERSIONING — immutable patch chain for surgical modifications
// ═══════════════════════════════════════════════════════════════════════════════

export interface PatchVersion {
  patchId: string;
  taskId: string;
  filePath: string;
  beforeHash: string;
  afterHash: string;
  diffSummary: string;
  rationale: string;
  appliedAt: string;
  rollbackable: boolean;
}

const patchHistory: PatchVersion[] = [];

export function recordPatch(patch: Omit<PatchVersion, 'patchId' | 'appliedAt'>): PatchVersion {
  const entry: PatchVersion = {
    ...patch,
    patchId: `patch-${Date.now()}-${patchHistory.length}`,
    appliedAt: new Date().toISOString(),
  };
  patchHistory.push(entry);
  return entry;
}

export function getPatchHistory(filePath?: string): PatchVersion[] {
  if (filePath) return patchHistory.filter(p => p.filePath === filePath);
  return [...patchHistory];
}

export function getPatchById(patchId: string): PatchVersion | undefined {
  return patchHistory.find(p => p.patchId === patchId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. IMPORT ALLOWLIST — prevent unauthorized dependency introduction
// ═══════════════════════════════════════════════════════════════════════════════

const APPROVED_IMPORT_PREFIXES = [
  '@/', '@radix-ui/', '@tanstack/', '@supabase/', '@react-three/',
  'react', 'react-dom', 'react-router', 'framer-motion',
  'lucide-react', 'recharts', 'zustand', 'zod', 'date-fns',
  'sonner', 'clsx', 'tailwind-merge', 'class-variance-authority',
];

const importViolations: Array<{ import: string; file: string; detectedAt: string }> = [];

export function checkImportAllowed(importPath: string): { allowed: boolean; reason?: string } {
  if (importPath.startsWith('.') || importPath.startsWith('/')) return { allowed: true };
  const isApproved = APPROVED_IMPORT_PREFIXES.some(prefix => importPath.startsWith(prefix));
  if (!isApproved) {
    return { allowed: false, reason: `Import "${importPath}" not in approved list. Requires governance approval.` };
  }
  return { allowed: true };
}

export function recordImportViolation(importPath: string, file: string): void {
  importViolations.push({ import: importPath, file, detectedAt: new Date().toISOString() });
}

export function getImportViolations(): typeof importViolations {
  return [...importViolations];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. RESILIENCE BASELINE CHECKER — mandatory checklist for generated code
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResilienceCheck {
  name: string;
  pattern: RegExp;
  required: boolean;
  description: string;
}

const RESILIENCE_CHECKS: ResilienceCheck[] = [
  { name: 'input_validation', pattern: /\b(validate|zod|schema|parse|check)\b/i, required: true, description: 'Input validation present' },
  { name: 'error_handling', pattern: /\b(try|catch|throw|Error)\b/, required: true, description: 'Structured error handling' },
  { name: 'timeout_guard', pattern: /\b(timeout|AbortController|signal)\b/i, required: false, description: 'Timeout guard for external calls' },
  { name: 'retry_logic', pattern: /\b(retry|backoff|attempt)\b/i, required: false, description: 'Retry wrapper for external calls' },
  { name: 'logging', pattern: /\b(log\.|console\.|emit\()\b/, required: true, description: 'Observability logging' },
  { name: 'type_safety', pattern: /\b(interface|type\s|:\s*(string|number|boolean))\b/, required: true, description: 'TypeScript type annotations' },
];

export function checkResilienceBaseline(code: string): { passed: boolean; score: number; failures: string[] } {
  const failures: string[] = [];
  let passCount = 0;
  for (const check of RESILIENCE_CHECKS) {
    const found = check.pattern.test(code);
    if (found) passCount++;
    else if (check.required) failures.push(check.name);
  }
  const score = Math.round((passCount / RESILIENCE_CHECKS.length) * 100);
  return { passed: failures.length === 0, score, failures };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. TASK IDEMPOTENCY — prevent duplicate task execution
// ═══════════════════════════════════════════════════════════════════════════════

const taskFingerprints = new Map<string, { taskId: string; completedAt: string }>();

export function computeTaskFingerprint(intentSummary: string, targetSurface: string): string {
  return fnv1a(`${intentSummary}::${targetSurface}`);
}

export function checkIdempotency(fingerprint: string): { duplicate: boolean; originalTaskId?: string } {
  const existing = taskFingerprints.get(fingerprint);
  if (existing) return { duplicate: true, originalTaskId: existing.taskId };
  return { duplicate: false };
}

export function recordTaskFingerprint(fingerprint: string, taskId: string): void {
  taskFingerprints.set(fingerprint, { taskId, completedAt: new Date().toISOString() });
}

export function clearFingerprintCache(): void {
  taskFingerprints.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. EXECUTION TIMEOUT ESCALATION — tiered timeouts with auto-escalation
// ═══════════════════════════════════════════════════════════════════════════════

export interface TimeoutTier {
  tier: 'fast' | 'standard' | 'complex' | 'critical';
  maxMs: number;
  escalateTo: string;
}

const TIMEOUT_TIERS: TimeoutTier[] = [
  { tier: 'fast', maxMs: 5_000, escalateTo: 'standard' },
  { tier: 'standard', maxMs: 30_000, escalateTo: 'complex' },
  { tier: 'complex', maxMs: 120_000, escalateTo: 'critical' },
  { tier: 'critical', maxMs: 300_000, escalateTo: 'governance' },
];

export function getTimeoutForTier(tier: TimeoutTier['tier']): TimeoutTier {
  return TIMEOUT_TIERS.find(t => t.tier === tier) || TIMEOUT_TIERS[1];
}

export function shouldEscalateTimeout(tier: TimeoutTier['tier'], elapsedMs: number): { escalate: boolean; nextTier?: string } {
  const config = getTimeoutForTier(tier);
  if (elapsedMs > config.maxMs) {
    return { escalate: true, nextTier: config.escalateTo };
  }
  return { escalate: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. CONFIDENCE CALIBRATION — track predicted vs actual success
// ═══════════════════════════════════════════════════════════════════════════════

interface CalibrationPoint {
  taskId: string;
  predictedConfidence: number;
  actualSuccess: boolean;
  timestamp: string;
}

const calibrationPoints: CalibrationPoint[] = [];

export function recordCalibrationPoint(taskId: string, predicted: number, actual: boolean): void {
  calibrationPoints.push({
    taskId,
    predictedConfidence: Math.max(0, Math.min(1, predicted)),
    actualSuccess: actual,
    timestamp: new Date().toISOString(),
  });
  if (calibrationPoints.length > 500) calibrationPoints.splice(0, calibrationPoints.length - 500);
}

export function getCalibrationReport(): { totalPoints: number; avgPredicted: number; actualSuccessRate: number; calibrationError: number } {
  if (calibrationPoints.length === 0) return { totalPoints: 0, avgPredicted: 0, actualSuccessRate: 0, calibrationError: 0 };
  const avgP = calibrationPoints.reduce((s, p) => s + p.predictedConfidence, 0) / calibrationPoints.length;
  const actualRate = calibrationPoints.filter(p => p.actualSuccess).length / calibrationPoints.length;
  return {
    totalPoints: calibrationPoints.length,
    avgPredicted: Math.round(avgP * 100) / 100,
    actualSuccessRate: Math.round(actualRate * 100) / 100,
    calibrationError: Math.round(Math.abs(avgP - actualRate) * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. CONVENTION ENFORCER — project convention compliance
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConventionRule {
  id: string;
  name: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
}

const CONVENTION_RULES: ConventionRule[] = [
  { id: 'no-any', name: 'No Explicit Any', pattern: /:\s*any\b/, message: 'Avoid using `any` type — use proper types', severity: 'warning' },
  { id: 'no-console-log', name: 'No console.log', pattern: /console\.log\(/, message: 'Use structured logging (log.info/warn/error)', severity: 'warning' },
  { id: 'no-hardcoded-url', name: 'No Hardcoded URLs', pattern: /https?:\/\/[a-z0-9]+\.(supabase|lovable)\.(co|app)/, message: 'Use environment variables for URLs', severity: 'error' },
  { id: 'no-service-key', name: 'No Service Keys', pattern: /service_role|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/, message: 'Never expose service role keys in client code', severity: 'error' },
  { id: 'semantic-tokens', name: 'Semantic Design Tokens', pattern: /(?:text|bg|border)-(?:white|black|gray-\d|blue-\d|red-\d|green-\d)/, message: 'Use semantic design tokens, not raw colors', severity: 'warning' },
];

export function enforceConventions(code: string): { passed: boolean; violations: Array<{ rule: string; message: string; severity: string }> } {
  const violations: Array<{ rule: string; message: string; severity: string }> = [];
  for (const rule of CONVENTION_RULES) {
    if (rule.pattern.test(code)) {
      violations.push({ rule: rule.id, message: rule.message, severity: rule.severity });
    }
  }
  return { passed: violations.filter(v => v.severity === 'error').length === 0, violations };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. DIFF IMPACT ESTIMATOR — blast radius prediction
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiffImpact {
  filesAffected: number;
  estimatedRiskScore: number; // 0–100
  breakingChange: boolean;
  affectedModules: string[];
  recommendation: 'proceed' | 'review' | 'halt';
}

export function estimateDiffImpact(filePaths: string[], changeType: 'create' | 'modify' | 'delete'): DiffImpact {
  const coreModules = ['substrate', 'events', 'memory-core', 'engine-bus', 'governance'];
  const affectedModules = filePaths
    .map(p => {
      const match = p.match(/src\/lib\/(?:substrate\/)?([^/]+)/);
      return match ? match[1] : null;
    })
    .filter((m): m is string => m !== null);

  const touchesCore = affectedModules.some(m => coreModules.includes(m));
  const isDelete = changeType === 'delete';
  const riskBase = isDelete ? 60 : changeType === 'modify' ? 30 : 10;
  const coreBonus = touchesCore ? 30 : 0;
  const countBonus = Math.min(20, filePaths.length * 3);
  const riskScore = Math.min(100, riskBase + coreBonus + countBonus);

  return {
    filesAffected: filePaths.length,
    estimatedRiskScore: riskScore,
    breakingChange: touchesCore && isDelete,
    affectedModules: [...new Set(affectedModules)],
    recommendation: riskScore > 70 ? 'halt' : riskScore > 40 ? 'review' : 'proceed',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. LEARNING RECEIPT LEDGER — tamper-evident learning log
// ═══════════════════════════════════════════════════════════════════════════════

export interface LearningReceipt {
  receiptId: string;
  taskId: string;
  learnings: string[];
  hash: string;
  previousHash: string;
  recordedAt: string;
}

const learningLedger: LearningReceipt[] = [];

export function recordLearningReceipt(taskId: string, learnings: string[]): LearningReceipt {
  const previousHash = learningLedger.length > 0
    ? learningLedger[learningLedger.length - 1].hash
    : '00000000';
  const receipt: LearningReceipt = {
    receiptId: `lr-${Date.now()}-${learningLedger.length}`,
    taskId,
    learnings,
    hash: fnv1a(`${previousHash}:${learnings.join('|')}`),
    previousHash,
    recordedAt: new Date().toISOString(),
  };
  learningLedger.push(receipt);
  if (learningLedger.length > 1000) learningLedger.splice(0, learningLedger.length - 1000);
  return receipt;
}

export function getLearningLedger(): LearningReceipt[] {
  return [...learningLedger];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. TASK DEPENDENCY RESOLVER — validate inter-task dependencies
// ═══════════════════════════════════════════════════════════════════════════════

export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
}

export function validateTaskDependencies(deps: TaskDependency[]): { valid: boolean; cycles: string[][] } {
  const graph = new Map<string, string[]>();
  for (const d of deps) graph.set(d.taskId, d.dependsOn);

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    inStack.add(node);
    for (const dep of graph.get(node) || []) {
      dfs(dep, [...path, node]);
    }
    inStack.delete(node);
  }

  for (const id of graph.keys()) dfs(id, []);
  return { valid: cycles.length === 0, cycles };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. SANDBOX PRE-FLIGHT — validate code before sandbox execution
// ═══════════════════════════════════════════════════════════════════════════════

export interface PreFlightResult {
  safe: boolean;
  checks: Array<{ name: string; passed: boolean; note?: string }>;
}

export function runPreFlight(code: string): PreFlightResult {
  const checks: PreFlightResult['checks'] = [
    { name: 'no_eval', passed: !/\beval\s*\(/.test(code), note: 'eval() detected — potential injection risk' },
    { name: 'no_dynamic_import', passed: !/\bimport\s*\(/.test(code), note: 'Dynamic import detected' },
    { name: 'no_process_env', passed: !/process\.env\b/.test(code), note: 'Direct process.env access — use config layer' },
    { name: 'no_fs_access', passed: !/require\(['"]fs['"]\)/.test(code), note: 'Filesystem access detected' },
    { name: 'no_infinite_loop', passed: !/while\s*\(\s*true\s*\)/.test(code), note: 'Potential infinite loop' },
    { name: 'size_check', passed: code.length < 100_000, note: `Code size ${code.length} chars` },
  ];
  return { safe: checks.every(c => c.passed), checks };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. TASK PRIORITY SCORER — intelligent priority assignment
// ═══════════════════════════════════════════════════════════════════════════════

export function scoreTaskPriority(factors: {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isEscalation?: boolean;
  touchesCore?: boolean;
  userRequested?: boolean;
  ageMs?: number;
}): number {
  let score = 50;
  const severityMap = { low: 0, medium: 10, high: 25, critical: 40 };
  score += severityMap[factors.severity || 'medium'];
  if (factors.isEscalation) score += 15;
  if (factors.touchesCore) score += 10;
  if (factors.userRequested) score += 20;
  if (factors.ageMs && factors.ageMs > 300_000) score += 5; // aging bonus
  return Math.min(100, score);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. CONCURRENT TASK LIMITER — prevent overload
// ═══════════════════════════════════════════════════════════════════════════════

const concurrencyState = { active: 0, maxConcurrent: 5, waitQueue: 0 };

export function acquireExecutionSlot(): { acquired: boolean; active: number; max: number } {
  if (concurrencyState.active >= concurrencyState.maxConcurrent) {
    concurrencyState.waitQueue++;
    return { acquired: false, active: concurrencyState.active, max: concurrencyState.maxConcurrent };
  }
  concurrencyState.active++;
  return { acquired: true, active: concurrencyState.active, max: concurrencyState.maxConcurrent };
}

export function releaseExecutionSlot(): void {
  concurrencyState.active = Math.max(0, concurrencyState.active - 1);
  if (concurrencyState.waitQueue > 0) concurrencyState.waitQueue--;
}

export function getConcurrencyState(): typeof concurrencyState {
  return { ...concurrencyState };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 17. ROLLBACK REGISTRY — track rollback-capable changes
// ═══════════════════════════════════════════════════════════════════════════════

export interface RollbackEntry {
  patchId: string;
  beforeState: string;
  filePath: string;
  rolledBack: boolean;
  createdAt: string;
}

const rollbackRegistry: RollbackEntry[] = [];

export function registerRollback(patchId: string, filePath: string, beforeState: string): void {
  rollbackRegistry.push({ patchId, beforeState, filePath, rolledBack: false, createdAt: new Date().toISOString() });
}

export function executeRollback(patchId: string): { success: boolean; beforeState?: string } {
  const entry = rollbackRegistry.find(r => r.patchId === patchId && !r.rolledBack);
  if (!entry) return { success: false };
  entry.rolledBack = true;
  return { success: true, beforeState: entry.beforeState };
}

export function getRollbackRegistry(): RollbackEntry[] {
  return [...rollbackRegistry];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 18. ENCODED LEARNING CYCLE TRACKER — CLM integration metrics
// ═══════════════════════════════════════════════════════════════════════════════

interface LearningCycleMetrics {
  totalCycles: number;
  totalPatterns: number;
  totalImprovements: number;
  lastCycleAt: string | null;
  averageCycleDurationMs: number;
  cycleDurations: number[];
}

const learningMetrics: LearningCycleMetrics = {
  totalCycles: 0,
  totalPatterns: 0,
  totalImprovements: 0,
  lastCycleAt: null,
  averageCycleDurationMs: 0,
  cycleDurations: [],
};

export function recordLearningCycle(durationMs: number, patternsFound: number, improvementsApplied: number): void {
  learningMetrics.totalCycles++;
  learningMetrics.totalPatterns += patternsFound;
  learningMetrics.totalImprovements += improvementsApplied;
  learningMetrics.lastCycleAt = new Date().toISOString();
  learningMetrics.cycleDurations.push(durationMs);
  if (learningMetrics.cycleDurations.length > 100) learningMetrics.cycleDurations.splice(0, 1);
  learningMetrics.averageCycleDurationMs = Math.round(
    learningMetrics.cycleDurations.reduce((s, d) => s + d, 0) / learningMetrics.cycleDurations.length
  );
}

export function getLearningCycleMetrics(): LearningCycleMetrics {
  return { ...learningMetrics, cycleDurations: [...learningMetrics.cycleDurations] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 19. CODE QUALITY GATE — minimum quality score required to proceed
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateCodeQuality(code: string): { score: number; grade: string; details: Record<string, number> } {
  const lines = code.split('\n');
  const totalLines = lines.length;
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('*') || l.trim().startsWith('/**')).length;
  const emptyLines = lines.filter(l => l.trim() === '').length;
  const longLines = lines.filter(l => l.length > 120).length;
  const complexity = (code.match(/\b(if|else|switch|for|while|catch)\b/g) || []).length;

  const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
  const longLineRatio = totalLines > 0 ? longLines / totalLines : 0;
  const complexityPer100 = totalLines > 0 ? (complexity / totalLines) * 100 : 0;

  const commentScore = Math.min(25, commentRatio * 100);
  const lengthScore = Math.max(0, 25 - longLineRatio * 100);
  const complexityScore = Math.max(0, 25 - complexityPer100 * 2);
  const structureScore = emptyLines > 0 ? 25 : 15;

  const total = Math.round(commentScore + lengthScore + complexityScore + structureScore);
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';

  return {
    score: total,
    grade,
    details: { commentScore: Math.round(commentScore), lengthScore: Math.round(lengthScore), complexityScore: Math.round(complexityScore), structureScore },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20. ERROR PATTERN DEDUP — prevent re-recording known errors
// ═══════════════════════════════════════════════════════════════════════════════

const errorFingerprints = new Set<string>();

export function isKnownError(errorMessage: string, context?: string): boolean {
  const fp = fnv1a(`${errorMessage}::${context || ''}`);
  return errorFingerprints.has(fp);
}

export function recordErrorFingerprint(errorMessage: string, context?: string): void {
  errorFingerprints.add(fnv1a(`${errorMessage}::${context || ''}`));
}

export function getKnownErrorCount(): number {
  return errorFingerprints.size;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 21. EXECUTION AUDIT TRAIL — immutable log of all ENCODE executions
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExecutionAuditEntry {
  entryId: string;
  taskId: string;
  action: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const executionAuditTrail: ExecutionAuditEntry[] = [];

export function logExecutionAudit(taskId: string, action: string, actor: string, metadata?: Record<string, unknown>): ExecutionAuditEntry {
  const entry: ExecutionAuditEntry = {
    entryId: `audit-${Date.now()}-${executionAuditTrail.length}`,
    taskId,
    action,
    actor,
    timestamp: new Date().toISOString(),
    metadata,
  };
  executionAuditTrail.push(entry);
  if (executionAuditTrail.length > 2000) executionAuditTrail.splice(0, executionAuditTrail.length - 2000);
  return entry;
}

export function getExecutionAuditTrail(taskId?: string): ExecutionAuditEntry[] {
  if (taskId) return executionAuditTrail.filter(e => e.taskId === taskId);
  return [...executionAuditTrail];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 22. SURFACE CAPABILITY MAP — what ENCODE can do per target surface
// ═══════════════════════════════════════════════════════════════════════════════

export interface SurfaceCapability {
  surface: string;
  canCreate: boolean;
  canModify: boolean;
  canDelete: boolean;
  requiresApproval: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

const SURFACE_CAPABILITIES: SurfaceCapability[] = [
  { surface: 'code', canCreate: true, canModify: true, canDelete: false, requiresApproval: false, riskLevel: 'medium' },
  { surface: 'ui', canCreate: true, canModify: true, canDelete: false, requiresApproval: false, riskLevel: 'low' },
  { surface: 'docs', canCreate: true, canModify: true, canDelete: false, requiresApproval: false, riskLevel: 'low' },
  { surface: 'db', canCreate: true, canModify: true, canDelete: false, requiresApproval: true, riskLevel: 'high' },
  { surface: 'edge', canCreate: true, canModify: true, canDelete: false, requiresApproval: true, riskLevel: 'high' },
  { surface: 'tests', canCreate: true, canModify: true, canDelete: false, requiresApproval: false, riskLevel: 'low' },
];

export function getSurfaceCapability(surface: string): SurfaceCapability | undefined {
  return SURFACE_CAPABILITIES.find(s => s.surface === surface);
}

export function getAllSurfaceCapabilities(): SurfaceCapability[] {
  return [...SURFACE_CAPABILITIES];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 23. GENERATION COOLDOWN — rate-limit rapid-fire generation
// ═══════════════════════════════════════════════════════════════════════════════

const cooldownState = { lastGenerationAt: 0, minIntervalMs: 1000, violationCount: 0 };

export function checkGenerationCooldown(): { allowed: boolean; waitMs: number } {
  const now = Date.now();
  const elapsed = now - cooldownState.lastGenerationAt;
  if (elapsed < cooldownState.minIntervalMs) {
    cooldownState.violationCount++;
    return { allowed: false, waitMs: cooldownState.minIntervalMs - elapsed };
  }
  return { allowed: true, waitMs: 0 };
}

export function recordGenerationTimestamp(): void {
  cooldownState.lastGenerationAt = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 24. TASK OUTCOME FORECASTER — predict success probability
// ═══════════════════════════════════════════════════════════════════════════════

export function forecastTaskOutcome(factors: {
  historicalSuccessRate: number;
  complexityScore: number;
  hasPreexistingPatterns: boolean;
  surfaceRisk: 'low' | 'medium' | 'high';
}): { predictedSuccess: number; confidence: number } {
  const riskMap = { low: 0, medium: -0.1, high: -0.25 };
  let base = factors.historicalSuccessRate;
  base += riskMap[factors.surfaceRisk];
  base -= (factors.complexityScore / 100) * 0.15;
  if (factors.hasPreexistingPatterns) base += 0.1;
  const predicted = Math.max(0.05, Math.min(0.99, base));
  const confidence = Math.min(0.95, calibrationPoints.length / 50);
  return {
    predictedSuccess: Math.round(predicted * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 25. ENCODE HEALTH COMPOSITE — A–F grading of the full ENCODE system
// ═══════════════════════════════════════════════════════════════════════════════

export interface EncodeHealthReport {
  score: number;
  grade: string;
  components: Record<string, number>;
  anomalies: string[];
  timestamp: string;
}

export function calculateEncodeHealth(): EncodeHealthReport {
  const anomalies: string[] = [];

  // Artifact chain integrity (0-20)
  const chainResult = verifyArtifactChain();
  const chainScore = chainResult.valid ? 20 : 5;
  if (!chainResult.valid) anomalies.push(`Artifact chain broken at index ${chainResult.brokenAt}`);

  // Calibration accuracy (0-20)
  const cal = getCalibrationReport();
  const calScore = cal.totalPoints > 0 ? Math.round((1 - cal.calibrationError) * 20) : 15;
  if (cal.calibrationError > 0.2) anomalies.push(`High calibration error: ${cal.calibrationError}`);

  // Budget health (0-20)
  const budget = getGenerationBudget();
  const budgetUsage = budget.currentSessionLines / budget.maxTotalLinesPerSession;
  const budgetScore = Math.round((1 - budgetUsage) * 20);
  if (budgetUsage > 0.8) anomalies.push('Generation budget >80% consumed');

  // Concurrency (0-20)
  const conc = getConcurrencyState();
  const concScore = conc.active < conc.maxConcurrent ? 20 : 10;
  if (conc.waitQueue > 3) anomalies.push(`${conc.waitQueue} tasks waiting for execution slots`);

  // Learning health (0-20)
  const learning = getLearningCycleMetrics();
  const learningScore = learning.totalCycles > 0 ? Math.min(20, 10 + learning.totalImprovements) : 10;

  const total = chainScore + calScore + budgetScore + concScore + learningScore;
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';

  return {
    score: total,
    grade,
    components: { chain: chainScore, calibration: calScore, budget: budgetScore, concurrency: concScore, learning: learningScore },
    anomalies,
    timestamp: new Date().toISOString(),
  };
}
