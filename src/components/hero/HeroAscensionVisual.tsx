/**
 * HeroAscensionVisual — Compact homepage hero version of the Combined Ascension.
 * life.js code with DREAM-powered Layer 2 injections.
 * 100% CSS keyframes. Compact sizing for hero placement.
 */

import { memo } from "react";

const CYCLE = 12;

const KEYFRAMES = `
@keyframes ha-scan {
  0%   { top: -2px; opacity: 0; }
  5%   { opacity: 1; }
  45%  { opacity: 1; }
  50%  { top: calc(100% + 2px); opacity: 0; }
  100% { top: calc(100% + 2px); opacity: 0; }
}
@keyframes ha-inject {
  0%   { transform: translateX(24px); opacity: 0; }
  8%   { transform: translateX(-1px); opacity: 1; }
  12%  { transform: translateX(0); opacity: 1; }
  78%  { transform: translateX(0); opacity: 1; }
  88%  { transform: translateX(24px); opacity: 0; }
  100% { transform: translateX(24px); opacity: 0; }
}
@keyframes ha-gate-pulse {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 3px hsl(var(--neon-magenta) / 0.15); }
  50%      { opacity: 1; box-shadow: 0 0 8px hsl(var(--neon-magenta) / 0.35); }
}
@keyframes ha-sweep {
  0%   { left: -80%; opacity: 0.5; }
  50%  { left: 200%; opacity: 0; }
  100% { left: 200%; opacity: 0; }
}
@keyframes ha-glow {
  0%, 100% { box-shadow: inset 0 0 0 1px hsl(var(--neon-cyan) / 0.08); }
  50%      { box-shadow: inset 0 0 0 1px hsl(var(--neon-cyan) / 0.2), inset 0 0 12px hsl(var(--neon-cyan) / 0.03); }
}
@keyframes ha-border {
  0%   { clip-path: inset(100% 0 0 0); }
  12%  { clip-path: inset(0 0 0 0); }
  88%  { clip-path: inset(0 0 0 0); }
  96%  { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(100% 0 0 0); }
}
@keyframes ha-hash {
  0%, 35% { opacity: 0; }
  45%     { opacity: 1; }
  85%     { opacity: 0.8; }
  93%     { opacity: 0; }
  100%    { opacity: 0; }
}
@keyframes ha-energy {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes ha-l2-label {
  0%, 5%  { opacity: 0; transform: translateY(3px); }
  14%     { opacity: 1; transform: translateY(0); }
  86%     { opacity: 1; transform: translateY(0); }
  94%     { opacity: 0; transform: translateY(3px); }
  100%    { opacity: 0; }
}
`;

const L1_LINES = [
  { indent: 0, kw: "function", text: " secretOfLife() {" },
  { indent: 1, kw: "const", text: " work = doHardThings();" },
  { indent: 1, kw: "const", text: " crew = peopleYouLove();" },
  { indent: 1, kw: "const", text: " impact = buildFor(crew, {" },
  { indent: 2, text: "scope: 'the world'," },
  { indent: 2, text: "duration: 'decades'," },
  { indent: 1, text: "});" },
  { indent: 1, text: "forgetEverythingElse();" },
  { indent: 1, kw: "return", text: " impact;" },
  { indent: 0, text: "}" },
];

const L2_INJECTIONS = [
  { line: 1,  label: "DREAM.resilience",   color: "var(--neon-magenta)", delayPct: 14 },
  { line: 3,  label: "DREAM.trust",        color: "var(--neon-cyan)",    delayPct: 30 },
  { line: 7,  label: "DREAM.clarity",      color: "var(--neon-purple)",  delayPct: 46 },
  { line: 8,  label: "DREAM.conviction",   color: "var(--neon-magenta)", delayPct: 62 },
];

const LINE_H = 20;
const TOTAL_H = L1_LINES.length * LINE_H;

const CodeLine = memo(({ line, index }: { line: typeof L1_LINES[0]; index: number }) => {
  if (!line.text && !line.kw) return <div style={{ height: LINE_H }} />;
  return (
    <div
      className="font-mono text-[10px] sm:text-[11px] leading-[20px] whitespace-pre select-none"
      style={{ paddingLeft: `${(line.indent ?? 0) * 14 + 10}px` }}
    >
      <span className="text-muted-foreground/30 mr-2 inline-block w-3 text-right tabular-nums text-[9px]">
        {index + 1}
      </span>
      {line.kw && (
        <span style={{ color: "hsl(var(--neon-purple))" }} className="font-semibold">{line.kw}</span>
      )}
      <span className="text-foreground/70">{line.text}</span>
    </div>
  );
});
CodeLine.displayName = "HeroCodeLine";

