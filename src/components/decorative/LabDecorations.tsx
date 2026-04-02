/**
 * LabDecorations — Reusable decorative elements for the "lab" aesthetic.
 * Scanning lines, pulse rings, grid overlays, glow orbs, and data-stream accents.
 * Pure CSS — no JS animation overhead.
 */

import { cn } from "@/lib/utils";

/** Horizontal scan line that sweeps down periodically */
export function ScanLine({ className, speed = "8s" }: { className?: string; speed?: string }) {
  return (
    <div className={cn("absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden z-[1]", className)}>
      <div
        className="absolute inset-x-0 h-px lab-scan-line"
        style={{ animationDuration: speed }}
      />
    </div>
  );
}

/** Pulsing ring — radiates outward from center */
export function PulseRing({
  className,
  size = 200,
  color = "--primary",
  delay = "0s",
}: {
  className?: string;
  size?: number;
  color?: string;
  delay?: string;
}) {
  return (
    <div
      className={cn("absolute pointer-events-none lab-pulse-ring", className)}
      style={{
        width: size,
        height: size,
        border: `1px solid hsl(var(${color}) / 0.15)`,
        borderRadius: "50%",
        animationDelay: delay,
      }}
    />
  );
}

/** Dot grid overlay — subtle technical background texture */
export function DotGrid({ className, spacing = 32, opacity = 0.04 }: { className?: string; spacing?: number; opacity?: number }) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none z-0", className)}
      style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--primary) / ${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
    />
  );
}

/** Crosshair / targeting reticle */
export function Crosshair({ className, size = 80, color = "--primary" }: { className?: string; size?: number; color?: string }) {
  return (
    <div className={cn("absolute pointer-events-none lab-crosshair", className)} style={{ width: size, height: size }}>
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: `hsl(var(${color}) / 0.15)` }} />
      <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: `hsl(var(${color}) / 0.15)` }} />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          border: `1px solid hsl(var(${color}) / 0.12)`,
        }}
      />
    </div>
  );
}

/** Corner brackets — "specimen framing" feel */
export function CornerBrackets({ className, color = "--primary" }: { className?: string; color?: string }) {
  const style = { borderColor: `hsl(var(${color}) / 0.2)` };
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-[1]", className)}>
      {/* Top-left */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={style} />
      {/* Top-right */}
      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r" style={style} />
      {/* Bottom-left */}
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l" style={style} />
      {/* Bottom-right */}
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r" style={style} />
    </div>
  );
}

/** Data stream — flowing vertical lines of data */
export function DataStream({ className, lines = 5 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden z-0", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="absolute w-px lab-data-stream"
          style={{
            left: `${(100 / (lines + 1)) * (i + 1)}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + i * 0.8}s`,
            background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.08), transparent)`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

/** Floating measurement markers — technical annotations */
export function MeasureMarkers({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none z-0 hidden sm:block", className)}>
      {/* Left ruler marks */}
      {[20, 40, 60, 80].map((pct) => (
        <div key={pct} className="absolute left-4 flex items-center gap-1" style={{ top: `${pct}%` }}>
          <div className="w-3 h-px bg-primary/10" />
          <span className="text-[8px] font-mono text-primary/15 tabular-nums">{pct}</span>
        </div>
      ))}
    </div>
  );
}

/** Status indicator — small blinking dot with label */
export function StatusIndicator({
  className,
  label = "ACTIVE",
  color = "--neon-green",
}: {
  className?: string;
  label?: string;
  color?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div
        className="w-1.5 h-1.5 rounded-full lab-status-blink"
        style={{ background: `hsl(var(${color}))`, boxShadow: `0 0 6px hsl(var(${color}) / 0.4)` }}
      />
      <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: `hsl(var(${color}) / 0.6)` }}>
        {label}
      </span>
    </div>
  );
}

/** Glow orb — ambient background accent */
export function GlowOrb({
  className,
  size = 400,
  color = "--primary",
  intensity = 0.06,
  animation = "animate-hero-orb-1",
}: {
  className?: string;
  size?: number;
  color?: string;
  intensity?: number;
  animation?: string;
}) {
  return (
    <div
      className={cn("absolute rounded-full pointer-events-none", animation, className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(var(${color}) / ${intensity}) 0%, hsl(var(${color}) / ${intensity * 0.3}) 35%, transparent 55%)`,
      }}
    />
  );
}

/** Full lab ambient background — combines orbs + grid + scan line */
export function LabAmbient({ className, showScanLine = true }: { className?: string; showScanLine?: boolean }) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0", className)}>
      <div className="absolute inset-0 gradient-mesh opacity-80" />
      <DotGrid opacity={0.03} spacing={40} />
      <GlowOrb className="-top-48 -left-48" size={900} color="--primary" intensity={0.07} animation="animate-hero-orb-1" />
      <GlowOrb className="top-1/3 -right-20" size={600} color="--neon-cyan" intensity={0.05} animation="animate-hero-orb-2" />
      <GlowOrb className="-bottom-48 -right-48" size={700} color="--neon-purple" intensity={0.06} animation="animate-hero-orb-3" />
      {showScanLine && <ScanLine />}
    </div>
  );
}
