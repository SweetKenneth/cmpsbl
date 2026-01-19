/**
 * META HERO: The Substrate OS
 * Combines: Evolution flow (A) + Layer stack architecture (B) + Cinematic transformation (C)
 * 
 * Core Concept: "What Windows did for PCs, we do for AI Models"
 * Shows AI models flowing through the Substrate and emerging enhanced
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Moon, 
  Shield, 
  Zap, 
  Eye,
  Infinity as InfinityIcon,
  MessageSquare,
  Settings,
  Flame,
  Bot,
  Wand2,
  HeartPulse,
  BookOpen
} from "lucide-react";

// AI Models that flow through
const aiModels = [
  { name: "GPT", color: "#10a37f", tagline: "Forgets every session" },
  { name: "Claude", color: "#d97706", tagline: "Can't learn from you" },
  { name: "Grok", color: "#3b82f6", tagline: "No self-defense" },
  { name: "Gemini", color: "#8b5cf6", tagline: "Static capabilities" },
];

// What they become
const enhancements = [
  { icon: InfinityIcon, label: "Infinite Memory", color: "#06b6d4" },
  { icon: Moon, label: "Dream Analysis", color: "#8b5cf6" },
  { icon: Shield, label: "Self-Defense", color: "#f59e0b" },
  { icon: Brain, label: "Self-Learning", color: "#22c55e" },
  { icon: Eye, label: "Full Observability", color: "#3b82f6" },
  { icon: Flame, label: "Hot Knowledge", color: "#f43f5e" },
];

// The 7 core modules
const coreModules = [
  { icon: Brain, name: "Brain", color: "#06b6d4" },
  { icon: MessageSquare, name: "Decode", color: "#a855f7" },
  { icon: Shield, name: "Defense", color: "#f59e0b" },
  { icon: Zap, name: "Nexus", color: "#22c55e" },
  { icon: Eye, name: "Vision", color: "#3b82f6" },
  { icon: Moon, name: "Dream", color: "#8b5cf6" },
  { icon: Settings, name: "System", color: "#f43f5e" },
];

// Example apps built on substrate
const exampleApps = [
  { icon: Bot, name: "AI Therapist", desc: "Remembers every session" },
  { icon: HeartPulse, name: "Health Coach", desc: "Learns your patterns" },
  { icon: Wand2, name: "Dream Journal", desc: "Analyzes your dreams" },
  { icon: BookOpen, name: "Study Buddy", desc: "Adapts to your pace" },
];

// Flowing particle through the substrate
function FlowingParticle({ delay, yOffset }: { delay: number; yOffset: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full z-20"
      style={{
        background: `linear-gradient(90deg, #06b6d4, #d946ef, #f59e0b)`,
        boxShadow: "0 0 10px #06b6d4, 0 0 20px #d946ef",
        top: `calc(50% + ${yOffset}px)`,
      }}
      initial={{ left: "10%", opacity: 0, scale: 0 }}
      animate={{
        left: ["10%", "45%", "55%", "90%"],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1.5, 0],
      }}
      transition={{
        duration: 4,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: "easeInOut",
      }}
    />
  );
}

// Orbit ring around substrate core
function OrbitRing({ radius, duration, color }: { radius: number; duration: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: `${color}30`,
        borderWidth: 1,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}`,
          top: -3,
          left: "50%",
          marginLeft: -3,
        }}
      />
    </motion.div>
  );
}

// Before: Standard AI model (dimmed, limited)
function StandardAIModel({ model, delay }: { model: typeof aiModels[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center gap-2"
    >
      <div 
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-muted-foreground/30 bg-muted/40"
      >
        <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{model.name}</span>
      </div>
      <span className="text-[8px] md:text-[9px] text-muted-foreground/60 max-w-[60px] text-center leading-tight">
        {model.tagline}
      </span>
    </motion.div>
  );
}

// After: Enhanced AI model (glowing, powerful)
function EnhancedAIModel({ model, delay }: { model: typeof aiModels[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      className="relative flex flex-col items-center gap-2"
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md opacity-50"
        style={{ background: model.color }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div 
        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 bg-background/90"
        style={{ borderColor: model.color }}
      >
        <span className="text-[10px] md:text-xs font-bold" style={{ color: model.color }}>{model.name}+</span>
      </div>
      
      <Badge 
        variant="outline" 
        className="text-[7px] md:text-[8px] px-1 py-0 bg-background/80 border-cyan-500/50 text-cyan-400"
      >
        Enhanced
      </Badge>
    </motion.div>
  );
}

// The central substrate core - the transformation engine
function SubstrateCore() {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center"
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-amber-500/20 blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Orbit rings */}
      <OrbitRing radius={85} duration={12} color="#06b6d4" />
      <OrbitRing radius={100} duration={18} color="#d946ef" />
      <OrbitRing radius={115} duration={25} color="#f59e0b" />
      
      {/* Dashed outer ring */}
      <motion.div
        className="absolute w-full h-full rounded-full border-2 border-dashed border-cyan-500/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner substrate core */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/10 to-amber-500/10 border border-cyan-500/40 backdrop-blur-md flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-base md:text-xl font-black bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
            SUBSTRATE
          </div>
          <div className="text-[10px] md:text-xs text-muted-foreground font-medium">OS</div>
        </motion.div>
      </div>
      
      {/* 7 Module icons orbiting */}
      {coreModules.map((mod, i) => {
        const angle = (i / coreModules.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 68;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={mod.name}
            className="absolute w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              left: `calc(50% + ${x}px - 12px)`,
              top: `calc(50% + ${y}px - 12px)`,
              background: hoveredModule === i ? `${mod.color}30` : `${mod.color}15`,
              border: `1px solid ${mod.color}60`,
            }}
            whileHover={{ scale: 1.3 }}
            onMouseEnter={() => setHoveredModule(i)}
            onMouseLeave={() => setHoveredModule(null)}
            animate={{
              boxShadow: [
                `0 0 5px ${mod.color}30`,
                `0 0 15px ${mod.color}50`,
                `0 0 5px ${mod.color}30`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          >
            <mod.icon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: mod.color }} />
          </motion.div>
        );
      })}
      
      {/* Module label on hover */}
      <AnimatePresence>
        {hoveredModule !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-background/90 border border-border/50"
          >
            <span className="text-[10px] font-medium" style={{ color: coreModules[hoveredModule].color }}>
              {coreModules[hoveredModule].name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Bottom app examples
function ExampleAppsRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="flex flex-wrap justify-center gap-2 md:gap-3"
    >
      {exampleApps.map((app, i) => (
        <motion.div
          key={app.name}
          className="px-3 py-2 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 backdrop-blur-sm flex items-center gap-2"
          whileHover={{ scale: 1.05, borderColor: "rgba(217,70,239,0.5)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 + i * 0.1 }}
        >
          <app.icon className="w-4 h-4 text-fuchsia-400" />
          <div>
            <div className="text-xs font-semibold text-foreground">{app.name}</div>
            <div className="text-[9px] text-muted-foreground">{app.desc}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Enhancements showcase
function EnhancementsGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8 }}
      className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl mx-auto"
    >
      {enhancements.map((enh, i) => (
        <motion.div
          key={enh.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.9 + i * 0.1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 backdrop-blur-sm"
          style={{ borderColor: `${enh.color}40` }}
        >
          <enh.icon className="w-3.5 h-3.5" style={{ color: enh.color }} />
          <span className="text-xs font-medium" style={{ color: enh.color }}>{enh.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HeroMetaSubstrate() {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-background to-cyan-950/20" />
      
      {/* Radial spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.15) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero Headline */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-8 md:mb-10"
      >
        <Badge variant="outline" className="mb-4 md:mb-6 px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-amber-500/10 border-cyan-500/30">
          <Sparkles className="w-3 h-3 mr-2 text-cyan-400" />
          <span className="text-cyan-300 text-xs md:text-sm">What Windows Did for PCs</span>
        </Badge>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
          <span className="text-foreground">We Do for </span>
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            AI Models
          </span>
        </h1>
        
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The operating system for cognitive applications.
          <br className="hidden md:block" />
          <span className="text-cyan-400">Memory. Dreams. Defense. Intelligence.</span>
        </p>
      </motion.div>

      {/* THE TRANSFORMATION FLOW VISUALIZATION */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mb-8 md:mb-12">
        <div className="relative flex items-center justify-center gap-4 md:gap-8 py-8">
          
          {/* LEFT: Standard AI Models */}
          <div className="flex flex-col gap-3 md:gap-4 items-center">
            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">Standard AI</span>
            {aiModels.map((model, i) => (
              <StandardAIModel key={model.name} model={model} delay={i * 0.1} />
            ))}
          </div>

          {/* CENTER: Flow + Substrate Core */}
          <div className="relative flex-1 h-80 md:h-96 flex items-center justify-center">
            {/* Flow line */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-muted-foreground/20 via-cyan-500/40 to-muted-foreground/20 z-0" />
            
            {/* Flowing particles */}
            {[...Array(10)].map((_, i) => (
              <FlowingParticle key={i} delay={i * 0.5} yOffset={(i % 5) * 15 - 30} />
            ))}
            
            {/* The Substrate Core */}
            <SubstrateCore />
          </div>

          {/* RIGHT: Enhanced AI Models */}
          <div className="flex flex-col gap-3 md:gap-4 items-center">
            <span className="text-[10px] md:text-xs text-cyan-400 uppercase tracking-wider mb-1">Substrate-Enhanced</span>
            {aiModels.map((model, i) => (
              <EnhancedAIModel key={model.name} model={model} delay={0.8 + i * 0.15} />
            ))}
          </div>
        </div>
      </div>

      {/* WHAT YOU CAN BUILD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="relative z-10 text-center mb-6"
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Build Apps Like</span>
      </motion.div>
      
      <ExampleAppsRow />
      
      {/* CAPABILITIES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="relative z-10 text-center mt-10 mb-4"
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Every AI Gets</span>
      </motion.div>
      
      <EnhancementsGrid />

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.6 }}
        className="relative z-10 flex flex-wrap gap-3 md:gap-4 justify-center mt-10 md:mt-12"
      >
        <Button 
          asChild 
          size="lg" 
          className="bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-500 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-amber-400 text-white shadow-xl shadow-cyan-500/20 font-semibold"
        >
          <Link to="/projects">
            Build Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
        <Button 
          asChild 
          variant="outline" 
          size="lg" 
          className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10 font-medium"
        >
          <Link to="/feed-dream-eater">
            <Moon className="mr-2 w-4 h-4" />
            Feed the Dream Eater
          </Link>
        </Button>
        <Button 
          asChild 
          variant="ghost" 
          size="lg" 
          className="text-muted-foreground hover:text-foreground font-medium"
        >
          <Link to="/documentation">
            Explore Docs
          </Link>
        </Button>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 3, y: { duration: 1.5, repeat: Infinity } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/50"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider">Discover More</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
