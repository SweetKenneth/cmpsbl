/**
 * Top Banner — Magical fade cycle through the Top 20 Launch Layers.
 *
 * Replaces the previous marquee (which stopped scrolling on some mobile
 * browsers). Each layer materializes, holds, then dissolves before the
 * next one fades in. Order is reshuffled every full cycle so the rotation
 * feels alive instead of looping.
 *
 * Each tick shows: layer name · CJPI score · short description.
 * Deferred mount keeps the hero as the LCP element.
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LAYERS, type LaunchLayer } from "@/components/ascension-v2/V2LaunchLayers";

function shuffle<T>(arr: ReadonlyArray<T>): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Per-layer dwell (visible) time in ms. Long enough to read the full line,
// short enough to keep the rotation feeling lively.
const DWELL_MS = 4200;

export function NpmAnnouncementBanner() {
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<LaunchLayer[]>(() => shuffle(LAYERS));
  const [index, setIndex] = useState(0);

  // Defer mount so this decorative banner never wins LCP.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Advance through the shuffled deck; reshuffle when we wrap so the
  // sequence never repeats in the same order.
  useEffect(() => {
    if (!ready) return;
    const t = window.setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= order.length) {
          setOrder(shuffle(LAYERS));
          return 0;
        }
        return next;
      });
    }, DWELL_MS);
    return () => window.clearInterval(t);
  }, [ready, order]);

  const current = useMemo(() => order[index], [order, index]);

  if (!ready || !current) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10001] overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))",
      }}
    >
      <div className="relative h-7 sm:h-8 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.rank}-${index}`}
            initial={{ opacity: 0, filter: "blur(6px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)", scale: 1.02 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="inline-flex items-baseline gap-2 text-xs sm:text-sm text-white max-w-full px-3">
              <span className="font-bold tracking-tight whitespace-nowrap">
                {current.name}
              </span>
              <span className="font-mono font-semibold text-white/95 tabular-nums px-1.5 py-0.5 rounded bg-white/15 text-[10px] sm:text-xs whitespace-nowrap">
                CJPI {current.cjpi}
              </span>
              <span className="text-white/90 font-medium italic truncate">
                — “{current.promise}”
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
