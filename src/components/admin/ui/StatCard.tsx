import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
  loading = false,
  className = "",
  children,
}: StatCardProps) {
  const variantStyles = {
    default: "from-card to-card/80",
    primary: "from-primary/10 to-primary/5 border-primary/20",
    success: "from-green-500/10 to-green-500/5 border-green-500/20",
    warning: "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20",
    danger: "from-red-500/10 to-red-500/5 border-red-500/20",
  };

  const iconVariantStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary/20 text-primary",
    success: "bg-green-500/20 text-green-500",
    warning: "bg-yellow-500/20 text-yellow-500",
    danger: "bg-red-500/20 text-red-500",
  };

  return (
    <Card
      className={`glass-card border relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${variantStyles[variant]} ${className}`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconVariantStyles[variant]} transition-transform group-hover:scale-110 duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-muted/50 rounded animate-shimmer" />
            <div className="h-4 w-16 bg-muted/30 rounded animate-shimmer" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold tracking-tight animate-data-change">
                {value}
              </h3>
            </div>

            {change && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    change.trend === "up"
                      ? "bg-green-500/20 text-green-500"
                      : change.trend === "down"
                      ? "bg-red-500/20 text-red-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {change.value}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}

            {children && <div className="mt-4">{children}</div>}
          </>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
}
