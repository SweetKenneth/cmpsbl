/**
 * SEBA Cognitive Analyzer
 * v1.1.0 — Full Cognitive Pipeline Integration
 * 
 * Runs the full cognitive stack to generate insights that can become
 * improvement proposals.
 */

import { memoryCore, type MemoryEntry } from '../memory-core';
import { learningEngine } from '../learning-engine';
import { imaginationEngine } from '../imagination-engine';
import { reasoningEngine } from '../reasoning-engine';
import { telemetryEngine } from '../telemetry-engine';
import { supabase } from '@/integrations/supabase/client';
import type { CognitiveInsight, ImprovementCategory } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

export class CognitiveAnalyzer {
  private correlationId: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Run full cognitive analysis to discover improvement opportunities
   * Skips insights that have recently been addressed (cooldown period)
   */
  async analyze(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];
    const startTime = Date.now();

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { action: 'cognitive_analysis_start' },
    }, this.correlationId);

    try {
      // Load recently addressed insights for deduplication
      const recentlyAddressed = await this.getRecentlyAddressedInsights();
      
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

      // ═══ COOLDOWN FILTER — Skip recently addressed insights ═══
      const filteredInsights = insights.filter(insight => {
        const insightKey = this.generateInsightKey(insight);
        const wasRecentlyAddressed = recentlyAddressed.has(insightKey);
        if (wasRecentlyAddressed) {
          console.log(`[SEBA] Skipping insight "${insight.title}" — recently addressed (cooldown)`);
        }
        return !wasRecentlyAddressed;
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
   * Used to implement cooldown and prevent re-proposing the same fixes
   */
  private async getRecentlyAddressedInsights(): Promise<Set<string>> {
    const cooldownHours = 24; // 24-hour cooldown period
    const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
    
    const addressed = new Set<string>();
    
    try {
      // Check evolution_proposals for approved/applied proposals
      const { data: proposals } = await supabase
        .from('evolution_proposals')
        .select('title, target_system, reviewed_at')
        .in('status', ['approved', 'applied'])
        .gte('reviewed_at', cutoff);
        
      if (proposals) {
        for (const p of proposals) {
          // Create a normalized key from the proposal
          const key = `${p.target_system}:${p.title}`.toLowerCase().replace(/\s+/g, '_');
          addressed.add(key);
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
      
      console.log(`[SEBA] Loaded ${addressed.size} recently addressed insights for cooldown check`);
    } catch (error) {
      console.error('[SEBA] Failed to load cooldown data:', error);
    }
    
    return addressed;
  }

  /**
   * Generate a normalized key for insight deduplication
   */
  private generateInsightKey(insight: CognitiveInsight): string {
    const engine = insight.source_engine || 'unknown';
    const title = insight.title.toLowerCase().replace(/\s+/g, '_').substring(0, 50);
    return `${engine}:${title}`;
  }

  /**
   * Memory Analysis — Discover memory optimization opportunities
   */
  private async analyzeMemory(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Get memory tier stats
      const [hotResult, warmResult, coldResult] = await Promise.all([
        supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
      ]);

      const hotCount = hotResult.count || 0;
      const warmCount = warmResult.count || 0;
      const coldCount = coldResult.count || 0;

      // Check for hot tier overflow
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

      // Check for stale cold memories
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

      // Check for memory access patterns
      const { data: recentAccess } = await supabase
        .from('brain_memory_hot')
        .select('access_count')
        .order('access_count', { ascending: false })
        .limit(10);

      if (recentAccess && recentAccess.length > 0) {
        const maxAccess = recentAccess[0]?.access_count || 0;
        const avgAccess = recentAccess.reduce((a, m) => a + (m.access_count || 0), 0) / recentAccess.length;

        if (maxAccess > avgAccess * 10) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'pattern',
            source_engine: 'memory',
            title: 'Hot Memory Access Concentration',
            description: 'A small number of memories are accessed much more frequently than others.',
            evidence: [`max_access: ${maxAccess}`, `avg_access: ${avgAccess.toFixed(1)}`],
            confidence: 0.75,
            actionability: 0.6,
            urgency: 'low',
            suggested_actions: ['Consider caching hot paths', 'Analyze frequently accessed content'],
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
   */
  private async analyzeLearning(): Promise<CognitiveInsight[]> {
    const insights: CognitiveInsight[] = [];

    try {
      // Get recent learning events
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
      default:
        return 'performance_boost';
    }
  }
}
