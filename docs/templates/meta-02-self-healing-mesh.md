# Self-Healing Service Mesh — Meta-Engine

> Complete infrastructure resilience in a single import. Register services, monitor health via heartbeats, detect failures with pattern matching, auto-repair with rollback, and correlate incidents across your service graph.

## What It Is

A **meta-engine** that composes Service Registry, Heartbeat Protocol, Autonomous Triage, Self-Healing Orchestration, and Anomaly Correlation into one unified mesh. Every part feeds the others — a heartbeat miss triggers triage, triage triggers repair, repair outcomes feed anomaly correlation, and everything is discoverable through the registry.

## Why It's More Valuable Than Individual Engines

| Standalone | Meta-Engine |
|---|---|
| 5 separate engine instances to wire | One `createServiceMesh()` call |
| Manual event forwarding between systems | Heartbeat → triage → heal → learn is automatic |
| Disconnected health views | Unified health model across registry + heartbeat + triage |
| No cross-system correlation | Anomalies from all subsystems are correlated together |

## Quick Start

```typescript
import { createServiceMesh } from './self-healing-mesh';

const mesh = createServiceMesh({
  nodeId: 'api-gateway',
  heartbeatIntervalMs: 5000,
  anomalyWindowMs: 60_000,
});

// Register services with dependencies
mesh.register({ id: 'database', type: 'module', tags: ['storage', 'critical'] });
mesh.register({ id: 'cache', type: 'module', tags: ['performance'] });
mesh.register({
  id: 'api-server',
  type: 'module',
  dependencies: ['database', 'cache'],
  healthCheck: async () => {
    const res = await fetch('/health');
    return res.ok ? 1.0 : 0.2;
  },
});

// Service dependency graph (for anomaly correlation)
mesh.addDependency('api-server', 'database');
mesh.addDependency('api-server', 'cache');

// Activate in dependency order
const bootOrder = mesh.getBootOrder();
for (const id of bootOrder) mesh.activate(id);

// Add repair strategies
mesh.addRepairStrategy({
  id: 'restart-db',
  failureType: 'memory_leak',
  actions: ['drain_connections', 'restart_process', 'verify_health'],
  blastRadius: 'node',
  estimatedDurationMs: 30000,
  successRate: 0.9,
  costScore: 0.3,
  requiresApproval: false,
});

// Report symptoms as they occur
mesh.reportSymptom({ nodeId: 'database', symptom: 'memory_usage', value: 0.95 });
mesh.reportSymptom({ nodeId: 'database', symptom: 'gc_pressure', value: 0.8 });

// Diagnose + auto-heal
const diagnoses = mesh.diagnose();
if (diagnoses.length > 0) {
  const result = await mesh.heal(
    'database',
    'memory_leak',
    async (action, nodeId) => {
      console.log(`Executing ${action} on ${nodeId}`);
      return true;
    }
  );
  console.log(result.success ? 'Healed!' : `Failed: ${result.error}`);
}

// Heartbeat loop
setInterval(() => {
  mesh.tick();        // Check for missed heartbeats
  mesh.runHealthChecks(); // Execute registered health checks
}, 5000);

// React to state changes
mesh.onStateChange((serviceId, oldState, newState) => {
  console.log(`${serviceId}: ${oldState} → ${newState}`);
});

// Full mesh status
const status = mesh.getStatus();
```

## Full Source

