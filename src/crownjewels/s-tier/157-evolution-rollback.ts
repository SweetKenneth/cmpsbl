/**
 * S-Tier 157 — Evolution Rollback
 * ID: S-CJ115 | CJPI: 85 | Module: EVOLUTION
 * Safe rollback mechanism for failed evolution operations.
 */

export interface Checkpoint {
  id: string;
  label: string;
  state: Record<string, unknown>;
  createdAt: string;
  mutationId?: string;
}

export class EvolutionRollback {
  private checkpoints: Checkpoint[] = [];
  private maxCheckpoints = 50;

  checkpoint(label: string, state: Record<string, unknown>, mutationId?: string): Checkpoint {
    const cp: Checkpoint = {
      id: crypto.randomUUID(), label, state: structuredClone(state),
      createdAt: new Date().toISOString(), mutationId,
    };
    this.checkpoints.push(cp);
    if (this.checkpoints.length > this.maxCheckpoints) this.checkpoints.shift();
    return cp;
  }

  rollback(checkpointId: string): Record<string, unknown> | null {
    const idx = this.checkpoints.findIndex(c => c.id === checkpointId);
    if (idx === -1) return null;
    const state = structuredClone(this.checkpoints[idx].state);
    this.checkpoints = this.checkpoints.slice(0, idx + 1);
    return state;
  }

  rollbackToMutation(mutationId: string): Record<string, unknown> | null {
    const cp = [...this.checkpoints].reverse().find(c => c.mutationId === mutationId);
    return cp ? this.rollback(cp.id) : null;
  }

  getCheckpoints(): Checkpoint[] { return [...this.checkpoints]; }
  getLatest(): Checkpoint | null { return this.checkpoints.at(-1) ?? null; }
}
