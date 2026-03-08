/**
 * Signal Arbitration — Authority Separation
 *
 * 
 * Prevents System from redefining other modules' authority.
 * - Modules emit signals + severity only
 * - System arbitrates actions but CANNOT elevate advisory signals to veto
 *   without precedence approval
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { vetoAuthority, type VetoScope } from './veto-authority';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SignalSeverity = 'info' | 'warn' | 'alert' | 'critical';
export type ArbitrationDecision = 'acknowledged' | 'escalated' | 'acted' | 'rejected';

export interface ModuleSignal {
  id: string;
  module: string;
  severity: SignalSeverity;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface ArbitrationResult {
  signal_id: string;
  decision: ArbitrationDecision;
  action_taken?: string;
  escalated_to?: string;
  reason: string;
}

// Modules that can only emit signals (advisory)
// All 40 nodes except the 3 veto authorities (audit, defense, system)
const ADVISORY_MODULES = new Set([
  // CCR
  'brain', 'memory', 'dream',
  // OCG
  'ripple', 'access', 'identity', 'relay', 'nerve',
  // Execution
  'decode', 'encode', 'vision', 'cortex', 'nexus',
  'economy', 'sandbox', 'inclusive', 'medic', 'integration',
  // Fields
  'immunity', 'intent',
  // Plane
  'governance',
  // Kernel
  'core',
  // ESZ
  'sovereign', 'oracle', 'conscience', 'treaty',
  // EPZ
  'compass', 'echo', 'reflex',
  // EMZ
  'forge', 'lingua', 'harvest',
  // CSZ
  'evolution', 'shadow', 'phantom',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL ARBITRATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class SignalArbitrationEngine {
  private static instance: SignalArbitrationEngine;
  private signalHistory: ModuleSignal[] = [];

  private constructor() {}

  static getInstance(): SignalArbitrationEngine {
    if (!SignalArbitrationEngine.instance) {
      SignalArbitrationEngine.instance = new SignalArbitrationEngine();
    }
    return SignalArbitrationEngine.instance;
  }

  /**
   * Receive a signal from a module. Advisory modules can ONLY emit signals,
   * never trigger vetoes or automatic actions.
   */
  async receiveSignal(signal: Omit<ModuleSignal, 'id' | 'timestamp'>): Promise<ArbitrationResult> {
    const id = crypto.randomUUID();
    const fullSignal: ModuleSignal = {
      ...signal,
      id,
      timestamp: new Date().toISOString(),
    };

    this.signalHistory.push(fullSignal);
    if (this.signalHistory.length > 500) this.signalHistory = this.signalHistory.slice(-250);

    // Advisory modules: acknowledge or escalate, NEVER auto-act
    if (ADVISORY_MODULES.has(signal.module.toLowerCase())) {
      return this.handleAdvisorySignal(fullSignal);
    }

    // Veto-capable modules (audit, defense, system): may trigger action
    return this.handleAuthoritySignal(fullSignal);
  }

  private async handleAdvisorySignal(signal: ModuleSignal): Promise<ArbitrationResult> {
    // Critical signals from advisory modules get escalated, not acted upon
    if (signal.severity === 'critical') {
      await this.logArbitration(signal.id, signal.module, 'escalated',
        'Critical advisory signal escalated to governor for review');
      return {
        signal_id: signal.id,
        decision: 'escalated',
        escalated_to: 'governor',
        reason: `Advisory module "${signal.module}" emitted critical signal. Escalated — no automatic action taken.`,
      };
    }

    await this.logArbitration(signal.id, signal.module, 'acknowledged',
      `Advisory signal from ${signal.module} acknowledged`);
    return {
      signal_id: signal.id,
      decision: 'acknowledged',
      reason: `Signal from advisory module "${signal.module}" acknowledged. No action authority.`,
    };
  }

  private async handleAuthoritySignal(signal: ModuleSignal): Promise<ArbitrationResult> {
    // System cannot self-elevate advisory signals to veto
    if (signal.module.toLowerCase() === 'system' && signal.severity === 'critical') {
      // System can act within its own scope but cannot override higher authorities
      const existingVeto = vetoAuthority.isVetoed(signal.module, 'healing_actions');
      if (existingVeto && existingVeto.authority !== 'system') {
        await this.logArbitration(signal.id, signal.module, 'rejected',
          `System action blocked by ${existingVeto.authority} veto`);
        return {
          signal_id: signal.id,
          decision: 'rejected',
          reason: `System cannot override ${existingVeto.authority} veto. Precedence violation.`,
        };
      }
    }

    await this.logArbitration(signal.id, signal.module, 'acted',
      `Authority signal from ${signal.module} processed`);
    return {
      signal_id: signal.id,
      decision: 'acted',
      action_taken: `${signal.module} authority signal processed within scope`,
      reason: `Module "${signal.module}" has action authority for severity "${signal.severity}"`,
    };
  }

  /**
   * Attempt to escalate an advisory signal to a veto (requires precedence approval)
   */
  async requestEscalation(
    signalId: string,
    requestingAuthority: 'audit' | 'defense' | 'system',
    scope: VetoScope,
    target: string
  ): Promise<{ approved: boolean; reason: string }> {
    const signal = this.signalHistory.find(s => s.id === signalId);
    if (!signal) return { approved: false, reason: 'Signal not found' };

    // Only audit can escalate any signal to veto
    if (requestingAuthority !== 'audit') {
      // Defense can escalate during active threats
      if (requestingAuthority === 'defense' && signal.severity !== 'critical') {
        return { approved: false, reason: 'Defense can only escalate critical signals' };
      }
      // System cannot escalate advisory signals at all
      if (requestingAuthority === 'system') {
        return { approved: false, reason: 'System cannot escalate advisory signals to veto authority' };
      }
    }

    const result = await vetoAuthority.submitVeto({
      authority: requestingAuthority,
      scope,
      reason: `Escalated from signal ${signalId}: ${signal.message}`,
      target,
      severity: signal.severity === 'critical' ? 'critical' : 'high',
    });

    return {
      approved: result.accepted,
      reason: result.accepted
        ? `Signal escalated to veto by ${requestingAuthority}`
        : result.rejected_reason || 'Escalation denied',
    };
  }

  /**
   * Get recent signal history
   */
  getHistory(limit = 50): ModuleSignal[] {
    return this.signalHistory.slice(-limit).map(s => ({ ...s }));
  }

  private async logArbitration(signalId: string, module: string, decision: string, reason: string): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        action: `signal.${decision}`,
        entity_type: 'signal_arbitration',
        entity_id: signalId,
        details: { module, decision, reason } as unknown as Json,
      });
    } catch { /* non-blocking */ }
  }
}

export const signalArbitration = SignalArbitrationEngine.getInstance();
