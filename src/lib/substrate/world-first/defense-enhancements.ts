/**
 * DEFENSE Module Enhancements
 * BehavioralFingerprint, ZeroTrustValidator, ThreatAnticipator, IPContainment
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL FINGERPRINT — Usage pattern baseline and deviation detection
// ═══════════════════════════════════════════════════════════════════════════════

interface BehaviorPattern {
  entityId: string;
  typicalActions: Map<string, number>;   // action -> frequency per hour
  typicalTimes: number[];                // Hours of day (0-23)
  avgSessionDuration: number;            // minutes
  avgRequestsPerSession: number;
  knownIPs: Set<string>;
  knownDevices: Set<string>;
}

interface DeviationAlert {
  entityId: string;
  deviationType: 'action' | 'time' | 'location' | 'frequency' | 'device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
}

export class BehavioralFingerprint {
  private baselines: Map<string, BehaviorPattern> = new Map();
  private recentActions: Map<string, Array<{ action: string; timestamp: number }>> = new Map();

  /** Create or update baseline for entity */
  updateBaseline(entityId: string, action: string, metadata: {
    ip?: string;
    device?: string;
    timestamp?: number;
  }): void {
    let pattern = this.baselines.get(entityId);
    
    if (!pattern) {
      pattern = {
        entityId,
        typicalActions: new Map(),
        typicalTimes: [],
        avgSessionDuration: 0,
        avgRequestsPerSession: 0,
        knownIPs: new Set(),
        knownDevices: new Set(),
      };
      this.baselines.set(entityId, pattern);
    }

    // Update action frequency
    const current = pattern.typicalActions.get(action) || 0;
    pattern.typicalActions.set(action, current + 1);

    // Update time patterns
    const hour = new Date(metadata.timestamp || Date.now()).getHours();
    if (!pattern.typicalTimes.includes(hour)) {
      pattern.typicalTimes.push(hour);
    }

    // Update known IPs and devices
    if (metadata.ip) pattern.knownIPs.add(metadata.ip);
    if (metadata.device) pattern.knownDevices.add(metadata.device);

    // Track recent actions
    const recent = this.recentActions.get(entityId) || [];
    recent.push({ action, timestamp: metadata.timestamp || Date.now() });
    if (recent.length > 100) recent.shift();
    this.recentActions.set(entityId, recent);
  }

  /** Check for behavioral deviations */
  checkDeviation(entityId: string, action: string, metadata: {
    ip?: string;
    device?: string;
    timestamp?: number;
  }): DeviationAlert[] {
    const alerts: DeviationAlert[] = [];
    const pattern = this.baselines.get(entityId);
    
    if (!pattern) return []; // No baseline yet

    const now = metadata.timestamp || Date.now();
    const hour = new Date(now).getHours();

    // Check time deviation
    if (pattern.typicalTimes.length >= 5 && !pattern.typicalTimes.includes(hour)) {
      alerts.push({
        entityId,
        deviationType: 'time',
        severity: 'medium',
        description: `Unusual access time: ${hour}:00 (typical: ${pattern.typicalTimes.join(', ')})`,
        timestamp: now,
      });
    }

    // Check IP deviation
    if (metadata.ip && pattern.knownIPs.size > 0 && !pattern.knownIPs.has(metadata.ip)) {
      alerts.push({
        entityId,
        deviationType: 'location',
        severity: 'high',
        description: `New IP address: ${metadata.ip}`,
        timestamp: now,
      });
    }

    // Check device deviation
    if (metadata.device && pattern.knownDevices.size > 0 && !pattern.knownDevices.has(metadata.device)) {
      alerts.push({
        entityId,
        deviationType: 'device',
        severity: 'high',
        description: `New device: ${metadata.device}`,
        timestamp: now,
      });
    }

    // Check frequency spike
    const recent = this.recentActions.get(entityId) || [];
    const lastHour = recent.filter(r => now - r.timestamp < 3600000);
    const typicalFreq = pattern.typicalActions.get(action) || 1;
    if (lastHour.length > typicalFreq * 3) {
      alerts.push({
        entityId,
        deviationType: 'frequency',
        severity: 'high',
        description: `Unusual activity spike: ${lastHour.length} actions (typical: ${typicalFreq}/hr)`,
        timestamp: now,
      });
    }

    return alerts;
  }

  /** Get trust score based on behavioral consistency */
  getTrustScore(entityId: string): number {
    const pattern = this.baselines.get(entityId);
    if (!pattern) return 0.5; // Unknown entity

    const maturity = Math.min(1, pattern.typicalActions.size / 10);
    const consistency = Math.min(1, pattern.typicalTimes.length / 12);
    
    return (maturity * 0.4 + consistency * 0.4 + 0.2);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZERO TRUST VALIDATOR — Continuous verification pipeline
// ═══════════════════════════════════════════════════════════════════════════════

interface ValidationCheck {
  name: string;
  weight: number;
  check: (context: ValidationContext) => Promise<boolean>;
}

interface ValidationContext {
  entityId: string;
  action: string;
  resource: string;
  ip: string;
  sessionAge: number;
  riskScore: number;
}

interface ValidationResult {
  allowed: boolean;
  score: number;
  failedChecks: string[];
  requiresMFA: boolean;
  auditTrail: string[];
}

export class ZeroTrustValidator {
  private checks: ValidationCheck[] = [];
  private mfaThreshold: number = 0.7;
  private denyThreshold: number = 0.4;

  constructor() {
    // Register default checks
    this.registerCheck('session_valid', 0.2, async (ctx) => ctx.sessionAge < 86400000);
    this.registerCheck('risk_acceptable', 0.3, async (ctx) => ctx.riskScore < 0.7);
    this.registerCheck('resource_allowed', 0.25, async () => true); // Placeholder
    this.registerCheck('rate_limit_ok', 0.25, async () => true);    // Placeholder
  }

  /** Register a validation check */
  registerCheck(name: string, weight: number, check: ValidationCheck['check']): void {
    this.checks.push({ name, weight, check });
  }

  /** Validate a request */
  async validate(context: ValidationContext): Promise<ValidationResult> {
    const auditTrail: string[] = [];
    const failedChecks: string[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    for (const check of this.checks) {
      try {
        const passed = await check.check(context);
        auditTrail.push(`${check.name}: ${passed ? 'PASS' : 'FAIL'}`);
        
        if (passed) {
          totalScore += check.weight;
        } else {
          failedChecks.push(check.name);
        }
        totalWeight += check.weight;
      } catch (error) {
        auditTrail.push(`${check.name}: ERROR`);
        failedChecks.push(check.name);
        totalWeight += check.weight;
      }
    }

    const score = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      allowed: score >= this.denyThreshold,
      score,
      failedChecks,
      requiresMFA: score < this.mfaThreshold && score >= this.denyThreshold,
      auditTrail,
    };
  }

  /** Update thresholds */
  setThresholds(mfa: number, deny: number): void {
    this.mfaThreshold = mfa;
    this.denyThreshold = deny;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// THREAT ANTICIPATOR — Predictive threat detection
// ═══════════════════════════════════════════════════════════════════════════════

interface ThreatIndicator {
  type: 'probe' | 'escalation' | 'exfiltration' | 'persistence' | 'lateral';
  confidence: number;
  indicators: string[];
  timestamp: number;
}

interface ThreatPrediction {
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  predictedAttacks: string[];
  timeToImpact: number;  // minutes
  recommendedActions: string[];
}

export class ThreatAnticipator {
  private indicators: ThreatIndicator[] = [];
  private attackPatterns: Map<string, string[]> = new Map([
    ['reconnaissance', ['port_scan', 'directory_enum', 'version_probe']],
    ['credential_attack', ['failed_logins', 'password_spray', 'credential_stuffing']],
    ['data_exfil', ['large_download', 'unusual_query', 'api_abuse']],
    ['privilege_escalation', ['admin_probe', 'role_manipulation', 'token_theft']],
  ]);

  /** Record a threat indicator */
  recordIndicator(type: ThreatIndicator['type'], indicators: string[], confidence: number): void {
    this.indicators.push({
      type,
      indicators,
      confidence,
      timestamp: Date.now(),
    });

    // Keep last 1000 indicators
    if (this.indicators.length > 1000) {
      this.indicators.shift();
    }
  }

  /** Predict upcoming threats based on indicators */
  predict(): ThreatPrediction {
    const now = Date.now();
    const recentIndicators = this.indicators.filter(i => now - i.timestamp < 3600000);

    if (recentIndicators.length === 0) {
      return {
        threatLevel: 'none',
        predictedAttacks: [],
        timeToImpact: Infinity,
        recommendedActions: ['Continue monitoring'],
      };
    }

    // Count indicator types
    const typeCounts = new Map<string, number>();
    for (const indicator of recentIndicators) {
      typeCounts.set(indicator.type, (typeCounts.get(indicator.type) || 0) + 1);
    }

    // Check for attack pattern matches
    const matchedPatterns: string[] = [];
    for (const [attack, patterns] of this.attackPatterns.entries()) {
      const allIndicators = recentIndicators.flatMap(i => i.indicators);
      const matches = patterns.filter(p => allIndicators.some(i => i.includes(p)));
      if (matches.length >= 2) {
        matchedPatterns.push(attack);
      }
    }

    // Calculate threat level
    const probeCount = typeCounts.get('probe') || 0;
    const escalationCount = typeCounts.get('escalation') || 0;
    
    let threatLevel: ThreatPrediction['threatLevel'] = 'none';
    if (escalationCount > 3 || matchedPatterns.length >= 2) threatLevel = 'critical';
    else if (escalationCount > 1 || matchedPatterns.length >= 1) threatLevel = 'high';
    else if (probeCount > 5) threatLevel = 'medium';
    else if (probeCount > 2) threatLevel = 'low';

    // Estimate time to impact
    const avgConfidence = recentIndicators.reduce((a, b) => a + b.confidence, 0) / recentIndicators.length;
    const timeToImpact = threatLevel === 'critical' ? 5 : threatLevel === 'high' ? 15 : 60;

    return {
      threatLevel,
      predictedAttacks: matchedPatterns,
      timeToImpact,
      recommendedActions: this.getRecommendations(threatLevel, matchedPatterns),
    };
  }

  private getRecommendations(level: string, patterns: string[]): string[] {
    const actions: string[] = [];
    
    if (level === 'critical' || level === 'high') {
      actions.push('Enable IP blocking for suspicious sources');
      actions.push('Force MFA for all sessions');
      actions.push('Alert security team');
    }
    
    if (patterns.includes('credential_attack')) {
      actions.push('Implement account lockout');
      actions.push('Review failed login attempts');
    }
    
    if (patterns.includes('data_exfil')) {
      actions.push('Rate limit API calls');
      actions.push('Review data access logs');
    }

    return actions.length > 0 ? actions : ['Continue monitoring'];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IP CONTAINMENT — Intelligent IP blocking and quarantine
// ═══════════════════════════════════════════════════════════════════════════════

interface IPRecord {
  ip: string;
  status: 'allowed' | 'monitored' | 'quarantined' | 'blocked';
  reputation: number;         // 0-1
  firstSeen: number;
  lastSeen: number;
  requestCount: number;
  violationCount: number;
  quarantineExpiry?: number;
}

interface ContainmentAction {
  ip: string;
  action: 'monitor' | 'quarantine' | 'block' | 'release';
  reason: string;
  duration?: number;          // ms
}

export class IPContainment {
  private records: Map<string, IPRecord> = new Map();
  private blocklist: Set<string> = new Set();
  private allowlist: Set<string> = new Set();

  /** Process incoming request from IP */
  process(ip: string): { allowed: boolean; action?: ContainmentAction } {
    // Check allowlist first
    if (this.allowlist.has(ip)) {
      return { allowed: true };
    }

    // Check blocklist
    if (this.blocklist.has(ip)) {
      return {
        allowed: false,
        action: { ip, action: 'block', reason: 'Blocklisted' },
      };
    }

    let record = this.records.get(ip);
    const now = Date.now();

    if (!record) {
      record = {
        ip,
        status: 'allowed',
        reputation: 0.5,
        firstSeen: now,
        lastSeen: now,
        requestCount: 0,
        violationCount: 0,
      };
      this.records.set(ip, record);
    }

    record.lastSeen = now;
    record.requestCount++;

    // Check quarantine expiry
    if (record.status === 'quarantined' && record.quarantineExpiry) {
      if (now >= record.quarantineExpiry) {
        record.status = 'monitored';
        record.quarantineExpiry = undefined;
      } else {
        return {
          allowed: false,
          action: { ip, action: 'quarantine', reason: 'Under quarantine', duration: record.quarantineExpiry - now },
        };
      }
    }

    if (record.status === 'blocked') {
      return { allowed: false, action: { ip, action: 'block', reason: 'Previously blocked' } };
    }

    return { allowed: true };
  }

  /** Record a violation from IP */
  recordViolation(ip: string, severity: 'minor' | 'major' | 'critical'): ContainmentAction {
    let record = this.records.get(ip);
    
    if (!record) {
      record = {
        ip,
        status: 'monitored',
        reputation: 0.3,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        requestCount: 1,
        violationCount: 0,
      };
      this.records.set(ip, record);
    }

    record.violationCount++;
    
    // Decrease reputation based on severity
    const decrements = { minor: 0.1, major: 0.25, critical: 0.5 };
    record.reputation = Math.max(0, record.reputation - decrements[severity]);

    // Determine containment action
    if (record.reputation < 0.1 || (severity === 'critical' && record.violationCount >= 2)) {
      record.status = 'blocked';
      this.blocklist.add(ip);
      return { ip, action: 'block', reason: `Critical threat (rep: ${record.reputation.toFixed(2)})` };
    }

    if (record.reputation < 0.3 || record.violationCount >= 3) {
      record.status = 'quarantined';
      record.quarantineExpiry = Date.now() + 3600000; // 1 hour
      return { ip, action: 'quarantine', reason: `Multiple violations`, duration: 3600000 };
    }

    record.status = 'monitored';
    return { ip, action: 'monitor', reason: `Violation recorded (${record.violationCount} total)` };
  }

  /** Add IP to allowlist */
  allowlist_add(ip: string): void {
    this.allowlist.add(ip);
    this.blocklist.delete(ip);
    const record = this.records.get(ip);
    if (record) record.status = 'allowed';
  }

  /** Get containment statistics */
  getStats(): {
    total: number;
    allowed: number;
    monitored: number;
    quarantined: number;
    blocked: number;
  } {
    const stats = { total: 0, allowed: 0, monitored: 0, quarantined: 0, blocked: 0 };
    
    for (const record of this.records.values()) {
      stats.total++;
      stats[record.status]++;
    }

    return stats;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const defenseEnhancements = {
  BehavioralFingerprint,
  ZeroTrustValidator,
  ThreatAnticipator,
  IPContainment,
};

export type {
  BehaviorPattern,
  DeviationAlert,
  ValidationContext,
  ValidationResult,
  ThreatIndicator,
  ThreatPrediction,
  IPRecord,
  ContainmentAction,
};
