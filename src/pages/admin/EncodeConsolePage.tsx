/**
 * ENCODE Agent Console Page — Admin-gated wrapper
 * Route: /admin/encode-console
 */

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const EncodeSystemsConsole = lazy(() => import('@/components/substrate-os/encode-console/EncodeSystemsConsole'));

export default function EncodeConsolePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground font-mono">Loading ENCODE Agent Console</p>
        </div>
      </div>
    }>
      <EncodeSystemsConsole />
    </Suspense>
  );
}
