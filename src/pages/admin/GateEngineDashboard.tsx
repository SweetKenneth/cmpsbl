/**
 * GATE Engine Dashboard — Admin page with full scoreboard and history
 */

import { AdminLayout } from '@/components/admin/AdminLayout';
import { GateScoreboard, GateHistory } from '@/components/gate/GateScoreboard';
import { useGateEngine } from '@/hooks/useGateEngine';

export default function GateEngineDashboard() {
  const { runGate, isRunning, currentRun, history, historyLoading } = useGateEngine();

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">GATE Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full substrate production validation — run the gauntlet to verify system integrity before release.
          </p>
        </div>

        <GateScoreboard
          run={currentRun}
          isRunning={isRunning}
          onRun={runGate}
        />

        <GateHistory runs={history} loading={historyLoading} />
      </div>
    </AdminLayout>
  );
}
