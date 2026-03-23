/**
 * ENCODE Module — Code Execution & Generation Intelligence
 * Module #21, first-class substrate module
 * v9.0.0 "Architect" — Ultimate Form
 * 
 * ENCODE is the substrate's code execution engine, receiving structured task packets
 * from DECODE (the human-facing intent router) and producing governed code artifacts.
 * ENCODE integrates bidirectionally with BRAIN for recall and writeback.
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TargetSurface = 'code' | 'ui' | 'docs' | 'db' | 'edge' | 'tests';

export interface EncodeTaskPacket {
  id: string;
  createdAt: string;
  intentSummary: string;
  targetSurface: TargetSurface;
  constraints: {
    destructiveAllowed: boolean;
    requiresApproval: boolean;
  };
  contextRefs: {
    brainKeys: string[];
    urls?: string[];
  };
  acceptance: string[];
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  result?: EncodeTaskResult;
}

export interface EncodeTaskResult {
  taskId: string;
  success: boolean;
  artifacts: EncodeArtifact[];
  learnings: string[];
  brainReceiptId?: string;
  completedAt: string;
  executionMs: number;
}

export interface EncodeArtifact {
  type: 'code' | 'diff' | 'doc' | 'schema' | 'test';
  filePath?: string;
  content: string;
  confidence: number;
  operation: 'create' | 'modify' | 'delete';
}

export interface EncodeModuleState {
  initialized: boolean;
  isRunning: boolean;
  totalTasksQueued: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  lastRunAt: string | null;
  lastLearningReportId: string | null;
  taskQueue: EncodeTaskPacket[];
  receipts: EncodeTaskResult[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const state: EncodeModuleState = {
  initialized: false,
  isRunning: false,
  totalTasksQueued: 0,
  totalTasksCompleted: 0,
  totalTasksFailed: 0,
  lastRunAt: null,
  lastLearningReportId: null,
  taskQueue: [],
  receipts: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════

export function initEncode(): void {
  emitStarted('encode', 'init', {});
  state.initialized = true;
  emitSucceeded('encode', 'init', { module: 'encode', role: 'code_execution_engine' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_SURFACES: TargetSurface[] = ['code', 'ui', 'docs', 'db', 'edge', 'tests'];
const MAX_INTENT_LENGTH = 5000;
const MAX_ACCEPTANCE_ITEMS = 20;

// Enhancement #1: Priority-sorted queue insertion
export function enqueueTask(packet: Omit<EncodeTaskPacket, 'id' | 'createdAt' | 'status'> & { priority?: number }): EncodeTaskPacket {
  // Input validation
  const validIntent = validateStringInput(packet.intentSummary, { maxLength: MAX_INTENT_LENGTH, minLength: 1 });
  if (!validIntent) {
    throw new Error('[ENCODE] Invalid intentSummary: must be 1-5000 characters');
  }
  if (!VALID_SURFACES.includes(packet.targetSurface)) {
    throw new Error(`[ENCODE] Invalid targetSurface: ${packet.targetSurface}. Must be one of: ${VALID_SURFACES.join(', ')}`);
  }
  const safeAcceptance = (packet.acceptance || []).slice(0, MAX_ACCEPTANCE_ITEMS);

  // Enhancement #2: Auto-prune completed/failed tasks older than 50 entries
  pruneQueue();

  const task: EncodeTaskPacket = {
    ...packet,
    intentSummary: validIntent,
    acceptance: safeAcceptance,
    id: `enc-${Date.now()}-${state.totalTasksQueued}`,
    createdAt: new Date().toISOString(),
    status: 'queued',
  };
  state.taskQueue.push(task);
  state.totalTasksQueued++;
  emit({ module: 'encode', event_type: 'task_queued', outcome: 'succeeded', data: { taskId: task.id, surface: task.targetSurface } });
  return task;
}

// Enhancement #2: Queue hygiene — remove completed/failed tasks beyond retention limit
const QUEUE_RETENTION = 50;
const RECEIPT_RETENTION = 200;

function pruneQueue(): void {
  const terminal = state.taskQueue.filter(t => t.status === 'completed' || t.status === 'failed');
  if (terminal.length > QUEUE_RETENTION) {
    const toRemove = new Set(terminal.slice(0, terminal.length - QUEUE_RETENTION).map(t => t.id));
    state.taskQueue = state.taskQueue.filter(t => !toRemove.has(t.id));
  }
  // Cap receipts
  if (state.receipts.length > RECEIPT_RETENTION) {
    state.receipts = state.receipts.slice(-RECEIPT_RETENTION);
  }
}

export function getTaskQueue(): EncodeTaskPacket[] {
  return [...state.taskQueue];
}

export function getReceipts(limit?: number): EncodeTaskResult[] {
  return limit ? state.receipts.slice(-limit) : [...state.receipts];
}

// Enhancement #3: completeTask auto-records failures to error-pattern library
export function completeTask(taskId: string, result: Omit<EncodeTaskResult, 'taskId'>): EncodeTaskResult {
  const task = state.taskQueue.find(t => t.id === taskId);
  const receipt: EncodeTaskResult = { ...result, taskId };
  
  if (task) {
    task.status = result.success ? 'completed' : 'failed';
    task.result = receipt;
  }
  
  state.receipts.push(receipt);
  if (result.success) {
    state.totalTasksCompleted++;
  } else {
    state.totalTasksFailed++;
    // Auto-record to error-pattern library for prevention
    try {
      const { recordFailure } = require('../encode-error-patterns/index');
      const errorMsg = result.learnings.join('; ') || 'Task failed without learnings';
      recordFailure(receipt, errorMsg, task?.targetSurface);
    } catch { /* error-pattern lib not loaded */ }
  }
  state.lastRunAt = new Date().toISOString();
  
  emit({ 
    module: 'encode', 
    event_type: result.success ? 'task_completed' : 'task_failed', 
    outcome: result.success ? 'succeeded' : 'failed', 
    data: { taskId, artifacts: result.artifacts.length, learnings: result.learnings.length } 
  });
  
  return receipt;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE & HEALTH
