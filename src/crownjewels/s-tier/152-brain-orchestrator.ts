/**
 * S-Tier 152 — Brain Orchestrator
 * ID: S-CJ110 | CJPI: 85 | Module: BRAIN
 * Central orchestrator for brain module operations.
 */

export interface BrainRegion {
  id: string;
  name: string;
  function: string;
  active: boolean;
  utilization: number;
  lastActivation: number;
}

export interface ThoughtProcess {
  id: string;
  regions: string[];
  priority: number;
  status: 'queued' | 'active' | 'complete';
  startedAt?: number;
  completedAt?: number;
}

export class BrainOrchestrator {
  private regions: Map<string, BrainRegion> = new Map();
  private processes: ThoughtProcess[] = [];
  private maxConcurrent = 5;

  registerRegion(region: BrainRegion): void { this.regions.set(region.id, region); }

  submitThought(regions: string[], priority: number): ThoughtProcess {
    const process: ThoughtProcess = {
      id: crypto.randomUUID(), regions, priority, status: 'queued',
    };
    this.processes.push(process);
    this.schedule();
    return process;
  }

  private schedule(): void {
    const active = this.processes.filter(p => p.status === 'active').length;
    const queued = this.processes.filter(p => p.status === 'queued').sort((a, b) => b.priority - a.priority);
    for (const proc of queued) {
      if (active >= this.maxConcurrent) break;
      const allAvailable = proc.regions.every(r => {
        const region = this.regions.get(r);
        return region && !region.active;
      });
      if (allAvailable) {
        proc.status = 'active';
        proc.startedAt = Date.now();
        for (const r of proc.regions) {
          const region = this.regions.get(r);
          if (region) { region.active = true; region.lastActivation = Date.now(); }
        }
      }
    }
  }

  complete(processId: string): void {
    const proc = this.processes.find(p => p.id === processId);
    if (!proc) return;
    proc.status = 'complete';
    proc.completedAt = Date.now();
    for (const r of proc.regions) {
      const region = this.regions.get(r);
      if (region) region.active = false;
    }
    this.schedule();
  }

  getUtilization(): number {
    const regions = [...this.regions.values()];
    return regions.length > 0 ? regions.filter(r => r.active).length / regions.length : 0;
  }
}
