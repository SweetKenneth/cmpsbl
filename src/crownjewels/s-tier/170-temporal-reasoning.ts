/**
 * S-Tier 170 — Temporal Reasoning
 * ID: S-CJ128 | CJPI: 85 | Module: BRAIN
 * Time-aware reasoning with temporal logic and sequencing.
 */

export interface TemporalEvent {
  id: string;
  label: string;
  timestamp: number;
  duration: number;
  causalPredecessors: string[];
}

export interface TemporalConstraint {
  before: string;
  after: string;
  minGap?: number;
  maxGap?: number;
}

export class TemporalReasoning {
  private events: Map<string, TemporalEvent> = new Map();
  private constraints: TemporalConstraint[] = [];

  addEvent(event: TemporalEvent): void { this.events.set(event.id, event); }
  addConstraint(constraint: TemporalConstraint): void { this.constraints.push(constraint); }

  validateSequence(): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    for (const c of this.constraints) {
      const before = this.events.get(c.before);
      const after = this.events.get(c.after);
      if (!before || !after) continue;
      const gap = after.timestamp - (before.timestamp + before.duration);
      if (gap < 0) violations.push(`${c.before} must complete before ${c.after}`);
      if (c.minGap !== undefined && gap < c.minGap) violations.push(`Gap between ${c.before}→${c.after} too short`);
      if (c.maxGap !== undefined && gap > c.maxGap) violations.push(`Gap between ${c.before}→${c.after} too long`);
    }
    return { valid: violations.length === 0, violations };
  }

  getCausalChain(eventId: string): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();
    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const event = this.events.get(id);
      if (!event) return;
      for (const pred of event.causalPredecessors) { traverse(pred); }
      chain.push(id);
    };
    traverse(eventId);
    return chain;
  }

  getTimeline(): TemporalEvent[] {
    return [...this.events.values()].sort((a, b) => a.timestamp - b.timestamp);
  }
}
