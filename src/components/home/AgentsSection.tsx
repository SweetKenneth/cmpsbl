/**
 * AgentsSection — 5 Fused Meta-Agents
 * Sealed Runtime Agents with spy-vs-spy 2026 aesthetic.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Download, Zap, ChevronDown, Database, Clock,
  HardDrive, Archive, MessageSquare, Package, Waves, RefreshCcw,
  Hash, Lock, Shield, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AGENTS_WITH_POWERS, MEMORY_SYSTEM_SUMMARY, FOUR_TIER_MEMORY,
  STANDARD_CAPABILITIES,
  type AgentWithPowers,
} from "@/lib/agents/crownJewelPowers";
import { AgentChat } from "@/components/agents/AgentChat";

function AgentCard({ agent, index, expanded, onToggle, onChat }: {
  agent: AgentWithPowers;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChat: () => void;
}) {
  const tierBadge = agent.isApex ? (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/25">$249 · APEX</span>
  ) : agent.isElite ? (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">$159 · ELITE</span>
  ) : agent.isFlagship ? (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">$129 · PRO</span>
  ) : agent.priceCents ? (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">$79</span>
  ) : (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">FREE</span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.5 }}
      className={cn(
        "relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden",
        "transition-all duration-500",
        expanded ? "shadow-xl" : "hover:shadow-lg hover:-translate-y-0.5",
        "border-border/40 shimmer-on-hover"
      )}
      style={expanded ? { boxShadow: `0 0 50px -12px ${agent.glowColor}` } : undefined}
    >
      <div className={cn("h-0.5 w-full bg-gradient-to-r", agent.gradient)} />

      <button
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4 group cursor-pointer"
      >
        {/* Agent image */}
        <div className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br shrink-0 border border-border/20",
          agent.gradient
        )}>
          <img
            src={agent.image}
            alt={agent.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{agent.name}</h3>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/50 border border-foreground/15">
              <Lock className="w-2 h-2 inline mr-0.5 -mt-0.5" />META
            </span>
            {tierBadge}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-mono mt-0.5 break-words">{agent.subtitle}</p>
          
          {/* Bio */}
          <p className="text-[11px] sm:text-xs text-muted-foreground/80 mt-2 leading-relaxed line-clamp-2 max-w-2xl">{agent.bio}</p>

          {/* Fused-from badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.fusedFrom.map((name) => (
              <span key={name} className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground/50 border border-border/30">
                {name}
              </span>
            ))}
          </div>
        </div>

        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform duration-300 mt-2",
          expanded && "rotate-180"
        )} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                {agent.description}
              </p>

              {/* CLM Goals */}
              <div className="mb-4 rounded-xl border border-border/30 bg-background/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCcw className="w-3 h-3 text-primary/70" />
                  <span className="text-[9px] font-black tracking-widest text-primary/70">CLM DYNAMIC GOALS</span>
                  <span className="text-[8px] font-mono text-emerald-500/80 ml-auto">● LEARNING 24/7</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.clmGoals.map((goal) => (
                    <span key={goal} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground border border-primary/10">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Powers */}
              <div className={cn("grid gap-3", agent.powers.length > 3 ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-3")}>
                {agent.powers.map((power, pIdx) => (
                  <motion.div
                    key={power.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pIdx * 0.08 + 0.1 }}
                    className="rounded-xl border border-border/40 bg-background/40 p-4 hover:border-primary/25 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br opacity-80", agent.gradient)}>
                        <power.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider leading-tight">
                        {power.source}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground mb-1">{power.name}</h4>
                    <p className="text-[11px] text-muted-foreground/75 leading-relaxed">{power.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onChat(); }}
                  className="gap-2 text-xs font-bold border-primary/25 hover:bg-primary/10"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open DECODE Channel
                </Button>
                <span className="text-[9px] font-mono text-muted-foreground/40">
                  <Hash className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
                  MINT ON PURCHASE · UNIQUE VERSION
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AgentsSection() {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set([0]));
  const [chatAgent, setChatAgent] = useState<AgentWithPowers | null>(null);

  const toggle = (idx: number) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

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

        {/* Meta-Agent Cards */}
        <div className="space-y-4 mb-10">
          {AGENTS_WITH_POWERS.map((agent, idx) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={idx}
              expanded={expandedSet.has(idx)}
              onToggle={() => toggle(idx)}
              onChat={() => setChatAgent(agent)}
            />
          ))}
        </div>

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
