/**
 * QuoteMarquee — Rolling quotes from internet pioneers
 * Non-dismissible. Infinite scroll marquee with CSS animation.
 */

import { useRef } from "react";

const QUOTES = [
  { text: "Information wants to be free.", author: "Stewart Brand" },
  { text: "The Web connects people.", author: "Tim Berners-Lee" },
  { text: "Move fast and break things.", author: "Mark Zuckerberg" },
  { text: "Predict the future — invent it.", author: "Alan Kay" },
  { text: "Software is eating the world.", author: "Marc Andreessen" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Connected like neurons.", author: "Stephen Hawking" },
  { text: "Technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "The network is the computer.", author: "John Gage" },
  { text: "Code is law.", author: "Lawrence Lessig" },
] as const;

// Duplicate for seamless loop
const ITEMS = [...QUOTES, ...QUOTES];

export function NpmAnnouncementBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10001] overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))",
      }}
    >
      <div ref={containerRef} className="flex whitespace-nowrap animate-marquee py-1.5">
        {ITEMS.map((q, i) => (
          <span
            key={`${q.author}-${i}`}
            className="inline-flex items-center gap-1.5 mx-8 sm:mx-12 text-xs sm:text-sm text-white/90 font-semibold shrink-0"
          >
            <span className="italic text-white/80">"{q.text}"</span>
            <span className="text-white font-bold ml-1">— {q.author}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
