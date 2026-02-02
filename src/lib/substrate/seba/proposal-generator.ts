/**
 * SEBA Proposal Generator
 * v1.1.0 — Converts Insights to Actionable Proposals
 * 
 * Takes cognitive insights and generates structured improvement proposals
 * that can be governance-gated and applied to the system.
 */

import { telemetryEngine } from '../telemetry-engine';
import { CognitiveAnalyzer } from './cognitive-analyzer';
import { 
  DEFAULT_SEBA_CONFIG,
  type CognitiveInsight, 
  type ImprovementProposal, 
  type ProposedAction,
  type ImprovementCategory,
  type RiskLevel,
  type SEBAConfig,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export class ProposalGenerator {
  private config: SEBAConfig;
  private correlationId: string;

  constructor(config: Partial<SEBAConfig> = {}, correlationId?: string) {
    this.config = { ...DEFAULT_SEBA_CONFIG, ...config };
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Generate proposals from cognitive insights
   */
  async generateProposals(insights: CognitiveInsight[]): Promise<ImprovementProposal[]> {
    const proposals: ImprovementProposal[] = [];
    
    // Filter insights by confidence and actionability
    const actionableInsights = insights.filter(insight => 
      insight.confidence >= this.config.min_confidence_for_proposal &&
      insight.actionability >= 0.5
    );

    // Sort by urgency and confidence
    const sortedInsights = actionableInsights.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.confidence - a.confidence;
    });

    // Generate proposals for top insights
    const topInsights = sortedInsights.slice(0, this.config.max_proposals_per_cycle);

    for (const insight of topInsights) {
      const category = CognitiveAnalyzer.insightToCategory(insight);
      
      // Skip if category is not enabled
      if (!this.config.enabled_categories.includes(category)) {
        continue;
      }

      const proposal = await this.createProposal(insight, category);
      if (proposal) {
        proposals.push(proposal);
      }
    }

    telemetryEngine.emit('custom', 'info', { module: 'seba' }, {
      metadata: { 
        action: 'proposals_generated',
        insights_processed: actionableInsights.length,
        proposals_created: proposals.length,
      },
    }, this.correlationId);

    return proposals;
  }

  /**
   * Create a single proposal from an insight
   */
  private async createProposal(
    insight: CognitiveInsight, 
    category: ImprovementCategory
  ): Promise<ImprovementProposal | null> {
    const proposalId = crypto.randomUUID();
    const shortId = proposalId.substring(0, 8);

    try {
      // Generate proposed actions based on insight
      const actions = this.generateActions(insight, category);
      
      if (actions.length === 0) {
        return null;
      }

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(actions, insight);

      // Calculate confidence
      const confidence = this.calculateConfidence(insight, actions);

      // Determine if human approval is required
      const requiresHumanApproval = 
        this.config.require_human_approval_for_high_risk &&
        (riskLevel === 'high' || riskLevel === 'critical');

      const proposal: ImprovementProposal = {
        id: proposalId,
        short_id: shortId,
        created_at: new Date().toISOString(),
        status: 'pending_review',
        
        category,
        title: this.generateTitle(insight, category),
        description: insight.description,
        rationale: this.generateRationale(insight),
        
        target_modules: this.extractTargetModules(insight, actions),
        estimated_impact: insight.urgency === 'critical' || insight.urgency === 'high' ? 'high' : 
                         insight.urgency === 'medium' ? 'medium' : 'low',
        risk_level: riskLevel,
        confidence_score: confidence,
        priority: insight.urgency === 'critical' ? 10 : insight.urgency === 'high' ? 7 : insight.urgency === 'medium' ? 5 : 3,
        
        proposed_actions: actions,
        rollback_strategy: this.generateRollbackStrategy(actions),
        
        requires_human_approval: requiresHumanApproval,
        
        source_insight_id: insight.id,
      };

      return proposal;

    } catch (error) {
      console.error('[SEBA] Failed to create proposal:', error);
      return null;
    }
  }

  /**
   * Generate actions based on insight type and category
   */
  private generateActions(insight: CognitiveInsight, category: ImprovementCategory): ProposedAction[] {
    const actions: ProposedAction[] = [];

    switch (category) {
      case 'memory_optimization':
        if (insight.title.includes('Overflow')) {
          actions.push({
            id: crypto.randomUUID(),
            type: 'module_tune',
            target: 'brain.memory_core.tiering',
            current_value: 'standard',
            proposed_value: 'aggressive',
            reversible: true,
            risk_factor: 0.2,
          });
        }
        if (insight.title.includes('Stale')) {
          actions.push({
            id: crypto.randomUUID(),
            type: 'memory_prune',
            target: 'brain.memory_cold',
            proposed_value: { min_score: 0.1, max_age_days: 90 },
            reversible: false,
            risk_factor: 0.3,
          });
        }
        break;

      case 'learning_enhancement':
        if (insight.title.includes('No Recent Learning')) {
          actions.push({
            id: crypto.randomUUID(),
            type: 'config_update',
            target: 'clm.enabled',
            current_value: false,
            proposed_value: true,
            reversible: true,
            risk_factor: 0.1,
          });
        }
        if (insight.title.includes('Low Learning Success')) {
          actions.push({
            id: crypto.randomUUID(),
            type: 'threshold_adjust',
            target: 'learning.confidence_threshold',
            current_value: 0.7,
            proposed_value: 0.6,
            reversible: true,
            risk_factor: 0.2,
          });
        }
        break;

      case 'error_recovery':
        if (insight.type === 'anomaly') {
          const module = insight.title.match(/in (\w+)/)?.[1] || 'unknown';
          actions.push({
            id: crypto.randomUUID(),
            type: 'module_tune',
            target: `${module}.circuit_breaker`,
            current_value: { threshold: 3 },
            proposed_value: { threshold: 5, cooldown_ms: 60000 },
            reversible: true,
            risk_factor: 0.3,
          });
        }
        break;

      case 'performance_boost':
        actions.push({
          id: crypto.randomUUID(),
          type: 'config_update',
          target: 'substrate.cache.ttl',
          current_value: 30000,
          proposed_value: 60000,
          reversible: true,
          risk_factor: 0.1,
        });
        break;

      case 'pattern_discovery':
        if (insight.type === 'opportunity') {
          actions.push({
            id: crypto.randomUUID(),
            type: 'pattern_add',
            target: 'brain.patterns',
            proposed_value: {
              pattern_type: 'synthesis',
              source: insight.source_engine,
              content: insight.description,
            },
            reversible: true,
            risk_factor: 0.1,
          });
        }
        break;

      case 'reasoning_upgrade':
        actions.push({
          id: crypto.randomUUID(),
          type: 'threshold_adjust',
          target: 'reasoning.hypothesis_confidence',
          current_value: 0.7,
          proposed_value: 0.65,
          reversible: true,
          risk_factor: 0.2,
        });
        break;

      default:
        // Generic improvement action
        actions.push({
          id: crypto.randomUUID(),
          type: 'config_update',
          target: 'substrate.optimization_level',
          current_value: 'standard',
          proposed_value: 'enhanced',
          reversible: true,
          risk_factor: 0.2,
        });
    }

    return actions;
  }

  /**
   * Calculate risk level from actions
   */
  private calculateRiskLevel(actions: ProposedAction[], insight: CognitiveInsight): RiskLevel {
    const avgRisk = actions.reduce((sum, a) => sum + a.risk_factor, 0) / actions.length;
    const hasIrreversible = actions.some(a => !a.reversible);
    
    if (avgRisk >= 0.7 || (hasIrreversible && avgRisk >= 0.4)) return 'critical';
    if (avgRisk >= 0.5 || hasIrreversible) return 'high';
    if (avgRisk >= 0.3) return 'medium';
    if (avgRisk >= 0.15) return 'low';
    return 'minimal';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(insight: CognitiveInsight, actions: ProposedAction[]): number {
    const insightConfidence = insight.confidence;
    const actionConfidence = 1 - (actions.reduce((sum, a) => sum + a.risk_factor, 0) / actions.length);
    const actionabilityFactor = insight.actionability;

    return Math.min(1, (insightConfidence * 0.5 + actionConfidence * 0.3 + actionabilityFactor * 0.2));
  }

  /**
   * Generate proposal title
   */
  private generateTitle(insight: CognitiveInsight, category: ImprovementCategory): string {
    const categoryLabels: Record<ImprovementCategory, string> = {
      memory_optimization: 'Memory Optimization',
      learning_enhancement: 'Learning Enhancement',
      reasoning_upgrade: 'Reasoning Upgrade',
      governance_refinement: 'Governance Refinement',
      performance_boost: 'Performance Boost',
      error_recovery: 'Error Recovery',
      pattern_discovery: 'Pattern Discovery',
      architecture_evolution: 'Architecture Evolution',
      security_hardening: 'Security Hardening',
      resource_optimization: 'Resource Optimization',
    };

    return `[${categoryLabels[category]}] ${insight.title}`;
  }

  /**
   * Generate rationale
   */
  private generateRationale(insight: CognitiveInsight): string {
    const parts = [
      `Source: ${insight.source_engine} engine`,
      `Type: ${insight.type}`,
      `Evidence: ${insight.evidence.slice(0, 3).join('; ')}`,
      `Urgency: ${insight.urgency}`,
    ];
    return parts.join(' | ');
  }

  /**
   * Extract target modules
   */
  private extractTargetModules(insight: CognitiveInsight, actions: ProposedAction[]): string[] {
    const modules = new Set<string>();
    modules.add(insight.source_engine);
    
    for (const action of actions) {
      const moduleName = action.target.split('.')[0];
      if (moduleName) modules.add(moduleName);
    }

    return Array.from(modules);
  }

  /**
   * Generate rollback strategy
   */
  private generateRollbackStrategy(actions: ProposedAction[]): string {
    const reversibleCount = actions.filter(a => a.reversible).length;
    const irreversibleCount = actions.length - reversibleCount;

    if (irreversibleCount === 0) {
      return `Full rollback available: ${reversibleCount} action(s) can be reverted to previous state.`;
    }

    if (irreversibleCount === actions.length) {
      return 'No rollback available: All actions are irreversible. Proceed with caution.';
    }

    return `Partial rollback: ${reversibleCount} of ${actions.length} actions are reversible.`;
  }
}
