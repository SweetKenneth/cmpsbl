/**
 * promptfluid® Substrate Client
 * v2026.01 — Cognitive Orchestration Substrate for AI Systems
 * 
 * Unified API for all substrate modules:
 * - Brain: Memory, learning, reflection
 * - Decode: Intent decoding, cognitive interface (Interpreter Primitive)
 * - Defense: Security, bot detection, threats
 * - Nexus: AI routing, multi-provider
 * - Vision: Observability, metrics, health
 * 
 * Decode is the substrate's interpreter primitive. It translates human
 * ambiguity into substrate-structured cognition without asserting facts,
 * agency, or execution authority.
 */

import { supabase } from '@/integrations/supabase/client';

export type SubstrateModule = 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system';

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

class SubstrateClient {
  private static instance: SubstrateClient;

  private constructor() {}

  static getInstance(): SubstrateClient {
    if (!SubstrateClient.instance) {
      SubstrateClient.instance = new SubstrateClient();
    }
    return SubstrateClient.instance;
  }

  async invoke<T = unknown>(request: SubstrateRequest): Promise<SubstrateResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: request,
      });

      if (error) {
        return {
          success: false,
          module: request.module,
          action: request.action,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }

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

  // Brain Module — Memory, Learning, Reflection, Intelligence
  brain = {
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'brain', action: 'learn', payload: { content, source } }),
    
    reflect: () =>
      this.invoke({ module: 'brain', action: 'reflect' }),
    
    recall: (query: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'recall', payload: { query, limit } }),
    
    /** Cross-domain cognitive synthesis - connects patterns across memory tiers */
    synthesize: () =>
      this.invoke({ module: 'brain', action: 'synthesize' }),
    
    /** Probabilistic forecasting engine */
    forecast: (metric?: string, window?: string) =>
      this.invoke({ module: 'brain', action: 'forecast', payload: { metric, window } }),
    
    status: () =>
      this.invoke({ module: 'brain', action: 'status' }),
    
    // Extended Brain methods
    query: (query_text: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'query', payload: { query_text, limit } }),
    
    remember: (content: string, memory_type: string, confidence?: number, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'brain', action: 'remember', payload: { content, memory_type, confidence, metadata } }),
    
    reinforce: (memory_id: string, boost?: number) =>
      this.invoke({ module: 'brain', action: 'reinforce', payload: { memory_id, boost } }),
    
    dream: () =>
      this.invoke({ module: 'brain', action: 'dream' }),
    
    // NEW: Advanced Intelligence Methods
    /** Memory optimization - compress old memories, clean duplicates */
    optimize: () =>
      this.invoke({ module: 'brain', action: 'optimize' }),
    
    /** Deep thinking mode - extended reasoning with chain of thought */
    deepThink: (query: string, depth?: number) =>
      this.invoke({ module: 'brain', action: 'deep_think', payload: { query, depth } }),
    
    /** Test a hypothesis against the knowledge graph */
    hypothesisTest: (hypothesis: string) =>
      this.invoke({ module: 'brain', action: 'hypothesis_test', payload: { hypothesis } }),
    
    /** Full cognitive cycle - learn, reflect, dream, synthesize */
    cognitiveCycle: () =>
      this.invoke({ module: 'brain', action: 'cognitive_cycle' }),
    
    /** Toggle continuous learning mode */
    continuousLearn: (enabled: boolean) =>
      this.invoke({ module: 'brain', action: 'continuous_learn', payload: { enabled } }),
    
    /** Build/update knowledge graph connections */
    graphBuild: () =>
      this.invoke({ module: 'brain', action: 'graph_build' }),
    
    /** Get curiosity log - exploration queries */
    curiosity: () =>
      this.invoke({ module: 'brain', action: 'curiosity' }),
    
    /** Trigger active research based on curiosity */
    explore: (query: string) =>
      this.invoke({ module: 'brain', action: 'explore', payload: { query } }),
    
    /** Get learning patterns and insights */
    patterns: () =>
      this.invoke({ module: 'brain', action: 'patterns' }),
  };

  // Decode Module — Interpreter Primitive (NOT a chatbot, persona, or agent)
  decode = {
    /** 
     * Primary chat interface for cognitive interpretation
     * NOTE: Decode is an interpreter, not an assistant
     */
    chat: (message: string, sessionId?: string) =>
      this.invoke({ module: 'decode', action: 'chat', payload: { message, sessionId } }),
    
    /** Initiate a dream cycle */
    dream: () =>
      this.invoke({ module: 'decode', action: 'dream' }),
    
    /** Submit a proposal for substrate consideration */
    propose: (idea: string) =>
      this.invoke({ module: 'decode', action: 'propose', payload: { idea } }),
    
    /** Learn from interaction */
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'decode', action: 'learn', payload: { content, source } }),
    
    /** Get Decode module status */
    status: () =>
      this.invoke({ module: 'decode', action: 'status' }),
    
    /** v3.2.0: Extract structured intent from a message */
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
    
    /** v3.1.0: Real anomaly detection with pattern analysis */
    anomaly: (timeWindow: '1h' | '6h' | '24h' = '1h') =>
      this.invoke({ module: 'defense', action: 'anomaly', payload: { timeWindow } }),
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
  };

  // Vision Module — Observability & Metrics
  vision = {
    metrics: () =>
      this.invoke({ module: 'vision', action: 'metrics' }),
    
    health: () =>
      this.invoke({ module: 'vision', action: 'health' }),
    
    logs: (module?: SubstrateModule, limit?: number) =>
      this.invoke({ module: 'vision', action: 'logs', payload: { module, limit } }),
    
    /** Create an alert with severity level */
    alert: (severity: 'info' | 'warn' | 'error' | 'critical', message: string, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'vision', action: 'alert', payload: { severity, message, metadata } }),
    
    /** Get audit log entries */
    audit: (entity?: string, action?: string) =>
      this.invoke({ module: 'vision', action: 'audit', payload: { entity, action } }),
    
    status: () =>
      this.invoke({ module: 'vision', action: 'status' }),
    
    /** v3.1.0: Real dashboard data with orchestrator, metrics, AI usage */
    dashboard: () =>
      this.invoke({ module: 'vision', action: 'dashboard' }),
    
    /** v3.2.0: Distributed tracing - create or query traces */
    trace: (traceId?: string, options?: { create?: boolean; module?: string; action?: string; duration_ms?: number }) =>
      this.invoke({ module: 'vision', action: 'trace', payload: { traceId, ...options } }),
    
    /** v3.3.0: Ecosystem health monitoring - comprehensive subsystem check */
    monitor: () =>
      this.invoke({ module: 'vision', action: 'monitor' }),
    
    /** v3.3.0: Resilience framework - error analysis with auto-fix proposals */
    resilience: () =>
      this.invoke({ module: 'vision', action: 'resilience' }),
    
    /** v3.3.0: Threat analytics - 24h defense event rollup */
    analytics: () =>
      this.invoke({ module: 'vision', action: 'analytics' }),
  };

  // System Module — Administration & Configuration
  system = {
    status: () =>
      this.invoke({ module: 'system', action: 'status' }),
    
    version: () =>
      this.invoke({ module: 'system', action: 'version' }),
    
    config: (key?: string) =>
      this.invoke({ module: 'system', action: 'config', payload: { key } }),
    
    audit: () =>
      this.invoke({ module: 'system', action: 'audit' }),
    
    /** v3.1.0: Full system heal - restores all modules to 100% health */
    heal: (target?: string, force?: boolean) =>
      this.invoke({ module: 'system', action: 'heal', payload: { target, force } }),
    
    /** v3.1.0: Comprehensive health diagnostics with circuit breaker status */
    health: () =>
      this.invoke({ module: 'system', action: 'health' }),
    
    /** v3.1.0: Full system diagnostics including orchestrator, providers, modules */
    diagnostics: () =>
      this.invoke({ module: 'system', action: 'diagnostics' }),
    
    /** Restart a specific service or all services */
    restart: (service?: string) =>
      this.invoke({ module: 'system', action: 'restart', payload: { service } }),
    
    /** v3.2.0: Create a validated backup snapshot with optional data export */
    backup: (options?: { include_data?: boolean; tables?: string[] }) =>
      this.invoke({ module: 'system', action: 'backup', payload: options }),
    
    /** v3.2.0: Restore from backup with validation */
    restore: (backup_id: string, validate_only?: boolean) =>
      this.invoke({ module: 'system', action: 'restore', payload: { backup_id, validate_only } }),
    
    /** List available backups */
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
    
    // NEW: Enhanced Dream Operations
    /** Consume and process a dream */
    consume: (dream_id: string) =>
      this.invoke({ module: 'dream', action: 'consume', payload: { dream_id } }),
    
    /** Interpret a dream text */
    interpret: (dream_text: string) =>
      this.invoke({ module: 'dream', action: 'interpret', payload: { dream_text } }),
    
    /** Trigger mutation/evolution */
    mutate: () =>
      this.invoke({ module: 'dream', action: 'mutation' }),
    
    /** Dream reflection */
    reflect: () =>
      this.invoke({ module: 'dream', action: 'reflect' }),
  };

}

export const substrate = SubstrateClient.getInstance();

// Quick access functions
export const brain = substrate.brain;
export const decode = substrate.decode;
export const defense = substrate.defense;
export const nexus = substrate.nexus;
export const vision = substrate.vision;
export const system = substrate.system;
export const dream = substrate.dream;
