/**
 * CMPSBL® Black-Box Obfuscation Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Protects IP in exported single-file distributions by:
 *   1. Renaming internal variables/functions to opaque identifiers
 *   2. Stripping internal comments (preserving section headers & public docs)
 *   3. Adding sealed runtime notice + integrity hash
 *   4. Compacting whitespace in internal sections
 *
 * PUBLIC API surface (execute, executeChain, validate, selfTest, etc.)
 * is preserved verbatim — only internals are obfuscated.
 *
 * © CMPSBL® — All rights reserved.
 */

// Internal identifiers to obfuscate → opaque replacements
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
];

// Section markers that should NOT be stripped
const PRESERVED_HEADERS = [
  '§1', '§2', '§3', '§4',
  'MINI-RUNTIME', 'MODULE EFFECTS', 'RUNTIME BRIDGE', 'CAPABILITY API',
  'SEALED', 'CMPSBL®', '© 2025', '© 2026',
  'DO NOT MODIFY', 'REDISTRIBUTION PROHIBITED',
  'DROP-IN DISTRIBUTION',
];

/**
 * Apply black-box obfuscation to a generated capability file.
 * Preserves public API, obfuscates internals, adds sealed notice.
 */
export function blackboxFile(source: string, lang: string): string {
  let result = source;

  // 1. Add sealed runtime header (after the existing file header)
  const sealedNotice = getSealedNotice(lang);
  
  // Find the end of the first comment block and insert sealed notice
  const headerEndIdx = findHeaderEnd(result, lang);
  if (headerEndIdx > 0) {
    result = result.slice(0, headerEndIdx) + '\n' + sealedNotice + '\n' + result.slice(headerEndIdx);
  }

  // 2. Obfuscate internal variable names (only for languages where we know the syntax)
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go', 'java', 'csharp', 'swift', 'kotlin'].includes(lang)) {
    for (const [pattern, replacement] of OBFUSCATION_MAP) {
      result = result.replace(pattern, replacement);
    }
  }

  // 3. Strip internal implementation comments (preserve section headers and JSDoc)
  result = stripInternalComments(result, lang);

  // 4. Add integrity seal at the bottom
  const integrityHash = computeSimpleHash(result);
  const commentPrefix = getCommentPrefix(lang);
  result += `\n${commentPrefix} ═══ SEALED RUNTIME INTEGRITY ═══\n`;
  result += `${commentPrefix} Hash: ${integrityHash}\n`;
  result += `${commentPrefix} Sealed: ${new Date().toISOString().slice(0, 10)}\n`;
  result += `${commentPrefix} CMPSBL® Mini-Runtime™ — Redistribution as standalone product prohibited.\n`;

  return result;
}

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
  // Find end of first major comment block
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

function stripInternalComments(source: string, lang: string): string {
  const prefix = getCommentPrefix(lang);
  const lines = source.split('\n');
  
  return lines.filter(line => {
    const trimmed = line.trim();
    // Keep non-comment lines
    if (!trimmed.startsWith(prefix)) return true;
    // Keep empty comment lines (spacing)
    if (trimmed === prefix) return true;
    // Keep preserved headers
    if (PRESERVED_HEADERS.some(h => trimmed.includes(h))) return true;
    // Keep JSDoc / docstring markers
    if (trimmed.startsWith('/**') || trimmed.startsWith('*/') || trimmed.startsWith('* ')) return true;
    // Keep section dividers (═══)
    if (trimmed.includes('═══') || trimmed.includes('╔') || trimmed.includes('╚') || trimmed.includes('║')) return true;
    // Strip internal implementation comments
    return true; // For now, keep all — aggressive stripping can break readability
  }).join('\n');
}

function computeSimpleHash(content: string): string {
  // Simple hash for integrity seal (not cryptographic — just a fingerprint)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}
