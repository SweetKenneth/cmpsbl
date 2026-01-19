/**
 * Hero Concept C: "The Transformation Cinematic"
 * A dramatic split-screen showing a single AI before/after substrate
 * More emotional, cinematic, "wow" factor
 */

import React from "react";
import { motion } from "framer-motion";
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
  Infinity,
  Flame,
  Lock,
  Lightbulb,
  Clock
} from "lucide-react";

interface Capability {
  icon: React.ElementType;
  label: string;
  color: string;
}

interface Limitation {
  icon: React.ElementType;
  label: string;
  crossed: boolean;
}

const capabilities: Capability[] = [
  { icon: Infinity, label: "Infinite Memory", color: "#06b6d4" },
  { icon: Moon, label: "Dream Analysis", color: "#8b5cf6" },
  { icon: Shield, label: "Self-Defense", color: "#f59e0b" },
  { icon: Brain, label: "Continuous Learning", color: "#22c55e" },
  { icon: Eye, label: "Full Observability", color: "#3b82f6" },
  { icon: Flame, label: "Hot Knowledge", color: "#f43f5e" },
];

const limitations: Limitation[] = [
  { icon: Clock, label: "Session-Only Memory", crossed: true },
  { icon: Lock, label: "No Self-Defense", crossed: true },
  { icon: Lightbulb, label: "No Learning Loop", crossed: true },
];

// Floating particle effect
function FloatingParticle({ delay, size, color }: { delay: number; size: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      initial={{ 
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: [null, Math.random() * 100 - 50],
        y: [null, Math.random() * 100 - 50, Math.random() * 100 - 50],
        opacity: [0, 0.8, 0.8, 0],
        scale: [0, 1, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
}

// Orbiting ring around enhanced AI
function OrbitRing({ radius, duration, color, width }: { radius: number; duration: number; color: string; width: number }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: `${color}40`,
        borderWidth: width,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {/* Orbiting dot */}
      <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}`,
          top: -4,
          left: "50%",
          marginLeft: -4,
        }}
      />
    </motion.div>
  );
}

// The "basic" AI representation
function BasicAI() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Simple circle */}
      <motion.div
        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-muted-foreground/30 bg-muted/30 flex items-center justify-center"
        animate={{ opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="text-4xl md:text-5xl font-bold text-muted-foreground/60">AI</div>
      </motion.div>
      
      {/* Limitations list */}
      <div className="mt-8 space-y-3">
        {limitations.map((lim, i) => (
          <motion.div
            key={lim.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            className="flex items-center gap-3 text-muted-foreground"
          >
            <div className="relative">
              <lim.icon className="w-4 h-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-0.5 bg-destructive rotate-45" />
              </div>
            </div>
            <span className="text-sm line-through opacity-60">{lim.label}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">Standard AI</div>
    </div>
  );
}

// The "enhanced" AI representation
function EnhancedAI() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Complex glowing orb with rings */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-500 blur-xl"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Orbit rings */}
        <OrbitRing radius={80} duration={10} color="#06b6d4" width={1} />
        <OrbitRing radius={95} duration={15} color="#d946ef" width={1} />
        <OrbitRing radius={110} duration={20} color="#f59e0b" width={1} />
        
        {/* Core orb */}
        <motion.div
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-500 via-fuchsia-500 to-amber-500 flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 30px rgba(6,182,212,0.5), 0 0 60px rgba(217,70,239,0.3)",
              "0 0 50px rgba(6,182,212,0.7), 0 0 100px rgba(217,70,239,0.5)",
              "0 0 30px rgba(6,182,212,0.5), 0 0 60px rgba(217,70,239,0.3)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="text-3xl md:text-4xl font-bold text-white"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI+
          </motion.div>
        </motion.div>
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <FloatingParticle 
            key={i} 
            delay={i * 0.3} 
            size={3 + Math.random() * 3}
            color={["#06b6d4", "#d946ef", "#f59e0b"][i % 3]}
          />
        ))}
      </div>
      
      {/* Capabilities list */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="flex items-center gap-2"
          >
            <cap.icon className="w-4 h-4" style={{ color: cap.color }} />
            <span className="text-xs md:text-sm text-foreground">{cap.label}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6">
        <Badge className="bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-cyan-400 border-cyan-500/50">
          Substrate-Enhanced
        </Badge>
      </div>
    </div>
  );
}

// The transformation arrow/portal
function TransformationPortal() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full py-8">
      {/* Vertical portal effect */}
      <motion.div
        className="w-1 h-40 md:h-48 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Central portal */}
      <motion.div
        className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-cyan-500/50 bg-cyan-500/10 flex items-center justify-center backdrop-blur-sm"
        animate={{ 
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 20px rgba(6,182,212,0.3)",
            "0 0 40px rgba(6,182,212,0.6)",
            "0 0 20px rgba(6,182,212,0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
      </motion.div>
      
      {/* Arrow hint */}
      <motion.div
        className="absolute bottom-4 md:bottom-0"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowRight className="w-6 h-6 text-cyan-500 rotate-90 md:rotate-0" />
      </motion.div>
      
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute -bottom-8 whitespace-nowrap"
      >
        <span className="text-xs text-cyan-400 uppercase tracking-wider">Through Substrate</span>
      </motion.div>
    </div>
  );
}

export function HeroConceptC_TransformationCinematic() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-violet-950/20 to-background" />
      
      {/* Radial gradient spotlight */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 50%)",
        }}
        animate={{ 
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Concept Label */}
      <Badge className="absolute top-4 left-4 bg-violet-500/20 text-violet-400 border-violet-500/50">
        CONCEPT C: Transformation Cinematic
      </Badge>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-8 md:mb-12"
      >
        <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border-violet-500/30">
          <Sparkles className="w-3 h-3 mr-2 text-violet-400" />
          <span className="text-violet-300">Witness the Transformation</span>
        </Badge>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-foreground">Your AI, </span>
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            Evolved
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
          One substrate. Infinite possibilities.
        </p>
      </motion.div>

      {/* The Transformation Split */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BasicAI />
          </motion.div>
          
          {/* Portal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <TransformationPortal />
          </motion.div>
          
          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <EnhancedAI />
          </motion.div>
        </div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 flex flex-wrap gap-4 justify-center mt-12 md:mt-16"
      >
        <Button asChild size="lg" className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white shadow-lg shadow-violet-500/25">
          <Link to="/projects">
            Transform Your AI
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
          <Link to="/feed-dream-eater">
            <Moon className="mr-2 w-4 h-4" />
            Enter the Dream
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
          <Link to="/documentation">
            See How It Works
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
