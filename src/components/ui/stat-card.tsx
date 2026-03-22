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
        "transition-all duration-500 relative overflow-hidden",
        "glass-edge shimmer-on-hover stat-card-glow",
        className
      )}
    >
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 transition-colors duration-300 group-hover:bg-primary/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              "text-sm font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive 
                ? "text-neon-green bg-neon-green/10" 
                : "text-destructive bg-destructive/10"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="relative z-10 space-y-1.5">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold tracking-tight glow-text">{value}</p>
      </div>
    </div>
  );
}
