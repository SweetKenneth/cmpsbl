/**
 * AgentCollectorCard — Flip card with front (identity) and back (modules/powers).
 * Collector-style with tier rarity glow, CJPI stats, and sealed runtime badge.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, MessageSquare, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AgentWithPowers } from "@/lib/agents/crownJewelPowers";

interface AgentCollectorCardProps {
  agent: AgentWithPowers;
  focused: boolean;
  onToggleFocus: () => void;
  onChat: () => void;
}

const tierConfig = (agent: AgentWithPowers) => {
  if (agent.isApex) return { label: "APEX", price: "$249", glow: "shadow-fuchsia-500/30", border: "border-fuchsia-500/40", bg: "bg-fuchsia-500/15", text: "text-fuchsia-400", ring: "ring-fuchsia-500/20" };
  if (agent.isElite) return { label: "ELITE", price: "$159", glow: "shadow-violet-500/30", border: "border-violet-500/40", bg: "bg-violet-500/15", text: "text-violet-400", ring: "ring-violet-500/20" };
  if (agent.isFlagship) return { label: "PRO", price: "$129", glow: "shadow-red-500/30", border: "border-red-500/40", bg: "bg-red-500/15", text: "text-red-400", ring: "ring-red-500/20" };
  if (agent.priceCents) return { label: "STARTER", price: "$79", glow: "shadow-emerald-500/30", border: "border-emerald-500/40", bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-500/20" };
  return { label: "FREE", price: "$0", glow: "shadow-amber-500/20", border: "border-amber-500/30", bg: "bg-amber-500/15", text: "text-amber-400", ring: "ring-amber-500/20" };
};

export function AgentCollectorCard({ agent, focused, onToggleFocus, onChat }: AgentCollectorCardProps) {
  const [flipped, setFlipped] = useState(false);
  const tier = tierConfig(agent);

  return (
    <div
      className={cn(
        "collector-perspective mx-auto transition-all duration-500 ease-out",
        focused ? "w-[340px] sm:w-[400px]" : "w-[280px] sm:w-[320px]",
      )}
      style={{ aspectRatio: "3/4" }}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={onToggleFocus}
      >
        {/* ═══ FRONT ═══ */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "border bg-card/80 backdrop-blur-sm",
            "flex flex-col",
            tier.border,
            focused && `shadow-2xl ${tier.glow} ring-1 ${tier.ring}`,
            !focused && "shadow-lg hover:shadow-xl",
            "transition-shadow duration-500"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top gradient bar */}
          <div className={cn("h-1 w-full bg-gradient-to-r", agent.gradient)} />

          {/* Agent image */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <img
              src={agent.image}
              alt={agent.name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

            {/* Sealed badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-sm border border-border/30">
              <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
              <span className="text-[8px] font-black tracking-widest text-muted-foreground/60">SEALED</span>
            </div>

            {/* Tier badge */}
            <div className={cn("absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider border", tier.bg, tier.text, tier.border)}>
              {tier.label}
            </div>
          </div>

          {/* Identity strip */}
          <div className="relative z-10 px-4 pb-4 -mt-12">
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{agent.name}</h3>
            <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{agent.subtitle}</p>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed mt-1.5 line-clamp-2">{agent.bio}</p>

            {/* Stats bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary/60" />
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground/60">
                  {agent.powers.length} POWERS
                </span>
              </div>
              <div className="flex gap-1">
                {agent.fusedFrom.map((name) => (
                  <span key={name} className="text-[7px] font-mono font-bold px-1 py-0.5 rounded bg-foreground/5 text-muted-foreground/40 border border-border/20">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className={cn("text-xs font-black", tier.text)}>{tier.price}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                className="text-[9px] font-bold text-primary/70 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
              >
                FLIP TO INSPECT →
              </button>
            </div>
          </div>
        </div>

        {/* ═══ BACK ═══ */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "border bg-card/90 backdrop-blur-sm",
            "flex flex-col",
            tier.border,
            focused && `shadow-2xl ${tier.glow} ring-1 ${tier.ring}`,
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Top gradient bar */}
          <div className={cn("h-1 w-full bg-gradient-to-r", agent.gradient)} />

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground tracking-tight">{agent.name}</h3>
              <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black border", tier.bg, tier.text, tier.border)}>
                {tier.label}
              </div>
            </div>

            {/* Powers / Modules */}
            <div>
              <h4 className="text-[9px] font-black tracking-widest text-primary/60 mb-2">⚙ CROWN JEWEL POWERS</h4>
              <div className="space-y-2">
                {agent.powers.map((power) => (
                  <div key={power.name} className="rounded-xl border border-border/30 bg-background/30 p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br opacity-80", agent.gradient)}>
                        <power.icon className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-foreground">{power.name}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 leading-relaxed pl-7">{power.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CLM Goals */}
            <div>
              <h4 className="text-[9px] font-black tracking-widest text-primary/60 mb-2">🧠 CLM LEARNING GOALS</h4>
              <div className="flex flex-wrap gap-1">
                {agent.clmGoals.map((goal) => (
                  <span key={goal} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground/70 border border-primary/10">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="p-4 border-t border-border/30 space-y-2">
            <Button
              size="sm"
              className={cn("w-full gap-2 text-xs font-black bg-gradient-to-r", agent.gradient, "text-white hover:opacity-90")}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {agent.isFree ? "Activate Free" : `Acquire · ${tier.price}`}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-[10px] font-bold"
                onClick={(e) => { e.stopPropagation(); onChat(); }}
              >
                <MessageSquare className="w-3 h-3" />
                DECODE Channel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold"
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              >
                ← FLIP
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
