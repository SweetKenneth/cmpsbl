/**
 * CodeLab — Developer Workbench for the promptfluid® Substrate
 * Build apps that dream, remember, self-reflect, and defend themselves.
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { 
  Code, Layers, Play, Terminal, Rocket, Activity,
  Beaker
} from "lucide-react";

// Surface Components
import { ExplorerCards } from "@/components/codelab/ExplorerCards";
import { CodeWorkbench } from "@/components/codelab/CodeWorkbench";
import { ProjectStarter } from "@/components/codelab/ProjectStarter";
import { TemplateGenerator } from "@/components/codelab/TemplateGenerator";
import { ObservabilityHUD } from "@/components/codelab/ObservabilityHUD";

export default function CodeLab() {
  const [activeTab, setActiveTab] = useState("explorer");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CodeLab — Developer Workbench | promptfluid®"
        description="Build apps that dream, remember, self-reflect, and defend themselves. CodeLab gives you everything you need to explore and build on the substrate."
        canonical="https://promptfluid.com/codelab"
        keywords={["substrate", "AI development", "codelab", "promptfluid", "developer tools"]}
      />

      <PublicNav />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Beaker className="w-3 h-3 mr-2" />
            Developer Workbench
          </Badge>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">CodeLab</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Explore, test, and build on the substrate
              </p>
            </div>
          </div>
          
          <p className="text-muted-foreground max-w-3xl text-sm md:text-base">
            Build apps that dream, remember, self-reflect, and defend themselves. 
            CodeLab gives you everything you need to explore and build on the substrate.
          </p>
        </div>

        {/* Main Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="explorer" 
                className="flex items-center gap-2 data-[state=active]:bg-background text-xs sm:text-sm"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Explorer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="workbench"
                className="flex items-center gap-2 data-[state=active]:bg-background text-xs sm:text-sm"
              >
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">Workbench</span>
              </TabsTrigger>
              <TabsTrigger 
                value="starter"
                className="flex items-center gap-2 data-[state=active]:bg-background text-xs sm:text-sm"
              >
                <Rocket className="w-4 h-4" />
                <span className="hidden sm:inline">Starter</span>
              </TabsTrigger>
              <TabsTrigger 
                value="templates"
                className="flex items-center gap-2 data-[state=active]:bg-background text-xs sm:text-sm"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger 
                value="observability"
                className="flex items-center gap-2 data-[state=active]:bg-background text-xs sm:text-sm"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">HUD</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explorer" className="mt-6">
              <ExplorerCards onOpenWorkbench={(module) => {
                setActiveTab("workbench");
              }} />
            </TabsContent>

            <TabsContent value="workbench" className="mt-6">
              <CodeWorkbench />
            </TabsContent>

            <TabsContent value="starter" className="mt-6">
              <ProjectStarter />
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <TemplateGenerator />
            </TabsContent>

            <TabsContent value="observability" className="mt-6">
              <ObservabilityHUD />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
