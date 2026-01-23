/**
 * promptfluid® Substrate Status Widget
 * Compact status indicator for the substrate
 */

import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubstrateContext } from './SubstrateProvider';

interface SubstrateStatusProps {
  compact?: boolean;
}

export function SubstrateStatus({ compact = false }: SubstrateStatusProps) {
  const { initialized, overallHealth, modules } = useSubstrateContext();

  const activeCount = Object.values(modules).filter(m => m.active).length;
  const totalModules = 11; // v4.0.0: All 11 modules
  const isHealthy = overallHealth >= 80;

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={`gap-1.5 ${isHealthy ? 'border-green-500/50 text-green-500' : 'border-amber-500/50 text-amber-500'}`}
      >
        <Activity className="h-3 w-3" />
        {activeCount}/{totalModules}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isHealthy ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-500" />
      )}
      <span className="text-muted-foreground">
        promptfluid® substrate: {activeCount}/{totalModules} modules
      </span>
      <Badge variant="outline" className="text-xs">
        v4.0.0
      </Badge>
    </div>
  );
}
