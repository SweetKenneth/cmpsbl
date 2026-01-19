/**
 * Hero Concept A: "The Evolution Flow"
 * Shows AI models being transformed as they flow through the Substrate
 * Before → Substrate → After with animated particles
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Brain, Moon, Shield, Zap, MessageSquare, Eye, Settings } from "lucide-react";

// AI Model icons as simple representations
const AIModels = [
  { name: "GPT", color: "#10a37f", enhancement: "Infinite Memory" },
  { name: "Claude", color: "#d97706", enhancement: "Dream Analysis" },
  { name: "Grok", color: "#3b82f6", enhancement: "Self-Defense" },
  { name: "Gemini", color: "#8b5cf6", enhancement: "Learning Loops" },
];

// Particle that flows through the substrate
function FlowingParticle({ delay, path }: { delay: number; path: number }) {
  const yOffset = path * 30 - 45;
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        background: `linear-gradient(90deg, #06b6d4, #d946ef, #f59e0b)`,
        boxShadow: "0 0 10px #06b6d4, 0 0 20px #d946ef",
        top: `calc(50% + ${yOffset}px)`,
      }}
      initial={{ left: "15%", opacity: 0, scale: 0 }}
      animate={{
        left: ["15%", "42%", "58%", "85%"],
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1.5, 0],
      }}
      transition={{
        duration: 3,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    />
  );
}

// Enhanced AI model after substrate processing
function EnhancedModel({ model, delay }: { model: typeof AIModels[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: delay + 0.5, duration: 0.8 }}
      className="relative group"
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md opacity-60"
        style={{ background: model.color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Model circle */}
      <div 
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 bg-background/80"
        style={{ borderColor: model.color }}
      >
        <span className="text-xs md:text-sm font-bold" style={{ color: model.color }}>
          {model.name}
        </span>
      </div>
      
      {/* Enhancement badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 1 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <Badge variant="outline" className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-background/80 border-cyan-500/50 text-cyan-400">
          + {model.enhancement}
        </Badge>
      </motion.div>
    </motion.div>
  );
}

// Basic AI model before substrate
function BasicModel({ model, delay }: { model: typeof AIModels[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="relative"
    >
      <div 
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-muted-foreground/30 bg-muted/50"
      >
        <span className="text-xs md:text-sm font-medium text-muted-foreground">
          {model.name}
        </span>
      </div>
    </motion.div>
  );
}

// The central Substrate transformation zone
function SubstrateCore() {
  const modules = [
    { icon: Brain, color: "#06b6d4", label: "Brain" },
    { icon: Moon, color: "#8b5cf6", label: "Dream" },
    { icon: Shield, color: "#f59e0b", label: "Defense" },
    { icon: Zap, color: "#22c55e", label: "Nexus" },
    { icon: Eye, color: "#3b82f6", label: "Vision" },
    { icon: MessageSquare, color: "#a855f7", label: "Decode" },
    { icon: Settings, color: "#f43f5e", label: "System" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className="relative w-40 h-40 md:w-52 md:h-52"
    >
      {/* Outer spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/20 to-amber-500/20 blur-xl" />
      
      {/* Core substrate circle */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/50 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            SUBSTRATE
          </div>
          <div className="text-[10px] md:text-xs text-muted-foreground">OS</div>
        </motion.div>
      </div>

      {/* Orbiting module icons */}
      {modules.map((mod, i) => {
        const angle = (i / modules.length) * Math.PI * 2;
        const radius = 70;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={mod.label}
            className="absolute w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
            style={{
              left: `calc(50% + ${x}px - 12px)`,
              top: `calc(50% + ${y}px - 12px)`,
              background: `${mod.color}20`,
              border: `1px solid ${mod.color}50`,
            }}
            animate={{
              boxShadow: [
                `0 0 5px ${mod.color}40`,
                `0 0 15px ${mod.color}60`,
                `0 0 5px ${mod.color}40`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          >
            <mod.icon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: mod.color }} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function HeroConceptA_EvolutionFlow() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-cyan-950/20" />
      
      {/* Concept Label */}
      <Badge className="absolute top-4 left-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
        CONCEPT A: Evolution Flow
      </Badge>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-8 md:mb-12"
      >
        <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border-cyan-500/30">
          <Sparkles className="w-3 h-3 mr-2 text-cyan-400" />
          <span className="text-cyan-300">What Windows Did for PCs</span>
        </Badge>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-foreground">We Do for </span>
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            AI Models
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Give any AI infinite memory, dream analysis, self-defense, and continuous learning.
          <br className="hidden md:block" />
          <span className="text-cyan-400">The operating system for cognitive applications.</span>
        </p>
      </motion.div>

      {/* The Evolution Visualization */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Flow container */}
        <div className="relative flex items-center justify-between gap-4 md:gap-8 py-12">
          
          {/* Before: Basic AI Models */}
          <div className="flex flex-col gap-4 md:gap-6 items-center">
            <span className="text-xs md:text-sm text-muted-foreground mb-2">Standard AI</span>
            {AIModels.map((model, i) => (
              <BasicModel key={model.name} model={model} delay={i * 0.15} />
            ))}
          </div>

          {/* Arrow + Flowing particles */}
          <div className="flex-1 relative h-60 md:h-72 flex items-center justify-center">
            {/* Flow line */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-muted-foreground/20 via-cyan-500/50 to-muted-foreground/20" />
            
            {/* Particles */}
            {[...Array(8)].map((_, i) => (
              <FlowingParticle key={i} delay={i * 0.4} path={i % 4} />
            ))}
            
            {/* Central Substrate */}
            <SubstrateCore />
          </div>

          {/* After: Enhanced AI Models */}
          <div className="flex flex-col gap-6 md:gap-8 items-center">
            <span className="text-xs md:text-sm text-cyan-400 mb-2">Substrate-Enhanced</span>
            {AIModels.map((model, i) => (
              <EnhancedModel key={model.name} model={model} delay={i * 0.2} />
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="relative z-10 flex flex-wrap gap-4 justify-center mt-8"
      >
        <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white shadow-lg shadow-cyan-500/25">
          <Link to="/projects">
            Build Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
          <Link to="/feed-dream-eater">
            <Moon className="mr-2 w-4 h-4" />
            Feed the Dream Eater
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
          <Link to="/documentation">
            Explore Docs
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
