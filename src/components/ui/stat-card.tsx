import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "glass glass-hover p-6 rounded-xl animate-fade-in",
        "transition-all duration-300 relative",
        className
      )}
    >
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-6 h-6 text-primary animate-glow" />
        </div>
        {trend && (
          <div
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="relative z-10 space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold glow-text">{value}</p>
      </div>
    </div>
  );
}
