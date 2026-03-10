/**
 * CLM Topic Bank
 * Curated curriculum and topic selection for Constant Learning Mode
 * 
 * Topic sources:
 * - Core curriculum (50%): Most important foundational topics
 * - Gap detection (25%): Missing coverage from recent activity
 * - Spaced repetition (15%): Items due for consolidation
 * - Deep dives (10%): Opportunistic exploration when budget permits
 */

import { supabase } from '@/integrations/supabase/client';
import { budgetGovernor } from './budget-governor';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Topic {
  id: string;
  name: string;
  category: TopicCategory;
  weight: number;
  priority: number;
  domainAnchors: string[];
  moduleRefs: string[];
  kpis: string[];
  lastStudiedAt?: string;
  confidenceLevel: number;
  studyCount: number;
  /** Mastery level 0.0-1.0 (for terminal display) */
  mastery?: number;
}

export type TopicCategory = 
  | 'core_curriculum'
  | 'gap_detection'
  | 'spaced_repetition'
  | 'deep_dive';

export interface TopicSelection {
  topic: Topic;
  source: TopicCategory;
  reason: string;
  estimatedUnits: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE CURRICULUM — MOST IMPORTANT TOPICS
// ═══════════════════════════════════════════════════════════════════════════════

const CORE_CURRICULUM: Omit<Topic, 'lastStudiedAt' | 'studyCount'>[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BRAIN — Architecture, Memory Systems, Coding Mastery (HIGH PRIORITY)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'brain-architecture-mastery',
    name: 'Substrate architecture patterns and module contracts',
    category: 'core_curriculum',
    weight: 1.0,
    priority: 1,
    domainAnchors: ['system-design', 'architecture', 'module-contracts'],
    moduleRefs: ['BRAIN', 'EVOLUTION'],
    kpis: ['module_health_score', 'contract_violations', 'architecture_coherence'],
    confidenceLevel: 0,
  },
  {
    id: 'brain-coding-patterns',
    name: 'TypeScript/React production patterns for substrate evolution',
    category: 'core_curriculum',
    weight: 0.98,
    priority: 2,
    domainAnchors: ['typescript', 'react', 'edge-functions', 'refactoring'],
    moduleRefs: ['BRAIN', 'ENCODED'],
    kpis: ['code_quality_score', 'refactor_success_rate', 'pattern_adherence'],
    confidenceLevel: 0,
  },
  {
    id: 'brain-memory-retrieval',
    name: 'Memory tiering, retrieval precision, knowledge graph density',
    category: 'core_curriculum',
    weight: 0.96,
    priority: 3,
    domainAnchors: ['memory', 'knowledge-graphs', 'retrieval', 'embeddings'],
    moduleRefs: ['BRAIN'],
    kpis: ['retrieval_precision', 'consolidation_rate', 'drift_score'],
    confidenceLevel: 0,
  },
  {
    id: 'brain-evolution-training',
    name: 'Safe code evolution: shadow-apply, diff validation, regression detection',
    category: 'core_curriculum',
    weight: 0.95,
    priority: 4,
    domainAnchors: ['evolution', 'shadow-mode', 'regression', 'code-diffs'],
    moduleRefs: ['BRAIN', 'EVOLUTION'],
    kpis: ['evolution_success_rate', 'regression_catch_rate', 'shadow_accuracy'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // DEFENSE — Security Expertise
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'defense-threat-detection',
    name: 'Advanced threat detection: IP blocking, bot signals, fingerprinting',
    category: 'core_curriculum',
    weight: 0.85,
    priority: 5,
    domainAnchors: ['security', 'threat-detection', 'ip-blocking', 'fingerprinting'],
    moduleRefs: ['DEFENSE'],
    kpis: ['threats_blocked', 'false_positive_rate', 'detection_coverage'],
    confidenceLevel: 0,
  },
  {
    id: 'defense-attack-vectors',
    name: 'Attack vector analysis: XSS, CSRF, injection, prompt injection',
    category: 'core_curriculum',
    weight: 0.84,
    priority: 6,
    domainAnchors: ['xss', 'csrf', 'injection', 'prompt-injection'],
    moduleRefs: ['DEFENSE'],
    kpis: ['vulnerability_coverage', 'attack_prevention_rate'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // NEXUS — API Cost & Routing Optimization
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'nexus-cost-optimization',
    name: 'API cost arbitrage, caching strategies, provider failover',
    category: 'core_curriculum',
    weight: 0.83,
    priority: 7,
    domainAnchors: ['cost-optimization', 'caching', 'rate-limiting', 'failover'],
    moduleRefs: ['NEXUS'],
    kpis: ['daily_cost_cents', 'cache_hit_rate', 'fallback_success_rate'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM — Reliability & Self-Healing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'system-reliability',
    name: 'Self-healing, incident detection, health monitoring patterns',
    category: 'core_curriculum',
    weight: 0.82,
    priority: 8,
    domainAnchors: ['reliability', 'monitoring', 'self-healing', 'incident-response'],
    moduleRefs: ['SYSTEM'],
    kpis: ['uptime_pct', 'incident_mttr', 'self_heal_success'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // VISION — Observability & Insight Surfacing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'vision-observability',
    name: 'Dashboard design, real-time data visualization, anomaly detection',
    category: 'core_curriculum',
    weight: 0.80,
    priority: 9,
    domainAnchors: ['observability', 'dashboards', 'anomaly-detection'],
    moduleRefs: ['VISION'],
    kpis: ['insight_click_rate', 'update_freshness', 'anomaly_precision'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS — Identity, Auth, Billing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'access-identity',
    name: 'Auth flows, RLS enforcement, quota management, session security',
    category: 'core_curriculum',
    weight: 0.79,
    priority: 10,
    domainAnchors: ['auth', 'rls', 'quotas', 'sessions'],
    moduleRefs: ['ACCESS'],
    kpis: ['auth_success_rate', 'rls_coverage', 'billing_accuracy'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // INCLUSIVE — Accessibility Mastery
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'inclusive-a11y',
    name: 'WCAG compliance, auto-fix strategies, assistive tech compatibility',
    category: 'core_curriculum',
    weight: 0.78,
    priority: 11,
    domainAnchors: ['accessibility', 'wcag', 'aria', 'screen-readers'],
    moduleRefs: ['INCLUSIVE'],
    kpis: ['wcag_coverage', 'auto_fix_rate', 'scan_accuracy'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // CORTEX — Orchestration Mastery
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cortex-orchestration',
    name: 'Pipeline optimization, module coordination, cognitive load balancing',
    category: 'core_curriculum',
    weight: 0.77,
    priority: 12,
    domainAnchors: ['orchestration', 'pipelines', 'coordination'],
    moduleRefs: ['CORTEX'],
    kpis: ['orchestration_latency', 'pipeline_success_rate', 'chain_depth'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // RIPPLE — Integration Reliability
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ripple-integrations',
    name: 'Webhook reliability, third-party sync, event propagation patterns',
    category: 'core_curriculum',
    weight: 0.76,
    priority: 13,
    domainAnchors: ['webhooks', 'integrations', 'sync', 'event-driven'],
    moduleRefs: ['RIPPLE'],
    kpis: ['webhook_success_rate', 'sync_latency_ms', 'integration_uptime'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // DECODE — Input Normalization & Contract Enforcement
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'decode-contract-enforcement',
    name: 'Input normalization, schema validation, decode contracts, shape repair',
    category: 'core_curriculum',
    weight: 0.75,
    priority: 14,
    domainAnchors: ['input-validation', 'schema', 'normalization', 'contracts'],
    moduleRefs: ['DECODE'],
    kpis: ['contract_pass_rate', 'shape_repair_success', 'invalid_input_rejection'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // ENCODE — Code Generation & Output Quality
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'encode-code-generation',
    name: 'Code generation quality, template evolution, output validation',
    category: 'core_curriculum',
    weight: 0.74,
    priority: 15,
    domainAnchors: ['codegen', 'templates', 'output-quality', 'ast'],
    moduleRefs: ['ENCODE'],
    kpis: ['generation_accuracy', 'template_reuse_rate', 'output_validation_pass'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // DREAM — Speculative Hypothesis & Consolidation
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'dream-consolidation',
    name: 'Dream cycle orchestration, memory consolidation, speculative hypothesis generation',
    category: 'core_curriculum',
    weight: 0.73,
    priority: 16,
    domainAnchors: ['consolidation', 'hypothesis', 'dream-cycles', 'synthesis'],
    moduleRefs: ['DREAM'],
    kpis: ['consolidation_quality', 'hypothesis_validation_rate', 'dream_insight_count'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // EVOLUTION — Safe Code Evolution & Shadow Apply
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'evolution-shadow-apply',
    name: 'Shadow-mode code apply, diff validation, regression prevention, safe evolution',
    category: 'core_curriculum',
    weight: 0.72,
    priority: 17,
    domainAnchors: ['shadow-apply', 'code-evolution', 'regression', 'migration'],
    moduleRefs: ['EVOLUTION'],
    kpis: ['shadow_apply_success', 'regression_catch_rate', 'evolution_safety_score'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY — Tiered Storage & Retrieval Precision
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'memory-tiering-retrieval',
    name: 'Memory tiering strategy, staleness detection, noise filtering, retrieval precision',
    category: 'core_curriculum',
    weight: 0.71,
    priority: 18,
    domainAnchors: ['memory-tiers', 'staleness', 'retrieval', 'noise-filtering'],
    moduleRefs: ['MEMORY'],
    kpis: ['retrieval_precision', 'hot_tier_utilization', 'staleness_pct', 'dedup_rate'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT — Compliance & Chain Integrity
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'audit-compliance',
    name: 'Audit chain integrity, compliance reporting, SOC2/GDPR/HIPAA patterns',
    category: 'core_curriculum',
    weight: 0.70,
    priority: 19,
    domainAnchors: ['audit', 'compliance', 'chain-integrity', 'soc2', 'gdpr'],
    moduleRefs: ['AUDIT'],
    kpis: ['chain_valid', 'compliance_coverage', 'audit_entry_count'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTITY — User Fingerprinting & Session Security
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'identity-fingerprinting',
    name: 'User identity fingerprinting, session management, context binding',
    category: 'core_curriculum',
    weight: 0.69,
    priority: 20,
    domainAnchors: ['identity', 'fingerprinting', 'sessions', 'context-binding'],
    moduleRefs: ['IDENTITY'],
    kpis: ['fingerprint_accuracy', 'session_security_score', 'context_continuity'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // ECONOMY — Cost Attribution & Resource Governance
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'economy-cost-governance',
    name: 'Cost attribution, resource governance, budget forecasting, ROI tracking',
    category: 'core_curriculum',
    weight: 0.68,
    priority: 21,
    domainAnchors: ['cost-attribution', 'budgets', 'forecasting', 'roi'],
    moduleRefs: ['ECONOMY'],
    kpis: ['cost_accuracy', 'budget_adherence', 'roi_per_module'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // RELAY — Message Routing & Event Bus Reliability
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'relay-event-routing',
    name: 'Event bus reliability, message routing, dead-letter queue management',
    category: 'core_curriculum',
    weight: 0.67,
    priority: 22,
    domainAnchors: ['event-bus', 'routing', 'dlq', 'message-delivery'],
    moduleRefs: ['RELAY'],
    kpis: ['delivery_success_rate', 'dlq_depth', 'routing_latency_ms'],
    confidenceLevel: 0,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // SANDBOX — Isolated Execution & Safe Testing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sandbox-isolation',
    name: 'Sandboxed execution, isolated testing, safe code evaluation',
    category: 'core_curriculum',
    weight: 0.66,
    priority: 23,
    domainAnchors: ['sandbox', 'isolation', 'safe-eval', 'testing'],
    moduleRefs: ['SANDBOX'],
    kpis: ['isolation_integrity', 'escape_prevention_rate', 'test_reliability'],
    confidenceLevel: 0,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC BANK CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class TopicBankClient {
  private static instance: TopicBankClient;
  private topicCache: Map<string, { topic: Topic; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): TopicBankClient {
    if (!TopicBankClient.instance) {
      TopicBankClient.instance = new TopicBankClient();
    }
    return TopicBankClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOPIC SELECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Select the next topic to study based on weighted algorithm
   */
  async selectNextTopic(spacedRepQueue: Topic[] = []): Promise<TopicSelection | null> {
    const budgetState = budgetGovernor.getState();
    
    // Micro-learning mode: only reflect, no new topics
    if (budgetState.microLearningMode) {
      return {
        topic: {
          id: 'micro-reflect',
          name: 'Quick reflection on recent learnings',
          category: 'spaced_repetition',
          weight: 0.5,
          priority: 0,
          domainAnchors: ['reflection'],
          moduleRefs: ['BRAIN'],
          kpis: ['consolidation_quality'],
          confidenceLevel: 0.5,
          studyCount: 0,
        },
        source: 'spaced_repetition',
        reason: 'Micro-learning mode: budget below 5%',
        estimatedUnits: 1,
      };
    }

    // Roll weighted random selection
    const roll = Math.random();
    let selection: TopicSelection | null = null;

    if (roll < 0.50) {
      // 50% core curriculum
      selection = await this.selectFromCoreCurriculum();
    } else if (roll < 0.75) {
      // 25% gap detection
      selection = await this.selectFromGaps();
    } else if (roll < 0.90) {
      // 15% spaced repetition
      selection = this.selectFromSpacedRepetition(spacedRepQueue);
    } else {
      // 10% deep dive (only if budget > 20%)
      if (budgetState.remainingPct > 0.20) {
        selection = await this.selectDeepDive();
      } else {
        // Fallback to curriculum
        selection = await this.selectFromCoreCurriculum();
      }
    }

    // Skip if recently processed
    if (selection && budgetGovernor.isRecentlyProcessed(selection.topic.name)) {
      // Try alternative
      selection = await this.selectFromCoreCurriculum();
    }

    return selection;
  }

  /**
   * Get all core curriculum topics
   */
  getCoreCurriculum(): Topic[] {
    return CORE_CURRICULUM.map(t => ({
      ...t,
      lastStudiedAt: undefined,
      studyCount: 0,
    }));
  }

  /**
   * Get all topics (combines curriculum with cache)
   */
  getTopics(): Topic[] {
    const curriculum = this.getCoreCurriculum();
    // Merge with any cached updates, add mastery from confidence
    return curriculum.map(topic => {
      const cached = this.topicCache.get(topic.id);
      if (cached && cached.expiresAt > Date.now()) {
        return { ...cached.topic, mastery: cached.topic.confidenceLevel };
      }
      return { ...topic, mastery: topic.confidenceLevel };
    });
  }

  /**
   * Get topic by ID
   */
  getTopic(topicId: string): Topic | null {
    const cached = this.topicCache.get(topicId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.topic;
    }

    const curriculum = CORE_CURRICULUM.find(t => t.id === topicId);
    if (curriculum) {
      return { ...curriculum, lastStudiedAt: undefined, studyCount: 0 };
    }

    return null;
  }

  /**
   * Add a custom topic to the topic bank
   */
  addTopic(name: string, category: TopicCategory = 'core_curriculum'): Topic {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const topic: Topic = {
      id,
      name,
      category,
      weight: 0.6,
      priority: 11, // Lower priority than core curriculum
      domainAnchors: [],
      moduleRefs: [],
      kpis: [],
      lastStudiedAt: undefined,
      confidenceLevel: 0,
      studyCount: 0,
      mastery: 0,
    };

    this.topicCache.set(id, {
      topic,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return topic;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION STRATEGIES
  // ═══════════════════════════════════════════════════════════════════════════

  private async selectFromCoreCurriculum(): Promise<TopicSelection | null> {
    // Get study history from brain_events
    const studyHistory = await this.getStudyHistory();
    
    // Find least-studied high-priority topic
    const curriculum = this.getCoreCurriculum();
    const withHistory = curriculum.map(topic => ({
      ...topic,
      studyCount: studyHistory.get(topic.id) || 0,
    }));

    // Sort by: priority first, then study count (ascending)
    withHistory.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.studyCount - b.studyCount;
    });

    const selected = withHistory[0];
    if (!selected) return null;

    return {
      topic: selected,
      source: 'core_curriculum',
      reason: `Priority ${selected.priority}, studied ${selected.studyCount}x`,
      estimatedUnits: Math.ceil(selected.weight * 10),
    };
  }

  private async selectFromGaps(): Promise<TopicSelection | null> {
    // Detect gaps from recent brain_events (errors, missing coverage)
    try {
      const { data: recentEvents } = await supabase
        .from('brain_events')
        .select('event_type, module, data')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 3600000).toISOString())
        .in('outcome', ['failure', 'error'])
        .limit(100);

      if (!recentEvents?.length) {
        // No gaps detected, fall back to curriculum
        return this.selectFromCoreCurriculum();
      }

      // Count failures by module
      const moduleCounts: Record<string, number> = {};
      for (const event of recentEvents) {
        const mod = event.module || 'unknown';
        moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
      }

      // Find curriculum topic matching problematic module
      const curriculum = this.getCoreCurriculum();
      const sorted = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);
      
      for (const [mod] of sorted) {
        const match = curriculum.find(t => 
          t.moduleRefs.some(m => m.toLowerCase() === mod.toLowerCase())
        );
        if (match) {
          return {
            topic: { ...match, lastStudiedAt: undefined, studyCount: 0 },
            source: 'gap_detection',
            reason: `${moduleCounts[mod]} failures in ${mod} module last 7 days`,
            estimatedUnits: Math.ceil(match.weight * 12),
          };
        }
      }
    } catch {
      // Fall back to curriculum
    }

    return this.selectFromCoreCurriculum();
  }

  private selectFromSpacedRepetition(queue: Topic[]): TopicSelection | null {
    if (queue.length === 0) {
      return null;
    }

    // Sort by due date (oldest first) and confidence (lowest first)
    const sorted = [...queue].sort((a, b) => {
      const aDue = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
      const bDue = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
      if (aDue !== bDue) return aDue - bDue;
      return a.confidenceLevel - b.confidenceLevel;
    });

    const selected = sorted[0];
    return {
      topic: selected,
      source: 'spaced_repetition',
      reason: `Due for review, confidence ${(selected.confidenceLevel * 100).toFixed(0)}%`,
      estimatedUnits: Math.ceil(selected.weight * 5), // SR reviews are lighter
    };
  }

  private async selectDeepDive(): Promise<TopicSelection | null> {
    // Deep dives fetch real external knowledge from curated URL sources
    const { selectDeepDiveSource } = await import('./deep-dive-urls');
    const source = selectDeepDiveSource();

    if (source) {
      const topic: Topic = {
        id: `deep-dive-${source.module.toLowerCase()}-${Date.now()}`,
        name: `Deep dive: ${source.label} (${source.module})`,
        category: 'deep_dive',
        weight: 0.8,
        priority: 50, // Low priority, high value
        domainAnchors: [source.module.toLowerCase(), source.category],
        moduleRefs: [source.module],
        kpis: ['knowledge_breadth', 'external_coverage'],
        confidenceLevel: 0,
        studyCount: 0,
      };

      return {
        topic,
        source: 'deep_dive',
        reason: `External knowledge: ${source.label} → ${source.url}`,
        estimatedUnits: 15,
      };
    }

    // Fallback to curriculum
    const curriculum = this.getCoreCurriculum();
    const lowerHalf = curriculum.filter(t => t.priority > 5);
    if (lowerHalf.length === 0) return this.selectFromCoreCurriculum();
    const random = lowerHalf[Math.floor(Math.random() * lowerHalf.length)];
    return {
      topic: { ...random, lastStudiedAt: undefined, studyCount: 0 },
      source: 'deep_dive',
      reason: 'Opportunistic deep exploration',
      estimatedUnits: Math.ceil(random.weight * 15),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  private async getStudyHistory(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    
    try {
      const { data } = await supabase
        .from('brain_events')
        .select('data')
        .eq('event_type', 'clm_job_finished')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 3600000).toISOString());

      for (const event of data || []) {
        const topicId = (event.data as any)?.topic_id;
        if (topicId) {
          counts.set(topicId, (counts.get(topicId) || 0) + 1);
        }
      }
    } catch {
      // Return empty counts
    }

    return counts;
  }

  /**
   * Record that a topic was studied
   */
  async recordStudy(topicId: string, confidence: number): Promise<void> {
    const topic = this.getTopic(topicId);
    if (topic) {
      this.topicCache.set(topicId, {
        topic: {
          ...topic,
          lastStudiedAt: new Date().toISOString(),
          studyCount: topic.studyCount + 1,
          confidenceLevel: confidence,
        },
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const topicBank = TopicBankClient.getInstance();
export { TopicBankClient, CORE_CURRICULUM };
