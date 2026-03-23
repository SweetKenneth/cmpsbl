/**
 * ACCESS Module — Authentication, Authorization & API Gateway
 * Substrate Security Perimeter
 * 
 * Provides:
 * - API Key management (generation, validation, revocation)
 * - Developer portal operations
 * - Subscription & quota enforcement
 * - Role-based access control (RBAC)
 * - Session management
 * - Rate limiting integration with DEFENSE
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ============ Types ============

export type AccessTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type DeveloperStatus = 'active' | 'suspended' | 'pending' | 'archived';
export type ApiKeyScope = 'read' | 'write' | 'admin' | 'full';

export interface Developer {
  id: string;
  user_id: string | null;
  display_name: string;
  email: string | null;
  status: DeveloperStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

export interface ApiKey {
  id: string;
  developer_id: string;
  name: string | null;
  key_prefix: string;
  scopes: ApiKeyScope[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string | null;
}

export interface Subscription {
  id: string;
  developer_id: string;
  tier: AccessTier;
  plan_slug: string | null;
  status: string;
  monthly_quota: number;
  entitlements: Record<string, unknown>;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
  created_at: string | null;
}

export interface UsageRecord {
  id: string;
  developer_id: string | null;
  api_key_id: string | null;
  module: string;
  action: string;
  tokens_used: number | null;
  compute_ms: number | null;
  cost_millicents: number | null;
  product_code: string | null;
  created_at: string | null;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  percent_used: number;
  reset_at: string;
}

// Helper to safely parse Json to Record
function parseJson(json: Json | null): Record<string, unknown> {
  if (json === null || json === undefined) return {};
  if (typeof json === 'object' && !Array.isArray(json)) return json as Record<string, unknown>;
  return {};
}

// ============ Developer Operations ============

/**
 * Get current authenticated developer profile
 */
export async function getCurrentDeveloper(): Promise<Developer | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('access_developers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      display_name: data.display_name,
      email: data.email,
      status: data.status as DeveloperStatus,
      metadata: parseJson(data.metadata),
      created_at: data.created_at || '',
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching developer:', error);
    return null;
  }
}

/**
 * Register a new developer account
 */
export async function registerDeveloper(
  displayName: string,
  email?: string
): Promise<{ success: boolean; developer?: Developer; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('access_developers')
      .insert({
        user_id: user.id,
        display_name: displayName,
        email: email || user.email,
        status: 'active',
        metadata: { source: 'self_registration' },
      })
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      developer: {
        id: data.id,
        user_id: data.user_id,
        display_name: data.display_name,
        email: data.email,
        status: data.status as DeveloperStatus,
        metadata: parseJson(data.metadata),
        created_at: data.created_at || '',
        updated_at: data.updated_at,
      }
    };
  } catch (error) {
    console.error('Error registering developer:', error);
    return { success: false, error: String(error) };
  }
}

// ============ API Key Operations ============

/**
 * Generate a new API key for the current developer
 */
