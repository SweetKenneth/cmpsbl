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

export type SubstrateModule = 'brain' | 'decode' | 'defense' | 'nexus' | 'vision';

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

  // Brain Module — Memory, Learning, Reflection
  brain = {
    learn: (content: string, source?: string) =>
      this.invoke({ module: 'brain', action: 'learn', payload: { content, source } }),
    
    reflect: () =>
      this.invoke({ module: 'brain', action: 'reflect' }),
    
    recall: (query: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'recall', payload: { query, limit } }),
    
    synthesize: () =>
      this.invoke({ module: 'brain', action: 'synthesize' }),
    
    status: () =>
      this.invoke({ module: 'brain', action: 'status' }),
    
    // Extended Brain methods for Decode contract
    query: (query_text: string, limit?: number) =>
      this.invoke({ module: 'brain', action: 'query', payload: { query_text, limit } }),
    
    remember: (content: string, memory_type: string, confidence?: number, metadata?: Record<string, unknown>) =>
      this.invoke({ module: 'brain', action: 'remember', payload: { content, memory_type, confidence, metadata } }),
    
    reinforce: (memory_id: string, boost?: number) =>
      this.invoke({ module: 'brain', action: 'reinforce', payload: { memory_id, boost } }),
    
    dream: () =>
      this.invoke({ module: 'brain', action: 'dream' }),
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
    
    alert: (severity: string, message: string) =>
      this.invoke({ module: 'vision', action: 'alert', payload: { severity, message } }),
  };
}

export const substrate = SubstrateClient.getInstance();

// Quick access functions
export const brain = substrate.brain;
export const decode = substrate.decode;
export const defense = substrate.defense;
export const nexus = substrate.nexus;
export const vision = substrate.vision;
