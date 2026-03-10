/**
 * S-Tier 200 — Entitlement Cascade Resolver
 * ID: S-ACC03 | CJPI: 92 | Module: ACCESS
 */
export class EntitlementCascadeResolver {
  private entitlements: Map<string, { permissions: string[]; inheritsFrom?: string; overrides: string[] }> = new Map();

  define(roleId: string, permissions: string[], inheritsFrom?: string, overrides: string[] = []): void {
    this.entitlements.set(roleId, { permissions, inheritsFrom, overrides });
  }

  resolve(roleId: string): string[] {
    const visited = new Set<string>();
    const perms = new Set<string>();
    const blocked = new Set<string>();
    const walk = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const ent = this.entitlements.get(id);
      if (!ent) return;
      for (const o of ent.overrides) blocked.add(o);
      for (const p of ent.permissions) if (!blocked.has(p)) perms.add(p);
      if (ent.inheritsFrom) walk(ent.inheritsFrom);
    };
    walk(roleId);
    return [...perms];
  }
}
