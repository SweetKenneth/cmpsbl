/**
 * ACCESS API Key Lifecycle Manager
 * Automated rotation, compromise detection, and security scoring
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface KeyRotationPolicy {
  key_id: string;
  rotation_interval_days: number;
  last_rotated_at: string | null;
  next_rotation_at: string;
  auto_rotate: boolean;
  grace_period_hours: number;
  notify_before_days: number;
  status: 'active' | 'pending_rotation' | 'grace_period' | 'expired';
}

export interface KeySecurityScore {
  key_id: string;
  overall_score: number; // 0-100
  factors: {
    age_score: number;
    usage_pattern_score: number;
    scope_score: number;
    rotation_compliance_score: number;
    compromise_indicator_score: number;
  };
  recommendations: string[];
  last_evaluated_at: string;
}

export interface CompromiseSignal {
  signal_type: 'rate_spike' | 'error_spike' | 'geo_anomaly' | 'concurrent_usage' | 'scope_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_at: string;
  details: Record<string, unknown>;
  confidence: number; // 0-1
}

export interface KeyUsagePattern {
  key_id: string;
  avg_daily_calls: number;
  peak_hourly_calls: number;
  error_rate: number;
  unique_ips_24h: number;
  last_used_at: string | null;
  typical_hours: number[]; // 0-23
  typical_modules: string[];
}

// ============ In-Memory Tracking ============

const rotationPolicies = new Map<string, KeyRotationPolicy>();
const securityScores = new Map<string, KeySecurityScore>();
const compromiseSignals = new Map<string, CompromiseSignal[]>();
const usagePatterns = new Map<string, KeyUsagePattern>();

const DEFAULT_ROTATION_DAYS = 90;
const MAX_KEY_AGE_DAYS = 365;
const GRACE_PERIOD_HOURS = 24;

// ============ Rotation Policy Management ============

/**
 * Create or update rotation policy for a key
 */
export function setRotationPolicy(
  keyId: string,
  options?: Partial<Omit<KeyRotationPolicy, 'key_id' | 'status'>>
): KeyRotationPolicy {
  const existing = rotationPolicies.get(keyId);
  const now = new Date();
  
  const policy: KeyRotationPolicy = {
    key_id: keyId,
    rotation_interval_days: options?.rotation_interval_days ?? existing?.rotation_interval_days ?? DEFAULT_ROTATION_DAYS,
    last_rotated_at: options?.last_rotated_at ?? existing?.last_rotated_at ?? now.toISOString(),
    next_rotation_at: options?.next_rotation_at ?? calculateNextRotation(
      options?.last_rotated_at ?? now.toISOString(),
      options?.rotation_interval_days ?? DEFAULT_ROTATION_DAYS
    ),
    auto_rotate: options?.auto_rotate ?? existing?.auto_rotate ?? false,
    grace_period_hours: options?.grace_period_hours ?? existing?.grace_period_hours ?? GRACE_PERIOD_HOURS,
    notify_before_days: options?.notify_before_days ?? existing?.notify_before_days ?? 7,
    status: 'active',
  };
  
  // Determine status based on dates
  const nextRotation = new Date(policy.next_rotation_at);
  const gracePeriodEnd = new Date(nextRotation.getTime() + policy.grace_period_hours * 3600000);
  
  if (now > gracePeriodEnd) {
    policy.status = 'expired';
  } else if (now > nextRotation) {
    policy.status = 'grace_period';
  } else if (now.getTime() + policy.notify_before_days * 86400000 > nextRotation.getTime()) {
    policy.status = 'pending_rotation';
  }
  
  rotationPolicies.set(keyId, policy);
  return policy;
}

function calculateNextRotation(lastRotated: string, intervalDays: number): string {
  const last = new Date(lastRotated);
  return new Date(last.getTime() + intervalDays * 86400000).toISOString();
}

/**
 * Get keys requiring rotation
 */
export function getKeysRequiringRotation(): KeyRotationPolicy[] {
  return Array.from(rotationPolicies.values())
    .filter(p => p.status === 'pending_rotation' || p.status === 'grace_period' || p.status === 'expired');
}

/**
 * Get rotation policy for a key
 */
export function getRotationPolicy(keyId: string): KeyRotationPolicy | undefined {
  return rotationPolicies.get(keyId);
}

// ============ Security Scoring ============

/**
 * Calculate security score for an API key
 */
