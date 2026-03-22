import { useEffect, useState } from 'react';
import { fetchLogs, type LogEntry } from '@/lib/api/logging';
import { useRealtime } from '@/hooks/useRealtime';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  // Subscribe to realtime log updates
  useRealtime({
    table: 'audit_logs',
    event: 'INSERT',
    onData: (payload) => {
      loadLogs(); // Refresh logs when new entry arrives
    },
  });

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchLogs({ limit: 100 });
    setLogs(data);
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'error':
        return 'bg-neon-amber/20 text-neon-amber border-neon-amber/30';
      case 'warning':
        return 'bg-neon-amber/20 text-neon-amber border-neon-amber/30';
      default:
        return 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading logs...</div>;
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-lg border border-border bg-background/50">
      <div className="p-4 space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="glass p-3 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={getSeverityColor(log.severity)}>
                    {log.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {log.module}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{log.message}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      View metadata
                    </summary>
                    <pre className="mt-2 text-xs bg-background/50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
