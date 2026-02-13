/**
 * META HERO: CMPSBL (Composable) By PromptFluid
 * Classic "Where machines learn to dream" headline with Engines Membership showcase
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
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnginesMembershipHero } from "./EnginesMembershipHero";

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

// Enhanced stats with animated counters, shimmer effect and premium polish
function AnimatedStat({ value, label, suffix = "", delay = 0 }: { 
  value: number; 
  label: string; 
  suffix?: string;
  delay?: number;
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
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
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
      className="relative text-center p-4 sm:p-5 rounded-2xl transition-all duration-300 group cursor-default overflow-hidden" 
      style={{ contain: "layout style" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 + delay * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -3 }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-violet-500/10 transition-all duration-500 rounded-2xl" />
      
      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/20 transition-all duration-300" />
      
      <div className="relative z-10">
        <motion.div 
          className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums"
          animate={hasAnimated ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            {count}{suffix}
          </span>
        </motion.div>
        <div className="text-[11px] sm:text-sm text-muted-foreground font-semibold mt-2 tracking-wide uppercase">{label}</div>
      </div>
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
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-2 sm:pt-8 pb-6 sm:pb-10 overflow-visible safe-area-inset">
      {/* Multi-layer animated background */}
      <div className="absolute inset-0 bg-background overflow-hidden">
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
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center mb-8 sm:mb-20">
          {/* Left: Headlines and CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left order-1"
          >
            {/* Tagline badge with shimmer */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-violet-500/15 backdrop-blur-md mb-6 sm:mb-8 shadow-xl shadow-primary/10 overflow-hidden group"
            >
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                animate={{ translateX: ["−100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </motion.div>
              <span className="text-xs sm:text-sm font-bold text-foreground tracking-wide">Cognitive Operating System</span>
              
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 pl-2.5 border-l border-primary/30">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
              </div>
            </motion.div>
            
            {/* Main headline - Classic "Where machines learn to dream" */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-5 sm:mb-8" style={{ contain: "layout" }}>
              <motion.span 
                className="text-foreground block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                Where Machines
              </motion.span>
              <motion.span 
                className="text-foreground block mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                Learn To
              </motion.span>
              <motion.span 
                className="block mt-2 sm:mt-3"
                style={{ minHeight: "1.15em", height: "1.15em", contain: "strict", overflow: "hidden" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <TypedText 
                  texts={["Dream.", "Remember.", "Adapt.", "Evolve.", "Persist."]}
                  gradientColors={[
                    "linear-gradient(135deg, hsl(280 80% 60%), hsl(310 80% 65%))",
                    "linear-gradient(135deg, hsl(185 100% 50%), hsl(200 80% 60%))",
                    "linear-gradient(135deg, hsl(30 90% 55%), hsl(45 95% 55%))",
                    "linear-gradient(135deg, hsl(145 80% 50%), hsl(175 70% 50%))",
                    "linear-gradient(135deg, hsl(var(--primary)), hsl(260 90% 60%))",
                  ]}
                />
              </motion.span>
            </h1>
            
            {/* Subheadline - Emphasize free dev tools + engines subscription */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-10 leading-relaxed"
            >
              <span className="text-emerald-500 font-bold">All dev tools are FREE</span> — 
              templates, pipelines, memory, CodeLab. 
              <span className="text-foreground font-semibold"> Subscribe to Engines</span> for 
              production-ready orchestration with 
              <span className="text-foreground font-semibold"> 200 synergy pipelines</span> and 
              <span className="text-foreground font-semibold"> 21 core modules</span>.
            </motion.p>
            
            {/* CTA Buttons - NOT full width on mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Button 
                asChild 
                size="lg" 
                className="gap-2.5 px-6 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-target tap-highlight-none"
              >
                <Link to="/codelab">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                  Start Free
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="gap-2.5 px-6 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-semibold group border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 touch-target tap-highlight-none active:scale-[0.98]"
              >
                <Link to="/engines">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  View Engines
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
          
          {/* Right: Engines Membership Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="order-2 flex items-center justify-center"
          >
            <EnginesMembershipHero />
          </motion.div>
        </div>
        
        {/* Integration badges - Shows compatibility with major AI providers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mb-6 sm:mb-8"
        >
          <p className="text-xs text-muted-foreground text-center mb-3">Works with your stack</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: 'OpenAI', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
              { name: 'Anthropic', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
              { name: 'Google AI', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
              { name: 'LangChain', color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
              { name: 'Vercel AI', color: 'bg-foreground/10 text-foreground border-foreground/20' },
            ].map((integration, index) => (
              <motion.span
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border",
                  "backdrop-blur-sm transition-all duration-200 hover:scale-105",
                  integration.color
                )}
              >
                {integration.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Use case pills with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex justify-start sm:justify-center gap-2 sm:gap-4 mb-8 sm:mb-20 -mx-4 px-4 pr-8 sm:mx-0 sm:px-0 sm:pr-0 overflow-x-auto scrollbar-hide pb-2 sm:pb-0"
        >
          {[
            { icon: Brain, label: "Persistent Memory (FREE)", href: "/persistent-memory", hoverColor: "hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-emerald-500/10" },
            { icon: Sparkles, label: "Free Pipelines", href: "/synergies", hoverColor: "hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-violet-500/10" },
            { icon: Code, label: "Free Templates", href: "/marketplace", hoverColor: "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-cyan-500/10" },
            { icon: Layers, label: "Engine Marketplace", href: "/engines", hoverColor: "hover:border-primary/50 hover:bg-primary/10 hover:shadow-primary/10" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + index * 0.1 }}
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
        
        {/* Stats bar with premium glass styling */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative"
        >
          {/* Multi-layer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-violet-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent blur-2xl" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-card/70 via-card/50 to-card/70 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden">
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-primary/30 via-transparent to-violet-500/30 pointer-events-none" style={{ mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "xor" }} />
            
            {/* Inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <AnimatedStat value={21} label="Modules" delay={0} />
            <AnimatedStat value={200} label="Synergies" delay={1} />
            <AnimatedStat value={175} suffix="k+" label="Lines of Code" delay={2} />
            <AnimatedStat value={360} label="Commands" delay={3} />
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
