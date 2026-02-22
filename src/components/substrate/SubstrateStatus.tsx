/**
 * CMPSBL Substrate Status Widget
 * SPARTA Epoch compact status indicator
 */

import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubstrateContext } from './SubstrateProvider';

interface SubstrateStatusProps {
  compact?: boolean;
}

export function SubstrateStatus({ compact = false }: SubstrateStatusProps) {
  const { initialized, overallHealth, modules } = useSubstrateContext();

  const activeCount = Object.values(modules).filter(m => m.active).length;
  const totalModules = 21;
  const isHealthy = overallHealth >= 80;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs ${isHealthy ? 'text-primary' : 'text-destructive'}`}>
        <Activity className="h-3 w-3" />
        {activeCount}/{totalModules}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isHealthy ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
      <span className="text-muted-foreground">
        CMPSBL Substrate: {activeCount}/{totalModules} modules
      </span>
    </div>
  );
}
