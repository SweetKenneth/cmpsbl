/**
 * LiveStatsBar — Dual-patent authority strip with live substrate pulse
 */

import { Shield, Zap } from "lucide-react";

export function LiveStatsBar() {
  return (
    <section className="relative z-10 py-3 sm:py-3.5 border-b border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden lab-shimmer animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
      <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="container mx-auto px-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
          <span className="font-bold text-foreground">Dual-Patent Protected</span>
          <span className="hidden sm:inline"> · U.S. Patent Pending</span>
        </span>
        <span className="text-border/50">|</span>
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground/70">
          <Shield className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
          <span className="font-semibold text-foreground">40 Primitives</span>
          <span className="hidden sm:inline">· Free Forever</span>
        </span>
        <span className="hidden md:inline text-border/50">|</span>
        <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Zap className="w-3 h-3 text-[hsl(var(--neon-purple))]" />
          <span className="font-semibold text-foreground">11 NPM Packages</span>
          <span> · Zero Dependencies</span>
        </span>
      </div>
    </section>
  );
}
