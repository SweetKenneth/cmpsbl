import { HTMLAttributes, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AccessibleCardProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
}

export const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({ label, description, className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        role="region"
        aria-label={label}
        aria-describedby={description ? `${label}-desc` : undefined}
        className={cn(
          "glass-panel focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300",
          className
        )}
        tabIndex={0}
        {...props}
      >
        {description && (
          <span id={`${label}-desc`} className="sr-only">
            {description}
          </span>
        )}
        {children}
      </Card>
    );
  }
);

AccessibleCard.displayName = "AccessibleCard";
