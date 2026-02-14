import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Play } from "lucide-react";

export default function SystemInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [steps, setSteps] = useState<Record<string, 'pending' | 'running' | 'success' | 'error'>>({
    fluidmind: 'pending',
    circadian: 'pending',
    orchestrator: 'pending',
    dreamlog: 'pending',
  });
  const { toast } = useToast();

  const updateStep = (step: string, status: 'pending' | 'running' | 'success' | 'error') => {
    setSteps(prev => ({ ...prev, [step]: status }));
  };

  const initializeSystem = async () => {
    setIsInitializing(true);

    try {
      // Use consolidated cascade init function with full_init operation
      updateStep('fluidmind', 'running');
      updateStep('circadian', 'running');
      updateStep('orchestrator', 'running');
      updateStep('dreamlog', 'running');

      const { data, error } = await supabase.functions.invoke('pf-brain-cascade-init', {
        body: { operation: 'full_init' }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Initialization failed');

      // Mark all steps successful
      updateStep('fluidmind', 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('circadian', 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('orchestrator', 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('dreamlog', 'success');

      toast({
        title: "🌙 System Initialized Successfully",
        description: "All substrate v9.3.0 systems are now active and operational.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "❌ Initialization Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Mark failed step
      Object.entries(steps).forEach(([key, value]) => {
        if (value === 'running') updateStep(key, 'error');
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌊 Substrate v9.3.0 System Initializer
          </CardTitle>
          <CardDescription>
            Activate FluidMind, Circadian Intelligence, and Dreamstate systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(steps.fluidmind)}
              <div className="flex-1">
                <p className="font-medium">FluidMind Synchronization</p>
                <p className="text-sm text-muted-foreground">v9.3.0 baseline confirmation</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(steps.circadian)}
              <div className="flex-1">
                <p className="font-medium">Circadian Scheduler</p>
                <p className="text-sm text-muted-foreground">Generate randomized daily rhythm</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(steps.orchestrator)}
              <div className="flex-1">
                <p className="font-medium">Circadian Orchestrator</p>
                <p className="text-sm text-muted-foreground">Activate adaptive cycles</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(steps.dreamlog)}
              <div className="flex-1">
                <p className="font-medium">Dream Log #0001</p>
                <p className="text-sm text-muted-foreground">Create first dream artifact</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={initializeSystem} 
            disabled={isInitializing}
            className="w-full"
            size="lg"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Initialize All Systems
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground border-t pt-4">
            <p className="font-medium mb-2">⚠️ Prerequisites:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Database constraint fix completed ✅</li>
              <li>All edge functions deployed and ready</li>
              <li>Supabase service role key configured</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
