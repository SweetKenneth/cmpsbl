/**
 * CodeLab — Free Developer Playground for CMPSBL
 * A unique space for devs to explore, build, and launch with free templates
 */

import { useState } from "react";
import { TechShowcase } from "@/components/home/TechShowcase";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useMetric } from "@/stores/publicMetricsStore";
import { 
  Code, Terminal, Rocket, Download, BookOpen, Layers, Play, Copy, Check,
  Zap, Package, FileCode, ExternalLink, Sparkles, Brain, Shield, Moon,
  MessageSquare, Eye, Network, Settings, Activity, ArrowRight, Star,
  ChevronRight, Command, Plug
} from "lucide-react";
import { toast } from "sonner";

// Import templates with tier support
import { TEMPLATES, ALL_TEMPLATES, Template, getTemplateTier } from "@/data/templates";

// Components
import { SignalForge } from "@/components/codelab/SignalForge";
import { ExplorerCards } from "@/components/codelab/ExplorerCards";
import { CodeWorkbench } from "@/components/codelab/CodeWorkbench";
import { ProjectStarter } from "@/components/codelab/ProjectStarter";
import { ObservabilityHUD } from "@/components/codelab/ObservabilityHUD";
import { DialectSelector } from "@/components/codelab/DialectSelector";
import { CodeViewer } from "@/components/codelab/CodeViewer";
import { IntegrationsHub } from "@/components/codelab/IntegrationsHub";
import { SDKQuickReference } from "@/components/codelab/SDKQuickReference";
import { RecipeBuilder } from "@/components/codelab/RecipeBuilder";
import { EnvironmentSetup } from "@/components/codelab/EnvironmentSetup";
import { CommunityShowcase } from "@/components/codelab/CommunityShowcase";
import { useObsMode } from "@/lib/ui/obsfunction-mode";
import { renderDialect } from "@/lib/ui/dialect-render";
import { DIALECT_LABELS } from "@/lib/ui/display-dialect";

// Filter FREE templates only (tier-based)
const FREE_TEMPLATES = ALL_TEMPLATES.filter(t => getTemplateTier(t) === 'free');

// Group by category
const templatesByCategory = FREE_TEMPLATES.reduce((acc, t) => {
  if (!acc[t.category]) acc[t.category] = [];
  acc[t.category].push(t);
  return acc;
}, {} as Record<string, Template[]>);

const categoryMeta: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  brain: { icon: Brain, color: "text-violet-500", label: "Brain" },
  decode: { icon: MessageSquare, color: "text-cyan-500", label: "Decode" },
  defense: { icon: Shield, color: "text-rose-500", label: "Defense" },
  nexus: { icon: Network, color: "text-emerald-500", label: "Nexus" },
  vision: { icon: Eye, color: "text-blue-500", label: "Vision" },
  dream: { icon: Moon, color: "text-purple-500", label: "Dream" },
  system: { icon: Settings, color: "text-slate-500", label: "System" },
  world_engine: { icon: Layers, color: "text-amber-500", label: "Substrate" },
};

