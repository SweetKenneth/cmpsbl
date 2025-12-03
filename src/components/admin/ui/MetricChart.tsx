import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MetricChartProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function MetricChart({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  className = "",
}: MetricChartProps) {
  return (
    <Card className={`glass-card border border-border/50 overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>

        <div className="relative">
          {children}
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
}
