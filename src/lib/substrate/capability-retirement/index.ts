/**
 * Capability Auto-Retirement Engine — v1.0.0
 * 
 * Analytics-driven deprecation of unused capabilities.
 * Keeps the substrate lean by identifying dead weight and
 * recommending retirement with a governed approval flow.
 * 
 * Pipeline: Detect → Score → Propose Retirement → Review → Archive
 */

import { capabilityAnalytics, type CapabilityMetrics } from '../capability-analytics';
import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RetirementCandidate {
  capabilityId: string;
  module: string;
  reason: RetirementReason;
  daysSinceLastUse: number;
  totalCallsLifetime: number;
  successRate: number;
  retirementScore: number;         // 0-100, higher = stronger candidate
  estimatedSavings: string;        // Human-readable
  dependencies: string[];          // Other capabilities that depend on this one
  status: 'candidate' | 'proposed' | 'approved' | 'retired' | 'reprieved';
  proposedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export type RetirementReason =
  | 'zero_usage'            // Never called
  | 'abandoned'             // Not called in 30+ days
  | 'low_value'             // Very few calls + low success
  | 'superseded'            // Replaced by another capability
  | 'high_error_rate'       // >50% failure rate
  | 'duplicate';            // Functionally equivalent to another

export interface RetirementConfig {
  abandonedThresholdDays: number;    // Days without use = abandoned (default: 30)
  minCallsForValue: number;          // Below this = low value (default: 5)
  errorRateThreshold: number;        // Above this = high error (default: 50%)
  autoProposalEnabled: boolean;      // Auto-create proposals (default: true)
  scanIntervalHours: number;         // How often to scan (default: 24)
  protectedCapabilities: string[];   // Never retire these
}

export interface RetirementReport {
  timestamp: string;
  totalCapabilities: number;
  activeCapabilities: number;
  candidates: RetirementCandidate[];
  estimatedBloatReduction: number;   // Percentage
  healthImpact: string;              // 'positive' | 'neutral'
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'capability_retirement_state';
const DEFAULT_CONFIG: RetirementConfig = {
  abandonedThresholdDays: 30,
  minCallsForValue: 5,
  errorRateThreshold: 50,
  autoProposalEnabled: true,
  scanIntervalHours: 24,
  protectedCapabilities: [
    // Crown Jewels — never retire
    'cortex_engine', 'seba_engine', 'evolution',
    'evolution_ab', 'evolution_rollback', 'evolution_sandbox',
    'dream_pool_federation', 'self_repair_engine',
    'autonomous_workflow_composer', 'dream_lucidity_control',
    // Critical infrastructure
    'ripple_router', 'access_gate', 'brain_store', 'system_health',
  ],
};

// ═══════════════════════════════════════════════════════════════
// RETIREMENT ENGINE
// ═══════════════════════════════════════════════════════════════

class RetirementEngine {
  private static instance: RetirementEngine;
  private candidates: RetirementCandidate[] = [];
  private config: RetirementConfig;
  private lastScanAt: string | null = null;
  private loaded = false;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  static getInstance(): RetirementEngine {
    if (!RetirementEngine.instance) {
      RetirementEngine.instance = new RetirementEngine();
    }
    return RetirementEngine.instance;
  }

  // ─── SCAN ───────────────────────────────────────────────────

  /**
   * Scan all capabilities and identify retirement candidates
   */
  scan(allCapabilityIds?: string[]): RetirementReport {
    this.ensureLoaded();

    const analytics = capabilityAnalytics.summary(this.config.abandonedThresholdDays * 24);
    const now = Date.now();
    const newCandidates: RetirementCandidate[] = [];

    // Get all metrics
    const capIds = allCapabilityIds || [
      ...analytics.topCapabilities.map(c => c.capabilityId),
      ...analytics.bottomCapabilities.map(c => c.capabilityId),
    ];

    const uniqueIds = [...new Set(capIds)];

    for (const capId of uniqueIds) {
      // Skip protected
      if (this.config.protectedCapabilities.includes(capId)) continue;

      // Skip already retired
      if (this.candidates.find(c => c.capabilityId === capId && c.status === 'retired')) continue;

      const metrics = capabilityAnalytics.getMetrics(capId, this.config.abandonedThresholdDays * 24);
      const candidate = this.evaluateForRetirement(capId, metrics, now);
      if (candidate) newCandidates.push(candidate);
    }

    // Merge with existing candidates
    for (const nc of newCandidates) {
      const existing = this.candidates.findIndex(c => c.capabilityId === nc.capabilityId);
      if (existing >= 0) {
        // Update score but keep status
        this.candidates[existing].retirementScore = nc.retirementScore;
        this.candidates[existing].daysSinceLastUse = nc.daysSinceLastUse;
        this.candidates[existing].reason = nc.reason;
      } else {
        this.candidates.push(nc);
      }
    }

    this.lastScanAt = new Date().toISOString();
    this.persist();

    const activeCandidates = this.candidates.filter(c => c.status === 'candidate' || c.status === 'proposed');

    return {
      timestamp: this.lastScanAt,
      totalCapabilities: uniqueIds.length,
      activeCapabilities: uniqueIds.length - activeCandidates.length,
      candidates: activeCandidates,
      estimatedBloatReduction: uniqueIds.length > 0
        ? Math.round((activeCandidates.length / uniqueIds.length) * 100)
        : 0,
      healthImpact: activeCandidates.length > 0 ? 'positive' : 'neutral',
    };
  }

  // ─── EVALUATE ───────────────────────────────────────────────

  private evaluateForRetirement(
    capId: string, 
    metrics: CapabilityMetrics, 
    now: number
  ): RetirementCandidate | null {
    let reason: RetirementReason | null = null;
    let score = 0;

    // Zero usage
    if (metrics.totalCalls === 0) {
      reason = 'zero_usage';
      score = 90;
    }
    // Abandoned (no calls in threshold period)
    else if (metrics.trend === 'dead' || metrics.trend === 'declining') {
      const daysSinceLast = metrics.lastCalledAt 
        ? (now - metrics.lastCalledAt) / 86400_000 
        : this.config.abandonedThresholdDays;
      
      if (daysSinceLast >= this.config.abandonedThresholdDays) {
        reason = 'abandoned';
        score = Math.min(85, 50 + daysSinceLast);
      }
    }
    // High error rate
    if (!reason && metrics.successRate < (100 - this.config.errorRateThreshold)) {
      reason = 'high_error_rate';
      score = Math.min(80, 40 + (100 - metrics.successRate));
    }
    // Low value
    if (!reason && metrics.totalCalls < this.config.minCallsForValue && metrics.totalCalls > 0) {
      reason = 'low_value';
      score = 30 + (this.config.minCallsForValue - metrics.totalCalls) * 5;
    }

    if (!reason) return null;

    const daysSinceLastUse = metrics.lastCalledAt
      ? Math.round((now - metrics.lastCalledAt) / 86400_000)
      : 999;

    return {
      capabilityId: capId,
      module: metrics.module || 'unknown',
      reason,
      daysSinceLastUse,
      totalCallsLifetime: metrics.totalCalls,
      successRate: metrics.successRate,
      retirementScore: Math.min(100, Math.max(0, score)),
      estimatedSavings: this.estimateSavings(metrics),
      dependencies: [], // Would be populated by dependency graph analysis
      status: this.config.autoProposalEnabled ? 'proposed' : 'candidate',
      proposedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: null,
    };
  }

  private estimateSavings(metrics: CapabilityMetrics): string {
    if (metrics.totalCalls === 0) return 'Registry cleanup + reduced boot surface';
    if (metrics.avgDurationMs > 1000) return `~${metrics.avgDurationMs}ms per call recovered`;
    return 'Minor registry footprint reduction';
  }

  // ─── ACTIONS ────────────────────────────────────────────────

  approve(capabilityId: string, note?: string): RetirementCandidate | null {
    this.ensureLoaded();
    const c = this.candidates.find(c => c.capabilityId === capabilityId);
    if (!c || (c.status !== 'proposed' && c.status !== 'candidate')) return null;

    c.status = 'approved';
    c.reviewedAt = new Date().toISOString();
    c.reviewNote = note || 'Approved for retirement';
    this.persist();
    return c;
  }

  retire(capabilityId: string): RetirementCandidate | null {
    this.ensureLoaded();
    const c = this.candidates.find(c => c.capabilityId === capabilityId);
    if (!c || c.status !== 'approved') return null;

    c.status = 'retired';
    c.reviewedAt = new Date().toISOString();
    this.persist();

    // Log retirement event
    supabase.from('brain_events').insert({
      module: 'system',
      event_type: 'capability_retired',
      data: {
        capability_id: capabilityId,
        reason: c.reason,
        retirement_score: c.retirementScore,
      },
    }).then(() => {});

    console.log(`[Retirement] 🪦 Capability \"${capabilityId}\" retired (${c.reason})`);
    return c;
  }

  reprieve(capabilityId: string, note: string): RetirementCandidate | null {
    this.ensureLoaded();
    const c = this.candidates.find(c => c.capabilityId === capabilityId);
    if (!c) return null;

    c.status = 'reprieved';
    c.reviewedAt = new Date().toISOString();
    c.reviewNote = note;
    this.persist();
    return c;
  }

  // ─── QUERIES ────────────────────────────────────────────────

  getCandidates(): RetirementCandidate[] {
    this.ensureLoaded();
    return this.candidates.filter(c => c.status === 'candidate' || c.status === 'proposed');
  }

  getRetired(): RetirementCandidate[] {
    this.ensureLoaded();
    return this.candidates.filter(c => c.status === 'retired');
  }

  getAll(): RetirementCandidate[] {
    this.ensureLoaded();
    return [...this.candidates];
  }

  // ─── PERSISTENCE ────────────────────────────────────────────

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const state = secureGet<{ candidates: typeof this.candidates; lastScanAt: string | null }>(STORAGE_KEY);
      if (state) {
        this.candidates = state.candidates || [];
        this.lastScanAt = state.lastScanAt || null;
      }
    } catch { this.candidates = []; }
  }

  private persist(): void {
    try {
      secureSet(STORAGE_KEY, {
        candidates: this.candidates.slice(-200),
        lastScanAt: this.lastScanAt,
      });
    } catch { /* Storage pressure — non-critical retirement data */ }
  }
}

export const retirementEngine = RetirementEngine.getInstance();
