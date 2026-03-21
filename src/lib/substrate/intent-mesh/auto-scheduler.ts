/**
 * Mesh Auto-Expansion Scheduler + CDM (Constant Discovery Mode)
 * 
 * Periodic discovery cycles that self-improve the manifest AND
 * run the reactor to feed both the S-Tier Vault (95+ CJPI) and
 * the Memory Stream (all accepted discoveries).
 * 
 * CDM runs the full reactor with 2-12 node depth chains on a
 * gentle 8-hour interval, producing real discoveries continuously.
 * 
 * Kill switch: Disabled when mesh is disabled
 * Dashboard: /os → Observe → Mesh Activity → Scheduler
 */

import { isMeshEnabled } from './toggle';
import { runDiscoveryCycle } from './discovery-engine';
import { runAllModuleDiscovery, persistProposals } from './module-discovery';
import { calculateIntentScores, getIntentLeaderboard } from './intent-scoring';
import { runCLMFeedbackLoop } from './clm-feedback';
import { runLiveGapExecution } from './live-gap-execution';
import { buildAffinityMatrix } from './affinity-matrix';
import { detectPatterns } from './pattern-recognition';
import { discoverCapabilities, getDiscoverySummary } from '../capability-discovery';

// ─── Types ───

export interface SchedulerConfig {
  moduleDiscoveryIntervalMs: number;
  gapAnalysisIntervalMs: number;
  intentScoringIntervalMs: number;
  fullExpansionIntervalMs: number;
  cdmReactorIntervalMs: number; // CDM — Constant Discovery Mode reactor cycle
  autoApplyThreshold: number; // confidence score above which proposals auto-apply
  maxProposalsPerCycle: number;
  enabled: boolean;
}

export interface SchedulerState {
  config: SchedulerConfig;
  isRunning: boolean;
  lastCdmReactor: string | null;
  lastModuleDiscovery: string | null;
  lastGapAnalysis: string | null;
  lastIntentScoring: string | null;
  lastFullExpansion: string | null;
  totalCyclesRun: number;
  totalProposalsGenerated: number;
  totalCapabilitiesExpanded: number;
}

interface SchedulerTimers {
  cdmReactor: ReturnType<typeof setInterval> | null;
  moduleDiscovery: ReturnType<typeof setInterval> | null;
  gapAnalysis: ReturnType<typeof setInterval> | null;
  intentScoring: ReturnType<typeof setInterval> | null;
  fullExpansion: ReturnType<typeof setInterval> | null;
}

// ─── Default Config ───

const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  moduleDiscoveryIntervalMs: 6 * 60 * 60 * 1000, // 6 hours — gentle continuous
  gapAnalysisIntervalMs: 4 * 60 * 60 * 1000, // 4 hours
  intentScoringIntervalMs: 2 * 60 * 60 * 1000, // 2 hours
  fullExpansionIntervalMs: 24 * 60 * 60 * 1000, // 24 hours
  cdmReactorIntervalMs: 8 * 60 * 60 * 1000, // 8 hours — CDM reactor cycle
  autoApplyThreshold: 0.85, // Only auto-apply very high confidence
  maxProposalsPerCycle: 10,
  enabled: true, // Always-on — Memory Stream watches continuously
};

// ─── Scheduler Singleton ───

class MeshAutoScheduler {
  private static instance: MeshAutoScheduler;
  private config: SchedulerConfig;
  private timers: SchedulerTimers = {
    cdmReactor: null,
    moduleDiscovery: null,
    gapAnalysis: null,
    intentScoring: null,
    fullExpansion: null,
  };
  private state: Omit<SchedulerState, 'config'> = {
    isRunning: false,
    lastCdmReactor: null,
    lastModuleDiscovery: null,
    lastGapAnalysis: null,
    lastIntentScoring: null,
    lastFullExpansion: null,
    totalCyclesRun: 0,
    totalProposalsGenerated: 0,
    totalCapabilitiesExpanded: 0,
  };

  private constructor() {
    this.config = { ...DEFAULT_SCHEDULER_CONFIG };
  }

  static getInstance(): MeshAutoScheduler {
    if (!MeshAutoScheduler.instance) {
      MeshAutoScheduler.instance = new MeshAutoScheduler();
    }
    return MeshAutoScheduler.instance;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.state.isRunning) return;
    this.config.enabled = true;
    this.state.isRunning = true;

