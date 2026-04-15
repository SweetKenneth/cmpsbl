/**
 * META HERO: CMPSBL® Software Ascension Center
 * Clean, solution-forward hero with typed rotation and single CTA.
 * 
 * PERFORMANCE: Uses pure CSS animations instead of framer-motion
 * to avoid 56KB parse cost on the landing page critical path.
 * Respects prefers-reduced-motion for older/low-power devices.
 */

import React, { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { CmpsblWordmark } from "./CmpsblWordmark";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ChevronDown,
  Wrench,
  Scan,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const HeroAscensionVisualLazy = lazy(() => import("./HeroAscensionVisual").then(m => ({ default: m.HeroAscensionVisual })));

// ─── Staggered CSS fade-in helper ──────────────────────────────
function FadeIn({ delay = 0, className = "", children, ...props }: { 
  delay?: number; className?: string; children: React.ReactNode; 
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("animate-fade-in", className)}
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
function AnimatedStat({ value, label, sublabel, suffix = "", delay = 0 }: { 
  value: number; label: string; sublabel?: string; suffix?: string; delay?: number;
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
      className="relative text-center py-5 sm:py-6 group animate-fade-in"
      style={{ animationDelay: `${1.2 + delay * 0.06}s`, animationFillMode: "both" }}
    >
      <div className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums tracking-tight text-foreground transition-all duration-500" style={{ backgroundImage: "linear-gradient(180deg, hsl(var(--foreground)), hsl(var(--foreground) / 0.7))", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {count}{suffix}
      </div>
      <div className="text-[10px] sm:text-xs text-foreground/70 font-bold mt-1.5 tracking-[0.14em] uppercase">{label}</div>
      {sublabel && (
        <div className="text-[8px] sm:text-[9px] text-muted-foreground/40 font-medium mt-0.5 tracking-[0.08em]">{sublabel}</div>
      )}
    </div>
  );
}

// ─── Background — pure CSS, no framer-motion ────────────────────
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full animate-hero-orb-1"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.07) 0%, hsl(var(--neon-cyan) / 0.02) 40%, transparent 60%)" }}
      />
      <div
        className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full animate-hero-orb-2"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-magenta) / 0.06) 0%, hsl(var(--neon-magenta) / 0.015) 40%, transparent 60%)" }}
      />
      <div
        className="absolute top-1/4 left-1/2 w-[500px] h-[500px] rounded-full animate-hero-orb-3"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.05) 0%, hsl(var(--neon-purple) / 0.01) 40%, transparent 55%)" }}
      />
      <div className="absolute inset-0 substrate-grid-bg opacity-[0.3] dark:opacity-[0.5]" />
      <div className="absolute inset-0 texture-noise" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.5) 70%, hsl(var(--background) / 0.85) 100%)" }} />
    </div>
  );
}

