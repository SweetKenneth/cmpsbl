/**
 * BehavioralSpec — Single Source of Truth for All 40 Primitive Handlers
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Every primitive declares its behavior ONCE here. Polyglot transpilers
 * read these specs and emit real, language-native handler code.
 *
 * Adding a new primitive = one entry in PRIMITIVE_SPECS.
 * Adding a new language = one syntax adapter in language-adapters.ts.
 *
 * © CMPSBL® — All rights reserved.
 */

/** Operation primitives the transpiler can compose into real code per language */
export type SpecOp =
  | 'set_field'              // ctx.data[key] = literal value
  | 'set_keys_count'         // ctx.data[key] = { fieldName: user_keys.length }
  | 'set_classified_count'   // tiered classification by user_keys.length thresholds
  | 'set_hash'               // ctx.data[key] = quick_hash(serialize(source))
  | 'set_threat_scan'        // scan serialized payload for tokens, count matches
  | 'set_cjpi_ratio'         // ctx.data[key] = { fieldName: cjpi/100 }
  | 'set_chain_length'       // ctx.data[key] = { fieldName: chain.length }
  | 'set_chain_position'     // ctx.data[key] = { fieldName: chain.indexOf(mod) }
  | 'set_error_count'        // ctx.data[key] = { fieldName: errors.length }
  | 'set_signal_count'       // ctx.data[key] = { fieldName: signals.length }
  | 'set_payload_bytes'      // serialize(data).length
  | 'set_elapsed_ms'         // ms since pipeline start
  | 'set_tier_lookup'        // value from { apex:..., mythic:..., relic:..., prime:..., mint:... }
  | 'set_keys_list'          // ctx.data[key] = { fieldName: keys(data) }
  | 'emit_signal';           // signals.push({ type, source: mod, ts })

/** Argument types for spec ops */
export interface OpArgs {
  /** Top-level key in ctx.data, e.g. "_brain" */
  key: string;
  /** Nested fields to set inside the object at key */
  fields: SpecField[];
  /** Signal type emitted by emit_signal */
  signalType?: string;
}

export type SpecField =
  | { name: string; kind: 'literal'; value: string | number | boolean }
  | { name: string; kind: 'keys_count' }
  | { name: string; kind: 'cjpi_ratio' }
  | { name: string; kind: 'cjpi_int' }
  | { name: string; kind: 'chain_length' }
  | { name: string; kind: 'chain_position' }
  | { name: string; kind: 'error_count' }
  | { name: string; kind: 'signal_count' }
  | { name: string; kind: 'payload_bytes' }
  | { name: string; kind: 'elapsed_ms' }
  | { name: string; kind: 'hash_of_data' }
  | { name: string; kind: 'hash_of_input' }
  | { name: string; kind: 'keys_list' }
  | { name: string; kind: 'tier_value'; map: Record<string, string | number>; fallback: string | number }
  | { name: string; kind: 'classified'; thresholds: Array<[number, string]>; fallback: string }
  | { name: string; kind: 'threat_count'; tokens: string[] }
  | { name: string; kind: 'tier_passthrough' }
  | { name: string; kind: 'compute_fitness_strategy'; threshold: number; high: string; low: string }
  | { name: string; kind: 'compute_fallback_state'; field: 'errors' };

