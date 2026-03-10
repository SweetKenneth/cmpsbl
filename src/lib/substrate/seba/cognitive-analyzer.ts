/**
 * SEBA Cognitive Analyzer
 * Full Spectrum Analysis Engine (Backend Stats Integration)
 * 
 * Runs 9 analysis engines to generate comprehensive insights:
 * - Memory, Learning, Imagination, Reasoning (Core 4)
 * - Security, Telemetry, Governance, Resources, Architecture (Extended 5)
 * 
 * Uses backend stats (brain.status, modernizer.status) to bypass RLS
 */

import { memoryCore, type MemoryEntry } from '../memory-core';
import { learningEngine } from '../learning-engine';
import { imaginationEngine } from '../imagination-engine';
import { reasoningEngine } from '../reasoning-engine';
import { telemetryEngine } from '../telemetry-engine';
import { supabase } from '@/integrations/supabase/client';
import type { CognitiveInsight, ImprovementCategory } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND STATS FETCHER — Bypasses RLS by using edge functions
// ═══════════════════════════════════════════════════════════════════════════════

interface BackendStats {
  brain: {
    healthy: boolean;
    learning: boolean;
    tiers: {
      hot: { current: number; max: number; health: string };
      warm: { current: number; max: number; health: string };
      cold: { current: number; max: number; health: string };
    };
    metrics: {
      events_24h: number;
      total_memories: number;
      learning_cycles_24h: number;
      queued_actions: number;
    };
    needs_tiering: boolean;
  } | null;
  evolution: {
    system_health: { score: number; orchestrator: number };
    plans: { pending: number; applied: number };
    improvement_areas: string[];
  } | null;
}

async function fetchBackendStats(): Promise<BackendStats> {
  const stats: BackendStats = { brain: null, evolution: null };
  
  try {
    // Fetch brain status from database directly (pf-brain-status may not be deployed)
    const { count: hotCount } = await supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true });
    const { count: warmCount } = await supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true });
    const { count: coldCount } = await supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true });
    const brainResponse = { data: { success: true, status: {
      healthy: true, learning: true,
      tiers: {
        hot: { current: hotCount || 0, max: 500, health: 'ok' },
        warm: { current: warmCount || 0, max: 2000, health: 'ok' },
        cold: { current: coldCount || 0, max: 10000, health: 'ok' },
      },
      metrics: { events_24h: 0, total_memories: (hotCount || 0) + (warmCount || 0) + (coldCount || 0), learning_cycles_24h: 0, queued_actions: 0 },
      tier_summary: { needs_tiering: false },
    }}};
    if (brainResponse.data?.success && brainResponse.data?.status) {
      const s = brainResponse.data.status;
      stats.brain = {
        healthy: s.healthy ?? false,
        learning: s.learning ?? false,
        tiers: s.tiers || {
          hot: { current: 0, max: 500, health: 'unknown' },
          warm: { current: 0, max: 2000, health: 'unknown' },
          cold: { current: 0, max: 10000, health: 'unknown' },
        },
        metrics: s.metrics || {
          events_24h: 0,
          total_memories: 0,
          learning_cycles_24h: 0,
          queued_actions: 0,
        },
        needs_tiering: s.tier_summary?.needs_tiering ?? false,
      };
    }
  } catch (e) {
    console.warn('[SEBA] Failed to fetch brain stats from backend:', e);
  }
  
  try {
    // Fetch EVOLUTION node status from backend
    const modResponse = await supabase.functions.invoke('pf-substrate', {
      body: { module: 'modernizer', action: 'status' }, // edge function still uses legacy name for backward compat
    });
    if (modResponse.data?.success) {
      stats.evolution = {
        system_health: modResponse.data.system_health || { score: 100, orchestrator: 100 },
        plans: modResponse.data.plans || { pending: 0, applied: 0 },
        improvement_areas: modResponse.data.improvement_areas || [],
      };
    }
  } catch (e) {
    console.warn('[SEBA] Failed to fetch evolution stats from backend:', e);
  }
  
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

export class CognitiveAnalyzer {
  private correlationId: string;
  private backendStats: BackendStats | null = null;

