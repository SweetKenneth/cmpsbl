/**
 * S-Tier 095 — Veto Cascade Protocol
 * ID: S-86 | CJPI: 90 | Module: GOVERNANCE
 * 
 * Multi-level veto propagation with escalation and override protocols.
 */

export type VetoLevel = 'node' | 'sector' | 'system' | 'sovereign';
export type VetoDecision = 'allow' | 'veto' | 'escalate' | 'override';

export interface VetoRequest {
  id: string;
  action: string;
  requestedBy: string;
  level: VetoLevel;
  context: Record<string, unknown>;
  timestamp: string;
}

export interface VetoResult {
  requestId: string;
  decision: VetoDecision;
  level: VetoLevel;
  reason: string;
  escalationChain: string[];
  overrideAuthority?: string;
}

export interface VetoPolicy {
  level: VetoLevel;
  patterns: string[];
  autoVeto: boolean;
  requiresQuorum: boolean;
  quorumThreshold: number;
  escalatesTo?: VetoLevel;
}

const LEVEL_HIERARCHY: VetoLevel[] = ['node', 'sector', 'system', 'sovereign'];

const DEFAULT_POLICIES: VetoPolicy[] = [
  { level: 'node', patterns: ['config_change'], autoVeto: false, requiresQuorum: false, quorumThreshold: 0, escalatesTo: 'sector' },
  { level: 'sector', patterns: ['schema_migration', 'capability_toggle'], autoVeto: false, requiresQuorum: true, quorumThreshold: 0.5, escalatesTo: 'system' },
  { level: 'system', patterns: ['boot_sequence', 'defense_mutation'], autoVeto: false, requiresQuorum: true, quorumThreshold: 0.67, escalatesTo: 'sovereign' },
  { level: 'sovereign', patterns: ['*'], autoVeto: false, requiresQuorum: false, quorumThreshold: 1 },
];

export class VetoCascadeProtocol {
  private policies: VetoPolicy[];
  private vetoLog: VetoResult[] = [];

  constructor(policies: VetoPolicy[] = DEFAULT_POLICIES) {
    this.policies = policies;
  }

  evaluate(request: VetoRequest, votes: Map<string, boolean> = new Map()): VetoResult {
    const policy = this.policies.find(p => p.level === request.level);
    if (!policy) {
      return this.makeResult(request, 'allow', 'No policy found for level');
    }

    // Check auto-veto patterns
    if (policy.autoVeto && policy.patterns.some(p => request.action.includes(p))) {
      return this.makeResult(request, 'veto', `Auto-veto: pattern match on ${request.action}`);
    }

    // Check quorum
    if (policy.requiresQuorum && votes.size > 0) {
      const approvals = [...votes.values()].filter(v => v).length;
      const ratio = approvals / votes.size;
      if (ratio < policy.quorumThreshold) {
        if (policy.escalatesTo) {
          return this.makeResult(request, 'escalate',
            `Quorum not met (${(ratio * 100).toFixed(0)}% < ${(policy.quorumThreshold * 100).toFixed(0)}%), escalating to ${policy.escalatesTo}`);
        }
        return this.makeResult(request, 'veto', `Quorum not met at ${request.level}`);
      }
    }

    return this.makeResult(request, 'allow', 'Passed all checks');
  }

  escalate(request: VetoRequest): VetoRequest | null {
    const currentIdx = LEVEL_HIERARCHY.indexOf(request.level);
    if (currentIdx >= LEVEL_HIERARCHY.length - 1) return null;
    return { ...request, level: LEVEL_HIERARCHY[currentIdx + 1] };
  }

  getLog(): VetoResult[] { return [...this.vetoLog]; }

  private makeResult(req: VetoRequest, decision: VetoDecision, reason: string): VetoResult {
    const result: VetoResult = {
      requestId: req.id,
      decision,
      level: req.level,
      reason,
      escalationChain: [req.level],
    };
    this.vetoLog.push(result);
    return result;
  }
}
