/**
 * HeroAscensionVisual — Homepage hero: life.js Easter egg with DREAM Layer 2.
 * Orbiting mystical runes, scanning beam, energy border, SHA verification.
 * 100% CSS keyframes · zero JS animation runtime · production-grade.
 */

import { memo } from "react";

const CYCLE = 12;

const KEYFRAMES = `
@keyframes ha-scan {
  0%   { top: -2px; opacity: 0; }
  4%   { opacity: 1; }
  46%  { opacity: 1; }
  50%  { top: calc(100% + 2px); opacity: 0; }
  100% { top: calc(100% + 2px); opacity: 0; }
}
@keyframes ha-inject {
  0%   { transform: translateX(20px); opacity: 0; }
  6%   { transform: translateX(-1px); opacity: 1; }
  10%  { transform: translateX(0); opacity: 1; }
  80%  { transform: translateX(0); opacity: 1; }
  90%  { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(20px); opacity: 0; }
}
@keyframes ha-gate-pulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 1; }
}
@keyframes ha-sweep {
  0%   { left: -80%; opacity: 0.4; }
  50%  { left: 200%; opacity: 0; }
  100% { left: 200%; opacity: 0; }
}
@keyframes ha-glow {
  0%, 100% { box-shadow: 0 0 0 1px hsl(var(--neon-cyan) / 0.06), 0 8px 32px -8px hsl(var(--primary) / 0.08); }
  50%      { box-shadow: 0 0 0 1px hsl(var(--neon-cyan) / 0.15), 0 8px 32px -8px hsl(var(--primary) / 0.12), inset 0 0 20px hsl(var(--neon-cyan) / 0.02); }
}
@keyframes ha-border {
  0%   { clip-path: inset(100% 0 0 0); }
  10%  { clip-path: inset(0 0 0 0); }
  90%  { clip-path: inset(0 0 0 0); }
  97%  { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(100% 0 0 0); }
}
@keyframes ha-hash {
  0%, 38% { opacity: 0; transform: translateY(2px); }
  48%     { opacity: 1; transform: translateY(0); }
  82%     { opacity: 0.85; transform: translateY(0); }
  92%     { opacity: 0; transform: translateY(2px); }
  100%    { opacity: 0; }
}
@keyframes ha-energy {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes ha-l2-label {
  0%, 4%  { opacity: 0; transform: translateY(3px) scale(0.95); }
  12%     { opacity: 1; transform: translateY(0) scale(1); }
  88%     { opacity: 1; transform: translateY(0) scale(1); }
  96%     { opacity: 0; transform: translateY(3px) scale(0.95); }
  100%    { opacity: 0; }
}
@keyframes ha-rune-orbit {
  0%   { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
}
@keyframes ha-rune-glow {
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 0.85; filter: drop-shadow(0 0 6px currentColor); }
}
@keyframes ha-corner-pulse {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.7; }
}
`;

const L1_LINES: { indent: number; kw?: string; text: string }[] = [
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
  { line: 1, label: "DREAM.resilience", color: "var(--neon-magenta)", delayPct: 14 },
  { line: 3, label: "DREAM.trust",      color: "var(--neon-cyan)",    delayPct: 30 },
  { line: 7, label: "DREAM.clarity",    color: "var(--neon-purple)",  delayPct: 46 },
  { line: 8, label: "DREAM.conviction", color: "var(--neon-magenta)", delayPct: 62 },
];

const RUNES = [
  { glyph: "◇", color: "neon-purple" },
  { glyph: "△", color: "neon-cyan" },
  { glyph: "⬡", color: "neon-magenta" },
  { glyph: "◈", color: "neon-purple" },
  { glyph: "⟡", color: "neon-cyan" },
  { glyph: "✦", color: "neon-magenta" },
];

const LINE_H = 22;
const TOTAL_H = L1_LINES.length * LINE_H;

