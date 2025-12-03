import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, AlertTriangle, TrendingUp, Zap, Database } from "lucide-react";
import { toast } from "sonner";

export default function BrainML() {
  const [overview, setOverview] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async (): Promise<void> => {
    try {
      setLoading(true);
      const { supabase } = await import("@/integrations/supabase/client");
      
      const [modelsRes, anomaliesRes, predictionsRes] = await Promise.all([
        supabase.from('pf_brain_ml_models').select('*'),
        supabase.from('pf_brain_anomalies').select('*', { count: 'exact' }),
        supabase.from('pf_brain_ml_predictions').select('confidence', { count: 'exact' })
      ]);

      const activeModels = modelsRes.data?.filter(m => m.status === 'active').length || 0;
      const totalModels = modelsRes.data?.length || 0;
      const openAnomalies = anomaliesRes.data?.filter(a => !a.resolved).length || 0;
      const totalPredictions = predictionsRes.count || 0;
      const avgAccuracy = modelsRes.data?.reduce((acc, m) => acc + (Number(m.accuracy) || 0), 0) / (totalModels || 1);

      setOverview({
        active_models: activeModels,
        total_models: totalModels,
        open_anomalies: openAnomalies,
        total_predictions: totalPredictions,
        avg_model_accuracy: avgAccuracy
      });

      setModels(modelsRes.data || []);
    } catch (error) {
      console.error("Failed to load ML overview:", error);
      toast.error("Failed to load ML overview");
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (): Promise<void> => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('pf_brain_ml_models').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      toast.error("Failed to load models");
    }
  };

  const loadAnomalies = async (): Promise<void> => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('pf_brain_anomalies').select('*').order('detected_at', { ascending: false }).limit(50);
      if (error) throw error;
      setAnomalies(data || []);
    } catch (error) {
      toast.error("Failed to load anomalies");
    }
  };

  const loadPatterns = async (): Promise<void> => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('pf_brain_behavioral_patterns').select('*').order('last_seen', { ascending: false }).limit(50);
      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      toast.error("Failed to load patterns");
    }
  };

  const loadPredictions = async (): Promise<void> => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.from('pf_brain_ml_predictions').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      toast.error("Failed to load predictions");
    }
  };

  const getSeverityColor = (severity: string): "destructive" | "default" | "secondary" | "outline" => {
    if (severity === "critical") return "destructive";
    if (severity === "high") return "default";
    if (severity === "medium") return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Brain ML Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PromptFluid Brain ML
            </h1>
          </div>
          <p className="text-muted-foreground">
            Phase 2: Machine Learning Intelligence Engine
          </p>
          <Badge variant="outline" className="text-sm">
            <Zap className="h-3 w-3 mr-1" />
            Active Learning System
          </Badge>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Models</p>
                  <p className="text-3xl font-bold text-primary">{overview.active_models}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {overview.total_models} total
                  </p>
                </div>
                <Database className="h-10 w-10 text-primary/40" />
              </div>
            </Card>

            <Card className="p-6 border-orange-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Anomalies</p>
                  <p className="text-3xl font-bold text-orange-500">{overview.open_anomalies}</p>
                  <p className="text-xs text-muted-foreground mt-1">Require attention</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500/40" />
              </div>
            </Card>

            <Card className="p-6 border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Predictions</p>
                  <p className="text-3xl font-bold text-green-500">
                    {overview.total_predictions?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg Accuracy: {(Number(overview.avg_model_accuracy) * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500/40" />
              </div>
            </Card>
          </div>
        )}

        {/* ML Intelligence Tabs */}
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models" onClick={loadModels}>
              <Database className="h-4 w-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="anomalies" onClick={loadAnomalies}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="patterns" onClick={loadPatterns}>
              <Activity className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="predictions" onClick={loadPredictions}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <div className="grid gap-4">
              {models.map((model) => (
                <Card key={model.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{model.model_name}</h3>
                        <Badge variant="outline">{model.model_type}</Badge>
                        <Badge variant={model.status === "active" ? "default" : "secondary"}>
                          {model.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p className="font-mono text-green-500">
                            {(Number(model.accuracy) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Precision</p>
                          <p className="font-mono">{(Number(model.precision) * 100).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Recall</p>
                          <p className="font-mono">{(Number(model.recall) * 100).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">F1 Score</p>
                          <p className="font-mono">{(Number(model.f1_score) * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Architecture: {model.architecture} | Version: {model.version}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <div className="grid gap-4">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <h4 className="font-semibold">{anomaly.anomaly_type}</h4>
                        <Badge variant={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        {!anomaly.resolved && <Badge variant="outline">Open</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Score: {Number(anomaly.anomaly_score).toFixed(4)} | Source: {anomaly.source_module}
                        {anomaly.source_ip && ` | IP: ${anomaly.source_ip}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Detected: {new Date(anomaly.detected_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid gap-4">
              {patterns.map((pattern) => (
                <Card key={pattern.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{pattern.pattern_name}</h4>
                        <Badge
                          variant={
                            pattern.pattern_type === "malicious"
                              ? "destructive"
                              : pattern.pattern_type === "suspicious"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {pattern.pattern_type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className="font-mono">
                            {(Number(pattern.confidence_score) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Occurrences</p>
                          <p className="font-mono">{pattern.occurrence_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Score</p>
                          <p className="font-mono">{pattern.risk_score}/100</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last seen: {new Date(pattern.last_seen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid gap-4">
              {predictions.slice(0, 50).map((pred) => (
                <Card key={pred.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{pred.prediction_type}</h4>
                        {pred.is_anomaly && (
                          <Badge variant="destructive">Anomaly Detected</Badge>
                        )}
                        <Badge variant="outline">
                          Confidence: {(Number(pred.confidence) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pred.source_module}
                        {pred.source_ip && ` | IP: ${pred.source_ip}`}
                        {pred.threat_level && ` | Threat: ${pred.threat_level}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pred.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* API Documentation */}
        <Card className="p-6 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Brain ML API Endpoints</h3>
          <div className="space-y-2 text-sm font-mono">
            <p className="text-muted-foreground">POST https://api.promptfluid.com/pf-brain-ml-train</p>
            <p className="text-muted-foreground">POST https://api.promptfluid.com/pf-brain-ml-predict</p>
            <p className="text-muted-foreground">GET https://api.promptfluid.com/pf-brain-ml-analyze</p>
          </div>
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-xs text-destructive font-semibold mb-2">⚖️ LEGAL NOTICE</p>
            <p className="text-xs text-muted-foreground">
              These are private API endpoints of PromptFluid™ (Trademark Pending, November 2025).
              Unauthorized access will result in immediate legal action including both compensatory
              and criminal prosecution. All access attempts are logged and monitored.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
