/**
 * Auto-Miner Hook — Autonomous Discovery Mining Loop
 * 
 * Cycles: Generate random templates → Run 3 discovery passes → 
 * If discoveries found, keep mining until exhausted → Retire combo → Repeat
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { runReactor, type ReactorRunResult, type SynthesisTemplate } from '@/lib/discovery/reactor';
import {
  generateTemplateBatch,
  retireCombo,
  getRetiredCombos,
  getRetiredCount,
  getGeneratorStats,
  clearRetired,
  type GeneratedTemplate,
  type GeneratorConfig,
  type RetiredCombo,
} from '@/lib/discovery/template-generator';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type MinerPhase = 'idle' | 'generating' | 'probing' | 'mining' | 'retiring' | 'paused' | 'complete';

export interface MinerCycleResult {
  cycleNumber: number;
  phase: string;
  templatesGenerated: number;
  probeRuns: number;
  discoveriesFound: number;
  miningRuns: number;
  retiredCombos: number;
  timestamp: number;
}

export interface AutoMinerState {
  phase: MinerPhase;
  currentCycle: number;
  totalDiscoveries: number;
  totalRuns: number;
  totalTemplatesGenerated: number;
  currentBatchSize: number;
  activeTemplates: GeneratedTemplate[];
  cycleHistory: MinerCycleResult[];
  retiredCombos: RetiredCombo[];
  startedAt: number | null;
  lastActivity: string;
  error: string | null;
}

export interface MinerConfig {
  batchSize: number;
  probeRuns: number;          // discovery passes per batch (default: 3)
  maxCycles: number;          // max cycles before auto-stop (0 = infinite)
  minModules: number;
  maxModules: number;
  biasHighValue: boolean;
  dryRun: boolean;
  delayBetweenRuns: number;   // ms delay between runs (rate limiting)
}

const DEFAULT_MINER_CONFIG: MinerConfig = {
  batchSize: 15,
  probeRuns: 3,
  maxCycles: 0,
  minModules: 2,
  maxModules: 5,
  biasHighValue: true,
  dryRun: false,
  delayBetweenRuns: 2000,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useAutoMiner() {
  const [state, setState] = useState<AutoMinerState>({
    phase: 'idle',
    currentCycle: 0,
    totalDiscoveries: 0,
    totalRuns: 0,
    totalTemplatesGenerated: 0,
    currentBatchSize: 0,
    activeTemplates: [],
    cycleHistory: [],
    retiredCombos: [],
    startedAt: null,
    lastActivity: '',
    error: null,
  });

  const abortRef = useRef(false);
  const runningRef = useRef(false);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  /** Run one full auto-mining cycle */
  const runCycle = useCallback(async (cycleNum: number, config: MinerConfig): Promise<MinerCycleResult | null> => {
    if (abortRef.current) return null;

    // Phase 1: Generate templates
    setState(prev => ({ ...prev, phase: 'generating', lastActivity: `Cycle ${cycleNum}: Generating ${config.batchSize} random templates...` }));

    const templates = generateTemplateBatch({
      batchSize: config.batchSize,
      minModules: config.minModules,
      maxModules: config.maxModules,
      minCjpiTarget: 80,
      biasHighValue: config.biasHighValue,
    });

    if (templates.length === 0) {
      setState(prev => ({ ...prev, lastActivity: `Cycle ${cycleNum}: Generator exhausted — all combos retired or attempts maxed` }));
      return null; // signal exhaustion
    }

    setState(prev => ({
      ...prev,
      activeTemplates: templates,
      currentBatchSize: templates.length,
      totalTemplatesGenerated: prev.totalTemplatesGenerated + templates.length,
      lastActivity: `Cycle ${cycleNum}: Generated ${templates.length} templates, starting probes...`,
    }));

    // Phase 2: Probe — run N discovery passes with these templates
    setState(prev => ({ ...prev, phase: 'probing' }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState(prev => ({ ...prev, error: 'Authentication required', phase: 'idle' }));
      return null;
    }

    let totalDiscoveries = 0;
    let probeRuns = 0;

    // Cast templates to reactor format
    const injectedTemplates = templates as unknown as SynthesisTemplate[];

    for (let probe = 0; probe < config.probeRuns; probe++) {
      if (abortRef.current) break;

      setState(prev => ({ ...prev, lastActivity: `Cycle ${cycleNum}: Probe ${probe + 1}/${config.probeRuns}...` }));

      const result = await runReactor({
        dryRun: config.dryRun,
        exploratoryMode: true,
        scoringVersion: 'auto-miner-1.0',
        injectedTemplates,
      }, user.id);

      probeRuns++;

      if (result.status === 'completed') {
        totalDiscoveries += result.acceptedCount;
        setState(prev => ({
          ...prev,
          totalRuns: prev.totalRuns + 1,
          totalDiscoveries: prev.totalDiscoveries + result.acceptedCount,
          lastActivity: `Cycle ${cycleNum}: Probe ${probe + 1} found ${result.acceptedCount} discoveries (total: ${totalDiscoveries})`,
        }));
      }

      if (probe < config.probeRuns - 1) {
        await sleep(config.delayBetweenRuns);
      }
    }

    // Phase 3: Mining — if discoveries were found, keep mining until exhausted
    let miningRuns = 0;

    if (totalDiscoveries > 0 && !abortRef.current) {
      setState(prev => ({ ...prev, phase: 'mining', lastActivity: `Cycle ${cycleNum}: Discoveries found! Deep mining...` }));

      let consecutiveEmpty = 0;
      const maxConsecutiveEmpty = 2;

      while (consecutiveEmpty < maxConsecutiveEmpty && !abortRef.current) {
        await sleep(config.delayBetweenRuns);

        const mineResult = await runReactor({
          dryRun: config.dryRun,
          exploratoryMode: true,
          scoringVersion: 'auto-miner-1.0',
          injectedTemplates,
        }, user.id);

        miningRuns++;

        if (mineResult.status === 'completed' && mineResult.acceptedCount > 0) {
          consecutiveEmpty = 0;
          totalDiscoveries += mineResult.acceptedCount;
          setState(prev => ({
            ...prev,
            totalRuns: prev.totalRuns + 1,
            totalDiscoveries: prev.totalDiscoveries + mineResult.acceptedCount,
            lastActivity: `Cycle ${cycleNum}: Mining run ${miningRuns} found ${mineResult.acceptedCount} more (total: ${totalDiscoveries})`,
          }));
        } else {
          consecutiveEmpty++;
          setState(prev => ({
            ...prev,
            lastActivity: `Cycle ${cycleNum}: Mining run ${miningRuns} empty (${consecutiveEmpty}/${maxConsecutiveEmpty} to retire)`,
          }));
        }
      }
    }

    // Phase 4: Retire used templates
    setState(prev => ({ ...prev, phase: 'retiring', lastActivity: `Cycle ${cycleNum}: Retiring ${templates.length} template combos...` }));

    for (const t of templates) {
      retireCombo(t.modulePattern, t.category, probeRuns + miningRuns, totalDiscoveries);
    }

    const cycleResult: MinerCycleResult = {
      cycleNumber: cycleNum,
      phase: totalDiscoveries > 0 ? 'productive' : 'dry',
      templatesGenerated: templates.length,
      probeRuns,
      discoveriesFound: totalDiscoveries,
      miningRuns,
      retiredCombos: templates.length,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      retiredCombos: getRetiredCombos(),
      cycleHistory: [...prev.cycleHistory, cycleResult],
    }));

    return cycleResult;
  }, []);

  /** Start the auto-mining loop */
  const start = useCallback(async (userConfig: Partial<MinerConfig> = {}) => {
    if (runningRef.current) {
      toast.error('Auto-miner is already running');
      return;
    }

    const config = { ...DEFAULT_MINER_CONFIG, ...userConfig };
    abortRef.current = false;
    runningRef.current = true;

    setState({
      phase: 'generating',
      currentCycle: 0,
      totalDiscoveries: 0,
      totalRuns: 0,
      totalTemplatesGenerated: 0,
      activeTemplates: [],
      cycleHistory: [],
      startedAt: Date.now(),
      error: null,
      lastActivity: 'Starting auto-miner...',
      currentBatchSize: 0,
      retiredCombos: [],
    });

    toast.success('Auto-Miner started — generating and testing template combinations');

    let cycle = 0;
    while (!abortRef.current) {
      cycle++;

      if (config.maxCycles > 0 && cycle > config.maxCycles) {
        setState(prev => ({ ...prev, lastActivity: `Reached max cycles (${config.maxCycles})`, phase: 'complete' }));
        break;
      }

      setState(prev => ({ ...prev, currentCycle: cycle }));

      const result = await runCycle(cycle, config);

      if (!result) {
        if (abortRef.current) {
          setState(prev => ({ ...prev, phase: 'paused', lastActivity: 'Paused by user' }));
        } else {
          setState(prev => ({ ...prev, phase: 'complete', lastActivity: 'Generator exhausted — all reachable combos tested' }));
          toast.info('Auto-Miner complete: all reachable template combinations have been explored');
        }
        break;
      }

      // Brief pause between cycles
      if (!abortRef.current) {
        await sleep(config.delayBetweenRuns * 2);
      }
    }

    runningRef.current = false;
  }, [runCycle]);

  /** Stop the auto-mining loop */
  const stop = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({ ...prev, phase: 'paused', lastActivity: 'Stopping...' }));
    toast.info('Auto-Miner stopping after current operation completes');
  }, []);

  /** Reset all state including retired combos */
  const reset = useCallback(() => {
    abortRef.current = true;
    runningRef.current = false;
    clearRetired();
    setState({
      phase: 'idle',
      currentCycle: 0,
      totalDiscoveries: 0,
      totalRuns: 0,
      totalTemplatesGenerated: 0,
      currentBatchSize: 0,
      activeTemplates: [],
      cycleHistory: [],
      retiredCombos: [],
      startedAt: null,
      lastActivity: '',
      error: null,
    });
    toast.success('Auto-Miner reset — all retired combos cleared');
  }, []);

  return {
    state,
    start,
    stop,
    reset,
    stats: getGeneratorStats(),
    isRunning: runningRef.current && !abortRef.current,
  };
}
