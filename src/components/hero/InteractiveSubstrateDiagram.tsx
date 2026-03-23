/**
 * InteractiveSubstrateDiagram — Animated System Architecture Hero
 * Performance-optimized version with deferred animations
 */

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Brain, Shield, Zap, Eye, Moon, Settings, MessageSquare,
  Activity, Database, Lock, Cpu, Network
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleNode {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  position: { x: number; y: number };
  description: string;
  actions: number;
}

// Neon color palette for maximum visual impact
const modules: ModuleNode[] = [
  {
    id: "brain",
    name: "BRAIN Engine",
    icon: Brain,
    color: "text-neon-cyan",
    glowColor: "shadow-[0_0_30px_rgba(34,211,238,0.6)]",
    position: { x: 50, y: 15 },
    description: "Memory • Auto-Tiering • Cognitive Recall",
    actions: 12
  },
  {
    id: "decode",
    name: "DECODE Agent",
    icon: MessageSquare,
    color: "text-neon-magenta",
    glowColor: "shadow-[0_0_30px_rgba(232,121,249,0.6)]",
    position: { x: 15, y: 38 },
    description: "Intent • NL Understanding • Personality",
    actions: 5
  },
  {
    id: "defense",
    name: "DEFENSE Layer",
    icon: Shield,
    color: "text-neon-amber",
    glowColor: "shadow-[0_0_30px_rgba(252,211,77,0.6)]",
    position: { x: 85, y: 38 },
    description: "Threat Detection • Input Scanning • Security",
    actions: 7
  },
  {
    id: "nexus",
    name: "NEXUS Organ",
    icon: Zap,
    color: "text-neon-green",
    glowColor: "shadow-[0_0_30px_rgba(110,231,183,0.6)]",
    position: { x: 12, y: 68 },
    description: "Fleet Routing • Multi-Provider • Health-Weighted",
    actions: 6
  },
  {
    id: "encode",
    name: "ENCODE Agent",
    icon: Cpu,
    color: "text-neon-amber",
    glowColor: "shadow-[0_0_30px_rgba(253,186,116,0.6)]",
    position: { x: 88, y: 68 },
    description: "Code Generation • Error Patterns • Task Engine",
    actions: 8
  },
  {
    id: "vision",
    name: "VISION Agent",
    icon: Eye,
    color: "text-sky-300",
    glowColor: "shadow-[0_0_30px_rgba(125,211,252,0.6)]",
    position: { x: 30, y: 85 },
    description: "Observability • Health Scoring • Metrics",
    actions: 14
  },
  {
    id: "dream",
    name: "DREAM Engine",
    icon: Moon,
    color: "text-neon-purple",
    glowColor: "shadow-[0_0_30px_rgba(196,181,253,0.6)]",
    position: { x: 70, y: 85 },
    description: "Autonomous Learning • Mutation • Synthesis",
    actions: 3
  },
  {
    id: "core",
    name: "CORE Organ",
    icon: Network,
    color: "text-neon-magenta",
    glowColor: "shadow-[0_0_30px_rgba(253,164,175,0.6)]",
    position: { x: 50, y: 50 },
    description: "Kernel • Circuit Recovery • Orchestration",
    actions: 11
  }
];

// Connection lines between primitives
const connections = [
  { from: "brain", to: "core" },
  { from: "decode", to: "core" },
  { from: "defense", to: "core" },
  { from: "nexus", to: "core" },
  { from: "vision", to: "core" },
  { from: "dream", to: "core" },
  { from: "encode", to: "core" },
  { from: "brain", to: "decode" },
  { from: "brain", to: "dream" },
  { from: "defense", to: "vision" },
  { from: "nexus", to: "encode" },
  { from: "encode", to: "brain" },
];

// Memoized data pulse component - only renders when active
const DataPulse = memo(function DataPulse({ 
  from, 
  to, 
  isActive 
}: { 
  from: ModuleNode; 
  to: ModuleNode; 
  isActive: boolean;
}) {
  if (!isActive) return null;
  
  return (
    <motion.circle
      r="3"
      fill="currentColor"
      className="text-primary"
      initial={{ opacity: 0 }}
      animate={{
        cx: [from.position.x + "%", to.position.x + "%"],
        cy: [from.position.y + "%", to.position.y + "%"],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut"
      }}
    />
  );
});

// Memoized node component
const ModuleNodeComponent = memo(function ModuleNodeComponent({ 
  module, 
  isActive, 
  isHovered,
  onClick,
  onHover,
  animationsReady
}: { 
  module: ModuleNode; 
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hover: boolean) => void;
  animationsReady: boolean;
}) {
  const Icon = module.icon;
  const shouldAnimate = animationsReady && isActive;
  
  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10",
        "transition-all duration-300"
      )}
      style={{ 
        left: `${module.position.x}%`, 
        top: `${module.position.y}%` 
      }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Glow effect - CSS only */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-opacity duration-300",
          (module.color ?? 'text-primary').replace("text-", "bg-"),
          isActive || isHovered ? "opacity-40" : "opacity-0"
        )}
      />
      
      {/* Outer ring - CSS animation when active */}
      <div
        className={cn(
          "absolute inset-[-6px] rounded-full border-2 opacity-30",
          (module.color ?? 'text-primary').replace("text-", "border-"),
          shouldAnimate && "animate-pulse"
        )}
      />
      
      {/* Main node */}
      <div
        className={cn(
          "relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm border-2 transition-all duration-300",
          isActive || isHovered ? "border-current shadow-lg scale-110" : "border-border/50",
          module.color,
          isActive && module.glowColor,
          isActive && "shadow-xl"
        )}
      >
        <Icon className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      
      {/* Label */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 mt-2 text-center transition-opacity duration-300",
        isHovered || isActive ? "opacity-100" : "opacity-60"
      )}>
        <p className={cn("text-xs md:text-sm font-semibold whitespace-nowrap", module.color)}>
          {module.name}
        </p>
        {(isHovered || isActive) && (
          <p className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
            {module.actions} actions
          </p>
        )}
      </div>
    </div>
  );
});

