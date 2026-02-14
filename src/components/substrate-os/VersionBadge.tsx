/**
 * VersionBadge — Reactive version display wired to Zustand store
 * Update once in Public Metrics, reflects everywhere.
 */

import { Badge } from '@/components/ui/badge';
import { useMetric } from '@/stores/publicMetricsStore';
import { cn } from '@/lib/utils';

export function VersionBadge({ className }: { className?: string }) {
  const version = useMetric('version');
  return (
    <Badge variant="outline" className={cn("text-[10px]", className)}>
      v{version}
    </Badge>
  );
}
