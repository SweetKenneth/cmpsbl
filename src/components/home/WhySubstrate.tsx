/**
 * Why CMPSBL — 9 Core Nodes Showcase
 * Premium bento grid with enhanced visuals and micro-animations
 * Only the 9 public-facing nodes
 */

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Brain, 
  Moon, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  Eye,
  MessageSquare,
  Plug,
  Code2,
  Accessibility,
  Hammer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 9 public-facing nodes only — no kernel, zones, overlays, or infrastructure
const nodes = [
  {
    icon: Brain,
    title: "Persistent Memory",
    node: "BRAIN",
    description: "3-tier memory (hot/warm/cold) that survives sessions. Your AI never forgets.",
    highlight: "Never Forgets",
    stat: "∞",
    statLabel: "Memory Depth",
    color: "from-purple-500 to-violet-600",
    iconBg: "bg-gradient-to-br from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-500",
    glowColor: "purple",
  },
  {
    icon: MessageSquare,
    title: "Epistemic Chat",
    node: "DECODE",
    description: "Memory-aware conversations with context injection and session persistence.",
    highlight: "Context-Aware",
    stat: "∞",
    statLabel: "Context",
    color: "from-fuchsia-500 to-pink-600",
    iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20",
    iconColor: "text-fuchsia-500",
    glowColor: "pink",
  },
  {
    icon: Shield,
    title: "Defense-First",
    node: "DEFENSE",
    description: "Behavioral analysis, threat detection, rate limiting, and governance rules.",
    highlight: "Enterprise Security",
    stat: "100%",
    statLabel: "Coverage",
    color: "from-red-500 to-rose-600",
    iconBg: "bg-gradient-to-br from-red-500/20 to-rose-500/20",
    iconColor: "text-red-500",
    glowColor: "red",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    node: "NEXUS",
    description: "Routes every request to the optimal AI provider based on task, cost, and latency.",
    highlight: "Auto-Optimized",
    stat: "<100ms",
    statLabel: "Latency",
    color: "from-green-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
    glowColor: "green",
  },
  {
    icon: Eye,
    title: "Full Observability",
    node: "VISION",
    description: "Full observability across every invocation — including cost tracking, latency monitoring, and confidence scoring.",
    highlight: "See Everything",
    stat: "24/7",
    statLabel: "Monitoring",
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
    glowColor: "blue",
  },
  {
    icon: Moon,
    title: "Dream Cycles",
    node: "DREAM",
    description: "Offline processing to consolidate memories, extract patterns, and evolve understanding.",
    highlight: "Learns While Idle",
    stat: "24/7",
    statLabel: "Processing",
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    glowColor: "violet",
  },
  {
    icon: Code2,
    title: "Code Intelligence",
    node: "ENCODE",
    description: "Code execution, generation intelligence, and the DECODE → ENCODE pipeline.",
    highlight: "Code Execution",
    stat: "AI",
    statLabel: "Codegen",
    color: "from-yellow-500 to-lime-600",
    iconBg: "bg-gradient-to-br from-yellow-500/20 to-lime-500/20",
    iconColor: "text-yellow-500",
    glowColor: "amber",
  },
  {
    icon: Plug,
    title: "Enterprise Integration",
    node: "INTEGRATION",
    description: "Connect to enterprise systems (SAP, Oracle, Workday) with LLM governance.",
    highlight: "LLM Governance",
    stat: "35+",
    statLabel: "Adapters",
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    glowColor: "emerald",
  },
  {
    icon: Accessibility,
    title: "Inclusive A11y",
    node: "INCLUSIVE",
    description: "Human-compatibility pipeline with WCAG 2.2 scanning and AI ethics governance.",
    highlight: "Human Compatibility",
    stat: "WCAG",
    statLabel: "2.2 AA",
    color: "from-pink-500 to-rose-600",
    iconBg: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    glowColor: "rose",
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
function FeatureCard({ item, idx }: { item: typeof nodes[0]; idx: number }) {
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
          "hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.04] transition-all duration-500",
          "overflow-hidden cursor-default shimmer-on-hover"
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
              "text-lg sm:text-xl font-black font-mono tabular-nums bg-gradient-to-r bg-clip-text text-transparent",
              item.color
            )}>
              {item.stat}
            </div>
            <div className="text-[10px] text-muted-foreground">{item.statLabel}</div>
          </div>
        </div>
        
        {/* System name pill */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className={cn(
            "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
            "bg-gradient-to-r text-white shadow-sm",
            item.color
          )}>
            {item.highlight}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60">{item.node}</span>
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
    <section className="relative py-14 sm:py-32 px-4 overflow-hidden">
      {/* Enhanced background decoration — CSS-only for mobile perf */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div 
          className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px] animate-hero-orb-1"
        />
        <div 
          className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-violet-500/8 rounded-full blur-[150px] animate-hero-orb-3"
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
        {/* Header with section ordinal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Faded ordinal behind heading */}
          <div className="relative inline-block">
            <span className="section-ordinal absolute -top-10 left-1/2 -translate-x-1/2 hidden sm:block" aria-hidden="true">01</span>
          </div>
           <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
             <Hammer className="w-3 h-3 text-primary" />
             <span className="text-xs">Build on the AI OS</span>
           </Badge>
           <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
             Nine Systems.{" "}
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
               One Operating System.
             </span>
           </h2>
           <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Build apps that{" "}
              <span className="text-foreground font-medium">think with reasoning models</span>,{" "}
              <span className="text-foreground font-medium">remember across sessions</span>, and{" "}
              <span className="text-foreground font-medium">improve themselves through learning cycles</span>.
              All included in every plan.
            </p>
        </motion.div>
        
        {/* Systems Grid — 3 columns on desktop, 9 cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          layout
        >
          {nodes.map((item, idx) => (
            <FeatureCard key={item.title} item={item} idx={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
