/**
 * DualLayerAscensionVisual — Animated visualization of code being ascended.
 * Layer 1 (original source) sits pristine while Layer 2 wraps around it
 * with governance, defense, and capability injection animations.
 * 
 * 100% CSS keyframes — no framer-motion. DOM-based, mobile-first.
 */

import React, { memo, useMemo } from "react";

// ─── CSS Keyframes ──────────────────────────────────────────────
const KEYFRAMES_CSS = `
@keyframes ascend-scan {
  0%   { top: -2px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: calc(100% + 2px); opacity: 0; }
}
@keyframes layer2-expand {
  0%   { transform: scaleY(0); opacity: 0; }
  30%  { transform: scaleY(0.4); opacity: 0.6; }
  100% { transform: scaleY(1); opacity: 1; }
}
@keyframes gate-pulse {
  0%, 100% { opacity: 0.3; box-shadow: 0 0 4px hsl(var(--neon-magenta) / 0.2); }
  50%      { opacity: 1; box-shadow: 0 0 12px hsl(var(--neon-magenta) / 0.5); }
}
@keyframes shield-sweep {
  0%   { left: -100%; opacity: 0.8; }
  100% { left: 200%; opacity: 0; }
}
@keyframes hash-flash {
  0%, 80% { opacity: 0; }
  85%     { opacity: 1; }
  100%    { opacity: 0.7; }
}
@keyframes capability-inject {
  0%   { transform: translateX(40px); opacity: 0; }
  60%  { transform: translateX(-2px); opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes l1-glow {
  0%, 100% { box-shadow: inset 0 0 0 1px hsl(var(--neon-cyan) / 0.1); }
  50%      { box-shadow: inset 0 0 0 1px hsl(var(--neon-cyan) / 0.3), inset 0 0 20px hsl(var(--neon-cyan) / 0.05); }
}
@keyframes wrap-border {
  0%   { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
`;

// ─── Layer 1 source lines (realistic code) ──────────────────────
const L1_LINES = [
  { indent: 0, kw: "class", text: " ModelProcessor:" },
  { indent: 1, kw: "def", text: " __init__(self, config):" },
  { indent: 2, kw: "", text: "self.config = config" },
  { indent: 2, kw: "", text: "self.weights = load_weights()" },
  { indent: 2, kw: "", text: "self.device = detect_device()" },
  { indent: 0, kw: "", text: "" },
  { indent: 1, kw: "def", text: " forward(self, x):" },
  { indent: 2, kw: "", text: "x = self.normalize(x)" },
  { indent: 2, kw: "return", text: " self.predict(x)" },
  { indent: 0, kw: "", text: "" },
  { indent: 1, kw: "def", text: " predict(self, tensor):" },
  { indent: 2, kw: "", text: "logits = self.model(tensor)" },
  { indent: 2, kw: "return", text: " softmax(logits)" },
];

// ─── Layer 2 injection labels ───────────────────────────────────
const L2_INJECTIONS = [
  { line: 1, label: "DEFENSE gate", color: "var(--neon-magenta)", delay: "2.5s" },
  { line: 4, label: "BEACON signal", color: "var(--neon-cyan)", delay: "3.2s" },
  { line: 6, label: "GOVERNANCE hook", color: "var(--neon-purple)", delay: "3.9s" },
  { line: 8, label: "circuit breaker", color: "var(--primary)", delay: "4.6s" },
  { line: 11, label: "WRAITH mask", color: "var(--neon-magenta)", delay: "5.3s" },
  { line: 12, label: "telemetry tap", color: "var(--neon-cyan)", delay: "6.0s" },
];

const LINE_H = 22;
const TOTAL_H = L1_LINES.length * LINE_H;

function ScanLine() {
  return (
    <div
      className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
      style={{
        background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)",
        animation: "ascend-scan 4s ease-in-out infinite",
        top: 0,
      }}
    />
  );
}

function ShieldSweep() {
  return (
    <div
      className="absolute top-0 bottom-0 w-[60%] z-20 pointer-events-none"
      style={{
        background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.08), transparent)",
        animation: "shield-sweep 6s ease-in-out infinite",
        animationDelay: "1s",
      }}
    />
  );
}

