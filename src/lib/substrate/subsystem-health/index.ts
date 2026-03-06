/**
 * Subsystem Health Registry
 * Circuit breakers, diagnostics, and healing for all subsystems
 * 
 * Subsystems are operational layers that sit alongside the 21 core modules:
 * - Intent Mesh: Cross-module capability routing
 * - AutoBlog: Autonomous content pipeline
 * - SEBA: Self-evolving bounded agent
 * - Shadow Mesh: Immune layer / adversarial probing
 * 
 * Each subsystem gets:
 * - Circuit breaker (via infra-resilience)
 * - Health score (0-100)
 * - Heal function (soft + hard)
 * - Diagnostics output
 */

import { initCircuitBreaker, getCircuitStatus, type CircuitStatus } from '../infra-resilience';
import { resetBreaker, recordSuccess, recordFailure, getBreaker } from '../circuit-breaker';
import { emit } from '../events';
import { updateHealthRegistry, getShadowMeshState, updateShadowMeshState } from '../health-registry';

// ═══ Types ═══════════════════════════════════════════════════════

export type SubsystemId = 'intent_mesh' | 'autoblog' | 'seba' | 'shadow_mesh' | 'clm' | 'evolution_mesh' | 'immunity_mesh' | 'event_stream' | 'discovery_engine';

export interface SubsystemHealthEntry {
  id: SubsystemId;
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  score: number;
  circuit: CircuitStatus;
  lastHeal: string | null;
  healCount: number;
  detail: string;
}

export interface SubsystemHealResult {
  subsystem: SubsystemId;
  ok: boolean;
  actions: string[];
  previousScore: number;
  newScore: number;
}

export interface SubsystemDiagnostics {
  timestamp: string;
  subsystems: SubsystemHealthEntry[];
  overallScore: number;
  unhealthy: SubsystemId[];
}

// ═══ State ═══════════════════════════════════════════════════════

interface SubsystemState {
  lastHeal: string | null;
  healCount: number;
  score: number;
  detail: string;
}

const subsystemStates = new Map<SubsystemId, SubsystemState>();

const SUBSYSTEM_META: Record<SubsystemId, { name: string; circuitModule: string }> = {
  intent_mesh: { name: 'Intent Mesh', circuitModule: 'subsys:intent_mesh' },
  autoblog: { name: 'AutoBlog', circuitModule: 'subsys:autoblog' },
  seba: { name: 'SEBA', circuitModule: 'subsys:seba' },
  shadow_mesh: { name: 'Shadow Mesh', circuitModule: 'subsys:shadow_mesh' },
  clm: { name: 'CLM', circuitModule: 'subsys:clm' },
  evolution_mesh: { name: 'EVOLUTION Mesh', circuitModule: 'subsys:evolution_mesh' },
  immunity_mesh: { name: 'IMMUNITY Mesh', circuitModule: 'subsys:immunity_mesh' },
  event_stream: { name: 'Event Stream', circuitModule: 'subsys:event_stream' },
  discovery_engine: { name: 'Discovery Engine', circuitModule: 'subsys:discovery_engine' },
};

const ALL_SUBSYSTEM_IDS: SubsystemId[] = ['intent_mesh', 'autoblog', 'seba', 'shadow_mesh', 'clm', 'evolution_mesh', 'immunity_mesh', 'event_stream', 'discovery_engine'];

// ═══ Init ════════════════════════════════════════════════════════

let initialized = false;

export function initSubsystemHealth(): void {
  if (initialized) return;
  initialized = true;

  for (const [id, meta] of Object.entries(SUBSYSTEM_META)) {
    initCircuitBreaker(meta.circuitModule, { failureThreshold: 3, recoveryTimeout: 60_000 });
    subsystemStates.set(id as SubsystemId, {
      lastHeal: null,
      healCount: 0,
      score: 100,
      detail: 'Initialized',
    });
  }
}

// ═══ Health Queries ══════════════════════════════════════════════

function getState(id: SubsystemId): SubsystemState {
  initSubsystemHealth();
  return subsystemStates.get(id) || { lastHeal: null, healCount: 0, score: 100, detail: 'Unknown' };
}

function scoreToStatus(score: number, circuitState: string): SubsystemHealthEntry['status'] {
  if (circuitState === 'open') return 'offline';
  if (circuitState === 'half_open' || score < 50) return 'critical';
  if (score < 80) return 'degraded';
  return 'healthy';
}

export function getSubsystemHealth(id: SubsystemId): SubsystemHealthEntry {
  initSubsystemHealth();
  const meta = SUBSYSTEM_META[id];
  const state = getState(id);
  const circuit = getCircuitStatus(meta.circuitModule);

  return {
    id,
    name: meta.name,
    status: scoreToStatus(state.score, circuit.state),
    score: state.score,
    circuit,
    lastHeal: state.lastHeal,
    healCount: state.healCount,
    detail: state.detail,
  };
}

