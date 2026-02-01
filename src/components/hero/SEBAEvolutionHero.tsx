/**
 * SEBA Evolution Hero — Self-Evolving Bounded Agent Visualization
 * A stunning 5-phase cognitive evolution pipeline with animated data flows
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// SEBA's 5 evolution phases
const sebaPhases = [
  { 
    id: "cognize", 
    name: "Cognize", 
    icon: Brain, 
    color: "from-cyan-400 to-blue-500",
    glowColor: "rgba(34, 211, 238, 0.6)",
    borderColor: "border-cyan-400/50",
    bgColor: "bg-cyan-500/10",
    description: "Analyze memory, learning patterns, reasoning gaps"
  },
  { 
    id: "propose", 
    name: "Propose", 
    icon: Lightbulb, 
    color: "from-amber-400 to-orange-500",
    glowColor: "rgba(251, 191, 36, 0.6)",
    borderColor: "border-amber-400/50",
    bgColor: "bg-amber-500/10",
    description: "Map insights to improvement actions"
  },
  { 
    id: "evaluate", 
    name: "Evaluate", 
    icon: Scale, 
    color: "from-purple-400 to-violet-500",
    glowColor: "rgba(192, 132, 252, 0.6)",
    borderColor: "border-purple-400/50",
    bgColor: "bg-purple-500/10",
    description: "Risk assessment & impact scoring"
  },
  { 
    id: "gate", 
    name: "Gate", 
    icon: ShieldCheck, 
    color: "from-emerald-400 to-green-500",
    glowColor: "rgba(52, 211, 153, 0.6)",
    borderColor: "border-emerald-400/50",
    bgColor: "bg-emerald-500/10",
    description: "Governance safety check"
  },
  { 
    id: "apply", 
    name: "Apply", 
    icon: Sparkles, 
    color: "from-rose-400 to-pink-500",
    glowColor: "rgba(251, 113, 133, 0.6)",
    borderColor: "border-rose-400/50",
    bgColor: "bg-rose-500/10",
    description: "Evolution execution with rollback"
  },
];

// Animated connection between phases
const PhaseConnector = memo(function PhaseConnector({ 
  isActive, 
  isPassed,
  delay 
}: { 
  isActive: boolean;
  isPassed: boolean;
  delay: number;
}) {
  return (
    <div className="hidden sm:flex items-center justify-center w-8 md:w-12 lg:w-16 relative">
      {/* Base line */}
      <div className="absolute inset-0 flex items-center">
        <div className={cn(
          "h-0.5 w-full transition-all duration-500",
          isPassed ? "bg-gradient-to-r from-primary/60 to-primary/40" : "bg-border/30"
        )} />
      </div>
      
      {/* Animated pulse */}
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-1 w-3 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
            animate={{
              x: [0, 32, 64],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.2,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
      
      {/* Arrow indicator */}
      <ArrowRight className={cn(
        "w-3 h-3 z-10 transition-colors duration-300",
        isPassed ? "text-primary/60" : "text-muted-foreground/30"
      )} />
    </div>
  );
});

