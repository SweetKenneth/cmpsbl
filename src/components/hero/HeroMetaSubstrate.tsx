/**
 * META HERO: CMPSBL® — Composable AI Infrastructure
 * Studio-grade hero with cinematic typography and fluid motion
 */

import React, { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookOpen,
  Sparkles,
  ChevronDown,
  Layers,
  Brain,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MemoryRiverLazy = lazy(() => import("./MemoryRiver").then(m => ({ default: m.MemoryRiver })));


// ─── Typing Animation ──────────────────────────────────────────
function TypedText({ texts, gradientColors, className }: { 
  texts: string[]; 
  gradientColors?: string[];
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentText = texts[currentIndex];
    const typingSpeed = isDeleting ? 30 : 65;
    
    if (!isDeleting && displayText === currentText) {
      const timeout = setTimeout(() => setIsDeleting(true), 2800);
      return () => clearTimeout(timeout);
    }
    
    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      return;
    }
    
    const timeout = setTimeout(() => {
      setDisplayText(prev => 
        isDeleting 
          ? prev.slice(0, -1) 
          : currentText.slice(0, prev.length + 1)
      );
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, texts]);
  
  const currentGradient = gradientColors?.[currentIndex] || "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))";
  
  const gradientStyle = useMemo(() => ({
    backgroundImage: currentGradient,
    backgroundClip: "text" as const,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }), [currentGradient]);
  
  return (
    <span className={cn("inline-flex items-baseline", className)} style={gradientStyle}>
      <span className="inline-block min-w-[1ch]">{displayText}</span>
      <motion.span 
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
        className="inline-block w-[2px] h-[0.7em] ml-0.5 rounded-full"
        style={{ background: "hsl(var(--primary))" }}
        aria-hidden="true"
      />
    </span>
  );
}

// ─── Animated Stat ──────────────────────────────────────────────
function AnimatedStat({ value, label, suffix = "", delay = 0 }: { 
  value: number; label: string; suffix?: string; delay?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (hasAnimated) return;
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 1800;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  
  return (
    <motion.div 
      ref={ref}
      className="relative text-center py-4 sm:py-5 group stat-card-glow"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + delay * 0.06, duration: 0.4 }}
    >
      <div className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums tracking-tight text-foreground group-hover:text-glow-primary transition-all duration-500">
        {count}{suffix}
      </div>
      <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-semibold mt-1 tracking-[0.15em] uppercase group-hover:text-muted-foreground/80 transition-colors duration-300">{label}</div>
    </motion.div>
  );
}

// ─── Background — pure CSS, no framer-motion ────────────────────
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      
      {/* Gradient orbs — CSS-only ambient drift */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full animate-hero-orb-1"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.06) 0%, transparent 55%)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full animate-hero-orb-2"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-magenta) / 0.05) 0%, transparent 55%)" }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full animate-hero-orb-3"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 55%)" }}
      />
      
      <div className="absolute inset-0 substrate-grid-bg opacity-[0.25] dark:opacity-[0.4]" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.6) 100%)" }} />
    </div>
  );
}

