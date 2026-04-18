/**
 * CMPSBL® Always-On Core — State Store (Kernel Component #1)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Persistent runtime state for kernel-grade governing primitives.
 *
 * Provides the storage substrate that Quarantine, ContractValidator,
 * IsolatedExecutor, and Circuit Breaker read/write through. Without
 * this, runtime state evaporates between process restarts and the
 * kernel cannot adapt across invocations.
 *
 * Backends:
 *   • memory  (default, zero-dep)
 *   • json    (file-backed, opt-in via CMPSBL_KERNEL_STATE_PATH env)
 *
 * Gated by the CMPSBL_KERNEL_ENABLED flag (default ON). When OFF,
 * the store is a no-op shim — exports remain byte-for-byte compatible
 * with pre-kernel Layer 2.
 *
 * Module: EVOLUTION  ·  CJPI: 91  ·  Crown Jewel #41
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const STATE_STORE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — State Store (sealed module, proprietary).                 ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblStateBackend = 'memory' | 'json' | 'disabled';

interface CmpsblStateRecord {
  value: unknown;
  updatedAt: number;
  version: number;
}

interface CmpsblStateStore {
  get<T = unknown>(namespace: string, key: string): T | undefined;
  set(namespace: string, key: string, value: unknown): void;
  delete(namespace: string, key: string): boolean;
  list(namespace: string): Record<string, CmpsblStateRecord>;
  clear(namespace?: string): void;
  flush(): void;
  backend(): CmpsblStateBackend;
}

function _cmpsbl_kernel_enabled(): boolean {
  // Default ON. Set CMPSBL_KERNEL_ENABLED=false to disable.
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

function _cmpsbl_create_state_store(): CmpsblStateStore {
  if (!_cmpsbl_kernel_enabled()) {
    // No-op shim when kernel is disabled — preserves API surface, costs nothing.
    return {
      get: () => undefined,
      set: () => undefined,
      delete: () => false,
      list: () => ({}),
      clear: () => undefined,
      flush: () => undefined,
      backend: () => 'disabled',
    };
  }

  const path = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_STATE_PATH) || '';
  const backend: CmpsblStateBackend = path ? 'json' : 'memory';
  const store: Map<string, Map<string, CmpsblStateRecord>> = new Map();
  let dirty = false;

  // Lazy fs handle for json backend — never imported when memory-only.
  let _fs: typeof import('fs') | null = null;
  function _loadFs(): typeof import('fs') | null {
    if (backend !== 'json') return null;
    if (_fs) return _fs;
    try { _fs = require('fs'); return _fs; } catch { return null; }
  }

  function _hydrate(): void {
    if (backend !== 'json') return;
    const fs = _loadFs(); if (!fs || !fs.existsSync(path)) return;
    try {
      const raw = fs.readFileSync(path, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, Record<string, CmpsblStateRecord>>;
      for (const [ns, recs] of Object.entries(parsed)) {
        const m = new Map<string, CmpsblStateRecord>();
        for (const [k, v] of Object.entries(recs)) m.set(k, v);
        store.set(ns, m);
      }
    } catch { /* corrupt file — start fresh, never crash on hydrate */ }
  }

  function _persist(): void {
    if (backend !== 'json' || !dirty) return;
    const fs = _loadFs(); if (!fs) return;
    try {
      const out: Record<string, Record<string, CmpsblStateRecord>> = {};
      for (const [ns, m] of store) {
        out[ns] = {};
        for (const [k, v] of m) out[ns][k] = v;
      }
      fs.writeFileSync(path, JSON.stringify(out), 'utf8');
      dirty = false;
    } catch { /* persistence is best-effort; never crash the runtime */ }
  }

  _hydrate();

  return {
    get<T = unknown>(namespace: string, key: string): T | undefined {
      const ns = store.get(namespace); if (!ns) return undefined;
      const rec = ns.get(key); return rec ? (rec.value as T) : undefined;
    },
    set(namespace: string, key: string, value: unknown): void {
      let ns = store.get(namespace);
      if (!ns) { ns = new Map(); store.set(namespace, ns); }
      const prev = ns.get(key);
      ns.set(key, { value, updatedAt: Date.now(), version: (prev?.version ?? 0) + 1 });
      dirty = true; _persist();
    },
    delete(namespace: string, key: string): boolean {
      const ns = store.get(namespace); if (!ns) return false;
      const ok = ns.delete(key); if (ok) { dirty = true; _persist(); } return ok;
    },
    list(namespace: string): Record<string, CmpsblStateRecord> {
      const ns = store.get(namespace); if (!ns) return {};
      const out: Record<string, CmpsblStateRecord> = {};
      for (const [k, v] of ns) out[k] = v; return out;
    },
    clear(namespace?: string): void {
      if (namespace) store.delete(namespace); else store.clear();
      dirty = true; _persist();
    },
    flush(): void { _persist(); },
    backend: () => backend,
  };
}

const _cmpsbl_state_store: CmpsblStateStore = _cmpsbl_create_state_store();

