/**
 * CONTENT-GUARDIAN — Scanner Module
 * Primitives: CRITIC (quality), PALETTE (brand), COMPLY (compliance),
 *             PERSONA (audience), STORYARC (narrative)
 *
 * Detects brand drift, quality issues, compliance violations,
 * audience mismatches, and narrative inconsistencies.
 */

import type {
  ContentScanRule,
  ContentContext,
  DetectedContentIssue,
  ContentCategory,
} from './types';

// ── Rule Registry ──────────────────────────────────────────────────────

const rules = new Map<string, ContentScanRule>();

export function registerRule(rule: ContentScanRule): void {
  rules.set(rule.id, rule);
}

export function removeRule(id: string): boolean {
  return rules.delete(id);
}

export function getRegisteredRules(): ContentScanRule[] {
  return [...rules.values()];
}

// ── Built-in Rules ─────────────────────────────────────────────────────

/** PALETTE: Brand voice drift detection */
registerRule({
  id: 'brand-voice-drift',
  name: 'Brand Voice Drift Detector',
  category: 'brand_drift',
  severity: 'warning',
  description: 'Detects content that deviates from established brand voice tone',
  detect(context: ContentContext): DetectedContentIssue[] {
    const issues: DetectedContentIssue[] = [];
    const { brandProfile } = context;

    for (const piece of context.content) {
      // Check prohibited terms
      const bodyLower = piece.body.toLowerCase();
      const violations = brandProfile.prohibitedTerms.filter(term =>
        bodyLower.includes(term.toLowerCase()),
      );

      if (violations.length > 0) {
        issues.push({
          id: crypto.randomUUID(),
          ruleId: 'brand-voice-drift',
          category: 'brand_drift',
          severity: 'warning',
          contentId: piece.id,
          message: `Content uses prohibited brand terms: ${violations.join(', ')}`,
          detectedAt: new Date().toISOString(),
          metadata: { violations, toneExpected: brandProfile.voiceTone },
        });
      }
    }
    return issues;
  },
});

/** PALETTE: Brand visual consistency */
registerRule({
  id: 'brand-visual-consistency',
  name: 'Brand Visual Consistency Checker',
  category: 'brand_drift',
  severity: 'warning',
  description: 'Ensures color palette and typography rules are maintained',
  detect(context: ContentContext): DetectedContentIssue[] {
    const issues: DetectedContentIssue[] = [];
    for (const piece of context.content) {
      if (piece.type === 'image' || piece.type === 'video') {
        const colors = piece.metadata?.colors as string[] | undefined;
        if (colors) {
          const offBrand = colors.filter(c => !context.brandProfile.colorPalette.includes(c));
          if (offBrand.length > 0) {
            issues.push({
              id: crypto.randomUUID(),
              ruleId: 'brand-visual-consistency',
              category: 'brand_drift',
              severity: 'warning',
              contentId: piece.id,
              message: `Off-brand colors detected: ${offBrand.join(', ')}`,
              detectedAt: new Date().toISOString(),
              metadata: { offBrandColors: offBrand, palette: context.brandProfile.colorPalette },
            });
          }
        }
      }
    }
    return issues;
  },
});

/** COMPLY: Platform policy compliance */
registerRule({
  id: 'platform-policy-check',
  name: 'Platform Policy Compliance',
  category: 'platform_policy_breach',
  severity: 'violation',
  description: 'Checks content against platform-specific policies',
  detect(context: ContentContext): DetectedContentIssue[] {
    const issues: DetectedContentIssue[] = [];

    for (const piece of context.content) {
      for (const platform of piece.targetPlatforms) {
        const policy = context.platformPolicies.find(p => p.platform === platform);
        if (!policy) continue;

        // Length check
        if (policy.maxLength && piece.body.length > policy.maxLength) {
          issues.push({
            id: crypto.randomUUID(),
            ruleId: 'platform-policy-check',
            category: 'platform_policy_breach',
            severity: 'violation',
            contentId: piece.id,
            message: `Content exceeds ${platform} max length: ${piece.body.length}/${policy.maxLength}`,
            detectedAt: new Date().toISOString(),
            metadata: { platform, currentLength: piece.body.length, maxLength: policy.maxLength },
          });
        }

        // Prohibited content
        const bodyLower = piece.body.toLowerCase();
        const prohibited = policy.prohibitedContent.filter(term =>
          bodyLower.includes(term.toLowerCase()),
        );
        if (prohibited.length > 0) {
          issues.push({
            id: crypto.randomUUID(),
            ruleId: 'platform-policy-check',
            category: 'platform_policy_breach',
            severity: 'block',
            contentId: piece.id,
            message: `Content violates ${platform} policy: prohibited content [${prohibited.join(', ')}]`,
            detectedAt: new Date().toISOString(),
            metadata: { platform, prohibited },
          });
        }
      }
    }
    return issues;
  },
});

