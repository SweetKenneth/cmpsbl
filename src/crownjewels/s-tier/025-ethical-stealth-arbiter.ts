/**
 * S-Tier Crown Jewel #167 — Conscience-Phantom Ethical Stealth Arbiter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 167 | CJPI: 95 | Version: 1.0.0
 * Module: CONSCIENCE×PHANTOM | Type: Architecture (Cross-Module)
 * Signature: 0293a4b6
 *
 * Resolves the tension between ethical transparency and operational privacy
 * through graduated disclosure protocols.
 */

type DisclosureLevel = 'full' | 'redacted' | 'summary' | 'existence_only' | 'denied';
type EthicalFramework = 'utilitarian' | 'deontological' | 'virtue' | 'care';

interface ArbiterDecision {
  id: string;
  operationId: string;
  ethicalScore: number;          // 0-100
  privacyRequirement: number;    // 0-100
  disclosureLevel: DisclosureLevel;
  framework: EthicalFramework;
  reasoning: string;
  constraints: string[];
  decidedAt: number;
}

interface OperationProfile {
  operationId: string;
  module: string;
  sensitivityLevel: number;     // 0-100
  stakeholders: string[];
  ethicalConcerns: string[];
  privacyConstraints: string[];
  data: Record<string, unknown>;
}

interface GraduatedDisclosure {
  level: DisclosureLevel;
  content: Record<string, unknown>;
  redactions: string[];
  justification: string;
}

export function createEthicalStealthArbiter() {
  const decisions = new Map<string, ArbiterDecision>();
  const frameworkWeights: Record<EthicalFramework, number> = {
    utilitarian: 0.3,
    deontological: 0.3,
    virtue: 0.2,
    care: 0.2,
  };

  let idCounter = 0;
  const nextId = () => `arb-${Date.now()}-${++idCounter}`;

  function evaluateEthics(profile: OperationProfile): number {
    let score = 100;

    // Penalize based on concerns
    score -= profile.ethicalConcerns.length * 10;

    // Stakeholder impact
    score -= Math.max(0, (profile.stakeholders.length - 2) * 5);

    // Sensitivity penalty
    score -= profile.sensitivityLevel * 0.3;

    return Math.max(0, Math.min(100, score));
  }

  function determineDisclosure(
    ethicalScore: number,
    privacyRequirement: number
  ): DisclosureLevel {
    // High ethics, low privacy need → full transparency
    if (ethicalScore >= 80 && privacyRequirement <= 30) return 'full';
    // High ethics, moderate privacy → redacted
    if (ethicalScore >= 60 && privacyRequirement <= 60) return 'redacted';
    // Moderate ethics, high privacy → summary only
    if (ethicalScore >= 40 && privacyRequirement <= 80) return 'summary';
    // Low ethics or extreme privacy → existence only
    if (ethicalScore >= 20) return 'existence_only';
    // Critical privacy + low ethics → denied
    return 'denied';
  }

  function arbitrate(profile: OperationProfile): ArbiterDecision {
    const id = nextId();
    const ethicalScore = evaluateEthics(profile);
    const privacyRequirement = Math.min(100, profile.sensitivityLevel + profile.privacyConstraints.length * 15);
    const disclosureLevel = determineDisclosure(ethicalScore, privacyRequirement);

    // Select dominant framework
    let bestFramework: EthicalFramework = 'utilitarian';
    if (profile.ethicalConcerns.some(c => c.includes('duty') || c.includes('rights'))) {
      bestFramework = 'deontological';
    } else if (profile.ethicalConcerns.some(c => c.includes('character') || c.includes('virtue'))) {
      bestFramework = 'virtue';
    } else if (profile.stakeholders.length > 3) {
      bestFramework = 'care';
    }

    const decision: ArbiterDecision = {
      id,
      operationId: profile.operationId,
      ethicalScore,
      privacyRequirement,
      disclosureLevel,
      framework: bestFramework,
      reasoning: `Ethics=${ethicalScore}/100, Privacy=${privacyRequirement}/100 → ${disclosureLevel} disclosure via ${bestFramework} framework`,
      constraints: [
        ...profile.ethicalConcerns.map(c => `ethical: ${c}`),
        ...profile.privacyConstraints.map(c => `privacy: ${c}`),
      ],
      decidedAt: Date.now(),
    };

    decisions.set(id, decision);
    return decision;
  }

  function generateDisclosure(
    decision: ArbiterDecision,
    fullData: Record<string, unknown>
  ): GraduatedDisclosure {
    const keys = Object.keys(fullData);
    const sensitiveKeys = keys.filter(k =>
      k.includes('secret') || k.includes('private') || k.includes('token') ||
      k.includes('password') || k.includes('key') || k.includes('pii')
    );

    switch (decision.disclosureLevel) {
      case 'full':
        return { level: 'full', content: fullData, redactions: [], justification: 'Full transparency approved' };

      case 'redacted': {
        const content = { ...fullData };
        for (const key of sensitiveKeys) {
          content[key] = '[REDACTED]';
        }
        return { level: 'redacted', content, redactions: sensitiveKeys, justification: `${sensitiveKeys.length} sensitive fields redacted` };
      }

      case 'summary':
        return {
          level: 'summary',
          content: { fieldCount: keys.length, sensitiveFieldCount: sensitiveKeys.length, operation: decision.operationId },
          redactions: keys,
          justification: 'Summary-only disclosure due to privacy requirements',
        };

      case 'existence_only':
        return {
          level: 'existence_only',
          content: { exists: true, timestamp: decision.decidedAt },
          redactions: keys,
          justification: 'Existence-only disclosure — content sealed',
        };

      case 'denied':
        return {
          level: 'denied',
          content: {},
          redactions: keys,
          justification: 'Disclosure denied — operation below ethical threshold or exceeds privacy bounds',
        };
    }
  }

  return {
    arbitrate,
    generateDisclosure,
    getDecision: (id: string) => decisions.get(id),
    listDecisions: () => [...decisions.values()],
    getFrameworkWeights: () => ({ ...frameworkWeights }),
    setFrameworkWeight: (framework: EthicalFramework, weight: number) => {
      frameworkWeights[framework] = Math.max(0, Math.min(1, weight));
    },
    stats: () => {
      const all = [...decisions.values()];
      const byLevel: Record<string, number> = {};
      for (const d of all) byLevel[d.disclosureLevel] = (byLevel[d.disclosureLevel] ?? 0) + 1;
      return {
        totalDecisions: all.length,
        avgEthicalScore: all.length > 0 ? all.reduce((s, d) => s + d.ethicalScore, 0) / all.length : 0,
        byDisclosureLevel: byLevel,
      };
    },
  };
}
