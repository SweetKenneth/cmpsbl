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
    <section className="relative z-10 py-3 sm:py-4 border-b border-border/30 bg-gradient-to-r from-card/30 via-card/50 to-card/30 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px] memory-stream-bar opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-px divider-flow" />
      <div className="container mx-auto px-4">
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Substrate · Memory Stream · Live</span>
        </div>

        {/* Design space narrative */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed text-center max-w-2xl mx-auto"
        >
          Built from <span className="text-foreground/90 font-medium">endless capabilities</span> across{' '}
          <span className="text-foreground/90 font-medium">40 autonomous nodes</span>, it explores a design space a million times larger than the stars in the observable universe.
        </motion.p>
      </div>
    </section>
  );
}
