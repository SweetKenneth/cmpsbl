/**
 * Tenant Isolator — Multi-tenant resource isolation for subscriber safety
 * Ensures one tenant's failures don't impact others
 */

interface TenantQuota {
  maxRequestsPerMinute: number;
  maxConcurrent: number;
  maxMemoryMB: number;
  maxEvolutionsPerHour: number;
}

interface TenantState {
  id: string;
  quota: TenantQuota;
  active: number;
  requestsThisMinute: number;
  evolutionsThisHour: number;
  minuteReset: number;
  hourReset: number;
  violations: number;
  suspended: boolean;
}

const tenants = new Map<string, TenantState>();
const MAX_TENANTS = 500;

const DEFAULT_QUOTA: TenantQuota = {
  maxRequestsPerMinute: 60,
  maxConcurrent: 5,
  maxMemoryMB: 50,
  maxEvolutionsPerHour: 10,
};

function ensureTenant(id: string): TenantState {
  if (!tenants.has(id)) {
    // Evict oldest inactive tenant if at cap
    if (tenants.size >= MAX_TENANTS) {
      let oldestKey: string | null = null;
      let oldestReset = Infinity;
      for (const [key, t] of tenants) {
        if (t.active === 0 && t.minuteReset < oldestReset) {
          oldestReset = t.minuteReset;
          oldestKey = key;
        }
      }
      if (oldestKey) tenants.delete(oldestKey);
    }
    tenants.set(id, {
      id,
      quota: { ...DEFAULT_QUOTA },
      active: 0,
      requestsThisMinute: 0,
      evolutionsThisHour: 0,
      minuteReset: Date.now() + 60_000,
      hourReset: Date.now() + 3_600_000,
      violations: 0,
      suspended: false,
    });
  }
  const t = tenants.get(id)!;
  const now = Date.now();
  if (now > t.minuteReset) { t.requestsThisMinute = 0; t.minuteReset = now + 60_000; }
  if (now > t.hourReset) { t.evolutionsThisHour = 0; t.hourReset = now + 3_600_000; }
  return t;
}

export function setTenantQuota(tenantId: string, quota: Partial<TenantQuota>): void {
  const t = ensureTenant(tenantId);
  t.quota = { ...t.quota, ...quota };
}

/** Check if a tenant can execute a request */
export function canExecute(tenantId: string): { allowed: boolean; reason?: string } {
  const t = ensureTenant(tenantId);
  if (t.suspended) return { allowed: false, reason: 'tenant_suspended' };
  if (t.active >= t.quota.maxConcurrent) return { allowed: false, reason: 'max_concurrent' };
  if (t.requestsThisMinute >= t.quota.maxRequestsPerMinute) return { allowed: false, reason: 'rate_limit' };
  return { allowed: true };
}

export function acquireSlot(tenantId: string): boolean {
  const check = canExecute(tenantId);
  if (!check.allowed) { ensureTenant(tenantId).violations++; return false; }
  const t = ensureTenant(tenantId);
  t.active++;
  t.requestsThisMinute++;
  return true;
}

export function releaseSlot(tenantId: string): void {
  const t = tenants.get(tenantId);
  if (t) t.active = Math.max(0, t.active - 1);
}

export function canEvolve(tenantId: string): boolean {
  const t = ensureTenant(tenantId);
  return !t.suspended && t.evolutionsThisHour < t.quota.maxEvolutionsPerHour;
}

export function recordEvolution(tenantId: string): void {
  ensureTenant(tenantId).evolutionsThisHour++;
}

export function suspendTenant(tenantId: string): void { ensureTenant(tenantId).suspended = true; }
export function resumeTenant(tenantId: string): void { ensureTenant(tenantId).suspended = false; }

export function getTenantState(tenantId: string): TenantState | null {
  return tenants.get(tenantId) ?? null;
}

export function getAllTenants(): TenantState[] {
  return Array.from(tenants.values());
}
