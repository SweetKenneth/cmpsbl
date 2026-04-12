/**
 * CMPSBL MEDIA™ — Creative Content Infrastructure Landing Page
 *
 * Vibrant magenta/purple theme. Creative studio aesthetic.
 * Distinct visual identity for media.cmpsbl.com.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { StructuredData } from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clapperboard, Music, Image, Type, Megaphone, Share2,
  Palette, MonitorPlay, Search, Star, TrendingUp, Users,
  BookOpen, Sparkles, ShieldCheck, BarChart3, Layers, Activity,
  ArrowRight, Target,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useVerticalCounts } from "@/hooks/useDiscoveryCounts";

/* ─── Theme Constants ─── */
const ACCENT = 'hsl(330 85% 60%)';
const ACCENT_GLOW = 'hsl(290 100% 70%)';
const BG_DEEP = 'hsl(330 25% 4%)';
const BG_CARD = 'hsl(330 20% 7%)';
const BORDER = 'hsl(330 15% 14%)';
const TEXT_PRIMARY = 'hsl(330 10% 92%)';
const TEXT_SECONDARY = 'hsl(330 15% 45%)';

const ENGINE_DATA: { id: string; name: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "CANVAS", name: "CANVAS", desc: "Visual generation — image synthesis, style transfer, thumbnails, graphic layout, brand-consistent visuals, batch processing", icon: Image, color: "hsl(330 85% 60%)" },
  { id: "SCORE", name: "SCORE", desc: "Music composition — audio synthesis, sound design, genre-aware composition, beat matching, vocal processing, mastering", icon: Music, color: "hsl(270 85% 60%)" },
  { id: "REEL", name: "REEL", desc: "Video generation — scene composition, motion graphics, subtitles, aspect ratio adaptation, highlight extraction", icon: MonitorPlay, color: "hsl(200 85% 55%)" },
  { id: "COPY", name: "COPY", desc: "Copywriting — ad copy, headlines, product descriptions, email sequences, CTA variants, tone calibration", icon: Type, color: "hsl(45 90% 55%)" },
  { id: "CAMPAIGN", name: "CAMPAIGN", desc: "Campaign orchestration — multi-platform ads, budget allocation, bid strategy, audience targeting, UTM management", icon: Megaphone, color: "hsl(0 80% 55%)" },
  { id: "FEED", name: "FEED", desc: "Social media — scheduling, optimal timing, hashtag strategy, engagement automation, content calendars", icon: Share2, color: "hsl(160 80% 50%)" },
  { id: "PALETTE", name: "PALETTE", desc: "Brand identity — design tokens, color palettes, typography, logo governance, brand voice, style guides", icon: Palette, color: "hsl(290 80% 60%)" },
  { id: "RENDER", name: "RENDER", desc: "Media rendering — format transcoding, resolution scaling, codec optimization, CDN packaging, batch rendering", icon: Clapperboard, color: "hsl(35 85% 55%)" },
];

const AGENT_DATA: { id: string; name: string; desc: string; icon: LucideIcon }[] = [
  { id: "CURATOR", name: "CURATOR", desc: "Trend detection — viral patterns, competitor monitoring, editorial strategy, content gap analysis", icon: Search },
  { id: "CRITIC", name: "CRITIC", desc: "Quality scoring — A/B evaluation, creative feedback, brand compliance, readability analysis", icon: Star },
  { id: "AMPLIFY", name: "AMPLIFY", desc: "Distribution — SEO optimization, influencer discovery, content syndication, social sharing strategy", icon: TrendingUp },
  { id: "PERSONA", name: "PERSONA", desc: "Audience intelligence — segmentation, persona modeling, preference prediction, psychographic profiling", icon: Users },
  { id: "STORYARC", name: "STORYARC", desc: "Narrative structure — content arcs, campaign storytelling, messaging consistency, brand mythology", icon: BookOpen },
  { id: "MUSE", name: "MUSE", desc: "Creative ideation — briefs, concept brainstorming, prompt engineering, artistic direction, mood boards", icon: Sparkles },
  { id: "COMPLY", name: "COMPLY", desc: "Content compliance — copyright detection, platform policy, NSFW filtering, ad regulation, trademark scanning", icon: ShieldCheck },
  { id: "METRIC", name: "METRIC", desc: "Analytics — attribution modeling, ROI measurement, CAC calculation, conversion funnels, performance tracking", icon: BarChart3 },
];

const CREATIVE_DOMAINS = [
  { domain: "Image & Visual Design", primitive: "CANVAS + PALETTE" },
  { domain: "Music & Audio", primitive: "SCORE + RENDER" },
  { domain: "Video Production", primitive: "REEL + CANVAS" },
  { domain: "Ad Copy & Content", primitive: "COPY + MUSE" },
  { domain: "Campaign Management", primitive: "CAMPAIGN + METRIC" },
  { domain: "Social Media", primitive: "FEED + AMPLIFY" },
  { domain: "Brand Governance", primitive: "PALETTE + COMPLY" },
  { domain: "Audience Intelligence", primitive: "PERSONA + CURATOR" },
];

const CROWN_JEWEL_HIGHLIGHTS = [
  "Multi-Modal Image Synthesis Pipeline",
  "Genre-Aware Music Composition Engine",
  "Automated Video Assembly Pipeline",
  "Persuasion-Optimized Ad Copy Generator",
  "Multi-Platform Campaign Orchestrator",
];

