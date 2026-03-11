/**
 * Live Stats Bar — Design space narrative with live indicator
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LiveStatsBar() {

  return (
    <section className="relative z-10 py-3 sm:py-4 border-b border-border/30 bg-gradient-to-r from-card/30 via-card/50 to-card/30 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px] memory-stream-bar opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-px divider-flow" />
      <div className="container mx-auto px-4">
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Substrate · Memory Stream · Live</span>
        </div>

        {/* Design space narrative */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed text-center max-w-2xl mx-auto"
        >
          Built from <span className="text-foreground/90 font-medium">endless capabilities</span> across{' '}
          <span className="text-foreground/90 font-medium">40 autonomous nodes</span>, it explores a design space a million times larger than the stars in the observable universe.
        </motion.p>
      </div>
    </section>
  );
}
