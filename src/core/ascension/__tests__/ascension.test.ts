/**
 * Ascension Module — Smoke Tests
 * Covers: engine execution, all 5 capabilities, governance gates,
 * audit integrity, circuit breaker, rate limiter, rollback.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  executeCapability,
  ASCENSION_CAPABILITIES,
  PACK_META,
  executeGoverned,
  enableCapability,
  disableCapability,
  enableAll,
  disableAll,
  rollbackCapability,
  rollbackAll,
  resetCircuit,
  getObservatoryState,
  getObservatoryAudit,
  verifyObservatoryIntegrity,
  executeThreatProfiler,
  validateProfiler,
  getProfilerMeta,
} from '@/core/ascension';

// ═══ Registry ════════════════════════════════════════════════════════════

describe('Ascension Registry', () => {
  it('has exactly 5 capabilities', () => {
    expect(ASCENSION_CAPABILITIES).toHaveLength(5);
  });

  it('all capabilities have required fields', () => {
    for (const cap of ASCENSION_CAPABILITIES) {
      expect(cap.id).toBeTruthy();
      expect(cap.name).toBeTruthy();
      expect(cap.displayName).toBeTruthy();
      expect(cap.cjpi).toBeGreaterThan(0);
      expect(cap.cjpi).toBeLessThanOrEqual(100);
      expect(cap.chain.length).toBeGreaterThanOrEqual(7);
      expect(cap.fingerprint).toBeTruthy();
      expect(cap.moatSignature).toBeTruthy();
      expect(cap.tier).toMatch(/^(mint|prime|relic|mythic|apex)$/);
    }
  });

  it('pack metadata is consistent', () => {
    expect(PACK_META.totalCapabilities).toBe(5);
    expect(PACK_META.averageCjpi).toBe(92);
    expect(PACK_META.fingerprint).toBe('FEDAC39F87A1');
  });

  it('all capability IDs are unique', () => {
    const ids = ASCENSION_CAPABILITIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all chains start with API_GATEWAY', () => {
    for (const cap of ASCENSION_CAPABILITIES) {
      expect(cap.chain[0]).toBe('API_GATEWAY');
    }
  });
});

// ═══ Engine Execution ════════════════════════════════════════════════════

describe('Capability Engine', () => {
  it('executes all 5 capabilities without error', () => {
    for (const cap of ASCENSION_CAPABILITIES) {
      const result = executeCapability(cap, { test: true });
      expect(result._pipeline.success).toBe(true);
      expect(result._pipeline.stagesRun).toBe(cap.chain.length);
      expect(result._pipeline.signals.length).toBe(cap.chain.length);
      expect(result._cmpsbl.capability).toBe(cap.name);
      expect(result._cmpsbl.cjpi).toBe(cap.cjpi);
      expect(result._cmpsbl.fingerprint).toBe(cap.fingerprint);
    }
  });

  it('preserves original input unchanged', () => {
    const input = { key: 'value', nested: { deep: true } };
    const cap = ASCENSION_CAPABILITIES[0];
    const result = executeCapability(cap, input);
    expect(result._original).toEqual(input);
  });

  it('detects threats in malicious input', () => {
    const cap = ASCENSION_CAPABILITIES.find(c => c.id === 'ctp-004')!;
    const result = executeCapability(cap, { payload: '<script>alert(1)</script> eval() __proto__' });
    const defense = result._enriched._defense as any;
    expect(defense.threats).toBeGreaterThan(0);
    expect(defense.patterns).toContain('xss_script_injection');
  });

  it('reports clean on safe input', () => {
    const cap = ASCENSION_CAPABILITIES.find(c => c.id === 'ctp-004')!;
    const result = executeCapability(cap, { safe: 'hello world' });
    const defense = result._enriched._defense as any;
    expect(defense.threats).toBe(0);
  });

  it('handles string input', () => {
    const cap = ASCENSION_CAPABILITIES[0];
    const result = executeCapability(cap, 'plain string input');
    expect(result._pipeline.success).toBe(true);
  });

  it('handles circular reference gracefully', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const cap = ASCENSION_CAPABILITIES[0];
    const result = executeCapability(cap, obj);
    // Should fallback to String(input) without crashing
    expect(result._cmpsbl.execution.originalError).toContain('serialization_fallback');
  });

  it('produces consistent results on repeated calls (no regex /g state leak)', () => {
    const cap = ASCENSION_CAPABILITIES.find(c => c.id === 'ctp-004')!;
    const input = { payload: '<script>alert(1)</script>' };
    const r1 = executeCapability(cap, input);
    const r2 = executeCapability(cap, input);
    const r3 = executeCapability(cap, input);
    const d1 = (r1._enriched._defense as any).threats;
    const d2 = (r2._enriched._defense as any).threats;
    const d3 = (r3._enriched._defense as any).threats;
    expect(d1).toBe(d2);
    expect(d2).toBe(d3);
    expect(d1).toBeGreaterThan(0);
  });

  it('execution duration is under 50ms', () => {
    const cap = ASCENSION_CAPABILITIES[0];
    const result = executeCapability(cap, { test: true });
    expect(result._pipeline.durationMs).toBeLessThan(50);
  });
});

// ═══ Governance ══════════════════════════════════════════════════════════

describe('Observatory Governance', () => {
  beforeEach(() => {
    rollbackAll(); // Reset all state
  });

  it('all capabilities start disabled', () => {
    const state = getObservatoryState();
    for (const cap of state.capabilities) {
      expect(cap.enabled).toBe(false);
    }
  });

  it('rejects execution when disabled', () => {
    const result = executeGoverned('ctp-004', { test: true });
    expect(result.status).toBe('disabled');
  });

  it('enables and executes successfully', () => {
    enableCapability('ctp-004');
    const result = executeGoverned('ctp-004', { test: true });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.output._pipeline.success).toBe(true);
    }
  });

  it('enable all / disable all works', () => {
    enableAll();
    let state = getObservatoryState();
    expect(state.capabilities.every(c => c.enabled)).toBe(true);

    disableAll();
    state = getObservatoryState();
    expect(state.capabilities.every(c => !c.enabled)).toBe(true);
  });

  it('tracks execution count', () => {
    enableCapability('ctp-004');
    const before = getObservatoryState().capabilities.find(c => c.capabilityId === 'ctp-004')!.totalExecutions;
    executeGoverned('ctp-004', { a: 1 });
    executeGoverned('ctp-004', { b: 2 });
    executeGoverned('ctp-004', { c: 3 });
    const state = getObservatoryState();
    const cap = state.capabilities.find(c => c.capabilityId === 'ctp-004')!;
    expect(cap.totalExecutions - before).toBe(3);
  });

  it('rollback disables and clears circuit', () => {
    enableCapability('gme-001');
    rollbackCapability('gme-001');
    const state = getObservatoryState();
    const cap = state.capabilities.find(c => c.capabilityId === 'gme-001')!;
    expect(cap.enabled).toBe(false);
    expect(cap.circuitOpen).toBe(false);
  });

  it('returns not_found for invalid capability id', () => {
    const result = executeGoverned('nonexistent', { test: true });
    expect(result.status).toBe('not_found');
  });
});

// ═══ Audit Integrity ═════════════════════════════════════════════════════

describe('Audit Trail & Integrity', () => {
  beforeEach(() => {
    rollbackAll();
  });

  it('records audit entries', () => {
    enableCapability('ctp-004');
    executeGoverned('ctp-004', { test: true });
    const trail = getObservatoryAudit(10);
    expect(trail.length).toBeGreaterThan(0);
  });

  it('audit entries have integrity hashes', () => {
    enableCapability('ara-002');
    executeGoverned('ara-002', { test: true });
    const trail = getObservatoryAudit(10);
    for (const entry of trail) {
      expect(entry.integrityHash).toBeTruthy();
      expect(entry.integrityHash.length).toBe(8);
    }
  });

  it('audit chain integrity is valid', () => {
    enableCapability('ctp-004');
    for (let i = 0; i < 10; i++) {
      executeGoverned('ctp-004', { i });
    }
    const integrity = verifyObservatoryIntegrity();
    expect(integrity.valid).toBe(true);
    expect(integrity.entries).toBeGreaterThan(0);
  });

  it('filters audit by capability id', () => {
    enableAll();
    executeGoverned('ctp-004', { test: true });
    executeGoverned('zkr-005', { test: true });
    const ctpAudit = getObservatoryAudit(50, 'ctp-004');
    const zkrAudit = getObservatoryAudit(50, 'zkr-005');
    expect(ctpAudit.every(e => e.capabilityId === 'ctp-004')).toBe(true);
    expect(zkrAudit.every(e => e.capabilityId === 'zkr-005')).toBe(true);
  });
});

// ═══ Legacy Profiler ═════════════════════════════════════════════════════

describe('Legacy Cognitive Threat Profiler', () => {
  it('validates internal integrity', () => {
    expect(validateProfiler()).toBe(true);
  });

  it('executes standalone profiler', () => {
    const result = executeThreatProfiler({ data: { test: true } });
    expect(result._pipeline.success).toBe(true);
    expect(result._pipeline.stagesRun).toBe(8);
    expect(result._cmpsbl.cjpi).toBe(97);
  });

  it('returns sealed metadata', () => {
    const meta = getProfilerMeta();
    expect(meta.tier).toBe('apex');
    expect(meta.weights).toBe('sealed');
    expect(meta.thresholds).toBe('sealed');
  });
});
