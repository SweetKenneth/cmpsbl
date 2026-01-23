import { useState } from "react";
import { SEO } from "@/components/SEO";
import PublicNav from "@/components/PublicNav";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TemplateGallery } from "@/components/devtools/TemplateGallery";
import { PluginMarketplace } from "@/components/devtools/PluginMarketplace";
import { EventReplayTimeline } from "@/components/devtools/EventReplayTimeline";
import { LiveDebugger } from "@/components/devtools/LiveDebugger";
import {
  Package,
  Puzzle,
  History,
  Activity,
  Sparkles,
} from "lucide-react";

const TABS = [
  { id: "templates", label: "Templates", icon: Package, badge: "8" },
  { id: "plugins", label: "Plugins", icon: Puzzle },
  { id: "debugger", label: "Live Debugger", icon: Activity, isNew: true },
  { id: "replay", label: "Event Replay", icon: History, isNew: true },
];

export default function DevTools() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <>
      <SEO
        title="Developer Tools | promptfluid®"
        description="Templates, plugins, debugger, and event replay for building on the promptfluid® Substrate."
      />
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Developer Tools</h1>
                <p className="text-muted-foreground">
                  Templates, plugins, debugging, and replay for the Substrate
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                  {tab.isNew && (
                    <Badge className="ml-1 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                      New
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="templates">
              <TemplateGallery />
            </TabsContent>

            <TabsContent value="plugins">
              <PluginMarketplace />
            </TabsContent>

            <TabsContent value="debugger">
              <LiveDebugger />
            </TabsContent>

            <TabsContent value="replay">
              <EventReplayTimeline />
            </TabsContent>
          </Tabs>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
}
