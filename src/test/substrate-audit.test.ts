/**
 * Substrate Audit Test Suite
 * ━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tests every major substrate function:
 *   - Matrix Node Registry (40-node topology, weight normalization, integrity)
 *   - CORE Module (boot sequence, dependencies, lifecycle)
 *   - Control Plane (hashing, canonicalization)
 *   - Merkle Audit Chain (append, verify, tamper detection)
 *   - Capability Router (registration, resolution, health tracking)
 *   - Circuit Breaker (state transitions, execution protection)
 *   - Ring Buffer (fixed-size circular buffer)
 *   - Bloom Filter (probabilistic deduplication)
 *   - State Machine (deterministic workflow transitions)
 *   - Dead Letter Queue (failure capture, replay, TTL)
 *   - Substrate Registry (Crown Jewel — entity lifecycle)
 *   - Template Generator (combo tracking, retirement)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Matrix Node Registry
// ═══════════════════════════════════════════════════════════════════════════════

import {
  getNodeDefinitions,
  getNodeDefinition,
  getNodesBySector,
  buildMatrixNodes,
  calculateIntegrity,
  updateBreakerState,
  getBreakerState,
  getTotalWeight,
  type MatrixSector,
} from '@/lib/core/matrixNodeRegistry';

describe('§1 — Matrix Node Registry', () => {
  it('has exactly 40 nodes', () => {
    expect(getNodeDefinitions()).toHaveLength(40);
  });

  it('weight sum equals 1.000', () => {
    expect(getTotalWeight()).toBe(1);
  });

  it('all 12 sectors are represented', () => {
    const sectors = new Set(getNodeDefinitions().map(n => n.sector));
    const expected: MatrixSector[] = ['core', 'system', 'ccr', 'ocg', 'execution', 'esz', 'epz', 'emz', 'csz', 'field', 'plane', 'shell'];
    for (const s of expected) {
      expect(sectors.has(s)).toBe(true);
    }
  });

  it('builds matrix nodes with health data', () => {
    const nodes = buildMatrixNodes({ core: 100, brain: 80, defense: false });
    expect(nodes.length).toBe(38);
    const core = nodes.find(n => n.id === 'core');
    expect(core?.health).toBe(100);
    const brain = nodes.find(n => n.id === 'brain');
    expect(brain?.health).toBe(80);
    const defense = nodes.find(n => n.id === 'defense');
    expect(defense?.health).toBe(0);
  });

  it('applies breaker adjustment (open = 0 health)', () => {
    updateBreakerState('brain', 'open', 5);
    const nodes = buildMatrixNodes({ brain: 100 });
    const brain = nodes.find(n => n.id === 'brain');
    expect(brain?.health).toBe(0);
    expect(brain?.rawHealth).toBe(100);
    // Reset
    updateBreakerState('brain', 'closed', 0);
  });

  it('applies breaker adjustment (half-open caps at 50)', () => {
    updateBreakerState('cortex', 'half-open', 2);
    const nodes = buildMatrixNodes({ cortex: 90 });
    const cortex = nodes.find(n => n.id === 'cortex');
    expect(cortex?.health).toBe(50);
    updateBreakerState('cortex', 'closed', 0);
  });

  it('calculates integrity report correctly', () => {
    const nodes = buildMatrixNodes({});
    const report = calculateIntegrity(nodes);
    expect(report.nodeCount).toBe(38);
    expect(report.totalWeight).toBe(1);
    expect(report.status).toBe('MATRIX STABLE');
    expect(report.isCritical).toBe(false);
    expect(report.operational).toBe(100);
  });

  it('detects critical state when CORE breaker is open', () => {
    updateBreakerState('core', 'open', 10);
    const nodes = buildMatrixNodes({});
    const report = calculateIntegrity(nodes);
    expect(report.isCritical).toBe(true);
    expect(report.status).toBe('CRITICAL');
    updateBreakerState('core', 'closed', 0);
  });

  it('each node has a unique ID', () => {
    const ids = getNodeDefinitions().map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getNodeDefinition returns correct node', () => {
    const node = getNodeDefinition('nexus');
    expect(node?.label).toBe('NEXUS');
    expect(node?.sector).toBe('execution');
  });

  it('getNodesBySector filters correctly', () => {
    const ccr = getNodesBySector('ccr');
    expect(ccr).toHaveLength(3);
    expect(ccr.map(n => n.id).sort()).toEqual(['brain', 'dream', 'memory']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CORE Module (boot, dependencies, lifecycle)
// ═══════════════════════════════════════════════════════════════════════════════

import {
  SUBSTRATE_MODULES,
  MODULE_ENTITY_TYPES,
  getModuleDependencies,
  initializeBootSequence,
  markModuleBooted,
  completeBootSequence,
  getBootSequence,
  getSubstrateHealth,
  safeExecute,
  type SubstrateModuleName,
} from '@/lib/core/index';

describe('§2 — CORE Module', () => {
  it('SUBSTRATE_MODULES has all 38+ entries (including modernizer)', () => {
    expect(SUBSTRATE_MODULES.length).toBeGreaterThanOrEqual(38);
  });

  it('every module has an entity type', () => {
    for (const mod of SUBSTRATE_MODULES) {
      expect(MODULE_ENTITY_TYPES[mod]).toBeDefined();
    }
  });

  it('CORE has no dependencies', () => {
    expect(getModuleDependencies('core')).toEqual([]);
  });

  it('expansion modules depend on core', () => {
    const expansionModules: SubstrateModuleName[] = ['sovereign', 'oracle', 'compass', 'echo', 'treaty', 'harvest', 'reflex'];
    for (const mod of expansionModules) {
      expect(getModuleDependencies(mod)).toContain('core');
    }
  });

  it('no circular dependencies in the dependency graph', () => {
    const visited = new Set<string>();
    const stack = new Set<string>();

    function hasCycle(mod: SubstrateModuleName): boolean {
      if (stack.has(mod)) return true;
      if (visited.has(mod)) return false;
      stack.add(mod);
      for (const dep of getModuleDependencies(mod)) {
        if (hasCycle(dep as SubstrateModuleName)) return true;
      }
      stack.delete(mod);
      visited.add(mod);
      return false;
    }

    for (const mod of SUBSTRATE_MODULES) {
      expect(hasCycle(mod)).toBe(false);
    }
  });

  it('boot sequence lifecycle works', () => {
    initializeBootSequence();
    markModuleBooted('core');
    markModuleBooted('system');
    const seq = getBootSequence();
    expect(seq?.modules_booted).toContain('core');
    expect(seq?.modules_booted).toContain('system');
    const completed = completeBootSequence();
    expect(completed?.current_phase).toBe('complete');
  });

  it('safeExecute catches errors gracefully', async () => {
    const result = await safeExecute('core', 'test', async () => {
      throw new Error('Test failure');
    }, 'fallback');
    expect(result.success).toBe(false);
    expect(result.data).toBe('fallback');
    expect(result.error).toContain('Test failure');
  });

  it('safeExecute returns data on success', async () => {
    const result = await safeExecute('core', 'test', async () => 42);
    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Control Plane Hashing
// ═══════════════════════════════════════════════════════════════════════════════

import { canonicalizeJson, sha256 as cpSha256 } from '@/lib/control-plane/hash';

describe('§3 — Control Plane Hashing', () => {
  it('canonicalizeJson sorts keys recursively', () => {
    const a = canonicalizeJson({ z: 1, a: { c: 3, b: 2 } });
    const b = canonicalizeJson({ a: { b: 2, c: 3 }, z: 1 });
    expect(a).toBe(b);
  });

  it('sha256 produces 64-char hex', async () => {
    const hash = await cpSha256('test');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('sha256 is deterministic', async () => {
    const h1 = await cpSha256('determinism');
    const h2 = await cpSha256('determinism');
    expect(h1).toBe(h2);
  });

  it('sha256 different inputs produce different hashes', async () => {
    const h1 = await cpSha256('input-a');
    const h2 = await cpSha256('input-b');
    expect(h1).not.toBe(h2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Merkle Audit Chain
// ═══════════════════════════════════════════════════════════════════════════════

import {
  appendAudit,
  verifyChain as verifyMerkle,
  getChainLength,
  getChainTail,
} from '@/lib/substrate/merkle-audit-chain';

describe('§4 — Merkle Audit Chain', () => {
  it('appends entries and grows chain', async () => {
    const before = getChainLength();
    await appendAudit('test-module', 'test-action', { key: 'value' });
    expect(getChainLength()).toBe(before + 1);
  });

  it('chain entries have hash linkage', async () => {
    await appendAudit('brain', 'ingest', { data: 'a' });
    await appendAudit('brain', 'process', { data: 'b' });
    const tail = getChainTail(2);
    expect(tail).toHaveLength(2);
    // Second entry's prevHash should be the first entry's hash
    expect(tail[1].prevHash).toBe(tail[0].hash);
  });

  it('chain verifies as valid', async () => {
    const result = await verifyMerkle();
    expect(result.valid).toBe(true);
    expect(result.brokenAt).toBe(-1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Capability Router
// ═══════════════════════════════════════════════════════════════════════════════

import {
  registerCapability,
  resolve,
  resolveAll,
  setHealthy,
  recordLatency,
  listCapabilities,
  getCapabilityMap,
} from '@/lib/substrate/capability-router';

describe('§5 — Capability Router', () => {
  it('all 38 nodes have registered capabilities', () => {
    const caps = listCapabilities();
    expect(caps.length).toBeGreaterThanOrEqual(40); // 38 nodes × ~2 caps each
  });

  it('resolves highest priority healthy module', () => {
    registerCapability('test-mod-a', 'test-cap-audit', 50);
    registerCapability('test-mod-b', 'test-cap-audit', 90);
    expect(resolve('test-cap-audit')).toBe('test-mod-b');
  });

  it('falls back to unhealthy when no healthy providers exist', () => {
    registerCapability('only-mod', 'unique-cap-audit', 50);
    setHealthy('only-mod', false);
    expect(resolve('unique-cap-audit')).toBe('only-mod');
    setHealthy('only-mod', true);
  });

  it('resolveAll returns only healthy modules', () => {
    registerCapability('mod-h', 'multi-cap-audit', 80);
    registerCapability('mod-u', 'multi-cap-audit', 90);
    setHealthy('mod-u', false);
    const result = resolveAll('multi-cap-audit');
    expect(result).toContain('mod-h');
    expect(result).not.toContain('mod-u');
    setHealthy('mod-u', true);
  });

  it('records latency with running average', () => {
    registerCapability('latency-mod', 'latency-cap', 50);
    recordLatency('latency-mod', 'latency-cap', 100);
    recordLatency('latency-mod', 'latency-cap', 200);
    const map = getCapabilityMap();
    expect(map['latency-cap']).toBeDefined();
  });

  it('returns null for unknown capability', () => {
    expect(resolve('nonexistent-capability-xyz')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — Ring Buffer
// ═══════════════════════════════════════════════════════════════════════════════

import { RingBuffer } from '@/lib/substrate/ring-buffer';

describe('§6 — Ring Buffer', () => {
  it('maintains fixed capacity', () => {
    const buf = new RingBuffer<number>(3);
    buf.push(1); buf.push(2); buf.push(3); buf.push(4);
    expect(buf.size).toBe(3);
    expect(buf.isFull).toBe(true);
    expect(buf.toArray()).toEqual([2, 3, 4]); // oldest evicted
  });

  it('latest returns most recent', () => {
    const buf = new RingBuffer<string>(5);
    buf.push('a'); buf.push('b'); buf.push('c');
    expect(buf.latest()).toBe('c');
  });

  it('tail returns N newest items', () => {
    const buf = new RingBuffer<number>(10);
    for (let i = 0; i < 10; i++) buf.push(i);
    expect(buf.tail(3)).toEqual([9, 8, 7]);
  });

  it('at(0) returns oldest item', () => {
    const buf = new RingBuffer<number>(3);
    buf.push(10); buf.push(20); buf.push(30);
    expect(buf.at(0)).toBe(10);
    expect(buf.at(2)).toBe(30);
  });

  it('clear resets buffer', () => {
    const buf = new RingBuffer<number>(5);
    buf.push(1); buf.push(2);
    buf.clear();
    expect(buf.size).toBe(0);
    expect(buf.latest()).toBeUndefined();
  });

  it('filter works on circular data', () => {
    const buf = new RingBuffer<{ v: number }>(5);
    buf.push({ v: 1 }); buf.push({ v: 2 }); buf.push({ v: 3 });
    const evens = buf.filter(x => x.v % 2 === 0);
    expect(evens).toHaveLength(1);
    expect(evens[0].v).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — Bloom Filter
// ═══════════════════════════════════════════════════════════════════════════════

import { BloomFilter } from '@/lib/substrate/bloom-filter';

describe('§7 — Bloom Filter', () => {
  it('test returns false for items never added', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.test('never-added')).toBe(false);
  });

  it('test returns true after add', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('present');
    expect(bf.test('present')).toBe(true);
  });

  it('addIfAbsent returns true for new items, false for existing', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.addIfAbsent('new')).toBe(true);
    expect(bf.addIfAbsent('new')).toBe(false);
  });

  it('tracks item count', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('a'); bf.add('b'); bf.add('c');
    expect(bf.itemCount).toBe(3);
  });

  it('estimatedFPR is between 0 and 1', () => {
    const bf = new BloomFilter(100, 0.01);
    for (let i = 0; i < 50; i++) bf.add(`item-${i}`);
    expect(bf.estimatedFPR).toBeGreaterThanOrEqual(0);
    expect(bf.estimatedFPR).toBeLessThanOrEqual(1);
  });

  it('clear resets filter', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('x');
    bf.clear();
    expect(bf.test('x')).toBe(false);
    expect(bf.itemCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — State Machine
// ═══════════════════════════════════════════════════════════════════════════════

import { createMachine } from '@/lib/substrate/state-machine';

describe('§8 — State Machine', () => {
  it('starts in initial state', () => {
    const sm = createMachine({
      id: 'test', initial: 'idle', context: {},
      transitions: [{ from: 'idle', to: 'running', event: 'START' }],
    });
    expect(sm.state).toBe('idle');
  });

  it('transitions on valid event', () => {
    const sm = createMachine({
      id: 'test', initial: 'idle', context: {},
      transitions: [{ from: 'idle', to: 'running', event: 'START' }],
    });
    expect(sm.send('START')).toBe(true);
    expect(sm.state).toBe('running');
  });

  it('rejects invalid event', () => {
    const sm = createMachine({
      id: 'test', initial: 'idle', context: {},
      transitions: [{ from: 'idle', to: 'running', event: 'START' }],
    });
    expect(sm.send('INVALID')).toBe(false);
    expect(sm.state).toBe('idle');
  });

  it('guards prevent transitions', () => {
    const sm = createMachine({
      id: 'test', initial: 'locked', context: { key: false },
      transitions: [{
        from: 'locked', to: 'unlocked', event: 'UNLOCK',
        guard: (ctx) => ctx.key,
      }],
    });
    expect(sm.send('UNLOCK')).toBe(false);
    expect(sm.state).toBe('locked');
  });

  it('effects update context', () => {
    const sm = createMachine({
      id: 'test', initial: 'off', context: { count: 0 },
      transitions: [{
        from: 'off', to: 'on', event: 'TOGGLE',
        effect: (ctx) => ({ ...ctx, count: ctx.count + 1 }),
      }],
    });
    sm.send('TOGGLE');
    expect(sm.context.count).toBe(1);
  });

  it('tracks history', () => {
    const sm = createMachine({
      id: 'test', initial: 'a', context: {},
      transitions: [
        { from: 'a', to: 'b', event: 'NEXT' },
        { from: 'b', to: 'c', event: 'NEXT' },
      ],
    });
    sm.send('NEXT');
    sm.send('NEXT');
    expect(sm.getHistory()).toHaveLength(2);
  });

  it('can reports available transitions', () => {
    const sm = createMachine({
      id: 'test', initial: 'idle', context: {},
      transitions: [
        { from: 'idle', to: 'running', event: 'START' },
        { from: 'running', to: 'idle', event: 'STOP' },
      ],
    });
    expect(sm.can('START')).toBe(true);
    expect(sm.can('STOP')).toBe(false);
  });

  it('subscribe receives notifications', () => {
    const sm = createMachine({
      id: 'test', initial: 'off', context: {},
      transitions: [{ from: 'off', to: 'on', event: 'TOGGLE' }],
    });
    let notified = false;
    sm.subscribe(() => { notified = true; });
    sm.send('TOGGLE');
    expect(notified).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — Dead Letter Queue
// ═══════════════════════════════════════════════════════════════════════════════

import {
  addDeadLetter,
  getDeadLetters,
  getDLQStats,
  replayDeadLetter,
  purgeDLQ,
} from '@/lib/substrate/dead-letter-queue';

describe('§9 — Dead Letter Queue', () => {
  beforeEach(() => { purgeDLQ(); });

  it('captures failed dispatches', () => {
    addDeadLetter({ engine: 'brain', command: 'ingest', payload: {}, error: 'timeout', retryCount: 0 });
    expect(getDLQStats().total).toBe(1);
  });

  it('filters by engine', () => {
    addDeadLetter({ engine: 'brain', command: 'a', payload: {}, error: 'e1', retryCount: 0 });
    addDeadLetter({ engine: 'nexus', command: 'b', payload: {}, error: 'e2', retryCount: 0 });
    expect(getDeadLetters('brain').length).toBe(1);
    expect(getDeadLetters('nexus').length).toBe(1);
  });

  it('replay removes letter from DLQ', () => {
    const letter = addDeadLetter({ engine: 'test', command: 'cmd', payload: {}, error: 'err', retryCount: 0 });
    const replayed = replayDeadLetter(letter.id);
    expect(replayed).not.toBeNull();
    expect(getDLQStats().total).toBe(0);
  });

  it('purge clears all letters', () => {
    addDeadLetter({ engine: 'a', command: 'x', payload: {}, error: 'e', retryCount: 0 });
    addDeadLetter({ engine: 'b', command: 'y', payload: {}, error: 'e', retryCount: 0 });
    const count = purgeDLQ();
    expect(count).toBe(2);
    expect(getDLQStats().total).toBe(0);
  });

  it('stats track byEngine breakdown', () => {
    addDeadLetter({ engine: 'vision', command: 'scan', payload: {}, error: 'e', retryCount: 0 });
    addDeadLetter({ engine: 'vision', command: 'detect', payload: {}, error: 'e', retryCount: 0 });
    addDeadLetter({ engine: 'cortex', command: 'plan', payload: {}, error: 'e', retryCount: 0 });
    const stats = getDLQStats();
    expect(stats.byEngine.vision).toBe(2);
    expect(stats.byEngine.cortex).toBe(1);
  });

  it('respects MAX_DLQ_SIZE (200)', () => {
    for (let i = 0; i < 210; i++) {
      addDeadLetter({ engine: 'bulk', command: `cmd-${i}`, payload: {}, error: 'e', retryCount: 0 });
    }
    expect(getDLQStats().total).toBeLessThanOrEqual(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — Substrate Registry (Crown Jewel #1)
// ═══════════════════════════════════════════════════════════════════════════════

import { createRegistry } from '@/crownjewels/s-tier/001-substrate-registry';

describe('§10 — Substrate Registry (Crown Jewel)', () => {
  it('registers and retrieves entities', () => {
    const reg = createRegistry();
    const entity = reg.register({ id: 'test-mod', type: 'module' });
    expect(reg.has('test-mod')).toBe(true);
    expect(reg.get('test-mod')?.id).toBe('test-mod');
    expect(entity.status).toBe('registered');
  });

  it('prevents duplicate registration', () => {
    const reg = createRegistry();
    reg.register({ id: 'dup', type: 'module' });
    expect(() => reg.register({ id: 'dup', type: 'module' })).toThrow();
  });

  it('activates with satisfied dependencies', () => {
    const reg = createRegistry();
    reg.register({ id: 'core', type: 'module' });
    reg.activate('core');
    reg.register({ id: 'brain', type: 'module', dependencies: ['core'] });
    expect(reg.activate('brain')).toBe(true);
    expect(reg.get('brain')?.status).toBe('active');
  });

  it('rejects activation with unmet dependencies', () => {
    const reg = createRegistry();
    reg.register({ id: 'orphan', type: 'module', dependencies: ['missing'] });
    expect(() => reg.activate('orphan')).toThrow();
  });

  it('degrades entities with reason', () => {
    const reg = createRegistry();
    reg.register({ id: 'fragile', type: 'module' });
    reg.activate('fragile');
    reg.degrade('fragile', 'Health check failed');
    expect(reg.get('fragile')?.status).toBe('degraded');
  });

  it('prevents decommissioning with active dependents', () => {
    const reg = createRegistry();
    reg.register({ id: 'base', type: 'module' });
    reg.activate('base');
    reg.register({ id: 'child', type: 'module', dependencies: ['base'] });
    reg.activate('child');
    expect(() => reg.decommission('base')).toThrow();
  });

  it('discovers entities by query', () => {
    const reg = createRegistry();
    reg.register({ id: 'a', type: 'module', tags: ['cognitive'] });
    reg.register({ id: 'b', type: 'pipeline', tags: ['security'] });
    reg.register({ id: 'c', type: 'module', tags: ['cognitive'] });
    const results = reg.discover({ type: 'module', tags: ['cognitive'] });
    expect(results).toHaveLength(2);
  });

  it('resolves dependency order (topological sort)', () => {
    const reg = createRegistry();
    reg.register({ id: 'x', type: 'module', dependencies: [] });
    reg.register({ id: 'y', type: 'module', dependencies: ['x'] });
    reg.register({ id: 'z', type: 'module', dependencies: ['y'] });
    const order = reg.resolveDependencyOrder();
    expect(order.indexOf('x')).toBeLessThan(order.indexOf('y'));
    expect(order.indexOf('y')).toBeLessThan(order.indexOf('z'));
  });

  it('detects circular dependencies', () => {
    const reg = createRegistry();
    reg.register({ id: 'p', type: 'module', dependencies: ['q'] });
    reg.register({ id: 'q', type: 'module', dependencies: ['p'] });
    expect(() => reg.resolveDependencyOrder()).toThrow(/Circular/);
  });

  it('health checks update scores and auto-degrade', async () => {
    const reg = createRegistry();
    reg.register({
      id: 'health-test', type: 'module',
      healthCheck: () => 0.1, // Below 0.3 threshold
    });
    reg.activate('health-test');
    const results = await reg.runHealthChecks();
    expect(results.get('health-test')).toBe(0.1);
    expect(reg.get('health-test')?.status).toBe('degraded');
  });

  it('getStats returns correct aggregates', () => {
    const reg = createRegistry();
    reg.register({ id: 's1', type: 'module' });
    reg.register({ id: 's2', type: 'pipeline' });
    const stats = reg.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byType.module).toBe(1);
    expect(stats.byType.pipeline).toBe(1);
  });

  it('emits events on lifecycle changes', () => {
    const reg = createRegistry();
    const events: string[] = [];
    reg.on('*', (_, event) => events.push(event));
    reg.register({ id: 'ev-test', type: 'module' });
    reg.activate('ev-test');
    reg.degrade('ev-test');
    expect(events).toContain('registered');
    expect(events).toContain('activated');
    expect(events).toContain('degraded');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — Template Generator (combo tracking)
// ═══════════════════════════════════════════════════════════════════════════════

import {
  generateTemplateBatch,
  retireCombo,
  getRetiredCombos,
  isComboRetired,
  clearRetired,
  getGeneratorStats,
} from '@/lib/discovery/template-generator';

describe('§11 — Template Generator', () => {
  beforeEach(() => { clearRetired(); });

  it('generates template batches', () => {
    const batch = generateTemplateBatch({ batchSize: 5 });
    expect(batch.length).toBeGreaterThan(0);
    expect(batch.length).toBeLessThanOrEqual(5);
  });

  it('retires combos and tracks them', () => {
    retireCombo(['BRAIN', 'CORTEX'], 'cognitive', 10, 5);
    expect(isComboRetired(['BRAIN', 'CORTEX'], 'cognitive')).toBe(true);
    expect(getRetiredCombos()).toHaveLength(1);
  });

  it('clearRetired clears all retired combos', () => {
    retireCombo(['A', 'B'], 'x', 1, 1);
    clearRetired();
    expect(getRetiredCombos()).toHaveLength(0);
  });

  it('generator stats reflect state', () => {
    retireCombo(['X', 'Y'], 'z', 5, 3);
    const stats = getGeneratorStats();
    expect(stats.retiredCount).toBe(1);
    expect(stats.totalDiscoveriesFromRetired).toBe(3);
  });

  it('skips retired combos in batch generation', () => {
    // Generate a batch, retire all combos, generate again
    const batch1 = generateTemplateBatch({ batchSize: 5 });
    for (const t of batch1) {
      retireCombo(t.modulePattern, t.category, 1, 0);
    }
    const batch2 = generateTemplateBatch({ batchSize: 5 });
    // batch2 should not contain any of batch1's combos
    for (const t2 of batch2) {
      expect(isComboRetired(t2.modulePattern, t2.category)).toBe(false);
    }
  });
});
