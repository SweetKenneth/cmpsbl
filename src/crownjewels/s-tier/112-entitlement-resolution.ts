/**
 * S-Tier 112 — Entitlement Resolution Engine
 * ID: S-93 | CJPI: 88 | Module: ATLAS
 * 
 * Hierarchical entitlement resolution with inheritance and override rules.
 */

export interface Entitlement {
  id: string;
  key: string;
  value: unknown;
  level: 'system' | 'organization' | 'team' | 'user';
  grantedTo: string;
  grantedBy: string;
  expiresAt: string | null;
  overridable: boolean;
}

export interface EntitlementQuery {
  userId: string;
  teamId?: string;
  orgId?: string;
  key: string;
}

export interface ResolvedEntitlement {
  key: string;
  value: unknown;
  effectiveLevel: string;
  inheritanceChain: string[];
  isOverridden: boolean;
}

const LEVEL_PRIORITY: Record<string, number> = {
  user: 4,
  team: 3,
  organization: 2,
  system: 1,
};

export class EntitlementResolutionEngine {
  private entitlements: Entitlement[] = [];

  grant(entitlement: Entitlement): void {
    this.entitlements.push(entitlement);
  }

  revoke(entitlementId: string): boolean {
    const idx = this.entitlements.findIndex(e => e.id === entitlementId);
    if (idx === -1) return false;
    this.entitlements.splice(idx, 1);
    return true;
  }

  resolve(query: EntitlementQuery): ResolvedEntitlement | null {
    const now = new Date();
    const candidates = this.entitlements
      .filter(e => {
        if (e.key !== query.key) return false;
        if (e.expiresAt && new Date(e.expiresAt) < now) return false;

        if (e.level === 'user' && e.grantedTo === query.userId) return true;
        if (e.level === 'team' && query.teamId && e.grantedTo === query.teamId) return true;
        if (e.level === 'organization' && query.orgId && e.grantedTo === query.orgId) return true;
        if (e.level === 'system') return true;
        return false;
      })
      .sort((a, b) => (LEVEL_PRIORITY[b.level] || 0) - (LEVEL_PRIORITY[a.level] || 0));

    if (candidates.length === 0) return null;

    const winner = candidates[0];
    return {
      key: query.key,
      value: winner.value,
      effectiveLevel: winner.level,
      inheritanceChain: candidates.map(c => `${c.level}:${c.grantedTo}`),
      isOverridden: candidates.length > 1,
    };
  }

  listForUser(userId: string): Entitlement[] {
    return this.entitlements.filter(e => e.grantedTo === userId && e.level === 'user');
  }

  getAll(): Entitlement[] { return [...this.entitlements]; }
}
