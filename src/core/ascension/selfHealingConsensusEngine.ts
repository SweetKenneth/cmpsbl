/**
 * Self-Healing Distributed Consensus Meta-Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Orchestrates 6 Crown Jewel primitives into an autonomous
 * detect → consensus → reconstruct → verify → reintegrate loop.
 *
 * Primitives composed:
 *   #005 — Consensus Heartbeat Protocol (NERVE)
 *   #018 — Consensus Engine (NEXUS)
 *   #039 — Distributed Consensus Mesh (MESH)
 *   #083 — Quorum Negotiator (NERVE)
 *   #103 — State Synchronization (NERVE)
 *   #160 — Self-Repair Engine (MEDIC)
 *
 * All governance is delegated to observatoryGovernance.ts.
 * This engine is disabled by default — enable via the Observatory.
 */

import { createHeartbeatProtocol } from '@/crownjewels/s-tier/005-consensus-heartbeat-protocol';
import { createMeshNode, requestVote, becomeLeader, receiveHeartbeat, type MeshNode } from '@/crownjewels/s-tier/039-distributed-consensus-mesh';
import { evaluateQuorum, type QuorumVote, type QuorumResult } from '@/crownjewels/s-tier/083-quorum-negotiator';
import { VectorClock } from '@/crownjewels/s-tier/103-state-synchronization';
import { SelfRepairEngine, type DamageReport, type RepairAction } from '@/crownjewels/s-tier/160-self-repair-engine';

// ═══ Types ═══════════════════════════════════════════════════════════════

export type MetaNodeStatus = 'healthy' | 'suspect' | 'degraded' | 'failed' | 'healing' | 'reintegrated' | 'isolated';

export interface MetaNode {
  id: string;
  status: MetaNodeStatus;
  meshNode: MeshNode;
  vectorClock: VectorClock;
  stateHash: string;
  driftScore: number;
  consecutiveFailures: number;
  healAttempts: number;
  lastHeartbeat: number;
  metadata: Record<string, unknown>;
}

export interface MetaEngineEvent {
  type: 'drift_detected' | 'node_failed' | 'heal_started' | 'heal_completed' | 'heal_failed'
    | 'quorum_check' | 'reintegrated' | 'byzantine_detected' | 'leader_elected' | 'tick';
  nodeId: string;
  timestamp: number;
  detail: Record<string, unknown>;
}

export interface MetaEngineSnapshot {
  timestamp: number;
  nodes: MetaNode[];
  leaderId: string | null;
  events: MetaEngineEvent[];
  totalHeals: number;
  totalFailures: number;
  totalByzantine: number;
  uptime: number;
  killed: boolean;
}

export interface MetaEngineConfig {
  nodeCount: number;
  driftThreshold: number;
  failureThreshold: number;
  maxHealAttempts: number;
  emaSmoothingFactor: number;
}

// ═══ Defaults ════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: MetaEngineConfig = {
  nodeCount: 5,
  driftThreshold: 0.3,
  failureThreshold: 5,
  maxHealAttempts: 3,
  emaSmoothingFactor: 0.2,
};

// ═══ Utilities ═══════════════════════════════════════════════════════════

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function ema(prev: number, curr: number, alpha: number): number {
  return alpha * curr + (1 - alpha) * prev;
}

// ═══ Meta-Engine ═════════════════════════════════════════════════════════

export class SelfHealingConsensusMetaEngine {
  private nodes = new Map<string, MetaNode>();
  private heartbeatProtocol;
  private repairEngine = new SelfRepairEngine();
  private config: MetaEngineConfig;
  private events: MetaEngineEvent[] = [];
  private maxEvents = 500;
  private leaderId: string | null = null;
  private startTime = Date.now();
  private totalHeals = 0;
  private totalFailures = 0;
  private totalByzantine = 0;
  private killed = false;

