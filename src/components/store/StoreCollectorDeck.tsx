/**
 * StoreCollectorDeck — Horizontal swipe deck for a list of StoreItems.
 * Reusable across agents, engines, or mixed catalogs.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { StoreCollectorCard } from "./StoreCollectorCard";
import type { StoreItem } from "@/lib/store/catalog";

interface StoreCollectorDeckProps {
  items: StoreItem[];
  label?: string;
}

export function StoreCollectorDeck({ items, label }: StoreCollectorDeckProps) {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [direction, setDirection] = useState(0);

  const item = items[index];

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setFocused(false);
    setIndex((i) => (i + dir + items.length) % items.length);
  }, [items.length]);

  useSwipeGesture({
    onSwipeLeft: () => go(1),
    onSwipeRight: () => go(-1),
    threshold: 50,
    edgeWidth: 9999,
    enabled: true,
  });

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.9 }),
  };

  if (!item) return null;

  return (
    <div className="relative">
      {label && (
        <h3 className="text-center text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase mb-4">{label}</h3>
      )}

      <div className="relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">
        <button
          onClick={() => go(-1)}
          className="absolute left-0 sm:left-2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all duration-200 active:scale-90"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={item.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <StoreCollectorCard
              item={item}
              focused={focused}
              onToggleFocus={() => setFocused((f) => !f)}
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => go(1)}
          className="absolute right-0 sm:right-2 z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all duration-200 active:scale-90"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); setFocused(false); }}
            className={cn(
              "rounded-full transition-all duration-300",
              i === index
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
            )}
            aria-label={`Go to ${it.name}`}
          />
        ))}
      </div>

      <p className="text-center text-[10px] font-mono text-muted-foreground/40 mt-3">
        Tap to zoom · Flip to inspect · Swipe to browse
      </p>
    </div>
  );
}
