/**
 * StoreCollectorDeck — Horizontal swipe deck for a list of StoreItems.
 * Touch-friendly with keyboard nav. No text truncation anywhere.
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { StoreCollectorCard } from "./StoreCollectorCard";
import { TIER_META } from "@/lib/store/catalog";
import type { StoreItem } from "@/lib/store/catalog";

interface StoreCollectorDeckProps {
  items: StoreItem[];
  label?: string;
}

export function StoreCollectorDeck({ items, label }: StoreCollectorDeckProps) {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [direction, setDirection] = useState(0);

  // Reset index when items change (filter)
  useEffect(() => {
    setIndex(0);
    setFocused(false);
  }, [items.length]);

  const item = items[index];

  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setFocused(false);
    setIndex((i) => (i + dir + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  useSwipeGesture({
    onSwipeLeft: () => go(1),
    onSwipeRight: () => go(-1),
    threshold: 50,
    edgeWidth: 9999,
    enabled: true,
  });

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 160 : -160, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -160 : 160, opacity: 0, scale: 0.92 }),
  };

  if (!item) return null;

  const tierMeta = TIER_META[item.tier];

  return (
    <div className="relative">
      {label && (
        <h3 className="text-center text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase mb-4">
          {label}
        </h3>
      )}

      {/* Counter + current item name */}
      <div className="text-center mb-4">
        <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
          {index + 1} / {items.length}
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={cn("text-xs font-black", tierMeta.color)}>
            {item.name}
          </span>
          <span className="text-[10px] text-muted-foreground/40 font-mono">
            {item.kind === "agent" ? "AGENT" : "ENGINE"}
          </span>
        </div>
      </div>

      {/* Card area */}
      <div className="relative flex items-center justify-center">
        {/* Nav arrows */}
        <button
          onClick={() => go(-1)}
          className={cn(
            "absolute left-0 sm:left-2 z-20 w-11 h-11 min-h-[44px] min-w-[44px]",
            "rounded-full bg-card/80 backdrop-blur-sm border border-border/30",
            "flex items-center justify-center",
            "hover:bg-card hover:border-primary/30",
            "transition-all duration-200 active:scale-90"
          )}
          aria-label="Previous product"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="w-full flex items-center justify-center px-12 sm:px-14">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="w-full flex justify-center"
            >
              <StoreCollectorCard
                item={item}
                focused={focused}
                onToggleFocus={() => setFocused((f) => !f)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(1)}
          className={cn(
            "absolute right-0 sm:right-2 z-20 w-11 h-11 min-h-[44px] min-w-[44px]",
            "rounded-full bg-card/80 backdrop-blur-sm border border-border/30",
            "flex items-center justify-center",
            "hover:bg-card hover:border-primary/30",
            "transition-all duration-200 active:scale-90"
          )}
          aria-label="Next product"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-5 flex-wrap">
        {items.map((it, i) => {
          const dotTier = TIER_META[it.tier];
          return (
            <button
              key={it.id}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
                setFocused(false);
              }}
              className={cn(
                "rounded-full transition-all duration-300",
                i === index
                  ? "w-7 h-2.5 bg-primary shadow-sm shadow-primary/30"
                  : "w-2.5 h-2.5 bg-muted-foreground/15 hover:bg-muted-foreground/30"
              )}
              aria-label={`Go to ${it.name}`}
              title={it.name}
            />
          );
        })}
      </div>

      <p className="text-center text-[11px] font-mono text-muted-foreground/40 mt-4">
        Tap to zoom · Flip to inspect · Swipe or arrow keys to browse
      </p>
    </div>
  );
}
