/**
 * S-Tier 135 — Regulatory Mode Switcher
 * ID: S-CJ93 | CJPI: 86 | Module: GOVERNANCE
 * 
 * Switches between regulatory compliance modes based on jurisdiction.
 */

export interface RegulatoryMode {
  id: string;
  jurisdiction: string;
  dataResidency: string;
  retentionDays: number;
  encryptionRequired: boolean;
  consentRequired: boolean;
  auditLevel: 'basic' | 'standard' | 'strict';
  restrictions: string[];
}

export interface ModeSwitch {
  id: string;
  from: string;
  to: string;
  reason: string;
  switchedAt: string;
  affectedPolicies: string[];
}

export class RegulatoryModeSwitcher {
  private modes: Map<string, RegulatoryMode> = new Map();
  private activeMode: string | null = null;
  private history: ModeSwitch[] = [];

  registerMode(mode: RegulatoryMode): void {
    this.modes.set(mode.id, mode);
    if (!this.activeMode) this.activeMode = mode.id;
  }

  switchMode(modeId: string, reason: string): ModeSwitch | null {
    if (!this.modes.has(modeId)) return null;
    const fromId = this.activeMode || 'none';
    
    const sw: ModeSwitch = {
      id: crypto.randomUUID(),
      from: fromId,
      to: modeId,
      reason,
      switchedAt: new Date().toISOString(),
      affectedPolicies: this.diffPolicies(fromId, modeId),
    };
    this.activeMode = modeId;
    this.history.push(sw);
    return sw;
  }

  private diffPolicies(fromId: string, toId: string): string[] {
    const from = this.modes.get(fromId);
    const to = this.modes.get(toId);
    if (!from || !to) return [];

    const diffs: string[] = [];
    if (from.dataResidency !== to.dataResidency) diffs.push('data_residency');
    if (from.retentionDays !== to.retentionDays) diffs.push('retention_period');
    if (from.encryptionRequired !== to.encryptionRequired) diffs.push('encryption');
    if (from.consentRequired !== to.consentRequired) diffs.push('consent');
    if (from.auditLevel !== to.auditLevel) diffs.push('audit_level');
    return diffs;
  }

  getActiveMode(): RegulatoryMode | null {
    return this.activeMode ? this.modes.get(this.activeMode) || null : null;
  }

  getHistory(): ModeSwitch[] { return [...this.history]; }
}
