/**
 * Memory Client - Per-user + per-agent persistent memory
 * v10.9.0 — Full Cognitive Upgrade: Vector Search, Spaced Repetition,
 * Contradiction Detection, Causal Graphs, Confidence Decay, Dream Consolidation,
 * Metacognitive Self-Assessment, Memory Compression, User Fingerprinting,
 * RAG Pipeline, Audit Provenance, Contextual Pre-fetch, Cross-Agent Sharing,
 * Episodic Replay, Workload-Aware Tiering
 */

import { supabase } from '@/integrations/supabase/client';

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: string;
  relevance?: number;
  tier?: 'hot' | 'warm' | 'cold' | 'archive';
  memory_type?: string;
  provenance?: MemoryProvenance;
}

export interface RecallResult {
  memories: MemoryEntry[];
  confidence: number;
  tiers_searched: string[];
  contradictions?: ContradictionResult[];
  rag_context_id?: string;
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
  retrieval_strategy: string;
  recall_accuracy: number;
  avg_salience: number;
  contradiction_count: number;
  compression_ratio: number;
  peak_hours: number[];
}

// ═══════════════════════════════════════════════════════════════════
// #6 CONTRADICTION DETECTION
// ═══════════════════════════════════════════════════════════════════
export interface ContradictionResult {
  existing_id: string;
  existing_content: string;
  similarity: number;
}

// ═══════════════════════════════════════════════════════════════════
// #15 AUDIT PROVENANCE
// ═══════════════════════════════════════════════════════════════════
export interface MemoryProvenance {
  source: string;
  ingested_at: string;
  recall_count: number;
  last_recalled_at?: string;
  reinforced_count: number;
  contradiction_checks: number;
  lineage: string[]; // chain of transformations
}

// ═══════════════════════════════════════════════════════════════════
// #13 USER FINGERPRINT
// ═══════════════════════════════════════════════════════════════════
export interface UserFingerprint {
  preferred_topics: string[];
  communication_style: string;
  complexity_preference: string;
  interaction_count: number;
  avg_message_length: number;
  top_keywords: string[];
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

  // ═══════════════════════════════════════════════════════════════════
  // #15 PROVENANCE BUILDER
  // ═══════════════════════════════════════════════════════════════════
  private buildProvenance(source: string): MemoryProvenance {
    return {
      source,
      ingested_at: new Date().toISOString(),
      recall_count: 0,
      reinforced_count: 0,
      contradiction_checks: 0,
      lineage: [`ingested:${source}:${new Date().toISOString()}`],
    };
  }

