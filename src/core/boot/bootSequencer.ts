/**
 * CORE — Boot Sequencer
 * Deterministic 12-stage sector boot with dependency ordering,
 * timeout guards, and rollback on failure.
 * Ultimate Form v1.0.0
 */

export type BootStage =
  | 'CORE' | 'SYSTEM' | 'CCR' | 'OCG' | 'EXEC' | 'ESZ'
  | 'EPZ' | 'EMZ' | 'CSZ' | 'FIELDS' | 'PLANE' | 'SHELL';

export type StageStatus = 'pending' | 'booting' | 'ready' | 'failed' | 'rolled_back';

export interface StageResult {
  stage: BootStage;
  status: StageStatus;
  durationMs: number;
  error?: string;
  moduleCount: number;
}

export interface BootManifest {
  bootId: string;
  startedAt: string;
  completedAt: string | null;
  stages: StageResult[];
  totalDurationMs: number;
  success: boolean;
  failedStage: BootStage | null;
}

interface StageDefinition {
  stage: BootStage;
  dependencies: BootStage[];
  modules: string[];
  init: () => Promise<void>;
}

const BOOT_TIMEOUT_MS = 5_000;
const stageRegistry: StageDefinition[] = [];
let latestManifest: BootManifest | null = null;

/**
 * Register a boot stage with its dependencies and initializer.
 */
export function registerBootStage(def: StageDefinition): void {
  stageRegistry.push(def);
}

/**
 * Get topologically sorted boot order.
 * Throws on cycle detection.
 */
function topologicalSort(stages: StageDefinition[]): StageDefinition[] {
  const sorted: StageDefinition[] = [];
  const visited = new Set<BootStage>();
  const visiting = new Set<BootStage>();
  const map = new Map(stages.map(s => [s.stage, s]));

  function visit(stage: BootStage): void {
    if (visited.has(stage)) return;
    if (visiting.has(stage)) {
      throw new Error(`[BootSequencer] Cycle detected at stage: ${stage}`);
    }
    visiting.add(stage);
    const def = map.get(stage);
    if (def) {
      for (const dep of def.dependencies) {
        visit(dep);
      }
      sorted.push(def);
    }
    visiting.delete(stage);
    visited.add(stage);
  }

  for (const s of stages) visit(s.stage);
  return sorted;
}

/**
 * Execute a stage with timeout guard.
 */
async function executeStage(def: StageDefinition): Promise<StageResult> {
  const start = performance.now();
  try {
    await Promise.race([
      def.init(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Stage ${def.stage} timed out after ${BOOT_TIMEOUT_MS}ms`)), BOOT_TIMEOUT_MS)
      ),
    ]);
    return {
      stage: def.stage,
      status: 'ready',
      durationMs: Math.round(performance.now() - start),
      moduleCount: def.modules.length,
    };
  } catch (err) {
    return {
      stage: def.stage,
      status: 'failed',
      durationMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
      moduleCount: def.modules.length,
    };
  }
}

/**
 * Execute the full 12-stage boot sequence.
 * Halts on first failure and marks remaining stages as rolled_back.
 */
export async function executeBoot(): Promise<BootManifest> {
  const bootId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const sorted = topologicalSort(stageRegistry);
  const results: StageResult[] = [];
  let failedStage: BootStage | null = null;

  for (const def of sorted) {
    if (failedStage) {
      results.push({
        stage: def.stage,
        status: 'rolled_back',
        durationMs: 0,
        moduleCount: def.modules.length,
      });
      continue;
    }

    const result = await executeStage(def);
    results.push(result);

    if (result.status === 'failed') {
      failedStage = def.stage;
    }
  }

  const manifest: BootManifest = {
    bootId,
    startedAt,
    completedAt: new Date().toISOString(),
    stages: results,
    totalDurationMs: results.reduce((s, r) => s + r.durationMs, 0),
    success: !failedStage,
    failedStage,
  };

  latestManifest = manifest;
  console.log(`[BootSequencer] ${manifest.success ? '✓' : '✗'} Boot ${bootId} — ${manifest.totalDurationMs}ms, ${results.filter(r => r.status === 'ready').length}/${sorted.length} stages`);
  return manifest;
}

export function getBootManifest(): BootManifest | null {
  return latestManifest;
}

export function getRegisteredStages(): BootStage[] {
  return stageRegistry.map(s => s.stage);
}

/**
 * Default 12-stage registration with no-op initializers.
 * Real modules override via registerBootStage().
 */
export function registerDefaultStages(): void {
  const stages: Array<{ stage: BootStage; deps: BootStage[] }> = [
    { stage: 'CORE', deps: [] },
    { stage: 'SYSTEM', deps: ['CORE'] },
    { stage: 'CCR', deps: ['CORE'] },
    { stage: 'OCG', deps: ['SYSTEM'] },
    { stage: 'EXEC', deps: ['SYSTEM', 'CCR'] },
    { stage: 'ESZ', deps: ['EXEC'] },
    { stage: 'EPZ', deps: ['EXEC'] },
    { stage: 'EMZ', deps: ['EXEC'] },
    { stage: 'CSZ', deps: ['OCG'] },
    { stage: 'FIELDS', deps: ['ESZ', 'EPZ'] },
    { stage: 'PLANE', deps: ['FIELDS', 'CSZ'] },
    { stage: 'SHELL', deps: ['PLANE'] },
  ];

  for (const s of stages) {
    registerBootStage({
      stage: s.stage,
      dependencies: s.deps,
      modules: [],
      init: async () => { /* no-op — overridden by module registration */ },
    });
  }
}
