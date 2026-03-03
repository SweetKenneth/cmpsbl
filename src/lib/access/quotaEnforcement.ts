/**
 * ACCESS Module — Quota Enforcement Engine
 * Real-time usage metering and enforcement
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface QuotaRule {
  id: string;
  name: string;
  resource_type: 'api_calls' | 'tokens' | 'compute_ms' | 'storage_bytes';
  limit_value: number;
  period: 'minute' | 'hour' | 'day' | 'month';
  action_on_exceed: 'block' | 'throttle' | 'warn' | 'log';
  grace_percent: number;
  enabled: boolean;
}

export interface QuotaViolation {
  rule_id: string;
  rule_name: string;
  current_usage: number;
  limit: number;
  overage_percent: number;
  action_taken: QuotaRule['action_on_exceed'];
  timestamp: string;
}

export interface UsageMeter {
  resource_type: QuotaRule['resource_type'];
  current_value: number;
  period_start: string;
  period_end: string;
  limit: number;
  percent_used: number;
}

// ============ In-Memory Tracking ============

const usageMeters: Map<string, UsageMeter> = new Map();
const MAX_METERS = 2000;
const quotaRules: Map<string, QuotaRule> = new Map();
const violations: QuotaViolation[] = [];
const MAX_VIOLATIONS = 500;

// Default quota rules
const DEFAULT_RULES: QuotaRule[] = [
  { id: 'api_minute', name: 'API Calls per Minute', resource_type: 'api_calls', limit_value: 60, period: 'minute', action_on_exceed: 'throttle', grace_percent: 10, enabled: true },
  { id: 'api_day', name: 'API Calls per Day', resource_type: 'api_calls', limit_value: 10000, period: 'day', action_on_exceed: 'block', grace_percent: 5, enabled: true },
  { id: 'tokens_day', name: 'Tokens per Day', resource_type: 'tokens', limit_value: 1000000, period: 'day', action_on_exceed: 'warn', grace_percent: 20, enabled: true },
  { id: 'compute_hour', name: 'Compute per Hour', resource_type: 'compute_ms', limit_value: 3600000, period: 'hour', action_on_exceed: 'throttle', grace_percent: 15, enabled: true },
];

// Initialize defaults
DEFAULT_RULES.forEach(rule => quotaRules.set(rule.id, rule));

// ============ Quota Management ============

/**
 * Register a new quota rule
 */
export function registerQuotaRule(rule: QuotaRule): void {
  quotaRules.set(rule.id, rule);
}

/**
 * Get all quota rules
 */
export function getQuotaRules(): QuotaRule[] {
  return Array.from(quotaRules.values());
}

/**
 * Enable/disable a quota rule
 */
export function setQuotaRuleEnabled(ruleId: string, enabled: boolean): boolean {
  const rule = quotaRules.get(ruleId);
  if (rule) {
    rule.enabled = enabled;
    quotaRules.set(ruleId, rule);
    return true;
  }
  return false;
}

// ============ Usage Metering ============

/**
 * Record resource usage
 */
export async function recordUsage(
  developerId: string,
  resourceType: QuotaRule['resource_type'],
  amount: number
): Promise<{ allowed: boolean; violation?: QuotaViolation }> {
  const meterKey = `${developerId}:${resourceType}`;
  
  // Get or create meter
  let meter = usageMeters.get(meterKey);
  if (!meter || isPeriodExpired(meter)) {
    // Evict expired meters when at cap
    if (usageMeters.size >= MAX_METERS) {
      for (const [k, m] of usageMeters) {
        if (isPeriodExpired(m)) usageMeters.delete(k);
      }
      // If still at cap, evict oldest
      if (usageMeters.size >= MAX_METERS) {
        const firstKey = usageMeters.keys().next().value;
        if (firstKey) usageMeters.delete(firstKey);
      }
    }
    meter = createNewMeter(resourceType);
    usageMeters.set(meterKey, meter);
  }
  
  // Update usage
  meter.current_value += amount;
  meter.percent_used = (meter.current_value / meter.limit) * 100;
  
  // Check against rules
  const applicableRules = Array.from(quotaRules.values())
    .filter(r => r.enabled && r.resource_type === resourceType);
  
  for (const rule of applicableRules) {
    const thresholdPercent = 100 + rule.grace_percent;
    const usagePercent = (meter.current_value / rule.limit_value) * 100;
    
    if (usagePercent >= thresholdPercent) {
      const violation: QuotaViolation = {
        rule_id: rule.id,
        rule_name: rule.name,
        current_usage: meter.current_value,
        limit: rule.limit_value,
        overage_percent: usagePercent - 100,
        action_taken: rule.action_on_exceed,
        timestamp: new Date().toISOString(),
      };
      
      violations.push(violation);
      if (violations.length > MAX_VIOLATIONS) violations.splice(0, Math.floor(MAX_VIOLATIONS * 0.3));
      
      // Log to database
      await logViolation(developerId, violation);
      
      if (rule.action_on_exceed === 'block') {
        return { allowed: false, violation };
      }
    }
  }
  
  return { allowed: true };
}

