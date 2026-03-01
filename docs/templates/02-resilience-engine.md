# Resilience Engine

> Zero-dependency, drop-in service resilience engine combining autonomous triage, distributed heartbeat monitoring, and self-healing orchestration.

## What It Does

Monitors service health via heartbeats, automatically diagnoses failures using pattern matching against known failure signatures, and executes ranked repair strategies with rollback support. Learns from repair outcomes to improve future decisions.

## Use Cases

- **Microservice architectures** — Automatic failure detection and recovery
- **Distributed systems** — Peer health monitoring with quorum detection
- **SRE automation** — Codified incident response with blast radius controls
- **Self-healing infrastructure** — Automated restart, scale, circuit-break, reroute

## Drop-In Instructions

1. Copy into `src/lib/resilience-engine.ts`
2. Register peers and failure signatures
3. Feed symptom reports — the engine diagnoses and self-heals

```typescript
import { createResilienceEngine } from './resilience-engine';

const engine = createResilienceEngine({ nodeId: 'api-server-1' });

// Register peers
engine.registerPeer('db-primary');
engine.registerPeer('cache-redis');

// Add repair strategies
engine.addRepairStrategy({
  id: 'restart-service',
  failureType: 'memory_leak',
  actions: ['drain_connections', 'restart_process', 'verify_health'],
  blastRadius: 'node',
  estimatedDurationMs: 30000,
  successRate: 0.9,
  costScore: 0.3,
  requiresApproval: false,
});

// Report symptoms as they occur
engine.reportSymptom({ nodeId: 'db-primary', symptom: 'memory_usage', value: 0.95 });
engine.reportSymptom({ nodeId: 'db-primary', symptom: 'gc_pressure', value: 0.8 });

// Diagnose
const diagnoses = engine.diagnose();
// → [{ nodeId: 'db-primary', severity: 'critical', possibleCauses: [...], ... }]

// Auto-heal
const result = await engine.heal('db-primary', 'memory_leak', async (action, nodeId) => {
  console.log(`Executing ${action} on ${nodeId}`);
  return true; // return false to trigger rollback
});
```

## Full Source