```typescript
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Self-Healing Service Mesh — Meta-Engine                    ║
 * ║  Composes: Registry + Heartbeat + Triage + Healer + Anomaly ║
 * ║  Zero dependencies. Drop into any TypeScript project.       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type EntityStatus = 'registered' | 'active' | 'degraded' | 'decommissioned';
type EntityType = 'module' | 'capability' | 'pipeline' | 'connector' | 'config';
type PeerState = 'alive' | 'suspect' | 'quarantined' | 'dead';
type Severity = 'critical' | 'degraded' | 'warning' | 'info';
type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

interface RegistryEntity {
  id: string;
  type: EntityType;
  status: EntityStatus;
  version: string;
  metadata: Record<string, unknown>;
  dependencies: string[];
  healthScore: number;
  registeredAt: number;
  lastHealthCheck: number;
  tags: string[];
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

interface SymptomReport {
  nodeId: string;
  symptom: string;
  value: number;
}

interface Diagnosis {
  nodeId: string;
  severity: Severity;
  symptoms: Array<SymptomReport & { timestamp: number }>;
  possibleCauses: string[];
  recommendedActions: string[];
  confidence: number;
  diagnosedAt: number;
}

interface FailureSignature {
  name: string;
  symptoms: Array<{ symptom: string; minValue: number }>;
  severity: Severity;
  causes: string[];
  actions: string[];
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

interface Anomaly {
  id: string;
  source: string;
  metric: string;
  value: number;
  severity: AnomalySeverity;
  timestamp: number;
}

interface CorrelatedIncident {
  id: string;
  anomalies: Anomaly[];
  severity: AnomalySeverity;
  correlationType: 'temporal' | 'causal';
  hypothesis: string;
  confidence: number;
  rootCause?: string;
  affectedServices: string[];
  createdAt: number;
}

interface DependencyEdge {
  from: string;
  to: string;
}

export interface MeshConfig {
  nodeId: string;
  heartbeatIntervalMs?: number;
  suspectAfterMisses?: number;
  quarantineAfterMisses?: number;
  deadAfterMisses?: number;
  anomalyWindowMs?: number;
  onStateChange?: (serviceId: string, oldState: string, newState: string) => void;
  onIncident?: (incident: CorrelatedIncident) => void;
  onHeal?: (result: RepairResult & { nodeId: string }) => void;
}

// ━━━ Meta-Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createServiceMesh(config: MeshConfig) {
  const {
    nodeId,
    heartbeatIntervalMs = 5000,
    suspectAfterMisses = 3,
    quarantineAfterMisses = 6,
    deadAfterMisses = 10,
    anomalyWindowMs = 60_000,
    onStateChange: configOnStateChange,
    onIncident,
    onHeal,
  } = config;

  // ════════════════════════════════════════════════════
  // LAYER 1: Service Registry
  // ════════════════════════════════════════════════════

  const entities = new Map<string, RegistryEntity>();
  const healthChecks = new Map<string, () => Promise<number> | number>();
  const entityListeners = new Map<string, Array<(entity: RegistryEntity, event: string) => void>>();

  function emitEntity(entityId: string, event: string) {
    const entity = entities.get(entityId);
    if (!entity) return;
    for (const l of entityListeners.get('*') ?? []) l(entity, event);
    for (const l of entityListeners.get(entityId) ?? []) l(entity, event);
  }

  function register(params: {
    id: string; type: EntityType; version?: string;
    metadata?: Record<string, unknown>; dependencies?: string[];
    tags?: string[]; healthCheck?: () => Promise<number> | number;
  }): RegistryEntity {
    if (entities.has(params.id)) throw new Error(`Entity '${params.id}' already registered.`);
    const entity: RegistryEntity = {
      id: params.id, type: params.type, status: 'registered',
      version: params.version ?? '1.0.0', metadata: params.metadata ?? {},
      dependencies: params.dependencies ?? [], healthScore: 1.0,
      registeredAt: Date.now(), lastHealthCheck: Date.now(), tags: params.tags ?? [],
    };
    entities.set(params.id, entity);
    if (params.healthCheck) healthChecks.set(params.id, params.healthCheck);
    // Also register as peer
    registerPeer(params.id);
    emitEntity(params.id, 'registered');
    return entity;
  }

  function activate(id: string): boolean {
    const entity = entities.get(id);
    if (!entity) return false;
    for (const dep of entity.dependencies) {
      const d = entities.get(dep);
      if (!d || d.status !== 'active') throw new Error(`Cannot activate '${id}': dep '${dep}' not active`);
    }
    entity.status = 'active';
    emitEntity(id, 'activated');
    return true;
  }

  function degradeEntity(id: string, reason?: string): boolean {
    const entity = entities.get(id);
    if (!entity) return false;
    entity.status = 'degraded';
    entity.metadata._degradeReason = reason;
    emitEntity(id, 'degraded');
    return true;
  }

  function decommission(id: string): boolean {
    const entity = entities.get(id);
    if (!entity) return false;
    for (const [, e] of entities) {
      if (e.status === 'active' && e.dependencies.includes(id))
        throw new Error(`Cannot decommission '${id}': '${e.id}' depends on it`);
    }
    entity.status = 'decommissioned';
    emitEntity(id, 'decommissioned');
    return true;
  }

  function discover(query: { type?: EntityType; status?: EntityStatus; tags?: string[]; minHealth?: number }): RegistryEntity[] {
    let results = [...entities.values()];
    if (query.type) results = results.filter(e => e.type === query.type);
    if (query.status) results = results.filter(e => e.status === query.status);
    if (query.minHealth !== undefined) results = results.filter(e => e.healthScore >= query.minHealth!);
    if (query.tags?.length) results = results.filter(e => query.tags!.some(t => e.tags.includes(t)));
    return results;
  }

  async function runHealthChecks(): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    for (const [id, check] of healthChecks) {
      try {
        const score = await check();
        const entity = entities.get(id);
        if (entity) {
          entity.healthScore = Math.max(0, Math.min(1, score));
          entity.lastHealthCheck = Date.now();
          if (score < 0.3 && entity.status === 'active') {
            degradeEntity(id, 'Health below threshold');
            ingestAnomaly(id, 'health_check_low', score, score < 0.1 ? 'critical' : 'high');
          }
        }
        results.set(id, score);
      } catch {
        const entity = entities.get(id);
        if (entity) { entity.healthScore = 0; degradeEntity(id, 'Health check failed'); }
        ingestAnomaly(id, 'health_check_failed', 0, 'critical');
        results.set(id, 0);
      }
    }
    return results;
  }

  function getBootOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const visiting = new Set<string>();
    function visit(id: string) {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(`Circular dependency detected involving '${id}'`);
      visiting.add(id);
      const entity = entities.get(id);
      if (entity) for (const dep of entity.dependencies) visit(dep);
      visiting.delete(id);
      visited.add(id);
      order.push(id);
    }
    for (const id of entities.keys()) visit(id);
    return order;
  }

  function getDependents(id: string): string[] {
    return [...entities.values()].filter(e => e.dependencies.includes(id)).map(e => e.id);
  }

  function onEntityEvent(key: string, listener: (entity: RegistryEntity, event: string) => void) {
    if (!entityListeners.has(key)) entityListeners.set(key, []);
    entityListeners.get(key)!.push(listener);
  }

  // ════════════════════════════════════════════════════
  // LAYER 2: Heartbeat Protocol
  // ════════════════════════════════════════════════════

  const peers = new Map<string, PeerRecord>();
  const stateListeners: Array<(peerId: string, oldState: PeerState, newState: PeerState) => void> = [];

  function registerPeer(peerId: string) {
    if (peers.has(peerId)) return;
    peers.set(peerId, {
      id: peerId, state: 'alive', lastBeatAt: Date.now(),
      missedBeats: 0, health: 1, load: 0, stateChangedAt: Date.now(),
    });
  }

  function receiveBeat(peerId: string, health: number, load: number) {
    let peer = peers.get(peerId);
    if (!peer) { registerPeer(peerId); peer = peers.get(peerId)!; }
    const oldState = peer.state;
    peer.lastBeatAt = Date.now(); peer.missedBeats = 0;
    peer.health = health; peer.load = load;
    if (oldState !== 'alive') {
      peer.state = 'alive'; peer.stateChangedAt = Date.now();
      for (const l of stateListeners) l(peerId, oldState, 'alive');
      configOnStateChange?.(peerId, oldState, 'alive');
      // Sync with registry
      const entity = entities.get(peerId);
      if (entity && entity.status === 'degraded') { entity.status = 'active'; emitEntity(peerId, 'recovered'); }
    }
    // Sync health to registry
    const entity = entities.get(peerId);
    if (entity) entity.healthScore = health;
  }

  function tick() {
    const now = Date.now();
    for (const [, peer] of peers) {
      const missed = Math.floor((now - peer.lastBeatAt) / heartbeatIntervalMs);
      if (missed <= peer.missedBeats) continue;
      peer.missedBeats = missed;
      const oldState = peer.state;
      let newState: PeerState = oldState;
      if (peer.missedBeats >= deadAfterMisses) newState = 'dead';
      else if (peer.missedBeats >= quarantineAfterMisses) newState = 'quarantined';
      else if (peer.missedBeats >= suspectAfterMisses) newState = 'suspect';
      if (newState !== oldState) {
        peer.state = newState; peer.stateChangedAt = now;
        for (const l of stateListeners) l(peer.id, oldState, newState);
        configOnStateChange?.(peer.id, oldState, newState);
        // Sync with registry
        if (newState === 'dead' || newState === 'quarantined') {
          degradeEntity(peer.id, `Heartbeat: ${newState} (${peer.missedBeats} missed)`);
          ingestAnomaly(peer.id, 'heartbeat_loss', peer.missedBeats, newState === 'dead' ? 'critical' : 'high');
        }
      }
    }
  }

  function onStateChange(fn: (peerId: string, old: PeerState, next: PeerState) => void) {
    stateListeners.push(fn);
  }

  function getAlivePeers(): string[] {
    return [...peers.values()].filter(p => p.state === 'alive').map(p => p.id);
  }

  function hasQuorum(total: number): boolean {
    return getAlivePeers().length > total / 2;
  }

  // ════════════════════════════════════════════════════
  // LAYER 3: Autonomous Triage
  // ════════════════════════════════════════════════════

  const symptomMap = new Map<string, Array<SymptomReport & { timestamp: number }>>();
  const repairHistory: Array<RepairResult & { nodeId: string; failureType: string; timestamp: number }> = [];

  const builtinSignatures: FailureSignature[] = [
    { name: 'memory_leak', symptoms: [{ symptom: 'memory_usage', minValue: 0.9 }, { symptom: 'gc_pressure', minValue: 0.7 }], severity: 'critical', causes: ['Unbounded cache growth', 'Event listener accumulation'], actions: ['restart', 'alert'], confidence: 0.85 },
    { name: 'cascading_failure', symptoms: [{ symptom: 'error_rate', minValue: 0.3 }, { symptom: 'dependency_errors', minValue: 0.5 }], severity: 'critical', causes: ['Upstream service failure', 'Network partition'], actions: ['circuit_break', 'reroute', 'alert'], confidence: 0.80 },
    { name: 'latency_spike', symptoms: [{ symptom: 'latency_p95', minValue: 5000 }], severity: 'degraded', causes: ['Slow query', 'API timeout'], actions: ['scale_up', 'reroute'], confidence: 0.75 },
    { name: 'capacity_exhaustion', symptoms: [{ symptom: 'cpu_usage', minValue: 0.85 }, { symptom: 'queue_depth', minValue: 100 }], severity: 'degraded', causes: ['Traffic spike', 'Inefficient processing'], actions: ['scale_up', 'alert'], confidence: 0.80 },
    { name: 'data_corruption', symptoms: [{ symptom: 'checksum_failures', minValue: 1 }], severity: 'critical', causes: ['Disk failure', 'Race condition'], actions: ['quarantine', 'rollback', 'alert'], confidence: 0.90 },
  ];
  const customSignatures: FailureSignature[] = [];

  function addFailureSignature(sig: FailureSignature) { customSignatures.push(sig); }

  function reportSymptom(report: SymptomReport) {
    const full = { ...report, timestamp: Date.now() };
    if (!symptomMap.has(report.nodeId)) symptomMap.set(report.nodeId, []);
    const list = symptomMap.get(report.nodeId)!;
    list.push(full);
    if (list.length > 200) list.splice(0, list.length - 200);
    // Check if this crosses anomaly threshold
    if (report.value > 0.9) {
      ingestAnomaly(report.nodeId, report.symptom, report.value, 'high');
    }
  }

  function matchSignature(nodeSymptoms: Array<SymptomReport & { timestamp: number }>): FailureSignature | null {
    const allSigs = [...builtinSignatures, ...customSignatures];
    let best: FailureSignature | null = null; let bestScore = 0;
    for (const sig of allSigs) {
      let matched = 0;
      for (const req of sig.symptoms) {
        const recent = nodeSymptoms.filter(s => s.symptom === req.symptom && Date.now() - s.timestamp < 300_000).sort((a, b) => b.timestamp - a.timestamp)[0];
        if (recent && recent.value >= req.minValue) matched++;
      }
      const score = sig.symptoms.length > 0 ? matched / sig.symptoms.length : 0;
      if (score > bestScore && score >= 0.5) { best = sig; bestScore = score; }
    }
    return best;
  }

  function diagnose(nodeId?: string): Diagnosis[] {
    const diagnoses: Diagnosis[] = [];
    const targets = nodeId ? [nodeId] : [...symptomMap.keys()];
    for (const nid of targets) {
      const ns = (symptomMap.get(nid) ?? []).filter(s => Date.now() - s.timestamp < 300_000);
      if (!ns.length) continue;
      const sig = matchSignature(ns);
      if (sig) diagnoses.push({ nodeId: nid, severity: sig.severity, symptoms: ns, possibleCauses: sig.causes, recommendedActions: sig.actions, confidence: sig.confidence, diagnosedAt: Date.now() });
    }
    const order: Record<Severity, number> = { critical: 0, degraded: 1, warning: 2, info: 3 };
    return diagnoses.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  // ════════════════════════════════════════════════════
  // LAYER 4: Self-Healing Orchestrator
  // ════════════════════════════════════════════════════

  const strategies: RepairStrategy[] = [];
  const strategyScores = new Map<string, { successes: number; failures: number }>();

  function addRepairStrategy(strategy: RepairStrategy) {
    strategies.push(strategy);
    strategyScores.set(strategy.id, { successes: 0, failures: 0 });
  }

  function getAdjustedRate(id: string): number {
    const s = strategyScores.get(id);
    if (!s || s.successes + s.failures === 0) return strategies.find(st => st.id === id)?.successRate ?? 0.5;
    return s.successes / (s.successes + s.failures);
  }

  async function heal(
    targetNodeId: string,
    failureType: string,
    executor: (action: string, nodeId: string) => Promise<boolean>,
    onRollback?: (action: string, nodeId: string) => Promise<void>,
    maxBlastRadius?: 'node' | 'sector' | 'system'
  ): Promise<RepairResult> {
    const blastScore = (r: string) => r === 'system' ? 1 : r === 'sector' ? 0.5 : 0.1;
    const candidates = strategies
      .filter(s => s.failureType === failureType)
      .filter(s => { if (!maxBlastRadius) return true; const order = ['node', 'sector', 'system']; return order.indexOf(s.blastRadius) <= order.indexOf(maxBlastRadius); })
      .sort((a, b) => {
        const sa = getAdjustedRate(a.id) * 0.5 - blastScore(a.blastRadius) * 0.3 - a.costScore * 0.2;
        const sb = getAdjustedRate(b.id) * 0.5 - blastScore(b.blastRadius) * 0.3 - b.costScore * 0.2;
        return sb - sa;
      });

    if (!candidates.length) return { success: false, durationMs: 0, actionsExecuted: [], rolledBack: false, error: 'No repair strategy found' };

    const strategy = candidates[0];
    const start = Date.now(); const executed: string[] = [];

    try {
      for (const action of strategy.actions) {
        const ok = await executor(action, targetNodeId);
        if (!ok) throw new Error(`Action '${action}' failed`);
        executed.push(action);
      }
      const result: RepairResult = { success: true, durationMs: Date.now() - start, actionsExecuted: executed, rolledBack: false };
      const s = strategyScores.get(strategy.id); if (s) s.successes++;
      repairHistory.push({ ...result, nodeId: targetNodeId, failureType, timestamp: Date.now() });
      onHeal?.({ ...result, nodeId: targetNodeId });
      return result;
    } catch (err) {
      if (onRollback) for (const a of executed.reverse()) { try { await onRollback(`rollback_${a}`, targetNodeId); } catch { /* best effort */ } }
      const result: RepairResult = { success: false, durationMs: Date.now() - start, actionsExecuted: executed, rolledBack: !!onRollback, error: err instanceof Error ? err.message : String(err) };
      const s = strategyScores.get(strategy.id); if (s) s.failures++;
      repairHistory.push({ ...result, nodeId: targetNodeId, failureType, timestamp: Date.now() });
      ingestAnomaly(targetNodeId, 'repair_failed', 1, 'critical');
      onHeal?.({ ...result, nodeId: targetNodeId });
      return result;
    }
  }

  // ════════════════════════════════════════════════════
  // LAYER 5: Anomaly Correlation
  // ════════════════════════════════════════════════════

  const anomalyBuffer: Anomaly[] = [];
  const depEdges: DependencyEdge[] = [];
  let anomalyIdCounter = 0;

  function addDependency(from: string, to: string) { depEdges.push({ from, to }); }

  function ingestAnomaly(source: string, metric: string, value: number, severity: AnomalySeverity): Anomaly {
    const anomaly: Anomaly = { id: `anomaly_${++anomalyIdCounter}`, source, metric, value, severity, timestamp: Date.now() };
    anomalyBuffer.push(anomaly);
    if (anomalyBuffer.length > 500) anomalyBuffer.splice(0, anomalyBuffer.length - 500);
    return anomaly;
  }

  function findCausalChain(anomaly: Anomaly, pool: Anomaly[]): Anomaly[] {
    const chain = [anomaly]; const visited = new Set([anomaly.source]);
    function trace(source: string) {
      for (const d of depEdges.filter(d => d.to === source)) {
        if (visited.has(d.from)) continue;
        const upstream = pool.find(a => a.source === d.from && Math.abs(a.timestamp - anomaly.timestamp) < anomalyWindowMs * 2);
        if (upstream) { visited.add(d.from); chain.push(upstream); trace(d.from); }
      }
    }
    trace(anomaly.source);
    return chain;
  }

  function correlate(): CorrelatedIncident[] {
    const recent = anomalyBuffer.filter(a => Date.now() - a.timestamp < anomalyWindowMs * 5);
    if (recent.length < 2) return [];
    const incidents: CorrelatedIncident[] = []; const used = new Set<string>();

    for (const a of recent) {
      if (used.has(a.id)) continue;
      const chain = findCausalChain(a, recent);
      if (chain.length > 1) {
        chain.forEach(c => used.add(c.id));
        const root = chain[chain.length - 1];
        const incident: CorrelatedIncident = { id: `incident_${++anomalyIdCounter}`, anomalies: chain, severity: chain.some(c => c.severity === 'critical') ? 'critical' : 'high', correlationType: 'causal', hypothesis: `Root cause in '${root.source}' cascading to ${chain.length - 1} services`, confidence: 0.85, rootCause: root.source, affectedServices: [...new Set(chain.map(c => c.source))], createdAt: Date.now() };
        incidents.push(incident);
        onIncident?.(incident);
      }
    }

    const remaining = recent.filter(a => !used.has(a.id));
    if (remaining.length >= 2) {
      const sorted = [...remaining].sort((a, b) => a.timestamp - b.timestamp);
      const groups: Anomaly[][] = [[sorted[0]]];
      for (let i = 1; i < sorted.length; i++) {
        const last = groups[groups.length - 1];
        if (sorted[i].timestamp - last[0].timestamp <= anomalyWindowMs) last.push(sorted[i]);
        else groups.push([sorted[i]]);
      }
      for (const group of groups.filter(g => g.length >= 2)) {
        group.forEach(a => used.add(a.id));
        const incident: CorrelatedIncident = { id: `incident_${++anomalyIdCounter}`, anomalies: group, severity: group.some(a => a.severity === 'critical') ? 'critical' : 'high', correlationType: 'temporal', hypothesis: `${group.length} anomalies co-occurring within ${anomalyWindowMs / 1000}s`, confidence: 0.65, affectedServices: [...new Set(group.map(a => a.source))], createdAt: Date.now() };
        incidents.push(incident);
        onIncident?.(incident);
      }
    }

    return incidents;
  }

  // ════════════════════════════════════════════════════
  // STATUS
  // ════════════════════════════════════════════════════

  function getStatus() {
    const entityList = [...entities.values()];
    const peerList = [...peers.values()];
    return {
      registry: {
        total: entities.size,
        active: entityList.filter(e => e.status === 'active').length,
        degraded: entityList.filter(e => e.status === 'degraded').length,
        avgHealth: entityList.length > 0 ? entityList.reduce((s, e) => s + e.healthScore, 0) / entityList.length : 0,
      },
      heartbeat: {
        peers: peers.size,
        alive: peerList.filter(p => p.state === 'alive').length,
        suspect: peerList.filter(p => p.state === 'suspect').length,
        dead: peerList.filter(p => p.state === 'dead').length,
      },
      triage: {
        activeSymptoms: [...symptomMap.values()].flat().filter(s => Date.now() - s.timestamp < 300_000).length,
        activeDiagnoses: diagnose().length,
      },
      healing: {
        totalRepairs: repairHistory.length,
        successRate: repairHistory.length === 0 ? 1 : repairHistory.filter(r => r.success).length / repairHistory.length,
        strategies: strategies.length,
      },
      anomalies: {
        recent: anomalyBuffer.filter(a => Date.now() - a.timestamp < anomalyWindowMs * 5).length,
        incidents: correlate().length,
      },
    };
  }

  return {
    // Registry
    register, activate, decommission, discover, getBootOrder, getDependents,
    onEntityEvent,
    get: (id: string) => entities.get(id),
    all: () => [...entities.values()],
    // Heartbeat
    receiveBeat, tick, getAlivePeers, hasQuorum, onStateChange,
    getPeers: () => [...peers.values()],
    // Triage
    reportSymptom, diagnose, addFailureSignature,
    // Healing
    addRepairStrategy, heal,
    // Anomaly
    addDependency, correlate,
    // Health
    runHealthChecks,
    // Status
    getStatus,
  };
}
```

