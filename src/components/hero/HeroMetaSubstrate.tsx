/**
 * META HERO: CMPSBL (Composable) By PromptFluid
 * Cinematic SEBA-focused showcase with evolution pipeline visualization
 * Mobile-first, performance-optimized, visually stunning
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEBAEvolutionHero } from "./SEBAEvolutionHero";

// Enhanced typing animation with smooth morphing
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
    const typingSpeed = isDeleting ? 35 : 70;
    
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
    contain: "layout style paint" as const,
  }), [currentGradient]);
  
  return (
    <span 
      className={cn("inline-flex items-baseline", className)}
      style={gradientStyle}
    >
      <span style={{ display: "inline-block" }}>{displayText}</span>
      <motion.span 
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
        style={{
          display: "inline-block",
          width: "3px",
          height: "0.85em",
          marginLeft: "2px",
          background: "currentColor",
          WebkitTextFillColor: "hsl(var(--primary))",
          borderRadius: "1px",
        }}
        aria-hidden="true"
      />
    </span>
  );
}

// Enhanced stats with animated counters and polish
function AnimatedStat({ value, label, suffix = "", icon: Icon }: { 
  value: number; 
  label: string; 
  suffix?: string;
  icon?: React.ElementType;
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
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * value));
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
    <motion.div 
      ref={ref} 
      className="text-center p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-primary/5" 
      style={{ contain: "layout style" }}
      whileHover={{ scale: 1.03, y: -2 }}
    >
      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tabular-nums">
        <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
          {count}{suffix}
        </span>
      </div>
      <div className="text-[10px] sm:text-sm text-muted-foreground font-medium mt-1">{label}</div>
    </motion.div>
  );
}

// Floating background particles
function BackgroundParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
    })), []
  );
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Scroll indicator
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
    >
      <span className="text-xs text-muted-foreground/60 font-medium tracking-wider uppercase">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
      </motion.div>
    </motion.div>
  );
}

export function HeroMetaSubstrate() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden safe-area-inset">
      {/* Multi-layer animated background */}
      <div className="absolute inset-0 bg-background">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.12) 0%, transparent 50%)",
          }}
          animate={{
            x: [-200, 100, -200],
            y: [-200, 50, -200],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--neon-magenta) / 0.1) 0%, transparent 50%)",
          }}
          animate={{
            x: [200, -100, 200],
            y: [200, -50, 200],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.08) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Subtle floating particles */}
      <BackgroundParticles />
      
      {/* Grid overlay with subtle animation */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      
      {/* Vignette overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.4) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Top section: Text + Visualization side by side */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center mb-10 sm:mb-20">
          {/* Left: Headlines and CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left order-1"
          >
            {/* Tagline badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-violet-500/10 backdrop-blur-md mb-5 sm:mb-8 shadow-lg shadow-primary/5"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </motion.div>
              <span className="text-[11px] sm:text-sm font-semibold text-foreground/90 tracking-wide">Cognitive Operating System</span>
            </motion.div>
            
            {/* Main headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-4 sm:mb-8" style={{ contain: "layout" }}>
              <span className="text-foreground block">
                Where Machines
              </span>
              <span className="text-foreground block mt-1">
                Learn To
              </span>
              <span className="block mt-2 sm:mt-3" style={{ minHeight: "1.15em", height: "1.15em", contain: "strict", overflow: "hidden" }}>
                <TypedText 
                  texts={["Dream.", "Remember.", "Self-Improve.", "Evolve.", "Think.", "Adapt."]}
                  gradientColors={[
                    "linear-gradient(135deg, hsl(280 80% 60%), hsl(320 80% 65%))",
                    "linear-gradient(135deg, hsl(185 100% 50%), hsl(200 80% 60%))",
                    "linear-gradient(135deg, hsl(30 90% 55%), hsl(45 95% 55%))",
                    "linear-gradient(135deg, hsl(145 80% 50%), hsl(175 70% 50%))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(310 90% 60%))",
                    "linear-gradient(135deg, hsl(280 90% 65%), hsl(260 80% 60%))",
                  ]}
                />
              </span>
            </h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-10 leading-relaxed"
            >
              A cognitive substrate with 
              <span className="text-foreground font-semibold"> 14-module architecture</span>, 
              <span className="text-foreground font-semibold"> persistent memory</span>, and 
              <span className="text-foreground font-semibold"> autonomous self-improvement</span>.
              <span className="hidden sm:inline text-muted-foreground/80"> The infrastructure layer for AI that remembers.</span>
            </motion.p>
            
            {/* CTA Buttons with enhanced mobile styling */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Button 
                asChild 
                size="lg" 
                className="gap-2.5 px-6 sm:px-10 h-14 sm:h-14 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-target tap-highlight-none"
              >
                <Link to="/codelab">
                  <Code className="w-5 h-5" />
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="gap-2.5 px-6 sm:px-10 h-14 sm:h-14 text-base font-semibold group border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 touch-target tap-highlight-none active:scale-[0.98]"
              >
                <Link to="/demo">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="w-5 h-5" />
                  </motion.div>
                  Watch Demo
                </Link>
              </Button>
            </motion.div>
            
            {/* Academic Documentation Link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-5 sm:mt-8 text-center lg:text-left"
            >
              <a 
                href="https://zenodo.org/records/18234910?token=eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjkxZDYzZjFlLWM2NTctNDAzNi04ZWE4LTIzNWNiMDljMGQ2NyIsImRhdGEiOnt9LCJyYW5kb20iOiIzZTlkMjA5MzQ0ZGFkNDI2ZTZlMTkwMWYxMzFmOTczYSJ9.H3FugoEHTR2ilPEtZEr-kqRiTgW0FeUDXOrcEE92lek4FK0_h0dNUyJWvtxW-KCHuIEeiqbN5Zot8EqEvXq5gQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5 hover:from-primary/10 hover:to-violet-500/10 hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Research Documentation</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground truncate">Zenodo • DOI: 10.5281/zenodo.18234910</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
              </a>
            </motion.div>
          </motion.div>
          
          {/* Right: SEBA Evolution Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="order-2 flex items-center justify-center"
          >
            <SEBAEvolutionHero />
          </motion.div>
        </div>
        
        {/* Use case pills with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-start sm:justify-center gap-2.5 sm:gap-4 mb-10 sm:mb-20 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide pb-2 sm:pb-0"
        >
          {[
            { icon: Gamepad2, label: "Gaming AI", href: "/gaming", hoverColor: "hover:border-purple-500/50 hover:bg-purple-500/10 hover:shadow-purple-500/10" },
            { icon: Code, label: "Developer Tools", href: "/developers", hoverColor: "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-cyan-500/10" },
            { icon: Building2, label: "Enterprise", href: "/use-cases", hoverColor: "hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-amber-500/10" },
            { icon: Layers, label: "Substrate Docs", href: "/substrate", hoverColor: "hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-emerald-500/10" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-border/50 bg-card/60 backdrop-blur-md shrink-0",
                  "hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-lg",
                  item.hoverColor
                )}
              >
                <item.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Stats bar with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative"
        >
          {/* Glow effect behind stats */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5 blur-3xl" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 p-5 sm:p-10 rounded-3xl border border-border/40 bg-gradient-to-br from-card/60 via-card/40 to-card/60 backdrop-blur-xl shadow-2xl shadow-black/5">
            <AnimatedStat value={14} label="Core Modules" />
            <AnimatedStat value={124} suffix="+" label="API Actions" />
            <AnimatedStat value={60} suffix="+" label="Data Tables" />
            <AnimatedStat value={100} suffix="ms" label="Avg Latency" />
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
