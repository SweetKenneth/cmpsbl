/**
 * CMPSBL® Black-Box Obfuscation Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Protects IP in exported single-file distributions by:
 *   1. Renaming internal variables/functions to opaque identifiers
 *   2. Obfuscating proprietary constants (CJPI weights, tier thresholds)
 *   3. Stripping internal implementation comments
 *   4. Adding Convex Core™ artifact notice + integrity hash
 *   5. Encoding scoring formula as computed constants
 *
 * PUBLIC API surface (execute, executeChain, validate, selfTest, etc.)
 * is preserved verbatim — only internals are obfuscated.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Identifier Obfuscation Map
// ═══════════════════════════════════════════════════════════════════════════════

const OBFUSCATION_MAP: [RegExp, string][] = [
  // Runtime internals
  [/\b_computeRawScore\b/g, '_crs'],
  [/\b_clampScore\b/g, '_cs'],
  [/\b_classifyTier\b/g, '_ct'],
  [/\b_hashPayload\b/g, '_hp'],
  [/\b_buildFingerprint\b/g, '_bf'],
  [/\b_sagaCompensate\b/g, '_sc'],
  [/\b_fsmTransitionTable\b/g, '_ftt'],
  [/\b_moduleRegistry\b/g, '_mr'],
  [/\b_handlerMap\b/g, '_hm'],
  [/\b_pipelineContext\b/g, '_pc'],
  [/\b_executionTrace\b/g, '_et'],
  [/\b_signalBuffer\b/g, '_sb'],
  [/\b_errorAccumulator\b/g, '_ea'],
  [/\b_stageResult\b/g, '_sr'],
  [/\b_contextSnapshot\b/g, '_csn'],
  [/\b_resolveHandler\b/g, '_rh'],
  [/\b_dispatchModule\b/g, '_dm'],
  [/\b_normalizeInput\b/g, '_ni'],
  [/\b_serializeOutput\b/g, '_so'],
  [/\b_validateChain\b/g, '_vc'],
  [/\b_topologicalOrder\b/g, '_to'],
  [/\b_cycleDetect\b/g, '_cd'],
  [/\b_depthFirstWalk\b/g, '_dfw'],
  [/\b_manifestVersion\b/g, '_mv'],
  [/\b_runtimeEpoch\b/g, '_re'],
  [/\b_bootstrapSequence\b/g, '_bs'],
  [/\b_guardEvaluate\b/g, '_ge'],
  [/\b_transitionFire\b/g, '_tf'],

  // Persistent memory adapter internals
  [/\bclassifyTier\b/g, '_cft'],
  [/\bcompactCollection\b/g, '_cc'],
  [/\bfindItem\b/g, '_fi'],
  [/\blistAll\b/g, '_la'],
  [/\bwriteItem\b/g, '_wi'],
  [/\breadItem\b/g, '_ri'],
  [/\bdeleteItem\b/g, '_di'],
  [/\bcollectionDir\b/g, '_cdr'],
  [/\bitemPath\b/g, '_ip'],
  [/\bhotCache\b/g, '_hc'],
  [/\bhotMaxMs\b/g, '_hm'],
  [/\bwarmMaxMs\b/g, '_wm'],
  [/\bcoldMaxMs\b/g, '_cm'],
  [/\bMemoryEnvelope\b/g, '_ME'],
  [/\bMemoryTier\b/g, '_MT'],
  [/\bautoCompact\b/g, '_ac'],
  [/\bensureDir\b/g, '_ed'],

  // Opacity engine internals — further obscure dispatch mechanics
  [/\b_cmpsbl_resolve\b/g, '_xr'],
  [/\b_cmpsbl_gate\b/g, '_xg'],
  [/\b_cmpsblResolve\b/g, '_xr'],
  [/\b_CMPSBL_DT\b/g, '_xD'],
  [/\b_CMPSBL_CM\b/g, '_xC'],
  [/\b_CMPSBL_IV\b/g, '_xI'],
  [/\b_CMPSBL_EPOCH\b/g, '_xE'],
  [/\b_cmpsblDT\b/g, '_xD'],
  [/\b_cmpsblCM\b/g, '_xC'],
  [/\b_cmpsblIV\b/g, '_xI'],
  [/\borchestr(?:ation|ator)/gi, 'sealed matrix'],
  [/\bcollision\s*(?:matrix|scoring|mechanics)/gi, 'dispatch table'],

  // ── CMPSBL® Hardening Layer internals (the 7 always-on cores + selectable layers).
  // Public class names (CmpsblCircuitBreaker, CmpsblTimeoutBox, ...) and public
  // methods (execute, should_attempt, record_success, record_failure, reset,
  // is_closed, ShouldAttempt, RecordSuccess, RecordFailure, IsClosed, Reset)
  // are NOT renamed — customer code calls them directly and brand visibility
  // is part of the moat. We obfuscate ONLY private fields, internal helpers,
  // and the FSM math that constitutes the actual trade secret.
  // Circuit Breaker private state
  [/\bfailure_threshold\b/g, '_ft1'],
  [/\bsuccess_threshold\b/g, '_st1'],
  [/\bfailureThreshold\b/g, '_ft1'],
  [/\bsuccessThreshold\b/g, '_st1'],
  [/\bconsecutive_successes\b/g, '_cx1'],
  [/\bconsecutiveSuccesses\b/g, '_cx1'],
  [/\bcurrent_timeout_ms\b/g, '_ct1'],
  [/\bcurrentTimeoutMs\b/g, '_ct1'],
  [/\bmax_timeout_ms\b/g, '_mt1'],
  [/\bmaxTimeoutMs\b/g, '_mt1'],
  [/\bbackoff_multiplier\b/g, '_bm1'],
  [/\bbackoffMultiplier\b/g, '_bm1'],
  [/\bopened_at\b/g, '_oa1'],
  [/\bopenedAt\b/g, '_oa1'],
  [/\btotal_calls\b/g, '_tc1'],
  [/\btotalCalls\b/g, '_tc1'],
  // Private helper methods (NOT the public surface)
  [/\bnow_ms\b/g, '_nm'],
  [/(?<!Cmpsbl)\btransition\b/g, '_tr1'],
  // Breaker panel registry (internal singleton)
  [/\bcmpsblBreakerPanel\b/g, '_bpx'],
  // Timeout / Retry private knobs
  [/\bdeadline_ms\b/g, '_dl1'],
  [/\bdeadlineMs\b/g, '_dl1'],
  [/\bjitter_ms\b/g, '_jt1'],
  [/\bjitterMs\b/g, '_jt1'],
  [/\bmax_attempts\b/g, '_ma1'],
  [/\bmaxAttempts\b/g, '_ma1'],
  [/\bbase_delay_ms\b/g, '_bd1'],
  [/\bbaseDelayMs\b/g, '_bd1'],
];

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Proprietary Constant Obfuscation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CJPI scoring weights and tier thresholds are competitive IP.
 * Replace readable constants with computed expressions that produce the same values
 * but are much harder to extract by inspection.
 */
