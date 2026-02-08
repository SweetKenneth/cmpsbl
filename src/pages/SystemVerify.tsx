import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAllSystems, initializeBrain, type SystemStatus } from "@/lib/verifyBrain";
import { CheckCircle2, XCircle, Loader2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SystemVerify() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const runVerification = async () => {
    setLoading(true);
    try {
      const result = await verifyAllSystems();
      setStatus(result);
      
      const allOnline = Object.entries(result)
        .filter(([key]) => key !== 'details')
        .every(([_, value]) => value === true);
      
      if (allOnline) {
        toast.success("All systems operational!");
      } else {
        toast.warning("Some systems need attention");
      }
    } catch (err) {
      toast.error("Verification failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runInitialize = async () => {
    setInitializing(true);
    try {
      const success = await initializeBrain();
      if (success) {
        toast.success("Brain initialized successfully!");
        // Run verification after init
        await runVerification();
      } else {
        toast.error("Brain initialization failed");
      }
    } catch (err) {
      toast.error("Initialization error");
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  const StatusIcon = ({ online }: { online: boolean }) => (
    online ? 
      <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">PromptFluid System Verification</h1>
          <p className="text-muted-foreground">
            Verify all ecosystem components are online and operational
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            onClick={runInitialize} 
            disabled={initializing || loading}
            size="lg"
            className="gap-2"
          >
            {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Initialize Brain
          </Button>

          <Button 
            onClick={runVerification} 
            disabled={loading || initializing}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Verify Systems
          </Button>
        </div>

        {status && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Systems Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="font-medium">🧠 Brain (AI Orchestration)</span>
                  <StatusIcon online={status.brain} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="font-medium">🛡️ Defense (Security)</span>
                  <StatusIcon online={status.defense} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="font-medium">👁️ Vision (Dashboard)</span>
                  <StatusIcon online={status.vision} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="font-medium">♿ INCLUSIVE (Human Compatibility)</span>
                  <StatusIcon online={status.inclusive} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="font-medium">🌊 Cascade (Dream Engine)</span>
                  <StatusIcon online={status.cascade} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="font-medium">🗄️ Database</span>
                  <StatusIcon online={status.database} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(status.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {!status && !loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Click "Initialize Brain" or "Verify Systems" to check status
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
