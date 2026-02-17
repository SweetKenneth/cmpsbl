/**
 * INCLUSIVE Module Enhancements — v10.5.4 ARCHITECT Epoch
 * CognitiveLoadOptimizer, AccessibilityScorer, RemediationEngine
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE LOAD OPTIMIZER — Content simplification for comprehension
// ═══════════════════════════════════════════════════════════════════════════════

interface ContentMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  complexWordRatio: number;
  readabilityScore: number;  // 0-100
  estimatedReadTime: number; // minutes
}

interface OptimizationSuggestion {
  type: 'simplify' | 'break_up' | 'add_heading' | 'reduce_jargon' | 'add_summary';
  location: string;
  original?: string;
  suggested?: string;
  impact: 'high' | 'medium' | 'low';
}

export class CognitiveLoadOptimizer {
  private complexWords: Set<string> = new Set([
    'implementation', 'functionality', 'optimization', 'infrastructure',
    'comprehensive', 'subsequently', 'notwithstanding', 'aforementioned',
    'methodologies', 'paradigm', 'synergize', 'leverage', 'utilize',
  ]);

  /** Analyze content for cognitive load */
  analyze(content: string): ContentMetrics {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Count complex words (3+ syllables or in our jargon list)
    const complexWordCount = words.filter(w => 
      this.isComplexWord(w.toLowerCase())
    ).length;
    const complexWordRatio = wordCount > 0 ? complexWordCount / wordCount : 0;

    // Flesch-Kincaid inspired readability (simplified)
    const readabilityScore = Math.max(0, Math.min(100,
      100 - (avgWordsPerSentence * 2) - (complexWordRatio * 100)
    ));

    // Estimate read time (200 words per minute, adjusted for complexity)
    const complexityMultiplier = 1 + complexWordRatio;
    const estimatedReadTime = (wordCount / 200) * complexityMultiplier;

    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      complexWordRatio,
      readabilityScore,
      estimatedReadTime,
    };
  }

  /** Get optimization suggestions */
  getSuggestions(content: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const metrics = this.analyze(content);

    // Check for long sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence, idx) => {
      const words = sentence.split(/\s+/).length;
      if (words > 25) {
        suggestions.push({
          type: 'break_up',
          location: `Sentence ${idx + 1}`,
          original: sentence.trim().slice(0, 50) + '...',
          impact: 'high',
        });
      }
    });

    // Check for complex words
    const words = content.split(/\s+/);
    for (const word of words) {
      const lower = word.toLowerCase().replace(/[^a-z]/g, '');
      if (this.complexWords.has(lower)) {
        const simpler = this.getSimplerAlternative(lower);
        if (simpler) {
          suggestions.push({
            type: 'reduce_jargon',
            location: `Word: "${word}"`,
            original: word,
            suggested: simpler,
            impact: 'medium',
          });
        }
      }
    }

    // Check overall readability
    if (metrics.readabilityScore < 60) {
      suggestions.push({
        type: 'add_summary',
        location: 'Beginning of content',
        suggested: 'Add a brief summary of key points',
        impact: 'high',
      });
    }

    // Check for need of headings (long content without breaks)
    if (metrics.wordCount > 300 && !content.includes('\n\n')) {
      suggestions.push({
        type: 'add_heading',
        location: 'Throughout content',
        suggested: 'Break content into sections with clear headings',
        impact: 'medium',
      });
    }

    return suggestions;
  }

  private isComplexWord(word: string): boolean {
    if (this.complexWords.has(word)) return true;
    // Estimate syllables (very simplified)
    const vowelGroups = word.match(/[aeiouy]+/gi);
    return (vowelGroups?.length || 0) >= 4;
  }

  private getSimplerAlternative(word: string): string | null {
    const alternatives: Record<string, string> = {
      'implementation': 'use',
      'functionality': 'feature',
      'optimization': 'improvement',
      'infrastructure': 'system',
      'comprehensive': 'complete',
      'subsequently': 'then',
      'utilize': 'use',
      'leverage': 'use',
      'paradigm': 'model',
      'synergize': 'combine',
      'methodologies': 'methods',
    };
    return alternatives[word] || null;
  }

  /** Simplify content automatically */
  simplify(content: string): string {
    let result = content;
    
    // Replace complex words
    for (const [complex, simple] of Object.entries({
      'utilize': 'use',
      'leverage': 'use',
      'implement': 'use',
      'comprehensive': 'complete',
      'subsequently': 'then',
      'prior to': 'before',
      'in order to': 'to',
      'due to the fact that': 'because',
    })) {
      result = result.replace(new RegExp(complex, 'gi'), simple);
    }

    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY SCORER — WCAG compliance scoring
// ═══════════════════════════════════════════════════════════════════════════════

interface AccessibilityIssue {
  id: string;
  type: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagCriteria: string;
  description: string;
  element?: string;
  suggestion: string;
}

interface AccessibilityScore {
  overall: number;        // 0-100
  byCategory: Record<string, number>;
  issues: AccessibilityIssue[];
  passed: number;
  failed: number;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'None';
}

export class AccessibilityScorer {
  private issueWeights: Record<AccessibilityIssue['severity'], number> = {
    critical: 20,
    serious: 10,
    moderate: 5,
    minor: 1,
  };

  /** Score accessibility of HTML content */
  score(html: string): AccessibilityScore {
    const issues: AccessibilityIssue[] = [];
    let passed = 0;

    // Check for images without alt text
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    for (const img of imgMatches) {
      if (!img.includes('alt=')) {
        issues.push({
          id: `img_alt_${issues.length}`,
          type: 'image',
          severity: 'critical',
          wcagCriteria: '1.1.1',
          description: 'Image missing alt text',
          element: img.slice(0, 50),
          suggestion: 'Add descriptive alt text to the image',
        });
      } else {
        passed++;
      }
    }

    // Check for form labels
    const inputMatches = html.match(/<input[^>]*>/gi) || [];
    for (const input of inputMatches) {
      const idMatch = input.match(/id=["']([^"']+)["']/);
      if (idMatch) {
        const labelPattern = new RegExp(`for=["']${idMatch[1]}["']`);
        if (!labelPattern.test(html)) {
          issues.push({
            id: `label_${issues.length}`,
            type: 'form',
            severity: 'serious',
            wcagCriteria: '1.3.1',
            description: 'Form input missing associated label',
            element: input.slice(0, 50),
            suggestion: 'Add a <label> element with matching for attribute',
          });
        } else {
          passed++;
        }
      }
    }

    // Check for heading hierarchy
    const headingMatches = html.match(/<h[1-6][^>]*>/gi) || [];
    let lastLevel = 0;
    for (const heading of headingMatches) {
      const level = parseInt(heading.charAt(2));
      if (lastLevel > 0 && level > lastLevel + 1) {
        issues.push({
          id: `heading_${issues.length}`,
          type: 'structure',
          severity: 'moderate',
          wcagCriteria: '1.3.1',
          description: `Heading hierarchy skipped from h${lastLevel} to h${level}`,
          element: heading,
          suggestion: `Use h${lastLevel + 1} instead of h${level}`,
        });
      } else {
        passed++;
      }
      lastLevel = level;
    }

    // Check for link text
    const linkMatches = html.match(/<a[^>]*>([^<]*)<\/a>/gi) || [];
    for (const link of linkMatches) {
      const textMatch = link.match(/>([^<]*)</);
      const text = textMatch?.[1]?.trim().toLowerCase();
      if (text === 'click here' || text === 'here' || text === 'link') {
        issues.push({
          id: `link_${issues.length}`,
          type: 'link',
          severity: 'moderate',
          wcagCriteria: '2.4.4',
          description: 'Non-descriptive link text',
          element: link.slice(0, 50),
          suggestion: 'Use descriptive link text that explains the destination',
        });
      } else {
        passed++;
      }
    }

    // Calculate score
    const totalPenalty = issues.reduce((sum, issue) => 
      sum + this.issueWeights[issue.severity], 0
    );
    const overall = Math.max(0, 100 - totalPenalty);

    // Calculate category scores
    const byCategory: Record<string, number> = {};
    const categories = ['image', 'form', 'structure', 'link'];
    for (const category of categories) {
      const categoryIssues = issues.filter(i => i.type === category);
      const categoryPenalty = categoryIssues.reduce((sum, issue) => 
        sum + this.issueWeights[issue.severity], 0
      );
      byCategory[category] = Math.max(0, 100 - categoryPenalty * 5);
    }

    // Determine WCAG level
    const hasCritical = issues.some(i => i.severity === 'critical');
    const hasSerious = issues.some(i => i.severity === 'serious');
    let wcagLevel: AccessibilityScore['wcagLevel'] = 'AAA';
    if (hasCritical) wcagLevel = 'None';
    else if (hasSerious) wcagLevel = 'A';
    else if (issues.length > 0) wcagLevel = 'AA';

    return {
      overall,
      byCategory,
      issues,
      passed,
      failed: issues.length,
      wcagLevel,
    };
  }

  /** Get priority remediation order */
  getPriorityOrder(issues: AccessibilityIssue[]): AccessibilityIssue[] {
    const severityOrder: Record<AccessibilityIssue['severity'], number> = {
      critical: 0,
      serious: 1,
      moderate: 2,
      minor: 3,
    };
    return [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REMEDIATION ENGINE — Automated accessibility fixes
// ═══════════════════════════════════════════════════════════════════════════════

interface RemediationResult {
  original: string;
  remediated: string;
  fixesApplied: string[];
  manualReviewNeeded: string[];
}

export class RemediationEngine {
  /** Apply automatic remediations */
  remediate(html: string): RemediationResult {
    let result = html;
    const fixesApplied: string[] = [];
    const manualReviewNeeded: string[] = [];

    // Add empty alt to decorative images (placeholder - needs manual review)
    const decorativeImgPattern = /<img(?![^>]*alt=)[^>]*>/gi;
    const decorativeMatches = result.match(decorativeImgPattern) || [];
    for (const match of decorativeMatches) {
      const fixed = match.replace('>', ' alt="">');
      result = result.replace(match, fixed);
      fixesApplied.push('Added empty alt to image (review if decorative)');
      manualReviewNeeded.push(`Image at: ${match.slice(0, 30)}... - verify if decorative`);
    }

    // Add role="button" to clickable divs
    const clickableDivPattern = /<div[^>]*onclick[^>]*>/gi;
    const clickableMatches = result.match(clickableDivPattern) || [];
    for (const match of clickableMatches) {
      if (!match.includes('role=')) {
        const fixed = match.replace('>', ' role="button" tabindex="0">');
        result = result.replace(match, fixed);
        fixesApplied.push('Added role="button" and tabindex to clickable div');
      }
    }

    // Add aria-label to icon-only buttons
    const iconButtonPattern = /<button[^>]*>[\s]*<(i|svg|span)[^>]*class="[^"]*icon[^"]*"[^>]*>[\s]*<\/(i|svg|span)>[\s]*<\/button>/gi;
    const iconMatches = result.match(iconButtonPattern) || [];
    for (const match of iconMatches) {
      if (!match.includes('aria-label')) {
        manualReviewNeeded.push(`Icon-only button needs aria-label: ${match.slice(0, 40)}...`);
      }
    }

    // Ensure tables have captions
    const tablePattern = /<table[^>]*>(?![\s\S]*<caption)/gi;
    if (tablePattern.test(result)) {
      manualReviewNeeded.push('Table(s) missing <caption> element');
    }

    return {
      original: html,
      remediated: result,
      fixesApplied,
      manualReviewNeeded,
    };
  }

  /** Generate accessibility report */
  generateReport(html: string): string {
    const scorer = new AccessibilityScorer();
    const score = scorer.score(html);
    const prioritized = scorer.getPriorityOrder(score.issues);

    let report = `# Accessibility Report\n\n`;
    report += `## Overall Score: ${score.overall}/100 (WCAG Level: ${score.wcagLevel})\n\n`;
    report += `- Passed checks: ${score.passed}\n`;
    report += `- Failed checks: ${score.failed}\n\n`;

    if (prioritized.length > 0) {
      report += `## Issues (Priority Order)\n\n`;
      for (const issue of prioritized) {
        report += `### ${issue.severity.toUpperCase()}: ${issue.description}\n`;
        report += `- WCAG: ${issue.wcagCriteria}\n`;
        report += `- Fix: ${issue.suggestion}\n`;
        if (issue.element) {
          report += `- Element: \`${issue.element}\`\n`;
        }
        report += '\n';
      }
    }

    report += `## Category Scores\n\n`;
    for (const [category, categoryScore] of Object.entries(score.byCategory)) {
      report += `- ${category}: ${categoryScore}/100\n`;
    }

    return report;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const inclusiveEnhancements = {
  CognitiveLoadOptimizer,
  AccessibilityScorer,
  RemediationEngine,
};

export type {
  ContentMetrics,
  OptimizationSuggestion,
  AccessibilityIssue,
  AccessibilityScore,
  RemediationResult,
};
