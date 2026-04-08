/**
 * QuoteMarquee — Rolling quotes from internet pioneers
 * Non-dismissible. Infinite scroll marquee with CSS animation.
 */

import { useRef } from "react";

const QUOTES = [
  { text: "The Internet is becoming the town square for the global village of tomorrow.", author: "Bill Gates" },
  { text: "Information wants to be free.", author: "Stewart Brand" },
  { text: "The Web does not just connect machines, it connects people.", author: "Tim Berners-Lee" },
  { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "Mark Zuckerberg" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Software is eating the world.", author: "Marc Andreessen" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "We are all now connected by the Internet, like neurons in a giant brain.", author: "Stephen Hawking" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
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
            className="inline-flex items-center gap-1 mx-6 sm:mx-10 text-[11px] sm:text-xs text-white/90 font-medium shrink-0"
          >
            <span className="italic text-white/70">"{q.text}"</span>
            <span className="text-white font-bold ml-1">— {q.author}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
