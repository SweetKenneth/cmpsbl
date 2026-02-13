import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  onClick?: () => void;
  anchorId?: string;
};

export default function DecodeFloat({ onClick, anchorId = "decode-float-anchor" }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      id={anchorId}
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Decode — substrate voice"
      className={cn(
        "group cursor-pointer touch-manipulation",
        "w-[56px] h-[56px] rounded-full grid place-items-center",
        "active:scale-[0.95] transition-transform duration-150"
      )}
      style={{
        position: "fixed",
        right: "16px",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        zIndex: 9999,
      }}
    >
      {/* Outer glow aura */}
      <span
        className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-500"
        style={{
          background: "conic-gradient(from 0deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple)), hsl(var(--neon-amber)), hsl(var(--neon-green)), hsl(var(--neon-blue)), hsl(var(--neon-cyan)))",
          filter: "blur(10px)",
          animation: "decodeOrbSpin 6s linear infinite",
        }}
      />

      {/* Main orb body */}
      <span
        className="absolute inset-[3px] rounded-full"
        style={{
          background: "hsl(var(--background))",
          boxShadow: "inset 0 0 12px hsl(var(--neon-cyan) / 0.15)",
        }}
      />

      {/* Rotating neon ring border */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 56 56"
        fill="none"
        style={{ animation: "decodeOrbSpin 6s linear infinite" }}
      >
        <defs>
          <linearGradient id="decode-ring-grad" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
            <stop offset="25%" stopColor="hsl(var(--neon-magenta))" />
            <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
            <stop offset="75%" stopColor="hsl(var(--neon-amber))" />
            <stop offset="100%" stopColor="hsl(var(--neon-green))" />
          </linearGradient>
        </defs>
        <circle
          cx="28" cy="28" r="25.5"
          stroke="url(#decode-ring-grad)"
          strokeWidth="2"
          strokeDasharray="6 3"
          fill="none"
        />
      </svg>

      {/* Bio-evolutionary circular arrows (organism style) */}
      <svg
        className="absolute w-[34px] h-[34px]"
        viewBox="0 0 34 34"
        fill="none"
        style={{ animation: "decodeOrbSpin 8s linear infinite reverse" }}
      >
        <defs>
          <linearGradient id="decode-arrow-grad-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
            <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
          </linearGradient>
          <linearGradient id="decode-arrow-grad-2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--neon-magenta))" />
            <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
          </linearGradient>
          <linearGradient id="decode-arrow-grad-3" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--neon-green))" />
            <stop offset="100%" stopColor="hsl(var(--neon-amber))" />
          </linearGradient>
        </defs>

        {/* Arc 1 — top-right (cyan→blue) with arrowhead */}
        <path
          d="M 17 4 A 13 13 0 0 1 29 13"
          stroke="url(#decode-arrow-grad-1)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <polygon
          points="29,13 26,10.5 27.5,14.5"
          fill="hsl(var(--neon-blue))"
        />

        {/* Arc 2 — bottom-right (magenta→purple) with arrowhead */}
        <path
          d="M 29 21 A 13 13 0 0 1 17 30"
          stroke="url(#decode-arrow-grad-2)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <polygon
          points="17,30 20,27.5 18.5,31.5"
          fill="hsl(var(--neon-purple))"
        />

        {/* Arc 3 — left (green→amber) with arrowhead */}
        <path
          d="M 5 17 A 13 13 0 0 1 14 5"
          stroke="url(#decode-arrow-grad-3)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <polygon
          points="14,5 11.5,8 15.5,6.5"
          fill="hsl(var(--neon-amber))"
        />
      </svg>

      {/* Center nucleus dot */}
      <span
        className="relative w-2 h-2 rounded-full"
        style={{
          background: "conic-gradient(from 120deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-green)), hsl(var(--neon-cyan)))",
          boxShadow: "0 0 8px hsl(var(--neon-cyan) / 0.7), 0 0 16px hsl(var(--neon-magenta) / 0.4)",
          animation: "decodeNucleusPulse 2.5s ease-in-out infinite",
        }}
      />
    </button>
  );
}
