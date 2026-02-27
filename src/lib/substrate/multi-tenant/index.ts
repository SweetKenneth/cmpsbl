/**
 * Multi-Tenant Isolation
 * Tenant-scoped resource isolation for shared substrate instances
 * 
 * Ensures cognitive state, memory, and execution context are
 * strictly isolated between tenants sharing the same infrastructure.
 */

export interface Tenant {
  id: string;
  name: string;
  tier: string;
  quotas: TenantQuotas;
  status: 'active' | 'suspended' | 'archived';
  createdAt: number;
  metadata: Record<string, unknown>;
}

export interface TenantQuotas {
  maxMemoryMb: number;
  maxRequestsPerMinute: number;
  maxEngines: number;
  maxPipelines: number;
  maxStorageMb: number;
}

export interface IsolationContext {
  tenantId: string;
  scopePrefix: string;
  createdAt: number;
}

const tenants = new Map<string, Tenant>();
const activeContexts = new Map<string, IsolationContext>();

const DEFAULT_QUOTAS: TenantQuotas = {
  maxMemoryMb: 256,
  maxRequestsPerMinute: 100,
  maxEngines: 10,
  maxPipelines: 5,
  maxStorageMb: 512,
};

/**
 * Register a new tenant
 */
export function registerTenant(id: string, name: string, tier: string, quotas?: Partial<TenantQuotas>): Tenant {
  const tenant: Tenant = {
    id,
    name,
    tier,
    quotas: { ...DEFAULT_QUOTAS, ...quotas },
    status: 'active',
    createdAt: Date.now(),
    metadata: {},
  };
  tenants.set(id, tenant);
  return tenant;
}

/**
 * Create an isolation context for a tenant
 */
export function createIsolationContext(tenantId: string): IsolationContext | null {
  const tenant = tenants.get(tenantId);
  if (!tenant || tenant.status !== 'active') return null;

  const ctx: IsolationContext = {
    tenantId,
    scopePrefix: `tenant:${tenantId}:`,
    createdAt: Date.now(),
  };
  activeContexts.set(tenantId, ctx);
  return ctx;
}

/**
 * Scope a resource key to a tenant
 */
export function scopeKey(tenantId: string, key: string): string {
  return `tenant:${tenantId}:${key}`;
}

/**
 * Check if a tenant is within quota
 */
export function checkQuota(tenantId: string, resource: keyof TenantQuotas, currentUsage: number): boolean {
  const tenant = tenants.get(tenantId);
  if (!tenant) return false;
  return currentUsage < tenant.quotas[resource];
}

/**
 * Suspend a tenant
 */
export function suspendTenant(tenantId: string, reason: string): boolean {
  const tenant = tenants.get(tenantId);
  if (!tenant) return false;
  tenant.status = 'suspended';
  tenant.metadata.suspendReason = reason;
  tenant.metadata.suspendedAt = Date.now();
  activeContexts.delete(tenantId);
  return true;
}

/**
 * Reactivate a tenant
 */
export function reactivateTenant(tenantId: string): boolean {
  const tenant = tenants.get(tenantId);
  if (!tenant || tenant.status !== 'suspended') return false;
  tenant.status = 'active';
  delete tenant.metadata.suspendReason;
  return true;
}

/** Get tenant */
export function getTenant(tenantId: string): Tenant | undefined {
  return tenants.get(tenantId);
}

/** List all tenants */
export function listTenants(): Tenant[] {
  return Array.from(tenants.values());
}

/** Get active context */
export function getContext(tenantId: string): IsolationContext | undefined {
  return activeContexts.get(tenantId);
}
