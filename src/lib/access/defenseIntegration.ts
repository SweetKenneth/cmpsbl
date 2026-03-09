/**
 * ACCESS ↔ DEFENSE Integration Layer
 * Coordinates rate limiting, threat signals, and adaptive throttling
 */

import { supabase } from '@/integrations/supabase/client';
import { checkQuotaAllowance, incrementQuotaUsage } from './persistentQuotaStore';
import { analyzeForCompromise, recordCompromiseSignal, updateUsagePattern } from './apiKeyLifecycle';
import { evaluateAccess, createEnvironmentAttributes, createActionAttributes } from './abacEngine';
import type { SubjectAttributes, ResourceAttributes, PolicyDecision } from './abacEngine';

// ============ Types ============

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  retry_after_ms?: number;
  throttle_delay_ms: number;
  reason?: string;
  threat_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface AccessRequest {
  developer_id: string;
  api_key_id?: string;
  module: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export interface AccessResult {
  allowed: boolean;
  policy_decision?: PolicyDecision;
  rate_limit: RateLimitResult;
  security_checks: {
    passed: boolean;
    failed_checks: string[];
    warnings: string[];
  };
  computed_delay_ms: number;
  trace_id: string;
}

export interface ThreatSignal {
  source: 'defense' | 'access' | 'external';
  signal_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  target_id: string;
  target_type: 'api_key' | 'developer' | 'ip' | 'session';
  details: Record<string, unknown>;
  timestamp: string;
}

// ============ In-Memory State ============

const activeThreatSignals = new Map<string, ThreatSignal[]>();
const requestCounters = new Map<string, { count: number; window_start: number }>();
const throttledEntities = new Map<string, { until: number; reason: string }>();

const MAX_THREAT_SIGNALS = 100;
const WINDOW_SIZE_MS = 60_000; // 1 minute
const MAX_THROTTLE_DURATION_MS = 3600_000; // 1 hour

// ============ Unified Access Gate ============

/**
 * Primary access control gate - integrates ABAC, rate limiting, and threat detection
 */
export async function checkAccess(request: AccessRequest): Promise<AccessResult> {
  const traceId = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startTime = performance.now();
  
  const failedChecks: string[] = [];
  const warnings: string[] = [];
  
  // 1. Check if entity is currently throttled
  const throttleKey = `${request.developer_id}:${request.api_key_id || 'direct'}`;
  const throttled = throttledEntities.get(throttleKey);
  if (throttled && throttled.until > Date.now()) {
    return {
      allowed: false,
      rate_limit: {
        allowed: false,
        remaining: 0,
        reset_at: new Date(throttled.until).toISOString(),
        retry_after_ms: throttled.until - Date.now(),
        throttle_delay_ms: 0,
        reason: throttled.reason,
        threat_level: 'high',
      },
      security_checks: { passed: false, failed_checks: ['entity_throttled'], warnings: [] },
      computed_delay_ms: 0,
      trace_id: traceId,
    };
  }
  
  // 2. Check rate limits
  const rateLimitResult = await checkRateLimit(request);
  if (!rateLimitResult.allowed) {
    failedChecks.push('rate_limit_exceeded');
  }
  
  // 3. Evaluate ABAC policies
  let policyDecision: PolicyDecision | undefined;
  try {
    const subject: SubjectAttributes = {
      user_id: request.developer_id,
      roles: await getDeveloperRoles(request.developer_id),
      tier: await getDeveloperTier(request.developer_id),
    };
    
    const resource: ResourceAttributes = {
      resource_type: request.resource_type || request.module,
      resource_id: request.resource_id || request.action,
    };
    
    const action = createActionAttributes(request.action);
    const environment = createEnvironmentAttributes(request.ip_address, request.user_agent);
    
    policyDecision = evaluateAccess({ subject, resource, action, environment });
    
    if (policyDecision.effect === 'deny') {
      failedChecks.push('policy_denied');
    }
    
    if (policyDecision.advice.length > 0) {
      warnings.push(...policyDecision.advice);
    }
  } catch (error) {
    console.error('ABAC evaluation error:', error);
    warnings.push('policy_evaluation_error');
  }
  
  // 4. Check for active threats
  const threatCheck = await checkActiveThreats(request);
  if (threatCheck.threat_level === 'critical') {
    failedChecks.push('critical_threat_detected');
  } else if (threatCheck.threat_level === 'high') {
    warnings.push('high_threat_activity_detected');
  }
  
  // 5. Track usage pattern for compromise detection
  if (request.api_key_id) {
    updateUsagePattern(request.api_key_id, {
      module: request.module,
      success: failedChecks.length === 0,
      ip: request.ip_address,
      timestamp: new Date().toISOString(),
    });
  }
  
  // 6. Compute final delay
  const baseDelay = rateLimitResult.throttle_delay_ms;
  const threatDelay = threatCheck.threat_level === 'high' ? 500 : 
                      threatCheck.threat_level === 'medium' ? 200 : 0;
  const computedDelay = baseDelay + threatDelay;
  
  // 7. If allowed, increment usage
  if (failedChecks.length === 0 && rateLimitResult.allowed) {
    await incrementQuotaUsage(request.developer_id, 'api_calls', 'minute', 1);
    await incrementQuotaUsage(request.developer_id, 'api_calls', 'day', 1);
  }
  
  // 8. Log access attempt
  await logAccessAttempt(traceId, request, failedChecks.length === 0, failedChecks, performance.now() - startTime);
  
  return {
    allowed: failedChecks.length === 0 && rateLimitResult.allowed,
    policy_decision: policyDecision,
    rate_limit: {
      ...rateLimitResult,
      threat_level: threatCheck.threat_level,
    },
    security_checks: {
      passed: failedChecks.length === 0,
      failed_checks: failedChecks,
      warnings,
    },
    computed_delay_ms: computedDelay,
    trace_id: traceId,
  };
}

// ============ Rate Limiting ============

async function checkRateLimit(request: AccessRequest): Promise<Omit<RateLimitResult, 'threat_level'>> {
  const quotaCheck = await checkQuotaAllowance(request.developer_id, 'api_calls', 1);
  
  // Also check sliding window rate
  const windowKey = `${request.developer_id}:${request.module}`;
  const counter = requestCounters.get(windowKey);
  const now = Date.now();
  
  if (!counter || now - counter.window_start > WINDOW_SIZE_MS) {
    requestCounters.set(windowKey, { count: 1, window_start: now });
  } else {
    counter.count++;
    
    // Per-module rate limit (e.g., 100 per minute per module)
    if (counter.count > 100) {
      return {
        allowed: false,
        remaining: 0,
        reset_at: new Date(counter.window_start + WINDOW_SIZE_MS).toISOString(),
        retry_after_ms: counter.window_start + WINDOW_SIZE_MS - now,
        throttle_delay_ms: 0,
        reason: `Module ${request.module} rate limit exceeded`,
      };
    }
  }
  
  if (!quotaCheck.allowed) {
    return {
      allowed: false,
      remaining: quotaCheck.remaining,
      reset_at: new Date(now + 60000).toISOString(),
      retry_after_ms: quotaCheck.throttleDelay,
      throttle_delay_ms: 0,
      reason: quotaCheck.reason,
    };
  }
  
  return {
    allowed: true,
    remaining: quotaCheck.remaining,
    reset_at: new Date(now + 60000).toISOString(),
    throttle_delay_ms: quotaCheck.throttleDelay,
  };
}

// ============ Threat Detection ============

async function checkActiveThreats(request: AccessRequest): Promise<{ threat_level: RateLimitResult['threat_level'] }> {
  const signals: ThreatSignal[] = [];
  
  // Check developer-level threats
  const devSignals = activeThreatSignals.get(`developer:${request.developer_id}`) || [];
  signals.push(...devSignals);
  
  // Check API key threats
  if (request.api_key_id) {
    const keySignals = activeThreatSignals.get(`api_key:${request.api_key_id}`) || [];
    signals.push(...keySignals);
    
    // Run compromise analysis periodically
    const recentUsage = getRecentUsageForKey(request.api_key_id);
    if (recentUsage.length > 20) {
      const compromiseSignals = await analyzeForCompromise(request.api_key_id, recentUsage);
      for (const sig of compromiseSignals) {
        registerThreatSignal({
          source: 'access',
          signal_type: sig.signal_type,
          severity: sig.severity,
          target_id: request.api_key_id,
          target_type: 'api_key',
          details: sig.details,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
  
  // Check IP threats
  if (request.ip_address) {
    const ipSignals = activeThreatSignals.get(`ip:${request.ip_address}`) || [];
    signals.push(...ipSignals);
  }
  
  // Determine threat level from signals
  const recentSignals = signals.filter(s => Date.now() - new Date(s.timestamp).getTime() < 3600000);
  
  if (recentSignals.some(s => s.severity === 'critical')) return { threat_level: 'critical' };
  if (recentSignals.filter(s => s.severity === 'high').length >= 2) return { threat_level: 'critical' };
  if (recentSignals.some(s => s.severity === 'high')) return { threat_level: 'high' };
  if (recentSignals.filter(s => s.severity === 'medium').length >= 3) return { threat_level: 'high' };
  if (recentSignals.some(s => s.severity === 'medium')) return { threat_level: 'medium' };
  if (recentSignals.length > 0) return { threat_level: 'low' };
  
  return { threat_level: 'none' };
}

// ============ Threat Signal Management ============

/**
 * Register a threat signal from DEFENSE or external sources
 */
export function registerThreatSignal(signal: ThreatSignal): void {
  const key = `${signal.target_type}:${signal.target_id}`;
  const existing = activeThreatSignals.get(key) || [];
  
  existing.push(signal);
  
  // Keep only recent signals
  const cutoff = Date.now() - 24 * 3600000; // 24 hours
  const filtered = existing.filter(s => new Date(s.timestamp).getTime() > cutoff);
  if (filtered.length > MAX_THREAT_SIGNALS) {
    filtered.splice(0, filtered.length - MAX_THREAT_SIGNALS);
  }
  
  activeThreatSignals.set(key, filtered);
  
  // Handle critical signals immediately
  if (signal.severity === 'critical') {
    handleCriticalThreat(signal);
  }
}

function handleCriticalThreat(signal: ThreatSignal): void {
  // Throttle the target entity
  const throttleKey = signal.target_type === 'developer' 
    ? `${signal.target_id}:direct`
    : signal.target_type === 'api_key'
    ? `:${signal.target_id}`
    : signal.target_id;
  
  throttledEntities.set(throttleKey, {
    until: Date.now() + MAX_THROTTLE_DURATION_MS,
    reason: `Critical threat: ${signal.signal_type}`,
  });
  
  // Forward to DEFENSE for additional action
  emitToDefense('critical_threat', signal);
}

/**
 * Clear threat signals for an entity
 */
export function clearThreatSignals(targetType: ThreatSignal['target_type'], targetId: string): void {
  const key = `${targetType}:${targetId}`;
  activeThreatSignals.delete(key);
}

/**
 * Remove entity from throttle list
 */
export function unthrottle(developerId: string, apiKeyId?: string): void {
  const key = `${developerId}:${apiKeyId || 'direct'}`;
  throttledEntities.delete(key);
}

// ============ DEFENSE Communication ============

function emitToDefense(eventType: string, data: unknown): void {
  // Emit event for DEFENSE module to pick up
  try {
    supabase.from('brain_events').insert([{
      module: 'access',
      event_type: `defense:${eventType}`,
      data: data as Record<string, unknown>,
      outcome: 'pending',
    }]).then(() => {});
  } catch (error) {
    console.error('Failed to emit to DEFENSE:', error);
  }
}

/**
 * Receive threat updates from DEFENSE module
 */
export function receiveDefenseThreat(
  targetType: ThreatSignal['target_type'],
  targetId: string,
  severity: ThreatSignal['severity'],
  details: Record<string, unknown>
): void {
  registerThreatSignal({
    source: 'defense',
    signal_type: details.signal_type as string || 'defense_alert',
    severity,
    target_id: targetId,
    target_type: targetType,
    details,
    timestamp: new Date().toISOString(),
  });
}

// ============ Helpers ============

// Usage tracking for compromise detection
const recentUsageByKey = new Map<string, { timestamp: string; ip?: string; module: string; success: boolean }[]>();

function getRecentUsageForKey(keyId: string): { timestamp: string; ip?: string; module: string; success: boolean }[] {
  return recentUsageByKey.get(keyId) || [];
}

export function trackKeyUsage(keyId: string, usage: { ip?: string; module: string; success: boolean }): void {
  const existing = recentUsageByKey.get(keyId) || [];
  existing.push({ ...usage, timestamp: new Date().toISOString() });
  
  // Keep last 100 entries
  if (existing.length > 100) {
    existing.splice(0, existing.length - 100);
  }
  
  recentUsageByKey.set(keyId, existing);
}

async function getDeveloperRoles(developerId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', developerId);
    return (data || []).map(r => r.role);
  } catch {
    return ['user'];
  }
}

async function getDeveloperTier(developerId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('access_subscriptions')
      .select('tier')
      .eq('developer_id', developerId)
      .single();
    return data?.tier || 'free';
  } catch {
    return 'free';
  }
}

async function logAccessAttempt(
  traceId: string,
  request: AccessRequest,
  allowed: boolean,
  failedChecks: string[],
  durationMs: number
): Promise<void> {
  try {
    await supabase.from('access_usage').insert([{
      developer_id: request.developer_id,
      api_key_id: request.api_key_id,
      module: request.module,
      action: request.action,
      compute_ms: Math.round(durationMs),
      metadata: {
        trace_id: traceId,
        allowed,
        failed_checks: failedChecks,
        ip: request.ip_address,
      },
    }]);
  } catch (error) {
    console.error('Failed to log access attempt:', error);
  }
}

// ============ Statistics ============

/**
 * Get integration statistics
 */
export function getIntegrationStats(): {
  active_throttles: number;
  total_threat_signals: number;
  threat_signals_by_severity: Record<string, number>;
  recent_blocked_count: number;
} {
  let totalSignals = 0;
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  
  for (const signals of activeThreatSignals.values()) {
    totalSignals += signals.length;
    for (const s of signals) {
      bySeverity[s.severity] = (bySeverity[s.severity] || 0) + 1;
    }
  }
  
  return {
    active_throttles: throttledEntities.size,
    total_threat_signals: totalSignals,
    threat_signals_by_severity: bySeverity,
    recent_blocked_count: Array.from(throttledEntities.values()).filter(t => t.until > Date.now()).length,
  };
}