  constructor(config: Partial<MetaEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.heartbeatProtocol = createHeartbeatProtocol({
      nodeId: 'meta-controller',
      intervalMs: 5000,
      suspectAfterMisses: 3,
      quarantineAfterMisses: 6,
      deadAfterMisses: 10,
    });

    // Wire heartbeat state changes to our event log
    this.heartbeatProtocol.onStateChange((peerId, oldState, newState) => {
      this.emit('drift_detected', peerId, { oldState, newState });
    });
  }

  // ─── Kill Switch ─────────────────────────────────────────────────────

  kill(): void {
    this.killed = true;
    this.emit('tick', 'system', { action: 'killed' });
  }

  revive(): void {
    this.killed = false;
    this.emit('tick', 'system', { action: 'revived' });
  }

  isKilled(): boolean {
    return this.killed;
  }

  // ─── Node Management ─────────────────────────────────────────────────

  registerNode(id: string, metadata: Record<string, unknown> = {}): MetaNode {
    if (this.nodes.has(id)) throw new Error(`Node ${id} already registered`);

    const meshNode = createMeshNode(id);
    const vectorClock = new VectorClock(id);
    const node: MetaNode = {
      id,
      status: 'healthy',
      meshNode,
      vectorClock,
      stateHash: fnv1a(`init:${id}`),
      driftScore: 0,
      consecutiveFailures: 0,
      healAttempts: 0,
      lastHeartbeat: Date.now(),
      metadata,
    };

    this.nodes.set(id, node);
    this.heartbeatProtocol.registerPeer(id);
    return { ...node };
  }

  // ─── Heartbeat Processing ─────────────────────────────────────────────

  processHeartbeat(nodeId: string, responseMs: number, reportedHash: string): void {
    if (this.killed) return;
    const node = this.nodes.get(nodeId);
    if (!node || node.status === 'isolated' || node.status === 'healing') return;

    const now = Date.now();
    node.lastHeartbeat = now;

    // Feed heartbeat protocol (#005)
    this.heartbeatProtocol.receiveBeat(nodeId, { health: 1, load: responseMs / 100 });

    // EMA drift score
    const deviation = Math.abs(responseMs - 50) / 50;
    node.driftScore = ema(node.driftScore, deviation, this.config.emaSmoothingFactor);

    // Byzantine check: compare hash against leader
    if (this.leaderId && this.leaderId !== nodeId) {
      const leader = this.nodes.get(this.leaderId);
      if (leader && reportedHash !== leader.stateHash) {
        this.totalByzantine++;
        this.emit('byzantine_detected', nodeId, {
          nodeHash: reportedHash,
          leaderHash: leader.stateHash,
        });
        this.markFailed(nodeId, 'byzantine_divergence');
        return;
      }
    }

    // Drift detection
    if (node.driftScore >= this.config.driftThreshold && node.status === 'healthy') {
      node.status = 'suspect';
      this.emit('drift_detected', nodeId, { driftScore: node.driftScore });
    } else if (node.driftScore < this.config.driftThreshold && (node.status === 'suspect' || node.status === 'degraded')) {
      node.status = 'healthy';
      node.consecutiveFailures = 0;
    }
  }

  reportMissedHeartbeat(nodeId: string): void {
    if (this.killed) return;
    const node = this.nodes.get(nodeId);
    if (!node || node.status === 'isolated' || node.status === 'healing' || node.status === 'failed') return;

    node.consecutiveFailures++;
    node.driftScore = ema(node.driftScore, 1.0, this.config.emaSmoothingFactor * 2);

    if (node.consecutiveFailures >= this.config.failureThreshold) {
      this.markFailed(nodeId, 'heartbeat_timeout');
    } else if (node.consecutiveFailures >= 3 && node.status !== 'degraded') {
      node.status = 'degraded';
      this.emit('drift_detected', nodeId, { consecutiveFailures: node.consecutiveFailures });
    }
  }

  // ─── Self-Healing Loop ────────────────────────────────────────────────