// ─── Main Hero ──────────────────────────────────────────────────
export function HeroMetaSubstrate() {
  return (
    <section 
      aria-label="CMPSBL hero"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-4 sm:pt-8 pb-6 sm:pb-12 overflow-x-clip overflow-y-visible"
    >
      <HeroBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* ─── Desktop: side-by-side · Mobile: stacked ─── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center mb-6 sm:mb-14">
          
          {/* ─── LEFT: Text content ─── */}
          <div className="text-center lg:text-left mb-8 lg:mb-0">
          
            {/* Software Reimagined banner */}
            <FadeIn delay={0}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-border/30 bg-card/30 backdrop-blur-sm mb-5 sm:mb-8 shadow-lg shadow-primary/[0.03]"
            >
              <Wrench className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wide">Governed Cognitive Infrastructure</span>
              <span className="flex items-center gap-1.5 pl-2.5 border-l border-border/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-cyan))] animate-pulse" />
                <span className="text-[10px] font-bold text-[hsl(var(--neon-cyan))] uppercase tracking-[0.12em]">Live</span>
              </span>
            </FadeIn>

            {/* CMPSBL Logo */}
            <div className="mb-3 sm:mb-6">
              <CmpsblWordmark className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl" />
            </div>
            
            {/* Headline stack */}
            <h1 className="tracking-[-0.03em] leading-[1.1]">
              <FadeIn delay={0}>
                <span className="block text-xs sm:text-sm md:text-base font-bold text-muted-foreground/60 mb-3 tracking-[0.18em] uppercase">
                  Where machines learn how to
                </span>
              </FadeIn>
              <FadeIn delay={0.05}>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black min-h-[1.2em]">
                  <TypedText 
                    texts={["dream.", "ascend.", "adapt.", "evolve.", "reason."]}
                    gradientColors={[
                      "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
                      "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
                      "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))",
                      "linear-gradient(135deg, hsl(var(--neon-magenta)), hsl(var(--primary)))",
                      "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))",
                    ]}
                  />
                </span>
              </FadeIn>
            </h1>

            {/* Value prop */}
            <FadeIn delay={0.1} className="max-w-lg mx-auto lg:mx-0 mt-4 sm:mt-6 mb-6 sm:mb-10">
              <p className="text-sm sm:text-base text-muted-foreground/80 font-medium leading-relaxed mb-4">
                Our <span className="text-foreground font-bold">patent-pending dual-layer technology</span> ascends your code — adding <span className="text-foreground font-semibold">governance</span>, <span className="text-foreground font-semibold">security</span>, and <span className="text-foreground font-semibold">resilience</span> without modifying a single line.
              </p>
              <p className="text-base sm:text-lg md:text-xl font-black tracking-tight leading-snug mb-3" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Your code remains unchanged.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/60 font-semibold leading-relaxed tracking-wide">
                90+ languages · Runs in minutes · Zero AI in the output
              </p>
            </FadeIn>
            
            {/* CTA */}
            <FadeIn delay={0.15} className="flex justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
              <div className="relative group rounded-xl p-[1.5px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--primary)))" }}>
                <Button 
                  asChild 
                  size="lg" 
                  className="gap-2 h-12 px-8 w-full text-sm font-bold rounded-[10px] bg-background hover:bg-card/90 text-foreground transition-all duration-300 shadow-lg shadow-primary/[0.06]"
                >
                  <Link to="/ascension">
                    <Wrench className="w-4 h-4 shrink-0 text-primary" />
                    Ascend Your Code
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            {/* Trust line */}
            <FadeIn delay={0.2} className="mt-3 mb-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-semibold tracking-wide">
                Diagnostic in seconds · Restoration in minutes · Your code is never stored or&nbsp;reused
              </p>
            </FadeIn>

            {/* Zenodo */}
            <FadeIn delay={0.25} className="flex justify-center lg:justify-start mt-3">
              <a
                href="https://zenodo.org/records/18895141"
                target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[hsl(var(--neon-purple)/0.4)] bg-[hsl(var(--neon-purple)/0.08)] backdrop-blur-sm hover:border-[hsl(var(--neon-purple)/0.6)] hover:bg-[hsl(var(--neon-purple)/0.14)] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[hsl(var(--neon-purple)/0.1)]"
              >
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--neon-purple))] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[hsl(var(--neon-purple))] transition-colors tracking-wide">
                  Academic Prior Art — Zenodo v13.5
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--neon-purple)/0.6)] group-hover:text-[hsl(var(--neon-purple))] transition-colors" />
              </a>
            </FadeIn>
          </div>

          {/* ─── RIGHT: DREAM Ascension Visual + supporting elements ─── */}
          <FadeIn delay={0.3} className="w-full flex flex-col">
            <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 sm:mb-4">
              This is what ascension looks like
            </p>
            <Suspense fallback={<div className="h-[200px] lg:h-[340px] rounded-xl border border-border/15 bg-card/10 animate-pulse" />}>
              <HeroAscensionVisualLazy />
            </Suspense>

            {/* ─── How it works steps (desktop only, balances the column) ─── */}
            <div className="hidden lg:block mt-6">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Scan, label: "Scan", desc: "40 Primitives analyze your codebase", color: "var(--neon-cyan)" },
                  { icon: ShieldCheck, label: "Ascend", desc: "Governance & security layers applied", color: "var(--neon-purple)" },
                  { icon: Layers, label: "Export", desc: "Ship in 90+ languages, unchanged", color: "var(--neon-magenta)" },
                ].map((step, i) => (
                  <div
                    key={step.label}
                    className="relative flex flex-col items-center text-center p-4 rounded-xl border border-border/20 bg-card/10 backdrop-blur-sm group hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg mb-2" style={{ background: `hsl(${step.color} / 0.12)` }}>
                      <step.icon className="w-4 h-4" style={{ color: `hsl(${step.color})` }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Step {i + 1}</span>
                    <span className="text-xs font-bold text-foreground">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground/70 font-medium mt-1 leading-tight">{step.desc}</span>
                  </div>
                ))}
              </div>

              {/* Technology badges */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {["Patent-Pending", "Zero AI in Output", "Dual-Layer Architecture", "8hr Autonomous Cycles"].map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border border-border/25 bg-card/15 text-muted-foreground/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ─── Stats bar (full-width below both columns) ─── */}
        <FadeIn delay={0.35}>
          <div 
            className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20 rounded-2xl border border-border/25 bg-card/20 overflow-hidden shadow-xl shadow-primary/[0.04] glass-edge max-w-3xl mx-auto"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-50" />
            <AnimatedStat value={40} label="Primitives" sublabel="core system modules" delay={0} />
            <AnimatedStat value={25} label="Export Languages" sublabel="deployment targets" delay={1} />
            <AnimatedStat value={8} label="Hour Cycles" sublabel="autonomous processing loop" suffix="hr" delay={2} />
            <AnimatedStat value={6} label="ORCID Works" sublabel="academic lineage" delay={3} />
          </div>
        </FadeIn>
      </div>
      
      {/* Scroll indicator */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 animate-fade-in"
        style={{ animationDelay: "2.5s", animationFillMode: "both" }}
      >
        <span className="text-[9px] text-muted-foreground/50 font-semibold tracking-[0.2em] uppercase">Explore</span>
        <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="animate-scroll-bounce">
          <ChevronDown className="w-4 h-4 text-primary/25" />
        </div>
      </div>
    </section>
  );
}
