/**
 * Blog — CMPSBL Research & Insights
 * Artifacts-inspired layout with featured posts, blended human/AI content,
 * color-coded cards (gold for human, silver for AI), and mobile-first UX.
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Bot, ArrowRight, Calendar, Clock,
  User, Filter, ChevronRight, BookOpen, TrendingUp,
  Shield, Brain, Code, Accessibility, Layers, Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
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

// AutoBlog images
import autoblog1 from '@/assets/autoblog/autoblog-1.jpg';
import autoblog2 from '@/assets/autoblog/autoblog-2.jpg';
import autoblog3 from '@/assets/autoblog/autoblog-3.jpg';
import autoblog4 from '@/assets/autoblog/autoblog-4.jpg';
import autoblog5 from '@/assets/autoblog/autoblog-5.jpg';
import autoblog6 from '@/assets/autoblog/autoblog-6.jpg';
import autoblog7 from '@/assets/autoblog/autoblog-7.jpg';
import autoblog8 from '@/assets/autoblog/autoblog-8.jpg';

const AUTOBLOG_IMAGES = [autoblog1, autoblog2, autoblog3, autoblog4, autoblog5, autoblog6, autoblog7, autoblog8];

function getAutoblogImage(postId: string): string {
  const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AUTOBLOG_IMAGES[hash % AUTOBLOG_IMAGES.length];
}

// ─── Types ───
type PostSource = 'human' | 'ai';

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
  author: string;
  authorRole: string;
}

// ─── Category config with icons & colors ───
const CATEGORIES = [
  { id: 'All', label: 'All Posts', icon: Layers },
  { id: 'Security', label: 'Security', icon: Shield },
  { id: 'AI Technology', label: 'AI Technology', icon: Brain },
  { id: 'Technology', label: 'Technology', icon: Code },
  { id: 'Platform', label: 'Platform', icon: Layers },
  { id: 'Research', label: 'Research', icon: TrendingUp },
  { id: 'Development', label: 'Development', icon: Code },
  { id: 'Accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'Protocol', label: 'Protocol', icon: BookOpen },
  { id: 'Governance', label: 'Governance', icon: Eye },
  { id: 'Threat Intel', label: 'Threat Intel', icon: Shield },
  { id: 'AI Security', label: 'AI Security', icon: Shield },
] as const;

// ─── Source filter ───
type SourceFilter = 'all' | 'human' | 'ai';

// ─── Static human posts (dates spread over the last year+) ───
const HUMAN_POSTS: BlogPost[] = [
  {
    id: 'evolving-software', title: "Evolving Software v6.x.x: The Breakthrough",
    excerpt: "CMPSBL v6.x.x represents a paradigm shift—systems that learn, adapt, and evolve autonomously. Now available via API.",
    href: "/blog/evolving-software-v6-breakthrough", category: "Technology",
    date: "2026-01-30", readTime: "22 min", image: evolvingSoftwareImg,
    imageAlt: "Digital DNA helix representing evolving software systems",
    source: 'human', featured: true, author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'rag-infra', title: "RAG Without Infrastructure",
    excerpt: "Ship retrieval-augmented generation without managing vector databases.",
    href: "/blog/rag-without-infrastructure", category: "Development",
    date: "2026-01-28", readTime: "14 min", image: ragWithoutInfraImg,
    imageAlt: "RAG document network visualization",
    source: 'human', featured: true, author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'agent-anti', title: "Agent Memory Anti-Patterns",
    excerpt: "Common mistakes that cause AI agents to lose context and how to avoid them.",
    href: "/blog/agent-memory-anti-patterns", category: "Development",
    date: "2026-01-26", readTime: "12 min", image: agentMemoryAntiPatternsImg,
    imageAlt: "Memory anti-patterns warning visualization",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'langchain', title: "LangChain Memory Integration",
    excerpt: "Add persistent memory to your LangChain agents in under an hour.",
    href: "/blog/langchain-memory-integration", category: "Development",
    date: "2026-01-24", readTime: "15 min", image: langchainMemoryImg,
    imageAlt: "LangChain memory integration",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'agents-forget', title: "Why Agents Forget",
    excerpt: "The technical reasons behind context loss and memory degradation in AI systems.",
    href: "/blog/why-agents-forget", category: "Research",
    date: "2026-01-22", readTime: "11 min", image: whyAgentsForgetImg,
    imageAlt: "Agent memory fading visualization",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'building-agents', title: "Building Agents That Learn",
    excerpt: "Architectural patterns for AI systems that improve through experience.",
    href: "/blog/building-agents-that-learn", category: "Development",
    date: "2026-01-20", readTime: "18 min", image: buildingAgentsLearnImg,
    imageAlt: "Agents learning and evolving",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'llms-txt', title: "LLMs.txt: The Protocol for AI Context",
    excerpt: "How we follow the llmstxt.org protocol and why we recommend adoption as a standard for AI-human interaction.",
    href: "/blog/llms-txt-protocol-ai-context", category: "Protocol",
    date: "2026-01-30", readTime: "14 min", image: llmsTxtImg,
    imageAlt: "Visualization of LLMs.txt protocol structure",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'governance', title: "AI Governance Namespace: Unified Terminology",
    excerpt: "How we established unified AI governance vocabulary through strategic domain registration.",
    href: "/blog/ai-governance-namespace-unified-terminology", category: "Governance",
    date: "2026-01-30", readTime: "12 min", image: aiGovernanceImg,
    imageAlt: "Network visualization of AI governance terminology",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'inclusive', title: "INCLUSIVE Module Mission",
    excerpt: "Our commitment to making the web accessible through AI-powered automation.",
    href: "/blog/inclusive-module-accessibility-mission", category: "Accessibility",
    date: "2025-11-20", readTime: "8 min", image: cmptblMissionImg,
    imageAlt: "Accessibility mission statement",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'free-access', title: "Accessibility for Everyone",
    excerpt: "Why web accessibility matters and how AI can help achieve it at scale.",
    href: "/blog/accessibility-free-for-all", category: "Accessibility",
    date: "2025-10-18", readTime: "9 min", image: accessibilityFreeImg,
    imageAlt: "Universal accessibility network",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'wp-access', title: "WordPress Accessibility Guide",
    excerpt: "Complete guide to making your WordPress site WCAG compliant.",
    href: "/blog/wordpress-accessibility-guide", category: "Accessibility",
    date: "2025-09-15", readTime: "16 min", image: wpAccessibilityImg,
    imageAlt: "WordPress accessibility checklist",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'wcag', title: "WCAG 2.2 Changes for WordPress",
    excerpt: "What the latest WCAG updates mean for WordPress developers.",
    href: "/blog/wcag-2-2-wordpress-changes", category: "Accessibility",
    date: "2025-08-12", readTime: "12 min", image: wcag22Img,
    imageAlt: "WCAG 2.2 standards visualization",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'auto-access', title: "Automated Accessibility Fixes",
    excerpt: "AI-powered remediation for common WordPress accessibility issues.",
    href: "/blog/automated-accessibility-fixes-wordpress", category: "Accessibility",
    date: "2025-07-10", readTime: "10 min", image: autoAccessibilityImg,
    imageAlt: "Automated accessibility repair",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'ai-dream', title: "Experimental AI Systems That Dream",
    excerpt: "Cascade and SimNap explore autonomous dreaming, reflection, and self-improvement.",
    href: "/blog/ai-systems-that-dream-press-release", category: "Research",
    date: "2025-12-18", readTime: "6 min", image: cascadeAIImg,
    imageAlt: "Cascade AI autonomous dreaming system",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'bot-defense', title: "WordPress Bot Defense Guide",
    excerpt: "Protect your site from sophisticated bot attacks with AI-powered behavioral analysis.",
    href: "/blog/wordpress-bot-defense", category: "Security",
    date: "2025-11-15", readTime: "15 min", image: wpBotDefenseImg,
    imageAlt: "WordPress security with AI protection",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'sec-plugins', title: "Top Security Plugins 2025",
    excerpt: "Comprehensive comparison of WordPress security plugins and AI-powered defense.",
    href: "/blog/top-security-plugins-2025", category: "Security",
    date: "2025-10-10", readTime: "12 min", image: topSecurityPluginsImg,
    imageAlt: "WordPress security plugins comparison",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'cyber-evo', title: "AI Cybersecurity Evolution",
    excerpt: "How artificial intelligence is revolutionizing predictive threat detection.",
    href: "/blog/ai-cybersecurity-evolution-2025", category: "AI Security",
    date: "2025-09-08", readTime: "10 min", image: aiCybersecurityImg,
    imageAlt: "AI cybersecurity evolution",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'hackers', title: "AI Hackers Underground",
    excerpt: "Inside look at how malicious actors weaponize AI for sophisticated attacks.",
    href: "/blog/ai-hackers-underground-2025", category: "Threat Intel",
    date: "2025-08-05", readTime: "14 min", image: aiHackersImg,
    imageAlt: "AI-powered cyber threats",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'pf-works', title: "How PromptFluid Works",
    excerpt: "Deep dive: dream cycles, neural orchestration, and experimental AI concepts.",
    href: "/blog/how-promptfluid-works-cascade-ai-ecosystem", category: "Technology",
    date: "2025-07-10", readTime: "18 min", image: howPFWorksImg,
    imageAlt: "PromptFluid Cascade AI ecosystem",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'cascade', title: "Cascade AI: Adaptive Intelligence",
    excerpt: "How autonomous dream cycles enable continuous learning and reflection.",
    href: "/blog/cascade-ai-adaptive-intelligence-brain", category: "AI Technology",
    date: "2025-06-08", readTime: "16 min", image: cascadeAIImg,
    imageAlt: "Adaptive AI brain in dream state",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'studio', title: "PromptFluid Studio",
    excerpt: "AI-assisted development platform generating production-ready code.",
    href: "/blog/promptfluid-studio-build-apps-that-think", category: "Development",
    date: "2025-05-05", readTime: "13 min", image: pfStudioImg,
    imageAlt: "AI-powered app development studio",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'triad', title: "Free-Tier AI Routing",
    excerpt: "Multi-provider gateway optimized for cost and performance.",
    href: "/blog/ai-triad-intelligent-routing", category: "Technology",
    date: "2025-04-02", readTime: "11 min", image: aiTriadImg,
    imageAlt: "AI network routing visualization",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'brain', title: "Adaptive Learning Core",
    excerpt: "Machine learning engine powering behavioral analysis and threat intelligence.",
    href: "/blog/promptfluid-brain-adaptive-learning-core", category: "AI Technology",
    date: "2025-03-28", readTime: "15 min", image: pfBrainImg,
    imageAlt: "Machine learning brain core",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'vision', title: "Unified Dashboard Guide",
    excerpt: "Central command for monitoring AI orchestration and analytics.",
    href: "/blog/promptfluid-vision-unified-dashboard", category: "Platform",
    date: "2025-03-25", readTime: "12 min", image: pfVisionImg,
    imageAlt: "Unified command center dashboard",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
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
    excerpt: "How PromptFluid compares to OpenAI, Anthropic, and other AI platforms.",
    href: "/blog/ai-product-comparison-2025", category: "Research",
    date: "2025-06-12", readTime: "18 min", image: aiComparisonImg,
    imageAlt: "AI product comparison chart",
    source: 'human', author: "Kenneth E Sweet Jr", authorRole: "Founder & Security Engineer",
  },
  {
    id: 'disruptor', title: "PromptFluid Market Disruptor",
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

// ─── Blog Post Card ───
function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const isHuman = post.source === 'human';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link to={post.href}>
        <div
          className={cn(
            "group h-full rounded-xl border overflow-hidden transition-all duration-300",
            "hover:-translate-y-1 hover:shadow-xl",
            isHuman
              ? "border-amber-500/25 hover:border-amber-400/50 hover:shadow-amber-500/10"
              : "border-slate-400/25 hover:border-slate-300/50 hover:shadow-slate-400/10",
            "bg-card"
          )}
        >
          {/* Top accent line */}
          <div className={cn(
            "h-[3px] w-full",
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

            {/* Source badge overlay */}
            <div className="absolute top-3 right-3">
              <Badge className={cn(
                "text-[10px] font-bold backdrop-blur-md border",
                isHuman
                  ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                  : "bg-slate-400/20 text-slate-200 border-slate-300/40"
              )}>
                {isHuman ? <User className="w-2.5 h-2.5 mr-1" /> : <Bot className="w-2.5 h-2.5 mr-1" />}
                {isHuman ? 'Kenneth E Sweet Jr' : 'AI Generated'}
              </Badge>
            </div>

            {/* Category badge bottom-left */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="outline" className="text-[10px] bg-black/40 text-white border-white/20 backdrop-blur-md">
                {post.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center gap-3">
              {isHuman && (
                <img
                  src={founderPhoto}
                  alt={post.author}
                  className={cn(
                    "w-7 h-7 rounded-full object-cover ring-2",
                    "ring-amber-500/30"
                  )}
                  loading="lazy"
                />
              )}
              {!isHuman && (
                <div className="w-7 h-7 rounded-full bg-slate-500/20 border border-slate-400/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{post.author}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Featured Card (large) ───
function FeaturedCard({ post }: { post: BlogPost }) {
  const isHuman = post.source === 'human';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={post.href}>
        <div className={cn(
          "group rounded-2xl border overflow-hidden transition-all duration-300",
          "hover:shadow-2xl",
          isHuman
            ? "border-amber-500/30 hover:border-amber-400/60 hover:shadow-amber-500/15"
            : "border-slate-400/30 hover:border-slate-300/60 hover:shadow-slate-400/15",
          "bg-card"
        )}>
          {/* Top accent */}
          <div className={cn(
            "h-1 w-full",
            isHuman
              ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"
              : "bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500"
          )} />

          <div className="grid md:grid-cols-2 gap-0">
            <div className="aspect-video md:aspect-auto md:min-h-[320px] overflow-hidden relative">
              <img
                src={post.image}
                alt={post.imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden md:block" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary/90 text-primary-foreground text-xs font-bold gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </Badge>
              </div>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  isHuman ? "border-amber-500/40 text-amber-400" : "border-slate-400/40 text-slate-400"
                )}>
                  {post.category}
                </Badge>
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  isHuman ? "border-amber-500/20 text-amber-300" : "border-slate-400/20 text-slate-300"
                )}>
                  {isHuman ? <User className="w-2.5 h-2.5 mr-1" /> : <Bot className="w-2.5 h-2.5 mr-1" />}
                  {isHuman ? 'Kenneth E Sweet Jr' : 'AI'}
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">{post.excerpt}</p>

              <div className="flex items-center gap-3">
                {isHuman && (
                  <img src={founderPhoto} alt={post.author} className="w-9 h-9 rounded-full ring-2 ring-amber-500/30 object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold">{post.author}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Blog Page ───
export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [autoPosts, setAutoPosts] = useState<BlogPost[]>([]);

  // Fetch auto-generated posts from DB
  useEffect(() => {
    const fetchAutoPosts = async () => {
      const { data } = await supabase
        .from("auto_blog_posts")
        .select("id, title, slug, excerpt, category, published_at, author_name, author_role")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(30);

      if (data) {
        setAutoPosts(data.map(p => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || "AI-generated insight from the CMPSBL substrate.",
          href: `/blog/auto/${p.slug}`,
          category: p.category || "AI Insight",
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

  // Blend all posts sorted by date
  const allPosts = useMemo(() => {
    const merged = [...HUMAN_POSTS, ...autoPosts];
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [autoPosts]);

  const featuredPosts = useMemo(() => allPosts.filter(p => p.featured), [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      if (post.featured && selectedCategory === "All" && !searchQuery && sourceFilter === 'all') return false; // shown in featured
      const matchesSearch = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || post.category === selectedCategory;
      const matchesSource = sourceFilter === 'all' || post.source === sourceFilter;
      return matchesSearch && matchesCat && matchesSource;
    });
  }, [allPosts, searchQuery, selectedCategory, sourceFilter]);

  const totalCount = allPosts.length;
  const humanCount = allPosts.filter(p => p.source === 'human').length;
  const aiCount = allPosts.filter(p => p.source === 'ai').length;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Research & Insights — CMPSBL Blog"
        description="Research, insights, and documentation on cognitive infrastructure, AI memory, autonomous systems, and intelligent orchestration. Written by humans and AI."
        canonical="https://cmpsbl.com/blog"
        keywords={['AI research', 'cognitive infrastructure', 'AI memory', 'autonomous AI', 'CMPSBL blog', 'AI security']}
      />

      <PublicNav />

      {/* ─── Hero ─── */}
      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Mono header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter">
              <span className="font-mono text-primary">Research</span>
              <span className="text-muted-foreground mx-2 md:mx-3">&</span>
              <span className="font-mono bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
                Insights
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl"
          >
            Written by humans and generated by AI — documentation of what we're building and where the field is headed.
          </motion.p>

          {/* Stats pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Badge variant="outline" className="py-1.5 px-4 text-sm gap-2 border-border">
              <BookOpen className="w-3.5 h-3.5" />
              {totalCount} Articles
            </Badge>
            <Badge variant="outline" className="py-1.5 px-4 text-sm gap-2 border-amber-500/30 text-amber-400">
              <User className="w-3.5 h-3.5" />
              {humanCount} by Kenneth
            </Badge>
            <Badge variant="outline" className="py-1.5 px-4 text-sm gap-2 border-slate-400/30 text-slate-400">
              <Bot className="w-3.5 h-3.5" />
              {aiCount} AI Generated
            </Badge>
          </motion.div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-card border-border"
              />
            </div>

            {/* Source filter pills */}
            <div className="flex gap-1.5 bg-muted/50 rounded-lg p-1">
              {([
                { key: 'all' as SourceFilter, label: 'All', icon: Layers },
                { key: 'human' as SourceFilter, label: 'Kenneth', icon: User },
                { key: 'ai' as SourceFilter, label: 'AI', icon: Bot },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setSourceFilter(f.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    sourceFilter === f.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <f.icon className="w-3 h-3" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category ribbon ─── */}
      <section className="container mx-auto px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border shrink-0",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Featured Posts ─── */}
      {featuredPosts.length > 0 && selectedCategory === "All" && !searchQuery && sourceFilter === 'all' && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">Featured</h2>
            </div>
            {featuredPosts.map(post => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Legend ─── */}
      <section className="container mx-auto px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-[3px] rounded bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            <span>Written by Kenneth E Sweet Jr</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[3px] rounded bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500" />
            <span>AI Generated</span>
          </div>
        </div>
      </section>

      {/* ─── Posts Grid ─── */}
      <section className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {filteredPosts.length > 0 ? (
              <motion.div
                key={selectedCategory + sourceFilter + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No articles found</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Try a different search term or category</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