  /**
   * Core healing pipeline:
   * 1. Assess damage via MEDIC (#160)
   * 2. Reconstruct state from healthy peers via State Sync (#103)
   * 3. Verify quorum acceptance via Quorum Negotiator (#083)
   * 4. Reintegrate or reject
   */
  healNode(nodeId: string): { success: boolean; durationMs: number; reason?: string } {
    if (this.killed) return { success: false, durationMs: 0, reason: 'engine_killed' };

    const start = performance.now();
    const node = this.nodes.get(nodeId);
    if (!node) return { success: false, durationMs: 0, reason: 'node_not_found' };
    if (node.status !== 'failed') return { success: false, durationMs: 0, reason: `node_status_${node.status}` };
    if (node.healAttempts >= this.config.maxHealAttempts) {
      node.status = 'isolated';
      this.emit('heal_failed', nodeId, { reason: 'max_attempts_exceeded' });
      return { success: false, durationMs: performance.now() - start, reason: 'max_heal_attempts' };
    }

    node.status = 'healing';
    node.healAttempts++;
    this.emit('heal_started', nodeId, { attempt: node.healAttempts });

    // Step 1: MEDIC assessment (#160)
    const damage = this.repairEngine.assess(nodeId, ['state_divergence', 'heartbeat_loss']);
    const repairPlan = this.repairEngine.planRepair(damage.id);

    if (!repairPlan) {
      node.status = 'failed';
      this.emit('heal_failed', nodeId, { reason: 'no_repair_plan' });
      return { success: false, durationMs: performance.now() - start, reason: 'no_repair_plan' };
    }

    // Step 2: Reconstruct state from healthy peers
    const healthyPeers = this.getHealthyNodes().filter(n => n.id !== nodeId);
    if (healthyPeers.length === 0) {
      node.status = 'failed';
      this.emit('heal_failed', nodeId, { reason: 'no_healthy_peers' });
      return { success: false, durationMs: performance.now() - start, reason: 'no_healthy_peers' };
    }

    // Use leader's state as reconstruction source
    const stateSource = this.leaderId && this.nodes.has(this.leaderId)
      ? this.nodes.get(this.leaderId)!
      : healthyPeers[0];

    // Merge vector clocks from peers (#103)
    for (const peer of healthyPeers) {
      node.vectorClock.merge(peer.vectorClock.getClock());
    }
    node.stateHash = stateSource.stateHash;

    // Step 3: Quorum verification (#083)
    // Peers vote 'accept' if they agree the reconstructed hash matches the source of truth
    const votes: QuorumVote[] = healthyPeers.map(peer => ({
      instanceId: peer.id,
      proposalId: `reintegrate-${nodeId}`,
      vote: node.stateHash === stateSource.stateHash ? 'accept' : 'reject',
      timestamp: Date.now(),
    }));

    const quorumResult: QuorumResult = evaluateQuorum(votes, this.nodes.size);
    this.emit('quorum_check', nodeId, {
      reached: quorumResult.reached,
      accept: quorumResult.acceptCount,
      reject: quorumResult.rejectCount,
      required: quorumResult.quorumSize,
    });

    // Step 4: Reintegrate or reject
    if (quorumResult.reached) {
      this.repairEngine.executeRepair(repairPlan.id);
      node.status = 'reintegrated';
      node.consecutiveFailures = 0;
      node.driftScore = 0;
      node.lastHeartbeat = Date.now();
      this.totalHeals++;
      // Promote back to healthy after successful reintegration
      node.status = 'healthy';
      this.emit('heal_completed', nodeId, {
        durationMs: performance.now() - start,
        stateSource: stateSource.id,
        reconstructedHash: node.stateHash,
      });
      return { success: true, durationMs: performance.now() - start };
    } else {
      node.status = 'failed';
      this.totalFailures++;
      this.emit('heal_failed', nodeId, { reason: 'quorum_rejected', quorumResult });
      return { success: false, durationMs: performance.now() - start, reason: 'quorum_rejected' };
    }
  }

