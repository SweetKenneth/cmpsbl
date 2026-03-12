/**
 * OS Header — Substrate identity with animated status indicators
 * Glassmorphic design with live telemetry, gradient accents, and audio controls
 */

import { useState, useEffect, memo } from 'react';
import { Activity, Wifi, WifiOff, Cpu, HardDrive, Clock, Terminal, Sparkles, Shield, Crown, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemVersion, useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useMetric } from '@/stores/publicMetricsStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardAudio } from './audio';
import { NotificationCenter } from './NotificationCenter';
import type { SubstrateRole } from '@/hooks/useUserRole';

const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <span className="font-mono text-xs tabular-nums tracking-wider">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
});

function PulsingDot({ active, color }: { active: boolean; color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          color
        )} />
      )}
      <span className={cn(
        "relative inline-flex rounded-full h-2.5 w-2.5",
        color
      )} />
    </span>
  );
}

function HealthIndicator({ score, isHealthy, isDegraded }: { score: number; isHealthy: boolean; isDegraded: boolean }) {
  const circumference = 2 * Math.PI * 12;
  const progress = (score / 100) * circumference;
  
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-border/30" />
        <motion.circle
          cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            isHealthy ? "text-emerald-400" : isDegraded ? "text-amber-400" : "text-red-400"
          )}
        />
      </svg>
      <span className={cn(
        "absolute text-[9px] font-bold font-mono",
        isHealthy ? "text-emerald-400" : isDegraded ? "text-amber-400" : "text-red-400"
      )}>
        {score}
      </span>
    </div>
  );
}

interface OSHeaderProps {
  userEmail?: string;
  role: SubstrateRole;
}

export function OSHeader({ userEmail, role }: OSHeaderProps) {
  const systemVersion = useSystemVersion();
  const healthScore = useSubstrateHealthScore();
  const version = useMetric('version');
  const [showDetails, setShowDetails] = useState(false);
  
  const isOnline = !systemVersion.isError;
  
  const roleConfig: Record<SubstrateRole, { label: string; color: string; border: string; text: string; icon: typeof Terminal }> = {
    governor: { 
      label: 'GOVERNOR', 
      color: 'bg-gradient-to-r from-red-500 to-rose-600', 
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: Crown
    },
    architect: { 
      label: 'ARCHITECT', 
      color: 'bg-gradient-to-r from-purple-500 to-fuchsia-600', 
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      icon: Sparkles
    },
    studio: { 
      label: 'STUDIO', 
      color: 'bg-gradient-to-r from-indigo-500 to-violet-600', 
      border: 'border-indigo-500/50',
      text: 'text-indigo-400',
      icon: Sparkles
    },
    creator: { 
      label: 'CREATOR', 
      color: 'bg-gradient-to-r from-amber-500 to-orange-600', 
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      icon: Palette
    },
    free: { 
      label: 'BUILDER', 
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600', 
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      icon: Activity
    },
  };
  
  const currentRole = roleConfig[role] ?? roleConfig.free;
  const RoleIcon = currentRole.icon;
  
  return (
    <motion.div 
      className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      {/* Top Bar - System Status */}
      <div className="h-8 sm:h-9 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border-b border-border/30 px-3 sm:px-4 flex items-center justify-between text-xs overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.div animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}>
              {isOnline ? <PulsingDot active color="bg-emerald-500" /> : <PulsingDot active={false} color="bg-destructive" />}
            </motion.div>
            {isOnline ? <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-destructive" />}
            <span className="hidden sm:inline font-mono text-muted-foreground uppercase tracking-wider text-[10px]">
              {isOnline ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
          
          {/* Health Score */}
          <div className="hidden sm:flex items-center gap-2">
            <HealthIndicator score={healthScore.healthScore} isHealthy={healthScore.isHealthy} isDegraded={healthScore.isDegraded} />
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">HEALTH</span>
              <span className={cn(
                "text-[10px] font-bold font-mono",
                healthScore.isHealthy ? "text-emerald-400" : healthScore.isDegraded ? "text-amber-400" : "text-red-400"
              )}>
                {healthScore.isHealthy ? 'OPTIMAL' : healthScore.isDegraded ? 'DEGRADED' : 'CRITICAL'}
              </span>
            </div>
          </div>
          
          {/* Modules Active */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <HardDrive className="w-3 h-3 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">SURFACES</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold font-mono text-foreground">{healthScore.activeCount}</span>
                <span className="text-[10px] text-muted-foreground">/</span>
                <span className="text-[10px] text-muted-foreground">{healthScore.totalModules}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Notification Center */}
          <NotificationCenter />
          {/* Audio Controls */}
          <DashboardAudio />
          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border",
              currentRole.border, "bg-background/50 backdrop-blur-sm"
            )}>
              <RoleIcon className={cn("w-3 h-3", currentRole.text)} />
              <span className={cn("text-[9px] sm:text-[10px] font-bold font-mono", currentRole.text)}>
                {currentRole.label}
              </span>
            </div>
          </div>
          
          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <LiveClock />
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <motion.div className="relative shrink-0" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/40 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-cyan-500/30 blur-xl -z-10 opacity-60" />
            </motion.div>
            
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span className="relative">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">Memory Stream</span>
                  <Sparkles className="absolute -top-1 -right-3 sm:-right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 animate-pulse" />
                </span>
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-widest truncate">
                  <span className="hidden sm:inline">signal → silicon • CMPSBL substrate</span>
                  <span className="sm:hidden">signal → silicon</span>
                </p>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span className="text-[8px] sm:text-[10px] font-mono text-cyan-400/80 shrink-0">
                  v{version}
                </span>
              </div>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
              <span className="hidden sm:inline text-muted-foreground font-mono text-[10px] uppercase">SESSION</span>
              <code className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 font-mono text-[11px] sm:text-sm text-foreground backdrop-blur-sm flex items-center gap-1.5 sm:gap-2 max-w-[120px] sm:max-w-none">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{userEmail?.split('@')[0] || 'anonymous'}</span>
              </code>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
