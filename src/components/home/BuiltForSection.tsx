/**
 * Built For Section — Shows who CMPSBL is designed for
 * Gaming, Developers, Enterprise with enhanced visuals
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Sparkles,
  CheckCircle2,
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
    description: "Persistent memory, emotional evolution, and the ability to learn from every player interaction. NPCs that remember, grow, and surprise.",
    features: [
      { icon: Brain, text: "3-tier NPC memory" },
      { icon: Moon, text: "Dream cycle processing" },
      { icon: MessageSquare, text: "Context-aware dialogue" },
    ],
    stats: { value: "∞", label: "Memory Depth" },
    cta: "Build Game AI",
    href: "/gaming",
    gradient: "from-purple-600 via-violet-600 to-fuchsia-600",
    glow: "shadow-purple-500/25",
    iconGradient: "from-purple-500 to-violet-500",
  },
  {
    icon: Code,
    badge: "For Developers",
    title: "Apps That Think",
    tagline: "Intelligence as infrastructure",
    description: "Add persistent memory, intelligent routing, and self-improvement to any application. 70+ templates. Full SDK. Production-ready from day one.",
    features: [
      { icon: Zap, text: "Multi-provider routing" },
      { icon: Brain, text: "Memory persistence" },
      { icon: Eye, text: "Full observability" },
    ],
    stats: { value: "70+", label: "Templates" },
    cta: "Start Coding",
    href: "/developers",
    gradient: "from-cyan-600 via-blue-600 to-indigo-600",
    glow: "shadow-cyan-500/25",
    iconGradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Building2,
    badge: "For Enterprise",
    title: "Operations That Learn",
    tagline: "Institutional memory, automated",
    description: "Workflow memory, decision support, audit trails, and governance built-in. Deploy on your infrastructure with complete control.",
    features: [
      { icon: Shield, text: "Security & compliance" },
      { icon: Brain, text: "Institutional memory" },
      { icon: Eye, text: "Audit everything" },
    ],
    stats: { value: "100%", label: "Your Data" },
    cta: "Enterprise Solutions",
    href: "/use-cases",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glow: "shadow-amber-500/25",
    iconGradient: "from-amber-500 to-orange-500",
  },
];

function AudienceCard({ audience, index }: { audience: typeof audiences[0]; index: number }) {
  const Icon = audience.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="h-full group"
    >
      <div className={cn(
        "relative h-full rounded-3xl overflow-hidden",
        "border border-border/50 bg-card/50 backdrop-blur-sm",
        "transition-all duration-500",
        "hover:shadow-2xl",
        audience.glow
      )}>
        {/* Gradient top bar */}
        <div className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          audience.gradient
        )} />
        
        <div className="p-6 sm:p-8 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            {/* Icon with gradient background */}
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br shadow-lg",
              audience.gradient
            )}>
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            {/* Stat */}
            <div className="text-right">
              <div className={cn(
                "text-2xl sm:text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent",
                audience.gradient
              )}>
                {audience.stats.value}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                {audience.stats.label}
              </div>
            </div>
          </div>
          
          {/* Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "w-fit mb-3 border-current/30",
              `bg-gradient-to-r ${audience.gradient} bg-clip-text text-transparent`
            )}
          >
            {audience.badge}
          </Badge>
          
          {/* Title & Tagline */}
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            {audience.title}
          </h3>
          <p className={cn(
            "text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent mb-3",
            audience.gradient
          )}>
            {audience.tagline}
          </p>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-5 flex-grow leading-relaxed">
            {audience.description}
          </p>
          
          {/* Features */}
          <div className="space-y-2 mb-6">
            {audience.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center",
                  "bg-gradient-to-br opacity-80",
                  audience.gradient
                )}>
                  <feature.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <Button asChild className={cn(
            "w-full gap-2 h-12 text-base font-semibold",
            "bg-gradient-to-r text-white border-0 shadow-lg",
            "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
            audience.gradient,
            audience.glow
          )}>
            <Link to={audience.href}>
              {audience.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function BuiltForSection() {
  return (
    <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Sparkles className="w-3 h-3" />
            Built For You
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Choose Your{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-amber)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Path
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            The same cognitive infrastructure adapts to your use case. 
            Pre-configured packages ready for gaming, development, and enterprise.
          </p>
        </motion.div>
        
        {/* Audience Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {audiences.map((audience, idx) => (
            <AudienceCard key={audience.title} audience={audience} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
