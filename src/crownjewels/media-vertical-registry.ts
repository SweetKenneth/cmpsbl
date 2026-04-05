/**
 * CMPSBL MEDIA™ — Vertical Crown Jewel Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 89 Architectural Crown Jewels: 5 per each of the 16 media primitives (80)
 * + 9 cross-primitive compound jewels.
 * Classification: Architecture (permanently black-boxed).
 * All CJPI ≥ 92 — governor-curated, S-Tier.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from './types';

/* ─── Helper ─── */
function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-05T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── CANVAS ──
const CANVAS_JEWELS: STierEntry[] = [
  cj(600, 'S-CANV01', 'Multi-Modal Image Synthesis Pipeline', 97, 'CANVAS', 'End-to-end image generation pipeline with style transfer, inpainting, outpainting, and brand-consistent visual output across resolutions.', 'md-c01'),
  cj(601, 'S-CANV02', 'Brand Visual Consistency Enforcer', 96, 'CANVAS', 'Automated brand guideline enforcement across all generated visuals — color matching, typography validation, logo placement, and whitespace governance.', 'md-c02'),
  cj(602, 'S-CANV03', 'Batch Thumbnail Generation Engine', 95, 'CANVAS', 'High-throughput thumbnail synthesis with A/B variant generation, attention heatmap prediction, and click-through-rate optimization.', 'md-c03'),
  cj(603, 'S-CANV04', 'Photo Manipulation Integrity Guard', 94, 'CANVAS', 'Ensures photo edits preserve natural aesthetics while enforcing disclosure metadata for AI-generated or manipulated content.', 'md-c04'),
  cj(604, 'S-CANV05', 'Graphic Layout Composition Engine', 93, 'CANVAS', 'Automatic graphic layout generation with grid systems, visual hierarchy optimization, and responsive format adaptation.', 'md-c05'),
];

// ── SCORE ──
const SCORE_JEWELS: STierEntry[] = [
  cj(605, 'S-SCOR01', 'Genre-Aware Music Composition Engine', 97, 'SCORE', 'Original music generation with genre classification, key/tempo detection, harmonic progression planning, and arrangement layering.', 'md-s01'),
  cj(606, 'S-SCOR02', 'Sound Effect Synthesis Pipeline', 96, 'SCORE', 'Procedural sound design engine for foley, ambient textures, UI sounds, and game audio with real-time parameter modulation.', 'md-s02'),
  cj(607, 'S-SCOR03', 'Audio Mastering & Loudness Normalizer', 95, 'SCORE', 'Broadcast-ready audio mastering with LUFS normalization, dynamic range optimization, and platform-specific loudness standards.', 'md-s03'),
  cj(608, 'S-SCOR04', 'Vocal Processing & Separation Engine', 94, 'SCORE', 'AI-powered vocal isolation, pitch correction, harmonization, and voice cloning with consent-verified speaker profiles.', 'md-s04'),
  cj(609, 'S-SCOR05', 'Beat Matching & Remix Sequencer', 93, 'SCORE', 'Automatic BPM detection, beat grid alignment, crossfade computation, and DJ-style transition sequencing.', 'md-s05'),
];

// ── REEL ──
const REEL_JEWELS: STierEntry[] = [
  cj(610, 'S-REEL01', 'Automated Video Assembly Pipeline', 97, 'REEL', 'End-to-end video generation from text prompts — scene selection, transition choreography, pacing control, and narrative flow optimization.', 'md-r01'),
  cj(611, 'S-REEL02', 'Motion Graphics Template Engine', 96, 'REEL', 'Dynamic motion graphics generation with kinetic typography, logo animations, lower thirds, and data-driven infographic sequences.', 'md-r02'),
  cj(612, 'S-REEL03', 'Intelligent Highlight Extraction', 95, 'REEL', 'Automatic detection of key moments in long-form video — emotional peaks, audience retention cliffs, and shareable micro-clips.', 'md-r03'),
  cj(613, 'S-REEL04', 'Subtitle & Caption Synthesis Engine', 94, 'REEL', 'Multi-language subtitle generation with speaker diarization, timing alignment, and platform-specific formatting (SRT, VTT, burnt-in).', 'md-r04'),
  cj(614, 'S-REEL05', 'Aspect Ratio Adaptation Pipeline', 93, 'REEL', 'Smart reframing engine that adapts landscape content to portrait, square, and vertical formats with subject tracking.', 'md-r05'),
];

