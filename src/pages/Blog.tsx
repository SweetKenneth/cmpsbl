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

// Blog post images (chronological substrate story)
import ch01Img from "@/assets/blog/promptfluid-market-disruptor.jpg";
import ch02Img from "@/assets/blog/promptfluid-nexus-api-gateway.jpg";
import ch03Img from "@/assets/blog/promptfluid-brain-learning-core.jpg";
import ch04Img from "@/assets/blog/promptfluid-defense-ai-security.jpg";
import ch05Img from "@/assets/blog/promptfluid-vision-dashboard.jpg";
import ch06Img from "@/assets/blog/promptfluid-ripple-network.jpg";
import ch07Img from "@/assets/blog/promptfluid-access-identity-billing.jpg";
import ch08Img from "@/assets/blog/cascade-ai-adaptive-intelligence.jpg";
import ch09Img from "@/assets/blog/promptfluid-studio-build-apps.jpg";
import ch10Img from "@/assets/blog/why-agents-forget.jpg";
import ch11Img from "@/assets/blog/ai-product-comparison-2025.jpg";
import ch12Img from "@/assets/blog/building-agents-that-learn.jpg";
import ch13Img from "@/assets/blog/ai-hackers-underground-2025.jpg";
import ch14Img from "@/assets/blog/ai-cybersecurity-evolution-2025.jpg";
import ch15Img from "@/assets/blog/cmptbl-mission-accessibility.jpg";
import ch16Img from "@/assets/blog/ai-governance-compliance-v9.jpg";
import ch17Img from "@/assets/blog/ai-protocol-standards-v9.jpg";
import ch18Img from "@/assets/blog/evolving-software-v6-breakthrough.jpg";
import ch19Img from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";
import ch20Img from "@/assets/blog/signal-to-silicon-narrative.jpg";
import ch21Img from "@/assets/blog/cascade-ai-adaptive-intelligence.jpg";
import ch22Img from "@/assets/blog/clockless-modules-deep-dive.jpg";
import ch23Img from "@/assets/blog/ai-governance-compliance-v9.jpg";
import ch24Img from "@/assets/blog/promptfluid-ecosystem.jpg";
import ch25Img from "@/assets/blog/building-agents-that-learn.jpg";
import ch26Img from "@/assets/blog/ai-business-operations-2025.jpg";
import ch27Img from "@/assets/blog/studio-app-builder.jpg";
import ch28Img from "@/assets/blog/autonomous-discovery-engine.jpg";
import ch29Img from "@/assets/blog/artifact-pack-capabilities.jpg";
import ch30Img from "@/assets/blog/clockless-account-setup-artifact-packs.jpg";
import ch31Img from "@/assets/blog/ai-triad-intelligent-routing.jpg";
import ch32Img from "@/assets/blog/what-makes-clockless-different.jpg";
import ch33Img from "@/assets/blog/memory-stream-crystallization-guide.jpg";
import ch34Img from "@/assets/blog/ai-automation-trends-2025.jpg";
import ch35Img from "@/assets/blog/cascade-ai-brain-cycles.jpg";
import ch36Img from "@/assets/blog/cascade-ai-adaptive-brain.jpg";
import ch37Img from "@/assets/blog/ai-governance-namespace-unified.jpg";
import ch38Img from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";
import ch39Img from "@/assets/blog/defense-ai-security.jpg";
import ch40Img from "@/assets/blog/signal-to-silicon-narrative.jpg";

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

const CATEGORY_ALIASES: Record<string, string> = {
  security: 'Security',
  'ai technology': 'AI Technology',
  ai: 'AI Technology',
  technology: 'Technology',
  platform: 'Platform',
  research: 'Research',
  insight: 'Research',
  development: 'Development',
  changelog: 'Development',
  release: 'Development',
  update: 'Development',
  internal: 'Development',
  accessibility: 'Accessibility',
  protocol: 'Protocol',
  governance: 'Governance',
  'threat intel': 'Threat Intel',
  'ai security': 'AI Security',
};

