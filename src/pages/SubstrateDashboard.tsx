/**
 * promptfluid® substrate — Dashboard
 * v2026.01 — Cognitive Orchestration Substrate
 * 
 * Unified control center for all substrate modules:
 * - Brain: Memory, learning, reflection
 * - Decode: Intent decoding, chat, dreams
 * - Defense: Bot detection, threat analysis
 * - Nexus: Multi-provider AI routing
 * - Vision: Observability, metrics, health
 */

import { useState, useEffect } from "react";
import { Brain, Shield, MessageSquare, Zap, Eye, Activity, RefreshCw, CheckCircle2, AlertTriangle, Layers, ArrowRight, Network } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { substrate } from "@/lib/substrate";
import { useSubstrateContext } from "@/components/substrate/SubstrateProvider";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SubstrateStatus {
  healthy: boolean;
  checks: {
    brain: boolean;
    defense: boolean;
    nexus: boolean;
  };
  version: string;
}

interface SubstrateMetrics {
  brain_memories: number;
  defense_events: number;
  decode_conversations: number;
}

export default function SubstrateDashboard() {
  const { initialized, modules: contextModules, overallHealth, refresh: contextRefresh } = useSubstrateContext();
  const [status, setStatus] = useState<SubstrateStatus | null>(null);
  const [metrics, setMetrics] = useState<SubstrateMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      // Use substrate client directly
      const visionHealth = await substrate.vision.health();
      const visionMetrics = await substrate.vision.metrics();
      
      if (visionHealth.success && visionHealth.data) {
        setStatus(visionHealth.data as unknown as SubstrateStatus);
      }

      if (visionMetrics.success && visionMetrics.data) {
        const metricsData = visionMetrics.data as { metrics?: SubstrateMetrics };
        if (metricsData.metrics) {
          setMetrics(metricsData.metrics);
        }
      }
    } catch (error) {
      console.error("Status fetch error:", error);
      toast.error("Failed to fetch substrate status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      id: "brain",
      name: "Brain",
      description: "Memory, learning cycles, reflection",
      icon: Brain,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      actions: ["query", "remember", "reflect", "reinforce", "dream"],
    },
    {
      id: "decode",
      name: "Decode",
      description: "Intent decoding, chat, dreams",
      icon: MessageSquare,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      actions: ["chat", "dream", "propose", "status"],
    },
    {
      id: "defense",
      name: "Defense",
      description: "Bot detection, threat analysis",
      icon: Shield,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      actions: ["analyze", "reputation", "status"],
    },
    {
      id: "nexus",
      name: "Nexus",
      description: "Multi-provider AI routing",
      icon: Zap,
      color: "text-green-500",
      bg: "bg-green-500/10",
      actions: ["route", "status"],
    },
    {
      id: "vision",
      name: "Vision",
      description: "Observability, metrics, health",
      icon: Eye,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      actions: ["health", "metrics"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Substrate Dashboard — promptfluid®"
        description="Cognitive orchestration substrate control center. Monitor all 12 modules including brain, decode, defense, nexus, vision, dream, and integration."
        canonical="https://promptfluid.com/substrate"
        keywords={["cognitive orchestration", "AI substrate", "promptfluid dashboard", "integration module"]}
      />

      <PublicNav />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Layers className="w-3 h-3 mr-2" />
            Live Infrastructure
          </Badge>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">promptfluid® substrate</h1>
              <p className="text-muted-foreground">v2026.01 — Cognitive Orchestration Substrate</p>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            Unified control center for the AI orchestration substrate. All five modules accessible through one endpoint.
          </p>
          
          <div className="flex gap-3">
            <Link to="/investors">
              <Button variant="outline" size="sm" className="gap-2">
                Acquisition Info
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">

        {/* Status Bar */}
        <Card className="p-6 mb-8 border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {status?.healthy ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All Systems Operational
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Degraded Performance
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Version: {status?.version || "loading..."}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Brain className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.brain_memories.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Brain Memories</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.defense_events.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Defense Events</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.decode_conversations?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Decode Conversations</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modules */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {modules.map((m) => (
              <TabsTrigger key={m.id} value={m.id}>
                {m.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${module.bg} flex items-center justify-center`}>
                      <module.icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{module.name}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    {status?.checks?.[module.id as keyof typeof status.checks] !== undefined && (
                      <Badge
                        className={
                          status.checks[module.id as keyof typeof status.checks]
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      >
                        {status.checks[module.id as keyof typeof status.checks] ? "Online" : "Offline"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {module.actions.map((action) => (
                      <Badge key={action} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {modules.map((module) => (
            <TabsContent key={module.id} value={module.id}>
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl ${module.bg} flex items-center justify-center`}>
                    <module.icon className={`w-7 h-7 ${module.color}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{module.name} Module</h2>
                    <p className="text-muted-foreground">{module.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Available Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {module.actions.map((action) => (
                      <div key={action} className="p-4 bg-muted/30 rounded-lg border">
                        <code className="text-sm font-mono text-primary">
                          POST /pf-substrate
                        </code>
                        <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto">
{`{
  "module": "${module.id}",
  "action": "${action}",
  "data": { ... }
}`}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* API Reference */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">API Reference</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Base Endpoint</h3>
              <code className="block bg-muted/30 p-4 rounded-lg text-sm">
                POST /functions/v1/pf-substrate
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Request Format</h3>
              <pre className="bg-muted/30 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "module": "brain" | "decode" | "defense" | "nexus" | "vision" | "dream" | "core" | "ripple" | "access" | "system" | "modernizer" | "integration",
  "action": "<module-specific-action>",
  "data": { <action-parameters> }
}`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-8 mt-8 border-primary/20 bg-primary/5">
          <h2 className="text-xl font-bold mb-2">Licensing & Inquiries</h2>
          <p className="text-muted-foreground mb-4">
            promptfluid® is a registered trademark. For ownership inquiries, licensing arrangements, or enterprise partnerships:
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span><strong>Founder:</strong> Kenneth E Sweet Jr</span>
            <span><strong>Email:</strong> promptfluid@gmail.com</span>
            <span><strong>Phone:</strong> (760) FLUID-AI</span>
          </div>
        </Card>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
