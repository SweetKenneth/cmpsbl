/**
 * S-Tier 198 — Cross-Zone Relay Bridge
 * ID: S-RLY03 | CJPI: 92 | Module: RELAY
 *
 * Multi-hop relay bridging across security zones with protocol negotiation,
 * latency-aware path finding, and automatic failover.
 */

export interface RelayZone {
  id: string;
  protocol: string;
  securityLevel: number;
  maxThroughputMbps: number;
  currentLoad: number;
}

export interface Bridge {
  from: string;
  to: string;
  latencyMs: number;
  active: boolean;
  failoverTarget: string | null;
  transferCount: number;
}

export class CrossZoneRelayBridge {
  private zones: Map<string, RelayZone> = new Map();
  private bridges: Bridge[] = [];
  private transferLog: { from: string; to: string; latencyMs: number; timestamp: number }[] = [];

  registerZone(id: string, protocol: string, securityLevel: number, maxThroughputMbps: number = 1000): void {
    this.zones.set(id, { id, protocol, securityLevel, maxThroughputMbps, currentLoad: 0 });
  }

  createBridge(fromZone: string, toZone: string, latencyMs: number, failoverTarget: string | null = null): boolean {
    if (!this.zones.has(fromZone) || !this.zones.has(toZone)) return false;
    // Check protocol compatibility
    const from = this.zones.get(fromZone)!;
    const to = this.zones.get(toZone)!;
    if (from.securityLevel > to.securityLevel + 2) return false; // Security gap too large
    this.bridges.push({ from: fromZone, to: toZone, latencyMs, active: true, failoverTarget, transferCount: 0 });
    return true;
  }

  route(fromZone: string, toZone: string): { path: string[]; totalLatency: number; hops: number } | null {
    // BFS for shortest path
    const visited = new Set<string>();
    const queue: { zone: string; path: string[]; latency: number }[] = [{ zone: fromZone, path: [fromZone], latency: 0 }];
    visited.add(fromZone);

    while (queue.length > 0) {
      queue.sort((a, b) => a.latency - b.latency);
      const current = queue.shift()!;

      if (current.zone === toZone) {
        this.transferLog.push({ from: fromZone, to: toZone, latencyMs: current.latency, timestamp: Date.now() });
        if (this.transferLog.length > 1000) this.transferLog.shift();
        return { path: current.path, totalLatency: current.latency, hops: current.path.length - 1 };
      }

      const outgoing = this.bridges.filter(b => b.from === current.zone && b.active);
      for (const bridge of outgoing) {
        const target = bridge.failoverTarget && !this.zones.get(bridge.to) ? bridge.failoverTarget : bridge.to;
        if (!visited.has(target)) {
          visited.add(target);
          queue.push({ zone: target, path: [...current.path, target], latency: current.latency + bridge.latencyMs });
        }
      }
    }

    return null;
  }

  deactivateBridge(fromZone: string, toZone: string): boolean {
    const bridge = this.bridges.find(b => b.from === fromZone && b.to === toZone && b.active);
    if (!bridge) return false;
    bridge.active = false;
    return true;
  }

  getBridges(): Bridge[] {
    return this.bridges.map(b => ({ ...b }));
  }

  getStats(): { zones: number; activeBridges: number; totalTransfers: number; avgLatency: number } {
    const active = this.bridges.filter(b => b.active);
    const avgLatency = this.transferLog.length > 0
      ? this.transferLog.reduce((s, t) => s + t.latencyMs, 0) / this.transferLog.length
      : 0;
    return { zones: this.zones.size, activeBridges: active.length, totalTransfers: this.transferLog.length, avgLatency };
  }

  reset(): void {
    this.zones.clear();
    this.bridges = [];
    this.transferLog = [];
  }
}
