import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
  loading?: boolean;
  children: React.ReactNode;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon: Icon, variant = "primary", loading = false, children, className = "", ...props }, ref) => {
    const variantStyles = {
      primary: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl glow-primary",
      secondary: "bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground",
      success: "bg-gradient-to-r from-neon-green to-neon-green hover:from-neon-green hover:to-neon-green text-white shadow-lg",
      warning: "bg-gradient-to-r from-neon-amber to-neon-amber hover:from-neon-amber hover:to-yellow-700 text-white shadow-lg",
      danger: "bg-gradient-to-r from-destructive to-destructive hover:from-destructive hover:to-destructive text-white shadow-lg",
      ghost: "hover:bg-muted/50",
    };

    return (
      <Button
        ref={ref}
        className={`transition-all duration-300 hover:scale-105 active:scale-95 ${variantStyles[variant]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          Icon && <Icon className="w-4 h-4 mr-2" />
        )}
        {children}
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";
