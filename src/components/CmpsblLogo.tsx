/**
 * CMPSBL Logo Component
 * Theme-aware logo with dark/light variants
 */

import { useTheme } from "next-themes";
import logoDark from "@/assets/cmpsbl-logo-dark.png";
import logoLight from "@/assets/cmpsbl-logo-light.png";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark logo during SSR/initial render to prevent flash
  const logoSrc = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  return (
    <img
      src={logoSrc}
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
