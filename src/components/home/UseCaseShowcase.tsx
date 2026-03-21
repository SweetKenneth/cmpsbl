/**
 * UseCaseShowcase — Compelling future applications with premium styling
 * Shows what can be built on the substrate now and in the future
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
  ChefHat,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const useCases = [
  {
    icon: Gamepad2,
    title: "NPCs That Dream & Evolve",
    description: "Game characters with persistent memory that adapt to player style, remember past encounters, and dream new strategies.",
    industry: "Gaming",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-violet-500/20",
    borderColor: "group-hover:border-purple-500/40",
    timeline: "Available Now",
    timelineColor: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    icon: Brain,
    title: "Chatbots With True Memory",
    description: "Conversational AI that remembers customer history, builds relationship context, and provides personalized support.",
    industry: "Development",
    color: "text-cyan-500",
    gradient: "from-cyan-500/20 to-blue-500/20",
    borderColor: "group-hover:border-cyan-500/40",
    timeline: "Available Now",
    timelineColor: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    icon: ChefHat,
    title: "Cooking Apps That Learn",
    description: "Recipe platforms that learn your taste preferences, adapt to ingredients, and suggest personalized meal plans.",
    industry: "Consumer",
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "group-hover:border-green-500/40",
    timeline: "Available Now",
    timelineColor: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    icon: Code,
    title: "IDE Assistants With Context",
    description: "Code editors that remember your patterns, understand project architecture, and suggest refactors based on style.",
    industry: "Development",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-indigo-500/20",
    borderColor: "group-hover:border-blue-500/40",
    timeline: "Available Now",
    timelineColor: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    icon: Building2,
    title: "Self-Healing Enterprises",
    description: "Enterprise systems that detect degradation patterns, predict failures, and autonomously route around bottlenecks.",
    industry: "Enterprise",
    color: "text-amber-500",
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "group-hover:border-amber-500/40",
    timeline: "In Development",
    timelineColor: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  },
  {
    icon: Shield,
    title: "Autonomous Security Teams",
    description: "Defense systems that study attack patterns, dream counter-strategies, and adapt defenses in real-time.",
    industry: "Cybersecurity",
    color: "text-red-500",
    gradient: "from-red-500/20 to-rose-500/20",
    borderColor: "group-hover:border-red-500/40",
    timeline: "In Development",
    timelineColor: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  },
  {
    icon: Stethoscope,
    title: "Diagnostic AI With History",
    description: "Medical AI that builds patient timelines, correlates symptoms across decades, and finds pattern connections.",
    industry: "Healthcare",
    color: "text-rose-500",
    gradient: "from-rose-500/20 to-pink-500/20",
    borderColor: "group-hover:border-rose-500/40",
    timeline: "Future Vision",
    timelineColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  {
    icon: Plane,
    title: "Mid-Flight Self-Repair",
    description: "Avionics that dream failure scenarios, pre-compute recovery paths, and self-heal anomalies before they cascade.",
    industry: "Aviation",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
    borderColor: "group-hover:border-orange-500/40",
    timeline: "Future Vision",
    timelineColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
];

export function UseCaseShowcase() {
  return (
    <section className="relative z-10 px-4 py-16 sm:py-24">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="relative inline-block">
            <span className="section-ordinal absolute -top-10 left-1/2 -translate-x-1/2 hidden sm:block" aria-hidden="true">07</span>
          </div>
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold">What You Can Build</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            From{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-purple)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Today
            </span>
            {" "}to{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Tomorrow
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Production-ready applications crystallized from the Memory Stream today, and the transformative possibilities on the horizon.
          </p>
        </motion.div>
        
        {/* Cards Grid */}
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
                    "bg-card/50 backdrop-blur-sm",
                    "transition-all duration-500",
                    "overflow-hidden shimmer-on-hover card-lift",
                   useCase.color,
                   useCase.borderColor
                )}
              >
                {/* Hover gradient overlay */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    "bg-gradient-to-br",
                    useCase.gradient
                  )}
                />
                
                <div className="relative z-10">
                  {/* Icon + Timeline */}
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
                        "text-[10px] font-medium",
                        useCase.timelineColor
                      )}
                    >
                      {useCase.timeline}
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 group-hover:text-current transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                    {useCase.description}
                  </p>
                  
                  {/* Industry tag + Arrow */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-current/60 font-semibold">
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