/** COMPLY: Ad regulation compliance */
registerRule({
  id: 'ad-regulation-check',
  name: 'Ad Regulation Compliance',
  category: 'ad_regulation_violation',
  severity: 'violation',
  description: 'Checks ad content for regulatory compliance (disclaimers, disclosures)',
  detect(context: ContentContext): DetectedContentIssue[] {
    const issues: DetectedContentIssue[] = [];

    for (const piece of context.content) {
      if (piece.type !== 'ad') continue;

      // Check for required ad disclosures
      const bodyLower = piece.body.toLowerCase();
      const hasDisclaimer = bodyLower.includes('#ad') ||
        bodyLower.includes('sponsored') ||
        bodyLower.includes('paid partnership') ||
        bodyLower.includes('advertisement');

      if (!hasDisclaimer) {
        issues.push({
          id: crypto.randomUUID(),
          ruleId: 'ad-regulation-check',
          category: 'ad_regulation_violation',
          severity: 'violation',
          contentId: piece.id,
          message: 'Ad content missing required disclosure (e.g., #ad, sponsored)',
          detectedAt: new Date().toISOString(),
          metadata: { contentType: piece.type },
        });
      }
    }
    return issues;
  },
});

/** COMPLY: Trademark scanning */
registerRule({
  id: 'trademark-scan',
  name: 'Trademark Conflict Scanner',
  category: 'trademark_conflict',
  severity: 'violation',
  description: 'Detects potential trademark conflicts in content',
  detect(context: ContentContext): DetectedContentIssue[] {
    const issues: DetectedContentIssue[] = [];
    // Check for competitor brand mentions (simplified — real impl uses a trademark DB)
    const trademarkIndicators = ['®', '™', '©'];

    for (const piece of context.content) {
      for (const indicator of trademarkIndicators) {
        if (piece.body.includes(indicator)) {
          issues.push({
            id: crypto.randomUUID(),
            ruleId: 'trademark-scan',
            category: 'trademark_conflict',
            severity: 'warning',
            contentId: piece.id,
            message: `Content contains trademark symbol "${indicator}" — verify usage rights`,
            detectedAt: new Date().toISOString(),
            metadata: { symbol: indicator },
          });
        }
      }
    }
    return issues;
  },
});

/** STORYARC: Narrative consistency check */
registerRule({
  id: 'narrative-consistency',
  name: 'Narrative Consistency Checker',
  category: 'narrative_inconsistency',
  severity: 'warning',
  description: 'Ensures content aligns with the active campaign narrative arc',
  detect(context: ContentContext): DetectedContentIssue[] {
    if (!context.narrativeArc) return [];
    const issues: DetectedContentIssue[] = [];
    const { themes, messagingSequence } = context.narrativeArc;

    for (const piece of context.content) {
      if (piece.campaignId !== context.narrativeArc.campaignId) continue;

      const bodyLower = piece.body.toLowerCase();
      const themeHits = themes.filter(t => bodyLower.includes(t.toLowerCase()));

      if (themeHits.length === 0) {
        issues.push({
          id: crypto.randomUUID(),
          ruleId: 'narrative-consistency',
          category: 'narrative_inconsistency',
          severity: 'warning',
          contentId: piece.id,
          message: `Content does not align with campaign themes: ${themes.join(', ')}`,
          detectedAt: new Date().toISOString(),
          metadata: { expectedThemes: themes, messagingSequence },
        });
      }
    }
    return issues;
  },
});

/** PERSONA: Audience mismatch detection */
registerRule({
  id: 'audience-mismatch',
  name: 'Audience Mismatch Detector',
  category: 'audience_mismatch',
  severity: 'warning',
  description: 'Flags content that includes topics the target audience avoids',
  detect(context: ContentContext): DetectedContentIssue[] {
    const issues: DetectedContentIssue[] = [];

    for (const piece of context.content) {
      for (const audienceId of piece.targetAudience) {
        const segment = context.audienceSegments.find(s => s.id === audienceId);
        if (!segment) continue;

        const bodyLower = piece.body.toLowerCase();
        const avoidHits = segment.avoidTopics.filter(t => bodyLower.includes(t.toLowerCase()));

        if (avoidHits.length > 0) {
          issues.push({
            id: crypto.randomUUID(),
            ruleId: 'audience-mismatch',
            category: 'audience_mismatch',
            severity: 'warning',
            contentId: piece.id,
            message: `Content touches avoided topics for "${segment.name}": ${avoidHits.join(', ')}`,
            detectedAt: new Date().toISOString(),
            metadata: { segment: segment.name, avoidedTopics: avoidHits },
          });
        }
      }
    }
    return issues;
  },
});

// ── Scan Executor ──────────────────────────────────────────────────────

export function runScan(
  context: ContentContext,
  enabledCategories: ContentCategory[],
  maxIssues: number,
): DetectedContentIssue[] {
  const issues: DetectedContentIssue[] = [];

  for (const rule of rules.values()) {
    if (!enabledCategories.includes(rule.category)) continue;
    try {
      const detected = rule.detect(context);
      issues.push(...detected);
    } catch {
      // Graceful degradation: skip failed rules
    }
    if (issues.length >= maxIssues) break;
  }

  return issues.slice(0, maxIssues);
}