```typescript
/**
 * Resilience Engine — Drop-in service resilience with triage + heartbeat + self-healing
 * Zero dependencies. Works in any TypeScript/JavaScript project.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Severity = 'critical' | 'degraded' | 'warning' | 'info';
type RepairAction = 'restart' | 'scale_up' | 'circuit_break' | 'reroute' | 'alert' | 'rollback' | 'quarantine' | 'none';
type PeerState = 'alive' | 'suspect' | 'quarantined' | 'dead';

interface SymptomReport {
  nodeId: string;
  symptom: string;
  value: number;
  threshold?: number;
}

interface Diagnosis {
  nodeId: string;
  severity: Severity;
  symptoms: Array<SymptomReport & { timestamp: number }>;
  possibleCauses: string[];
  recommendedActions: RepairAction[];
  confidence: number;
  diagnosedAt: number;
}

interface FailureSignature {
  name: string;
  symptoms: Array<{ symptom: string; minValue: number }>;
  severity: Severity;
  causes: string[];
  actions: RepairAction[];
  confidence: number;
}

interface RepairStrategy {
  id: string;
  failureType: string;
  actions: string[];
  blastRadius: 'node' | 'sector' | 'system';
  estimatedDurationMs: number;
  successRate: number;
  costScore: number;
  requiresApproval: boolean;
}

interface RepairResult {
  success: boolean;
  durationMs: number;
  actionsExecuted: string[];
  rolledBack: boolean;
  error?: string;
}

interface PeerRecord {
  id: string;
  state: PeerState;
  lastBeatAt: number;
  missedBeats: number;
  health: number;
  load: number;
  stateChangedAt: number;
}

interface HeartbeatConfig {
  nodeId: string;
  intervalMs?: number;
  suspectAfterMisses?: number;
  quarantineAfterMisses?: number;
  deadAfterMisses?: number;
}

// ━━━ Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createResilienceEngine(config: HeartbeatConfig) {
  const {
    nodeId,
    intervalMs = 5000,
    suspectAfterMisses = 3,
    quarantineAfterMisses = 6,
    deadAfterMisses = 10,
  } = config;

  // ── Heartbeat State ──
  const peers = new Map<string, PeerRecord>();
  const stateListeners: Array<(peerId: string, oldState: PeerState, newState: PeerState) => void> = [];

  function registerPeer(peerId: string) {
    peers.set(peerId, {
      id: peerId,
      state: 'alive',
      lastBeatAt: Date.now(),
      missedBeats: 0,
      health: 1,
      load: 0,
      stateChangedAt: Date.now(),
    });
  }

  function receiveBeat(peerId: string, health: number, load: number) {
    let peer = peers.get(peerId);
    if (!peer) { registerPeer(peerId); peer = peers.get(peerId)!; }
    const oldState = peer.state;
    peer.lastBeatAt = Date.now();
    peer.missedBeats = 0;
    peer.health = health;
    peer.load = load;
    if (oldState !== 'alive') {
      peer.state = 'alive';
      peer.stateChangedAt = Date.now();
      for (const l of stateListeners) l(peerId, oldState, 'alive');
    }
  }

  function tick() {
    const now = Date.now();
    for (const [, peer] of peers) {
      const missed = Math.floor((now - peer.lastBeatAt) / intervalMs);
      if (missed <= peer.missedBeats) continue;
      peer.missedBeats = missed;
      const oldState = peer.state;
      let newState: PeerState = oldState;
      if (peer.missedBeats >= deadAfterMisses) newState = 'dead';
      else if (peer.missedBeats >= quarantineAfterMisses) newState = 'quarantined';
      else if (peer.missedBeats >= suspectAfterMisses) newState = 'suspect';
      if (newState !== oldState) {
        peer.state = newState;
        peer.stateChangedAt = now;
        for (const l of stateListeners) l(peer.id, oldState, newState);
      }
    }
  }

  function onPeerStateChange(fn: (peerId: string, old: PeerState, next: PeerState) => void) {
    stateListeners.push(fn);
  }

  function getAlivePeers(): string[] {
    return [...peers.values()].filter((p) => p.state === 'alive').map((p) => p.id);
  }

  function hasQuorum(total: number): boolean {
    return getAlivePeers().length > total / 2;
  }

  // ── Triage State ──
  const symptoms = new Map<string, Array<SymptomReport & { timestamp: number }>>();
  const repairHistory: Array<RepairResult & { nodeId: string; failureType: string; timestamp: number }> = [];

  const builtinSignatures: FailureSignature[] = [
    {
      name: 'memory_leak',
      symptoms: [{ symptom: 'memory_usage', minValue: 0.9 }, { symptom: 'gc_pressure', minValue: 0.7 }],
      severity: 'critical',
      causes: ['Unbounded cache growth', 'Event listener accumulation'],
      actions: ['restart', 'alert'],
      confidence: 0.85,
    },
    {
      name: 'cascading_failure',
      symptoms: [{ symptom: 'error_rate', minValue: 0.3 }, { symptom: 'dependency_errors', minValue: 0.5 }],
      severity: 'critical',
      causes: ['Upstream service failure', 'Network partition'],
      actions: ['circuit_break', 'reroute', 'alert'],
      confidence: 0.80,
    },
    {
      name: 'latency_spike',
      symptoms: [{ symptom: 'latency_p95', minValue: 5000 }],
      severity: 'degraded',
      causes: ['Slow database query', 'API timeout', 'Resource contention'],
      actions: ['scale_up', 'reroute'],
      confidence: 0.75,
    },
    {
      name: 'capacity_exhaustion',
      symptoms: [{ symptom: 'cpu_usage', minValue: 0.85 }, { symptom: 'queue_depth', minValue: 100 }],
      severity: 'degraded',
      causes: ['Traffic spike', 'Inefficient processing'],
      actions: ['scale_up', 'alert'],
      confidence: 0.80,
    },
    {
      name: 'data_corruption',
      symptoms: [{ symptom: 'checksum_failures', minValue: 1 }],
      severity: 'critical',
      causes: ['Disk failure', 'Race condition', 'Bit rot'],
      actions: ['quarantine', 'rollback', 'alert'],
      confidence: 0.90,
    },
  ];

  const customSignatures: FailureSignature[] = [];

  function addFailureSignature(sig: FailureSignature) {
    customSignatures.push(sig);
  }

  function reportSymptom(report: SymptomReport) {
    const full = { ...report, timestamp: Date.now() };
    if (!symptoms.has(report.nodeId)) symptoms.set(report.nodeId, []);
    const list = symptoms.get(report.nodeId)!;
    list.push(full);
    if (list.length > 200) list.splice(0, list.length - 200);
  }

  function matchSignature(nodeSymptoms: Array<SymptomReport & { timestamp: number }>): FailureSignature | null {
    const allSigs = [...builtinSignatures, ...customSignatures];
    let best: FailureSignature | null = null;
    let bestScore = 0;
    for (const sig of allSigs) {
      let matched = 0;
      for (const req of sig.symptoms) {
        const recent = nodeSymptoms
          .filter((s) => s.symptom === req.symptom && Date.now() - s.timestamp < 300_000)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        if (recent && recent.value >= req.minValue) matched++;
      }
      const score = sig.symptoms.length > 0 ? matched / sig.symptoms.length : 0;
      if (score > bestScore && score >= 0.5) { best = sig; bestScore = score; }
    }
    return best;
  }

  function diagnose(nodeId?: string): Diagnosis[] {
    const diagnoses: Diagnosis[] = [];
    const targets = nodeId ? [nodeId] : [...symptoms.keys()];
    for (const nid of targets) {
      const ns = (symptoms.get(nid) ?? []).filter((s) => Date.now() - s.timestamp < 300_000);
      if (!ns.length) continue;
      const sig = matchSignature(ns);
      if (sig) {
        diagnoses.push({
          nodeId: nid,
          severity: sig.severity,
          symptoms: ns,
          possibleCauses: sig.causes,
          recommendedActions: sig.actions,
          confidence: sig.confidence,
          diagnosedAt: Date.now(),
        });
      }
    }
    const order: Record<Severity, number> = { critical: 0, degraded: 1, warning: 2, info: 3 };
    return diagnoses.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  // ── Self-Healing ──
  const strategies: RepairStrategy[] = [];
  const strategyScores = new Map<string, { successes: number; failures: number }>();

  function addRepairStrategy(strategy: RepairStrategy) {
    strategies.push(strategy);
    strategyScores.set(strategy.id, { successes: 0, failures: 0 });
  }

  function getAdjustedRate(id: string): number {
    const s = strategyScores.get(id);
    if (!s || s.successes + s.failures === 0) {
      return strategies.find((st) => st.id === id)?.successRate ?? 0.5;
    }
    return s.successes / (s.successes + s.failures);
  }

  function blastScore(r: string): number {
    return r === 'system' ? 1 : r === 'sector' ? 0.5 : 0.1;
  }

  async function heal(
    targetNodeId: string,
    failureType: string,
    executor: (action: string, nodeId: string) => Promise<boolean>,
    onRollback?: (action: string, nodeId: string) => Promise<void>,
    maxBlastRadius?: 'node' | 'sector' | 'system'
  ): Promise<RepairResult> {
    // Select best strategy
    const candidates = strategies
      .filter((s) => s.failureType === failureType)
      .filter((s) => {
        if (!maxBlastRadius) return true;
        const order = ['node', 'sector', 'system'];
        return order.indexOf(s.blastRadius) <= order.indexOf(maxBlastRadius);
      })
      .sort((a, b) => {
        const sa = getAdjustedRate(a.id) * 0.5 - blastScore(a.blastRadius) * 0.3 - a.costScore * 0.2;
        const sb = getAdjustedRate(b.id) * 0.5 - blastScore(b.blastRadius) * 0.3 - b.costScore * 0.2;
        return sb - sa;
      });

    if (!candidates.length) {
      return { success: false, durationMs: 0, actionsExecuted: [], rolledBack: false, error: 'No repair strategy found' };
    }

    const strategy = candidates[0];
    const start = Date.now();
    const executed: string[] = [];

    try {
      for (const action of strategy.actions) {
        const ok = await executor(action, targetNodeId);
        if (!ok) throw new Error(`Action '${action}' failed`);
        executed.push(action);
      }
      const result: RepairResult = { success: true, durationMs: Date.now() - start, actionsExecuted: executed, rolledBack: false };
      const s = strategyScores.get(strategy.id);
      if (s) s.successes++;
      repairHistory.push({ ...result, nodeId: targetNodeId, failureType, timestamp: Date.now() });
      return result;
    } catch (err) {
      if (onRollback) {
        for (const a of executed.reverse()) {
          try { await onRollback(`rollback_${a}`, targetNodeId); } catch { /* best effort */ }
        }
      }
      const result: RepairResult = {
        success: false,
        durationMs: Date.now() - start,
        actionsExecuted: executed,
        rolledBack: !!onRollback,
        error: err instanceof Error ? err.message : String(err),
      };
      const s = strategyScores.get(strategy.id);
      if (s) s.failures++;
      repairHistory.push({ ...result, nodeId: targetNodeId, failureType, timestamp: Date.now() });
      return result;
    }
  }

  // ── Stats ──

  function getRepairSuccessRate(): number {
    return repairHistory.length === 0 ? 1 : repairHistory.filter((r) => r.success).length / repairHistory.length;
  }

  function getStats() {
    return {
      peers: {
        total: peers.size,
        alive: getAlivePeers().length,
        suspect: [...peers.values()].filter((p) => p.state === 'suspect').length,
        dead: [...peers.values()].filter((p) => p.state === 'dead').length,
      },
      triage: {
        activeSymptoms: [...symptoms.values()].flat().filter((s) => Date.now() - s.timestamp < 300_000).length,
        totalRepairs: repairHistory.length,
        repairSuccessRate: getRepairSuccessRate(),
      },
      strategies: strategies.length,
    };
  }

  return {
    // Heartbeat
    registerPeer,
    receiveBeat,
    tick,
    getAlivePeers,
    hasQuorum,
    onPeerStateChange,
    getPeers: () => [...peers.values()],
    // Triage
    reportSymptom,
    diagnose,
    addFailureSignature,
    // Self-Healing
    addRepairStrategy,
    heal,
    getRepairSuccessRate,
    // Stats
    getStats,
  };
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `registerPeer(id)` | Register a peer node for heartbeat monitoring |
| `receiveBeat(id, health, load)` | Process an incoming heartbeat from a peer |
| `tick()` | Advance the heartbeat clock — call on interval |
| `reportSymptom(report)` | Report a health symptom for a node |
| `diagnose(nodeId?)` | Diagnose failures using pattern matching |
| `addRepairStrategy(strategy)` | Add a self-healing strategy |
| `heal(nodeId, type, executor)` | Execute auto-repair with rollback |
| `hasQuorum(total)` | Check if majority of peers are alive |
| `getStats()` | Full resilience health summary |

## License

MIT — Drop in anywhere.
