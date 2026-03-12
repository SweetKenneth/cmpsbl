/**
 * CMPSBL Engine SDK — Universal Client
 * 
 * Works with ALL 54 Composable Engines via a single import.
 * Copy this file into your project and start calling engines.
 * 
 * Usage:
 *   import { Engine } from './cmpsbl-engine-sdk';
 *   const engine = new Engine('your-api-key');
 * 
 *   // Call any engine by name:
 *   const result = await engine.call('godmind', 'reason', 'What are the implications of X?');
 * 
 *   // Or use typed helpers:
 *   const gm = engine.godmind;
 *   const result = await gm.reason('What are the implications of X?');
 * 
 * @version 1.0.0
 * @license Perpetual — Single-seat
 * @see https://cmpsbl.com/engines
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EngineCallOptions {
  /** Processing depth: shallow (fast), standard (balanced), deep (thorough) */
  depth?: 'shallow' | 'standard' | 'deep';
  /** Limit which pipeline stages run (engine-specific stage names) */
  stages?: string[];
  /** AI temperature (0-1). Default: 0.7. */
  temperature?: number;
}

export interface EngineStageResult {
  stage: string;
  output: string;
  confidence: number;
  tokens: number;
  latency_ms: number;
}

export interface EngineResult {
  success: boolean;
  engine: string;
  action: string;
  result: string;
  confidence: number;
  pipeline: {
    stages: EngineStageResult[];
    total_tokens: number;
    total_latency_ms: number;
    depth: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// TYPED ENGINE HELPERS
// ═══════════════════════════════════════════════════════════════

/** Helper class for a specific engine — provides typed action methods */
class EngineProxy {
  constructor(
    private readonly client: Engine,
    private readonly slug: string,
    private readonly actions: string[],
  ) {
    // Dynamically create methods for each action
    for (const action of actions) {
      (this as any)[action] = (input: string, context?: Record<string, unknown>, options?: EngineCallOptions) =>
        this.client.call(this.slug, action, input, context, options);
    }
  }
}

// ─── META ENGINE PROXIES (4-stage superpipelines) ───

class GodmindProxy extends EngineProxy {
  constructor(client: Engine) { super(client, 'godmind', ['reason', 'analyze', 'plan', 'evaluate']); }
  reason(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('godmind', 'reason', input, context, options); }
  analyze(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('godmind', 'analyze', input, context, options); }
  plan(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('godmind', 'plan', input, context, options); }
  evaluate(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('godmind', 'evaluate', input, context, options); }
  /** PANDORA stage only — quick hypothesis generation */
  hypothesize(input: string, context?: Record<string, unknown>) { return this.client.call('godmind', 'reason', input, context, { stages: ['PANDORA'] }); }
  /** Full pipeline, deep mode — for critical decisions */
  deepReason(input: string, context?: Record<string, unknown>) { return this.client.call('godmind', 'reason', input, context, { depth: 'deep' }); }
}

class FortressProxy extends EngineProxy {
  constructor(client: Engine) { super(client, 'fortress', ['defend', 'audit', 'harden', 'assess']); }
  defend(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('fortress', 'defend', input, context, options); }
  audit(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('fortress', 'audit', input, context, options); }
  harden(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('fortress', 'harden', input, context, options); }
  assess(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('fortress', 'assess', input, context, options); }
}

class SingularityProxy extends EngineProxy {
  constructor(client: Engine) { super(client, 'singularity', ['predict', 'fuse', 'optimize', 'synthesize']); }
  predict(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('singularity', 'predict', input, context, options); }
  fuse(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('singularity', 'fuse', input, context, options); }
  optimize(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('singularity', 'optimize', input, context, options); }
  synthesize(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('singularity', 'synthesize', input, context, options); }
}

class EternusProxy extends EngineProxy {
  constructor(client: Engine) { super(client, 'eternus', ['govern', 'audit', 'comply', 'automate']); }
  govern(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('eternus', 'govern', input, context, options); }
  audit(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('eternus', 'audit', input, context, options); }
  comply(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('eternus', 'comply', input, context, options); }
  automate(input: string, context?: Record<string, unknown>, options?: EngineCallOptions) { return this.client.call('eternus', 'automate', input, context, options); }
}

// ═══════════════════════════════════════════════════════════════
// MAIN CLIENT
// ═══════════════════════════════════════════════════════════════

export class Engine {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  // ─── Typed engine accessors ───
  readonly godmind: GodmindProxy;
  readonly fortress: FortressProxy;
  readonly singularity: SingularityProxy;
  readonly eternus: EternusProxy;

  /**
   * Create a CMPSBL Engine client.
   * @param apiKey Your CMPSBL API key (from https://cmpsbl.com/api-access)
   * @param baseUrl Override the API endpoint (default: CMPSBL production)
   */
  constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) throw new Error('CMPSBL Engine SDK: API key is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/engine-api';

    // Initialize typed proxies for META engines
    this.godmind = new GodmindProxy(this);
    this.fortress = new FortressProxy(this);
    this.singularity = new SingularityProxy(this);
    this.eternus = new EternusProxy(this);
  }

  /**
   * Call any engine by slug and action.
   * This is the universal method — works with all 54 engines.
   * 
   * @param engine Engine slug (e.g., 'godmind', 'sentinel', 'cortex')
   * @param action Action to perform (engine-specific, e.g., 'reason', 'scan', 'predict')
   * @param input The primary input text
   * @param context Optional context object passed to the engine
   * @param options Processing options (depth, stages, temperature)
   */
  async call(
    engine: string,
    action: string,
    input: string,
    context?: Record<string, unknown>,
    options?: EngineCallOptions,
  ): Promise<EngineResult> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Engine-Key': this.apiKey,
      },
      body: JSON.stringify({
        engine,
        action,
        input,
        context,
        options: options ? {
          depth: options.depth,
          stages: options.stages,
          temperature: options.temperature,
        } : undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new EngineAPIError(err.error || `Request failed with status ${res.status}`, res.status);
    }

    return res.json();
  }

