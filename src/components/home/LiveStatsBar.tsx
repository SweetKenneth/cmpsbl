/**
 * Live Stats Bar — Refurbishment Center status indicator
 * Condensed single-line live indicator with shimmer sweep
 */

export function LiveStatsBar() {
  return (
    <section className="relative z-10 py-2.5 sm:py-3 border-b border-border/30 bg-card/20 overflow-hidden lab-shimmer">
      <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="container mx-auto px-4 flex items-center justify-center gap-3">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground/70">
          <span className="font-bold text-neon-cyan">Live</span>
          {' · '}Memory Stream scanning · Next cycle in progress
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 pl-2 border-l border-border/30">
          <span className="w-1 h-1 rounded-full bg-neon-green lab-status-blink" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">40P Online</span>
        </span>
      </div>
    </section>
  );
}
