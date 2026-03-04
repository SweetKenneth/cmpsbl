/**
 * Dashboard Metrics Hero — Cinematic system overview
 * Orbital health ring, floating surface constellation, real-time telemetry
 */

import { Activity, Cpu, Zap, Brain, Shield, Eye, Moon, Radio, Key, Sparkles, Plug, Settings, Layers, GitBranch, Accessibility, RefreshCw, Database, Send, ClipboardCheck, Fingerprint, DollarSign, Box, Code, Globe } from 'lucide-react';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useMetric } from '@/stores/publicMetricsStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

/** 38 Matrix Nodes across 12 sectors */
const MODULES_CONFIG = [
  // CORE + SYSTEM
  { id: 'core', label: 'CORE', icon: Cpu, color: 'text-orange-400', hsl: '25, 95%, 53%' },
  { id: 'system', label: 'SYSTEM', icon: Settings, color: 'text-emerald-400', hsl: '160, 84%, 39%' },
  // CCR — Clockless Cognitive Reality
  { id: 'brain', label: 'BRAIN', icon: Brain, color: 'text-purple-400', hsl: '270, 67%, 58%' },
  { id: 'memory', label: 'MEMORY', icon: Database, color: 'text-cyan-300', hsl: '187, 92%, 69%' },
  { id: 'dream', label: 'DREAM', icon: Moon, color: 'text-violet-400', hsl: '258, 90%, 66%' },
  // OCG — Operational Compliance Grid (6 nodes)
  { id: 'ripple', label: 'RIPPLE', icon: Radio, color: 'text-cyan-400', hsl: '188, 86%, 53%' },
  { id: 'access', label: 'ACCESS', icon: Key, color: 'text-amber-400', hsl: '38, 92%, 50%' },
  { id: 'identity', label: 'IDENTITY', icon: Fingerprint, color: 'text-emerald-300', hsl: '160, 84%, 60%' },
  { id: 'relay', label: 'RELAY', icon: Send, color: 'text-amber-300', hsl: '45, 93%, 58%' },
  { id: 'audit', label: 'AUDIT', icon: ClipboardCheck, color: 'text-slate-400', hsl: '215, 16%, 47%' },
  { id: 'nerve', label: 'NERVE', icon: Zap, color: 'text-sky-300', hsl: '199, 89%, 68%' },
  // Execution (10 nodes)
  { id: 'decode', label: 'DECODE', icon: Activity, color: 'text-fuchsia-400', hsl: '292, 84%, 61%' },
  { id: 'encode', label: 'ENCODE', icon: Code, color: 'text-lime-400', hsl: '84, 81%, 44%' },
  { id: 'vision', label: 'VISION', icon: Eye, color: 'text-blue-400', hsl: '217, 91%, 60%' },
  { id: 'cortex', label: 'CORTEX', icon: GitBranch, color: 'text-indigo-400', hsl: '239, 84%, 67%' },
  { id: 'nexus', label: 'NEXUS', icon: Zap, color: 'text-green-400', hsl: '142, 76%, 42%' },
  { id: 'economy', label: 'ECONOMY', icon: DollarSign, color: 'text-yellow-400', hsl: '48, 96%, 53%' },
  { id: 'sandbox', label: 'SANDBOX', icon: Box, color: 'text-violet-300', hsl: '258, 90%, 72%' },
  { id: 'inclusive', label: 'INCLUSIVE', icon: Accessibility, color: 'text-pink-400', hsl: '330, 81%, 60%' },
  { id: 'medic', label: 'MEDIC', icon: Activity, color: 'text-rose-300', hsl: '350, 80%, 70%' },
  { id: 'integration', label: 'INTEGRATION', icon: Plug, color: 'text-teal-400', hsl: '173, 80%, 40%' },
  // ESZ — Expansion Sovereignty Zone
  { id: 'sovereign', label: 'SOVEREIGN', icon: Globe, color: 'text-orange-300', hsl: '25, 95%, 63%' },
  { id: 'oracle', label: 'ORACLE', icon: Eye, color: 'text-amber-300', hsl: '38, 92%, 60%' },
  { id: 'conscience', label: 'CONSCIENCE', icon: Brain, color: 'text-rose-300', hsl: '340, 82%, 65%' },
  { id: 'treaty', label: 'TREATY', icon: ClipboardCheck, color: 'text-emerald-300', hsl: '155, 72%, 55%' },
  // EPZ — Expansion Perception Zone
  { id: 'compass', label: 'COMPASS', icon: Globe, color: 'text-sky-400', hsl: '199, 89%, 48%' },
  { id: 'echo', label: 'ECHO', icon: Radio, color: 'text-indigo-300', hsl: '230, 84%, 70%' },
  { id: 'reflex', label: 'REFLEX', icon: Zap, color: 'text-pink-300', hsl: '330, 81%, 70%' },
  // EMZ — Expansion Manufacturing Zone (3 nodes)
  { id: 'forge', label: 'FORGE', icon: Cpu, color: 'text-orange-400', hsl: '20, 90%, 50%' },
  { id: 'lingua', label: 'LINGUA', icon: Globe, color: 'text-teal-300', hsl: '173, 80%, 55%' },
  { id: 'harvest', label: 'HARVEST', icon: Database, color: 'text-lime-300', hsl: '84, 81%, 55%' },
  // CSZ — Covert Systems Zone (3 nodes)
  { id: 'evolution', label: 'EVOLUTION', icon: Sparkles, color: 'text-rose-400', hsl: '350, 89%, 60%' },
  { id: 'shadow', label: 'SHADOW', icon: Shield, color: 'text-gray-400', hsl: '220, 9%, 46%' },
  { id: 'phantom', label: 'PHANTOM', icon: Shield, color: 'text-slate-300', hsl: '215, 16%, 60%' },
  // Fields + Plane + Shell
  { id: 'immunity', label: 'IMMUNITY', icon: Shield, color: 'text-rose-300', hsl: '350, 80%, 70%' },
  { id: 'intent', label: 'INTENT', icon: Brain, color: 'text-amber-400', hsl: '38, 92%, 50%' },
  { id: 'governance', label: 'GOVERNANCE', icon: Globe, color: 'text-sky-400', hsl: '199, 89%, 48%' },
  { id: 'defense', label: 'DEFENSE', icon: Shield, color: 'text-red-400', hsl: '0, 84%, 60%' },
];

