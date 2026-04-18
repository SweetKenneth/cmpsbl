/**
 * CMPSBL® Always-On Core — Contract Versioning (Kernel Component #19)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Multi-version contract registry with auto-routing of legacy callers.
 * Contracts register version → handler bindings; resolveVersion(name, requested)
 * returns the best match (exact > latest minor > latest major fallback).
 *
 * Pairs with Shadow Execution for zero-downtime upgrades: register v2 alongside
 * v1, route shadow traffic to v2, compare envelopes, promote when divergence
 * stays clean. Bounded migration log (128).
 *
 * Module: GOVERNANCE  ·  CJPI: 92  ·  Crown Jewel #59
 * © CMPSBL® — All rights reserved.
 */
import type { CmpsblLayerDefinition } from './types';

const VERSIONING_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION KERNEL — Contract Versioning (sealed module, proprietary).         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblVersionResolution {
  name: string;
  requested: string;
  resolved: string;
  strategy: 'exact' | 'latest-minor' | 'latest-major' | 'latest' | 'none';
}

interface CmpsblMigrationRecord {
  name: string;
  fromVersion: string;
  toVersion: string;
  ts: number;
}

function _cmpsbl_kernel_enabled_cv(): boolean {
  const v = (typeof process !== 'undefined' && process.env?.CMPSBL_KERNEL_ENABLED) || 'true';
  return String(v).toLowerCase() !== 'false';
}

const _CMPSBL_CV_MIGRATION_LOG_MAX = 128;

interface _ParsedVersion { major: number; minor: number; patch: number; raw: string }

function _cmpsbl_parse_version(v: string): _ParsedVersion {
  const m = /^(\\d+)(?:\\.(\\d+))?(?:\\.(\\d+))?/.exec(v.trim());
  if (!m) return { major: 0, minor: 0, patch: 0, raw: v };
  return {
    major: parseInt(m[1], 10),
    minor: m[2] ? parseInt(m[2], 10) : 0,
    patch: m[3] ? parseInt(m[3], 10) : 0,
    raw: v,
  };
}

