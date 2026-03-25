import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: "active" | "inactive" | "warning";
  children?: React.ReactNode;
  className?: string;
}

export function ModuleCard({
  title,
  description,
  icon: Icon,
  status = "active",
  children,
  className,
}: ModuleCardProps) {
  const statusColors = {
    active: "bg-neon-green/20 text-neon-green border-neon-green/30",
    inactive: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
    warning: "bg-neon-amber/20 text-neon-amber border-neon-amber/30",
  };

  return (
    <div
      className={cn(
        "glass glass-hover p-6 rounded-xl animate-slide-up",
        "group relative overflow-hidden",
        "glass-edge shimmer-on-hover card-lift",
        className
      )}
    >
      {/* Gradient background sweep on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
              <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300",
              statusColors[status],
              status === "active" && "animate-live-pulse"
            )}
          >
            {status}
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
