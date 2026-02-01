/**
 * META HERO: CMPSBL (Composable) By PromptFluid
 * Cinematic SEBA-focused showcase with evolution pipeline visualization
 * Mobile-first, performance-optimized
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookOpen,
  Gamepad2,
  Code,
  Building2,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEBAEvolutionHero } from "./SEBAEvolutionHero";
// No legacy SubstrateVisualization - using SEBAEvolutionHero instead

// Typing animation for headline with gradient colors - optimized to prevent forced reflows
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
    const typingSpeed = isDeleting ? 40 : 80;
    
    if (!isDeleting && displayText === currentText) {
      const timeout = setTimeout(() => setIsDeleting(true), 2500);
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
  
  // Use CSS containment and fixed dimensions to prevent layout thrashing
  // Note: Using separate style objects to avoid React's shorthand property collision warning
  const gradientStyle = useMemo(() => ({
    backgroundImage: currentGradient,
    backgroundClip: "text" as const,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    contain: "layout style paint" as const,
  }), [currentGradient]);
  
  return (
    <span 
      className={cn("inline-flex items-baseline", className)}
      style={gradientStyle}
    >
      <span style={{ display: "inline-block" }}>{displayText}</span>
      <span 
        style={{
          display: "inline-block",
          width: "0.6ch",
          height: "1em",
          lineHeight: "1em",
          textAlign: "center",
          WebkitTextFillColor: "hsl(var(--foreground))",
          animation: "blink 1s step-end infinite",
          contain: "strict",
        }}
        aria-hidden="true"
      >|</span>
    </span>
  );
}

// Stats with animated counters - optimized to prevent forced reflows
function AnimatedStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
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
          const duration = 1500;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5, rootMargin: "50px" }
    );
    
    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  
  return (
    <div ref={ref} className="text-center" style={{ contain: "layout style" }}>
      <div className="text-xl sm:text-3xl md:text-4xl font-black text-foreground">
        {count}{suffix}
      </div>
      <div className="text-[10px] sm:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function HeroMetaSubstrate() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-10 sm:py-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-background">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 20%, hsl(var(--neon-cyan) / 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 80%, hsl(var(--neon-magenta) / 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 50% 50%, hsl(var(--neon-purple) / 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 20%, hsl(var(--neon-cyan) / 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), 
            linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Top section: Text + Visualization side by side - TEXT FIRST on mobile */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center mb-8 sm:mb-16">
          {/* Left: Headlines and CTAs - ORDER 1 on all screens */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-1"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span className="text-[11px] sm:text-sm font-medium text-foreground/90">Cognitive Operating System</span>
            </motion.div>
            
            {/* Main headline - fixed height and containment to prevent CLS */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-3 sm:mb-6" style={{ contain: "layout" }}>
              <span className="text-foreground block">Where Machines Learn To</span>
              <span className="block mt-1 sm:mt-2" style={{ minHeight: "1.2em", height: "1.2em", contain: "strict", overflow: "hidden" }}>
                <TypedText 
                  texts={["Dream.", "Remember.", "Self-Improve.", "Evolve.", "Think.", "Adapt."]}
                  gradientColors={[
                    "linear-gradient(135deg, hsl(280 80% 60%), hsl(320 80% 60%))",
                    "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(200 80% 60%))",
                    "linear-gradient(135deg, hsl(30 80% 55%), hsl(45 90% 55%))",
                    "linear-gradient(135deg, hsl(150 80% 50%), hsl(180 70% 50%))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
                    "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(260 80% 65%))",
                  ]}
                />
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-5 sm:mb-8 leading-relaxed">
              A cognitive substrate with 
              <span className="text-foreground font-semibold"> 14-module architecture</span>, 
              <span className="text-foreground font-semibold"> persistent memory</span>, and 
              <span className="text-foreground font-semibold"> autonomous self-improvement</span>.
              <span className="hidden sm:inline"> The infrastructure layer for AI that remembers.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-4">
              <Button asChild size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                <Link to="/codelab">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-12 text-sm sm:text-base font-medium group border-border/60 hover:border-primary/50">
                <Link to="/demo">
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            {/* Academic Documentation Link - Prominent */}
            <div className="mt-4 sm:mt-6 text-center lg:text-left">
              <a 
                href="https://zenodo.org/records/18234910?token=eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjkxZDYzZjFlLWM2NTctNDAzNi04ZWE4LTIzNWNiMDljMGQ2NyIsImRhdGEiOnt9LCJyYW5kb20iOiIzZTlkMjA5MzQ0ZGFkNDI2ZTZlMTkwMWYxMzFmOTczYSJ9.H3FugoEHTR2ilPEtZEr-kqRiTgW0FeUDXOrcEE92lek4FK0_h0dNUyJWvtxW-KCHuIEeiqbN5Zot8EqEvXq5gQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <div className="text-left min-w-0">
                  <span className="block text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">Research Documentation</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground truncate">Zenodo • DOI: 10.5281/zenodo.18234910</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
              </a>
            </div>
          </motion.div>
          
          {/* Right: SEBA Evolution Hero - ORDER 2 on all screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2 flex items-center justify-center"
          >
            <SEBAEvolutionHero />
          </motion.div>
        </div>
        
        {/* Use case pills - horizontal scroll on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-start sm:justify-center gap-2 sm:gap-4 mb-8 sm:mb-16 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide pb-1 sm:pb-0"
        >
          {[
            { icon: Gamepad2, label: "Gaming AI", href: "/gaming", color: "text-purple-500 hover:border-purple-500/50 hover:bg-purple-500/10" },
            { icon: Code, label: "Developer Tools", href: "/developers", color: "text-cyan-500 hover:border-cyan-500/50 hover:bg-cyan-500/10" },
            { icon: Building2, label: "Enterprise", href: "/use-cases", color: "text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/10" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm shrink-0",
                "hover:bg-card/80 active:scale-[0.98] transition-all duration-200",
                item.color
              )}
            >
              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </motion.div>
        
        {/* Stats bar - 2x2 grid on mobile for balance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 p-4 sm:p-8 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md"
        >
          <AnimatedStat value={14} label="Core Modules" />
          <AnimatedStat value={124} suffix="+" label="API Actions" />
          <AnimatedStat value={60} suffix="+" label="Data Tables" />
          <AnimatedStat value={100} suffix="ms" label="Avg Latency" />
        </motion.div>
      </div>
    </section>
  );
}
