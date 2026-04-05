/**
 * CMPSBL® Media Vertical Substrate
 * 
 * Subdomain: media.cmpsbl.com
 * 
 * The Media Vertical is purpose-built for creative software that generates
 * music, video, images, text, ads, and social media marketing campaigns.
 * Every primitive maps to a core competency in content creation, distribution,
 * and audience intelligence.
 * 
 * Hot-swapped Engines (8):
 *   CANVAS   — Visual content generation and image synthesis
 *   SCORE    — Music composition, audio synthesis, and sound design
 *   REEL     — Video generation, editing pipelines, and motion graphics
 *   COPY     — Copywriting, ad text, and persuasive content generation
 *   CAMPAIGN — Multi-channel marketing campaign orchestration
 *   FEED     — Social media scheduling, posting, and engagement automation
 *   PALETTE  — Brand identity management, style guides, and design tokens
 *   RENDER   — Real-time media rendering, transcoding, and format conversion
 * 
 * Hot-swapped Agents (8):
 *   CURATOR  — Content curation, trend detection, and editorial strategy
 *   CRITIC   — Quality scoring, A/B variant evaluation, and creative feedback
 *   AMPLIFY  — Distribution optimization, SEO, and reach maximization
 *   PERSONA  — Audience segmentation, persona modeling, and targeting
 *   STORYARC — Narrative structure, content calendars, and storyline coherence
 *   MUSE     — Creative inspiration, prompt engineering, and ideation
 *   COMPLY   — Content moderation, copyright checks, and platform compliance
 *   METRIC   — Analytics, attribution modeling, and ROI measurement
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { MEDIA_CROWN_JEWELS, getMediaJewelsByPrimitive, getMediaJewelSummary } from '@/crownjewels/media-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

/* ─── Media Engines ─── */

