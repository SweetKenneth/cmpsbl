/**
 * Cinematic Marketplace Hero — CMPSBL: World's First AI Governance OS
 * Premium visual experience conveying unprecedented market position
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Shield, Moon, Zap, Eye, Cpu, MessageSquare, Settings,
  Sparkles, Crown, Server, Lock, ArrowRight, Star, Globe, Users
} from "lucide-react";
import { TEMPLATES } from "@/data/templates";

// The 12 modules of the substrate
const MODULES = [
  { icon: Brain, name: "Brain", color: "text-violet-400", description: "3-tier memory" },
  { icon: MessageSquare, name: "Decode", color: "text-blue-400", description: "Intent parsing" },
  { icon: Shield, name: "Defense", color: "text-red-400", description: "Threat detection" },
  { icon: Zap, name: "Nexus", color: "text-amber-400", description: "Multi-model routing" },
  { icon: Eye, name: "Vision", color: "text-emerald-400", description: "Observability" },
  { icon: Moon, name: "Dream", color: "text-purple-400", description: "Night synthesis" },
  { icon: Settings, name: "Agency", color: "text-cyan-400", description: "Agent orchestration" },
  { icon: Cpu, name: "Core", color: "text-pink-400", description: "Kernel runtime" },
];

// Competitor logos (stylized as text for now)
const COMPETITORS = ["OpenAI", "Anthropic", "Google", "Meta"];

export function MarketplaceHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Cinematic Background Layers */}
      <div className="absolute inset-0 -z-10">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        
        {/* Animated glow orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-neon-purple/15 via-neon-purple/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-neon-cyan/15 via-neon-cyan/5 to-transparent rounded-full blur-3xl"
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-white/5 opacity-30" />
        
        {/* Radial fade */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/90" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Top Badge - Market Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <Badge 
              variant="outline" 
              className="gap-2 px-6 py-3 text-sm font-semibold border-amber-500/50 bg-amber-500/10 text-amber-500 dark:text-amber-400"
            >
              <Crown className="w-4 h-4" />
              WORLD'S FIRST — PRODUCTION-READY AI GOVERNANCE OS
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-tight">
              <span className="block text-foreground mb-2">What They</span>
              <span className="block text-foreground mb-2">
                <span className="relative inline-block">
                  <span className="line-through opacity-40">Can't</span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute inset-0 bg-destructive/20 rounded"
                  />
                </span>
                {" "}Build,
              </span>
              <span className="block bg-gradient-to-r from-primary via-neon-cyan to-neon-green bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                We Ship.
              </span>
            </h1>
          </motion.div>

          {/* Competitor Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center gap-4 mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {COMPETITORS.map((name, i) => (
                <span key={name} className="flex items-center gap-1">
                  <span className="opacity-50 line-through">{name}</span>
                  {i < COMPETITORS.length - 1 && <span className="opacity-30">•</span>}
                </span>
              ))}
              <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
              <span className="font-bold text-primary">CMPSBL</span>
            </div>
          </motion.div>

          {/* Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg md:text-xl lg:text-2xl text-center text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            The only operating system that gives LLMs{" "}
            <span className="text-foreground font-semibold">persistent memory</span>,{" "}
            <span className="text-foreground font-semibold">real-time governance</span>, and{" "}
            <span className="text-foreground font-semibold">autonomous improvement</span>.
            <span className="block mt-2 text-base md:text-lg text-muted-foreground/80">
              No wrapper. No middleware. A complete cognitive kernel.
            </span>
          </motion.p>

          {/* Module Orbit Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative flex justify-center mb-16"
          >
            <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
              {/* Center Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute w-full h-full rounded-full border border-border/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[75%] h-[75%] rounded-full border border-primary/20"
                />
                <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-neon-cyan flex items-center justify-center shadow-2xl">
                  <Server className="w-10 h-10 md:w-14 md:h-14 text-primary-foreground" />
                </div>
              </div>

              {/* Orbiting Modules */}
              {MODULES.map((mod, index) => {
                const angle = (index / MODULES.length) * 360;
                const radius = 130;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const Icon = mod.icon;
                
                return (
                  <motion.div
                    key={mod.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="group relative"
                    >
                      <div className={`p-3 rounded-xl bg-card border border-border/50 shadow-lg cursor-pointer transition-all duration-300 hover:border-primary/50`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${mod.color}`} />
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {mod.name}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 max-w-4xl mx-auto"
          >
            <div className="text-center p-4 rounded-2xl bg-card/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-black text-primary">{TEMPLATES.length}+</div>
              <div className="text-sm text-muted-foreground">Production Templates</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-card/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-black text-primary">12</div>
              <div className="text-sm text-muted-foreground">Kernel Modules</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-card/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-black text-system-green">FREE</div>
              <div className="text-sm text-muted-foreground">SDK Access</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-card/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-black text-primary">$9</div>
              <div className="text-sm text-muted-foreground">Templates From</div>
            </div>
          </motion.div>

          {/* Differentiator Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="grid md:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto"
          >
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all">
              <Brain className="w-8 h-8 text-violet-400 mb-3" />
              <h3 className="font-bold text-foreground mb-2">3-Tier Memory</h3>
              <p className="text-sm text-muted-foreground">
                Working, episodic, and semantic memory that persists across sessions. No more stateless conversations.
              </p>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all">
              <Shield className="w-8 h-8 text-red-400 mb-3" />
              <h3 className="font-bold text-foreground mb-2">Autonomous Governance</h3>
              <p className="text-sm text-muted-foreground">
                Real-time threat detection, PII filtering, and compliance enforcement. Security built into the kernel.
              </p>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <Moon className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-bold text-foreground mb-2">Dream Synthesis</h3>
              <p className="text-sm text-muted-foreground">
                Autonomous overnight learning cycles. Your AI improves while you sleep. No competitor has this.
              </p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="gap-2 px-8 py-6 text-lg font-bold bg-gradient-to-r from-primary to-neon-cyan hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-5 h-5" />
              Start Free with SDK
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 px-8 py-6 text-lg font-medium"
            >
              <Server className="w-5 h-5" />
              Buy OS License — $599
            </Button>
          </motion.div>

          {/* Trust Signal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-system-green" />
              <span>Self-hosted licensing</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Production-ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Multi-model compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neon-purple" />
              <span>Enterprise support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
