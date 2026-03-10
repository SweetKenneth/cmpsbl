/**
 * S-Tier 119 — Explainable Intelligence Compiler
 * ID: S-CJ77 | CJPI: 87 | Module: CORTEX
 * 
 * Compiles AI decisions into human-readable explanations with evidence chains.
 */

export interface ExplanationNode {
  id: string;
  type: 'premise' | 'inference' | 'conclusion' | 'evidence';
  content: string;
  confidence: number;
  sources: string[];
  children: string[];
}

export interface ExplanationGraph {
  id: string;
  decisionId: string;
  nodes: ExplanationNode[];
  rootNodeId: string;
  format: 'narrative' | 'tree' | 'chain';
  generatedAt: string;
}

export interface ExplanationRequest {
  decisionId: string;
  context: Record<string, unknown>;
  factors: DecisionFactor[];
  depth: 'summary' | 'detailed' | 'full';
}

export interface DecisionFactor {
  name: string;
  weight: number;
  value: unknown;
  contribution: number; // -1 to 1
  reasoning: string;
}

export class ExplainableIntelligenceCompiler {
  private templates: Map<string, string> = new Map();

  compile(request: ExplanationRequest): ExplanationGraph {
    const nodes: ExplanationNode[] = [];
    
    // Create evidence nodes from factors
    const sortedFactors = [...request.factors].sort((a, b) => 
      Math.abs(b.contribution) - Math.abs(a.contribution)
    );

    const limit = request.depth === 'summary' ? 3 : request.depth === 'detailed' ? 6 : sortedFactors.length;
    const topFactors = sortedFactors.slice(0, limit);

    for (const factor of topFactors) {
      nodes.push({
        id: crypto.randomUUID(),
        type: 'evidence',
        content: `${factor.name}: ${factor.reasoning}`,
        confidence: Math.abs(factor.contribution),
        sources: [factor.name],
        children: [],
      });
    }

    // Create inference nodes grouping positive/negative factors
    const positive = nodes.filter((_, i) => topFactors[i].contribution > 0);
    const negative = nodes.filter((_, i) => topFactors[i].contribution < 0);

    const inferenceIds: string[] = [];

    if (positive.length > 0) {
      const id = crypto.randomUUID();
      inferenceIds.push(id);
      nodes.push({
        id,
        type: 'inference',
        content: `Supporting factors (${positive.length}): ${positive.map(n => n.sources[0]).join(', ')}`,
        confidence: positive.reduce((s, n) => s + n.confidence, 0) / positive.length,
        sources: positive.flatMap(n => n.sources),
        children: positive.map(n => n.id),
      });
    }

    if (negative.length > 0) {
      const id = crypto.randomUUID();
      inferenceIds.push(id);
      nodes.push({
        id,
        type: 'inference',
        content: `Opposing factors (${negative.length}): ${negative.map(n => n.sources[0]).join(', ')}`,
        confidence: negative.reduce((s, n) => s + n.confidence, 0) / negative.length,
        sources: negative.flatMap(n => n.sources),
        children: negative.map(n => n.id),
      });
    }

    // Root conclusion
    const netContribution = request.factors.reduce((s, f) => s + f.contribution * f.weight, 0);
    const totalWeight = request.factors.reduce((s, f) => s + f.weight, 0);
    const normalizedScore = totalWeight > 0 ? netContribution / totalWeight : 0;

    const rootId = crypto.randomUUID();
    nodes.push({
      id: rootId,
      type: 'conclusion',
      content: normalizedScore > 0
        ? `Decision favored (score: ${(normalizedScore * 100).toFixed(1)}%) based on ${topFactors.length} key factors`
        : `Decision opposed (score: ${(normalizedScore * 100).toFixed(1)}%) based on ${topFactors.length} key factors`,
      confidence: Math.abs(normalizedScore),
      sources: topFactors.map(f => f.name),
      children: inferenceIds,
    });

    return {
      id: crypto.randomUUID(),
      decisionId: request.decisionId,
      nodes,
      rootNodeId: rootId,
      format: request.depth === 'summary' ? 'chain' : 'tree',
      generatedAt: new Date().toISOString(),
    };
  }

  toNarrative(graph: ExplanationGraph): string {
    const root = graph.nodes.find(n => n.id === graph.rootNodeId);
    if (!root) return 'No explanation available.';
    
    const lines = [root.content];
    for (const childId of root.children) {
      const child = graph.nodes.find(n => n.id === childId);
      if (child) {
        lines.push(`  → ${child.content}`);
        for (const evidenceId of child.children) {
          const evidence = graph.nodes.find(n => n.id === evidenceId);
          if (evidence) lines.push(`    • ${evidence.content}`);
        }
      }
    }
    return lines.join('\n');
  }
}
