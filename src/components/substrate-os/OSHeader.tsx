/**
 * OS Header — Substrate identity, status bar, and system metrics
 * Feels like a real operating system header with live telemetry
 */

import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Cpu, HardDrive, Clock, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSystemVersion, useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <span className="font-mono text-xs tabular-nums">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

function PulsingDot({ active, color }: { active: boolean; color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && (
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          color
        )} />
      )}
      <span className={cn(
        "relative inline-flex rounded-full h-2 w-2",
        color
      )} />
    </span>
  );
}

interface OSHeaderProps {
  userEmail?: string;
  role: 'observer' | 'operator' | 'governor';
}

export function OSHeader({ userEmail, role }: OSHeaderProps) {
  const systemVersion = useSystemVersion();
  const healthScore = useSubstrateHealthScore();
  
  const versionData = systemVersion.data?.data as { version?: string } | undefined;
  const isOnline = !systemVersion.isError;
  
  return (
    <div className="border-b border-white/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Bar - System Status */}
      <div className="h-8 bg-white/5 dark:bg-white/[0.02] border-b border-white/10 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <PulsingDot active color="bg-emerald-500" />
                <Wifi className="w-3 h-3 text-emerald-400" />
              </>
            ) : (
              <>
                <PulsingDot active={false} color="bg-destructive" />
                <WifiOff className="w-3 h-3 text-destructive" />
              </>
            )}
            <span className="text-muted-foreground font-mono">
              {isOnline ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
          
          {/* Health Score */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
              <Cpu className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="text-muted-foreground font-mono">HEALTH</span>
            <span className={cn(
              "font-mono font-medium px-1.5 py-0.5 rounded-md",
              healthScore.isHealthy ? "text-emerald-400 bg-emerald-500/10" : 
              healthScore.isDegraded ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10"
            )}>
              {healthScore.healthScore}%
            </span>
          </div>
          
          {/* Modules Active */}
          <div className="hidden md:flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
              <HardDrive className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-muted-foreground font-mono">MODULES</span>
            <span className="font-mono font-medium text-foreground">
              {Object.values(healthScore.modules).filter(Boolean).length}/6
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground uppercase font-mono">ACCESS</span>
            <Badge 
              variant="outline" 
              className={cn(
                "h-5 text-[10px] font-mono uppercase backdrop-blur-sm",
                role === 'governor' ? "border-red-500/40 text-red-400 bg-red-500/10" :
                role === 'operator' ? "border-amber-500/40 text-amber-400 bg-amber-500/10" :
                "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
              )}
            >
              {role}
            </Badge>
          </div>
          
          {/* Clock */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <LiveClock />
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 via-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/40 flex items-center justify-center backdrop-blur-sm">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-lg -z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
                <span className="text-foreground">substrate</span>
                <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">os</span>
                <span className="text-muted-foreground/50 text-sm font-normal font-mono">
                  /{versionData?.version || '3.11.1'}
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                promptfluid® cognitive orchestration
              </p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-mono">SESSION</span>
            <code className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-foreground backdrop-blur-sm">
              {userEmail?.split('@')[0] || 'anonymous'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