const CodeLine = memo(({ line, index }: { line: typeof L1_LINES[0]; index: number }) => (
  <div
    className="font-mono text-[10.5px] sm:text-[11.5px] leading-[22px] whitespace-pre select-none group/line hover:bg-foreground/[0.02] transition-colors duration-150"
    style={{ paddingLeft: `${line.indent * 16 + 14}px` }}
  >
    <span className="text-muted-foreground/20 mr-3 inline-block w-4 text-right tabular-nums text-[9px] group-hover/line:text-muted-foreground/40 transition-colors">
      {index + 1}
    </span>
    {line.kw && (
      <span style={{ color: "hsl(var(--neon-purple))" }} className="font-semibold">{line.kw}</span>
    )}
    <span className="text-foreground/70">{line.text}</span>
  </div>
));
CodeLine.displayName = "HeroCodeLine";

export const HeroAscensionVisual = memo(function HeroAscensionVisual() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative w-full max-w-[420px] mx-auto select-none">

        {/* ── Orbiting mystical runes ── */}
        <div className="absolute inset-0 z-30 pointer-events-none" style={{ overflow: "visible" }}>
          {RUNES.map((rune, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                ["--orbit-r" as string]: `${100 + i * 16}px`,
                color: `hsl(var(--${rune.color}))`,
                fontSize: `${10 + (i % 3)}px`,
                fontWeight: 700,
                animation: `ha-rune-orbit ${10 + i * 2}s linear infinite, ha-rune-glow ${3.5 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * -1.2}s, ${i * -0.7}s`,
              }}
            >
              {rune.glyph}
            </div>
          ))}
        </div>

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between mb-3 px-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[6px] h-[6px] rounded-full"
              style={{ background: "hsl(var(--neon-cyan))", boxShadow: "0 0 8px hsl(var(--neon-cyan) / 0.5)" }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              Layer 1 — Legacy Host
            </span>
          </div>
          <span className="text-[9px] font-mono font-semibold text-muted-foreground/30 tracking-wider">life.js</span>
        </div>

        {/* ── Main container ── */}
        <div className="relative">
          {/* Energy border with gradient animation */}
          <div
            className="absolute -inset-[3px] rounded-xl pointer-events-none z-10"
            style={{
              border: "2px solid transparent",
              background: "linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple))) border-box",
              backgroundSize: "100% 100%, 200% 200%",
              animation: `ha-energy 3.5s linear infinite, ha-border ${CYCLE}s ease-in-out infinite`,
            }}
          >
            {/* Layer 2 DREAM badge */}
            <div className="absolute -top-[18px] left-4 flex items-center gap-1.5">
              <div
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: "hsl(var(--neon-magenta))", boxShadow: "0 0 6px hsl(var(--neon-magenta) / 0.5)" }}
              />
              <span
                className="text-[8px] font-extrabold uppercase tracking-[0.14em] px-2 py-0.5 rounded-[3px]"
                style={{
                  color: "hsl(var(--neon-magenta))",
                  background: "hsl(var(--neon-magenta) / 0.08)",
                  border: "1px solid hsl(var(--neon-magenta) / 0.25)",
                  backdropFilter: "blur(8px)",
                  animation: `ha-l2-label ${CYCLE}s ease-in-out infinite`,
                }}
              >
                ✦ Layer 2 — DREAM Synthesis
              </span>
            </div>

            {/* Corner accents */}
            {[
              { top: -1, right: -1 },
              { bottom: -1, left: -1 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 pointer-events-none"
                style={{
                  ...pos,
                  borderTop: i === 0 ? "2px solid hsl(var(--neon-cyan) / 0.5)" : undefined,
                  borderRight: i === 0 ? "2px solid hsl(var(--neon-cyan) / 0.5)" : undefined,
                  borderBottom: i === 1 ? "2px solid hsl(var(--neon-magenta) / 0.5)" : undefined,
                  borderLeft: i === 1 ? "2px solid hsl(var(--neon-magenta) / 0.5)" : undefined,
                  borderRadius: i === 0 ? "0 8px 0 0" : "0 0 0 8px",
                  animation: `ha-corner-pulse 3s ease-in-out infinite`,
                  animationDelay: `${i * 1.5}s`,
                }}
              />
            ))}
          </div>

          {/* ── Code block ── */}
          <div
            className="relative rounded-xl bg-background/95 backdrop-blur-lg overflow-hidden border border-border/10"
            style={{ animation: `ha-glow 4s ease-in-out infinite` }}
          >
            {/* Terminal chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/20 bg-card/20">
              <div className="w-[10px] h-[10px] rounded-full bg-[hsl(0_70%_55%/0.6)]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[hsl(45_70%_55%/0.6)]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[hsl(140_60%_45%/0.6)]" />
              <span className="ml-3 text-[9px] font-mono text-muted-foreground/30 tracking-wider">ascension — live</span>
            </div>

            {/* Code area */}
            <div className="relative py-2 pr-[120px] sm:pr-[148px]" style={{ minHeight: `${TOTAL_H + 12}px` }}>
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 5%, hsl(var(--neon-cyan) / 0.8) 40%, hsl(var(--neon-cyan)) 50%, hsl(var(--neon-cyan) / 0.8) 60%, transparent 95%)",
                  boxShadow: "0 0 8px 1px hsl(var(--neon-cyan) / 0.3)",
                  animation: `ha-scan ${CYCLE}s ease-in-out infinite`,
                  top: 0,
                }}
              />
              {/* Shield sweep */}
              <div
                className="absolute top-0 bottom-0 w-[45%] z-20 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.04), transparent)",
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
                  className="absolute right-1 z-20 flex items-center gap-1 pointer-events-none"
                  style={{
                    top: `${inj.line * LINE_H + 3}px`,
                    animation: `ha-inject ${CYCLE}s ease-in-out infinite`,
                    animationDelay: `${(inj.delayPct / 100) * CYCLE}s`,
                  }}
                >
                  <div className="h-[1.5px] w-4 sm:w-5" style={{ background: `hsl(${inj.color})` }} />
                  <span
                    className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.06em] px-1.5 py-[1px] rounded-[3px] border whitespace-nowrap"
                    style={{
                      color: `hsl(${inj.color})`,
                      borderColor: `hsl(${inj.color} / 0.3)`,
                      background: `hsl(${inj.color} / 0.08)`,
                      backdropFilter: "blur(4px)",
                      animation: `ha-gate-pulse 2.5s ease-in-out infinite`,
                      animationDelay: `${(inj.delayPct / 100) * 2}s`,
                    }}
                  >
                    {inj.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SHA verification strip */}
          <div
            className="absolute -bottom-7 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none"
            style={{ animation: `ha-hash ${CYCLE}s ease-in-out infinite` }}
          >
            <div className="h-[1px] w-6 sm:w-8" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.5))" }} />
            <span className="text-[8px] font-mono font-bold tracking-[0.15em]" style={{ color: "hsl(var(--neon-cyan) / 0.7)" }}>
              SHA-256 VERIFIED · LAYER 1 INTACT
            </span>
            <div className="h-[1px] w-6 sm:w-8" style={{ background: "linear-gradient(90deg, hsl(var(--neon-cyan) / 0.5), transparent)" }} />
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center justify-center gap-5 sm:gap-6 mt-12 relative z-10">
          {[
            { color: "var(--neon-cyan)", label: "Scan · Verify" },
            { color: "var(--neon-magenta)", label: "DREAM Synthesis" },
            { color: "var(--neon-purple)", label: "Governance" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: `hsl(${item.color})`, boxShadow: `0 0 6px hsl(${item.color} / 0.4)` }}
              />
              <span className="text-[9px] font-semibold text-muted-foreground/45 tracking-[0.06em]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
