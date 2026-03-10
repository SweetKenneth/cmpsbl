/**
 * S-Tier Crown Jewel #209 — Adaptive Threat Antibody Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 209 | CJPI: 95 | Version: 1.0.0
 * Module: IMMUNITY | Type: Architecture
 * Signature: b12d3e6f
 *
 * Generates targeted defense responses against novel threats
 * by synthesizing countermeasures that propagate across all nodes.
 */

type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';
type AntibodyState = 'synthesizing' | 'testing' | 'active' | 'expired' | 'revoked';

interface ThreatSignature {
  id: string;
  pattern: string;
  vector: string;
  severity: ThreatSeverity;
  firstSeen: number;
  lastSeen: number;
  frequency: number;
  sourceModules: string[];
  fingerprint: string;
}

interface Antibody {
  id: string;
  threatId: string;
  state: AntibodyState;
  rule: AntibodyRule;
  effectiveness: number; // 0-1
  falsePositiveRate: number;
  deployedNodes: string[];
  createdAt: number;
  expiresAt: number;
  activations: number;
}

interface AntibodyRule {
  type: 'block' | 'throttle' | 'quarantine' | 'redirect' | 'alert';
  matchPattern: string;
  action: Record<string, unknown>;
  confidence: number;
}

interface GenerationResult {
  antibody: Antibody;
  threat: ThreatSignature;
  synthesisTimeMs: number;
  deploymentTargets: string[];
}

export function createAntibodyGenerator() {
  const threats = new Map<string, ThreatSignature>();
  const antibodies = new Map<string, Antibody>();
  const immuneMemory = new Map<string, string>(); // fingerprint → antibodyId

  let idCounter = 0;
  const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`;

  function recordThreat(params: {
    pattern: string;
    vector: string;
    severity: ThreatSeverity;
    sourceModule: string;
  }): ThreatSignature {
    // Fingerprint-based dedup
    const fingerprint = `${params.vector}:${params.pattern}`.replace(/\s+/g, '_').slice(0, 64);
    const existing = [...threats.values()].find(t => t.fingerprint === fingerprint);

    if (existing) {
      existing.lastSeen = Date.now();
      existing.frequency++;
      if (!existing.sourceModules.includes(params.sourceModule)) {
        existing.sourceModules.push(params.sourceModule);
      }
      // Escalate severity if recurring
      if (existing.frequency > 10 && existing.severity !== 'critical') {
        existing.severity = 'high';
      }
      return existing;
    }

    const threat: ThreatSignature = {
      id: nextId('thr'),
      pattern: params.pattern,
      vector: params.vector,
      severity: params.severity,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      frequency: 1,
      sourceModules: [params.sourceModule],
      fingerprint,
    };

    threats.set(threat.id, threat);
    return threat;
  }

  function synthesize(threatId: string, targetNodes: string[] = []): GenerationResult | null {
    const threat = threats.get(threatId);
    if (!threat) return null;

    // Check immune memory
    const remembered = immuneMemory.get(threat.fingerprint);
    if (remembered) {
      const existing = antibodies.get(remembered);
      if (existing && existing.state === 'active') {
        return { antibody: existing, threat, synthesisTimeMs: 0, deploymentTargets: existing.deployedNodes };
      }
    }

    const startTime = performance.now();

    // Select response type based on severity
    const ruleType: AntibodyRule['type'] =
      threat.severity === 'critical' ? 'block' :
      threat.severity === 'high' ? 'quarantine' :
      threat.severity === 'medium' ? 'throttle' : 'alert';

    const antibody: Antibody = {
      id: nextId('ab'),
      threatId,
      state: 'synthesizing',
      rule: {
        type: ruleType,
        matchPattern: threat.pattern,
        action: {
          vector: threat.vector,
          threshold: threat.severity === 'critical' ? 0 : threat.severity === 'high' ? 3 : 10,
          windowMs: 60_000,
        },
        confidence: Math.min(0.99, 0.5 + threat.frequency * 0.05),
      },
      effectiveness: 0,
      falsePositiveRate: 0.02,
      deployedNodes: targetNodes.length > 0 ? targetNodes : threat.sourceModules,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h default TTL
      activations: 0,
    };

    antibodies.set(antibody.id, antibody);
    immuneMemory.set(threat.fingerprint, antibody.id);

    const synthesisTimeMs = performance.now() - startTime;

    return {
      antibody,
      threat,
      synthesisTimeMs,
      deploymentTargets: antibody.deployedNodes,
    };
  }

  function activate(antibodyId: string): boolean {
    const ab = antibodies.get(antibodyId);
    if (!ab) return false;
    ab.state = 'active';
    return true;
  }

  function recordActivation(antibodyId: string, effective: boolean): void {
    const ab = antibodies.get(antibodyId);
    if (!ab) return;
    ab.activations++;
    // Update effectiveness with EMA
    ab.effectiveness = ab.effectiveness * 0.9 + (effective ? 1 : 0) * 0.1;
    if (!effective) {
      ab.falsePositiveRate = ab.falsePositiveRate * 0.9 + 0.1;
    }
  }

  function revoke(antibodyId: string): boolean {
    const ab = antibodies.get(antibodyId);
    if (!ab) return false;
    ab.state = 'revoked';
    return true;
  }

  function expireStale(): number {
    let expired = 0;
    const now = Date.now();
    for (const ab of antibodies.values()) {
      if (ab.state === 'active' && ab.expiresAt < now) {
        ab.state = 'expired';
        expired++;
      }
    }
    return expired;
  }

  return {
    recordThreat,
    synthesize,
    activate,
    recordActivation,
    revoke,
    expireStale,
    getThreat: (id: string) => threats.get(id),
    getAntibody: (id: string) => antibodies.get(id),
    listThreats: () => [...threats.values()],
    listAntibodies: (state?: AntibodyState) => {
      const all = [...antibodies.values()];
      return state ? all.filter(a => a.state === state) : all;
    },
    getImmuneMemorySize: () => immuneMemory.size,
    stats: () => ({
      threats: threats.size,
      antibodies: antibodies.size,
      activeAntibodies: [...antibodies.values()].filter(a => a.state === 'active').length,
      immuneMemoryEntries: immuneMemory.size,
    }),
  };
}
