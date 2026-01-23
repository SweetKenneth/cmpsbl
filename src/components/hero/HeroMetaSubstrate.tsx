/**
 * META HERO: CMPSBL (Composable) By PromptFluid
 * Clear value proposition for all audiences: Gaming, Developers, Enterprise
 * Mobile-first, performance-optimized
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { 
  ArrowRight, 
  Brain, 
  Moon, 
  Shield, 
  Zap, 
  Eye,
  MessageSquare,
  Settings,
  Cpu,
  Network,
  Fingerprint,
  RefreshCw,
  Gamepad2,
  Code,
  Building2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// The 11 core modules (v4.1.1 kernel architecture)
const coreModules = [
  { icon: Cpu, name: "Core", color: "hsl(var(--muted-foreground))" },
  { icon: Network, name: "Ripple", color: "hsl(var(--neon-green))" },
  { icon: Fingerprint, name: "Access", color: "hsl(220 80% 60%)" },
  { icon: Brain, name: "Brain", color: "hsl(var(--neon-cyan))" },
  { icon: MessageSquare, name: "Decode", color: "hsl(var(--neon-purple))" },
  { icon: Shield, name: "Defense", color: "hsl(var(--neon-amber))" },
  { icon: Zap, name: "Nexus", color: "hsl(150 80% 50%)" },
  { icon: Eye, name: "Vision", color: "hsl(var(--neon-blue))" },
  { icon: Moon, name: "Dream", color: "hsl(var(--neon-magenta))" },
  { icon: Settings, name: "System", color: "hsl(var(--destructive))" },
  { icon: RefreshCw, name: "Modernizer", color: "hsl(30 80% 55%)" },
];

// Audience cards
const audienceCards = [
  {
    icon: Gamepad2,
    title: "Game Developers",
    description: "NPCs that remember, dream, and evolve",
    features: ["Persistent NPC memory", "Dream cycles", "Dynamic dialogue"],
    href: "/gaming",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-violet-500/20",
  },
  {
    icon: Code,
    title: "Software Developers",
    description: "Apps that think, learn, and adapt",
    features: ["3-tier memory", "AI routing", "Self-improvement"],
    href: "/developers",
    color: "text-cyan-500",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Building2,
    title: "Enterprise",
    description: "Operations that optimize themselves",
    features: ["Workflow memory", "Decision support", "Audit trails"],
    href: "/use-cases",
    color: "text-amber-500",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
];

// Compact module orbit visualization
function ModuleOrbit() {
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);
  
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mx-auto">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.2) 0%, transparent 70%)",
          animationDuration: "3s",
        }}
      />
      
      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-border/30"
        style={{
          width: "85%",
          height: "85%",
          left: "7.5%",
          top: "7.5%",
        }}
      />
      
      {/* Inner core */}
      <div 
        className="absolute inset-6 sm:inset-8 rounded-full border-2 backdrop-blur-md flex items-center justify-center z-10"
        style={{
          background: "linear-gradient(135deg, hsl(var(--neon-cyan) / 0.1), hsl(var(--neon-magenta) / 0.05))",
          borderColor: "hsl(var(--primary) / 0.3)",
        }}
      >
        <div className="text-center">
          <div 
            className="text-base sm:text-lg font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CMPSBL
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">11 Modules</div>
        </div>
      </div>
      
      {/* Module icons */}
      {coreModules.map((mod, i) => {
        const angle = (i / coreModules.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 70;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <div
            key={mod.name}
            className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center cursor-pointer z-20 transition-transform duration-200 hover:scale-125"
            style={{
              left: `calc(50% + ${x}px - 10px)`,
              top: `calc(50% + ${y}px - 10px)`,
              background: hoveredModule === i ? mod.color : `${mod.color}30`,
              border: `1.5px solid ${mod.color}`,
              boxShadow: `0 0 8px ${mod.color}50`,
            }}
            onMouseEnter={() => setHoveredModule(i)}
            onMouseLeave={() => setHoveredModule(null)}
            title={mod.name}
          >
            <mod.icon 
              className="w-2.5 h-2.5 sm:w-3 sm:h-3" 
              style={{ 
                color: hoveredModule === i ? "hsl(var(--background))" : mod.color,
              }} 
            />
          </div>
        );
      })}
    </div>
  );
}

// Audience card component
function AudienceCard({ 
  icon: Icon, 
  title, 
  description, 
  features, 
  href, 
  color, 
  gradient,
  delay = 0 
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  href: string;
  color: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link to={href} className="group block h-full">
        <div className={cn(
          "relative h-full p-5 sm:p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
          "hover:border-current/30 hover:shadow-lg transition-all duration-300",
          color
        )}>
          {/* Gradient background on hover */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br -z-10",
            gradient
          )} />
          
          {/* Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-current/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">{description}</p>
          
          {/* Features */}
          <ul className="space-y-1.5 mb-3">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-current opacity-60" />
                {feature}
              </li>
            ))}
          </ul>
          
          {/* Arrow */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-current opacity-0 group-hover:opacity-100 transition-opacity">
            Learn more
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function HeroMetaSubstrate() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16 sm:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <CmpsblLogo size="xl" className="h-16 sm:h-20 md:h-24" />
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 tracking-tight leading-tight">
            <span className="text-foreground">Build AI That </span>
            <span 
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Remembers
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            CMPSBL gives your applications persistent memory, 
            dream cycles, intelligent routing, and autonomous learning. 
            <span className="hidden sm:inline"> One infrastructure for gaming, software, and enterprise.</span>
          </p>
        </motion.div>

        {/* Module Orbit - visible on larger screens */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block mb-8"
        >
          <ModuleOrbit />
        </motion.div>

        {/* Audience Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 px-2">
          {audienceCards.map((card, idx) => (
            <AudienceCard key={card.title} {...card} delay={0.3 + idx * 0.1} />
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Button asChild size="lg" className="w-full sm:w-auto gap-2 px-6 sm:px-8">
            <Link to="/codelab">
              <Code className="w-4 h-4" />
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6 sm:px-8">
            <Link to="/demo">
              <Eye className="w-4 h-4" />
              See Demo
            </Link>
          </Button>
        </motion.div>
        
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/50"
        >
          {[
            { value: "11", label: "Modules" },
            { value: "124+", label: "Actions" },
            { value: "60+", label: "Tables" },
            { value: "<100ms", label: "Latency" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-3">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
