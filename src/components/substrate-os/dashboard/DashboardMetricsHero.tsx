/**
 * Dashboard Metrics Hero v8.0.0 SYNERGY+ - Premium system overview
 * Large health ring with gradient accents - 14 Modules, 5 Layers
 */

import { Activity, Cpu, Zap, Brain, Shield, Eye, Moon, Radio, Key, Sparkles, Plug, Settings, Layers, GitBranch, Accessibility, RefreshCw } from 'lucide-react';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const MODULES_CONFIG = [
  { id: 'core', label: 'Core', icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-500', hsl: 'hsl(25, 95%, 53%)' },
  { id: 'ripple', label: 'Ripple', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500', hsl: 'hsl(188, 86%, 53%)' },
  { id: 'access', label: 'Access', icon: Key, color: 'text-amber-400', bg: 'bg-amber-500', hsl: 'hsl(38, 92%, 50%)' },
  { id: 'brain', label: 'Brain', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500', hsl: 'hsl(270, 67%, 58%)' },
  { id: 'decode', label: 'Decode', icon: Activity, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500', hsl: 'hsl(292, 84%, 61%)' },
  { id: 'nexus', label: 'Nexus', icon: Zap, color: 'text-green-400', bg: 'bg-green-500', hsl: 'hsl(142, 76%, 42%)' },
  { id: 'defense', label: 'Defense', icon: Shield, color: 'text-red-400', bg: 'bg-red-500', hsl: 'hsl(0, 84%, 60%)' },
  { id: 'vision', label: 'Vision', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500', hsl: 'hsl(217, 91%, 60%)' },
  { id: 'dream', label: 'Dream', icon: Moon, color: 'text-violet-400', bg: 'bg-violet-500', hsl: 'hsl(258, 90%, 66%)' },
  { id: 'system', label: 'System', icon: Settings, color: 'text-emerald-400', bg: 'bg-emerald-500', hsl: 'hsl(160, 84%, 39%)' },
  { id: 'modernizer', label: 'Modernizer', icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-500', hsl: 'hsl(350, 89%, 60%)' },
  { id: 'integration', label: 'Integration', icon: Plug, color: 'text-teal-400', bg: 'bg-teal-500', hsl: 'hsl(173, 80%, 40%)' },
  { id: 'cortex', label: 'Cortex', icon: GitBranch, color: 'text-indigo-400', bg: 'bg-indigo-500', hsl: 'hsl(239, 84%, 67%)' },
  { id: 'inclusive', label: 'Inclusive', icon: Accessibility, color: 'text-pink-400', bg: 'bg-pink-500', hsl: 'hsl(330, 81%, 60%)' },
];

export function DashboardMetricsHero() {
  const healthScore = useSubstrateHealthScore();
  
  const circumference = 2 * Math.PI * 85;
  const progress = (healthScore.healthScore / 100) * circumference;
  const activeCount = healthScore.activeCount;
  const totalModules = healthScore.totalModules;

  return (
    <motion.div 
      className="relative p-6 lg:p-8 rounded-3xl border border-border/40 bg-gradient-to-br from-card/90 via-card/50 to-transparent backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-[100px]"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Health Ring */}
        <div className="relative flex-shrink-0">
          <svg className="w-52 h-52 -rotate-90" viewBox="0 0 200 200">
            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border/20"
            />
            {/* Inner decorative ring */}
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/10"
              strokeDasharray="4 8"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={healthScore.isHealthy ? "#10b981" : healthScore.isDegraded ? "#f59e0b" : "#ef4444"} />
                <stop offset="50%" stopColor={healthScore.isHealthy ? "#22d3ee" : healthScore.isDegraded ? "#fbbf24" : "#fb7185"} />
                <stop offset="100%" stopColor={healthScore.isHealthy ? "#06b6d4" : healthScore.isDegraded ? "#f97316" : "#f43f5e"} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
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
              filter="url(#glow)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className={cn(
                "text-6xl font-black font-mono tracking-tight",
                healthScore.isHealthy ? "text-emerald-400" : 
                healthScore.isDegraded ? "text-amber-400" : "text-red-400"
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {healthScore.healthScore}
            </motion.span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.3em] mt-1">
              SYSTEM HEALTH
            </span>
          </div>

          {/* Outer glow ring */}
          <motion.div 
            className={cn(
              "absolute inset-2 rounded-full blur-2xl opacity-40 -z-10",
              healthScore.isHealthy ? "bg-emerald-500" : 
              healthScore.isDegraded ? "bg-amber-500" : "bg-red-500"
            )}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Spinning decoration */}
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-current/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Stats & Module Grid */}
        <div className="flex-1 space-y-6 w-full">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
              whileHover={{ y: -2 }}
            >
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block mb-1">MODULES</span>
              <span className="text-2xl font-bold text-foreground">{activeCount}<span className="text-muted-foreground/60 text-lg">/{totalModules}</span></span>
            </motion.div>
            <motion.div 
              className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/30 hover:border-fuchsia-500/50 transition-colors"
              whileHover={{ y: -2 }}
            >
              <span className="text-[10px] text-fuchsia-400 font-mono uppercase tracking-wider block mb-1">STATUS</span>
              <span className={cn(
                "text-lg font-bold uppercase",
                healthScore.isHealthy ? "text-emerald-400" : 
                healthScore.isDegraded ? "text-amber-400" : "text-red-400"
              )}>
                {healthScore.isHealthy ? "OPTIMAL" : healthScore.isDegraded ? "DEGRADED" : "CRITICAL"}
              </span>
            </motion.div>
            <motion.div 
              className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 hover:border-amber-500/50 transition-colors"
              whileHover={{ y: -2 }}
            >
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block mb-1">SUBSTRATE</span>
              <span className="text-lg font-bold text-foreground font-mono">v7.5.3</span>
            </motion.div>
          </div>

          {/* Module Mini Grid - 14 modules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Module Status</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px]"
                onClick={() => healthScore.refetch()}
                disabled={healthScore.isLoading}
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", healthScore.isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
            <TooltipProvider delayDuration={100}>
              <div className="grid grid-cols-7 lg:grid-cols-14 gap-2">
                {MODULES_CONFIG.map((module, idx) => {
                  const ModIcon = module.icon;
                  const isActive = healthScore.modules[module.id as keyof typeof healthScore.modules];
                  
                  return (
                    <Tooltip key={module.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={cn(
                            "relative w-full aspect-square rounded-xl flex items-center justify-center border transition-all cursor-pointer",
                            "hover:scale-110 hover:shadow-lg hover:z-10",
                            isActive 
                              ? cn("border-current/40 bg-current/10", module.color)
                              : "border-border/30 bg-muted/10 opacity-50"
                          )}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + idx * 0.03, type: "spring", stiffness: 300 }}
                          whileHover={{ y: -4 }}
                          style={isActive ? { boxShadow: `0 0 20px ${module.hsl}30` } : undefined}
                        >
                          <ModIcon className={cn("w-4 h-4", isActive ? module.color : "text-muted-foreground/50")} />
                          <motion.span 
                            className={cn(
                              "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                              isActive ? "bg-emerald-500" : "bg-red-500/60"
                            )}
                            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p className="font-medium">{module.label}</p>
                        <p className={cn("text-[10px]", isActive ? "text-emerald-400" : "text-red-400")}>
                          {isActive ? "Online" : "Offline"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] text-muted-foreground font-mono">LIVE TELEMETRY</span>
            </div>
            <div className="h-3 w-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground font-mono">
              Last sync: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
