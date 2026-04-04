/**
 * S-Tier 200 — Entitlement Cascade Resolver
 * ID: S-ACC03 | CJPI: 92 | Module: ACCESS
 *
 * Resolves permission hierarchies with inheritance chains, override
 * blocking, conditional entitlements, and audit trail generation.
 */

export interface EntitlementDef {
  roleId: string;
  permissions: string[];
  inheritsFrom?: string;
  overrides: string[];
  conditions?: Record<string, unknown>;
}

export interface CascadeResolvedEntitlement {
  roleId: string;
  effectivePermissions: string[];
  inheritanceChain: string[];
  blockedPermissions: string[];
  resolvedAt: string;
}

export class EntitlementCascadeResolver {
  private entitlements: Map<string, EntitlementDef> = new Map();
  private resolveCache: Map<string, ResolvedEntitlement> = new Map();
  private auditLog: { roleId: string; action: string; timestamp: string }[] = [];

  define(roleId: string, permissions: string[], inheritsFrom?: string, overrides: string[] = [], conditions?: Record<string, unknown>): void {
    this.entitlements.set(roleId, { roleId, permissions, inheritsFrom, overrides, conditions });
    this.resolveCache.delete(roleId); // Invalidate cache
  }

  resolve(roleId: string): string[] {
    const result = this.resolveWithDetails(roleId);
    return result.effectivePermissions;
  }

  resolveWithDetails(roleId: string): ResolvedEntitlement {
    const cached = this.resolveCache.get(roleId);
    if (cached) return cached;

    const visited = new Set<string>();
    const perms = new Set<string>();
    const blocked = new Set<string>();
    const chain: string[] = [];

    const walk = (id: string): void => {
      if (visited.has(id)) return; // Prevent circular inheritance
      visited.add(id);
      chain.push(id);

      const ent = this.entitlements.get(id);
      if (!ent) return;

      for (const o of ent.overrides) blocked.add(o);
      for (const p of ent.permissions) {
        if (!blocked.has(p)) perms.add(p);
      }
      if (ent.inheritsFrom) walk(ent.inheritsFrom);
    };

    walk(roleId);

    const result: ResolvedEntitlement = {
      roleId,
      effectivePermissions: [...perms],
      inheritanceChain: chain,
      blockedPermissions: [...blocked],
      resolvedAt: new Date().toISOString(),
    };

    this.resolveCache.set(roleId, result);
    this.auditLog.push({ roleId, action: 'resolved', timestamp: result.resolvedAt });
    if (this.auditLog.length > 500) this.auditLog.shift();

    return result;
  }

  hasPermission(roleId: string, permission: string): boolean {
    return this.resolve(roleId).includes(permission);
  }

  checkPermissions(roleId: string, required: string[]): { granted: boolean; missing: string[] } {
    const effective = new Set(this.resolve(roleId));
    const missing = required.filter(p => !effective.has(p));
    return { granted: missing.length === 0, missing };
  }

  getInheritanceDepth(roleId: string): number {
    return this.resolveWithDetails(roleId).inheritanceChain.length;
  }

  detectCircularInheritance(): string[][] {
    const cycles: string[][] = [];
    for (const roleId of this.entitlements.keys()) {
      const visited: string[] = [];
      let current: string | undefined = roleId;
      const seen = new Set<string>();

      while (current) {
        if (seen.has(current)) {
          const cycleStart = visited.indexOf(current);
          cycles.push(visited.slice(cycleStart));
          break;
        }
        seen.add(current);
        visited.push(current);
        current = this.entitlements.get(current)?.inheritsFrom;
      }
    }
    return cycles;
  }

  getRoles(): string[] {
    return [...this.entitlements.keys()];
  }

  getStats(): { roles: number; totalPermissions: number; avgInheritanceDepth: number; circularRefs: number } {
    const roles = [...this.entitlements.keys()];
    const depths = roles.map(r => this.getInheritanceDepth(r));
    const avgDepth = depths.length > 0 ? depths.reduce((s, d) => s + d, 0) / depths.length : 0;
    const allPerms = new Set(roles.flatMap(r => this.resolve(r)));
    return { roles: roles.length, totalPermissions: allPerms.size, avgInheritanceDepth: avgDepth, circularRefs: this.detectCircularInheritance().length };
  }

  reset(): void {
    this.entitlements.clear();
    this.resolveCache.clear();
    this.auditLog = [];
  }
}