// ── COPY ──
const COPY_JEWELS: STierEntry[] = [
  cj(615, 'S-COPY01', 'Persuasion-Optimized Ad Copy Generator', 97, 'COPY', 'High-converting ad copy generation with persuasion framework selection (AIDA, PAS, BAB), A/B variant production, and CTR prediction.', 'md-cp01'),
  cj(616, 'S-COPY02', 'Email Sequence Architect', 96, 'COPY', 'Automated email nurture sequence design with drip timing optimization, subject line A/B testing, and conversion funnel mapping.', 'md-cp02'),
  cj(617, 'S-COPY03', 'Product Description Factory', 95, 'COPY', 'SEO-optimized product descriptions with benefit extraction, feature prioritization, and marketplace-specific formatting.', 'md-cp03'),
  cj(618, 'S-COPY04', 'Headline Optimization Engine', 94, 'COPY', 'Magnetic headline generation with emotional trigger analysis, power word injection, and character count optimization per platform.', 'md-cp04'),
  cj(619, 'S-COPY05', 'Tone Calibration Matrix', 93, 'COPY', 'Dynamic tone adjustment engine that adapts voice across formal, casual, authoritative, playful, and urgent registers.', 'md-cp05'),
];

// ── CAMPAIGN ──
const CAMPAIGN_JEWELS: STierEntry[] = [
  cj(620, 'S-CAMP01', 'Multi-Platform Campaign Orchestrator', 97, 'CAMPAIGN', 'Unified campaign management across Google Ads, Meta, TikTok, LinkedIn — with synchronized budgets, creatives, and audience segments.', 'md-cm01'),
  cj(621, 'S-CAMP02', 'Bid Strategy Optimization Engine', 96, 'CAMPAIGN', 'Real-time bid adjustment engine using ROAS targets, dayparting signals, audience quality scoring, and competitive density analysis.', 'md-cm02'),
  cj(622, 'S-CAMP03', 'Audience Targeting Intelligence', 95, 'CAMPAIGN', 'Advanced targeting with lookalike expansion, interest graph traversal, retargeting window optimization, and exclusion management.', 'md-cm03'),
  cj(623, 'S-CAMP04', 'Budget Allocation Optimizer', 94, 'CAMPAIGN', 'Dynamic budget redistribution across channels based on real-time performance signals, diminishing returns detection, and opportunity scoring.', 'md-cm04'),
  cj(624, 'S-CAMP05', 'UTM & Attribution Pipeline', 93, 'CAMPAIGN', 'Automated UTM parameter generation, click-through tracking, and multi-touch attribution modeling for campaign ROI analysis.', 'md-cm05'),
];

// ── FEED ──
const FEED_JEWELS: STierEntry[] = [
  cj(625, 'S-FEED01', 'Optimal Posting Time Calculator', 97, 'FEED', 'Platform-specific engagement prediction engine — calculates optimal posting windows based on audience timezone distribution and historical engagement patterns.', 'md-f01'),
  cj(626, 'S-FEED02', 'Hashtag Strategy Engine', 96, 'FEED', 'Dynamic hashtag recommendation with reach/competition scoring, trending detection, branded vs. community classification, and ban-list filtering.', 'md-f02'),
  cj(627, 'S-FEED03', 'Cross-Platform Content Adapter', 95, 'FEED', 'Automatic content reformatting for Twitter/X, Instagram, LinkedIn, TikTok — character limits, image crops, link previews, and CTA adaptation.', 'md-f03'),
  cj(628, 'S-FEED04', 'Engagement Automation Manager', 94, 'FEED', 'Smart reply suggestions, comment sentiment analysis, DM routing, and community management workflow automation.', 'md-f04'),
  cj(629, 'S-FEED05', 'Content Calendar Intelligence', 93, 'FEED', 'AI-driven content calendar with seasonal awareness, event integration, competitor gap analysis, and audience fatigue detection.', 'md-f05'),
];