export async function generateApiKey(
  name: string,
  options?: {
    scopes?: ApiKeyScope[];
    rate_limit_per_minute?: number;
    rate_limit_per_day?: number;
    expires_in_days?: number;
  }
): Promise<{ success: boolean; key?: string; key_id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Call the secure key generation function
    const { data, error } = await supabase.rpc('generate_clarity_api_key', {
      p_user_id: user.id,
      p_key_name: name,
      p_rate_limit: options?.rate_limit_per_minute || 1000,
    });

    if (error) throw error;

    // Parse the JSONB response
    const result = data as Record<string, unknown> | null;

    return {
      success: true,
      key: result?.api_key as string | undefined,
      key_id: result?.key_id as string | undefined,
    };
  } catch (error) {
    console.error('Error generating API key:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * List all API keys for the current developer
 */
export async function listApiKeys(): Promise<ApiKey[]> {
  try {
    const developer = await getCurrentDeveloper();
    if (!developer) return [];

    const { data } = await supabase
      .from('access_api_keys')
      .select('*')
      .eq('developer_id', developer.id)
      .order('created_at', { ascending: false });

    return (data || []).map(row => ({
      id: row.id,
      developer_id: row.developer_id,
      name: row.name,
      key_prefix: row.key_prefix,
      scopes: (row.scopes || []) as ApiKeyScope[],
      rate_limit_per_minute: row.rate_limit_per_minute || 60,
      rate_limit_per_day: row.rate_limit_per_day || 1000,
      is_active: row.is_active ?? true,
      expires_at: row.expires_at,
      last_used_at: row.last_used_at,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error listing API keys:', error);
    return [];
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('access_api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    return !error;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}

/**
 * Validate an API key (server-side via RPC)
 */
export async function validateApiKey(
  apiKey: string
): Promise<{ valid: boolean; developer_id?: string; scopes?: ApiKeyScope[]; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('validate_clarity_api_key', {
      p_api_key: apiKey,
    });

    if (error) throw error;

    // Parse the JSONB response
    const result = data as Record<string, unknown> | null;

    return {
      valid: (result?.valid as boolean) || false,
      developer_id: result?.user_id as string | undefined,
      error: result?.error as string | undefined,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, error: String(error) };
  }
}

// ============ Subscription Operations ============

/**
 * Get current subscription for developer
 */
export async function getSubscription(): Promise<Subscription | null> {
  try {
    const developer = await getCurrentDeveloper();
    if (!developer) return null;

    const { data } = await supabase
      .from('access_subscriptions')
      .select('*')
      .eq('developer_id', developer.id)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      developer_id: data.developer_id,
      tier: (data.tier || 'free') as AccessTier,
      plan_slug: data.plan_slug,
      status: data.status || 'active',
      monthly_quota: data.monthly_quota || 1000,
      entitlements: parseJson(data.entitlements),
      current_period_start: data.current_period_start,
      current_period_end: data.current_period_end,
      stripe_subscription_id: data.stripe_subscription_id,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get quota status for current billing period
 */
export async function getQuotaStatus(): Promise<QuotaStatus | null> {
  try {
    const developer = await getCurrentDeveloper();
    if (!developer) return null;

    const subscription = await getSubscription();
    const limit = subscription?.monthly_quota || 1000;

    // Get usage for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('access_usage')
      .select('tokens_used')
      .eq('developer_id', developer.id)
      .gte('created_at', startOfMonth.toISOString());

    const used = (data || []).reduce((sum, r) => sum + (r.tokens_used || 0), 0);

    // Calculate reset date (next month)
    const resetAt = new Date(startOfMonth);
    resetAt.setMonth(resetAt.getMonth() + 1);

    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      percent_used: Math.min(100, (used / limit) * 100),
      reset_at: resetAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching quota status:', error);
    return null;
  }
}

// ============ Usage Tracking ============

/**
 * Record API usage
 */
export async function recordUsage(
  module: string,
  action: string,
  metrics: {
    tokens_used?: number;
    compute_ms?: number;
    product_code?: string;
    api_key_id?: string;
  }
): Promise<boolean> {
  try {
    const developer = await getCurrentDeveloper();

    const { error } = await supabase.from('access_usage').insert({
      developer_id: developer?.id,
      api_key_id: metrics.api_key_id,
      module,
      action,
      tokens_used: metrics.tokens_used || 0,
      compute_ms: metrics.compute_ms || 0,
      product_code: metrics.product_code,
    });

    return !error;
  } catch (error) {
    console.error('Error recording usage:', error);
    return false;
  }
}

/**
 * Get usage history
 */
export async function getUsageHistory(
  options?: {
    days?: number;
    module?: string;
    limit?: number;
  }
): Promise<UsageRecord[]> {
  try {
    const developer = await getCurrentDeveloper();
    if (!developer) return [];

    const days = options?.days || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    let query = supabase
      .from('access_usage')
      .select('*')
      .eq('developer_id', developer.id)
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })
      .limit(options?.limit || 100);

    if (options?.module) {
      query = query.eq('module', options.module);
    }

    const { data } = await query;
    return (data || []) as UsageRecord[];
  } catch (error) {
    console.error('Error fetching usage history:', error);
    return [];
  }
}

// ============ RBAC Helpers ============

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase.rpc('has_role', {
      role_name: role,
    });

    return data === true;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Get all roles for current user
 */
export async function getUserRoles(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    return (data || []).map(r => r.role);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

// ============ Module Metadata ============

export const ACCESS_VERSION = '9.0.0';
export const ACCESS_CODENAME = 'Gatekeeper Prime';

// ============ Module Exports ============

// Permission optimizer
export * from './permissionOptimizer';

// Permission graph (RBAC)
export * from './permissionGraph';
 
// Quota enforcement (in-memory)
export * from './quotaEnforcement';

// Session management
export * from './sessionManagement';

// v8.0 Hardening: Persistent quota store (DB-backed)
export * from './persistentQuotaStore';

// v8.0 Hardening: API key lifecycle management
export * from './apiKeyLifecycle';

// v8.0 Hardening: ABAC engine
export * from './abacEngine';

// v8.0 Hardening: DEFENSE integration
export * from './defenseIntegration';

export interface AccessModuleStatus {
  authenticated: boolean;
  developer: Developer | null;
  subscription: Subscription | null;
  quota: QuotaStatus | null;
  roles: string[];
}

/**
 * Get full access module status
 */
export async function getAccessStatus(): Promise<AccessModuleStatus> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      authenticated: false,
      developer: null,
      subscription: null,
      quota: null,
      roles: [],
    };
  }

  const [developer, subscription, quota, roles] = await Promise.all([
    getCurrentDeveloper(),
    getSubscription(),
    getQuotaStatus(),
    getUserRoles(),
  ]);

  return {
    authenticated: true,
    developer,
    subscription,
    quota,
    roles,
  };
}
