import { cn } from "@/lib/utils";
import { Cpu } from "lucide-react";

interface SubstrateClassBadgeProps {
  primitiveName: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Substrate-Class Badge — marks store products that are
 * derived from canonical substrate primitives.
 * 
 * These products share capabilities inspired by the named
 * primitive but are consumer-grade — not the full primitive.
 */
export function SubstrateClassBadge({
  primitiveName,
  className,
  size = "sm",
}: SubstrateClassBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border",
        "bg-primary/10 border-primary/25 text-primary",
        "font-semibold tracking-wide uppercase",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        className
      )}
      title={`Modeled after the ${primitiveName} substrate primitive`}
    >
      <Cpu className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>Substrate-Class</span>
    </div>
  );
}
