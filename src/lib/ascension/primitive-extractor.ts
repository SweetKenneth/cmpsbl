/**
 * CMPSBL® Primitive Extraction Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Converts raw uploaded software into structured primitives that can be
 * executed inside chain pipelines and contribute to BRAIN learning.
 *
 * Extraction targets:
 *   - function/method names
 *   - keywords (risk, validate, execute, predict, etc.)
 *   - control flow patterns (if/loop/thresholds)
 *   - class/module structures
 *   - import/dependency graphs
 *
 * Does NOT aim for perfect parsing — focuses on consistent, repeatable
 * extraction that improves over time via BRAIN learning.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PrimitiveCategory =
  | 'analysis' | 'execution' | 'validation' | 'transformation'
  | 'prediction' | 'storage' | 'routing' | 'security'
  | 'communication' | 'scheduling' | 'monitoring' | 'computation'
  | 'rendering' | 'configuration' | 'io' | 'unknown';

export interface ExtractedPrimitive {
  /** Unique ID for this primitive */
  id: string;
  /** Canonical name (e.g., 'calculate_risk') */
  name: string;
  /** Category mapping */
  category: PrimitiveCategory;
  /** Detected inputs based on function parameters */
  inputs: string[];
  /** Detected outputs based on return types/names */
  outputs: string[];
  /** Confidence in extraction accuracy (0–1) */
  confidence: number;
  /** The raw source snippet (truncated) */
  sourceSnippet: string;
  /** Language of origin */
  language: string;
  /** Extraction method used */
  extractionMethod: 'function' | 'class' | 'keyword' | 'pattern' | 'module';
  /** Keywords found in the function body */
  keywords: string[];
  /** Complexity estimate (1–10) */
  complexity: number;
}

export interface ExtractionResult {
  /** All extracted primitives */
  primitives: ExtractedPrimitive[];
  /** Summary statistics */
  stats: ExtractionStats;
  /** Extraction warnings */
  warnings: string[];
  /** Time taken in ms */
  durationMs: number;
}

