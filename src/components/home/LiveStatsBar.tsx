/**
 * Live Stats Bar — Refurbishment Center status indicator
 * Condensed single-line live indicator (no redundant stats)
 */

export function LiveStatsBar() {
  return (
    <section className="relative z-10 py-2.5 sm:py-3 border-b border-border/30 bg-card/20 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-50" />
      <div className="container mx-auto px-4 flex items-center justify-center gap-3">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--neon-cyan))] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--neon-cyan))]" />
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground/70">
          <span className="font-bold text-[hsl(var(--neon-cyan))]">Live</span>
          {' · '}Memory Stream scanning · Next cycle in progress
        </span>
      </div>
    </section>
  );
}
