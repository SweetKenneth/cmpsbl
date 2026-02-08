/**
 * Module-Specific CLM (Constant Learning Mode)
 * v8.0.0 SYNERGY+ Epoch — Specialized self-learning for each of the 14 substrate modules
 * 
 * Each module learns about:
 * - Its own performance metrics and 269 capability integrations
 * - How to improve its processing via 62 compound engines
 * - Patterns in its failures and successes across 147 synergy pipelines
 * - Cross-module optimization opportunities via 20 meta-engines
 */

import { supabase } from '@/integrations/supabase/client';
import { memoryCore } from '../memory-core';
import { learningEngine } from '../learning-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ModuleName = 
  | 'brain'
  | 'cortex'
  | 'defense'
  | 'nexus'
  | 'vision'
  | 'ripple'
  | 'access'
  | 'inclusive'
  | 'modernizer'
  | 'system'
  | 'decode'
  | 'autoblog'
  | 'encoded';

export interface ModuleLearningConfig {
  moduleId: ModuleName;
  displayName: string;
  learningTopics: string[];
  kpis: string[];
  selfReflectionPrompt: string;
}

export interface ModuleSelfAnalysis {
  id: string;
  moduleId: ModuleName;
  analysisType: 'performance' | 'improvement' | 'insight' | 'request';
  title: string;
  content: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'implemented' | 'rejected';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ModuleCLMState {
  moduleId: ModuleName;
  isLearning: boolean;
  lastLearnedAt: string | null;
  totalLearnings: number;
  improvementScore: number; // 0-100
  pendingRequests: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const MODULE_CLM_CONFIGS: Record<ModuleName, ModuleLearningConfig> = {
  brain: {
    moduleId: 'brain',
    displayName: 'BRAIN',
    learningTopics: [
      'memory tiering optimization',
      'knowledge graph density',
      'reflection quality improvement',
      'retrieval precision tuning',
    ],
    kpis: ['retrieval_precision', 'consolidation_rate', 'tier_balance', 'drift_score'],
    selfReflectionPrompt: `As the BRAIN module, analyze my recent performance:
- Memory consolidation efficiency
- Knowledge graph coherence
- Retrieval accuracy patterns
- Areas where I'm failing to remember or connect concepts
What specific improvements would make me a better memory system?`,
  },
  cortex: {
    moduleId: 'cortex',
    displayName: 'CORTEX',
    learningTopics: [
      'orchestration timing',
      'module coordination efficiency',
      'pipeline optimization',
      'cognitive load balancing',
    ],
    kpis: ['orchestration_latency', 'pipeline_success_rate', 'coordination_errors', 'chain_depth'],
    selfReflectionPrompt: `As the CORTEX orchestrator, evaluate my coordination:
- How well am I routing requests between modules?
- Are there bottlenecks in my pipelines?
- Which module chains are underperforming?
- How can I reduce latency while maintaining quality?`,
  },
  defense: {
    moduleId: 'defense',
    displayName: 'DEFENSE',
    learningTopics: [
      'threat detection patterns',
      'false positive reduction',
      'attack vector evolution',
      'response time optimization',
    ],
    kpis: ['threats_blocked', 'false_positive_rate', 'response_time_ms', 'coverage_score'],
    selfReflectionPrompt: `As the DEFENSE module, assess my security posture:
- What attack patterns am I missing?
- Are my detection rules causing too many false positives?
- How quickly am I responding to threats?
- What new threat vectors should I learn about?`,
  },
  nexus: {
    moduleId: 'nexus',
    displayName: 'NEXUS',
    learningTopics: [
      'API cost optimization',
      'cache hit rate improvement',
      'rate limiting strategies',
      'provider fallback efficiency',
    ],
    kpis: ['daily_cost_cents', 'cache_hit_rate', 'fallback_triggers', 'latency_p99'],
    selfReflectionPrompt: `As the NEXUS gateway, review my resource management:
- Am I optimizing API costs effectively?
- Where can I improve caching?
- Are my rate limits appropriate?
- Which provider routing decisions could be better?`,
  },
  vision: {
    moduleId: 'vision',
    displayName: 'VISION',
    learningTopics: [
      'dashboard responsiveness',
      'data visualization clarity',
      'insight surfacing quality',
      'real-time update efficiency',
    ],
    kpis: ['render_time_ms', 'insight_click_rate', 'update_freshness', 'user_engagement'],
    selfReflectionPrompt: `As the VISION module, evaluate my observability:
- Are my dashboards surfacing the right insights?
- Is data updating in real-time effectively?
- What visualizations are users ignoring?
- How can I make system health more transparent?`,
  },
  ripple: {
    moduleId: 'ripple',
    displayName: 'RIPPLE',
    learningTopics: [
      'integration reliability',
      'webhook delivery success',
      'third-party sync latency',
      'event propagation patterns',
    ],
    kpis: ['webhook_success_rate', 'sync_latency_ms', 'integration_uptime', 'event_throughput'],
    selfReflectionPrompt: `As the RIPPLE integration layer, analyze my connectivity:
- Which integrations are unreliable?
- Are webhooks being delivered successfully?
- Where are sync delays occurring?
- How can I improve third-party reliability?`,
  },
  access: {
    moduleId: 'access',
    displayName: 'ACCESS',
    learningTopics: [
      'authentication flow optimization',
      'permission check efficiency',
      'billing accuracy',
      'user session management',
    ],
    kpis: ['auth_success_rate', 'permission_check_ms', 'billing_errors', 'session_duration'],
    selfReflectionPrompt: `As the ACCESS control layer, review my identity management:
- Are authentication flows smooth?
- Am I checking permissions efficiently?
- Are there billing or quota edge cases I'm missing?
- How can I improve user session experience?`,
  },
  inclusive: {
    moduleId: 'inclusive',
    displayName: 'INCLUSIVE',
    learningTopics: [
      'accessibility scan accuracy',
      'WCAG compliance coverage',
      'auto-fix success rate',
      'false positive reduction',
    ],
    kpis: ['wcag_coverage', 'auto_fix_rate', 'scan_accuracy', 'false_positive_rate'],
    selfReflectionPrompt: `As the INCLUSIVE accessibility engine, assess my compliance checking:
- Am I catching all accessibility issues?
- Are my auto-fixes actually improving accessibility?
- Which WCAG criteria am I weak on?
- How can I reduce false positives?`,
  },
  modernizer: {
    moduleId: 'modernizer',
    displayName: 'MODERNIZER',
    learningTopics: [
      'evolution cycle success rates',
      'shadow apply accuracy',
      'regression detection',
      'upgrade path optimization',
    ],
    kpis: ['evolution_success_rate', 'shadow_accuracy', 'regression_catch_rate', 'upgrade_velocity'],
    selfReflectionPrompt: `As the MODERNIZER evolution engine, evaluate my upgrade capabilities:
- Are my evolution cycles succeeding?
- Is shadow mode catching regressions?
- Which upgrade patterns cause problems?
- How can I make evolution more reliable?`,
  },
  system: {
    moduleId: 'system',
    displayName: 'SYSTEM',
    learningTopics: [
      'health check accuracy',
      'incident detection speed',
      'self-healing effectiveness',
      'resource utilization optimization',
    ],
    kpis: ['uptime_pct', 'incident_mttr', 'self_heal_success', 'resource_efficiency'],
    selfReflectionPrompt: `As the SYSTEM health monitor, review my reliability:
- Am I accurately detecting system issues?
- How quickly am I identifying incidents?
- Are my self-healing actions effective?
- Where can I optimize resource usage?`,
  },
  decode: {
    moduleId: 'decode',
    displayName: 'DECODE',
    learningTopics: [
      'code analysis accuracy',
      'pattern recognition improvement',
      'suggestion quality',
      'processing speed optimization',
    ],
    kpis: ['analysis_accuracy', 'pattern_match_rate', 'suggestion_acceptance', 'process_speed_ms'],
    selfReflectionPrompt: `As the DECODE analysis engine, assess my interpretation:
- Am I accurately understanding code patterns?
- Are my suggestions being accepted?
- What patterns am I missing?
- How can I speed up processing?`,
  },
  autoblog: {
    moduleId: 'autoblog',
    displayName: 'AUTOBLOG',
    learningTopics: [
      'content quality metrics',
      'tone consistency',
      'posting cadence optimization',
      'engagement patterns',
    ],
    kpis: ['content_quality_score', 'tone_match_rate', 'posting_consistency', 'uniqueness_score'],
    selfReflectionPrompt: `As the AUTOBLOG content engine, evaluate my writing:
- Is my content quality improving?
- Am I maintaining consistent tone?
- What topics resonate best?
- How can I make content more unique?`,
  },
  encoded: {
    moduleId: 'encoded',
    displayName: 'ENCODED',
    learningTopics: [
      'TypeScript best practices for substrate',
      'React component patterns and hooks',
      'Supabase edge function architecture',
      'Code refactoring and maintainability',
      'Error handling and type safety',
      'Substrate module integration patterns',
      'Testing strategies for cognitive systems',
      'Performance optimization techniques',
    ],
    kpis: ['code_quality_score', 'ts_error_rate', 'refactor_success_rate', 'pattern_adherence'],
    selfReflectionPrompt: `As the ENCODED code writer, analyze my code generation capabilities:
- What TypeScript patterns am I using correctly vs incorrectly?
- Which substrate modules do I understand well vs struggle with?
- What common errors do I make that I should learn to avoid?
- How can I write cleaner, more maintainable code?
- What Supabase/edge function patterns should I master?
- How can I better understand the substrate architecture to make precise edits?
- What testing and validation patterns would make my code more reliable?
Provide specific examples of patterns I should learn and anti-patterns to avoid.`,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CLM CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class ModuleCLMClient {
  private static instance: ModuleCLMClient;
  private states: Map<ModuleName, ModuleCLMState> = new Map();
  private analysisCache: ModuleSelfAnalysis[] = [];

  private constructor() {
    this.initializeStates();
  }

  static getInstance(): ModuleCLMClient {
    if (!ModuleCLMClient.instance) {
      ModuleCLMClient.instance = new ModuleCLMClient();
    }
    return ModuleCLMClient.instance;
  }

  private initializeStates(): void {
    for (const moduleId of Object.keys(MODULE_CLM_CONFIGS) as ModuleName[]) {
      this.states.set(moduleId, {
        moduleId,
        isLearning: false,
        lastLearnedAt: null,
        totalLearnings: 0,
        improvementScore: 50,
        pendingRequests: 0,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELF-LEARNING CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run a self-learning cycle for a specific module
   */
  async runModuleLearning(moduleId: ModuleName): Promise<ModuleSelfAnalysis | null> {
    const config = MODULE_CLM_CONFIGS[moduleId];
    if (!config) return null;

    const state = this.states.get(moduleId);
    if (!state || state.isLearning) return null;

    state.isLearning = true;

    try {
      // 1. Gather module metrics
      const metrics = await this.gatherModuleMetrics(moduleId);

      // 2. Generate self-analysis via Nexus
      const analysis = await this.generateSelfAnalysis(config, metrics);

      // 3. Store in feed
      if (analysis) {
        await this.storeAnalysis(analysis);
        this.analysisCache.unshift(analysis);

        // Keep cache bounded
        if (this.analysisCache.length > 100) {
          this.analysisCache.pop();
        }
      }

      // 4. Update state
      state.lastLearnedAt = new Date().toISOString();
      state.totalLearnings++;
      if (analysis?.confidence) {
        state.improvementScore = Math.min(100, state.improvementScore + (analysis.confidence * 5));
      }

      return analysis;
    } catch (error) {
      console.error(`[ModuleCLM] Learning failed for ${moduleId}:`, error);
      return null;
    } finally {
      state.isLearning = false;
    }
  }

  /**
   * Run learning for all modules
   */
  async runAllModuleLearning(): Promise<ModuleSelfAnalysis[]> {
    const results: ModuleSelfAnalysis[] = [];
    
    for (const moduleId of Object.keys(MODULE_CLM_CONFIGS) as ModuleName[]) {
      const analysis = await this.runModuleLearning(moduleId);
      if (analysis) {
        results.push(analysis);
      }
      // Small delay between modules to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // METRICS GATHERING
  // ═══════════════════════════════════════════════════════════════════════════

  private async gatherModuleMetrics(moduleId: ModuleName): Promise<Record<string, any>> {
    try {
      // Get recent events for this module
      const { data: events } = await supabase
        .from('brain_events')
        .select('event_type, outcome, data, created_at')
        .eq('module', moduleId)
        .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const successCount = events?.filter(e => e.outcome === 'success').length || 0;
      const failureCount = events?.filter(e => e.outcome === 'failure').length || 0;
      const totalEvents = events?.length || 0;

      return {
        totalEvents,
        successCount,
        failureCount,
        successRate: totalEvents > 0 ? (successCount / totalEvents) * 100 : 0,
        recentEvents: events?.slice(0, 10) || [],
      };
    } catch {
      return {
        totalEvents: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        recentEvents: [],
      };
    }
  }

  private async generateSelfAnalysis(
    config: ModuleLearningConfig,
    metrics: Record<string, any>
  ): Promise<ModuleSelfAnalysis | null> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
        body: {
          prompt: `${config.selfReflectionPrompt}

Recent Performance Data:
- Total events (24h): ${metrics.totalEvents}
- Success rate: ${metrics.successRate.toFixed(1)}%
- Failures: ${metrics.failureCount}

Provide:
1. A brief title for this analysis (max 10 words)
2. Your assessment (2-3 paragraphs)
3. Specific improvement requests (bullet points)
4. Priority level (low/medium/high/critical)
5. Confidence in this analysis (0-1)

Format as JSON: { title, content, requests, priority, confidence }`,
          systemPrompt: `You are the ${config.displayName} module performing self-analysis for continuous improvement. Be specific, actionable, and honest about limitations.`,
          maxTokens: 800,
          temperature: 0.7,
          metadata: { routeKey: 'module-clm', moduleId: config.moduleId },
        },
      });

      if (error) throw error;

      const response = data?.content || data?.response || '';
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let parsed = {
        title: `${config.displayName} Self-Analysis`,
        content: response,
        requests: [],
        priority: 'medium' as const,
        confidence: 0.7,
      };

      if (jsonMatch) {
        try {
          const jsonParsed = JSON.parse(jsonMatch[0]);
          parsed = { ...parsed, ...jsonParsed };
        } catch {
          // Use defaults
        }
      }

      const analysis: ModuleSelfAnalysis = {
        id: crypto.randomUUID(),
        moduleId: config.moduleId,
        analysisType: this.determineAnalysisType(parsed.content),
        title: parsed.title,
        content: parsed.content,
        confidence: parsed.confidence,
        priority: parsed.priority,
        status: 'pending',
        metadata: {
          metrics,
          learningTopics: config.learningTopics,
          kpis: config.kpis,
          requests: parsed.requests,
        },
        createdAt: new Date().toISOString(),
      };

      return analysis;
    } catch (error) {
      console.error('[ModuleCLM] Self-analysis generation failed:', error);
      return null;
    }
  }

  private determineAnalysisType(content: string): ModuleSelfAnalysis['analysisType'] {
    const lower = content.toLowerCase();
    if (lower.includes('request') || lower.includes('need') || lower.includes('require')) {
      return 'request';
    }
    if (lower.includes('improve') || lower.includes('optimize') || lower.includes('enhance')) {
      return 'improvement';
    }
    if (lower.includes('insight') || lower.includes('discover') || lower.includes('pattern')) {
      return 'insight';
    }
    return 'performance';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════════════

  private async storeAnalysis(analysis: ModuleSelfAnalysis): Promise<void> {
    try {
      // Store in brain_reflection_log for persistence
      await supabase.from('brain_reflection_log').insert({
        content: `[${analysis.moduleId.toUpperCase()}] ${analysis.title}\n\n${analysis.content}`,
        reflection_type: `module_clm_${analysis.analysisType}`,
        insights: analysis.metadata,
        created_at: analysis.createdAt,
      });

      // Also store as memory for cross-module learning
      await memoryCore.ingest(
        `[Module CLM: ${analysis.moduleId}] ${analysis.title}\n\n${analysis.content}`,
        {
          type: 'reflection',
          source: `module_clm_${analysis.moduleId}`,
          confidence: analysis.confidence,
          tags: ['module-clm', analysis.moduleId, analysis.analysisType],
          metadata: analysis.metadata,
        }
      );
    } catch (error) {
      console.error('[ModuleCLM] Storage failed:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FEED ACCESS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get the system intelligence feed
   */
  async getFeed(limit: number = 50): Promise<ModuleSelfAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('brain_reflection_log')
        .select('*')
        .like('reflection_type', 'module_clm_%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        moduleId: this.extractModuleId(row.reflection_type),
        analysisType: this.extractAnalysisType(row.reflection_type),
        title: this.extractTitle(row.content),
        content: row.content,
        confidence: (row.insights as any)?.confidence || 0.5,
        priority: (row.insights as any)?.priority || 'medium',
        status: 'pending',
        metadata: row.insights as any || {},
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('[ModuleCLM] Failed to fetch feed:', error);
      return this.analysisCache;
    }
  }

  private extractModuleId(reflectionType: string): ModuleName {
    // reflection_type format: module_clm_MODULE_TYPE e.g., module_clm_cortex_performance
    const parts = reflectionType.replace('module_clm_', '').split('_');
    const moduleId = parts[0] as ModuleName;
    if (moduleId in MODULE_CLM_CONFIGS) {
      return moduleId;
    }
    return 'brain';
  }

  private extractAnalysisType(reflectionType: string): ModuleSelfAnalysis['analysisType'] {
    // Extract from end of reflection_type after module name
    if (reflectionType.endsWith('_request')) return 'request';
    if (reflectionType.endsWith('_improvement')) return 'improvement';
    if (reflectionType.endsWith('_insight')) return 'insight';
    return 'performance';
  }

  private extractTitle(content: string): string {
    const match = content.match(/\[[\w]+\]\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'System Analysis';
  }

  /**
   * Get state for a specific module
   */
  getModuleState(moduleId: ModuleName): ModuleCLMState | undefined {
    return this.states.get(moduleId);
  }

  /**
   * Get all module states
   */
  getAllModuleStates(): ModuleCLMState[] {
    return Array.from(this.states.values());
  }

  /**
   * Get module config
   */
  getModuleConfig(moduleId: ModuleName): ModuleLearningConfig | undefined {
    return MODULE_CLM_CONFIGS[moduleId];
  }

  /**
   * Acknowledge an analysis
   */
  async acknowledgeAnalysis(analysisId: string): Promise<void> {
    const analysis = this.analysisCache.find(a => a.id === analysisId);
    if (analysis) {
      analysis.status = 'acknowledged';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const moduleCLM = ModuleCLMClient.getInstance();
export { ModuleCLMClient };