export const HeroAscensionVisual = memo(function HeroAscensionVisual() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative w-full max-w-md mx-auto select-none">

        {/* Header labels */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
              Layer 1 — Source
            </span>
          </div>
          <span className="text-[9px] font-mono font-semibold text-muted-foreground/50">life.js</span>
        </div>

        {/* Main container */}
        <div className="relative">
          {/* Animated energy border */}
          <div
            className="absolute -inset-[2px] rounded-lg pointer-events-none z-10"
            style={{
              border: "1.5px solid transparent",
              background: "linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple))) border-box",
              backgroundSize: "100% 100%, 200% 200%",
              animation: `ha-energy 4s linear infinite, ha-border ${CYCLE}s ease-in-out infinite`,
            }}
          >
            {/* Layer 2 DREAM label */}
            <div className="absolute -top-4 left-3 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: "hsl(var(--neon-magenta))" }} />
              <span
                className="text-[8px] font-bold uppercase tracking-[0.12em] px-1.5 py-px rounded-sm"
                style={{
                  color: "hsl(var(--neon-magenta))",
                  background: "hsl(var(--neon-magenta) / 0.1)",
                  border: "1px solid hsl(var(--neon-magenta) / 0.2)",
                  animation: `ha-l2-label ${CYCLE}s ease-in-out infinite`,
                }}
              >
                ✦ Layer 2 — DREAM Synthesis
              </span>
            </div>
          </div>

          {/* Code block */}
          <div
            className="relative rounded-md border-2 border-foreground/15 bg-background/80 backdrop-blur-sm overflow-hidden shadow-xl shadow-primary/[0.06]"
            style={{ animation: `ha-glow 4s ease-in-out infinite` }}
          >
            {/* Terminal dots */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-border/40 bg-card/40">
              <div className="w-2 h-2 rounded-full bg-destructive/50" />
              <div className="w-2 h-2 rounded-full bg-accent/50" />
              <div className="w-2 h-2 rounded-full bg-primary/50" />
              <span className="ml-1.5 text-[9px] font-mono text-muted-foreground/40">ascension — live</span>
            </div>

            {/* Code area */}
            <div className="relative py-1.5 pr-28 sm:pr-36" style={{ minHeight: `${TOTAL_H + 8}px` }}>
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-[1.5px] z-30 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)",
                  animation: `ha-scan ${CYCLE}s ease-in-out infinite`,
                  top: 0,
                }}
              />
              {/* Shield sweep */}
              <div
                className="absolute top-0 bottom-0 w-[50%] z-20 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.05), transparent)",
                  animation: `ha-sweep ${CYCLE}s ease-in-out infinite`,
                }}
              />

              {/* Source lines */}
              {L1_LINES.map((line, i) => (
                <CodeLine key={i} line={line} index={i} />
              ))}

              {/* DREAM injection labels */}
              {L2_INJECTIONS.map((inj) => (
                <div
                  key={inj.label}
                  className="absolute right-0 z-20 flex items-center gap-1 pointer-events-none"
                  style={{
                    top: `${inj.line * LINE_H + 2}px`,
                    animation: `ha-inject ${CYCLE}s ease-in-out infinite`,
                    animationDelay: `${(inj.delayPct / 100) * CYCLE}s`,
                  }}
                >
                  <div className="h-[1.5px] w-3 sm:w-4" style={{ background: `hsl(${inj.color})` }} />
                  <span
                    className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1 py-px rounded-sm border whitespace-nowrap"
                    style={{
                      color: `hsl(${inj.color})`,
                      borderColor: `hsl(${inj.color} / 0.25)`,
                      background: `hsl(${inj.color} / 0.08)`,
                      animation: `ha-gate-pulse 2.5s ease-in-out infinite`,
                    }}
                  >
                    {inj.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SHA verification */}
          <div
            className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none"
            style={{ animation: `ha-hash ${CYCLE}s ease-in-out infinite` }}
          >
            <div className="w-1 h-1 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
            <span className="text-[9px] font-mono font-semibold tracking-wider" style={{ color: "hsl(var(--neon-cyan) / 0.8)" }}>
              SHA-256 VERIFIED · LAYER 1 INTACT
            </span>
            <div className="w-1 h-1 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
          </div>
        </div>
      </div>
    </>
  );
});