// ─── Main Hero ──────────────────────────────────────────────────
export function HeroMetaSubstrate() {
  return (
    <section 
      aria-label="CMPSBL hero"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-10 overflow-x-clip overflow-y-visible"
    >
      <HeroBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center mb-10 sm:mb-16">
          
          {/* Left column — Copy */}
          <div className="text-center lg:text-left order-1">
            {/* Engine badge — refined pill */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 backdrop-blur-md mb-6 sm:mb-8"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wide">Cognitive Infrastructure</span>
              <span className="flex items-center gap-1 pl-2 border-l border-border/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
              </span>
            </motion.div>
            
            {/* CMPSBL — massive wordmark */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-[-0.06em] leading-[0.85] mb-5 sm:mb-7"
            >
              <span 
                className="inline-block clockless-river-text"
                style={{
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  padding: "0 0.1em 0.05em 0",
                }}
              >
                CMPSBL
              </span>
            </motion.h1>

            {/* Tagline — two-part rhythm */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-5 sm:mb-8"
            >
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground/80 tracking-tight leading-snug">
                Where machines learn to
              </p>
              <div className="mt-1 text-3xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-none min-h-[1.15em]">
                <TypedText 
                  texts={["persist.", "evolve.", "coordinate.", "compound.", "dream.", "execute."]}
                  gradientColors={[
                    "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                    "linear-gradient(135deg, hsl(var(--neon-magenta)), hsl(var(--primary)))",
                    "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
                    "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
                  ]}
                />
              </div>
            </motion.div>
            
            {/* Subtitle — tighter, more scannable */}
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-sm sm:text-base text-muted-foreground/70 max-w-md mx-auto lg:mx-0 mb-7 sm:mb-9 leading-relaxed"
            >
              Capture a signal in the{' '}
              <span className="text-foreground/90 font-medium">Memory Stream</span>.{' '}
              Watch it crystallize into{' '}
              <span className="text-foreground/90 font-medium">deployable software</span>.{' '}
              When it proves rare enough, it crosses the boundary into{' '}
              <span className="text-primary font-medium">physical silicon</span>.{' '}
              Build on the substrate — where persistent memory, governed evolution, and DREAM cycles
              turn every system into infrastructure that improves itself.
            </motion.p>
            
            {/* CTAs — primary + ghost for clean hierarchy */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              <Button 
                asChild 
                size="lg" 
                className="gap-2 px-8 sm:px-10 h-12 sm:h-13 text-sm font-bold rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/upgrade">
                  <Sparkles className="w-4 h-4" />
                  View Plans
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="ghost" 
                size="lg" 
                className="gap-2 px-6 sm:px-8 h-12 sm:h-13 text-sm font-medium rounded-xl hover:bg-muted/40 transition-all duration-300 active:scale-[0.98]"
              >
                <Link to="/about">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  About CMPSBL
                </Link>
              </Button>
            </motion.div>
            
            {/* Research DOI — subtle, compact */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-5 sm:mt-7 text-center lg:text-left"
            >
              <a 
                href="https://doi.org/10.5281/zenodo.18234909"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 transition-all duration-300 group"
              >
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                <div className="text-left">
                  <span className="block text-[11px] font-medium text-foreground/70 group-hover:text-primary transition-colors leading-tight">Research Paper</span>
                  <span className="block text-[9px] text-muted-foreground/50 leading-tight">DOI: 10.5281/zenodo.18234909</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </a>
            </motion.div>
          </div>
          
          {/* Right column — Memory River visualization + context */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 flex flex-col gap-4"
          >
            {/* Above River — Architecture blurb */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="hidden sm:block rounded-xl border border-border/15 bg-card/25 backdrop-blur-sm p-4 gradient-border-glow"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                <h3 className="text-[10px] font-bold text-foreground/60 uppercase tracking-[0.2em]">How Intelligence Flows</h3>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                <span className="text-foreground/80 font-medium">Persistent memories</span> survive restarts.{' '}
                <span className="text-primary font-medium">Self-improving pipelines</span> refine autonomously.{' '}
                <span className="font-medium" style={{ color: "hsl(var(--neon-magenta))" }}>Governed orchestration</span> keeps it auditable.{' '}
                Nothing resets.
              </p>
            </motion.div>

            <Suspense fallback={<div className="h-[200px] rounded-xl border border-border/15 bg-card/10 animate-pulse" />}>
              <MemoryRiverLazy autoCrystallize />
            </Suspense>

            {/* Below River — pulse cards */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { label: "Memory Depth", value: "Persistent", glow: "--neon-cyan" },
                { label: "Dream Cycles", value: "Autonomous", glow: "--neon-purple" },
                { label: "Defense Mesh", value: "Always-On", glow: "--neon-magenta" },
              ].map((item) => (
                <div 
                  key={item.label} 
                  className="rounded-lg border border-border/15 bg-card/25 backdrop-blur-sm p-2.5 sm:p-3 text-center hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 group shimmer-on-hover glass-edge"
                >
                  <div className="text-[8px] sm:text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em] font-semibold mb-0.5">{item.label}</div>
                  <div className="text-[11px] sm:text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{item.value}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Feature pills — horizontal scroll on mobile, centered on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex justify-start sm:justify-center gap-2 mb-6 sm:mb-10 -mx-4 px-4 pr-8 sm:mx-0 sm:px-0 sm:pr-0 overflow-x-auto scrollbar-hide pb-1"
        >
          {[
            { icon: Sparkles, label: "Free to Start", href: "/auth" },
            { icon: Brain, label: "Persistent Memory", href: "/persistent-memory" },
            { icon: Layers, label: "24 Pipeline Packs", href: "/packs" },
            { icon: Shield, label: "Governed Runtime", href: "/documentation" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <Link
                to={item.href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border/30 bg-card/30 backdrop-blur-sm shrink-0 hover:bg-card/60 hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 active:scale-[0.97]"
              >
                <item.icon className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[11px] font-medium text-foreground/70 whitespace-nowrap">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Stats bar — minimal, glassy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div 
            className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20 rounded-2xl border border-border/25 bg-card/20 backdrop-blur-xl overflow-hidden shadow-lg shadow-primary/[0.03] glass-edge"
          >
            <div className="absolute inset-x-0 top-0 h-px memory-stream-bar opacity-30" />
            <div className="absolute inset-x-0 bottom-0 h-px memory-stream-bar opacity-10" />
            <AnimatedStat value={10} label="Entities" delay={0} />
            <AnimatedStat value={300} label="Synergies" delay={1} />
            <AnimatedStat value={175} suffix="k+" label="Lines of Code" delay={2} />
            <AnimatedStat value={360} label="Commands" delay={3} />
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator — ghost-subtle with gradient line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] text-muted-foreground/30 font-medium tracking-[0.2em] uppercase">Explore</span>
        <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-transparent" />
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-primary/25" />
        </motion.div>
      </motion.div>
    </section>
  );
}