function _cmpsbl_compare_version(a: _ParsedVersion, b: _ParsedVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

class CmpsblContractVersioning {
  private versions: Map<string, Set<string>> = new Map();
  private migrations: CmpsblMigrationRecord[] = [];
  private enabled: boolean;

  constructor() { this.enabled = _cmpsbl_kernel_enabled_cv(); }

  register(name: string, version: string): void {
    if (!this.enabled) return;
    let set = this.versions.get(name);
    if (!set) { set = new Set(); this.versions.set(name, set); }
    set.add(version);
  }

  /** Resolve requested version. Strategy: exact → latest-minor → latest-major → latest. */
  resolveVersion(name: string, requested: string): CmpsblVersionResolution {
    const set = this.versions.get(name);
    if (!set || set.size === 0) {
      return { name, requested, resolved: '', strategy: 'none' };
    }
    const all = [...set];
    if (set.has(requested)) {
      return { name, requested, resolved: requested, strategy: 'exact' };
    }
    const target = _cmpsbl_parse_version(requested);
    const parsed = all.map(v => ({ v, p: _cmpsbl_parse_version(v) }));
    const sameMajorMinor = parsed
      .filter(x => x.p.major === target.major && x.p.minor === target.minor)
      .sort((a, b) => _cmpsbl_compare_version(b.p, a.p));
    if (sameMajorMinor.length > 0) {
      return { name, requested, resolved: sameMajorMinor[0].v, strategy: 'latest-minor' };
    }
    const sameMajor = parsed
      .filter(x => x.p.major === target.major)
      .sort((a, b) => _cmpsbl_compare_version(b.p, a.p));
    if (sameMajor.length > 0) {
      return { name, requested, resolved: sameMajor[0].v, strategy: 'latest-major' };
    }
    parsed.sort((a, b) => _cmpsbl_compare_version(b.p, a.p));
    return { name, requested, resolved: parsed[0].v, strategy: 'latest' };
  }

  recordMigration(name: string, fromVersion: string, toVersion: string): void {
    if (!this.enabled) return;
    this.migrations.push({ name, fromVersion, toVersion, ts: Date.now() });
    if (this.migrations.length > _CMPSBL_CV_MIGRATION_LOG_MAX) this.migrations.shift();
  }

  versionsFor(name: string): string[] {
    const set = this.versions.get(name);
    return set ? [...set] : [];
  }
  registeredAll(): Array<{ name: string; versions: string[] }> {
    return [...this.versions.entries()].map(([name, set]) => ({ name, versions: [...set] }));
  }
  migrationsFor(name: string): CmpsblMigrationRecord[] {
    return this.migrations.filter(m => m.name === name).map(m => ({ ...m }));
  }
  allMigrations(): CmpsblMigrationRecord[] { return this.migrations.map(m => ({ ...m })); }
  reset(): void { this.versions.clear(); this.migrations = []; }
}

const _cmpsbl_versioning_inst = new CmpsblContractVersioning();

function cmpsbl_versioning(): CmpsblContractVersioning {
  return _cmpsbl_versioning_inst;
}
`;

const VERSIONING_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION KERNEL — Contract Versioning (sealed module, proprietary).         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import os
import re
import time
from typing import Dict, List, Set, Tuple


def _cmpsbl_kernel_enabled_cv() -> bool:
    return str(os.environ.get("CMPSBL_KERNEL_ENABLED", "true")).lower() != "false"


_CMPSBL_CV_MIGRATION_LOG_MAX = 128
_VERSION_RE = re.compile(r"^(\\d+)(?:\\.(\\d+))?(?:\\.(\\d+))?")


def _cmpsbl_parse_version(v: str) -> Tuple[int, int, int]:
    m = _VERSION_RE.match(v.strip())
    if not m:
        return (0, 0, 0)
    return (int(m.group(1)),
            int(m.group(2)) if m.group(2) else 0,
            int(m.group(3)) if m.group(3) else 0)


class CmpsblContractVersioning:
    def __init__(self) -> None:
        self._enabled = _cmpsbl_kernel_enabled_cv()
        self._versions: Dict[str, Set[str]] = {}
        self._migrations: List[Dict[str, object]] = []

    def register(self, name: str, version: str) -> None:
        if not self._enabled:
            return
        self._versions.setdefault(name, set()).add(version)

    def resolve_version(self, name: str, requested: str) -> Dict[str, str]:
        s = self._versions.get(name)
        if not s:
            return {"name": name, "requested": requested, "resolved": "", "strategy": "none"}
        if requested in s:
            return {"name": name, "requested": requested, "resolved": requested, "strategy": "exact"}
        target = _cmpsbl_parse_version(requested)
        parsed = [(v, _cmpsbl_parse_version(v)) for v in s]
        same_minor = sorted(
            [x for x in parsed if x[1][0] == target[0] and x[1][1] == target[1]],
            key=lambda x: x[1], reverse=True,
        )
        if same_minor:
            return {"name": name, "requested": requested, "resolved": same_minor[0][0],
                    "strategy": "latest-minor"}
        same_major = sorted(
            [x for x in parsed if x[1][0] == target[0]],
            key=lambda x: x[1], reverse=True,
        )
        if same_major:
            return {"name": name, "requested": requested, "resolved": same_major[0][0],
                    "strategy": "latest-major"}
        latest = sorted(parsed, key=lambda x: x[1], reverse=True)
        return {"name": name, "requested": requested, "resolved": latest[0][0],
                "strategy": "latest"}

    def record_migration(self, name: str, from_version: str, to_version: str) -> None:
        if not self._enabled:
            return
        self._migrations.append({
            "name": name, "fromVersion": from_version, "toVersion": to_version,
            "ts": int(time.time() * 1000),
        })
        if len(self._migrations) > _CMPSBL_CV_MIGRATION_LOG_MAX:
            self._migrations.pop(0)

    def versions_for(self, name: str) -> List[str]:
        return list(self._versions.get(name, set()))

    def registered_all(self) -> List[Dict[str, object]]:
        return [{"name": n, "versions": list(s)} for n, s in self._versions.items()]

    def migrations_for(self, name: str) -> List[Dict[str, object]]:
        return [dict(m) for m in self._migrations if m["name"] == name]

    def all_migrations(self) -> List[Dict[str, object]]:
        return [dict(m) for m in self._migrations]

    def reset(self) -> None:
        self._versions.clear()
        self._migrations = []


_cmpsbl_versioning_inst = CmpsblContractVersioning()


def cmpsbl_versioning() -> CmpsblContractVersioning:
    return _cmpsbl_versioning_inst
`;

const VERSIONING_WIRE_TS = `
// Contract Versioning — multi-version registry with auto-routing. Use
// cmpsbl_versioning().register(name, version) per handler binding;
// resolveVersion(name, requested) returns best match via exact → latest-minor
// → latest-major → latest. Pairs with Shadow Execution for zero-downtime
// promotion. Bounded migration log (128).
if (_cmpsbl_kernel_enabled_cv()) {
  void cmpsbl_versioning();
}`;

const VERSIONING_WIRE_PY = `
# Contract Versioning — multi-version registry with auto-routing. Use
# cmpsbl_versioning().register(name, version) per handler binding;
# resolve_version(name, requested) returns best match via exact → latest-minor
# → latest-major → latest. Pairs with Shadow Execution for zero-downtime
# promotion. Bounded migration log (128).
if _cmpsbl_kernel_enabled_cv():
    _ = cmpsbl_versioning()`;

const CONTRACT_VERSIONING_CORE: CmpsblLayerDefinition = {
  id: 'contract-versioning',
  name: 'Contract Versioning',
  crownJewelRank: 59,
  cjpi: 92,
  module: 'GOVERNANCE',
  description:
    'Multi-version contract registry with intelligent routing. Resolution strategy: exact match → latest matching minor → latest matching major → latest overall. Enables zero-downtime upgrades when paired with Shadow Execution: register v2 alongside v1, observe in shadow, promote when clean. Bounded migration log (128). Gated by CMPSBL_KERNEL_ENABLED.',
  priceCents: 0,
  tsCode: VERSIONING_TS,
  pyCode: VERSIONING_PY,
  autoWire: {
    wrapperName: 'cmpsbl_versioning',
    behavior:
      'Initializes the version registry at module load. Contracts register their version on declaration; consumers call resolveVersion(name, requested) to obtain a binding. Migration records are emitted when callers shift versions, feeding the BEACON signal layer.',
    tsWire: VERSIONING_WIRE_TS,
    pyWire: VERSIONING_WIRE_PY,
  },
};

export { CONTRACT_VERSIONING_CORE };
