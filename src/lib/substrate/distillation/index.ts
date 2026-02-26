/**
 * Knowledge Distillation — Substrate Types & Interfaces
 * 
 * Three distillation techniques:
 *   1. Memory Crystallization — Compress memory clusters into dense knowledge crystals
 *   2. Teacher-Student Routing — Pro-model reasoning traces → fast-model patterns
 *   3. Cross-Module Transfer — Domain-specific → generalized heuristics
 * 
 * Budget: 1,500 AI calls/day (moderate allocation)
 * 
 * @module substrate/distillation
 * @version 1.0.0
 */

// ─── Knowledge Crystal ─────────────────────────────────────────────

export interface KnowledgeCrystal {
  id: string;
  crystalType: 'memory_cluster' | 'reasoning_chain' | 'pattern_synthesis';
  title: string;
  distilledContent: string;
  sourceMemoryIds: string[];
  sourceTier: 'hot' | 'warm' | 'cold';
  sourceModule: string;
  sourceCount: number;
  compressionRatio: number;
  confidence: number;
  teacherModel: string;
  studentModel: string;
  reasoningTrace?: string;
  domain: string;
  tags: string[];
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

// ─── Reasoning Trace ────────────────────────────────────────────────

export interface ReasoningTrace {
  id: string;
  traceType: 'reasoning_chain' | 'decision_tree' | 'pattern_match';
  domain: string;
  module: string;
  teacherModel: string;
  studentModel: string;
  prompt: string;
  teacherResponse: string;
  distilledPattern: string;
  patternConfidence: number;
  tokenSavingsPct: number;
  appliedCount: number;
  lastAppliedAt?: string;
  createdAt: string;
}

// ─── Transfer Heuristic ─────────────────────────────────────────────

export interface TransferHeuristic {
  id: string;
  sourceModule: string;
  targetModules: string[];
  heuristicName: string;
  heuristicContent: string;
  generalizationScore: number;
  applicabilityDomains: string[];
  confidence: number;
  teacherModel: string;
  appliedCount: number;
  successRate: number;
  lastAppliedAt?: string;
  createdAt: string;
}

// ─── Distillation Run ───────────────────────────────────────────────

export interface DistillationRun {
  id: string;
  runType: 'crystallization' | 'teacher_student' | 'cross_module';
  status: 'running' | 'complete' | 'failed' | 'skipped';
  callsUsed: number;
  crystalsCreated: number;
  heuristicsCreated: number;
  tracesCreated: number;
  memoriesProcessed: number;
  compressionRatioAvg: number;
  confidenceAvg: number;
  errorMessage?: string;
  durationMs: number;
  createdAt: string;
  completedAt?: string;
}

// ─── Budget ─────────────────────────────────────────────────────────

export const DISTILLATION_BUDGET = {
  crystallization: 600,
  teacher_student: 500,
  cross_module: 400,
  total: 1500,
} as const;

export interface DistillationStatus {
  version: string;
  budget: typeof DISTILLATION_BUDGET;
  usedToday: Record<string, number>;
  totalUsed: number;
  remaining: number;
  pctUsed: number;
}

// ─── Technique Descriptions ─────────────────────────────────────────

export const DISTILLATION_TECHNIQUES = [
  {
    id: 'crystallization',
    name: 'Memory Crystallization',
    description: 'Clusters related memories and distills them via teacher model into dense knowledge crystals',
    budgetPct: 40,
    teacherModel: 'google/gemini-2.5-pro',
    studentModel: 'google/gemini-2.5-flash-lite',
  },
  {
    id: 'teacher_student',
    name: 'Teacher-Student Routing',
    description: 'Pro model generates reasoning traces, distilled into compact patterns for fast models',
    budgetPct: 33,
    teacherModel: 'google/gemini-2.5-pro',
    studentModel: 'google/gemini-2.5-flash-lite',
  },
  {
    id: 'cross_module',
    name: 'Cross-Module Transfer',
    description: 'Distills domain-specific learnings into generalized heuristics shared across modules',
    budgetPct: 27,
    teacherModel: 'google/gemini-2.5-pro',
    studentModel: 'google/gemini-2.5-flash-lite',
  },
] as const;
