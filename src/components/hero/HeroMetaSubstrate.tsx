/**
 * META HERO: The Substrate OS
 * Streamlined visualization with arrows showing evolution
 * Mobile-first, neon-vibrant design
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Moon, 
  Shield, 
  Zap, 
  Eye,
  MessageSquare,
  Settings,
  ChevronRight
} from "lucide-react";

// AI Models that flow through
const aiModels = [
  { name: "GPT", color: "hsl(var(--neon-green))" },
  { name: "Claude", color: "hsl(var(--neon-amber))" },
  { name: "Grok", color: "hsl(var(--neon-blue))" },
  { name: "Gemini", color: "hsl(var(--neon-purple))" },
];

// The 7 core modules
const coreModules = [
  { icon: Brain, name: "Brain", color: "hsl(var(--neon-cyan))" },
  { icon: MessageSquare, name: "Decode", color: "hsl(var(--neon-purple))" },
  { icon: Shield, name: "Defense", color: "hsl(var(--neon-amber))" },
  { icon: Zap, name: "Nexus", color: "hsl(var(--neon-green))" },
  { icon: Eye, name: "Vision", color: "hsl(var(--neon-blue))" },
  { icon: Moon, name: "Dream", color: "hsl(var(--neon-magenta))" },
  { icon: Settings, name: "System", color: "hsl(var(--destructive))" },
];

// Orbit ring around substrate core
function OrbitRing({ radius, duration, color }: { radius: number; duration: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: `${color}`,
        borderWidth: 1,
        opacity: 0.3,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 12px ${color}, 0 0 24px ${color}`,
          top: -4,
          left: "50%",
          marginLeft: -4,
        }}
      />
    </motion.div>
  );
}

// The central substrate core
function SubstrateCore() {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center mx-auto"
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.3) 0%, hsl(var(--neon-magenta) / 0.15) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Orbit rings */}
      <OrbitRing radius={90} duration={12} color="hsl(var(--neon-cyan))" />
      <OrbitRing radius={105} duration={18} color="hsl(var(--neon-magenta))" />
      <OrbitRing radius={120} duration={25} color="hsl(var(--neon-amber))" />
      
      {/* Inner substrate core */}
      <div 
        className="absolute inset-6 sm:inset-8 rounded-full border-2 backdrop-blur-md flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, hsl(var(--neon-cyan) / 0.15), hsl(var(--neon-magenta) / 0.1))",
          borderColor: "hsl(var(--neon-cyan) / 0.5)",
          boxShadow: "0 0 40px hsl(var(--neon-cyan) / 0.3), inset 0 0 30px hsl(var(--neon-cyan) / 0.1)",
        }}
      >
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div 
            className="text-lg sm:text-xl md:text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-amber)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px hsl(var(--neon-cyan) / 0.5))",
            }}
          >
            SUBSTRATE
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">OS</div>
        </motion.div>
      </div>
      
      {/* 7 Module icons orbiting */}
      {coreModules.map((mod, i) => {
        const angle = (i / coreModules.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 70;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={mod.name}
            className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              left: `calc(50% + ${x}px - 14px)`,
              top: `calc(50% + ${y}px - 14px)`,
              background: hoveredModule === i ? `${mod.color}` : `${mod.color}20`,
              border: `2px solid ${mod.color}`,
              boxShadow: hoveredModule === i ? `0 0 20px ${mod.color}, 0 0 40px ${mod.color}` : `0 0 10px ${mod.color}50`,
            }}
            whileHover={{ scale: 1.3 }}
            onMouseEnter={() => setHoveredModule(i)}
            onMouseLeave={() => setHoveredModule(null)}
            animate={{
              boxShadow: [
                `0 0 8px ${mod.color}50`,
                `0 0 20px ${mod.color}80`,
                `0 0 8px ${mod.color}50`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          >
            <mod.icon 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
              style={{ color: hoveredModule === i ? "hsl(var(--background))" : mod.color }} 
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// AI Model evolution visualization - single row with arrows
function AIEvolutionFlow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* EVOLVE label */}
      <div className="text-center mb-6">
        <span 
          className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase"
          style={{
            background: "linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          EVOLVE
        </span>
      </div>
      
      {/* AI Models row with arrows */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
        {aiModels.map((model, i) => (
          <React.Fragment key={model.name}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="relative group"
            >
              {/* Model bubble */}
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  borderColor: model.color,
                  background: `${model.color}15`,
                  boxShadow: `0 0 15px ${model.color}40, inset 0 0 10px ${model.color}20`,
                }}
              >
                <span 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: model.color }}
                >
                  {model.name}
                </span>
              </div>
              
              {/* Glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                  boxShadow: `0 0 30px ${model.color}, 0 0 60px ${model.color}50`,
                }}
              />
            </motion.div>
            
            {/* Arrow between models */}
            {i < aiModels.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <ChevronRight 
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

export function HeroMetaSubstrate() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Deep black gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(220 30% 2%) 50%, hsl(var(--background)) 100%)",
        }}
      />
      
      {/* Radial neon spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 40%, hsl(var(--neon-cyan) / 0.12) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* Secondary magenta glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 60% 60%, hsl(var(--neon-magenta) / 0.08) 0%, transparent 50%)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Hero Headline */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-8 md:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
          <span className="text-foreground">Where Machines </span>
          <span 
            style={{
              background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-amber)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px hsl(var(--neon-cyan) / 0.5))",
            }}
          >
            Learn to Dream
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
          Cognitive Operating System for Serious Builders
        </p>
        <p 
          className="text-sm sm:text-base md:text-lg font-medium mt-2"
          style={{ color: "hsl(var(--neon-cyan))" }}
        >
          Memory. Dreams. Defense. Intelligence.
        </p>
      </motion.div>

      {/* Central Substrate Core */}
      <div className="relative z-10 mb-10 md:mb-14">
        <SubstrateCore />
      </div>

      {/* AI Evolution Flow */}
      <AIEvolutionFlow />

      {/* CTAs - Stacked and centered for mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 mt-10 md:mt-14 w-full max-w-sm mx-auto px-4"
      >
        <Button 
          asChild 
          size="lg" 
          className="w-full sm:w-auto px-8 py-6 text-base font-bold border-0"
          style={{
            background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))",
            boxShadow: "0 0 30px hsl(var(--neon-cyan) / 0.5), 0 0 60px hsl(var(--neon-magenta) / 0.3)",
            color: "hsl(var(--background))",
          }}
        >
          <Link to="/projects" className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Build Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="outline" 
          size="lg" 
          className="w-full sm:w-auto px-8 py-6 text-base font-medium border-2"
          style={{
            borderColor: "hsl(var(--neon-magenta) / 0.5)",
            color: "hsl(var(--neon-magenta))",
            background: "hsl(var(--neon-magenta) / 0.1)",
          }}
        >
          <Link to="/feed-dream-eater" className="flex items-center justify-center gap-2">
            <Moon className="w-5 h-5" />
            Feed the Dream Eater
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="ghost" 
          size="lg" 
          className="w-full sm:w-auto px-8 py-6 text-base font-medium text-muted-foreground hover:text-foreground"
        >
          <Link to="/documentation" className="flex items-center justify-center gap-2">
            Explore Docs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