export interface ExtractionStats {
  totalPrimitives: number;
  byCategory: Record<PrimitiveCategory, number>;
  byMethod: Record<string, number>;
  avgConfidence: number;
  avgComplexity: number;
  languagesDetected: string[];
  totalLinesAnalyzed: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — KEYWORD → CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const KEYWORD_CATEGORIES: Record<string, PrimitiveCategory> = {
  // Analysis
  analyze: 'analysis', calculate: 'analysis', compute: 'analysis', score: 'analysis',
  evaluate: 'analysis', measure: 'analysis', compare: 'analysis', assess: 'analysis',
  rank: 'analysis', aggregate: 'analysis', summarize: 'analysis', correlate: 'analysis',
  // Execution
  execute: 'execution', run: 'execution', process: 'execution', perform: 'execution',
  invoke: 'execution', call: 'execution', dispatch: 'execution', trigger: 'execution',
  // Validation
  validate: 'validation', check: 'validation', verify: 'validation', ensure: 'validation',
  assert: 'validation', test: 'validation', sanitize: 'validation', guard: 'validation',
  // Transformation
  transform: 'transformation', convert: 'transformation', format: 'transformation',
  normalize: 'transformation', encode: 'transformation', decode: 'transformation',
  parse: 'transformation', serialize: 'transformation', map: 'transformation',
  filter: 'transformation', reduce: 'transformation', merge: 'transformation',
  // Prediction
  predict: 'prediction', forecast: 'prediction', estimate: 'prediction',
  infer: 'prediction', classify: 'prediction', detect: 'prediction',
  recommend: 'prediction', suggest: 'prediction',
  // Storage
  store: 'storage', save: 'storage', persist: 'storage', cache: 'storage',
  write: 'storage', insert: 'storage', update: 'storage', delete: 'storage',
  load: 'storage', read: 'storage', fetch: 'storage', get: 'storage',
  // Routing
  route: 'routing', redirect: 'routing', forward: 'routing', navigate: 'routing',
  dispatch: 'routing', broadcast: 'routing', emit: 'routing',
  // Security
  encrypt: 'security', decrypt: 'security', authenticate: 'security',
  authorize: 'security', hash: 'security', sign: 'security',
  // Communication
  send: 'communication', receive: 'communication', subscribe: 'communication',
  publish: 'communication', notify: 'communication', listen: 'communication',
  // Scheduling
  schedule: 'scheduling', delay: 'scheduling', debounce: 'scheduling',
  throttle: 'scheduling', queue: 'scheduling', retry: 'scheduling',
  // Monitoring
  monitor: 'monitoring', observe: 'monitoring', track: 'monitoring',
  log: 'monitoring', trace: 'monitoring', watch: 'monitoring',
  // Computation
  multiply: 'computation', divide: 'computation', add: 'computation',
  subtract: 'computation', modulo: 'computation', pow: 'computation',
  sqrt: 'computation', abs: 'computation', round: 'computation',
  // Rendering
  render: 'rendering', draw: 'rendering', paint: 'rendering',
  display: 'rendering', show: 'rendering', layout: 'rendering',
  // Configuration
  configure: 'configuration', setup: 'configuration', init: 'configuration',
  initialize: 'configuration', config: 'configuration', register: 'configuration',
  // IO
  open: 'io', close: 'io', connect: 'io', disconnect: 'io',
  upload: 'io', download: 'io', stream: 'io',
};

// Control flow keywords that indicate complexity
const CONTROL_FLOW_KEYWORDS = new Set([
  'if', 'else', 'switch', 'case', 'for', 'while', 'do', 'try', 'catch',
  'throw', 'await', 'async', 'yield', 'return', 'break', 'continue',
  'match', 'when', 'guard', 'loop', 'unless', 'until',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EXTRACTION PATTERNS (multi-language)
// ═══════════════════════════════════════════════════════════════════════════════

interface ExtractionPattern {
  regex: RegExp;
  method: ExtractedPrimitive['extractionMethod'];
  nameGroup: number;
  paramsGroup?: number;
}

const EXTRACTION_PATTERNS: ExtractionPattern[] = [
  // TypeScript/JavaScript functions
  { regex: /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Arrow functions assigned to const/let
  { regex: /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_]\w{2,})\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*\w+\s*)?=>/g, method: 'function', nameGroup: 1 },
  // Class declarations
  { regex: /(?:export\s+)?(?:abstract\s+)?class\s+([A-Z][A-Za-z_]\w{1,})/g, method: 'class', nameGroup: 1 },
  // Python functions
  { regex: /def\s+([a-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Python classes
  { regex: /class\s+([A-Z][A-Za-z_]\w{1,})\s*[:(]/g, method: 'class', nameGroup: 1 },
  // Rust functions
  { regex: /(?:pub\s+)?(?:async\s+)?fn\s+([a-z_]\w{2,})\s*(?:<[^>]*>)?\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Go functions
  { regex: /func\s+(?:\([^)]*\)\s+)?([A-Za-z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Java/C# methods
  { regex: /(?:public|private|protected|static|final|override|virtual|async)\s+\w+(?:<[^>]*>)?\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // PHP functions
  { regex: /(?:public|private|protected|static)?\s*function\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Ruby methods
  { regex: /def\s+(?:self\.)?([a-z_]\w{2,})(?:\(([^)]*)\))?/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Swift functions
  { regex: /func\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Kotlin functions
  { regex: /(?:fun|suspend\s+fun)\s+([a-zA-Z_]\w{2,})\s*\(([^)]*)\)/g, method: 'function', nameGroup: 1, paramsGroup: 2 },
  // Verilog/SystemVerilog modules
  { regex: /module\s+([A-Za-z_]\w{2,})/g, method: 'module', nameGroup: 1 },
  // VHDL entities
  { regex: /entity\s+([A-Za-z_]\w{2,})\s+is/gi, method: 'module', nameGroup: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — CORE EXTRACTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let primitiveCounter = 0;

function generatePrimitiveId(): string {
  primitiveCounter++;
  return `prim_${Date.now().toString(36)}_${primitiveCounter.toString(36)}`;
}

function categorizeByName(name: string): PrimitiveCategory {
  const lower = name.toLowerCase();
  const words = lower
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .split(/[_\-\s]+/)
    .filter(w => w.length > 1);

  for (const word of words) {
    if (KEYWORD_CATEGORIES[word]) return KEYWORD_CATEGORIES[word];
  }

  // Prefix-based fallback
  for (const [keyword, category] of Object.entries(KEYWORD_CATEGORIES)) {
    if (lower.startsWith(keyword) || lower.includes(`_${keyword}`) || lower.includes(keyword)) {
      return category;
    }
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
      // Strip type annotations: "name: Type" → "name", "Type name" → "name"
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
    const pattern = new RegExp(`\\b${kw}\\b`, 'g');
    const matches = lower.match(pattern);
    if (matches) score += matches.length * 0.5;
  }

  // Nesting depth estimation
  let maxDepth = 0;
  let depth = 0;
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

  // Common return patterns
  if (lower.includes('get') || lower.includes('fetch') || lower.includes('find')) {
    outputs.push('data');
  }
  if (lower.includes('score') || lower.includes('calculate') || lower.includes('compute')) {
    outputs.push('result');
  }
  if (lower.includes('validate') || lower.includes('check') || lower.includes('is')) {
    outputs.push('boolean');
  }
  if (lower.includes('create') || lower.includes('build') || lower.includes('make')) {
    outputs.push('instance');
  }
  if (lower.includes('transform') || lower.includes('convert') || lower.includes('format')) {
    outputs.push('transformed');
  }

  // Check for return type annotations in snippet
  const returnMatch = snippet.match(/(?:->|=>|:)\s*(\w+)(?:\s*\{|\s*\|)/);
  if (returnMatch && returnMatch[1] !== 'void' && returnMatch[1] !== 'None') {
    outputs.push(returnMatch[1].toLowerCase());
  }

  return outputs.length > 0 ? outputs : ['output'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract primitives from source code files.
 *
 * @param files - Array of { name, content, language }
 * @returns Extraction result with primitives, stats, and warnings
 */
export function extractPrimitives(
  files: Array<{ name: string; content: string; language: string }>
): ExtractionResult {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const primitives: ExtractedPrimitive[] = [];
  const warnings: string[] = [];
  const seenNames = new Set<string>();
  let totalLines = 0;

  for (const file of files) {
    if (!file.content || file.content.length < 10) {
      warnings.push(`Skipped ${file.name}: content too short`);
      continue;
    }

    totalLines += file.content.split('\n').length;

    for (const pattern of EXTRACTION_PATTERNS) {
      // Reset regex state
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(file.content)) !== null) {
        const name = match[pattern.nameGroup];
        if (!name || name.length < 3 || name.length > 60) continue;

        // Deduplicate across files
        const dedupeKey = `${name}|${pattern.method}`;
        if (seenNames.has(dedupeKey)) continue;
        seenNames.add(dedupeKey);

        const paramStr = pattern.paramsGroup ? match[pattern.paramsGroup] : undefined;
        const snippet = extractSnippet(file.content, match.index);
        const category = categorizeByName(name);
        const inputs = extractParams(paramStr);
        const outputs = inferOutputs(name, snippet);
        const keywords = extractKeywordsFromSnippet(snippet);
        const complexity = estimateComplexity(snippet);

        // Confidence based on extraction quality signals
        let confidence = 0.6;
        if (inputs.length > 0) confidence += 0.1;
        if (category !== 'unknown') confidence += 0.15;
        if (keywords.length > 2) confidence += 0.1;
        if (snippet.length > 100) confidence += 0.05;
        confidence = Math.min(1, confidence);

        primitives.push({
          id: generatePrimitiveId(),
          name,
          category,
          inputs,
          outputs,
          confidence: Math.round(confidence * 100) / 100,
          sourceSnippet: snippet.slice(0, 300),
          language: file.language,
          extractionMethod: pattern.method,
          keywords,
          complexity,
        });

        // Cap per file to avoid explosion
        if (primitives.length > 200) break;
      }

      if (primitives.length > 200) break;
    }
  }

  // Build stats
  const byCategory: Record<PrimitiveCategory, number> = {} as Record<PrimitiveCategory, number>;
  const byMethod: Record<string, number> = {};
  const languages = new Set<string>();
  let totalConfidence = 0;
  let totalComplexity = 0;

  for (const p of primitives) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    byMethod[p.extractionMethod] = (byMethod[p.extractionMethod] || 0) + 1;
    languages.add(p.language);
    totalConfidence += p.confidence;
    totalComplexity += p.complexity;
  }

  const durationMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;

  return {
    primitives,
    stats: {
      totalPrimitives: primitives.length,
      byCategory,
      byMethod,
      avgConfidence: primitives.length > 0 ? Math.round((totalConfidence / primitives.length) * 100) / 100 : 0,
      avgComplexity: primitives.length > 0 ? Math.round((totalComplexity / primitives.length) * 10) / 10 : 0,
      languagesDetected: Array.from(languages),
      totalLinesAnalyzed: totalLines,
    },
    warnings,
    durationMs: Math.round(durationMs * 100) / 100,
  };
}

/**
 * Generate a primitive handler stub for execution in chains.
 * Returns a function that processes context based on primitive category.
 */
export function buildPrimitiveHandler(
  primitive: ExtractedPrimitive
): (ctx: Record<string, unknown>) => Record<string, unknown> {
  return (ctx: Record<string, unknown>) => {
    const result = { ...ctx };

    // Category-based transformation
    switch (primitive.category) {
      case 'analysis':
        result[`_analysis_${primitive.name}`] = {
          computed: true,
          inputs: primitive.inputs,
          confidence: primitive.confidence,
          timestamp: Date.now(),
        };
        break;
      case 'validation':
        result[`_validation_${primitive.name}`] = {
          passed: true,
          checks: primitive.keywords.length,
          timestamp: Date.now(),
        };
        break;
      case 'transformation':
        result[`_transform_${primitive.name}`] = {
          applied: true,
          complexity: primitive.complexity,
          timestamp: Date.now(),
        };
        break;
      case 'prediction':
        result[`_prediction_${primitive.name}`] = {
          score: primitive.confidence,
          method: primitive.name,
          timestamp: Date.now(),
        };
        break;
      case 'security':
        result[`_security_${primitive.name}`] = {
          enforced: true,
          level: primitive.complexity > 5 ? 'high' : 'standard',
          timestamp: Date.now(),
        };
        break;
      default:
        result[`_primitive_${primitive.name}`] = {
          executed: true,
          category: primitive.category,
          confidence: primitive.confidence,
          timestamp: Date.now(),
        };
    }

    return result;
  };
}
