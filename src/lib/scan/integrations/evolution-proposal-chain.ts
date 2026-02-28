/**
 * EVOLUTION Proposal Chain Dependency (#23)
 * DAG-based dependency tracking prevents partial breakage
 * when scanner fixes depend on each other.
 */

import {
  registerProposal,
  markApplied,
  markFailed,
  canApply,
  getApplicationOrder,
  getDependencyGraph,
  clearProposals,
  type ProposalNode,
  type DependencyGraph,
  type ApplicationOrder,
} from '@/lib/evolve/dependency-map';

export interface ScanFixProposal {
  id: string;
  findingId: string;
  title: string;
  description: string;
  category: string;
  dependsOn: string[];
  estimatedImpact: number; // 0-1
  estimatedEffort: number; // 0-1
  affectedFiles: string[];
}

export interface ProposalChainResult {
  safeToApply: ScanFixProposal[];
  blocked: Array<{ proposal: ScanFixProposal; missingDeps: string[] }>;
  cycles: string[][];
  applicationOrder: string[];
  totalProposals: number;
}

/**
 * Register scanner fix proposals into the dependency DAG
 */
export function registerScanProposals(
  proposals: ScanFixProposal[],
): ProposalChainResult {
  // Clear previous scan proposals
  clearProposals();

  // Register all proposals
  for (const proposal of proposals) {
    registerProposal(proposal.id, proposal.title, proposal.dependsOn);
  }

  // Get application order from DAG
  const order = getApplicationOrder();
  const graph = getDependencyGraph();

  // Map back to scan proposals
  const proposalMap = new Map(proposals.map(p => [p.id, p]));

  const safeToApply: ScanFixProposal[] = [];
  for (const id of order.ordered) {
    const proposal = proposalMap.get(id);
    if (proposal) safeToApply.push(proposal);
  }

  const blocked = order.blocked.map(b => ({
    proposal: proposalMap.get(b.id)!,
    missingDeps: b.missingDeps,
  })).filter(b => b.proposal);

  return {
    safeToApply,
    blocked,
    cycles: order.cycles,
    applicationOrder: order.ordered,
    totalProposals: proposals.length,
  };
}

/**
 * Apply a proposal and update the DAG
 */
export function applyScanProposal(proposalId: string): {
  success: boolean;
  unlockedProposals: string[];
} {
  const check = canApply(proposalId);
  if (!check.allowed) {
    return { success: false, unlockedProposals: [] };
  }

  markApplied(proposalId);

  // Check which proposals are now unblocked
  const order = getApplicationOrder();
  const graph = getDependencyGraph();
  
  // Find proposals that depend on this one and are now ready
  const unlockedProposals = graph.nodes
    .filter(n => n.dependsOn.includes(proposalId) && n.status === 'pending')
    .filter(n => {
      const check = canApply(n.id);
      return check.allowed;
    })
    .map(n => n.id);

  return { success: true, unlockedProposals };
}

/**
 * Mark a proposal as failed and identify cascading impact
 */
export function failScanProposal(proposalId: string): {
  cascadeImpact: string[];
  alternativePaths: string[];
} {
  markFailed(proposalId);

  const graph = getDependencyGraph();
  
  // Find all proposals that transitively depend on the failed one
  const cascadeImpact: string[] = [];
  const visited = new Set<string>();

  function findDependents(id: string) {
    for (const node of graph.nodes) {
      if (node.dependsOn.includes(id) && !visited.has(node.id)) {
        visited.add(node.id);
        cascadeImpact.push(node.id);
        findDependents(node.id);
      }
    }
  }

  findDependents(proposalId);

  // Find proposals that don't depend on the failed one (alternative paths)
  const alternativePaths = graph.nodes
    .filter(n => n.status === 'pending' && !cascadeImpact.includes(n.id) && n.id !== proposalId)
    .map(n => n.id);

  return { cascadeImpact, alternativePaths };
}

/**
 * Auto-detect dependencies between scan findings
 * based on shared file paths and logical ordering
 */
export function inferDependencies(
  proposals: ScanFixProposal[],
): ScanFixProposal[] {
  const enriched = proposals.map(p => ({ ...p, dependsOn: [...p.dependsOn] }));

  for (let i = 0; i < enriched.length; i++) {
    for (let j = 0; j < enriched.length; j++) {
      if (i === j) continue;
      const a = enriched[i];
      const b = enriched[j];

      // Rule 1: Schema changes must happen before code changes
      if (a.category === 'migration' && b.category !== 'migration') {
        const sharedFiles = a.affectedFiles.some(f => b.affectedFiles.includes(f));
        if (sharedFiles && !b.dependsOn.includes(a.id)) {
          b.dependsOn.push(a.id);
        }
      }

      // Rule 2: RLS policies depend on table existence
      if (a.category === 'migration' && b.category === 'rls_policy') {
        if (!b.dependsOn.includes(a.id)) {
          b.dependsOn.push(a.id);
        }
      }

      // Rule 3: Test coverage depends on the code being fixed first
      if (a.category !== 'test_coverage' && b.category === 'test_coverage') {
        const sharedFiles = a.affectedFiles.some(f => b.affectedFiles.includes(f));
        if (sharedFiles && !b.dependsOn.includes(a.id)) {
          b.dependsOn.push(a.id);
        }
      }
    }
  }

  return enriched;
}

/**
 * Visualize the proposal chain as a simple text DAG
 */
export function visualizeChain(proposals: ScanFixProposal[]): string {
  const graph = getDependencyGraph();
  const lines: string[] = ['═══ Proposal Dependency Chain ═══', ''];

  for (const root of graph.rootNodes) {
    const node = graph.nodes.find(n => n.id === root);
    if (node) {
      lines.push(`◆ ${node.title} [${node.status}]`);
      renderChildren(node.id, graph, lines, '  ');
    }
  }

  return lines.join('\n');
}

function renderChildren(parentId: string, graph: DependencyGraph, lines: string[], indent: string) {
  const children = graph.edges
    .filter(e => e.from === parentId)
    .map(e => graph.nodes.find(n => n.id === e.to))
    .filter(Boolean);

  for (const child of children) {
    if (!child) continue;
    const statusIcon = child.status === 'applied' ? '✓' : child.status === 'failed' ? '✗' : '○';
    lines.push(`${indent}├─ ${statusIcon} ${child.title} [${child.status}]`);
    renderChildren(child.id, graph, lines, indent + '│  ');
  }
}
