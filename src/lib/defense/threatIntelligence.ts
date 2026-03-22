/**
 * DEFENSE Threat Intelligence Engine
 * Attack Detection & IP Reputation
 * 
 * Threat intelligence with IP reputation,
 * attack pattern detection, and proactive threat assessment.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ThreatIndicator {
  type: 'ip' | 'pattern' | 'behavior' | 'signature';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  hitCount: number;
  tags: string[];
  source: string;
}

export interface IPReputation {
  ip: string;
  score: number; // 0-100, higher is more trustworthy
  category: 'clean' | 'suspicious' | 'malicious' | 'unknown';
  threats: string[];
  lastUpdated: string;
  geo?: {
    country: string;
    region?: string;
    city?: string;
  };
  asn?: {
    number: number;
    name: string;
  };
}

export interface AttackPattern {
  id: string;
  name: string;
  type: 'brute_force' | 'injection' | 'dos' | 'scanning' | 'credential_stuffing' | 'api_abuse';
  signature: RegExp | string;
  threshold: number;
  window: number; // seconds
  action: 'log' | 'rate_limit' | 'block' | 'challenge';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ThreatDetection {
  detected: boolean;
  pattern?: AttackPattern;
  confidence: number;
  indicators: ThreatIndicator[];
  recommendedAction: 'allow' | 'monitor' | 'rate_limit' | 'block';
  details: string;
}

export interface ThreatReport {
  period: 'hour' | 'day' | 'week';
  totalThreats: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  topAttackers: Array<{ ip: string; count: number }>;
  blockedRequests: number;
  mitigationActions: number;
}

// In-memory threat intelligence cache — bounded
const MAX_IP_REPUTATION_CACHE = 5000;
const MAX_THREAT_INDICATORS = 2000;
const MAX_RECENT_REQUESTS = 5000;
const ipReputationCache = new Map<string, IPReputation>();
const threatIndicators = new Map<string, ThreatIndicator>();
const recentRequests = new Map<string, Array<{ timestamp: number; path: string }>>();

// Pre-compiled attack pattern definitions — regex compiled once at module load
const ATTACK_PATTERNS: AttackPattern[] = [
  {
    id: 'brute_force_login',
    name: 'Brute Force Login Attempt',
    type: 'brute_force',
    signature: /\/auth|\/login|\/signin/i,
    threshold: 10,
    window: 60,
    action: 'block',
    severity: 'high',
  },
  {
    id: 'sql_injection',
    name: 'SQL Injection Attempt',
    type: 'injection',
    signature: /('|\\"|;|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b)/i,
    threshold: 1,
    window: 1,
    action: 'block',
    severity: 'critical',
  },
  {
    id: 'path_traversal',
    name: 'Path Traversal Attempt',
    type: 'injection',
    signature: /(\.\.|%2e%2e|%252e)/i,
    threshold: 1,
    window: 1,
    action: 'block',
    severity: 'high',
  },
  {
    id: 'api_scanning',
    name: 'API Endpoint Scanning',
    type: 'scanning',
    signature: /\.well-known|\/api\/|\/admin|\/debug/i,
    threshold: 20,
    window: 60,
    action: 'rate_limit',
    severity: 'medium',
  },
  {
    id: 'high_frequency',
    name: 'High Frequency Requests',
    type: 'dos',
    signature: '*',
    threshold: 100,
    window: 60,
    action: 'rate_limit',
    severity: 'medium',
  },
  {
    id: 'credential_stuffing',
    name: 'Credential Stuffing',
    type: 'credential_stuffing',
    signature: /\/auth\/login/i,
    threshold: 5,
    window: 300,
    action: 'challenge',
    severity: 'high',
  },
];

// Known malicious IPs (would be populated from external feed in production)
const knownMaliciousIPs = new Set<string>();

// ═══════════════════════════════════════════════════════════════════════════════
// THREAT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze a request for threats
 */