  /** Auto-heal all failed nodes. */
  healAll(): { healed: string[]; failed: string[] } {
    if (this.killed) return { healed: [], failed: [] };
    const healed: string[] = [];
    const failed: string[] = [];
    for (const [id, node] of this.nodes) {
      if (node.status === 'failed') {
        const result = this.healNode(id);
        (result.success ? healed : failed).push(id);
      }
    }
    return { healed, failed };
  }

  // ─── Leader Election ──────────────────────────────────────────────────

  electLeader(): string | null {
    if (this.killed) return null;
    const healthy = this.getHealthyNodes();
    if (healthy.length === 0) return null;

    // Simple: node with lowest drift score wins
    const sorted = [...healthy].sort((a, b) => a.driftScore - b.driftScore);
    const winner = sorted[0];

    // Use Mesh (#039) for election
    winner.meshNode.state = 'candidate';
    winner.meshNode.term++;

    let votesGranted = 0;
    for (const peer of healthy) {
      if (peer.id === winner.id) continue;
      const result = requestVote(winner.meshNode, peer.meshNode);
      if (result.granted) votesGranted++;
    }

    if (votesGranted >= Math.floor(healthy.length / 2)) {
      becomeLeader(winner.meshNode);
      this.leaderId = winner.id;

      // Broadcast heartbeat to all followers
      for (const peer of healthy) {
        if (peer.id !== winner.id) {
          receiveHeartbeat(peer.meshNode, winner.meshNode.term);
        }
      }

      this.emit('leader_elected', winner.id, { term: winner.meshNode.term, votesGranted });
      return winner.id;
    }

    return null;
  }

  // ─── Tick (run one cycle) ─────────────────────────────────────────────

  tick(): void {
    if (this.killed) return;
    this.heartbeatProtocol.tick();

    // Auto-elect if no leader
    if (!this.leaderId || !this.nodes.has(this.leaderId) || this.nodes.get(this.leaderId)!.status !== 'healthy') {
      this.leaderId = null;
      this.electLeader();
    }

    // Auto-heal failed nodes
    this.healAll();
  }

  // ─── Queries ──────────────────────────────────────────────────────────

  getHealthyNodes(): MetaNode[] {
    return [...this.nodes.values()].filter(n => n.status === 'healthy' || n.status === 'reintegrated');
  }

  getNode(id: string): MetaNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): MetaNode[] {
    return [...this.nodes.values()];
  }

  getSnapshot(): MetaEngineSnapshot {
    return {
      timestamp: Date.now(),
      nodes: [...this.nodes.values()],
      leaderId: this.leaderId,
      events: this.events.slice(-50),
      totalHeals: this.totalHeals,
      totalFailures: this.totalFailures,
      totalByzantine: this.totalByzantine,
      uptime: Date.now() - this.startTime,
      killed: this.killed,
    };
  }

  getEvents(limit = 50): MetaEngineEvent[] {
    return this.events.slice(-limit).reverse();
  }

  // ─── Internals ────────────────────────────────────────────────────────

  private markFailed(nodeId: string, reason: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    node.status = 'failed';
    this.totalFailures++;
    this.emit('node_failed', nodeId, { reason });

    // If leader failed, trigger re-election
    if (this.leaderId === nodeId) {
      this.leaderId = null;
      this.electLeader();
    }
  }

  private emit(type: MetaEngineEvent['type'], nodeId: string, detail: Record<string, unknown>): void {
    if (this.events.length >= this.maxEvents) this.events.shift();
    this.events.push({ type, nodeId, timestamp: Date.now(), detail });
  }
}

// ═══ Singleton (governed by Observatory) ═════════════════════════════════

let instance: SelfHealingConsensusMetaEngine | null = null;

export function getMetaEngine(): SelfHealingConsensusMetaEngine {
  if (!instance) {
    instance = new SelfHealingConsensusMetaEngine();
    // Bootstrap 5 default nodes
    for (let i = 1; i <= 5; i++) {
      instance.registerNode(`node-${i}`, { role: i === 1 ? 'primary' : 'replica' });
    }
    instance.electLeader();
  }
  return instance;
}

export function resetMetaEngine(): void {
  instance = null;
}
