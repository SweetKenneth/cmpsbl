/**
 * StoreCollectorDeck — Horizontal swipe deck for a list of StoreItems.
 * Touch-friendly with keyboard nav. No text truncation anywhere.
 * Tier-colored active dots. Production polish.
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
    enter: (d: number) => ({ x: d > 0 ? 140 : -140, opacity: 0, scale: 0.94 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -140 : 140, opacity: 0, scale: 0.94 }),
  };

  if (!item) return null;

  const tierMeta = TIER_META[item.tier];

  return (
    <div className="relative">
      {label && (
        <h3 className="text-center text-[9px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase mb-5">
          {label}
        </h3>
      )}

      {/* Counter + current item name */}
      <div className="text-center mb-5">
        <span className="text-[9px] font-mono text-muted-foreground/30 tabular-nums tracking-wider">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <div className="flex items-center justify-center gap-2.5 mt-1.5">
          <span className={cn("text-sm sm:text-base font-black tracking-tight", tierMeta.color)}>
            {item.name}
          </span>
          <span className="text-[9px] text-muted-foreground/30 font-mono tracking-[0.15em]">
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
            "absolute left-0 sm:left-1 z-20 w-10 h-10 min-h-[44px] min-w-[44px]",
            "rounded-full bg-card/60 backdrop-blur-md border border-border/20",
            "flex items-center justify-center",
            "hover:bg-card/90 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
            "transition-all duration-300 active:scale-90"
          )}
          aria-label="Previous product"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground/60" />
        </button>

        <div className="w-full flex items-center justify-center px-11 sm:px-14">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
            "absolute right-0 sm:right-1 z-20 w-10 h-10 min-h-[44px] min-w-[44px]",
            "rounded-full bg-card/60 backdrop-blur-md border border-border/20",
            "flex items-center justify-center",
            "hover:bg-card/90 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
            "transition-all duration-300 active:scale-90"
          )}
          aria-label="Next product"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
        </button>
      </div>

      {/* Dots — tier-colored active dot */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 flex-wrap px-4">
        {items.map((it, i) => {
          const isActive = i === index;
          const dotColor = isActive ? TIER_META[it.tier].color.replace('text-', 'bg-') : '';
          return (
            <button
              key={it.id}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
                setFocused(false);
              }}
              className={cn(
                "rounded-full transition-all duration-400",
                isActive
                  ? cn("w-8 h-2", dotColor, "shadow-sm")
                  : "w-2 h-2 bg-muted-foreground/12 hover:bg-muted-foreground/25"
              )}
              aria-label={`Go to ${it.name}`}
              title={it.name}
            />
          );
        })}
      </div>

      <p className="text-center text-[10px] font-mono text-muted-foreground/25 mt-5 tracking-wider">
        Tap to zoom · Flip to inspect · Swipe or ← → to browse
      </p>
    </div>
  );
}