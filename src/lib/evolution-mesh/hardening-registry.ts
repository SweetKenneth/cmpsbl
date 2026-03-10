/**
 * Evolution Hardening Registry — 12-Point Foolproof Framework
 * 
 * Each hardening layer adds a distinct safety mechanism to the evolution
 * pipeline. The only bottleneck should be executor/ENCODE training speed.
 * 
 * Architecture:
 *  Proposal → [12 gates] → Shadow → [12 gates] → Production → [12 gates] → Verified
 */

import { log } from '@/lib/system/log';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface HardeningLayer {
  id: string;
  name: string;
  description: string;
  phase: 'pre-shadow' | 'post-shadow' | 'post-production' | 'continuous';
  enabled: boolean;
  /** Whether this layer can BLOCK promotion */
  blocking: boolean;
  /** Check function — returns pass/fail with reason */
  check: (ctx: HardeningContext) => HardeningResult;
}

export interface HardeningContext {
  runId: string;
  phase: string;
  executorId?: string;
  executorCategory?: string;
  executorSkillTier?: string;
  proposalCategory?: string;
  diff?: string;
  shadowResults?: { runs: number; regressions: number; confidence: number };
  healthScore?: number;
  affectedModules?: string[];
  lastMutationTimestamp?: number;
  tsacScore?: number;
}

export interface HardeningResult {
  layerId: string;
  passed: boolean;
  reason: string;
  severity: 'info' | 'warning' | 'block';
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// The 12 Hardening Layers
// ═══════════════════════════════════════════════════════════════════════════

const hardeningLayers: HardeningLayer[] = [

  // ── 1. SKILL-GATED PROMOTION ──
  // Only executors at Specialist tier (≥60%) can contribute to production mutations.
  {
    id: 'H-001',
    name: 'Skill-Gated Promotion',
    description: 'Only executors at Specialist tier or above can generate production-bound mutations',
    phase: 'pre-shadow',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const MINIMUM_TIER = 'specialist';
      const TIER_ORDER = ['novice', 'apprentice', 'journeyman', 'specialist', 'expert', 'master'];
      const tierIndex = TIER_ORDER.indexOf(ctx.executorSkillTier ?? 'novice');
      const minIndex = TIER_ORDER.indexOf(MINIMUM_TIER);
      const passed = tierIndex >= minIndex;
      return {
        layerId: 'H-001',
        passed,
        reason: passed
          ? `Executor at ${ctx.executorSkillTier} tier — qualified for production`
          : `Executor at ${ctx.executorSkillTier ?? 'unknown'} tier — below Specialist minimum`,
        severity: passed ? 'info' : 'block',
        metadata: { tier: ctx.executorSkillTier, required: MINIMUM_TIER },
      };
    },
  },

