/**
 * Why CMPSBL — Value proposition section for homepage
 * Premium bento grid with enhanced visuals and micro-animations
 */

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Brain, 
  Moon, 
  Zap, 
  Shield, 
  RefreshCw, 
  Lock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const differentiators = [
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "3-tier memory architecture (hot/warm/cold) that survives sessions. Your AI never forgets a conversation, preference, or interaction.",
    highlight: "Never Forgets",
    stat: "∞",
    statLabel: "Memory Depth",
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-500",
    glowColor: "cyan",
  },
  {
    icon: Moon,
    title: "Dream Cycles",
    description: "Offline processing that consolidates memories, extracts patterns, and evolves understanding—like REM sleep for AI.",
    highlight: "Learns While Idle",
    stat: "24/7",
    statLabel: "Processing",
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    glowColor: "violet",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    description: "Every request routed to the optimal AI provider based on task complexity, cost constraints, and latency requirements.",
    highlight: "Auto-Optimized",
    stat: "<100ms",
    statLabel: "Latency",
    color: "from-green-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
    glowColor: "green",
  },
  {
    icon: Shield,
    title: "Defense-First",
    description: "Behavioral analysis, threat detection, rate limiting, and governance rules built into every layer of the stack.",
    highlight: "Enterprise Security",
    stat: "100%",
    statLabel: "Coverage",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    glowColor: "amber",
  },
  {
    icon: RefreshCw,
    title: "Self-Improving",
    description: "The Modernizer continuously scans code, proposes upgrades, and applies patches—your system gets better autonomously.",
    highlight: "Autonomous Updates",
    stat: "Auto",
    statLabel: "Evolution",
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
    glowColor: "rose",
  },
  {
    icon: Lock,
    title: "BYOK Architecture",
    description: "Bring your own API keys. No vendor lock-in. Pay providers directly. Your data stays yours.",
    highlight: "Zero Lock-In",
    stat: "0",
    statLabel: "Lock-In",
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
    glowColor: "blue",
  },
];

// 3D tilt effect hook for cards
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

// Individual feature card with tilt effect
function FeatureCard({ item, idx }: { item: typeof differentiators[0]; idx: number }) {
  const { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: idx * 0.08, duration: 0.5 }}
      className="group relative h-full"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          handleMouseLeave();
          setIsHovered(false);
        }}
        onMouseEnter={() => setIsHovered(true)}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative h-full p-6 sm:p-7 rounded-2xl border border-border/50",
          "bg-card/50 backdrop-blur-sm",
          "hover:border-border transition-all duration-500",
          "overflow-hidden cursor-default"
        )}
      >
        {/* Animated glow on hover */}
        <motion.div
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, hsl(var(--neon-${item.glowColor === 'cyan' ? 'cyan' : item.glowColor === 'violet' ? 'purple' : item.glowColor === 'green' ? 'green' : item.glowColor === 'amber' ? 'amber' : item.glowColor === 'rose' ? 'magenta' : 'blue'}) / 0.15), transparent)`,
          }}
        />
        
        {/* Gradient hover overlay */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-br",
            item.color
          )}
          style={{ opacity: isHovered ? 0.06 : 0 }}
        />
        
        {/* Top row: Icon + Stat */}
        <div className="relative flex items-start justify-between mb-4">
          {/* Icon */}
          <motion.div 
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center",
              item.iconBg
            )}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <item.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", item.iconColor)} />
          </motion.div>
          
          {/* Stat */}
          <div className="text-right">
            <div className={cn(
              "text-lg sm:text-xl font-black bg-gradient-to-r bg-clip-text text-transparent",
              item.color
            )}>
              {item.stat}
            </div>
            <div className="text-[10px] text-muted-foreground">{item.statLabel}</div>
          </div>
        </div>
        
        {/* Highlight pill */}
        <div className={cn(
          "inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-3",
          "bg-gradient-to-r text-white shadow-sm",
          item.color
        )}>
          {item.highlight}
        </div>
        
        {/* Content */}
        <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 group-hover:text-foreground/90 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
        
        {/* Hover arrow indicator */}
        <motion.div 
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ x: isHovered ? 0 : -10 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowRight className={cn("w-4 h-4", item.iconColor)} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function WhySubstrate() {
  return (
    <section className="relative py-20 sm:py-32 px-4 overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-violet-500/8 rounded-full blur-[150px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.8, 0.5, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), 
              linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-20"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs">Why CMPSBL</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
            What Makes It{" "}
            <span 
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)), hsl(var(--neon-purple)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease-in-out infinite",
              }}
            >
              Different
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Beyond traditional AI backends. Infrastructure that 
            <span className="text-foreground font-medium"> thinks</span>, 
            <span className="text-foreground font-medium"> learns</span>, and 
            <span className="text-foreground font-medium"> evolves</span> on its own.
          </p>
        </motion.div>
        
        {/* Features Grid - Enhanced Bento style with 3D tilt */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {differentiators.map((item, idx) => (
            <FeatureCard key={item.title} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
