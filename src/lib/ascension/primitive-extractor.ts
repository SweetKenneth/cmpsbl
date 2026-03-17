/**
 * CMPSBL® Primitive Extraction Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Converts raw uploaded software into structured primitives.
 * Integrates quality gate, language post-processing, and deduplication.
 *
 * Supports 25 languages (18 software + 7 HDL).
 * Does NOT aim for perfect parsing — focuses on consistent, repeatable
 * extraction that improves over time via BRAIN learning.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  ExtractedPrimitive,
  ExtractionResult,
  ExtractionStats,
  PrimitiveCategory,
} from './types';
import { generateCorrelationId } from './types';
import { postProcessPrimitives } from './language-postprocessor';
import { runQualityGate, type QualityGateConfig, DEFAULT_QUALITY_CONFIG } from './quality-gate';
import { deduplicatePrimitives } from './deduplication';

// Re-export types for backward compatibility
export type { ExtractedPrimitive, ExtractionResult, ExtractionStats, PrimitiveCategory };

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — KEYWORD → CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const KEYWORD_CATEGORIES: Record<string, PrimitiveCategory> = {
  analyze: 'analysis', calculate: 'analysis', compute: 'analysis', score: 'analysis',
  evaluate: 'analysis', measure: 'analysis', compare: 'analysis', assess: 'analysis',
  rank: 'analysis', aggregate: 'analysis', summarize: 'analysis', correlate: 'analysis',
  execute: 'execution', run: 'execution', process: 'execution', perform: 'execution',
  invoke: 'execution', call: 'execution', dispatch: 'execution', trigger: 'execution',
  validate: 'validation', check: 'validation', verify: 'validation', ensure: 'validation',
  assert: 'validation', test: 'validation', sanitize: 'validation', guard: 'validation',
  transform: 'transformation', convert: 'transformation', format: 'transformation',
  normalize: 'transformation', encode: 'transformation', decode: 'transformation',
  parse: 'transformation', serialize: 'transformation', map: 'transformation',
  filter: 'transformation', reduce: 'transformation', merge: 'transformation',
  predict: 'prediction', forecast: 'prediction', estimate: 'prediction',
  infer: 'prediction', classify: 'prediction', detect: 'prediction',
  recommend: 'prediction', suggest: 'prediction',
  store: 'storage', save: 'storage', persist: 'storage', cache: 'storage',
  write: 'storage', insert: 'storage', update: 'storage', delete: 'storage',
  load: 'storage', read: 'storage', fetch: 'storage', get: 'storage',
  route: 'routing', redirect: 'routing', forward: 'routing', navigate: 'routing',
  broadcast: 'routing', emit: 'routing',
  encrypt: 'security', decrypt: 'security', authenticate: 'security',
  authorize: 'security', hash: 'security', sign: 'security',
  send: 'communication', receive: 'communication', subscribe: 'communication',
  publish: 'communication', notify: 'communication', listen: 'communication',
  schedule: 'scheduling', delay: 'scheduling', debounce: 'scheduling',
  throttle: 'scheduling', queue: 'scheduling', retry: 'scheduling',
  monitor: 'monitoring', observe: 'monitoring', track: 'monitoring',
  log: 'monitoring', trace: 'monitoring', watch: 'monitoring',
  multiply: 'computation', divide: 'computation', add: 'computation',
  subtract: 'computation', modulo: 'computation', pow: 'computation',
  sqrt: 'computation', abs: 'computation', round: 'computation',
  render: 'rendering', draw: 'rendering', paint: 'rendering',
  display: 'rendering', show: 'rendering', layout: 'rendering',
  configure: 'configuration', setup: 'configuration', init: 'configuration',
  initialize: 'configuration', config: 'configuration', register: 'configuration',
  open: 'io', close: 'io', connect: 'io', disconnect: 'io',
  upload: 'io', download: 'io', stream: 'io',
};

const CONTROL_FLOW_KEYWORDS = new Set([
  'if', 'else', 'switch', 'case', 'for', 'while', 'do', 'try', 'catch',
  'throw', 'await', 'async', 'yield', 'return', 'break', 'continue',
  'match', 'when', 'guard', 'loop', 'unless', 'until',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — EXTRACTION PATTERNS (25 languages)
// ═══════════════════════════════════════════════════════════════════════════════

interface ExtractionPattern {
  id: string;
  regex: RegExp;
  method: ExtractedPrimitive['extractionMethod'];
  nameGroup: number;
  paramsGroup?: number;
}

const EXTRACTION_PATTERNS: ExtractionPattern[] = [
  // TypeScript / JavaScript
  { id: 'ts-func', regex: /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'ts-arrow', regex: /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_]\w{2,})\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*\w+\s*)?=>/g, method: 'function', nameGroup: 1 },
  { id: 'ts-class', regex: /(?:export\s+)?(?:abstract\s+)?class\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // Python
  { id: 'py-func', regex: /def\s+([a-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'py-class', regex: /class\s+([A-Z][A-Za-z_]\w{1,})\s*[:(]/g, method: 'class', nameGroup: 1 },
  // Rust
  { id: 'rs-func', regex: /(?:pub\s+)?(?:async\s+)?fn\s+([a-z_]\w{2,})\s*(?:<[^>]*>)?\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'rs-struct', regex: /(?:pub\s+)?struct\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  { id: 'rs-trait', regex: /(?:pub\s+)?trait\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  { id: 'rs-enum', regex: /(?:pub\s+)?enum\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // Go
  { id: 'go-func', regex: /func\s+(?:\([^)]*\)\s+)?([A-Za-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'go-struct', regex: /type\s+([A-Z][A-Za-z_]\w{1,})\s+struct\b/g, method: 'class', nameGroup: 1 },
  { id: 'go-iface', regex: /type\s+([A-Z][A-Za-z_]\w{1,})\s+interface\b/g, method: 'class', nameGroup: 1 },
  // Java
  { id: 'java-method', regex: /(?:public|private|protected|static|final|override|virtual|async)\s+\w+(?:<[^>]*>)?\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'java-class', regex: /(?:public|private|protected)?\s*(?:abstract\s+)?(?:class|interface|enum)\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // C#
  { id: 'cs-method', regex: /(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?(?:Task\s*<[^>]*>|void|\w+)\s+([A-Za-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // PHP
  { id: 'php-func', regex: /(?:public|private|protected|static)?\s*function\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'php-class', regex: /class\s+([A-Z][A-Za-z_]\w{1,})(?:\s+extends|\s+implements|\s*\{)/g, method: 'class', nameGroup: 1 },
  // Ruby
  { id: 'rb-func', regex: /def\s+(?:self\.)?([a-z_]\w{2,})(?:\(([^)]*)\))?/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'rb-class', regex: /class\s+([A-Z][A-Za-z_]\w{1,})(?:\s*<\s*\w+)?/g, method: 'class', nameGroup: 1 },
  { id: 'rb-module', regex: /module\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'module', nameGroup: 1 },
  // Swift
  { id: 'sw-func', regex: /func\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'sw-type', regex: /(?:class|struct|protocol|enum)\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // Kotlin
  { id: 'kt-func', regex: /(?:fun|suspend\s+fun)\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'kt-class', regex: /(?:data\s+)?(?:class|object|interface)\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // C / C++
  { id: 'c-func', regex: /(?:static\s+)?(?:inline\s+)?(?:const\s+)?(?:unsigned\s+)?(?:void|int|float|double|char|bool|size_t|auto|\w+_t|\w+\s*\*)\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)\s*\{/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'cpp-class', regex: /(?:template\s*<[^>]*>\s*)?class\s+([A-Z][A-Za-z_]\w{1,})\s*(?::\s*(?:public|private|protected))?\s*\w*/g, method: 'class', nameGroup: 1 },
  { id: 'cpp-ns', regex: /namespace\s+([A-Za-z_]\w{2,})/g, method: 'module', nameGroup: 1 },
  // Dart
  { id: 'dart-func', regex: /(?:static\s+)?(?:Future\s*<[^>]*>|void|\w+)\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)\s*(?:async\s*)?\{/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'dart-class', regex: /(?:abstract\s+)?class\s+([A-Z][A-Za-z_]\w{1,})(?:\s+extends|\s+implements|\s+with|\s*\{)/g, method: 'class', nameGroup: 1 },
  // Scala
  { id: 'scala-func', regex: /def\s+([a-zA-Z_]\w{2,})\s*(?:\[[^\]]*\])?\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'scala-type', regex: /(?:case\s+)?(?:class|object|trait)\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // Elixir
  { id: 'ex-func', regex: /(?:def|defp)\s+([a-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'ex-module', regex: /defmodule\s+([A-Z][A-Za-z_.]\w{1,})/g, method: 'module', nameGroup: 1 },
  { id: 'ex-macro', regex: /defmacro\s+([a-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Haskell
  { id: 'hs-sig', regex: /^([a-z_]\w{2,})\s+::\s+(.+)/gm, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'hs-def', regex: /^([a-z_]\w{2,})\s+(?:[a-z_]\w*\s+)*=/gm, method: 'function', nameGroup: 1 },
  { id: 'hs-data', regex: /(?:data|newtype|type)\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  { id: 'hs-class', regex: /class\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // Lua
  { id: 'lua-func', regex: /(?:local\s+)?function\s+(?:[\w.]+\.)?([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'lua-assign', regex: /(?:local\s+)?([a-zA-Z_]\w{2,})\s*=\s*function\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // R
  { id: 'r-assign1', regex: /([a-zA-Z_.]\w{2,})\s*<-\s*function\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'r-assign2', regex: /([a-zA-Z_.]\w{2,})\s*=\s*function\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'r-class', regex: /setClass\s*\(\s*["']([A-Za-z_]\w{2,})["']/g, method: 'class', nameGroup: 1 },
  // Zig
  { id: 'zig-func', regex: /(?:pub\s+)?fn\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  { id: 'zig-type', regex: /const\s+([A-Z][A-Za-z_]\w{1,})\s*=\s*(?:struct|enum|union)\s*\{/g, method: 'class', nameGroup: 1 },
  // Verilog / SystemVerilog
  { id: 'v-module', regex: /module\s+([A-Za-z_]\w{2,})\s*(?:#\s*\([^)]*\))?\s*\(/g, method: 'module', nameGroup: 1 },
  { id: 'v-func', regex: /(?:task|function)\s+(?:automatic\s+)?(?:\w+\s+)?([a-zA-Z_]\w{2,})/g, method: 'function', nameGroup: 1 },
  { id: 'sv-class', regex: /(?:class|interface|package)\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // VHDL
  { id: 'vhdl-entity', regex: /entity\s+([A-Za-z_]\w{2,})\s+is/gi, method: 'module', nameGroup: 1 },
  { id: 'vhdl-arch', regex: /architecture\s+(\w+)\s+of\s+([A-Za-z_]\w{2,})/gi, method: 'module', nameGroup: 2 },
  { id: 'vhdl-func', regex: /(?:procedure|function)\s+([A-Za-z_]\w{2,})\s*\(/gi, method: 'function', nameGroup: 1 },
  { id: 'vhdl-pkg', regex: /package\s+([A-Za-z_]\w{2,})\s+is/gi, method: 'module', nameGroup: 1 },
  // Chisel
  { id: 'chisel-mod', regex: /class\s+([A-Z]\w{2,})\s+extends\s+(?:Module|Bundle|BlackBox|RawModule)/g, method: 'module', nameGroup: 1 },
  // Amaranth
  { id: 'amaranth-mod', regex: /class\s+([A-Z]\w{2,})\s*\(\s*(?:wiring\.)?(?:Component|Elaboratable)\s*\)/g, method: 'module', nameGroup: 1 },
  // SPICE
  { id: 'spice-subckt', regex: /\.subckt\s+([A-Za-z_]\w{2,})\s+/gi, method: 'module', nameGroup: 1 },
  { id: 'spice-model', regex: /\.model\s+([A-Za-z_]\w{2,})\s+/gi, method: 'module', nameGroup: 1 },
  // SystemC
  { id: 'sysc-module', regex: /SC_MODULE\s*\(\s*([A-Za-z_]\w{2,})\s*\)/g, method: 'module', nameGroup: 1 },
  { id: 'sysc-func', regex: /SC_(?:METHOD|THREAD|CTHREAD)\s*\(\s*([a-zA-Z_]\w{2,})\s*\)/g, method: 'function', nameGroup: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function generatePrimitiveId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `prim_${ts}_${rand}`;
}

function categorizeByName(name: string): PrimitiveCategory {
  const lower = name.toLowerCase();
  const words = lower.replace(/([a-z])([A-Z])/g, '$1_$2').split(/[_\-\s]+/).filter(w => w.length > 1);
  for (const word of words) {
    if (KEYWORD_CATEGORIES[word]) return KEYWORD_CATEGORIES[word];
  }
  for (const [keyword, category] of Object.entries(KEYWORD_CATEGORIES)) {
    if (lower.startsWith(keyword) || lower.includes(`_${keyword}`)) return category;
  }
  return 'unknown';
}

function extractParams(paramStr: string | undefined): string[] {
  if (!paramStr) return [];
  return paramStr
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      const colonSplit = p.split(':')[0].trim();
      const spaceSplit = colonSplit.split(/\s+/);
      return spaceSplit[spaceSplit.length - 1].replace(/[^a-zA-Z0-9_]/g, '');
    })
    .filter(p => p.length > 0 && p.length < 40);
}

function estimateComplexity(snippet: string): number {
  const lower = snippet.toLowerCase();
  let score = 1;
  for (const kw of CONTROL_FLOW_KEYWORDS) {
    const matches = lower.match(new RegExp(`\\b${kw}\\b`, 'g'));
    if (matches) score += matches.length * 0.5;
  }
  let maxDepth = 0, depth = 0;
  for (const ch of snippet) {
    if (ch === '{' || ch === '(') { depth++; maxDepth = Math.max(maxDepth, depth); }
    else if (ch === '}' || ch === ')') { depth = Math.max(0, depth - 1); }
  }
  score += maxDepth * 0.3;
  return Math.min(10, Math.max(1, Math.round(score)));
}

function extractKeywordsFromSnippet(snippet: string): string[] {
  const words = snippet.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const found = new Set<string>();
  for (const w of words) {
    if (KEYWORD_CATEGORIES[w]) found.add(w);
    if (CONTROL_FLOW_KEYWORDS.has(w)) found.add(w);
  }
  return Array.from(found).slice(0, 10);
}

function extractSnippet(content: string, matchIndex: number, maxLen = 500): string {
  const start = Math.max(0, matchIndex - 20);
  const end = Math.min(content.length, matchIndex + maxLen);
  return content.slice(start, end).trim();
}

function inferOutputs(name: string, snippet: string): string[] {
  const outputs: string[] = [];
  const lower = name.toLowerCase();
  if (lower.includes('get') || lower.includes('fetch') || lower.includes('find')) outputs.push('data');
  if (lower.includes('score') || lower.includes('calculate') || lower.includes('compute')) outputs.push('result');
  if (lower.includes('validate') || lower.includes('check') || lower.includes('is')) outputs.push('boolean');
  if (lower.includes('create') || lower.includes('build') || lower.includes('make')) outputs.push('instance');
  if (lower.includes('transform') || lower.includes('convert') || lower.includes('format')) outputs.push('transformed');
  const returnMatch = snippet.match(/(?:->|=>|:)\s*(\w+)(?:\s*\{|\s*\|)/);
  if (returnMatch && returnMatch[1] !== 'void' && returnMatch[1] !== 'None') {
    outputs.push(returnMatch[1].toLowerCase());
  }
  return outputs.length > 0 ? outputs : ['output'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/** Maximum content length to analyze per file (safety guard) */
const MAX_CONTENT_LENGTH = 1_048_576; // 1MB
/** Maximum total primitives before hard stop */
const MAX_RAW_PRIMITIVES = 300;

/**
 * Extract primitives from source code files.
 * Full pipeline: regex extraction → language post-processing → deduplication → quality gate.
 */
export function extractPrimitives(
  files: Array<{ name: string; content: string; language: string }>,
  qualityConfig?: Partial<QualityGateConfig>
): ExtractionResult {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const correlationId = generateCorrelationId();
  const rawPrimitives: ExtractedPrimitive[] = [];
  const warnings: string[] = [];
  const seenNames = new Set<string>();
  let totalLines = 0;

  // Validate inputs
  if (!files || files.length === 0) {
    return buildEmptyResult(correlationId);
  }

  for (const file of files) {
    try {
      // Safety: skip empty/malformed files
      if (!file.content || typeof file.content !== 'string') {
        warnings.push(`Skipped ${file.name}: no content`);
        continue;
      }
      if (file.content.length < 10) {
        warnings.push(`Skipped ${file.name}: content too short (${file.content.length} chars)`);
        continue;
      }

      // Safety: cap content length
      const content = file.content.length > MAX_CONTENT_LENGTH
        ? (warnings.push(`Truncated ${file.name}: ${file.content.length} chars exceeds ${MAX_CONTENT_LENGTH}`),
           file.content.slice(0, MAX_CONTENT_LENGTH))
        : file.content;

      totalLines += content.split('\n').length;

      // Run regex extraction
      for (const pattern of EXTRACTION_PATTERNS) {
        pattern.regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.regex.exec(content)) !== null) {
          if (rawPrimitives.length >= MAX_RAW_PRIMITIVES) break;

          const name = match[pattern.nameGroup];
          if (!name || name.length < 3 || name.length > 60) continue;

          const dedupeKey = `${name}|${pattern.method}`;
          if (seenNames.has(dedupeKey)) continue;
          seenNames.add(dedupeKey);

          const paramStr = pattern.paramsGroup ? match[pattern.paramsGroup] : undefined;
          const snippet = extractSnippet(content, match.index);
          const category = categorizeByName(name);
          const inputs = extractParams(paramStr);
          const outputs = inferOutputs(name, snippet);
          const keywords = extractKeywordsFromSnippet(snippet);
          const complexity = estimateComplexity(snippet);

          let confidence = 0.6;
          if (inputs.length > 0) confidence += 0.1;
          if (category !== 'unknown') confidence += 0.15;
          if (keywords.length > 2) confidence += 0.1;
          if (snippet.length > 100) confidence += 0.05;
          confidence = Math.min(1, confidence);

          rawPrimitives.push({
            id: generatePrimitiveId(),
            name,
            canonicalName: '', // filled by post-processor
            category,
            inputs,
            outputs,
            confidence: Math.round(confidence * 100) / 100,
            qualityScore: 0, // filled by quality gate
            sourceSnippet: snippet.slice(0, 300),
            language: file.language,
            extractionMethod: pattern.method,
            extractionTrust: 'medium', // refined by post-processor
            keywords,
            complexity,
            sourceFile: file.name,
            patternId: pattern.id,
          });
        }

        if (rawPrimitives.length >= MAX_RAW_PRIMITIVES) break;
      }
    } catch (err) {
      // Partial extraction: one file failing must not crash the pipeline
      warnings.push(`Error extracting from ${file.name}: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }

  if (rawPrimitives.length >= MAX_RAW_PRIMITIVES) {
    warnings.push(`Extraction capped at ${MAX_RAW_PRIMITIVES} raw primitives`);
  }

  // Pipeline: language post-processing → deduplication → quality gate
  const postProcessed = rawPrimitives.flatMap((p) =>
    postProcessPrimitives([p], p.sourceFile)
  );

  const { canonical: deduplicated, mergedCount } = deduplicatePrimitives(postProcessed);
  if (mergedCount > 0) {
    warnings.push(`Deduplicated ${mergedCount} primitives via semantic merge`);
  }

  const config = { ...DEFAULT_QUALITY_CONFIG, ...qualityConfig };
  const quality = runQualityGate(deduplicated, config);

  // Build stats from accepted primitives
  const stats = buildStats(quality.accepted, totalLines);

  const durationMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;

  return {
    primitives: quality.accepted,
    quality,
    stats,
    warnings,
    durationMs: Math.round(durationMs * 100) / 100,
    correlationId,
  };
}

function buildEmptyResult(correlationId: string): ExtractionResult {
  return {
    primitives: [],
    quality: {
      accepted: [],
      rejected: [],
      summary: {
        totalExtracted: 0, totalAccepted: 0, totalRejected: 0,
        avgQualityScore: 0, avgConfidence: 0, topCategories: [],
        extractionTrustBreakdown: {},
      },
    },
    stats: {
      totalPrimitives: 0, byCategory: {} as Record<PrimitiveCategory, number>,
      byMethod: {}, avgConfidence: 0, avgComplexity: 0, avgQualityScore: 0,
      languagesDetected: [], totalLinesAnalyzed: 0,
    },
    warnings: ['No files provided'],
    durationMs: 0,
    correlationId,
  };
}

function buildStats(primitives: ExtractedPrimitive[], totalLines: number): ExtractionStats {
  const byCategory = {} as Record<PrimitiveCategory, number>;
  const byMethod: Record<string, number> = {};
  const languages = new Set<string>();
  let totalConfidence = 0, totalComplexity = 0, totalQuality = 0;

  for (const p of primitives) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    byMethod[p.extractionMethod] = (byMethod[p.extractionMethod] || 0) + 1;
    languages.add(p.language);
    totalConfidence += p.confidence;
    totalComplexity += p.complexity;
    totalQuality += p.qualityScore;
  }

  const n = primitives.length || 1;
  return {
    totalPrimitives: primitives.length,
    byCategory,
    byMethod,
    avgConfidence: Math.round((totalConfidence / n) * 100) / 100,
    avgComplexity: Math.round((totalComplexity / n) * 10) / 10,
    avgQualityScore: Math.round((totalQuality / n) * 1000) / 1000,
    languagesDetected: Array.from(languages),
    totalLinesAnalyzed: totalLines,
  };
}

/**
 * Generate a primitive handler stub for execution in chains.
 */
export function buildPrimitiveHandler(
  primitive: ExtractedPrimitive
): (ctx: Record<string, unknown>) => Record<string, unknown> {
  return (ctx: Record<string, unknown>) => {
    const result = { ...ctx };
    const key = `_${primitive.category}_${primitive.canonicalName || primitive.name}`;

    result[key] = {
      executed: true,
      category: primitive.category,
      confidence: primitive.confidence,
      quality: primitive.qualityScore,
      inputs: primitive.inputs,
      complexity: primitive.complexity,
      timestamp: Date.now(),
    };

    return result;
  };
}
