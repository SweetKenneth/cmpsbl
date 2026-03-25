/**
 * Substrate — Node Warm-Up Sequencer
 * Ensures nodes are initialized in the correct dependency order.
 * Prevents race conditions during boot.
 */

export interface WarmUpStage {
  stage: number;
  modules: string[]; // kept for API stability — represents node IDs
  label: string;
}

/**
 * Defines the boot sequence stages.
 * Nodes in the same stage can initialize in parallel.
 * A stage only starts after all nodes in the previous stage complete.
 */
export const BOOT_SEQUENCE: WarmUpStage[] = [
  // Stage 0: Kernel — CORE is boot authority
  { stage: 0, modules: ['core', 'system', 'ripple'], label: 'Kernel & Infrastructure' },
  // Stage 1: CCR — Core Cognitive Ring
  { stage: 1, modules: ['brain', 'memory', 'dream'], label: 'Core Cognitive Ring' },
  // Stage 2: OCG — Operational Compliance Grid
  { stage: 2, modules: ['access', 'identity', 'relay', 'audit'], label: 'Operational Compliance' },
  // Stage 3: Execution — primary operational nodes
  { stage: 3, modules: ['nexus', 'nerve', 'vision', 'economy'], label: 'Execution Core' },
  { stage: 4, modules: ['decode', 'encode', 'cortex'], label: 'Cognitive Execution' },
  { stage: 5, modules: ['sandbox', 'inclusive', 'medic', 'integration'], label: 'Execution Extended' },
  // Stage 6: ESZ — Expansion Sovereignty Zone
  { stage: 6, modules: ['sovereign', 'conscience', 'oracle', 'treaty'], label: 'Sovereignty & Ethics' },
  // Stage 7: EPZ — Expansion Perception Zone
  { stage: 7, modules: ['compass', 'echo', 'reflex'], label: 'Perception & Simulation' },
  // Stage 8: EMZ — Expansion Manufacturing Zone
  { stage: 8, modules: ['forge', 'lingua', 'harvest'], label: 'Manufacturing & Data' },
  // Stage 9: CSZ — Cognitive Shadow Zone
  { stage: 9, modules: ['evolution', 'shadow', 'phantom'], label: 'Cognitive Shadow' },
  // Stage 10: Fields & Mesh Overlays
  { stage: 10, modules: ['immunity', 'intent', 'defense'], label: 'Field Overlays' },
  // Stage 11: Plane + Shell — Governance & outer boundary
  { stage: 11, modules: ['governance', 'engineer', 'atlas'], label: 'Governance & Shell' },
];

export interface WarmUpResult {
  stage: number;
  module: string; // node ID — kept for API stability
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface WarmUpReport {
  totalDurationMs: number;
  results: WarmUpResult[];
  failedModules: string[]; // failed node IDs — kept for API stability
  completedStages: number;
  totalStages: number;
}

/**
 * Execute warm-up sequence with parallel-per-stage execution.
 * Each stage boots its nodes in parallel; stages run sequentially.
 */
export async function executeWarmUpSequence(
  initFn: (moduleId: string) => Promise<void>
): Promise<WarmUpReport> {
  const results: WarmUpResult[] = [];
  const failedModules: string[] = [];
  const start = Date.now();
  let completedStages = 0;

  for (const stage of BOOT_SEQUENCE) {
    const stageResults = await Promise.allSettled(
      stage.modules.map(async (nodeId) => {
        const nodeStart = Date.now();
        try {
          await initFn(nodeId);
          return { stage: stage.stage, module: nodeId, success: true, durationMs: Date.now() - nodeStart };
        } catch (err) {
          return {
            stage: stage.stage,
            module: nodeId,
            success: false,
            durationMs: Date.now() - nodeStart,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })
    );

    for (const r of stageResults) {
      if (r.status === 'fulfilled') {
        results.push(r.value);
        if (!r.value.success) failedModules.push(r.value.module);
      }
    }

    completedStages++;
  }

  return {
    totalDurationMs: Date.now() - start,
    results,
    failedModules,
    completedStages,
    totalStages: BOOT_SEQUENCE.length,
  };
}
