/**
 * META HERO: Clockless® — powered by the CMPSBL World Engine
 * Studio-grade hero with cinematic typography and fluid motion
 * v10.6.0 ARCHITECT Epoch
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookOpen,
  Code,
  Sparkles,
  ChevronDown,
  Layers,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnginesMembershipHero } from "./EnginesMembershipHero";

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
        className="inline-block w-[3px] h-[0.75em] ml-0.5 rounded-sm"
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
      className="relative text-center py-5 sm:py-6 group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 + delay * 0.08, duration: 0.5 }}
    >
      <div className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums tracking-tight text-foreground">
        {count}{suffix}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1.5 tracking-widest uppercase">{label}</div>
    </motion.div>
  );
}

// ─── Background ─────────────────────────────────────────────────
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Gradient orbs — reduced count, bigger, softer */}
      <motion.div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.08) 0%, transparent 60%)" }}
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-magenta) / 0.06) 0%, transparent 60%)" }}
        animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.5) 100%)" }} />
    </div>
  );
}

// ─── Main Hero ──────────────────────────────────────────────────
export function HeroMetaSubstrate() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-4 sm:pt-8 pb-8 sm:pb-12 overflow-x-clip overflow-y-visible">
      <HeroBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-12 sm:mb-20">
          
          {/* Left column — Copy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-1"
          >
            {/* Engine badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/50 backdrop-blur-md mb-8 sm:mb-10"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">powered by the CMPSBL World Engine</span>
              <span className="flex items-center gap-1 pl-2 border-l border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
              </span>
            </motion.div>
            
            {/* CLOCKLESS — massive, clean */}
            <motion.h1 
              className="text-[4.5rem] sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-[-0.05em] leading-[0.9] mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--neon-purple)) 50%, hsl(var(--primary)) 100%)",
                  backgroundSize: "200% auto",
                  animation: "gradient-shift 8s ease-in-out infinite",
                }}
              >
                Clockless
              </span>
            </motion.h1>

            {/* Tagline block — two lines, centered on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 sm:mb-10"
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-muted-foreground tracking-tight leading-snug">
                Where machines learn to
              </p>
              <div className="mt-1 sm:mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none min-h-[1.2em]">
                <TypedText 
                  texts={["dream.", "adapt.", "evolve.", "remember.", "compose."]}
                  gradientColors={[
                    "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                    "linear-gradient(135deg, hsl(var(--neon-magenta)), hsl(var(--primary)))",
                    "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
                  ]}
                />
              </div>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed"
            >
              A persistent, clockless world engine that gives your AI{' '}
              <span className="text-foreground font-semibold">persistent memory</span>,{' '}
              <span className="text-foreground font-semibold">self-learning</span>, and{' '}
              <span className="text-foreground font-semibold">multi-provider routing</span>{' '}
              — out of the box. 21 integrated modules. One engine.{' '}
              <span className="text-emerald-500 font-bold">Start free, scale to enterprise.</span>
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              <Button 
                asChild 
                size="lg" 
                className="gap-2 px-7 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/codelab">
                  <Code className="w-4 h-4" />
                  Start Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="gap-2 px-7 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-[0.98]"
              >
                <Link to="/engines">
                  <Sparkles className="w-4 h-4" />
                  View Engines
                </Link>
              </Button>
            </motion.div>
            
            {/* Research link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="mt-6 sm:mt-8 text-center lg:text-left"
            >
              <a 
                href="https://zenodo.org/records/18234910?token=eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjkxZDYzZjFlLWM2NTctNDAzNi04ZWE4LTIzNWNiMDljMGQ2NyIsImRhdGEiOnt9LCJyYW5kb20iOiIzZTlkMjA5MzQ0ZGFkNDI2ZTZlMTkwMWYxMzFmOTczYSJ9.H3FugoEHTR2ilPEtZEr-kqRiTgW0FeUDXOrcEE92lek4FK0_h0dNUyJWvtxW-KCHuIEeiqbN5Zot8EqEvXq5gQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Research Documentation</span>
                  <span className="block text-[10px] text-muted-foreground">Zenodo • DOI: 10.5281/zenodo.18234910</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </a>
            </motion.div>
          </motion.div>
          
          {/* Right column — Engines visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 flex items-center justify-center"
          >
            <EnginesMembershipHero />
          </motion.div>
        </div>
        
        {/* Integration badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6 sm:mb-8"
        >
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 text-center mb-3 uppercase tracking-widest font-medium">Works with your stack</p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {[
              { name: 'OpenAI', color: 'bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border-emerald-500/15' },
              { name: 'Anthropic', color: 'bg-orange-500/8 text-orange-600 dark:text-orange-400 border-orange-500/15' },
              { name: 'Google AI', color: 'bg-blue-500/8 text-blue-600 dark:text-blue-400 border-blue-500/15' },
              { name: 'LangChain', color: 'bg-teal-500/8 text-teal-600 dark:text-teal-400 border-teal-500/15' },
              { name: 'Vercel AI', color: 'bg-muted text-foreground/70 border-border/30' },
            ].map((integration, index) => (
              <motion.span
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 + index * 0.04 }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border backdrop-blur-sm",
                  integration.color
                )}
              >
                {integration.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-start sm:justify-center gap-2 sm:gap-3 mb-10 sm:mb-16 -mx-4 px-4 pr-8 sm:mx-0 sm:px-0 sm:pr-0 overflow-x-auto scrollbar-hide pb-1"
        >
          {[
            { icon: Brain, label: "Persistent Memory (FREE)", href: "/persistent-memory" },
            { icon: Sparkles, label: "Composable Artifacts", href: "/store" },
            { icon: Code, label: "Composable Cognitives", href: "/composable-cognitives" },
            { icon: Layers, label: "Engines", href: "/engines" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + index * 0.06 }}
            >
              <Link
                to={item.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/40 bg-card/40 backdrop-blur-sm shrink-0 hover:bg-card/80 hover:border-primary/30 hover:shadow-md transition-all duration-300 active:scale-[0.97]"
              >
                <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground/80 whitespace-nowrap">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="relative"
        >
          <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden">
            {/* Top edge highlight */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            
            <AnimatedStat value={21} label="Modules" delay={0} />
            <AnimatedStat value={200} label="Synergies" delay={1} />
            <AnimatedStat value={175} suffix="k+" label="Lines of Code" delay={2} />
            <AnimatedStat value={360} label="Commands" delay={3} />
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5"
      >
        <span className="text-[10px] text-muted-foreground/40 font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
