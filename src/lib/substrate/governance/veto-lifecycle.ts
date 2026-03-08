/**
 * Veto Lifecycle — Decay & Reevaluation
 *
 * 
 * Prevents permanent or zombie vetoes:
 * - Audit vetoes: no auto-expiry (human-only lifecycle)
 * - Defense vetoes: entropy-conditional expiry
 * - System vetoes: reevaluate on entropy gradient reversal
 * 
 * All transitions logged to audit.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { VetoRequest } from './veto-authority';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VetoLifecycleState = 'active' | 'decaying' | 'reevaluating' | 'expired' | 'revoked';

export interface VetoLifecycleEntry {
  vetoId: string;
  authority: string;
  state: VetoLifecycleState;
  created_at: string;
  last_evaluated_at: string;
  entropy_at_creation: number;
  current_entropy: number;
  decay_progress: number; // 0.0 – 1.0, where 1.0 = fully decayed
  ttl_ms: number | null;  // null = no auto-expiry
}

export interface EntropySnapshot {
  value: number;
  gradient: number; // positive = rising, negative = falling
  timestamp: string;
}

// Decay rules per authority
const DECAY_RULES: Record<string, {
  auto_expiry: boolean;
  max_ttl_ms: number | null;
  entropy_threshold: number;
}> = {
  audit: {
    auto_expiry: false,
    max_ttl_ms: null,
    entropy_threshold: Infinity, // never auto-expires
  },
  defense: {
    auto_expiry: true,
    max_ttl_ms: 24 * 60 * 60 * 1000, // 24 hours max
    entropy_threshold: 0.3, // expires when entropy drops below 0.3
  },
  system: {
    auto_expiry: true,
    max_ttl_ms: 4 * 60 * 60 * 1000, // 4 hours max
    entropy_threshold: 0.5, // reevaluate when gradient reverses
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_LIFECYCLE_ENTRIES = 500;

class VetoLifecycleEngine {
  private static instance: VetoLifecycleEngine;
  private lifecycles: Map<string, VetoLifecycleEntry> = new Map();

  private constructor() {}

  static getInstance(): VetoLifecycleEngine {
    if (!VetoLifecycleEngine.instance) {
      VetoLifecycleEngine.instance = new VetoLifecycleEngine();
    }
    return VetoLifecycleEngine.instance;
  }

  /**
   * Register a veto for lifecycle tracking
   */
  register(veto: VetoRequest, entropy: EntropySnapshot): VetoLifecycleEntry {
    const rules = DECAY_RULES[veto.authority] || DECAY_RULES.system;

    const entry: VetoLifecycleEntry = {
      vetoId: veto.id,
      authority: veto.authority,
      state: 'active',
      created_at: veto.created_at,
      last_evaluated_at: new Date().toISOString(),
      entropy_at_creation: entropy.value,
      current_entropy: entropy.value,
      decay_progress: 0,
      ttl_ms: rules.max_ttl_ms,
    };

    this.lifecycles.set(veto.id, entry);
    return entry;
  }

  /**
   * Evaluate all active vetoes against current entropy.
   * Auto-prunes terminal entries (expired/revoked) beyond retention limit.
   * Returns list of vetoes that should be expired or reevaluated.
   */
  async evaluate(currentEntropy: EntropySnapshot): Promise<{
    expired: string[];
    reevaluating: string[];
    active: string[];
  }> {
    const expired: string[] = [];
    const reevaluating: string[] = [];
    const active: string[] = [];
    const now = Date.now();

    for (const [id, entry] of this.lifecycles) {
      if (entry.state === 'expired' || entry.state === 'revoked') continue;

      const rules = DECAY_RULES[entry.authority] || DECAY_RULES.system;
      const age = now - new Date(entry.created_at).getTime();
      entry.current_entropy = currentEntropy.value;
      entry.last_evaluated_at = new Date().toISOString();

      let newState: VetoLifecycleState = entry.state;

      // Rule 1: Audit vetoes never auto-expire
      if (entry.authority === 'audit') {
        active.push(id);
        continue;
      }

      // Rule 2: TTL expiry
      if (rules.max_ttl_ms && age > rules.max_ttl_ms) {
        newState = 'expired';
      }
      // Rule 3: Entropy-conditional expiry (defense)
      else if (entry.authority === 'defense' && currentEntropy.value < rules.entropy_threshold) {
        newState = 'expired';
      }
      // Rule 4: Gradient reversal reevaluation (system)
      else if (entry.authority === 'system' && currentEntropy.gradient < 0 && entry.entropy_at_creation > currentEntropy.value) {
        newState = 'reevaluating';
      }

      // Calculate decay progress
      if (rules.max_ttl_ms) {
        entry.decay_progress = Math.min(1, age / rules.max_ttl_ms);
      }

      // State transition
      if (newState !== entry.state) {
        const prevState = entry.state;
        entry.state = newState;
        await this.logTransition(id, entry.authority, prevState, newState, currentEntropy);
      }

      if (newState === 'expired') expired.push(id);
      else if (newState === 'reevaluating') reevaluating.push(id);
      else active.push(id);
    }

    // Auto-prune terminal entries if map exceeds retention limit
    this.pruneTerminalEntries();

    return { expired, reevaluating, active };
  }

  /**
   * Remove expired/revoked entries when map exceeds MAX_LIFECYCLE_ENTRIES.
   * Keeps the most recent terminal entries up to half the limit.
   */
  private pruneTerminalEntries(): void {
    if (this.lifecycles.size <= MAX_LIFECYCLE_ENTRIES) return;

    const terminalIds: string[] = [];
    for (const [id, entry] of this.lifecycles) {
      if (entry.state === 'expired' || entry.state === 'revoked') {
        terminalIds.push(id);
      }
    }
    // Remove oldest terminal entries (Map preserves insertion order)
    const toRemove = terminalIds.slice(0, terminalIds.length - Math.floor(MAX_LIFECYCLE_ENTRIES / 4));
    for (const id of toRemove) {
      this.lifecycles.delete(id);
    }
  }

  /**
   * Force-expire a veto (human override)
   */
  async forceExpire(vetoId: string, reason: string): Promise<boolean> {
    const entry = this.lifecycles.get(vetoId);
    if (!entry) return false;

    const prevState = entry.state;
    entry.state = 'revoked';
    entry.decay_progress = 1;

    await this.logTransition(vetoId, entry.authority, prevState, 'revoked', 
      { value: entry.current_entropy, gradient: 0, timestamp: new Date().toISOString() },
      reason);
    return true;
  }

  /**
   * Get lifecycle state for a veto (defensive copy)
   */
  getLifecycle(vetoId: string): VetoLifecycleEntry | undefined {
    const entry = this.lifecycles.get(vetoId);
    return entry ? { ...entry } : undefined;
  }

  /**
   * Get all active lifecycle entries (defensive copies)
   */
  getAll(): VetoLifecycleEntry[] {
    return Array.from(this.lifecycles.values()).map(e => ({ ...e }));
  }

  private async logTransition(
    vetoId: string, authority: string,
    from: VetoLifecycleState, to: VetoLifecycleState,
    entropy: EntropySnapshot, reason?: string
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        action: `veto.lifecycle.${to}`,
        entity_type: 'veto_lifecycle',
        entity_id: vetoId,
        details: { authority, from, to, entropy_value: entropy.value, entropy_gradient: entropy.gradient, reason } as unknown as Json,
      });
    } catch { /* non-blocking */ }
  }
}

export const vetoLifecycle = VetoLifecycleEngine.getInstance();
