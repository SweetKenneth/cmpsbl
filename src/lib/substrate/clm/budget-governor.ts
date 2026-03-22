/**
 * CLM Budget Governor
 * Dynamic allocation via NEXUS 4-hour cycles
 * 
 * No longer uses hardcoded percentage. Budget comes from NEXUS cycle allocator.
 */

import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';
import { getCurrentAllocation } from '@/lib/substrate/adaptive-budget';
import {
  type CLMConfig,
  type BudgetState,
  type LearningJobResult,
  DEFAULT_CLM_CONFIG,
  DISCOVERY_CLM_OVERRIDES,
  isInQuietHours,
  calculateBackoffDelay,
  calculateJitteredDelay,
} from './config';

const STORAGE_KEY = 'clm_budget_state';

class BudgetGovernorClient {
  private static instance: BudgetGovernorClient;
  private config: CLMConfig = DEFAULT_CLM_CONFIG;
  private state: BudgetState;
  private jobFingerprints: Map<string, number> = new Map();

  private constructor() {
    this.state = this.initializeState();
    this.loadPersistedState();
    // Start dynamic budget sync
    this.syncFromNexus();
  }

  static getInstance(): BudgetGovernorClient {
    if (!BudgetGovernorClient.instance) {
      BudgetGovernorClient.instance = new BudgetGovernorClient();
    }
    return BudgetGovernorClient.instance;
  }