export function DashboardMetricsHero() {
  const healthScore = useSubstrateHealthScore();
  const version = useMetric('version');
  
  const circumference = 2 * Math.PI * 85;
  const progress = (healthScore.healthScore / 100) * circumference;
  const activeCount = healthScore.activeCount;
  const totalModules = healthScore.totalModules;

  const statusLabel = healthScore.isHealthy ? 'OPTIMAL' : healthScore.isDegraded ? 'DEGRADED' : 'CRITICAL';
  
  // Explicit color mappings — dynamic Tailwind classes don't work with JIT
  const statusStyles = healthScore.isHealthy 
    ? { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/20', borderHover: 'hover:border-emerald-500/40', from: 'from-emerald-500', labelText: 'text-emerald-400/80' }
    : healthScore.isDegraded
    ? { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/20', borderHover: 'hover:border-amber-500/40', from: 'from-amber-500', labelText: 'text-amber-400/80' }
    : { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/20', borderHover: 'hover:border-red-500/40', from: 'from-red-500', labelText: 'text-red-400/80' };

  return (
    <motion.div 
      className="relative rounded-3xl border border-border/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/60 to-card/30 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Ambient orbs — CSS animations for GPU performance */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/[0.08] blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-fuchsia-500/[0.08] blur-[120px] animate-pulse" style={{ animationDuration: '15s', animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />

      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl border border-transparent" 
        style={{ background: 'linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, hsl(185 100% 50% / 0.15), transparent 40%, transparent 60%, hsl(280 100% 65% / 0.15)) border-box' }} 
      />

      <div className="relative p-4 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-10 lg:gap-14">
          
          {/* === Orbital Health Ring === */}
          <div className="relative flex-shrink-0 group">
            {/* Outer orbital ring decoration — CSS for GPU performance */}
            <div 
              className="absolute -inset-4 rounded-full border border-dashed border-border/20 animate-spin"
              style={{ animationDuration: '120s' }}
            />
            <div 
              className="absolute -inset-8 rounded-full border border-dotted border-border/10 animate-spin"
              style={{ animationDuration: '180s', animationDirection: 'reverse' }}
            />

            <svg className="w-40 h-40 sm:w-56 sm:h-56 -rotate-90" viewBox="0 0 200 200">
              {/* Track */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="4" className="text-border/15" />
              <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/8" strokeDasharray="3 9" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/8" />
              
              <defs>
                <linearGradient id="heroHealthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={healthScore.isHealthy ? "#10b981" : healthScore.isDegraded ? "#f59e0b" : "#ef4444"} />
                  <stop offset="50%" stopColor={healthScore.isHealthy ? "#22d3ee" : healthScore.isDegraded ? "#fbbf24" : "#fb7185"} />
                  <stop offset="100%" stopColor={healthScore.isHealthy ? "#06b6d4" : healthScore.isDegraded ? "#f97316" : "#f43f5e"} />
                </linearGradient>
                <filter id="heroGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              
              <motion.circle
                cx="100" cy="100" r="85" fill="none"
                stroke="url(#heroHealthGradient)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} filter="url(#heroGlow)"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            
            {/* Center display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className={cn(
                  "text-4xl sm:text-6xl font-black font-mono tracking-tighter",
                  statusStyles.text
                )}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
              >
                {healthScore.healthScore}
              </motion.span>
              <span className="text-[9px] text-muted-foreground/70 font-mono uppercase tracking-[0.4em] mt-1">
                health
              </span>
            </div>

            {/* Pulsing halo */}
            <motion.div 
              className={cn(
                "absolute inset-4 rounded-full blur-3xl -z-10 opacity-30",
                statusStyles.bg
              )}
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* === Stats & Module Constellation === */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* Stat Cards Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: 'MATRIX NODES', value: `${activeCount}`, suffix: `/${totalModules}`, styles: { text: 'text-cyan-400/80', border: 'border-cyan-500/20 hover:border-cyan-500/40', from: 'from-cyan-500' } },
                { label: 'STATUS', value: statusLabel, styles: { text: statusStyles.labelText, border: `${statusStyles.border} ${statusStyles.borderHover}`, from: statusStyles.from } },
                { label: 'VERSION', value: `v${version}`, styles: { text: 'text-amber-400/80', border: 'border-amber-500/20 hover:border-amber-500/40', from: 'from-amber-500' } },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.label}
                  className={cn(
                    "relative p-2.5 sm:p-4 rounded-2xl border overflow-hidden group cursor-default",
                    stat.styles.border
                  )}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.06]", stat.styles.from, "to-transparent")} />
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.1] transition-opacity duration-300", stat.styles.from, "to-transparent")} />
                  <span className={cn("text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] block mb-1 sm:mb-1.5", stat.styles.text)}>
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-0.5 sm:gap-1">
                    <span className="text-base sm:text-2xl font-bold text-foreground font-mono truncate">{stat.value}</span>
                    {stat.suffix && <span className="text-sm sm:text-lg text-muted-foreground/40 font-mono">{stat.suffix}</span>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Module Constellation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-[0.2em]">Memory Stream Constellation</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => healthScore.refetch()}
                  disabled={healthScore.isLoading}
                >
                  <RefreshCw className={cn("w-3 h-3 mr-1", healthScore.isLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
              
              <TooltipProvider delayDuration={50}>
                <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-11 xl:grid-cols-21 gap-1.5 sm:gap-2">
                  {MODULES_CONFIG.map((module, idx) => {
                    const ModIcon = module.icon;
                    const isActive = healthScore.modules[module.id as keyof typeof healthScore.modules];
                    
                    return (
                      <Tooltip key={module.id}>
                        <TooltipTrigger asChild>
                          <motion.div
                            className={cn(
                              "relative w-full aspect-square rounded-xl flex items-center justify-center border cursor-pointer",
                              "transition-all duration-200",
                              isActive 
                                ? "border-border/40 bg-card/80 hover:bg-card hover:border-border/60"
                                : "border-border/20 bg-muted/5 opacity-40"
                            )}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: isActive ? 1 : 0.4, scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.03, type: "spring", stiffness: 400, damping: 20 }}
                            whileHover={{ y: -4, scale: 1.15, transition: { duration: 0.15 } }}
                            style={isActive ? { 
                              boxShadow: `0 0 24px hsla(${module.hsl}, 0.15), 0 0 8px hsla(${module.hsl}, 0.08)` 
                            } : undefined}
                          >
                            <ModIcon className={cn("w-4 h-4", isActive ? module.color : "text-muted-foreground/30")} />
                            <motion.span 
                              className={cn(
                                "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-background",
                                isActive ? "bg-emerald-500" : "bg-muted-foreground/20"
                              )}
                              animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] } : {}}
                              transition={{ duration: 2.5, repeat: Infinity }}
                            />
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs border-border/50 bg-popover/95 backdrop-blur-xl">
                          <p className="font-semibold">{module.label}</p>
                          <p className={cn("text-[10px]", isActive ? "text-emerald-400" : "text-red-400")}>
                            {isActive ? "● Online" : "○ Offline"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
            
            {/* Live telemetry footer */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
               <span className="text-[9px] text-muted-foreground/50 font-mono tracking-wider">STREAM ACTIVE</span>
              </div>
              <div className="h-3 w-px bg-border/30" />
              <span className="text-[9px] text-muted-foreground/40 font-mono">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <div className="h-3 w-px bg-border/30" />
              <span className="text-[9px] text-muted-foreground/40 font-mono">Signal → Silicon</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