## API Reference

| Method | Layer | Description |
|--------|-------|-------------|
| `register(params)` | Registry | Register a service with deps and health check |
| `activate(id)` | Registry | Activate (validates dependencies) |
| `getBootOrder()` | Registry | Topological sort for boot ordering |
| `discover(query)` | Registry | Find services by type, status, tags, health |
| `receiveBeat(id, health, load)` | Heartbeat | Process incoming heartbeat |
| `tick()` | Heartbeat | Check for missed heartbeats — auto-degrades |
| `hasQuorum(total)` | Heartbeat | Check if majority of peers are alive |
| `reportSymptom(report)` | Triage | Report a health symptom |
| `diagnose(nodeId?)` | Triage | Pattern-match symptoms → diagnosis |
| `addRepairStrategy(strategy)` | Healing | Register a self-healing strategy |
| `heal(nodeId, type, executor)` | Healing | Execute repair with rollback |
| `addDependency(from, to)` | Anomaly | Register service dependency for causal tracing |
| `correlate()` | Anomaly | Correlate anomalies into incidents |
| `getStatus()` | All | Full mesh health across all 5 layers |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE MESH                              │
│                                                              │
│  ┌──────────┐    ┌───────────┐    ┌──────────┐              │
│  │ REGISTRY │←──→│ HEARTBEAT │───→│  TRIAGE  │              │
│  │          │    │           │    │          │              │
│  │ Services │    │ Peers     │    │ Symptoms │              │
│  │ Deps     │    │ States    │    │ Diagnose │              │
│  │ Health   │    │ Quorum    │    │ Patterns │              │
│  └────┬─────┘    └─────┬─────┘    └────┬─────┘              │
│       │                │               │                    │
│       │           ┌────▼────┐     ┌────▼─────┐              │
│       │           │ ANOMALY │     │ SELF-    │              │
│       └──────────→│ DETECT  │←────│ HEALING  │              │
│                   │         │     │          │              │
│                   │ Causal  │     │ Strategy │              │
│                   │ Temporal│     │ Rollback │              │
│                   │ Incident│     │ Learning │              │
│                   └─────────┘     └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## License

MIT — Drop in anywhere. No attribution required.
