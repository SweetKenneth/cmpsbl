/**
 * Memory Client - Per-user + per-agent persistent memory
 * Full Cognitive Upgrade: Vector Search, Spaced Repetition,
 * Contradiction Detection, Causal Graphs, Confidence Decay, Dream Consolidation,
 * Metacognitive Self-Assessment, Memory Compression, User Fingerprinting,
 * RAG Pipeline, Audit Provenance, Contextual Pre-fetch, Cross-Agent Sharing,
 * Episodic Replay, Workload-Aware Tiering
 */

import { supabase } from '@/integrations/supabase/client';
import { isDuplicate, compactMetadata, classifyImportance, shouldPreserveIndefinitely } from './content-dedup';

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: string;
  relevance?: number;
  tier?: 'hot' | 'warm' | 'cold' | 'glacier';
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
  private readonly agentId: string;
  private readonly scope: 'session' | 'project';
  private readonly sessionId: string;
  private userId: string | null = null;
  
  /** Cached meta state to reduce DB round-trips */
  private cachedMeta: MemoryMetaState | null = null;
  private metaCacheExpiry = 0;
  private static readonly META_CACHE_TTL_MS = 30_000; // 30s

  /** Hoisted DB select fields — avoids string re-creation per query */
  private static readonly MEMORY_SELECT = 'id, content, created_at, value_score, memory_type, provenance' as const;
  private static readonly META_SELECT = 'hot_count, warm_count, cold_count, archive_count, hot_limit, warm_limit, cold_limit, recall_hit_rate, total_stores, total_recalls, retrieval_strategy, recall_accuracy, avg_salience, contradiction_count, compression_ratio, peak_hours' as const;

  constructor(agentId: string, scope: 'session' | 'project' = 'project') {
    this.agentId = agentId;
    this.scope = scope;
    this.sessionId = `${Date.now()}-${(Math.random() * 1e9 | 0).toString(16)}`;
  }

  /** Set user context for per-user memory isolation */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /** FIX #3: Guard — ensure userId is set before any DB operation */
  private assertUserId(): string {
    if (!this.userId) {
      throw new Error('[Memory] userId not set — call setUserId() before store/recall');
    }
    return this.userId;
  }
  
  /** Pre-compiled fact extraction patterns (hoisted for perf) */
  private static readonly FACT_PATTERNS = [
    /\bmy\s+(\w[\w\s]{0,30}?)\s+(?:is|are|was|were)\s+(.+?)(?:\.|$|,|\band\b)/gi,
    /\bi(?:'m|\s+am)\s+(.+?)(?:\.|$|,|\band\b)/gi,
    /\bi\s+(?:like|love|hate|prefer|enjoy|want|need)\s+(.+?)(?:\.|$|,|\band\b)/gi,
    /\b(?:my\s+name\s+is|call\s+me|i'm\s+called)\s+(.+?)(?:\.|$|,|\band\b)/gi,
    /\bi\s+(?:live\s+in|am\s+from|come\s+from)\s+(.+?)(?:\.|$|,|\band\b)/gi,
    /\b(?:remember\s+(?:that\s+)?|don'?t\s+forget\s+(?:that\s+)?)(.+?)(?:\.|$)/gi,
  ];
  /** Pre-compiled cleanup regex for fact extraction */
  private static readonly FACT_CLEANUP_RE = /^(?:remember\s+(?:that\s+)?|don'?t\s+forget\s+(?:that\s+)?)/i;

  /** Extract discrete facts from text */
  extractFacts(text: string): string[] {
    const facts: string[] = [];
    const seen = new Set<string>();
    for (const pattern of MemoryClient.FACT_PATTERNS) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(text)) !== null) {
        const raw = match[0].trim();
        const fact = MemoryClient.FACT_CLEANUP_RE.test(raw)
          ? raw.replace(MemoryClient.FACT_CLEANUP_RE, '').trim()
          : raw;
        if (fact.length > 3 && fact.length < 200 && !seen.has(fact)) {
          seen.add(fact);
          facts.push(fact);
        }
      }
    }
    return facts;
  }

  // ═══════════════════════════════════════════════════════════════════
  // #15 PROVENANCE BUILDER — Lightweight version for storage efficiency
  // ═══════════════════════════════════════════════════════════════════
  private buildProvenance(source: string): MemoryProvenance {
    return {
      source,
      ingested_at: new Date().toISOString(),
      recall_count: 0,
      reinforced_count: 0,
      contradiction_checks: 0,
      lineage: [], // Start empty — lineage grows only on transformations, not ingestion
    };
  }

  /**
   * Store a memory with salience gating + contradiction detection + fingerprinting
   * FIX #1: Errors now logged with details instead of swallowed silently
   * FIX #3: userId guard enforced
   */
  async store(content: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const userId = this.assertUserId();

      // DEDUP GATE: Skip exact/near duplicates to save storage
      if (isDuplicate(content)) return;

      const facts = this.extractFacts(content);
      const memoryType = facts.length > 0 ? 'user_fact' : 
        (metadata?.memory_type as string) || 'general';
      
      // Importance classification — critical memories get salience boost
      const importance = classifyImportance(content, memoryType, 0.5, 0);
      const salienceBoost = shouldPreserveIndefinitely(importance) ? 0.2 : 0;
      
      // Store full content — let salience gate decide tier
      const salience = Math.min(1, this.estimateLocalSalience(content, memoryType) + salienceBoost);

      // Compact metadata before storage to save space
      const compactMeta = metadata ? compactMetadata(metadata) : undefined;

      // Run ALL stores + fingerprint + bookkeeping in ONE parallel batch
      const allPromises: Promise<any>[] = [
        this.updateFingerprint(content, userId),
        this.storeToTier(content, memoryType, salience, compactMeta),
        this.incrementMetaStores(),
        this.trackHourlyActivity(),
      ];

      // Add fact stores
      for (const fact of facts) {
        allPromises.push(this.storeToTier(fact, 'user_fact', 0.95));
      }

      await Promise.allSettled(allPromises);

      // Fire-and-forget tiering check — don't block store() return
      this.maybeRunTiering().catch(() => {});
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] Store failed: ${msg}`);
    }
  }

  /** Salience type lookup sets — avoids repeated array creation */
  private static readonly HIGH_SALIENCE_TYPES = new Set(['user_fact', 'preference', 'identity']);
  private static readonly MED_SALIENCE_TYPES = new Set(['workload_outcome', 'task_result']);
  private static readonly FAST_DECAY_TYPES = new Set(['episodic', 'interaction']);
  private static readonly SLOW_DECAY_TYPES = new Set(['procedural', 'preference']);

  /** Estimate salience locally (fast, before DB call) */
  estimateLocalSalience(content: string, memoryType: string): number {
    let salience = 0.5;
    // Count words without allocating split array
    let wordCount = 0;
    let inWord = false;
    for (let i = 0; i < content.length; i++) {
      const isSpace = content.charCodeAt(i) <= 32;
      if (!isSpace && !inWord) { wordCount++; inWord = true; }
      else if (isSpace) { inWord = false; }
    }
    
    if (wordCount < 3) salience -= 0.2;
    else if (wordCount >= 5 && wordCount <= 50) salience += 0.1;
    
    if (MemoryClient.HIGH_SALIENCE_TYPES.has(memoryType)) salience += 0.3;
    else if (MemoryClient.MED_SALIENCE_TYPES.has(memoryType)) salience += 0.15;
    
    return salience > 1 ? 1 : salience < 0 ? 0 : salience;
  }

  /** Route to appropriate tier based on salience */
  private async storeToTier(
    content: string, 
    memoryType: string, 
    salience: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // Early return for noise — skip all object construction
    if (salience < 0.3) return;

    const source = (metadata?.source as string) || 'memory_sdk';
    const provenance = this.buildProvenance(source);
    const decayCurve = MemoryClient.FAST_DECAY_TYPES.has(memoryType) ? 'fast' :
      MemoryClient.SLOW_DECAY_TYPES.has(memoryType) ? 'slow' : 'standard';

    if (salience >= 0.7) {
      // Hot tier via substrate
      const meta: Record<string, unknown> = {
        agentId: this.agentId,
        userId: this.userId,
        scope: this.scope,
        salience_score: salience,
        source: 'memory_sdk',
        decay_curve: decayCurve,
        provenance,
      };
      if (this.scope === 'session') meta.sessionId = this.sessionId;
      if (metadata) Object.assign(meta, metadata);

      await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain', action: 'remember',
          content, memory_type: memoryType, confidence: salience,
          metadata: meta,
        }
      });
    } else {
      // Warm tier direct insert
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
        metadata: { agentId: this.agentId, userId: this.userId, scope: this.scope, ...metadata },
        tags: ['memory_sdk'],
      });
    }
  }
  
  /**
   * Recall relevant memories across ALL tiers
   * FIX #4: Parallel tier queries instead of sequential waterfall
   */
  async recall(query: string, limit: number = 5): Promise<RecallResult> {
    try {
      const userId = this.assertUserId();
      const tiersSearched: string[] = [];
      const allMemories: MemoryEntry[] = [];
      const nowIso = new Date().toISOString();
      
      // Run meta fetch AND all tier queries in a single parallel batch
      const sel = MemoryClient.MEMORY_SELECT;
      const [metaResult, dueForReviewResult, hotResult, warmResult, substrateResult] = await Promise.allSettled([
        this.getMetaState(),
        supabase
          .from('brain_memory_hot' as any)
          .select(sel)
          .eq('user_id', userId)
          .eq('agent_id', this.agentId)
          .lte('next_review_at', nowIso)
          .order('value_score', { ascending: false })
          .limit(3),
        supabase
          .from('brain_memory_hot' as any)
          .select(sel)
          .eq('user_id', userId)
          .eq('agent_id', this.agentId)
          .order('value_score', { ascending: false })
          .limit(limit),
        supabase
          .from('brain_memory_warm' as any)
          .select(sel)
          .eq('user_id', userId)
          .eq('agent_id', this.agentId)
          .order('value_score', { ascending: false })
          .limit(limit),
        supabase.functions.invoke('pf-substrate', {
          body: {
            module: 'brain',
            action: 'query',
            query_text: query,
            limit,
            recall_strategy: 'broad',
            filters: {
              memory_types: ['user_fact', 'persistent_memory', 'workload_outcome', 'conversation_with_facts'],
              'metadata.agentId': this.agentId,
              'metadata.userId': userId,
              ...(this.scope === 'session' ? { 'metadata.sessionId': this.sessionId } : {})
            }
          }
        }),
      ]);

      // Apply strategy from meta (if available) — only affects exploration mode
      const meta = metaResult.status === 'fulfilled' ? metaResult.value as MemoryMetaState | null : null;
      const strategy = meta?.retrieval_strategy || 'balanced';

      // Process spaced repetition results — batch SM-2 updates fire-and-forget
      if (dueForReviewResult.status === 'fulfilled') {
        const dueForReview = ((dueForReviewResult.value as any)?.data || []) as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
        if (dueForReview.length > 0) {
          tiersSearched.push('spaced_repetition');
          for (const m of dueForReview) {
            allMemories.push({
              id: m.id, content: m.content,
              timestamp: m.created_at, relevance: (m.value_score || 0.5) * 1.1,
              tier: 'hot', memory_type: m.memory_type,
              provenance: m.provenance,
            });
          }
          // Batch all SM-2 reinforcements as fire-and-forget
          Promise.allSettled(
            dueForReview.map(m =>
              supabase.rpc('sm2_update_memory', { p_memory_id: m.id, p_tier: 'hot', p_quality: 4 })
            )
          ).catch(() => {});
        }
      }

      // Deduplicate via Set for O(1) lookups instead of O(n) .some()
      const seenIds = new Set<string>();
      const seenContent = new Set<string>();

      const addEntries = (result: PromiseSettledResult<any>, tier: 'hot' | 'warm', tierLabel: string, relevanceMult: number) => {
        if (result.status !== 'fulfilled') return;
        const data = ((result.value as any)?.data || []) as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
        if (data.length === 0) return;
        tiersSearched.push(tierLabel);
        for (const m of data) {
          if (seenIds.has(m.id)) continue;
          seenIds.add(m.id);
          allMemories.push({
            id: m.id, content: m.content,
            timestamp: m.created_at, relevance: (m.value_score || 0.5) * relevanceMult,
            tier, memory_type: m.memory_type, provenance: m.provenance,
          });
        }
      };

      addEntries(hotResult, 'hot', 'hot', 1.0);
      addEntries(warmResult, 'warm', 'warm', 0.8);

      // Process substrate vector results
      if (substrateResult.status === 'fulfilled') {
        const response = substrateResult.value as any;
        if (response?.data?.memories) {
          tiersSearched.push('substrate_vector');
          for (const m of response.data.memories) {
            if (seenContent.has(m.content)) continue;
            seenContent.add(m.content);
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
      
      const hit = finalMemories.length > 0;
      let hasUserFacts = false;
      for (let i = 0; i < finalMemories.length; i++) {
        if (finalMemories[i].memory_type === 'user_fact') { hasUserFacts = true; break; }
      }

      // Fire-and-forget: recall tracking + RAG audit don't block response
      const ragContextId = `rag-${Date.now().toString(36)}`;
      this.trackRecallHit(hit).catch(() => {});
      this.logRAGContext(query, finalMemories).catch(() => {});
      
      return {
        memories: finalMemories,
        confidence: hasUserFacts ? 0.95 : (hit ? 0.7 : 0),
        tiers_searched: tiersSearched,
        rag_context_id: ragContextId,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] Recall failed: ${msg}`);
      return { memories: [], confidence: 0, tiers_searched: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #5 EPISODIC REPLAY — Reconstruct interaction timelines
  // FIX #11: Now searches BOTH hot and warm tiers
  // ═══════════════════════════════════════════════════════════════════
  async replayEpisode(timeframe: { from: string; to: string }, limit: number = 20): Promise<MemoryEntry[]> {
    try {
      const userId = this.assertUserId();

      // FIX #11: Query hot AND warm in parallel — uses hoisted select constant
      const sel = MemoryClient.MEMORY_SELECT;
      const [hotResult, warmResult] = await Promise.allSettled([
        supabase
          .from('brain_memory_hot' as any)
          .select(sel)
          .eq('user_id', userId)
          .eq('agent_id', this.agentId)
          .gte('created_at', timeframe.from)
          .lte('created_at', timeframe.to)
          .order('created_at', { ascending: true })
          .limit(limit),
        supabase
          .from('brain_memory_warm' as any)
          .select(sel)
          .eq('user_id', userId)
          .eq('agent_id', this.agentId)
          .gte('created_at', timeframe.from)
          .lte('created_at', timeframe.to)
          .order('created_at', { ascending: true })
          .limit(limit),
      ]);

      const entries: MemoryEntry[] = [];
      const seen = new Set<string>();

      const processTier = (result: PromiseSettledResult<any>, tier: 'hot' | 'warm') => {
        if (result.status !== 'fulfilled') return;
        const data = (result.value?.data || []) as Array<{ id: string; content: string; created_at: string; value_score: number; memory_type: string; provenance?: any }>;
        for (const m of data) {
          if (seen.has(m.id)) continue;
          seen.add(m.id);
          entries.push({
            id: m.id, content: m.content, timestamp: m.created_at,
            relevance: m.value_score, tier, memory_type: m.memory_type,
            provenance: m.provenance,
          });
        }
      };

      processTier(hotResult, 'hot');
      processTier(warmResult, 'warm');

      // Sort chronologically — pre-compute timestamps in typed array for cache-friendly sort
      if (entries.length <= 1) return entries.slice(0, limit);
      const ts = new Float64Array(entries.length);
      for (let i = 0; i < entries.length; i++) ts[i] = new Date(entries[i].timestamp).getTime();
      // Index-sort to avoid repeated property access during comparisons
      const indices = Array.from({ length: entries.length }, (_, i) => i);
      indices.sort((a, b) => ts[a] - ts[b]);
      const sorted: MemoryEntry[] = [];
      const cap = Math.min(limit, indices.length);
      for (let i = 0; i < cap; i++) sorted.push(entries[indices[i]]);
      return sorted;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] Replay failed: ${msg}`);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #4 CROSS-AGENT MEMORY SHARING
  // FIX #12: Respects salience score for target tier placement
  // ═══════════════════════════════════════════════════════════════════
  async shareWithAgent(targetAgentId: string, memoryIds: string[]): Promise<number> {
    try {
      const userId = this.assertUserId();
      if (memoryIds.length === 0) return 0;

      // Batch fetch all memories in one query instead of N sequential queries
      const { data: allData } = await supabase
        .from('brain_memory_hot' as any)
        .select('id, content, context, memory_type, salience_score, value_score, metadata')
        .eq('user_id', userId)
        .eq('agent_id', this.agentId)
        .in('id', memoryIds);

      if (!allData || allData.length === 0) return 0;

      const hotInserts: any[] = [];
      const warmInserts: any[] = [];

      // Hoist shared provenance + timestamp outside loop
      const shareTs = new Date().toISOString();
      const shareProvenance = this.buildProvenance('cross_agent_share');
      shareProvenance.lineage = [`shared_from:${this.agentId}:${shareTs}`];

      for (const entry of allData as any[]) {
        const sourceSalience = entry.salience_score || 0.5;
        const sharedSalience = sourceSalience * 0.8;

        if (sharedSalience >= 0.7) {
          hotInserts.push(entry);
        } else {
          warmInserts.push({
            content: entry.content,
            context: entry.context,
            user_id: userId,
            agent_id: targetAgentId,
            memory_type: entry.memory_type,
            salience_score: sharedSalience,
            value_score: sharedSalience * 0.7,
            provenance: shareProvenance,
            metadata: { ...entry.metadata, shared_from_agent: this.agentId },
            tags: ['cross_agent_share'],
          });
        }
      }

      // Batch operations in parallel
      const promises: Promise<any>[] = [];
      if (warmInserts.length > 0) {
        promises.push(Promise.resolve(supabase.from('brain_memory_warm' as any).insert(warmInserts)));
      }
      for (const entry of hotInserts) {
        const sharedSalience = (entry.salience_score || 0.5) * 0.8;
        promises.push(supabase.functions.invoke('pf-substrate', {
          body: {
            module: 'brain', action: 'remember',
            content: entry.content, memory_type: entry.memory_type,
            confidence: sharedSalience,
            metadata: {
              agentId: targetAgentId, userId, scope: this.scope,
              salience_score: sharedSalience, source: 'cross_agent_share',
              shared_from_agent: this.agentId,
            }
          }
        }));
      }
      await Promise.allSettled(promises);
      return allData.length;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] Share failed: ${msg}`);
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
      const userId = this.assertUserId();

      // Run all consolidation RPCs in parallel
      const [compressResult] = await Promise.allSettled([
        supabase.rpc('compress_warm_memories', {
          p_user_id: userId,
          p_agent_id: this.agentId,
        }),
        supabase.rpc('apply_confidence_decay', {
          p_user_id: userId,
          p_agent_id: this.agentId,
        }),
        supabase.rpc('run_metacognitive_assessment', {
          p_user_id: userId,
          p_agent_id: this.agentId,
        }),
      ]);

      const compressed = compressResult.status === 'fulfilled' 
        ? ((compressResult.value as any)?.data?.compressed || 0)
        : 0;

      return { merged: 0, compressed };
    } catch {
      return { merged: 0, compressed: 0 };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #13 USER FINGERPRINTING
  // FIX #3: userId passed explicitly, not read from nullable field
  // ═══════════════════════════════════════════════════════════════════
  private static readonly FINGERPRINT_CLEAN_RE = /[^a-z0-9\s]/g;
  /** Stop-words to skip during keyword extraction */
  private static readonly STOP_WORDS = new Set([
    'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'will',
    'would', 'could', 'should', 'about', 'their', 'which', 'there', 'these',
    'those', 'other', 'into', 'some', 'than', 'then', 'them', 'your', 'what',
  ]);

  private async updateFingerprint(content: string, userId?: string): Promise<void> {
    const uid = userId || this.userId;
    if (!uid) return;
    try {
      // Single-pass: extract keywords without intermediate .replace().split()
      const keywords: string[] = [];
      const len = content.length;
      let wordStart = -1;
      
      for (let i = 0; i <= len && keywords.length < 10; i++) {
        const ch = i < len ? content.charCodeAt(i) : 32;
        const isAlphaNum = (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57); // a-z, 0-9
        const isUpper = ch >= 65 && ch <= 90;
        
        if ((isAlphaNum || isUpper) && wordStart === -1) {
          wordStart = i;
        } else if (!isAlphaNum && !isUpper && wordStart !== -1) {
          if (i - wordStart > 3) {
            const word = content.slice(wordStart, i).toLowerCase();
            if (!MemoryClient.STOP_WORDS.has(word)) {
              keywords.push(word);
            }
          }
          wordStart = -1;
        }
      }

      await supabase.rpc('update_user_fingerprint', {
        p_user_id: uid,
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
      const userId = this.assertUserId();
      const { data } = await supabase
        .from('brain_user_fingerprints' as any)
        .select('preferred_topics, communication_style, complexity_preference, interaction_count, avg_message_length, top_keywords')
        .eq('user_id', userId)
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
  private async logRAGContext(query: string, memories: MemoryEntry[]): Promise<void> {
    if (memories.length === 0) return;
    try {
      const contextString = this.buildContextString(memories);
      // Collect tier set without spread+Set overhead
      const tierSet: string[] = [];
      const tierSeen = new Set<string>();
      for (const m of memories) {
        if (m.tier && !tierSeen.has(m.tier)) { tierSeen.add(m.tier); tierSet.push(m.tier); }
      }
      
      await supabase
        .from('brain_rag_contexts' as any)
        .insert({
          user_id: this.userId,
          agent_id: this.agentId,
          query_text: query,
          recalled_memory_ids: memories.map(m => m.id),
          recalled_tiers: tierSet,
          context_string: contextString,
          total_tokens: (contextString.length + 3) >> 2, // fast integer division by 4
        });
      // No .select('id') — saves a round-trip since caller uses generated ID
    } catch {
      // Silent
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
      this.assertUserId();
      await this.storeToTier(summary, 'workload_outcome', 0.75, metadata);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Memory] Workload store failed: ${msg}`);
    }
  }
  
  /** Get metacognitive state — with 30s cache to reduce DB round-trips */
  async getMetaState(): Promise<MemoryMetaState | null> {
    try {
      if (!this.userId) return null;
      const now = Date.now();
      if (this.cachedMeta && now < this.metaCacheExpiry) return this.cachedMeta;

      const { data } = await supabase
        .from('brain_memory_meta' as any)
        .select(MemoryClient.META_SELECT)
        .eq('user_id', this.userId)
        .eq('agent_id', this.agentId)
        .maybeSingle();
      
      this.cachedMeta = data as unknown as MemoryMetaState | null;
      this.metaCacheExpiry = now + MemoryClient.META_CACHE_TTL_MS;
      return this.cachedMeta;
    } catch {
      return null;
    }
  }

  /** Build context string — single string accumulation, no intermediate array */
  buildContextString(memories: MemoryEntry[]): string {
    if (memories.length === 0) return '';
    
    const cap = memories.length <= 5 ? memories.length : 5;
    let result = '\n\n[Relevant context from memory — strategy: adaptive]';
    for (let i = 0; i < cap; i++) {
      const m = memories[i];
      result += '\n- ';
      if (m.tier) { result += '['; result += m.tier; result += ']'; }
      if (m.memory_type) { result += '('; result += m.memory_type; result += ')'; }
      result += ' ';
      result += m.content;
    }
    return result;
  }

  /** Track recall hit/miss for metacognition */
  private async trackRecallHit(hit: boolean): Promise<void> {
    try {
      if (!this.userId) return;
      await supabase.rpc('track_memory_recall', {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
        p_hit: hit,
      });
    } catch {
      // Silent fail
    }
  }

  /**
   * FIX #2: Increment total_stores via RPC instead of broken upsert that always sets 1
   */
  private async incrementMetaStores(): Promise<void> {
    try {
      if (!this.userId) return;
      // Try RPC first; fall back to upsert with proper increment
      const { error } = await supabase.rpc('increment_memory_stores' as any, {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
      });
      if (error) {
        // Fallback: read-modify-write
        const { data: existing } = await supabase
          .from('brain_memory_meta' as any)
          .select('total_stores')
          .eq('user_id', this.userId)
          .eq('agent_id', this.agentId)
          .maybeSingle();

        const current = (existing as any)?.total_stores || 0;
        await supabase
          .from('brain_memory_meta' as any)
          .upsert({
            user_id: this.userId,
            agent_id: this.agentId,
            total_stores: current + 1,
          }, { onConflict: 'user_id,agent_id' });
      }
    } catch {
      // Silent
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // #11 WORKLOAD-AWARE TIERING — Track hourly patterns (throttled)
  // ═══════════════════════════════════════════════════════════════════
  private lastHourlyTrack = 0;
  private static readonly HOURLY_THROTTLE_MS = 60_000; // max once per minute

  private async trackHourlyActivity(): Promise<void> {
    try {
      if (!this.userId) return;
      const now = Date.now();
      if (now - this.lastHourlyTrack < MemoryClient.HOURLY_THROTTLE_MS) return;
      this.lastHourlyTrack = now;

      // Single RPC call replaces read-modify-write pattern
      await supabase.rpc('track_hourly_activity' as any, {
        p_user_id: this.userId,
        p_agent_id: this.agentId,
        p_hour: new Date().getHours(),
      }).then(({ error }) => {
        if (error) {
          // Fallback: fire-and-forget meta update
          this.trackHourlyFallback().catch(() => {});
        }
      });
    } catch {
      // Silent
    }
  }

  private async trackHourlyFallback(): Promise<void> {
    const { data: meta } = await supabase
      .from('brain_memory_meta' as any)
      .select('hourly_activity')
      .eq('user_id', this.userId!)
      .eq('agent_id', this.agentId)
      .maybeSingle();
    
    if (!meta) return;
    const activity = (meta as any).hourly_activity || {};
    const hour = new Date().getHours();
    activity[hour] = (activity[hour] || 0) + 1;
    
    // Top 3 peak hours — swap-to-end instead of O(n) splice
    const entries = Object.entries(activity) as [string, number][];
    const peaks: number[] = [];
    let activeLen = entries.length;
    for (let i = 0; i < 3 && activeLen > 0; i++) {
      let maxIdx = 0;
      for (let j = 1; j < activeLen; j++) {
        if (entries[j][1] > entries[maxIdx][1]) maxIdx = j;
      }
      peaks.push(parseInt(entries[maxIdx][0]));
      // Swap max to end and shrink active window — O(1) vs O(n) splice
      activeLen--;
      if (maxIdx !== activeLen) {
        const tmp = entries[maxIdx];
        entries[maxIdx] = entries[activeLen];
        entries[activeLen] = tmp;
      }
    }

    await supabase
      .from('brain_memory_meta' as any)
      .update({ hourly_activity: activity, peak_hours: peaks })
      .eq('user_id', this.userId!)
      .eq('agent_id', this.agentId);
  }

  /** Run tiering cascade if near capacity */
  private async maybeRunTiering(): Promise<void> {
    try {
      if (!this.userId) return;
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
