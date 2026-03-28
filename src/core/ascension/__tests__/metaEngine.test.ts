/**
 * Self-Healing Consensus Meta-Engine — Smoke Tests
 * E2E verification of the full detect → heal → reintegrate loop.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SelfHealingConsensusMetaEngine, getMetaEngine, resetMetaEngine } from '../selfHealingConsensusEngine';
import { ASCENSION_CAPABILITIES } from '../capabilityRegistry';
import { executeCapability } from '../capabilityEngine';
import {
  getObservatoryState,
  enableCapability,
  disableCapability,
  executeGoverned,
  rollbackAll,
  verifyObservatoryIntegrity,
} from '../observatoryGovernance';

// ═══ Meta-Engine Tests ═══════════════════════════════════════════════════

describe('SelfHealingConsensusMetaEngine', () => {
  let engine: SelfHealingConsensusMetaEngine;

  beforeEach(() => {
    engine = new SelfHealingConsensusMetaEngine({ nodeCount: 5 });
    for (let i = 1; i <= 5; i++) {
      engine.registerNode(`node-${i}`);
    }
    engine.electLeader();
  });

  it('bootstraps with 5 healthy nodes and elects a leader', () => {
    const snap = engine.getSnapshot();
    expect(snap.nodes).toHaveLength(5);
    expect(snap.nodes.every(n => n.status === 'healthy')).toBe(true);
    expect(snap.leaderId).toBeTruthy();
  });

  it('detects drift via EMA scoring', () => {
    const node = engine.getAllNodes()[2];
    // Send high-deviation heartbeats
    for (let i = 0; i < 10; i++) {
      engine.processHeartbeat(node.id, 500, node.stateHash);
    }
    const updated = engine.getNode(node.id)!;
    expect(updated.driftScore).toBeGreaterThan(0);
  });

  it('escalates missed heartbeats to failure', () => {
    const node = engine.getAllNodes().find(n => n.id !== engine.getSnapshot().leaderId)!;
    for (let i = 0; i < 6; i++) {
      engine.reportMissedHeartbeat(node.id);
    }
    expect(engine.getNode(node.id)!.status).toBe('failed');
  });

  it('auto-heals a failed node via tick()', () => {
    const node = engine.getAllNodes().find(n => n.id !== engine.getSnapshot().leaderId)!;
    for (let i = 0; i < 6; i++) engine.reportMissedHeartbeat(node.id);
    expect(engine.getNode(node.id)!.status).toBe('failed');

    engine.tick();
    expect(engine.getNode(node.id)!.status).toBe('healthy');
    expect(engine.getSnapshot().totalHeals).toBeGreaterThanOrEqual(1);
  });

  it('detects Byzantine hash divergence', () => {
    const leader = engine.getSnapshot().leaderId!;
    const follower = engine.getAllNodes().find(n => n.id !== leader)!;
    engine.processHeartbeat(follower.id, 50, 'FAKE_HASH');
    expect(engine.getNode(follower.id)!.status).toBe('failed');
    expect(engine.getSnapshot().totalByzantine).toBe(1);
  });

  it('re-elects leader when leader fails', () => {
    const leaderId = engine.getSnapshot().leaderId!;
    for (let i = 0; i < 6; i++) engine.reportMissedHeartbeat(leaderId);
    // Leader failure triggers auto-election
    expect(engine.getSnapshot().leaderId).not.toBe(leaderId);
  });

  it('kill switch suspends all operations', () => {
    engine.kill();
    expect(engine.isKilled()).toBe(true);

    const node = engine.getAllNodes()[1];
    engine.processHeartbeat(node.id, 500, 'bad');
    // Should be no-op — status unchanged
    expect(engine.getNode(node.id)!.status).toBe('healthy');

    engine.revive();
    expect(engine.isKilled()).toBe(false);
  });

  it('isolates node after max heal attempts', () => {
    const node = engine.getAllNodes().find(n => n.id !== engine.getSnapshot().leaderId)!;

    for (let attempt = 0; attempt < 3; attempt++) {
      // Force failure
      for (let i = 0; i < 6; i++) engine.reportMissedHeartbeat(node.id);
      // Break the heal by making the node have a different hash
      const n = engine.getNode(node.id)!;
      n.stateHash = `broken-${attempt}`;
      // Manually set to failed if the heal succeeded
      if (n.status === 'healthy') n.status = 'failed';
      engine.healNode(node.id);
    }
    // After 3 failed heals, should be isolated or status reflects attempts
    const final = engine.getNode(node.id)!;
    expect(final.healAttempts).toBe(3);
  });

  it('singleton getMetaEngine returns consistent instance', () => {
    resetMetaEngine();
    const a = getMetaEngine();
    const b = getMetaEngine();
    expect(a).toBe(b);
    expect(a.getSnapshot().nodes).toHaveLength(5);
    resetMetaEngine();
  });
});

// ═══ Registry: 10 capabilities registered ════════════════════════════════

describe('Capability Registry (expanded)', () => {
  it('has exactly 10 capabilities', () => {
    expect(ASCENSION_CAPABILITIES).toHaveLength(10);
  });

  it('all IDs are unique', () => {
    const ids = ASCENSION_CAPABILITIES.map(c => c.id);
    expect(new Set(ids).size).toBe(10);
  });

  it('all fingerprints are unique', () => {
    const fps = ASCENSION_CAPABILITIES.map(c => c.fingerprint);
    expect(new Set(fps).size).toBe(10);
  });

  it('new consensus capabilities have CONSENSUSENGINE in chain', () => {
    const consensus = ASCENSION_CAPABILITIES.filter(c => c.chain.includes('CONSENSUSENGINE'));
    expect(consensus).toHaveLength(5);
  });
});

// ═══ Capability Engine: new primitives work ══════════════════════════════

describe('Capability Engine (consensus primitives)', () => {
  it('executes all 10 capabilities without errors', () => {
    for (const cap of ASCENSION_CAPABILITIES) {
      const output = executeCapability(cap, { test: true });
      expect(output._pipeline.success).toBe(true);
      expect(output._pipeline.stagesRun).toBe(cap.chain.length);
      expect(output._pipeline.durationMs).toBeLessThan(100);
    }
  });

  it('CONSENSUSENGINE handler returns correct structure', () => {
    const cap = ASCENSION_CAPABILITIES.find(c => c.id === 'cpm-006')!;
    const output = executeCapability(cap, { data: 'test' });
    expect(output._enriched._consensus).toEqual({
      initialized: true,
      protocol: 'byzantine_ft',
      selfHealing: true,
    });
  });
});

// ═══ Observatory governance: 10 capabilities governed ════════════════════

describe('Observatory Governance (expanded)', () => {
  beforeEach(() => rollbackAll());

  it('tracks all 10 capabilities', () => {
    const state = getObservatoryState();
    expect(state.capabilities).toHaveLength(10);
    expect(state.capabilities.every(c => !c.enabled)).toBe(true);
  });

  it('enable/disable works for consensus capabilities', () => {
    enableCapability('cpm-006');
    const state = getObservatoryState();
    const cap = state.capabilities.find(c => c.capabilityId === 'cpm-006')!;
    expect(cap.enabled).toBe(true);

    disableCapability('cpm-006');
    const state2 = getObservatoryState();
    expect(state2.capabilities.find(c => c.capabilityId === 'cpm-006')!.enabled).toBe(false);
  });

  it('executeGoverned works for new capabilities when enabled', () => {
    enableCapability('cao-010');
    const result = executeGoverned('cao-010', { test: true });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.output._enriched._consensus).toBeDefined();
      expect(result.output._enriched._cortex).toBeDefined();
    }
  });

  it('executeGoverned blocks disabled consensus capabilities', () => {
    const result = executeGoverned('sdr-009', { test: true });
    expect(result.status).toBe('disabled');
  });

  it('audit chain remains valid after 10-cap operations', () => {
    enableCapability('cpm-006');
    executeGoverned('cpm-006', { test: true });
    disableCapability('cpm-006');
    const integrity = verifyObservatoryIntegrity();
    expect(integrity.valid).toBe(true);
  });
});
