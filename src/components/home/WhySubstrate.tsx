/**
 * Why CMPSBL — 9 Core Primitives Showcase
 * Premium bento grid with enhanced visuals and micro-animations
 * Color palette: Cyan / Purple / Magenta — solid colors, gradients reserved for key moments
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

// 9 public-facing primitives — cycling through cyan, purple, magenta (solid colors)
const primitives = [
  {
    icon: Brain,
    title: "Persistent Memory",
    node: "BRAIN Organ",
    description: "Four-tier cognitive memory (hot/warm/cold/glacier) that survives sessions. Your AI never forgets.",
    highlight: "Never Forgets",
    stat: "∞",
    statLabel: "Memory Depth",
    iconBg: "bg-[hsl(var(--neon-cyan)/0.12)]",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    statColor: "text-[hsl(var(--neon-cyan))]",
    pillBg: "bg-[hsl(var(--neon-cyan))]",
  },
  {
    icon: MessageSquare,
    title: "Epistemic Chat",
    node: "DECODE Agent",
    description: "Memory-aware conversations with context injection and session persistence.",
    highlight: "Context-Aware",
    stat: "∞",
    statLabel: "Context",
    iconBg: "bg-[hsl(var(--neon-purple)/0.12)]",
    iconColor: "text-[hsl(var(--neon-purple))]",
    statColor: "text-[hsl(var(--neon-purple))]",
    pillBg: "bg-[hsl(var(--neon-purple))]",
  },
  {
    icon: Shield,
    title: "Defense-First",
    node: "DEFENSE Layer",
    description: "Behavioral analysis, threat detection, rate limiting, and governance rules.",
    highlight: "Enterprise Security",
    stat: "100%",
    statLabel: "Coverage",
    iconBg: "bg-[hsl(var(--neon-magenta)/0.12)]",
    iconColor: "text-[hsl(var(--neon-magenta))]",
    statColor: "text-[hsl(var(--neon-magenta))]",
    pillBg: "bg-[hsl(var(--neon-magenta))]",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    node: "NEXUS Organ",
    description: "Routes every request to the optimal AI provider based on task, cost, and latency.",
    highlight: "Auto-Optimized",
    stat: "<100ms",
    statLabel: "Latency",
    iconBg: "bg-[hsl(var(--neon-cyan)/0.12)]",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    statColor: "text-[hsl(var(--neon-cyan))]",
    pillBg: "bg-[hsl(var(--neon-cyan))]",
  },
  {
    icon: Eye,
    title: "Full Observability",
    node: "VISION Agent",
    description: "Full observability across every invocation — including cost tracking, latency monitoring, and confidence scoring.",
    highlight: "See Everything",
    stat: "24/7",
    statLabel: "Monitoring",
    iconBg: "bg-[hsl(var(--neon-purple)/0.12)]",
    iconColor: "text-[hsl(var(--neon-purple))]",
    statColor: "text-[hsl(var(--neon-purple))]",
    pillBg: "bg-[hsl(var(--neon-purple))]",
  },
  {
    icon: Moon,
    title: "Dream Cycles",
    node: "DREAM Engine",
    description: "Offline processing to consolidate memories, extract patterns, and evolve understanding.",
    highlight: "Learns While Idle",
    stat: "24/7",
    statLabel: "Processing",
    iconBg: "bg-[hsl(var(--neon-magenta)/0.12)]",
    iconColor: "text-[hsl(var(--neon-magenta))]",
    statColor: "text-[hsl(var(--neon-magenta))]",
    pillBg: "bg-[hsl(var(--neon-magenta))]",
  },
  {
    icon: Code2,
    title: "Code Intelligence",
    node: "ENCODE Agent",
    description: "Code execution, generation intelligence, and DECODE Agent → ENCODE Agent memory formation.",
    highlight: "Code Execution",
    stat: "AI",
    statLabel: "Codegen",
    iconBg: "bg-[hsl(var(--neon-cyan)/0.12)]",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    statColor: "text-[hsl(var(--neon-cyan))]",
    pillBg: "bg-[hsl(var(--neon-cyan))]",
  },
  {
    icon: Plug,
    title: "Enterprise Integration",
    node: "INTEGRATION Organ",
    description: "Connect to enterprise systems (SAP, Oracle, Workday) with built-in LLM governance.",
    highlight: "LLM Governance",
    stat: "35+",
    statLabel: "Adapters",
    iconBg: "bg-[hsl(var(--neon-purple)/0.12)]",
    iconColor: "text-[hsl(var(--neon-purple))]",
    statColor: "text-[hsl(var(--neon-purple))]",
    pillBg: "bg-[hsl(var(--neon-purple))]",
  },
  {
    icon: Accessibility,
    title: "Inclusive A11y",
    node: "INCLUSIVE Layer",
    description: "Human compatibility engine with WCAG 2.2 scanning and AI ethics enforcement.",
    highlight: "Human Compatibility",
    stat: "WCAG",
    statLabel: "2.2 AA",
    iconBg: "bg-[hsl(var(--neon-magenta)/0.12)]",
    iconColor: "text-[hsl(var(--neon-magenta))]",
    statColor: "text-[hsl(var(--neon-magenta))]",
    pillBg: "bg-[hsl(var(--neon-magenta))]",
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
function FeatureCard({ item, idx }: { item: typeof primitives[0]; idx: number }) {
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
          "bg-[hsl(var(--stream-slate))] backdrop-blur-sm",
          "hover:border-[hsl(var(--neon-purple)/0.3)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--neon-purple)/0.04)] transition-all duration-500",
          "overflow-hidden cursor-default shimmer-on-hover"
        )}
      >
        {/* Solid color hover overlay instead of gradient */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{ 
            background: `hsl(var(--${item.iconColor.includes('cyan') ? 'neon-cyan' : item.iconColor.includes('purple') ? 'neon-purple' : 'neon-magenta'}) / ${isHovered ? 0.04 : 0})`,
          }}
        />
        
        {/* Top row: Icon + Stat */}
        <div className="relative flex items-start justify-between mb-4">
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
          
          {/* Stat — solid color instead of gradient */}
          <div className="text-right">
            <div className={cn(
              "text-lg sm:text-xl font-black font-mono tabular-nums",
              item.statColor
            )}>
              {item.stat}
            </div>
            <div className="text-[10px] text-muted-foreground">{item.statLabel}</div>
          </div>
        </div>
        
        {/* System name pill — solid bg instead of gradient */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className={cn(
            "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-sm",
            item.pillBg
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
      {/* Background decoration — richer solid color glows with depth */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div 
          className="absolute top-1/4 -left-64 w-[700px] h-[700px] rounded-full blur-[160px] animate-hero-orb-1"
          style={{ background: "hsl(var(--neon-cyan) / 0.07)" }}
        />
        <div 
          className="absolute bottom-1/4 -right-64 w-[700px] h-[700px] rounded-full blur-[160px] animate-hero-orb-3"
          style={{ background: "hsl(var(--neon-purple) / 0.07)" }}
        />
        {/* Mid-section warmth */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[180px] animate-hero-orb-2 opacity-60"
          style={{ background: "hsl(var(--neon-magenta) / 0.04)" }}
        />
        <div 
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px), 
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
           <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5 border-[hsl(var(--neon-cyan)/0.3)]">
             <Hammer className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
             <span className="text-xs">Build on the AI OS</span>
           </Badge>
           <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">
               Four Primitives.
               <br />
               <span className="text-[hsl(var(--neon-purple))]">One Operating System.</span>
             </h2>
           <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
               CMPSBL is powered by a set of core primitives:{" "}
               <span className="text-foreground font-medium">agents</span>,{" "}
               <span className="text-foreground font-medium">engines</span>,{" "}
               <span className="text-foreground font-medium">layers</span>, and{" "}
               <span className="text-foreground font-medium">organs</span>.
               All included in every plan.
             </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          layout
        >
          {primitives.map((item, idx) => (
            <FeatureCard key={item.title} item={item} idx={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