    // Module self-discovery
    this.timers.moduleDiscovery = setInterval(async () => {
      try {
        if (!isMeshEnabled() || document.visibilityState === 'hidden') return;
        await this.runModuleDiscoveryCycle();
      } catch (err) {
        console.warn('[MeshScheduler] Unhandled error in module discovery interval:', err);
      }
    }, this.config.moduleDiscoveryIntervalMs);

    // Gap analysis
    this.timers.gapAnalysis = setInterval(async () => {
      try {
        if (!isMeshEnabled() || document.visibilityState === 'hidden') return;
        await this.runGapAnalysisCycle();
      } catch (err) {
        console.warn('[MeshScheduler] Unhandled error in gap analysis interval:', err);
      }
    }, this.config.gapAnalysisIntervalMs);

    // Intent scoring
    this.timers.intentScoring = setInterval(async () => {
      try {
        if (!isMeshEnabled() || document.visibilityState === 'hidden') return;
        await this.runIntentScoringCycle();
      } catch (err) {
        console.warn('[MeshScheduler] Unhandled error in intent scoring interval:', err);
      }
    }, this.config.intentScoringIntervalMs);

    // Full expansion
    this.timers.fullExpansion = setInterval(async () => {
      try {
        if (!isMeshEnabled() || document.visibilityState === 'hidden') return;
        await this.runFullExpansionCycle();
      } catch (err) {
        console.warn('[MeshScheduler] Unhandled error in full expansion interval:', err);
      }
    }, this.config.fullExpansionIntervalMs);

    // Run an initial gentle discovery cycle after a short warm-up delay
    // This ensures the Memory Stream is actively observing from the moment the substrate boots
    setTimeout(async () => {
      try {
        if (!isMeshEnabled() || document.visibilityState === 'hidden') return;
        console.log('[MeshScheduler] Initial warm-up discovery cycle...');
        await this.runGapAnalysisCycle();
        await this.runIntentScoringCycle();
      } catch (err) {
        console.warn('[MeshScheduler] Initial warm-up cycle error (non-fatal):', err);
      }
    }, 60_000); // 60s after boot — let everything settle first

    console.log('[MeshScheduler] Started — continuous autonomous discovery active');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    this.config.enabled = false;
    this.state.isRunning = false;
    
    for (const key of Object.keys(this.timers) as (keyof SchedulerTimers)[]) {
      if (this.timers[key]) {
        clearInterval(this.timers[key]!);
        this.timers[key] = null;
      }
    }

