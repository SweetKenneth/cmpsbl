/**
 * CMPSBL Wordmark — Interlocking block letters with individual flowing gradients
 * Each letter has its own gradient animation, offset timing, and slight vertical
 * displacement to create a "snapped together" puzzle-piece effect.
 */

import { cn } from "@/lib/utils";

const LETTERS: { char: string; colors: string; delay: number }[] = [
  { char: "C", colors: "hsl(var(--neon-cyan)), hsl(var(--primary)), hsl(var(--neon-cyan))", delay: 0 },
  { char: "M", colors: "hsl(var(--primary)), hsl(var(--neon-purple)), hsl(var(--primary))", delay: 0.8 },
  { char: "P", colors: "hsl(var(--neon-purple)), hsl(var(--neon-magenta)), hsl(var(--neon-purple))", delay: 1.6 },
  { char: "S", colors: "hsl(var(--neon-magenta)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta))", delay: 2.4 },
  { char: "B", colors: "hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-cyan))", delay: 3.2 },
  { char: "L", colors: "hsl(var(--primary)), hsl(var(--neon-magenta)), hsl(var(--primary))", delay: 4.0 },
];

// Alternating Y offsets for the puzzle snap effect
const Y_OFFSETS = [2, -3, 2, -2, 3, -2];

export function CmpsblWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-baseline select-none", className)}
      aria-label="CMPSBL"
      role="img"
      style={{
        animation: "cmpsblPulseGlow 3s ease-in-out infinite",
      }}
    >
      {LETTERS.map((l, i) => (
        <span
          key={l.char}
          className="inline-block font-black leading-none transition-transform duration-500"
          style={{
            marginLeft: i > 0 ? "-0.015em" : undefined,
            transform: `translateY(${Y_OFFSETS[i]}px)`,
            backgroundImage: `linear-gradient(135deg, ${l.colors})`,
            backgroundSize: "200% 200%",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            animation: `cmpsblLetterFlow 5s ease-in-out infinite`,
            animationDelay: `${l.delay}s`,
          }}
        >
          {l.char}
        </span>
      ))}
    </span>
  );
}
