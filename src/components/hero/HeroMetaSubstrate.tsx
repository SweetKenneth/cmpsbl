/**
 * META HERO: CMPSBL (Composable) By PromptFluid
 * Cinematic, head-turning showcase of substrate versatility
 * Mobile-first, performance-optimized
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Brain, 
  Moon, 
  Shield, 
  Zap, 
  Eye,
  MessageSquare,
  Settings,
  Cpu,
  Network,
  Fingerprint,
  RefreshCw,
  BookOpen,
  Gamepad2,
  Code,
  Building2,
  Play,
  Sparkles,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

// The 14 core modules with industries they power (v6.0.0)
const coreModules = [
  { icon: Cpu, name: "Core", desc: "Kernel orchestration", color: "hsl(var(--muted-foreground))" },
  { icon: Network, name: "Ripple", desc: "Event propagation", color: "hsl(150 80% 50%)" },
  { icon: Fingerprint, name: "Access", desc: "Identity & auth", color: "hsl(220 80% 60%)" },
  { icon: Brain, name: "Brain", desc: "Persistent memory", color: "hsl(var(--neon-cyan))" },
  { icon: MessageSquare, name: "Decode", desc: "Multi-modal AI", color: "hsl(var(--neon-purple))" },
  { icon: Shield, name: "Defense", desc: "Threat detection", color: "hsl(var(--neon-amber))" },
  { icon: Zap, name: "Nexus", desc: "Smart routing", color: "hsl(150 80% 50%)" },
  { icon: Eye, name: "Vision", desc: "Observability", color: "hsl(var(--neon-blue))" },
  { icon: Moon, name: "Dream", desc: "Offline learning", color: "hsl(var(--neon-magenta))" },
  { icon: Settings, name: "System", desc: "Configuration", color: "hsl(var(--destructive))" },
  { icon: RefreshCw, name: "Modernizer", desc: "Self-improvement", color: "hsl(30 80% 55%)" },
  { icon: Plug, name: "Integration", desc: "Enterprise connect", color: "hsl(280 80% 60%)" },
  { icon: Sparkles, name: "Cortex", desc: "Autonomous orchestrator", color: "hsl(270 80% 60%)" },
  { icon: BookOpen, name: "Inclusive", desc: "Human compatibility", color: "hsl(330 80% 60%)" },
];

// Use cases that rotate through - compelling future applications
const useCases = [
  { icon: Gamepad2, label: "NPCs that dream & evolve", industry: "Gaming", color: "text-purple-500" },
  { icon: Building2, label: "Self-healing enterprises", industry: "Enterprise", color: "text-amber-500" },
  { icon: Code, label: "Chatbots with memory", industry: "Development", color: "text-cyan-500" },
  { icon: Brain, label: "Cooking apps that learn", industry: "Consumer", color: "text-green-500" },
  { icon: Shield, label: "Mid-flight self-repair", industry: "Aviation", color: "text-red-500" },
];

// Floating particle component
function FloatingParticle({ delay, duration, size, color, startX, startY }: {
  delay: number;
  duration: number;
  size: number;
  color: string;
  startX: number;
  startY: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: `${startX}%`,
        top: `${startY}%`,
        filter: "blur(1px)",
      }}
      animate={{
        y: [0, -100, -200],
        x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

// Connection line between modules
function ConnectionLine({ from, to, delay }: { from: number; to: number; delay: number }) {
  const moduleCount = 14; // v6.0.0: 14 modules
  const fromAngle = (from / moduleCount) * Math.PI * 2 - Math.PI / 2;
  const toAngle = (to / moduleCount) * Math.PI * 2 - Math.PI / 2;
  const radius = 140;
  
  const x1 = Math.cos(fromAngle) * radius + 160;
  const y1 = Math.sin(fromAngle) * radius + 160;
  const x2 = Math.cos(toAngle) * radius + 160;
  const y2 = Math.sin(toAngle) * radius + 160;
  
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="url(#lineGradient)"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    />
  );
}

// Central substrate visualization
function SubstrateVisualization() {
  const [activeModule, setActiveModule] = useState(0);
  const [activeUseCase, setActiveUseCase] = useState(0);
  
  // Rotate through modules
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule((prev) => (prev + 1) % coreModules.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // Rotate through use cases
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUseCase((prev) => (prev + 1) % useCases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentUseCase = useCases[activeUseCase];
  
  // Calculate orbit radius as percentage based on container
  const orbitRadius = 42; // percentage from center for icons
  
  return (
    <div className="relative w-full max-w-[260px] sm:max-w-[380px] md:max-w-[460px] aspect-square mx-auto flex items-center justify-center">
      {/* Floating particles - hidden on mobile for cleaner look */}
      <div className="hidden sm:block">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.5}
            duration={4 + Math.random() * 2}
            size={2 + Math.random() * 3}
            color={`hsl(${180 + Math.random() * 60} 80% 60% / 0.6)`}
            startX={20 + Math.random() * 60}
            startY={70 + Math.random() * 30}
          />
        ))}
      </div>
      
      {/* SVG container for rings and connections - centered */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--neon-magenta))" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Animated connection lines */}
        <ConnectionLine from={0} to={3} delay={0} />
        <ConnectionLine from={3} to={8} delay={1} />
        <ConnectionLine from={8} to={4} delay={2} />
        <ConnectionLine from={4} to={6} delay={3} />
        <ConnectionLine from={6} to={10} delay={4} />
        
        {/* Outer orbit ring */}
        <motion.circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="4 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        
        {/* Middle ring with glow */}
        <circle
          cx="160"
          cy="160"
          r="90"
          fill="none"
          stroke="hsl(var(--neon-cyan) / 0.2)"
          strokeWidth="1"
        />
        
        {/* Inner ring */}
        <motion.circle
          cx="160"
          cy="160"
          r="50"
          fill="url(#coreGlow)"
          stroke="hsl(var(--primary) / 0.4)"
          strokeWidth="2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transformOrigin: "center" }}
        />
      </svg>
      
      {/* Module icons orbiting - properly centered */}
      {coreModules.map((mod, i) => {
        const angle = (i / coreModules.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(angle) * orbitRadius;
        const y = 50 + Math.sin(angle) * orbitRadius;
        const isActive = i === activeModule;
        
        return (
          <motion.div
            key={mod.name}
            className="absolute flex items-center justify-center cursor-pointer z-20"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: isActive ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setActiveModule(i)}
          >
            <div
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                isActive ? "shadow-lg" : ""
              )}
              style={{
                background: isActive ? mod.color : "hsl(var(--background))",
                border: `2px solid ${mod.color}`,
                boxShadow: isActive ? `0 0 20px ${mod.color}60` : `0 0 8px ${mod.color}40`,
              }}
            >
              <mod.icon 
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" 
                style={{ color: isActive ? "hsl(var(--background))" : mod.color }}
              />
            </div>
            
            {/* Module label on active */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
                  {mod.name}
                </span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
      
      {/* Central core content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="text-center"
          key={activeUseCase}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <currentUseCase.icon className={cn("w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2", currentUseCase.color)} />
          <div className="text-xs sm:text-sm font-bold text-foreground">{currentUseCase.label}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">{currentUseCase.industry}</div>
        </motion.div>
      </div>
    </div>
  );
}

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
          
          {/* Right: Substrate Visualization - ORDER 2 on all screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2 flex items-center justify-center"
          >
            <SubstrateVisualization />
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
