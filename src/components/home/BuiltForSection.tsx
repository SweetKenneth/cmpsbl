/**
 * Built For Section — Shows who CMPSBL is designed for
 * Premium audience cards with 3D effects and gradient borders
 * Rebalanced: emphasizes building on the substrate, not just the stream
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
    description: "Build NPCs on the substrate with persistent memory, DREAM cycle processing, and emotional evolution. Characters that remember every player, adapt their behavior, and grow between sessions.",
    features: [
      { icon: Brain, text: "3-tier NPC memory" },
      { icon: Moon, text: "DREAM cycle processing" },
      { icon: MessageSquare, text: "Context-aware dialogue" },
    ],
    stats: { value: "∞", label: "Memory Depth" },
    cta: "Build Game AI",
    href: "/gaming",
    gradient: "from-purple-600 via-violet-600 to-fuchsia-600",
    glow: "shadow-purple-500/25",
    borderGlow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]",
    iconGradient: "from-purple-500 to-violet-500",
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
    gradient: "from-cyan-600 via-blue-600 to-indigo-600",
    glow: "shadow-cyan-500/25",
    borderGlow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]",
    iconGradient: "from-cyan-500 to-blue-500",
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
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glow: "shadow-amber-500/25",
    borderGlow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]",
    iconGradient: "from-amber-500 to-orange-500",
  },
];

function AudienceCard({ audience, index }: { audience: typeof audiences[0]; index: number }) {
  const Icon = audience.icon;
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D tilt effect
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
          "border border-border/50 bg-card/50 backdrop-blur-sm",
          "transition-all duration-500",
          "hover:shadow-2xl",
          audience.glow,
          audience.borderGlow
        )}
      >
        {/* Gradient top bar */}
        <div className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          audience.gradient
        )} />
        
        {/* Animated gradient border on hover */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-3xl opacity-0 pointer-events-none",
            "bg-gradient-to-br",
            audience.gradient
          )}
          animate={{ opacity: isHovered ? 0.05 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="p-5 sm:p-8 flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <motion.div 
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                audience.gradient
              )}
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
              <div className={cn(
                "text-2xl sm:text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent",
                audience.gradient
              )}>
                {audience.stats.value}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                {audience.stats.label}
              </div>
            </motion.div>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "w-fit mb-3 border-current/30",
              `bg-gradient-to-r ${audience.gradient} bg-clip-text text-transparent`
            )}
          >
            {audience.badge}
          </Badge>
          
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            {audience.title}
          </h3>
          <p className={cn(
            "text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent mb-3",
            audience.gradient
          )}>
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
                  "bg-gradient-to-br",
                  audience.gradient
                )}>
                  <feature.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          <Button asChild className={cn(
            "w-full gap-2 h-11 sm:h-12 text-sm sm:text-base font-semibold",
            "bg-gradient-to-r text-white border-0 shadow-lg",
            "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
            audience.gradient,
            audience.glow
          )}>
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
      {/* Enhanced Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-muted/30" />
        <motion.div 
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-purple-500/8 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-cyan-500/8 rounded-full blur-[180px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.8, 0.5, 0.8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Hammer className="w-3 h-3 text-primary" />
            <span className="text-xs">Built For Builders</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
            Build What{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-amber)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease-in-out infinite",
              }}
            >
              Evolves
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The substrate gives your systems DREAM cycles, governed ADAPT, and persistent memory. 
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
