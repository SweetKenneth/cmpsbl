/**
 * DifferentiationSection — Dream · Remember · Adapt · Self-Improve
 * Uses solid neon colors; gradient only on the top accent bar
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Moon, Brain, RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Moon,
    title: "DREAM",
    headline: "Process while idle",
    description: "Offline synthesis cycles consolidate memories, extract latent patterns, and generate novel insights — without consuming active compute. Your system learns even when no one is using it.",
    link: "/blog/clockless-modules-deep-dive",
    linkLabel: "How DREAM works",
    iconBg: "bg-[hsl(var(--neon-purple)/0.1)]",
    iconColor: "text-[hsl(var(--neon-purple))]",
    borderColor: "border-[hsl(var(--neon-purple)/0.2)]",
    accentColor: "hsl(var(--neon-purple))",
  },
  {
    icon: Brain,
    title: "REMEMBER",
    headline: "Memory that survives restarts",
    description: "Three-tier persistent memory (hot, warm, cold) gives every agent permanent recall. Context carries across sessions, deployments, and infrastructure changes. Nothing resets.",
    link: "/persistent-memory",
    linkLabel: "Explore memory tiers",
    iconBg: "bg-[hsl(var(--neon-cyan)/0.1)]",
    iconColor: "text-[hsl(var(--neon-cyan))]",
    borderColor: "border-[hsl(var(--neon-cyan)/0.2)]",
    accentColor: "hsl(var(--neon-cyan))",
  },
  {
    icon: RefreshCw,
    title: "ADAPT",
    headline: "Governed self-modification",
    description: "The runtime adjusts routing, cost allocation, and operational parameters based on real-world performance — within strict governance boundaries. Adaptation is a system property, not an afterthought.",
    link: "/blog/clockless-what-makes-it-different",
    linkLabel: "Why governed adaptation matters",
    iconBg: "bg-[hsl(var(--neon-magenta)/0.1)]",
    iconColor: "text-[hsl(var(--neon-magenta))]",
    borderColor: "border-[hsl(var(--neon-magenta)/0.2)]",
    accentColor: "hsl(var(--neon-magenta))",
  },
  {
    icon: TrendingUp,
    title: "SELF-IMPROVE",
    headline: "Compound intelligence over time",
    description: "Every interaction feeds back into the system's understanding. Memories crystallize into reusable intelligence. Performance improves with usage — your infrastructure gets smarter the more you use it.",
    link: "/blog/clockless-account-setup-artifact-packs",
    linkLabel: "Start compounding",
    iconBg: "bg-[hsl(var(--neon-purple)/0.1)]",
    iconColor: "text-[hsl(var(--neon-purple))]",
    borderColor: "border-[hsl(var(--neon-purple)/0.2)]",
    accentColor: "hsl(var(--neon-purple))",
  },
];

export function DifferentiationSection() {
  return (
    <section className="relative z-10 py-16 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 border-[hsl(var(--neon-magenta)/0.3)] text-[hsl(var(--neon-magenta))] px-4 py-1.5 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-magenta)/0.6)] animate-pulse" />
            <span className="text-xs font-semibold">Why Build Here</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">
            Systems That{" "}
            <span className="text-[hsl(var(--neon-purple))]">Dream · Adapt · Evolve</span>
          </h2>
           <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
             Most AI platforms process and forget. CMPSBL runs like an operating system for AI — your systems
             dream during downtime, adapt under governance, and compound intelligence over every interaction.
           </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className={cn(
                "relative h-full rounded-2xl border bg-[hsl(var(--stream-slate))] backdrop-blur-sm p-6 sm:p-8",
                "hover:shadow-xl transition-all duration-500 shimmer-on-hover glass-edge card-lift",
                pillar.borderColor,
                "hover:border-opacity-80"
              )}>
                {/* Solid color top accent line */}
                <div className="absolute top-0 left-6 right-6 h-[2px] rounded-t-2xl" style={{ background: pillar.accentColor, opacity: 0.3 }} />

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", pillar.iconBg)}>
                    <pillar.icon className={cn("w-5 h-5", pillar.iconColor)} />
                  </div>
                  <span className={cn("text-xs font-mono font-bold tracking-wider uppercase", pillar.iconColor)}>
                    {pillar.title}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {pillar.headline}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {pillar.description}
                </p>

                <Link
                  to={pillar.link}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors min-h-[36px] py-1.5",
                    pillar.iconColor,
                    "hover:underline"
                  )}
                >
                  {pillar.linkLabel}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