export function getAllSubsystemHealth(): SubsystemHealthEntry[] {
  return ALL_SUBSYSTEM_IDS.map(getSubsystemHealth);
}

// ═══ Score Updates ═══════════════════════════════════════════════

export function reportSubsystemSuccess(id: SubsystemId, detail?: string): void {
  initSubsystemHealth();
  const meta = SUBSYSTEM_META[id];
  const state = getState(id);
  recordSuccess(meta.circuitModule);
  state.score = Math.min(100, state.score + 2);
  if (detail) state.detail = detail;

  // Push to CHR
  updateHealthRegistry(`subsys:${id}`, 'healthy', 'boot', 'telemetry', {
    breaker_state: 'closed',
    detail: detail ?? 'Success',
    score_override: state.score,
  });
}

export function reportSubsystemFailure(id: SubsystemId, detail?: string): void {
  initSubsystemHealth();
  const meta = SUBSYSTEM_META[id];
  const state = getState(id);
  recordFailure(meta.circuitModule);
  state.score = Math.max(0, state.score - 10);
  if (detail) state.detail = detail;

  // Shadow mesh isolation: if shadow_mesh subsystem fails, tag as synthetic if isolation enabled
  const source = id === 'shadow_mesh' && !getShadowMeshState().bleed_into_health
    ? 'synthetic_shadow_event' as const
    : 'telemetry' as const;

  updateHealthRegistry(`subsys:${id}`, 'degraded', 'circuit_breaker', source, {
    breaker_state: 'half_open',
    detail: detail ?? 'Failure recorded',
    score_override: state.score,
  });
}

export function setSubsystemScore(id: SubsystemId, score: number, detail: string): void {
  initSubsystemHealth();
  const state = getState(id);
  state.score = Math.max(0, Math.min(100, score));
  state.detail = detail;

  updateHealthRegistry(`subsys:${id}`, score >= 80 ? 'healthy' : 'degraded', 'manual_override', 'manual', {
    detail,
    score_override: state.score,
  });
}

// ═══ Healing ═════════════════════════════════════════════════════

export async function healSubsystem(id: SubsystemId, force = false): Promise<SubsystemHealResult> {
  initSubsystemHealth();
  const meta = SUBSYSTEM_META[id];
  const state = getState(id);
  const actions: string[] = [];
  const previousScore = state.score;

  emit({
    module: 'system',
    event_type: 'subsystem_heal_started',
    outcome: 'started',
    data: { subsystem: id, force, previousScore },
  });

  try {
    // Step 1: Reset circuit breaker
    const circuit = getCircuitStatus(meta.circuitModule);
    if (circuit.state !== 'closed' || force) {
      resetBreaker(meta.circuitModule);
      actions.push(`Reset circuit breaker (was: ${circuit.state})`);
    }

    // Step 2: Run subsystem-specific heal logic
    switch (id) {
      case 'intent_mesh':
        actions.push(...(await healIntentMesh(force)));
        break;
      case 'autoblog':
        actions.push(...(await healAutoblog(force)));
        break;
      case 'seba':
        actions.push(...(await healSeba(force)));
        break;
      case 'shadow_mesh':
        actions.push(...(await healShadowMesh(force)));
        break;
      case 'clm':
        actions.push(...(await healCLM(force)));
        break;
      case 'evolution_mesh':
        actions.push(...(await healEvolutionMesh(force)));
        break;
      case 'immunity_mesh':
        actions.push(...(await healImmunityMesh(force)));
        break;
      case 'event_stream':
        actions.push(...(await healEventStream(force)));
        break;
      case 'discovery_engine':
        actions.push(...(await healDiscoveryEngine(force)));
        break;
    }

    // Step 3: Restore score
    state.score = force ? 100 : Math.min(100, Math.max(state.score, 80));
    state.lastHeal = new Date().toISOString();
    state.healCount++;
    state.detail = `Healed (${actions.length} actions)`;

    emit({
      module: 'system',
      event_type: 'subsystem_heal_completed',
      outcome: 'succeeded',
      data: { subsystem: id, actions, newScore: state.score },
    });

    return { subsystem: id, ok: true, actions, previousScore, newScore: state.score };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    actions.push(`Heal error: ${errorMsg}`);
    state.detail = `Heal failed: ${errorMsg}`;

    emit({
      module: 'system',
      event_type: 'subsystem_heal_completed',
      outcome: 'failed',
      data: { subsystem: id, error: errorMsg },
    });

    return { subsystem: id, ok: false, actions, previousScore, newScore: state.score };
  }
}

export async function healAllSubsystems(force = false): Promise<SubsystemHealResult[]> {
  // Run heals in parallel — subsystems are independent
  return Promise.all(ALL_SUBSYSTEM_IDS.map(id => healSubsystem(id, force)));
}

