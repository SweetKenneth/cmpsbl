/**
 * SEBA Evolution Hero — Self-Evolving Bounded Agent Visualization
 * A stunning 5-phase cognitive evolution flow with animated data flows
 * Completely unique, S-tier visual centerpiece
 */

import React, { useEffect, useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Lightbulb, 
  Scale, 
  ShieldCheck, 
  Sparkles,
  Zap,
  ArrowRight,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

// SEBA's 5 evolution phases with enhanced styling
const sebaPhases = [
  { 
    id: "cognize", 
    name: "Cognize", 
    icon: Brain, 
    color: "from-neon-cyan via-neon-cyan to-neon-blue",
    glowColor: "185 100% 50%",
    borderColor: "border-neon-cyan/60",
    bgColor: "bg-neon-cyan/15",
    shadowColor: "shadow-neon-cyan/30",
    description: "Analyze memory, learning patterns, reasoning gaps"
  },
  { 
    id: "propose", 
    name: "Propose", 
    icon: Lightbulb, 
    color: "from-neon-amber via-neon-amber to-neon-amber",
    glowColor: "38 100% 55%",
    borderColor: "border-neon-amber/60",
    bgColor: "bg-neon-amber/15",
    shadowColor: "shadow-neon-amber/30",
    description: "Map insights to improvement actions"
  },
  { 
    id: "evaluate", 
    name: "Evaluate", 
    icon: Scale, 
    color: "from-neon-purple via-neon-purple to-neon-purple",
    glowColor: "280 100% 65%",
    borderColor: "border-neon-purple/60",
    bgColor: "bg-neon-purple/15",
    shadowColor: "shadow-neon-purple/30",
    description: "Risk assessment & impact scoring"
  },
  { 
    id: "gate", 
    name: "Gate", 
    icon: ShieldCheck, 
    color: "from-neon-green via-neon-green to-neon-green",
    glowColor: "145 80% 50%",
    borderColor: "border-neon-green/60",
    bgColor: "bg-neon-green/15",
    shadowColor: "shadow-neon-green/30",
    description: "Governance safety check"
  },
  { 
    id: "apply", 
    name: "Apply", 
    icon: Sparkles, 
    color: "from-neon-magenta via-neon-magenta to-neon-magenta",
    glowColor: "340 100% 60%",
    borderColor: "border-neon-magenta/60",
    bgColor: "bg-neon-magenta/15",
    shadowColor: "shadow-neon-magenta/30",
    description: "Evolution execution with rollback"
  },
];

// Enhanced animated connection between phases
const PhaseConnector = memo(function PhaseConnector({ 
  isActive, 
  isPassed,
  delay,
  fromColor,
  toColor,
}: { 
  isActive: boolean;
  isPassed: boolean;
  delay: number;
  fromColor: string;
  toColor: string;
}) {
  return (
    <div className="hidden sm:flex items-center justify-center w-6 md:w-10 lg:w-14 relative">
      {/* Base line with gradient when passed */}
      <div className="absolute inset-0 flex items-center">
        <div className={cn(
          "h-[2px] w-full transition-all duration-700",
          isPassed 
            ? "bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30" 
            : "bg-gradient-to-r from-border/40 to-border/20"
        )} />
      </div>
      
      {/* Animated energy pulse */}
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-1.5 w-4 rounded-full bg-gradient-to-r from-primary/0 via-primary to-primary/0"
            style={{
              boxShadow: "0 0 12px hsl(var(--primary)), 0 0 24px hsl(var(--primary) / 0.5)",
            }}
            animate={{
              x: [-20, 60],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
      
      {/* Arrow indicator */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          opacity: isPassed || isActive ? 1 : 0.3,
        }}
        transition={{ duration: 0.5 }}
      >
        <ArrowRight className={cn(
          "w-3 h-3 z-10 transition-colors duration-300",
          isPassed ? "text-primary" : isActive ? "text-primary" : "text-muted-foreground/30"
        )} />
      </motion.div>
    </div>
  );
});

// Enhanced individual phase node with 3D depth
const PhaseNode = memo(function PhaseNode({
  phase,
  index,
  isActive,
  isPassed,
  isHovered,
  onHover,
}: {
  phase: typeof sebaPhases[0];
  index: number;
  isActive: boolean;
  isPassed: boolean;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
}) {
  const Icon = phase.icon;
  const showDetails = isActive || isHovered;
  
  return (
    <motion.div
      className="relative flex flex-col items-center overflow-visible"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Multi-layer glow effect for depth */}
      <motion.div
        className="absolute -inset-6 rounded-3xl blur-2xl pointer-events-none"
        style={{ background: `hsl(${phase.glowColor} / 0.3)` }}
        animate={{
          opacity: isActive ? 0.9 : isHovered ? 0.5 : 0,
          scale: isActive ? 1.3 : 1,
        }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="absolute -inset-3 rounded-2xl blur-lg pointer-events-none"
        style={{ background: `hsl(${phase.glowColor} / 0.4)` }}
        animate={{
          opacity: isActive ? 0.8 : isHovered ? 0.3 : 0,
          scale: isActive ? 1.15 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Animated pulse rings */}
      {isActive && (
        <>
          <motion.div
            className={cn(
              "absolute -inset-3 rounded-2xl border-2",
              phase.borderColor
            )}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={cn(
              "absolute -inset-5 rounded-2xl border",
              (phase.borderColor ?? 'border-primary/60').replace('/60', '/30')
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </>
      )}
      
      {/* Main node with enhanced styling - overflow-visible ensures icons aren't clipped */}
      <motion.div
        className={cn(
          "relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] lg:w-20 lg:h-20 rounded-2xl",
          "flex items-center justify-center cursor-pointer",
          "border-2 transition-all duration-300",
          "shadow-lg overflow-visible",
          isActive || isPassed ? phase.borderColor : "border-border/40",
          isActive 
            ? `bg-gradient-to-br ${phase.color}` 
            : isPassed 
              ? phase.bgColor 
              : "bg-card"
        )}
        animate={{
          scale: isActive ? 1.12 : isHovered ? 1.06 : 1,
          y: isActive ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          boxShadow: isActive 
            ? `0 8px 32px hsl(${phase.glowColor} / 0.4), 0 0 60px hsl(${phase.glowColor} / 0.2), inset 0 1px 0 rgba(255,255,255,0.2)` 
            : isHovered
              ? `0 4px 20px hsl(${phase.glowColor} / 0.2)`
              : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Inner glow overlay */}
        {isActive && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/0 to-white/20 pointer-events-none" />
        )}
        
        <Icon className={cn(
          "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-all duration-300 relative z-10",
          isActive ? "text-white drop-shadow-lg" : isPassed ? "text-foreground" : "text-muted-foreground"
        )} />
        
        {/* Completion indicator with animation - z-20 ensures it renders above the node */}
        <AnimatePresence>
          {isPassed && !isActive && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full bg-gradient-to-br from-neon-green to-neon-green flex items-center justify-center shadow-lg shadow-neon-green/30"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Phase label with enhanced typography */}
      <div className={cn(
        "mt-3 sm:mt-4 text-center transition-all duration-300",
        isActive ? "opacity-100" : "opacity-70"
      )}>
        <motion.span 
          className={cn(
            "text-xs sm:text-sm font-bold block tracking-wide",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
        >
          {phase.name}
        </motion.span>
        
        {/* Phase description with smooth reveal */}
        <AnimatePresence mode="wait">
          {showDetails && (
            <motion.span
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] sm:text-xs text-muted-foreground block max-w-[85px] sm:max-w-[100px] mt-1.5 leading-tight"
            >
              {phase.description}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Enhanced floating data particles with variety
function DataParticles({ isActive }: { isActive: boolean }) {
  const particles = useMemo(() => 
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      delay: i * 0.2,
      duration: 2.5 + Math.random() * 2,
      size: 2 + Math.random() * 4,
      startX: 10 + Math.random() * 80,
      startY: 75 + Math.random() * 25,
      hue: [185, 280, 340, 145, 38][Math.floor(Math.random() * 5)],
    })), []
  );
  
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            background: `hsl(${p.hue} 80% 60%)`,
            boxShadow: `0 0 ${p.size * 2}px hsl(${p.hue} 80% 60% / 0.6)`,
          }}
          animate={{
            y: [0, -180, -350],
            x: [0, Math.random() * 50 - 25, Math.random() * 80 - 40],
            opacity: [0, 0.9, 0],
            scale: [0.4, 1.2, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Premium status indicators with micro-animations and glass styling
function StatusPanel({ 
  activePhase, 
  cycleCount, 
  gateStatus 
}: { 
  activePhase: number;
  cycleCount: number;
  gateStatus: "open" | "closed" | "pending";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-5 sm:mt-8"
    >
      {/* Phase indicator with progress ring */}
      <motion.div 
        className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-border/50 shadow-lg shadow-black/5"
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Mini progress ring */}
        <div className="relative w-5 h-5">
          <svg className="w-5 h-5 -rotate-90">
            <circle
              cx="10"
              cy="10"
              r="8"
              className="fill-none stroke-border/30"
              strokeWidth="2"
            />
            <motion.circle
              cx="10"
              cy="10"
              r="8"
              className="fill-none stroke-primary"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: (activePhase + 1) / 5 }}
              transition={{ duration: 0.5 }}
              style={{ pathLength: (activePhase + 1) / 5 }}
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="w-2.5 h-2.5 text-primary" />
          </motion.div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">Phase</span>
          <span className="text-xs font-bold font-mono text-foreground">
            {activePhase + 1} / 5
          </span>
        </div>
      </motion.div>
      
      {/* Gate status with enhanced visual feedback */}
      <motion.div 
        className={cn(
          "relative flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md border shadow-lg overflow-hidden",
          gateStatus === "open" ? "bg-gradient-to-br from-neon-green/15 to-neon-green/5 border-neon-green/40" :
          gateStatus === "closed" ? "bg-gradient-to-br from-neon-magenta/15 to-neon-magenta/5 border-neon-magenta/40" :
          "bg-gradient-to-br from-neon-amber/15 to-neon-amber/5 border-neon-amber/40"
        )}
        animate={{
          boxShadow: gateStatus === "open" 
            ? "0 4px 24px rgba(52, 211, 153, 0.25)" 
            : gateStatus === "closed"
              ? "0 4px 24px rgba(251, 113, 133, 0.25)"
              : "0 4px 24px rgba(251, 191, 36, 0.25)"
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Animated background pulse */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-30",
            gateStatus === "open" ? "bg-neon-green" :
            gateStatus === "closed" ? "bg-neon-magenta" : "bg-neon-amber"
          )}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <motion.div
          animate={gateStatus === "pending" ? { rotate: [0, 15, -15, 0] } : {}}
          transition={{ duration: 0.6, repeat: gateStatus === "pending" ? Infinity : 0 }}
          className="relative z-10"
        >
          {gateStatus === "open" ? <Unlock className="w-4 h-4 text-neon-green" /> :
           gateStatus === "closed" ? <Lock className="w-4 h-4 text-neon-magenta" /> :
           <AlertTriangle className="w-4 h-4 text-neon-amber" />}
        </motion.div>
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">Gate</span>
          <span className={cn(
            "text-xs font-bold uppercase tracking-wide",
            gateStatus === "open" ? "text-neon-green" :
            gateStatus === "closed" ? "text-neon-magenta" : "text-neon-amber"
          )}>
            {gateStatus}
          </span>
        </div>
      </motion.div>
      
      {/* Cycle counter with animated number */}
      <motion.div 
        className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-neon-purple/30 shadow-lg shadow-neon-purple/10"
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <RotateCcw className="w-4 h-4 text-neon-purple" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">Cycle</span>
          <motion.span 
            key={cycleCount}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xs font-bold font-mono text-neon-purple"
          >
            #{cycleCount}
          </motion.span>
        </div>
      </motion.div>
      
      {/* Activity indicator */}
      <motion.div 
        className="hidden sm:flex relative items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border border-primary/30 shadow-lg shadow-primary/10"
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Activity className="w-4 h-4 text-primary" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">Status</span>
          <span className="text-xs font-bold text-primary">Active</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SEBAEvolutionHero() {
  const [activePhase, setActivePhase] = useState(0);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [cycleCount, setCycleCount] = useState(1);
  const [gateStatus, setGateStatus] = useState<"open" | "closed" | "pending">("pending");
  
  // Auto-cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => {
        const next = (prev + 1) % sebaPhases.length;
        // Update gate status when reaching gate phase
        if (next === 3) {
          setGateStatus("pending");
          setTimeout(() => setGateStatus(Math.random() > 0.15 ? "open" : "closed"), 800);
        }
        // Increment cycle when completing
        if (next === 0) {
          setCycleCount((c) => c + 1);
        }
        return next;
      });
    }, 2800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[520px] md:max-w-[620px] lg:max-w-[720px] mx-auto py-6 overflow-visible">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        {/* Gradient mesh base */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-neon-purple/5" />
        
        {/* Animated aurora blobs */}
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-neon-cyan/25 to-neon-blue/15 rounded-full blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-neon-purple/25 to-neon-purple/15 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-neon-amber/15 to-neon-amber/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
      
      {/* Data particles on apply phase */}
      <DataParticles isActive={activePhase === 4} />
      
      {/* SEBA Label with premium glass styling */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="relative inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-neon-purple/20 border border-primary/30 shadow-xl shadow-primary/10 backdrop-blur-md overflow-hidden">
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          />
          
          <div className="relative flex items-center gap-3">
            <motion.div
              className="relative"
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              }}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </motion.div>
            </motion.div>
            
            <div className="flex flex-col items-start">
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground tracking-wider uppercase">
                Autonomous Engine
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-wide text-foreground">
                Self-Evolving Bounded Agent
              </span>
            </div>
            
            {/* Version badge */}
            <div className="hidden sm:flex items-center px-2 py-0.5 rounded bg-primary/20 border border-primary/30">
              <span className="text-[9px] font-bold text-primary tracking-wider">v1.1</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Phase flow */}
      <div className="relative overflow-visible">
        {/* Desktop: Horizontal flow */}
        <div className="hidden sm:flex items-start justify-center gap-0 px-2 py-8 overflow-visible">
          {sebaPhases.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <PhaseNode
                phase={phase}
                index={index}
                isActive={activePhase === index}
                isPassed={index < activePhase}
                isHovered={hoveredPhase === index}
                onHover={(hover) => setHoveredPhase(hover ? index : null)}
              />
              {index < sebaPhases.length - 1 && (
                <PhaseConnector
                  isActive={activePhase === index}
                  isPassed={index < activePhase}
                  delay={index * 0.15}
                  fromColor={phase.glowColor}
                  toColor={sebaPhases[index + 1].glowColor}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Mobile: Compact 5-column grid */}
        <div className="flex sm:hidden items-start justify-between px-1 py-6 overflow-visible">
          {sebaPhases.map((phase, index) => (
            <PhaseNode
              key={phase.id}
              phase={phase}
              index={index}
              isActive={activePhase === index}
              isPassed={index < activePhase}
              isHovered={hoveredPhase === index}
              onHover={(hover) => setHoveredPhase(hover ? index : null)}
            />
          ))}
        </div>
        
        {/* Mobile progress bar with gradient */}
        <div className="sm:hidden mt-5 mx-3">
          <div className="h-1.5 bg-border/30 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta rounded-full"
              animate={{
                width: `${((activePhase + 1) / sebaPhases.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                boxShadow: "0 0 12px hsl(var(--primary) / 0.5)",
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Status panel */}
      <StatusPanel
        activePhase={activePhase}
        cycleCount={cycleCount}
        gateStatus={gateStatus}
      />
      
      {/* Active phase description card with premium styling */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="mt-6 sm:mt-8 mx-auto max-w-xs sm:max-w-sm"
        >
          <div className={cn(
            "relative p-5 sm:p-6 rounded-2xl border-2 backdrop-blur-md text-center shadow-xl overflow-hidden",
            sebaPhases[activePhase].bgColor,
            sebaPhases[activePhase].borderColor
          )}
          style={{
            boxShadow: `0 12px 40px hsl(${sebaPhases[activePhase].glowColor} / 0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
          >
            {/* Inner glow effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 0%, hsl(${sebaPhases[activePhase].glowColor} / 0.3) 0%, transparent 60%)`,
              }}
            />
            
            <div className="relative z-10 flex items-center justify-center gap-3 mb-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {React.createElement(sebaPhases[activePhase].icon, {
                  className: "w-5 h-5 sm:w-6 sm:h-6 text-foreground"
                })}
              </motion.div>
              <span className="text-base sm:text-lg font-bold tracking-wide">
                {sebaPhases[activePhase].name}
              </span>
            </div>
            <p className="relative z-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {sebaPhases[activePhase].description}
            </p>
            
            {/* Active indicator dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {sebaPhases.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    idx === activePhase ? "bg-foreground w-4" : idx < activePhase ? "bg-foreground/50" : "bg-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
