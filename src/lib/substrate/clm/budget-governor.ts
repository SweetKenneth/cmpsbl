/**
 * CLM Budget Governor
 * v6.7.0 — Tracks and enforces 70% daily Nexus budget allocation
 * 
 * Responsibilities:
 * - Track used/remaining budget units per day
 * - Enforce budget caps before job execution
 * - Handle backoff and error recovery
 * - Persist state across sessions
 */

import { supabase } from '@/integrations/supabase/client';
import {
  type CLMConfig,
  type BudgetState,
  type LearningJobResult,
  DEFAULT_CLM_CONFIG,
  isInQuietHours,
  calculateBackoffDelay,
  calculateJitteredDelay,
} from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'clm_budget_state';
const DAILY_NEXUS_LIMIT = 12352; // From nexus-routing.md total daily capacity

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET GOVERNOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class BudgetGovernorClient {
  private static instance: BudgetGovernorClient;
  private config: CLMConfig = DEFAULT_CLM_CONFIG;
  private state: BudgetState;
  private jobFingerprints: Map<string, number> = new Map();

  private constructor() {
    this.state = this.initializeState();
    this.loadPersistedState();
  }

  static getInstance(): BudgetGovernorClient {
    if (!BudgetGovernorClient.instance) {
      BudgetGovernorClient.instance = new BudgetGovernorClient();
    }
    return BudgetGovernorClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  private initializeState(): BudgetState {
    const today = new Date().toISOString().split('T')[0];
    const totalBudget = Math.floor(DAILY_NEXUS_LIMIT * this.config.dailyBudgetPct);

    return {
      dateKey: today,
      totalBudgetUnits: totalBudget,
      usedUnits: 0,
      remainingUnits: totalBudget,
      remainingPct: 1.0,
      nextAllowedAt: null,
      backoffLevel: 0,
      consecutiveFailures: 0,
      pausedDueToErrors: false,
      inQuietHours: false,
      microLearningMode: false,
    };
  }

  private loadPersistedState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const today = new Date().toISOString().split('T')[0];
          
          if (parsed.dateKey === today) {
            // Same day, restore state
            this.state = {
              ...this.state,
              ...parsed,
              nextAllowedAt: parsed.nextAllowedAt ? new Date(parsed.nextAllowedAt) : null,
            };
            this.recalculateRemainingBudget();
          }
          // Different day = fresh state (already initialized)
        }
      }
    } catch {
      // Use fresh state
    }
  }

  private persistState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...this.state,
          nextAllowedAt: this.state.nextAllowedAt?.toISOString() || null,
        }));
      }
    } catch {
      // Non-critical
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  setConfig(config: Partial<CLMConfig>): void {
    this.config = { ...this.config, ...config };
    this.state.totalBudgetUnits = Math.floor(DAILY_NEXUS_LIMIT * this.config.dailyBudgetPct);
    this.recalculateRemainingBudget();
    this.persistState();
  }

  getConfig(): CLMConfig {
    return { ...this.config };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if CLM can execute a job right now
   */
  canExecute(): { allowed: boolean; reason: string; waitMinutes?: number } {
    // Check kill switch first
    if (this.config.killSwitch) {
      return { allowed: false, reason: 'Kill switch is active' };
    }

    // Check if enabled
    if (!this.config.enabled) {
      return { allowed: false, reason: 'CLM is disabled' };
    }

    // Check for error pause
    if (this.state.pausedDueToErrors) {
      return { allowed: false, reason: 'Paused due to consecutive failures' };
    }

    // Reset state if new day
    this.checkDayRollover();

    // Check quiet hours
    if (isInQuietHours(this.config.quietHours)) {
      this.state.inQuietHours = true;
      return { allowed: false, reason: 'In quiet hours' };
    }
    this.state.inQuietHours = false;

    // Check budget
    if (this.state.remainingUnits <= 0) {
      return { allowed: false, reason: 'Daily budget exhausted' };
    }

    // Check timing
    if (this.state.nextAllowedAt && new Date() < this.state.nextAllowedAt) {
      const waitMs = this.state.nextAllowedAt.getTime() - Date.now();
      return {
        allowed: false,
        reason: 'Waiting for next allowed execution time',
        waitMinutes: Math.ceil(waitMs / 60000),
      };
    }

    // Check micro-learning mode
    if (this.state.remainingPct < this.config.microLearningThreshold) {
      this.state.microLearningMode = true;
    }

    return { allowed: true, reason: 'Ready to execute' };
  }

  /**
   * Request budget for a job (call before execution)
   */
  requestBudget(estimatedUnits: number): boolean {
    const check = this.canExecute();
    if (!check.allowed) {
      return false;
    }

    if (estimatedUnits > this.state.remainingUnits) {
      return false;
    }

    return true;
  }

  /**
   * Record job completion and update budget
   */
  recordJobCompletion(result: LearningJobResult): void {
    this.state.usedUnits += result.unitsUsed;
    this.recalculateRemainingBudget();

    if (result.success) {
      // Reset failure tracking on success
      this.state.consecutiveFailures = 0;
      this.state.backoffLevel = Math.max(0, this.state.backoffLevel - 1);
      this.state.pausedDueToErrors = false;

      // Schedule next job with jitter
      const delayMinutes = calculateJitteredDelay(
        this.config.minSpacingMinutes,
        this.config.jitterMinutes
      );
      this.state.nextAllowedAt = new Date(Date.now() + delayMinutes * 60000);
    } else {
      // Apply backoff on failure
      this.state.consecutiveFailures++;
      this.state.backoffLevel++;

      if (this.state.consecutiveFailures >= this.config.maxConsecutiveFailures) {
        this.state.pausedDueToErrors = true;
        this.emitAutoDisableEvent();
      }

      const backoffMinutes = calculateBackoffDelay(
        this.config.minSpacingMinutes,
        this.state.backoffLevel,
        this.config.errorBackoffMultiplier,
        this.config.maxBackoffMinutes
      );
      this.state.nextAllowedAt = new Date(Date.now() + backoffMinutes * 60000);
    }

    // Store job fingerprint
    if (result.topic) {
      this.jobFingerprints.set(
        this.createFingerprint(result.topic),
        Date.now() + this.config.jobFingerprintTTLHours * 3600000
      );
    }

    this.persistState();
    this.emitTelemetry(result);
  }

  /**
   * Check if topic was recently processed
   */
  isRecentlyProcessed(topic: string): boolean {
    const fingerprint = this.createFingerprint(topic);
    const expiry = this.jobFingerprints.get(fingerprint);
    
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.jobFingerprints.delete(fingerprint);
      return false;
    }
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE ACCESS
  // ═══════════════════════════════════════════════════════════════════════════

  getState(): BudgetState {
    this.checkDayRollover();
    return { ...this.state };
  }

  /**
   * Get tier limits (for tier command)
   */
  getTierLimits(): {
    tierName: string;
    dailyNexusLimit: number;
    clmBudgetUnits: number;
    clmBudgetPct: number;
    usedToday: number;
    remainingToday: number;
    remainingPct: number;
  } {
    this.checkDayRollover();
    return {
      tierName: 'standard', // Could be expanded for tier-based limits
      dailyNexusLimit: DAILY_NEXUS_LIMIT,
      clmBudgetUnits: this.state.totalBudgetUnits,
      clmBudgetPct: this.config.dailyBudgetPct,
      usedToday: this.state.usedUnits,
      remainingToday: this.state.remainingUnits,
      remainingPct: this.state.remainingPct,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enable/disable CLM
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled) {
      this.state.pausedDueToErrors = false;
      this.state.consecutiveFailures = 0;
      this.state.backoffLevel = 0;
    }
    this.persistState();
  }

  /**
   * Trigger kill switch
   */
  activateKillSwitch(): void {
    this.config.killSwitch = true;
    this.persistState();
  }

  /**
   * Deactivate kill switch
   */
  deactivateKillSwitch(): void {
    this.config.killSwitch = false;
    this.persistState();
  }

  /**
   * Reset budget counter (admin only)
   */
  resetBudgetCounter(): void {
    this.state = this.initializeState();
    this.jobFingerprints.clear();
    this.persistState();
  }

  /**
   * Clear error state and resume
   */
  resumeFromErrors(): void {
    this.state.pausedDueToErrors = false;
    this.state.consecutiveFailures = 0;
    this.state.backoffLevel = 0;
    this.state.nextAllowedAt = null;
    this.persistState();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private checkDayRollover(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.dateKey !== today) {
      // New day - reset state
      this.state = this.initializeState();
      this.jobFingerprints.clear();
      this.persistState();
    }
  }

  private recalculateRemainingBudget(): void {
    this.state.remainingUnits = Math.max(0, this.state.totalBudgetUnits - this.state.usedUnits);
    this.state.remainingPct = this.state.totalBudgetUnits > 0
      ? this.state.remainingUnits / this.state.totalBudgetUnits
      : 0;
    this.state.microLearningMode = this.state.remainingPct < this.config.microLearningThreshold;
  }

  private createFingerprint(topic: string): string {
    return `${this.state.dateKey}:${topic.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private async emitTelemetry(result: LearningJobResult): Promise<void> {
    try {
      await supabase.from('brain_events').insert({
        event_type: result.success ? 'clm_job_finished' : 'clm_job_failed',
        module: 'brain',
        data: {
          job_id: result.jobId,
          topic: result.topic,
          units_used: result.unitsUsed,
          duration_ms: result.durationMs,
          budget_remaining_pct: this.state.remainingPct,
          micro_learning_mode: this.state.microLearningMode,
        },
        outcome: result.success ? 'success' : 'failure',
      } as any);
    } catch {
      // Non-critical
    }
  }

  private async emitAutoDisableEvent(): Promise<void> {
    try {
      await supabase.from('brain_events').insert({
        event_type: 'clm_auto_disabled',
        module: 'brain',
        data: {
          consecutive_failures: this.state.consecutiveFailures,
          last_backoff_level: this.state.backoffLevel,
        },
        outcome: 'alert',
      } as any);
    } catch {
      // Non-critical
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const budgetGovernor = BudgetGovernorClient.getInstance();
export { BudgetGovernorClient };
