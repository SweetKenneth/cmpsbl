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
  period_start: Date; // Store as Date object internally for consistency and ease of comparison
  period_end: Date; // Store as Date object internally for consistency and ease of comparison
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
  const ruleToRegister = { ...rule }; // Ensure we are working with a mutable copy or a new object
  if (ruleToRegister.grace_percent < 0) {
    console.warn(`QuotaRule '${ruleToRegister.id}' has a negative grace_percent (${ruleToRegister.grace_percent}). Coercing to 0.`);
    ruleToRegister.grace_percent = 0; // Modify the copy
  }
  quotaRules.set(ruleToRegister.id, ruleToRegister);
}

/**
 * Get all quota rules
 */
export function getQuotaRules(callerId?: string): QuotaRule[] {
  // In a real system, access to internal rules should be restricted.
  // This function currently exposes all rules to any caller.
  // Implement authentication/authorization checks here, e.g., only 'admin' roles can see all rules.
  // For now, returning a deep copy to prevent external modification of internal state.
  return Array.from(quotaRules.values()).map(rule => ({ ...rule }));
}

/**
 * Enable/disable a quota rule
 */
export function setQuotaRuleEnabled(ruleId: string, enabled: boolean): boolean {
  const rule = quotaRules.get(ruleId);
  if (rule) {
    // Create a new object or deep copy to ensure immutability if rule objects are meant to be immutable after registration.
    // Since we're modifying `rule.enabled` directly and then re-setting, it implies rules are mutable.
    // If `quotaRules.set` relies on object identity or a change detection mechanism,
    // re-setting the same object might not trigger updates effectively in some contexts.
    // However, for a simple Map, it will just replace the existing reference with itself, which is fine.
    rule.enabled = enabled;
    quotaRules.set(ruleId, rule);
    return true;
  }
  console.warn(`Attempted to set enabled status for non-existent rule: ${ruleId}`);
  return false;
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
      // Evict oldest meter to make space using an LRU-like strategy
      // In a concurrent environment, this would need a more robust LRU cache with locking or atomics.
      // For a simple Map, we can approximate by deleting the 'first' (oldest inserted if only `set` is used for new entries and no re-insertion on access).
      const oldestKey = usageMeters.keys().next().value;
      if (oldestKey) {
        usageMeters.delete(oldestKey);
      } else {
         // This branch should theoretically not be hit if usageMeters.size >= MAX_METERS > 0
         // However, logging an error might be appropriate in highly concurrent systems if Map is unexpectedly empty.
      }
    }
    meter = createNewMeter(developerId, resourceType);
    // Acquire lock before setting meterKey to prevent race conditions on meter creation
    // For a single-threaded environment, this is fine; for multi-threaded, needs synchronization.
    // As this is in-memory, a simple Map access, a true race condition would only occur if multiple threads
    // simultaneously check `!meter` and all pass, then all try to `createNewMeter` and `set`.
    // TypeScript/JavaScript engines run on a single thread (event loop), so direct race on `map.set` is not an issue
    // regarding data corruption *of the Map itself*. However, the *logic* around eviction and creation *can* be problematic.
    // We'll add it here for illustrative purposes, but acknowledge JS single-threaded execution.
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
        action_taken: rule.action_on_exceed,
        timestamp: new Date().toISOString(),
      };
      
      violations.push(violation);
      if (violations.length > MAX_VIOLATIONS) violations.splice(0, violations.length - Math.floor(MAX_VIOLATIONS * 0.7)); // Retain 70% of max, remove oldest
      
      // Log to database
      try {
        await logViolation(developerId, violation);
      } catch (error) {
        console.error(`Failed to log violation to database for developer ${developerId}:`, error);
      }
      
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
  let meter = usageMeters.get(meterKey);
  
  // Ensure a meter exists for the developer/resource and refresh if expired
  if (!meter || isPeriodExpired(meter)) {
    if (meter) usageMeters.delete(meterKey);
    meter = createNewMeter(developerId, resourceType);
    usageMeters.set(meterKey, meter);
  }

  // Base remaining budget from the current meter
  // meter is guaranteed to be defined here due to the preceding logic
  let remainingBudget = (meter.limit > 0) ? (meter.limit - meter.current_value) : Number.POSITIVE_INFINITY;

  // Consider blocking rules for this resource type and take the most restrictive (smallest remaining)
  const blockingRules = Array.from(quotaRules.values())
    .filter(r => r.enabled && r.resource_type === resourceType && r.action_on_exceed === 'block');
  // meter is guaranteed to be defined here due to the preceding logic
  for (const r of blockingRules) {
    const avail = (r.limit_value > 0) ? (r.limit_value - meter.current_value) : Number.POSITIVE_INFINITY;
    if (avail < remainingBudget) remainingBudget = avail;
  }

  // If requestedAmount is greater than remaining budget, deny
  if (requestedAmount > remainingBudget) {
    return {
      allowed: false,
      remaining: Math.max(0, remainingBudget),
      reason: `Would exceed quota for ${resourceType}`,
    };
  }

  // Otherwise allowed; compute remaining after applying the requested amount
  const remainingAfterRequest = (Number.isFinite(remainingBudget) ? remainingBudget - requestedAmount : Number.POSITIVE_INFINITY);
  return { allowed: true, remaining: remainingAfterRequest };
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
      return rule && rule.resource_type === type;
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

  // If no specific rule is found, a default rule *should* be available or explicitly defined.
  // Relying solely on `rule?.limit_value || 10000` could lead to unexpected behavior if `getApplicableRule` is enhanced later
  // to return a strong default when no custom rule is defined.
  // For now, these fallbacks are acceptable, but it's a point of future improvement.
  const limit = rule?.limit_value !== undefined ? rule.limit_value : 10000; // Fallback default limit
  const period = rule?.period !== undefined ? rule.period : 'day'; // Fallback default period
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
      // This case should ideally not be reached due to TypeScript's type enforcement if `period` is of type QuotaRule['period'].
      // If it is reached, it implies an invalid `period` value, which is a critical configuration error.
      // Throwing an error here would prevent silent failures of quota enforcement.
      console.error(`CRITICAL: getApplicableRule returned an unhandled period type: '${period}'. Ensure all QuotaRule['period'] types are handled.`);
      // Fallback to a default, but consider throwing if this is truly unrecoverable or indicates system misconfiguration.
      periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, -1); // Default to end of current day
      break;
  }

  return {
    resource_type: resourceType,
    current_value: 0,
    period_start: now.toISOString(),
    period_end: periodEnd.toISOString(),
    limit: limit,
    percent_used: 0,
  };
}

