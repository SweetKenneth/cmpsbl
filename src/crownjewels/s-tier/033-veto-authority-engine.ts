/**
 * S-Tier 033 — Veto Authority Engine
 * CJPI: 94 | Node: GOVERNANCE | ID: S-128
 *
 * Implements hard-stop veto logic for governance-critical mutations.
 * Any registered veto authority can block a proposal, requiring
 * escalation or unanimous override.
 */

export interface VetoAuthority {
  id: string;
  label: string;
  scope: string[];   // e.g. ['mutation', 'capability_activation', 'config_change']
  active: boolean;
}

export interface VetoProposal {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  submittedAt: number;
}

export interface VetoDecision {
  proposalId: string;
  authorityId: string;
  vetoed: boolean;
  reason?: string;
  decidedAt: string;
}

export interface VetoResult {
  proposalId: string;
  allowed: boolean;
  vetoes: VetoDecision[];
  overrideRequired: boolean;
}

const authorities = new Map<string, VetoAuthority>();
const decisions = new Map<string, VetoDecision[]>();

export function registerAuthority(auth: VetoAuthority): void {
  authorities.set(auth.id, auth);
}

export function removeAuthority(id: string): boolean {
  return authorities.delete(id);
}

export function castVeto(
  proposalId: string,
  authorityId: string,
  vetoed: boolean,
  reason?: string
): VetoDecision {
  const decision: VetoDecision = {
    proposalId,
    authorityId,
    vetoed,
    reason,
    decidedAt: new Date().toISOString(),
  };
  if (!decisions.has(proposalId)) decisions.set(proposalId, []);
  decisions.get(proposalId)!.push(decision);
  return decision;
}

export function evaluateProposal(proposal: VetoProposal): VetoResult {
  const applicableAuthorities = [...authorities.values()]
    .filter(a => a.active && a.scope.includes(proposal.type));

  const proposalDecisions = decisions.get(proposal.id) ?? [];
  const vetoes = proposalDecisions.filter(d => d.vetoed);

  return {
    proposalId: proposal.id,
    allowed: vetoes.length === 0,
    vetoes: proposalDecisions,
    overrideRequired: vetoes.length > 0 && vetoes.length < applicableAuthorities.length,
  };
}

export function listAuthorities(): VetoAuthority[] {
  return [...authorities.values()];
}
