/**
 * #21 — Before/After Suggestion Pairing
 * For every finding, generate the exact code diff so the external AI
 * can apply fixes without interpretation guesswork.
 */

export interface SuggestionPair {
  id: string;
  findingId: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  file: string;
  before: string;
  after: string;
  explanation: string;
  autoApplicable: boolean;
  confidence: number;
}

export interface SuggestionReport {
  suggestions: SuggestionPair[];
  totalSuggestions: number;
  autoApplicableCount: number;
  estimatedTimeMinutes: number;
  scanTimestamp: string;
}

// Common fix templates
const FIX_TEMPLATES: Record<string, (context: { file: string; match: string; line: number }) => Partial<SuggestionPair>> = {
  'missing-alt': (ctx) => ({
    title: 'Add alt text to image',
    before: ctx.match,
    after: ctx.match.replace(/>/, ' alt="Descriptive text" >'),
    explanation: 'Images require alt text for screen readers. Add a meaningful description.',
    autoApplicable: false,
    confidence: 0.9,
  }),

  'console-log': (ctx) => ({
    title: 'Remove console.log statement',
    before: ctx.match,
    after: '// Removed: debug logging',
    explanation: 'Console.log statements should be removed in production. Use a proper logging library.',
    autoApplicable: true,
    confidence: 0.95,
  }),

  'any-type': (ctx) => ({
    title: 'Replace `any` type with specific type',
    before: ctx.match,
    after: ctx.match.replace(/:\s*any/, ': unknown'),
    explanation: 'Replace `any` with `unknown` for type safety. Then narrow the type where used.',
    autoApplicable: true,
    confidence: 0.7,
  }),

  'inline-style': (ctx) => ({
    title: 'Extract inline style to className',
    before: ctx.match,
    after: '// Move to CSS/Tailwind class',
    explanation: 'Inline style objects cause re-renders. Use CSS classes or Tailwind utilities.',
    autoApplicable: false,
    confidence: 0.6,
  }),

  'select-star': (ctx) => ({
    title: 'Replace SELECT * with specific columns',
    before: ctx.match,
    after: ctx.match.replace(/\*/, '/* specify columns */'),
    explanation: 'SELECT * fetches unnecessary data. Specify only needed columns.',
    autoApplicable: false,
    confidence: 0.8,
  }),

  'missing-error-handling': (ctx) => ({
    title: 'Add error handling',
    before: ctx.match,
    after: `try {\n  ${ctx.match}\n} catch (error) {\n  console.error('Operation failed:', error);\n  throw error;\n}`,
    explanation: 'Wrap async operations in try/catch to handle failures gracefully.',
    autoApplicable: false,
    confidence: 0.7,
  }),
};

/**
 * Generate before/after suggestion pairs from scan findings
 */
export function generateSuggestionPairs(
  findings: Array<{
    id: string;
    category: string;
    severity: string;
    file: string;
    line?: number;
    code?: string;
    type: string;
  }>,
  fileContents: Map<string, string>
): SuggestionReport {
  const suggestions: SuggestionPair[] = [];

  for (const finding of findings) {
    const template = FIX_TEMPLATES[finding.type];
    const fileContent = fileContents.get(finding.file);

    if (template && fileContent && finding.code) {
      const fix = template({
        file: finding.file,
        match: finding.code,
        line: finding.line || 0,
      });

      suggestions.push({
        id: `sg-${suggestions.length}`,
        findingId: finding.id,
        category: finding.category,
        severity: (finding.severity as SuggestionPair['severity']) || 'medium',
        title: fix.title || finding.type,
        file: finding.file,
        before: fix.before || finding.code,
        after: fix.after || '',
        explanation: fix.explanation || '',
        autoApplicable: fix.autoApplicable || false,
        confidence: fix.confidence || 0.5,
      });
    }
  }

  const autoApplicableCount = suggestions.filter(s => s.autoApplicable).length;
  const estimatedTimeMinutes = suggestions.reduce((sum, s) => {
    return sum + (s.autoApplicable ? 0.5 : s.severity === 'critical' ? 15 : s.severity === 'high' ? 10 : 5);
  }, 0);

  return {
    suggestions,
    totalSuggestions: suggestions.length,
    autoApplicableCount,
    estimatedTimeMinutes: Math.round(estimatedTimeMinutes),
    scanTimestamp: new Date().toISOString(),
  };
}
