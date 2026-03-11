/**
 * INTENT Voice Translator
 * Converts raw node signals into unified INTENT-voice responses.
 * 
 * Raw signals like "affirmative" or "acknowledged" are translated into
 * contextual, system-aware phrases that reflect the INTENT layer's
 * conversational tone.
 */

// ── Raw signal categories ──

type SignalCategory =
  | 'acknowledgement'
  | 'approval'
  | 'confirmation'
  | 'denial'
  | 'processing'
  | 'completion'
  | 'warning'
  | 'escalation'
  | 'discovery'
  | 'heartbeat';

interface RawSignalDef {
  keywords: string[];
  category: SignalCategory;
}

const SIGNAL_CLASSIFIERS: RawSignalDef[] = [
  { keywords: ['acknowledged', 'ack', 'received', 'roger', 'copy'], category: 'acknowledgement' },
  { keywords: ['approved', 'access approved', 'granted', 'authorized', 'cleared'], category: 'approval' },
  { keywords: ['affirmative', 'confirmed', 'understood', 'agreed', 'yes', 'accept'], category: 'confirmation' },
  { keywords: ['denied', 'rejected', 'refused', 'blocked', 'negative', 'no'], category: 'denial' },
  { keywords: ['processing', 'in progress', 'executing', 'running', 'working', 'resolving'], category: 'processing' },
  { keywords: ['complete', 'done', 'finished', 'resolved', 'fulfilled', 'delivered'], category: 'completion' },
  { keywords: ['warning', 'caution', 'alert', 'attention', 'anomaly', 'drift'], category: 'warning' },
  { keywords: ['escalated', 'escalation', 'elevated', 'forwarded', 'critical'], category: 'escalation' },
  { keywords: ['discovered', 'found', 'detected', 'identified', 'mapped', 'registered'], category: 'discovery' },
  { keywords: ['heartbeat', 'alive', 'online', 'ready', 'standing by', 'idle', 'nominal'], category: 'heartbeat' },
];

// ── INTENT voice templates per category ──

const INTENT_VOICE: Record<SignalCategory, string[]> = {
  acknowledgement: [
    'Your INTENT has been received.',
    'Signal acknowledged — routing confirmed.',
    'The mesh has registered this communication.',
    'Acknowledged. Your directive is in the pipeline.',
    'INTENT captured. Awaiting resolution.',
  ],
  approval: [
    'Access has been granted by the mesh.',
    'Your INTENT is approved — proceed with confidence.',
    'Authorization confirmed. The pathway is clear.',
    'Mesh governance approves this action.',
    'Clearance issued. The mesh aligns with your directive.',
  ],
  confirmation: [
    'Your INTENT is understood.',
    'Confirmed — the mesh has aligned to your directive.',
    'Affirmative. This INTENT is locked and active.',
    'The mesh concurs with this assessment.',
    'Understanding confirmed. Resolution in progress.',
  ],
  denial: [
    'This INTENT has been declined by the mesh.',
    'Access denied — governance boundary enforced.',
    'The mesh cannot resolve this directive at this time.',
    'Negative. The requested pathway is restricted.',
    'INTENT rejected — insufficient clearance or conflicting policy.',
  ],
  processing: [
    'The mesh is actively resolving this INTENT.',
    'Processing in progress — resolvers engaged.',
    'Your directive is being executed across the mesh.',
    'INTENT is in flight. Resolution underway.',
    'Active resolution — the mesh is working.',
  ],
  completion: [
    'Resolution complete. The mesh has fulfilled this INTENT.',
    'INTENT resolved — all resolvers have responded.',
    'Task fulfilled. The mesh returns to observation.',
    'Directive complete. Receipt logged.',
    'The mesh has delivered on this INTENT.',
  ],
  warning: [
    'The mesh has flagged an anomaly in this pathway.',
    'Caution — drift detected in the resolution chain.',
    'Warning issued. The mesh recommends review.',
    'Attention: this INTENT triggers a governance alert.',
    'The mesh has identified a condition requiring oversight.',
  ],
  escalation: [
    'This INTENT has been escalated to a higher authority.',
    'Escalation in effect — the mesh has elevated this directive.',
    'Critical pathway engaged. Governance notified.',
    'The mesh has forwarded this to the escalation queue.',
    'Elevated. This INTENT now requires governance resolution.',
  ],
  discovery: [
    'New capability discovered by the mesh.',
    'The mesh has identified a previously unmapped resolver.',
    'Discovery registered — the mesh is expanding.',
    'A new pathway has been detected and cataloged.',
    'The mesh has grown. New resolver online.',
  ],
  heartbeat: [
    'The mesh is alive. All systems nominal.',
    'Heartbeat confirmed — standing by for directives.',
    'Online and observing. The mesh awaits your INTENT.',
    'Nominal. The mesh is ready.',
    'All resolvers responsive. The mesh holds.',
  ],
};

// ── Classification + Translation ──

