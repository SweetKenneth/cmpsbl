/**
 * S-Tier 207 — Cognitive Flame Graph Generator
 * ID: S-OBS03 | CJPI: 91 | Module: OBSERVABILITY
 */
export class CognitiveFlameGraphGenerator {
  private spans: { id: string; parent?: string; label: string; startMs: number; durationMs: number; category: string }[] = [];

  startSpan(label: string, category: string, parentId?: string): string {
    const id = crypto.randomUUID();
    this.spans.push({ id, parent: parentId, label, startMs: Date.now(), durationMs: 0, category });
    return id;
  }

  endSpan(spanId: string): void {
    const span = this.spans.find(s => s.id === spanId);
    if (span) span.durationMs = Date.now() - span.startMs;
  }

  generateFlameGraph(): { roots: string[]; totalDuration: number; hotspots: { label: string; percentage: number }[] } {
    const roots = this.spans.filter(s => !s.parent).map(s => s.id);
    const totalDuration = this.spans.reduce((s, sp) => s + sp.durationMs, 0);
    const hotspots = this.spans.sort((a, b) => b.durationMs - a.durationMs).slice(0, 5)
      .map(s => ({ label: s.label, percentage: totalDuration > 0 ? s.durationMs / totalDuration * 100 : 0 }));
    return { roots, totalDuration, hotspots };
  }
}