const CONSTANT_OBFUSCATION: [RegExp, string][] = [
  // CJPI weights: 0.30, 0.30, 0.20, 0.20 → computed from encoded array
  // TypeScript/JavaScript
  [/\(novelty \* 0\.30\) \+ \(utility \* 0\.30\) \+ \(complexity \* 0\.20\) \+ \(composability \* 0\.20\)/g,
    '(novelty * _W[0]) + (utility * _W[1]) + (complexity * _W[2]) + (composability * _W[3])'],
  [/novelty \* 0\.30/g, 'novelty * _W[0]'],
  [/utility \* 0\.30/g, 'utility * _W[1]'],
  [/complexity \* 0\.20/g, 'complexity * _W[2]'],
  [/composability \* 0\.20/g, 'composability * _W[3]'],

  // Python weights
  [/novelty \* 0\.3(?:0)?/g, 'novelty * _W[0]'],
  [/utility \* 0\.3(?:0)?/g, 'utility * _W[1]'],
  [/complexity \* 0\.2(?:0)?/g, 'complexity * _W[2]'],
  [/composability \* 0\.2(?:0)?/g, 'composability * _W[3]'],

  // Tier thresholds: 92, 80, 65, 45
  [/score >= 92/g, 'score >= _T[0]'],
  [/score >= 80/g, 'score >= _T[1]'],
  [/score >= 65/g, 'score >= _T[2]'],
  [/score >= 45/g, 'score >= _T[3]'],

  // Memory tier thresholds (hours/days → ms)
  [/hotMaxHours\s*\?\?\s*24/g, '_MH[0]'],
  [/warmMaxDays\s*\?\?\s*7/g, '_MH[1]'],
  [/coldMaxDays\s*\?\?\s*parseInt\([^)]+\)/g, '_MH[2]'],
  [/'90'/g, "'' + _MH[3]"],
];