  /**
   * Get a generic engine proxy for any engine by slug.
   * Use this for engines without typed proxies.
   * 
   * @example
   * const sentinel = engine.get('sentinel');
   * // Then call dynamically:
   * const result = await engine.call('sentinel', 'scan', 'Check this for threats...');
   */
  get(slug: string): { call: (action: string, input: string, context?: Record<string, unknown>, options?: EngineCallOptions) => Promise<EngineResult> } {
    return {
      call: (action, input, context, options) => this.call(slug, action, input, context, options),
    };
  }

  /**
   * List all available engines and their actions.
   * Useful for discovery and documentation.
   */
  static get catalog(): Record<string, string[]> {
    return {
      // META ($1,999)
      godmind: ['reason', 'analyze', 'plan', 'evaluate'],
      fortress: ['defend', 'audit', 'harden', 'assess'],
      singularity: ['predict', 'fuse', 'optimize', 'synthesize'],
      eternus: ['govern', 'audit', 'comply', 'automate'],
      // S-TIER / APEX ($599–$999)
      sentinel: ['scan', 'defend', 'monitor', 'respond'],
      phantom: ['heal', 'failover', 'monitor', 'recover'],
      nexus: ['route', 'optimize', 'balance', 'evaluate'],
      prism: ['search', 'extract', 'map', 'query'],
      genesis: ['triage', 'recover', 'analyze', 'prevent'],
      sovereign: ['govern', 'audit', 'comply', 'gate'],
      colossus: ['orchestrate', 'scale', 'optimize', 'command'],
      harbinger: ['predict', 'detect', 'contain', 'neutralize'],
      prometheus: ['evolve', 'mutate', 'validate', 'improve'],
      omniscient: ['predict', 'forecast', 'analyze', 'simulate'],
      leviathan: ['remember', 'recall', 'synchronize', 'predict'],
      chimera: ['adapt', 'personalize', 'detect', 'reshape'],
      titan: ['stabilize', 'consensus', 'optimize', 'regulate'],
      wraith: ['test', 'mutate', 'shadow', 'rollback'],
      'apex-one': ['decide', 'explain', 'forecast', 'optimize'],
      pandora: ['hypothesize', 'plan', 'explore', 'bootstrap'],
      hydra: ['heal', 'isolate', 'fallback', 'repair'],
      specter: ['stealth', 'trap', 'unmask', 'verify'],
      'atlas-engine': ['weave', 'search', 'compress', 'translate'],
      cerberus: ['guard', 'sanitize', 'validate', 'veto'],
      obelisk: ['audit', 'verify', 'attest', 'replay'],
      phoenix: ['triage', 'transplant', 'diagnose', 'predict'],
      'nexus-prime': ['consensus', 'route', 'optimize', 'prioritize'],
      chronos: ['reason', 'trace', 'simulate', 'precompute'],
      golem: ['compose', 'resolve', 'decompose', 'schedule'],
      axiom: ['prove', 'solve', 'deduce', 'infer'],
      dynamo: ['optimize', 'budget', 'arbitrage', 'detect'],
      warden: ['enforce', 'isolate', 'propagate', 'arbitrate'],
      synapse: ['relay', 'bridge', 'thread', 'route'],
      crucible: ['chaos', 'mutate', 'simulate', 'stress'],
      echo: ['track', 'learn', 'calibrate', 'correct'],
      vortex: ['fuse', 'correlate', 'synthesize', 'denoise'],
      monolith: ['checkpoint', 'migrate', 'synchronize', 'compact'],
      seraph: ['evaluate', 'detect', 'audit', 'align'],
      progenitor: ['genesis', 'evolve', 'harden', 'forge'],
      // ELITE ($399)
      cortex: ['orchestrate', 'delegate', 'coordinate', 'balance'],
      forge: ['generate', 'refactor', 'test', 'analyze'],
      oracle: ['predict', 'detect', 'process', 'forecast'],
      vanguard: ['distribute', 'cache', 'process', 'route'],
      conductor: ['pipeline', 'stream', 'track', 'evolve'],
      arbiter: ['route', 'limit', 'version', 'shape'],
      mirage: ['route', 'aggregate', 'match', 'scale'],
      // CORE ($199 / Free)
      automaton: ['automate', 'schedule', 'trigger', 'compose'],
      catalyst: ['publish', 'source', 'decouple', 'replay'],
      beacon: ['monitor', 'trace', 'log', 'alert'],
      bastion: ['balance', 'route', 'failover', 'scale'],
      cipher: ['cache', 'invalidate', 'tier', 'evict'],
      meridian: ['deliver', 'optimize', 'route', 'purge'],
      aegis: ['govern', 'authenticate', 'rotate', 'audit'],
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ERROR CLASS
// ═══════════════════════════════════════════════════════════════

export class EngineAPIError extends Error {
  constructor(message: string, public status: number) {
    super(`CMPSBL Engine: ${message}`);
    this.name = 'EngineAPIError';
  }
}