export function InteractiveSubstrateDiagram() {
  const prefersReducedMotion = useReducedMotion();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false); // Start paused
  const [pulseIndex, setPulseIndex] = useState(0);
  const [animationsReady, setAnimationsReady] = useState(false);

  // Defer animations until after initial paint to prevent freezing
  useEffect(() => {
    // Use requestIdleCallback for non-blocking initialization
    const startAnimations = () => {
      setAnimationsReady(true);
      // Start auto-rotate after a delay
      setTimeout(() => setAutoRotate(true), 500);
    };
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(startAnimations, { timeout: 1000 });
    } else {
      setTimeout(startAnimations, 100);
    }
  }, []);

  // Auto-rotate through modules - only when ready and not reduced motion
  useEffect(() => {
    if (!autoRotate || !animationsReady || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setActiveModule(prev => {
        const currentIndex = modules.findIndex(m => m.id === prev);
        const nextIndex = (currentIndex + 1) % modules.length;
        return modules[nextIndex].id;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoRotate, animationsReady, prefersReducedMotion]);

  // Pulse animation cycle - slower interval, only when ready
  useEffect(() => {
    if (!animationsReady || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % connections.length);
    }, 1200); // Slower to reduce CPU usage
    return () => clearInterval(interval);
  }, [animationsReady, prefersReducedMotion]);

  const handleModuleClick = useCallback((moduleId: string) => {
    setAutoRotate(false);
    setActiveModule(moduleId);
  }, []);

  const handleModuleHover = useCallback((moduleId: string, hover: boolean) => {
    if (hover) {
      setAutoRotate(false);
      setHoveredModule(moduleId);
    } else {
      setHoveredModule(null);
      // Resume auto-rotate after a delay
      setTimeout(() => setAutoRotate(true), 5000);
    }
  }, []);

  const activeModuleData = modules.find(m => m.id === (hoveredModule || activeModule));

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto pb-16 md:pb-12">
      {/* Neon background glow effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-magenta/10" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-neon-magenta/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-neon-purple/15 rounded-full blur-3xl" />
      </div>
      
      {/* Grid lines - enhanced neon */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <pattern id="neon-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neon-cyan/40" />
          </pattern>
          <linearGradient id="neon-fade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#neon-grid)" />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, idx) => {
          const fromModule = modules.find(m => m.id === conn.from)!;
          const toModule = modules.find(m => m.id === conn.to)!;
          const isActive = activeModule === conn.from || activeModule === conn.to || 
                          hoveredModule === conn.from || hoveredModule === conn.to;
          
          return (
            <g key={`${conn.from}-${conn.to}`}>
              {/* Connection line */}
              <motion.line
                x1={`${fromModule.position.x}%`}
                y1={`${fromModule.position.y}%`}
                x2={`${toModule.position.x}%`}
                y2={`${toModule.position.y}%`}
                stroke="currentColor"
                strokeWidth={isActive ? 2 : 1}
                className={cn(
                  "transition-all duration-300",
                  isActive ? "text-primary" : "text-border/50"
                )}
              />
              
              {/* Animated pulse on active connections */}
              <DataPulse from={fromModule} to={toModule} isActive={idx === pulseIndex && animationsReady} />
            </g>
          );
        })}
      </svg>

      {/* Center core - Neon pulsing orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-neon-cyan/30 via-neon-purple/25 to-neon-magenta/30 blur-2xl" />
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-neon-green/25 to-neon-amber/25 blur-xl" />
      </motion.div>

      {/* Module nodes */}
      {modules.map(module => (
        <ModuleNodeComponent
          key={module.id}
          module={module}
          isActive={activeModule === module.id}
          isHovered={hoveredModule === module.id}
          onClick={() => handleModuleClick(module.id)}
          onHover={(hover) => handleModuleHover(module.id, hover)}
          animationsReady={animationsReady}
        />
      ))}

      {/* Active module info panel - Mobile optimized */}
      <AnimatePresence>
        {activeModuleData && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute -bottom-2 left-0 right-0 mx-2 md:left-1/2 md:-translate-x-1/2 md:mx-0 md:w-full md:max-w-sm"
          >
            <div className={cn(
              "bg-background/95 backdrop-blur-xl border-2 rounded-xl p-3 md:p-4 text-center",
              "shadow-[0_0_40px_rgba(0,0,0,0.3)]",
              (activeModuleData?.color ?? 'text-primary').replace("text-", "border-").replace("-300", "-500/50")
            )}>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <activeModuleData.icon className={cn("w-5 h-5", activeModuleData.color)} />
                <h3 className={cn("font-bold text-base", activeModuleData.color)}>
                  {activeModuleData.name}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                {activeModuleData.description}
              </p>
              <div className="flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {activeModuleData.actions} actions
                </span>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Online
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Secure
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner stats - Neon enhanced */}
      <div className="absolute top-0 left-0 text-left">
        <div className="bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 border border-neon-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-mono text-neon-cyan">SUBSTRATE SPARTA</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 text-right">
        <div className="bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 border border-neon-green/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-neon-green" />
            <span className="text-xs font-mono text-neon-green">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
