/**
 * Substrate — Module Warm-Up Sequencer
 * Ensures modules are initialized in the correct dependency order.
 * Prevents race conditions during boot.
 */

export interface WarmUpStage {
  stage: number;
  modules: string[];
  label: string;
}

/**
 * Defines the boot sequence stages.
 * Modules in the same stage can initialize in parallel.
 * A stage only starts after all modules in the previous stage complete.
 */
export const BOOT_SEQUENCE: WarmUpStage[] = [
  { stage: 0, modules: ['system', 'ripple'], label: 'Infrastructure' },
  { stage: 1, modules: ['memory', 'access', 'defense'], label: 'Foundation' },
  { stage: 2, modules: ['nexus', 'identity', 'relay', 'nerve'], label: 'Connectivity & OCG' },
  { stage: 3, modules: ['brain', 'vision', 'economy'], label: 'Intelligence' },
  { stage: 4, modules: ['decode', 'encode', 'cortex'], label: 'Cognitive' },
  { stage: 5, modules: ['integration', 'dream'], label: 'Extended' },
  // Expansion Modules (38-Node / 12-Sector Architecture)
  { stage: 6, modules: ['sovereign', 'conscience'], label: 'Sovereignty & Ethics' },
  { stage: 7, modules: ['oracle', 'compass', 'echo'], label: 'Predictive & Simulation' },
  { stage: 8, modules: ['forge', 'lingua', 'harvest'], label: 'Manufacturing & Data' },
  { stage: 9, modules: ['treaty', 'reflex'], label: 'Compliance & Edge' },
  // CSZ — Covert Systems Zone (38-Node Architecture)
  { stage: 10, modules: ['evolution', 'shadow', 'phantom'], label: 'Covert Systems' },
];

export interface WarmUpResult {
  stage: number;
  module: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface WarmUpReport {
  totalDurationMs: number;
  results: WarmUpResult[];
  failedModules: string[];
  completedStages: number;
  totalStages: number;
}

/**
 * Execute warm-up sequence with parallel-per-stage execution.
 */
export async function executeWarmUpSequence(
  initFn: (moduleId: string) => Promise<void>
): Promise<WarmUpReport> {
  const results: WarmUpResult[] = [];
  const start = Date.now();
  let completedStages = 0;

  for (const stage of BOOT_SEQUENCE) {
    const stageResults = await Promise.allSettled(
      stage.modules.map(async (moduleId) => {
        const moduleStart = Date.now();
        try {
          await initFn(moduleId);
          return { stage: stage.stage, module: moduleId, success: true, durationMs: Date.now() - moduleStart };
        } catch (err) {
          return {
            stage: stage.stage,
            module: moduleId,
            success: false,
            durationMs: Date.now() - moduleStart,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })
    );

    for (const r of stageResults) {
      if (r.status === 'fulfilled') results.push(r.value);
    }

    completedStages++;
  }

  const failedModules = results.filter(r => !r.success).map(r => r.module);

  return {
    totalDurationMs: Date.now() - start,
    results,
    failedModules,
    completedStages,
    totalStages: BOOT_SEQUENCE.length,
  };
}
