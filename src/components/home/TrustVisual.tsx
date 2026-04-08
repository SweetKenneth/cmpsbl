/**
 * TrustVisual — Full-bleed cinematic image break between homepage sections.
 * Adds visual trust and breaks up text-heavy content.
 */

import { cn } from "@/lib/utils";

interface TrustVisualProps {
  src: string;
  alt: string;
  caption?: string;
  date?: string;
  className?: string;
}

export function TrustVisual({ src, alt, caption, date, className }: TrustVisualProps) {
  return (
    <div className={cn("relative w-full max-w-5xl mx-auto px-3 sm:px-4", className)}>
      <div className="relative rounded-2xl overflow-hidden border border-border/20 shadow-2xl shadow-primary/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10 pointer-events-none" />
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1920}
          height={768}
          className="w-full h-auto object-cover"
        />
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-3 pt-6 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-xs sm:text-sm font-bold text-white text-center">
              {caption}
              {date && (
                <span className="text-white/80 font-bold ml-2">— {date}</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
