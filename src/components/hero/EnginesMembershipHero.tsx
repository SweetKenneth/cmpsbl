/**
 * Engines Membership Hero — Cinematic Visualization
 * Showcases the value prop: All dev tools FREE, Engines are the product
 * Unique, premium, completely distinctive to CMPSBL
 */

import React, { useState, useEffect, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Free tool items with staggered reveal
const freeTools = [
  { name: "Templates", icon: Package, count: "112+" },
  { name: "Pipelines", icon: Layers, count: "147" },
  { name: "Capabilities", icon: Zap, count: "269" },
  { name: "Memory", icon: Brain, count: "∞" },
  { name: "CodeLab", icon: Code, count: "Live" },
];

// Premium engine tiers
const engineTiers = [
  { name: "Starter", price: "Free", engines: "3", color: "from-slate-400 to-slate-500" },
  { name: "Builder", price: "$49", engines: "25", color: "from-cyan-400 to-cyan-600" },
  { name: "Pro", price: "$149", engines: "62", color: "from-violet-400 to-violet-600", featured: true },
  { name: "Enterprise", price: "Custom", engines: "All+", color: "from-amber-400 to-amber-600" },
];

// Floating particle
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
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: 0,
        background: `hsl(${hue} 70% 60%)`,
        boxShadow: `0 0 ${size * 3}px hsl(${hue} 70% 60% / 0.5)`,
      }}
      animate={{
        y: [0, -300, -500],
        opacity: [0, 0.8, 0],
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

// Orbiting ring around the central element
function OrbitRing({ 
  radius, 
  duration, 
  reverse = false,
  color,
  size = 6,
}: { 
  radius: number; 
  duration: number; 
  reverse?: boolean;
  color: string;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          top: "50%",
          left: "50%",
          marginTop: -radius,
          marginLeft: -size / 2,
          background: `linear-gradient(135deg, ${color}, transparent)`,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    </motion.div>
  );
}

// Free tools floating display
function FreeToolsOrbit() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % freeTools.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
      {/* Central "FREE" core with glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/40"
          animate={{
            scale: [1, 1.03, 1],
            boxShadow: [
              "0 20px 50px rgba(52, 211, 153, 0.3)",
              "0 25px 60px rgba(52, 211, 153, 0.45)",
              "0 20px 50px rgba(52, 211, 153, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-1" />
          <span className="text-white font-black text-lg sm:text-xl tracking-tight">FREE</span>
          <span className="text-emerald-100 text-[10px] sm:text-xs font-medium">Dev Tools</span>
        </motion.div>
        
        {/* Orbiting rings */}
        <OrbitRing radius={70} duration={15} color="hsl(185 70% 50%)" size={4} />
        <OrbitRing radius={90} duration={20} reverse color="hsl(280 70% 55%)" size={5} />
        <OrbitRing radius={110} duration={25} color="hsl(145 70% 50%)" size={4} />
      </div>
      
      {/* Floating tool icons */}
      {freeTools.map((tool, index) => {
        const angle = (index * 72 - 90) * (Math.PI / 180);
        const radius = 110;
        const x = 50 + Math.cos(angle) * (radius / 1.8);
        const y = 50 + Math.sin(angle) * (radius / 1.8);
        const isActive = index === activeIndex;
        const Icon = tool.icon;
        
        return (
          <motion.div
            key={tool.name}
            className="absolute z-20"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: isActive ? 1.15 : 1,
              y: isActive ? -4 : 0,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className={cn(
                "flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border backdrop-blur-sm transition-all duration-300",
                isActive 
                  ? "bg-card border-primary/50 shadow-lg shadow-primary/20" 
                  : "bg-card/70 border-border/50"
              )}
              animate={{
                boxShadow: isActive 
                  ? "0 8px 30px rgba(139, 92, 246, 0.25)" 
                  : "0 4px 12px rgba(0,0,0,0.1)"
              }}
            >
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all",
                isActive ? "bg-primary/20" : "bg-muted/50"
              )}>
                <Icon className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-foreground">{tool.name}</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500">{tool.count}</span>
            </motion.div>
          </motion.div>
        );
      })}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.2)" />
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.4)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.2)" />
          </linearGradient>
        </defs>
        {freeTools.map((_, index) => {
          const angle = (index * 72 - 90) * (Math.PI / 180);
          const radius = 75;
          const x2 = 50 + Math.cos(angle) * (radius / 1.8);
          const y2 = 50 + Math.sin(angle) * (radius / 1.8);
          
          return (
            <motion.line
              key={index}
              x1="50%"
              y1="50%"
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeIndex ? 0.8 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// Premium engines showcase
function EnginesShowcase() {
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  
  return (
    <div className="relative w-full">
      {/* Section header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-primary/10 border border-primary/30 mb-3">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-bold text-foreground">Engine Subscriptions</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
          The only products. Everything else is free.
        </p>
      </div>
      
      {/* Tier cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {engineTiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            className={cn(
              "relative p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
              tier.featured 
                ? "bg-gradient-to-br from-violet-500/15 to-primary/10 border-primary/50 ring-1 ring-primary/20" 
                : "bg-card/80 border-border/50 hover:border-primary/30"
            )}
            onMouseEnter={() => setHoveredTier(index)}
            onMouseLeave={() => setHoveredTier(null)}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {tier.featured && (
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-bl-lg">
                POPULAR
              </div>
            )}
            
            {/* Glow effect on hover */}
            <motion.div
              className={cn(
                "absolute inset-0 opacity-0 pointer-events-none rounded-xl",
                `bg-gradient-to-br ${tier.color}`
              )}
              animate={{ opacity: hoveredTier === index ? 0.1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-foreground">{tier.name}</span>
                <motion.div
                  animate={{ 
                    rotate: hoveredTier === index ? 360 : 0,
                    scale: hoveredTier === index ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {tier.price === "Free" ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </motion.div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className={cn(
                  "text-lg sm:text-xl font-black bg-clip-text text-transparent",
                  `bg-gradient-to-r ${tier.color}`
                )}>
                  {tier.price}
                </span>
                {tier.price !== "Free" && tier.price !== "Custom" && (
                  <span className="text-[10px] text-muted-foreground">/mo</span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
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
        transition={{ delay: 0.5 }}
        className="mt-4 text-center"
      >
        <Link 
          to="/engines"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 group"
        >
          View All 62 Engines
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

export function EnginesMembershipHero() {
  // Floating particles
  const particles = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      delay: i * 0.5,
      duration: 4 + Math.random() * 3,
      size: 3 + Math.random() * 4,
      x: 5 + Math.random() * 90,
      hue: [145, 185, 280, 340][Math.floor(Math.random() * 4)],
    })), []
  );
  
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl blur-3xl"
        style={{
          background: "radial-gradient(circle at 30% 30%, hsl(145 70% 50% / 0.15), transparent 50%), radial-gradient(circle at 70% 70%, hsl(280 70% 50% / 0.15), transparent 50%)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>
      
      {/* Main card container */}
      <div className="relative p-4 sm:p-6 rounded-3xl border border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-xl shadow-2xl shadow-black/10">
        {/* Animated border gradient */}
        <div 
          className="absolute inset-0 rounded-3xl p-px bg-gradient-to-br from-emerald-500/30 via-transparent to-violet-500/30 pointer-events-none" 
          style={{ 
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", 
            maskComposite: "xor" 
          }} 
        />
        
        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Free tools orbit */}
          <div className="flex justify-center">
            <FreeToolsOrbit />
          </div>
          
          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Free</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          
          {/* Engines showcase */}
          <EnginesShowcase />
        </div>
      </div>
    </div>
  );
}
