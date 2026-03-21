/**
 * @cmpsbl/sdk — Engine SDK Client
 * Authenticated access to hosted CMPSBL® engines.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { EngineCallOptions, EngineResult, EngineStageResult } from '@cmpsbl/types';

export type { EngineCallOptions, EngineResult, EngineStageResult };

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
