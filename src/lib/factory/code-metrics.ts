/**
 * Code Metrics & Language Detection
 * Analyzes uploaded code for language, complexity, and structural metrics.
 * Used by the scan team to provide richer diagnostics.
 */

export interface CodeMetrics {
  language: string;
  languageConfidence: number;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  functionCount: number;
  classCount: number;
  importCount: number;
  exportCount: number;
  cyclomaticComplexity: number;
  maxNesting: number;
  avgLineLength: number;
  longestFunction: number;
  hasAsync: boolean;
  hasTypes: boolean;
  hasTests: boolean;
  hasErrorHandling: boolean;
  depthScore: number; // 0-100 structural depth
}

interface LanguageSignature {
  language: string;
  extensions: string[];
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

const LANGUAGE_SIGNATURES: LanguageSignature[] = [
  { language: 'TypeScript', extensions: ['.ts', '.tsx'], keywords: ['interface', 'type ', 'as ', 'readonly', 'enum '], patterns: [/:\s*(string|number|boolean|void|any|never)\b/, /import\s+type/], weight: 0 },
  { language: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'], keywords: ['const ', 'let ', 'var ', '=>', 'function'], patterns: [/require\(/, /module\.exports/], weight: 0 },
  { language: 'Python', extensions: ['.py'], keywords: ['def ', 'import ', 'from ', 'class ', 'self.', 'elif', '__init__'], patterns: [/if __name__/, /print\(/, /:\s*$/m], weight: 0 },
  { language: 'Rust', extensions: ['.rs'], keywords: ['fn ', 'let mut', 'impl ', 'pub ', 'struct ', 'enum ', 'match ', 'use '], patterns: [/fn\s+\w+\s*\(/, /-> \w+/], weight: 0 },
  { language: 'Go', extensions: ['.go'], keywords: ['func ', 'package ', 'import ', 'go ', 'chan ', 'defer '], patterns: [/func\s+\w+\(/, /:\s*=\s*/], weight: 0 },
  { language: 'Java', extensions: ['.java'], keywords: ['public class', 'private ', 'protected ', 'void ', 'static ', 'final ', 'throws'], patterns: [/public\s+static\s+void\s+main/, /System\.out/], weight: 0 },
  { language: 'C++', extensions: ['.cpp', '.hpp', '.cc', '.h'], keywords: ['#include', 'std::', 'cout', 'cin', 'nullptr', 'template<', 'virtual'], patterns: [/#include\s*</, /std::\w+/], weight: 0 },
  { language: 'C#', extensions: ['.cs'], keywords: ['using ', 'namespace ', 'public class', 'private ', 'async Task', 'var '], patterns: [/Console\.Write/, /using\s+System/], weight: 0 },
  { language: 'Ruby', extensions: ['.rb'], keywords: ['def ', 'end', 'puts ', 'require ', 'attr_', 'class ', 'module '], patterns: [/do\s*\|/, /\.each\s+do/], weight: 0 },
  { language: 'Swift', extensions: ['.swift'], keywords: ['func ', 'var ', 'let ', 'guard ', 'struct ', 'protocol ', 'extension '], patterns: [/func\s+\w+\(/, /import\s+Foundation/], weight: 0 },
  { language: 'PHP', extensions: ['.php'], keywords: ['<?php', 'function ', '$this->', 'echo ', 'namespace ', 'use '], patterns: [/\$\w+/, /->/], weight: 0 },
  { language: 'Kotlin', extensions: ['.kt'], keywords: ['fun ', 'val ', 'var ', 'class ', 'data class', 'object ', 'companion'], patterns: [/fun\s+\w+\(/, /println\(/], weight: 0 },
  { language: 'VHDL', extensions: ['.vhd', '.vhdl'], keywords: ['entity ', 'architecture ', 'signal ', 'process', 'begin', 'port '], patterns: [/entity\s+\w+\s+is/, /architecture\s+\w+/], weight: 0 },
  { language: 'Verilog', extensions: ['.v', '.sv'], keywords: ['module ', 'wire ', 'reg ', 'assign ', 'always ', 'input ', 'output '], patterns: [/module\s+\w+/, /always\s*@/], weight: 0 },
  { language: 'Dart', extensions: ['.dart'], keywords: ['void ', 'Widget ', 'final ', 'class ', '@override', 'import '], patterns: [/import\s+'package:/, /Widget\s+build/], weight: 0 },
  { language: 'Lua', extensions: ['.lua'], keywords: ['function ', 'local ', 'then', 'end', 'require'], patterns: [/local\s+\w+\s*=/, /function\s+\w+\(/], weight: 0 },
  { language: 'R', extensions: ['.r', '.R'], keywords: ['function(', '<-', 'library(', 'data.frame', 'ggplot'], patterns: [/\w+\s*<-/, /library\(\w+\)/], weight: 0 },
  { language: 'Scala', extensions: ['.scala'], keywords: ['def ', 'val ', 'var ', 'object ', 'trait ', 'case class'], patterns: [/def\s+\w+/, /import\s+scala/], weight: 0 },
  { language: 'Elixir', extensions: ['.ex', '.exs'], keywords: ['def ', 'defmodule ', 'do', 'end', 'pipe', '|>'], patterns: [/defmodule\s+\w+/, /\|>/], weight: 0 },
];

/** Detect language from code content and optional filename */
export function detectLanguage(code: string, fileName?: string): { language: string; confidence: number } {
  // Extension-based detection first — authoritative when extension is known
  if (fileName) {
    const ext = '.' + (fileName.split('.').pop() ?? '').toLowerCase();
    for (const sig of LANGUAGE_SIGNATURES) {
      if (sig.extensions.includes(ext)) {
        return { language: sig.language, confidence: 0.95 };
      }
    }
    // Tuning fix #4: extension was present but unrecognized.
    // Don't let content-scoring guess wrong (e.g. .nim → TypeScript) and
    // cascade into a wrong language-specific scanner downstream.
    // Require very strong content evidence before overriding 'Unknown'.
    const scoresExt = LANGUAGE_SIGNATURES.map(sig => {
      let score = 0;
      for (const kw of sig.keywords) if (code.includes(kw)) score += 2;
      for (const pat of sig.patterns) if (pat.test(code)) score += 3;
      return { language: sig.language, score };
    });
    scoresExt.sort((a, b) => b.score - a.score);
    const bestE = scoresExt[0];
    const secondE = scoresExt[1];
    if (bestE.score < 8 || (secondE && bestE.score - secondE.score < 4)) {
      return { language: 'Unknown', confidence: 0 };
    }
    const confidenceE = Math.min(0.85, bestE.score / (bestE.score + (secondE?.score ?? 0) + 1));
    return { language: bestE.language, confidence: confidenceE };
  }

  // No filename — pure content-based detection
  const scores = LANGUAGE_SIGNATURES.map(sig => {
    let score = 0;
    for (const kw of sig.keywords) {
      if (code.includes(kw)) score += 2;
    }
    for (const pat of sig.patterns) {
      if (pat.test(code)) score += 3;
    }
    return { language: sig.language, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];
  
  if (best.score === 0) return { language: 'Unknown', confidence: 0 };
  
  const confidence = Math.min(0.95, best.score / (best.score + (second?.score ?? 0) + 1));
  return { language: best.language, confidence };
}

/** Compute cyclomatic complexity approximation */
function computeCyclomaticComplexity(code: string): number {
  const branchKeywords = [
    /\bif\b/g, /\belse\s+if\b/g, /\belif\b/g, /\belse\b/g,
    /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g,
    /\bcatch\b/g, /\?\?/g, /\?\./g, /&&/g, /\|\|/g,
    /\bthen\b/g, /\bwhen\b/g, /\bmatch\b/g,
  ];
  
  let complexity = 1; // base
  for (const pattern of branchKeywords) {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length;
  }
  return complexity;
}

/** Compute maximum nesting depth */
function computeMaxNesting(code: string): number {
  let max = 0;
  let current = 0;
  for (const char of code) {
    if (char === '{' || char === '(') {
      current++;
      if (current > max) max = current;
    } else if (char === '}' || char === ')') {
      current = Math.max(0, current - 1);
    }
  }
  return max;
}

/** Count functions in code */
function countFunctions(code: string): number {
  const patterns = [
    /\bfunction\s+\w+/g,         // JS/TS named functions
    /\bconst\s+\w+\s*=\s*\(/g,   // arrow functions
    /\bdef\s+\w+/g,              // Python/Ruby
    /\bfn\s+\w+/g,              // Rust
    /\bfunc\s+\w+/g,            // Go/Swift
    /\bpublic\s+\w+\s+\w+\s*\(/g, // Java/C#
  ];
  
  let count = 0;
  for (const pat of patterns) {
    const matches = code.match(pat);
    if (matches) count += matches.length;
  }
  return count;
}

/** Estimate the longest function body (lines) */
function estimateLongestFunction(code: string): number {
  const lines = code.split('\n');
  let maxLen = 0;
  let currentLen = 0;
  let inFunction = false;
  let braceDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/\b(function|def |fn |func |=>)\b/.test(trimmed)) {
      inFunction = true;
      currentLen = 0;
    }
    if (inFunction) {
      currentLen++;
      braceDepth += (trimmed.match(/{/g) ?? []).length;
      braceDepth -= (trimmed.match(/}/g) ?? []).length;
      if (braceDepth <= 0 && currentLen > 1) {
        if (currentLen > maxLen) maxLen = currentLen;
        inFunction = false;
        currentLen = 0;
        braceDepth = 0;
      }
    }
  }
  return maxLen;
}

/** Full code metrics analysis */
export function analyzeCodeMetrics(code: string, fileName?: string): CodeMetrics {
  const { language, confidence } = detectLanguage(code, fileName);
  const lines = code.split('\n');
  const totalLines = lines.length;

  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let totalLineLength = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      blankLines++;
    } else if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('--')) {
      commentLines++;
    } else {
      codeLines++;
      totalLineLength += trimmed.length;
    }
  }

  const importCount = (code.match(/\b(import |require\(|from |use |#include)/g) ?? []).length;
  const exportCount = (code.match(/\b(export |module\.exports)/g) ?? []).length;
  const classCount = (code.match(/\b(class |struct |interface |trait |enum |data class)/g) ?? []).length;
  const functionCount = countFunctions(code);
  const cyclomaticComplexity = computeCyclomaticComplexity(code);
  const maxNesting = computeMaxNesting(code);
  const longestFunction = estimateLongestFunction(code);

  const hasAsync = /\b(async|await|Promise|Future|Task|goroutine|chan |go )\b/.test(code);
  const hasTypes = /\b(interface |type |struct |class |enum |trait )\b/.test(code);
  const hasTests = /\b(test|spec|expect|assert|describe|it\(|should)\b/.test(code);
  const hasErrorHandling = /\b(try|catch|except|rescue|recover|Result<|Option<)\b/.test(code);

  // Structural depth score: weighted combination of metrics
  const depthScore = Math.min(100, Math.round(
    (functionCount * 3) +
    (classCount * 5) +
    (cyclomaticComplexity * 1.5) +
    (Math.min(totalLines, 500) / 10) +
    (hasAsync ? 10 : 0) +
    (hasTypes ? 8 : 0) +
    (hasErrorHandling ? 5 : 0)
  ));

  return {
    language,
    languageConfidence: confidence,
    totalLines,
    codeLines,
    commentLines,
    blankLines,
    functionCount,
    classCount,
    importCount,
    exportCount,
    cyclomaticComplexity,
    maxNesting,
    avgLineLength: codeLines > 0 ? Math.round(totalLineLength / codeLines) : 0,
    longestFunction,
    hasAsync,
    hasTypes,
    hasTests,
    hasErrorHandling,
    depthScore,
  };
}
