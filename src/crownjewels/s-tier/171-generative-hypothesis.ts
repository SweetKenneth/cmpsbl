/**
 * S-Tier 171 — Generative Hypothesis
 * ID: S-CJ129 | CJPI: 85 | Module: DREAM
 * Generates testable hypotheses from observed patterns.
 */

export interface Hypothesis {
  id: string;
  statement: string;
  basedOn: string[];
  confidence: number;
  testable: boolean;
  status: 'generated' | 'testing' | 'confirmed' | 'rejected';
  evidence: { type: 'supporting' | 'opposing'; detail: string }[];
}

export class GenerativeHypothesis {
  private hypotheses: Map<string, Hypothesis> = new Map();

  generate(statement: string, basedOn: string[], confidence: number): Hypothesis {
    const h: Hypothesis = {
      id: crypto.randomUUID(), statement, basedOn, confidence,
      testable: true, status: 'generated', evidence: [],
    };
    this.hypotheses.set(h.id, h);
    return h;
  }

  addEvidence(hypothesisId: string, type: 'supporting' | 'opposing', detail: string): void {
    const h = this.hypotheses.get(hypothesisId);
    if (!h) return;
    h.evidence.push({ type, detail });
    const supporting = h.evidence.filter(e => e.type === 'supporting').length;
    const opposing = h.evidence.filter(e => e.type === 'opposing').length;
    h.confidence = supporting / Math.max(1, supporting + opposing);
    if (h.confidence > 0.8 && h.evidence.length >= 5) h.status = 'confirmed';
    if (h.confidence < 0.2 && h.evidence.length >= 5) h.status = 'rejected';
  }

  getActive(): Hypothesis[] {
    return [...this.hypotheses.values()].filter(h => h.status === 'generated' || h.status === 'testing');
  }

  getConfirmed(): Hypothesis[] {
    return [...this.hypotheses.values()].filter(h => h.status === 'confirmed');
  }
}