/**
 * Generate the obfuscated weight/threshold declarations for insertion.
 * The values are split into base + offset to prevent simple grep.
 */
function getObfuscatedConstants(lang: string): string {
  const c = getCommentPrefix(lang);
  
  if (lang === 'typescript' || lang === 'javascript') {
    return `${c} Sealed scoring parameters — DO NOT MODIFY
const _W = [0x1E, 0x1E, 0x14, 0x14].map(v => v / 100);
const _T = [0x5C, 0x50, 0x41, 0x2D];
const _MH = [0x18, 0x07, 0x5A, 0x5A];
`;
  }
  
  if (lang === 'python') {
    return `# Sealed scoring parameters — DO NOT MODIFY
_W = [v / 100 for v in [0x1E, 0x1E, 0x14, 0x14]]
_T = [0x5C, 0x50, 0x41, 0x2D]
`;
  }
  
  if (lang === 'php') {
    return `// Sealed scoring parameters — DO NOT MODIFY
define('CMPSBL_W', array_map(fn($v) => $v / 100, [0x1E, 0x1E, 0x14, 0x14]));
define('CMPSBL_T', [0x5C, 0x50, 0x41, 0x2D]);
`;
  }
  
  if (lang === 'rust') {
    return `// Sealed scoring parameters — DO NOT MODIFY
const _W: [f64; 4] = [0x1Eu32 as f64 / 100.0, 0x1Eu32 as f64 / 100.0, 0x14u32 as f64 / 100.0, 0x14u32 as f64 / 100.0];
const _T: [u32; 4] = [0x5C, 0x50, 0x41, 0x2D];
`;
  }
  
  if (lang === 'go') {
    return `// Sealed scoring parameters — DO NOT MODIFY
var _W = [4]float64{float64(0x1E) / 100, float64(0x1E) / 100, float64(0x14) / 100, float64(0x14) / 100}
var _T = [4]int{0x5C, 0x50, 0x41, 0x2D}
`;
  }
  
  if (lang === 'java' || lang === 'kotlin' || lang === 'csharp' || lang === 'swift' || lang === 'scala' || lang === 'dart') {
    return `${c} Sealed scoring parameters — DO NOT MODIFY
`;
  }
  
  return `${c} Sealed scoring parameters (built-in)\n`;
}

