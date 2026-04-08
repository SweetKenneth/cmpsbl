/**
 * SplitPaneVisual — Side-by-side before/after concept.
 * Left pane: raw vulnerable code (Layer 1). Right pane: ascended output with
 * visible hardening annotations. A center divider pulses to show the transformation.
 * 
 * 100% CSS. DOM-based.
 */

import React, { memo } from "react";

const KEYFRAMES = `
@keyframes divider-pulse {
  0%, 100% { box-shadow: 0 0 8px hsl(var(--primary) / 0.2); }
  50%      { box-shadow: 0 0 20px hsl(var(--primary) / 0.5); }
}
@keyframes line-highlight {
  0%   { background: transparent; }
  50%  { background: hsl(var(--neon-cyan) / 0.08); }
  100% { background: transparent; }
}
@keyframes badge-pop {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes arrow-flow {
  0%   { opacity: 0; transform: translateX(-4px); }
  50%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(4px); }
}
`;

const BEFORE_LINES = [
  { text: "def transfer(from, to, amt):", tag: null },
  { text: "  bal = get_balance(from)", tag: null },
  { text: "  if bal >= amt:", tag: "⚠ no validation" },
  { text: "    debit(from, amt)", tag: "⚠ no audit" },
  { text: "    credit(to, amt)", tag: null },
  { text: "    return True", tag: null },
  { text: "  return False", tag: "⚠ silent fail" },
];

const AFTER_LINES = [
  { text: "def transfer(from, to, amt):", tag: null },
  { text: "  DEFENSE.gate(from, to, amt)", tag: "✓ boundary" },
  { text: "  bal = get_balance(from)", tag: null },
  { text: "  if bal >= amt:", tag: "✓ validated" },
  { text: "    GOVERNANCE.audit(from,amt)", tag: "✓ audit" },
  { text: "    debit(from, amt)", tag: null },
  { text: "    credit(to, amt)", tag: null },
  { text: "    BEACON.signal('success')", tag: "✓ health" },
  { text: "    return True", tag: null },
  { text: "  FAILSAFE.degrade(from, amt)", tag: "✓ graceful" },
];

export const SplitPaneVisual = memo(function SplitPaneVisual() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative w-full max-w-2xl mx-auto select-none">
        <div className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden border border-border/30">
          {/* Left: Before */}
          <div className="relative bg-background/90 border-r border-border/20">
            <div className="px-3 py-2 border-b border-border/20 bg-card/30">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-destructive/70">
                Layer 1 — Unprotected
              </span>
            </div>
            <div className="p-3">
              {BEFORE_LINES.map((line, i) => (
                <div key={i} className="flex items-center gap-1 leading-[20px]">
                  <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground/50 flex-1 whitespace-pre">
                    {line.text}
                  </span>
                  {line.tag && (
                    <span
                      className="text-[8px] font-bold text-destructive/60 whitespace-nowrap shrink-0"
                      style={{ animation: `badge-pop 0.5s ease-out both`, animationDelay: `${1 + i * 0.4}s` }}
                    >
                      {line.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: After */}
          <div className="relative bg-background/90">
            <div className="px-3 py-2 border-b border-border/20 bg-card/30">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "hsl(var(--neon-cyan))" }}>
                Layer 2 — Ascended
              </span>
            </div>
            <div className="p-3">
              {AFTER_LINES.map((line, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 leading-[20px] rounded-sm px-1 -mx-1"
                  style={line.tag ? { animation: `line-highlight 3s ease-in-out infinite`, animationDelay: `${i * 0.5}s` } : {}}
                >
                  <span className="font-mono text-[10px] sm:text-[11px] text-foreground/70 flex-1 whitespace-pre">
                    {line.text}
                  </span>
                  {line.tag && (
                    <span
                      className="text-[8px] font-bold whitespace-nowrap shrink-0"
                      style={{
                        color: "hsl(var(--neon-cyan))",
                        animation: `badge-pop 0.5s ease-out both`,
                        animationDelay: `${1.5 + i * 0.3}s`,
                      }}
                    >
                      {line.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center arrow overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border-2"
            style={{
              borderColor: "hsl(var(--primary))",
              background: "hsl(var(--background))",
              animation: "divider-pulse 2s ease-in-out infinite",
            }}
          >
            <span
              className="text-xs font-bold"
              style={{ color: "hsl(var(--primary))", animation: "arrow-flow 1.5s ease-in-out infinite" }}
            >
              →
            </span>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="text-center">
            <span className="text-[18px] font-black text-destructive/70">0</span>
            <span className="text-[9px] block font-semibold text-muted-foreground/50 uppercase tracking-wider">protections</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground/30">→</div>
          <div className="text-center">
            <span className="text-[18px] font-black" style={{ color: "hsl(var(--neon-cyan))" }}>5</span>
            <span className="text-[9px] block font-semibold text-muted-foreground/50 uppercase tracking-wider">protections</span>
          </div>
        </div>
      </div>
    </>
  );
});
