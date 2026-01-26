/**
 * ObserverModeOverlay — Visual indicator for observer-only users
 * Shows when user is in view-only mode and cannot interact
 */

import { cn } from '@/lib/utils';
import { Eye, Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ObserverModeOverlayProps {
  /** Whether to show the overlay */
  show: boolean;
  /** Optional custom message */
  message?: string;
  /** Whether to show upgrade CTA */
  showUpgrade?: boolean;
  /** Size variant */
  variant?: 'small' | 'default' | 'large';
  /** Additional class names */
  className?: string;
}

export function ObserverModeOverlay({ 
  show, 
  message = 'Observer mode: View only',
  showUpgrade = true,
  variant = 'default',
  className
}: ObserverModeOverlayProps) {
  if (!show) return null;

  const sizeClasses = {
    small: 'p-3',
    default: 'p-6',
    large: 'p-10',
  };

  const iconSizes = {
    small: 'w-6 h-6',
    default: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  return (
    <div className={cn(
      "absolute inset-0 z-10 flex flex-col items-center justify-center",
      "bg-background/80 backdrop-blur-sm rounded-xl border border-dashed border-muted-foreground/30",
      sizeClasses[variant],
      className
    )}>
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Eye className={cn("text-muted-foreground", iconSizes[variant])} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            {message}
          </p>
          {showUpgrade && (
            <p className="text-xs text-muted-foreground/70">
              Contact admin for operator or governor access
            </p>
          )}
        </div>
        {showUpgrade && (
          <Button variant="outline" size="sm" asChild className="gap-1 mt-2">
            <Link to="/marketplace">
              Explore Marketplace
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * ObserverModeWrapper — Wraps content with observer mode blocking
 */
interface ObserverModeWrapperProps {
  /** Whether user is in observer-only mode */
  isObserverOnly: boolean;
  /** Children to wrap */
  children: React.ReactNode;
  /** Message to show */
  message?: string;
  /** Additional class names */
  className?: string;
  /** Whether to allow pointer events (clicking through) */
  allowPointerEvents?: boolean;
}

export function ObserverModeWrapper({ 
  isObserverOnly, 
  children, 
  message,
  className,
  allowPointerEvents = false
}: ObserverModeWrapperProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isObserverOnly && !allowPointerEvents && (
        <div className="absolute inset-0 z-10" />
      )}
      <ObserverModeOverlay 
        show={isObserverOnly} 
        message={message}
        variant="small"
      />
    </div>
  );
}
