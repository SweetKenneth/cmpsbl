/**
 * S-Tier Crown Jewel #5 — NERVE Consensus Heartbeat Protocol
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 5 | CJPI: 96 | Version: 1.0.0
 * Module: NERVE | Type: Architecture
 * Signature: e7fb15d4
 * Generated: 2026-03-01T00:00:00.000Z
 */

type PeerState = 'alive' | 'suspect' | 'quarantined' | 'dead';
interface HeartbeatPayload { health: number; load: number; breakerState?: 'closed' | 'open' | 'half-open'; metadata?: Record<string, unknown>; }
interface PeerRecord { id: string; state: PeerState; lastBeatAt: number; missedBeats: number; payload: HeartbeatPayload | null; stateChangedAt: number; vectorClock: number; }
interface HeartbeatConfig { nodeId: string; intervalMs?: number; suspectAfterMisses?: number; quarantineAfterMisses?: number; deadAfterMisses?: number; }

export function createHeartbeatProtocol(config: HeartbeatConfig) {
  const { nodeId, intervalMs = 5000, suspectAfterMisses = 3, quarantineAfterMisses = 6, deadAfterMisses = 10 } = config;
  const peers = new Map<string, PeerRecord>();
  let localClock = 0;
  let lastBeat = 0;
  const listeners: Array<(peerId: string, oldState: PeerState, newState: PeerState) => void> = [];

  function registerPeer(peerId: string) { peers.set(peerId, { id: peerId, state: 'alive', lastBeatAt: Date.now(), missedBeats: 0, payload: null, stateChangedAt: Date.now(), vectorClock: 0 }); }

  function beat(payload: HeartbeatPayload) { localClock++; lastBeat = Date.now(); return { nodeId, clock: localClock, payload, timestamp: lastBeat }; }

  function receiveBeat(peerId: string, payload: HeartbeatPayload, remoteClock?: number) {
    let peer = peers.get(peerId);
    if (!peer) { registerPeer(peerId); peer = peers.get(peerId)!; }
    const oldState = peer.state;
    peer.lastBeatAt = Date.now(); peer.missedBeats = 0; peer.payload = payload;
    peer.vectorClock = Math.max(peer.vectorClock, remoteClock ?? 0);
    if (oldState !== 'alive') { peer.state = 'alive'; peer.stateChangedAt = Date.now(); for (const l of listeners) l(peerId, oldState, 'alive'); }
  }

  function tick() {
    const now = Date.now();
    for (const [peerId, peer] of peers) {
      const missed = Math.floor((now - peer.lastBeatAt) / intervalMs);
      if (missed <= peer.missedBeats) continue;
      peer.missedBeats = missed;
      const oldState = peer.state;
      let newState: PeerState = oldState;
      if (peer.missedBeats >= deadAfterMisses) newState = 'dead';
      else if (peer.missedBeats >= quarantineAfterMisses) newState = 'quarantined';
      else if (peer.missedBeats >= suspectAfterMisses) newState = 'suspect';
      if (newState !== oldState) { peer.state = newState; peer.stateChangedAt = now; for (const l of listeners) l(peerId, oldState, newState); }
    }
  }

  return {
    registerPeer, beat, receiveBeat, tick,
    getPeerStatus: (id: string) => peers.get(id),
    getAllPeers: () => [...peers.values()],
    getAlive: () => [...peers.values()].filter(p => p.state === 'alive').map(p => p.id),
    hasQuorum: (total: number) => [...peers.values()].filter(p => p.state === 'alive').length > total / 2,
    onStateChange: (fn: (peerId: string, old: PeerState, next: PeerState) => void) => { listeners.push(fn); },
    removePeer: (id: string) => { peers.delete(id); },
  };
}
