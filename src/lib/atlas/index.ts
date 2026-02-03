/**
 * Atlas Control Plane
 * v7.0.0 — Centralized Governance & Execution Layer
 * 
 * Atlas is the single source of truth for:
 * - Capability toggles (SEBA, CLM, individual modules)
 * - Governed dialogue execution with mandatory dry_run previews
 * - Real-time audit logging with trace_id receipts
 * - Cross-module policy enforcement
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AtlasMode = 'autonomous' | 'advisory' | 'manual' | 'emergency';

export type CapabilityId = 
  | 'seba' 
  | 'clm' 
  | 'encoded' 
  | 'dream_eater'
  | 'evolution_engine'
  | 'nexus_routing'
  | 'defense_active'
  | 'ripple_bus'
  | 'brain_learning'
  | 'vision_metrics';

export interface CapabilityState {
  id: CapabilityId;
  enabled: boolean;
  lastToggled: string | null;
  toggledBy: 'user' | 'system' | 'seba';
  config?: Record<string, unknown>;
}

export interface AtlasState {
  mode: AtlasMode;
  capabilities: Record<CapabilityId, CapabilityState>;
  lastAuditAt: string | null;
  activeSessions: number;
  pendingApprovals: number;
  systemHealth: number;
}

export interface ActionCard {
  id: string;
  type: 'evolution' | 'config_change' | 'capability_toggle' | 'data_mutation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  reversible: boolean;
  dryRunResult?: {
    success: boolean;
    preview: string;
    affectedModules: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: string;
  expiresAt: string;
}

export interface AuditEntry {
  id: string;
  traceId: string;
  action: string;
  module: string;
  actor: 'user' | 'seba' | 'system' | 'clm';
  result: 'success' | 'failure' | 'blocked';
  metadata: Record<string, unknown>;
  secretsRedacted: boolean;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATLAS CONTROL PLANE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class AtlasControlPlane {
  private static instance: AtlasControlPlane;
  
  private state: AtlasState = {
    mode: 'advisory',
    capabilities: {
      seba: { id: 'seba', enabled: false, lastToggled: null, toggledBy: 'system' },
      clm: { id: 'clm', enabled: true, lastToggled: null, toggledBy: 'system' },
      encoded: { id: 'encoded', enabled: true, lastToggled: null, toggledBy: 'system' },
      dream_eater: { id: 'dream_eater', enabled: false, lastToggled: null, toggledBy: 'system' },
      evolution_engine: { id: 'evolution_engine', enabled: false, lastToggled: null, toggledBy: 'system' },
      nexus_routing: { id: 'nexus_routing', enabled: true, lastToggled: null, toggledBy: 'system' },
      defense_active: { id: 'defense_active', enabled: true, lastToggled: null, toggledBy: 'system' },
      ripple_bus: { id: 'ripple_bus', enabled: true, lastToggled: null, toggledBy: 'system' },
      brain_learning: { id: 'brain_learning', enabled: true, lastToggled: null, toggledBy: 'system' },
      vision_metrics: { id: 'vision_metrics', enabled: true, lastToggled: null, toggledBy: 'system' },
    },
    lastAuditAt: null,
    activeSessions: 0,
    pendingApprovals: 0,
    systemHealth: 100,
  };

  private pendingActions: ActionCard[] = [];
  private auditLog: AuditEntry[] = [];
  private readonly MAX_AUDIT_LOG = 500;

  private constructor() {}

  static getInstance(): AtlasControlPlane {
    if (!AtlasControlPlane.instance) {
      AtlasControlPlane.instance = new AtlasControlPlane();
    }
    return AtlasControlPlane.instance;
  }

  // ═══ MODE MANAGEMENT ═══

  getMode(): AtlasMode {
    return this.state.mode;
  }

  async setMode(mode: AtlasMode, actor: 'user' | 'system' = 'user'): Promise<{ success: boolean; previousMode: AtlasMode }> {
    const previousMode = this.state.mode;
    this.state.mode = mode;

    await this.audit({
      action: 'mode_change',
      module: 'atlas',
      actor,
      result: 'success',
      metadata: { previousMode, newMode: mode },
    });

    // Emit RIPPLE event
    await this.emitEvent('atlas.mode.changed', { previousMode, newMode: mode });

    return { success: true, previousMode };
  }

  // ═══ CAPABILITY MANAGEMENT ═══

  isCapabilityEnabled(id: CapabilityId): boolean {
    return this.state.capabilities[id]?.enabled ?? false;
  }

  getCapabilityState(id: CapabilityId): CapabilityState | null {
    return this.state.capabilities[id] || null;
  }

  getAllCapabilities(): Record<CapabilityId, CapabilityState> {
    return { ...this.state.capabilities };
  }

  async toggleCapability(
    id: CapabilityId, 
    enabled: boolean, 
    toggledBy: 'user' | 'system' | 'seba' = 'user'
  ): Promise<{ success: boolean; previousState: boolean }> {
    const capability = this.state.capabilities[id];
    if (!capability) {
      return { success: false, previousState: false };
    }

    const previousState = capability.enabled;
    capability.enabled = enabled;
    capability.lastToggled = new Date().toISOString();
    capability.toggledBy = toggledBy;

    await this.audit({
      action: 'capability_toggle',
      module: 'atlas',
      actor: toggledBy,
      result: 'success',
      metadata: { capabilityId: id, previousState, newState: enabled },
    });

    // Emit RIPPLE event
    await this.emitEvent('atlas.capability.toggled', { id, enabled, toggledBy });

    return { success: true, previousState };
  }

  // ═══ ACTION CARD MANAGEMENT ═══

  async createActionCard(card: Omit<ActionCard, 'id' | 'status' | 'createdAt' | 'expiresAt'>): Promise<ActionCard> {
    const actionCard: ActionCard = {
      ...card,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
    };

    this.pendingActions.push(actionCard);
    this.state.pendingApprovals = this.pendingActions.filter(a => a.status === 'pending').length;

    await this.audit({
      action: 'action_card_created',
      module: 'atlas',
      actor: 'system',
      result: 'success',
      metadata: { cardId: actionCard.id, type: actionCard.type, impact: actionCard.impact },
    });

    return actionCard;
  }

  async approveActionCard(cardId: string, actor: 'user' | 'seba' = 'user'): Promise<{ success: boolean; card?: ActionCard }> {
    const card = this.pendingActions.find(c => c.id === cardId);
    if (!card || card.status !== 'pending') {
      return { success: false };
    }

    // In advisory mode, SEBA cannot auto-approve high-impact actions
    if (this.state.mode === 'advisory' && actor === 'seba' && (card.impact === 'high' || card.impact === 'critical')) {
      await this.audit({
        action: 'action_card_blocked',
        module: 'atlas',
        actor,
        result: 'blocked',
        metadata: { cardId, reason: 'advisory_mode_seba_block' },
      });
      return { success: false };
    }

    card.status = 'approved';
    this.state.pendingApprovals = this.pendingActions.filter(a => a.status === 'pending').length;

    await this.audit({
      action: 'action_card_approved',
      module: 'atlas',
      actor,
      result: 'success',
      metadata: { cardId, type: card.type },
    });

    return { success: true, card };
  }

  async rejectActionCard(cardId: string, reason: string): Promise<{ success: boolean }> {
    const card = this.pendingActions.find(c => c.id === cardId);
    if (!card || card.status !== 'pending') {
      return { success: false };
    }

    card.status = 'rejected';
    this.state.pendingApprovals = this.pendingActions.filter(a => a.status === 'pending').length;

    await this.audit({
      action: 'action_card_rejected',
      module: 'atlas',
      actor: 'user',
      result: 'success',
      metadata: { cardId, reason },
    });

    return { success: true };
  }

  getPendingActions(): ActionCard[] {
    return this.pendingActions.filter(a => a.status === 'pending');
  }

  // ═══ DRY RUN EXECUTION ═══

  async dryRun(
    action: string,
    module: string,
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; preview: string; affectedModules: string[]; risks: string[] }> {
    const traceId = crypto.randomUUID();
    
    // Simulate execution without side effects
    const affectedModules: string[] = [module];
    const risks: string[] = [];
    let preview = `[DRY RUN] Action: ${action} on ${module}`;

    // Analyze impact
    if (action.includes('delete') || action.includes('remove')) {
      risks.push('Data deletion detected');
    }
    if (action.includes('config') || action.includes('settings')) {
      risks.push('Configuration change detected');
      affectedModules.push('system');
    }
    if (module === 'brain' || module === 'memory') {
      risks.push('Memory modification detected');
      affectedModules.push('learning_engine');
    }

    preview += `\nPayload: ${JSON.stringify(payload, null, 2)}`;
    preview += `\nAffected: ${affectedModules.join(', ')}`;
    preview += risks.length > 0 ? `\nRisks: ${risks.join(', ')}` : '\nNo risks detected';

    await this.audit({
      action: 'dry_run',
      module,
      actor: 'system',
      result: 'success',
      metadata: { traceId, action, affectedModules, risks },
    });

    return { success: true, preview, affectedModules, risks };
  }

  // ═══ AUDIT LOGGING ═══

  private async audit(entry: Omit<AuditEntry, 'id' | 'traceId' | 'secretsRedacted' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      secretsRedacted: this.redactSecrets(entry.metadata),
      timestamp: new Date().toISOString(),
    };

    this.auditLog.push(auditEntry);
    if (this.auditLog.length > this.MAX_AUDIT_LOG) {
      this.auditLog = this.auditLog.slice(-this.MAX_AUDIT_LOG);
    }

    this.state.lastAuditAt = auditEntry.timestamp;

    // Persist to database
    try {
      await supabase.from('brain_events').insert({
        module: 'atlas',
        event_type: `audit.${entry.action}`,
        data: { ...auditEntry, metadata: auditEntry.metadata } as unknown as Json,
        outcome: entry.result,
      });
    } catch {
      // Silent fail for audit persistence
    }
  }

  private redactSecrets(metadata: Record<string, unknown>): boolean {
    const secretPatterns = ['key', 'token', 'password', 'secret', 'credential'];
    let redacted = false;

    for (const key of Object.keys(metadata)) {
      if (secretPatterns.some(p => key.toLowerCase().includes(p))) {
        metadata[key] = '[REDACTED]';
        redacted = true;
      }
    }

    return redacted;
  }

  getAuditLog(limit: number = 50): AuditEntry[] {
    return this.auditLog.slice(-limit);
  }

  // ═══ RIPPLE INTEGRATION ═══

  private async emitEvent(event: string, payload: Record<string, unknown>): Promise<void> {
    try {
      // Store event in brain_events as a workaround for ripple_events schema
      await supabase.from('brain_events').insert({
        module: 'atlas',
        event_type: `ripple.${event}`,
        data: payload as unknown as Json,
        outcome: 'emitted',
      });
    } catch {
      // Silent fail - event logging is best-effort
    }
  }

  // ═══ STATE ACCESS ═══

  getState(): AtlasState {
    return { 
      ...this.state,
      pendingApprovals: this.pendingActions.filter(a => a.status === 'pending').length,
    };
  }

  async syncFromDatabase(): Promise<void> {
    // Load capability states from brain_memories if available (using it as key-value store)
    try {
      const { data } = await supabase
        .from('brain_memories')
        .select('content, metadata')
        .eq('memory_type', 'system_config')
        .eq('content', 'atlas_capabilities')
        .maybeSingle();

      if (data?.metadata) {
        const storedCaps = data.metadata as Record<string, boolean>;
        for (const [id, enabled] of Object.entries(storedCaps)) {
          if (this.state.capabilities[id as CapabilityId]) {
            this.state.capabilities[id as CapabilityId].enabled = enabled;
          }
        }
      }
    } catch {
      // Use defaults
    }
  }

  async persistToDatabase(): Promise<void> {
    const capsToStore: Record<string, boolean> = {};
    for (const [id, state] of Object.entries(this.state.capabilities)) {
      capsToStore[id] = state.enabled;
    }

    try {
      // Use brain_memories as key-value store for config
      const { data: existing } = await supabase
        .from('brain_memories')
        .select('id')
        .eq('memory_type', 'system_config')
        .eq('content', 'atlas_capabilities')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('brain_memories')
          .update({ metadata: capsToStore as unknown as Json })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('brain_memories')
          .insert({
            content: 'atlas_capabilities',
            memory_type: 'system_config',
            metadata: capsToStore as unknown as Json,
          });
      }
    } catch {
      // Silent fail
    }
  }
}

// Singleton export
export const atlas = AtlasControlPlane.getInstance();

// Re-export types
export type { AtlasControlPlane };

// Re-export capability gate system
export {
  checkGate,
  executeWithGate,
  getCapabilityConfig,
  updateCapabilityConfig,
  type ExecutionMode,
  type CapabilityConfig,
  type GateRequest,
  type GateResult,
  type ExecuteResult,
} from './capability-gate';

// React hooks
export { useAtlas, type UseAtlasReturn } from './useAtlas';

// Command Interpreter v7.2.0
export {
  atlasInterpreter,
  AtlasCommandInterpreter,
  type CommandCategory,
  type ParsedCommand,
  type CommandResult,
} from './command-interpreter';

// Version info
export const ATLAS_VERSION = '7.2.0';
export const ATLAS_CODENAME = 'Prometheus';