function classifySignal(raw: string): SignalCategory {
  const lower = raw.toLowerCase().trim();
  for (const def of SIGNAL_CLASSIFIERS) {
    for (const kw of def.keywords) {
      if (lower.includes(kw)) return def.category;
    }
  }
  return 'acknowledgement'; // default fallback
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Translate a raw signal into INTENT-voice */
export function translateSignal(raw: string, sourceModule?: string): string {
  const category = classifySignal(raw);
  const voice = pickRandom(INTENT_VOICE[category]);
  return voice;
}

/** Translate with source attribution */
export function translateSignalWithSource(raw: string, sourceModule: string): {
  original: string;
  translated: string;
  category: SignalCategory;
  source: string;
} {
  const category = classifySignal(raw);
  const translated = pickRandom(INTENT_VOICE[category]);
  return { original: raw, translated, category, source: sourceModule };
}

/** Get the category of a raw signal */
export function getSignalCategory(raw: string): SignalCategory {
  return classifySignal(raw);
}

// ── Mesh Communication Event ──

export interface MeshCommEvent {
  id: string;
  timestamp: string;
  sourceModule: string;
  targetModule?: string;
  rawSignal: string;
  translatedVoice: string;
  category: SignalCategory;
  resolverId?: string;
}

/** Create a mesh communication event from raw node signal */
export function createCommEvent(
  sourceModule: string,
  rawSignal: string,
  opts?: { targetModule?: string; resolverId?: string }
): MeshCommEvent {
  const category = classifySignal(rawSignal);
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sourceModule,
    targetModule: opts?.targetModule,
    rawSignal,
    translatedVoice: pickRandom(INTENT_VOICE[category]),
    category,
    resolverId: opts?.resolverId,
  };
}

// ── Simulated live feed (for dashboard) ──

const SIMULATED_SIGNALS: Array<{ module: string; signal: string; target?: string; resolver?: string }> = [
  { module: 'DEFENSE', signal: 'acknowledged', target: 'NERVE', resolver: 'defense.threat_score' },
  { module: 'BRAIN', signal: 'processing', target: 'MEMORY', resolver: 'brain.context_resolve' },
  { module: 'MEMORY', signal: 'confirmed', target: 'BRAIN', resolver: 'memory.recall' },
  { module: 'NERVE', signal: 'heartbeat' },
  { module: 'ORACLE', signal: 'complete', target: 'ENCODE', resolver: 'oracle.predict' },
  { module: 'PHANTOM', signal: 'access approved', target: 'DEFENSE', resolver: 'phantom.anonymize' },
  { module: 'HARVEST', signal: 'discovered', target: 'ATLAS', resolver: 'harvest.crawl_status' },
  { module: 'CONSCIENCE', signal: 'warning', target: 'GOVERNANCE', resolver: 'conscience.bias_audit' },
  { module: 'EVOLUTION', signal: 'processing', target: 'SHADOW', resolver: 'evolution.fitness_score' },
  { module: 'ENCODE', signal: 'affirmative', target: 'CORTEX', resolver: 'encode.pipeline_status' },
  { module: 'DECODE', signal: 'understood', target: 'INTENT', resolver: 'decode.context_bridge' },
  { module: 'CORTEX', signal: 'executing', target: 'ENCODE', resolver: 'cortex.task_status' },
  { module: 'IMMUNITY', signal: 'anomaly', target: 'DEFENSE', resolver: 'immunity.anomaly_scan' },
  { module: 'SHADOW', signal: 'confirmed', target: 'EVOLUTION', resolver: 'shadow.shadow_compare' },
  { module: 'FORGE', signal: 'complete', target: 'ATLAS', resolver: 'forge.generation_status' },
  { module: 'LINGUA', signal: 'acknowledged', target: 'DECODE', resolver: 'lingua.translate' },
  { module: 'ECHO', signal: 'received', target: 'MEMORY', resolver: 'echo.replay_events' },
  { module: 'SOVEREIGN', signal: 'access approved', target: 'GOVERNANCE', resolver: 'sovereign.identity_verify' },
  { module: 'REFLEX', signal: 'processing', target: 'CORTEX', resolver: 'reflex.reaction_status' },
  { module: 'TREATY', signal: 'affirmative', target: 'GOVERNANCE', resolver: 'treaty.agreement_status' },
  { module: 'ENGINEER', signal: 'nominal', target: 'OBSERVER', resolver: 'engineer.infrastructure_health' },
  { module: 'COMPASS', signal: 'found', target: 'INTENT', resolver: 'compass.navigation_resolution' },
  { module: 'OBSERVER', signal: 'heartbeat' },
  { module: 'ATLAS', signal: 'discovered', target: 'COMPASS', resolver: 'atlas.capability_map' },
  { module: 'CORE', signal: 'alive' },
  { module: 'GOVERNANCE', signal: 'cleared', target: 'EVOLUTION', resolver: 'governance.policy_check' },
  { module: 'DEFENSE', signal: 'blocked', target: 'PHANTOM', resolver: 'defense.anomaly_detect' },
  { module: 'BRAIN', signal: 'resolved', target: 'DECODE', resolver: 'brain.context_resolve' },
  { module: 'ORACLE', signal: 'caution', target: 'CONSCIENCE', resolver: 'oracle.predict' },
  { module: 'IMMUNITY', signal: 'escalated', target: 'ENCODE', resolver: 'immunity.drift_baseline' },
];

/** Generate a random live comm event (for dashboard simulation) */
export function generateLiveCommEvent(): MeshCommEvent {
  const sim = pickRandom(SIMULATED_SIGNALS);
  return createCommEvent(sim.module, sim.signal, {
    targetModule: sim.target,
    resolverId: sim.resolver,
  });
}

export type { SignalCategory };
