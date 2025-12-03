/**
 * System Management Page
 * Backend reconnection and system controls
 */

import { ReconnectButton } from '@/components/system/ReconnectButton';
import { DiagnosticsPanel } from '@/components/system/DiagnosticsPanel';
import { getConnectionStatus } from '@/lib/system/supabaseReconnect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export default function System() {
  const [status, setStatus] = useState(getConnectionStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getConnectionStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">System Control</h1>
          <p className="text-muted-foreground">Backend connection management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Backend Connection
              <Badge variant={status.connected ? "default" : "destructive"}>
                {status.connected ? "Connected" : "Disconnected"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Force reconnection to Lovable Cloud backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status.timestamp && (
              <div className="text-sm text-muted-foreground">
                Last check: {new Date(status.timestamp).toLocaleTimeString()}
              </div>
            )}
            <ReconnectButton />
          </CardContent>
        </Card>

        <DiagnosticsPanel />
      </div>
    </div>
  );
}
