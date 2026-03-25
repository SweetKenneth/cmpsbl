import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Shield, Database, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  event_type: string;
  user_email: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('brain_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped = data?.map(event => ({
        id: event.id,
        event_type: event.event_type,
        user_email: 'System',
        details: event.data ? JSON.stringify(event.data) : 'No details',
        timestamp: new Date(event.created_at).toISOString(),
        severity: 'info' as const
      })) || [];

      setLogs(mapped);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('user')) return User;
    if (eventType.includes('security') || eventType.includes('defense')) return Shield;
    if (eventType.includes('database') || eventType.includes('data')) return Database;
    return FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Complete system activity log</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{logs.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">User Actions</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neon-blue">
                {logs.filter(l => l.event_type.includes('user')).length}
              </p>
            </div>
            <User className="w-8 h-8 text-neon-blue/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Security Events</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neon-amber">
                {logs.filter(l => l.severity === 'warning' || l.severity === 'critical').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-neon-amber/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Last 24h</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neon-green">
                {logs.filter(l => {
                  const diff = Date.now() - new Date(l.timestamp).getTime();
                  return diff < 24 * 60 * 60 * 1000;
                }).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-neon-green/40" />
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        {logs.map((log) => {
          const Icon = getEventIcon(log.event_type);
          return (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    log.severity === 'critical' ? 'bg-destructive/20' :
                    log.severity === 'warning' ? 'bg-neon-amber/20' :
                    'bg-neon-blue/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      log.severity === 'critical' ? 'text-destructive' :
                      log.severity === 'warning' ? 'text-neon-amber' :
                      'text-neon-blue'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{log.event_type}</p>
                      <Badge variant={
                        log.severity === 'critical' ? 'destructive' :
                        log.severity === 'warning' ? 'default' :
                        'secondary'
                      }>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{log.user_email}</p>
                    <code className="text-xs bg-secondary/20 px-2 py-1 rounded block">
                      {log.details.substring(0, 100)}...
                    </code>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