// ── PALETTE ──
const PALETTE_JEWELS: STierEntry[] = [
  cj(630, 'S-PALT01', 'Design Token Governance Engine', 97, 'PALETTE', 'Centralized design token management with version control, cross-platform sync (CSS, iOS, Android), and deprecation workflows.', 'md-p01'),
  cj(631, 'S-PALT02', 'Color Harmony Generator', 96, 'PALETTE', 'Algorithm-driven color palette generation with accessibility contrast validation, emotional association mapping, and industry-specific recommendations.', 'md-p02'),
  cj(632, 'S-PALT03', 'Brand Voice Calibration Engine', 95, 'PALETTE', 'Natural language brand voice specification with tone detection, vocabulary enforcement, and style deviation alerting.', 'md-p03'),
  cj(633, 'S-PALT04', 'Logo Usage Compliance Scanner', 94, 'PALETTE', 'Automated logo usage validation — clearspace enforcement, minimum size checking, background contrast verification, and prohibited usage detection.', 'md-p04'),
  cj(634, 'S-PALT05', 'Style Guide Auto-Generator', 93, 'PALETTE', 'Generates comprehensive brand style guides from existing assets — extracting colors, fonts, spacing patterns, and visual conventions.', 'md-p05'),
];

// ── RENDER ──
const RENDER_JEWELS: STierEntry[] = [
  cj(635, 'S-REND01', 'Adaptive Transcoding Pipeline', 97, 'RENDER', 'Format-aware media transcoding with codec negotiation, bitrate optimization, and platform-specific encoding profiles (web, mobile, broadcast).', 'md-rn01'),
  cj(636, 'S-REND02', 'CDN-Ready Packaging Engine', 96, 'RENDER', 'Automated media packaging with HLS/DASH manifest generation, thumbnail sprites, preview generation, and edge cache warming.', 'md-rn02'),
  cj(637, 'S-REND03', 'Batch Rendering Orchestrator', 95, 'RENDER', 'Parallel media rendering pipeline with priority queuing, progress tracking, failure recovery, and resource throttling.', 'md-rn03'),
  cj(638, 'S-REND04', 'Watermark & Rights Injection', 94, 'RENDER', 'Dynamic watermark embedding with invisible fingerprinting, ownership metadata injection, and tamper detection.', 'md-rn04'),
  cj(639, 'S-REND05', 'Resolution Intelligence Scaler', 93, 'RENDER', 'AI-powered upscaling and downscaling with detail preservation, artifact suppression, and perceptual quality optimization.', 'md-rn05'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── CURATOR ──
const CURATOR_JEWELS: STierEntry[] = [
  cj(640, 'S-CURT01', 'Viral Pattern Detection Engine', 97, 'CURATOR', 'Real-time viral content pattern recognition with velocity tracking, cross-platform propagation analysis, and early-stage virality prediction.', 'md-cu01'),
  cj(641, 'S-CURT02', 'Competitive Content Intelligence', 96, 'CURATOR', 'Competitor content strategy analysis — posting frequency, engagement benchmarking, content mix analysis, and gap opportunity detection.', 'md-cu02'),
  cj(642, 'S-CURT03', 'Cultural Trend Radar', 95, 'CURATOR', 'Cross-platform cultural trend detection with sentiment mapping, lifecycle staging (emerging/peak/declining), and relevance scoring.', 'md-cu03'),
  cj(643, 'S-CURT04', 'Editorial Calendar Optimizer', 94, 'CURATOR', 'Data-driven editorial planning with topic clustering, audience interest mapping, and content freshness scoring.', 'md-cu04'),
  cj(644, 'S-CURT05', 'Content Gap Analyzer', 93, 'CURATOR', 'Identifies underserved content opportunities through search demand analysis, competitor coverage mapping, and audience question mining.', 'md-cu05'),
];

// ── CRITIC ──
const CRITIC_JEWELS: STierEntry[] = [
  cj(645, 'S-CRIT01', 'Creative Quality Scoring Matrix', 97, 'CRITIC', 'Multi-dimensional creative evaluation with brand alignment, audience fit, emotional resonance, and production quality scoring.', 'md-cr01'),
  cj(646, 'S-CRIT02', 'A/B Creative Variant Ranker', 96, 'CRITIC', 'Statistical creative ranking with predicted CTR, engagement probability, and conversion likelihood scoring across variants.', 'md-cr02'),
  cj(647, 'S-CRIT03', 'Readability & Clarity Analyzer', 95, 'CRITIC', 'Text clarity assessment with Flesch-Kincaid scoring, jargon detection, sentence complexity analysis, and simplification suggestions.', 'md-cr03'),
  cj(648, 'S-CRIT04', 'Visual Composition Evaluator', 94, 'CRITIC', 'Image and video composition assessment — rule-of-thirds adherence, color balance, focal point clarity, and visual hierarchy strength.', 'md-cr04'),
  cj(649, 'S-CRIT05', 'Performance Prediction Engine', 93, 'CRITIC', 'Pre-publish performance prediction using historical engagement data, audience behavior models, and content feature analysis.', 'md-cr05'),
];

// ── AMPLIFY ──
const AMPLIFY_JEWELS: STierEntry[] = [
  cj(650, 'S-AMPL01', 'SEO Content Optimization Pipeline', 97, 'AMPLIFY', 'Full-spectrum SEO optimization — keyword density, semantic relevance, internal linking, schema markup, and SERP feature targeting.', 'md-a01'),
  cj(651, 'S-AMPL02', 'Influencer Discovery & Matching', 96, 'AMPLIFY', 'Influencer identification with audience overlap analysis, engagement authenticity scoring, and brand-fit classification.', 'md-a02'),
  cj(652, 'S-AMPL03', 'Content Syndication Orchestrator', 95, 'AMPLIFY', 'Automated content distribution across syndication networks with canonical management, duplicate prevention, and reach tracking.', 'md-a03'),
  cj(653, 'S-AMPL04', 'Social Sharing Catalyst', 94, 'AMPLIFY', 'Share-optimized content formatting with Open Graph, Twitter Cards, LinkedIn previews, and platform-specific CTA injection.', 'md-a04'),
  cj(654, 'S-AMPL05', 'Backlink Strategy Engine', 93, 'AMPLIFY', 'Link-building opportunity detection with domain authority scoring, outreach template generation, and link equity analysis.', 'md-a05'),
];

// ── PERSONA ──
const PERSONA_JEWELS: STierEntry[] = [
  cj(655, 'S-PERS01', 'Audience Segmentation Intelligence', 97, 'PERSONA', 'Multi-dimensional audience segmentation with behavioral, demographic, psychographic, and technographic clustering.', 'md-pe01'),
  cj(656, 'S-PERS02', 'Persona Modeling Engine', 96, 'PERSONA', 'Detailed persona construction with motivation mapping, pain point analysis, content preference modeling, and journey stage classification.', 'md-pe02'),
  cj(657, 'S-PERS03', 'Lookalike Audience Builder', 95, 'PERSONA', 'Statistically-driven lookalike audience expansion using seed audience feature extraction and similarity scoring.', 'md-pe03'),
  cj(658, 'S-PERS04', 'Content Preference Predictor', 94, 'PERSONA', 'Individual-level content preference prediction using engagement history, browsing patterns, and collaborative filtering.', 'md-pe04'),
  cj(659, 'S-PERS05', 'Psychographic Profile Mapper', 93, 'PERSONA', 'Deep psychographic profiling with value system mapping, lifestyle classification, and attitudinal segmentation.', 'md-pe05'),
];

// ── STORYARC ──
const STORYARC_JEWELS: STierEntry[] = [
  cj(660, 'S-STOR01', 'Campaign Narrative Architect', 97, 'STORYARC', 'Multi-phase campaign storytelling with arc design, tension building, climax placement, and resolution strategy.', 'md-st01'),
  cj(661, 'S-STOR02', 'Content Calendar Coherence Engine', 96, 'STORYARC', 'Cross-content storyline tracking that ensures messaging consistency across posts, emails, ads, and landing pages.', 'md-st02'),
  cj(662, 'S-STOR03', 'Sequential Content Designer', 95, 'STORYARC', 'Series and serial content planning with episode structure, cliffhanger placement, and audience retention arc optimization.', 'md-st03'),
  cj(663, 'S-STOR04', 'Brand Mythology Builder', 94, 'STORYARC', 'Long-term brand narrative development — origin stories, value messaging evolution, and cultural positioning arcs.', 'md-st04'),
  cj(664, 'S-STOR05', 'Messaging Consistency Auditor', 93, 'STORYARC', 'Cross-channel message alignment verification — detects contradictions, tone shifts, and promise inconsistencies.', 'md-st05'),
];

// ── MUSE ──
const MUSE_JEWELS: STierEntry[] = [
  cj(665, 'S-MUSE01', 'Creative Brief Generator', 97, 'MUSE', 'Comprehensive creative brief assembly from business objectives — target audience, key messages, visual direction, tone, and success metrics.', 'md-mu01'),
  cj(666, 'S-MUSE02', 'Concept Brainstorm Engine', 96, 'MUSE', 'Divergent thinking engine that generates creative concepts using lateral association, analogy mapping, and constraint inversion.', 'md-mu02'),
  cj(667, 'S-MUSE03', 'Prompt Variation Generator', 95, 'MUSE', 'Systematic prompt engineering with variation generation, quality prediction, and iterative refinement for generative AI workflows.', 'md-mu03'),
  cj(668, 'S-MUSE04', 'Mood Board Assembly Engine', 94, 'MUSE', 'Visual reference compilation with aesthetic clustering, color palette extraction, and compositional pattern identification.', 'md-mu04'),
  cj(669, 'S-MUSE05', 'Artistic Direction Advisor', 93, 'MUSE', 'Style recommendation engine with art movement classification, visual trend analysis, and project-specific aesthetic guidance.', 'md-mu05'),
];

// ── COMPLY ──
const COMPLY_JEWELS: STierEntry[] = [
  cj(670, 'S-COMP01', 'Copyright Infringement Detector', 97, 'COMPLY', 'Content originality verification with reverse image search, audio fingerprinting, text plagiarism detection, and fair use assessment.', 'md-co01'),
  cj(671, 'S-COMP02', 'Platform Policy Compliance Scanner', 96, 'COMPLY', 'Multi-platform content policy validation — Meta, Google, TikTok, LinkedIn — with violation prediction and remediation suggestions.', 'md-co02'),
  cj(672, 'S-COMP03', 'NSFW & Sensitive Content Filter', 95, 'COMPLY', 'Multi-modal content safety screening with configurable thresholds, context-aware classification, and appeal workflow support.', 'md-co03'),
  cj(673, 'S-COMP04', 'Ad Regulation Compliance Engine', 94, 'COMPLY', 'Advertising regulation validation against FTC, ASA, and regional standards — disclosure requirements, claim substantiation, and testimonial rules.', 'md-co04'),
  cj(674, 'S-COMP05', 'Trademark Collision Scanner', 93, 'COMPLY', 'Brand name and visual trademark scanning with similarity scoring, jurisdiction-aware risk assessment, and alternative suggestions.', 'md-co05'),
];

// ── METRIC ──
const METRIC_JEWELS: STierEntry[] = [
  cj(675, 'S-METR01', 'Multi-Touch Attribution Engine', 97, 'METRIC', 'Advanced attribution modeling with linear, time-decay, position-based, and algorithmic models across cross-channel touchpoints.', 'md-me01'),
  cj(676, 'S-METR02', 'Content Performance Dashboard', 96, 'METRIC', 'Unified content analytics with engagement rate, reach, impressions, saves, shares, and conversion tracking across platforms.', 'md-me02'),
  cj(677, 'S-METR03', 'Customer Acquisition Cost Calculator', 95, 'METRIC', 'Real-time CAC computation with channel breakdown, cohort analysis, and lifetime value to CAC ratio tracking.', 'md-me03'),
  cj(678, 'S-METR04', 'Conversion Funnel Analyzer', 94, 'METRIC', 'Full-funnel conversion analysis with drop-off detection, bottleneck identification, and stage-specific optimization recommendations.', 'md-me04'),
  cj(679, 'S-METR05', 'ROI Forecasting Engine', 93, 'METRIC', 'Predictive ROI modeling with scenario analysis, confidence intervals, and budget sensitivity calculations for marketing investments.', 'md-me05'),
];

/* ═══════════════════════════════════════════════
   CROSS-PRIMITIVE COMPOUND JEWELS (9)
   ═══════════════════════════════════════════════ */

const COMPOUND_JEWELS: STierEntry[] = [
  cj(680, 'S-MDCX01', 'CANVAS×SCORE Multi-Modal Content Fusion', 96, 'CANVAS×SCORE', 'Synchronized image-audio generation pipeline that creates visually and sonically harmonized content from a single creative brief.', 'md-cx01'),
  cj(681, 'S-MDCX02', 'REEL×COPY Video Sales Letter Engine', 96, 'REEL×COPY', 'Automated VSL creation with persuasive script generation, visual scene matching, and CTA timing optimization.', 'md-cx02'),
  cj(682, 'S-MDCX03', 'CAMPAIGN×METRIC Full-Loop Attribution', 95, 'CAMPAIGN×METRIC', 'Closed-loop marketing attribution with real-time campaign adjustment based on multi-touch conversion signals.', 'md-cx03'),
  cj(683, 'S-MDCX04', 'CURATOR×PERSONA Audience-Content Matching', 95, 'CURATOR×PERSONA', 'Content recommendation engine that matches trending content opportunities to specific audience segment preferences.', 'md-cx04'),
  cj(684, 'S-MDCX05', 'FEED×AMPLIFY Distribution Intelligence', 94, 'FEED×AMPLIFY', 'Cross-platform distribution optimization with timing, format, and channel selection intelligence.', 'md-cx05'),
  cj(685, 'S-MDCX06', 'PALETTE×COMPLY Brand Safety Shield', 94, 'PALETTE×COMPLY', 'Integrated brand and compliance enforcement ensuring all content meets both brand guidelines and regulatory requirements.', 'md-cx06'),
  cj(686, 'S-MDCX07', 'MUSE×CRITIC Creative Quality Loop', 93, 'MUSE×CRITIC', 'Closed-loop creative pipeline where MUSE generates concepts and CRITIC evaluates them in iterative refinement cycles.', 'md-cx07'),
  cj(687, 'S-MDCX08', 'STORYARC×COPY Narrative Copy Engine', 93, 'STORYARC×COPY', 'Story-driven copywriting engine that maintains narrative coherence across long-form campaign sequences.', 'md-cx08'),
  cj(688, 'S-MDCX09', 'RENDER×CANVAS Visual Production Pipeline', 92, 'RENDER×CANVAS', 'End-to-end visual content pipeline from generation through rendering, format adaptation, and delivery optimization.', 'md-cx09'),
];

/* ═══════════════════════════════════════════════
   REGISTRY EXPORT
   ═══════════════════════════════════════════════ */

export const MEDIA_CROWN_JEWELS: STierEntry[] = [
  ...CANVAS_JEWELS,
  ...SCORE_JEWELS,
  ...REEL_JEWELS,
  ...COPY_JEWELS,
  ...CAMPAIGN_JEWELS,
  ...FEED_JEWELS,
  ...PALETTE_JEWELS,
  ...RENDER_JEWELS,
  ...CURATOR_JEWELS,
  ...CRITIC_JEWELS,
  ...AMPLIFY_JEWELS,
  ...PERSONA_JEWELS,
  ...STORYARC_JEWELS,
  ...MUSE_JEWELS,
  ...COMPLY_JEWELS,
  ...METRIC_JEWELS,
  ...COMPOUND_JEWELS,
];

/** Get Crown Jewels for a specific primitive */
export function getMediaJewelsByPrimitive(primitiveId: string): STierEntry[] {
  const upper = primitiveId.toUpperCase();
  return MEDIA_CROWN_JEWELS.filter(j => j.module.toUpperCase() === upper || j.module.toUpperCase().startsWith(`${upper}×`) || j.module.toUpperCase().endsWith(`×${upper}`));
}

/** Get summary of the Media Crown Jewel registry */
export function getMediaJewelSummary() {
  return {
    total: MEDIA_CROWN_JEWELS.length,
    engines: 40,
    agents: 40,
    compound: 9,
    avgCjpi: Math.round(MEDIA_CROWN_JEWELS.reduce((s, j) => s + j.cjpi, 0) / MEDIA_CROWN_JEWELS.length),
    version: '1.0.0',
  };
}