export async function calculateKeySecurityScore(keyId: string): Promise<KeySecurityScore> {
  const recommendations: string[] = [];
  
  // Get key metadata
  const { data: keyData } = await supabase
    .from('access_api_keys')
    .select('created_at, last_used_at, scopes, is_active')
    .eq('id', keyId)
    .single();
  
  // Age score (newer is better, max 90 days ideal)
  let ageScore = 100;
  if (keyData?.created_at) {
    const ageDays = (Date.now() - new Date(keyData.created_at).getTime()) / 86400000;
    if (ageDays > MAX_KEY_AGE_DAYS) {
      ageScore = 0;
      recommendations.push('Key exceeds maximum age. Immediate rotation required.');
    } else if (ageDays > DEFAULT_ROTATION_DAYS) {
      ageScore = Math.max(0, 100 - (ageDays - DEFAULT_ROTATION_DAYS));
      recommendations.push('Key approaching maximum age. Schedule rotation soon.');
    }
  }
  
  // Usage pattern score
  const pattern = usagePatterns.get(keyId);
  let usagePatternScore = 80; // Default good score
  if (pattern) {
    if (pattern.error_rate > 0.3) {
      usagePatternScore -= 30;
      recommendations.push('High error rate detected. Review API usage.');
    }
    if (pattern.unique_ips_24h > 10) {
      usagePatternScore -= 20;
      recommendations.push('Key used from many IPs. Consider IP restrictions.');
    }
  }
  
  // Scope score (fewer scopes is better)
  let scopeScore = 100;
  const scopes = keyData?.scopes as string[] || [];
  if (scopes.includes('admin') || scopes.includes('full')) {
    scopeScore = 50;
    recommendations.push('Key has admin/full scope. Apply principle of least privilege.');
  } else if (scopes.length > 3) {
    scopeScore = 70;
    recommendations.push('Key has broad permissions. Consider scope reduction.');
  }
  
  // Rotation compliance score
  const policy = rotationPolicies.get(keyId);
  let rotationScore = policy ? 100 : 50;
  if (policy) {
    if (policy.status === 'expired') {
      rotationScore = 0;
      recommendations.push('Key rotation overdue. Rotate immediately.');
    } else if (policy.status === 'grace_period') {
      rotationScore = 30;
      recommendations.push('Key in grace period. Complete rotation now.');
    } else if (policy.status === 'pending_rotation') {
      rotationScore = 70;
    }
  } else {
    recommendations.push('No rotation policy configured. Set up automated rotation.');
  }
  
  // Compromise indicator score
  const signals = compromiseSignals.get(keyId) || [];
  let compromiseScore = 100;
  const recentSignals = signals.filter(s => 
    Date.now() - new Date(s.detected_at).getTime() < 86400000 * 7
  );
  
  for (const signal of recentSignals) {
    if (signal.severity === 'critical') {
      compromiseScore -= 50;
    } else if (signal.severity === 'high') {
      compromiseScore -= 30;
    } else if (signal.severity === 'medium') {
      compromiseScore -= 15;
    } else {
      compromiseScore -= 5;
    }
  }
  compromiseScore = Math.max(0, compromiseScore);
  
  if (compromiseScore < 70) {
    recommendations.push('Multiple compromise indicators detected. Review and consider revocation.');
  }
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    ageScore * 0.2 +
    usagePatternScore * 0.2 +
    scopeScore * 0.2 +
    rotationScore * 0.25 +
    compromiseScore * 0.15
  );
  
  const score: KeySecurityScore = {
    key_id: keyId,
    overall_score: overallScore,
    factors: {
      age_score: ageScore,
      usage_pattern_score: usagePatternScore,
      scope_score: scopeScore,
      rotation_compliance_score: rotationScore,
      compromise_indicator_score: compromiseScore,
    },
    recommendations,
    last_evaluated_at: new Date().toISOString(),
  };
  
  securityScores.set(keyId, score);
  return score;
}

/**
 * Get security score for a key
 */
export function getKeySecurityScore(keyId: string): KeySecurityScore | undefined {
  return securityScores.get(keyId);
}

// ============ Compromise Detection ============

/**
 * Record a compromise signal
 */
export function recordCompromiseSignal(
  keyId: string,
  signal: Omit<CompromiseSignal, 'detected_at'>
): void {
  const existing = compromiseSignals.get(keyId) || [];
  existing.push({
    ...signal,
    detected_at: new Date().toISOString(),
  });
  
  // Keep last 100 signals
  if (existing.length > 100) {
    existing.splice(0, existing.length - 100);
  }
  
  compromiseSignals.set(keyId, existing);
  
  // Log critical signals
  if (signal.severity === 'critical') {
    logSecurityEvent(keyId, 'critical_compromise_signal', signal);
  }
}

/**
 * Analyze usage for compromise indicators
 */
