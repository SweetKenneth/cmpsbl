/**
 * CMPSBL® Black-Box Obfuscation Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Protects IP in exported single-file distributions by:
 *   1. Renaming internal variables/functions to opaque identifiers
 *   2. Obfuscating proprietary constants (CJPI weights, tier thresholds)
 *   3. Stripping internal implementation comments
 *   4. Adding sealed runtime notice + integrity hash
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
  'MINI-RUNTIME', 'MODULE EFFECTS', 'RUNTIME BRIDGE', 'CAPABILITY API',
  'SEALED', 'CMPSBL®', '© 2025', '© 2026',
  'DO NOT MODIFY', 'REDISTRIBUTION PROHIBITED',
  'DROP-IN DISTRIBUTION',
  '═══', '╔', '╚', '║',
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Main Black-Box Function
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply black-box obfuscation to a generated capability file.
 * Preserves public API, obfuscates internals, adds sealed notice.
 */
export function blackboxFile(source: string, lang: string): string {
  let result = source;

  // 1. Add sealed runtime header
  const sealedNotice = getSealedNotice(lang);
  const headerEndIdx = findHeaderEnd(result, lang);
  if (headerEndIdx > 0) {
    result = result.slice(0, headerEndIdx) + '\n' + sealedNotice + '\n' + result.slice(headerEndIdx);
  }

  // 2. Insert obfuscated constant declarations (after imports, before first function)
  const constantsBlock = getObfuscatedConstants(lang);
  const insertPoint = findConstantInsertPoint(result, lang);
  if (insertPoint > 0) {
    result = result.slice(0, insertPoint) + '\n' + constantsBlock + '\n' + result.slice(insertPoint);
  }

  // 3. Obfuscate proprietary constants (CJPI weights, tier thresholds)
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go'].includes(lang)) {
    for (const [pattern, replacement] of CONSTANT_OBFUSCATION) {
      result = result.replace(pattern, replacement);
    }
  }

  // 4. Obfuscate internal variable names
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go', 'java', 'csharp', 'swift', 'kotlin'].includes(lang)) {
    for (const [pattern, replacement] of OBFUSCATION_MAP) {
      result = result.replace(pattern, replacement);
    }
  }

  // 5. Strip verbose internal comments (keep section headers, JSDoc, and sealed notices)
  result = stripInternalComments(result, lang);

  // 6. Add integrity seal at the bottom
  const integrityHash = computeSimpleHash(result);
  const commentPrefix = getCommentPrefix(lang);
  result += `\n${commentPrefix} ═══ SEALED RUNTIME INTEGRITY ═══\n`;
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
    `${c} ╔═══════════════════════════════════════════════════════════════════╗`,
    `${c} ║  CMPSBL® SEALED RUNTIME — PROPRIETARY DISTRIBUTION              ║`,
    `${c} ║                                                                   ║`,
    `${c} ║  This file contains the CMPSBL® Mini-Runtime™ Engine,            ║`,
    `${c} ║  Module Effects, Runtime Bridge, and Capability API.              ║`,
    `${c} ║  All components are BUILT INTO this single file.                  ║`,
    `${c} ║  No external runtime installation required.                       ║`,
    `${c} ║                                                                   ║`,
    `${c} ║  DO NOT MODIFY internal runtime sections.                         ║`,
    `${c} ║  DO NOT extract or redistribute the runtime separately.           ║`,
    `${c} ║  Decompilation or reverse engineering is prohibited.              ║`,
    `${c} ║  Scoring parameters are sealed and tamper-evident.                ║`,
    `${c} ║                                                                   ║`,
    `${c} ║  © 2025–2026 CMPSBL®. All rights reserved.                       ║`,
    `${c} ╚═══════════════════════════════════════════════════════════════════╝`,
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
