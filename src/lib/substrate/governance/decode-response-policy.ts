/**
 * Decode Response Policy — Epistemic Discipline
 * 
 * Enforces claim provenance tagging on all Decode output:
 *   [MEASURED]              — backed by real data/metrics
 *   [INFERRED]              — derived from patterns, not direct measurement
 *   [DESIGN_INTENT]         — describes intended behavior, not verified state
 *   [REPRESENTATIVE_EXAMPLE]— illustrative, not actual data
 * 
 * Untagged numeric claims are downgraded to qualitative language.
 * Percentages without [MEASURED] are rejected.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ProvenanceTag = 'MEASURED' | 'INFERRED' | 'DESIGN_INTENT' | 'REPRESENTATIVE_EXAMPLE';

export interface TaggedClaim {
  text: string;
  tag: ProvenanceTag;
  original: string;
}

export interface PolicyViolation {
  type: 'untagged_numeric' | 'untagged_percentage' | 'assertion_without_provenance';
  original: string;
  corrected: string;
  line?: number;
}

export interface PolicyResult {
  cleaned: string;
  violations: PolicyViolation[];
  tags_found: ProvenanceTag[];
  was_modified: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

// NOTE: These regexes use /g flag. Always reset lastIndex before .test() or .exec()
const PROVENANCE_TAG_REGEX = /\[(MEASURED|INFERRED|DESIGN_INTENT|REPRESENTATIVE_EXAMPLE)\]/g;
const PERCENTAGE_REGEX = /(\d+(?:\.\d+)?)\s*%/g;
const PRECISE_NUMBER_REGEX = /\b(\d{2,}(?:\.\d+)?)\s*(ms|seconds?|minutes?|hours?|calls?|requests?|users?|events?|operations?)\b/gi;
const ASSERTION_PATTERNS = [
  /achieves?\s+(\d+(?:\.\d+)?)/gi,
  /reduces?\s+(?:by\s+)?(\d+(?:\.\d+)?)/gi,
  /improves?\s+(?:by\s+)?(\d+(?:\.\d+)?)/gi,
  /(\d+(?:\.\d+)?)x\s+(?:faster|slower|better|worse)/gi,
];

// Qualitative replacements for untagged metrics
const QUALITATIVE_REPLACEMENTS: Record<string, string> = {
  'high': 'notably',
  'percentage': 'a significant portion',
  'improvement': 'measurable improvement',
  'reduction': 'observable reduction',
};

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply epistemic discipline to Decode output.
 * Scans for untagged claims and either downgrades or flags them.
 */
export function enforceResponsePolicy(text: string): PolicyResult {
  const violations: PolicyViolation[] = [];
  const tagsFound: ProvenanceTag[] = [];
  let modified = text;
  let wasModified = false;

  // Extract existing provenance tags
  let match: RegExpExecArray | null;
  const tagRegex = new RegExp(PROVENANCE_TAG_REGEX.source, 'g');
  while ((match = tagRegex.exec(text)) !== null) {
    tagsFound.push(match[1] as ProvenanceTag);
  }

  // Check each line for untagged claims
  const lines = modified.split('\n');
  const processedLines = lines.map((line, idx) => {
    // Skip lines that already have provenance tags
    if (PROVENANCE_TAG_REGEX.test(line)) {
      PROVENANCE_TAG_REGEX.lastIndex = 0;
      return line;
    }

    let processedLine = line;

    // Rule 1: Percentages without [MEASURED] tag → downgrade
    if (PERCENTAGE_REGEX.test(line)) {
      PERCENTAGE_REGEX.lastIndex = 0;
      const corrected = line.replace(PERCENTAGE_REGEX, (match) => {
        violations.push({
          type: 'untagged_percentage',
          original: match,
          corrected: 'a significant portion',
          line: idx + 1,
        });
        wasModified = true;
        return 'a significant portion';
      });
      processedLine = corrected;
    }

    // Rule 2: Precise numbers with units → add [INFERRED] or downgrade
    if (PRECISE_NUMBER_REGEX.test(processedLine)) {
      PRECISE_NUMBER_REGEX.lastIndex = 0;
      const corrected = processedLine.replace(PRECISE_NUMBER_REGEX, (match) => {
        violations.push({
          type: 'untagged_numeric',
          original: match,
          corrected: `approximately ${match} [INFERRED]`,
          line: idx + 1,
        });
        wasModified = true;
        return `approximately ${match} [INFERRED]`;
      });
      processedLine = corrected;
    }

    // Rule 3: Assertion patterns without provenance
    for (const pattern of ASSERTION_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(processedLine)) {
        pattern.lastIndex = 0;
        violations.push({
          type: 'assertion_without_provenance',
          original: processedLine.trim(),
          corrected: `${processedLine.trim()} [INFERRED]`,
          line: idx + 1,
        });
        processedLine = `${processedLine} [INFERRED]`;
        wasModified = true;
      }
    }

    return processedLine;
  });

  modified = processedLines.join('\n');

  return {
    cleaned: modified,
    violations,
    tags_found: [...new Set(tagsFound)],
    was_modified: wasModified,
  };
}

/**
 * Validate that a Decode response meets epistemic standards.
 * Returns true only if all claims are properly tagged.
 */
export function validateEpistemicIntegrity(text: string): {
  valid: boolean;
  violation_count: number;
  details: string;
} {
  const result = enforceResponsePolicy(text);
  return {
    valid: result.violations.length === 0,
    violation_count: result.violations.length,
    details: result.violations.length === 0
      ? 'All claims properly attributed'
      : `${result.violations.length} untagged claim(s) found: ${result.violations.map(v => v.type).join(', ')}`,
  };
}

/**
 * Tag a claim with explicit provenance
 */
export function tagClaim(text: string, tag: ProvenanceTag): string {
  return `${text} [${tag}]`;
}

/**
 * Strip provenance tags for clean display (when not needed)
 */
export function stripTags(text: string): string {
  // Create fresh regex to avoid lastIndex issues with the module-level /g regex
  const tagPattern = /\[(MEASURED|INFERRED|DESIGN_INTENT|REPRESENTATIVE_EXAMPLE)\]/g;
  return text.replace(tagPattern, '').replace(/\s{2,}/g, ' ').trim();
}
