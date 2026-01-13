/**
 * promptfluid® Substrate Client
 * v2026.01 — Cognitive Orchestration Substrate for AI Systems
 * 
 * Unified API for all substrate modules:
 * - Brain: Memory, learning, reflection
 * - Cascade: User interaction, chat, dreams
 * - Defense: Security, bot detection, threats
 * - Nexus: AI routing, multi-provider
 * - Vision: Observability, metrics, health
 */

import { supabase } from '@/integrations/supabase/client';

export type SubstrateModule = 'brain' | 'cascade' | 'defense' | 'nexus' | 'vision';

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

  // Brain Module
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
  };

  // Cascade Module
  cascade = {
    chat: (message: string, sessionId?: string) =>
      this.invoke({ module: 'cascade', action: 'chat', payload: { message, sessionId } }),
    
    dream: () =>
      this.invoke({ module: 'cascade', action: 'dream' }),
    
    propose: (idea: string) =>
      this.invoke({ module: 'cascade', action: 'propose', payload: { idea } }),
    
    status: () =>
      this.invoke({ module: 'cascade', action: 'status' }),
  };

  // Defense Module
  defense = {
    analyze: (fingerprint: Record<string, unknown>, ip?: string) =>
      this.invoke({ module: 'defense', action: 'analyze', payload: { fingerprint, ip } }),
    
    report: (threatId: string) =>
      this.invoke({ module: 'defense', action: 'report', payload: { threatId } }),
    
    rules: () =>
      this.invoke({ module: 'defense', action: 'rules' }),
    
    status: () =>
      this.invoke({ module: 'defense', action: 'status' }),
  };

  // Nexus Module
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

  // Vision Module
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
export const cascade = substrate.cascade;
export const defense = substrate.defense;
export const nexus = substrate.nexus;
export const vision = substrate.vision;
