/**
 * CONTENT-GUARDIAN — Quality Scorer (CRITIC primitive)
 * Scores content quality across multiple dimensions:
 *   brand alignment, readability, audience resonance,
 *   compliance, and narrative coherence.
 */

import type {
  ContentPiece,
  BrandProfile,
  AudienceSegment,
  NarrativeArc,
  QualityScore,
} from './types';

// ── Readability (Flesch-Kincaid approximation) ─────────────────────────

function estimateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter(w => w.length > 0).length || 1;
  const syllables = words * 1.5; // Simplified estimation
  const fk = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, fk));
}

// ── Brand Alignment ────────────────────────────────────────────────────

function scoreBrandAlignment(piece: ContentPiece, brand: BrandProfile): number {
  const bodyLower = piece.body.toLowerCase();
  let score = 100;

  // Penalize prohibited terms
  const violations = brand.prohibitedTerms.filter(t => bodyLower.includes(t.toLowerCase()));
  score -= violations.length * 15;

  // Reward messaging pillar alignment
  const pillarHits = brand.messagingPillars.filter(p => bodyLower.includes(p.toLowerCase()));
  score += pillarHits.length * 5;

  return Math.max(0, Math.min(100, score));
}

// ── Audience Resonance ─────────────────────────────────────────────────

function scoreAudienceResonance(
  piece: ContentPiece,
  segments: AudienceSegment[],
): number {
  if (piece.targetAudience.length === 0) return 50;

  let totalScore = 0;
  let segmentCount = 0;

  for (const audienceId of piece.targetAudience) {
    const segment = segments.find(s => s.id === audienceId);
    if (!segment) continue;
    segmentCount++;

    const bodyLower = piece.body.toLowerCase();
    let segScore = 70;

    // Penalize avoided topics
    const avoidHits = segment.avoidTopics.filter(t => bodyLower.includes(t.toLowerCase()));
    segScore -= avoidHits.length * 20;

    // Reward preference alignment
    const prefHits = segment.preferences.filter(p => bodyLower.includes(p.toLowerCase()));
    segScore += prefHits.length * 10;

    totalScore += Math.max(0, Math.min(100, segScore));
  }

  return segmentCount > 0 ? Math.round(totalScore / segmentCount) : 50;
}

// ── Narrative Coherence ────────────────────────────────────────────────

function scoreNarrativeCoherence(piece: ContentPiece, arc: NarrativeArc | null): number {
  if (!arc || piece.campaignId !== arc.campaignId) return 80; // N/A = default pass

  const bodyLower = piece.body.toLowerCase();
  const themeHits = arc.themes.filter(t => bodyLower.includes(t.toLowerCase()));
  const themeScore = arc.themes.length > 0 ? (themeHits.length / arc.themes.length) * 100 : 80;

  return Math.round(themeScore);
}

// ── Quality Score Generator ────────────────────────────────────────────

export function scoreContent(
  piece: ContentPiece,
  brand: BrandProfile,
  segments: AudienceSegment[],
  arc: NarrativeArc | null,
): QualityScore {
  const brandAlignment = scoreBrandAlignment(piece, brand);
  const readability = estimateReadability(piece.body);
  const audienceResonance = scoreAudienceResonance(piece, segments);
  const narrativeCoherence = scoreNarrativeCoherence(piece, arc);
  const complianceScore = 100; // Placeholder — real score from scanner findings

  const overallScore = Math.round(
    brandAlignment * 0.25 +
    readability * 0.20 +
    audienceResonance * 0.25 +
    complianceScore * 0.15 +
    narrativeCoherence * 0.15,
  );

  return {
    contentId: piece.id,
    overallScore,
    brandAlignment,
    readability,
    audienceResonance,
    complianceScore,
    narrativeCoherence,
    breakdown: {
      brandAlignment,
      readability,
      audienceResonance,
      complianceScore,
      narrativeCoherence,
    },
  };
}

export function scoreAll(
  pieces: ContentPiece[],
  brand: BrandProfile,
  segments: AudienceSegment[],
  arc: NarrativeArc | null,
): QualityScore[] {
  return pieces.map(p => scoreContent(p, brand, segments, arc));
}
