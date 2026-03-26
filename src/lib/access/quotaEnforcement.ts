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
  developer_id: string; // Added developerId for better traceability in logs and in-memory violations
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
  if (rule.grace_percent < 0) {
    console.warn(`QuotaRule '${rule.id}' has a negative grace_percent (${rule.grace_percent}). Coercing to 0.`);
    rule = { ...rule, grace_percent: 0 }; // Create a new object for immutability
  }
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
  if (amount === 0) {
    return { allowed: true };
  }
  const meterKey = `${developerId}:${resourceType}`;
  
  // Get or create meter
  let meter = usageMeters.get(meterKey);
  if (meter && isPeriodExpired(meter)) {
    usageMeters.delete(meterKey);
    meter = undefined;
  }

  if (!meter) {
    if (usageMeters.size >= MAX_METERS) {
      // Evict oldest meter to make space
      const oldestKey = usageMeters.keys().next().value; // This will be the first inserted key due to Map's iteration order
      if (oldestKey) {
        usageMeters.delete(oldestKey);
      } else if (usageMeters.size > 0) {
        // Fallback for unexpected empty map state when size > 0
        const firstKey = usageMeters.keys().next().value;
        if (firstKey) usageMeters.delete(firstKey);
      }
    }
    // createNewMeter now requires the developerId to find specific rules.
    // Passed in createNewMeter logic to find the specific rule for THIS developer, if it exists.
    meter = createNewMeter(developerId, resourceType);
    usageMeters.set(meterKey, meter);
  }
  
  // Update usage
  meter.current_value += amount;
  meter.percent_used = (meter.limit > 0) ? (meter.current_value / meter.limit) * 100 : 0;
  
  // Check against rules
  const applicableRules = Array.from(quotaRules.values())
    .filter(r => r.enabled && r.resource_type === resourceType);
  
  for (const rule of applicableRules) {
    const thresholdPercent = 100 + rule.grace_percent;
    const usagePercent = (rule.limit_value > 0) ? (meter.current_value / rule.limit_value) * 100 : 0;
    
    if (usagePercent >= thresholdPercent) {
      const violation: QuotaViolation = {
        developer_id: developerId, // Populate the developerId
        rule_id: rule.id,
        rule_name: rule.name,
        current_usage: meter.current_value,
        limit: rule.limit_value,
        overage_percent: usagePercent - 100,
        developer_id: developerId, // Ensure developer_id is set
        action_taken: rule.action_on_exceed,
        timestamp: new Date().toISOString(),
      };
      
      violations.push(violation);
      if (violations.length > MAX_VIOLATIONS) violations.splice(0, violations.length - Math.floor(MAX_VIOLATIONS * 0.7)); // Retain 70% of max, remove oldest
      
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
    // If no meter exists, assume allowed for now, remaining is based on potential 'block' rule if it exists or a high default.
    // Find the most relevant 'block' rule for the developer and resource type, or use a high default.
    const developerSpecificBlockRule = getApplicableRule(resourceType, 'block', developerId);
    const defaultLimit = developerSpecificBlockRule?.limit_value || 1_000_000; // Provide a large default if no specific blocking rule exists
    return { allowed: true, remaining: defaultLimit - requestedAmount };
  }
  
  const applicableRule = Array.from(quotaRules.values())
    .find(r => r.enabled && r.resource_type === resourceType && r.action_on_exceed === 'block');
  
  if (!applicableRule) {
    // If no specific blocking rule, assume allowed based on the meter's current limit (which might be a default or generalized rule)
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
  
  if (options?.developerId) {
    filtered = filtered.filter(v => v.developer_id === options.developerId);
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
  const resourceTypes: QuotaRule['resource_type'][] = Array.from(quotaRules.values())
    .map(rule => rule.resource_type)
    .filter((value, index, self) => self.indexOf(value) === index); // Get unique resource types
  
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

function createNewMeter(developerId: string, resourceType: QuotaRule['resource_type']): UsageMeter {
  const now = new Date();

  // Find the most specific and relevant rule for this developer and resource type.
  // This would ideally involve a rule lookup mechanism that considers developer tiers/plans,
  // but for now, we'll use the existing global rule lookup.
  const rule = getApplicableRule(resourceType, undefined, developerId);

  const limit = rule?.limit_value || 10000; // Fallback default limit
  const period = rule?.period || 'day'; // Fallback default period

  let periodEnd: Date;
  switch (period) {
    case 'minute':
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, -1);
      break;
    case 'hour':
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, -1);
      break;
    case 'day':
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, -1); // End of current day
      break;
    case 'month':
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // End of current month
      break;
    default:
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, -1); // Default to end of day
  }
  periodEnd.setMilliseconds(999); // Set to last millisecond of the current second to ensure full period coverage.

  return {
    resource_type: resourceType,
    current_value: 0,
    period_start: now.toISOString(),
    period_end: periodEnd.toISOString(),
    limit: limit,
    percent_used: 0,
  };
}

function isPeriodExpired(meter: UsageMeter): boolean {
  // For simplicity, relying on meter.period_end being accurately set by createNewMeter.
  return new Date().getTime() > new Date(meter.period_end).getTime();
}

function getApplicableRule(resourceType: QuotaRule['resource_type'], actionType?: QuotaRule['action_on_exceed'], developerId?: string): QuotaRule | undefined {
  // This function would ideally implement more sophisticated rule matching (e.g., developer-specific rules).
  // For now, it filters global rules based on resourceType and optional actionType.
  // DeveloperId is currently unused as there's no developer-specific rule storage.
  return Array.from(quotaRules.values())
    .filter(r => r.enabled && r.resource_type === resourceType)
    .find(r => !actionType || r.action_on_exceed === actionType);
}

async function logViolation(developerId: string, violation: QuotaViolation): Promise<void> {
  try {
    await supabase.from('brain_events').insert([{
      module: 'access',
      event_type: 'quota_violation',
      data: {
        developer_id: developerId,
        rule_id: violation.rule_id,
        rule_name: violation.rule_name,
        current_usage: violation.current_usage,
        limit: violation.limit,
        overage_percent: violation.overage_percent,
        action_taken: violation.action_taken,
        timestamp: violation.timestamp
      },
      outcome: 'logged'
    }]);

    const { error } = await supabase.from('brain_events').insert([{
      module: 'access',
      event_type: 'quota_violation',
      data: {
        developer_id: developerId,
        rule_id: violation.rule_id,
        rule_name: violation.rule_name,
        current_usage: violation.current_usage,
        limit: violation.limit,
        overage_percent: violation.overage_percent,
        action_taken: violation.action_on_exceed, // Use action_on_exceed from violation directly
        timestamp: violation.timestamp
      },
      outcome: 'logged'
    }]);

    if (error) {
      console.error('Supabase error logging quota violation:', error);
    }
  } catch (error) {
    console.error('Failed to log quota violation:', error);
  }
}
