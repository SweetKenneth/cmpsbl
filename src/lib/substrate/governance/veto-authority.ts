/**
 * Veto Authority — Precedence Stack
 * 
 * Defines and enforces deterministic veto precedence across modules.
 * Precedence order:
 *   1. AUDIT   — absolute, human-only override
 *   2. DEFENSE — dominant during active threat
 *   3. SYSTEM  — conditional, self-healing control
 *   4. Others  — advisory only, cannot veto
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VetoAuthority = 'audit' | 'defense' | 'system';
export type AdvisoryModule = string; // any non-veto module

export interface VetoRequest {
  id: string;
  authority: VetoAuthority | AdvisoryModule;
  scope: VetoScope;
  reason: string;
  target: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

export type VetoScope =
  | 'healing_actions'
  | 'routing_changes'
  | 'scaling_operations'
  | 'write_access'
  | 'external_integrations';

export interface VetoResolution {
  accepted: boolean;
  winning_authority?: VetoAuthority;
  rejected_reason?: string;
  precedence_rank: number;
}

const PRECEDENCE_ORDER: Record<VetoAuthority, number> = {
  audit: 1,
  defense: 2,
  system: 3,
};

const VETO_AUTHORITIES = new Set<VetoAuthority>(['audit', 'defense', 'system']);

// ═══════════════════════════════════════════════════════════════════════════════
// VETO AUTHORITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class VetoAuthorityEngine {
  private static instance: VetoAuthorityEngine;
  private activeVetoes: Map<string, VetoRequest> = new Map();

  private constructor() {}

  static getInstance(): VetoAuthorityEngine {
    if (!VetoAuthorityEngine.instance) {
      VetoAuthorityEngine.instance = new VetoAuthorityEngine();
    }
    return VetoAuthorityEngine.instance;
  }

  /**
   * Prune expired vetoes from the active set.
   * Called automatically before reads to ensure no stale entries are returned.
   */
  private pruneExpired(): void {
    const now = new Date().toISOString();
    for (const [id, veto] of this.activeVetoes) {
      if (veto.expires_at && veto.expires_at < now) {
        this.activeVetoes.delete(id);
      }
    }
  }

  /**
   * Submit a veto request. Non-authority modules are downgraded to advisory.
   */
  async submitVeto(request: Omit<VetoRequest, 'id' | 'created_at'>): Promise<VetoResolution> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Advisory modules cannot veto — reject immediately
    if (!VETO_AUTHORITIES.has(request.authority as VetoAuthority)) {
      await this.logVetoEvent(id, request.authority, 'rejected', 
        `Module "${request.authority}" has advisory-only authority. Cannot issue vetoes.`);
      return {
        accepted: false,
        rejected_reason: `Module "${request.authority}" is advisory-only. Use signal emission instead.`,
        precedence_rank: 999,
      };
    }

    const authority = request.authority as VetoAuthority;
    const scope = request.scope || 'healing_actions';

    // Prune expired before conflict check
    this.pruneExpired();

    // Check for conflicts with higher-precedence active vetoes
    const conflict = this.findConflict(authority, scope, request.target);
    if (conflict) {
      await this.logVetoEvent(id, authority, 'conflict_rejected',
        `Overridden by higher-precedence veto from ${conflict.authority} (rank ${PRECEDENCE_ORDER[conflict.authority as VetoAuthority]})`);
      return {
        accepted: false,
        winning_authority: conflict.authority as VetoAuthority,
        rejected_reason: `Conflicting veto from ${conflict.authority} takes precedence`,
        precedence_rank: PRECEDENCE_ORDER[authority],
      };
    }

    // Accept veto and override any lower-precedence conflicts
    const vetoRequest: VetoRequest = {
      id, authority, scope, created_at: now,
      reason: request.reason,
      target: request.target,
      severity: request.severity,
      metadata: request.metadata,
      expires_at: request.expires_at,
    };

    this.activeVetoes.set(id, vetoRequest);
    this.overrideLowerPrecedence(authority, scope, request.target);

    await this.logVetoEvent(id, authority, 'accepted', request.reason);

    return {
      accepted: true,
      winning_authority: authority,
      precedence_rank: PRECEDENCE_ORDER[authority],
    };
  }

  /**
   * Find conflicting veto from higher-precedence authority
   */
  private findConflict(authority: VetoAuthority, scope: VetoScope, target: string): VetoRequest | null {
    const rank = PRECEDENCE_ORDER[authority];
    for (const [, veto] of this.activeVetoes) {
      if (!VETO_AUTHORITIES.has(veto.authority as VetoAuthority)) continue;
      const vetoRank = PRECEDENCE_ORDER[veto.authority as VetoAuthority];
      if (vetoRank < rank && veto.scope === scope && veto.target === target) {
        return veto;
      }
    }
    return null;
  }

  /**
   * Override lower-precedence vetoes on same scope+target
   */
  private overrideLowerPrecedence(authority: VetoAuthority, scope: VetoScope, target: string): void {
    const rank = PRECEDENCE_ORDER[authority];
    for (const [id, veto] of this.activeVetoes) {
      if (!VETO_AUTHORITIES.has(veto.authority as VetoAuthority)) continue;
      const vetoRank = PRECEDENCE_ORDER[veto.authority as VetoAuthority];
      if (vetoRank > rank && veto.scope === scope && veto.target === target) {
        this.activeVetoes.delete(id);
      }
    }
  }

  /**
   * Get all active vetoes (defensive copies, expired entries pruned)
   */
  getActiveVetoes(): VetoRequest[] {
    this.pruneExpired();
    return Array.from(this.activeVetoes.values()).map(v => ({
      ...v,
      metadata: v.metadata ? { ...v.metadata } : undefined,
    }));
  }

  /**
   * Revoke a veto by ID (only audit authority can revoke any, others only their own)
   */
  async revokeVeto(vetoId: string, revoker: VetoAuthority): Promise<boolean> {
    const veto = this.activeVetoes.get(vetoId);
    if (!veto) return false;

    // Only audit can revoke others' vetoes
    if (veto.authority !== revoker && revoker !== 'audit') {
      return false;
    }

    this.activeVetoes.delete(vetoId);
    await this.logVetoEvent(vetoId, revoker, 'revoked', `Revoked by ${revoker}`);
    return true;
  }

  /**
   * Check if a target+scope is currently vetoed (defensive copy, expired entries pruned)
   */
  isVetoed(target: string, scope: VetoScope): VetoRequest | null {
    this.pruneExpired();
    for (const [, veto] of this.activeVetoes) {
      if (veto.target === target && veto.scope === scope) {
        return { ...veto, metadata: veto.metadata ? { ...veto.metadata } : undefined };
      }
    }
    return null;
  }

  private async logVetoEvent(vetoId: string, authority: string, outcome: string, reason: string): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        action: `veto.${outcome}`,
        entity_type: 'veto',
        entity_id: vetoId,
        details: { authority, outcome, reason } as unknown as Json,
      });
    } catch { /* non-blocking */ }
  }
}

export const vetoAuthority = VetoAuthorityEngine.getInstance();