// Individual phase node
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
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          "absolute -inset-4 rounded-full blur-xl transition-opacity duration-500",
          phase.bgColor
        )}
        animate={{
          opacity: isActive ? 0.8 : isHovered ? 0.5 : 0,
          scale: isActive ? 1.2 : 1,
        }}
      />
      
      {/* Outer ring animation */}
      {isActive && (
        <motion.div
          className={cn(
            "absolute -inset-2 rounded-2xl border-2",
            phase.borderColor
          )}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Main node */}
      <motion.div
        className={cn(
          "relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-2xl",
          "flex items-center justify-center cursor-pointer",
          "border-2 backdrop-blur-sm transition-all duration-300",
          isActive || isPassed ? phase.borderColor : "border-border/40",
          isActive ? `bg-gradient-to-br ${phase.color}` : isPassed ? phase.bgColor : "bg-card/60"
        )}
        animate={{
          scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
        }}
        style={{
          boxShadow: isActive ? `0 0 30px ${phase.glowColor}` : "none",
        }}
      >
        <Icon className={cn(
          "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 transition-colors duration-300",
          isActive ? "text-white" : isPassed ? "text-foreground" : "text-muted-foreground"
        )} />
        
        {/* Completion indicator */}
        {isPassed && !isActive && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>
      
      {/* Phase label */}
      <div className={cn(
        "mt-2 sm:mt-3 text-center transition-all duration-300",
        isActive ? "opacity-100" : "opacity-70"
      )}>
        <span className={cn(
          "text-xs sm:text-sm font-semibold block",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {phase.name}
        </span>
        
        {/* Phase description - show on active/hover */}
        <AnimatePresence>
          {showDetails && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[10px] sm:text-xs text-muted-foreground block max-w-[80px] sm:max-w-[100px] mt-1"
            >
              {phase.description}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Central brain core visualization
function CentralCore({ isProcessing }: { isProcessing: boolean }) {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {/* Outer pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
          style={{
            width: 60 + ring * 40,
            height: 60 + ring * 40,
          }}
          animate={{
            scale: isProcessing ? [1, 1.1, 1] : 1,
            opacity: isProcessing ? [0.3, 0.1, 0.3] : 0.1,
          }}
          transition={{
            duration: 2,
            delay: ring * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Central glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
        animate={{
          background: isProcessing 
            ? [
                "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
                "radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 70%)",
                "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
              ]
            : "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Floating data particles
function DataParticles({ isActive }: { isActive: boolean }) {
  const particles = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: i * 0.3,
      duration: 3 + Math.random() * 2,
      size: 2 + Math.random() * 3,
      startX: Math.random() * 100,
      startY: 80 + Math.random() * 20,
    })), []
  );
  
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/60"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -150, -300],
            x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.3],
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

// Status indicators
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
      transition={{ delay: 0.8 }}
      className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6"
    >
      {/* Phase indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/40">
        <Activity className="w-3 h-3 text-primary" />
        <span className="text-[10px] sm:text-xs font-mono">
          PHASE {activePhase + 1}/5
        </span>
      </div>
      
      {/* Gate status */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border",
        gateStatus === "open" ? "bg-emerald-500/10 border-emerald-500/40" :
        gateStatus === "closed" ? "bg-rose-500/10 border-rose-500/40" :
        "bg-amber-500/10 border-amber-500/40"
      )}>
        {gateStatus === "open" ? <Unlock className="w-3 h-3 text-emerald-400" /> :
         gateStatus === "closed" ? <Lock className="w-3 h-3 text-rose-400" /> :
         <AlertTriangle className="w-3 h-3 text-amber-400" />}
        <span className="text-[10px] sm:text-xs font-mono uppercase">
          GATE {gateStatus}
        </span>
      </div>
      
      {/* Cycle counter */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/40">
        <RotateCcw className="w-3 h-3 text-violet-400" />
        <span className="text-[10px] sm:text-xs font-mono">
          CYCLE #{cycleCount}
        </span>
      </div>
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
          setTimeout(() => setGateStatus(Math.random() > 0.2 ? "open" : "closed"), 800);
        }
        // Increment cycle when completing
        if (next === 0) {
          setCycleCount((c) => c + 1);
        }
        return next;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] mx-auto py-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
        
        {/* Animated glow blobs */}
        <motion.div
          className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      {/* Data particles */}
      <DataParticles isActive={activePhase === 4} />
      
      {/* SEBA Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-foreground/90">
            SELF-EVOLVING BOUNDED AGENT
          </span>
        </div>
      </motion.div>
      
      {/* Phase pipeline - horizontal on desktop, compact grid on mobile */}
      <div className="relative">
        {/* Desktop: Horizontal pipeline */}
        <div className="hidden sm:flex items-start justify-center gap-0">
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
                  delay={index * 0.2}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Mobile: Compact 5-column grid */}
        <div className="flex sm:hidden items-start justify-between px-2">
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
        
        {/* Mobile progress bar */}
        <div className="sm:hidden mt-4 mx-4">
          <div className="h-1 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-violet-500"
              animate={{
                width: `${((activePhase + 1) / sebaPhases.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
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
      
      {/* Active phase description card */}
      <motion.div
        key={activePhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-4 sm:mt-6 mx-auto max-w-xs sm:max-w-sm"
      >
        <div className={cn(
          "p-3 sm:p-4 rounded-xl border backdrop-blur-sm text-center",
          sebaPhases[activePhase].bgColor,
          sebaPhases[activePhase].borderColor
        )}>
          <div className="flex items-center justify-center gap-2 mb-1">
            {React.createElement(sebaPhases[activePhase].icon, {
              className: "w-4 h-4 text-foreground"
            })}
            <span className="text-sm font-semibold">
              {sebaPhases[activePhase].name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {sebaPhases[activePhase].description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
