/**
 * S-Tier 220 — Gossip Protocol Intelligence Engine
 * ID: S-MSH04 | CJPI: 91 | Module: MESH
 */
export class GossipProtocolEngine {
  private state: Map<string, { version: number; data: unknown; lastUpdated: number }> = new Map();
  private peers: Set<string> = new Set();

  addPeer(peerId: string): void { this.peers.add(peerId); }

  update(key: string, data: unknown): void {
    const existing = this.state.get(key);
    this.state.set(key, { version: (existing?.version ?? 0) + 1, data, lastUpdated: Date.now() });
  }

  merge(key: string, remoteVersion: number, remoteData: unknown): boolean {
    const local = this.state.get(key);
    if (!local || remoteVersion > local.version) {
      this.state.set(key, { version: remoteVersion, data: remoteData, lastUpdated: Date.now() });
      return true;
    }
    return false;
  }

  getState(): Map<string, { version: number; data: unknown }> {
    return new Map([...this.state.entries()].map(([k, v]) => [k, { version: v.version, data: v.data }]));
  }
}
