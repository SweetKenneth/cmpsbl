/**
 * AgentCollectorDeck — Horizontal swipe deck with focus mode.
 * Collector-style navigation for the 5 fused Meta-Agents.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { AgentCollectorCard } from "./AgentCollectorCard";
import type { AgentWithPowers } from "@/lib/agents/crownJewelPowers";

interface AgentCollectorDeckProps {
  agents: AgentWithPowers[];
  onChat: (agent: AgentWithPowers) => void;
}

export function AgentCollectorDeck({ agents, onChat }: AgentCollectorDeckProps) {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [direction, setDirection] = useState(0);

  const agent = agents[index];

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setFocused(false);
    setIndex((i) => (i + dir + agents.length) % agents.length);
  }, [agents.length]);

  useSwipeGesture({
    onSwipeLeft: () => go(1),
    onSwipeRight: () => go(-1),
    threshold: 50,
    edgeWidth: 9999, // allow swipe from anywhere
    enabled: true,
  });

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.9 }),
  };

  return (
    <div className="relative">
      {/* Deck viewport */}
      <div className="relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">
        {/* Prev arrow */}
        <button
          onClick={() => go(-1)}
          className="absolute left-0 sm:left-2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all duration-200 active:scale-90"
          aria-label="Previous agent"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Card area */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={agent.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <AgentCollectorCard
              agent={agent}
              focused={focused}
              onToggleFocus={() => setFocused((f) => !f)}
              onChat={() => onChat(agent)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        <button
          onClick={() => go(1)}
          className="absolute right-0 sm:right-2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all duration-200 active:scale-90"
          aria-label="Next agent"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {agents.map((a, i) => (
          <button
            key={a.id}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); setFocused(false); }}
            className={cn(
              "rounded-full transition-all duration-300",
              i === index
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
            )}
            aria-label={`Go to ${a.name}`}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] font-mono text-muted-foreground/40 mt-3">
        Tap card to zoom · Flip to inspect · Swipe to browse
      </p>
    </div>
  );
}
