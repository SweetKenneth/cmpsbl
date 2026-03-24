/**
 * DevTools — Enhanced SDK Documentation & Developer Resources
 * Now includes interactive playground, signup, and more
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  MessageSquare, Settings, Download, FileText, Play, Key, Calculator
} from "lucide-react";
import { toast } from "sonner";
import { InteractivePlayground } from "@/components/developer/InteractivePlayground";
import { NpmPackagesGrid } from "@/components/home/NpmPackagesCTA";
import { DeveloperSignupForm } from "@/components/developer/DeveloperSignupForm";
import { PricingCalculator } from "@/components/developer/PricingCalculator";
import { DownloadableTemplates } from "@/components/developer/DownloadableTemplates";
import { MockUsageDashboard } from "@/components/developer/MockUsageDashboard";
import { LiveCodeExamples } from "@/components/developer/LiveCodeExamples";
import { IntegrationBadges } from "@/components/home/IntegrationBadges";

// SDK Installation - REST API gateway
const SDK_INSTALL_LOCAL = `// Install the official SDK
npm install @cmpsbl/sdk

// Or use the REST API directly
const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';`;

const SDK_USAGE = `const GATEWAY = 'https://api.cmpsbl.com/v1/substrate';

// MEMORY Organ — store a memory
await fetch(GATEWAY, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    module: 'MEMORY',
    action: 'store',
    input: { content: 'User prefers dark mode', agentId: 'my-agent' }
  })
});

// MEMORY Organ — recall memories
const res = await fetch(GATEWAY, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    module: 'MEMORY',
    action: 'recall',
    input: { query: 'user preferences', agentId: 'my-agent' }
  })
});
const { contextString } = await res.json();

// Or use the @cmpsbl/sdk
import { Engine } from '@cmpsbl/sdk';
const engine = new Engine('your-api-key');
const result = await engine.call('BRAIN', 'reason', 'Analyze trends');`;

const MODULES = [
  { id: 'core', name: 'CORE', icon: Cpu, color: 'text-neon-amber', desc: 'Scheduling & orchestration' },
  { id: 'ripple', name: 'RIPPLE', icon: Zap, color: 'text-neon-cyan', desc: 'Event bus & messaging' },
  { id: 'access', name: 'ACCESS', icon: Shield, color: 'text-neon-amber', desc: 'Identity & API keys' },
  { id: 'brain', name: 'BRAIN', icon: Brain, color: 'text-neon-purple', desc: 'Persistent memory & recall' },
  { id: 'decode', name: 'DECODE', icon: MessageSquare, color: 'text-neon-cyan', desc: 'Intent parsing & conversation' },
  { id: 'nexus', name: 'NEXUS', icon: Zap, color: 'text-neon-green', desc: 'Multi-provider AI routing' },
  { id: 'defense', name: 'DEFENSE', icon: Shield, color: 'text-destructive', desc: 'Adaptive security & threat detection' },
  { id: 'vision', name: 'VISION', icon: Eye, color: 'text-neon-blue', desc: 'Observability & monitoring' },
  { id: 'dream', name: 'DREAM', icon: Moon, color: 'text-neon-purple', desc: 'Offline learning & synthesis' },
];

const TABS = [
  { id: "playground", label: "Try It", icon: Play },
  { id: "signup", label: "Get API Key", icon: Key },
  { id: "sdk", label: "SDK", icon: Code },
  { id: "templates", label: "Templates", icon: Package },
  { id: "calculator", label: "ROI", icon: Calculator },
  { id: "docs", label: "Docs", icon: BookOpen },
];

export default function DevTools() {
  const [activeTab, setActiveTab] = useState("playground");
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <SEO
        title="Developer Tools | CMPSBL SDK, API & Documentation"
        description="Interactive playground, API keys, starter templates, and SDK documentation for building on CMPSBL. Get started for free."
        keywords={['CMPSBL SDK', 'AI memory API', 'developer tools', 'API documentation', 'starter templates']}
      />
      <div className="min-h-screen bg-background">
        <PublicNav />

        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-neon-purple/20">
                <Terminal className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Developer Tools</h1>
                <p className="text-muted-foreground">
                  Everything you need to build with persistent memory
                </p>
              </div>
            </div>
            
            {/* Integration badges */}
            <IntegrationBadges className="mt-6" />
            
            {/* Free SDK + Marketplace CTA */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Free Tier Available</span>
              </div>
              <Badge variant="outline" className="px-3 py-1.5">
                1,000 requests/day
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5">
                No credit card required
              </Badge>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 sm:gap-2 bg-muted/50 p-1.5 sm:p-2 w-full sm:w-fit overflow-x-auto">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Playground Tab */}
            <TabsContent value="playground" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <InteractivePlayground />
                <div className="space-y-6">
                  <DeveloperSignupForm />
                  <Card className="border-border/50 transition-all duration-300 hover:border-primary/15">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Quick Start Commands
                      </h3>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <code>memory.store "Hello world"</code>
                          <Badge variant="outline" className="text-[10px]">Store</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <code>memory.recall "greeting"</code>
                          <Badge variant="outline" className="text-[10px]">Recall</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <code>memory.status</code>
                          <Badge variant="outline" className="text-[10px]">Status</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Mock Usage Dashboard */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Usage Dashboard Preview
                </h2>
                <MockUsageDashboard />
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-6">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <DeveloperSignupForm className="max-w-md" />
                  <Card className="max-w-md">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold">What you get:</h3>
                      <ul className="space-y-2 text-sm">
                        {[
                          "1,000 API requests per day",
                          "Persistent memory storage",
                          "Hot/warm/cold memory tiers",
                          "SDK access for all frameworks",
                          "Real-time usage dashboard",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <LiveCodeExamples />
              </div>
            </TabsContent>

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
                    Import the SDK and start building in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Installation Method */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Current Method</Badge>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        {SDK_INSTALL_LOCAL}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(SDK_INSTALL_LOCAL, 'install')}
                      >
                        {copied === 'install' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                   {/* NPM Packages — Live */}
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Public NPM Packages</span>
                      <Badge className="text-xs bg-neon-green/10 text-neon-green border-neon-green/20">Live</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      11 modular packages under the <code className="text-primary font-mono">@cmpsbl</code> org on NPM.
                    </p>
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 font-mono text-xs">
                      <Terminal className="w-3 h-3 text-primary shrink-0" />
                      <code>npm i @cmpsbl/runtime @cmpsbl/intent @cmpsbl/react</code>
                    </div>
                  </div>

                  {/* Usage Example */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Usage Example</Badge>
                    </div>
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

              {/* NPM Packages Grid */}
              <NpmPackagesGrid />

              {/* Node Overview */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Nodes</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <Card key={mod.id} className="hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
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
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Starter Templates</h2>
                <p className="text-muted-foreground">
                  Download ready-to-use templates for your favorite framework
                </p>
              </div>
              <DownloadableTemplates />
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Live Code Examples</h2>
                <LiveCodeExamples />
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="space-y-6">
              <PricingCalculator className="max-w-4xl mx-auto" />
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="space-y-6">
              {/* Online Documentation Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Documentation & Resources
                  </CardTitle>
                  <CardDescription>
                    Complete guides and API reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Persistent Memory Guide", href: "/docs/persistent-memory", desc: "Complete memory SDK docs", badge: "Popular" },
                      { title: "Getting Started", href: "/documentation", desc: "Setup and configuration" },
                      { title: "API Reference", href: "/documentation#api", desc: "Full SDK API docs" },
                      { title: "Explore", href: "/explore", desc: "Browse capabilities and templates" },
                      { title: "CodeLab", href: "/codelab", desc: "Live API playground" },
                      { title: "Changelog", href: "/changelog", desc: "System evolution" },
                    ].map((link) => (
                      <Link
                        key={link.title}
                        to={link.href}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{link.title}</p>
                            {link.badge && (
                              <Badge variant="secondary" className="text-[10px]">{link.badge}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Node Quick Reference */}
              <Card>
                <CardHeader>
                  <CardTitle>Node Quick Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MODULES.slice(0, 9).map((mod) => {
                      const Icon = mod.icon;
                      return (
                        <div key={mod.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Icon className={`w-4 h-4 ${mod.color}`} />
                          <div>
                            <span className="text-sm font-medium">{mod.name}</span>
                            <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                          </div>
                        </div>
                      );
                    })}
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
