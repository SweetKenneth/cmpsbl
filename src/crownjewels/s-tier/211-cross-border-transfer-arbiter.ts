/**
 * S-Tier 211 — Cross-Border Transfer Arbiter
 * CJPI: 91 | Module: SOVEREIGN | ID: S-SOV04
 *
 * Evaluates cross-border data transfers against adequacy decisions,
 * standard contractual clauses, binding corporate rules, and
 * derogation conditions. Maintains a full audit trail.
 */

export interface AdequacyDecision {
  jurisdiction: string;
  adequate: boolean;
  framework?: string;
  expiresAt?: number;
}

export interface TransferEvaluation {
  id: string;
  from: string;
  to: string;
  dataType: string;
  allowed: boolean;
  mechanism: string;
  requiresAssessment: boolean;
  conditions: string[];
  evaluatedAt: string;
}

export interface ArbiterStats {
  totalEvaluations: number;
  allowedTransfers: number;
  blockedTransfers: number;
  jurisdictionsCovered: number;
}

export function createCrossBorderArbiter() {
  const adequacy = new Map<string, AdequacyDecision>();
  const corporateRules = new Map<string, string[]>();
  const evaluations: TransferEvaluation[] = [];
  const sensitiveDataTypes = new Set(['pii', 'health', 'financial', 'biometric']);

  function setAdequacy(jurisdiction: string, adequate: boolean, framework?: string, ttlMs?: number): void {
    adequacy.set(jurisdiction, {
      jurisdiction, adequate, framework,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    });
  }

  function setBindingCorporateRules(entity: string, jurisdictions: string[]): void {
    corporateRules.set(entity, jurisdictions);
  }

  function evaluateTransfer(from: string, to: string, dataType: string, entity?: string): TransferEvaluation {
    const conditions: string[] = [];
    const ad = adequacy.get(to);
    const isAdequate = ad?.adequate && (!ad.expiresAt || ad.expiresAt > Date.now());
    const isSensitive = sensitiveDataTypes.has(dataType.toLowerCase());

    let allowed = true;
    let mechanism = 'none';

    if (isAdequate) {
      mechanism = `adequacy_decision${ad?.framework ? ` (${ad.framework})` : ''}`;
    } else if (entity && corporateRules.get(entity)?.includes(to)) {
      mechanism = 'binding_corporate_rules';
      conditions.push('bcr_compliance_required');
    } else if (!isSensitive) {
      mechanism = 'standard_contractual_clauses';
      conditions.push('scc_execution_required', 'transfer_impact_assessment');
    } else {
      mechanism = 'derogation_required';
      conditions.push('explicit_consent', 'data_protection_impact_assessment', 'supervisory_authority_notification');
      if (dataType === 'biometric') {
        allowed = false;
        conditions.push('biometric_transfer_blocked_by_policy');
      }
    }

    const evaluation: TransferEvaluation = {
      id: `xbr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from, to, dataType, allowed, mechanism,
      requiresAssessment: conditions.length > 0,
      conditions,
      evaluatedAt: new Date().toISOString(),
    };
    evaluations.push(evaluation);
    if (evaluations.length > 1000) evaluations.shift();
    return evaluation;
  }

  function getStats(): ArbiterStats {
    return {
      totalEvaluations: evaluations.length,
      allowedTransfers: evaluations.filter(e => e.allowed).length,
      blockedTransfers: evaluations.filter(e => !e.allowed).length,
      jurisdictionsCovered: adequacy.size,
    };
  }

  function getAuditTrail(limit: number = 50): TransferEvaluation[] {
    return evaluations.slice(-limit);
  }

  function reset(): void {
    adequacy.clear();
    corporateRules.clear();
    evaluations.length = 0;
  }

  return { setAdequacy, setBindingCorporateRules, evaluateTransfer, getStats, getAuditTrail, reset };
}
