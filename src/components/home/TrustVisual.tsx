/**
 * TrustVisual — Full-bleed cinematic image break between homepage sections.
 * Adds visual trust and breaks up text-heavy content.
 */

import { cn } from "@/lib/utils";

interface TrustVisualProps {
  src: string;
  alt: string;
  className?: string;
}

export function TrustVisual({ src, alt, className }: TrustVisualProps) {
  return (
    <div className={cn("relative w-full max-w-5xl mx-auto px-3 sm:px-4", className)}>
      <div className="relative rounded-2xl overflow-hidden border border-border/20 shadow-2xl shadow-primary/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30 z-10 pointer-events-none" />
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1920}
          height={768}
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
