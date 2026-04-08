/**
 * ConcentricShieldVisual — Radial "shield rings" concept.
 * Code sits at the center. Concentric animated rings represent each
 * Layer 2 primitive wrapping around it — Defense, Governance, Beacon, etc.
 * 
 * 100% CSS. DOM-based.
 */

import React, { memo } from "react";

const KEYFRAMES = `
@keyframes ring-spin {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes ring-counter {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(-360deg); }
}
@keyframes core-pulse {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--neon-cyan) / 0.15); }
  50%      { box-shadow: 0 0 40px hsl(var(--neon-cyan) / 0.3); }
}
@keyframes node-glow {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50%      { transform: scale(1.3); opacity: 1; }
}
@keyframes shield-appear {
  0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  60%  { transform: translate(-50%, -50%) scale(1.05); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
`;

const RINGS = [
  {
    label: "DEFENSE",
    size: 180,
    color: "var(--neon-magenta)",
    speed: "20s",
    direction: "ring-spin",
    delay: "0.5s",
    nodes: 3,
  },
  {
    label: "GOVERNANCE",
    size: 250,
    color: "var(--neon-purple)",
    speed: "28s",
    direction: "ring-counter",
    delay: "1s",
    nodes: 4,
  },
  {
    label: "BEACON",
    size: 320,
    color: "var(--neon-cyan)",
    speed: "35s",
    direction: "ring-spin",
    delay: "1.5s",
    nodes: 5,
  },
  {
    label: "FAILSAFE",
    size: 380,
    color: "var(--primary)",
    speed: "42s",
    direction: "ring-counter",
    delay: "2s",
    nodes: 3,
  },
];

const CORE_LINES = [
  "class App:",
  "  def run():",
  "    ...",
];

export const ConcentricShieldVisual = memo(function ConcentricShieldVisual() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative w-full max-w-xl mx-auto select-none" style={{ height: "420px" }}>
        {/* Rings */}
        {RINGS.map((ring, ri) => (
          <div
            key={ring.label}
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
            style={{
              width: `${ring.size}px`,
              height: `${ring.size}px`,
              border: `1.5px solid hsl(${ring.color} / 0.25)`,
              animation: `${ring.direction} ${ring.speed} linear infinite, shield-appear 1s ease-out both`,
              animationDelay: `${ring.delay}, ${ring.delay}`,
            }}
          >
            {/* Nodes on each ring */}
            {Array.from({ length: ring.nodes }).map((_, ni) => {
              const angle = (360 / ring.nodes) * ni;
              return (
                <div
                  key={ni}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    background: `hsl(${ring.color})`,
                    boxShadow: `0 0 8px hsl(${ring.color} / 0.5)`,
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translateX(${ring.size / 2}px) rotate(-${angle}deg) translate(-50%, -50%)`,
                    animation: `node-glow 2s ease-in-out infinite`,
                    animationDelay: `${ni * 0.4 + ri * 0.2}s`,
                  }}
                />
              );
            })}

            {/* Ring label */}
            <span
              className="absolute text-[8px] font-bold uppercase tracking-[0.15em] whitespace-nowrap"
              style={{
                color: `hsl(${ring.color})`,
                top: "-14px",
                left: "50%",
                transform: `translateX(-50%) rotate(${ring.direction === "ring-counter" ? "" : "-"}0deg)`,
                textShadow: `0 0 6px hsl(${ring.color} / 0.3)`,
              }}
            >
              {ring.label}
            </span>
          </div>
        ))}

        {/* Core — the host code */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-lg border border-border/40 bg-background/95 backdrop-blur-sm px-4 py-3"
          style={{ animation: "core-pulse 3s ease-in-out infinite" }}
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 block mb-1.5">
            Layer 1 · Host
          </span>
          {CORE_LINES.map((line, i) => (
            <div key={i} className="font-mono text-[10px] leading-[16px] text-foreground/60">
              {line}
            </div>
          ))}
        </div>

        {/* Legend at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 flex-wrap">
          {RINGS.map((ring) => (
            <div key={ring.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${ring.color})` }} />
              <span className="text-[9px] font-semibold text-muted-foreground/60">{ring.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
