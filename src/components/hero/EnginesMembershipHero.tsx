/**
 * Engines Membership Hero — Mobile-First Cinematic Visualization
 * Showcases the value prop: All dev tools FREE, Engines are the product
 * Unique, premium, completely distinctive to CMPSBL
 */

import React, { useState, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Gift, 
  Crown,
  Zap,
  Check,
  ArrowRight,
  Code,
  Layers,
  Brain,
  Package,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicMetrics } from "@/stores/publicMetricsStore";

// Free tool items - driven by public metrics store
const getFreeTools = () => {
  const metrics = getPublicMetrics();
  return [
    { name: "Templates", icon: Package, count: "200+", color: "text-cyan-500" },
    { name: "Memories", icon: Layers, count: String(metrics.synergyPipelinesCount), color: "text-violet-500" },
    { name: "Capabilities", icon: Zap, count: String(metrics.capabilitiesCount), color: "text-amber-500" },
    { name: "Memory", icon: Brain, count: "∞", color: "text-rose-500" },
    { name: "CodeLab", icon: Code, count: "Live", color: "text-emerald-500" },
  ];
};

// Legacy static export for initial render
const freeTools = [
  { name: "Templates", icon: Package, count: "200+", color: "text-cyan-500" },
  { name: "Memories", icon: Layers, count: "300+", color: "text-violet-500" },
  { name: "Capabilities", icon: Zap, count: "525+", color: "text-amber-500" },
  { name: "Memory", icon: Brain, count: "∞", color: "text-rose-500" },
  { name: "CodeLab", icon: Code, count: "Live", color: "text-emerald-500" },
];

// Premium engine tiers
const engineTiers = [
  { name: "Free", price: "Free", engines: "30 + 1 meta", color: "from-slate-400 to-slate-500" },
  { name: "Creator", price: "$49", engines: "76 + 8 meta", color: "from-cyan-400 to-cyan-600" },
  { name: "Architect", price: "$149", engines: "76 + 16 meta", color: "from-violet-400 to-violet-600", featured: true },
  { name: "Enterprise", price: "Custom", engines: "76 + 24 meta", color: "from-amber-400 to-amber-600" },
];

// Floating particle with reduced motion for mobile
const FloatingParticle = memo(function FloatingParticle({ 
  delay, 
  duration, 
  size, 
  x, 
  hue 
}: { 
  delay: number; 
  duration: number; 
  size: number; 
  x: number;
  hue: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full opacity-40"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: "20%",
        background: `hsl(${hue} 70% 60%)`,
      }}
      animate={{
        y: [0, -80, -160],
        opacity: [0, 0.5, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
});

// Mobile-optimized free tools grid - no overlap, all visible
function FreeToolsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % freeTools.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full">
      {/* Central FREE badge */}
      <div className="flex justify-center mb-5">
        <motion.div
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/30"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white mb-0.5" />
          <span className="text-white font-black text-base sm:text-lg tracking-tight">FREE</span>
          <span className="text-emerald-100 text-[9px] sm:text-[10px] font-medium">Dev Tools</span>
        </motion.div>
      </div>
      
      {/* Tools grid - 3 on top, 2 centered below */}
      <div className="space-y-2">
        {/* Top row - 3 items */}
        <div className="flex justify-center gap-2">
          {freeTools.slice(0, 3).map((tool, index) => {
            const Icon = tool.icon;
            const isActive = index === activeIndex;
            
            return (
              <motion.div
                key={tool.name}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 min-w-[70px] sm:min-w-[80px]",
                  isActive 
                    ? "bg-card border-primary/50 shadow-md" 
                    : "bg-card/80 border-border/40"
                )}
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all",
                  isActive ? "bg-primary/15" : "bg-muted/40"
                )}>
                  <Icon className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                    isActive ? tool.color : "text-muted-foreground"
                  )} />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-foreground">{tool.name}</span>
                <span className={cn("text-[9px] sm:text-[10px] font-bold", tool.color)}>{tool.count}</span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Bottom row - 2 items centered */}
        <div className="flex justify-center gap-2">
          {freeTools.slice(3).map((tool, index) => {
            const Icon = tool.icon;
            const realIndex = index + 3;
            const isActive = realIndex === activeIndex;
            
            return (
              <motion.div
                key={tool.name}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 min-w-[70px] sm:min-w-[80px]",
                  isActive 
                    ? "bg-card border-primary/50 shadow-md" 
                    : "bg-card/80 border-border/40"
                )}
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all",
                  isActive ? "bg-primary/15" : "bg-muted/40"
                )}>
                  <Icon className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                    isActive ? tool.color : "text-muted-foreground"
                  )} />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-foreground">{tool.name}</span>
                <span className={cn("text-[9px] sm:text-[10px] font-bold", tool.color)}>{tool.count}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Premium engines showcase
function EnginesShowcase() {
  return (
    <div className="relative w-full">
      {/* Section header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-primary/10 border border-primary/30 mb-2">
          <Crown className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Engine Subscriptions</span>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground">
          The only products. Exploration tools are included in the free tier.
        </p>
      </div>
      
      {/* Tier cards - 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {engineTiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            className={cn(
              "relative p-3 rounded-xl border transition-all duration-300 overflow-hidden",
              tier.featured 
                ? "bg-gradient-to-br from-violet-500/10 to-primary/5 border-primary/40" 
                : "bg-card/80 border-border/40"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            {tier.featured && (
              <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-bl-lg">
                POPULAR
              </div>
            )}
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground">{tier.name}</span>
                {tier.price === "Free" ? (
                  <Unlock className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex items-baseline gap-0.5 mb-1">
                <span className={cn(
                  "text-base sm:text-lg font-black bg-clip-text text-transparent",
                  `bg-gradient-to-r ${tier.color}`
                )}>
                  {tier.price}
                </span>
                {tier.price !== "Free" && tier.price !== "Custom" && (
                  <span className="text-[9px] text-muted-foreground">/mo</span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{tier.engines} engines</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 flex justify-center"
      >
        <Link 
          to="/upgrade"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 group"
        >
          View Plans
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

export function EnginesMembershipHero() {
  // Reduced particles for mobile performance
  const particles = useMemo(() => 
    Array.from({ length: 6 }).map((_, i) => ({
      delay: i * 0.8,
      duration: 5 + Math.random() * 2,
      size: 2 + Math.random() * 3,
      x: 10 + Math.random() * 80,
      hue: [145, 185, 280][Math.floor(Math.random() * 3)],
    })), []
  );
  
  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto px-2">
      {/* Subtle ambient glow - not too heavy for mobile */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(145 60% 50% / 0.2), transparent 70%)",
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>
      
      {/* Main card container - properly padded for mobile */}
      <div className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/40 bg-gradient-to-br from-card/95 via-card/80 to-card/95 backdrop-blur-lg shadow-xl">
        {/* Animated border gradient */}
        <div 
          className="absolute inset-0 rounded-2xl sm:rounded-3xl p-px bg-gradient-to-br from-emerald-500/20 via-transparent to-violet-500/20 pointer-events-none" 
          style={{ 
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", 
            maskComposite: "xor",
            WebkitMaskComposite: "xor",
          }} 
        />
        
        <div className="relative z-10 space-y-5">
          {/* Free tools section */}
          <FreeToolsSection />
          
          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Free Tier</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          </div>
          
          {/* Engines showcase */}
          <EnginesShowcase />
        </div>
      </div>
    </div>
  );
}
