/**
 * promptfluid® Substrate Client SDK
 * v2026.01 — Cognitive Orchestration Substrate
 * 
 * Standalone TypeScript SDK for integrating with the promptfluid substrate.
 * 
 * IMPORTANT: You must provide your own Supabase project and API keys.
 * This SDK does not include compute resources.
 * 
 * Installation:
 * 1. Copy this file to your project
 * 2. Install @supabase/supabase-js
 * 3. Configure your endpoint and keys
 * 
 * Usage:
 * const substrate = new SubstrateClient({
 *   url: 'https://YOUR_PROJECT.supabase.co',
 *   anonKey: 'YOUR_ANON_KEY'
 * });
 * 
 * await substrate.brain.query('search term', 10);
 * await substrate.decode.chat('Hello!', 'session_123');
 * await substrate.nexus.route('Generate text');
 */

export type SubstrateModule = 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system';

export interface SubstrateConfig {
  url: string;
  anonKey: string;
  authToken?: string;
}

export interface SubstrateRequest {
  module: SubstrateModule;
  action: string;
  payload?: Record<string, unknown>;
}

export interface SubstrateResponse<T = unknown> {
  success: boolean;
  module: SubstrateModule;
  action: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export class SubstrateClient {
  private config: SubstrateConfig;

  constructor(config: SubstrateConfig) {
    this.config = config;
  }

  private async invoke<T = unknown>(request: SubstrateRequest): Promise<SubstrateResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': this.config.anonKey,
      };

      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }

      const response = await fetch(`${this.config.url}/functions/v1/pf-substrate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        module: request.module,
        action: request.action,
        data: data as T,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        module: request.module,
        action: request.action,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string) {
    this.config.authToken = token;
  }

  // Brain Module — Memory, Learning, Reflection
  brain = {
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'brain', action: 'learn', payload: { content, source } }),
    
    reflect: () =>
      this.invoke({ module: 'brain', action: 'reflect' }),
    
    recall: (query: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'recall', payload: { query, limit } }),
    
    query: (query_text: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'query', payload: { query_text, limit } }),
    
    remember: (content: string, memory_type: string, confidence?: number, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'brain', action: 'remember', payload: { content, memory_type, confidence, metadata } }),
    
    reinforce: (memory_id: string, boost?: number) =>
      this.invoke({ module: 'brain', action: 'reinforce', payload: { memory_id, boost } }),
    
    dream: () =>
      this.invoke({ module: 'brain', action: 'dream' }),
    
    synthesize: () =>
      this.invoke({ module: 'brain', action: 'synthesize' }),
    
    forecast: (metric?: string, window?: string) =>
      this.invoke({ module: 'brain', action: 'forecast', payload: { metric, window } }),
    
    status: () =>
      this.invoke({ module: 'brain', action: 'status' }),
    
    graphSummary: () =>
      this.invoke({ module: 'brain', action: 'graph_summary' }),
    
    sessionReflection: (hours?: number) =>
      this.invoke({ module: 'brain', action: 'session_reflection', payload: { hours } }),
    
    patterns: () =>
      this.invoke({ module: 'brain', action: 'patterns' }),
    
    curiosity: () =>
      this.invoke({ module: 'brain', action: 'curiosity' }),
    
    explore: (query: string) =>
      this.invoke({ module: 'brain', action: 'explore', payload: { query } }),
  };

  // Decode Module — Intent Decoding, Chat
  decode = {
    chat: (message: string, sessionId?: string) =>
      this.invoke({ module: 'decode', action: 'chat', payload: { message, sessionId } }),
    
    dream: () =>
      this.invoke({ module: 'decode', action: 'dream' }),
    
    propose: (idea: string) =>
      this.invoke({ module: 'decode', action: 'propose', payload: { idea } }),
    
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'decode', action: 'learn', payload: { content, source } }),
    
    status: () =>
      this.invoke({ module: 'decode', action: 'status' }),
    
    intent: (message: string) =>
      this.invoke({ module: 'decode', action: 'intent', payload: { message } }),
  };

  // Defense Module — Security & Threat Analysis
  defense = {
    analyze: (fingerprint: Record<string, unknown>, ip?: string) =>
      this.invoke({ module: 'defense', action: 'analyze', payload: { fingerprint, ip } }),
    
    report: (threatId: string) =>
      this.invoke({ module: 'defense', action: 'report', payload: { threatId } }),
    
    rules: () =>
      this.invoke({ module: 'defense', action: 'rules' }),
    
    reputation: (ip_address: string) =>
      this.invoke({ module: 'defense', action: 'reputation', payload: { ip_address } }),
    
    status: () =>
      this.invoke({ module: 'defense', action: 'status' }),
    
    anomaly: (timeWindow: '1h' | '6h' | '24h' = '1h') =>
      this.invoke({ module: 'defense', action: 'anomaly', payload: { timeWindow } }),
    
    anomalyProbe: (lookbackHours?: number) =>
      this.invoke({ module: 'defense', action: 'anomaly_probe', payload: { lookbackHours } }),
    
    limits: () =>
      this.invoke({ module: 'defense', action: 'limits' }),
    
    posture: () =>
      this.invoke({ module: 'defense', action: 'posture' }),
  };

  // Nexus Module — Multi-Provider AI Routing
  nexus = {
    text: (prompt: string, model?: string) =>
      this.invoke({ module: 'nexus', action: 'text', payload: { prompt, model } }),
    
    image: (prompt: string, model?: string) =>
      this.invoke({ module: 'nexus', action: 'image', payload: { prompt, model } }),
    
    route: (task: string) =>
      this.invoke({ module: 'nexus', action: 'route', payload: { task } }),
    
    status: () =>
      this.invoke({ module: 'nexus', action: 'status' }),
    
    providers: () =>
      this.invoke({ module: 'nexus', action: 'providers' }),
    
    routeStats: () =>
      this.invoke({ module: 'nexus', action: 'route_stats' }),
  };

  // Vision Module — Observability & Metrics
  vision = {
    metrics: () =>
      this.invoke({ module: 'vision', action: 'metrics' }),
    
    health: () =>
      this.invoke({ module: 'vision', action: 'health' }),
    
    logs: (module?: SubstrateModule, limit?: number) =>
      this.invoke({ module: 'vision', action: 'logs', payload: { module, limit } }),
    
    alert: (severity: 'info' | 'warn' | 'error' | 'critical', message: string, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'vision', action: 'alert', payload: { severity, message, metadata } }),
    
    audit: (entity?: string, action?: string) =>
      this.invoke({ module: 'vision', action: 'audit', payload: { entity, action } }),
    
    status: () =>
      this.invoke({ module: 'vision', action: 'status' }),
    
    dashboard: () =>
      this.invoke({ module: 'vision', action: 'dashboard' }),
    
    trace: (traceId?: string, options?: { create?: boolean; module?: string; action?: string; duration_ms?: number }) =>
      this.invoke({ module: 'vision', action: 'trace', payload: { traceId, ...options } }),
    
    monitor: () =>
      this.invoke({ module: 'vision', action: 'monitor' }),
    
    resilience: () =>
      this.invoke({ module: 'vision', action: 'resilience' }),
    
    analytics: () =>
      this.invoke({ module: 'vision', action: 'analytics' }),
    
    healthSnapshot: () =>
      this.invoke({ module: 'vision', action: 'health_snapshot' }),
    
    introspection: () =>
      this.invoke({ module: 'vision', action: 'introspection' }),
    
    pulse: () =>
      this.invoke({ module: 'vision', action: 'pulse' }),
    
    quota: () =>
      this.invoke({ module: 'vision', action: 'quota' }),
  };

  // System Module — Administration
  system = {
    status: () =>
      this.invoke({ module: 'system', action: 'status' }),
    
    version: () =>
      this.invoke({ module: 'system', action: 'version' }),
    
    config: (key?: string) =>
      this.invoke({ module: 'system', action: 'config', payload: { key } }),
    
    audit: () =>
      this.invoke({ module: 'system', action: 'audit' }),
    
    heal: (target?: string, force?: boolean) =>
      this.invoke({ module: 'system', action: 'heal', payload: { target, force } }),
    
    health: () =>
      this.invoke({ module: 'system', action: 'health' }),
    
    diagnostics: () =>
      this.invoke({ module: 'system', action: 'diagnostics' }),
    
    restart: (service?: string) =>
      this.invoke({ module: 'system', action: 'restart', payload: { service } }),
    
    backup: (options?: { include_data?: boolean; tables?: string[] }) =>
      this.invoke({ module: 'system', action: 'backup', payload: options }),
    
    restore: (backup_id: string, validate_only?: boolean) =>
      this.invoke({ module: 'system', action: 'restore', payload: { backup_id, validate_only } }),
    
    listBackups: () =>
      this.invoke({ module: 'system', action: 'list_backups' }),
  };

  // Dream Module — Dream-Eater Operations
  dream = {
    status: () =>
      this.invoke({ module: 'dream', action: 'status' }),
    
    mood: (mood?: string) =>
      this.invoke({ module: 'dream', action: 'mood', payload: { mood } }),
    
    cycle: () =>
      this.invoke({ module: 'dream', action: 'cycle' }),
    
    consume: (dream_id: string) =>
      this.invoke({ module: 'dream', action: 'consume', payload: { dream_id } }),
    
    interpret: (dream_text: string) =>
      this.invoke({ module: 'dream', action: 'interpret', payload: { dream_text } }),
    
    mutate: () =>
      this.invoke({ module: 'dream', action: 'mutation' }),
    
    reflect: () =>
      this.invoke({ module: 'dream', action: 'reflect' }),
    
    feed: (dream_content: string, dream_type?: string) =>
      this.invoke({ module: 'dream', action: 'feed', payload: { dream_content, dream_type } }),
  };
}

// Export for module usage
export default SubstrateClient;