function normalizeBlogCategory(rawCategory?: string | null): string {
  if (!rawCategory?.trim()) return 'Research';

  const normalized = rawCategory.trim().toLowerCase();
  const fromAliases = CATEGORY_ALIASES[normalized];
  if (fromAliases) return fromAliases;

  const existingCategory = BLOG_CATEGORIES.find(
    (category) => category.id.toLowerCase() === normalized,
  );

  return existingCategory?.id ?? 'Research';
}

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
function PostCard({ post, href }: { post: BlogPost; href: string }) {
  const isHuman = post.source === 'human';
  return (
    <Link to={href} className="snap-start shrink-0 w-[300px] min-h-[340px] block">
      <div
        className={cn(
          "h-full rounded-xl border bg-gradient-to-br overflow-hidden",
          "hover:border-primary/30 hover:-translate-y-1 transition-all duration-200",
          "flex flex-col",
          isHuman
            ? "border-amber-500/20 from-amber-500/[0.04] to-transparent"
            : "border-slate-400/20 from-slate-400/[0.04] to-transparent",
        )}
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
    </Link>
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

// ─── Static human posts (chronological substrate story) ───
const HUMAN_POSTS: BlogPost[] = [
  {
    id: 'ch20-signal', title: "Signal to Silicon: The Complete Pipeline",
    excerpt: "From behavioral signals through 40-node cognitive processing to deployable software. The substrate's complete signal-to-silicon pipeline explained.",
    href: "/blog/signal-to-silicon", category: "Technology",
    date: "2026-03-04", readTime: "22 min", image: ch20Img,
    imageAlt: "Signal to Silicon pipeline", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch19-burning', title: "Burning It Down: The Complete Substrate Rebuild",
    excerpt: "In February 2026, we deleted thousands of lines of code and rebuilt the substrate from scratch. Here's why, and what we learned.",
    href: "/blog/burning-it-down", category: "Technology",
    date: "2026-02-10", readTime: "20 min", image: ch19Img,
    imageAlt: "Substrate rebuild from scratch", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch18-evolving', title: "When Software Starts Evolving",
    excerpt: "In January 2026, the substrate crossed a threshold: DREAM consolidation cycles started producing improvements we didn't program.",
    href: "/blog/when-software-starts-evolving", category: "Research",
    date: "2026-01-15", readTime: "18 min", image: ch18Img,
    imageAlt: "Software evolution breakthrough", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch17-protocols', title: "Protocols for Machines",
    excerpt: "We adopted LLMs.txt, built machine-readable documentation, and established protocol standards for autonomous agent communication.",
    href: "/blog/protocols-for-machines", category: "Protocol",
    date: "2025-12-05", readTime: "14 min", image: ch17Img,
    imageAlt: "AI protocol standards", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch16-governance', title: "The Governance Question",
    excerpt: "Enterprise customers asked 'can you prove your AI was operating within bounds?' We couldn't. So we built AUDIT and IDENTITY.",
    href: "/blog/the-governance-question", category: "Governance",
    date: "2025-11-10", readTime: "13 min", image: ch16Img,
    imageAlt: "AI governance and compliance", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch15-accessibility', title: "Accessibility Is Infrastructure",
    excerpt: "We built INCLUSIVE because accessibility shouldn't require a dedicated team. AI-powered scanning and remediation for every application.",
    href: "/blog/accessibility-is-infrastructure", category: "Accessibility",
    date: "2025-10-15", readTime: "10 min", image: ch15Img,
    imageAlt: "INCLUSIVE node accessibility mission", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch14-cybersecurity', title: "Cybersecurity Through Cognition",
    excerpt: "Traditional security reacts to known threats. DEFENSE predicts unknown ones. How cognitive security fundamentally changes threat detection.",
    href: "/blog/cybersecurity-through-cognition", category: "Security",
    date: "2025-09-08", readTime: "12 min", image: ch14Img,
    imageAlt: "Cognitive security evolution", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch13-botwars', title: "The Bot Wars",
    excerpt: "By August 2025, AI-powered bots were attacking our infrastructure daily. This is what we learned fighting them.",
    href: "/blog/the-bot-wars", category: "Threat Intel",
    date: "2025-08-05", readTime: "14 min", image: ch13Img,
    imageAlt: "Bot attack defense in action", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch12-learn', title: "Agents That Actually Learn",
    excerpt: "After months of building learning agents, these are the architectural patterns that actually improve performance over time.",
    href: "/blog/agents-that-actually-learn", category: "Development",
    date: "2025-07-12", readTime: "15 min", image: ch12Img,
    imageAlt: "Agents learning from experience", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch11-compare', title: "How We Compare",
    excerpt: "An honest comparison against OpenAI, Anthropic, LangChain, and others. What we do better. What they do better.",
    href: "/blog/how-we-compare", category: "Research",
    date: "2025-06-20", readTime: "16 min", image: ch11Img,
    imageAlt: "AI platform landscape comparison", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch10-forget', title: "Why Agents Forget",
    excerpt: "Context loss is the silent killer of AI agents. Here's why it happens, what the industry gets wrong, and what we've learned.",
    href: "/blog/why-agents-forget", category: "Research",
    date: "2025-06-08", readTime: "11 min", image: ch10Img,
    imageAlt: "Agent memory fading over time", source: 'human', pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch09-building', title: "Building on the Substrate",
    excerpt: "Eight nodes and no documentation. Making the substrate usable meant rethinking how developers interact with cognitive infrastructure.",
    href: "/blog/building-on-the-substrate", category: "Development",
    date: "2025-05-25", readTime: "11 min", image: ch09Img,
    imageAlt: "Developer building on the substrate", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch08-dream', title: "What If Software Could Dream",
    excerpt: "During off-peak hours, the substrate processes its own experiences. We call it dreaming. It's the closest thing to autonomous learning we've built.",
    href: "/blog/what-if-software-could-dream", category: "Research",
    date: "2025-05-10", readTime: "13 min", image: ch08Img,
    imageAlt: "DREAM node autonomous consolidation", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch07-identity', title: "Identity at Every Layer",
    excerpt: "Authentication, API keys, rate limits, and tier-based entitlements. How ACCESS made the substrate safe to open to the world.",
    href: "/blog/identity-at-every-layer", category: "Platform",
    date: "2025-04-15", readTime: "10 min", image: ch07Img,
    imageAlt: "ACCESS node identity and entitlements", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch06-nodes-talk', title: "Nodes That Talk",
    excerpt: "Five nodes needed to coordinate. Point-to-point calls broke down. RIPPLE introduced pub/sub event propagation across the substrate.",
    href: "/blog/nodes-that-talk", category: "Technology",
    date: "2025-04-02", readTime: "12 min", image: ch06Img,
    imageAlt: "RIPPLE event bus architecture", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch05-seeing', title: "Seeing Everything at Once",
    excerpt: "When we couldn't debug our own system, we built VISION — real-time observability across every node, every request, every cost.",
    href: "/blog/seeing-everything-at-once", category: "Platform",
    date: "2025-03-20", readTime: "11 min", image: ch05Img,
    imageAlt: "VISION observability dashboard", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch04-bots', title: "When Bots Found Us First",
    excerpt: "We didn't plan to build a security node. Then automated attacks found our API endpoints before we'd even launched.",
    href: "/blog/when-bots-found-us-first", category: "Security",
    date: "2025-03-05", readTime: "14 min", image: ch04Img,
    imageAlt: "DEFENSE node security architecture", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch03-remember', title: "Teaching Machines to Remember",
    excerpt: "The hardest problem in AI isn't intelligence — it's continuity. How we built a three-tier memory architecture for persistent recall.",
    href: "/blog/teaching-machines-to-remember", category: "AI Technology",
    date: "2025-02-08", readTime: "15 min", image: ch03Img,
    imageAlt: "BRAIN node memory architecture", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch02-routing', title: "Routing the Unknown",
    excerpt: "How the NEXUS node evolved from a simple failover function into an intelligent AI routing gateway with cost arbitrage.",
    href: "/blog/routing-the-unknown", category: "Technology",
    date: "2025-01-10", readTime: "14 min", image: ch02Img,
    imageAlt: "NEXUS routing gateway architecture", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  {
    id: 'ch01-first', title: "The First Line of Code",
    excerpt: "In December 2024, we wrote the first line of what would become the CMPSBL substrate. This is the honest story of why.",
    href: "/blog/the-first-line-of-code", category: "Platform",
    date: "2024-12-15", readTime: "12 min", image: ch01Img,
    imageAlt: "The beginning of the CMPSBL substrate", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering",
  },
  // ─── Chapters 21-40 ───
  { id: 'ch21-cascade', title: "When One Model Isn't Enough", excerpt: "A single LLM can't handle everything. CASCADE chains multiple models into adaptive pipelines that match complexity to capability.", href: "/blog/when-one-model-isnt-enough", category: "AI Technology", date: "2025-03-25", readTime: "12 min", image: ch21Img, imageAlt: "CASCADE adaptive pipeline", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch22-decode', title: "Breaking Problems Apart", excerpt: "Complex prompts fail. DECODE decomposes them into sub-tasks, routes each to the right model, and reassembles coherent responses.", href: "/blog/breaking-problems-apart", category: "AI Technology", date: "2025-04-08", readTime: "11 min", image: ch22Img, imageAlt: "DECODE task decomposition", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch23-proof', title: "Trust But Verify", excerpt: "AI outputs are probabilistic. PROOF validates them against constraints, catches hallucinations, and ensures quality thresholds.", href: "/blog/trust-but-verify", category: "AI Technology", date: "2025-05-18", readTime: "13 min", image: ch23Img, imageAlt: "PROOF validation node", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch24-atlas', title: "Mapping What We Built", excerpt: "With twelve nodes running, we couldn't remember what called what. ATLAS auto-discovers capabilities and maps dependencies in real time.", href: "/blog/mapping-what-we-built", category: "Platform", date: "2025-06-14", readTime: "10 min", image: ch24Img, imageAlt: "ATLAS capability map", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch25-cognitives', title: "The Composable Agent", excerpt: "Composable Cognitives are personality-infused, skill-weighted AI agents assembled from substrate nodes.", href: "/blog/the-composable-agent", category: "AI Technology", date: "2025-07-20", readTime: "14 min", image: ch25Img, imageAlt: "Composable Cognitive agents", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch26-agency', title: "Teams of Machines", excerpt: "One agent isn't enough for real work. The Agency system orchestrates teams of cognitives with leaders, specialists, and shared learning.", href: "/blog/teams-of-machines", category: "AI Technology", date: "2025-08-12", readTime: "15 min", image: ch26Img, imageAlt: "Agency system", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch27-morph', title: "Interfaces That Think", excerpt: "Static UIs can't keep up with cognitive systems. MORPH generates and adapts interfaces based on context, capability, and user intent.", href: "/blog/interfaces-that-think", category: "Technology", date: "2025-09-15", readTime: "11 min", image: ch27Img, imageAlt: "MORPH adaptive UI", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch28-forge', title: "From Thought to Artifact", excerpt: "Ideas are cheap. FORGE turns substrate processing into downloadable, deployable software artifacts — scored, versioned, and ready to ship.", href: "/blog/from-thought-to-artifact", category: "Technology", date: "2025-10-08", readTime: "12 min", image: ch28Img, imageAlt: "FORGE artifact generation", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch29-store', title: "The Marketplace", excerpt: "We built artifacts nobody could find. The Store became a discovery layer — browse, preview, purchase, and deploy substrate-generated software.", href: "/blog/the-marketplace", category: "Platform", date: "2025-10-25", readTime: "10 min", image: ch29Img, imageAlt: "Substrate Store", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch30-packs', title: "Packing Intelligence", excerpt: "Individual artifacts are useful. Packs bundle related capabilities into themed collections — curated, priced, and instantly deployable.", href: "/blog/packing-intelligence", category: "Platform", date: "2025-11-05", readTime: "9 min", image: ch30Img, imageAlt: "Artifact Packs", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch31-intent', title: "The Intent Layer", excerpt: "Users say what they want, not how to get it. The Intent Mesh translates natural language into substrate operations across any number of nodes.", href: "/blog/the-intent-layer", category: "AI Technology", date: "2025-11-20", readTime: "13 min", image: ch31Img, imageAlt: "Intent Mesh", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch32-architecture', title: "Thirty-Eight Nodes Deep", excerpt: "From one function to thirty-eight interconnected nodes. A technical map of the complete substrate architecture and how it all fits together.", href: "/blog/thirty-eight-nodes-deep", category: "Technology", date: "2025-12-15", readTime: "18 min", image: ch32Img, imageAlt: "38-node architecture", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch33-stream', title: "The Memory Stream", excerpt: "Every interaction feeds the stream. Memory Stream crystallizes cognitive signals into scored, tiered, exportable software pipelines.", href: "/blog/the-memory-stream", category: "Technology", date: "2026-01-05", readTime: "14 min", image: ch33Img, imageAlt: "Memory Stream crystallization", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch34-economics', title: "The Economics of Intelligence", excerpt: "Running cognitive infrastructure isn't free. How we track cost per request, optimize model selection, and make AI economically sustainable.", href: "/blog/the-economics-of-intelligence", category: "Research", date: "2026-01-20", readTime: "12 min", image: ch34Img, imageAlt: "AI economics", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch35-gaming', title: "Gaming the Substrate", excerpt: "Games need real-time AI that remembers, adapts, and creates. The Gaming Substrate applies cognitive infrastructure to interactive entertainment.", href: "/blog/gaming-the-substrate", category: "Technology", date: "2026-01-30", readTime: "11 min", image: ch35Img, imageAlt: "Gaming substrate", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch36-autoblog', title: "When the System Writes About Itself", excerpt: "The substrate's auto-blog generates, reviews, and publishes its own content. A meta-chapter about AI that documents its own evolution.", href: "/blog/when-the-system-writes", category: "Research", date: "2026-02-05", readTime: "10 min", image: ch36Img, imageAlt: "Auto-blog system", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch37-standards', title: "Open Standards", excerpt: "We registered governance domains, published protocol specs, and open-sourced our terminology. Building standards, not moats.", href: "/blog/open-standards", category: "Governance", date: "2026-02-15", readTime: "10 min", image: ch37Img, imageAlt: "Open standards", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch38-wrong', title: "What We Got Wrong", excerpt: "Not everything worked. Over-engineered nodes, premature abstractions, and architectural decisions we'd reverse if we could.", href: "/blog/what-we-got-wrong", category: "Research", date: "2026-02-22", readTime: "15 min", image: ch38Img, imageAlt: "Engineering retrospective", source: 'human', featured: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch39-scanner', title: "The Scanner", excerpt: "Security and accessibility scanning shouldn't require consultants. The Scanner runs automated audits and generates actionable fix reports.", href: "/blog/the-scanner", category: "Security", date: "2026-03-01", readTime: "11 min", image: ch39Img, imageAlt: "The Scanner", source: 'human', author: "CMPSBL Team", authorRole: "Platform Engineering" },
  { id: 'ch40-now', title: "Where We Are Now", excerpt: "Forty chapters later. The current state of the substrate, what's running in production, and what comes next.", href: "/blog/where-we-are-now", category: "Platform", date: "2026-03-07", readTime: "16 min", image: ch40Img, imageAlt: "Current state of the substrate", source: 'human', featured: true, pillar: true, author: "CMPSBL Team", authorRole: "Platform Engineering" },
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
          category: normalizeBlogCategory(p.category),
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
                            href={post.href}
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