/**
 * Get current usage meters for a developer
 */
export function getUsageMeters(developerId: string): UsageMeter[] {
  const meters: UsageMeter[] = [];
  
  for (const [key, meter] of usageMeters.entries()) {
    if (key.startsWith(`${developerId}:`)) {
      meters.push({ ...meter });
    }
  }
  
  return meters;
}

/**
 * Check if usage is within quota before action
 */
export async function checkQuota(
  developerId: string,
  resourceType: QuotaRule['resource_type'],
  requestedAmount: number
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const meterKey = `${developerId}:${resourceType}`;
  const meter = usageMeters.get(meterKey);
  
  if (!meter) {
    return { allowed: true, remaining: DEFAULT_RULES.find(r => r.resource_type === resourceType)?.limit_value || 1000 };
  }
  
  const applicableRule = Array.from(quotaRules.values())
    .find(r => r.enabled && r.resource_type === resourceType && r.action_on_exceed === 'block');
  
  if (!applicableRule) {
    return { allowed: true, remaining: meter.limit - meter.current_value };
  }
  
  const remaining = applicableRule.limit_value - meter.current_value;
  
  if (remaining < requestedAmount) {
    return {
      allowed: false,
      remaining: Math.max(0, remaining),
      reason: `Would exceed ${applicableRule.name}: ${meter.current_value + requestedAmount}/${applicableRule.limit_value}`,
    };
  }
  
  return { allowed: true, remaining };
}

// ============ Violation Management ============

/**
 * Get quota violations
 */
export function getViolations(options?: {
  developerId?: string;
  ruleId?: string;
  since?: string;
  limit?: number;
}): QuotaViolation[] {
  let filtered = [...violations];
  
  if (options?.since) {
    const sinceDate = new Date(options.since);
    filtered = filtered.filter(v => new Date(v.timestamp) >= sinceDate);
  }
  
  if (options?.ruleId) {
    filtered = filtered.filter(v => v.rule_id === options.ruleId);
  }
  
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return options?.limit ? filtered.slice(0, options.limit) : filtered;
}

/**
 * Clear violation history
 */
export function clearViolations(): void {
  violations.length = 0;
}

// ============ Quota Reset ============

/**
 * Reset quota for a developer
 */
export function resetQuota(developerId: string, resourceType?: QuotaRule['resource_type']): void {
  for (const [key] of usageMeters.entries()) {
    if (key.startsWith(`${developerId}:`)) {
      if (!resourceType || key.endsWith(`:${resourceType}`)) {
        usageMeters.delete(key);
      }
    }
  }
}

/**
 * Reset all quotas (admin only)
 */
export function resetAllQuotas(): void {
  usageMeters.clear();
}

// ============ Analytics ============

/**
 * Get quota utilization summary
 */
export function getQuotaUtilization(): {
  resource_type: QuotaRule['resource_type'];
  total_meters: number;
  avg_utilization: number;
  max_utilization: number;
  violations_count: number;
}[] {
  const resourceTypes: QuotaRule['resource_type'][] = ['api_calls', 'tokens', 'compute_ms', 'storage_bytes'];
  
  return resourceTypes.map(type => {
    const typeMeters = Array.from(usageMeters.values()).filter(m => m.resource_type === type);
    const typeViolations = violations.filter(v => {
      const rule = quotaRules.get(v.rule_id);
      return rule?.resource_type === type;
    });
    
    const utilizations = typeMeters.map(m => m.percent_used);
    
    return {
      resource_type: type,
      total_meters: typeMeters.length,
      avg_utilization: utilizations.length > 0 ? utilizations.reduce((a, b) => a + b, 0) / utilizations.length : 0,
      max_utilization: utilizations.length > 0 ? Math.max(...utilizations) : 0,
      violations_count: typeViolations.length,
    };
  });
}

// ============ Helpers ============

function createNewMeter(resourceType: QuotaRule['resource_type']): UsageMeter {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  const rule = DEFAULT_RULES.find(r => r.resource_type === resourceType);
  
  return {
    resource_type: resourceType,
    current_value: 0,
    period_start: now.toISOString(),
    period_end: endOfDay.toISOString(),
    limit: rule?.limit_value || 10000,
    percent_used: 0,
  };
}

function isPeriodExpired(meter: UsageMeter): boolean {
  return new Date() > new Date(meter.period_end);
}

async function logViolation(developerId: string, violation: QuotaViolation): Promise<void> {
  try {
    await supabase.from('brain_events').insert([{
      module: 'access',
      event_type: 'quota_violation',
      data: {
        developer_id: developerId,
        ...violation,
      },
      outcome: 'logged',
    }]);
  } catch (error) {
    console.error('Failed to log quota violation:', error);
  }
}
