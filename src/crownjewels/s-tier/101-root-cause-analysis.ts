/**
 * S-Tier 101 — Root Cause Analysis Engine
 * ID: S-142 | CJPI: 90 | Module: VISION
 * 
 * Automated root cause analysis using dependency graph traversal and temporal correlation.
 */

export interface Incident {
  id: string;
  symptom: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedNode: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface CausalLink {
  fromNode: string;
  toNode: string;
  relationship: 'depends_on' | 'triggers' | 'correlates_with';
  strength: number; // 0-1
}

export interface RootCauseHypothesis {
  rootNode: string;
  confidence: number;
  evidenceChain: string[];
  affectedDownstream: string[];
  suggestedFix: string;
}

export interface RCAResult {
  incidentId: string;
  hypotheses: RootCauseHypothesis[];
  analysisTimeMs: number;
  timestamp: string;
}

export class RootCauseAnalysisEngine {
  private causalGraph: Map<string, CausalLink[]> = new Map();
  private incidentHistory: Incident[] = [];

  addCausalLink(link: CausalLink): void {
    const links = this.causalGraph.get(link.toNode) || [];
    links.push(link);
    this.causalGraph.set(link.toNode, links);
  }

  recordIncident(incident: Incident): void {
    this.incidentHistory.push(incident);
  }

  analyze(incident: Incident): RCAResult {
    const startTime = Date.now();
    const hypotheses: RootCauseHypothesis[] = [];

    // Walk upstream through causal graph
    const visited = new Set<string>();
    const queue: { node: string; chain: string[]; confidence: number }[] = [
      { node: incident.affectedNode, chain: [incident.affectedNode], confidence: 1.0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.node)) continue;
      visited.add(current.node);

      const upstreamLinks = this.causalGraph.get(current.node) || [];

      if (upstreamLinks.length === 0 && current.chain.length > 1) {
        // This is a root node
        const downstream = this.getDownstream(current.node);
        hypotheses.push({
          rootNode: current.node,
          confidence: current.confidence,
          evidenceChain: current.chain,
          affectedDownstream: downstream,
          suggestedFix: `Investigate ${current.node} — root of ${current.chain.length}-node causal chain`,
        });
      }

      for (const link of upstreamLinks) {
        const newConf = current.confidence * link.strength;
        if (newConf > 0.1) {
          queue.push({
            node: link.fromNode,
            chain: [...current.chain, link.fromNode],
            confidence: newConf,
          });
        }
      }
    }

    // Temporal correlation: find incidents within time window
    const incidentTime = new Date(incident.timestamp).getTime();
    const correlatedIncidents = this.incidentHistory.filter(i => {
      const t = new Date(i.timestamp).getTime();
      return Math.abs(t - incidentTime) < 60000 && i.id !== incident.id;
    });

    for (const corr of correlatedIncidents) {
      const existing = hypotheses.find(h => h.rootNode === corr.affectedNode);
      if (!existing) {
        hypotheses.push({
          rootNode: corr.affectedNode,
          confidence: 0.5,
          evidenceChain: [corr.affectedNode, incident.affectedNode],
          affectedDownstream: [incident.affectedNode],
          suggestedFix: `Temporal correlation: ${corr.symptom} occurred within 60s`,
        });
      }
    }

    hypotheses.sort((a, b) => b.confidence - a.confidence);

    return {
      incidentId: incident.id,
      hypotheses: hypotheses.slice(0, 5),
      analysisTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  private getDownstream(node: string, visited = new Set<string>()): string[] {
    if (visited.has(node)) return [];
    visited.add(node);
    const downstream: string[] = [];
    for (const [target, links] of this.causalGraph) {
      if (links.some(l => l.fromNode === node)) {
        downstream.push(target);
        downstream.push(...this.getDownstream(target, visited));
      }
    }
    return [...new Set(downstream)];
  }
}
