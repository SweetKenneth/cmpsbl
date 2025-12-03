import { BookOpen, Code, Zap, Shield, Database, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documentation() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground">Complete guide to PromptFluid ecosystem</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brain">Brain</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">PromptFluid Ecosystem</h2>
            <p className="text-muted-foreground mb-4">
              PromptFluid is a comprehensive AI orchestration platform that combines adaptive intelligence,
              security, and creativity into a seamless ecosystem.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {[
                { icon: Zap, title: "Brain", desc: "Adaptive AI learning core" },
                { icon: Shield, title: "Defense", desc: "Bot protection system" },
                { icon: Database, title: "Nexus", desc: "API orchestration mesh" },
                { icon: FileText, title: "Studio", desc: "App builder platform" },
              ].map((item) => (
                <div key={item.title} className="p-4 border rounded-lg">
                  <item.icon className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="brain" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">PromptFluid Brain</h2>
            <p className="text-muted-foreground mb-4">
              The Brain is the adaptive intelligence core that learns, evolves, and optimizes system behavior.
            </p>
            <div className="space-y-3 mt-6">
              <div className="p-4 border-l-4 border-primary bg-secondary/20 rounded">
                <h4 className="font-semibold mb-1">Training</h4>
                <p className="text-sm text-muted-foreground">
                  The Brain automatically trains on system events every 4 hours via cron job.
                </p>
              </div>
              <div className="p-4 border-l-4 border-primary bg-secondary/20 rounded">
                <h4 className="font-semibold mb-1">Memory</h4>
                <p className="text-sm text-muted-foreground">
                  Vector embeddings store learned patterns for instant recall and pattern matching.
                </p>
              </div>
              <div className="p-4 border-l-4 border-primary bg-secondary/20 rounded">
                <h4 className="font-semibold mb-1">Reinforcement</h4>
                <p className="text-sm text-muted-foreground">
                  Successful patterns are reinforced hourly to improve accuracy over time.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="defense" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">PromptFluid Defense</h2>
            <p className="text-muted-foreground mb-4">
              Advanced bot protection with behavioral analysis and device fingerprinting.
            </p>
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-secondary/20 rounded">
                <h4 className="font-semibold mb-2">Bot Detection</h4>
                <code className="text-xs block bg-background p-2 rounded">
                  POST /functions/v1/bot-detection
                </code>
              </div>
              <div className="p-4 bg-secondary/20 rounded">
                <h4 className="font-semibold mb-2">Behavioral Analysis</h4>
                <code className="text-xs block bg-background p-2 rounded">
                  POST /functions/v1/behavioral-analysis
                </code>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">API Reference</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All API requests require authentication via API key header.
                </p>
                <code className="block bg-secondary/20 p-3 rounded text-xs">
                  X-API-Key: pfdef_your_api_key_here
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="block bg-secondary/20 p-3 rounded text-xs">
                  https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1
                </code>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Integrations</h2>
            <div className="grid gap-4">
              {[
                { name: "Groq", desc: "Fast reasoning and logic processing" },
                { name: "OpenAI", desc: "Creation and synthesis tasks" },
                { name: "Anthropic", desc: "Ethics and structured analysis" },
                { name: "Lovable AI", desc: "Gemini & GPT unified gateway" },
              ].map((integration) => (
                <div key={integration.name} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">{integration.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
