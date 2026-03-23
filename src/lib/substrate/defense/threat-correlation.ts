/**
 * DEFENSE — Threat Correlation Engine v1.0.0
 * Cross-engine signal correlation to detect multi-stage attack chains.
 *
 * Correlates payload, injection, and behavioral signals per actor
 * to identify kill-chain progression: Recon → Probe → Exploit → Exfil.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type KillChainPhase = 'reconnaissance' | 'weaponization' | 'delivery' | 'exploitation' | 'installation' | 'command_control' | 'exfiltration';

export interface CorrelationSignal {
  readonly id: string;
  readonly timestamp: number;
  readonly actorId: string;
  readonly engine: 'payload' | 'injection' | 'behavioral';
  readonly category: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly killChainPhase: KillChainPhase;
  readonly confidence: number;
}

export interface AttackChain {
  readonly chainId: string;
  readonly actorId: string;
  readonly phases: readonly KillChainPhase[];
  readonly signals: readonly CorrelationSignal[];
  readonly startedAt: number;
  readonly lastActivity: number;
  readonly chainScore: number; // 0-100
  readonly isMultiStage: boolean;
  readonly ttl: number;
}

export interface CorrelationResult {
  readonly activeChains: readonly AttackChain[];
  readonly highestChainScore: number;
  readonly multiStageDetected: boolean;
  readonly recommendedAction: 'allow' | 'flag' | 'throttle' | 'block';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY → KILL CHAIN MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const PHASE_MAP: Record<string, KillChainPhase> = {
  // Recon
  reconnaissance: 'reconnaissance',
  path_traversal: 'reconnaissance',
  open_redirect: 'reconnaissance',
  anomalous: 'reconnaissance',
  // Delivery
  sql_injection: 'delivery',
  xss: 'delivery',
  nosql_injection: 'delivery',
  xml_injection: 'delivery',
  template_injection: 'delivery',
  header_injection: 'delivery',
  command_injection: 'delivery',
  prototype_pollution: 'delivery',
  // Exploitation
  ssrf: 'exploitation',
  remote_code_execution: 'exploitation',
  shell_access: 'exploitation',
  reverse_shell: 'exploitation',
  web_shell: 'exploitation',
  environment_access: 'exploitation',
  filesystem_access: 'exploitation',
  // Installation
  persistence: 'installation',
  supply_chain: 'installation',
  dynamic_import: 'installation',
  cryptominer: 'installation',
  ransomware: 'installation',
  keylogger: 'installation',
  // C2
  lateral_movement: 'command_control',
  evasion: 'command_control',
  obfuscation: 'command_control',
  // Exfil
  exfiltration: 'exfiltration',
  data_exfiltration: 'exfiltration',
  privilege_escalation: 'exfiltration',
};

const PHASE_ORDER: KillChainPhase[] = [
  'reconnaissance', 'weaponization', 'delivery', 'exploitation',
  'installation', 'command_control', 'exfiltration',
];

const PHASE_WEIGHT: Record<KillChainPhase, number> = {
  reconnaissance: 5,
  weaponization: 10,
  delivery: 20,
  exploitation: 35,
  installation: 45,
  command_control: 55,
  exfiltration: 70,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_SIGNALS_PER_ACTOR = 200;
const MAX_ACTORS = 500;
const CHAIN_TTL_MS = 30 * 60_000; // 30 minutes
let signalSeq = 0;

/** Actor → rolling signal buffer */
const actorSignals = new Map<string, CorrelationSignal[]>();

/** Actor → active attack chains */
const activeChains = new Map<string, AttackChain[]>();

// ═══════════════════════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ingest a threat signal from any engine.
 */
export function ingestSignal(
  actorId: string,
  engine: CorrelationSignal['engine'],
  category: string,
  severity: CorrelationSignal['severity'],
  confidence = 0.8,
): CorrelationSignal {
  const phase = PHASE_MAP[category] || 'reconnaissance';
  const signal: CorrelationSignal = Object.freeze({
    id: `SIG-${(++signalSeq).toString(36)}-${Date.now().toString(36)}`,
    timestamp: Date.now(),
    actorId,
    engine,
    category,
    severity,
    killChainPhase: phase,
    confidence,
  });

  // Bounded buffer per actor
  let signals = actorSignals.get(actorId);
  if (!signals) {
    signals = [];
    actorSignals.set(actorId, signals);
  }
  signals.push(signal);
  if (signals.length > MAX_SIGNALS_PER_ACTOR) {
    signals.splice(0, signals.length - MAX_SIGNALS_PER_ACTOR);
  }

  // Evict old actors if over cap
  if (actorSignals.size > MAX_ACTORS) {
    const oldest = actorSignals.keys().next().value;
    if (oldest) {
      actorSignals.delete(oldest);
      activeChains.delete(oldest);
    }
  }

  // Rebuild chains for this actor
  rebuildChains(actorId, signals);

  return signal;
}

