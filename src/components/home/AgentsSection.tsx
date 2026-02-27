/**
 * AgentsSection — Compact showcase of Composable Cognitives as practical entry points
 * Agents are expressions of the system, not separate products.
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Brain, Shield, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const agents = [
  {
    name: "Memory Agent",
    description: "Persistent recall across sessions. Remembers users, preferences, and conversation context indefinitely.",
    capabilities: ["3-tier memory", "Session persistence", "Context injection"],
    icon: Brain,
    free: true,
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/20",
  },
  {
    name: "Guardian Agent",
    description: "Behavioral analysis, rate limiting, and threat detection for any AI-facing endpoint.",
    capabilities: ["Threat detection", "Rate limiting", "Audit trails"],
    icon: Shield,
    free: true,
    color: "from-red-500 to-rose-600",
    borderColor: "border-red-500/20",
  },
  {
    name: "Router Agent",
    description: "Intelligent multi-provider routing that optimizes for cost, latency, and task complexity automatically.",
    capabilities: ["Multi-provider", "Cost optimization", "Auto-failover"],
    icon: Zap,
    free: false,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-500/20",
  },
];

export function AgentsSection() {
  return (
    <section className="relative z-10 py-16 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 px-4 py-1.5">
            <Zap className="w-3 h-3 mr-1.5 text-primary" />
            <span className="text-xs font-semibold">Composable Agents</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Deploy Intelligence,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Not Complexity
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Pre-built agents powered by the substrate. Download once, run anywhere — 
            each one expresses a different facet of the runtime.
          </p>
        </motion.div>

        {/* Agent Cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6",
                "hover:shadow-lg transition-all duration-300",
                agent.borderColor
              )}
            >
              {/* Free badge */}
              {agent.free && (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                    FREE
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br", agent.color)}>
                <agent.icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="font-bold text-foreground mb-2">{agent.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">{agent.description}</p>

              {/* Capabilities */}
              <div className="space-y-1.5">
                {agent.capabilities.map((cap) => (
                  <div key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary/50" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="gap-2 px-8 h-12 font-semibold">
            <Link to="/composable-cognitives">
              <Download className="w-4 h-4" />
              Browse All Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
