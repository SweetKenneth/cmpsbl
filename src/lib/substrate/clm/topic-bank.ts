/**
 * CLM Topic Bank
 * v6.7.0 — Curated curriculum and topic selection for Constant Learning Mode
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
  {
    id: 'substrate-architecture',
    name: 'Substrate architecture coherence',
    category: 'core_curriculum',
    weight: 1.0,
    priority: 1,
    domainAnchors: ['system-design', 'architecture'],
    moduleRefs: ['CORE', 'SYSTEM', 'CORTEX'],
    kpis: ['module_health_score', 'cross_module_latency', 'contract_violations'],
    confidenceLevel: 0,
  },
  {
    id: 'nexus-economics',
    name: 'Nexus economics and budgeting',
    category: 'core_curriculum',
    weight: 0.95,
    priority: 2,
    domainAnchors: ['rate-limiting', 'cost-optimization', 'api-management'],
    moduleRefs: ['NEXUS', 'ACCESS'],
    kpis: ['daily_cost_cents', 'cache_hit_rate', 'request_shaping_efficiency'],
    confidenceLevel: 0,
  },
  {
    id: 'memory-systems',
    name: 'Memory systems and retrieval',
    category: 'core_curriculum',
    weight: 0.92,
    priority: 3,
    domainAnchors: ['memory', 'knowledge-graphs', 'retrieval'],
    moduleRefs: ['BRAIN', 'DECODE'],
    kpis: ['retrieval_precision', 'consolidation_rate', 'drift_score'],
    confidenceLevel: 0,
  },
  {
    id: 'safety-governance',
    name: 'Safety and governance enforcement',
    category: 'core_curriculum',
    weight: 0.90,
    priority: 4,
    domainAnchors: ['security', 'ethics', 'policy'],
    moduleRefs: ['DEFENSE', 'CORTEX'],
    kpis: ['policy_violations_blocked', 'injection_attempts_caught', 'governance_override_rate'],
    confidenceLevel: 0,
  },
  {
    id: 'reliability-engineering',
    name: 'Reliability and observability',
    category: 'core_curriculum',
    weight: 0.88,
    priority: 5,
    domainAnchors: ['reliability', 'monitoring', 'incident-response'],
    moduleRefs: ['SYSTEM', 'VISION'],
    kpis: ['uptime_pct', 'p99_latency_ms', 'incident_mttr_minutes'],
    confidenceLevel: 0,
  },
  {
    id: 'product-loops',
    name: 'Product engagement loops',
    category: 'core_curriculum',
    weight: 0.85,
    priority: 6,
    domainAnchors: ['product', 'engagement', 'retention'],
    moduleRefs: ['INTEGRATION'],
    kpis: ['activation_rate', 'retention_d7', 'engagement_depth'],
    confidenceLevel: 0,
  },
  {
    id: 'template-roi',
    name: 'Template ROI intelligence',
    category: 'core_curriculum',
    weight: 0.82,
    priority: 7,
    domainAnchors: ['pricing', 'conversion', 'marketplace'],
    moduleRefs: ['INTEGRATION'],
    kpis: ['template_conversion_rate', 'avg_order_value', 'churn_risk_score'],
    confidenceLevel: 0,
  },
  {
    id: 'accessibility-compliance',
    name: 'Accessibility and compliance',
    category: 'core_curriculum',
    weight: 0.80,
    priority: 8,
    domainAnchors: ['accessibility', 'wcag', 'compliance'],
    moduleRefs: ['INCLUSIVE'],
    kpis: ['wcag_score', 'automated_fix_rate', 'regression_count'],
    confidenceLevel: 0,
  },
  {
    id: 'security-posture',
    name: 'Security posture and secrets',
    category: 'core_curriculum',
    weight: 0.78,
    priority: 9,
    domainAnchors: ['security', 'secrets', 'audit'],
    moduleRefs: ['DEFENSE', 'ACCESS'],
    kpis: ['secret_exposure_incidents', 'least_privilege_violations', 'audit_log_coverage'],
    confidenceLevel: 0,
  },
  {
    id: 'self-improvement',
    name: 'Self-improvement discipline',
    category: 'core_curriculum',
    weight: 0.75,
    priority: 10,
    domainAnchors: ['evaluation', 'regression', 'improvement'],
    moduleRefs: ['MODERNIZER', 'CORTEX'],
    kpis: ['regression_detection_rate', 'shadow_apply_success_rate', 'improvement_velocity'],
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
    // Deep dives explore adjacent or advanced topics
    const curriculum = this.getCoreCurriculum();
    
    // Pick random from lower half of priority list
    const lowerHalf = curriculum.filter(t => t.priority > 5);
    if (lowerHalf.length === 0) {
      return this.selectFromCoreCurriculum();
    }

    const random = lowerHalf[Math.floor(Math.random() * lowerHalf.length)];
    return {
      topic: { ...random, lastStudiedAt: undefined, studyCount: 0 },
      source: 'deep_dive',
      reason: 'Opportunistic deep exploration',
      estimatedUnits: Math.ceil(random.weight * 15), // Deep dives use more budget
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
