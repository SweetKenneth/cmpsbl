/**
 * Blog — CMPSBL Research & Insights
 * Supreme × Canva inspired layout matching the Composable Artifacts page.
 * Category-first browsing with horizontal-scroll carousels, sticky toolbar,
 * gold/silver border coding for human vs AI posts.
 * Featured posts section + randomized blending of human & auto-blog posts.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Bot, Calendar, Clock,
  User, ChevronRight, ChevronLeft, BookOpen, TrendingUp,
  Shield, Brain, Code, Accessibility, Layers, Eye,
  Filter, X, Package, Unlock, Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import founderPhoto from "@/assets/founder-kenneth-sweet.png";

// Blog post images
import wpBotDefenseImg from "@/assets/blog/wordpress-bot-defense.jpg";
import topSecurityPluginsImg from "@/assets/blog/top-security-plugins-2025.jpg";
import aiCybersecurityImg from "@/assets/blog/ai-cybersecurity-evolution-2025.jpg";
import aiHackersImg from "@/assets/blog/ai-hackers-underground-2025.jpg";
import howPFWorksImg from "@/assets/blog/how-promptfluid-works-cascade.jpg";
import cascadeAIImg from "@/assets/blog/cascade-ai-adaptive-intelligence.jpg";
import cascadeAIBrainImg from "@/assets/blog/cascade-ai-adaptive-brain.jpg";
import pfStudioImg from "@/assets/blog/promptfluid-studio-build-apps.jpg";
import aiTriadImg from "@/assets/blog/ai-triad-intelligent-routing.jpg";
import pfBrainImg from "@/assets/blog/promptfluid-brain-learning-core.jpg";
import pfVisionImg from "@/assets/blog/promptfluid-vision-dashboard.jpg";
import pfDefenseImg from "@/assets/blog/promptfluid-defense-ai-security.jpg";
import pfRippleImg from "@/assets/blog/promptfluid-ripple-network.jpg";
import pfAccessImg from "@/assets/blog/promptfluid-access-identity-billing.jpg";
import pfNexusImg from "@/assets/blog/promptfluid-nexus-api-gateway.jpg";
import aiComparisonImg from "@/assets/blog/ai-product-comparison-2025.jpg";
import marketDisruptorImg from "@/assets/blog/promptfluid-market-disruptor.jpg";
import roadmapImg from "@/assets/blog/product-roadmap-2025.jpg";
import automationTrendsImg from "@/assets/blog/ai-automation-trends-2025.jpg";
import businessOpsImg from "@/assets/blog/ai-business-operations-2025.jpg";
import cmptblMissionImg from "@/assets/blog/cmptbl-mission-accessibility.jpg";
import wpAccessibilityImg from "@/assets/blog/wordpress-accessibility-guide.jpg";
import wcag22Img from "@/assets/blog/wcag-2-2-wordpress-changes.jpg";
import autoAccessibilityImg from "@/assets/blog/automated-accessibility-fixes.jpg";
import accessibilityFreeImg from "@/assets/blog/accessibility-free-for-all.jpg";
import evolvingSoftwareImg from "@/assets/blog/evolving-software-v6-breakthrough.jpg";
import llmsTxtImg from "@/assets/blog/llms-txt-protocol-standard.jpg";
import aiGovernanceImg from "@/assets/blog/ai-governance-namespace-unified.jpg";
import ragWithoutInfraImg from "@/assets/blog/rag-without-infrastructure.jpg";
import agentMemoryAntiPatternsImg from "@/assets/blog/agent-memory-anti-patterns.jpg";
import langchainMemoryImg from "@/assets/blog/langchain-memory-integration.jpg";
import whyAgentsForgetImg from "@/assets/blog/why-agents-forget.jpg";
import buildingAgentsLearnImg from "@/assets/blog/building-agents-that-learn.jpg";
import protocolStandardsImg from "@/assets/blog/ai-protocol-standards-v9.jpg";
import governanceComplianceImg from "@/assets/blog/ai-governance-compliance-v9.jpg";
import threatIntelAdversarialImg from "@/assets/blog/ai-threat-intel-adversarial-v9.jpg";
import spartaRebuildImg from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";

// New pillar/cluster images
import clocklessSetupImg from "@/assets/blog/clockless-account-setup-artifact-packs.jpg";
import clocklessDifferentImg from "@/assets/blog/what-makes-clockless-different.jpg";
import clocklessModulesImg from "@/assets/blog/clockless-modules-deep-dive.jpg";

// Memory Stream series images
import memoryStreamGuideImg from "@/assets/blog/memory-stream-crystallization-guide.jpg";
import signalToSiliconImg from "@/assets/blog/signal-to-silicon-narrative.jpg";
import tierAnatomyImg from "@/assets/blog/memory-stream-tier-anatomy.jpg";
import vaultMasteryImg from "@/assets/blog/memory-stream-vault-mastery.jpg";
import discoveryEngineImg from "@/assets/blog/autonomous-discovery-engine.jpg";

// AutoBlog images
import autoblog1 from '@/assets/autoblog/autoblog-1.jpg';
import autoblog2 from '@/assets/autoblog/autoblog-2.jpg';
import autoblog3 from '@/assets/autoblog/autoblog-3.jpg';
import autoblog4 from '@/assets/autoblog/autoblog-4.jpg';
import autoblog5 from '@/assets/autoblog/autoblog-5.jpg';
import autoblog6 from '@/assets/autoblog/autoblog-6.jpg';
import autoblog7 from '@/assets/autoblog/autoblog-7.jpg';
import autoblog8 from '@/assets/autoblog/autoblog-8.jpg';

import autoblog9 from '@/assets/autoblog/autoblog-9.jpg';
import autoblog10 from '@/assets/autoblog/autoblog-10.jpg';
import autoblog11 from '@/assets/autoblog/autoblog-11.jpg';
import autoblog12 from '@/assets/autoblog/autoblog-12.jpg';
import autoblog13 from '@/assets/autoblog/autoblog-13.jpg';
import autoblog14 from '@/assets/autoblog/autoblog-14.jpg';
import autoblog15 from '@/assets/autoblog/autoblog-15.jpg';
import autoblog16 from '@/assets/autoblog/autoblog-16.jpg';
import autoblog17 from '@/assets/autoblog/autoblog-17.jpg';
import autoblog18 from '@/assets/autoblog/autoblog-18.jpg';
import autoblog19 from '@/assets/autoblog/autoblog-19.jpg';
import autoblog20 from '@/assets/autoblog/autoblog-20.jpg';

const AUTOBLOG_IMAGES = [autoblog1, autoblog2, autoblog3, autoblog4, autoblog5, autoblog6, autoblog7, autoblog8, autoblog9, autoblog10, autoblog11, autoblog12, autoblog13, autoblog14, autoblog15, autoblog16, autoblog17, autoblog18, autoblog19, autoblog20];

function getAutoblogImage(postId: string): string {
  const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AUTOBLOG_IMAGES[hash % AUTOBLOG_IMAGES.length];
}

// Fisher-Yates shuffle for randomized display
function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Types ───
type PostSource = 'human' | 'ai';
type SourceFilter = 'all' | 'human' | 'ai';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  source: PostSource;
  featured?: boolean;
  pillar?: boolean;
  author: string;
  authorRole: string;
}

// ─── Category config (matching SubstrateStore style) ───
const BLOG_CATEGORIES = [
  { id: 'Security', label: 'Security', icon: Shield, color: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/30', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'AI Technology', label: 'AI Technology', icon: Brain, color: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  { id: 'Technology', label: 'Technology', icon: Code, color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'Platform', label: 'Platform', icon: Layers, color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'Research', label: 'Research', icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'Development', label: 'Development', icon: Code, color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'Accessibility', label: 'Accessibility', icon: Accessibility, color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'Protocol', label: 'Protocol', icon: BookOpen, color: 'from-pink-500/20 to-pink-600/5', border: 'border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'Governance', label: 'Governance', icon: Eye, color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/30', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'Threat Intel', label: 'Threat Intel', icon: Shield, color: 'from-red-500/20 to-red-600/5', border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'AI Security', label: 'AI Security', icon: Shield, color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/10' },
] as const;

// ─── Horizontal Scroll Carousel (same as SubstrateStore) ───
function ScrollCarousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.7;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={cn("group relative", className)}>
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Blog Post Card (carousel-sized, Supreme card style) ───
function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const isHuman = post.source === 'human';
  return (
    <div
      className={cn(
        "snap-start shrink-0 w-[300px] min-h-[340px]",
        "rounded-xl border bg-gradient-to-br overflow-hidden",
        "hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer",
        "flex flex-col",
        isHuman
          ? "border-amber-500/20 from-amber-500/[0.04] to-transparent"
          : "border-slate-400/20 from-slate-400/[0.04] to-transparent",
      )}
      onClick={onClick}
    >
      {/* Top accent bar */}
      <div className={cn(
        "h-1 w-full",
        isHuman
          ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"
          : "bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500"
      )} />

      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={post.image}
          alt={post.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Source badge */}
        <div className="absolute top-2.5 right-2.5">
          <Badge className={cn(
            "text-[10px] font-bold backdrop-blur-md border",
            isHuman
              ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
              : "bg-slate-400/20 text-slate-200 border-slate-300/40"
          )}>
            {isHuman ? <User className="w-2.5 h-2.5 mr-1" /> : <Bot className="w-2.5 h-2.5 mr-1" />}
            {isHuman ? 'Kenneth' : 'AI'}
          </Badge>
        </div>
        {/* Category badge */}
        <div className="absolute bottom-2.5 left-2.5">
          <Badge variant="outline" className="text-[10px] bg-black/40 text-white border-white/20 backdrop-blur-md">
            {post.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm leading-snug mb-1.5 line-clamp-2">{post.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{post.excerpt}</p>

        {/* Author & meta footer */}
        <div className="flex items-center gap-2.5">
          {isHuman ? (
            <img src={founderPhoto} alt={post.author} className="w-6 h-6 rounded-full object-cover ring-2 ring-amber-500/30" loading="lazy" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-500/20 border border-slate-400/30 flex items-center justify-center">
              <Bot className="w-3 h-3 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium truncate">{post.author}</p>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              <span>·</span>
              <Clock className="w-2.5 h-2.5" />
              {post.readTime}
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>
    </div>
  );
}

// ─── Grid Card (for grid view) ───
function GridPostCard({ post, index }: { post: BlogPost; index: number }) {
  const isHuman = post.source === 'human';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link to={post.href}>
        <div className={cn(
          "group h-full rounded-xl border overflow-hidden transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-xl",
          isHuman
            ? "border-amber-500/25 hover:border-amber-400/50 hover:shadow-amber-500/10"
            : "border-slate-400/25 hover:border-slate-300/50 hover:shadow-slate-400/10",
          "bg-card"
        )}>
          <div className={cn(
            "h-[3px] w-full",
            isHuman
              ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"
              : "bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500"
          )} />

          <div className="aspect-[16/10] overflow-hidden relative">
            <img src={post.image} alt={post.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge className={cn(
                "text-[10px] font-bold backdrop-blur-md border",
                isHuman ? "bg-amber-500/20 text-amber-200 border-amber-400/40" : "bg-slate-400/20 text-slate-200 border-slate-300/40"
              )}>
                {isHuman ? <User className="w-2.5 h-2.5 mr-1" /> : <Bot className="w-2.5 h-2.5 mr-1" />}
                {isHuman ? (post.author || 'CMPSBL Team') : 'AI Generated'}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <Badge variant="outline" className="text-[10px] bg-black/40 text-white border-white/20 backdrop-blur-md">{post.category}</Badge>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
            <div className="flex items-center gap-3">
              {isHuman ? (
                <img src={founderPhoto} alt={post.author} className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-500/30" loading="lazy" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-500/20 border border-slate-400/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{post.author}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Featured Post Card (larger, more prominent) ───
function FeaturedPostCard({ post }: { post: BlogPost }) {
  const isHuman = post.source === 'human';
  return (
    <Link to={post.href}>
      <div className={cn(
        "group relative rounded-2xl border-2 overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl",
        post.pillar
          ? "border-primary/40 hover:border-primary/60 hover:shadow-primary/20"
          : "border-amber-500/30 hover:border-amber-400/50 hover:shadow-amber-500/10",
        "bg-card"
      )}>
        <div className="aspect-[16/9] overflow-hidden relative">
          <img src={post.image} alt={post.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {post.pillar && (
              <Badge className="bg-primary/30 text-primary-foreground border-primary/40 backdrop-blur-md text-xs font-bold">
                <Star className="w-3 h-3 mr-1" />Pillar Guide
              </Badge>
            )}
            <Badge variant="outline" className="text-xs bg-black/40 text-white border-white/20 backdrop-blur-md">{post.category}</Badge>
          </div>

          <div className="absolute top-4 right-4">
            <Badge className={cn(
              "text-xs font-bold backdrop-blur-md border",
              isHuman ? "bg-amber-500/20 text-amber-200 border-amber-400/40" : "bg-slate-400/20 text-slate-200 border-slate-300/40"
            )}>
              {isHuman ? <User className="w-3 h-3 mr-1" /> : <Bot className="w-3 h-3 mr-1" />}
              {isHuman ? (post.author || 'CMPSBL Team') : 'AI Generated'}
            </Badge>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-bold text-xl md:text-2xl text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
            <p className="text-sm text-white/80 line-clamp-2 mb-3">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Static human posts ───
const HUMAN_POSTS: BlogPost[] = [
  // ═══ MEMORY STREAM SERIES (FEATURED) ═══
  {
    id: 'ms-crystallization-guide', title: "Memory Stream: The Complete Crystallization Guide",
    excerpt: "Everything you need to know about the Memory Stream — crystallization phases, five quality tiers, your personal Vault, and exporting pipelines as production-grade JSON artifacts.",
    href: "/blog/memory-stream-crystallization-guide", category: "Platform",
    date: "2026-03-04", readTime: "24 min", image: memoryStreamGuideImg,
    imageAlt: "Crystalline data pipelines materializing from a flowing digital memory stream",
    source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ms-signal-silicon', title: "Signal → Silicon: How Raw Signals Become Crystallized Software",
    excerpt: "The complete narrative behind CMPSBL's Signal → Silicon pipeline — from behavioral signals through 38-node processing to physical silicon.",
    href: "/blog/signal-to-silicon-narrative", category: "Research",
    date: "2026-03-04", readTime: "20 min", image: signalToSiliconImg,
    imageAlt: "Digital signals flowing through neural pathways and condensing into a silicon microprocessor",
    source: 'human', featured: true, pillar: true, author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'ms-tier-anatomy', title: "Anatomy of Memory Stream Tiers: Rarity, Scoring & What Each Tier Means",
    excerpt: "A deep breakdown of Mint, Prime, Relic, Mythic, and Apex tiers — the weighted rarity system, scoring dimensions, and what makes each tier special.",
    href: "/blog/memory-stream-tier-anatomy-rarity", category: "Platform",
    date: "2026-03-04", readTime: "18 min", image: tierAnatomyImg,
    imageAlt: "Five quality tier crystals in ascending pyramid from green Mint to diamond Apex",
    source: 'human', featured: true, author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'ms-vault-mastery', title: "Your Vault: Mastering Pipeline Management in the Memory Stream",
    excerpt: "How to manage, organize, and export your crystallized pipelines — from auto-save mechanics to JSON materialization and tier-based analytics.",
    href: "/blog/memory-stream-vault-mastery", category: "Platform",
    date: "2026-03-04", readTime: "16 min", image: vaultMasteryImg,
    imageAlt: "Digital vault with crystallized software artifacts organized by tier on illuminated shelves",
    source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ms-discovery-engine', title: "Inside the Autonomous Discovery Engine: How CMPSBL Finds Software",
    excerpt: "A technical deep-dive into the engine that powers the Memory Stream — sampling, scoring across five dimensions, weighted tier selection, and the recursive discovery loop.",
    href: "/blog/autonomous-discovery-engine-architecture", category: "Technology",
    date: "2026-03-04", readTime: "22 min", image: discoveryEngineImg,
    imageAlt: "Autonomous discovery engine with recursive orbital loops around a central processing core",
    source: 'human', featured: true, pillar: true, author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  // ═══ NEW PILLAR/CLUSTER POSTS ═══
  {
    id: 'clockless-setup', title: "Getting Started with Clockless: Account Setup & Artifact Pack Guide",
    excerpt: "Everything you need to set up your Clockless account and choose the right artifact pack. Understand what composable cognitive infrastructure gives you that no other platform can.",
    href: "/blog/clockless-account-setup-artifact-packs", category: "Platform",
    date: "2026-02-27", readTime: "18 min", image: clocklessSetupImg,
    imageAlt: "Clockless account setup dashboard showing artifact pack selection wizard",
    source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'clockless-different', title: "What Makes Clockless Different — And Why People Build on It",
    excerpt: "There are dozens of AI platforms. Most sell model access. Clockless sells infrastructure that thinks. Here's why that matters.",
    href: "/blog/clockless-what-makes-it-different", category: "Platform",
    date: "2026-02-27", readTime: "8 min", image: clocklessDifferentImg,
    imageAlt: "Composable cognitive infrastructure platform with interconnected systems",
    source: 'human', featured: true, author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'clockless-modules', title: "Inside the Systems: What Makes Each One Special",
    excerpt: "A deep dive into every substrate system — from MEMORY's three-tier persistence to EVOLUTION's autonomous self-improvement.",
    href: "/blog/clockless-modules-deep-dive", category: "Technology",
    date: "2026-02-27", readTime: "12 min", image: clocklessModulesImg,
    imageAlt: "Grid of glowing AI substrate systems with unique identities",
    source: 'human', featured: true, author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  // ═══ EXISTING POSTS ═══
  {
    id: 'sparta-rebuild', title: "Burning It Down to Build It Right: The Full Substrate Rebuild",
    excerpt: "How we refactored, consolidated, and rebuilt the entire CMPSBL cognitive substrate from the ground up — deleting thousands of lines of dead code and emerging with a production-grade layered kernel.",
    href: "/blog/sparta-epoch-rebuild-from-scratch", category: "Technology",
    date: "2026-02-24", readTime: "22 min", image: spartaRebuildImg,
    imageAlt: "Architectural blueprint showing old structures crumbling and new layered architecture rising",
    source: 'human', featured: true, pillar: true, author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'protocol-v9-standards', title: "Machine-to-Machine Protocol Standards in the CMPSBL Substrate",
    excerpt: "How the RELAY and IDENTITY systems establish a unified protocol layer for autonomous agent communication.",
    href: "/blog/machine-protocol-standards-architect-epoch", category: "Protocol",
    date: "2026-02-10", readTime: "16 min", image: protocolStandardsImg,
    imageAlt: "AI protocol standards visualization",
    source: 'human', featured: true, pillar: true, author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'governance-compliance-v9', title: "Autonomous AI Governance: From Theory to Runtime Enforcement",
    excerpt: "The AUDIT and IDENTITY systems bring cryptographic compliance logging and universal actor attribution to autonomous systems.",
    href: "/blog/autonomous-ai-governance-runtime-enforcement", category: "Governance",
    date: "2026-02-08", readTime: "14 min", image: governanceComplianceImg,
    imageAlt: "AI governance compliance framework",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'adversarial-threat-v9', title: "Adversarial AI in 2026: The DEFENSE System's Response",
    excerpt: "Inside the prompt injection countermeasures, behavioral fingerprinting, and zero-trust mesh that protect the substrate.",
    href: "/blog/adversarial-ai-defense-module-response-2026", category: "Threat Intel",
    date: "2026-02-06", readTime: "18 min", image: threatIntelAdversarialImg,
    imageAlt: "Adversarial AI threat intelligence",
    source: 'human', author: "James Whitfield", authorRole: "Security Researcher",
  },
  {
    id: 'evolving-software', title: "Evolving Software: The Breakthrough",
    excerpt: "CMPSBL represents a paradigm shift—systems that learn, adapt, and evolve autonomously. Now available via API.",
    href: "/blog/evolving-software-v6-breakthrough", category: "Technology",
    date: "2026-01-30", readTime: "22 min", image: evolvingSoftwareImg,
    imageAlt: "Digital DNA helix representing evolving software systems",
    source: 'human', featured: true, pillar: true, author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'rag-infra', title: "RAG Without Infrastructure",
    excerpt: "Ship retrieval-augmented generation without managing vector databases.",
    href: "/blog/rag-without-infrastructure", category: "Development",
    date: "2026-01-28", readTime: "14 min", image: ragWithoutInfraImg,
    imageAlt: "RAG document network visualization",
    source: 'human', featured: true, author: "Priya Nakamura", authorRole: "Junior Developer & DevOps",
  },
  {
    id: 'agent-anti', title: "Agent Memory Anti-Patterns",
    excerpt: "Common mistakes that cause AI agents to lose context and how to avoid them.",
    href: "/blog/agent-memory-anti-patterns", category: "Development",
    date: "2026-01-26", readTime: "12 min", image: agentMemoryAntiPatternsImg,
    imageAlt: "Memory anti-patterns warning visualization",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'langchain', title: "LangChain Memory Integration",
    excerpt: "Add persistent memory to your LangChain agents in under an hour.",
    href: "/blog/langchain-memory-integration", category: "Development",
    date: "2026-01-24", readTime: "15 min", image: langchainMemoryImg,
    imageAlt: "LangChain memory integration",
    source: 'human', author: "Priya Nakamura", authorRole: "Junior Developer & DevOps",
  },
  {
    id: 'agents-forget', title: "Why Agents Forget",
    excerpt: "The technical reasons behind context loss and memory degradation in AI systems.",
    href: "/blog/why-agents-forget", category: "Research",
    date: "2026-01-22", readTime: "11 min", image: whyAgentsForgetImg,
    imageAlt: "Agent memory fading visualization",
    source: 'human', pillar: true, author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'building-agents', title: "Building Agents That Learn",
    excerpt: "Architectural patterns for AI systems that improve through experience.",
    href: "/blog/building-agents-that-learn", category: "Development",
    date: "2026-01-20", readTime: "18 min", image: buildingAgentsLearnImg,
    imageAlt: "Agents learning and evolving",
    source: 'human', author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'llms-txt', title: "LLMs.txt: The Protocol for AI Context",
    excerpt: "How we follow the llmstxt.org protocol and why we recommend adoption as a standard for AI-human interaction.",
    href: "/blog/llms-txt-protocol-ai-context", category: "Protocol",
    date: "2026-01-30", readTime: "14 min", image: llmsTxtImg,
    imageAlt: "Visualization of LLMs.txt protocol structure",
    source: 'human', author: "Elena Vasquez", authorRole: "VP of Communications",
  },
  {
    id: 'governance', title: "AI Governance Namespace: Unified Terminology",
    excerpt: "How we established unified AI governance vocabulary through strategic domain registration.",
    href: "/blog/ai-governance-namespace-unified-terminology", category: "Governance",
    date: "2026-01-30", readTime: "12 min", image: aiGovernanceImg,
    imageAlt: "Network visualization of AI governance terminology",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'inclusive', title: "INCLUSIVE System Mission",
    excerpt: "Our commitment to making the web accessible through AI-powered automation.",
    href: "/blog/inclusive-module-accessibility-mission", category: "Accessibility",
    date: "2025-11-20", readTime: "8 min", image: cmptblMissionImg,
    imageAlt: "Accessibility mission statement",
    source: 'human', author: "Priya Nakamura", authorRole: "Junior Developer & DevOps",
  },
  {
    id: 'free-access', title: "Accessibility for Everyone",
    excerpt: "Why web accessibility matters and how AI can help achieve it at scale.",
    href: "/blog/accessibility-free-for-all", category: "Accessibility",
    date: "2025-10-18", readTime: "9 min", image: accessibilityFreeImg,
    imageAlt: "Universal accessibility network",
    source: 'human', author: "Elena Vasquez", authorRole: "VP of Communications",
  },
  {
    id: 'wp-access', title: "WordPress Accessibility Guide",
    excerpt: "Complete guide to making your WordPress site WCAG compliant.",
    href: "/blog/wordpress-accessibility-guide", category: "Accessibility",
    date: "2025-09-15", readTime: "16 min", image: wpAccessibilityImg,
    imageAlt: "WordPress accessibility checklist",
    source: 'human', author: "Priya Nakamura", authorRole: "Junior Developer & DevOps",
  },
  {
    id: 'wcag', title: "WCAG 2.2 Changes for WordPress",
    excerpt: "What the latest WCAG updates mean for WordPress developers.",
    href: "/blog/wcag-2-2-wordpress-changes", category: "Accessibility",
    date: "2025-08-12", readTime: "12 min", image: wcag22Img,
    imageAlt: "WCAG 2.2 standards visualization",
    source: 'human', author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'auto-access', title: "Automated Accessibility Fixes",
    excerpt: "AI-powered remediation for common WordPress accessibility issues.",
    href: "/blog/automated-accessibility-fixes-wordpress", category: "Accessibility",
    date: "2025-07-10", readTime: "10 min", image: autoAccessibilityImg,
    imageAlt: "Automated accessibility repair",
    source: 'human', author: "Priya Nakamura", authorRole: "Junior Developer & DevOps",
  },
  {
    id: 'ai-dream', title: "Experimental AI Systems That Dream",
    excerpt: "Cascade and SimNap explore autonomous dreaming, reflection, and self-improvement.",
    href: "/blog/ai-systems-that-dream-press-release", category: "Research",
    date: "2025-12-18", readTime: "6 min", image: cascadeAIImg,
    imageAlt: "Cascade AI autonomous dreaming system",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'bot-defense', title: "WordPress Bot Defense Guide",
    excerpt: "Protect your site from sophisticated bot attacks with AI-powered behavioral analysis.",
    href: "/blog/wordpress-bot-defense", category: "Security",
    date: "2025-11-15", readTime: "15 min", image: wpBotDefenseImg,
    imageAlt: "WordPress security with AI protection",
    source: 'human', pillar: true, author: "James Whitfield", authorRole: "Security Researcher",
  },
  {
    id: 'sec-plugins', title: "Top Security Plugins 2025",
    excerpt: "Comprehensive comparison of WordPress security plugins and AI-powered defense.",
    href: "/blog/top-security-plugins-2025", category: "Security",
    date: "2025-10-10", readTime: "12 min", image: topSecurityPluginsImg,
    imageAlt: "WordPress security plugins comparison",
    source: 'human', author: "James Whitfield", authorRole: "Security Researcher",
  },
  {
    id: 'cyber-evo', title: "AI Cybersecurity Evolution",
    excerpt: "How artificial intelligence is revolutionizing predictive threat detection.",
    href: "/blog/ai-cybersecurity-evolution-2025", category: "AI Security",
    date: "2025-09-08", readTime: "10 min", image: aiCybersecurityImg,
    imageAlt: "AI cybersecurity evolution",
    source: 'human', author: "James Whitfield", authorRole: "Security Researcher",
  },
  {
    id: 'hackers', title: "AI Hackers Underground",
    excerpt: "Inside look at how malicious actors weaponize AI for sophisticated attacks.",
    href: "/blog/ai-hackers-underground-2025", category: "Threat Intel",
    date: "2025-08-05", readTime: "14 min", image: aiHackersImg,
    imageAlt: "AI-powered cyber threats",
    source: 'human', author: "James Whitfield", authorRole: "Security Researcher",
  },
  {
    id: 'pf-works', title: "How CMPSBL Works",
    excerpt: "Deep dive: dream cycles, neural orchestration, and experimental AI concepts.",
    href: "/blog/how-promptfluid-works-cascade-ai-ecosystem", category: "Technology",
    date: "2025-07-10", readTime: "18 min", image: howPFWorksImg,
    imageAlt: "CMPSBL cognitive AI ecosystem",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'cascade', title: "Cascade AI: Adaptive Intelligence",
    excerpt: "How autonomous dream cycles enable continuous learning and reflection.",
    href: "/blog/cascade-ai-adaptive-intelligence-brain", category: "AI Technology",
    date: "2025-06-08", readTime: "16 min", image: cascadeAIBrainImg,
    imageAlt: "Adaptive AI brain in dream state",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'studio', title: "CMPSBL Studio",
    excerpt: "AI-assisted development platform generating production-ready code.",
    href: "/blog/promptfluid-studio-build-apps-that-think", category: "Development",
    date: "2025-05-05", readTime: "13 min", image: pfStudioImg,
    imageAlt: "AI-powered app development studio",
    source: 'human', author: "Priya Nakamura", authorRole: "Junior Developer & DevOps",
  },
  {
    id: 'triad', title: "Free-Tier AI Routing",
    excerpt: "Multi-provider gateway optimized for cost and performance.",
    href: "/blog/ai-triad-intelligent-routing", category: "Technology",
    date: "2025-04-02", readTime: "11 min", image: aiTriadImg,
    imageAlt: "AI network routing visualization",
    source: 'human', author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'brain', title: "Adaptive Learning Core",
    excerpt: "Machine learning engine powering behavioral analysis and threat intelligence.",
    href: "/blog/promptfluid-brain-adaptive-learning-core", category: "AI Technology",
    date: "2025-03-28", readTime: "15 min", image: pfBrainImg,
    imageAlt: "Machine learning brain core",
    source: 'human', author: "Dr. Sarah Chen", authorRole: "Head of AI Research",
  },
  {
    id: 'vision', title: "Unified Dashboard Guide",
    excerpt: "Central command for monitoring AI orchestration and analytics.",
    href: "/blog/promptfluid-vision-unified-dashboard", category: "Platform",
    date: "2025-03-25", readTime: "12 min", image: pfVisionImg,
    imageAlt: "Unified command center dashboard",
    source: 'human', author: "Marcus Rodriguez", authorRole: "Senior Systems Engineer",
  },
  {
    id: 'defense', title: "AI Security Deep Dive",
    excerpt: "Advanced bot detection, behavioral fingerprinting, and adaptive security.",
    href: "/blog/promptfluid-defense-ai-security", category: "Security",
    date: "2025-03-22", readTime: "14 min", image: pfDefenseImg,
    imageAlt: "AI security defense system",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'ripple', title: "Ripple Network Integration",
    excerpt: "Distributed AI coordination and multi-agent communication patterns.",
    href: "/blog/promptfluid-ripple-network-integration", category: "Technology",
    date: "2025-03-20", readTime: "12 min", image: pfRippleImg,
    imageAlt: "Ripple network distributed AI",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'access', title: "Access: Identity & Billing",
    excerpt: "Enterprise-grade authentication, API metering, and subscription management.",
    href: "/blog/promptfluid-access-identity-billing", category: "Platform",
    date: "2025-03-18", readTime: "10 min", image: pfAccessImg,
    imageAlt: "Identity and billing platform",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'nexus', title: "Nexus API Gateway",
    excerpt: "Unified API orchestration layer connecting AI services and applications.",
    href: "/blog/promptfluid-nexus-api-gateway", category: "Technology",
    date: "2025-03-15", readTime: "11 min", image: pfNexusImg,
    imageAlt: "Nexus API gateway architecture",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'comparison', title: "AI Product Comparison 2025",
    excerpt: "How CMPSBL compares to OpenAI, Anthropic, and other AI platforms.",
    href: "/blog/ai-product-comparison-2025", category: "Research",
    date: "2025-06-12", readTime: "18 min", image: aiComparisonImg,
    imageAlt: "AI product comparison chart",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'disruptor', title: "CMPSBL Market Disruptor",
    excerpt: "How cognitive infrastructure is reshaping the AI landscape.",
    href: "/blog/promptfluid-market-disruptor", category: "Research",
    date: "2025-05-08", readTime: "14 min", image: marketDisruptorImg,
    imageAlt: "Market disruption visualization",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'roadmap', title: "Product Roadmap 2025",
    excerpt: "Our vision for the next year of cognitive infrastructure development.",
    href: "/blog/product-roadmap-2025", category: "Platform",
    date: "2025-04-01", readTime: "10 min", image: roadmapImg,
    imageAlt: "Product roadmap timeline",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'automation', title: "AI Automation Trends 2025",
    excerpt: "Key trends shaping enterprise AI automation and orchestration.",
    href: "/blog/ai-automation-trends-2025", category: "Research",
    date: "2025-04-06", readTime: "12 min", image: automationTrendsImg,
    imageAlt: "AI automation trends visualization",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'biz-ops', title: "AI Business Operations",
    excerpt: "Transforming enterprise workflows with cognitive automation.",
    href: "/blog/ai-business-operations-2025", category: "Research",
    date: "2025-04-04", readTime: "11 min", image: businessOpsImg,
    imageAlt: "AI business operations dashboard",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
];

// ─── Main Blog Page ───
export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [viewMode, setViewMode] = useState<'browse' | 'grid'>('browse');
  const [autoPosts, setAutoPosts] = useState<BlogPost[]>([]);

  // Fetch auto-generated posts from DB
  useEffect(() => {
    const fetchAutoPosts = async () => {
      const { data } = await supabase
        .from("auto_blog_posts")
        .select("id, title, slug, excerpt, category, published_at, author_name, author_role")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

      if (data) {
        setAutoPosts(data.map(p => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || "AI-generated insight from the CMPSBL Substrate.",
          href: `/blog/auto/${p.slug}`,
          category: p.category || "AI Technology",
          date: p.published_at || new Date().toISOString(),
          readTime: "5 min",
          image: getAutoblogImage(p.id),
          imageAlt: p.title,
          source: 'ai' as PostSource,
          author: p.author_name || "CMPSBL Substrate",
          authorRole: p.author_role || "Autonomous AI",
        })));
      }
    };
    fetchAutoPosts();
  }, []);

  // Featured posts — the 3 new posts plus top pillars
  const featuredPosts = useMemo(() => {
    const featured = HUMAN_POSTS.filter(p => p.featured);
    return featured.slice(0, 6);
  }, []);

  // Blend all posts and RANDOMIZE within categories for freshness
  const allPosts = useMemo(() => {
    const merged = [...HUMAN_POSTS, ...autoPosts];
    return shuffle(merged);
  }, [autoPosts]);

  // Filter
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!post.title.toLowerCase().includes(q) && !post.excerpt.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory && post.category !== selectedCategory) return false;
      if (sourceFilter === 'human' && post.source !== 'human') return false;
      if (sourceFilter === 'ai' && post.source !== 'ai') return false;
      return true;
    });
  }, [allPosts, searchQuery, selectedCategory, sourceFilter]);

  // Group by category for browse mode — randomized within each category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, BlogPost[]> = {};
    filteredPosts.forEach(post => {
      if (!groups[post.category]) groups[post.category] = [];
      groups[post.category].push(post);
    });
    return groups;
  }, [filteredPosts]);

  const totalCount = allPosts.length;
  const humanCount = allPosts.filter(p => p.source === 'human').length;
  const aiCount = allPosts.filter(p => p.source === 'ai').length;

  return (
    <>
      <SEO
        title="Blog — AI Research & Engineering | CMPSBL"
        description="Research, deep-dives, and engineering insights on cognitive infrastructure, persistent memory, agentic AI, and composable systems."
        canonical="https://cmpsbl.com/blog"
        image="https://cmpsbl.com/og/blog.jpg"
        keywords={['CMPSBL blog', 'AI infrastructure research', 'cognitive AI insights', 'persistent memory AI', 'agentic AI engineering']}
      />

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        {/* ═══ HERO — Supreme drop announcement style ═══ */}
        <section className="relative overflow-hidden border-b border-border/50">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

          <div className="relative container mx-auto px-4 py-14 md:py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Top pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 mb-6 text-xs font-medium text-muted-foreground">
                <BookOpen className="w-3 h-3 text-primary" />
                HUMAN + AI AUTHORED
              </div>

              {/* Supreme-style stacked type */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-4">
                <motion.span
                  className="block font-mono uppercase tracking-[-0.05em]"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Research
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-primary via-[hsl(var(--neon-cyan))] to-primary bg-clip-text text-transparent font-mono uppercase tracking-[-0.05em]"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  & Insights
                </motion.span>
              </h1>

              {/* Animated counter badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4, type: 'spring' }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <motion.span className="font-mono font-black text-2xl sm:text-3xl text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  {totalCount}+
                </motion.span>
                <span className="text-sm text-muted-foreground font-medium">Articles</span>
              </motion.div>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Written by the CMPSBL team and generated by the CMPSBL Substrate.
                Documentation of what we're building and where the field is headed.
              </p>

              {/* Stats pills — matching SubstrateStore */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { label: 'by Team', count: String(humanCount), dotClass: 'bg-gradient-to-r from-amber-500 to-yellow-400' },
                  { label: 'AI Generated', count: String(aiCount), dotClass: 'bg-gradient-to-r from-slate-400 to-slate-300' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className={cn("w-4 h-[3px] rounded", stat.dotClass)} />
                    <span className="font-black text-lg">{stat.count}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ FEATURED POSTS ═══ */}
        <section className="border-b border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Featured</h2>
                <p className="text-xs text-muted-foreground">Essential reads from the CMPSBL research lab</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STICKY TOOLBAR ═══ */}
        <section className="sticky top-16 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${totalCount}+ articles...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-card border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted" aria-label="Clear search">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Source filter tabs + view toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {([
                  { id: 'all' as SourceFilter, label: 'All', count: totalCount },
                  { id: 'human' as SourceFilter, label: 'Kenneth', count: humanCount },
                  { id: 'ai' as SourceFilter, label: 'AI Generated', count: aiCount },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSourceFilter(tab.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      sourceFilter === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="hidden md:flex gap-1 shrink-0">
                <button
                  onClick={() => setViewMode('browse')}
                  className={cn("p-2 rounded-lg transition-colors", viewMode === 'browse' ? 'bg-muted' : 'hover:bg-muted/50')}
                  title="Category browse"
                  aria-label="Category browse view"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50')}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category pills — horizontal scroll */}
          <div className="border-t border-border/30">
            <div className="container mx-auto px-4 py-2.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pr-8" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0",
                    !selectedCategory
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  All Categories
                </button>
                {BLOG_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const hasItems = !!groupedByCategory[cat.id]?.length;
                  if (!hasItems && selectedCategory !== cat.id) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all shrink-0 flex items-center gap-1.5",
                        selectedCategory === cat.id
                          ? cn(cat.bg, cat.text, cat.border)
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CONTENT ═══ */}
        <main className="flex-1">
          {/* Results count */}
          <div className="container mx-auto px-4 pt-6 pb-2">
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} articles
              {searchQuery && <> matching "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
            </p>
          </div>

          {/* Browse Mode: Horizontal carousels per category (mobile-first) */}
          {(viewMode === 'browse' && !searchQuery && !selectedCategory) ? (
            <div className="pb-12">
              {BLOG_CATEGORIES.filter(cat => groupedByCategory[cat.id]?.length).map(cat => {
                const items = groupedByCategory[cat.id] || [];
                const Icon = cat.icon;

                return (
                  <section key={cat.id} className="mb-8">
                    {/* Category header */}
                    <div className="container mx-auto px-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.bg)}>
                            <Icon className={cn("w-4 h-4", cat.text)} />
                          </div>
                          <div>
                            <h2 className="font-bold text-lg">{cat.label}</h2>
                            <p className="text-xs text-muted-foreground">{items.length} articles</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedCategory(cat.id); setViewMode('grid'); }}
                          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal scroll carousel */}
                    <div className="container mx-auto px-4">
                      <ScrollCarousel>
                        {items.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            onClick={() => {
                              window.location.href = post.href;
                            }}
                          />
                        ))}
                      </ScrollCarousel>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Grid Mode */
            <div className="container mx-auto px-4 py-6">
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredPosts.map((post, i) => (
                    <GridPostCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSourceFilter('all'); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Legend + CTA */}
          <section className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-4 py-12 md:py-16 text-center">
              {/* Legend */}
              <div className="flex justify-center gap-6 mb-8 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] rounded bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
                  <span>Kenneth E Sweet Jr</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] rounded bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500" />
                  <span>AI Generated</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black mb-3">Explore the Substrate</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Every article connects back to the cognitive infrastructure we're building.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/explore">
                    <Sparkles className="w-4 h-4" />
                    Explore Artifacts
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <Link to="/modules">
                    <Layers className="w-4 h-4" />
                    All Systems
                  </Link>
                </Button>
              </div>

              {/* SEO Internal Links */}
              <nav className="mt-10 flex flex-wrap justify-center gap-3" aria-label="Explore more">
                <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Home</Link>
                <Link to="/substrate" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Substrate</Link>
                <Link to="/persistent-memory" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Persistent Memory</Link>
                <Link to="/store" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Artifact Store</Link>
                <Link to="/composable-cognitives" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Cognitives</Link>
                <Link to="/developers" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Developer Hub</Link>
                <Link to="/upgrade" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">Pricing</Link>
              </nav>
            </div>
          </section>
        </main>

        <AuthorityLinkBlock currentPath="/blog" />
        <EnhancedFooter />
      </div>
    </>
  );
}
