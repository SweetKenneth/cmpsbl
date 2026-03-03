/**
 * Dependency Graph Audit Tests
 * Phase 1 validation: cycle exclusion, graph reset, unknown dep warnings
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerModule,
  computeBootOrder,
  clearGraph,
  getGraphSize,
  getModule,
  getDependents,
  getTransitiveDependencies,
  getReadyModules,
  getFailedModules,
  setModuleStatus,
} from '@/lib/substrate/dependency-graph';

beforeEach(() => {
  clearGraph();
});

describe('dependency-graph', () => {
  it('registers modules and computes linear boot order', () => {
    registerModule('core', 'CORE');
    registerModule('system', 'SYSTEM', ['core']);
    registerModule('ocg', 'OCG', ['system']);

    const { order, cycles } = computeBootOrder();
    expect(cycles).toHaveLength(0);
    expect(order).toEqual(['core', 'system', 'ocg']);
  });

  it('detects cycles and excludes cyclic nodes from boot order', () => {
    registerModule('a', 'A', ['b']);
    registerModule('b', 'B', ['a']);
    registerModule('c', 'C');

    const { order, cycles } = computeBootOrder();
    expect(cycles.length).toBeGreaterThan(0);
    // Cyclic nodes excluded from boot order
    expect(order).not.toContain('a');
    expect(order).not.toContain('b');
    // Non-cyclic node included
    expect(order).toContain('c');
  });

  it('marks cyclic nodes as failed', () => {
    registerModule('x', 'X', ['y']);
    registerModule('y', 'Y', ['x']);

    computeBootOrder();
    expect(getModule('x')?.status).toBe('failed');
    expect(getModule('y')?.status).toBe('failed');
  });

  it('clearGraph resets all state', () => {
    registerModule('a', 'A');
    registerModule('b', 'B');
    expect(getGraphSize()).toBe(2);

    clearGraph();
    expect(getGraphSize()).toBe(0);
  });

  it('warns on unregistered dependency', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerModule('a', 'A', ['nonexistent']);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unregistered module "nonexistent"')
    );
    warnSpy.mockRestore();
  });

  it('getDependents returns correct reverse deps', () => {
    registerModule('core', 'CORE');
    registerModule('sys', 'SYSTEM', ['core']);
    registerModule('ocg', 'OCG', ['core']);

    expect(getDependents('core').sort()).toEqual(['ocg', 'sys']);
  });

  it('getTransitiveDependencies traverses full chain', () => {
    registerModule('a', 'A');
    registerModule('b', 'B', ['a']);
    registerModule('c', 'C', ['b']);

    expect(getTransitiveDependencies('c')).toEqual(['b', 'a']);
  });

  it('setModuleStatus and status filters work', () => {
    registerModule('m1', 'M1');
    registerModule('m2', 'M2');

    setModuleStatus('m1', 'ready', 42);
    setModuleStatus('m2', 'failed');

    expect(getReadyModules()).toHaveLength(1);
    expect(getFailedModules()).toHaveLength(1);
    expect(getModule('m1')?.loadTimeMs).toBe(42);
  });
});
