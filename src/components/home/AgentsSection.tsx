/**
 * AgentsSection — Differentiated showcase of 3 Composable Agents
 * Each agent is powered by specific Crown Jewel engines & meta-engines.
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Brain, Shield, ArrowRight, Download, Sparkles, Database, Clock, Eye, Network, DollarSign, Activity, Lock, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AgentPower {
  name: string;
  source: string;
  description: string;
  icon: React.ElementType;
}

interface Agent {
  name: string;
  subtitle: string;
  description: string;
  powers: AgentPower[];
  icon: React.ElementType;
  free: boolean;
  gradient: string;
  glowColor: string;
  borderColor: string;
  accentCss: string;
}

const agents: Agent[] = [
  {
    name: "MEMORY Agent",
    subtitle: "Powered by PRISM · CIPHER · Memory Intelligence Fabric",
    description:
      "Not a cache — a living knowledge graph. Relationships between memories evolve over time, consolidate during idle cycles, and surface at sub-millisecond speed when context demands it.",
    powers: [
      {
        name: "Temporal Knowledge Graph",
        source: "PRISM Engine",
        description: "Relationship-aware recall that understands how memories connect, contradict, and evolve — not just what was said, but how it relates to everything else.",
        icon: Database,
      },
      {
        name: "Dream Consolidation",
        source: "Memory Intelligence Fabric",
        description: "Offline synthesis that merges, deduplicates, and strengthens memories during idle cycles — your agent literally gets smarter while it sleeps.",
        icon: Sparkles,
      },
      {
        name: "Tiered Recall Architecture",
        source: "CIPHER Engine",
        description: "Hot/warm/cold memory tiers with intelligent promotion. Recent context in <1ms, deep history in <50ms. No memory is ever truly forgotten.",
        icon: Clock,
      },
    ],
    icon: Brain,
    free: true,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "border-violet-500/20",
    accentCss: "bg-violet-500",
  },
  {
    name: "GUARDIAN Agent",
    subtitle: "Powered by SENTINEL · GENESIS · Immune Autonomy Mesh",
    description:
      "Not a firewall — an immune system. GUARDIAN doesn't just block known threats; it fingerprints behavior, predicts attack vectors, and auto-triages incidents with zero human intervention.",
    powers: [
      {
        name: "Behavioral Fingerprinting",
        source: "SENTINEL Engine",
        description: "Builds real-time behavioral profiles of every request. Detects prompt injection, credential stuffing, and novel attack patterns before the first byte of damage.",
        icon: Fingerprint,
      },
      {
        name: "Autonomous Incident Triage",
        source: "GENESIS Engine",
        description: "Self-classifying severity scoring with auto-executing remediation playbooks. P0 incidents trigger cascading defense — P3s get logged and learned from.",
        icon: Activity,
      },
      {
        name: "Evolving Immune Mesh",
        source: "Immune Autonomy Meta-Engine",
        description: "Every blocked threat strengthens the mesh. Cross-fleet antibody sharing means an attack on one deployment immunizes every other deployment automatically.",
        icon: Lock,
      },
    ],
    icon: Shield,
    free: true,
    gradient: "from-red-500 via-rose-500 to-orange-600",
    glowColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "border-red-500/20",
    accentCss: "bg-red-500",
  },
  {
    name: "ROUTER Agent",
    subtitle: "Powered by NEXUS · MIRAGE · ORACLE",
    description:
      "Not a load balancer — a fleet intelligence engine. ROUTER doesn't round-robin; it predicts which model will produce the best answer for this exact task at this exact moment, then routes accordingly.",
    powers: [
      {
        name: "Cognitive Affinity Matching",
        source: "NEXUS + MIRAGE Engines",
        description: "Routes tasks to the model with highest empirical confidence for that specific task type. Math goes to one model, creative writing to another — automatically.",
        icon: Network,
      },
      {
        name: "Predictive Latency Shaping",
        source: "ORACLE Engine",
        description: "Forecasts provider response times 30 seconds ahead and pre-routes to avoid slowdowns before they happen. Your users never feel a provider outage.",
        icon: Eye,
      },
      {
        name: "Real-Time Cost Arbitrage",
        source: "NEXUS Engine",
        description: "Token-level spend tracking with automatic provider rotation. Same quality, 40-60% less cost — the router finds the cheapest path to the right answer.",
        icon: DollarSign,
      },
    ],
    icon: Zap,
    free: false,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "border-emerald-500/20",
    accentCss: "bg-emerald-500",
  },
];

export function AgentsSection() {
  return (
    <section className="relative z-10 py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 px-4 py-1.5">
            <Zap className="w-3 h-3 mr-1.5 text-primary" />
            <span className="text-xs font-semibold">Crown Jewel–Powered Agents</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Three Agents.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Nine Crown Jewels.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each agent is backed by sealed runtime engines and meta-engines from the substrate's
            Crown Jewel vault — capabilities no other platform can replicate.
          </p>
        </motion.div>

        {/* Agent Cards — Stacked */}
        <div className="space-y-6 mb-12">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className={cn(
                "relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden",
                "hover:shadow-xl transition-all duration-500 group",
                agent.borderColor
              )}
              style={{ boxShadow: `0 0 60px -15px ${agent.glowColor}` }}
            >
              {/* Top accent bar */}
              <div className={cn("h-1 w-full bg-gradient-to-r", agent.gradient)} />

              <div className="p-6 sm:p-8">
                {/* Agent header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg", agent.gradient)}>
                      <agent.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-black text-foreground tracking-tight">{agent.name}</h3>
                        {agent.free ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                            FREE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">{agent.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                  {agent.description}
                </p>

                {/* 3 Powers grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {agent.powers.map((power, pIdx) => (
                    <motion.div
                      key={power.name}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.12 + pIdx * 0.08 + 0.2 }}
                      className={cn(
                        "relative rounded-xl border border-border/50 bg-background/50 p-4",
                        "group/power hover:border-primary/30 transition-colors duration-300"
                      )}
                    >
                      {/* Power icon + source */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br opacity-80", agent.gradient)}>
                          <power.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                          {power.source}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-foreground mb-1.5">{power.name}</h4>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">{power.description}</p>
                    </motion.div>
                  ))}
                </div>
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
