/**
 * AgentsSection — All 20 agents with Crown Jewel powers + Universal Memory System
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Download, Zap, ChevronDown, Database, Clock, HardDrive, Archive, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AGENTS_WITH_POWERS, MEMORY_SYSTEM_SUMMARY, FOUR_TIER_MEMORY, type AgentWithPowers } from "@/lib/agents/crownJewelPowers";
import { AgentChat } from "@/components/agents/AgentChat";

function AgentCard({ agent, index, expanded, onToggle, onChat }: {
  agent: AgentWithPowers;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChat: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.45 }}
      className={cn(
        "relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden",
        "transition-all duration-500",
        expanded ? "shadow-xl" : "hover:shadow-lg",
        "border-border/40"
      )}
      style={expanded ? { boxShadow: `0 0 50px -12px ${agent.glowColor}` } : undefined}
    >
      {/* Accent bar */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r", agent.gradient)} />

      {/* Header — always visible, clickable */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6 flex items-center gap-4 group cursor-pointer"
      >
        <div className={cn(
          "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md shrink-0",
          agent.gradient
        )}>
          <agent.icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">{agent.name}</h3>
            {agent.isFlagship ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">$129</span>
            ) : agent.isElite ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25">$159 · ELITE</span>
            ) : agent.isFree ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">FREE</span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">PRO</span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-mono mt-0.5 break-words">{agent.subtitle}</p>
        </div>

        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform duration-300",
          expanded && "rotate-180"
        )} />
      </button>

      {/* Expandable content */}
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
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">
                {agent.description}
              </p>

              {/* Crown Jewel Powers */}
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

              {/* Chat with this agent */}
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onChat(); }}
                  className="gap-2 text-xs font-bold border-primary/25 hover:bg-primary/10"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open DECODE Channel
                </Button>
                <span className="text-[9px] font-mono text-muted-foreground/40">SOVEREIGN RELAY · LIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AgentsSection() {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set([0, 1, 2]));
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
            <span className="text-xs font-semibold">20 Crown Jewel–Powered Agents</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Twenty Agents.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Persistent Memory.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every agent ships with a 4-tier portable memory system and is backed by sealed runtime engines from the Crown Jewel vault — capabilities no other platform can replicate.
          </p>
        </motion.div>

        {/* ═══ UNIVERSAL MEMORY SYSTEM BANNER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-primary/5 backdrop-blur-sm overflow-hidden"
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
                <p className="text-[10px] sm:text-xs text-primary/80 font-semibold">
                  Included with every agent — zero dependencies, any stack
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              {MEMORY_SYSTEM_SUMMARY.tagline} {MEMORY_SYSTEM_SUMMARY.description}
            </p>

            {/* 4 Tiers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
                  <div
                    key={tier.name}
                    className={cn(
                      "rounded-xl border p-4 bg-gradient-to-br",
                      tierColors[i]
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TierIcon className="w-4 h-4 text-foreground/70" />
                      <span className="text-[10px] font-black tracking-widest text-foreground/80">{tier.name}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground mb-1">{tier.label}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{tier.description}</p>
                    <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground/60">
                      <span>Latency: {tier.latency}</span>
                      <span>·</span>
                      <span>{tier.retention}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature list */}
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

        {/* All 20 Agent Cards */}
        <div className="space-y-3 mb-10">
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
          <Button asChild variant="outline" size="lg" className="gap-2 px-8 h-12 font-semibold">
            <Link to="/composable-cognitives">
              <Download className="w-4 h-4" />
              Browse All 20 Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* DECODE Chat Overlay */}
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