const CodeLine = memo(({ line, index }: { line: typeof L1_LINES[0]; index: number }) => {
  if (!line.text && !line.kw) {
    return <div style={{ height: LINE_H }} />;
  }
  return (
    <div
      className="font-mono text-[11px] sm:text-xs leading-[22px] whitespace-pre select-none"
      style={{ paddingLeft: `${line.indent * 16 + 12}px` }}
    >
      <span className="text-muted-foreground/40 mr-3 inline-block w-4 text-right tabular-nums text-[10px]">
        {index + 1}
      </span>
      {line.kw && (
        <span style={{ color: "hsl(var(--neon-purple))" }} className="font-semibold">
          {line.kw}
        </span>
      )}
      <span className="text-foreground/70">{line.text}</span>
    </div>
  );
});
CodeLine.displayName = "CodeLine";

const InjectionLabel = memo(({ inj }: { inj: typeof L2_INJECTIONS[0] }) => (
  <div
    className="absolute right-0 z-20 flex items-center gap-1.5 pointer-events-none"
    style={{
      top: `${inj.line * LINE_H + 3}px`,
      animation: `capability-inject 0.6s ease-out both`,
      animationDelay: inj.delay,
    }}
  >
    <div
      className="h-[2px] w-4 sm:w-6"
      style={{ background: `hsl(${inj.color})` }}
    />
    <span
      className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border whitespace-nowrap"
      style={{
        color: `hsl(${inj.color})`,
        borderColor: `hsl(${inj.color} / 0.3)`,
        background: `hsl(${inj.color} / 0.1)`,
        animation: `gate-pulse 3s ease-in-out infinite`,
        animationDelay: `calc(${inj.delay} + 0.6s)`,
      }}
    >
      {inj.label}
    </span>
  </div>
));
InjectionLabel.displayName = "InjectionLabel";

function HashVerification() {
  return (
    <div
      className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none"
      style={{ animation: "hash-flash 8s ease-in-out infinite" }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
      <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: "hsl(var(--neon-cyan))" }}>
        SHA-256 VERIFIED · LAYER 1 INTACT
      </span>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-cyan))" }} />
    </div>
  );
}

export const DualLayerAscensionVisual = memo(function DualLayerAscensionVisual() {
  return (
    <>
      <style>{KEYFRAMES_CSS}</style>
      <div className="relative w-full max-w-xl mx-auto select-none">
        {/* Labels */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--neon-cyan))", animation: "l1-glow 3s infinite" }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Layer 1 — Original Source</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground/60">modeling_utils.py</span>
        </div>

        {/* Main container */}
        <div className="relative">
          {/* Layer 2 border wrap */}
          <div
            className="absolute -inset-[3px] rounded-xl pointer-events-none z-10"
            style={{
              border: "2px solid hsl(var(--neon-magenta) / 0.4)",
              animation: "wrap-border 3s ease-out both",
              animationDelay: "1.5s",
            }}
          >
            <div className="absolute -top-5 left-4 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--neon-magenta))" }} />
              <span
                className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                style={{
                  color: "hsl(var(--neon-magenta))",
                  background: "hsl(var(--neon-magenta) / 0.1)",
                  border: "1px solid hsl(var(--neon-magenta) / 0.2)",
                  animation: "hash-flash 8s ease-in-out infinite",
                  animationDelay: "2s",
                }}
              >
                Layer 2 — Convex Core™
              </span>
            </div>
          </div>

          {/* Code block */}
          <div
            className="relative rounded-lg border border-border bg-background/80 backdrop-blur-sm overflow-hidden"
            style={{ animation: "l1-glow 4s ease-in-out infinite" }}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50 bg-card/50">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground/50">ascension — live</span>
            </div>

            {/* Code area */}
            <div className="relative py-2 pr-36 sm:pr-44" style={{ minHeight: `${TOTAL_H + 16}px` }}>
              <ScanLine />
              <ShieldSweep />

              {/* Source lines */}
              {L1_LINES.map((line, i) => (
                <CodeLine key={i} line={line} index={i} />
              ))}

              {/* Layer 2 injection labels */}
              {L2_INJECTIONS.map((inj) => (
                <InjectionLabel key={inj.label} inj={inj} />
              ))}
            </div>
          </div>

          <HashVerification />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-12 flex-wrap">
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