/**
 * Rebuild attack chains from signal buffer.
 */
function rebuildChains(actorId: string, signals: CorrelationSignal[]): void {
  const now = Date.now();
  const recent = signals.filter(s => now - s.timestamp < CHAIN_TTL_MS);

  // Group by phase
  const phaseMap = new Map<KillChainPhase, CorrelationSignal[]>();
  for (const s of recent) {
    const arr = phaseMap.get(s.killChainPhase) || [];
    arr.push(s);
    phaseMap.set(s.killChainPhase, arr);
  }

  // Detect sequential phase progression
  const phasesPresent = PHASE_ORDER.filter(p => phaseMap.has(p));

  if (phasesPresent.length < 1) {
    activeChains.delete(actorId);
    return;
  }

  // Calculate chain score
  let score = 0;
  for (const phase of phasesPresent) {
    score += PHASE_WEIGHT[phase];
    const phaseSignals = phaseMap.get(phase) || [];
    // Bonus for cross-engine signals in same phase
    const engines = new Set(phaseSignals.map(s => s.engine));
    if (engines.size > 1) score += 10;
  }

  // Bonus for sequential progression
  let sequential = 0;
  for (let i = 1; i < phasesPresent.length; i++) {
    const prevIdx = PHASE_ORDER.indexOf(phasesPresent[i - 1]);
    const currIdx = PHASE_ORDER.indexOf(phasesPresent[i]);
    if (currIdx > prevIdx) sequential++;
  }
  score += sequential * 15;
  score = Math.min(100, score);

  const allSignals = recent.sort((a, b) => a.timestamp - b.timestamp);

  const chain: AttackChain = Object.freeze({
    chainId: `CHAIN-${actorId.slice(0, 8)}-${now.toString(36)}`,
    actorId,
    phases: Object.freeze(phasesPresent),
    signals: Object.freeze(allSignals),
    startedAt: allSignals[0]?.timestamp || now,
    lastActivity: allSignals[allSignals.length - 1]?.timestamp || now,
    chainScore: score,
    isMultiStage: phasesPresent.length >= 2,
    ttl: CHAIN_TTL_MS,
  });

  activeChains.set(actorId, [chain]);
}

/**
 * Correlate all signals for an actor and return a verdict.
 */
export function correlate(actorId: string): CorrelationResult {
  const chains = activeChains.get(actorId) || [];
  const highestScore = chains.reduce((max, c) => Math.max(max, c.chainScore), 0);
  const multiStage = chains.some(c => c.isMultiStage);

  let action: CorrelationResult['recommendedAction'] = 'allow';
  if (highestScore >= 80) action = 'block';
  else if (highestScore >= 50) action = 'throttle';
  else if (highestScore >= 20) action = 'flag';

  return Object.freeze({
    activeChains: Object.freeze(chains),
    highestChainScore: highestScore,
    multiStageDetected: multiStage,
    recommendedAction: action,
  });
}

/**
 * Get all active chains across all actors.
 */
export function getAllActiveChains(): readonly AttackChain[] {
  const all: AttackChain[] = [];
  for (const chains of activeChains.values()) {
    all.push(...chains);
  }
  return Object.freeze(all.sort((a, b) => b.chainScore - a.chainScore));
}

/**
 * Get correlation stats.
 */
export function getCorrelationStats() {
  return {
    version: '1.0.0',
    trackedActors: actorSignals.size,
    activeChainCount: activeChains.size,
    totalSignalsIngested: signalSeq,
    maxActors: MAX_ACTORS,
    chainTtlMs: CHAIN_TTL_MS,
  };
}

/**
 * Clear all correlation state.
 */
export function clearCorrelationState(): void {
  actorSignals.clear();
  activeChains.clear();
}
