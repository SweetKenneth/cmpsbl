/**
 * InvestorLiveStats — animated stat cards pulling real database numbers
 */
import { motion } from "framer-motion";
import { useInvestorStats } from "@/hooks/useInvestorStats";
import { Brain, Shield, Zap, Eye, Activity, Cpu, Globe, Code2 } from "lucide-react";
import { useEffect, useState } from "react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [target]);
  return <>{value.toLocaleString()}{suffix}</>;
}

const STAT_CONFIG = [
  { key: "totalDiscoveries", label: "Discoveries", icon: Brain, color: "text-primary" },
  { key: "crownJewels", label: "Crown Jewels", icon: Zap, color: "text-[hsl(var(--neon-amber))]" },
  { key: "evolutionProposals", label: "Evolution Patches", icon: Activity, color: "text-[hsl(var(--neon-cyan))]" },
  { key: "defenseEvents", label: "Defense Events", icon: Shield, color: "text-[hsl(var(--neon-magenta))]" },
  { key: "dreamCycles", label: "Dream Cycles", icon: Eye, color: "text-[hsl(var(--neon-purple))]" },
  { key: "primitives", label: "Primitives", icon: Cpu, color: "text-primary" },
  { key: "verticals", label: "Industry Verticals", icon: Globe, color: "text-[hsl(var(--neon-green))]" },
  { key: "providersOnline", label: "AI Providers", icon: Code2, color: "text-[hsl(var(--neon-cyan))]" },
] as const;

export function InvestorLiveStats({ compact = false }: { compact?: boolean }) {
  const { data: stats, isLoading } = useInvestorStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/20 bg-card/40 p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const visibleStats = compact ? STAT_CONFIG.slice(0, 4) : STAT_CONFIG;

  return (
    <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} gap-3`}>
      {visibleStats.map(({ key, label, icon: Icon, color }, i) => {
        const val = stats[key as keyof typeof stats];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <p className="text-xl font-black text-foreground tabular-nums">
              {typeof val === "number" ? <AnimatedNumber target={val} /> : val}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