export async function analyzeRequest(request: {
  ip: string;
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  userAgent?: string;
}): Promise<ThreatDetection> {
  const indicators: ThreatIndicator[] = [];
  let confidence = 0;
  let detectedPattern: AttackPattern | undefined;

  // Check IP reputation
  const ipRep = await getIPReputation(request.ip);
  if (ipRep.category === 'malicious') {
    indicators.push({
      type: 'ip',
      value: request.ip,
      severity: 'critical',
      confidence: 0.95,
      firstSeen: ipRep.lastUpdated,
      lastSeen: new Date().toISOString(),
      hitCount: 1,
      tags: ipRep.threats,
      source: 'ip_reputation',
    });
    confidence = Math.max(confidence, 0.9);
  } else if (ipRep.category === 'suspicious') {
    indicators.push({
      type: 'ip',
      value: request.ip,
      severity: 'medium',
      confidence: 0.6,
      firstSeen: ipRep.lastUpdated,
      lastSeen: new Date().toISOString(),
      hitCount: 1,
      tags: ipRep.threats,
      source: 'ip_reputation',
    });
    confidence = Math.max(confidence, 0.5);
  }

  // Check against attack patterns
  for (const pattern of ATTACK_PATTERNS) {
    if (matchesPattern(request, pattern)) {
      // Check threshold
      const recentCount = countRecentRequests(request.ip, pattern.window);
      
      if (recentCount >= pattern.threshold) {
        detectedPattern = pattern;
        indicators.push({
          type: 'pattern',
          value: pattern.id,
          severity: pattern.severity,
          confidence: 0.85,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          hitCount: recentCount,
          tags: [pattern.type],
          source: 'pattern_matching',
        });
        confidence = Math.max(confidence, severityToConfidence(pattern.severity));
        break;
      }
    }
  }

  // Check for injection in body
  if (request.body) {
    const injectionCheck = detectInjection(request.body);
    if (injectionCheck.detected) {
      indicators.push({
        type: 'signature',
        value: injectionCheck.type,
        severity: 'critical',
        confidence: 0.9,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        hitCount: 1,
        tags: ['injection', injectionCheck.type],
        source: 'payload_analysis',
      });
      confidence = Math.max(confidence, 0.9);
    }
  }

  // Record request for rate limiting
  recordRequest(request.ip, request.path);

  // Determine recommended action
  let recommendedAction: ThreatDetection['recommendedAction'] = 'allow';
  if (confidence >= 0.9) {
    recommendedAction = 'block';
  } else if (confidence >= 0.7) {
    recommendedAction = 'rate_limit';
  } else if (confidence >= 0.3) {
    recommendedAction = 'monitor';
  }

  // Log threat detection if significant
  if (indicators.length > 0) {
    await logThreatDetection(request, indicators, recommendedAction);
  }

  return {
    detected: indicators.length > 0,
    pattern: detectedPattern,
    confidence,
    indicators,
    recommendedAction,
    details: indicators.length > 0
      ? `Detected ${indicators.length} threat indicator(s): ${indicators.map(i => i.type).join(', ')}`
      : 'No threats detected',
  };
}

/**
 * Get IP reputation
 */
export async function getIPReputation(ip: string): Promise<IPReputation> {
  // Check cache first
  if (ipReputationCache.has(ip)) {
    return ipReputationCache.get(ip)!;
  }

  // Check known malicious list
  if (knownMaliciousIPs.has(ip)) {
    const rep: IPReputation = {
      ip,
      score: 0,
      category: 'malicious',
      threats: ['known_attacker'],
      lastUpdated: new Date().toISOString(),
    };
    ipReputationCache.set(ip, rep);
    return rep;
  }

  // Default to unknown
  const rep: IPReputation = {
    ip,
    score: 50,
    category: 'unknown',
    threats: [],
    lastUpdated: new Date().toISOString(),
  };
  
  ipReputationCache.set(ip, rep);
  // Bound cache
  if (ipReputationCache.size > MAX_IP_REPUTATION_CACHE) {
    const oldest = ipReputationCache.keys().next().value;
    if (oldest) ipReputationCache.delete(oldest);
  }
  return rep;
}

/**
 * Update IP reputation based on behavior
 */
export function updateIPReputation(
  ip: string,
  adjustment: number,
  reason: string
): void {
  const current = ipReputationCache.get(ip) || {
    ip,
    score: 50,
    category: 'unknown' as const,
    threats: [],
    lastUpdated: new Date().toISOString(),
  };

  current.score = Math.max(0, Math.min(100, current.score + adjustment));
  current.lastUpdated = new Date().toISOString();

  if (adjustment < 0) {
    if (!current.threats.includes(reason)) {
      current.threats.push(reason);
    }
  }

  // Update category based on score
  if (current.score < 20) {
    current.category = 'malicious';
  } else if (current.score < 50) {
    current.category = 'suspicious';
  } else if (current.score >= 80) {
    current.category = 'clean';
  }

  ipReputationCache.set(ip, current);
}

/**
 * Add IP to blocklist
 */
export function blockIP(ip: string, reason: string): void {
  knownMaliciousIPs.add(ip);
  updateIPReputation(ip, -100, reason);
}

/**
 * Remove IP from blocklist
 */
