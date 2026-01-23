/**
 * Why CMPSBL — Value proposition section for homepage
 * Enhanced with better graphics and clearer messaging
 */

import { motion } from "framer-motion";
import { 
  Brain, 
  Moon, 
  Zap, 
  Shield, 
  RefreshCw, 
  Lock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const differentiators = [
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "3-tier memory architecture (hot/warm/cold) that survives sessions. Your AI never forgets a conversation, preference, or interaction.",
    highlight: "Never Forgets",
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-500",
  },
  {
    icon: Moon,
    title: "Dream Cycles",
    description: "Offline processing that consolidates memories, extracts patterns, and evolves understanding—like REM sleep for AI.",
    highlight: "Learns While Idle",
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-500",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    description: "Every request routed to the optimal AI provider based on task complexity, cost constraints, and latency requirements.",
    highlight: "Auto-Optimized",
    color: "from-green-500 to-emerald-600",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-500",
  },
  {
    icon: Shield,
    title: "Defense-First",
    description: "Behavioral analysis, threat detection, rate limiting, and governance rules built into every layer of the stack.",
    highlight: "Enterprise Security",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: RefreshCw,
    title: "Self-Improving",
    description: "The Modernizer continuously scans code, proposes upgrades, and applies patches—your system gets better autonomously.",
    highlight: "Autonomous Updates",
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-500",
  },
  {
    icon: Lock,
    title: "BYOK Architecture",
    description: "Bring your own API keys. No vendor lock-in. Pay providers directly. Your data stays yours.",
    highlight: "Zero Lock-In",
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
  },
];

export function WhySubstrate() {
  return (
    <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Sparkles className="w-3 h-3" />
            Why CMPSBL
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            What Makes It{" "}
            <span 
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Different
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Beyond traditional AI backends. Infrastructure that 
            thinks, learns, and evolves on its own.
          </p>
        </motion.div>
        
        {/* Features Grid - Bento style */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {differentiators.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="group relative"
            >
              {/* Card */}
              <div className={cn(
                "relative h-full p-6 sm:p-7 rounded-2xl border border-border/50",
                "bg-card/50 backdrop-blur-sm",
                "hover:border-border transition-all duration-500",
                "overflow-hidden"
              )}>
                {/* Gradient hover overlay */}
                <div 
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    item.color
                  )}
                  style={{ opacity: 0.05 }}
                />
                
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4",
                  "transition-transform duration-300 group-hover:scale-110",
                  item.iconBg
                )}>
                  <item.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", item.iconColor)} />
                </div>
                
                {/* Highlight pill */}
                <div className={cn(
                  "inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-3",
                  "bg-gradient-to-r text-white",
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