  /**
   * Sync budget from NEXUS hourly optimizer (reads nexus_clm_budget from system_flags)
   * Falls back to adaptive-budget cycle allocator if no optimizer data available
   */
  private async syncFromNexus(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (this.state.dateKey !== today) {
        this.state = this.initializeState();
      }

      // Try reading the hourly-optimized budget from system_flags first
      const { data: flag } = await supabase
        .from('system_flags')
        .select('value, updated_at')
        .eq('key', 'nexus_clm_budget')
        .maybeSingle();

      if (flag?.value) {
        try {
          const budget = JSON.parse(flag.value);
          // Use the optimizer's hourly calculation if fresh (< 2 hours old)
          const updatedAt = new Date(budget.updated_at || flag.updated_at);
          const ageMs = Date.now() - updatedAt.getTime();
          const TWO_HOURS = 2 * 60 * 60 * 1000;

          if (ageMs < TWO_HOURS && budget.calls_per_hour > 0) {
            // Optimizer provides calls_per_hour — convert to remaining budget units
            const hoursRemaining = budget.hours_remaining || 1;
            this.state.totalBudgetUnits = budget.calls_per_hour * hoursRemaining;
            this.recalculateRemainingBudget();
            
            // Apply discovery overrides if optimizer reports discovery phase
            if (budget.phase === 'discovery') {
              this.config = { ...this.config, ...DISCOVERY_CLM_OVERRIDES };
            } else if (this.config.minSpacingMinutes < DEFAULT_CLM_CONFIG.minSpacingMinutes) {
              // Revert to production defaults when discovery is over
              this.config = { ...DEFAULT_CLM_CONFIG };
            }
            
            this.persistState();
            return;
          }
        } catch { /* Invalid JSON — fall through to adaptive-budget */ }
      }

      // Fallback: use the 4-hour adaptive-budget cycle allocator
      const allocation = await getCurrentAllocation();
      this.state.totalBudgetUnits = allocation.perEntityAllocation;
      this.recalculateRemainingBudget();
      this.persistState();
    } catch {
      // Keep existing budget on sync failure
    }
  }

  private initializeState(): BudgetState {
    const today = new Date().toISOString().split('T')[0];
    return {
      dateKey: today,
      totalBudgetUnits: 0, // Will be set by NEXUS sync
      usedUnits: 0,
      remainingUnits: 0,
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
      const parsed = secureGet<Record<string, unknown>>(STORAGE_KEY);
      if (parsed) {
        const today = new Date().toISOString().split('T')[0];
        if (parsed.dateKey === today) {
          this.state = {
            ...this.state,
            ...(parsed as unknown as typeof this.state),
            nextAllowedAt: parsed.nextAllowedAt ? new Date(parsed.nextAllowedAt as string) : null,
          };
          this.recalculateRemainingBudget();
        }
      }
    } catch { /* Use fresh state — non-critical */ }
  }

  private persistState(): void {
    try {
      secureSet(STORAGE_KEY, {
        ...this.state,
        nextAllowedAt: this.state.nextAllowedAt?.toISOString() || null,
      });
    } catch { /* Non-critical: budget resets daily */ }
  }

  setConfig(config: Partial<CLMConfig>): void {
    this.config = { ...this.config, ...config };
    this.persistState();
  }

  getConfig(): CLMConfig {
    return { ...this.config };
  }

  canExecute(): { allowed: boolean; reason: string; waitMinutes?: number } {
    if (this.config.killSwitch) return { allowed: false, reason: 'Kill switch is active' };
    if (!this.config.enabled) return { allowed: false, reason: 'CLM is disabled' };
    if (this.state.pausedDueToErrors) return { allowed: false, reason: 'Paused due to consecutive failures' };

    this.checkDayRollover();

    if (isInQuietHours(this.config.quietHours)) {
      this.state.inQuietHours = true;
      return { allowed: false, reason: 'In quiet hours' };
    }
    this.state.inQuietHours = false;

    if (this.state.remainingUnits <= 0) {
      return { allowed: false, reason: 'Cycle allocation exhausted — waiting for next 4-hour cycle' };
    }

    if (this.state.nextAllowedAt && new Date() < this.state.nextAllowedAt) {
      const waitMs = this.state.nextAllowedAt.getTime() - Date.now();
      return { allowed: false, reason: 'Waiting for next allowed execution time', waitMinutes: Math.ceil(waitMs / 60000) };
    }

    if (this.state.remainingPct < this.config.microLearningThreshold) {
      this.state.microLearningMode = true;
    }

    return { allowed: true, reason: 'Ready to execute' };
  }

  requestBudget(estimatedUnits: number): boolean {
    const check = this.canExecute();
    if (!check.allowed) return false;
    return estimatedUnits <= this.state.remainingUnits;
  }

  recordJobCompletion(result: LearningJobResult): void {
    this.state.usedUnits += result.unitsUsed;
    this.recalculateRemainingBudget();

    if (result.success) {
      this.state.consecutiveFailures = 0;
      this.state.backoffLevel = Math.max(0, this.state.backoffLevel - 1);
      this.state.pausedDueToErrors = false;
      const delayMinutes = calculateJitteredDelay(this.config.minSpacingMinutes, this.config.jitterMinutes);
      this.state.nextAllowedAt = new Date(Date.now() + delayMinutes * 60000);
    } else {
      this.state.consecutiveFailures++;
      this.state.backoffLevel++;
      if (this.state.consecutiveFailures >= this.config.maxConsecutiveFailures) {
        this.state.pausedDueToErrors = true;
        this.emitAutoDisableEvent();
      }
      const backoffMinutes = calculateBackoffDelay(
        this.config.minSpacingMinutes, this.state.backoffLevel,
        this.config.errorBackoffMultiplier, this.config.maxBackoffMinutes
      );
      this.state.nextAllowedAt = new Date(Date.now() + backoffMinutes * 60000);
    }

    if (result.topic) {
      this.jobFingerprints.set(this.createFingerprint(result.topic), Date.now() + this.config.jobFingerprintTTLHours * 3600000);
    }

    this.persistState();
    this.emitTelemetry(result);
  }

  isRecentlyProcessed(topic: string): boolean {
    const fingerprint = this.createFingerprint(topic);
    const expiry = this.jobFingerprints.get(fingerprint);
    if (!expiry) return false;
    if (Date.now() > expiry) { this.jobFingerprints.delete(fingerprint); return false; }
    return true;
  }

  getState(): BudgetState {
    this.checkDayRollover();
    return { ...this.state };
  }

  getStatus() {
    this.checkDayRollover();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return {
      daily_limit: this.state.totalBudgetUnits,
      used_today: this.state.usedUnits,
      remaining: this.state.remainingUnits,
      remaining_pct: this.state.remainingPct,
      calls_per_hour: 10,
      reset_time: tomorrow.toLocaleTimeString(),
      kill_switch: this.config.killSwitch,
      enabled: this.config.enabled,
    };
  }

  getTierLimits() {
    this.checkDayRollover();
    return {
      tierName: 'dynamic',
      dailyNexusLimit: 0, // Dynamic — set by NEXUS cycle
      clmBudgetUnits: this.state.totalBudgetUnits,
      clmBudgetPct: 0, // No longer percentage-based
      usedToday: this.state.usedUnits,
      remainingToday: this.state.remainingUnits,
      remainingPct: this.state.remainingPct,
    };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled) {
      this.state.pausedDueToErrors = false;
      this.state.consecutiveFailures = 0;
      this.state.backoffLevel = 0;
      this.syncFromNexus(); // Re-sync on enable
    }
    this.persistState();
  }

  activateKillSwitch(): void { this.config.killSwitch = true; this.persistState(); }
  deactivateKillSwitch(): void { this.config.killSwitch = false; this.persistState(); }

  resetBudgetCounter(): void {
    this.state = this.initializeState();
    this.jobFingerprints.clear();
    this.syncFromNexus();
    this.persistState();
  }

  resumeFromErrors(): void {
    this.state.pausedDueToErrors = false;
    this.state.consecutiveFailures = 0;
    this.state.backoffLevel = 0;
    this.state.nextAllowedAt = null;
    this.persistState();
  }

  private checkDayRollover(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.dateKey !== today) {
      this.state = this.initializeState();
      this.jobFingerprints.clear();
      this.syncFromNexus();
      this.persistState();
    }
  }

  private recalculateRemainingBudget(): void {
    this.state.remainingUnits = Math.max(0, this.state.totalBudgetUnits - this.state.usedUnits);
    this.state.remainingPct = this.state.totalBudgetUnits > 0
      ? this.state.remainingUnits / this.state.totalBudgetUnits : 0;
    this.state.microLearningMode = this.state.remainingPct < this.config.microLearningThreshold;
  }

  private createFingerprint(topic: string): string {
    return `${this.state.dateKey}:${topic.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private emitTelemetry(result: LearningJobResult): void {
    // Fire-and-forget — telemetry must never block CLM cycle
    supabase.from('brain_events').insert({
      event_type: result.success ? 'clm_job_finished' : 'clm_job_failed',
      module: 'brain',
      data: {
        job_id: result.jobId, topic: result.topic, units_used: result.unitsUsed,
        duration_ms: result.durationMs, budget_remaining_pct: this.state.remainingPct,
        micro_learning_mode: this.state.microLearningMode, allocation_source: 'nexus_dynamic',
      },
      outcome: result.success ? 'success' : 'failure',
    } as any).then(() => {}, () => {});
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
    } catch { /* Non-critical */ }
  }
}

export const budgetGovernor = BudgetGovernorClient.getInstance();
export { BudgetGovernorClient };
