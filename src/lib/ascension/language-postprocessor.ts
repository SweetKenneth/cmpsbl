/**
 * CMPSBL® Language-Aware Post-Processor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Applies language-specific cleanup, normalization, and trust
 * classification to raw extracted primitives.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ExtractedPrimitive } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — FRAMEWORK BOILERPLATE PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

const FRAMEWORK_BOILERPLATE: Record<string, Set<string>> = {
  typescript: new Set([
    'ngOnInit', 'ngOnDestroy', 'ngAfterViewInit', 'ngOnChanges',
    'componentDidMount', 'componentWillUnmount', 'componentDidUpdate',
    'getStaticProps', 'getServerSideProps', 'getStaticPaths',
    'useEffect', 'useState', 'useMemo', 'useCallback', 'useRef',
    'beforeEach', 'afterEach', 'beforeAll', 'afterAll',
  ]),
  javascript: new Set([
    'componentDidMount', 'componentWillUnmount', 'shouldComponentUpdate',
    'getStaticProps', 'getServerSideProps',
    'beforeEach', 'afterEach',
  ]),
  python: new Set([
    '__init__', '__str__', '__repr__', '__del__', '__enter__', '__exit__',
    '__len__', '__getitem__', '__setitem__', '__iter__', '__next__',
    'setUp', 'tearDown', 'setUpClass', 'tearDownClass',
    'test_', 'handle', 'dispatch',
  ]),
  php: new Set([
    '__construct', '__destruct', '__get', '__set', '__call',
    '__toString', '__invoke', '__clone', '__sleep', '__wakeup',
    'setUp', 'tearDown', 'boot', 'register',
  ]),
  rust: new Set([
    'new', 'default', 'from', 'into', 'try_from', 'try_into',
    'fmt', 'clone', 'drop', 'deref',
  ]),
  go: new Set([
    'New', 'Init', 'Close', 'String', 'Error',
    'ServeHTTP', 'TestMain',
  ]),
  java: new Set([
    'toString', 'hashCode', 'equals', 'clone', 'finalize',
    'setUp', 'tearDown', 'init', 'destroy',
  ]),
  csharp: new Set([
    'ToString', 'GetHashCode', 'Equals', 'Dispose',
    'OnGet', 'OnPost', 'OnPut', 'OnDelete',
    'ConfigureServices', 'Configure',
  ]),
};

/** Test file patterns */
const TEST_FILE_PATTERNS = [
  /\.test\./i, /\.spec\./i, /_test\./i, /test_/i,
  /\.tests\./i, /\.specs\./i,
];

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — NAME NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize a primitive name to a canonical form for comparison.
 * camelCase, snake_case, PascalCase all → lowercase_underscored
 */
export function normalizeName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — LANGUAGE-SPECIFIC CLEANUP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply language-aware post-processing to extracted primitives.
 * Returns cleaned primitives with trust classification and canonical names.
 */
export function postProcessPrimitives(
  primitives: ExtractedPrimitive[],
  fileName?: string
): ExtractedPrimitive[] {
  const isTestFile = fileName ? TEST_FILE_PATTERNS.some(p => p.test(fileName)) : false;

  return primitives.map(p => {
    const lang = p.language.toLowerCase();
    const langKey = mapLanguageKey(lang);
    const boilerplate = FRAMEWORK_BOILERPLATE[langKey];
    const isBoilerplate = boilerplate?.has(p.name) ?? false;
    const canonical = normalizeName(p.name);

    // Determine trust level
    let trust: ExtractedPrimitive['extractionTrust'] = 'medium';

    // High trust: named method with parameters, category identified, not boilerplate
    if (
      p.inputs.length > 0 &&
      p.category !== 'unknown' &&
      !isBoilerplate &&
      !isTestFile &&
      p.name.length > 4
    ) {
      trust = 'high';
    }

    // Heuristic trust: generic name or boilerplate or test file
    if (isBoilerplate || isTestFile || p.name.length <= 3) {
      trust = 'heuristic';
    }

    // Confidence adjustments
    let adjustedConfidence = p.confidence;
    if (isBoilerplate) adjustedConfidence *= 0.5;
    if (isTestFile) adjustedConfidence *= 0.6;
    if (trust === 'high') adjustedConfidence = Math.min(1, adjustedConfidence * 1.1);

    // Strip language-specific prefixes
    let cleanName = p.name;
    if (langKey === 'python' && cleanName.startsWith('__') && cleanName.endsWith('__')) {
      trust = 'heuristic';
      adjustedConfidence *= 0.4;
    }
    if (langKey === 'php' && cleanName.startsWith('__')) {
      trust = 'heuristic';
      adjustedConfidence *= 0.4;
    }

    return {
      ...p,
      name: cleanName,
      canonicalName: canonical,
      confidence: Math.round(adjustedConfidence * 100) / 100,
      extractionTrust: trust,
      sourceFile: fileName,
    };
  });
}

function mapLanguageKey(lang: string): string {
  const lower = lang.toLowerCase();
  if (lower.includes('typescript') || lower === 'ts' || lower === 'tsx') return 'typescript';
  if (lower.includes('javascript') || lower === 'js' || lower === 'jsx') return 'javascript';
  if (lower.includes('python') || lower === 'py') return 'python';
  if (lower.includes('php')) return 'php';
  if (lower.includes('rust') || lower === 'rs') return 'rust';
  if (lower.includes('go') || lower === 'golang') return 'go';
  if (lower.includes('java') && !lower.includes('javascript')) return 'java';
  if (lower.includes('c#') || lower.includes('csharp')) return 'csharp';
  return lower;
}
