/**
 * CMPSBL Logo Component
 * Uses dark version (richer colors) - works on all backgrounds
 */

import logoDark from "@/assets/cmpsbl-logo-dark.png";
import { cn } from "@/lib/utils";

interface CmpsblLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
  xl: "h-20",
};

export function CmpsblLogo({ className, iconOnly = false, size = "md" }: CmpsblLogoProps) {
  return (
    <img
      src={logoDark}
      alt="CMPSBL By PromptFluid"
      className={cn(
        sizeClasses[size],
        "w-auto object-contain",
        iconOnly && "aspect-square object-left",
        className
      )}
    />
  );
}
