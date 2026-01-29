/**
 * Normalizer Tests — v0.7.8 Scan → Plan Normalization
 * 
 * Test coverage:
 * - Scan returns proposals → normalization succeeds → plan created
 * - Scan returns proposals → normalization fails → plan blocked
 * - LLM output only → no executable plan
 * - Mixed proposals → partial normalization allowed
 * - evolve rejects unnormalized plans
 */

// @vitest-environment jsdom
// Tests use Vitest - run with: bun run test
import { describe, it, expect } from 'vitest';
import { normalizeProposals, validateNormalizedPlan, type NormalizedAction } from '../normalizer';
import type { ScanProposal } from '../types';

describe('Proposal Normalization', () => {
  describe('normalizeProposals', () => {
    it('should normalize valid proposals with sufficient confidence', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_test_001',
          title: 'Add rate limiting to API module',
          category: 'security',
          description: 'Implement rate limiting for API endpoints',
          rationale: 'Prevent abuse and ensure fair usage',
          risk_level: 'low',
          confidence_score: 0.85,
          requires_human: false,
          source_phases: ['health', 'llm'],
          validation_sources: 2,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(true);
      expect(result.normalized_actions.length).toBe(1);
      expect(result.can_create_plan).toBe(true);
      expect(result.rejected_proposals.length).toBe(0);
      expect(result.normalized_actions[0].action_type).toBe('code_mutation');
      expect(result.normalized_actions[0].target_scope).toBe('module');
    });

    it('should reject proposals with low confidence', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_test_002',
          title: 'Maybe refactor something',
          category: 'capability',
          description: 'Unclear improvement suggestion',
          rationale: 'Could be better',
          risk_level: 'low',
          confidence_score: 0.5, // Below threshold
          requires_human: false,
          source_phases: ['llm'],
          validation_sources: 1,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(false);
      expect(result.normalized_actions.length).toBe(0);
      expect(result.rejected_proposals.length).toBe(1);
      expect(result.rejected_proposals[0].rejection_code).toBe('CONFIDENCE_TOO_LOW');
      expect(result.can_create_plan).toBe(false);
    });

    it('should reject proposals with high risk level', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_test_003',
          title: 'Restructure entire database schema',
          category: 'capability',
          description: 'Major schema overhaul',
          rationale: 'Better performance',
          risk_level: 'high', // Not allowed
          confidence_score: 0.9,
          requires_human: true,
          source_phases: ['health', 'llm'],
          validation_sources: 2,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(false);
      expect(result.rejected_proposals.length).toBe(1);
      expect(result.rejected_proposals[0].rejection_code).toBe('UNSUPPORTED_RISK_LEVEL');
      expect(result.can_create_plan).toBe(false);
    });

    it('should handle mixed proposals - partial normalization', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_good',
          title: 'Add monitoring to brain module',
          category: 'capability',
          description: 'Add observability metrics',
          rationale: 'Better debugging',
          risk_level: 'low',
          confidence_score: 0.9,
          requires_human: false,
          source_phases: ['health', 'llm'],
          validation_sources: 2,
          action_type: 'monitoring',
        },
        {
          proposal_id: 'prop_bad_confidence',
          title: 'Low confidence suggestion',
          category: 'capability',
          description: 'Not sure',
          rationale: 'Maybe',
          risk_level: 'low',
          confidence_score: 0.4, // Too low
          requires_human: false,
          source_phases: ['llm'],
          validation_sources: 1,
          action_type: 'code_change',
        },
        {
          proposal_id: 'prop_bad_risk',
          title: 'High risk change',
          category: 'hardening',
          description: 'Dangerous',
          rationale: 'Risky',
          risk_level: 'high', // Not allowed
          confidence_score: 0.95,
          requires_human: true,
          source_phases: ['system', 'llm'],
          validation_sources: 2,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(true); // At least one succeeded
      expect(result.normalized_actions.length).toBe(1);
      expect(result.rejected_proposals.length).toBe(2);
      expect(result.can_create_plan).toBe(true);
      
      // Verify rejection breakdown
      expect(result.summary.rejection_breakdown.CONFIDENCE_TOO_LOW).toBe(1);
      expect(result.summary.rejection_breakdown.UNSUPPORTED_RISK_LEVEL).toBe(1);
    });

    it('should block plan when all proposals are rejected', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_reject_1',
          title: 'Low confidence',
          category: 'capability',
          description: 'Test',
          rationale: 'Test',
          risk_level: 'low',
          confidence_score: 0.3,
          requires_human: false,
          source_phases: ['llm'],
          validation_sources: 1,
          action_type: 'code_change',
        },
        {
          proposal_id: 'prop_reject_2',
          title: 'High risk',
          category: 'capability',
          description: 'Test',
          rationale: 'Test',
          risk_level: 'high',
          confidence_score: 0.95,
          requires_human: true,
          source_phases: ['llm'],
          validation_sources: 1,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(false);
      expect(result.can_create_plan).toBe(false);
      expect(result.blocking_reason).toContain('could not be normalized');
      expect(result.normalized_actions.length).toBe(0);
    });

    it('should handle empty proposals array', () => {
      const result = normalizeProposals([]);

      expect(result.success).toBe(true);
      expect(result.normalized_actions.length).toBe(0);
      expect(result.rejected_proposals.length).toBe(0);
      expect(result.can_create_plan).toBe(false); // No actions = no plan
    });

    it('should infer correct action type from content', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_edge',
          title: 'Fix edge function timeout',
          category: 'resilience',
          description: 'The pf-nexus-router edge function needs timeout adjustment',
          rationale: 'Improve reliability',
          risk_level: 'low',
          confidence_score: 0.88,
          requires_human: false,
          source_phases: ['edge', 'llm'],
          validation_sources: 2,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(true);
      expect(result.normalized_actions[0].action_type).toBe('code_mutation');
      expect(result.normalized_actions[0].target_scope).toBe('module');
    });

    it('should strip decorations from descriptions', () => {
      const proposals: ScanProposal[] = [
        {
          proposal_id: 'prop_decorated',
          title: 'Fix brain module issue',
          category: 'resilience',
          description: '🔴 **CRITICAL** Add `error handling` [high] 🚨',
          rationale: 'Improve stability',
          risk_level: 'medium',
          confidence_score: 0.82,
          requires_human: false,
          source_phases: ['system', 'llm'],
          validation_sources: 2,
          action_type: 'code_change',
        },
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(true);
      const desc = result.normalized_actions[0].description;
      expect(desc).not.toContain('🔴');
      expect(desc).not.toContain('**');
      expect(desc).not.toContain('[high]');
    });
  });

  describe('validateNormalizedPlan', () => {
    it('should validate a properly normalized plan', () => {
      const planData = {
        normalized: true,
        actions: [
          {
            action_id: 'act_test_001',
            action_type: 'code_mutation' as const,
            target_scope: 'module' as const,
            risk_level: 'low' as const,
            confidence_score: 0.9,
            source_proposal_id: 'prop_001',
            description: 'Test action',
            requires_human: false,
            normalized_at: new Date().toISOString(),
          },
        ] as NormalizedAction[],
      };

      const result = validateNormalizedPlan(planData);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject plan not marked as normalized', () => {
      const planData = {
        normalized: false,
        actions: [
          {
            action_id: 'act_test_001',
            action_type: 'code_mutation' as const,
            target_scope: 'module' as const,
            risk_level: 'low' as const,
            confidence_score: 0.9,
            source_proposal_id: 'prop_001',
            description: 'Test action',
            requires_human: false,
            normalized_at: new Date().toISOString(),
          },
        ] as NormalizedAction[],
      };

      const result = validateNormalizedPlan(planData as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not marked as normalized');
    });

    it('should reject plan with no actions', () => {
      const planData = {
        normalized: true,
        actions: [],
      };

      const result = validateNormalizedPlan(planData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no normalized actions');
    });

    it('should reject plan with missing action fields', () => {
      const planData = {
        normalized: true,
        actions: [
          {
            action_id: 'act_incomplete',
            // Missing action_type, target_scope, confidence_score
          },
        ] as NormalizedAction[],
      };

      const result = validateNormalizedPlan(planData as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing required fields');
    });
  });
});
