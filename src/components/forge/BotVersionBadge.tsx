/**
 * Bot Version Badge Component
 * Displays version with update indicator
 */

import { ArrowUp, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BotVersionBadgeProps {
  version: string;
  hasUpdate?: boolean;
  latestVersion?: string;
  isLatest?: boolean;
  className?: string;
}

export function BotVersionBadge({ 
  version, 
  hasUpdate, 
  latestVersion, 
  isLatest = true,
  className 
}: BotVersionBadgeProps) {
  if (hasUpdate && latestVersion) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 border-neon-amber/50 bg-neon-amber/10 text-neon-amber cursor-pointer",
                className
              )}
            >
              <ArrowUp className="w-3 h-3" />
              v{version}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update available: v{latestVersion}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isLatest) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 border-neon-green/50 bg-neon-green/10 text-neon-green",
                className
              )}
            >
              <Check className="w-3 h-3" />
              v{version}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Latest version</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("font-mono text-xs", className)}
    >
      v{version}
    </Badge>
  );
}
