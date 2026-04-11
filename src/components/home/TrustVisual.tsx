/**
 * TrustVisual — Full-bleed cinematic image break between homepage sections.
 * Adds visual trust and breaks up text-heavy content.
 * 
 * PERFORMANCE: Uses CSS animations + IntersectionObserver instead of framer-motion
 * to avoid pulling ~60KB framer-motion into the home page critical path.
 */

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface TrustVisualProps {
  src: string;
  alt: string;
  caption?: string;
  date?: string;
  className?: string;
}

export function TrustVisual({ src, alt, caption, date, className }: TrustVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-60px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full max-w-5xl mx-auto px-3 sm:px-4 transition-all duration-700 ease-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]",
        className
      )}
    >
      <div className="relative rounded-2xl overflow-hidden border border-border/20 shadow-2xl shadow-primary/[0.06] group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10 pointer-events-none" />
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1920}
          height={768}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 pb-4 pt-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="flex items-end justify-between gap-3">
              <p className="text-xs sm:text-sm font-bold text-white leading-snug tracking-wide">
                {caption}
              </p>
              {date && (
                <span className="text-[10px] sm:text-xs text-white/70 font-mono font-bold shrink-0 tabular-nums">
                  {date}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
