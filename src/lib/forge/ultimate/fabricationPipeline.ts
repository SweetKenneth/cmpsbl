/**
 * FORGE Ultimate #2 — Multi-Stage Fabrication Pipeline
 * 5-stage forge: Draft → Temper → Anneal → Quench → Polish
 * Each stage applies progressively stricter quality gates.
 */

// ── Types ──

export type FabricationStage = 'draft' | 'temper' | 'anneal' | 'quench' | 'polish';
export type FabricationStatus = 'active' | 'paused' | 'completed' | 'rejected' | 'failed';

export interface StageResult {
  stage: FabricationStage;
  passed: boolean;
  score: number;          // 0-100
  issues: string[];
  durationMs: number;
  completedAt: number;
}

export interface FabricationJob {
  id: string;
  blueprintId: string;
  currentStage: FabricationStage;
  status: FabricationStatus;
  stageResults: StageResult[];
  overallScore: number;
  reworkCount: number;
  createdAt: number;
  updatedAt: number;
}

// ── Constants ──

const STAGE_ORDER: FabricationStage[] = ['draft', 'temper', 'anneal', 'quench', 'polish'];

const STAGE_THRESHOLDS: Record<FabricationStage, number> = {
  draft: 30,    // Minimal viability
  temper: 50,   // Type safety
  anneal: 65,   // Circular dep check
  quench: 75,   // Blast radius acceptable
  polish: 85,   // Production ready
};

// ── State ──

const jobs = new Map<string, FabricationJob>();
let idCounter = 0;
let totalJobs = 0;
let totalRejections = 0;

// ── Core ──

export function startFabrication(blueprintId: string): FabricationJob {
  const job: FabricationJob = {
    id: `fab-${++idCounter}-${Date.now().toString(36)}`,
    blueprintId,
    currentStage: 'draft',
    status: 'active',
    stageResults: [],
    overallScore: 0,
    reworkCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(job.id, job);
  totalJobs++;
  return job;
}

export function completeStage(
  jobId: string,
  score: number,
  issues: string[] = [],
  durationMs: number = 0,
): { advanced: boolean; nextStage: FabricationStage | null; rejected: boolean } {
  const job = jobs.get(jobId);
  if (!job || job.status !== 'active') return { advanced: false, nextStage: null, rejected: false };

  const threshold = STAGE_THRESHOLDS[job.currentStage];
  const passed = score >= threshold;

  job.stageResults.push({
    stage: job.currentStage,
    passed,
    score,
    issues,
    durationMs,
    completedAt: Date.now(),
  });

  if (!passed) {
    job.status = 'rejected';
    job.updatedAt = Date.now();
    totalRejections++;
    return { advanced: false, nextStage: null, rejected: true };
  }

  // Advance to next stage
  const currentIdx = STAGE_ORDER.indexOf(job.currentStage);
  if (currentIdx < STAGE_ORDER.length - 1) {
    job.currentStage = STAGE_ORDER[currentIdx + 1];
    job.updatedAt = Date.now();
    return { advanced: true, nextStage: job.currentStage, rejected: false };
  }

  // All stages complete
  job.status = 'completed';
  job.overallScore = Math.round(job.stageResults.reduce((s, r) => s + r.score, 0) / job.stageResults.length);
  job.updatedAt = Date.now();
  return { advanced: true, nextStage: null, rejected: false };
}

export function pauseJob(jobId: string): boolean {
  const job = jobs.get(jobId);
  if (!job || job.status !== 'active') return false;
  job.status = 'paused';
  job.updatedAt = Date.now();
  return true;
}

export function resumeJob(jobId: string): boolean {
  const job = jobs.get(jobId);
  if (!job || job.status !== 'paused') return false;
  job.status = 'active';
  job.updatedAt = Date.now();
  return true;
}

export function reworkJob(jobId: string): boolean {
  const job = jobs.get(jobId);
  if (!job || job.status !== 'rejected') return false;
  // Re-enter at the failed stage
  job.status = 'active';
  job.reworkCount++;
  job.stageResults.pop(); // Remove failed result
  job.updatedAt = Date.now();
  return true;
}

export function getJob(id: string): FabricationJob | undefined { return jobs.get(id); }

export function getFabricationStats(): {
  totalJobs: number; activeJobs: number; completedJobs: number;
  rejectionRate: number; avgScore: number; stageBottleneck: FabricationStage | null;
} {
  const all = Array.from(jobs.values());
  const completed = all.filter(j => j.status === 'completed');

  // Find bottleneck: stage with most rejections
  const rejectionsByStage: Record<string, number> = {};
  for (const j of all) {
    for (const r of j.stageResults) {
      if (!r.passed) rejectionsByStage[r.stage] = (rejectionsByStage[r.stage] ?? 0) + 1;
    }
  }
  let bottleneck: FabricationStage | null = null;
  let maxRejections = 0;
  for (const [stage, count] of Object.entries(rejectionsByStage)) {
    if (count > maxRejections) { maxRejections = count; bottleneck = stage as FabricationStage; }
  }

  return {
    totalJobs,
    activeJobs: all.filter(j => j.status === 'active').length,
    completedJobs: completed.length,
    rejectionRate: totalJobs > 0 ? Math.round((totalRejections / totalJobs) * 1000) / 1000 : 0,
    avgScore: completed.length > 0 ? Math.round(completed.reduce((s, j) => s + j.overallScore, 0) / completed.length) : 0,
    stageBottleneck: bottleneck,
  };
}

export function getStageOrder(): FabricationStage[] { return [...STAGE_ORDER]; }

export function resetFabricationState(): void { jobs.clear(); idCounter = 0; totalJobs = 0; totalRejections = 0; }