// ═══════════════════════════════════════════════════════════════════════════════

export function getEncodeState(): EncodeModuleState {
  return { ...state, taskQueue: [...state.taskQueue], receipts: [...state.receipts] };
}

// Enhancement #4: Composite health score (success rate + queue health + recency)
export function getEncodeHealth(): number {
  if (!state.initialized) return 0;
  const total = state.totalTasksCompleted + state.totalTasksFailed;
  if (total === 0) return 100;

  // Base: success rate (0-60 points)
  const successRate = state.totalTasksCompleted / total;
  const baseScore = successRate * 60;

  // Queue health: penalize growing queue (0-20 points)
  const pendingCount = state.taskQueue.filter(t => t.status === 'queued').length;
  const queueScore = Math.max(0, 20 - pendingCount * 2);

  // Recency: bonus if last run was recent (0-20 points)
  let recencyScore = 10;
  if (state.lastRunAt) {
    const ageMs = Date.now() - new Date(state.lastRunAt).getTime();
    recencyScore = ageMs < 60000 ? 20 : ageMs < 300000 ? 15 : 10;
  }

  return Math.round(Math.min(100, baseScore + queueScore + recencyScore));
}

// Enhancement #5: Prevention check before enqueue
export function checkTaskSafety(task: Partial<EncodeTaskPacket>): { safe: boolean; riskScore: number; recommendations: string[] } {
  try {
    const { checkPrevention } = require('../encode-error-patterns/index');
    return checkPrevention(task);
  } catch {
    return { safe: true, riskScore: 0, recommendations: [] };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENING LAYER v2.0.0 ("Forge") — Re-exports
// ═══════════════════════════════════════════════════════════════════════════════

export {
  ENCODE_HARDENING_VERSION,
  ENCODE_HARDENING_CODENAME,
  // 1. Artifact Integrity
  sealArtifact, verifyArtifactChain, getArtifactSealChain,
  // 2. Generation Budget
  checkGenerationBudget, recordGeneratedLines, resetSessionBudget, getGenerationBudget,
  // 3. Destructive Change Guard
  detectDestructiveIntent, requestDestructiveApproval, approveDestructiveChange, getDestructiveLog,
  // 4. Patch Versioning
  recordPatch, getPatchHistory, getPatchById,
  // 5. Import Allowlist
  checkImportAllowed, recordImportViolation, getImportViolations,
  // 6. Resilience Baseline
  checkResilienceBaseline,
  // 7. Task Idempotency
  computeTaskFingerprint, checkIdempotency, recordTaskFingerprint, clearFingerprintCache,
  // 8. Timeout Escalation
  getTimeoutForTier, shouldEscalateTimeout,
  // 9. Confidence Calibration
  recordCalibrationPoint, getCalibrationReport,
  // 10. Convention Enforcer
  enforceConventions,
  // 11. Diff Impact Estimator
  estimateDiffImpact,
  // 12. Learning Receipt Ledger
  recordLearningReceipt, getLearningLedger,
  // 13. Task Dependency Resolver
  validateTaskDependencies,
  // 14. Sandbox Pre-Flight
  runPreFlight,
  // 15. Task Priority Scorer
  scoreTaskPriority,
  // 16. Concurrent Task Limiter
  acquireExecutionSlot, releaseExecutionSlot, getConcurrencyState,
  // 17. Rollback Registry
  registerRollback, executeRollback, getRollbackRegistry,
  // 18. Learning Cycle Tracker
  recordLearningCycle, getLearningCycleMetrics,
  // 19. Code Quality Gate
  calculateCodeQuality,
  // 20. Error Pattern Dedup
  isKnownError, recordErrorFingerprint, getKnownErrorCount,
  // 21. Execution Audit Trail
  logExecutionAudit, getExecutionAuditTrail,
  // 22. Surface Capability Map
  getSurfaceCapability, getAllSurfaceCapabilities,
  // 23. Generation Cooldown
  checkGenerationCooldown, recordGenerationTimestamp,
  // 24. Task Outcome Forecaster
  forecastTaskOutcome,
  // 25. ENCODE Health Composite
  calculateEncodeHealth,
  // Types
  type ArtifactSeal, type GenerationBudget, type DestructiveChangeRequest,
  type PatchVersion, type LearningReceipt, type TaskDependency,
  type PreFlightResult, type RollbackEntry, type ExecutionAuditEntry,
  type SurfaceCapability, type EncodeHealthReport, type DiffImpact,
  type ConventionRule, type ResilienceCheck, type TimeoutTier,
} from './encode-hardening';