const MEDIA_ENGINES: VerticalPrimitive[] = [
  {
    id: 'CANVAS',
    name: 'CANVAS',
    role: 'engine',
    description: 'Visual content generation engine. Powers image synthesis, illustration, photo manipulation, thumbnail creation, and graphic design workflows with style transfer and brand consistency enforcement.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'image_generation',
      'style_transfer',
      'thumbnail_synthesis',
      'graphic_layout',
      'photo_manipulation',
      'brand_visual_enforcement',
      'batch_image_processing',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'SCORE',
    name: 'SCORE',
    role: 'engine',
    description: 'Music composition and audio synthesis engine. Generates original scores, sound effects, background music, podcast intros, and jingles with genre-aware composition and mixing.',
    inherited: false,
    replaces: 'ARCHITECT',
    capabilities: [
      'music_composition',
      'audio_synthesis',
      'sound_design',
      'genre_classification',
      'beat_matching',
      'vocal_processing',
      'audio_mastering',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'REEL',
    name: 'REEL',
    role: 'engine',
    description: 'Video generation and editing pipeline engine. Handles scene composition, motion graphics, subtitle rendering, aspect ratio adaptation, and automated highlight extraction.',
    inherited: false,
    capabilities: [
      'video_generation',
      'scene_composition',
      'motion_graphics',
      'subtitle_rendering',
      'aspect_ratio_adaptation',
      'highlight_extraction',
      'transition_sequencing',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'COPY',
    name: 'COPY',
    role: 'engine',
    description: 'Copywriting and persuasive content generation engine. Produces ad copy, headlines, product descriptions, email sequences, and CTAs with A/B variant generation.',
    inherited: false,
    capabilities: [
      'ad_copy_generation',
      'headline_optimization',
      'product_description',
      'email_sequence_writing',
      'cta_variant_generation',
      'tone_calibration',
      'persuasion_scoring',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'CAMPAIGN',
    name: 'CAMPAIGN',
    role: 'engine',
    description: 'Multi-channel marketing campaign orchestration engine. Plans, executes, and monitors ad campaigns across platforms with budget allocation, bid strategy, and audience targeting.',
    inherited: false,
    capabilities: [
      'campaign_planning',
      'budget_allocation',
      'bid_strategy_optimization',
      'cross_platform_sync',
      'audience_targeting',
      'campaign_scheduling',
      'utm_parameter_management',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'FEED',
    name: 'FEED',
    role: 'engine',
    description: 'Social media scheduling and engagement automation engine. Manages content calendars, optimal posting times, hashtag strategies, and reply automation across social platforms.',
    inherited: false,
    capabilities: [
      'social_scheduling',
      'optimal_timing',
      'hashtag_strategy',
      'engagement_automation',
      'content_calendar',
      'platform_adaptation',
      'comment_moderation',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'PALETTE',
    name: 'PALETTE',
    role: 'engine',
    description: 'Brand identity management engine. Maintains design tokens, color palettes, typography systems, logo usage rules, and brand voice guidelines across all generated content.',
    inherited: false,
    capabilities: [
      'brand_token_management',
      'color_palette_enforcement',
      'typography_system',
      'logo_usage_governance',
      'brand_voice_calibration',
      'style_guide_generation',
      'visual_consistency_audit',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'RENDER',
    name: 'RENDER',
    role: 'engine',
    description: 'Real-time media rendering and transcoding engine. Handles format conversion, resolution scaling, codec optimization, CDN-ready packaging, and batch rendering pipelines.',
    inherited: false,
    capabilities: [
      'format_transcoding',
      'resolution_scaling',
      'codec_optimization',
      'cdn_packaging',
      'batch_rendering',
      'watermark_injection',
      'thumbnail_extraction',
    ],
    weight: 0.015,
    classification: 'active',
  },
];

/* ─── Media Agents ─── */

const MEDIA_AGENTS: VerticalPrimitive[] = [
  {
    id: 'CURATOR',
    name: 'CURATOR',
    role: 'agent',
    description: 'Content curation and trend detection agent. Monitors cultural trends, viral patterns, competitor content strategies, and editorial relevance to inform content creation decisions.',
    inherited: false,
    capabilities: [
      'trend_detection',
      'viral_pattern_analysis',
      'competitor_monitoring',
      'editorial_strategy',
      'content_gap_analysis',
      'seasonal_planning',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'CRITIC',
    name: 'CRITIC',
    role: 'agent',
    description: 'Quality scoring and creative feedback agent. Evaluates generated content against brand standards, audience preferences, and performance benchmarks with actionable improvement suggestions.',
    inherited: false,
    capabilities: [
      'quality_scoring',
      'ab_variant_evaluation',
      'creative_feedback',
      'brand_compliance_check',
      'readability_analysis',
      'visual_quality_assessment',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'AMPLIFY',
    name: 'AMPLIFY',
    role: 'agent',
    description: 'Distribution optimization and reach maximization agent. Optimizes SEO, social sharing, influencer identification, cross-posting strategy, and content syndication.',
    inherited: false,
    capabilities: [
      'seo_optimization',
      'social_sharing_strategy',
      'influencer_identification',
      'cross_posting',
      'content_syndication',
      'backlink_strategy',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'PERSONA',
    name: 'PERSONA',
    role: 'agent',
    description: 'Audience segmentation and persona modeling agent. Builds detailed audience profiles, predicts content preferences, and tailors messaging for maximum resonance.',
    inherited: false,
    capabilities: [
      'audience_segmentation',
      'persona_modeling',
      'preference_prediction',
      'demographic_analysis',
      'psychographic_profiling',
      'lookalike_audience_building',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'STORYARC',
    name: 'STORYARC',
    role: 'agent',
    description: 'Narrative structure and content calendar agent. Maintains storyline coherence across campaigns, plans content arcs, and ensures messaging consistency over time.',
    inherited: false,
    capabilities: [
      'narrative_structure',
      'content_arc_planning',
      'storyline_coherence',
      'messaging_consistency',
      'campaign_storytelling',
      'sequential_content_design',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'MUSE',
    name: 'MUSE',
    role: 'agent',
    description: 'Creative inspiration and ideation agent. Generates creative briefs, brainstorms concepts, suggests prompt variations, and provides artistic direction for content creation.',
    inherited: false,
    capabilities: [
      'creative_brief_generation',
      'concept_brainstorming',
      'prompt_engineering',
      'artistic_direction',
      'mood_board_assembly',
      'reference_sourcing',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'COMPLY',
    name: 'COMPLY',
    role: 'agent',
    description: 'Content moderation and compliance agent. Checks generated content for copyright violations, platform policy compliance, NSFW detection, and advertising regulation adherence.',
    inherited: false,
    capabilities: [
      'copyright_detection',
      'platform_policy_check',
      'nsfw_detection',
      'ad_regulation_compliance',
      'trademark_scanning',
      'content_flagging',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'METRIC',
    name: 'METRIC',
    role: 'agent',
    description: 'Analytics, attribution modeling, and ROI measurement agent. Tracks content performance, calculates customer acquisition cost, and provides data-driven optimization recommendations.',
    inherited: false,
    capabilities: [
      'performance_analytics',
      'attribution_modeling',
      'roi_measurement',
      'cac_calculation',
      'engagement_tracking',
      'conversion_funnel_analysis',
    ],
    weight: 0.020,
    classification: 'passive',
  },
];

/* ─── Public Accessors ─── */

export function getMediaEngines(): VerticalPrimitive[] {
  return [...MEDIA_ENGINES];
}

export function getMediaAgents(): VerticalPrimitive[] {
  return [...MEDIA_AGENTS];
}

export function getMediaPrimitives(): VerticalPrimitive[] {
  return assembleVerticalPrimitives(MEDIA_ENGINES, MEDIA_AGENTS);
}

export function getAllMediaCapabilities(): string[] {
  return [...MEDIA_ENGINES, ...MEDIA_AGENTS].flatMap(p => p.capabilities);
}

export function getMediaCrownJewels(): STierEntry[] {
  return MEDIA_CROWN_JEWELS;
}

export function getMediaPrimitiveCrownJewels(primitiveId: string): STierEntry[] {
  return getMediaJewelsByPrimitive(primitiveId);
}

export function getMediaCrownJewelSummary() {
  return getMediaJewelSummary();
}

export function getMediaCrownJewelCount(): number {
  return MEDIA_CROWN_JEWELS.length;
}

export function getMediaCrownJewelCapabilities(): string[] {
  return MEDIA_CROWN_JEWELS.map(j => j.name);
}

/* ─── Substrate Config ─── */

export function getMediaSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'media-v1',
    name: 'CMPSBL MEDIA™',
    tagline: 'Cognitive Media Infrastructure — Content Creates Itself',
    domain: 'media',
    subdomain: 'media',
    url: 'https://media.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getMediaPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'generative_media_pipelines',
        'multi_modal_content_synthesis',
        'audience_intelligence',
        'campaign_orchestration',
        'brand_consistency_governance',
        'content_compliance_enforcement',
        'performance_attribution',
        'creative_workflow_automation',
      ],
      priorityPrimitives: ['CANVAS', 'SCORE', 'REEL', 'CAMPAIGN'],
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: [
        'image_generation_patterns',
        'video_editing_workflows',
        'music_composition_techniques',
        'ad_copy_optimization',
        'social_media_engagement',
        'brand_identity_enforcement',
        'content_compliance_rules',
        'attribution_models',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'visual_content_hardening',
        'audio_pipeline_protection',
        'campaign_integrity',
        'compliance_enforcement',
        'analytics_pipeline_resilience',
      ],
      cjpiWeights: {
        security: 0.15,
        performance: 0.30,
        reliability: 0.30,
        maintainability: 0.25,
      },
      collisionPriority: ['CANVAS', 'SCORE', 'REEL', 'COPY', 'CAMPAIGN', 'CURATOR', 'CRITIC', 'AMPLIFY'],
    },
    theme: {
      primaryHue: 330,
      icon: 'Clapperboard',
      gradientAngle: 135,
      darkAccent: 'hsl(330 85% 60%)',
      lightAccent: 'hsl(330 70% 50%)',
    },
    createdAt: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-04-05T00:00:00.000Z',
  };
}
