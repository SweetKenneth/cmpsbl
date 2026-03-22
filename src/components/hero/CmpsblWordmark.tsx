/**
 * CMPSBL Wordmark — Puzzle-piece letters with individual flowing gradients
 * Each letter appears to snap together like interlocking blocks
 */

import { cn } from "@/lib/utils";

const LETTERS = [
  { char: "C", gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--primary))]", delay: "0s" },
  { char: "M", gradient: "from-[hsl(var(--primary))] to-[hsl(var(--neon-purple))]", delay: "1s" },
  { char: "P", gradient: "from-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]", delay: "2s" },
  { char: "S", gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-cyan))]", delay: "3s" },
  { char: "B", gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))]", delay: "4s" },
  { char: "L", gradient: "from-[hsl(var(--primary))] to-[hsl(var(--neon-magenta))]", delay: "5s" },
];

export function CmpsblWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-end select-none", className)}
      aria-label="CMPSBL"
    >
      {LETTERS.map((l, i) => (
        <span
          key={i}
          className={cn(
            "relative inline-block font-black leading-none",
            // Negative margin to snap letters together like puzzle pieces
            i > 0 && "-ml-[0.02em]",
          )}
          style={{
            // Slight vertical offsets for puzzle-piece feel
            transform: i % 2 === 1 ? "translateY(-0.03em)" : "translateY(0.03em)",
          }}
        >
          {/* The gradient letter */}
          <span
            className="inline-block bg-gradient-to-br bg-[length:200%_200%] animate-[wordmarkShift_6s_ease-in-out_infinite] bg-clip-text text-transparent"
            style={{
              animationDelay: l.delay,
              backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to), var(--tw-gradient-from))`,
            }}
          >
            {/* Use Tailwind gradient utilities via className */}
            <span className={cn("bg-gradient-to-br bg-clip-text text-transparent bg-[length:200%_200%] animate-[wordmarkShift_6s_ease-in-out_infinite]", l.gradient)}
              style={{ animationDelay: l.delay }}
            >
              {l.char}
            </span>
          </span>

          {/* Subtle connector notch between letters */}
          {i < LETTERS.length - 1 && (
            <span
              className="absolute right-[-0.04em] top-1/2 -translate-y-1/2 w-[0.08em] h-[0.25em] rounded-full bg-primary/10"
              aria-hidden="true"
            />
          )}
        </span>
      ))}
    </span>
  );
}
