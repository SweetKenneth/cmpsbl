/**
 * Original Modules Retrofit — Unified Hardening for the 26 Matrix Nodes
 * 
 * Additively installs the createModuleHardening wrapper on every original
 * substrate node. This is NON-BREAKING — it does NOT modify any module
 * internals. It simply registers each module in the hardening registry
 * so they gain: shadow mode, state snapshots, auto-restore, rate limiting,
 * bulkhead isolation, DLQ, degraded mode, and hot-swap orchestration.
 * 
 * Safe under the Core Freeze because:
 * - No existing files are modified
 * - The hardening factory is idempotent (returns existing if already registered)
 * - All operations are additive wrappers
 * 
 * Call `retrofitOriginalModules()` once during substrate boot, after
 * the core init sequence has completed.
 */

import { createModuleHardening, type ModuleHardening } from './index';

// ═══════════════════════════════════════════════════════════════════
// Per-Module Tuning Profiles
// ═══════════════════════════════════════════════════════════════════
// Each module gets tuned parameters based on its operational profile:
//   - maxConcurrent: bulkhead slot cap
//   - rateLimit: token bucket (calls/sec)
//   - healthThreshold: auto-restore triggers below this score

interface ModuleHardeningProfile {
  name: string;
  maxConcurrent: number;
  rateLimit: number;
  healthThreshold: number;
}

const ORIGINAL_MODULE_PROFILES: ModuleHardeningProfile[] = [
  // ── Spine (critical path — conservative limits) ─────────────
  { name: 'core',          maxConcurrent: 5,   rateLimit: 50,   healthThreshold: 50 },
  { name: 'system',        maxConcurrent: 5,   rateLimit: 50,   healthThreshold: 50 },
  { name: 'brain',         maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 40 },
  { name: 'dream',         maxConcurrent: 4,   rateLimit: 30,   healthThreshold: 35 },

  // ── OCG (operational compliance — moderate throughput) ──────
  { name: 'ripple',        maxConcurrent: 15,  rateLimit: 200,  healthThreshold: 40 },
  { name: 'access',        maxConcurrent: 10,  rateLimit: 100,  healthThreshold: 45 },
  { name: 'defense',       maxConcurrent: 12,  rateLimit: 150,  healthThreshold: 50 },

  // ── Execution Layer (high-throughput) ──────────────────────
  { name: 'nexus',         maxConcurrent: 20,  rateLimit: 300,  healthThreshold: 40 },
  { name: 'decode',        maxConcurrent: 15,  rateLimit: 200,  healthThreshold: 40 },
  { name: 'encode',        maxConcurrent: 10,  rateLimit: 100,  healthThreshold: 40 },
  { name: 'vision',        maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 35 },
  { name: 'cortex',        maxConcurrent: 10,  rateLimit: 120,  healthThreshold: 40 },
  { name: 'inclusive',     maxConcurrent: 6,   rateLimit: 60,   healthThreshold: 35 },
  { name: 'integration',   maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 35 },
  { name: 'modernizer',    maxConcurrent: 6,   rateLimit: 50,   healthThreshold: 35 },
  { name: 'medic',         maxConcurrent: 5,   rateLimit: 40,   healthThreshold: 50 },
  { name: 'nerve',         maxConcurrent: 10,  rateLimit: 100,  healthThreshold: 40 },

  // ── Fields / Planes (supervisory — lower throughput) ───────
  { name: 'governance',    maxConcurrent: 6,   rateLimit: 50,   healthThreshold: 50 },
  { name: 'observability', maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 35 },
  { name: 'analytics',     maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 35 },

  // ── Infrastructure Nodes ──────────────────────────────────
  { name: 'audit',         maxConcurrent: 10,  rateLimit: 100,  healthThreshold: 45 },
  { name: 'relay',         maxConcurrent: 12,  rateLimit: 150,  healthThreshold: 40 },
  { name: 'sandbox',       maxConcurrent: 4,   rateLimit: 30,   healthThreshold: 35 },
  { name: 'memory',        maxConcurrent: 10,  rateLimit: 100,  healthThreshold: 40 },
  { name: 'economy',       maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 40 },
  { name: 'identity',      maxConcurrent: 8,   rateLimit: 80,   healthThreshold: 45 },
];

// ═══════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════

const retrofitted = new Map<string, ModuleHardening>();
let retrofitComplete = false;

/**
 * Install the unified hardening wrapper on all 26 original matrix nodes.
 * Idempotent — safe to call multiple times.
 * Returns a map of module name → ModuleHardening instance.
 */
export function retrofitOriginalModules(): Map<string, ModuleHardening> {
  if (retrofitComplete) return retrofitted;

  for (const profile of ORIGINAL_MODULE_PROFILES) {
    const hardening = createModuleHardening(profile.name, {
      maxConcurrent: profile.maxConcurrent,
      rateLimit: profile.rateLimit,
      healthThreshold: profile.healthThreshold,
    });
    retrofitted.set(profile.name, hardening);
  }

  retrofitComplete = true;
  return retrofitted;
}

/**
 * Get a hardening instance for a specific original module.
 */
export function getOriginalModuleHardening(module: string): ModuleHardening | undefined {
  return retrofitted.get(module);
}

/**
 * Check if all original modules have been retrofitted.
 */
export function isRetrofitComplete(): boolean {
  return retrofitComplete;
}

/**
 * Get the tuning profile for a specific module.
 */
export function getModuleProfile(module: string): ModuleHardeningProfile | undefined {
  return ORIGINAL_MODULE_PROFILES.find(p => p.name === module);
}

/**
 * Get all module profiles (for observability dashboards).
 */
export function getAllModuleProfiles(): ModuleHardeningProfile[] {
  return [...ORIGINAL_MODULE_PROFILES];
}

/**
 * Get a summary of the retrofit state.
 */
export function getRetrofitSummary(): {
  complete: boolean;
  totalModules: number;
  retrofittedCount: number;
  modules: Array<{ name: string; hardened: boolean; profile: ModuleHardeningProfile }>;
} {
  return {
    complete: retrofitComplete,
    totalModules: ORIGINAL_MODULE_PROFILES.length,
    retrofittedCount: retrofitted.size,
    modules: ORIGINAL_MODULE_PROFILES.map(p => ({
      name: p.name,
      hardened: retrofitted.has(p.name),
      profile: p,
    })),
  };
}

/**
 * Tear down all retrofit hardening (for testing/cleanup).
 */
export function teardownRetrofit(): void {
  for (const [, hardening] of retrofitted) {
    hardening.destroy();
  }
  retrofitted.clear();
  retrofitComplete = false;
}
