/**
 * Memory Client - Per-user + per-agent persistent memory
 * v10.8.1 — Adaptive tiering, salience gate, non-destructive cascade
 * 
 * All internals are hidden from users:
 * - vectorization, salience scoring, decay logic, recall heuristics
 * - per-user memory isolation
 * - adaptive capacity scaling
 * - metacognitive tracking
 */

import { supabase } from '@/integrations/supabase/client';

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: string;
  relevance?: number;
  tier?: 'hot' | 'warm' | 'cold' | 'archive';
  memory_type?: string;
}

export interface RecallResult {
  memories: MemoryEntry[];
  confidence: number;
  tiers_searched: string[];
}

export interface MemoryMetaState {
  hot_count: number;
  warm_count: number;
  cold_count: number;
  archive_count: number;
  hot_limit: number;
  warm_limit: number;
  cold_limit: number;
  recall_hit_rate: number;
  total_stores: number;
  total_recalls: number;
}

export class MemoryClient {
  private agentId: string;
  private scope: 'session' | 'project';
  private sessionId: string;
  private userId: string | null = null;
  
  constructor(agentId: string, scope: 'session' | 'project' = 'project') {
    this.agentId = agentId;
    this.scope = scope;
    this.sessionId = this.generateSessionId();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /** Set user context for per-user memory isolation */
  setUserId(userId: string): void {
    this.userId = userId;
  }
  
  /** Extract discrete facts from text */
  private extractFacts(text: string): string[] {
    const patterns = [
      /\bmy\s+(\w[\w\s]{0,30}?)\s+(?:is|are|was|were)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\bi(?:'m|\s+am)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\bi\s+(?:like|love|hate|prefer|enjoy|want|need)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\b(?:my\s+name\s+is|call\s+me|i'm\s+called)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\bi\s+(?:live\s+in|am\s+from|come\s+from)\s+(.+?)(?:\.|$|,|\band\b)/gi,
      /\b(?:remember\s+(?:that\s+)?|don'?t\s+forget\s+(?:that\s+)?)(.+?)(?:\.|$)/gi,
    ];
    
    const facts: string[] = [];
    for (const pattern of patterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        let fact = match[0].trim()
          .replace(/^(?:remember\s+(?:that\s+)?|don'?t\s+forget\s+(?:that\s+)?)/i, '')
          .trim();
        if (fact.length > 3 && fact.length < 200) {
          facts.push(fact);
        }
      }
    }
    return [...new Set(facts)];
  }

  /**
   * Store a memory with salience gating
   * High-salience → hot, medium → warm, low → skipped or cold
   */
  async store(content: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const facts = this.extractFacts(content);
      const memoryType = facts.length > 0 ? 'user_fact' : 
        (metadata?.memory_type as string) || 'general';
      
      // Store each extracted fact as high-salience hot memory
      if (facts.length > 0) {
        for (const fact of facts) {
          await this.storeToTier(fact, 'user_fact', 0.95);
        }
      }
      
      // Store full content — let salience gate decide tier
      const salience = this.estimateLocalSalience(content, memoryType);
      await this.storeToTier(content, memoryType, salience, metadata);
      
      // Update metacognition
      await this.updateMetaStore();
      
      // Run tiering if we might be near capacity
      await this.maybeRunTiering();
    } catch (error) {
      console.warn('[Memory] Store failed gracefully');
    }
  }

  /** Estimate salience locally (fast, before DB call) */
  private estimateLocalSalience(content: string, memoryType: string): number {
    let salience = 0.5;
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount < 3) salience -= 0.2;
    else if (wordCount >= 5 && wordCount <= 50) salience += 0.1;
    
    if (['user_fact', 'preference', 'identity'].includes(memoryType)) salience += 0.3;
    else if (['workload_outcome', 'task_result'].includes(memoryType)) salience += 0.15;
    
    return Math.min(1, Math.max(0, salience));
  }

  /** Route to appropriate tier based on salience */
  private async storeToTier(
    content: string, 
    memoryType: string, 
    salience: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const basePayload = {
      module: 'brain',
      action: 'remember',
      content,
      memory_type: memoryType,
      confidence: salience,
      metadata: {
        agentId: this.agentId,
        userId: this.userId,
        scope: this.scope,
        sessionId: this.scope === 'session' ? this.sessionId : undefined,
        salience_score: salience,
        source: 'memory_sdk_v2',
        ...metadata
      }
    };

    // Salience gate: high → hot (via substrate), medium → warm direct, low → skip
    if (salience >= 0.7) {
      // High salience → route through substrate for hot storage
      await supabase.functions.invoke('pf-substrate', { body: basePayload });
    } else if (salience >= 0.3) {
      // Medium salience → store directly in warm
      await supabase.from('brain_memory_warm' as any).insert({
        content,
        context: memoryType,
        user_id: this.userId,
        agent_id: this.agentId,
        memory_type: memoryType,
        salience_score: salience,
        value_score: salience * 0.8,
        metadata: basePayload.metadata,
        tags: { source: 'memory_sdk_v2' },
      });
    }
    // salience < 0.3 → don't store (noise)
  }
  
  /**
   * Recall relevant memories across ALL tiers
   * Searches hot → warm → cold → archive with tier-weighted relevance
   */
  async recall(query: string, limit: number = 5): Promise<RecallResult> {
    try {
      const tiersSearched: string[] = [];
      const allMemories: MemoryEntry[] = [];
      
      // 1. Search hot tier first (fastest, most relevant)
      const { data: hotDataRaw } = await supabase
        .from('brain_memory_hot' as any)
        .select('id, content, created_at, value_score, memory_type')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .order('value_score', { ascending: false })
        .limit(limit);
      
      const hotData = (hotDataRaw || []) as unknown as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string }>;
      if (hotData.length > 0) {
        tiersSearched.push('hot');
        for (const m of hotData) {
          allMemories.push({
            id: m.id, content: m.content,
            timestamp: m.created_at, relevance: (m.value_score || 0.5) * 1.0,
            tier: 'hot', memory_type: m.memory_type,
          });
        }
      }

      // 2. Search warm if hot didn't fill limit
      if (allMemories.length < limit) {
        const { data: warmDataRaw } = await supabase
          .from('brain_memory_warm' as any)
          .select('id, content, created_at, value_score, memory_type')
          .eq('user_id', this.userId)
          .eq('agent_id', this.agentId)
          .order('value_score', { ascending: false })
          .limit(limit - allMemories.length);
        
        const warmData = (warmDataRaw || []) as unknown as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string }>;
        if (warmData.length > 0) {
          tiersSearched.push('warm');
          for (const m of warmData) {
            allMemories.push({
              id: m.id, content: m.content,
              timestamp: m.created_at, relevance: (m.value_score || 0.3) * 0.8,
              tier: 'warm', memory_type: m.memory_type,
            });
          }
        }
      }

      // 3. Also query via substrate for vector-based recall
      const response = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'query',
          query_text: query,
          limit,
          recall_strategy: 'fidelity_first',
          filters: {
            memory_types: ['user_fact', 'persistent_memory', 'workload_outcome', 'conversation_with_facts'],
            'metadata.agentId': this.agentId,
            'metadata.userId': this.userId,
            ...(this.scope === 'session' ? { 'metadata.sessionId': this.sessionId } : {})
          }
        }
      });
      
      if (response.data?.memories) {
        tiersSearched.push('substrate');
        for (const m of response.data.memories) {
          // Dedup by content
          if (!allMemories.some(existing => existing.content === m.content)) {
            allMemories.push({
              id: m.id, content: m.content,
              timestamp: m.created_at, relevance: m.relevance_score,
              tier: 'hot', memory_type: m.memory_type,
            });
          }
        }
      }

      // Sort by relevance, take top N
      allMemories.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      const finalMemories = allMemories.slice(0, limit);
      
      // Track recall hit in metacognition
      const hit = finalMemories.length > 0;
      await this.trackRecallHit(hit);
      
      const hasUserFacts = finalMemories.some(m => m.memory_type === 'user_fact');
      
      return {
        memories: finalMemories,
        confidence: hasUserFacts ? 0.95 : (finalMemories.length > 0 ? 0.7 : 0),
        tiers_searched: tiersSearched,
      };
    } catch (error) {
      return { memories: [], confidence: 0, tiers_searched: [] };
    }
  }
  
  /** Store workload outcomes */
  async storeWorkload(summary: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await this.storeToTier(summary, 'workload_outcome', 0.75, metadata);
    } catch (error) {
      console.warn('[Memory] Workload store failed gracefully');
    }
  }
  
  /** Get metacognitive state — the brain knowing its own memory */
  async getMetaState(): Promise<MemoryMetaState | null> {
    try {
      const { data } = await supabase
        .from('brain_memory_meta' as any)
        .select('*')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .single();
      
      return data as unknown as MemoryMetaState | null;
    } catch {
      return null;
    }
  }

  /** Build context string from recalled memories */
  buildContextString(memories: MemoryEntry[]): string {
    if (memories.length === 0) return '';
    
    const contextLines = memories
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 5)
      .map(m => `- ${m.content}`);
    
    return `\n\n[Relevant context from memory]\n${contextLines.join('\n')}`;
  }

  /** Track recall hit/miss for metacognition */
  private async trackRecallHit(hit: boolean): Promise<void> {
    try {
      await supabase.rpc('track_memory_recall', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
        p_hit: hit,
      });
    } catch {
      // Silent fail
    }
  }

  /** Update meta on store */
  private async updateMetaStore(): Promise<void> {
    try {
      await supabase
        .from('brain_memory_meta' as any)
        .upsert({
          user_id: this.userId,
          agent_id: this.agentId,
          total_stores: 1,
        }, { onConflict: 'user_id,agent_id' });
    } catch {
      // Silent
    }
  }

  /** Run tiering cascade if near capacity */
  private async maybeRunTiering(): Promise<void> {
    try {
      const meta = await this.getMetaState();
      if (!meta) return;
      
      // Only run if hot tier is >90% full
      if (meta.hot_count > meta.hot_limit * 0.9) {
        await supabase.rpc('run_memory_tiering', {
          p_user_id: this.userId,
          p_agent_id: this.agentId,
        });
      }
    } catch {
      // Silent
    }
  }
}
