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

// The 9 modules + zones + meshes of the substrate
const MODULES = [
  // Kernel Layer
  { icon: Cpu, name: "Core", color: "text-orange-400", description: "Kernel scheduling" },
  { icon: Zap, name: "Ripple", color: "text-teal-400", description: "Message bus" },
  { icon: Lock, name: "Access", color: "text-amber-400", description: "Identity & keys" },
  // Cognitive Layer
  { icon: Brain, name: "Brain", color: "text-violet-400", description: "3-tier memory" },
  { icon: MessageSquare, name: "Decode", color: "text-cyan-400", description: "Intent parsing" },
  { icon: Sparkles, name: "Nexus", color: "text-green-400", description: "AI routing" },
  // Operational Layer
  { icon: Shield, name: "Defense", color: "text-red-400", description: "Threat detection" },
  { icon: Eye, name: "Vision", color: "text-blue-400", description: "Observability" },
  { icon: Moon, name: "Dream", color: "text-purple-400", description: "Evolution" },
  // Admin Layer
  { icon: Settings, name: "System", color: "text-slate-400", description: "Administration" },
  { icon: Crown, name: "Evolution", color: "text-pink-400", description: "Self-improvement" },
  { icon: Globe, name: "Integration", color: "text-emerald-400", description: "Enterprise" },
  // Orchestrator Layer
  { icon: Sparkles, name: "Cortex", color: "text-fuchsia-400", description: "Orchestrator" },
  { icon: Sparkles, name: "Encode", color: "text-lime-400", description: "Execution engine" },
  // Human Compatibility Layer
  { icon: Eye, name: "Inclusive", color: "text-rose-400", description: "Human a11y" },
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
              className="gap-2 px-6 py-3 text-sm font-semibold border-primary/50 bg-primary/10 text-primary"
            >
              <Sparkles className="w-4 h-4" />
              Template & OS Marketplace
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[0.95] tracking-tight">
              <span className="text-foreground">Build AI That</span>
              <br />
              <span className="text-primary">Thinks, Remembers, Defends</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-12"
          >
            The only OS that gives LLMs persistent memory, real-time governance, and autonomous improvement. 
            <span className="text-foreground font-semibold"> No wrapper. No middleware. A complete cognitive kernel.</span>
          </motion.p>

          {/* Module Orbit Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative flex justify-center mb-16"
          >
            <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] mx-auto">
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
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-primary flex items-center justify-center shadow-2xl">
                  <Server className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>

              {/* Orbiting Modules */}
              {MODULES.map((mod, index) => {
                const angle = (index / MODULES.length) * 360;
                const radius = 120;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const Icon = mod.icon;
                
                return (
                  <motion.div
                    key={mod.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="group relative"
                    >
                      <div className={`p-2.5 md:p-3 rounded-xl bg-card border border-border/50 shadow-lg cursor-pointer transition-all duration-300 hover:border-primary/50`}>
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${mod.color}`} />
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
            transition={{ duration: 0.6, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12 max-w-5xl mx-auto"
          >
             <div className="text-center p-4 rounded-2xl bg-primary/10 border border-primary/30 col-span-2 md:col-span-1">
               <div className="text-2xl md:text-3xl font-black text-primary">$39</div>
               <div className="text-xs text-muted-foreground">AI Generator</div>
               <Badge className="mt-1 text-[10px] bg-primary/20 text-primary border-primary/30">NEW</Badge>
             </div>
             <div className="text-center p-4 rounded-2xl bg-[hsl(var(--stream-slate))]/30 border border-border/50">
               <div className="text-2xl md:text-3xl font-black text-primary">{TEMPLATES.length}+</div>
               <div className="text-xs text-muted-foreground">Templates</div>
             </div>
             <div className="text-center p-4 rounded-2xl bg-[hsl(var(--stream-slate))]/30 border border-border/50">
               <div className="text-2xl md:text-3xl font-black text-[hsl(var(--neon-cyan))]">13</div>
               <div className="text-xs text-muted-foreground">Modules</div>
             </div>
             <div className="text-center p-4 rounded-2xl bg-[hsl(var(--stream-slate))]/30 border border-border/50">
               <div className="text-2xl md:text-3xl font-black text-[hsl(var(--neon-purple))]">FREE</div>
               <div className="text-xs text-muted-foreground">SDK Access</div>
             </div>
             <div className="text-center p-4 rounded-2xl bg-[hsl(var(--stream-slate))]/30 border border-border/50">
               <div className="text-2xl md:text-3xl font-black text-[hsl(var(--neon-magenta))]">$27</div>
               <div className="text-xs text-muted-foreground">From</div>
             </div>
          </motion.div>

          {/* Differentiator Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="grid md:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto"
          >
             <div className="group p-6 rounded-2xl bg-[hsl(var(--neon-purple))]/5 border border-[hsl(var(--neon-purple))]/20 hover:border-[hsl(var(--neon-purple))]/40 transition-all">
               <Brain className="w-8 h-8 text-[hsl(var(--neon-purple))] mb-3" />
               <h3 className="font-bold text-foreground mb-2">3-Tier Memory</h3>
               <p className="text-sm text-muted-foreground">
                 Working, episodic, and semantic memory that persists across sessions. <strong className="text-foreground">Prevents context amnesia.</strong>
               </p>
             </div>
             <div className="group p-6 rounded-2xl bg-[hsl(var(--neon-magenta))]/5 border border-[hsl(var(--neon-magenta))]/20 hover:border-[hsl(var(--neon-magenta))]/40 transition-all">
               <Shield className="w-8 h-8 text-[hsl(var(--neon-magenta))] mb-3" />
               <h3 className="font-bold text-foreground mb-2">Autonomous Governance</h3>
               <p className="text-sm text-muted-foreground">
                 Real-time threat detection, PII filtering, and compliance enforcement. <strong className="text-foreground">Prevents prompt injection & drift attacks.</strong>
               </p>
             </div>
             <div className="group p-6 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all">
               <Moon className="w-8 h-8 text-primary mb-3" />
               <h3 className="font-bold text-foreground mb-2">Background Processing</h3>
               <p className="text-sm text-muted-foreground">
                 Autonomous overnight learning cycles. <strong className="text-foreground">Your AI improves while you sleep. No competitor offers this.</strong>
               </p>
             </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
             <Button 
               size="lg" 
               className="gap-2 px-8 py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
               onClick={() => document.getElementById('ai-generator')?.scrollIntoView({ behavior: 'smooth' })}
             >
               <Sparkles className="w-5 h-5" />
               Generate Unique Template — $39
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 px-8 py-6 text-lg font-medium"
            >
              <Server className="w-5 h-5" />
              Buy OS License — $999
            </Button>
          </motion.div>

          {/* Trust Signal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Licensed capabilities</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>82,944+ unique combinations</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>Multi-model compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Enterprise support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
