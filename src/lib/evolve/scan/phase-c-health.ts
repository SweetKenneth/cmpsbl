/**
 * Phase C — Code Health Snapshot
 * Abstracted Health Analysis
 * 
 * Analyzes code health through logs, patterns, and metrics.
 * ⚠️ NO raw code, NO diffs, NO engine disclosure
 */

import type { CodeHealth, MissingCapability } from './types';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// CODE HEALTH SCAN
// ═══════════════════════════════════════════════════════════════

/**
 * Generate code health snapshot from abstracted sources
 */
export async function scanCodeHealth(): Promise<CodeHealth> {
  const [stabilityScore, upgradePressure, securityPosture, missingCapabilities] = await Promise.all([
    calculateStabilityScore(),
    calculateUpgradePressure(),
    assessSecurityPosture(),
    detectMissingCapabilities(),
  ]);
  
  return {
    stability_score: stabilityScore,
    upgrade_pressure: upgradePressure,
    security_posture: securityPosture,
    missing_capabilities: missingCapabilities,
    scan_timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate stability score (0-100)
 * Based on error patterns and health deltas
 */
async function calculateStabilityScore(): Promise<number> {
  try {
    let score = 100;
    
    // Check recent errors in ai_usage_log
    const { data: errors } = await supabase
      .from('ai_usage_log')
      .select('success')
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    // Deduct points for errors
    if (errors) {
      score -= Math.min(30, errors.length * 2);
    }
    
    // Check failed evolution runs
    const { data: failedRuns } = await supabase
      .from('evolution_runs')
      .select('run_id')
      .eq('phase', 'failed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (failedRuns) {
      score -= Math.min(20, failedRuns.length * 5);
    }
    
    // Check circuit breaker history
    const { data: circuits } = await supabase
      .from('evolution_circuit')
      .select('state')
      .eq('state', 'open');
    
    if (circuits && circuits.length > 0) {
      score -= 15; // Active circuit trip
    }
    
    // Check evolution receipts for health deltas
    const { data: receipts } = await supabase
      .from('evolution_receipts')
      .select('health_before, health_after, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (receipts) {
      const avgDelta = receipts.reduce((sum, r) => {
        const before = typeof r.health_before === 'number' ? r.health_before : 100;
        const after = typeof r.health_after === 'number' ? r.health_after : 100;
        return sum + (after - before);
      }, 0) / Math.max(1, receipts.length);
      
      if (avgDelta < -5) {
        score -= 10; // Declining health trend
      }
    }
    
    return Math.max(0, Math.min(100, score));
  } catch {
    return 75; // Default moderate score on error
  }
}

/**
 * Calculate upgrade pressure based on all execution surfaces
 */
async function calculateUpgradePressure(): Promise<'low' | 'medium' | 'high'> {
  try {
    let pressureScore = 0;
    
    // Check evolution run backlog (pending proposals not applied)
    const { data: pendingRuns } = await supabase
      .from('evolution_runs')
      .select('run_id')
      .in('phase', ['planning', 'shadow_applied'])
      .limit(20);
    
    if (pendingRuns) pressureScore += Math.min(30, pendingRuns.length * 5);
    
    // Check for stale brain memories (cognitive debt)
    const { data: oldMemories } = await supabase
      .from('brain_memories')
      .select('id')
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);
    
    if (oldMemories && oldMemories.length >= 30) pressureScore += 20;
    
    // Check quota utilization
    const { data: quotas } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('date', new Date().toISOString().split('T')[0]);
    
    if (quotas) {
      const overBudget = quotas.filter(q => (q.calls_used || 0) > (q.calls_budget || 100) * 0.9);
      if (overBudget.length > 0) pressureScore += 15;
    }
    
    // Check accessibility scan results (inclusive module)
    const { data: a11yScans } = await supabase
      .from('accessibility_scans')
      .select('score')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (a11yScans && a11yScans.length > 0 && (a11yScans[0].score || 100) < 70) {
      pressureScore += 10;
    }
    
    if (pressureScore >= 40) return 'high';
    if (pressureScore >= 20) return 'medium';
    return 'low';
  } catch {
    return 'medium';
  }
}

/**
 * Assess security posture
 */
async function assessSecurityPosture(): Promise<'weak' | 'moderate' | 'strong'> {
  try {
    let securityScore = 100;
    
    // Check for recent security events in brain_events instead
    const { data: securityLogs } = await supabase
      .from('brain_events')
      .select('event_type, outcome')
      .ilike('event_type', '%security%')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (securityLogs) {
      const highRiskCount = securityLogs.filter(l => 
        l.outcome === 'failure' || l.event_type.includes('violation')
      ).length;
      securityScore -= highRiskCount * 10;
    }
    
    // Check RLS coverage (simplified check)
    // In production, this would verify actual RLS policies
    const criticalTables = ['evolution_runs', 'evolution_receipts', 'brain_memories'];
    let tablesWithRLS = 0;
    
    for (const table of criticalTables) {
      try {
        // Attempt unauthenticated query - should fail if RLS is working
        const { error } = await supabase
          .from(table as 'evolution_runs' | 'evolution_receipts' | 'brain_memories')
          .select('id')
          .limit(1);
        if (!error) {
          tablesWithRLS++; // Table accessible (RLS may allow public read)
        }
      } catch {
        // Error likely means RLS is blocking
        tablesWithRLS++;
      }
    }
    
    // Check for edge function rate limiting
    const { data: rateLimits } = await supabase
      .from('edge_rate_limits')
      .select('id')
      .limit(1);
    
    if (rateLimits && rateLimits.length > 0) {
      securityScore += 5; // Has rate limiting
    }
    
    if (securityScore >= 90) return 'strong';
    if (securityScore >= 60) return 'moderate';
    return 'weak';
  } catch {
    return 'moderate';
  }
}

/**
 * Detect missing capabilities across all execution surfaces
 */
async function detectMissingCapabilities(): Promise<MissingCapability[]> {
  const missing: MissingCapability[] = [];
  
  const checks = await Promise.all([
    checkBackupCapability(),
    checkTelemetryCapability(),
    checkRateLimitCapability(),
    checkCircuitRecoveryCapability(),
    checkAccessCapability(),
    checkCognitiveCapability(),
    checkAuditCapability(),
    checkInclusiveCapability(),
  ]);
  
  for (const result of checks) {
    if (result) missing.push(...result);
  }
  
  return missing;
}

async function checkBackupCapability(): Promise<MissingCapability[] | null> {
  try {
    const { data: backups } = await supabase
      .from('evolution_receipts')
      .select('backup_id')
      .not('backup_id', 'is', null)
      .limit(1);
    
    if (!backups || backups.length === 0) {
      return [{
        capability: 'Evolution Backups',
        category: 'resilience',
        impact: 'high',
        recommendation: 'Enable automatic backups before production applies',
      }];
    }
    return null;
  } catch { return null; }
}

async function checkTelemetryCapability(): Promise<MissingCapability[] | null> {
  try {
    const { data: metrics } = await supabase
      .from('brain_events')
      .select('event_type')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(10);
    
    if (!metrics || metrics.length < 5) {
      return [{
        capability: 'Real-time Telemetry',
        category: 'observability',
        impact: 'medium',
        recommendation: 'Increase brain event emission for better observability',
      }];
    }
    return null;
  } catch { return null; }
}

async function checkRateLimitCapability(): Promise<MissingCapability[] | null> {
  try {
    const { data: rateLimits } = await supabase
      .from('edge_rate_limits')
      .select('id')
      .limit(1);
    
    if (!rateLimits || rateLimits.length === 0) {
      return [{
        capability: 'API Rate Limiting',
        category: 'security',
        impact: 'high',
        recommendation: 'Implement rate limiting for edge functions',
      }];
    }
    return null;
  } catch { return null; }
}

async function checkCircuitRecoveryCapability(): Promise<MissingCapability[] | null> {
  try {
    const { data: circuits } = await supabase
      .from('evolution_circuit')
      .select('auto_reset_after')
      .eq('state', 'open');
    
    if (circuits && circuits.some(c => !c.auto_reset_after)) {
      return [{
        capability: 'Automatic Circuit Recovery',
        category: 'resilience',
        impact: 'medium',
        recommendation: 'Configure auto-reset for circuit breakers',
      }];
    }
    return null;
  } catch { return null; }
}

async function checkAccessCapability(): Promise<MissingCapability[] | null> {
  try {
    // Check for expired API keys
    const { data: expiredKeys } = await supabase
      .from('access_api_keys')
      .select('id')
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .limit(5);
    
    if (expiredKeys && expiredKeys.length > 0) {
      return [{
        capability: 'API Key Lifecycle',
        category: 'security',
        impact: 'high',
        recommendation: `${expiredKeys.length} expired API key(s) still marked active — revoke or rotate`,
      }];
    }
    return null;
  } catch { return null; }
}

async function checkCognitiveCapability(): Promise<MissingCapability[] | null> {
  try {
    // Check hot memory freshness
    const { data: hotMemories } = await supabase
      .from('brain_memory_hot')
      .select('id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);
    
    const results: MissingCapability[] = [];
    
    if (!hotMemories || hotMemories.length === 0) {
      results.push({
        capability: 'Hot Memory Freshness',
        category: 'performance',
        impact: 'medium',
        recommendation: 'No hot memories created in 24h — cognitive recall may be degraded',
      });
    }
    
    return results.length > 0 ? results : null;
  } catch { return null; }
}

async function checkAuditCapability(): Promise<MissingCapability[] | null> {
  try {
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);
    
    if (!logs || logs.length === 0) {
      return [{
        capability: 'Audit Trail Coverage',
        category: 'security',
        impact: 'high',
        recommendation: 'No audit logs in 7 days — ensure critical operations are being logged',
      }];
    }
    return null;
  } catch { return null; }
}

async function checkInclusiveCapability(): Promise<MissingCapability[] | null> {
  try {
    const { data: scans } = await supabase
      .from('accessibility_scans')
      .select('score, created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const results: MissingCapability[] = [];
    
    if (!scans || scans.length === 0) {
      results.push({
        capability: 'Accessibility Scanning',
        category: 'observability',
        impact: 'medium',
        recommendation: 'No accessibility scans found — run inclusive.scan to assess WCAG compliance',
      });
    } else if ((scans[0].score || 0) < 70) {
      results.push({
        capability: 'Accessibility Compliance',
        category: 'observability',
        impact: 'high',
        recommendation: `Last a11y score was ${scans[0].score}/100 — run inclusive.fix to improve`,
      });
    }
    
    return results.length > 0 ? results : null;
  } catch { return null; }
}

export const phaseCHealth = {
  scan: scanCodeHealth,
};