  /**
   * Store a memory with salience gating + contradiction detection + fingerprinting
   */
  async store(content: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const facts = this.extractFacts(content);
      const memoryType = facts.length > 0 ? 'user_fact' : 
        (metadata?.memory_type as string) || 'general';
      
      // #13: Update user fingerprint
      await this.updateFingerprint(content);
      
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
      
      // #11: Track hourly activity for workload-aware tiering
      await this.trackHourlyActivity();
      
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
    // #15: Build provenance
    const provenance = this.buildProvenance(
      (metadata?.source as string) || 'memory_sdk_v3'
    );

    // #8: Assign decay curve based on type
    const decayCurve = ['episodic', 'interaction'].includes(memoryType) ? 'fast' :
      ['procedural', 'preference'].includes(memoryType) ? 'slow' : 'standard';

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
        source: 'memory_sdk_v3',
        decay_curve: decayCurve,
        provenance,
        ...metadata
      }
    };

    // Salience gate: high → hot (via substrate), medium → warm direct, low → skip
    if (salience >= 0.7) {
      await supabase.functions.invoke('pf-substrate', { body: basePayload });
    } else if (salience >= 0.3) {
      await supabase.from('brain_memory_warm' as any).insert({
        content,
        context: memoryType,
        user_id: this.userId,
        agent_id: this.agentId,
        memory_type: memoryType,
        salience_score: salience,
        value_score: salience * 0.8,
        decay_curve: decayCurve,
        provenance,
        metadata: basePayload.metadata,
        tags: { source: 'memory_sdk_v3' },
      });
    }
    // salience < 0.3 → don't store (noise)
  }
  
  /**
   * Recall relevant memories across ALL tiers
   * #1: Vector search, #2: Spaced repetition boost, #3: Contextual pre-fetch
   * #5: Episodic replay, #10: Metacognitive strategy, #14: RAG context
   */
  async recall(query: string, limit: number = 5): Promise<RecallResult> {
    try {
      const tiersSearched: string[] = [];
      const allMemories: MemoryEntry[] = [];
      
      // #10: Get retrieval strategy from metacognition
      const meta = await this.getMetaState();
      const strategy = meta?.retrieval_strategy || 'balanced';
      const effectiveLimit = strategy === 'exploration' ? limit * 2 : limit;
      
      // #3: Contextual pre-fetch — boost memories due for review (#2 spaced repetition)
      const { data: dueForReviewRaw } = await supabase
        .from('brain_memory_hot' as any)
        .select('id, content, created_at, value_score, memory_type, provenance')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .lte('next_review_at', new Date().toISOString())
        .order('value_score', { ascending: false })
        .limit(3);
      
      const dueForReview = (dueForReviewRaw || []) as unknown as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
      if (dueForReview.length > 0) {
        tiersSearched.push('spaced_repetition');
        for (const m of dueForReview) {
          allMemories.push({
            id: m.id, content: m.content,
            timestamp: m.created_at, relevance: (m.value_score || 0.5) * 1.1, // boost
            tier: 'hot', memory_type: m.memory_type,
            provenance: m.provenance,
          });
          // #2: Reinforce via SM-2
          try {
            await supabase.rpc('sm2_update_memory', {
              p_memory_id: m.id, p_tier: 'hot', p_quality: 4
            });
          } catch { /* silent */ }
        }
      }

      // 1. Search hot tier (fastest, most relevant)
      const { data: hotDataRaw } = await supabase
        .from('brain_memory_hot' as any)
        .select('id, content, created_at, value_score, memory_type, provenance')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .order('value_score', { ascending: false })
        .limit(effectiveLimit);
      
      const hotData = (hotDataRaw || []) as unknown as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
      if (hotData.length > 0) {
        tiersSearched.push('hot');
        for (const m of hotData) {
          if (!allMemories.some(e => e.id === m.id)) {
            allMemories.push({
              id: m.id, content: m.content,
              timestamp: m.created_at, relevance: (m.value_score || 0.5) * 1.0,
              tier: 'hot', memory_type: m.memory_type,
              provenance: m.provenance,
            });
          }
        }
      }

      // 2. Search warm if hot didn't fill limit
      if (allMemories.length < effectiveLimit) {
        const { data: warmDataRaw } = await supabase
          .from('brain_memory_warm' as any)
          .select('id, content, created_at, value_score, memory_type, provenance')
          .eq('user_id', this.userId)
          .eq('agent_id', this.agentId)
          .order('value_score', { ascending: false })
          .limit(effectiveLimit - allMemories.length);
        
        const warmData = (warmDataRaw || []) as unknown as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
        if (warmData.length > 0) {
          tiersSearched.push('warm');
          for (const m of warmData) {
            allMemories.push({
              id: m.id, content: m.content,
              timestamp: m.created_at, relevance: (m.value_score || 0.3) * 0.8,
              tier: 'warm', memory_type: m.memory_type,
              provenance: m.provenance,
            });
          }
        }
      }

      // 3. Also query via substrate for vector-based recall (#1 Vector Search)
      const response = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'query',
          query_text: query,
          limit: effectiveLimit,
          recall_strategy: strategy === 'precision' ? 'fidelity_first' : 'broad',
          filters: {
            memory_types: ['user_fact', 'persistent_memory', 'workload_outcome', 'conversation_with_facts'],
            'metadata.agentId': this.agentId,
            'metadata.userId': this.userId,
            ...(this.scope === 'session' ? { 'metadata.sessionId': this.sessionId } : {})
          }
        }
      });
      
      if (response.data?.memories) {
        tiersSearched.push('substrate_vector');
        for (const m of response.data.memories) {
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

      // #14: RAG — Log context for audit
      const ragContextId = await this.logRAGContext(query, finalMemories);
      
      return {
        memories: finalMemories,
        confidence: hasUserFacts ? 0.95 : (finalMemories.length > 0 ? 0.7 : 0),
        tiers_searched: tiersSearched,
        rag_context_id: ragContextId,
      };
    } catch (error) {
      return { memories: [], confidence: 0, tiers_searched: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #5 EPISODIC REPLAY — Reconstruct interaction timelines
  // ═══════════════════════════════════════════════════════════════════
  async replayEpisode(timeframe: { from: string; to: string }, limit: number = 20): Promise<MemoryEntry[]> {
    try {
      const { data } = await supabase
        .from('brain_memory_hot' as any)
        .select('id, content, created_at, value_score, memory_type, provenance')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .gte('created_at', timeframe.from)
        .lte('created_at', timeframe.to)
        .order('created_at', { ascending: true })
        .limit(limit);
      
      const results = (data || []) as unknown as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
      return results.map(m => ({
        id: m.id,
        content: m.content,
        timestamp: m.created_at,
        relevance: m.value_score,
        tier: 'hot' as const,
        memory_type: m.memory_type,
        provenance: m.provenance,
      }));
    } catch {
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #4 CROSS-AGENT MEMORY SHARING
  // ═══════════════════════════════════════════════════════════════════
  async shareWithAgent(targetAgentId: string, memoryIds: string[]): Promise<number> {
    try {
      let shared = 0;
      for (const memoryId of memoryIds) {
        const { data } = await supabase
          .from('brain_memory_hot' as any)
          .select('*')
          .eq('id', memoryId)
          .eq('user_id', this.userId)
          .eq('agent_id', this.agentId)
          .single();
        
        if (data) {
          const entry = data as any;
          await supabase.from('brain_memory_warm' as any).insert({
            content: entry.content,
            context: entry.context,
            user_id: this.userId,
            agent_id: targetAgentId,
            memory_type: entry.memory_type,
            salience_score: (entry.salience_score || 0.5) * 0.8,
            value_score: (entry.value_score || 0.5) * 0.7,
            provenance: {
              ...this.buildProvenance('cross_agent_share'),
              lineage: [`shared_from:${this.agentId}:${new Date().toISOString()}`],
            },
            metadata: { ...entry.metadata, shared_from_agent: this.agentId },
            tags: { source: 'cross_agent_share' },
          });
          shared++;
        }
      }
      return shared;
    } catch {
      return 0;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #6 CONTRADICTION DETECTION
  // ═══════════════════════════════════════════════════════════════════
  async checkContradictions(content: string, memoryId: string): Promise<ContradictionResult[]> {
    try {
      const { data } = await supabase.rpc('detect_memory_contradictions', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
        p_new_content: content,
        p_new_memory_id: memoryId,
      });
      return (data as any)?.details || [];
    } catch {
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #9 DREAM CONSOLIDATION — Trigger dream cycle
  // ═══════════════════════════════════════════════════════════════════
  async triggerConsolidation(): Promise<{ merged: number; compressed: number }> {
    try {
      // Compress verbose warm memories
      const compressResult = await supabase.rpc('compress_warm_memories', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
      });

      // Apply confidence decay
      await supabase.rpc('apply_confidence_decay', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
      });

      // Run metacognitive assessment
      await supabase.rpc('run_metacognitive_assessment', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
      });

      return {
        merged: 0, // future: merge similar warm memories
        compressed: (compressResult.data as any)?.compressed || 0,
      };
    } catch {
      return { merged: 0, compressed: 0 };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #13 USER FINGERPRINTING
  // ═══════════════════════════════════════════════════════════════════
  private async updateFingerprint(content: string): Promise<void> {
    try {
      const keywords = content.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 10);

      await supabase.rpc('update_user_fingerprint', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
        p_message_length: content.length,
        p_keywords: keywords,
      });
    } catch {
      // Silent
    }
  }

  async getUserFingerprint(): Promise<UserFingerprint | null> {
    try {
      const { data } = await supabase
        .from('brain_user_fingerprints' as any)
        .select('preferred_topics, communication_style, complexity_preference, interaction_count, avg_message_length, top_keywords')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .single();
      return data as unknown as UserFingerprint | null;
    } catch {
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #14 RAG PIPELINE — Log context injections
  // ═══════════════════════════════════════════════════════════════════
  private async logRAGContext(query: string, memories: MemoryEntry[]): Promise<string | undefined> {
    try {
      const contextString = this.buildContextString(memories);
      const { data } = await supabase
        .from('brain_rag_contexts' as any)
        .insert({
          user_id: this.userId,
          agent_id: this.agentId,
          query_text: query,
          recalled_memory_ids: memories.map(m => m.id),
          recalled_tiers: [...new Set(memories.map(m => m.tier))],
          context_string: contextString,
          total_tokens: Math.ceil(contextString.length / 4),
        })
        .select('id')
        .single();
      return (data as any)?.id;
    } catch {
      return undefined;
    }
  }

  /** Rate RAG quality for feedback loop */
  async rateRAGContext(contextId: string, wasUseful: boolean, quality: number): Promise<void> {
    try {
      await supabase
        .from('brain_rag_contexts' as any)
        .update({ was_useful: wasUseful, response_quality: quality })
        .eq('id', contextId);
    } catch {
      // Silent
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
      .map(m => {
        const tierTag = m.tier ? `[${m.tier}]` : '';
        const typeTag = m.memory_type ? `(${m.memory_type})` : '';
        return `- ${tierTag}${typeTag} ${m.content}`;
      });
    
    return `\n\n[Relevant context from memory — strategy: adaptive]\n${contextLines.join('\n')}`;
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

  // ═══════════════════════════════════════════════════════════════════
  // #11 WORKLOAD-AWARE TIERING — Track hourly patterns
  // ═══════════════════════════════════════════════════════════════════
  private async trackHourlyActivity(): Promise<void> {
    try {
      const hour = new Date().getHours();
      const { data: meta } = await supabase
        .from('brain_memory_meta' as any)
        .select('hourly_activity, peak_hours')
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .single();
      
      if (meta) {
        const activity = (meta as any).hourly_activity || {};
        activity[hour] = (activity[hour] || 0) + 1;
        
        // Calculate peak hours (top 3)
        const sorted = Object.entries(activity)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([h]) => parseInt(h));

        await supabase
          .from('brain_memory_meta' as any)
          .update({ hourly_activity: activity, peak_hours: sorted })
          .eq('user_id', this.userId)
          .eq('agent_id', this.agentId);
      }
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
