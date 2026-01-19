/**
 * PromptFluid Defense Core Engine
 * Real-time threat detection and risk scoring
 */

import { supabase } from '@/integrations/supabase/client';

export interface DefenseEvent {
  ip: string;
  user_agent?: string;
  endpoint: string;
  risk_score: number;
  action: 'allow' | 'challenge' | 'block' | 'monitor';
  reason: string;
  metadata?: Record<string, any>;
  session_id?: string;
  fingerprint_hash?: string;
}

export interface RiskAnalysis {
  score: number;
  factors: string[];
  action: 'allow' | 'challenge' | 'block' | 'monitor';
  reason: string;
}

/**
 * Analyze request and calculate risk score
 */
export async function analyzeRequest(
  ip: string,
  userAgent: string,
  endpoint: string,
  metadata?: Record<string, any>
): Promise<RiskAnalysis> {
  const factors: string[] = [];
  let score = 0;

  // Check IP reputation
  try {
    const { data: ipRep } = await supabase
      .from('ip_reputation')
      .select('score')
      .eq('ip', ip)
      .maybeSingle();

    if (ipRep && ipRep.score < 30) {
      score += 40;
      factors.push('Low IP reputation');
    } else if (ipRep && ipRep.score < 60) {
      score += 20;
      factors.push('Medium IP reputation');
    }
  } catch (err) {
    // Only log in development - silent fail in production
    if (import.meta.env.DEV) {
      console.log('IP reputation check failed:', err);
    }
  }

  // Check user agent
  if (!userAgent || userAgent.length < 10) {
    score += 30;
    factors.push('Missing or suspicious user agent');
  } else if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    score += 25;
    factors.push('Bot-like user agent');
  }

  // Check endpoint patterns
  if (/admin|config|\.env|backup|sql/i.test(endpoint)) {
    score += 35;
    factors.push('Suspicious endpoint access');
  }

  // Additional metadata checks
  if (metadata?.failed_attempts && metadata.failed_attempts > 3) {
    score += 20;
    factors.push('Multiple failed attempts');
  }

  // Determine action based on score
  let action: 'allow' | 'challenge' | 'block' | 'monitor';
  let reason: string;

  if (score >= 80) {
    action = 'block';
    reason = 'High risk detected: ' + factors.join(', ');
  } else if (score >= 50) {
    action = 'challenge';
    reason = 'Medium risk detected: ' + factors.join(', ');
  } else if (score >= 30) {
    action = 'monitor';
    reason = 'Low risk detected: ' + factors.join(', ');
  } else {
    action = 'allow';
    reason = 'Request appears safe';
  }

  return { score, factors, action, reason };
}

/**
 * Log defense event
 */
export async function logDefenseEvent(event: DefenseEvent): Promise<void> {
  try {
    const { error } = await supabase
      .from('defense_events')
      .insert({
        ip: event.ip,
        action: event.action,
        risk_score: event.risk_score,
        endpoint: event.endpoint,
        user_agent: event.user_agent,
        reason: event.reason,
        session_id: event.session_id,
        fingerprint_hash: event.fingerprint_hash,
        metadata: event.metadata || {}
      });

    if (error && import.meta.env.DEV) {
      console.error('Failed to log defense event:', error);
    }

    // Update IP reputation
    await supabase.rpc('update_ip_reputation', {
      p_ip: event.ip,
      p_action: event.action,
      p_risk_score: event.risk_score,
    });
  } catch (error) {
    // Only log in development - silent fail in production
    if (import.meta.env.DEV) {
      console.error('Defense event logging error:', error);
    }
  }
}

/**
 * Get defense statistics
 */
export async function getDefenseStats(range: '1h' | '24h' | '7d' | '30d' = '24h') {
  const hoursMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
  const hours = hoursMap[range];
  
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - hours);

  const { data: events } = await supabase
    .from('defense_events')
    .select('*')
    .gte('detected_at', startTime.toISOString());

  if (!events || events.length === 0) return null;

  const threatsBlocked = events.filter(e => e.action === 'block').length;
  const challengesIssued = events.filter(e => e.action === 'challenge').length;
  const avgRisk = events.reduce((sum, e) => sum + (e.risk_score || 0), 0) / events.length;

  // Calculate IP counts
  const ipCounts: Record<string, number> = {};
  events.forEach(e => {
    ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1;
  });
  const topIPs = Object.entries(ipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));

  // Action distribution
  const actionDist = {
    allow: events.filter(e => e.action === 'allow').length,
    block: threatsBlocked,
    challenge: challengesIssued,
    monitor: events.filter(e => e.action === 'monitor').length,
  };

  return {
    total_events: events.length,
    threats_blocked: threatsBlocked,
    challenges_issued: challengesIssued,
    avg_risk_score: Math.round(avgRisk),
    false_positives: 0,
    timeRange: range,
    top_ips: topIPs,
    action_distribution: actionDist,
  };
}

/**
 * Get recent defense events
 */
export async function getRecentEvents(limit: number = 50) {
  const { data, error } = await supabase
    .from('defense_events')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to fetch defense events:', error);
    }
    return [];
  }

  return data || [];
}

/**
 * Get active defense rules
 */
export async function getDefenseRules() {
  // Placeholder for future defense_rules table
  return [];
}
