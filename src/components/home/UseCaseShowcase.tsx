/**
 * UseCaseShowcase — What you can build on the substrate
 * Color palette: Cyan / Purple / Magenta (matching CMPSBL hero gradient)
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Building2,
  Code,
  Brain,
  Shield,
  Stethoscope,
  Plane,
  
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const useCases = [
  {
    icon: Gamepad2,
    title: "NPCs That Dream & Evolve",
    description: "Game characters that remember player behavior, adapt strategies, and generate new approaches over time.",
    industry: "Gaming",
    iconColor: "text-[hsl(var(--neon-purple))]",
    gradient: "from-[hsl(var(--neon-purple)/0.15)] to-[hsl(var(--neon-magenta)/0.15)]",
    borderColor: "group-hover:border-[hsl(var(--neon-purple)/0.4)]",
    timeline: "Available Now",
    timelineColor: "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/0.3)]",
  },
  {
    icon: Brain,
    title: "Chatbots With True Memory",
    description: "Conversational AI that retains customer context and builds long-term relationships.",
    industry: "Development",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    gradient: "from-[hsl(var(--neon-cyan)/0.15)] to-[hsl(var(--neon-purple)/0.15)]",
    borderColor: "group-hover:border-[hsl(var(--neon-cyan)/0.4)]",
    timeline: "Available Now",
    timelineColor: "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/0.3)]",
  },
  {
    icon: Building2,
    title: "Self-Healing Enterprises",
    description: "Systems that detect degradation, predict failures, and autonomously reroute around bottlenecks.",
    industry: "Enterprise",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    gradient: "from-[hsl(var(--neon-cyan)/0.15)] to-[hsl(var(--neon-magenta)/0.15)]",
    borderColor: "group-hover:border-[hsl(var(--neon-cyan)/0.4)]",
    timeline: "In Development",
    timelineColor: "bg-[hsl(var(--neon-purple)/0.15)] text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple)/0.3)]",
  },
  {
    icon: Shield,
    title: "Autonomous Security Systems",
    description: "Defense platforms that learn attack patterns, simulate counter-strategies, and adapt in real time.",
    industry: "Cybersecurity",
    iconColor: "text-[hsl(var(--neon-magenta))]",
    gradient: "from-[hsl(var(--neon-magenta)/0.15)] to-[hsl(var(--neon-purple)/0.15)]",
    borderColor: "group-hover:border-[hsl(var(--neon-magenta)/0.4)]",
    timeline: "In Development",
    timelineColor: "bg-[hsl(var(--neon-purple)/0.15)] text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple)/0.3)]",
  },
  {
    icon: Stethoscope,
    title: "Diagnostic AI With History",
    description: "Medical systems that build patient timelines, correlate long-term data, and uncover hidden patterns.",
    industry: "Healthcare",
    iconColor: "text-[hsl(var(--neon-purple))]",
    gradient: "from-[hsl(var(--neon-purple)/0.15)] to-[hsl(var(--neon-cyan)/0.15)]",
    borderColor: "group-hover:border-[hsl(var(--neon-purple)/0.4)]",
    timeline: "Future Vision",
    timelineColor: "bg-[hsl(var(--neon-magenta)/0.15)] text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta)/0.3)]",
  },
  {
    icon: Plane,
    title: "Mid-Flight Self-Repair",
    description: "Avionics systems that simulate failure scenarios and pre-compute recovery paths before issues occur.",
    industry: "Aviation",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    gradient: "from-[hsl(var(--neon-cyan)/0.15)] to-[hsl(var(--neon-magenta)/0.15)]",
    borderColor: "group-hover:border-[hsl(var(--neon-cyan)/0.4)]",
    timeline: "Future Vision",
    timelineColor: "bg-[hsl(var(--neon-magenta)/0.15)] text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta)/0.3)]",
  },
];

export function UseCaseShowcase() {
  return (
    <section className="relative z-10 px-4 py-16 sm:py-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]" style={{ background: "hsl(var(--neon-purple) / 0.05)" }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5 border-[hsl(var(--neon-magenta)/0.3)]">
            <Sparkles className="w-3 h-3 text-[hsl(var(--neon-magenta))]" />
            <span className="text-xs font-semibold">What You Can Build</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            From{" "}
            <span className="text-[hsl(var(--neon-cyan))]">Today</span>
            {" "}to{" "}
            <span className="text-[hsl(var(--neon-magenta))]">Tomorrow</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Production-ready applications crystallized from the Memory Stream today — and entirely new categories emerging tomorrow.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {useCases.map((useCase, idx) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="h-full"
            >
               <Link
                 to="/use-cases"
                 className={cn(
                    "group relative block h-full p-5 sm:p-6 rounded-2xl border border-border/50",
                    "bg-[hsl(var(--stream-slate))] backdrop-blur-sm",
                    "transition-all duration-500",
                    "overflow-hidden shimmer-on-hover card-lift",
                   useCase.iconColor,
                   useCase.borderColor
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    "bg-gradient-to-br",
                    useCase.gradient
                  )}
                />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-current/10 group-hover:bg-current/20 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <useCase.icon className="w-6 h-6" />
                    </motion.div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        useCase.timelineColor
                      )}
                    >
                      {useCase.timeline}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 group-hover:text-current transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {useCase.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-current/60 font-semibold">
                      {useCase.industry}
                    </span>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={{ x: -8 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}