// Section markers that should NOT be stripped
const PRESERVED_PATTERNS = [
  '§1', '§2', '§3', '§4',
  'CONVEX CORE', 'MODULE EFFECTS', 'RUNTIME BRIDGE', 'CAPABILITY API',
  'SEALED', 'CMPSBL®', '© 2025', '© 2026',
  'DO NOT MODIFY', 'REDISTRIBUTION PROHIBITED',
  'DROP-IN DISTRIBUTION',
  '═══', '╔', '╚', '║',
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Main Black-Box Function
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// Layer 1 protection — obfuscation MUST NOT touch the original source region.
// We split the file into [pre-L1, L1 verbatim, post-L1], obfuscate only the
// non-L1 segments, then rejoin. This preserves the byte-perfect Layer 1 mandate
// (U.S. App. No. 64/029,678) while still sealing Layer 2 internals.
// ═══════════════════════════════════════════════════════════════════════════════

/** Locate the Layer 1 region by its banner markers. Returns null if absent. */
function findLayer1Region(source: string): { start: number; end: number } | null {
  // Begin markers (any of these)
  const beginRegexes = [
    /LAYER 1 — YOUR ORIGINAL SOURCE/,
    /LAYER 1 — ORIGINAL SOURCE/,
    /LAYER 1 — Original customer code/,
    /Layer 1 — Original Source/,
  ];
  // End markers
  const endRegexes = [
    /END LAYER 1/,
    /END OF LAYER 1/,
  ];

  let beginIdx = -1;
  for (const r of beginRegexes) {
    const m = source.match(r);
    if (m && m.index !== undefined) { beginIdx = m.index; break; }
  }
  if (beginIdx < 0) return null;

  // Walk back to start of the line containing the begin marker so we
  // don't strip the banner's leading comment characters.
  while (beginIdx > 0 && source[beginIdx - 1] !== '\n') beginIdx--;

  let endIdx = -1;
  for (const r of endRegexes) {
    const m = source.slice(beginIdx).match(r);
    if (m && m.index !== undefined) { endIdx = beginIdx + m.index; break; }
  }
  if (endIdx < 0) return null;

  // Extend endIdx past the rest of that line (so the closing banner row stays intact).
  const nextNewline = source.indexOf('\n', endIdx);
  const end = nextNewline === -1 ? source.length : nextNewline;
  // Also include the closing banner box bottom row if present (line starting with similar comment + ╚)
  const after = source.slice(end + 1);
  const closingBoxMatch = after.match(/^[ \t]*(?:\/\/|#|--)[ \t]*╚[^\n]*\n?/);
  const finalEnd = closingBoxMatch ? end + 1 + closingBoxMatch[0].length : end + 1;

  return { start: beginIdx, end: finalEnd };
}

/** Apply the full Layer-2 obfuscation pass to a single text segment. */
function obfuscateSegment(segment: string, lang: string): string {
  let result = segment;

  // Obfuscate proprietary constants (CJPI weights, tier thresholds)
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go'].includes(lang)) {
    for (const [pattern, replacement] of CONSTANT_OBFUSCATION) {
      result = result.replace(pattern, replacement);
    }
  }

  // Obfuscate internal identifiers
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go', 'java', 'csharp', 'swift', 'kotlin'].includes(lang)) {
    for (const [pattern, replacement] of OBFUSCATION_MAP) {
      result = result.replace(pattern, replacement);
    }
  }

  // Strip verbose internal comments
  result = stripInternalComments(result, lang);

  return result;
}

/**
 * Apply black-box obfuscation to a generated capability file.
 * Preserves public API + Layer 1 source verbatim, obfuscates Layer 2 internals,
 * adds sealed notice and integrity hash.
 */
export function blackboxFile(source: string, lang: string): string {
  // 1. Split off Layer 1 (must remain byte-identical)
  const region = findLayer1Region(source);

  let pre: string;
  let l1: string;
  let post: string;
  if (region) {
    pre  = source.slice(0, region.start);
    l1   = source.slice(region.start, region.end);
    post = source.slice(region.end);
  } else {
    // No Layer 1 banners — treat entire file as obfuscatable (e.g., sealed runtime files)
    pre  = source;
    l1   = '';
    post = '';
  }

  // 2. Obfuscate ONLY the non-L1 segments
  let obfPre  = obfuscateSegment(pre, lang);
  let obfPost = obfuscateSegment(post, lang);

  // 3. Prepend sealed notice — always at the very top so the SEALED RUNTIME /
  //    PROPRIETARY DISTRIBUTION marker is unambiguous and discoverable.
  const sealedNotice = getSealedNotice(lang);
  obfPre = sealedNotice + '\n\n' + obfPre;

  // 4. Insert obfuscated constant declarations (after imports, before first function)
  //    Always inject into the pre-segment so Layer 2 references resolve.
  const constantsBlock = getObfuscatedConstants(lang);
  const insertPoint = findConstantInsertPoint(obfPre, lang);
  if (insertPoint > 0) {
    obfPre = obfPre.slice(0, insertPoint) + '\n' + constantsBlock + '\n' + obfPre.slice(insertPoint);
  }

  // 5. Reassemble — Layer 1 is restored byte-for-byte
  let result = obfPre + l1 + obfPost;

  // 6. Append integrity seal at the very bottom
  const integrityHash = computeSimpleHash(result);
  const commentPrefix = getCommentPrefix(lang);
  result += `\n${commentPrefix} ═══ CONVEX CORE™ INTEGRITY ═══\n`;
  result += `${commentPrefix} Hash: ${integrityHash}\n`;
  result += `${commentPrefix} Sealed: ${new Date().toISOString().slice(0, 10)}\n`;
  result += `${commentPrefix} CMPSBL® runtime — built into this file. Redistribution as standalone product prohibited.\n`;
  result += `${commentPrefix} Decompilation, extraction, or reverse engineering of scoring parameters is prohibited.\n`;

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getSealedNotice(lang: string): string {
  const c = getCommentPrefix(lang);
  return [
    `${c} ╔═══════════════════════════════════════════════════════════════════════════════╗`,
    `${c} ║  CMPSBL® ASCENSION LAYER™ — SEALED RUNTIME · PROPRIETARY DISTRIBUTION         ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  This file contains the Ascension Layer runtime — a deterministic,            ║`,
    `${c} ║  patent-protected execution layer that wraps your code (LAYER 1).             ║`,
    `${c} ║  All components are baked into this single file — drop-in, zero deps.         ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  Sections marked Black-Boxed contain proprietary scoring, governance,         ║`,
    `${c} ║  and orchestration logic. DO NOT MODIFY, extract, or redistribute.            ║`,
    `${c} ║  Decompilation or reverse engineering of layer internals is prohibited.       ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  Configure layers, view telemetry, or learn more:                             ║`,
    `${c} ║    · https://cmpsbl.com                                                       ║`,
    `${c} ║    · npx @cmpsbl/cli   (advanced settings · layer management)                 ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  U.S. Patent App. No. 64/029,678 · No. 64/031,637                            ║`,
    `${c} ║  © 2025–2026 CMPSBL®. All rights reserved.                                   ║`,
    `${c} ╚═══════════════════════════════════════════════════════════════════════════════╝`,
  ].join('\n');
}

function getCommentPrefix(lang: string): string {
  const map: Record<string, string> = {
    typescript: '//', javascript: '//', python: '#', php: '//', rust: '//',
    go: '//', java: '//', csharp: '//', swift: '//', kotlin: '//',
    ruby: '#', lua: '--', dart: '//', scala: '//', elixir: '#',
    haskell: '--', zig: '//', c: '//', cpp: '//',
    verilog: '//', systemverilog: '//', vhdl: '--',
  };
  return map[lang] || '//';
}

function findHeaderEnd(source: string, lang: string): number {
  const lines = source.split('\n');
  const prefix = getCommentPrefix(lang);
  let inHeader = false;
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(prefix) || trimmed.startsWith('/*') || trimmed.startsWith('"""') || trimmed.startsWith('#')) {
      inHeader = true;
    } else if (inHeader && trimmed.length > 0) {
      return lines.slice(0, i).join('\n').length;
    }
  }
  return 0;
}