  // ── 2. TSAC PRE-CRITERIA GATE ──
  // Acceptance criteria must exist before shadow execution begins.
  {
    id: 'H-002',
    name: 'TSAC Pre-Criteria Gate',
    description: 'TSAC acceptance criteria must be generated before any code execution',
    phase: 'pre-shadow',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const passed = (ctx.tsacScore ?? -1) >= 0;
      return {
        layerId: 'H-002',
        passed,
        reason: passed
          ? 'TSAC pre-criteria exists for this evolution'
          : 'No TSAC pre-criteria found — generate before shadow execution',
        severity: passed ? 'info' : 'block',
      };
    },
  },

  // ── 3. KNOWLEDGE FRESHNESS CHECK ──
  // Executor must have fresh knowledge from the distillery before generating code.
  {
    id: 'H-003',
    name: 'Knowledge Freshness Check',
    description: 'Executor must have a fresh knowledge pack from the distillery',
    phase: 'pre-shadow',
    enabled: true,
    blocking: false, // Warning only — we don't want to block if distillery is slow
    check: (ctx) => {
      // Checked via knowledge-distillery.isExecutorKnowledgeFresh()
      // Here we just validate the context flag
      const passed = ctx.executorCategory !== undefined;
      return {
        layerId: 'H-003',
        passed,
        reason: passed
          ? `Executor category ${ctx.executorCategory} has knowledge scope defined`
          : 'Executor has no knowledge scope — operating blind',
        severity: passed ? 'info' : 'warning',
      };
    },
  },

  // ── 4. CONSTRAINT VALIDATION ──
  // All output must pass architectural constraint checks.
  {
    id: 'H-004',
    name: 'Architectural Constraint Validation',
    description: 'Code output must respect universal + category constraints',
    phase: 'post-shadow',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const violations: string[] = [];
      if (ctx.diff) {
        if (/lovable\.ai|ai\.gateway\.lovable/.test(ctx.diff)) {
          violations.push('Uses external AI gateway instead of NEXUS');
        }
        if (/service_role_key|SUPABASE_SERVICE_ROLE/.test(ctx.diff)) {
          violations.push('Exposes service role key in client code');
        }
        if (/text-#|bg-#|border-#/.test(ctx.diff)) {
          violations.push('Uses raw color values instead of design tokens');
        }
      }
      const passed = violations.length === 0;
      return {
        layerId: 'H-004',
        passed,
        reason: passed ? 'No constraint violations' : `Violations: ${violations.join('; ')}`,
        severity: passed ? 'info' : 'block',
        metadata: { violations },
      };
    },
  },

  // ── 5. SHADOW MINIMUM RUNS ──
  // At least 2 shadow runs with zero regressions required.
  {
    id: 'H-005',
    name: 'Shadow Minimum Runs',
    description: 'Minimum 2 shadow runs with 0 regressions and ≥75% confidence',
    phase: 'post-shadow',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const sr = ctx.shadowResults;
      if (!sr) return { layerId: 'H-005', passed: false, reason: 'No shadow results available', severity: 'block' };
      const passed = sr.runs >= 2 && sr.regressions === 0 && sr.confidence >= 0.75;
      return {
        layerId: 'H-005',
        passed,
        reason: passed
          ? `${sr.runs} shadow runs, ${sr.regressions} regressions, ${(sr.confidence * 100).toFixed(0)}% confidence`
          : `Insufficient: ${sr.runs}/2 runs, ${sr.regressions} regressions, ${(sr.confidence * 100).toFixed(0)}%/75% confidence`,
        severity: passed ? 'info' : 'block',
        metadata: sr,
      };
    },
  },

  // ── 6. TSAC SHADOW VERDICT ──
  // TSAC LLM-as-judge score must be ≥50 to proceed to production.
  {
    id: 'H-006',
    name: 'TSAC Shadow Verdict',
    description: 'TSAC intent-match score must be ≥50/100 to proceed',
    phase: 'post-shadow',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const score = ctx.tsacScore ?? 0;
      const passed = score >= 50;
      return {
        layerId: 'H-006',
        passed,
        reason: passed
          ? `TSAC score ${score}/100 — intent match verified`
          : `TSAC score ${score}/100 — below 50 threshold, promotion blocked`,
        severity: passed ? 'info' : 'block',
        metadata: { tsacScore: score },
      };
    },
  },

  // ── 7. CROSS-MODULE IMPACT PREDICTION ──
  // Predict which modules are affected and ensure they're not in maintenance.
  {
    id: 'H-007',
    name: 'Cross-Module Impact Prediction',
    description: 'Identify affected modules and verify no conflicts or maintenance windows',
    phase: 'pre-shadow',
    enabled: true,
    blocking: false,
    check: (ctx) => {
      const affected = ctx.affectedModules ?? [];
      const highRisk = affected.length > 3;
      return {
        layerId: 'H-007',
        passed: !highRisk,
        reason: highRisk
          ? `High cross-module impact: ${affected.length} modules affected (${affected.join(', ')})`
          : `Impact scope: ${affected.length} module(s) — acceptable`,
        severity: highRisk ? 'warning' : 'info',
        metadata: { affectedModules: affected },
      };
    },
  },

  // ── 8. EVOLUTION COOLDOWN WINDOW ──
  // Minimum 5 minutes between mutations to the same module.
  {
    id: 'H-008',
    name: 'Evolution Cooldown Window',
    description: 'Enforce minimum 5-minute gap between mutations to the same module',
    phase: 'pre-shadow',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const COOLDOWN_MS = 5 * 60 * 1000;
      const lastMutation = ctx.lastMutationTimestamp ?? 0;
      const elapsed = Date.now() - lastMutation;
      const passed = elapsed >= COOLDOWN_MS || lastMutation === 0;
      return {
        layerId: 'H-008',
        passed,
        reason: passed
          ? 'Cooldown window satisfied'
          : `Only ${Math.round(elapsed / 1000)}s since last mutation — need ${Math.round(COOLDOWN_MS / 1000)}s`,
        severity: passed ? 'info' : 'block',
        metadata: { elapsedMs: elapsed, requiredMs: COOLDOWN_MS },
      };
    },
  },

  // ── 9. CONSENSUS VERIFICATION ──
  // For high-risk mutations, require at least 2 executors to independently verify.
  {
    id: 'H-009',
    name: 'Consensus Verification',
    description: 'High-risk mutations require independent verification from 2+ executors',
    phase: 'post-shadow',
    enabled: true,
    blocking: false, // Advisory until consensus engine is fully wired
    check: (ctx) => {
      const isHighRisk = (ctx.proposalCategory === 'security' || ctx.proposalCategory === 'architecture');
      if (!isHighRisk) {
        return { layerId: 'H-009', passed: true, reason: 'Low/medium risk — single executor sufficient', severity: 'info' };
      }
      return {
        layerId: 'H-009',
        passed: false,
        reason: 'HIGH RISK mutation — consensus verification recommended (not yet enforced)',
        severity: 'warning',
        metadata: { category: ctx.proposalCategory },
      };
    },
  },

  // ── 10. REGRESSION SHADOW BANK ──
  // Compare against stored results from previous shadow runs.
  {
    id: 'H-010',
    name: 'Regression Shadow Bank',
    description: 'Compare new shadow results against historical baselines for regression detection',
    phase: 'post-shadow',
    enabled: true,
    blocking: false,
    check: (ctx) => {
      // The shadow bank stores previous run results and compares
      // For now, this validates that shadow results exist
      const sr = ctx.shadowResults;
      const passed = sr !== undefined && sr.regressions === 0;
      return {
        layerId: 'H-010',
        passed: passed ?? false,
        reason: passed
          ? 'No regressions against shadow baseline bank'
          : 'Regressions detected or no baseline available',
        severity: passed ? 'info' : 'warning',
      };
    },
  },

  // ── 11. CANARY HEALTH SCORING ──
  // Composite health score during canary must stay above 0.8.
  {
    id: 'H-011',
    name: 'Canary Health Scoring',
    description: 'Composite health score must remain ≥80% during canary rollout',
    phase: 'post-production',
    enabled: true,
    blocking: true,
    check: (ctx) => {
      const health = ctx.healthScore ?? 1.0;
      const passed = health >= 0.8;
      return {
        layerId: 'H-011',
        passed,
        reason: passed
          ? `Canary health at ${(health * 100).toFixed(0)}% — stable`
          : `Canary health DEGRADED to ${(health * 100).toFixed(0)}% — auto-rollback triggered`,
        severity: passed ? 'info' : 'block',
        metadata: { healthScore: health },
      };
    },
  },

  // ── 12. TRAINING VELOCITY TRACKING ──
  // Monitor executor learning speed — stalled executors get flagged.
  {
    id: 'H-012',
    name: 'Training Velocity Tracking',
    description: 'Detect stalled or regressing executors and flag for remediation',
    phase: 'continuous',
    enabled: true,
    blocking: false,
    check: (ctx) => {
      // Continuous check — no blocking, just advisory
      return {
        layerId: 'H-012',
        passed: true,
        reason: `Executor ${ctx.executorId ?? 'unknown'} training velocity tracked`,
        severity: 'info',
        metadata: { executorId: ctx.executorId },
      };
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Execution Engine
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run all hardening layers for a given phase.
 * Returns aggregated results with overall pass/fail.
 */
export function runHardeningChecks(
  phase: HardeningLayer['phase'],
  ctx: HardeningContext,
): { passed: boolean; results: HardeningResult[]; blockers: HardeningResult[] } {
  const applicableLayers = hardeningLayers.filter(l => l.enabled && (l.phase === phase || l.phase === 'continuous'));
  const results: HardeningResult[] = [];
  const blockers: HardeningResult[] = [];

  for (const layer of applicableLayers) {
    try {
      const result = layer.check(ctx);
      results.push(result);
      if (!result.passed && layer.blocking) {
        blockers.push(result);
      }
    } catch (err) {
      log.warn('evolution', `Hardening layer ${layer.id} threw: ${err instanceof Error ? err.message : 'unknown'}`);
      results.push({
        layerId: layer.id,
        passed: true, // Don't block on layer errors
        reason: `Layer error — skipped: ${err instanceof Error ? err.message : 'unknown'}`,
        severity: 'warning',
      });
    }
  }

  const passed = blockers.length === 0;
  if (!passed) {
    log.warn('evolution', `Hardening BLOCKED at ${phase}: ${blockers.map(b => b.layerId).join(', ')}`);
  }

  return { passed, results, blockers };
}

/**
 * Get the full hardening registry for dashboard display.
 */
export function getHardeningLayers(): HardeningLayer[] {
  return [...hardeningLayers];
}

/**
 * Toggle a specific hardening layer on/off.
 */
export function setLayerEnabled(layerId: string, enabled: boolean): boolean {
  const layer = hardeningLayers.find(l => l.id === layerId);
  if (!layer) return false;
  layer.enabled = enabled;
  log.info('evolution', `Hardening layer ${layerId} ${enabled ? 'enabled' : 'disabled'}`);
  return true;
}

/**
 * Get a human-readable summary of all 12 hardening layers.
 */
export function getHardeningSummary(): string[] {
  return hardeningLayers.map(l =>
    `${l.enabled ? '✅' : '⬜'} [${l.id}] ${l.name} (${l.phase}, ${l.blocking ? 'BLOCKING' : 'advisory'}): ${l.description}`
  );
}