    console.log('[MeshScheduler] Stopped');
  }

  /**
   * Run module self-discovery for all entities + zones
   */
  async runModuleDiscoveryCycle(): Promise<{ totalProposals: number; endpointHealth: number }> {
    try {
      // Phase 1: Endpoint probing — discover module health and operation coverage
      const probeResults = await discoverCapabilities();
      const summary = getDiscoverySummary(probeResults);
      console.log(`[MeshScheduler] Endpoint probe: ${summary.availableOperations}/${summary.totalOperations} ops, avg health ${summary.avgHealth}%`);

      // Phase 2: Mesh self-discovery — propose new resolvers from data assets
      const result = await runAllModuleDiscovery();
      const allProposals = result.moduleResults.flatMap(r => r.proposals);
      
      // Persist proposals for dashboard approval
      const persisted = await persistProposals(allProposals.slice(0, this.config.maxProposalsPerCycle));
      
      this.state.lastModuleDiscovery = new Date().toISOString();
      this.state.totalCyclesRun++;
      this.state.totalProposalsGenerated += persisted;

      console.log(`[MeshScheduler] Module discovery: ${result.totalProposals} proposals from ${result.moduleResults.length} modules, ${persisted} persisted`);
      return { totalProposals: persisted, endpointHealth: summary.avgHealth };
    } catch (err) {
      console.warn('[MeshScheduler] Module discovery failed:', err);
      return { totalProposals: 0, endpointHealth: 0 };
    }
  }

  /**
   * Run gap analysis cycle
   */
  async runGapAnalysisCycle(): Promise<{ gapsFound: number; recommendations: number }> {
    try {
      const result = await runDiscoveryCycle({ persistResults: true, expandManifest: false });
      
      this.state.lastGapAnalysis = new Date().toISOString();
      this.state.totalCyclesRun++;

      console.log(`[MeshScheduler] Gap analysis: ${result.gapsFound} gaps, ${result.recommendationsGenerated} recommendations`);
      return { gapsFound: result.gapsFound, recommendations: result.recommendationsGenerated };
    } catch (err) {
      console.warn('[MeshScheduler] Gap analysis failed:', err);
      return { gapsFound: 0, recommendations: 0 };
    }
  }

  /**
   * Run intent quality scoring
   */
  async runIntentScoringCycle(): Promise<{ intentsScored: number; clmInsights: number }> {
    try {
      const scores = await calculateIntentScores();
      
      // Run CLM feedback loop — scoring insights → module learning topics
      const feedback = await runCLMFeedbackLoop();
      
      this.state.lastIntentScoring = new Date().toISOString();
      this.state.totalCyclesRun++;

      console.log(`[MeshScheduler] Intent scoring: ${scores.length} scored, ${feedback.insightsGenerated} CLM insights → ${feedback.modulesUpdated} modules`);
      return { intentsScored: scores.length, clmInsights: feedback.insightsGenerated };
    } catch (err) {
      console.warn('[MeshScheduler] Intent scoring failed:', err);
      return { intentsScored: 0, clmInsights: 0 };
    }
  }

  /**
   * Run full expansion — apply high-confidence proposals
   */
  async runFullExpansionCycle(): Promise<{ expanded: number }> {
    try {
      const result = await runDiscoveryCycle({ 
        persistResults: true, 
        expandManifest: true, // Auto-expand high confidence
      });
      
      this.state.lastFullExpansion = new Date().toISOString();
      this.state.totalCyclesRun++;
      this.state.totalCapabilitiesExpanded += result.capabilitiesExpanded;

      console.log(`[MeshScheduler] Full expansion: ${result.capabilitiesExpanded} capabilities added`);
      return { expanded: result.capabilitiesExpanded };
    } catch (err) {
      console.warn('[MeshScheduler] Full expansion failed:', err);
      return { expanded: 0 };
    }
  }

  /**
   * Run live gap execution + affinity + pattern recognition (v10.4 phases)
   */
  async runAdvancedDiscoveryCycle(): Promise<{ liveGaps: number; affinityEdges: number; patterns: number }> {
    try {
      const [gapReport, matrix, patternReport] = await Promise.all([
        runLiveGapExecution(),
        buildAffinityMatrix(),
        detectPatterns(),
      ]);

      this.state.totalCyclesRun++;
      console.log(`[MeshScheduler] Advanced discovery: ${gapReport.gapsFound} live gaps, ${matrix.edges.length} affinity edges, ${patternReport.patternsFound} patterns`);
      return { liveGaps: gapReport.gapsFound, affinityEdges: matrix.edges.length, patterns: patternReport.patternsFound };
    } catch (err) {
      console.warn('[MeshScheduler] Advanced discovery failed:', err);
      return { liveGaps: 0, affinityEdges: 0, patterns: 0 };
    }
  }

  /**
   * Run a single full cycle manually (all phases)
   */
  async runOnce(): Promise<{
    moduleDiscovery: number;
    gapAnalysis: { gaps: number; recommendations: number };
    intentScoring: number;
    expansion: number;
    advancedDiscovery: { liveGaps: number; affinityEdges: number; patterns: number };
  }> {
    const md = await this.runModuleDiscoveryCycle();
    const ga = await this.runGapAnalysisCycle();
    const is = await this.runIntentScoringCycle();
    const ex = await this.runFullExpansionCycle();
    const ad = await this.runAdvancedDiscoveryCycle();
    
    return {
      moduleDiscovery: md.totalProposals,
      gapAnalysis: { gaps: ga.gapsFound, recommendations: ga.recommendations },
      intentScoring: is.intentsScored,
      expansion: ex.expanded,
      advancedDiscovery: ad,
    };
  }

  /**
   * Get scheduler state
   */
  getState(): SchedulerState {
    return {
      config: { ...this.config },
      ...this.state,
    };
  }

  /**
   * Update config
   */
  updateConfig(partial: Partial<SchedulerConfig>): void {
    Object.assign(this.config, partial);
    // Restart with new intervals if running
    if (this.state.isRunning) {
      this.stop();
      this.start();
    }
  }
}

export const meshScheduler = MeshAutoScheduler.getInstance();
