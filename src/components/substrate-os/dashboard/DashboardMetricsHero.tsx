/**
 * Dashboard Metrics Hero v5.5.0 - Premium system overview
 * Large health ring with gradient accents
 */

import { Activity, Cpu, Zap, Brain, Shield, Eye, Moon, Radio, Key, Sparkles, Plug, Settings, Layers } from 'lucide-react';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MODULES_CONFIG = [
  { id: 'core', icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-500' },
  { id: 'ripple', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500' },
  { id: 'access', icon: Key, color: 'text-amber-400', bg: 'bg-amber-500' },
  { id: 'brain', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500' },
  { id: 'decode', icon: Activity, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500' },
  { id: 'nexus', icon: Zap, color: 'text-green-400', bg: 'bg-green-500' },
  { id: 'defense', icon: Shield, color: 'text-red-400', bg: 'bg-red-500' },
  { id: 'vision', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500' },
  { id: 'dream', icon: Moon, color: 'text-violet-400', bg: 'bg-violet-500' },
  { id: 'system', icon: Settings, color: 'text-emerald-400', bg: 'bg-emerald-500' },
  { id: 'modernizer', icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-500' },
  { id: 'integration', icon: Plug, color: 'text-teal-400', bg: 'bg-teal-500' },
];

export function DashboardMetricsHero() {
  const healthScore = useSubstrateHealthScore();
  
  const circumference = 2 * Math.PI * 85;
  const progress = (healthScore.healthScore / 100) * circumference;
  const activeCount = healthScore.activeCount;
  const totalModules = healthScore.totalModules;

  return (
    <motion.div 
      className="relative p-6 rounded-3xl border border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-transparent backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Gradient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative flex flex-col lg:flex-row items-center gap-8">
        {/* Health Ring */}
        <div className="relative flex-shrink-0">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-border/30"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={healthScore.isHealthy ? "#10b981" : healthScore.isDegraded ? "#f59e0b" : "#ef4444"} />
                <stop offset="100%" stopColor={healthScore.isHealthy ? "#06b6d4" : healthScore.isDegraded ? "#f97316" : "#f43f5e"} />
              </linearGradient>
            </defs>
            {/* Progress arc */}
            <motion.circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#healthGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className={cn(
                "text-5xl font-black font-mono",
                healthScore.isHealthy ? "text-emerald-400" : 
                healthScore.isDegraded ? "text-amber-400" : "text-red-400"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {healthScore.healthScore}
            </motion.span>
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              HEALTH
            </span>
          </div>

          {/* Outer glow */}
          <div className={cn(
            "absolute inset-0 rounded-full blur-2xl opacity-30 -z-10",
            healthScore.isHealthy ? "bg-emerald-500" : 
            healthScore.isDegraded ? "bg-amber-500" : "bg-red-500"
          )} />
        </div>

        {/* Stats & Module Grid */}
        <div className="flex-1 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block mb-1">ACTIVE</span>
              <span className="text-2xl font-bold text-foreground">{activeCount}<span className="text-muted-foreground/60">/{totalModules}</span></span>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/30">
              <span className="text-[10px] text-fuchsia-400 font-mono uppercase tracking-wider block mb-1">STATUS</span>
              <span className={cn(
                "text-lg font-bold uppercase",
                healthScore.isHealthy ? "text-emerald-400" : 
                healthScore.isDegraded ? "text-amber-400" : "text-red-400"
              )}>
                {healthScore.isHealthy ? "OPTIMAL" : healthScore.isDegraded ? "DEGRADED" : "CRITICAL"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block mb-1">VERSION</span>
              <span className="text-lg font-bold text-foreground font-mono">v5.5.0</span>
            </div>
          </div>

          {/* Module Mini Grid */}
          <div className="grid grid-cols-6 lg:grid-cols-12 gap-2">
            {MODULES_CONFIG.map((module, idx) => {
              const ModIcon = module.icon;
              const isActive = healthScore.modules[module.id as keyof typeof healthScore.modules];
              
              return (
                <motion.div
                  key={module.id}
                  className={cn(
                    "relative w-full aspect-square rounded-lg flex items-center justify-center border transition-all",
                    isActive 
                      ? cn("border-current/40 bg-current/10", module.color)
                      : "border-border/30 bg-muted/10"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.02 }}
                  title={module.id.toUpperCase()}
                >
                  <ModIcon className={cn("w-4 h-4", isActive ? module.color : "text-muted-foreground/50")} />
                  <span className={cn(
                    "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                    isActive ? "bg-emerald-500" : "bg-red-500/60"
                  )} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
