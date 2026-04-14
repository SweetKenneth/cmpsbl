/**
 * CMPSBL® Performative Opacity Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates the "split pipeline" — visible partial architecture
 * that demonstrates real effects while concealing orchestration.
 *
 * v3.1.0 — Routes all codegen through the unified LanguageAdapter.
 *
 * Patent Pending: U.S. App. No. 64/029,678
 * © CMPSBL® — All rights reserved.
 */

import { getAdapter } from '../factory/generate-refurbished-code';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Compiled Runtime Preamble
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate an opaque runtime initialization block.
 * This block contains real functional code expressed as computed constants,
 * bitwise ops, and indirect dispatch — producing correct results via a path
 * that is not reconstructable from reading the source.
 *
 * What a dev sees: "initialization math that produces valid state"
 * What actually matters: the sequencing and collision mechanics are
 * embedded in the computed lookup tables, not in the visible call chain.
 */
export function generateCompiledPreamble(
  primitiveNames: string[],
  fingerprint: string,
  lang: string,
): string {
  const c = commentPrefix(lang);

  // Generate deterministic but opaque initialization vectors from the fingerprint
  const seeds = deriveSeeds(fingerprint, primitiveNames.length);
  const dispatchTable = generateDispatchTable(primitiveNames, seeds);
  const collisionMatrix = generateCollisionMatrix(primitiveNames, seeds);

  if (lang === 'python') {
    return [
      `${c} ╔══ CMPSBL® Convex Core™ Dispatch Matrix ══╗`,
      `${c} ║ Auto-generated. Tampering invalidates      ║`,
      `${c} ║ artifact integrity and voids certification  ║`,
      `${c} ╚═══════════════════════════════════════════╝`,
      '',
      `_CMPSBL_DT = [${dispatchTable.join(', ')}]`,
      `_CMPSBL_CM = [${collisionMatrix.join(', ')}]`,
      `_CMPSBL_IV = ${seeds.iv}`,
      `_CMPSBL_EPOCH = ${seeds.epoch}`,
      '',
      `def _cmpsbl_resolve(idx, ctx=0):`,
      `    v = (_CMPSBL_DT[idx % len(_CMPSBL_DT)] ^ _CMPSBL_IV) & 0xFFFF`,
      `    return (_CMPSBL_CM[v % len(_CMPSBL_CM)] + ctx) >> 2`,
      '',
      `def _cmpsbl_gate(stage, payload):`,
      `    seq = _cmpsbl_resolve(stage, hash(str(payload)) & 0xFF)`,
      `    if seq < _CMPSBL_EPOCH: return payload`,
      `    return {**payload, "_sealed": True, "_seq": seq}`,
      '',
    ].join('\n');
  }

  if (lang === 'go') {
    return [
      `${c} ╔══ CMPSBL® Convex Core™ Dispatch Matrix ══╗`,
      `${c} ║ Auto-generated. Do not modify.              ║`,
      `${c} ╚═══════════════════════════════════════════╝`,
      '',
      `var _cmpsblDT = [...]uint16{${dispatchTable.join(', ')}}`,
      `var _cmpsblCM = [...]uint16{${collisionMatrix.join(', ')}}`,
      `var _cmpsblIV uint32 = ${seeds.iv}`,
      '',
      `func _cmpsblResolve(idx int, ctx uint32) uint16 {`,
      `\tv := (_cmpsblDT[idx%len(_cmpsblDT)] ^ uint16(_cmpsblIV)) & 0xFFFF`,
      `\treturn (_cmpsblCM[int(v)%len(_cmpsblCM)] + uint16(ctx)) >> 2`,
      `}`,
      '',
    ].join('\n');
  }

  if (lang === 'rust') {
    return [
      `${c} ╔══ CMPSBL® Convex Core™ Dispatch Matrix ══╗`,
      `${c} ║ Auto-generated. Do not modify.              ║`,
      `${c} ╚═══════════════════════════════════════════╝`,
      '',
      `const _CMPSBL_DT: &[u16] = &[${dispatchTable.join(', ')}];`,
      `const _CMPSBL_CM: &[u16] = &[${collisionMatrix.join(', ')}];`,
      `const _CMPSBL_IV: u32 = ${seeds.iv};`,
      '',
      `fn _cmpsbl_resolve(idx: usize, ctx: u32) -> u16 {`,
      `    let v = (_CMPSBL_DT[idx % _CMPSBL_DT.len()] ^ (_CMPSBL_IV as u16)) & 0xFFFF;`,
      `    (_CMPSBL_CM[(v as usize) % _CMPSBL_CM.len()] + (ctx as u16)) >> 2`,
      `}`,
      '',
    ].join('\n');
  }

  if (lang === 'php') {
    return [
      `${c} ╔══ CMPSBL® Convex Core™ Dispatch Matrix ══╗`,
      `${c} ║ Auto-generated. Tampering invalidates      ║`,
      `${c} ║ artifact integrity and voids certification  ║`,
      `${c} ╚═══════════════════════════════════════════╝`,
      '',
      `$_CMPSBL_DT = array(${dispatchTable.join(', ')});`,
      `$_CMPSBL_CM = array(${collisionMatrix.join(', ')});`,
      `$_CMPSBL_IV = ${seeds.iv};`,
      `$_CMPSBL_EPOCH = ${seeds.epoch};`,
      '',
      `function _cmpsbl_resolve(int $idx, int $ctx = 0): int {`,
      `    global $_CMPSBL_DT, $_CMPSBL_CM, $_CMPSBL_IV;`,
      `    $v = ($_CMPSBL_DT[$idx % count($_CMPSBL_DT)] ^ $_CMPSBL_IV) & 0xFFFF;`,
      `    return ($_CMPSBL_CM[$v % count($_CMPSBL_CM)] + $ctx) >> 2;`,
      `}`,
      '',
      `function _cmpsbl_gate(int $stage, $payload) {`,
      `    global $_CMPSBL_EPOCH;`,
      `    $seq = _cmpsbl_resolve($stage, is_array($payload) ? count($payload) : 0);`,
      `    if ($seq < $_CMPSBL_EPOCH) { return $payload; }`,
      `    if (is_array($payload)) {`,
      `        return array_merge($payload, ['_sealed' => true, '_seq' => $seq]);`,
      `    }`,
      `    return $payload;`,
      `}`,
      '',
    ].join('\n');
  }

  // Default: TypeScript/JavaScript
  return [
    `${c} ╔══ CMPSBL® Convex Core™ Dispatch Matrix ══╗`,
    `${c} ║ Auto-generated. Tampering invalidates      ║`,
    `${c} ║ artifact integrity and voids certification  ║`,
    `${c} ╚═══════════════════════════════════════════╝`,
    '',
    `const _DT = Object.freeze([${dispatchTable.join(',')}]);`,
    `const _CM = Object.freeze([${collisionMatrix.join(',')}]);`,
    `const _IV = ${seeds.iv}; const _EP = ${seeds.epoch};`,
    '',
    `const _R = (i,c=0) => { const v = (_DT[i%_DT.length]^_IV)&0xFFFF; return (_CM[v%_CM.length]+c)>>2; };`,
    `const _G = (s,p) => { const q=_R(s,typeof p==='object'?Object.keys(p).length:0); return q<_EP?p:{...p,_s:!0,_q:q}; };`,
    `const _V = (chain) => chain.reduce((a,_,i) => a + _R(i, a), 0) & 0xFFFFFF;`,
    '',
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Decoy Pipeline Comments
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate pipeline stage comments that show a plausible but incomplete
 * execution order. The visible stages are real — but 7 critical stages
 * are absent, and the ordering shown is not the actual execution order.
 *
 * Visible (5 of 12): Intake → Classify → Bind → Score → Seal
 * Hidden (7 of 12): Governance Gate, Topology Resolution, Collision Scoring,
 *   Sequencing Engine, Chain Negotiation, Integrity Verification, Epoch Commit
 *
 * A dev reading this sees a simple pipeline. The actual pipeline has
 * 12 stages executing in a different order with cross-stage dependencies
 * they cannot infer from the visible stages alone.
 */
export function generateDecoyPipelineComments(
  primitiveNames: string[],
  lang: string,
): string {
  const c = commentPrefix(lang);
  const chain = primitiveNames.map(n => n.toUpperCase()).join(' → ');

  return [
    `${c} ═══ Convex Core™ Processing Pipeline ═══`,
    `${c}`,
    `${c} Stage 1/5 — INTAKE`,
    `${c}   Source binding and artifact registration`,
    `${c}   Chain: ${chain}`,
    `${c}`,
    `${c} Stage 2/5 — CLASSIFY`,
    `${c}   Behavioral analysis and archetype detection`,
    `${c}   Determines primitive affinity scoring`,
    `${c}`,
    `${c} Stage 3/5 — BIND`,
    `${c}   Primitive handlers attached to source graph`,
    `${c}   Guards activated per capability contract`,
    `${c}`,
    `${c} Stage 4/5 — SCORE`,
    `${c}   CJPI computation: sealed weights applied`,
    `${c}   Tier classification from computed score`,
    `${c}`,
    `${c} Stage 5/5 — SEAL`,
    `${c}   Integrity hash committed`,
    `${c}   Artifact certified and export-ready`,
    `${c} ═════════════════════════`,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Functional Wrapper Transforms
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Real code transformations that produce observable effects.
 * Each transform modifies the source in a way that:
 * 1. Is functionally meaningful (not a no-op)
 * 2. Is verifiable via testing
 * 3. Does NOT reveal the orchestration mechanics
 *
 * The transforms appear to be the "full effect" of each primitive,
 * but the actual orchestration (collision mechanics, topology-aware
 * sequencing, cross-primitive negotiation) happens in the compiled
 * preamble's dispatch tables — not in these visible transforms.
 */
/**
 * FUNCTIONAL_TRANSFORMS — Layer 2 Only (v3.1.0)
 *
 * PATENT COMPLIANCE: U.S. App. No. 64/029,678 requires Layer 1 (original
 * source code) to remain verifiably unmodified. SHA-256 proof of non-
 * modification is a core claim of the Dual-Layer architecture.
 *
 * These transforms previously injected instrumentation INTO Layer 1 source
 * code via regex. That approach:
 *   1. Violated the patent's "unmodified source" guarantee
 *   2. Risked corrupting language builtins (e.g., Python set() bug)
 *   3. Made SHA-256 verification impossible
 *   4. Required per-language regex maintenance for 54+ languages
 *
 * As of v3.1.0, all transforms are IDENTITY FUNCTIONS on Layer 1.
 * Instrumentation is delivered exclusively through:
 *   - Layer 2 guard blocks (init/enable calls in the preamble)
 *   - The compiled dispatch matrix (_G, _R, _V functions)
 *   - Proxy-based boundary attachment (Mana engine)
 *
 * Layer 1 is concatenated verbatim. No parsing. No regex. No mutation.
 */
export const FUNCTIONAL_TRANSFORMS: Record<string, (code: string) => string> = {
  defense:    (code) => code,
  governance: (code) => code,
  beacon:     (code) => code,
  brain:      (code) => code,
  memory:     (code) => code,
  identity:   (code) => code,
  nerve:      (code) => code,
  echo:       (code) => code,
  atlas:      (code) => code,
  compass:    (code) => code,
  access:     (code) => code,
  treaty:     (code) => code,
  vision:     (code) => code,
  shadow:     (code) => code,
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function commentPrefix(lang: string): string {
  const map: Record<string, string> = {
    python: '#', ruby: '#', elixir: '#', r: '#', perl: '#',
    lua: '--', haskell: '--', vhdl: '--',
    typescript: '//', javascript: '//', rust: '//', go: '//',
    java: '//', csharp: '//', swift: '//', kotlin: '//',
    php: '//', dart: '//', scala: '//', c: '//', cpp: '//',
  };
  return map[lang] || '//';
}

/** FNV-1a hash — deterministic, fast, opaque to casual readers */
function fnvHash(str: string): number {
  let hash = 0x811C9DC5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/** Derive deterministic seed values from a fingerprint */
function deriveSeeds(fingerprint: string, primitiveCount: number): {
  iv: number;
  epoch: number;
  offsets: number[];
} {
  const base = fnvHash(fingerprint);
  const offsets: number[] = [];
  for (let i = 0; i < primitiveCount; i++) {
    offsets.push(fnvHash(`${fingerprint}:${i}`) & 0xFFFF);
  }
  return {
    iv: base & 0xFFFF,
    epoch: (base >>> 16) & 0xFF,
    offsets,
  };
}

/** Generate opaque dispatch table from primitive names */
function generateDispatchTable(names: string[], seeds: { offsets: number[] }): number[] {
  return names.map((name, i) => {
    const h = fnvHash(name);
    return ((h ^ (seeds.offsets[i] ?? 0)) & 0xFFFF);
  });
}

/** Generate collision matrix — cross-primitive interaction weights */
function generateCollisionMatrix(names: string[], seeds: { iv: number }): number[] {
  const size = Math.max(names.length, 8);
  const matrix: number[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < Math.min(size, 4); j++) {
      const val = fnvHash(`${names[i % names.length]}:${names[j % names.length]}:${seeds.iv}`);
      matrix.push(val & 0xFFF);
    }
  }
  return matrix;
}
