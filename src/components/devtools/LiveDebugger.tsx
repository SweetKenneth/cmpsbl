import { useState } from "react";
import {
  useDebuggerSessions,
  useActiveDebuggerSession,
  useDebuggerTraces,
  useStartDebugger,
  useStopDebugger,
  useFlameGraphData,
} from "@/hooks/useDebugger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Play,
  Square,
  Flame,
  List,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Cpu,
  TrendingUp,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  success: "text-neon-green",
  error: "text-destructive",
  pending: "text-neon-amber",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  pending: Clock,
};

const MODULE_COLORS: Record<string, string> = {
  brain: "bg-neon-purple/20 text-neon-purple border-neon-purple/30",
  decode: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
  defense: "bg-destructive/20 text-destructive border-destructive/30",
  nexus: "bg-neon-amber/20 text-neon-amber border-neon-amber/30",
  vision: "bg-neon-green/20 text-neon-green border-neon-green/30",
  dream: "bg-primary/20 text-primary border-primary/30",
  core: "bg-neon-blue/20 text-neon-blue border-neon-blue/30",
  access: "bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30",
  ripple: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
};

export function LiveDebugger() {
  const [sessionName, setSessionName] = useState("");
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null);

  const { data: activeSession, isLoading: sessionLoading, error: sessionError } = useActiveDebuggerSession();
  const { data: sessions, isLoading: sessionsLoading } = useDebuggerSessions();
  const { data: traces, isLoading: tracesLoading, error: tracesError } = useDebuggerTraces(activeSession?.id);
  const flameData = useFlameGraphData(activeSession?.id);
  const startDebugger = useStartDebugger();
  const stopDebugger = useStopDebugger();

  const handleStart = async () => {
    const name = sessionName.trim() || `Debug ${new Date().toLocaleTimeString()}`;
    try {
      await startDebugger.mutateAsync({ name });
      setSessionName("");
      toast.success("Debugger session started", {
        description: `Session "${name}" is now recording traces.`
      });
    } catch (error: any) {
      const message = error?.message || "Unable to start debugger session";
      toast.error("Debugger Start Failed", {
        description: message.includes("permission") 
          ? "You may need to sign in or check your permissions."
          : message.includes("network") || message.includes("fetch")
            ? "Network error. Please check your connection."
            : "The debugger tables may not be set up. Contact support."
      });
    }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try {
      await stopDebugger.mutateAsync(activeSession.id);
      toast.success("Debugger stopped", {
        description: `Recorded ${traces?.length || 0} traces.`
      });
    } catch (error: any) {
      toast.error("Stop Failed", {
        description: "Session may have already ended."
      });
    }
  };

  // Show graceful loading/error states
  if (sessionLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Connecting to debugger...</p>
        </div>
      </Card>
    );
  }

  if (sessionError || tracesError) {
    return (
      <Card className="p-8 border-neon-amber/30 bg-neon-amber/5">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-neon-amber/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-neon-amber" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Debugger Unavailable</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The live debugger requires database tables that may not be configured yet. 
              This is expected during initial setup.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate stats
  const successCount = traces?.filter((t) => t.status === "success").length || 0;
  const errorCount = traces?.filter((t) => t.status === "error").length || 0;
  const avgLatency =
    traces?.length && traces.reduce((acc, t) => acc + (t.latency_ms || 0), 0) / traces.length;

  const selectedTraceData = traces?.find((t) => t.trace_id === selectedTrace);

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {activeSession ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-medium">Recording: {activeSession.name}</span>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Session name (optional)"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-64"
                  />
                </>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {activeSession ? (
                <Button variant="destructive" onClick={handleStop}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button onClick={handleStart} disabled={startDebugger.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Debugger
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {activeSession && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Traces</p>
                  <p className="text-2xl font-bold">{traces?.length || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-neon-green">
                    {traces?.length ? Math.round((successCount / traces.length) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-neon-green opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-destructive">{errorCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">{avgLatency?.toFixed(0) || 0}ms</p>
                </div>
                <Clock className="h-8 w-8 text-neon-amber opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trace List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Live Traces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="flame" className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Flame Graph
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <ScrollArea className="h-[400px]">
                  {!traces?.length ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {activeSession
                        ? "Waiting for traces..."
                        : "Start the debugger to see traces"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {traces.map((trace) => {
                        const StatusIcon = STATUS_ICONS[trace.status] || Clock;
                        return (
                          <div
                            key={trace.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedTrace === trace.trace_id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedTrace(trace.trace_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <StatusIcon
                                  className={`h-4 w-4 ${STATUS_COLORS[trace.status]}`}
                                />
                                <Badge
                                  variant="outline"
                                  className={MODULE_COLORS[trace.module] || ""}
                                >
                                  {trace.module}
                                </Badge>
                                <span className="font-mono text-sm">{trace.action}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {trace.memory_mb && (
                                  <span className="flex items-center gap-1">
                                    <Cpu className="h-3 w-3" />
                                    {trace.memory_mb.toFixed(1)}MB
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {trace.latency_ms}ms
                                </span>
                              </div>
                            </div>
                            {trace.error_message && (
                              <p className="text-xs text-destructive mt-2 truncate">
                                {trace.error_message}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="flame">
                <div className="h-[400px] bg-muted/50 rounded-lg p-4">
                  {!flameData?.length ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No flame graph data available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {flameData.map((node, i) => (
                        <FlameRow key={i} node={node} depth={0} maxValue={Math.max(...flameData.map(n => n.value))} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trace Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trace Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTraceData ? (
              <div className="text-center py-12 text-muted-foreground">
                Select a trace to view details
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Primitive</p>
                    <Badge className={MODULE_COLORS[selectedTraceData.module] || ""}>
                      {selectedTraceData.module}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Action</p>
                    <p className="font-mono text-sm">{selectedTraceData.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className="font-mono">{selectedTraceData.latency_ms}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Memory</p>
                    <p className="font-mono">{selectedTraceData.memory_mb?.toFixed(2) || "N/A"}MB</p>
                  </div>
                </div>

                {selectedTraceData.input_preview && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Input</p>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-24">
                      {selectedTraceData.input_preview}
                    </pre>
                  </div>
                )}

                {selectedTraceData.output_preview && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Output</p>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-24">
                      {selectedTraceData.output_preview}
                    </pre>
                  </div>
                )}

                {selectedTraceData.error_message && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Error</p>
                    <pre className="bg-destructive/10 text-destructive p-2 rounded text-xs overflow-auto">
                      {selectedTraceData.error_message}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Trace ID</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {selectedTraceData.trace_id}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Flame graph row component
function FlameRow({ node, depth, maxValue }: { node: any; depth: number; maxValue: number }) {
  const width = Math.max((node.value / maxValue) * 100, 10);
  const statusColor = node.status === "success" ? "bg-neon-green" : node.status === "error" ? "bg-destructive" : "bg-neon-amber";

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className={`${statusColor} text-white px-2 py-1 rounded text-xs font-mono mb-1 truncate`}
        style={{ width: `${width}%` }}
        title={`${node.name} - ${node.value}ms`}
      >
        {node.name} ({node.value}ms)
      </div>
      {node.children?.map((child: any, i: number) => (
        <FlameRow key={i} node={child} depth={depth + 1} maxValue={maxValue} />
      ))}
    </div>
  );
}