/** Public API — kernel components and user code may inspect/manage state. */
export function cmpsbl_state(): CmpsblStateStore { return _cmpsbl_state_store; }
export function cmpsbl_kernel_enabled(): boolean { return _cmpsbl_kernel_enabled(); }
export function cmpsbl_state_backend(): CmpsblStateBackend { return _cmpsbl_state_store.backend(); }
`;

const STATE_STORE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — State Store (sealed module, proprietary).                 ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import json
import os
import threading
import time
from typing import Any, Dict, Optional


def _cmpsbl_kernel_enabled() -> bool:
    """Default ON. Set CMPSBL_KERNEL_ENABLED=false to disable."""
    return os.environ.get("CMPSBL_KERNEL_ENABLED", "true").lower() != "false"


class CmpsblStateStore:
    """Thread-safe persistent state store. Memory or JSON-file backed."""

    def __init__(self):
        self._enabled = _cmpsbl_kernel_enabled()
        self._path = os.environ.get("CMPSBL_KERNEL_STATE_PATH", "")
        self._backend = "json" if self._path else "memory"
        if not self._enabled:
            self._backend = "disabled"
        self._store: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._lock = threading.RLock()
        self._dirty = False
        if self._enabled:
            self._hydrate()

    def _hydrate(self) -> None:
        if self._backend != "json" or not os.path.exists(self._path):
            return
        try:
            with open(self._path, "r", encoding="utf-8") as f:
                self._store = json.load(f) or {}
        except Exception:
            # Corrupt file — start fresh, never crash on hydrate.
            self._store = {}

    def _persist(self) -> None:
        if self._backend != "json" or not self._dirty:
            return
        try:
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(self._store, f)
            self._dirty = False
        except Exception:
            # Persistence is best-effort; never crash the runtime.
            pass

    def get(self, namespace: str, key: str) -> Optional[Any]:
        if not self._enabled:
            return None
        with self._lock:
            ns = self._store.get(namespace)
            if not ns:
                return None
            rec = ns.get(key)
            return rec["value"] if rec else None

    def set(self, namespace: str, key: str, value: Any) -> None:
        if not self._enabled:
            return
        with self._lock:
            ns = self._store.setdefault(namespace, {})
            prev = ns.get(key)
            ns[key] = {
                "value": value,
                "updated_at": time.time(),
                "version": (prev["version"] + 1) if prev else 1,
            }
            self._dirty = True
            self._persist()

    def delete(self, namespace: str, key: str) -> bool:
        if not self._enabled:
            return False
        with self._lock:
            ns = self._store.get(namespace)
            if not ns or key not in ns:
                return False
            del ns[key]
            self._dirty = True
            self._persist()
            return True

    def list(self, namespace: str) -> Dict[str, Dict[str, Any]]:
        if not self._enabled:
            return {}
        with self._lock:
            return dict(self._store.get(namespace, {}))

    def clear(self, namespace: Optional[str] = None) -> None:
        if not self._enabled:
            return
        with self._lock:
            if namespace:
                self._store.pop(namespace, None)
            else:
                self._store.clear()
            self._dirty = True
            self._persist()

    def flush(self) -> None:
        with self._lock:
            self._persist()

    def backend(self) -> str:
        return self._backend


_cmpsbl_state_store = CmpsblStateStore()


def cmpsbl_state() -> CmpsblStateStore:
    """Public API — kernel components and user code may inspect/manage state."""
    return _cmpsbl_state_store


def cmpsbl_kernel_enabled() -> bool:
    return _cmpsbl_kernel_enabled()


def cmpsbl_state_backend() -> str:
    return _cmpsbl_state_store.backend()
`;

const STATE_STORE_WIRE_TS = `
// State Store auto-wires by initialization — no execute() interception needed.
// Kernel components (Quarantine, ContractValidator, IsolatedExecutor) call
// cmpsbl_state() directly. Surfacing diagnostics here for visibility.
if (cmpsbl_kernel_enabled()) {
  // No-op marker: confirms the store is live and reachable from Layer 2.
  void cmpsbl_state_backend();
}`;

const STATE_STORE_WIRE_PY = `
# State Store auto-wires by initialization — no execute() interception needed.
# Kernel components call cmpsbl_state() directly. Surfacing diagnostics for visibility.
if cmpsbl_kernel_enabled():
    _ = cmpsbl_state_backend()`;

const STATE_STORE_CORE: CmpsblLayerDefinition = {
  id: 'state-store',
  name: 'State Store',
  crownJewelRank: 41,
  cjpi: 91,
  module: 'EVOLUTION',
  description:
    'Kernel-grade persistent state substrate. Backs all governing primitives (Quarantine, ContractValidator, IsolatedExecutor) with thread-safe in-memory or JSON-file storage. Survives process restarts when CMPSBL_KERNEL_STATE_PATH is set. Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: STATE_STORE_TS,
  pyCode: STATE_STORE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_state',
    behavior:
      'Initializes the kernel state store at module load. Other kernel components consume cmpsbl_state() to read/write namespaced records. Disabled cleanly when CMPSBL_KERNEL_ENABLED=false.',
    tsWire: STATE_STORE_WIRE_TS,
    pyWire: STATE_STORE_WIRE_PY,
  },
};

export { STATE_STORE_CORE };
