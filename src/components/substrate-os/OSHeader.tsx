/**
 * OS Header v10.5.0 ARCHITECT — Substrate identity with animated status indicators
 * Glassmorphic design with live telemetry, gradient accents, and audio controls
 */

import { useState, useEffect, memo } from 'react';
import { Activity, Wifi, WifiOff, Cpu, HardDrive, Clock, Terminal, Sparkles, Shield, Crown, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemVersion, useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardAudio } from './audio';
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
  const [showDetails, setShowDetails] = useState(false);
  
  const versionData = systemVersion.data?.data as { version?: string } | undefined;
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
    creator: { 
      label: 'CREATOR', 
      color: 'bg-gradient-to-r from-amber-500 to-orange-600', 
      border: 'border-amber-500/50',
      text: 'text-amber-400',
      icon: Palette
    },
    free: { 
      label: 'FREE', 
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600', 
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      icon: Activity
    },
  };
  
  const currentRole = roleConfig[role];
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
      <div className="h-9 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border-b border-border/30 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}>
              {isOnline ? <PulsingDot active color="bg-emerald-500" /> : <PulsingDot active={false} color="bg-destructive" />}
            </motion.div>
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-destructive" />}
            <span className="font-mono text-muted-foreground uppercase tracking-wider text-[10px]">
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
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">MODULES</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold font-mono text-foreground">{healthScore.activeCount}</span>
                <span className="text-[10px] text-muted-foreground">/</span>
                <span className="text-[10px] text-muted-foreground">{healthScore.totalModules}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Audio Controls */}
          <DashboardAudio />
          {/* Role Badge */}
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md border",
              currentRole.border, "bg-background/50 backdrop-blur-sm"
            )}>
              <RoleIcon className={cn("w-3 h-3", currentRole.text)} />
              <span className={cn("text-[10px] font-bold font-mono", currentRole.text)}>
                {currentRole.label}
              </span>
            </div>
          </motion.div>
          
          {/* Clock */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <LiveClock />
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/40 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                <Terminal className="w-5 h-5 text-cyan-400 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-cyan-500/30 blur-xl -z-10 opacity-60" />
            </motion.div>
            
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="text-foreground">CMPSBL</span>
                <span className="relative">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">OS</span>
                  <Sparkles className="absolute -top-1 -right-4 w-3 h-3 text-cyan-400 animate-pulse" />
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                  architect epoch • cognitive orchestration
                </p>
                <span className="text-muted-foreground/30">|</span>
                <span className="text-[10px] font-mono text-cyan-400/80">
                  v{versionData?.version || '10.9.1'}
                </span>
              </div>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-mono text-[10px] uppercase">SESSION</span>
              <div className="relative">
                <code className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 font-mono text-sm text-foreground backdrop-blur-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {userEmail?.split('@')[0] || 'anonymous'}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
