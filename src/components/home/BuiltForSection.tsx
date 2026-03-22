/**
 * Built For Section — Shows who CMPSBL is designed for
 * Color palette: Cyan / Purple / Magenta — solid accents, gradients only on primary CTAs
 */

import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Code,
  Building2,
  Brain,
  Moon,
  Zap,
  Shield,
  MessageSquare,
  Eye,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const audiences = [
  {
    icon: Gamepad2,
    badge: "For Game Devs",
    title: "NPCs That Dream",
    tagline: "Give your characters a soul",
    description: "Build NPCs with persistent memory, background processing, and emotional evolution. Characters that remember every player, adapt their behavior, and grow between sessions.",
    features: [
      { icon: Brain, text: "3-tier NPC memory" },
      { icon: Moon, text: "DREAM cycle processing" },
      { icon: MessageSquare, text: "Context-aware dialogue" },
    ],
    stats: { value: "∞", label: "Memory Depth" },
    cta: "Build Game AI",
    href: "/gaming",
    accentColor: "hsl(var(--neon-purple))",
    accentVar: "--neon-purple",
    featureIconBg: "bg-[hsl(var(--neon-purple))]",
  },
  {
    icon: Code,
    badge: "For Developers",
    title: "Apps That Evolve",
    tagline: "Infrastructure that improves itself",
    description: "Build on the substrate with persistent memory, ADAPT-governed routing, and EVOLUTION for self-improvement. Your apps dream, adapt, and get smarter the more they run.",
    features: [
      { icon: Zap, text: "ADAPT-governed routing" },
      { icon: Brain, text: "Memory persistence" },
      { icon: Eye, text: "Full observability" },
    ],
    stats: { value: "200+", label: "Templates" },
    cta: "Start Building",
    href: "/developers",
    accentColor: "hsl(var(--neon-cyan))",
    accentVar: "--neon-cyan",
    featureIconBg: "bg-[hsl(var(--neon-cyan))]",
  },
  {
    icon: Building2,
    badge: "For Enterprise",
    title: "Operations That Learn",
    tagline: "Governed evolution at scale",
    description: "Deploy the substrate on your infrastructure with DREAM cycles for pattern discovery, governed ADAPT for compliance, and EVOLUTION for continuous improvement — all auditable.",
    features: [
      { icon: Shield, text: "Governed adaptation" },
      { icon: Brain, text: "Institutional memory" },
      { icon: Eye, text: "Audit everything" },
    ],
    stats: { value: "100%", label: "Your Data" },
    cta: "Enterprise Solutions",
    href: "/use-cases",
    accentColor: "hsl(var(--neon-magenta))",
    accentVar: "--neon-magenta",
    featureIconBg: "bg-[hsl(var(--neon-magenta))]",
  },
];

function AudienceCard({ audience, index }: { audience: typeof audiences[0]; index: number }) {
  const Icon = audience.icon;
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      className="h-full group"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative h-full rounded-3xl overflow-hidden",
          "border border-border/50 bg-[hsl(var(--stream-slate))] backdrop-blur-sm",
          "transition-all duration-500",
          "hover:shadow-2xl",
        )}
      >
        {/* Solid color top bar */}
        <div className="h-1 w-full" style={{ background: audience.accentColor }} />
        
        {/* Solid hover overlay */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: audience.accentColor }}
          animate={{ opacity: isHovered ? 0.04 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="p-5 sm:p-8 flex flex-col h-full relative">
          <div className="flex items-start justify-between mb-5">
            <motion.div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: audience.accentColor }}
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            
            <motion.div 
              className="text-right"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl sm:text-3xl font-black" style={{ color: audience.accentColor }}>
                {audience.stats.value}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                {audience.stats.label}
              </div>
            </motion.div>
          </div>
          
          <Badge 
            variant="outline" 
            className="w-fit mb-3"
            style={{ color: audience.accentColor, borderColor: `${audience.accentColor}40` }}
          >
            {audience.badge}
          </Badge>
          
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
            {audience.title}
          </h3>
          <p className="text-sm font-medium mb-3" style={{ color: audience.accentColor }}>
            {audience.tagline}
          </p>
          
          <p className="text-sm text-muted-foreground mb-5 flex-grow leading-relaxed">
            {audience.description}
          </p>
          
          <div className="space-y-2.5 mb-6">
            {audience.features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-center gap-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  audience.featureIconBg
                )}>
                  <feature.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          <Button asChild className={cn(
            "w-full gap-2 h-11 sm:h-12 text-sm sm:text-base font-semibold",
            "text-white border-0 shadow-lg",
            "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
          )} style={{ background: audience.accentColor }}>
            <Link to={audience.href}>
              {audience.cta}
              <motion.div
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BuiltForSection() {
  return (
    <section className="relative py-16 sm:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-[180px] animate-hero-orb-1 hidden sm:block"
          style={{ background: "hsl(var(--neon-purple) / 0.06)" }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full blur-[180px] animate-hero-orb-3 hidden sm:block"
          style={{ background: "hsl(var(--neon-cyan) / 0.06)" }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-20"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5 border-[hsl(var(--neon-purple)/0.3)]">
            <Hammer className="w-3 h-3 text-[hsl(var(--neon-purple))]" />
            <span className="text-xs">Built For Builders</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">
            Build What{" "}
            <span className="text-[hsl(var(--neon-cyan))]">Evolves</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The platform gives your systems background processing, governed adaptation, and persistent memory. 
            Build for{" "}
            <span className="text-foreground font-medium">gaming</span>,{" "}
            <span className="text-foreground font-medium">development</span>, or{" "}
            <span className="text-foreground font-medium">enterprise</span> — and watch them improve themselves.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {audiences.map((audience, idx) => (
            <AudienceCard key={audience.title} audience={audience} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