export default function MediaHome() {
  useSSORelay();
  const navigate = useNavigate();
  const { total, crownJewels } = useVerticalCounts('media');
  const MEDIA_STATS = [
    { label: "Content Capabilities Active", value: String(total || '110+'), icon: Activity },
    { label: "Media Primitives", value: "16", icon: Layers },
    { label: "Crown Jewels Deployed", value: String(crownJewels || '89'), icon: Sparkles },
    { label: "Creative Domains", value: "8", icon: Target },
  ];

  return (
    <>
      <Helmet>
        <title>CMPSBL MEDIA™ — Cognitive Media & Content Infrastructure</title>
        <meta name="description" content="CMPSBL MEDIA™ — 16 specialized primitives powering AI-driven content creation for music, video, images, ad copy, social media campaigns, and brand management. Content Creates Itself." />
      </Helmet>
      <StructuredData type="webApplication" data={{ name: "CMPSBL MEDIA™", description: "Cognitive media infrastructure — 16 specialized primitives for AI-driven music, video, image, ad copy, and brand management.", url: "https://media.cmpsbl.com", features: "AI Music Production, Video Generation, Image Synthesis, Ad Copy, Social Media Campaigns, Brand Management" }} />

      <VerticalReturnBanner verticalName="CMPSBL MEDIA™" accentColor={ACCENT} />
      <PublicNav />

      <div className="min-h-screen" style={{ background: BG_DEEP }}>
        {/* Hero */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            background: `radial-gradient(ellipse at 50% 0%, ${ACCENT}30 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, ${ACCENT_GLOW}20 0%, transparent 50%)`,
          }} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <Badge className="mb-6 text-xs font-mono px-3 py-1 border-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                COGNITIVE MEDIA INFRASTRUCTURE
              </Badge>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6" style={{ color: TEXT_PRIMARY }}>
                CMPSBL{" "}
                <span style={{ color: ACCENT }}>MEDIA</span>™
              </h1>

              <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-4" style={{ color: TEXT_SECONDARY }}>
                16 specialized primitives powering the complete content lifecycle —
                from ideation to creation, distribution, and measurement.
              </p>

              <p className="text-sm font-mono mb-10" style={{ color: ACCENT }}>
                Content Creates Itself
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="border-0 text-white font-bold" style={{ background: ACCENT }} onClick={() => navigate('/ascension')}>
                  Run Ascension Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="font-bold" style={{ borderColor: BORDER, color: TEXT_PRIMARY }} onClick={() => navigate('/showroom')}>
                  View Showroom
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-t border-b" style={{ borderColor: BORDER }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {MEDIA_STATS.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                  <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: ACCENT }} />
                  <div className="text-2xl font-bold font-mono" style={{ color: TEXT_PRIMARY }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Engines */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Creative Engines</h2>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>8 hot-swapped media engines replacing the standard substrate engines</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {ENGINE_DATA.map((engine, i) => (
                <motion.div key={engine.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="h-full border" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ background: `${engine.color}15` }}>
                          <engine.icon className="h-5 w-5" style={{ color: engine.color }} />
                        </div>
                        <span className="font-mono font-bold text-sm" style={{ color: TEXT_PRIMARY }}>{engine.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: TEXT_SECONDARY }}>{engine.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents */}
        <section className="py-20 border-t" style={{ borderColor: BORDER }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Intelligence Agents</h2>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>8 autonomous agents governing content quality, distribution, and measurement</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {AGENT_DATA.map((agent, i) => (
                <motion.div key={agent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="h-full border" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-5 flex items-start gap-3">
                      <agent.icon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                      <div>
                        <span className="font-mono font-bold text-sm" style={{ color: TEXT_PRIMARY }}>{agent.name}</span>
                        <p className="text-xs leading-relaxed mt-1" style={{ color: TEXT_SECONDARY }}>{agent.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Creative Domains */}
        <section className="py-20 border-t" style={{ borderColor: BORDER }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Creative Domains</h2>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>8 specialized content domains powered by primitive pairs</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CREATIVE_DOMAINS.map((item, i) => (
                <motion.div key={item.domain} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="h-full border text-center" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-5">
                      <div className="font-semibold text-sm mb-2" style={{ color: TEXT_PRIMARY }}>{item.domain}</div>
                      <div className="text-xs font-mono" style={{ color: ACCENT }}>{item.primitive}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Crown Jewel Highlights */}
        <section className="py-20 border-t" style={{ borderColor: BORDER }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Crown Jewel Highlights</h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>89 governor-curated S-Tier capabilities. Here are a few.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {CROWN_JEWEL_HIGHLIGHTS.map(name => (
                <span key={name} className="px-3 py-1.5 rounded-full text-xs font-mono border" style={{ borderColor: BORDER, color: ACCENT, background: `${ACCENT}10` }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t" style={{ borderColor: BORDER }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: TEXT_PRIMARY }}>
              Harden Your Content Pipeline
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              Upload your media generation codebase and let CMPSBL MEDIA™ discover which of the 16 media
              primitives your software needs most. Zero external AI. Pure deterministic analysis.
            </p>
            <Button size="lg" className="border-0 text-white font-bold" style={{ background: ACCENT }} onClick={() => navigate('/ascension')}>
              Start Code Ascension <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      <EnhancedFooter />
    </>
  );
}