export default function CodeLab() {
  const [activeTab, setActiveTab] = useState("playground");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  
  // Centralized metrics
  const capabilitiesCount = useMetric('capabilitiesCount');
  const pipelinesCount = useMetric('synergyPipelinesCount');
  const modulesCount = useMetric('modulesCount');
  
  // Display dialect state
  const { enabled: obsEnabled, dialect } = useObsMode();

  // Always copy RAW code, never dialect-rendered
  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code); // RAW modern code only!
    setCopiedId(id);
    toast.success("Copied raw code to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  // Render code for display (dialect transformation)
  const displayCode = (code: string) => {
    return obsEnabled ? renderDialect(code, dialect) : code;
  };

  const filteredTemplates = selectedCategory 
    ? FREE_TEMPLATES.filter(t => t.category === selectedCategory)
    : FREE_TEMPLATES;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CodeLab — Free IDE & 30 Templates | CMPSBL"
        description="CMPSBL's interactive developer playground: 30 free starter templates, live code execution, API testing sandbox, and real-time preview. Build with persistent memory and DREAM cycles instantly."
        canonical="https://cmpsbl.com/codelab"
        keywords={["substrate", "AI development", "codelab", "CMPSBL", "developer tools", "free templates"]}
      />

      <PublicNav />
      <CodeLabOnboarding />

      {/* SIGNAL FORGE — Hero Template Generator */}
      <SignalForge />

      {/* Quick Stats Bar + Dialect Selector */}
      <section className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex items-center justify-start md:justify-center gap-4 md:gap-8 text-sm min-w-max">
              <div className="flex items-center gap-2 shrink-0">
                <Package className="w-4 h-4 text-emerald-500" />
                <span className="font-mono font-bold">{FREE_TEMPLATES.length}</span>
                <span className="text-muted-foreground whitespace-nowrap">Free Templates</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span className="font-mono font-bold">{modulesCount}</span>
                <span className="text-muted-foreground">Nodes</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-mono font-bold">100%</span>
                <span className="text-muted-foreground whitespace-nowrap">Free SDK</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-mono font-bold">MIT</span>
                <span className="text-muted-foreground">License</span>
              </div>
              
              {/* Dialect Selector - Display Only Toggle */}
              <div className="flex items-center gap-2 pl-4 border-l border-border/50 shrink-0">
                <Eye className="w-4 h-4 text-violet-500" />
                <span className="text-muted-foreground text-xs">Display:</span>
                <DialectSelector compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation - Mobile-optimized horizontal scroll */}
          <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex justify-start md:justify-center min-w-max pb-2">
              <TabsList className="inline-flex h-auto gap-1 p-1.5 bg-muted/50 rounded-xl border border-border/50">
                <TabsTrigger 
                  value="playground" 
                  className="flex items-center gap-1.5 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Command className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Playground</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="templates"
                  className="flex items-center gap-1.5 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-500 data-[state=active]:border-cyan-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Templates</span>
                  <Badge variant="secondary" className="ml-1 text-[10px] md:text-xs h-5">{FREE_TEMPLATES.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="explorer"
                  className="flex items-center gap-1.5 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-500 data-[state=active]:border-violet-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Layers className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Explorer</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="workbench"
                  className="flex items-center gap-1.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Terminal className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Workbench</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations"
                  className="flex items-center gap-1.5 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-500 data-[state=active]:border-violet-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Plug className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Integrations</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="recipes"
                  className="flex items-center gap-1.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Recipes</span>
                  <Badge variant="secondary" className="ml-1 text-[10px] md:text-xs h-5 bg-amber-500/20 text-amber-400">New</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="sdk"
                  className="flex items-center gap-1.5 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-500 data-[state=active]:border-cyan-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">SDK</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="showcase"
                  className="flex items-center gap-1.5 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500 data-[state=active]:border-purple-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Showcase</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="starter"
                  className="flex items-center gap-1.5 data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-500 data-[state=active]:border-rose-500/30 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent text-sm whitespace-nowrap touch-target"
                >
                  <Rocket className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Launch</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Playground Tab - Main landing with quick access */}
          <TabsContent value="playground" className="space-y-8">
            {/* SDK Quick Install */}
            <Card className="p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Get Started in Seconds</h2>
                      <p className="text-sm text-muted-foreground">Import the SDK and start building</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <pre className="bg-muted/80 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-border/50">
                        <code>import {"{ substrate }"} from '@cmpsbl/sdk';</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode("import { substrate } from '@cmpsbl/sdk';", "sdk")}
                      >
                        {copiedId === "sdk" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to="/devtools">
                          <FileCode className="w-4 h-4" />
                          Full SDK Docs
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link to="/developers">
                          <BookOpen className="w-4 h-4" />
                          API Reference
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="gap-2">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          GitHub
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Code Example - Uses dialect rendering */}
                <div className="flex-1 lg:max-w-md">
                  <CodeViewer 
                    code={`import { substrate } from './lib/substrate';

// Query brain memories
const memories = await substrate.brain.query(
  "What did the user prefer?"
);

// Generate with context
const response = await substrate.nexus.text(
  "Summarize: " + memories.data
);`}
                    filename="example.ts"
                    maxHeight="max-h-48"
                  />
                </div>
              </div>
            </Card>

            {/* Featured Free Templates */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Featured Free Templates</h2>
                    <p className="text-sm text-muted-foreground">Production-ready patterns you can use right now</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveTab("templates")}>
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {FREE_TEMPLATES.slice(0, 6).map((template) => {
                  const meta = categoryMeta[template.category];
                  const Icon = meta?.icon || Code;
                  return (
                    <Card 
                      key={template.id} 
                      className="p-4 hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => {
                        setExpandedTemplate(expandedTemplate === template.id ? null : template.id);
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${meta?.color || "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{template.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs capitalize">
                          {template.difficulty}
                        </Badge>
                      </div>
                      
                      {expandedTemplate === template.id && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                            ))}
                          </div>
                          <div className="relative group">
                            {dialect !== 'modern' && (
                              <Badge variant="outline" className="absolute top-2 left-2 text-xs border-dashed z-10 bg-background/80">
                                <Eye className="w-3 h-3 mr-1" />
                                {DIALECT_LABELS[dialect]} · Display Only
                              </Badge>
                            )}
                            <pre className="bg-muted/50 p-3 rounded text-xs font-mono overflow-auto max-h-40">
                              {displayCode(template.code.slice(0, 400))}...
                            </pre>
                            <Button
                              variant="default"
                              size="sm"
                              className="absolute bottom-2 right-2 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyCode(template.code, template.id); // Always raw code!
                              }}
                            >
                              {copiedId === template.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              Copy Raw
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6 hover:border-violet-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-violet-500 transition-colors">Module Explorer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Interactive API explorer for all substrate execution surfaces. Execute calls, see responses, copy code.
                </p>
                <Button variant="ghost" size="sm" className="gap-2 p-0" onClick={() => setActiveTab("explorer")}>
                  Explore Nodes <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>

              <Card className="p-6 hover:border-amber-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-amber-500 transition-colors">Code Workbench</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Write and test substrate calls in a live REPL. Save scripts, track history, debug responses.
                </p>
                <Button variant="ghost" size="sm" className="gap-2 p-0" onClick={() => setActiveTab("workbench")}>
                  Open Workbench <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>

              <Card className="p-6 hover:border-rose-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-rose-500 transition-colors">Project Launchers</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickstart templates for Next.js, Vercel, Supabase. Get from zero to deployed in minutes.
                </p>
                <Button variant="ghost" size="sm" className="gap-2 p-0" onClick={() => setActiveTab("starter")}>
                  Launch Project <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </div>

            {/* Premium Upsell - Links to Marketplace */}
            <Card className="p-6 border-primary/30 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">Premium</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Want More Advanced Templates?</h3>
                  <p className="text-muted-foreground">
                    97+ premium templates including Drift Prevention, Self-Healing Chatbots, 
                    Cognitive Firewalls, and the AI Template Generator.
                  </p>
                </div>
                <Button asChild size="lg" className="gap-2 shrink-0">
                  <Link to="/explore">
                    Browse Artifacts
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Templates Tab - Full free template browser */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Free Template Library</h2>
              <p className="text-muted-foreground">
                {FREE_TEMPLATES.length} production-ready templates — copy, paste, customize, ship
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All ({FREE_TEMPLATES.length})
              </Button>
              {Object.entries(templatesByCategory).map(([cat, templates]) => {
                const meta = categoryMeta[cat];
                const Icon = meta?.icon || Code;
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="gap-1"
                  >
                    <Icon className={`w-3 h-3 ${selectedCategory === cat ? "" : meta?.color}`} />
                    {meta?.label || cat} ({templates.length})
                  </Button>
                );
              })}
            </div>

            {/* Template Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const meta = categoryMeta[template.category];
                const Icon = meta?.icon || Code;
                const isExpanded = expandedTemplate === template.id;
                
                return (
                  <Card 
                    key={template.id} 
                    className={`p-4 transition-all cursor-pointer ${isExpanded ? "border-primary" : "hover:border-primary/50"}`}
                    onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${meta?.color || "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{template.name}</h3>
                          <Badge variant="outline" className="shrink-0 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                            Free
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {template.estimatedTime}
                      </span>
                      <Badge variant="secondary" className="capitalize">{template.difficulty}</Badge>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-border/50 space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                        <div className="relative group">
                          {dialect !== 'modern' && (
                            <Badge variant="outline" className="absolute top-2 left-2 text-xs border-dashed z-10 bg-background/80">
                              <Eye className="w-3 h-3 mr-1" />
                              {DIALECT_LABELS[dialect]} · Display Only
                            </Badge>
                          )}
                          <pre className="bg-muted/50 p-3 rounded text-xs font-mono overflow-auto max-h-64">
                            {displayCode(template.code)}
                          </pre>
                          <Button
                            variant="default"
                            size="sm"
                            className="absolute bottom-2 right-2 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCode(template.code, template.id); // Always raw code!
                            }}
                          >
                            {copiedId === template.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copy Raw
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Marketplace Link */}
            <Card className="p-6 text-center border-dashed">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Need Premium Templates?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced patterns like Drift Prevention Engine, Self-Healing Chatbots, 
                and the AI Template Generator are available in the Explore section.
              </p>
              <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link to="/explore">
                  Browse Artifacts <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </TabsContent>

          {/* Explorer Tab */}
          <TabsContent value="explorer">
            <ExplorerCards onOpenWorkbench={() => setActiveTab("workbench")} />
          </TabsContent>

          {/* Workbench Tab */}
          <TabsContent value="workbench">
            <CodeWorkbench />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <IntegrationsHub />
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes">
            <RecipeBuilder />
          </TabsContent>

          {/* SDK Reference Tab */}
          <TabsContent value="sdk" className="space-y-8">
            <TechShowcase />
            <SDKQuickReference />
          </TabsContent>

          {/* Showcase Tab */}
          <TabsContent value="showcase">
            <CommunityShowcase />
          </TabsContent>

          {/* Starter Tab */}
          <TabsContent value="starter">
            <ProjectStarter />
          </TabsContent>
        </Tabs>
      </main>

      <EnhancedFooter />
    </div>
  );
}
