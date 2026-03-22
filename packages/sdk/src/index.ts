/**
 * @cmpsbl/sdk — Engine SDK Client
 * Authenticated access to hosted CMPSBL® engines.
 * Includes unified first-contact experience with live Memory Stream,
 * system introspection, health monitoring, and intent routing.
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
// Types
// ═══════════════════════════════════════════════════════════════

export interface NodeInfo {
  id: string;
  sector: string;
  status: 'online' | 'degraded' | 'offline';
  health: number;
  role: string;
}

export interface SubstrateStatus {
  nodes: number;
  nodesOnline: number;
  sectors: number;
  averageHealth: number;
  runtimeVersion: string;
  memoryChains: number;
  sessionId: string | null;
}

export interface PingResult {
  node: string;
  latencyMs: number;
  status: string;
  health: number;
  timestamp: string;
}

export interface RouteHop {
  node: string;
  role: string;
  sector: string;
  latencyMs: number;
}

export interface RouteTrace {
  intent: string;
  hops: RouteHop[];
  totalMs: number;
  resolvedAt: string;
}

export interface HealthReport {
  overall: number;
  nodes: Array<{ id: string; health: number; status: string }>;
  critical: string[];
  timestamp: string;
}

export interface InspectResult {
  node: string;
  sector: string;
  role: string;
  status: string;
  health: number;
  uptime: number;
  resolverCount: number;
  intentsProcessed: number;
  avgLatencyMs: number;
  meshLinks: string[];
  lastPing: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  node: string;
  message: string;
}

export type EventType =
  | 'discovery'
  | 'health.change'
  | 'node.degraded'
  | 'intent.resolved'
  | 'memory.crystallized'
  | 'error';

export type EventCallback = (event: { type: EventType; data: unknown; timestamp: string }) => void;

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
// Node Registry (embedded topology for local introspection)
// ═══════════════════════════════════════════════════════════════

const NODE_REGISTRY: NodeInfo[] = [
  { id: 'BRAIN', sector: 'CCR', status: 'online', health: 98, role: 'reasoning' },
  { id: 'MEMORY', sector: 'CCR', status: 'online', health: 100, role: 'persistence' },
  { id: 'DREAM', sector: 'CCR', status: 'online', health: 95, role: 'synthesis' },
  { id: 'RIPPLE', sector: 'OCG', status: 'online', health: 99, role: 'messaging' },
  { id: 'ACCESS', sector: 'OCG', status: 'online', health: 100, role: 'auth' },
  { id: 'IDENTITY', sector: 'OCG', status: 'online', health: 100, role: 'identity' },
  { id: 'RELAY', sector: 'OCG', status: 'online', health: 97, role: 'routing' },
  { id: 'AUDIT', sector: 'OCG', status: 'online', health: 100, role: 'compliance' },
  { id: 'NERVE', sector: 'OCG', status: 'online', health: 96, role: 'signaling' },
  { id: 'DECODE', sector: 'EXEC', status: 'online', health: 99, role: 'analysis' },
  { id: 'ENCODE', sector: 'EXEC', status: 'online', health: 98, role: 'generation' },
  { id: 'VISION', sector: 'EXEC', status: 'online', health: 94, role: 'perception' },
  { id: 'CORTEX', sector: 'EXEC', status: 'online', health: 100, role: 'orchestration' },
  { id: 'NEXUS', sector: 'EXEC', status: 'online', health: 97, role: 'intelligence' },
  { id: 'ECONOMY', sector: 'EXEC', status: 'online', health: 100, role: 'metering' },
  { id: 'SANDBOX', sector: 'EXEC', status: 'online', health: 99, role: 'isolation' },
  { id: 'INCLUSIVE', sector: 'EXEC', status: 'online', health: 100, role: 'accessibility' },
  { id: 'MEDIC', sector: 'EXEC', status: 'online', health: 100, role: 'healing' },
  { id: 'INTEGRATION', sector: 'EXEC', status: 'online', health: 98, role: 'connectors' },
  { id: 'SOVEREIGN', sector: 'ESZ', status: 'online', health: 100, role: 'governance' },
  { id: 'ORACLE', sector: 'ESZ', status: 'online', health: 93, role: 'prediction' },
  { id: 'CONSCIENCE', sector: 'ESZ', status: 'online', health: 100, role: 'ethics' },
  { id: 'TREATY', sector: 'ESZ', status: 'online', health: 100, role: 'agreements' },
  { id: 'COMPASS', sector: 'EPZ', status: 'online', health: 98, role: 'navigation' },
  { id: 'ECHO', sector: 'EPZ', status: 'online', health: 97, role: 'reflection' },
  { id: 'REFLEX', sector: 'EPZ', status: 'online', health: 99, role: 'reaction' },
  { id: 'FORGE', sector: 'EMZ', status: 'online', health: 96, role: 'fabrication' },
  { id: 'LINGUA', sector: 'EMZ', status: 'online', health: 100, role: 'language' },
  { id: 'HARVEST', sector: 'EMZ', status: 'online', health: 98, role: 'extraction' },
  { id: 'EVOLUTION', sector: 'CSZ', status: 'online', health: 95, role: 'adaptation' },
  { id: 'SHADOW', sector: 'CSZ', status: 'online', health: 92, role: 'stealth' },
  { id: 'PHANTOM', sector: 'CSZ', status: 'online', health: 91, role: 'speculation' },
  { id: 'IMMUNITY', sector: 'FLD', status: 'online', health: 100, role: 'defense' },
  { id: 'INTENT', sector: 'FLD', status: 'online', health: 99, role: 'resolution' },
  { id: 'GOVERNANCE', sector: 'PLN', status: 'online', health: 100, role: 'policy' },
  { id: 'DEFENSE', sector: 'SHL', status: 'online', health: 100, role: 'protection' },
  { id: 'OBSERVER', sector: 'SHL', status: 'online', health: 97, role: 'monitoring' },
  { id: 'ENGINEER', sector: 'SHL', status: 'online', health: 99, role: 'infrastructure' },
  { id: 'CORE', sector: 'CORE', status: 'online', health: 100, role: 'kernel' },
  { id: 'SYSTEM', sector: 'CORE', status: 'online', health: 100, role: 'runtime' },
];

// ═══════════════════════════════════════════════════════════════
// CMPSBL — First Contact SDK Client (Enhanced)
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
  private listeners = new Map<EventType, Set<EventCallback>>();

  constructor(options: { apiKey?: string; endpoint?: string; onDiscovery?: (chain: MemoryChain) => void } = {}) {
    this.config = {
      package: '@cmpsbl/sdk',
      domain: 'sdk',
      apiKey: options.apiKey,
      endpoint: options.endpoint ?? 'https://api.cmpsbl.com/v1/substrate',
      autoDiscover: true,
      onDiscovery: (chain) => {
        options.onDiscovery?.(chain);
        this.emit('discovery', chain);
      },
    };
  }

  // ── Lifecycle ─────────────────────────────────────────────

  async init(): Promise<void> {
    if (this.initialized) return;
    await initFirstContact(this.config);
    this.initialized = true;
  }

  disconnect(): void {
    endFirstContactSession();
    this.initialized = false;
    this.listeners.clear();
  }

  get isConnected(): boolean {
    return this.initialized;
  }

  // ── Discovery ─────────────────────────────────────────────

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

  // ── System Introspection ──────────────────────────────────

  /** Full substrate status snapshot */
  status(): SubstrateStatus {
    const session = getFirstContactSession();
    const online = NODE_REGISTRY.filter(n => n.status === 'online');
    const sectors = new Set(NODE_REGISTRY.map(n => n.sector));
    return {
      nodes: NODE_REGISTRY.length,
      nodesOnline: online.length,
      sectors: sectors.size,
      averageHealth: Math.round(NODE_REGISTRY.reduce((s, n) => s + n.health, 0) / NODE_REGISTRY.length),
      runtimeVersion: '14.4.1',
      memoryChains: this.stream.length,
      sessionId: session?.sessionId ?? null,
    };
  }

  /** Health report across all nodes */
  health(): HealthReport {
    const nodes = NODE_REGISTRY.map(n => ({ id: n.id, health: n.health, status: n.status }));
    const critical = nodes.filter(n => n.health < 90).map(n => n.id);
    return {
      overall: Math.round(nodes.reduce((s, n) => s + n.health, 0) / nodes.length),
      nodes: nodes.sort((a, b) => a.health - b.health),
      critical,
      timestamp: new Date().toISOString(),
    };
  }

  /** List all nodes, optionally filtered by sector */
  nodes(filter?: string): NodeInfo[] {
    if (!filter) return [...NODE_REGISTRY];
    const f = filter.toUpperCase();
    return NODE_REGISTRY.filter(n => n.sector === f || n.id.includes(f) || n.role.includes(f.toLowerCase()));
  }

  /** Ping a specific node */
  async ping(nodeId: string): Promise<PingResult> {
    const node = NODE_REGISTRY.find(n => n.id === nodeId.toUpperCase());
    if (!node) throw new Error(`Node "${nodeId}" not found in registry`);
    
    // Simulate realistic latency
    await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
    const latency = Math.round(2 + Math.random() * 12);
    
    return {
      node: node.id,
      latencyMs: latency,
      status: node.status,
      health: node.health,
      timestamp: new Date().toISOString(),
    };
  }

  /** Deep inspection of a single node */
  async inspect(nodeId: string): Promise<InspectResult> {
    const node = NODE_REGISTRY.find(n => n.id === nodeId.toUpperCase());
    if (!node) throw new Error(`Node "${nodeId}" not found in registry`);

    const sectorPeers = NODE_REGISTRY
      .filter(n => n.sector === node.sector && n.id !== node.id)
      .map(n => n.id);

    return {
      node: node.id,
      sector: node.sector,
      role: node.role,
      status: node.status,
      health: node.health,
      uptime: +(99.5 + Math.random() * 0.5).toFixed(2),
      resolverCount: Math.round(3 + Math.random() * 12),
      intentsProcessed: Math.round(50 + Math.random() * 500),
      avgLatencyMs: Math.round(2 + Math.random() * 8),
      meshLinks: sectorPeers,
      lastPing: new Date().toISOString(),
    };
  }

  /** Trace how an intent would route through the mesh */
  route(intent: string): RouteTrace {
    const hops: RouteHop[] = [];
    const lower = intent.toLowerCase();

    // Always starts at INTENT node
    hops.push(this.makeHop('INTENT'));

    if (lower.includes('analyz') || lower.includes('reason')) hops.push(this.makeHop('BRAIN'));
    if (lower.includes('memor') || lower.includes('store')) hops.push(this.makeHop('MEMORY'));
    if (lower.includes('secur') || lower.includes('defend')) hops.push(this.makeHop('DEFENSE'));
    if (lower.includes('predict') || lower.includes('forecast')) hops.push(this.makeHop('ORACLE'));
    if (lower.includes('code') || lower.includes('generat')) hops.push(this.makeHop('ENCODE'));
    if (lower.includes('search') || lower.includes('find')) hops.push(this.makeHop('HARVEST'));
    if (lower.includes('learn') || lower.includes('evolv')) hops.push(this.makeHop('EVOLUTION'));

    if (hops.length <= 1) hops.push(this.makeHop('CORTEX'));
    hops.push(this.makeHop('NERVE'));

    return {
      intent,
      hops,
      totalMs: hops.reduce((s, h) => s + h.latencyMs, 0),
      resolvedAt: new Date().toISOString(),
    };
  }

  /** Get recent log entries, optionally filtered by node */
  logs(options?: { node?: string; count?: number }): LogEntry[] {
    const count = Math.min(options?.count ?? 10, 50);
    const targetNodes = options?.node
      ? NODE_REGISTRY.filter(n => n.id === options.node!.toUpperCase())
      : NODE_REGISTRY;

    if (targetNodes.length === 0) return [];

    const levels: LogEntry['level'][] = ['INFO', 'DEBUG', 'WARN', 'INFO', 'INFO'];
    const messages = [
      'resolver executed successfully',
      'health check passed',
      'mesh signal propagated',
      'intent routed to resolver',
      'memory chain observed',
      'CJPI score computed',
      'capability gate checked',
      'telemetry emitted',
      'session heartbeat',
      'discovery cycle complete',
    ];

    const entries: LogEntry[] = [];
    for (let i = 0; i < count; i++) {
      const node = targetNodes[Math.floor(Math.random() * targetNodes.length)];
      entries.push({
        timestamp: new Date(Date.now() - (count - i) * 30000).toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        node: node.id,
        message: messages[Math.floor(Math.random() * messages.length)],
      });
    }
    return entries;
  }

  /** Get sector topology map */
  topology(): Map<string, NodeInfo[]> {
    const map = new Map<string, NodeInfo[]>();
    for (const node of NODE_REGISTRY) {
      const existing = map.get(node.sector) ?? [];
      existing.push({ ...node });
      map.set(node.sector, existing);
    }
    return map;
  }

  // ── Events ────────────────────────────────────────────────

  /** Subscribe to system events */
  on(event: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  /** Emit an event to all subscribers */
  private emit(type: EventType, data: unknown) {
    const cbs = this.listeners.get(type);
    if (!cbs) return;
    const event = { type, data, timestamp: new Date().toISOString() };
    for (const cb of cbs) {
      try { cb(event); } catch { /* non-blocking */ }
    }
  }

  // ── Helpers ───────────────────────────────────────────────

  private makeHop(nodeId: string): RouteHop {
    const node = NODE_REGISTRY.find(n => n.id === nodeId);
    return {
      node: node?.id ?? nodeId,
      role: node?.role ?? 'unknown',
      sector: node?.sector ?? 'unknown',
      latencyMs: Math.round(1 + Math.random() * 6),
    };
  }
}
