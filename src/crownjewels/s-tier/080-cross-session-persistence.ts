/**
 * S-Tier 080 — Cross-Session Persistence
 * CJPI: 92 | Node: MEMORY | ID: S-130
 *
 * State persistence across browser sessions with conflict resolution.
 * Uses versioned snapshots with last-write-wins merge strategy.
 */

export interface PersistedState {
  key: string;
  value: unknown;
  version: number;
  updatedAt: number;
  sessionId: string;
}

export interface MergeResult {
  key: string;
  resolved: unknown;
  strategy: 'local_wins' | 'remote_wins' | 'merged';
  conflicted: boolean;
}

const STORAGE_PREFIX = 'substrate-persist-';

export function save(key: string, value: unknown, sessionId: string): PersistedState {
  const state: PersistedState = {
    key, value,
    version: Date.now(),
    updatedAt: Date.now(),
    sessionId,
  };
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state));
  } catch { /* storage full — graceful */ }
  return state;
}

export function load(key: string): PersistedState | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function resolveConflict(local: PersistedState, remote: PersistedState): MergeResult {
  // Last-write-wins
  if (local.version >= remote.version) {
    return { key: local.key, resolved: local.value, strategy: 'local_wins', conflicted: local.version !== remote.version };
  }
  return { key: remote.key, resolved: remote.value, strategy: 'remote_wins', conflicted: true };
}

export function listPersistedKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.slice(STORAGE_PREFIX.length));
      }
    }
  } catch { /* graceful */ }
  return keys;
}

export function clearAll(): void {
  try {
    const toRemove = listPersistedKeys();
    for (const key of toRemove) {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    }
  } catch { /* graceful */ }
}