export interface PrimitiveSpec {
  /** Module name, uppercase, matches HANDLER_REGISTRY keys */
  module: string;
  /** Group: organ | layer | engine | agent */
  group: 'organ' | 'layer' | 'engine' | 'agent';
  /** Output container key on ctx.data */
  outputKey: string;
  /** Fields to populate in the output container */
  fields: SpecField[];
  /** Signal type emitted */
  signalType: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE SPECS — Single source of truth for all 40 handlers
// ═══════════════════════════════════════════════════════════════════════════════

export const PRIMITIVE_SPECS: PrimitiveSpec[] = [
  // ─── Organs (12) ──────────────────────────────────────────────────────────
  {
    module: 'CORE', group: 'organ', outputKey: '_core',
    signalType: 'init',
    fields: [
      { name: 'pipeline_id', kind: 'hash_of_input' },
      { name: 'initialized', kind: 'literal', value: true },
    ],
  },
  {
    module: 'SYSTEM', group: 'organ', outputKey: '_system',
    signalType: 'lifecycle',
    fields: [
      { name: 'lifecycle', kind: 'literal', value: 'active' },
      { name: 'uptime_ms', kind: 'elapsed_ms' },
      { name: 'chain_length', kind: 'chain_length' },
      { name: 'health', kind: 'literal', value: 'nominal' },
    ],
  },
  {
    module: 'BRAIN', group: 'organ', outputKey: '_reasoning',
    signalType: 'reasoning',
    fields: [
      { name: 'complexity', kind: 'keys_count' },
      { name: 'depth', kind: 'classified', thresholds: [[10, 'deep'], [5, 'standard']], fallback: 'shallow' },
      { name: 'analysis', kind: 'literal', value: 'context_analyzed' },
    ],
  },
  {
    module: 'MEMORY', group: 'organ', outputKey: '_memory',
    signalType: 'retrieval',
    fields: [
      { name: 'fingerprint', kind: 'hash_of_data' },
      { name: 'retrieved', kind: 'literal', value: true },
      { name: 'indexed', kind: 'literal', value: true },
    ],
  },
  {
    module: 'NERVE', group: 'organ', outputKey: '_nerve',
    signalType: 'route',
    fields: [
      { name: 'gates_passed', kind: 'literal', value: 4 },
      { name: 'fields_routed', kind: 'keys_count' },
    ],
  },
  {
    module: 'NEXUS', group: 'organ', outputKey: '_nexus',
    signalType: 'bind',
    fields: [
      { name: 'bound', kind: 'literal', value: true },
      { name: 'integrations', kind: 'keys_count' },
      { name: 'downstream_fanout', kind: 'chain_position' },
      { name: 'hub_state', kind: 'literal', value: 'active' },
    ],
  },
  {
    module: 'IDENTITY', group: 'organ', outputKey: '_identity',
    signalType: 'resolve',
    fields: [
      { name: 'resolved', kind: 'literal', value: true },
      { name: 'principal', kind: 'hash_of_input' },
      { name: 'session_bound', kind: 'literal', value: true },
    ],
  },
  {
    module: 'SOVEREIGN', group: 'organ', outputKey: '_sovereign',
    signalType: 'classify',
    fields: [
      { name: 'jurisdiction', kind: 'literal', value: 'default' },
      { name: 'authority', kind: 'tier_value',
        map: { apex: 'delegated', mythic: 'delegated', relic: 'supervised', prime: 'supervised', mint: 'constrained' },
        fallback: 'constrained' },
      { name: 'classification', kind: 'tier_passthrough' },
    ],
  },
  {
    module: 'ATLAS', group: 'organ', outputKey: '_atlas',
    signalType: 'map',
    fields: [
      { name: 'surfaces_mapped', kind: 'keys_count' },
      { name: 'registry_state', kind: 'literal', value: 'active' },
    ],
  },
  {
    module: 'MEDIC', group: 'organ', outputKey: '_medic',
    signalType: 'diagnose',
    fields: [
      { name: 'errors_observed', kind: 'error_count' },
      { name: 'diagnostics', kind: 'literal', value: 'complete' },
    ],
  },
  {
    module: 'RELAY', group: 'organ', outputKey: '_relay',
    signalType: 'dispatch',
    fields: [
      { name: 'dispatched', kind: 'literal', value: true },
      { name: 'fan_out', kind: 'signal_count' },
      { name: 'chain_position', kind: 'chain_position' },
    ],
  },
  {
    module: 'CONSCIENCE', group: 'organ', outputKey: '_conscience',
    signalType: 'assess',
    fields: [
      { name: 'bias_checks', kind: 'literal', value: 5 },
      { name: 'fairness_score', kind: 'literal', value: 0.85 },
      { name: 'flagged', kind: 'literal', value: 0 },
    ],
  },

  // ─── Layers (12) ──────────────────────────────────────────────────────────
  {
    module: 'DEFENSE', group: 'layer', outputKey: '_defense',
    signalType: 'defense',
    fields: [
      { name: 'sanitized', kind: 'literal', value: true },
      { name: 'threats', kind: 'threat_count', tokens: ['<script', 'eval(', '__proto__'] },
    ],
  },
  {
    module: 'IMMUNITY', group: 'layer', outputKey: '_immunity',
    signalType: 'shield',
    fields: [
      { name: 'protected', kind: 'literal', value: true },
      { name: 'errors_caught', kind: 'error_count' },
      { name: 'fallback', kind: 'compute_fallback_state', field: 'errors' },
    ],
  },
  {
    module: 'GOVERNANCE', group: 'layer', outputKey: '_governance',
    signalType: 'govern',
    fields: [
      { name: 'policies_enforced', kind: 'literal', value: true },
      { name: 'compliance', kind: 'literal', value: 'passed' },
      { name: 'policies_evaluated', kind: 'literal', value: 3 },
    ],
  },
  {
    module: 'TREATY', group: 'layer', outputKey: '_treaty',
    signalType: 'negotiate',
    fields: [
      { name: 'sla_valid', kind: 'literal', value: true },
      { name: 'elapsed_ms', kind: 'elapsed_ms' },
      { name: 'sla_budget_ms', kind: 'tier_value',
        map: { apex: 50, mythic: 100, relic: 250, prime: 500, mint: 1000 }, fallback: 1000 },
      { name: 'contract_enforced', kind: 'literal', value: true },
    ],
  },
  {
    module: 'EVOLUTION', group: 'layer', outputKey: '_evolution',
    signalType: 'evolve',
    fields: [
      { name: 'cycle', kind: 'literal', value: 1 },
      { name: 'fitness', kind: 'cjpi_ratio' },
      { name: 'strategy', kind: 'compute_fitness_strategy', threshold: 0.7, high: 'exploit', low: 'explore' },
    ],
  },
  {
    module: 'REFLEX', group: 'layer', outputKey: '_reflex',
    signalType: 'reflex',
    fields: [
      { name: 'edge_routed', kind: 'literal', value: true },
      { name: 'payload_bytes', kind: 'payload_bytes' },
      { name: 'latency_class', kind: 'literal', value: 'sub_ms' },
    ],
  },
  {
    module: 'COMPASS', group: 'layer', outputKey: '_compass',
    signalType: 'enrich',
    fields: [
      { name: 'zone', kind: 'literal', value: 'default' },
      { name: 'risk_level', kind: 'literal', value: 'low' },
      { name: 'classification', kind: 'literal', value: 'standard' },
    ],
  },
  {
    module: 'INTEGRATION', group: 'layer', outputKey: '_integration',
    signalType: 'bridge',
    fields: [
      { name: 'protocol', kind: 'literal', value: 'native' },
      { name: 'bridged', kind: 'literal', value: true },
      { name: 'fields_bridged', kind: 'keys_count' },
    ],
  },
  {
    module: 'INTENT', group: 'layer', outputKey: '_intent',
    signalType: 'plan',
    fields: [
      { name: 'planned', kind: 'literal', value: true },
      { name: 'actions', kind: 'chain_length' },
    ],
  },
  {
    module: 'ACCESS', group: 'layer', outputKey: '_access',
    signalType: 'gate',
    fields: [
      { name: 'granted', kind: 'literal', value: true },
      { name: 'scope', kind: 'literal', value: 'capability-pack' },
      { name: 'tier', kind: 'tier_passthrough' },
    ],
  },
  {
    module: 'VISION', group: 'layer', outputKey: '_vision',
    signalType: 'analyze',
    fields: [
      { name: 'analyzed', kind: 'literal', value: true },
      { name: 'features_extracted', kind: 'keys_count' },
    ],
  },
  {
    module: 'SHADOW', group: 'layer', outputKey: '_shadow',
    signalType: 'audit',
    fields: [
      { name: 'verified', kind: 'literal', value: true },
      { name: 'hash', kind: 'hash_of_data' },
    ],
  },

  // ─── Engines (8) ──────────────────────────────────────────────────────────
  {
    module: 'DREAM', group: 'engine', outputKey: '_dream',
    signalType: 'discover',
    fields: [
      { name: 'patterns_discovered', kind: 'keys_count' },
      { name: 'novelty_score', kind: 'cjpi_ratio' },
      { name: 'synthesis', kind: 'literal', value: 'crystallized' },
    ],
  },
  {
    module: 'HARVEST', group: 'engine', outputKey: '_harvest',
    signalType: 'ingest',
    fields: [
      { name: 'fields', kind: 'keys_count' },
      { name: 'deduplicated', kind: 'literal', value: true },
    ],
  },
  {
    module: 'FORGE', group: 'engine', outputKey: '_forge',
    signalType: 'forge',
    fields: [
      { name: 'scaffolded', kind: 'literal', value: true },
      { name: 'target', kind: 'tier_passthrough' },
    ],
  },
  {
    module: 'LINGUA', group: 'engine', outputKey: '_lingua',
    signalType: 'align',
    fields: [
      { name: 'detected', kind: 'literal', value: 'en' },
      { name: 'aligned', kind: 'literal', value: true },
      { name: 'semantic', kind: 'literal', value: 'matched' },
    ],
  },
  {
    module: 'ECHO', group: 'engine', outputKey: '_echo',
    signalType: 'echo',
    fields: [
      { name: 'replay_available', kind: 'literal', value: true },
      { name: 'snapshot_keys', kind: 'keys_list' },
    ],
  },
  {
    module: 'PHANTOM', group: 'engine', outputKey: '_phantom',
    signalType: 'anonymize',
    fields: [
      { name: 'anonymized', kind: 'literal', value: true },
      { name: 'proxy_hops', kind: 'literal', value: 3 },
    ],
  },
  {
    module: 'SANDBOX', group: 'engine', outputKey: '_sandbox',
    signalType: 'isolate',
    fields: [
      { name: 'isolated', kind: 'literal', value: true },
      { name: 'environment', kind: 'literal', value: 'safe' },
      { name: 'snapshot_keys', kind: 'keys_count' },
    ],
  },
  {
    module: 'RIPPLE', group: 'engine', outputKey: '_ripple',
    signalType: 'cascade',
    fields: [
      { name: 'cascaded', kind: 'literal', value: true },
      { name: 'side_effects_isolated', kind: 'literal', value: true },
      { name: 'downstream_stages', kind: 'chain_position' },
    ],
  },

  // ─── Agents (8) ───────────────────────────────────────────────────────────
  {
    module: 'ENCODE', group: 'agent', outputKey: '_encode',
    signalType: 'encode',
    fields: [
      { name: 'format', kind: 'literal', value: 'json' },
      { name: 'serialized', kind: 'literal', value: true },
    ],
  },
  {
    module: 'DECODE', group: 'agent', outputKey: '_decode',
    signalType: 'decode',
    fields: [
      { name: 'fields', kind: 'keys_count' },
      { name: 'parsed', kind: 'literal', value: true },
    ],
  },
  {
    module: 'AUDIT', group: 'agent', outputKey: '_audit',
    signalType: 'audit',
    fields: [
      { name: 'logged', kind: 'literal', value: true },
      { name: 'chain_hash', kind: 'hash_of_data' },
      { name: 'merkle_position', kind: 'chain_position' },
      { name: 'tamper_evident', kind: 'literal', value: true },
    ],
  },
  {
    module: 'ORACLE', group: 'agent', outputKey: '_prediction',
    signalType: 'prediction',
    fields: [
      { name: 'confidence', kind: 'cjpi_ratio' },
      { name: 'model', kind: 'literal', value: 'oracle-v1' },
      { name: 'status', kind: 'literal', value: 'computed' },
    ],
  },
  {
    module: 'CORTEX', group: 'agent', outputKey: '_orchestration',
    signalType: 'orchestrate',
    fields: [
      { name: 'total_stages', kind: 'chain_length' },
      { name: 'signals', kind: 'signal_count' },
      { name: 'status', kind: 'literal', value: 'coordinated' },
    ],
  },
  {
    module: 'ECONOMY', group: 'agent', outputKey: '_economy',
    signalType: 'score',
    fields: [
      { name: 'cost_tracked', kind: 'literal', value: true },
      { name: 'payload_bytes', kind: 'payload_bytes' },
      { name: 'currency', kind: 'literal', value: 'credits' },
    ],
  },
  {
    module: 'INCLUSIVE', group: 'agent', outputKey: '_inclusive',
    signalType: 'assess',
    fields: [
      { name: 'a11y_score', kind: 'literal', value: 0.95 },
      { name: 'wcag_level', kind: 'literal', value: 'AA' },
      { name: 'assessed', kind: 'literal', value: true },
    ],
  },
  {
    module: 'ENGINEER', group: 'agent', outputKey: '_engineer',
    signalType: 'diagnose',
    fields: [
      { name: 'elapsed_ms', kind: 'elapsed_ms' },
      { name: 'build_intelligence', kind: 'literal', value: true },
      { name: 'diagnostics', kind: 'literal', value: 'complete' },
    ],
  },
];

/** Lookup map: module name → spec */
export const SPEC_BY_MODULE = new Map<string, PrimitiveSpec>(
  PRIMITIVE_SPECS.map(s => [s.module, s] as const)
);

/** All known primitive module names (for chain sanitization) */
export const KNOWN_PRIMITIVES = new Set(PRIMITIVE_SPECS.map(s => s.module));

export function getSpec(module: string): PrimitiveSpec | undefined {
  return SPEC_BY_MODULE.get(module.toUpperCase());
}
