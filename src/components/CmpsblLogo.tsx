/**
 * CMPSBL Logo Component
 * Uses high-color dark logo with transparent background
 * Restricted to navigation bar and footer
 */

import cmpsblLogo from "@/assets/cmpsbl-logo.png";
import { cn } from "@/lib/utils";

interface CmpsblLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-10",
  md: "h-12",
  lg: "h-16",
  xl: "h-24",
};

export function CmpsblLogo({ className, iconOnly = false, size = "md" }: CmpsblLogoProps) {
  return (
    <img
      src={cmpsblLogo}
      alt="CMPSBL By PromptFluid"
      className={cn(
        sizeClasses[size],
        "w-auto object-contain",
        iconOnly && "aspect-square object-left object-cover",
        className
      )}
    />
  );
}
