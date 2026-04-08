/**
 * MagicalWrapVisual — "Enchanted Code" concept.
 * Magical glowing Layer 2 runes/symbols visually wrap around faded legacy host code.
 * Ethereal particle trails and orbiting sigils create a mystical attachment feel.
 * 
 * 100% CSS animations. DOM-based.
 */

import React, { memo } from "react";

const KEYFRAMES = `
@keyframes rune-orbit {
  0%   { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); opacity: 0.7; }
  50%  { opacity: 1; }
  100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); opacity: 0.7; }
}
@keyframes host-breathe {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.7; }
}
@keyframes wrap-glow {
  0%   { opacity: 0; filter: blur(8px); }
  40%  { opacity: 0.8; filter: blur(2px); }
  100% { opacity: 1; filter: blur(0px); }
}
@keyframes sigil-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.15); opacity: 1; }
}
@keyframes energy-flow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes fade-cascade {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const HOST_LINES = [
  "def authenticate(user, token):",
  "    if not verify(token):",
  "        raise AuthError('invalid')",
  "    session = create_session(user)",
  "    return session.id",
  "",
  "def process_payment(order):",
  "    charge = stripe.charge(order.total)",
  "    if charge.failed:",
  "        rollback(order)",
  "    return charge.receipt",
];

const RUNES = ["◇", "△", "⬡", "◈", "⟡", "✦"];

const WRAP_LINES = [
  { text: "⟨ DEFENSE gate: validate_boundary ⟩", delay: "1.8s" },
  { text: "⟨ GOVERNANCE: audit_mutation ⟩", delay: "2.6s" },
  { text: "⟨ BEACON: health_signal ⟩", delay: "3.4s" },
  { text: "⟨ WRAITH: obfuscate_literals ⟩", delay: "4.2s" },
  { text: "⟨ circuit_breaker: failsafe ⟩", delay: "5.0s" },
];

export const MagicalWrapVisual = memo(function MagicalWrapVisual() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="relative w-full max-w-xl mx-auto select-none">
        {/* Orbiting runes around the code block */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {RUNES.map((rune, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 text-sm font-bold"
              style={{
                ["--orbit-r" as string]: `${100 + i * 20}px`,
                color: `hsl(var(--neon-${i % 2 === 0 ? "purple" : "cyan"}))`,
                animation: `rune-orbit ${6 + i * 1.5}s linear infinite`,
                animationDelay: `${i * 0.8}s`,
                filter: `drop-shadow(0 0 6px hsl(var(--neon-${i % 2 === 0 ? "purple" : "cyan"}) / 0.5))`,
              }}
            >
              {rune}
            </div>
          ))}
        </div>

        {/* Main container */}
        <div className="relative rounded-xl overflow-hidden border border-border/30">
          {/* Energy gradient border */}
          <div
            className="absolute inset-0 rounded-xl z-10 pointer-events-none"
            style={{
              border: "2px solid transparent",
              background: "linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple))) border-box",
              backgroundSize: "100% 100%, 200% 200%",
              animation: "energy-flow 4s linear infinite",
            }}
          />

          {/* Host code — faded Layer 1 */}
          <div className="relative bg-background/90 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] font-mono font-semibold text-muted-foreground/40">
                legacy_host.py — Layer 1 (untouched)
              </span>
            </div>

            {HOST_LINES.map((line, i) => (
              <div
                key={i}
                className="font-mono text-[11px] sm:text-xs leading-[20px]"
                style={{ animation: "host-breathe 4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}
              >
                {line ? (
                  <span className="text-muted-foreground/40">{line}</span>
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            ))}
          </div>

          {/* Magical Layer 2 wrap lines */}
          <div className="relative bg-card/30 border-t border-border/20 px-4 sm:px-5 py-3">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2"
              style={{ color: "hsl(var(--neon-purple))", animation: "fade-cascade 0.8s ease-out both", animationDelay: "1.2s" }}
            >
              ✦ Layer 2 — Convex Core™ Attachment
            </span>
            {WRAP_LINES.map((w, i) => (
              <div
                key={i}
                className="font-mono text-[10px] sm:text-[11px] leading-[18px] font-semibold"
                style={{
                  color: `hsl(var(--neon-${i % 3 === 0 ? "magenta" : i % 3 === 1 ? "purple" : "cyan"}))`,
                  animation: `wrap-glow 0.8s ease-out both`,
                  animationDelay: w.delay,
                  textShadow: `0 0 8px hsl(var(--neon-${i % 3 === 0 ? "magenta" : i % 3 === 1 ? "purple" : "cyan"}) / 0.3)`,
                }}
              >
                {w.text}
              </div>
            ))}
          </div>
        </div>

        {/* SHA verification */}
        <div className="text-center mt-4" style={{ animation: "fade-cascade 0.8s ease-out both", animationDelay: "5.8s" }}>
          <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: "hsl(var(--neon-cyan))" }}>
            ✦ HOST INTEGRITY: SHA-256 MATCH ✦
          </span>
        </div>
      </div>
    </>
  );
});
