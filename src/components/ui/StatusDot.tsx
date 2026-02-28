/**
 * StatusDot — Colored status indicator dot
 */

interface StatusDotProps {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown' | 'offline';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const colors: Record<StatusDotProps['status'], string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  critical: 'bg-red-500',
  unknown: 'bg-muted-foreground',
  offline: 'bg-muted-foreground/50',
};

const sizes: Record<NonNullable<StatusDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function StatusDot({ status, pulse = false, size = 'md', label, className = '' }: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`rounded-full ${colors[status]} ${sizes[size]} ${pulse && status !== 'offline' ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