export function unblockIP(ip: string): void {
  knownMaliciousIPs.delete(ip);
  ipReputationCache.delete(ip);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate threat report
 */
export async function generateThreatReport(
  period: 'hour' | 'day' | 'week'
): Promise<ThreatReport> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
  }

  // Query threat events
  const { data: events } = await supabase
    .from('brain_events')
    .select('*')
    .eq('module', 'defense')
    .eq('event_type', 'threat.detected')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const byType: Record<string, number> = {};
  const attackerCounts: Record<string, number> = {};
  let blockedRequests = 0;
  let mitigationActions = 0;

  for (const event of events || []) {
    const data = event.data as any;
    
    if (data?.severity) {
      bySeverity[data.severity] = (bySeverity[data.severity] ?? 0) + 1;
    }
    if (data?.type) {
      byType[data.type] = (byType[data.type] ?? 0) + 1;
    }
    if (data?.ip) {
      attackerCounts[data.ip] = (attackerCounts[data.ip] ?? 0) + 1;
    }
    if (data?.action === 'block') {
      blockedRequests++;
    }
    if (data?.action && data.action !== 'allow') {
      mitigationActions++;
    }
  }

  const topAttackers = Object.entries(attackerCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    period,
    totalThreats: events?.length ?? 0,
    bySeverity,
    byType,
    topAttackers,
    blockedRequests,
    mitigationActions,
  };
}

/**
 * Get active threat indicators
 */
export function getActiveThreatIndicators(): ThreatIndicator[] {
  return Array.from(threatIndicators.values())
    .sort((a, b) => severityToConfidence(b.severity) - severityToConfidence(a.severity));
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function matchesPattern(request: { path: string; body?: string }, pattern: AttackPattern): boolean {
  if (pattern.signature === '*') return true;
  
  // All signatures are now pre-compiled RegExp at module load
  if (pattern.signature instanceof RegExp) {
    return pattern.signature.test(request.path) || 
           !!(request.body && pattern.signature.test(request.body));
  }
  
  return false;
}

function countRecentRequests(ip: string, windowSeconds: number): number {
  const requests = recentRequests.get(ip);
  if (!requests || requests.length === 0) return 0;
  const cutoff = Date.now() - windowSeconds * 1000;
  // Binary search for cutoff since timestamps are insertion-ordered (ascending)
  let lo = 0, hi = requests.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (requests[mid].timestamp <= cutoff) lo = mid + 1;
    else hi = mid;
  }
  return requests.length - lo;
}

function recordRequest(ip: string, path: string): void {
  let requests = recentRequests.get(ip);
  if (!requests) {
    requests = [];
    recentRequests.set(ip, requests);
  }
  requests.push({ timestamp: Date.now(), path });
  
  // Prune stale entries periodically (every 50 inserts) instead of every call
  if (requests.length % 50 === 0) {
    const cutoff = Date.now() - 5 * 60 * 1000;
    // Find first valid index via binary search
    let lo = 0, hi = requests.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (requests[mid].timestamp <= cutoff) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) {
      requests.splice(0, lo);
    }
  }

  // Bound the map
  if (recentRequests.size > MAX_RECENT_REQUESTS) {
    const oldest = recentRequests.keys().next().value;
    if (oldest) recentRequests.delete(oldest);
  }
}

function detectInjection(body: string): { detected: boolean; type: string } {
  const patterns = [
    { name: 'sql', regex: /('|\\"|;|--|\bOR\b.*=|\bAND\b.*=|\bUNION\b.*\bSELECT\b)/i },
    { name: 'xss', regex: /(<script|javascript:|on\w+\s*=)/i },
    { name: 'command', regex: /(;|\||`|\$\(|&&)/i },
  ];

  for (const { name, regex } of patterns) {
    if (regex.test(body)) {
      return { detected: true, type: name };
    }
  }

  return { detected: false, type: '' };
}

function severityToConfidence(severity: string): number {
  const map: Record<string, number> = {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    critical: 0.9,
  };
  return map[severity] ?? 0.5;
}

async function logThreatDetection(
  request: { ip: string; path: string; method: string },
  indicators: ThreatIndicator[],
  action: string
): Promise<void> {
  await supabase.from('brain_events').insert({
    module: 'defense',
    event_type: 'threat.detected',
    data: {
      ip: request.ip,
      path: request.path,
      method: request.method,
      indicators: indicators.length,
      severity: indicators[0]?.severity ?? 'low',
      type: indicators[0]?.type ?? 'unknown',
      action,
    } as unknown as Record<string, never>,
    outcome: action === 'allow' ? 'allowed' : 'mitigated',
  });
}
