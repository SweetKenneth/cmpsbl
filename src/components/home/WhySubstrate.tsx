/**
 * Why CMPSBL — Full execution surface capability showcase
 * Premium bento grid with enhanced visuals and micro-animations
 * v11.1 SPARTA Epoch: Complete representation of the layered kernel architecture
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
  Eye,
  MessageSquare,
  Cpu,
  Radio,
  Key,
  Settings,
  Layers,
  Plug,
  Database,
  Send,
  FileCheck,
  Fingerprint,
  Coins,
  FlaskConical,
  Code2,
  Accessibility,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Hexagon } from "lucide-react";

// All capabilities mapped to execution surfaces in layered kernel architecture
const differentiators = [
  // KERNEL LAYER - Core infrastructure
  {
    icon: Cpu,
    title: "Kernel Orchestration",
    layer: "Kernel",
    description: "CORE module handles task scheduling, cron jobs, and kernel-level coordination across all cognitive functions.",
    highlight: "Central Brain",
    stat: "24",
    statLabel: "Surfaces",
    color: "from-orange-500 to-amber-600",
    iconBg: "bg-gradient-to-br from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
    glowColor: "orange",
  },
  {
    icon: Radio,
    title: "Event Streaming",
    layer: "Kernel",
    description: "RIPPLE module provides pub/sub messaging, cross-module communication, and event-sourced architecture.",
    highlight: "Real-Time Bus",
    stat: "∞",
    statLabel: "Events/sec",
    color: "from-cyan-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-500",
    glowColor: "cyan",
  },
  {
    icon: Key,
    title: "Identity & Access",
    layer: "Kernel",
    description: "ACCESS module manages API keys, usage metering, rate limiting, and multi-tenant access control.",
    highlight: "Zero Trust",
    stat: "BYOK",
    statLabel: "Architecture",
    color: "from-amber-500 to-yellow-600",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-500",
    glowColor: "amber",
  },
  // COGNITIVE LAYER - Intelligence
  {
    icon: Brain,
    title: "Persistent Memory",
    layer: "Cognitive",
    description: "BRAIN module provides 3-tier memory (hot/warm/cold) that survives sessions. Your AI never forgets.",
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
    layer: "Cognitive",
    description: "DECODE module powers memory-aware conversations with context injection and session persistence.",
    highlight: "Context-Aware",
    stat: "∞",
    statLabel: "Context",
    color: "from-fuchsia-500 to-pink-600",
    iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20",
    iconColor: "text-fuchsia-500",
    glowColor: "pink",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    layer: "Cognitive",
    description: "NEXUS module routes every request to the optimal AI provider based on task, cost, and latency constraints.",
    highlight: "Auto-Optimized",
    stat: "<100ms",
    statLabel: "Latency",
    color: "from-green-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
    glowColor: "green",
  },
  // OPERATIONAL LAYER - Runtime
  {
    icon: Shield,
    title: "Defense-First",
    layer: "Operational",
    description: "DEFENSE module provides behavioral analysis, threat detection, rate limiting, and governance rules.",
    highlight: "Enterprise Security",
    stat: "100%",
    statLabel: "Coverage",
    color: "from-red-500 to-rose-600",
    iconBg: "bg-gradient-to-br from-red-500/20 to-rose-500/20",
    iconColor: "text-red-500",
    glowColor: "red",
  },
  {
    icon: Eye,
    title: "Full Observability",
    layer: "Operational",
    description: "VISION module tracks health metrics, latency, costs, and provides real-time dashboards and alerts.",
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
    layer: "Operational",
    description: "DREAM module runs offline processing to consolidate memories, extract patterns, and evolve understanding.",
    highlight: "Learns While Idle",
    stat: "24/7",
    statLabel: "Processing",
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    glowColor: "violet",
  },
  // ADMIN LAYER - Control plane
  {
    icon: Settings,
    title: "System Control",
    layer: "Admin",
    description: "SYSTEM module handles backups, restore points, configuration, and administrative operations.",
    highlight: "Full Control",
    stat: "1-Click",
    statLabel: "Recovery",
    color: "from-emerald-500 to-green-600",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500",
    glowColor: "emerald",
  },
  {
    icon: Sparkles,
    title: "Self-Improving",
    layer: "Overlay",
    description: "EVOLUTION mesh overlay continuously scans code, proposes upgrades, and applies patches autonomously.",
    highlight: "Autonomous Updates",
    stat: "Auto",
    statLabel: "Evolution",
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
    glowColor: "rose",
  },
  {
    icon: Plug,
    title: "Enterprise Integration",
    layer: "Admin",
    description: "INTEGRATION module connects to enterprise systems (SAP, Oracle, Workday) and governs LLM access to real business operations.",
    highlight: "LLM Governance",
    stat: "35+",
    statLabel: "Adapters",
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    glowColor: "emerald",
  },
  // ORCHESTRATOR LAYER - Autonomous control
  {
    icon: Hexagon,
    title: "Cortex Orchestrator",
    layer: "Orchestrator",
    description: "CORTEX module provides autonomous multi-agent coordination, evolution sequencing, and system-wide governance decisions.",
    highlight: "Agency Control",
    stat: "AI",
    statLabel: "Orchestration",
    color: "from-fuchsia-500 to-violet-600",
    iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20",
    iconColor: "text-fuchsia-500",
    glowColor: "violet",
  },
  // HUMAN COMPATIBILITY
  {
    icon: Accessibility,
    title: "Inclusive A11y",
    layer: "Admin",
    description: "INCLUSIVE module provides human-compatibility pipeline with WCAG 2.2 scanning, accessibility repairs, and AI ethics governance.",
    highlight: "Human Compatibility",
    stat: "WCAG",
    statLabel: "2.2 AA",
    color: "from-pink-500 to-rose-600",
    iconBg: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    glowColor: "rose",
  },
  // INFRASTRUCTURE LAYER (6 modules)
  {
    icon: Database,
    title: "Vector Memory",
    layer: "Infrastructure",
    description: "MEMORY module provides vector embeddings, RAG orchestration, and semantic search across all knowledge stores.",
    highlight: "RAG Pipeline",
    stat: "∞",
    statLabel: "Vectors",
    color: "from-sky-500 to-blue-600",
    iconBg: "bg-gradient-to-br from-sky-500/20 to-blue-500/20",
    iconColor: "text-sky-500",
    glowColor: "blue",
  },
  {
    icon: Send,
    title: "Outbound Relay",
    layer: "Infrastructure",
    description: "RELAY module handles outbound webhooks, email notifications, and cross-system event delivery.",
    highlight: "Event Delivery",
    stat: "<50ms",
    statLabel: "Latency",
    color: "from-lime-500 to-green-600",
    iconBg: "bg-gradient-to-br from-lime-500/20 to-green-500/20",
    iconColor: "text-lime-500",
    glowColor: "green",
  },
  {
    icon: FileCheck,
    title: "Compliance Ledger",
    layer: "Infrastructure",
    description: "AUDIT module maintains an immutable compliance ledger for every action, decision, and data access across the substrate.",
    highlight: "Immutable Trail",
    stat: "100%",
    statLabel: "Coverage",
    color: "from-stone-500 to-gray-600",
    iconBg: "bg-gradient-to-br from-stone-500/20 to-gray-500/20",
    iconColor: "text-stone-500",
    glowColor: "amber",
  },
  {
    icon: Fingerprint,
    title: "Actor Identity",
    layer: "Infrastructure",
    description: "IDENTITY module provides actor attribution, cryptographic signatures, and provenance tracking for every operation.",
    highlight: "Zero-Trust Identity",
    stat: "PKI",
    statLabel: "Signatures",
    color: "from-rose-500 to-red-600",
    iconBg: "bg-gradient-to-br from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500",
    glowColor: "rose",
  },
  {
    icon: Coins,
    title: "Cost Attribution",
    layer: "Infrastructure",
    description: "ECONOMY module tracks cost attribution, budget enforcement, and economic optimization across all AI operations.",
    highlight: "Budget Control",
    stat: "$0.00",
    statLabel: "Waste",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
    glowColor: "amber",
  },
  {
    icon: FlaskConical,
    title: "Sandboxed Execution",
    layer: "Infrastructure",
    description: "SANDBOX module provides isolated execution environments for untrusted code, experiments, and safe AI tool-use.",
    highlight: "Isolated Envs",
    stat: "0",
    statLabel: "Blast Radius",
    color: "from-cyan-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-600",
    glowColor: "cyan",
  },
  // ENCODE
  {
    icon: Code2,
    title: "Code Intelligence",
    layer: "Cognitive",
    description: "ENCODE module powers code execution, generation intelligence, and the DECODE → ENCODE execution pipeline.",
    highlight: "Code Execution",
    stat: "AI",
    statLabel: "Codegen",
    color: "from-yellow-500 to-lime-600",
    iconBg: "bg-gradient-to-br from-yellow-500/20 to-lime-500/20",
    iconColor: "text-yellow-500",
    glowColor: "amber",
  },
];

const LAYER_CONFIG = {
  Kernel: { color: 'text-orange-400', count: 3 },
  Cognitive: { color: 'text-purple-400', count: 4 },
  Operational: { color: 'text-blue-400', count: 3 },
  Admin: { color: 'text-emerald-400', count: 3 },
  Infrastructure: { color: 'text-sky-400', count: 6 },
  Orchestrator: { color: 'text-fuchsia-400', count: 1 },
  Overlay: { color: 'text-rose-400', count: 1 },
};

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
        
        {/* Layer + Highlight pills */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] h-5 px-2",
              LAYER_CONFIG[item.layer as keyof typeof LAYER_CONFIG]?.color,
              "border-current/30"
            )}
          >
            {item.layer}
          </Badge>
          <div className={cn(
            "inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
            "bg-gradient-to-r text-white shadow-sm",
            item.color
          )}>
            {item.highlight}
          </div>
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
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  
  const filteredItems = selectedLayer 
    ? differentiators.filter(d => d.layer === selectedLayer)
    : differentiators;
  
  return (
    <section className="relative py-14 sm:py-32 px-4 overflow-hidden">
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
          className="text-center mb-10 sm:mb-14"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Layers className="w-3 h-3 text-primary" />
            <span className="text-xs">9 Modules • 5 Meshes • 9 Zones</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
            The Total{" "}
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
              Package
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A full cognitive operating system with 
            <span className="text-foreground font-medium"> kernel orchestration</span>, 
            <span className="text-foreground font-medium"> intelligent routing</span>, 
            <span className="text-foreground font-medium"> persistent memory</span>, and 
            <span className="text-foreground font-medium"> self-evolution</span>.
          </p>
        </motion.div>
        
        {/* Layer Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          <motion.button
            onClick={() => setSelectedLayer(null)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold transition-all",
              selectedLayer === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            All Surfaces
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{differentiators.length}</Badge>
          </motion.button>
          {Object.entries(LAYER_CONFIG).map(([layer, config]) => (
            <motion.button
              key={layer}
              onClick={() => setSelectedLayer(layer)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold transition-all",
                selectedLayer === layer
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={selectedLayer !== layer ? config.color : ""}>{layer}</span>
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">{config.count}</Badge>
            </motion.button>
          ))}
        </div>
        
        {/* Features Grid - Enhanced Bento style with 3D tilt */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
          layout
        >
          {filteredItems.map((item, idx) => (
            <FeatureCard key={item.title} item={item} idx={idx} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
