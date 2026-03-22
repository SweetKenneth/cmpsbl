/**
 * @cmpsbl/sdk — Engine SDK Client
 * Authenticated access to hosted CMPSBL® engines.
 * Includes unified first-contact experience with live Memory Stream.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  EngineCallOptions, EngineResult, EngineStageResult,
  FirstContactConfig, DiscoveryInput, DiscoveryResult,
  CaptureResult, ApplyResult, ExportResult, MemoryChain,
  DOMAIN_PATTERNS,
} from '@cmpsbl/types';

export type { EngineCallOptions, EngineResult, EngineStageResult };
export type { FirstContactConfig, DiscoveryResult, CaptureResult, ApplyResult, ExportResult, MemoryChain };

// ═══════════════════════════════════════════════════════════════
// Engine API
// ═══════════════════════════════════════════════════════════════

export class EngineAPIError extends Error {
  constructor(message: string, public status: number) {
    super(`CMPSBL Engine: ${message}`);
    this.name = 'EngineAPIError';
  }
}

export class Engine {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.cmpsbl.com/v1/engine') {
    if (!apiKey) throw new Error('CMPSBL Engine SDK: API key is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

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
      body: JSON.stringify({ engine, action, input, context, options }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new EngineAPIError(err.error || `Request failed: ${res.status}`, res.status);
    }

    return res.json();
  }

  get(slug: string) {
    return {
      call: (action: string, input: string, context?: Record<string, unknown>, options?: EngineCallOptions) =>
        this.call(slug, action, input, context, options),
    };
  }

  // Typed engine accessors
  get godmind() { return this.typedProxy('godmind'); }
  get fortress() { return this.typedProxy('fortress'); }
  get singularity() { return this.typedProxy('singularity'); }
  get eternus() { return this.typedProxy('eternus'); }
  get cortex() { return this.typedProxy('cortex'); }
  get sentinel() { return this.typedProxy('sentinel'); }

  private typedProxy(slug: string) {
    const self = this;
    return new Proxy({} as Record<string, (input: string, context?: Record<string, unknown>, options?: EngineCallOptions) => Promise<EngineResult>>, {
      get(_, action: string) {
        return (input: string, context?: Record<string, unknown>, options?: EngineCallOptions) =>
          self.call(slug, action, input, context, options);
      },
    });
  }

  static get catalog(): Record<string, string[]> {
    return {
      godmind: ['reason', 'analyze', 'plan', 'evaluate'],
      fortress: ['defend', 'audit', 'harden', 'assess'],
      singularity: ['predict', 'fuse', 'optimize', 'synthesize'],
      eternus: ['govern', 'audit', 'comply', 'automate'],
      sentinel: ['scan', 'defend', 'monitor', 'respond'],
      cortex: ['orchestrate', 'delegate', 'coordinate', 'balance'],
      forge: ['generate', 'refactor', 'test', 'analyze'],
      oracle: ['predict', 'detect', 'process', 'forecast'],
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// CMPSBL — First Contact SDK Client
// ═══════════════════════════════════════════════════════════════

import {
  initFirstContact,
  discoverMemory,
  captureMemory,
  applyMemory,
  exportMemory,
  getMemoryStream,
  getFirstContactSession,
  endFirstContactSession,
} from '@cmpsbl/runtime';

const SDK_DOMAIN_PATTERNS: typeof DOMAIN_PATTERNS['sdk'] = {
  domain: 'sdk',
  patterns: ['API usage optimization', 'Engine coordination chain', 'Client integration pattern'],
  scopes: ['Cross-engine adoption', 'Multi-system integration', 'Developer workflow optimization'],
};

export class CMPSBL {
  private config: FirstContactConfig;
  private initialized = false;

  constructor(options: { apiKey?: string; endpoint?: string; onDiscovery?: (chain: MemoryChain) => void } = {}) {
    this.config = {
      package: '@cmpsbl/sdk',
      domain: 'sdk',
      apiKey: options.apiKey,
      endpoint: options.endpoint ?? 'https://api.cmpsbl.com/v1/substrate',
      autoDiscover: true,
      onDiscovery: options.onDiscovery,
    };
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await initFirstContact(this.config);
    this.initialized = true;
  }

  async discover(input: DiscoveryInput): Promise<DiscoveryResult> {
    if (!this.initialized) await this.init();
    return discoverMemory(input, this.config, SDK_DOMAIN_PATTERNS);
  }

  async capture(chainId: string): Promise<CaptureResult> {
    return captureMemory(chainId, this.config);
  }

  async apply(chainId: string): Promise<ApplyResult> {
    return applyMemory(chainId, this.config);
  }

  async export(chainId: string): Promise<ExportResult> {
    return exportMemory(chainId, this.config);
  }

  get stream(): MemoryChain[] {
    return getMemoryStream();
  }

  get session() {
    return getFirstContactSession();
  }

  disconnect(): void {
    endFirstContactSession();
    this.initialized = false;
  }
}
