/**
 * Live Stats Bar — Concise platform status indicator
 * PERFORMANCE: Pure CSS, no framer-motion
 */

export function LiveStatsBar() {
  return (
    <section className="relative z-10 py-3 sm:py-4 border-b border-border/30 bg-gradient-to-r from-card/20 via-card/50 to-card/20 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-px divider-flow" />
      {/* Inner ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
      <div className="container mx-auto px-4">
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--neon-cyan))] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--neon-cyan))]" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-[hsl(var(--neon-cyan))] uppercase tracking-widest">Platform · Memory Stream · Live</span>
        </div>

        {/* Concise value statement */}
        <p
          className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed text-center max-w-2xl mx-auto animate-fade-in opacity-0"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
        <span className="text-foreground/90 font-medium">40 primitives</span> coordinating across{' '}
          <span className="text-foreground/90 font-medium">4 categories</span> — persistent memory, governed routing, and self-improvement running continuously.
        </p>
      </div>
    </section>
  );
}
