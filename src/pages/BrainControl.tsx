import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, Activity, Sparkles } from "lucide-react";

export default function BrainControl() {
  const [initializing, setInitializing] = useState(false);
  const [status, setStatus] = useState<string>("Dormant");
  const { toast } = useToast();

  const initializeBrain = async () => {
    setInitializing(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-brain-initialize');
      
      if (error) throw error;
      
      setStatus("Active & Learning");
      toast({
        title: "Brain Initialized",
        description: "AI orchestration system is now active and learning.",
      });
    } catch (error) {
      console.error('Initialization error:', error);
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const triggerReflection = async () => {
    try {
      const { error } = await supabase.functions.invoke('pf-brain-reflect');
      if (error) throw error;
      
      toast({
        title: "Reflection Triggered",
        description: "Brain meta-learning cycle initiated.",
      });
    } catch (error) {
      toast({
        title: "Reflection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const checkStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('pf-brain-status');
      if (error) throw error;
      
      setStatus(data?.status?.healthy ? "Active & Learning" : "Degraded");
      toast({
        title: "Status Check Complete",
        description: `Brain is ${data?.status?.healthy ? "healthy" : "degraded"}`,
      });
    } catch (error) {
      setStatus("Offline");
      toast({
        title: "Status Check Failed",
        description: "Could not reach Brain system",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold">CMPSBL Brain</h1>
          </div>
          <p className="text-muted-foreground">
            AI Orchestration & Learning Control Center
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">System Status</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Current Brain state and health
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={status === "Active & Learning" ? "text-green-500" : "text-muted-foreground"} />
              <span className="font-mono text-lg">{status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={initializeBrain} 
              disabled={initializing}
              size="lg"
              className="h-20"
            >
              <Zap className="mr-2 h-5 w-5" />
              {initializing ? "Initializing..." : "Initialize Brain"}
            </Button>

            <Button 
              onClick={checkStatus}
              variant="outline"
              size="lg"
              className="h-20"
            >
              <Activity className="mr-2 h-5 w-5" />
              Check Status
            </Button>

            <Button 
              onClick={triggerReflection}
              variant="secondary"
              size="lg"
              className="h-20"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Trigger Reflection
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">About the Brain</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ <strong>Free-Tier AI Routing:</strong> Groq → Cerebras → Google AI Studio → DeepSeek → Together AI → Hyperbolic</li>
            <li>✅ <strong>Dual-Memory System:</strong> Hot (90-day) + Cold (infinite) storage</li>
            <li>✅ <strong>Adaptive Learning:</strong> Semantic recall and pattern recognition</li>
            <li>✅ <strong>Nightly Reflections:</strong> Meta-learning and system optimization</li>
            <li>✅ <strong>Zero-Cost Routing:</strong> Routes exclusively through free-tier AI providers</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