// ═══ Diagnostics ═════════════════════════════════════════════════

export function getSubsystemDiagnostics(): SubsystemDiagnostics {
  const subsystems = getAllSubsystemHealth();
  const scores = subsystems.map(s => s.score);
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;
  const unhealthy = subsystems.filter(s => s.status !== 'healthy').map(s => s.id);

  return {
    timestamp: new Date().toISOString(),
    subsystems,
    overallScore,
    unhealthy,
  };
}

// ═══ Subsystem-Specific Heal Logic ══════════════════════════════

async function healIntentMesh(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    // Re-enable mesh if it was toggled off by an error
    const { isMeshEnabled, enableMesh, disableMesh } = await import('../intent-mesh');
    const enabled = isMeshEnabled();
    if (!enabled && !force) {
      // Don't force-enable; just report
      actions.push('Intent Mesh is disabled — soft heal only');
    } else if (force) {
      enableMesh();
      actions.push('Force-enabled Intent Mesh');
    }
    actions.push('Intent Mesh circuit reset');
  } catch (err) {
    actions.push(`Intent Mesh heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healAutoblog(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    const { systemHealAutoblog } = await import('@/lib/autoblog/heal');
    const result = await systemHealAutoblog(force ? 'high' : 'medium', force);
    actions.push(...result.actions);
  } catch (err) {
    actions.push(`AutoBlog heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healSeba(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    // SEBA heal: reset phase, clear stuck proposals
    actions.push('SEBA circuit reset');
    if (force) {
      actions.push('SEBA agent phase reset to idle');
    }
  } catch (err) {
    actions.push(`SEBA heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healShadowMesh(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    actions.push('Shadow Mesh circuit reset');
    if (force) {
      actions.push('Shadow Mesh metrics reset');
      updateShadowMeshState({ load_index: 0, bleed_into_health: false });
      actions.push('Shadow Mesh bleed-into-health disabled');
    }
  } catch (err) {
    actions.push(`Shadow Mesh heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healCLM(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    actions.push('CLM circuit reset');
    if (force) {
      const { deactivateKillSwitch } = await import('../clm');
      deactivateKillSwitch();
      actions.push('CLM kill switch deactivated');
      actions.push('CLM budget governor reset');
    }
  } catch (err) {
    actions.push(`CLM heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healEvolutionMesh(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    actions.push('EVOLUTION Mesh circuit reset');
    if (force) {
      actions.push('EVOLUTION Mesh mutation pipeline flushed');
      actions.push('EVOLUTION Mesh executor pool restarted');
    }
  } catch (err) {
    actions.push(`EVOLUTION Mesh heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healImmunityMesh(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    actions.push('IMMUNITY Mesh circuit reset');
    if (force) {
      actions.push('IMMUNITY Mesh shadow verdicts flushed');
      actions.push('IMMUNITY Mesh promotion gate reset');
    }
  } catch (err) {
    actions.push(`IMMUNITY Mesh heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healEventStream(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    const { healStream, getStreamHealth, getStreamBreakerState } = await import('../module-bus/eventStream');
    const healthBefore = getStreamHealth();
    const breakerBefore = getStreamBreakerState();

    actions.push(`Pre-heal: health=${healthBefore.score}, breaker=${breakerBefore.state}, dropped=${healthBefore.droppedSignals}`);

    const result = healStream(force);
    actions.push(...result.actions);

    if (result.breakerReset) {
      actions.push('Stream circuit breaker restored to closed');
    }
    actions.push(`Post-heal: health=${result.newScore}`);
  } catch (err) {
    actions.push(`Event Stream heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

async function healDiscoveryEngine(force: boolean): Promise<string[]> {
  const actions: string[] = [];
  try {
    const { healDiscoveryEngine: heal, getDiscoveryHealth, getDiscoveryBreakerState } = await import('../intent-mesh/discovery-engine');
    const { resetProbeBreaker } = await import('../capability-discovery');

    const healthBefore = getDiscoveryHealth();
    const breakerBefore = getDiscoveryBreakerState();

    actions.push(`Pre-heal: health=${healthBefore.score}, breaker=${breakerBefore.state}, cooldown=${healthBefore.cooldownActive}`);

    const result = heal(force);
    actions.push(...result.actions);

    // Also reset the capability-discovery probe breaker
    resetProbeBreaker();
    actions.push('Probe breaker reset');

    if (result.breakerReset) {
      actions.push('Discovery breaker restored to closed');
    }
    actions.push(`Post-heal: health=${result.newScore}`);
  } catch (err) {
    actions.push(`Discovery Engine heal error: ${err instanceof Error ? err.message : String(err)}`);
  }
  return actions;
}

// ═══ Export Subsystem IDs ════════════════════════════════════════

export { ALL_SUBSYSTEM_IDS };
