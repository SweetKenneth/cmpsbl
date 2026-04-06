/**
 * CMPSBL® Media Vertical — Discovery Seed Engine (GENESIS)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries using the media primitive matrix.
 * Routes:
 *   - Architecture-class (CJPI ≥ 95) → Vault (gated, S-Tier protected)
 *   - Showroom-class (CJPI 68–94)   → Showroom catalog (100 target)
 *   - Raw-tier (CJPI < 68)          → Junkyard pool (100 target)
 *
 * All non-vault discoveries are deposited into the Memory Stream pool.
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeDiscovery } from '../../factory/foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './seed-persistence';
import { getMediaEngines, getMediaAgents } from './media';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface MediaDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'visual' | 'audio' | 'video' | 'copy' | 'campaign' | 'social' | 'brand' | 'analytics';
  discoveredAt: string;
}

export interface MediaSeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: MediaDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — SEED RNG & TEMPLATES
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const MEDIA_PRIMITIVE_IDS = [
  ...getMediaEngines().map(e => e.id),
  ...getMediaAgents().map(a => a.id),
];

const SPINE_IDS = [
  'BRAIN', 'MEMORY', 'IDENTITY', 'CONSCIENCE', 'COMPASS', 'REFLEX',
  'DEFENSE', 'GOVERNANCE', 'EVOLUTION', 'SHADOW', 'RELAY', 'NERVE',
  'CORE', 'SYSTEM', 'ATLAS', 'MEDIC', 'VISION', 'INTENT',
  'IMMUNITY', 'ACCESS', 'SOVEREIGN', 'TREATY', 'INTEGRATION', 'INCLUSIVE',
];

interface DiscoveryTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: MediaDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // Visual (25)
  { namePattern: 'Adaptive Style Transfer Pipeline', descriptionPattern: 'Neural style transfer with brand-consistent output and resolution-aware processing.', category: 'visual', primaryPrimitives: ['CANVAS'], minChainLength: 2, maxChainLength: 5, cjpiBias: 82 },
  { namePattern: 'Real-Time Image Quality Classifier', descriptionPattern: 'Multi-dimensional image quality assessment for automated content curation.', category: 'visual', primaryPrimitives: ['CANVAS', 'CRITIC'], minChainLength: 2, maxChainLength: 4, cjpiBias: 78 },
  { namePattern: 'Generative Thumbnail A/B Factory', descriptionPattern: 'High-throughput thumbnail variant generation with predicted click-through scoring.', category: 'visual', primaryPrimitives: ['CANVAS', 'METRIC'], minChainLength: 3, maxChainLength: 5, cjpiBias: 85 },
  { namePattern: 'Brand Color Extraction Engine', descriptionPattern: 'Automatic brand palette extraction from existing assets with harmony analysis.', category: 'visual', primaryPrimitives: ['PALETTE', 'CANVAS'], minChainLength: 2, maxChainLength: 4, cjpiBias: 75 },
  { namePattern: 'Photo Enhancement Pipeline', descriptionPattern: 'AI-powered photo retouching with exposure correction, noise reduction, and detail enhancement.', category: 'visual', primaryPrimitives: ['CANVAS', 'RENDER'], minChainLength: 2, maxChainLength: 4, cjpiBias: 70 },
  // Audio (25)
  { namePattern: 'Ambient Soundscape Generator', descriptionPattern: 'Procedural ambient audio generation for videos, podcasts, and interactive media.', category: 'audio', primaryPrimitives: ['SCORE'], minChainLength: 2, maxChainLength: 4, cjpiBias: 80 },
  { namePattern: 'Podcast Intro/Outro Composer', descriptionPattern: 'Brand-aware podcast music composition with jingle generation and sonic branding.', category: 'audio', primaryPrimitives: ['SCORE', 'PALETTE'], minChainLength: 2, maxChainLength: 4, cjpiBias: 76 },
  { namePattern: 'Audio Loudness Compliance Checker', descriptionPattern: 'Broadcast standard validation with LUFS measurement and platform-specific normalization.', category: 'audio', primaryPrimitives: ['SCORE', 'COMPLY'], minChainLength: 2, maxChainLength: 3, cjpiBias: 72 },
  { namePattern: 'Voice-Over Timing Synchronizer', descriptionPattern: 'Auto-syncs voice-over tracks with video scenes using speech boundary detection.', category: 'audio', primaryPrimitives: ['SCORE', 'REEL'], minChainLength: 3, maxChainLength: 5, cjpiBias: 83 },
  { namePattern: 'Music Mood Classifier', descriptionPattern: 'Emotion-based music categorization for content-to-soundtrack matching.', category: 'audio', primaryPrimitives: ['SCORE', 'MUSE'], minChainLength: 2, maxChainLength: 4, cjpiBias: 68 },
  // Video (25)
  { namePattern: 'Short-Form Video Assembly Engine', descriptionPattern: 'TikTok/Reels-optimized video generation with trend-aware editing templates.', category: 'video', primaryPrimitives: ['REEL', 'FEED'], minChainLength: 3, maxChainLength: 5, cjpiBias: 88 },
  { namePattern: 'Video Scene Segmentation Engine', descriptionPattern: 'Automatic scene boundary detection with content classification and chapter marking.', category: 'video', primaryPrimitives: ['REEL'], minChainLength: 2, maxChainLength: 4, cjpiBias: 74 },
  { namePattern: 'Multi-Format Export Pipeline', descriptionPattern: 'Parallel video export to multiple aspect ratios and platform specifications.', category: 'video', primaryPrimitives: ['REEL', 'RENDER'], minChainLength: 2, maxChainLength: 4, cjpiBias: 79 },
  { namePattern: 'Kinetic Typography Renderer', descriptionPattern: 'Dynamic text animation with font pairing, motion curves, and timing synchronization.', category: 'video', primaryPrimitives: ['REEL', 'COPY'], minChainLength: 3, maxChainLength: 5, cjpiBias: 81 },
  { namePattern: 'Video Engagement Heatmap Generator', descriptionPattern: 'Predicted audience retention heatmaps for pre-publish video optimization.', category: 'video', primaryPrimitives: ['REEL', 'METRIC'], minChainLength: 3, maxChainLength: 5, cjpiBias: 86 },
  // Copy (25)
  { namePattern: 'Headline Split-Test Generator', descriptionPattern: 'Statistical headline variant generation with emotional trigger classification.', category: 'copy', primaryPrimitives: ['COPY', 'CRITIC'], minChainLength: 2, maxChainLength: 4, cjpiBias: 84 },
  { namePattern: 'Product Launch Copy Suite', descriptionPattern: 'Complete product launch copy package — landing page, emails, social posts, press release.', category: 'copy', primaryPrimitives: ['COPY', 'CAMPAIGN'], minChainLength: 3, maxChainLength: 5, cjpiBias: 87 },
  { namePattern: 'Localization Copy Adapter', descriptionPattern: 'Market-specific copy adaptation with cultural sensitivity checking and local idiom integration.', category: 'copy', primaryPrimitives: ['COPY', 'PERSONA'], minChainLength: 2, maxChainLength: 4, cjpiBias: 73 },
  { namePattern: 'CTA Performance Optimizer', descriptionPattern: 'Call-to-action text optimization using conversion data and behavioral psychology principles.', category: 'copy', primaryPrimitives: ['COPY', 'METRIC'], minChainLength: 2, maxChainLength: 4, cjpiBias: 77 },
  { namePattern: 'Blog Post Structure Engine', descriptionPattern: 'SEO-optimized blog post structuring with heading hierarchy, internal linking, and content length optimization.', category: 'copy', primaryPrimitives: ['COPY', 'AMPLIFY'], minChainLength: 2, maxChainLength: 4, cjpiBias: 71 },
  // Campaign (25)
  { namePattern: 'Cross-Channel Budget Optimizer', descriptionPattern: 'Real-time marketing budget redistribution based on ROAS signals and diminishing returns.', category: 'campaign', primaryPrimitives: ['CAMPAIGN', 'METRIC'], minChainLength: 3, maxChainLength: 5, cjpiBias: 89 },
  { namePattern: 'Retargeting Window Calculator', descriptionPattern: 'Optimal retargeting window computation using engagement decay curves and conversion lag analysis.', category: 'campaign', primaryPrimitives: ['CAMPAIGN', 'PERSONA'], minChainLength: 2, maxChainLength: 4, cjpiBias: 76 },
  { namePattern: 'Ad Creative Fatigue Detector', descriptionPattern: 'Statistical detection of creative fatigue with automatic refresh trigger and variant rotation.', category: 'campaign', primaryPrimitives: ['CAMPAIGN', 'CRITIC'], minChainLength: 2, maxChainLength: 4, cjpiBias: 80 },
  { namePattern: 'Landing Page Variant Generator', descriptionPattern: 'Dynamic landing page creation with audience-specific messaging, layout, and CTA placement.', category: 'campaign', primaryPrimitives: ['CAMPAIGN', 'COPY', 'CANVAS'], minChainLength: 3, maxChainLength: 5, cjpiBias: 85 },
  { namePattern: 'Campaign Launch Checklist Engine', descriptionPattern: 'Automated pre-launch validation for campaigns — tracking pixels, UTMs, creatives, targeting, budgets.', category: 'campaign', primaryPrimitives: ['CAMPAIGN', 'COMPLY'], minChainLength: 2, maxChainLength: 4, cjpiBias: 74 },
  // Social (25)
  { namePattern: 'Hashtag Performance Analyzer', descriptionPattern: 'Real-time hashtag reach and competition scoring with trending detection and ban-list filtering.', category: 'social', primaryPrimitives: ['FEED', 'AMPLIFY'], minChainLength: 2, maxChainLength: 4, cjpiBias: 78 },
  { namePattern: 'Community Engagement Responder', descriptionPattern: 'Smart reply generation with sentiment analysis, brand voice enforcement, and escalation routing.', category: 'social', primaryPrimitives: ['FEED', 'COPY'], minChainLength: 2, maxChainLength: 4, cjpiBias: 75 },
  { namePattern: 'Social Listening Dashboard', descriptionPattern: 'Brand mention monitoring with sentiment trends, competitor comparison, and crisis detection.', category: 'social', primaryPrimitives: ['FEED', 'CURATOR'], minChainLength: 2, maxChainLength: 4, cjpiBias: 82 },
  { namePattern: 'Platform-Specific Content Formatter', descriptionPattern: 'Automatic content reformatting for each social platform — character limits, media specs, and preview optimization.', category: 'social', primaryPrimitives: ['FEED', 'RENDER'], minChainLength: 2, maxChainLength: 4, cjpiBias: 69 },
  { namePattern: 'Influencer Campaign Tracker', descriptionPattern: 'Influencer partnership management with deliverable tracking, performance measurement, and ROI calculation.', category: 'social', primaryPrimitives: ['FEED', 'AMPLIFY', 'METRIC'], minChainLength: 3, maxChainLength: 5, cjpiBias: 83 },
  // Brand (25)
  { namePattern: 'Brand Asset Library Manager', descriptionPattern: 'Centralized brand asset management with version control, access permissions, and usage tracking.', category: 'brand', primaryPrimitives: ['PALETTE'], minChainLength: 2, maxChainLength: 3, cjpiBias: 71 },
  { namePattern: 'Brand Consistency Auditor', descriptionPattern: 'Cross-channel brand consistency verification with automated deviation detection and remediation.', category: 'brand', primaryPrimitives: ['PALETTE', 'COMPLY'], minChainLength: 2, maxChainLength: 4, cjpiBias: 77 },
  { namePattern: 'Typography Pairing Recommender', descriptionPattern: 'Font combination recommendation using visual harmony scoring and readability analysis.', category: 'brand', primaryPrimitives: ['PALETTE', 'CANVAS'], minChainLength: 2, maxChainLength: 3, cjpiBias: 67 },
  { namePattern: 'Brand Voice Deviation Alerter', descriptionPattern: 'Real-time tone monitoring that flags content drifting from established brand voice parameters.', category: 'brand', primaryPrimitives: ['PALETTE', 'CRITIC'], minChainLength: 2, maxChainLength: 4, cjpiBias: 73 },
  { namePattern: 'Design System Token Sync', descriptionPattern: 'Cross-platform design token synchronization between CSS, iOS, and Android implementations.', category: 'brand', primaryPrimitives: ['PALETTE', 'RENDER'], minChainLength: 2, maxChainLength: 3, cjpiBias: 66 },
  // Analytics (25)
  { namePattern: 'Content ROI Attribution Model', descriptionPattern: 'Multi-touch content attribution with time-decay weighting and channel interaction modeling.', category: 'analytics', primaryPrimitives: ['METRIC', 'CAMPAIGN'], minChainLength: 2, maxChainLength: 4, cjpiBias: 86 },
  { namePattern: 'Audience Growth Predictor', descriptionPattern: 'Follower growth forecasting using content velocity, engagement trends, and market saturation modeling.', category: 'analytics', primaryPrimitives: ['METRIC', 'PERSONA'], minChainLength: 2, maxChainLength: 4, cjpiBias: 79 },
  { namePattern: 'Content Decay Rate Calculator', descriptionPattern: 'Post-publish content performance decay modeling with evergreen vs. ephemeral classification.', category: 'analytics', primaryPrimitives: ['METRIC', 'CURATOR'], minChainLength: 2, maxChainLength: 4, cjpiBias: 72 },
  { namePattern: 'Creative Performance Benchmarking', descriptionPattern: 'Industry and competitor creative performance benchmarking with normalized scoring.', category: 'analytics', primaryPrimitives: ['METRIC', 'CRITIC'], minChainLength: 2, maxChainLength: 4, cjpiBias: 75 },
  { namePattern: 'Customer Journey Content Mapper', descriptionPattern: 'Maps content touchpoints across the customer journey with stage-specific performance analysis.', category: 'analytics', primaryPrimitives: ['METRIC', 'STORYARC', 'PERSONA'], minChainLength: 3, maxChainLength: 5, cjpiBias: 84 },
];

// ═══════════════════════════════════════════════════════════════
// §3 — SEED ENGINE
// ═══════════════════════════════════════════════════════════════

function tierFromCjpi(score: number): MediaDiscovery['tier'] {
  if (score >= 95) return 'Apex';
  if (score >= 88) return 'Mythic';
  if (score >= 80) return 'Relic';
  if (score >= 72) return 'Prime';
  if (score >= 60) return 'Mint';
  return 'Raw';
}

function routeFromCjpi(score: number): MediaDiscovery['route'] {
  if (score >= 95) return 'vault';
  if (score >= 68) return 'showroom';
  return 'junkyard';
}

let _cachedResult: MediaSeedResult | null = null;

export function seedMediaDiscoveries(forceSeed = false): MediaSeedResult {
  if (_cachedResult && !forceSeed) return _cachedResult;

  const rng = seedRng(330042);
  const discoveries: MediaDiscovery[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < 200; i++) {
    const template = DISCOVERY_TEMPLATES[i % DISCOVERY_TEMPLATES.length];
    const variation = Math.floor(i / DISCOVERY_TEMPLATES.length) + 1;

    // Build primitive chain
    const chainLength = template.minChainLength + Math.floor(rng() * (template.maxChainLength - template.minChainLength + 1));
    const chain = [...template.primaryPrimitives];
    while (chain.length < chainLength) {
      const useSpine = rng() > 0.5;
      const pool = useSpine ? SPINE_IDS : MEDIA_PRIMITIVE_IDS;
      const pick = pool[Math.floor(rng() * pool.length)];
      if (!chain.includes(pick)) chain.push(pick);
    }

    // Score with controlled distribution
    const baseScore = template.cjpiBias + (rng() * 12 - 6);
    const chainBonus = Math.min(chain.length * 1.5, 6);
    const cjpiScore = Math.round(Math.min(Math.max(baseScore + chainBonus, 42), 98));

    const suffix = variation > 1 ? ` v${variation}` : '';

    discoveries.push({
      id: `media-seed-${String(i + 1).padStart(3, '0')}`,
      name: `${template.namePattern}${suffix}`,
      description: template.descriptionPattern,
      cjpiScore,
      primitiveChain: chain,
      tier: tierFromCjpi(cjpiScore),
      route: routeFromCjpi(cjpiScore),
      category: template.category,
      discoveredAt: now,
    });
  }

  // Route discoveries into the foundry system (DB persistence happens below)
  for (const d of discoveries) {
    try {
      routeDiscovery(d.cjpiScore);
    } catch {
      // Foundry routing is best-effort during seeding
    }
  }

  const vaultCount = discoveries.filter(d => d.route === 'vault').length;
  const showroomCount = discoveries.filter(d => d.route === 'showroom').length;
  const junkyardCount = discoveries.filter(d => d.route === 'junkyard').length;

  _cachedResult = {
    runId: `media-seed-${Date.now()}`,
    totalDiscoveries: discoveries.length,
    vaultCount,
    showroomCount,
    junkyardCount,
    memoryStreamCount: showroomCount + junkyardCount,
    discoveries,
    completedAt: now,
  };

  // Persist all discoveries to the unified database table (fire-and-forget)
  const seedRunId = _cachedResult.runId;
  ensureSeedRun(seedRunId, 'media', discoveries.length).then(() => {
    const rows = discoveries.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      cjpiScore: d.cjpiScore,
      primitiveChain: d.primitiveChain,
      tier: d.tier,
      route: d.route,
      category: d.category,
      vertical: 'media',
      runId: seedRunId,
    }));
    persistSeedDiscoveries(rows, 'media', seedRunId);
  });

  return _cachedResult;
}

export function getMediaSeedResult(): MediaSeedResult | null {
  return _cachedResult;
}

export function getMediaSeedSummary() {
  const result = seedMediaDiscoveries();
  return {
    total: result.totalDiscoveries,
    vault: result.vaultCount,
    showroom: result.showroomCount,
    junkyard: result.junkyardCount,
    memoryStream: result.memoryStreamCount,
    categories: {
      visual: result.discoveries.filter(d => d.category === 'visual').length,
      audio: result.discoveries.filter(d => d.category === 'audio').length,
      video: result.discoveries.filter(d => d.category === 'video').length,
      copy: result.discoveries.filter(d => d.category === 'copy').length,
      campaign: result.discoveries.filter(d => d.category === 'campaign').length,
      social: result.discoveries.filter(d => d.category === 'social').length,
      brand: result.discoveries.filter(d => d.category === 'brand').length,
      analytics: result.discoveries.filter(d => d.category === 'analytics').length,
    },
  };
}

// (Plan B Step 9: In-memory vault & pool getters removed — DB is source of truth)

export function resetMediaSeed(): void {
  _cachedResult = null;
}