export async function analyzeForCompromise(
  keyId: string,
  recentUsage: { timestamp: string; ip?: string; module: string; success: boolean }[]
): Promise<CompromiseSignal[]> {
  const detectedSignals: CompromiseSignal[] = [];
  const pattern = usagePatterns.get(keyId);
  
  // Rate spike detection
  const recentHourCalls = recentUsage.filter(u => 
    Date.now() - new Date(u.timestamp).getTime() < 3600000
  ).length;
  
  if (pattern && recentHourCalls > pattern.peak_hourly_calls * 3) {
    detectedSignals.push({
      signal_type: 'rate_spike',
      severity: recentHourCalls > pattern.peak_hourly_calls * 10 ? 'critical' : 'high',
      detected_at: new Date().toISOString(),
      details: { 
        current_rate: recentHourCalls, 
        typical_peak: pattern.peak_hourly_calls,
        multiplier: recentHourCalls / pattern.peak_hourly_calls,
      },
      confidence: 0.8,
    });
  }
  
  // Error spike detection
  const recentErrors = recentUsage.filter(u => !u.success);
  const errorRate = recentUsage.length > 0 ? recentErrors.length / recentUsage.length : 0;
  
  if (errorRate > 0.5 && recentUsage.length > 10) {
    detectedSignals.push({
      signal_type: 'error_spike',
      severity: errorRate > 0.8 ? 'high' : 'medium',
      detected_at: new Date().toISOString(),
      details: { error_rate: errorRate, sample_size: recentUsage.length },
      confidence: 0.7,
    });
  }
  
  // Geo anomaly (unique IPs)
  const uniqueIps = new Set(recentUsage.map(u => u.ip).filter(Boolean));
  if (uniqueIps.size > 15) {
    detectedSignals.push({
      signal_type: 'geo_anomaly',
      severity: uniqueIps.size > 30 ? 'high' : 'medium',
      detected_at: new Date().toISOString(),
      details: { unique_ips: uniqueIps.size },
      confidence: 0.6,
    });
  }
  
  // Record all detected signals
  for (const signal of detectedSignals) {
    recordCompromiseSignal(keyId, signal);
  }
  
  return detectedSignals;
}

/**
 * Get compromise signals for a key
 */
export function getCompromiseSignals(keyId: string, since?: string): CompromiseSignal[] {
  const signals = compromiseSignals.get(keyId) || [];
  if (since) {
    const sinceDate = new Date(since);
    return signals.filter(s => new Date(s.detected_at) >= sinceDate);
  }
  return signals;
}

// ============ Usage Pattern Tracking ============

/**
 * Update usage pattern for a key
 */
export function updateUsagePattern(
  keyId: string,
  usage: { module: string; success: boolean; ip?: string; timestamp: string }
): void {
  const existing = usagePatterns.get(keyId) || {
    key_id: keyId,
    avg_daily_calls: 0,
    peak_hourly_calls: 0,
    error_rate: 0,
    unique_ips_24h: 0,
    last_used_at: null,
    typical_hours: [],
    typical_modules: [],
  };
  
  // Update last used
  existing.last_used_at = usage.timestamp;
  
  // Track typical hours
  const hour = new Date(usage.timestamp).getHours();
  if (!existing.typical_hours.includes(hour)) {
    existing.typical_hours.push(hour);
    if (existing.typical_hours.length > 12) {
      existing.typical_hours.shift();
    }
  }
  
  // Track typical modules
  if (!existing.typical_modules.includes(usage.module)) {
    existing.typical_modules.push(usage.module);
    if (existing.typical_modules.length > 10) {
      existing.typical_modules.shift();
    }
  }
  
  usagePatterns.set(keyId, existing);
}

/**
 * Get usage pattern for a key
 */
export function getUsagePattern(keyId: string): KeyUsagePattern | undefined {
  return usagePatterns.get(keyId);
}

// ============ Emergency Operations ============

/**
 * Emergency key lockdown
 */
export async function emergencyLockdown(
  keyId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Revoke key immediately
    const { error } = await supabase
      .from('access_api_keys')
      .update({ is_active: false })
      .eq('id', keyId);
    
    if (error) throw error;
    
    // Record signal
    recordCompromiseSignal(keyId, {
      signal_type: 'scope_escalation',
      severity: 'critical',
      details: { action: 'emergency_lockdown', reason },
      confidence: 1.0,
    });
    
    // Log event
    await logSecurityEvent(keyId, 'emergency_lockdown', { reason });
    
    return { success: true };
  } catch (error) {
    console.error('Emergency lockdown failed:', error);
    return { success: false, error: String(error) };
  }
}

// ============ Helpers ============

async function logSecurityEvent(
  keyId: string,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('brain_events').insert([{
      module: 'access',
      event_type: `security:${eventType}`,
      data: { key_id: keyId, ...details },
      outcome: 'logged',
    }]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Get overall key health summary
 */
export async function getKeyHealthSummary(): Promise<{
  total_keys: number;
  healthy_count: number;
  at_risk_count: number;
  critical_count: number;
  avg_security_score: number;
  pending_rotations: number;
}> {
  let healthy = 0;
  let atRisk = 0;
  let critical = 0;
  let totalScore = 0;
  
  for (const score of securityScores.values()) {
    totalScore += score.overall_score;
    if (score.overall_score >= 80) healthy++;
    else if (score.overall_score >= 50) atRisk++;
    else critical++;
  }
  
  const pendingRotations = getKeysRequiringRotation().length;
  
  return {
    total_keys: securityScores.size,
    healthy_count: healthy,
    at_risk_count: atRisk,
    critical_count: critical,
    avg_security_score: securityScores.size > 0 ? Math.round(totalScore / securityScores.size) : 100,
    pending_rotations: pendingRotations,
  };
}