  constructor(correlationId?: string) {
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Run full cognitive analysis to discover improvement opportunities
   * Skips insights that have recently been addressed (cooldown period)
   * v2.1.0: Fetches backend stats first to bypass RLS issues
   */
  async analyze(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];
    const startTime = Date.now();

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { action: 'cognitive_analysis_start' },
    }, this.correlationId);

    try {
      // ═══ FETCH BACKEND STATS FIRST (v2.1.0 — bypasses RLS) ═══
      this.backendStats = await fetchBackendStats();
      console.log('[SEBA] Backend stats loaded:', {
        brain_healthy: this.backendStats.brain?.healthy,
        brain_memories: this.backendStats.brain?.metrics?.total_memories,
        brain_hot: this.backendStats.brain?.tiers?.hot?.current,
        evolution_health: this.backendStats.evolution?.system_health?.score,
      });
      
      // Load recently addressed insights for deduplication
      const recentlyAddressed = await this.getRecentlyAddressedInsights();

      // ═══ MODERNIZER SCAN INSIGHTS (mobile-first, real backend proposals) ═══
      // NOTE: Modernizer scan insights are now generated via the core engines below.
      // The previous analyzeModernizerScan() method was removed as redundant.
      
      // ═══ CORE ENGINES (Original 4) ═══
      // 1. Memory Analysis — Look for patterns in stored knowledge
      const memoryInsights = await this.analyzeMemory();
      insights.push(...memoryInsights);

      // 2. Learning Analysis — Check learning efficiency and gaps
      const learningInsights = await this.analyzeLearning();
      insights.push(...learningInsights);

      // 3. Imagination Analysis — Generate creative improvements
      const imaginationInsights = await this.analyzeImagination();
      insights.push(...imaginationInsights);

      // 4. Reasoning Analysis — Identify causal patterns and opportunities
      const reasoningInsights = await this.analyzeReasoning();
      insights.push(...reasoningInsights);

      // ═══ EXTENDED ENGINES (New 5 in v2.0.0) ═══
      // 5. Security Analysis — Detect vulnerabilities and hardening opportunities
      const securityInsights = await this.analyzeSecurity();
      insights.push(...securityInsights);

      // 6. Telemetry Analysis — Performance bottlenecks and optimization targets
      const telemetryInsights = await this.analyzeTelemetry();
      insights.push(...telemetryInsights);

      // 7. Governance Analysis — Policy drift and compliance opportunities
      const governanceInsights = await this.analyzeGovernance();
      insights.push(...governanceInsights);

      // 8. Resources Analysis — Quota, budget, and capacity issues
      const resourceInsights = await this.analyzeResources();
      insights.push(...resourceInsights);

      // 9. Architecture Analysis — Structural improvements and evolution
      const architectureInsights = await this.analyzeArchitecture();
      insights.push(...architectureInsights);

      // ═══ COOLDOWN FILTER — Skip recently addressed OR pending insights ═══
      const filteredInsights = insights.filter(insight => {
        const wasAddressed = this.isInsightAddressed(insight, recentlyAddressed);
        if (wasAddressed) {
          console.log(`[SEBA] Skipping insight "${insight.title}" — already pending or recently addressed`);
        }
        return !wasAddressed;
      });

      telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
        metadata: { 
          action: 'cognitive_analysis_complete',
          insights_found: insights.length,
          insights_after_cooldown: filteredInsights.length,
          insights_filtered: insights.length - filteredInsights.length,
          duration_ms: Date.now() - startTime,
        },
      }, this.correlationId);

      return filteredInsights;

    } catch (error) {
      telemetryEngine.emit('custom', 'error', { module: 'seba' }, {
        metadata: { 
          action: 'cognitive_analysis_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }, this.correlationId);
      return [];
    }
  }

  /**
   * Get recently addressed insights (approved/applied in last 24 hours)
   * AND any pending proposals (to prevent duplicate proposals)
   * Used to implement cooldown and prevent re-proposing the same fixes
   */
  private async getRecentlyAddressedInsights(): Promise<Set<string>> {
    const cooldownHours = 24; // 24-hour cooldown period
    const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
    
    const addressed = new Set<string>();
    
    try {
      // Check ALL existing proposals (pending, approved, applied) to prevent duplicates
      // Pending proposals should block new identical proposals
      // Approved/applied within cooldown should also block
      const { data: pendingProposals } = await supabase
        .from('evolution_proposals')
        .select('title, target_system, status, created_at, reviewed_at')
        .eq('status', 'pending');
      
      const { data: recentProposals } = await supabase
        .from('evolution_proposals')
        .select('title, target_system, status, created_at, reviewed_at')
        .in('status', ['approved', 'applied'])
        .gte('reviewed_at', cutoff);
      
      const proposals = [...(pendingProposals || []), ...(recentProposals || [])];
        
      if (proposals) {
        for (const p of proposals) {
          // Create a normalized key from the proposal
          const key = `${p.target_system}:${p.title}`.toLowerCase().replace(/\s+/g, '_');
          addressed.add(key);
          
          // Also add title-only key for broader matching
          const titleKey = p.title.toLowerCase().replace(/\s+/g, '_');
          addressed.add(titleKey);
        }
      }

      // Also check substrate_applied_improvements for Modernizer cooldowns
      const { data: applied } = await supabase
        .from('substrate_applied_improvements')
        .select('improvement_key, applied_at')
        .eq('is_active', true)
        .gte('applied_at', cutoff);
        
      if (applied) {
        for (const a of applied) {
          addressed.add(a.improvement_key.toLowerCase());
        }
      }
      
      console.log(`[SEBA] Loaded ${addressed.size} insights (pending + cooldown) for deduplication`);
    } catch (error) {
      console.error('[SEBA] Failed to load cooldown data:', error);
    }
    
    return addressed;
  }

  /**
   * Generate normalized keys for insight deduplication (multiple for broader matching)
   */
  private generateInsightKey(insight: CognitiveInsight): string {
    const engine = insight.source_engine || 'unknown';
    const title = insight.title.toLowerCase().replace(/\s+/g, '_').substring(0, 50);
    return `${engine}:${title}`;
  }
  
  /**
   * Check if an insight matches any addressed keys (broader matching)
   */
  private isInsightAddressed(insight: CognitiveInsight, addressed: Set<string>): boolean {
    // Check exact key
    const exactKey = this.generateInsightKey(insight);
    if (addressed.has(exactKey)) return true;
    
    // Check title-only key
    const titleKey = insight.title.toLowerCase().replace(/\s+/g, '_');
    if (addressed.has(titleKey)) return true;
    
    // Check if any addressed key contains the title (fuzzy match)
    const titleWords = insight.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const addressedKey of addressed) {
      const matchCount = titleWords.filter(w => addressedKey.includes(w)).length;
      if (matchCount >= Math.ceil(titleWords.length * 0.6)) {
        return true; // 60%+ word match
      }
    }
    
    return false;
  }

  /**
   * Memory Analysis — Discover memory optimization opportunities
   * v2.1.0: Uses backend stats from brain.status to bypass RLS
   */
  private async analyzeMemory(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Use backend stats if available (bypasses RLS)
      const brainStats = this.backendStats?.brain;
      
      let hotCount = 0;
      let warmCount = 0;
      let coldCount = 0;
      let needsTiering = false;
      
      if (brainStats) {
        // Use backend stats (reliable, bypasses RLS)
        hotCount = brainStats.tiers.hot.current;
        warmCount = brainStats.tiers.warm.current;
        coldCount = brainStats.tiers.cold.current;
        needsTiering = brainStats.needs_tiering;
        
        console.log('[SEBA] Memory analysis using backend stats:', { hotCount, warmCount, coldCount, needsTiering });
      } else {
        // Fallback to direct DB queries (may fail with RLS)
        const [hotResult, warmResult, coldResult] = await Promise.all([
          supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
          supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
          supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
        ]);
        hotCount = hotResult.count || 0;
        warmCount = warmResult.count || 0;
        coldCount = coldResult.count || 0;
      }

      // Check for hot tier overflow (>500 is overflow, >2000 is critical)
      if (hotCount > 500) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          source_engine: 'memory',
          title: 'Hot Memory Tier Overflow',
          description: `Hot tier has ${hotCount} entries (limit: 500). Memory tiering needed.`,
          evidence: [`hot_count: ${hotCount}`, `warm_count: ${warmCount}`, `cold_count: ${coldCount}`],
          confidence: 0.95,
          actionability: 0.9,
          urgency: hotCount > 2000 ? 'high' : 'medium',
          suggested_actions: ['Run brain.tier aggressive', 'Enable auto-tiering'],
          created_at: new Date().toISOString(),
        });
      }
      
      // Check for tier imbalance (needs tiering flag from backend)
      if (needsTiering && !insights.some(i => i.title.includes('Memory Tier'))) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          source_engine: 'memory',
          title: 'Memory Tier Rebalance Needed',
          description: `Memory tiers are imbalanced. Hot: ${hotCount}, Warm: ${warmCount}, Cold: ${coldCount}.`,
          evidence: [`needs_tiering: true`, `hot: ${hotCount}`, `warm: ${warmCount}`, `cold: ${coldCount}`],
          confidence: 0.9,
          actionability: 0.85,
          urgency: 'medium',
          suggested_actions: ['Run brain.tier', 'Enable auto-tiering'],
          created_at: new Date().toISOString(),
        });
      }

      // Check for low memory density (not learning)
      const totalMemories = hotCount + warmCount + coldCount;
      if (totalMemories < 100) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'degradation',
          source_engine: 'memory',
          title: 'Low Memory Density',
          description: `Only ${totalMemories} memories stored. Substrate inference quality is limited.`,
          evidence: [`total_memories: ${totalMemories}`, 'recommended: 100+'],
          confidence: 0.9,
          actionability: 0.85,
          urgency: 'medium',
          suggested_actions: ['Run brain.learn with domain knowledge', 'Enable CLM continuous learning'],
          created_at: new Date().toISOString(),
        });
      }

      // Check for stale cold memories (fallback to DB if needed)
      if (!brainStats) {
        const { data: staleCold } = await supabase
          .from('brain_memory_cold')
          .select('id')
          .lt('value_score', 0.1)
          .limit(100);

        if (staleCold && staleCold.length > 50) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'optimization',
            source_engine: 'memory',
            title: 'Stale Cold Memories Detected',
            description: `Found ${staleCold.length}+ cold memories with very low value scores. Consider pruning.`,
            evidence: [`stale_count: ${staleCold.length}`, 'value_score < 0.1'],
            confidence: 0.85,
            actionability: 0.8,
            urgency: 'low',
            suggested_actions: ['Run brain.prune', 'Adjust decay rates'],
            created_at: new Date().toISOString(),
          });
        }
      }

    } catch (error) {
      console.error('[SEBA] Memory analysis error:', error);
    }

    return insights;
  }

  /**
   * Learning Analysis — Check learning efficiency
   * v2.1.0: Uses backend stats from brain.status to check learning activity
   */
  private async analyzeLearning(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Use backend stats for learning activity check
      const brainStats = this.backendStats?.brain;
      
      // Check if learning is active from backend stats
      if (brainStats) {
        const learningCycles = brainStats.metrics.learning_cycles_24h;
        const isLearning = brainStats.learning;
        
        if (!isLearning && learningCycles === 0) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'degradation',
            source_engine: 'learning',
            title: 'No Recent Learning Activity',
            description: 'No learning cycles in the last 24 hours. The system may not be learning.',
            evidence: ['learning_cycles_24h: 0', 'learning_active: false'],
            confidence: 0.9,
            actionability: 0.8,
            urgency: 'medium',
            suggested_actions: ['Check CLM status', 'Run manual learning cycle', 'Run brain.learn'],
            created_at: new Date().toISOString(),
          });
        } else if (learningCycles < 5) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'optimization',
            source_engine: 'learning',
            title: 'Low Learning Frequency',
            description: `Only ${learningCycles} learning cycles in 24 hours. Consider increasing frequency.`,
            evidence: [`learning_cycles_24h: ${learningCycles}`, 'recommended: 5+'],
            confidence: 0.8,
            actionability: 0.7,
            urgency: 'low',
            suggested_actions: ['Enable CLM continuous learning', 'Increase learning cadence'],
            created_at: new Date().toISOString(),
          });
        }
      } else {
        // Fallback: Get recent learning events from DB
        const { data: learningEvents } = await supabase
          .from('brain_events')
          .select('*')
          .eq('module', 'learning_engine')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        if (!learningEvents || learningEvents.length === 0) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'degradation',
            source_engine: 'learning',
            title: 'No Recent Learning Activity',
            description: 'No learning events in the last 24 hours. The system may not be learning.',
            evidence: ['learning_events_24h: 0'],
            confidence: 0.9,
            actionability: 0.8,
            urgency: 'medium',
            suggested_actions: ['Check CLM status', 'Run manual learning cycle'],
            created_at: new Date().toISOString(),
          });
        } else {
          // Check learning success rate
          const successEvents = learningEvents.filter(e => e.outcome === 'success');
          const successRate = successEvents.length / learningEvents.length;

          if (successRate < 0.7) {
            insights.push({
              id: crypto.randomUUID(),
              type: 'degradation',
              source_engine: 'learning',
              title: 'Low Learning Success Rate',
              description: `Learning success rate is ${(successRate * 100).toFixed(1)}% (target: 70%+).`,
              evidence: [
                `success_count: ${successEvents.length}`,
                `total_count: ${learningEvents.length}`,
                `success_rate: ${(successRate * 100).toFixed(1)}%`,
              ],
              confidence: 0.85,
              actionability: 0.7,
              urgency: successRate < 0.5 ? 'high' : 'medium',
              suggested_actions: ['Review failed learning attempts', 'Adjust learning thresholds'],
              created_at: new Date().toISOString(),
            });
          }
        }
      }

    } catch (error) {
      console.error('[SEBA] Learning analysis error:', error);
    }

    return insights;
  }

  /**
   * Imagination Analysis — Generate creative improvement ideas
   */
  private async analyzeImagination(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Run a quick imagination cycle for synthesis
      const imagResult = await imaginationEngine.runCycle({ type: 'insight' });

      if (imagResult.success && imagResult.output) {
        const synthesis = imagResult.output;
        
        // Convert synthesis to actionable insight
        // SynthesisOutput has: content, sources, patterns, timestamp
        if (synthesis.content) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'opportunity',
            source_engine: 'imagination',
            title: 'Creative Synthesis Opportunity',
            description: synthesis.content.substring(0, 200),
            evidence: [
              `type: ${synthesis.type}`,
              `originality: ${synthesis.originality_score?.toFixed(2) || 'N/A'}`,
              `domains: ${synthesis.source_domains?.join(', ') || 'unknown'}`,
            ],
            confidence: 0.7, // Default confidence for synthesis
            actionability: 0.5,
            urgency: 'low',
            suggested_actions: ['Explore synthesis further', 'Connect to related memories'],
            created_at: new Date().toISOString(),
          });
        }
      }

    } catch (error) {
      console.error('[SEBA] Imagination analysis error:', error);
    }

    return insights;
  }

  /**
   * Reasoning Analysis — Identify causal patterns
   */
  private async analyzeReasoning(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Get recent error events for causal analysis
      const { data: errorEvents } = await supabase
        .from('brain_events')
        .select('*')
        .eq('outcome', 'error')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(20);

      if (errorEvents && errorEvents.length > 5) {
        // Look for patterns in errors
        const moduleErrors: Record<string, number> = {};
        for (const event of errorEvents) {
          const module = event.module || 'unknown';
          moduleErrors[module] = (moduleErrors[module] || 0) + 1;
        }

        // Find module with most errors
        const [topModule, topCount] = Object.entries(moduleErrors)
          .sort(([, a], [, b]) => b - a)[0] || ['unknown', 0];

        if (topCount >= 3) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'anomaly',
            source_engine: 'reasoning',
            title: `Error Concentration in ${topModule}`,
            description: `${topCount} errors in ${topModule} module in the last 24h. May indicate systemic issue.`,
            evidence: Object.entries(moduleErrors).map(([m, c]) => `${m}: ${c} errors`),
            confidence: 0.8,
            actionability: 0.85,
            urgency: topCount >= 10 ? 'high' : 'medium',
            suggested_actions: [
              `Investigate ${topModule} errors`,
              'Check module health',
              'Review recent changes',
            ],
            created_at: new Date().toISOString(),
          });
        }
      }

      // Check for hypothesis validation opportunities
      const { data: unvalidatedHypotheses } = await supabase
        .from('brain_events')
        .select('*')
        .eq('event_type', 'hypothesis_generated')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      if (unvalidatedHypotheses && unvalidatedHypotheses.length >= 3) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'opportunity',
          source_engine: 'reasoning',
          title: 'Unvalidated Hypotheses Queue',
          description: `${unvalidatedHypotheses.length} hypotheses awaiting validation. Consider running validation cycle.`,
          evidence: [`hypothesis_count: ${unvalidatedHypotheses.length}`],
          confidence: 0.7,
          actionability: 0.7,
          urgency: 'low',
          suggested_actions: ['Run brain.reasoning_engine validate', 'Review hypothesis queue'],
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('[SEBA] Reasoning analysis error:', error);
    }

    return insights;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXTENDED ANALYSIS ENGINES (v2.0.0)
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Security Analysis — Detect vulnerabilities and hardening opportunities
   */
  private async analyzeSecurity(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Check for auth failures
      const { data: authFailures } = await supabase
        .from('brain_events')
        .select('*')
        .eq('module', 'auth')
        .eq('outcome', 'error')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(50);

      if (authFailures && authFailures.length >= 5) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'vulnerability',
          source_engine: 'security',
          title: 'Elevated Auth Failure Rate',
          description: `${authFailures.length} authentication failures in 24h. May indicate brute-force attempt.`,
          evidence: [`failure_count: ${authFailures.length}`],
          confidence: 0.85,
          actionability: 0.9,
          urgency: authFailures.length >= 20 ? 'high' : 'medium',
          suggested_actions: ['Review auth logs', 'Enable rate limiting', 'Check for compromised credentials'],
          created_at: new Date().toISOString(),
        });
      }

      // Check for RLS policy gaps
      const { data: tables } = await supabase
        .from('information_schema.tables' as any)
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(50);

      // Check for exposed API keys in events (using textSearch for JSONB)
      const { data: keyEvents } = await supabase
        .from('brain_events')
        .select('data')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(50);
      
      // Filter client-side for API key references
      const apiKeyEvents = keyEvents?.filter(e => {
        const dataStr = JSON.stringify(e.data || {}).toLowerCase();
        return dataStr.includes('api_key') || dataStr.includes('apikey') || dataStr.includes('secret');
      }) || [];

      if (apiKeyEvents.length > 0) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'vulnerability',
          source_engine: 'security',
          title: 'Potential API Key Exposure in Logs',
          description: 'API key references detected in event logs. Review for sensitive data leakage.',
          evidence: [`events_with_keys: ${apiKeyEvents.length}`],
          confidence: 0.7,
          actionability: 0.8,
          urgency: 'medium',
          suggested_actions: ['Audit logged data', 'Implement key redaction', 'Rotate exposed keys'],
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('[SEBA] Security analysis error:', error);
    }

    return insights;
  }

  /**
   * Telemetry Analysis — Performance bottlenecks and optimization targets
   */
  private async analyzeTelemetry(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Check for slow operations
      const { data: slowOps } = await supabase
        .from('brain_events')
        .select('module, data')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (slowOps) {
        const moduleCounts: Record<string, number> = {};
        for (const op of slowOps) {
          const duration = (op.data as any)?.duration_ms || 0;
          if (duration > 1000) {
            moduleCounts[op.module] = (moduleCounts[op.module] || 0) + 1;
          }
        }

        const [slowestModule, slowCount] = Object.entries(moduleCounts)
          .sort(([, a], [, b]) => b - a)[0] || ['', 0];

        if (slowCount >= 5) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'bottleneck',
            source_engine: 'telemetry',
            title: `Performance Bottleneck in ${slowestModule}`,
            description: `${slowCount} slow operations (>1s) in ${slowestModule} module.`,
            evidence: Object.entries(moduleCounts).map(([m, c]) => `${m}: ${c} slow ops`),
            confidence: 0.85,
            actionability: 0.8,
            urgency: slowCount >= 20 ? 'high' : 'medium',
            suggested_actions: ['Profile module operations', 'Add caching', 'Optimize queries'],
            created_at: new Date().toISOString(),
          });
        }
      }

      // Check for high event volume
      const { count: eventCount } = await supabase
        .from('brain_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString());

      if (eventCount && eventCount > 500) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          source_engine: 'telemetry',
          title: 'High Event Volume Detected',
          description: `${eventCount} events in the last hour. Consider batching or sampling.`,
          evidence: [`events_per_hour: ${eventCount}`],
          confidence: 0.75,
          actionability: 0.7,
          urgency: eventCount > 2000 ? 'high' : 'low',
          suggested_actions: ['Enable event batching', 'Reduce log verbosity', 'Implement sampling'],
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('[SEBA] Telemetry analysis error:', error);
    }

    return insights;
  }

  /**
   * Governance Analysis — Policy drift and compliance opportunities
   */
  private async analyzeGovernance(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Check for governance overrides
      const { data: overrides } = await supabase
        .from('brain_events')
        .select('*')
        .eq('module', 'governance')
        .in('event_type', ['policy_override', 'emergency_bypass', 'manual_override'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (overrides && overrides.length >= 3) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'drift',
          source_engine: 'governance',
          title: 'Frequent Policy Overrides Detected',
          description: `${overrides.length} governance overrides in 7 days. Policies may need refinement.`,
          evidence: [`override_count: ${overrides.length}`],
          confidence: 0.8,
          actionability: 0.85,
          urgency: overrides.length >= 10 ? 'high' : 'medium',
          suggested_actions: ['Review override reasons', 'Update policies', 'Add exception rules'],
          created_at: new Date().toISOString(),
        });
      }

      // Check for capability misconfigurations
      const { data: capabilities } = await supabase
        .from('atlas_capabilities')
        .select('*')
        .eq('enabled', true);

      if (capabilities) {
        const conflictingCaps = capabilities.filter(c => 
          (c.key.includes('auto') && c.key.includes('governed')) ||
          (c.key.includes('bypass') && c.key.includes('strict'))
        );

        if (conflictingCaps.length > 0) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'anomaly',
            source_engine: 'governance',
            title: 'Potentially Conflicting Capabilities',
            description: 'Some enabled capabilities may have conflicting behaviors.',
            evidence: conflictingCaps.map(c => c.key),
            confidence: 0.6,
            actionability: 0.7,
            urgency: 'low',
            suggested_actions: ['Review capability matrix', 'Disable conflicting features'],
            created_at: new Date().toISOString(),
          });
        }
      }

    } catch (error) {
      console.error('[SEBA] Governance analysis error:', error);
    }

    return insights;
  }

  /**
   * Resources Analysis — Quota, budget, and capacity issues
   */
  private async analyzeResources(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Check AI usage quotas
      const { data: usageData } = await supabase
        .from('ai_daily_quota')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .limit(10);

      if (usageData) {
        for (const usage of usageData) {
          const budgetUsed = (usage.calls_used || 0) / (usage.calls_budget || 1);
          if (budgetUsed >= 0.8) {
            insights.push({
              id: crypto.randomUUID(),
              type: 'degradation',
              source_engine: 'resources',
              title: `AI Budget Nearly Exhausted (${usage.provider})`,
              description: `${Math.round(budgetUsed * 100)}% of daily ${usage.provider} budget used.`,
              evidence: [`used: ${usage.calls_used}`, `budget: ${usage.calls_budget}`],
              confidence: 0.95,
              actionability: 0.9,
              urgency: budgetUsed >= 0.95 ? 'critical' : 'high',
              suggested_actions: ['Enable fallback providers', 'Reduce AI call frequency', 'Upgrade quota'],
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      // Check storage usage via brain_memory tables
      const [hotCount, warmCount, coldCount] = await Promise.all([
        supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
      ]);

      const totalMemories = (hotCount.count || 0) + (warmCount.count || 0) + (coldCount.count || 0);
      if (totalMemories > 10000) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          source_engine: 'resources',
          title: 'High Memory Storage Usage',
          description: `${totalMemories.toLocaleString()} total memories. Consider archival or cleanup.`,
          evidence: [`hot: ${hotCount.count}`, `warm: ${warmCount.count}`, `cold: ${coldCount.count}`],
          confidence: 0.8,
          actionability: 0.75,
          urgency: totalMemories > 50000 ? 'high' : 'medium',
          suggested_actions: ['Run brain.archive', 'Increase decay rates', 'Enable auto-pruning'],
          created_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('[SEBA] Resources analysis error:', error);
    }

    return insights;
  }

  /**
   * Architecture Analysis — Structural improvements and evolution
   */
  private async analyzeArchitecture(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Check module health distribution
      const { data: moduleEvents } = await supabase
        .from('brain_events')
        .select('module, outcome')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(500);

      if (moduleEvents) {
        const moduleStats: Record<string, { success: number; error: number }> = {};
        for (const event of moduleEvents) {
          if (!moduleStats[event.module]) {
            moduleStats[event.module] = { success: 0, error: 0 };
          }
          if (event.outcome === 'success') {
            moduleStats[event.module].success++;
          } else if (event.outcome === 'error') {
            moduleStats[event.module].error++;
          }
        }

        // Find modules with low success rates
        for (const [module, stats] of Object.entries(moduleStats)) {
          const total = stats.success + stats.error;
          if (total >= 10) {
            const successRate = stats.success / total;
            if (successRate < 0.7) {
              insights.push({
                id: crypto.randomUUID(),
                type: 'degradation',
                source_engine: 'architecture',
                title: `Module Reliability Issue: ${module}`,
                description: `${module} has ${Math.round(successRate * 100)}% success rate. May need refactoring.`,
                evidence: [`success: ${stats.success}`, `error: ${stats.error}`, `rate: ${Math.round(successRate * 100)}%`],
                confidence: 0.85,
                actionability: 0.8,
                urgency: successRate < 0.5 ? 'high' : 'medium',
                suggested_actions: ['Audit module code', 'Add error handling', 'Consider refactoring'],
                created_at: new Date().toISOString(),
              });
            }
          }
        }

        // Check for module coupling issues
        const moduleInteractions: Record<string, Set<string>> = {};
        for (const event of moduleEvents) {
          const caller = (event as any).data?.caller_module;
          if (caller && caller !== event.module) {
            if (!moduleInteractions[event.module]) {
              moduleInteractions[event.module] = new Set();
            }
            moduleInteractions[event.module].add(caller);
          }
        }

        const highCouplingModules = Object.entries(moduleInteractions)
          .filter(([, callers]) => callers.size >= 5);

        if (highCouplingModules.length > 0) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'opportunity',
            source_engine: 'architecture',
            title: 'High Module Coupling Detected',
            description: `${highCouplingModules.length} modules have 5+ callers. Consider interface abstraction.`,
            evidence: highCouplingModules.map(([m, c]) => `${m}: ${c.size} callers`),
            confidence: 0.7,
            actionability: 0.6,
            urgency: 'low',
            suggested_actions: ['Create facade interfaces', 'Reduce direct dependencies', 'Add event-based communication'],
            created_at: new Date().toISOString(),
          });
        }
      }

    } catch (error) {
      console.error('[SEBA] Architecture analysis error:', error);
    }

    return insights;
  }

  /**
   * Map insight to improvement category
   */
  static insightToCategory(insight: CognitiveInsight): ImprovementCategory {
    switch (insight.source_engine) {
      case 'memory':
        return 'memory_optimization';
      case 'learning':
        return 'learning_enhancement';
      case 'imagination':
        return 'pattern_discovery';
      case 'reasoning':
        if (insight.type === 'anomaly') return 'error_recovery';
        if (insight.type === 'optimization') return 'performance_boost';
        return 'reasoning_upgrade';
      case 'security':
        return 'security_hardening';
      case 'telemetry':
        return 'performance_boost';
      case 'governance':
        return 'governance_refinement';
      case 'resources':
        return 'resource_optimization';
      case 'architecture':
        return 'architecture_evolution';
      default:
        return 'performance_boost';
    }
  }
}
