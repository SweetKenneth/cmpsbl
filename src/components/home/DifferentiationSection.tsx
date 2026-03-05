/**
 * DifferentiationSection — Dream · Remember · Adapt · Self-Improve
 * Technical but accessible explanation of what makes CMPSBL fundamentally different.
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
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/20",
    glowColor: "violet",
  },
  {
    icon: Brain,
    title: "REMEMBER",
    headline: "Memory that survives restarts",
    description: "Three-tier persistent memory (hot, warm, cold) gives every agent permanent recall. Context carries across sessions, deployments, and infrastructure changes. Nothing resets.",
    link: "/persistent-memory",
    linkLabel: "Explore memory tiers",
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    borderColor: "border-cyan-500/20",
    glowColor: "cyan",
  },
  {
    icon: RefreshCw,
    title: "ADAPT",
    headline: "Governed self-modification",
    description: "The runtime adjusts routing, cost allocation, and operational parameters based on real-world performance — within strict governance boundaries. Adaptation is a system property, not an afterthought.",
    link: "/blog/clockless-what-makes-it-different",
    linkLabel: "Why governed adaptation matters",
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    glowColor: "emerald",
  },
  {
    icon: TrendingUp,
    title: "SELF-IMPROVE",
    headline: "Compound intelligence over time",
    description: "Every interaction feeds back into the system's understanding. Pipelines crystallize into reusable intelligence. Performance improves with usage — your infrastructure gets smarter the more you use it.",
    link: "/blog/clockless-account-setup-artifact-packs",
    linkLabel: "Start compounding",
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    glowColor: "amber",
  },
];

export function DifferentiationSection() {
  return (
    <section className="relative z-10 py-16 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1.5">
            <span className="text-xs font-semibold">Why Build Here</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">
            Systems That{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Dream · Adapt · Evolve
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Most AI platforms process and forget. When you build on the substrate, your systems
            dream during downtime, adapt under governance, and compound intelligence over every interaction.
          </p>
        </motion.div>

        {/* Pillar Grid */}
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
                "relative h-full rounded-2xl border bg-card/50 backdrop-blur-sm p-6 sm:p-8",
                "hover:shadow-xl transition-all duration-500",
                pillar.borderColor,
                "hover:border-opacity-50"
              )}>
                {/* Top accent */}
                <div className={cn("absolute top-0 left-6 right-6 h-px bg-gradient-to-r opacity-40", pillar.color)} />

                {/* Icon + Module name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", pillar.iconBg)}>
                    <pillar.icon className={cn("w-5 h-5", pillar.iconColor)} />
                  </div>
                  <span className={cn("text-xs font-mono font-bold tracking-wider uppercase", pillar.iconColor)}>
                    {pillar.title}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {pillar.headline}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {pillar.description}
                </p>

                {/* Link */}
                <Link
                  to={pillar.link}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors",
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
