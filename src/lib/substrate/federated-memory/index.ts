/**
 * Federated Memory Sync
 * v1.0.0 — Cross-instance memory synchronization without centralization
 * 
 * Enables multiple substrate instances to share memory fragments
 * while respecting privacy boundaries and consent flags.
 */

export interface MemoryFragment {
  id: string;
  sourceInstanceId: string;
  category: string;
  content: string;
  confidence: number;
  syncedAt: number;
  privacy: 'public' | 'shared' | 'private';
  ttlMs: number | null;
}

export interface SyncPeer {
  instanceId: string;
  lastSyncAt: number;
  fragmentCount: number;
  trust: number; // 0-1
  status: 'connected' | 'stale' | 'disconnected';
}

export interface FederatedSyncConfig {
  syncIntervalMs: number;
  maxFragmentsPerSync: number;
  minTrustThreshold: number;
  privacyFilter: ('public' | 'shared')[];
  conflictResolution: 'latest-wins' | 'highest-confidence' | 'merge';
}

const DEFAULT_SYNC_CONFIG: FederatedSyncConfig = {
  syncIntervalMs: 300_000, // 5 minutes
  maxFragmentsPerSync: 50,
  minTrustThreshold: 0.6,
  privacyFilter: ['public', 'shared'],
  conflictResolution: 'highest-confidence',
};

const localFragments = new Map<string, MemoryFragment>();
const peers = new Map<string, SyncPeer>();
let config = { ...DEFAULT_SYNC_CONFIG };

/**
 * Register a memory fragment for federation
 */
export function registerFragment(fragment: Omit<MemoryFragment, 'syncedAt'>): MemoryFragment {
  const full: MemoryFragment = { ...fragment, syncedAt: Date.now() };
  localFragments.set(full.id, full);
  return full;
}

/**
 * Resolve conflicts between overlapping fragments
 */
export function resolveConflict(local: MemoryFragment, remote: MemoryFragment): MemoryFragment {
  switch (config.conflictResolution) {
    case 'latest-wins':
      return local.syncedAt >= remote.syncedAt ? local : remote;
    case 'highest-confidence':
      return local.confidence >= remote.confidence ? local : remote;
    case 'merge':
      return {
        ...local,
        content: `${local.content}\n---\n${remote.content}`,
        confidence: Math.max(local.confidence, remote.confidence),
        syncedAt: Date.now(),
      };
  }
}

/**
 * Ingest fragments from a peer
 */
export function ingestFromPeer(peerId: string, fragments: MemoryFragment[]): number {
  const peer = peers.get(peerId);
  if (peer && peer.trust < config.minTrustThreshold) {
    return 0;
  }

  let ingested = 0;
  for (const fragment of fragments) {
    if (!config.privacyFilter.includes(fragment.privacy as 'public' | 'shared')) continue;

    const existing = localFragments.get(fragment.id);
    if (existing) {
      const resolved = resolveConflict(existing, fragment);
      localFragments.set(fragment.id, resolved);
    } else {
      localFragments.set(fragment.id, fragment);
    }
    ingested++;
  }

  if (peer) {
    peer.lastSyncAt = Date.now();
    peer.fragmentCount += ingested;
  }

  return ingested;
}

/**
 * Get fragments eligible for export to peers
 */
export function getExportableFragments(): MemoryFragment[] {
  return Array.from(localFragments.values())
    .filter(f => config.privacyFilter.includes(f.privacy as 'public' | 'shared'))
    .slice(0, config.maxFragmentsPerSync);
}

/** Register a sync peer */
export function addPeer(instanceId: string, trust: number = 0.8): SyncPeer {
  const peer: SyncPeer = { instanceId, lastSyncAt: 0, fragmentCount: 0, trust, status: 'connected' };
  peers.set(instanceId, peer);
  return peer;
}

/** Get all peers */
export function getPeers(): SyncPeer[] {
  return Array.from(peers.values());
}

/** Get local fragment count */
export function getFragmentCount(): number {
  return localFragments.size;
}

/** Configure sync */
export function configureFederatedSync(updates: Partial<FederatedSyncConfig>) {
  config = { ...config, ...updates };
}
