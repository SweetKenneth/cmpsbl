/**
 * Why Substrate — Value proposition section for homepage
 * Clear differentiators and benefits
 */

import { motion } from "framer-motion";
import { 
  Brain, 
  Moon, 
  Zap, 
  Shield, 
  RefreshCw, 
  Lock,
  Lightbulb,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const differentiators = [
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "3-tier memory (hot/warm/cold) that survives sessions. Your AI remembers everything.",
    color: "text-cyan-500",
  },
  {
    icon: Moon,
    title: "Dream Cycles",
    description: "Offline processing extracts patterns, consolidates learning, and evolves understanding.",
    color: "text-violet-500",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    description: "Requests routed to optimal AI provider based on task complexity, cost, and latency.",
    color: "text-green-500",
  },
  {
    icon: Shield,
    title: "Defense-First",
    description: "Behavioral analysis, threat detection, and rate limiting built into every layer.",
    color: "text-amber-500",
  },
  {
    icon: RefreshCw,
    title: "Self-Improving",
    description: "The Modernizer scans code, proposes upgrades, and applies patches autonomously.",
    color: "text-orange-500",
  },
  {
    icon: Lock,
    title: "BYOK Architecture",
    description: "Bring your own API keys. No vendor lock-in. Pay providers directly.",
    color: "text-blue-500",
  },
];

export function WhySubstrate() {
  return (
    <section className="relative py-16 sm:py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <Badge variant="outline" className="mb-4">Why Substrate</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            What Makes It Different
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Beyond traditional AI backends. This is infrastructure that 
            thinks, learns, and improves itself.
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {differentiators.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className={cn(
                "p-5 sm:p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm",
                "hover:border-current/30 transition-all duration-300",
                item.color
              )}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-current/10 flex items-center justify-center mb-3 sm:mb-4">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
