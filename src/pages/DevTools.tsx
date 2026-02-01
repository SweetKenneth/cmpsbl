/**
 * DevTools — SDK Documentation & Developer Resources
 * Streamlined to SDK + Documentation tabs only
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code, Sparkles, Terminal, BookOpen, ExternalLink, Copy, Check, 
  Package, ArrowRight, Cpu, Brain, Shield, Zap, Eye, Moon, 
  MessageSquare, Settings, Download, FileText
} from "lucide-react";
import { toast } from "sonner";

const SDK_INSTALL = `npm install @promptfluid/substrate`;

const SDK_USAGE = `import { Substrate } from '@promptfluid/substrate';

// Initialize with your API key
const substrate = new Substrate({
  apiKey: process.env.PROMPTFLUID_API_KEY,
});

// Brain module - persistent memory
await substrate.brain.remember('User prefers dark mode', 'preference');
const memories = await substrate.brain.query('user preferences', 5);

// Decode module - intent understanding
const intent = await substrate.decode.intent('Book a flight to Tokyo');
const chat = await substrate.decode.chat('Hello!', 'session-123');

// Defense module - threat protection
const threat = await substrate.defense.analyze({ fingerprint });
const reputation = await substrate.defense.reputation(clientIp);

// Nexus module - AI routing
const response = await substrate.nexus.route('Explain quantum computing');
const image = await substrate.nexus.image('A futuristic city at sunset');

// Vision module - observability
const health = await substrate.vision.healthSnapshot();
await substrate.vision.alert('warn', 'High latency detected');

// Dream module - cognitive synthesis
await substrate.dream.feed('I was floating through space...', 'dream');
const interpretation = await substrate.dream.interpret(dreamText);`;

const MODULES = [
  { id: 'core', name: 'Core', icon: Cpu, color: 'text-orange-400', desc: 'Kernel scheduling & orchestration' },
  { id: 'ripple', name: 'Ripple', icon: Zap, color: 'text-teal-400', desc: 'Message bus & events' },
  { id: 'access', name: 'Access', icon: Shield, color: 'text-amber-400', desc: 'Identity & API keys' },
  { id: 'brain', name: 'Brain', icon: Brain, color: 'text-violet-400', desc: 'Persistent memory & knowledge graphs' },
  { id: 'decode', name: 'Decode', icon: MessageSquare, color: 'text-cyan-400', desc: 'Intent parsing & conversation' },
  { id: 'nexus', name: 'Nexus', icon: Zap, color: 'text-green-400', desc: 'Multi-model AI routing' },
  { id: 'defense', name: 'Defense', icon: Shield, color: 'text-red-400', desc: 'Bot detection & threat analysis' },
  { id: 'vision', name: 'Vision', icon: Eye, color: 'text-blue-400', desc: 'Observability & monitoring' },
  { id: 'dream', name: 'Dream', icon: Moon, color: 'text-purple-400', desc: 'Cognitive synthesis & evolution' },
  { id: 'system', name: 'System', icon: Settings, color: 'text-slate-400', desc: 'Configuration & backups' },
  { id: 'modernizer', name: 'Modernizer', icon: Sparkles, color: 'text-pink-400', desc: 'Self-improvement engine' },
  { id: 'inclusive', name: 'Inclusive', icon: Eye, color: 'text-indigo-400', desc: 'Accessibility scanning & WCAG enforcement' },
  { id: 'cortex', name: 'Cortex', icon: Brain, color: 'text-rose-400', desc: 'Policy intent & PAAEL orchestration' },
  { id: 'integration', name: 'Integration', icon: Cpu, color: 'text-emerald-400', desc: 'Enterprise adapters & webhooks' },
];

const DOWNLOADABLE_DOCS = [
  { 
    title: "Quick Start Guide", 
    file: "QUICK-START.md", 
    desc: "Get up and running in 5 minutes",
    size: "12 KB"
  },
  { 
    title: "API Reference", 
    file: "API-REFERENCE.md", 
    desc: "Complete SDK API documentation",
    size: "45 KB"
  },
  { 
    title: "Architecture Overview", 
    file: "ARCHITECTURE.md", 
    desc: "System design & module relationships",
    size: "28 KB"
  },
  { 
    title: "Migration Guide", 
    file: "MIGRATION.md", 
    desc: "Upgrading from previous versions",
    size: "8 KB"
  },
];

const TABS = [
  { id: "sdk", label: "SDK", icon: Code },
  { id: "docs", label: "Documentation", icon: BookOpen },
];

export default function DevTools() {
  const [activeTab, setActiveTab] = useState("sdk");
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadDoc = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/docs/${filename}`;
    link.download = filename;
    link.click();
    toast.success(`Downloading ${filename}`);
  };

  return (
    <>
      <SEO
        title="Developer Tools | CMPSBL SDK & Documentation"
        description="SDK documentation and downloadable resources for building on CMPSBL. SDK is 100% free."
      />
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Terminal className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Developer Tools</h1>
                <p className="text-muted-foreground">
                  SDK documentation and resources for CMPSBL
                </p>
              </div>
            </div>
            
            {/* Free SDK + Marketplace CTA */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-system-green/10 border border-system-green/30 text-system-green text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">SDK is 100% FREE</span>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to="/marketplace">
                  <Package className="w-4 h-4" />
                  Browse Templates
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex h-auto gap-2 bg-muted/50 p-2 w-fit">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* SDK Tab */}
            <TabsContent value="sdk" className="space-y-6">
              {/* Quick Start */}
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Quick Start
                  </CardTitle>
                  <CardDescription>
                    Install the SDK and start building in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Install Command */}
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      {SDK_INSTALL}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(SDK_INSTALL, 'install')}
                    >
                      {copied === 'install' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Usage Example */}
                  <div className="relative">
                    <ScrollArea className="h-[400px]">
                      <pre className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        {SDK_USAGE}
                      </pre>
                    </ScrollArea>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(SDK_USAGE, 'usage')}
                    >
                      {copied === 'usage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Module Overview */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MODULES.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Card key={mod.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${mod.color}`} />
                          <span className="font-medium">{mod.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{mod.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="space-y-6">
              {/* Downloadable Docs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Downloadable Documentation
                  </CardTitle>
                  <CardDescription>
                    Download our complete documentation for offline reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {DOWNLOADABLE_DOCS.map((doc) => (
                      <Card key={doc.file} className="border-border/50 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{doc.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{doc.desc}</p>
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {doc.size}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDoc(doc.file)}
                              className="shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Online Documentation Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Online Resources
                  </CardTitle>
                  <CardDescription>
                    Additional documentation and community resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Getting Started", href: "/documentation", desc: "Setup and configuration" },
                      { title: "API Reference", href: "/documentation#api", desc: "Full SDK API docs" },
                      { title: "Examples", href: "/documentation#examples", desc: "Code samples" },
                      { title: "Templates", href: "/marketplace", desc: "Pre-built starters" },
                      { title: "Evolution Log", href: "/changelog", desc: "System evolution" },
                      { title: "GitHub", href: "https://github.com/promptfluid", desc: "Source code" },
                    ].map((link) => (
                      <Link
                        key={link.title}
                        to={link.href}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all group"
                      >
                        <div>
                          <p className="font-medium text-sm">{link.title}</p>
                          <p className="text-xs text-muted-foreground">{link.desc}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
}
