/**
 * SubstrateClient — Unified bridge to the pf-substrate edge function
 * 
 * Every surface (Web, CLI, API, SDK) uses the same endpoint, the same
 * database, the same truth. This client is the programmatic gateway.
 * 
 * © CMPSBL® · PromptFluid™
 */

// ═══════════════════════════════════════════════════════════════
// Inlined Types (self-contained — mirrors @cmpsbl/types/topology)
// ═══════════════════════════════════════════════════════════════

export type CognitiveAction =
  | 'memory.store' | 'memory.recall' | 'memory.stream' | 'memory.prune'
  | 'dream.digest' | 'dream.synthesize'
  | 'discover.scan' | 'discover.crystallize'
  | 'brain.remember' | 'brain.think';

export type AccessTier = 'builder' | 'studio' | 'creator' | 'architect' | 'enterprise' | 'governor';

export interface SubstrateResponse<T = unknown> {
  success: boolean;
  module: string;
  action: string;
  data: T;
  latencyMs: number;
  timestamp: string;
}

export interface MemoryStoreInput {
  content: string;
  category?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MemoryRecallInput {
  query: string;
  limit?: number;
  category?: string;
  [key: string]: unknown;
}

export interface DreamDigestInput {
  depth?: 'shallow' | 'standard' | 'deep';
  limit?: number;
  [key: string]: unknown;
}

export interface SubstrateClientConfig {
  /** API key for authenticated access */
  apiKey?: string;
  /** Override the default substrate endpoint */
  endpoint?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Retry configuration */
  retries?: number;
}

// ═══════════════════════════════════════════════════════════════
// Substrate Client
// ═══════════════════════════════════════════════════════════════

const DEFAULT_ENDPOINT = 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTA2MTMsImV4cCI6MjA4MDM2NjYxM30.-YWlnszid8aODq2Zv2EvxWcY2sTsRikPcNsMWpZ7lHc';

export class SubstrateClient {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config?: SubstrateClientConfig) {
    this.endpoint = config?.endpoint ?? DEFAULT_ENDPOINT;
    this.apiKey = config?.apiKey ?? DEFAULT_ANON_KEY;
    this.timeoutMs = config?.timeoutMs ?? 30_000;
    this.maxRetries = config?.retries ?? 2;
  }

  // ── Core Bridge ────────────────────────────────────────────

  /**
   * Send any command to the substrate bridge.
   * This is the same call that the Web Terminal, CLI, and API all use.
   */
  async call<T = unknown>(module: string, action: string, input?: Record<string, unknown>): Promise<SubstrateResponse<T>> {
    const start = Date.now();
    const body = { module, action, ...input };

    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'apikey': this.apiKey,
            'X-SDK-Version': '3.0.0',
            'X-Request-Id': typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.status === 429 || res.status >= 500) {
          if (attempt < this.maxRetries) {
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
            continue;
          }
        }

        const data = await res.json();
        return {
          success: res.ok,
          module,
          action,
          data: data as T,
          latencyMs: Date.now() - start,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
        }
      }
    }

    return {
      success: false,
      module,
      action,
      data: { error: lastError?.message ?? 'Unknown error' } as T,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Memory (Cognitive Loop) ────────────────────────────────

  /** Store a memory in the persistent brain_memories table */
  async remember(input: MemoryStoreInput): Promise<SubstrateResponse> {
    return this.call('memory', 'store', input);
  }

  /** Recall memories matching a query */
  async recall(input: MemoryRecallInput): Promise<SubstrateResponse> {
    return this.call('memory', 'recall', input);
  }

  /** Stream the most recent cognitive chain */
  async stream(limit = 20): Promise<SubstrateResponse> {
    return this.call('memory', 'stream', { limit });
  }

  /** Prune low-confidence or stale memories */
  async prune(options?: { olderThanDays?: number; belowConfidence?: number }): Promise<SubstrateResponse> {
    return this.call('memory', 'prune', options);
  }

  // ── Dream ──────────────────────────────────────────────────

  /** Retrieve the most recent dream synthesis */
  async dreamDigest(input?: DreamDigestInput): Promise<SubstrateResponse> {
    return this.call('dream', 'digest', input);
  }

  /** Trigger dream synthesis from recent memories */
  async dreamSynthesize(): Promise<SubstrateResponse> {
    return this.call('dream', 'synthesize');
  }

  // ── Discovery ──────────────────────────────────────────────

  /** Run a discovery scan over the primitive matrix */
  async discover(input?: { depth?: number; category?: string }): Promise<SubstrateResponse> {
    return this.call('discover', 'scan', input);
  }

  /** Crystallize a discovery candidate into an artifact */
  async crystallize(candidateId: string): Promise<SubstrateResponse> {
    return this.call('discover', 'crystallize', { candidateId });
  }

  // ── Health / Doctor ────────────────────────────────────────

  /** Full 40-Primitive health check */
  async doctor(): Promise<SubstrateResponse> {
    return this.call('system', 'doctor');
  }

  /** Quick health check — Organs only */
  async doctorQuick(): Promise<SubstrateResponse> {
    return this.call('system', 'doctor', { scope: 'organs' });
  }

  /** Engine + Agent health check */
  async doctorEngines(): Promise<SubstrateResponse> {
    return this.call('system', 'doctor', { scope: 'engines' });
  }

  // ── Identity ───────────────────────────────────────────────

  /** Get authenticated user identity and tier */
  async whoami(): Promise<SubstrateResponse> {
    return this.call('identity', 'whoami');
  }

  // ── Arbitrary Dotted Commands ──────────────────────────────

  /**
   * Execute any dotted command (e.g., 'brain.think', 'defense.status').
   * Mirrors the auto-bridge fallback in the Web Terminal.
   */
  async exec(command: string, args?: Record<string, unknown>): Promise<SubstrateResponse> {
    const [module, ...rest] = command.split('.');
    const action = rest.join('.') || 'status';
    return this.call(module, action, args);
  }
}

/**
 * Create a SubstrateClient with the given config.
 * This is the recommended entry point for all SDK consumers.
 * 
 * @example
 * ```ts
 * import { createSubstrateClient } from '@cmpsbl/sdk';
 * const substrate = createSubstrateClient({ apiKey: 'your-key' });
 * await substrate.remember({ content: 'This is important' });
 * const stream = await substrate.stream();
 * const health = await substrate.doctor();
 * ```
 */
export function createSubstrateClient(config?: SubstrateClientConfig): SubstrateClient {
  return new SubstrateClient(config);
}
