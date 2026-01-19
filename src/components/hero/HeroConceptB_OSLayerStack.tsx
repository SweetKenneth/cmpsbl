/**
 * Hero Concept B: "The OS Layer Stack"
 * Architectural diagram showing the literal OS layer concept
 * AI Apps on top → Substrate OS in the middle → 7 Core Modules as foundation
 */

import { useState } from "react";
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
  MessageSquare, 
  Eye, 
  Settings,
  Bot,
  Wand2,
  HeartPulse,
  BookOpen
} from "lucide-react";

const modules = [
  { icon: Brain, name: "Brain", desc: "Persistent Memory & Learning", color: "#06b6d4" },
  { icon: MessageSquare, name: "Decode", desc: "Epistemic Conversations", color: "#a855f7" },
  { icon: Shield, name: "Defense", desc: "Threat Detection & Security", color: "#f59e0b" },
  { icon: Zap, name: "Nexus", desc: "Intelligent AI Routing", color: "#22c55e" },
  { icon: Eye, name: "Vision", desc: "Observability & Metrics", color: "#3b82f6" },
  { icon: Moon, name: "Dream", desc: "Nocturnal Processing", color: "#8b5cf6" },
  { icon: Settings, name: "System", desc: "Admin & Self-Healing", color: "#f43f5e" },
];

const appExamples = [
  { icon: Bot, name: "AI Therapist", desc: "Long-term patient memory" },
  { icon: HeartPulse, name: "Health Coach", desc: "Learning from patterns" },
  { icon: Wand2, name: "Dream Journal", desc: "Analysis & interpretation" },
  { icon: BookOpen, name: "Study Buddy", desc: "Adaptive learning paths" },
];

function ModuleBlock({ module, index, isHovered }: { module: typeof modules[0]; index: number; isHovered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group cursor-pointer"
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-lg blur-md"
        style={{ background: module.color }}
        animate={{ 
          opacity: isHovered ? 0.4 : 0.15,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Block */}
      <div 
        className="relative px-3 py-2 md:px-4 md:py-3 rounded-lg border backdrop-blur-sm bg-background/60"
        style={{ borderColor: `${module.color}50` }}
      >
        <div className="flex items-center gap-2">
          <module.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: module.color }} />
          <div>
            <div className="text-xs md:text-sm font-semibold text-foreground">{module.name}</div>
            <div className="text-[9px] md:text-[10px] text-muted-foreground hidden md:block">{module.desc}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AppBlock({ app, index }: { app: typeof appExamples[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="px-3 py-2 md:px-4 md:py-3 rounded-lg border border-muted-foreground/30 bg-muted/30 backdrop-blur-sm cursor-pointer hover:border-fuchsia-500/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <app.icon className="w-4 h-4 text-fuchsia-400" />
        <div>
          <div className="text-xs md:text-sm font-medium text-foreground">{app.name}</div>
          <div className="text-[9px] md:text-[10px] text-muted-foreground hidden md:block">{app.desc}</div>
        </div>
      </div>
    </motion.div>
  );
}

function DataFlowLine({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute left-1/2 w-0.5 h-8 -translate-x-1/2"
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="w-full h-full bg-gradient-to-b from-fuchsia-500/50 to-cyan-500/50" />
      <motion.div
        className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-white/80 to-transparent rounded-full"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.5 }}
      />
    </motion.div>
  );
}

export function HeroConceptB_OSLayerStack() {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-950/20 via-background to-cyan-950/20" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Concept Label */}
      <Badge className="absolute top-4 left-4 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50">
        CONCEPT B: OS Layer Stack
      </Badge>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border-fuchsia-500/30">
            <Sparkles className="w-3 h-3 mr-2 text-fuchsia-400" />
            <span className="text-fuchsia-300">The First Operating System for AI</span>
          </Badge>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Build on Substrate
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your apps sit on top. Our OS handles the rest.
          </p>
        </motion.div>

        {/* Layer Stack Visualization */}
        <div className="relative flex flex-col items-center gap-6 md:gap-8">
          
          {/* Layer 3: Your Apps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <div className="text-center mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Your Apps</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {appExamples.map((app, i) => (
                <AppBlock key={app.name} app={app} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Data flow lines */}
          <div className="relative w-full h-12 flex justify-center">
            <DataFlowLine delay={0.6} />
          </div>

          {/* Layer 2: Substrate OS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="relative w-full max-w-2xl"
          >
            <div className="relative p-6 md:p-8 rounded-2xl border-2 border-dashed border-cyan-500/50 bg-gradient-to-r from-cyan-500/5 via-fuchsia-500/5 to-amber-500/5 backdrop-blur-sm">
              {/* Pulsing glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 blur-xl -z-10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                    SUBSTRATE OS
                  </span>
                </motion.div>
                <p className="text-sm text-muted-foreground mt-2">
                  Memory • Learning • Defense • Routing • Observability • Dreams • Admin
                </p>
              </div>
            </div>
          </motion.div>

          {/* Data flow lines */}
          <div className="relative w-full h-12 flex justify-center">
            <DataFlowLine delay={0.7} />
          </div>

          {/* Layer 1: Core Modules */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full"
          >
            <div className="text-center mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">7 Core Modules</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {modules.map((mod, i) => (
                <div
                  key={mod.name}
                  onMouseEnter={() => setHoveredModule(i)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <ModuleBlock module={mod} index={i} isHovered={hoveredModule === i} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap gap-4 justify-center mt-12"
        >
          <Button asChild size="lg" className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-400 hover:to-cyan-400 text-white shadow-lg shadow-fuchsia-500/25">
            <Link to="/projects">
              Start Building
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10">
            <Link to="/feed-dream-eater">
              <Moon className="mr-2 w-4 h-4" />
              Feed Dreams
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
            <Link to="/documentation">
              View Docs
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
