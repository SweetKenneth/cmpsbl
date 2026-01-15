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
    <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Top Bar - System Status */}
      <div className="h-7 bg-muted/30 border-b border-border/30 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <PulsingDot active color="bg-green-500" />
                <Wifi className="w-3 h-3 text-green-500" />
              </>
            ) : (
              <>
                <PulsingDot active={false} color="bg-destructive" />
                <WifiOff className="w-3 h-3 text-destructive" />
              </>
            )}
            <span className="text-muted-foreground">
              {isOnline ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
          
          {/* Health Score */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">HEALTH</span>
            <span className={cn(
              "font-mono font-medium",
              healthScore.isHealthy ? "text-green-500" : 
              healthScore.isDegraded ? "text-amber-500" : "text-destructive"
            )}>
              {healthScore.healthScore}%
            </span>
          </div>
          
          {/* Modules Active */}
          <div className="hidden md:flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-blue-500" />
            <span className="text-muted-foreground">MODULES</span>
            <span className="font-mono font-medium text-foreground">
              {Object.values(healthScore.modules).filter(Boolean).length}/6
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground uppercase">ACCESS</span>
            <Badge 
              variant="outline" 
              className={cn(
                "h-5 text-[10px] font-mono uppercase",
                role === 'governor' ? "border-destructive/50 text-destructive" :
                role === 'operator' ? "border-amber-500/50 text-amber-500" :
                "border-primary/50 text-primary"
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
                <span className="text-foreground">substrate</span>
                <span className="text-primary">os</span>
                <span className="text-muted-foreground/50 text-sm font-normal">
                  /{versionData?.version || 'v2026.01'}
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                promptfluid® cognitive orchestration
              </p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">SESSION</span>
            <code className="px-2 py-0.5 rounded bg-muted/50 font-mono text-foreground">
              {userEmail?.split('@')[0] || 'anonymous'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