function findConstantInsertPoint(source: string, lang: string): number {
  const lines = source.split('\n');
  // Find first function/class declaration — insert constants just before
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (lang === 'typescript' || lang === 'javascript') {
      if (trimmed.startsWith('export function') || trimmed.startsWith('function ') || trimmed.startsWith('export class')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'python') {
      if (trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'php') {
      if (trimmed.startsWith('function ') || trimmed.startsWith('class ')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'rust') {
      if (trimmed.startsWith('pub fn ') || trimmed.startsWith('fn ') || trimmed.startsWith('pub struct')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'go') {
      if (trimmed.startsWith('func ') || trimmed.startsWith('type ')) {
        return lines.slice(0, i).join('\n').length;
      }
    }
  }
  return 0;
}

function stripInternalComments(source: string, lang: string): string {
  const prefix = getCommentPrefix(lang);
  const lines = source.split('\n');
  
  return lines.filter(line => {
    const trimmed = line.trim();
    // Keep non-comment lines
    if (!trimmed.startsWith(prefix)) return true;
    // Keep empty comment lines (spacing)
    if (trimmed === prefix) return true;
    // Keep preserved patterns (headers, legal, sealed notices)
    if (PRESERVED_PATTERNS.some(h => trimmed.includes(h))) return true;
    // Keep JSDoc / docstring markers
    if (trimmed.startsWith('/**') || trimmed.startsWith('*/') || trimmed.startsWith('* ')) return true;
    // Keep lines with just a few words (likely structural)
    const commentContent = trimmed.slice(prefix.length).trim();
    if (commentContent.length < 10) return true;
    // Strip verbose internal implementation comments
    // (anything that looks like an explanation of HOW the code works)
    if (commentContent.includes('TODO') || commentContent.includes('HACK') || commentContent.includes('FIXME')) return false;
    if (commentContent.startsWith('This ') || commentContent.startsWith('We ') || commentContent.startsWith('The ')) return false;
    if (commentContent.startsWith('Note:') || commentContent.startsWith('Explanation:')) return false;
    // Strip CMPSBL® Hardening Layer design comments — they leak the FSM/algorithm
    // shape (e.g. "Three-state FSM: closed -> open -> half-open with exponential backoff").
    // The Layer banner ("Ascension Layer™ — <Name>") is preserved by PRESERVED_PATTERNS above.
    const lower = commentContent.toLowerCase();
    if (lower.includes('three-state fsm') || lower.includes('exponential backoff')) return false;
    if (lower.includes('half-open') && lower.includes('closed')) return false;
    if (lower.includes('breaker panel') || lower.includes('breaker registry')) return false;
    if (lower.startsWith('three-state') || lower.startsWith('two-state')) return false;
    // Keep everything else
    return true;
  }).join('\n');
}

function computeSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}
