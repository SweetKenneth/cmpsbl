/**
 * SEBA — Self-Evolving Bounded Agent Tests
 * v1.0.0 — Full Cognitive × Evolution × Governance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sebaAgent, DEFAULT_SEBA_CONFIG } from '@/lib/substrate/seba';

// Mock Supabase client to avoid network calls
const mockChain = () => {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    lt: () => chain,
    gte: () => chain,
    order: () => chain,
    limit: () => Promise.resolve({ data: [], count: 0, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
  };
  return chain;
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => mockChain(),
    functions: {
      invoke: () => Promise.resolve({ data: { score: 100 }, error: null }),
    },
  },
}));

describe('SEBA Agent', () => {
  describe('Command Handling', () => {
    it('should return status successfully', async () => {
      const result = await sebaAgent.handleCommand('status');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('status');
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('state');
      expect(result.data).toHaveProperty('config');
    });

    it('should enable SEBA', async () => {
      const result = await sebaAgent.handleCommand('enable');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('enable');
      expect(result.message).toBe('SEBA enabled');
    });

    it('should disable SEBA', async () => {
      const result = await sebaAgent.handleCommand('disable');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('disable');
      expect(result.message).toBe('SEBA disabled');
    });

    it('should get current mode', async () => {
      const result = await sebaAgent.handleCommand('mode');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('mode');
      expect(result.data).toHaveProperty('current_mode');
    });

    it('should set valid mode', async () => {
      const result = await sebaAgent.handleCommand('mode', { mode: 'advisory' });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('advisory');
    });

    it('should reject invalid mode', async () => {
      const result = await sebaAgent.handleCommand('mode', { mode: 'invalid' as any });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid mode');
    });

    it('should prevent autonomous mode without unlock', async () => {
      const result = await sebaAgent.handleCommand('mode', { mode: 'autonomous' });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('requires explicit unlock');
    });

    it('should return unknown command error', async () => {
      const result = await sebaAgent.handleCommand('nonexistent' as any);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });
  });

  describe('Cycle Operations', () => {
    beforeEach(async () => {
      await sebaAgent.handleCommand('enable');
    });

    it('should run a cycle when enabled', async () => {
      const result = await sebaAgent.runCycle();
      
      expect(result).toBeDefined();
      expect(result.cycle_id).toBeDefined();
      expect(result.started_at).toBeDefined();
      expect(result.completed_at).toBeDefined();
      expect(result.phases_completed).toBeInstanceOf(Array);
    });

    it('should include audit log in cycle result', async () => {
      const result = await sebaAgent.runCycle();
      
      expect(result.audit_log).toBeInstanceOf(Array);
      expect(result.audit_log.length).toBeGreaterThan(0);
    });

    it('should track cycle statistics', async () => {
      await sebaAgent.runCycle();
      
      const status = await sebaAgent.handleCommand('status');
      const statusData = status.data as { state: { total_cycles: number } };
      expect(statusData.state.total_cycles).toBeGreaterThan(0);
    });
  });

  describe('Proposal Generation', () => {
    it('should run propose command', async () => {
      await sebaAgent.handleCommand('enable');
      
      const result = await sebaAgent.handleCommand('propose');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('propose');
      expect(result.data).toBeDefined();
    });

    it('should review pending proposals', async () => {
      const result = await sebaAgent.handleCommand('review');
      
      expect(result.success).toBe(true);
      expect(result.command).toBe('review');
      expect(result.data).toHaveProperty('pending_count');
    });
  });

  describe('Configuration', () => {
    it('should return config view', async () => {
      const result = await sebaAgent.handleCommand('config');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return history', async () => {
      const result = await sebaAgent.handleCommand('history', { limit: 5 });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Proposal Management', () => {
    it('should require proposal ID for approve', async () => {
      const result = await sebaAgent.handleCommand('approve');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Proposal ID required');
    });

    it('should require proposal ID for reject', async () => {
      const result = await sebaAgent.handleCommand('reject');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Proposal ID required');
    });

    it('should require proposal ID for execute', async () => {
      const result = await sebaAgent.handleCommand('execute');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Proposal ID required');
    });

    it('should require execution ID for rollback', async () => {
      const result = await sebaAgent.handleCommand('rollback');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Execution ID required');
    });
  });

  describe('Default Config', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_SEBA_CONFIG.mode).toBe('advisory');
      expect(DEFAULT_SEBA_CONFIG.enabled).toBe(true);
      expect(DEFAULT_SEBA_CONFIG.auto_approve_threshold).toBe(0.85);
      expect(DEFAULT_SEBA_CONFIG.risk_tolerance).toBe('low');
      expect(DEFAULT_SEBA_CONFIG.max_proposals_per_cycle).toBe(3);
      expect(DEFAULT_SEBA_CONFIG.require_human_approval_for_high_risk).toBe(true);
    });

    it('should have enabled categories', () => {
      expect(DEFAULT_SEBA_CONFIG.enabled_categories).toContain('memory_optimization');
      expect(DEFAULT_SEBA_CONFIG.enabled_categories).toContain('learning_enhancement');
      expect(DEFAULT_SEBA_CONFIG.enabled_categories).toContain('performance_boost');
      expect(DEFAULT_SEBA_CONFIG.enabled_categories).toContain('error_recovery');
    });
  });
});
