/**
 * CMPSBL Logo Component
 * Uses high-color dark logo with transparent background
 * Restricted to navigation bar and footer
 */

import cmpsblLogo from "@/assets/cmpsbl-logo.webp";
import cmpsblLogoSm from "@/assets/cmpsbl-logo-sm.webp";
import { cn } from "@/lib/utils";

interface CmpsblLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
}

const sizeConfig = {
  sm: { className: "h-10", width: 40, height: 40 },
  md: { className: "h-12", width: 48, height: 48 },
  lg: { className: "h-16", width: 64, height: 64 },
  xl: { className: "h-24", width: 96, height: 96 },
};

export function CmpsblLogo({ className, iconOnly = false, size = "md", priority = false }: CmpsblLogoProps) {
  const { className: sizeClass, width, height } = sizeConfig[size];
  return (
    <img
      src={cmpsblLogo}
      alt="CMPSBL"
      width={width}
      height={height}
      sizes={`${width}px`}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...(priority ? { fetchpriority: "high" as const } : {})}
      className={cn(
        sizeClass,
        "w-auto object-contain",
        iconOnly && "aspect-square object-left object-cover",
        className
      )}
    />
  );
}
