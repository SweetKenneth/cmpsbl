/**
 * Portal Header 2026
 * Minimal, status-focused header with live metrics
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wifi, WifiOff, Moon, Settings, LogIn, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PortalHeaderProps {
  agencyName: string;
  leaderName?: string;
  isOwner: boolean;
  isAuthenticated: boolean;
  isOnline?: boolean;
  activeTaskCount: number;
  onBack: () => void;
  onOpenSettings?: () => void;
  onOpenDream?: () => void;
  className?: string;
}

export function PortalHeader({
  agencyName,
  leaderName,
  isOwner,
  isAuthenticated,
  isOnline = true,
  activeTaskCount,
  onBack,
  onOpenSettings,
  onOpenDream,
  className,
}: PortalHeaderProps) {
  return (
    <header className={cn(
      "h-16 border-b border-border/30",
      "bg-card/60 backdrop-blur-xl",
      "flex items-center justify-between px-4 gap-4",
      className
    )}>
      {/* Left: Back + Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary-foreground/10 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            {/* Online indicator */}
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
              isOnline ? "bg-emerald-500" : "bg-muted-foreground"
            )} />
          </div>

          <div className="min-w-0">
            <h1 className="font-semibold text-sm truncate">{agencyName}</h1>
            {leaderName && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                {leaderName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center: Status Pills */}
      <div className="hidden sm:flex items-center gap-2">
        {activeTaskCount > 0 && (
          <Badge 
            variant="outline" 
            className="gap-1.5 text-xs border-amber-500/50 text-amber-400 bg-amber-500/10 animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {activeTaskCount} Active
          </Badge>
        )}
        
        <Badge 
          variant="outline" 
          className={cn(
            "gap-1.5 text-xs",
            isOnline 
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
              : "border-muted-foreground/50 text-muted-foreground"
          )}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {isAuthenticated && isOwner && (
          <>
            {onOpenDream && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenDream}
                className="h-9 w-9 rounded-lg hover:bg-muted/50"
                title="Dream Learning"
              >
                <Moon className="w-4 h-4" />
              </Button>
            )}
            {onOpenSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className="h-9 w-9 rounded-lg hover:bg-muted/50"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </>
        )}

        {!isAuthenticated && (
          <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
            <Link to="/auth">
              <LogIn className="w-3 h-3" />
              Sign In
            </Link>
          </Button>
        )}

        {isAuthenticated && isOwner && (
          <Badge variant="outline" className="text-[10px] border-primary/50 text-primary bg-primary/10">
            Owner
          </Badge>
        )}
      </div>
    </header>
  );
}
