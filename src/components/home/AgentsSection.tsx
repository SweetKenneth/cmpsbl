/**
 * AgentsSection — 5 Fused Meta-Agents
 * Collector-style flip-card swipe deck with tap-to-zoom.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Download, Zap, Database, Clock,
  HardDrive, Archive, Shield, RefreshCcw,
  Hash, Package, Waves, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AGENTS_WITH_POWERS, MEMORY_SYSTEM_SUMMARY, FOUR_TIER_MEMORY,
  STANDARD_CAPABILITIES,
} from "@/lib/agents/crownJewelPowers";
import { AgentChat } from "@/components/agents/AgentChat";
import { AgentCollectorDeck } from "@/components/agent-collector/AgentCollectorDeck";
import type { AgentWithPowers } from "@/lib/agents/crownJewelPowers";

export function AgentsSection() {
  const [chatAgent, setChatAgent] = useState<AgentWithPowers | null>(null);

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
            <span className="text-xs font-semibold">5 Fused Meta-Agents</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Meta-Agents.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Fused Power.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each Meta-Agent is a sealed fusion of multiple specialized runtimes — with auto-tiering memory, RIPPLE orchestration, and always-on CLM. One agent. Many minds. Infinite learning.
          </p>
        </motion.div>

        {/* Standard Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-primary/5 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                  Every Meta-Agent Ships With
                </h3>
                <p className="text-[10px] sm:text-xs text-primary/80 font-semibold">
                  Sealed runtime · Zero maintenance · Always learning
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {STANDARD_CAPABILITIES.map((cap) => (
                <div
                  key={cap.name}
                  className="rounded-xl border border-border/30 bg-background/30 p-3 flex items-start gap-3 hover:border-primary/20 hover:bg-primary/[0.02] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 shimmer-on-hover"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <cap.icon className="w-3.5 h-3.5 text-primary/70" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-foreground mb-0.5">{cap.name}</h4>
                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {MEMORY_SYSTEM_SUMMARY.features.map((feat) => (
                <span
                  key={feat}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary/80 border border-primary/15"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 4-Tier Memory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                  {MEMORY_SYSTEM_SUMMARY.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-semibold">
                  {MEMORY_SYSTEM_SUMMARY.tagline}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {FOUR_TIER_MEMORY.map((tier, i) => {
                const tierIcons = [Clock, Database, HardDrive, Archive];
                const TierIcon = tierIcons[i];
                const tierColors = [
                  "from-red-500/20 to-orange-500/20 border-red-500/30",
                  "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
                  "from-sky-500/20 to-blue-500/20 border-sky-500/30",
                  "from-slate-500/20 to-zinc-500/20 border-slate-500/30",
                ];
                return (
                  <div key={tier.name} className={cn("rounded-xl border p-4 bg-gradient-to-br hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300", tierColors[i])}>
                    <div className="flex items-center gap-2 mb-2">
                      <TierIcon className="w-4 h-4 text-foreground/70" />
                      <span className="text-[10px] font-black tracking-widest text-foreground/80">{tier.name}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground mb-1">{tier.label}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{tier.description}</p>
                    <div className="flex items-center gap-3 text-[9px] font-mono tabular-nums text-muted-foreground/60">
                      <span>Latency: {tier.latency}</span>
                      <span>·</span>
                      <span>{tier.retention}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══ COLLECTOR DECK ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <AgentCollectorDeck
            agents={AGENTS_WITH_POWERS}
            onChat={(agent) => setChatAgent(agent)}
          />
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="gap-2 px-8 h-12 font-semibold hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Link to="/composable-cognitives">
              <Download className="w-4 h-4" />
              Browse All 5 Meta-Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {chatAgent && (
        <AgentChat
          agent={chatAgent}
          open={!!chatAgent}
          onClose={() => setChatAgent(null)}
        />
      )}
    </section>
  );
}
