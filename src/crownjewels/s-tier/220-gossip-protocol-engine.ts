/**
 * S-Tier 220 — Gossip Protocol Intelligence Engine
 * ID: S-MSH04 | CJPI: 91 | Module: MESH
 *
 * Manages distributed state synchronization via epidemic gossip protocol
 * with version vectors, conflict resolution, and convergence tracking.
 */

export interface GossipEntry {
  version: number;
  data: unknown;
  lastUpdated: number;
  origin: string;
  hash: string;
}

export interface SyncResult {
  merged: number;
  conflicts: number;
  rejected: number;
  convergenceRatio: number;
}

export class GossipProtocolEngine {
  private state: Map<string, GossipEntry> = new Map();
  private peers: Map<string, { lastSync: number; syncCount: number; online: boolean }> = new Map();
  private conflictLog: { key: string; localVersion: number; remoteVersion: number; resolution: 'local' | 'remote'; timestamp: number }[] = [];
  private syncHistory: SyncResult[] = [];

  addPeer(peerId: string): void {
    this.peers.set(peerId, { lastSync: 0, syncCount: 0, online: true });
  }

  removePeer(peerId: string): boolean {
    return this.peers.delete(peerId);
  }

  setPeerStatus(peerId: string, online: boolean): void {
    const peer = this.peers.get(peerId);
    if (peer) peer.online = online;
  }

  update(key: string, data: unknown, origin: string = 'local'): void {
    const existing = this.state.get(key);
    const version = (existing?.version ?? 0) + 1;
    this.state.set(key, {
      version, data, lastUpdated: Date.now(), origin,
      hash: this.computeHash(key, version, data),
    });
  }

  merge(key: string, remoteVersion: number, remoteData: unknown, remoteOrigin: string = 'remote'): boolean {
    const local = this.state.get(key);

    if (!local || remoteVersion > local.version) {
      // Remote wins
      this.state.set(key, {
        version: remoteVersion, data: remoteData, lastUpdated: Date.now(), origin: remoteOrigin,
        hash: this.computeHash(key, remoteVersion, remoteData),
      });
      if (local) {
        this.conflictLog.push({ key, localVersion: local.version, remoteVersion, resolution: 'remote', timestamp: Date.now() });
      }
      return true;
    }

    if (remoteVersion === local.version && JSON.stringify(remoteData) !== JSON.stringify(local.data)) {
      // Same version, different data — conflict: keep local (last-writer-wins by origin)
      this.conflictLog.push({ key, localVersion: local.version, remoteVersion, resolution: 'local', timestamp: Date.now() });
    }

    if (this.conflictLog.length > 500) this.conflictLog = this.conflictLog.slice(-500);
    return false;
  }

  syncWithPeer(peerId: string, remoteState: Map<string, { version: number; data: unknown }>): SyncResult {
    let merged = 0, conflicts = 0, rejected = 0;

    for (const [key, remote] of remoteState) {
      const local = this.state.get(key);
      if (!local) {
        this.state.set(key, { version: remote.version, data: remote.data, lastUpdated: Date.now(), origin: peerId, hash: this.computeHash(key, remote.version, remote.data) });
        merged++;
      } else if (remote.version > local.version) {
        this.merge(key, remote.version, remote.data, peerId);
        merged++;
      } else if (remote.version === local.version && JSON.stringify(remote.data) !== JSON.stringify(local.data)) {
        conflicts++;
      } else {
        rejected++;
      }
    }

    const peer = this.peers.get(peerId);
    if (peer) { peer.lastSync = Date.now(); peer.syncCount++; }

    const result: SyncResult = {
      merged, conflicts, rejected,
      convergenceRatio: this.state.size > 0 ? (this.state.size - conflicts) / this.state.size : 1,
    };
    this.syncHistory.push(result);
    if (this.syncHistory.length > 100) this.syncHistory.shift();

    return result;
  }

  private computeHash(key: string, version: number, data: unknown): string {
    const input = `${key}:${version}:${JSON.stringify(data)}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  getState(): Map<string, { version: number; data: unknown; hash: string }> {
    return new Map([...this.state.entries()].map(([k, v]) => [k, { version: v.version, data: v.data, hash: v.hash }]));
  }

  getStats(): { keys: number; peers: number; onlinePeers: number; conflicts: number; avgConvergence: number } {
    const onlinePeers = [...this.peers.values()].filter(p => p.online).length;
    const avgConv = this.syncHistory.length > 0
      ? this.syncHistory.reduce((s, r) => s + r.convergenceRatio, 0) / this.syncHistory.length
      : 1;
    return { keys: this.state.size, peers: this.peers.size, onlinePeers, conflicts: this.conflictLog.length, avgConvergence: avgConv };
  }

  reset(): void {
    this.state.clear();
    this.peers.clear();
    this.conflictLog = [];
    this.syncHistory = [];
  }
}
