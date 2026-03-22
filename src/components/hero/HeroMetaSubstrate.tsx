/**
 * META HERO: CMPSBL® — Composable AI Infrastructure
 * Studio-grade hero with cinematic typography and fluid motion
 * 
 * PERFORMANCE: Uses pure CSS animations instead of framer-motion
 * to avoid 56KB parse cost on the landing page critical path.
 * Respects prefers-reduced-motion for older/low-power devices.
 */

import React, { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Sparkles,
  ChevronDown,
  Layers,
  Brain,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MemoryRiverLazy = lazy(() => import("./MemoryRiver").then(m => ({ default: m.MemoryRiver })));

// ─── Staggered CSS fade-in helper ──────────────────────────────
function FadeIn({ delay = 0, className = "", children, ...props }: { 
  delay?: number; className?: string; children: React.ReactNode; 
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("animate-fade-in opacity-0", className)}
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Typing Animation (optimized: longer intervals, respects reduced-motion) ─
function TypedText({ texts, gradientColors, className }: { 
  texts: string[]; 
  gradientColors?: string[];
  className?: string;
}) {
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(prefersReduced.current ? texts[0] : "");
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (prefersReduced.current) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % texts.length);
      }, 3500);
      return () => clearInterval(interval);
    }
    
    const currentText = texts[currentIndex];
    const typingSpeed = isDeleting ? 40 : 80;
    
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
  
  useEffect(() => {
    if (prefersReduced.current) {
      setDisplayText(texts[currentIndex]);
    }
  }, [currentIndex, texts]);
  
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
      {!prefersReduced.current && (
        <span 
          className="inline-block w-[2px] h-[0.7em] ml-0.5 rounded-full animate-blink-cursor"
          style={{ background: "hsl(var(--primary))" }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

// ─── Animated Stat (CSS-only, no framer-motion) ─────────────────
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
    
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          if (prefersReduced) {
            setCount(value);
            observer.disconnect();
            return;
          }
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
    <div 
      ref={ref}
      className="relative text-center py-4 sm:py-5 group stat-card-glow animate-fade-in opacity-0"
      style={{ animationDelay: `${1.2 + delay * 0.06}s`, animationFillMode: "both" }}
    >
      <div className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums tracking-tight text-foreground group-hover:text-glow-primary transition-all duration-500">
        {count}{suffix}
      </div>
      <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-semibold mt-1 tracking-[0.15em] uppercase group-hover:text-muted-foreground/80 transition-colors duration-300">{label}</div>
    </div>
  );
}

// ─── Background — pure CSS, no framer-motion ────────────────────
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
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
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-3 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-10 overflow-x-clip overflow-y-visible"
    >
      <HeroBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center mb-10 sm:mb-16">
          
          {/* Left column — Copy */}
          <div className="text-center lg:text-left order-1">
            {/* Engine badge */}
            <FadeIn delay={0.1}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/40 bg-card/40 mb-6 sm:mb-8"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wide">AI Operating System</span>
              <span className="flex items-center gap-1 pl-2 border-l border-border/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-cyan))] animate-pulse" />
                <span className="text-[9px] font-bold text-[hsl(var(--neon-cyan))] uppercase tracking-wider">Live</span>
              </span>
            </FadeIn>
            
            {/* CMPSBL wordmark */}
            <h1 
              className="text-[3rem] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-[-0.06em] leading-[0.85] mb-4 sm:mb-5"
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
            </h1>

            {/* Tagline */}
            <FadeIn delay={0.2} className="mb-6 sm:mb-8">
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground/70 tracking-tight leading-snug mb-2">
                Where machines learn how to
              </p>
              <div className="text-[2.25rem] sm:text-6xl md:text-7xl lg:text-[4.5rem] font-black tracking-[-0.02em] leading-[0.95] min-h-[1.1em]">
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
            </FadeIn>

            {/* Single clear value prop — replaces redundant thesis + subtitle */}
            <FadeIn delay={0.3} className="max-w-lg mx-auto lg:mx-0 mb-7 sm:mb-9">
              <p className="text-sm sm:text-base text-muted-foreground/80 leading-[1.8]">
                CMPSBL gives your software{' '}
                <span className="text-foreground/90 font-medium">persistent memory</span>,{' '}
                <span className="text-foreground/90 font-medium">self-improvement</span>, and{' '}
                <span className="text-foreground/90 font-medium">governed reasoning</span>.
                Every interaction flows through the Memory Stream, where the system
                crystallizes discoveries into exportable capabilities — automatically.
              </p>
            </FadeIn>
            
            {/* CTAs */}
            <FadeIn delay={0.4} className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button 
                asChild 
                size="lg" 
                className="gap-2 px-8 sm:px-10 h-12 sm:h-13 text-sm font-bold rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/auth">
                  <Sparkles className="w-4 h-4" />
                  Start Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="gap-2 px-6 sm:px-8 h-12 sm:h-13 text-sm font-medium rounded-xl border-border/50 hover:border-primary/30 transition-all duration-300 active:scale-[0.98]"
              >
                <Link to="/store?tab=plans">
                  View Plans
                </Link>
              </Button>
            </FadeIn>
          </div>
          
          {/* Right column — Memory River visualization + context */}
          <FadeIn
            delay={0.2}
            className="order-2 flex flex-col gap-4"
          >
            {/* Above River — Architecture blurb */}
            <FadeIn
              delay={0.35}
              className="hidden sm:block rounded-xl border border-border/15 bg-card/25 p-4 gradient-border-glow"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                <h3 className="text-[10px] font-bold text-foreground/60 uppercase tracking-[0.2em]">How Intelligence Flows</h3>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
               A persistent AI runtime where intelligence{' '}
                 <span className="text-foreground/80 font-medium">remembers</span>,{' '}
                 <span className="text-primary font-medium">adapts</span>, and{' '}
                 <span className="font-medium" style={{ color: "hsl(var(--neon-magenta))" }}>evolves</span>{' '}
                 instead of resetting every request.
              </p>
            </FadeIn>

            <Suspense fallback={<div className="h-[200px] rounded-xl border border-border/15 bg-card/10 animate-pulse" />}>
              <MemoryRiverLazy autoCrystallize hideTagline />
            </Suspense>

            {/* Below River — pulse cards */}
            <FadeIn delay={0.7} className="grid grid-cols-3 gap-2">
              {[
                { label: "Memory Depth", value: "Persistent", glow: "--neon-cyan" },
                { label: "Background Processing", value: "Autonomous", glow: "--neon-purple" },
                { label: "Defense Mesh", value: "Always-On", glow: "--neon-magenta" },
              ].map((item) => (
                <div 
                  key={item.label} 
                  className="rounded-lg border border-border/15 bg-card/25 p-2.5 sm:p-3 text-center hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 group shimmer-on-hover glass-edge"
                >
                  <div className="text-[8px] sm:text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em] font-semibold mb-0.5">{item.label}</div>
                  <div className="text-[11px] sm:text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{item.value}</div>
                </div>
              ))}
            </FadeIn>
          </FadeIn>
        </div>
        
        {/* Feature pills */}
        <FadeIn
          delay={0.55}
          className="flex justify-start sm:justify-center gap-2 mb-6 sm:mb-10 -mx-4 px-4 pr-8 sm:mx-0 sm:px-0 sm:pr-0 overflow-x-auto scrollbar-hide pb-1"
        >
          {[
            { icon: Sparkles, label: "Free to Start", href: "/auth" },
            { icon: Brain, label: "Persistent Memory", href: "/persistent-memory" },
            { icon: Layers, label: "24 Capability Packs", href: "/packs" },
            { icon: Shield, label: "Governed Runtime", href: "/documentation" },
          ].map((item, index) => (
            <FadeIn
              key={item.label}
              delay={0.6 + index * 0.05}
            >
              <Link
                to={item.href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border/30 bg-card/30 shrink-0 hover:bg-card/60 hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 active:scale-[0.97]"
              >
                <item.icon className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[11px] font-medium text-foreground/70 whitespace-nowrap">{item.label}</span>
              </Link>
            </FadeIn>
          ))}
        </FadeIn>

        {/* Architecture strip */}
        <FadeIn delay={0.65} className="mb-6 sm:mb-10">
          <div className="flex items-center justify-start sm:justify-center gap-0 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              "Signal",
              "Memory Stream",
              "Governed Runtime",
              "Capability Packs",
              "Sealed Engines",
              "Applications",
            ].map((step, i, arr) => (
              <div key={step} className="flex items-center shrink-0">
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-border/25 bg-card/30">
                  <span className="text-[9px] sm:text-xs font-semibold text-foreground/70 whitespace-nowrap">{step}</span>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-muted-foreground/30 text-[10px] sm:text-xs font-bold px-1 sm:px-1.5">→</span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
        
        {/* Stats bar */}
        <FadeIn delay={0.7}>
          <div 
            className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20 rounded-2xl border border-border/25 bg-card/20 overflow-hidden shadow-lg shadow-primary/[0.03] glass-edge"
          >
            <div className="absolute inset-x-0 top-0 h-px memory-stream-bar opacity-30" />
            <div className="absolute inset-x-0 bottom-0 h-px memory-stream-bar opacity-10" />
            <AnimatedStat value={40} label="Modules" delay={0} />
            <AnimatedStat value={24} label="Capability Packs" delay={1} />
            <AnimatedStat value={20} label="Sealed Products" delay={2} />
            <AnimatedStat value={9} label="System Domains" delay={3} />
          </div>
        </FadeIn>
      </div>
      
      {/* Scroll indicator */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 animate-fade-in opacity-0"
        style={{ animationDelay: "2.5s", animationFillMode: "both" }}
      >
        <span className="text-[9px] text-muted-foreground/30 font-medium tracking-[0.2em] uppercase">Explore</span>
        <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="animate-scroll-bounce">
          <ChevronDown className="w-4 h-4 text-primary/25" />
        </div>
      </div>
    </section>
  );
}
