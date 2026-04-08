/**
 * CombinedAscensionVisual — Merges Terminal Scanner (#1) + Magical Wrap (#2).
 * Terminal code block with scan line, orbiting runes, glowing energy border,
 * and Layer 2 capability injections that loop infinitely.
 * 
 * 100% CSS keyframes. DOM-based. Mobile-first.
 */

import React, { memo } from "react";

const CYCLE = 10; // seconds per full loop

const KEYFRAMES = `
@keyframes ca-scan {
  0%   { top: -2px; opacity: 0; }
  5%   { opacity: 1; }
  45%  { opacity: 1; }
  50%  { top: calc(100% + 2px); opacity: 0; }
  100% { top: calc(100% + 2px); opacity: 0; }
}
@keyframes ca-inject {
  0%   { transform: translateX(30px); opacity: 0; }
  8%   { transform: translateX(-2px); opacity: 1; }
  12%  { transform: translateX(0); opacity: 1; }
  80%  { transform: translateX(0); opacity: 1; }
  90%  { transform: translateX(30px); opacity: 0; }
  100% { transform: translateX(30px); opacity: 0; }
}
@keyframes ca-gate-pulse {
  0%, 100% { opacity: 0.4; box-shadow: 0 0 4px hsl(var(--neon-magenta) / 0.15); }
  50%      { opacity: 1; box-shadow: 0 0 10px hsl(var(--neon-magenta) / 0.4); }
}
@keyframes ca-shield-sweep {
  0%   { left: -80%; opacity: 0.6; }
  50%  { left: 200%; opacity: 0; }
  100% { left: 200%; opacity: 0; }
}
@keyframes ca-glow {
  0%, 100% { box-shadow: inset 0 0 0 1px hsl(var(--neon-cyan) / 0.1); }
  50%      { box-shadow: inset 0 0 0 1px hsl(var(--neon-cyan) / 0.25), inset 0 0 16px hsl(var(--neon-cyan) / 0.04); }
}
@keyframes ca-wrap-border {
  0%   { clip-path: inset(100% 0 0 0); }
  15%  { clip-path: inset(0 0 0 0); }
  85%  { clip-path: inset(0 0 0 0); }
  95%  { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(100% 0 0 0); }
}
@keyframes ca-hash {
  0%, 40% { opacity: 0; }
  50%     { opacity: 1; }
  85%     { opacity: 0.8; }
  95%     { opacity: 0; }
  100%    { opacity: 0; }
}
@keyframes ca-rune-orbit {
  0%   { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
}
@keyframes ca-rune-glow {
  0%, 100% { opacity: 0.4; filter: blur(0px); }
  50%      { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
}
@keyframes ca-energy-flow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes ca-l2-label {
  0%, 5%  { opacity: 0; transform: translateY(4px); }
  15%     { opacity: 1; transform: translateY(0); }
  85%     { opacity: 1; transform: translateY(0); }
  95%     { opacity: 0; transform: translateY(4px); }
  100%    { opacity: 0; }
}
`;

const L1_LINES = [
  { indent: 0, kw: "function", text: " secretOfLife() {" },
  { indent: 0, kw: "", text: "" },
  { indent: 1, kw: "const", text: " work = doHardThings();" },
  { indent: 1, kw: "const", text: " crew = peopleYouLove();" },
  { indent: 0, kw: "", text: "" },
  { indent: 1, kw: "const", text: " impact = buildFor(crew, {" },
  { indent: 2, kw: "", text: "scope: 'the world'," },
  { indent: 2, kw: "", text: "duration: 'decades'," },
  { indent: 1, kw: "", text: "});" },
  { indent: 0, kw: "", text: "" },
  { indent: 1, kw: "", text: "forgetEverythingElse();" },
  { indent: 0, kw: "", text: "" },
  { indent: 1, kw: "return", text: " impact;" },
  { indent: 0, kw: "", text: "}" },
];

const L2_INJECTIONS = [
  { line: 2,  label: "resilience",  color: "var(--neon-magenta)", delayPct: 15 },
  { line: 5,  label: "trust layer", color: "var(--neon-cyan)",    delayPct: 30 },
  { line: 10, label: "clarity",     color: "var(--neon-purple)",  delayPct: 45 },
  { line: 12, label: "conviction",  color: "var(--neon-magenta)", delayPct: 60 },
];

const RUNES = ["◇", "△", "⬡", "◈", "⟡", "✦"];

const LINE_H = 22;
const TOTAL_H = L1_LINES.length * LINE_H;

const CodeLine = memo(({ line, index }: { line: typeof L1_LINES[0]; index: number }) => {
  if (!line.text && !line.kw) return <div style={{ height: LINE_H }} />;
  return (
    <div
      className="font-mono text-[11px] sm:text-xs leading-[22px] whitespace-pre select-none"
      style={{ paddingLeft: `${line.indent * 16 + 12}px` }}
    >
      <span className="text-muted-foreground/40 mr-3 inline-block w-4 text-right tabular-nums text-[10px]">
        {index + 1}
      </span>
      {line.kw && (
        <span style={{ color: "hsl(var(--neon-purple))" }} className="font-semibold">{line.kw}</span>
      )}
      <span className="text-foreground/70">{line.text}</span>
    </div>
  );
});
CodeLine.displayName = "CodeLine";

