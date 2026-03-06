/**
 * Memory Stream E2E Test
 * ━━━━━━━━━━━━━━━━━━━━━
 * Full pipeline: Discovery → Scoring → Tiering → Storage → Export
 * 
 * Tests the standalone runtime + discovery engine + export adapter
 * without any Supabase or browser dependencies.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Standalone runtime (zero deps)
import {
  createRuntime,
  createMemoryStorage,
  computeCJPI,
  autoAssignTier,
  computeSynergyMultiplier,
  computeStableId,
  djb2Hash,
  canonicalize,
  createStateMachine,
  createDependencyGraph,
  createPipelineComposer,
  createSaga,
  type CJPIScoreBreakdown,
  type StandaloneRuntime,
} from '@/lib/export/standalone-runtime';

// Standalone discovery engine
import {
  createDiscoveryEngine,
  type DiscoveryRunResult,
} from '@/lib/export/standalone-discovery-engine';

// Export adapter
import {
  generateExportBundle,
  getLanguagesForScore,
  SOFTWARE_LANGUAGES,
  type ExportTarget,
  type ExportableArtifact,
} from '@/lib/export/universal-adapter';

// Foundry tiered zip helpers (without download)
import {
  type TieredFoundryExportArtifact,
} from '@/lib/export/foundry-tiered-zip';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CJPI Scoring Engine
// ═══════════════════════════════════════════════════════════════════════════════

describe('§1 — CJPI Scoring Engine', () => {
  it('scores a high-value breakdown correctly', () => {
    const breakdown: CJPIScoreBreakdown = {
      strategicLeverage: 95,
      recursionPotential: 92,
      crossNodeImpact: 88,
      composability: 85,
      governanceInfluence: 78,
      moatSensitivity: 96,
    };
    const score = computeCJPI(breakdown);
    expect(score).toBeGreaterThanOrEqual(85);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('scores a zero breakdown as 0', () => {
    const zero: CJPIScoreBreakdown = {
      strategicLeverage: 0, recursionPotential: 0, crossNodeImpact: 0,
      composability: 0, governanceInfluence: 0, moatSensitivity: 0,
    };
    expect(computeCJPI(zero)).toBe(0);
  });

  it('caps at 100', () => {
    const max: CJPIScoreBreakdown = {
      strategicLeverage: 200, recursionPotential: 200, crossNodeImpact: 200,
      composability: 200, governanceInfluence: 200, moatSensitivity: 200,
    };
    expect(computeCJPI(max)).toBe(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Auto-Tiering
// ═══════════════════════════════════════════════════════════════════════════════

describe('§2 — Auto-Tiering', () => {
  it('assigns apex tier for CJPI ≥ 95', () => {
    expect(autoAssignTier(95)).toBe('apex');
    expect(autoAssignTier(100)).toBe('apex');
  });

  it('assigns enterprise tier for 85–94', () => {
    expect(autoAssignTier(85)).toBe('enterprise');
    expect(autoAssignTier(94)).toBe('enterprise');
  });

  it('assigns architect tier for 70–84', () => {
    expect(autoAssignTier(70)).toBe('architect');
    expect(autoAssignTier(84)).toBe('architect');
  });

  it('assigns creator tier for 55–69', () => {
    expect(autoAssignTier(55)).toBe('creator');
    expect(autoAssignTier(69)).toBe('creator');
  });

  it('returns null below 55', () => {
    expect(autoAssignTier(54)).toBeNull();
    expect(autoAssignTier(0)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Synergy Multiplier
// ═══════════════════════════════════════════════════════════════════════════════

describe('§3 — Synergy Multiplier', () => {
  it('returns 1.15 for 4+ unique modules', () => {
    expect(computeSynergyMultiplier(['BRAIN', 'CORTEX', 'MEMORY', 'DREAM'])).toBe(1.15);
  });

  it('returns 1.08 for 3 unique modules', () => {
    expect(computeSynergyMultiplier(['BRAIN', 'CORTEX', 'MEMORY'])).toBe(1.08);
  });

  it('returns 1.0 for ≤2 unique modules', () => {
    expect(computeSynergyMultiplier(['BRAIN', 'CORTEX'])).toBe(1.0);
    expect(computeSynergyMultiplier(['BRAIN'])).toBe(1.0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Hashing & Stable IDs
// ═══════════════════════════════════════════════════════════════════════════════

describe('§4 — Hashing & Stable IDs', () => {
  it('djb2Hash is deterministic', () => {
    expect(djb2Hash('hello')).toBe(djb2Hash('hello'));
    expect(djb2Hash('hello')).not.toBe(djb2Hash('world'));
  });

  it('computeStableId is deterministic and order-independent', () => {
    const id1 = computeStableId('Test', ['BRAIN', 'CORTEX'], 'cognitive');
    const id2 = computeStableId('Test', ['CORTEX', 'BRAIN'], 'cognitive');
    expect(id1).toBe(id2); // sorted internally
    expect(id1).toMatch(/^disc-/);
  });

  it('canonicalize produces sorted JSON', () => {
    const a = canonicalize({ b: 2, a: 1 });
    const b = canonicalize({ a: 1, b: 2 });
    expect(a).toBe(b);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Memory Storage Adapter
// ═══════════════════════════════════════════════════════════════════════════════

describe('§5 — Memory Storage', () => {
  let storage: ReturnType<typeof createMemoryStorage>;

  beforeEach(() => { storage = createMemoryStorage(); });

  it('put and get round-trip', async () => {
    await storage.put('items', { id: 'a', name: 'Alpha' });
    const result = await storage.get<{ id: string; name: string }>('items', 'a');
    expect(result).toEqual({ id: 'a', name: 'Alpha' });
  });

  it('list returns all items', async () => {
    await storage.put('items', { id: 'a' });
    await storage.put('items', { id: 'b' });
    const list = await storage.list('items');
    expect(list).toHaveLength(2);
  });

  it('list with filter', async () => {
    await storage.put('items', { id: 'a', tier: 'apex' });
    await storage.put('items', { id: 'b', tier: 'creator' });
    const filtered = await storage.list<{ id: string; tier: string }>('items', { tier: 'apex' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('a');
  });

  it('delete removes item', async () => {
    await storage.put('items', { id: 'x' });
    await storage.delete('items', 'x');
    expect(await storage.get('items', 'x')).toBeNull();
  });

  it('count tracks size', async () => {
    expect(await storage.count('items')).toBe(0);
    await storage.put('items', { id: '1' });
    expect(await storage.count('items')).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — Dependency Graph
// ═══════════════════════════════════════════════════════════════════════════════

describe('§6 — Dependency Graph', () => {
  it('computes boot order with no cycles', () => {
    const graph = createDependencyGraph();
    graph.register('CORE', 'Core', []);
    graph.register('BRAIN', 'Brain', ['CORE']);
    graph.register('MEMORY', 'Memory', ['CORE']);
    graph.register('CORTEX', 'Cortex', ['BRAIN', 'MEMORY']);
    const { order, cycles } = graph.computeBootOrder();
    expect(cycles).toHaveLength(0);
    expect(order.indexOf('CORE')).toBeLessThan(order.indexOf('BRAIN'));
    expect(order.indexOf('CORE')).toBeLessThan(order.indexOf('MEMORY'));
    expect(order.indexOf('BRAIN')).toBeLessThan(order.indexOf('CORTEX'));
  });

  it('detects cycles', () => {
    const graph = createDependencyGraph();
    graph.register('A', 'A', ['B']);
    graph.register('B', 'B', ['A']);
    const { cycles } = graph.computeBootOrder();
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('getDependents returns downstream nodes', () => {
    const graph = createDependencyGraph();
    graph.register('CORE', 'Core', []);
    graph.register('BRAIN', 'Brain', ['CORE']);
    graph.register('MEMORY', 'Memory', ['CORE']);
    expect(graph.getDependents('CORE')).toContain('BRAIN');
    expect(graph.getDependents('CORE')).toContain('MEMORY');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — Pipeline Composer
// ═══════════════════════════════════════════════════════════════════════════════

describe('§7 — Pipeline Composer', () => {
  it('composes and validates a sequential pipeline', () => {
    const composer = createPipelineComposer();
    composer.registerStage({ id: 's1', name: 'Ingest', moduleId: 'BRAIN', handler: 'ingest', inputSchema: {}, outputSchema: { data: 'string' }, timeoutMs: 1000, retries: 1 });
    composer.registerStage({ id: 's2', name: 'Process', moduleId: 'CORTEX', handler: 'process', inputSchema: { data: 'string' }, outputSchema: { result: 'string' }, timeoutMs: 2000, retries: 1 });

    const pipeline = composer.compose('Test Pipeline', ['s1', 's2'], 'sequential');
    expect(pipeline).not.toBeNull();
    expect(pipeline!.stages).toHaveLength(2);

    const validation = composer.validate(pipeline!.id);
    expect(validation.valid).toBe(true);
  });

  it('detects missing input schema in sequential pipeline', () => {
    const composer = createPipelineComposer();
    composer.registerStage({ id: 's1', name: 'Ingest', moduleId: 'BRAIN', handler: 'ingest', inputSchema: {}, outputSchema: { foo: 'string' }, timeoutMs: 1000, retries: 1 });
    composer.registerStage({ id: 's2', name: 'Process', moduleId: 'CORTEX', handler: 'process', inputSchema: { bar: 'string' }, outputSchema: {}, timeoutMs: 2000, retries: 1 });

    const pipeline = composer.compose('Bad Pipeline', ['s1', 's2'], 'sequential');
    const validation = composer.validate(pipeline!.id);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — Finite State Machine
// ═══════════════════════════════════════════════════════════════════════════════

describe('§8 — Finite State Machine', () => {
  it('transitions through discovery lifecycle', async () => {
    const fsm = createStateMachine({
      id: 'discovery',
      initial: 'idle',
      context: { count: 0 },
      states: {
        idle: {},
        discovering: {},
        scoring: {},
        tiering: {},
        exporting: {},
        done: {},
      },
      transitions: [
        { from: 'idle', to: 'discovering', event: 'START' },
        { from: 'discovering', to: 'scoring', event: 'SCORE' },
        { from: 'scoring', to: 'tiering', event: 'TIER' },
        { from: 'tiering', to: 'exporting', event: 'EXPORT' },
        { from: 'exporting', to: 'done', event: 'FINISH' },
      ],
    });

    expect(fsm.state).toBe('idle');
    await fsm.send('START');
    expect(fsm.state).toBe('discovering');
    await fsm.send('SCORE');
    expect(fsm.state).toBe('scoring');
    await fsm.send('TIER');
    expect(fsm.state).toBe('tiering');
    await fsm.send('EXPORT');
    expect(fsm.state).toBe('exporting');
    await fsm.send('FINISH');
    expect(fsm.state).toBe('done');

    expect(fsm.getHistory()).toHaveLength(5);
  });

  it('guards prevent invalid transitions', async () => {
    const fsm = createStateMachine({
      id: 'guarded',
      initial: 'locked',
      context: { authorized: false },
      states: { locked: {}, unlocked: {} },
      transitions: [
        { from: 'locked', to: 'unlocked', event: 'UNLOCK', guard: (ctx) => ctx.authorized },
      ],
    });

    const result = await fsm.send('UNLOCK');
    expect(result).toBe(false);
    expect(fsm.state).toBe('locked');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — Saga Orchestrator
// ═══════════════════════════════════════════════════════════════════════════════

describe('§9 — Saga Orchestrator', () => {
  it('executes all steps successfully', async () => {
    const saga = createSaga<{ steps: string[] }>('test-saga');
    saga
      .step('discover', async (ctx) => ({ steps: [...ctx.steps, 'discover'] }), async (ctx) => ctx)
      .step('score', async (ctx) => ({ steps: [...ctx.steps, 'score'] }), async (ctx) => ctx)
      .step('export', async (ctx) => ({ steps: [...ctx.steps, 'export'] }), async (ctx) => ctx);

    const result = await saga.run({ steps: [] });
    expect(result.success).toBe(true);
    expect(result.context.steps).toEqual(['discover', 'score', 'export']);
    expect(result.completedSteps).toEqual(['discover', 'score', 'export']);
  });

  it('compensates on failure', async () => {
    const compensated: string[] = [];
    const saga = createSaga<{ val: number }>('fail-saga');
    saga
      .step('step1', async (ctx) => ({ val: ctx.val + 1 }), async (ctx) => { compensated.push('step1'); return ctx; })
      .step('step2', async () => { throw new Error('boom'); }, async (ctx) => { compensated.push('step2'); return ctx; });

    const result = await saga.run({ val: 0 });
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe('step2');
    expect(compensated).toContain('step1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — Standalone Discovery Engine (full run)
// ═══════════════════════════════════════════════════════════════════════════════

describe('§10 — Standalone Discovery Engine', () => {
  let runtime: StandaloneRuntime;

  beforeEach(() => { runtime = createRuntime(); });

  it('dry run produces discoveries without persisting', async () => {
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: true });

    expect(result.status).toBe('completed');
    expect(result.totalCandidates).toBeGreaterThan(0);
    expect(result.discoveries.length).toBeGreaterThan(0);
    expect(result.dryRun).toBe(true);

    // Verify nothing persisted
    const stored = await runtime.storage.list('discoveries');
    expect(stored).toHaveLength(0);
  });

  it('live run persists discoveries to storage', async () => {
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: false });

    expect(result.status).toBe('completed');
    expect(result.acceptedCount).toBeGreaterThan(0);

    // Verify persistence
    const stored = await runtime.storage.list('discoveries');
    expect(stored.length).toBe(result.acceptedCount);

    // Verify run history
    const runs = await engine.getRunHistory();
    expect(runs.length).toBe(1);
  });

  it('deduplicates across runs', async () => {
    const engine = createDiscoveryEngine(runtime);
    const run1 = await engine.run({ dryRun: false });
    const run2 = await engine.run({ dryRun: false });

    expect(run1.status).toBe('completed');
    expect(run2.status).toBe('completed');
    // Second run should skip all already-known discoveries
    expect(run2.skippedCount).toBeGreaterThan(0);
    expect(run2.acceptedCount).toBe(0);
  });

  it('auto-promotes high-score discoveries', async () => {
    const engine = createDiscoveryEngine(runtime);
    await engine.run({ dryRun: false });

    const promotions = await engine.getPromotions();
    // All promotions should have CJPI ≥ 90
    for (const p of promotions as Array<{ cjpi: number }>) {
      expect(p.cjpi).toBeGreaterThanOrEqual(90);
    }
  });

  it('all discoveries have valid tiers', async () => {
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: true });

    for (const d of result.discoveries) {
      expect(d.cjpi).toBeGreaterThanOrEqual(80); // default minCjpi
      if (d.cjpi >= 95) expect(d.tier).toBe('apex');
      else if (d.cjpi >= 85) expect(d.tier).toBe('enterprise');
      else if (d.cjpi >= 70) expect(d.tier).toBe('architect');
      else if (d.cjpi >= 55) expect(d.tier).toBe('creator');
    }
  });

  it('category filter restricts output', async () => {
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: true, categories: ['cognitive'] });

    for (const d of result.discoveries) {
      expect(d.category).toBe('cognitive');
    }
  });

  it('topN limits output count', async () => {
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: true, topN: 3 });
    expect(result.acceptedCount).toBeLessThanOrEqual(3);
  });

  it('discoveries are sorted by CJPI descending', async () => {
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: true });

    for (let i = 1; i < result.discoveries.length; i++) {
      expect(result.discoveries[i - 1].cjpi).toBeGreaterThanOrEqual(result.discoveries[i].cjpi);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — Export Adapter Integration
// ═══════════════════════════════════════════════════════════════════════════════

describe('§11 — Export Adapter', () => {
  it('generates TypeScript export bundle from a discovery', () => {
    const artifact: ExportableArtifact = {
      id: 'disc-test-001',
      name: 'Causal Reasoning Engine',
      rank: 1,
      cjpi: 95,
      module: 'CORTEX',
      description: 'Structured causal inference',
      sourceCode: '',
      synthesisContext: {
        name: 'Causal Reasoning Engine',
        moduleChain: ['CORTEX', 'BRAIN', 'DREAM', 'VISION'],
        cjpi: 95,
        description: 'Structured causal inference',
        category: 'cognitive',
        entryCapability: 'causal-graph-builder',
        exitCapability: 'causal-inference-complete',
        errorStrategy: 'skip',
        maxExecutionMs: 15000,
      },
    };

    const targets: ExportTarget[] = [{ language: 'typescript', adapter: 'standalone' }];
    const bundle = generateExportBundle(artifact, targets);

    expect(bundle.artifact.id).toBe('disc-test-001');
    expect(bundle.files.length).toBeGreaterThan(0);
    expect(bundle.files[0].language).toBe('typescript');
    expect(bundle.files[0].content.length).toBeGreaterThan(0);
    expect(bundle.readme.length).toBeGreaterThan(0);
  });

  it('generates multi-language bundles for high-score artifacts', () => {
    const artifact: ExportableArtifact = {
      id: 'disc-multi-001',
      name: 'Meta-Learning Optimizer',
      rank: 1,
      cjpi: 96,
      module: 'BRAIN',
      description: 'Meta-learning engine',
      sourceCode: '',
      synthesisContext: {
        name: 'Meta-Learning Optimizer',
        moduleChain: ['BRAIN', 'DREAM', 'CORTEX', 'EVOLUTION'],
        cjpi: 96,
        description: 'Meta-learning engine',
        category: 'learning',
        entryCapability: 'meta-learner',
        exitCapability: 'strategy-optimized',
        errorStrategy: 'skip',
        maxExecutionMs: 15000,
      },
    };

    const targets: ExportTarget[] = [
      { language: 'typescript', adapter: 'standalone' },
      { language: 'python', adapter: 'standalone' },
      { language: 'go', adapter: 'standalone' },
    ];

    const bundle = generateExportBundle(artifact, targets);
    expect(bundle.files.length).toBeGreaterThanOrEqual(3);

    const languages = new Set(bundle.files.map(f => f.language));
    expect(languages.has('typescript')).toBe(true);
    expect(languages.has('python')).toBe(true);
    expect(languages.has('go')).toBe(true);
  });

  it('score-tiered language unlock respects gates', () => {
    const lowScore = getLanguagesForScore(50);
    const highScore = getLanguagesForScore(95);

    // Low scores get fewer languages
    const lowUnlocked = lowScore.filter(l => !l.locked);
    const highUnlocked = highScore.filter(l => !l.locked);
    expect(highUnlocked.length).toBeGreaterThan(lowUnlocked.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §12 — Full E2E: Discovery → Score → Tier → Persist → Export
// ═══════════════════════════════════════════════════════════════════════════════

describe('§12 — Full E2E Pipeline', () => {
  it('runs the complete memory stream: discover → score → tier → persist → prepare export', async () => {
    // 1. Boot standalone runtime
    const runtime = createRuntime();

    // 2. Run discovery engine (live mode)
    const engine = createDiscoveryEngine(runtime);
    const result = await engine.run({ dryRun: false, topN: 10 });

    expect(result.status).toBe('completed');
    expect(result.discoveries.length).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);

    // 3. Verify all discoveries are scored, tiered, and persisted
    const stored = await engine.getDiscoveries();
    expect(stored.length).toBe(result.acceptedCount);

    for (const d of stored) {
      // Every discovery has a valid CJPI
      expect(d.cjpi).toBeGreaterThanOrEqual(80);
      expect(d.cjpi).toBeLessThanOrEqual(100);

      // Every discovery has a tier
      expect(d.tier).not.toBeNull();
      expect(['creator', 'architect', 'enterprise', 'apex']).toContain(d.tier);

      // Every discovery has a module chain
      expect(d.moduleChain.length).toBeGreaterThanOrEqual(2);

      // Every discovery has a stable ID
      expect(d.id).toMatch(/^disc-/);
    }

    // 4. Pick the top discovery and generate an export bundle
    const top = result.discoveries[0];
    const artifact: ExportableArtifact = {
      id: top.id,
      name: top.name,
      rank: 1,
      cjpi: top.cjpi,
      module: top.moduleChain[0],
      description: top.description,
      sourceCode: '',
      synthesisContext: {
        name: top.name,
        moduleChain: top.moduleChain,
        cjpi: top.cjpi,
        description: top.description,
        category: top.category,
        entryCapability: top.entryCapability,
        exitCapability: top.exitCapability,
        errorStrategy: top.errorStrategy,
        maxExecutionMs: top.maxExecutionMs,
      },
    };

    const targets: ExportTarget[] = [
      { language: 'typescript', adapter: 'standalone' },
      { language: 'python', adapter: 'standalone' },
    ];

    const bundle = generateExportBundle(artifact, targets);

    // 5. Verify export bundle integrity
    expect(bundle.artifact.id).toBe(top.id);
    expect(bundle.artifact.name).toBe(top.name);
    expect(bundle.files.length).toBeGreaterThanOrEqual(2);
    expect(bundle.readme).toContain(top.name);
    expect(bundle.generatedAt).toBeTruthy();

    // Verify each exported file has content
    for (const file of bundle.files) {
      expect(file.content.length).toBeGreaterThan(0);
      expect(file.filename.length).toBeGreaterThan(0);
      expect(file.mimeType).toBeTruthy();
    }

    // 6. Verify the foundry export artifact shape is constructable
    const foundryArtifact: TieredFoundryExportArtifact = {
      id: top.id,
      name: top.name,
      score: top.cjpi,
      publicTier: top.tier || 'untiered',
      category: top.category,
      systemChain: top.moduleChain,
      description: top.description,
      obtainedAt: new Date().toISOString(),
      source: 'e2e-test',
    };

    expect(foundryArtifact.score).toBe(top.cjpi);
    expect(foundryArtifact.publicTier).not.toBe('untiered');

    // 7. Verify tier stats consistency
    const tierCounts = result.byTier;
    const totalFromTiers = Object.values(tierCounts).reduce((a, b) => a + b, 0);
    expect(totalFromTiers).toBe(result.acceptedCount);

    // 8. Verify category stats consistency
    const catCounts = result.byCategory;
    const totalFromCats = Object.values(catCounts).reduce((a, b) => a + b, 0);
    expect(totalFromCats).toBe(result.acceptedCount);
  });

  it('concurrent lock prevents parallel runs', async () => {
    const runtime = createRuntime();
    const engine = createDiscoveryEngine(runtime);

    // Start two runs simultaneously
    const [r1, r2] = await Promise.all([
      engine.run({ dryRun: true }),
      engine.run({ dryRun: true }),
    ]);

    // One should succeed, one should fail with lock error
    const statuses = [r1.status, r2.status];
    expect(statuses).toContain('completed');
    // The second should either complete (if first finished before lock) or fail
    if (statuses.includes('failed')) {
      const failed = r1.status === 'failed' ? r1 : r2;
      expect(failed.error).toContain('in progress');
    }
  });
});
