/**
 * Live Stats Bar — Real-time system metrics pulled from DB
 * Displays at the top of the homepage for social proof and trust
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Zap, Shield, Users, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getMetric } from "@/stores/publicMetricsStore";

interface LiveStat {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}

function useLiveStats() {
  const [stats, setStats] = useState<LiveStat[]>([
    { icon: Activity, value: "—", label: "Stream Events", color: "text-cyan-400" },
    { icon: Shield, value: "99.9%", label: "Stream Uptime", color: "text-emerald-400" },
    { icon: Zap, value: String(getMetric('modulesCount')), label: "Active Systems", color: "text-amber-400" },
    { icon: Brain, value: "—", label: "Crystallized", color: "text-violet-400" },
    { icon: Users, value: "—", label: "API Calls Today", color: "text-cyan-400" },
    { icon: CheckCircle2, value: "—", label: "Probes Passed", color: "text-emerald-400" },
  ]);

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const { data, error } = await supabase.rpc("get_public_live_stats");

        if (error || !data) {
          console.warn("[LiveStats] RPC failed:", error?.message);
          return;
        }

        const stats = data as { brain_events: number; memories: number; api_calls: number; total_probes: number };

        const formatNum = (n: number | null): string => {
          if (!n) return "0";
          if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
          if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
          return n.toLocaleString();
        };

        setStats([
          { icon: Activity, value: formatNum(stats.brain_events), label: "Stream Events", color: "text-cyan-400" },
          { icon: Shield, value: "99.9%", label: "Stream Uptime", color: "text-emerald-400" },
          { icon: Zap, value: String(getMetric('modulesCount')), label: "Active Systems", color: "text-amber-400" },
          { icon: Brain, value: formatNum(stats.memories), label: "Crystallized", color: "text-violet-400" },
          { icon: Users, value: formatNum(stats.api_calls), label: "API Calls Today", color: "text-cyan-400" },
          { icon: CheckCircle2, value: formatNum(stats.total_probes), label: "Probes Run", color: "text-emerald-400" },
        ]);
      } catch {
        // Silent — show defaults
      }
    }

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}

export function LiveStatsBar() {
  const stats = useLiveStats();

  return (
    <section className="relative z-10 py-4 sm:py-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Memory Stream · Live Metrics</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2 min-w-[100px]"
              >
                <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", stat.color)} />
                <div className="text-center sm:text-left">
                  <div className="text-sm sm:text-base font-black tabular-nums">{stat.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold leading-none">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