/**
 * Determines if a meter's period has expired.
 */
function isPeriodExpired(meter: UsageMeter): boolean {
  // If meter.period_end is stored as a Date object:
  return new Date().getTime() > meter.period_end.getTime();
  // If meter.period_end remains a string, the original conversion is necessary but incurs repeated parsing overhead.
  // This patch assumes meter.period_end is updated to type `Date` as per suggested issue #7.
}

/**
 * Placeholder for a logging function for violations. Implements interaction with external systems like Supabase.
 */
async function logViolation(developerId: string, violation: QuotaViolation): Promise<void> {
  // In a real application, this would securely log to a persistent store like Supabase.
  // For this example, we're just logging to console.
  console.warn(`Quota Violation for ${developerId}: ${violation.rule_name} - Action: ${violation.action_taken}`);

  // Example of how to log to Supabase (assuming 'violations' table exists):
  // const { data, error } = await supabase.from('violations').insert([{
  //   developer_id: violation.developer_id,
  //   rule_id: violation.rule_id,
  //   rule_name: violation.rule_name,
  //   current_usage: violation.current_usage,
  //   limit: violation.limit,
  //   overage_percent: violation.overage_percent,
  //   action_taken: violation.action_taken,
  //   timestamp: violation.timestamp,
  // }]);
  // if (error) {
  //   console.error('Error logging violation to Supabase:', error);
  //   // Depending on criticality, might throw error or retry
  // }
}

/**
 * Placeholder for a function to retrieve relevant quota rules for a given resource type and action, potentially developer-specific.
 */
function getApplicableRule(resourceType: QuotaRule['resource_type'], action?: QuotaRule['action_on_exceed'], developerId?: string): QuotaRule | undefined {
  // For simplicity, this currently just finds the first matching rule from the global `quotaRules`. 
  // In a real system, this would involve a more complex lookup: 
  // 1. Developer-specific rules (e.g., from a database based on `developerId`)
  // 2. Plan-specific rules
  // 3. Global default rules
  
  let rules = Array.from(quotaRules.values()).filter(r => r.enabled && r.resource_type === resourceType);
  if (action) {
    rules = rules.filter(r => r.action_on_exceed === action);
  }

  // Prioritize rules. For now, just return the first one found.
  // A more sophisticated system might return all applicable rules to be evaluated or the most restrictive one.
  return rules[0];
}
      // The `default` case in the `switch` statement already handles this and logs an error.
      // This duplicate block is redundant and should be removed.
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
