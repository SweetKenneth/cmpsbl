/**
 * CMPSBL® Inventory Layer — Memory Compression Suite
 * Primitives: COMPACTOR · DEDUPE · CHUNKER · INDEX
 *
 *   COMPACTOR → run-length encoding for repetitive token streams
 *   DEDUPE    → content-address dedup table (FNV-1a 32-bit hash)
 *   CHUNKER   → fixed-size byte chunker w/ overlap
 *   INDEX     → tiny inverted index (token -> doc ids) with query AND
 *
 * Auto-wire intercepts string-bearing inputs and dedups identical payloads
 * within a session, returning the cached ExecutionResult instead of
 * re-running the capability.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Memory Compression Suite (proprietary).                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── COMPACTOR · run-length encode/decode ────────────────────────────────────
export function cmpsbl_mcs_compactor_rle(tokens: string[]): Array<[string, number]> {
  const out: Array<[string, number]> = [];
  for (const t of tokens) {
    const last = out[out.length - 1];
    if (last && last[0] === t) last[1] += 1;
    else out.push([t, 1]);
  }
  return out;
}
export function cmpsbl_mcs_compactor_unrle(pairs: Array<[string, number]>): string[] {
  const out: string[] = [];
  for (const [t, n] of pairs) for (let i = 0; i < n; i++) out.push(t);
  return out;
}

// ── DEDUPE · FNV-1a 32-bit fingerprint ──────────────────────────────────────
export function cmpsbl_mcs_dedupe_fp(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('00000000' + h.toString(16)).slice(-8);
}

// ── CHUNKER · fixed-size with overlap ───────────────────────────────────────
export function cmpsbl_mcs_chunker_split(text: string, size: number, overlap: number = 0): string[] {
  if (size <= 0) return [text];
  const step = Math.max(1, size - Math.max(0, overlap));
  const out: string[] = [];
  for (let i = 0; i < text.length; i += step) out.push(text.slice(i, i + size));
  return out;
}

// ── INDEX · tiny inverted index ─────────────────────────────────────────────
export type CmpsblIndex = Record<string, Set<string>>;
export function cmpsbl_mcs_index_new(): CmpsblIndex { return {}; }
export function cmpsbl_mcs_index_add(idx: CmpsblIndex, docId: string, tokens: string[]): void {
  for (const t of tokens) {
    if (!idx[t]) idx[t] = new Set<string>();
    idx[t].add(docId);
  }
}
export function cmpsbl_mcs_index_query_and(idx: CmpsblIndex, tokens: string[]): string[] {
  if (tokens.length === 0) return [];
  const sets = tokens.map(t => idx[t] ?? new Set<string>());
  sets.sort((a, b) => a.size - b.size);
  const out: string[] = [];
  for (const id of sets[0]) {
    let all = true;
    for (let i = 1; i < sets.length; i++) if (!sets[i].has(id)) { all = false; break; }
    if (all) out.push(id);
  }
  return out;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Memory Compression Suite (proprietary).                    ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Dict, List, Tuple, Set

def cmpsbl_mcs_compactor_rle(tokens: List[str]) -> List[Tuple[str, int]]:
    out: List[Tuple[str, int]] = []
    for t in tokens:
        if out and out[-1][0] == t:
            out[-1] = (t, out[-1][1] + 1)
        else:
            out.append((t, 1))
    return out

def cmpsbl_mcs_compactor_unrle(pairs: List[Tuple[str, int]]) -> List[str]:
    out: List[str] = []
    for t, n in pairs:
        out.extend([t] * n)
    return out

def cmpsbl_mcs_dedupe_fp(s: str) -> str:
    h = 0x811c9dc5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def cmpsbl_mcs_chunker_split(text: str, size: int, overlap: int = 0) -> List[str]:
    if size <= 0: return [text]
    step = max(1, size - max(0, overlap))
    out: List[str] = []
    i = 0
    while i < len(text):
        out.append(text[i:i + size])
        i += step
    return out

def cmpsbl_mcs_index_new() -> Dict[str, Set[str]]:
    return {}

def cmpsbl_mcs_index_add(idx: Dict[str, Set[str]], doc_id: str, tokens: List[str]) -> None:
    for t in tokens:
        idx.setdefault(t, set()).add(doc_id)

def cmpsbl_mcs_index_query_and(idx: Dict[str, Set[str]], tokens: List[str]) -> List[str]:
    if not tokens: return []
    sets = sorted([idx.get(t, set()) for t in tokens], key=len)
    return [d for d in sets[0] if all(d in s for s in sets[1:])]
`;

const WIRE_TS = `
const _cmpsbl_mcs_cache = new Map<string, ExecutionResult>();
const _cmpsbl_raw_execute_mcs = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_mcs(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // DEDUPE — fingerprint capability + input; serve from cache on hit
  let key: string;
  try { key = capabilityName + ':' + cmpsbl_mcs_dedupe_fp(JSON.stringify(input ?? {})); }
  catch { return _cmpsbl_raw_execute_mcs(capabilityName, input); }
  const hit = _cmpsbl_mcs_cache.get(key);
  if (hit !== undefined) return hit;
  const result = _cmpsbl_raw_execute_mcs(capabilityName, input);
  _cmpsbl_mcs_cache.set(key, result);
  return result;
};`;

const WIRE_PY = `
_cmpsbl_mcs_cache = {}
_cmpsbl_raw_execute_mcs = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Memory Compression Suite (DEDUPE input cache)."""
    import json
    try:
        key = capability_name + ':' + cmpsbl_mcs_dedupe_fp(json.dumps(input_data, sort_keys=True, default=str))
    except Exception:
        return _cmpsbl_raw_execute_mcs(capability_name, input_data)
    if key in _cmpsbl_mcs_cache:
        return _cmpsbl_mcs_cache[key]
    result = _cmpsbl_raw_execute_mcs(capability_name, input_data)
    _cmpsbl_mcs_cache[key] = result
    return result`;

export const MEMORY_COMPRESSION_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'memory-compression-suite',
  name: 'Memory Compression Suite',
  crownJewelRank: 29,
  cjpi: 87,
  module: 'MEMORY',
  description: 'COMPACTOR RLE + DEDUPE FNV-1a fingerprint + CHUNKER overlap split + INDEX inverted-AND query.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_mcs_dedupe_fp',
    behavior: 'Caches execution results by capability + input fingerprint; identical calls served from memory.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