export const CombinedAscensionVisual = memo(function CombinedAscensionVisual() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative w-full max-w-xl mx-auto select-none">

        {/* Orbiting runes */}
        <div className="absolute inset-0 z-30 pointer-events-none overflow-visible">
          {RUNES.map((rune, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 text-sm font-bold"
              style={{
                ["--orbit-r" as string]: `${110 + i * 18}px`,
                color: `hsl(var(--neon-${i % 3 === 0 ? "purple" : i % 3 === 1 ? "cyan" : "magenta"}))`,
                animation: `ca-rune-orbit ${8 + i * 2}s linear infinite, ca-rune-glow ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s, ${i * 0.4}s`,
              }}
            >
              {rune}
            </div>
          ))}
        </div>

        {/* Header labels */}
        <div className="flex items-center justify-between mb-3 px-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Layer 1 — Original Source
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground/60">life.js</span>
        </div>

        {/* Main container */}
        <div className="relative">
          {/* Animated energy border (from #2) */}
          <div
            className="absolute -inset-[3px] rounded-xl pointer-events-none z-10"
            style={{
              border: "2px solid transparent",
              background: "linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple))) border-box",
              backgroundSize: "100% 100%, 200% 200%",
              animation: `ca-energy-flow 4s linear infinite, ca-wrap-border ${CYCLE}s ease-in-out infinite`,
            }}
          >
            {/* Layer 2 label */}
            <div className="absolute -top-5 left-4 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-magenta))" }} />
              <span
                className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                style={{
                  color: "hsl(var(--neon-magenta))",
                  background: "hsl(var(--neon-magenta) / 0.1)",
                  border: "1px solid hsl(var(--neon-magenta) / 0.2)",
                  animation: `ca-l2-label ${CYCLE}s ease-in-out infinite`,
                }}
              >
                ✦ Layer 2 — Convex Core™
              </span>
            </div>
          </div>

          {/* Code block */}
          <div
            className="relative rounded-lg border-2 border-foreground/20 bg-background/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/[0.08]"
            style={{ animation: "ca-glow 4s ease-in-out infinite" }}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50 bg-card/50">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground/50">ascension — live</span>
            </div>

            {/* Code area */}
            <div className="relative py-2 pr-36 sm:pr-44" style={{ minHeight: `${TOTAL_H + 16}px` }}>
              {/* Scan line — loops */}
              <div
                className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)",
                  animation: `ca-scan ${CYCLE}s ease-in-out infinite`,
                  top: 0,
                }}
              />
              {/* Shield sweep — loops */}
              <div
                className="absolute top-0 bottom-0 w-[60%] z-20 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.06), transparent)",
                  animation: `ca-shield-sweep ${CYCLE}s ease-in-out infinite`,
                }}
              />

              {/* Source lines */}
              {L1_LINES.map((line, i) => (
                <CodeLine key={i} line={line} index={i} />
              ))}

              {/* Layer 2 injection labels — loop with stagger */}
              {L2_INJECTIONS.map((inj) => (
                <div
                  key={inj.label}
                  className="absolute right-0 z-20 flex items-center gap-1.5 pointer-events-none"
                  style={{
                    top: `${inj.line * LINE_H + 3}px`,
                    animation: `ca-inject ${CYCLE}s ease-in-out infinite`,
                    animationDelay: `${(inj.delayPct / 100) * CYCLE}s`,
                  }}
                >
                  <div className="h-[2px] w-4 sm:w-6" style={{ background: `hsl(${inj.color})` }} />
                  <span
                    className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border whitespace-nowrap"
                    style={{
                      color: `hsl(${inj.color})`,
                      borderColor: `hsl(${inj.color} / 0.3)`,
                      background: `hsl(${inj.color} / 0.1)`,
                      animation: `ca-gate-pulse 2.5s ease-in-out infinite`,
                    }}
                  >
                    {inj.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SHA verification — loops */}
          <div
            className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none"
            style={{ animation: `ca-hash ${CYCLE}s ease-in-out infinite` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
            <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: "hsl(var(--neon-cyan))" }}>
              SHA-256 VERIFIED · LAYER 1 INTACT
            </span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-12 flex-wrap relative z-10">
          {[
            { color: "var(--neon-cyan)", label: "Scan & verify" },
            { color: "var(--neon-magenta)", label: "Defense & masking" },
            { color: "var(--neon-purple)", label: "Governance" },
            { color: "var(--primary)", label: "Resilience" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${item.color})` }} />
              <span className="text-[10px] font-medium text-muted-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
