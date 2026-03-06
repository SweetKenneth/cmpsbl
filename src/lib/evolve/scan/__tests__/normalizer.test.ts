/**
 * Normalizer Tests — v0.7.9 Scan → Plan Normalization
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

// Helper to create test proposals with v6.3.1 metadata
function createTestProposal(overrides: Partial<ScanProposal>): ScanProposal {
  return {
    proposal_id: 'prop_test_default',
    title: 'Test proposal',
    category: 'capability',
    description: 'Test description',
    rationale: 'Test rationale',
    risk_level: 'low',
    confidence_score: 0.85,
    requires_human: false,
    source_phases: ['llm'],
    validation_sources: 1,
    action_type: 'code_change',
    // v6.3.1 enriched metadata
    affected_modules: ['SYSTEM'],
    reversible: true,
    metadata_version: '6.3.1',
    ...overrides,
  };
}

describe('Proposal Normalization', () => {
  describe('normalizeProposals', () => {
    it('should normalize valid proposals with sufficient confidence', () => {
      const proposals: ScanProposal[] = [
        createTestProposal({
          proposal_id: 'prop_test_001',
          title: 'Add rate limiting to API module',
          category: 'security',
          description: 'Implement rate limiting for API endpoints',
          rationale: 'Prevent abuse and ensure fair usage',
          confidence_score: 0.85,
          source_phases: ['health', 'llm'],
          validation_sources: 2,
          affected_modules: ['ACCESS', 'NEXUS'],
        }),
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
        createTestProposal({
          proposal_id: 'prop_test_002',
          title: 'Maybe refactor something',
          description: 'Unclear improvement suggestion',
          rationale: 'Could be better',
          confidence_score: 0.5, // Below threshold
          validation_sources: 1,
        }),
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(false);
      expect(result.normalized_actions.length).toBe(0);
      expect(result.rejected_proposals.length).toBe(1);
      expect(result.rejected_proposals[0].rejection_code).toBe('CONFIDENCE_TOO_LOW');
      expect(result.can_create_plan).toBe(false);
    });

    it('should accept proposals with high risk level but flag as requires_human', () => {
      const proposals: ScanProposal[] = [
        createTestProposal({
          proposal_id: 'prop_test_003',
          title: 'Restructure entire database schema',
          description: 'Major schema overhaul',
          rationale: 'Better performance',
          risk_level: 'high',
          confidence_score: 0.9,
          requires_human: true,
          source_phases: ['health', 'llm'],
          validation_sources: 2,
          reversible: false,
        }),
      ];

      const result = normalizeProposals(proposals);

      // 'high' is in the allowed_risk_levels — it normalizes but requires human review
      expect(result.success).toBe(true);
      expect(result.normalized_actions.length).toBe(1);
      expect(result.normalized_actions[0].requires_human).toBe(true);
      expect(result.can_create_plan).toBe(true);
    });

    it('should handle mixed proposals - partial normalization', () => {
      const proposals: ScanProposal[] = [
        createTestProposal({
          proposal_id: 'prop_good',
          title: 'Add monitoring to brain module',
          description: 'Add observability metrics',
          rationale: 'Better debugging',
          confidence_score: 0.9,
          source_phases: ['health', 'llm'],
          validation_sources: 2,
          action_type: 'monitoring',
          affected_modules: ['BRAIN', 'VISION'],
        }),
        createTestProposal({
          proposal_id: 'prop_bad_confidence',
          title: 'Low confidence suggestion',
          description: 'Not sure',
          rationale: 'Maybe',
          confidence_score: 0.4, // Too low
          validation_sources: 1,
        }),
        createTestProposal({
          proposal_id: 'prop_high_risk',
          title: 'High risk change to system',
          category: 'hardening',
          description: 'Dangerous system change',
          rationale: 'Risky',
          risk_level: 'high', // Allowed but requires human
          confidence_score: 0.95,
          requires_human: true,
          source_phases: ['system', 'llm'],
          validation_sources: 2,
          reversible: false,
        }),
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(true);
      expect(result.normalized_actions.length).toBe(2); // good + high-risk both normalize
      expect(result.rejected_proposals.length).toBe(1); // only low-confidence rejected
      expect(result.can_create_plan).toBe(true);
      
      // Verify rejection breakdown
      expect(result.summary.rejection_breakdown.CONFIDENCE_TOO_LOW).toBe(1);
    });

    it('should block plan when all proposals are rejected', () => {
      const proposals: ScanProposal[] = [
        createTestProposal({
          proposal_id: 'prop_reject_1',
          title: 'Low confidence',
          confidence_score: 0.3,
        }),
        createTestProposal({
          proposal_id: 'prop_reject_2',
          title: 'Also low confidence',
          confidence_score: 0.2,
        }),
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
        createTestProposal({
          proposal_id: 'prop_edge',
          title: 'Fix edge function timeout',
          category: 'resilience',
          description: 'The pf-nexus-router edge function needs timeout adjustment',
          rationale: 'Improve reliability',
          confidence_score: 0.88,
          source_phases: ['edge', 'llm'],
          validation_sources: 2,
          affected_modules: ['NEXUS'],
        }),
      ];

      const result = normalizeProposals(proposals);

      expect(result.success).toBe(true);
      expect(result.normalized_actions[0].action_type).toBe('code_mutation');
      expect(result.normalized_actions[0].target_scope).toBe('module');
    });

    it('should strip decorations from descriptions', () => {
      const proposals: ScanProposal[] = [
        createTestProposal({
          proposal_id: 'prop_decorated',
          title: 'Fix brain module issue',
          category: 'resilience',
          description: '🔴 **CRITICAL** Add `error handling` [high] 🚨',
          rationale: 'Improve stability',
          risk_level: 'medium',
          confidence_score: 0.82,
          source_phases: ['system', 'llm'],
          validation_sources: 2,
          affected_modules: ['BRAIN'],
        }),
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
