/**
 * SDK Playground — Interactive developer testing surface
 * Test @cmpsbl/sdk methods against the live substrate
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Play, Copy, Terminal, Zap, Brain, Search,
  Package, Loader2, CheckCircle, Clock, ArrowRight,
  Code2, Sparkles, Download, ChevronDown
} from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';

interface PlaygroundResult {
  success: boolean;
  data: Record<string, unknown>;
  latencyMs: number;
  provider?: string;
  timestamp: string;
}

const EXAMPLES = [
  {
    id: 'discover',
    label: 'Discover',
    icon: Search,
    description: 'Find patterns in system behavior',
    code: `import { CMPSBL } from "@cmpsbl/sdk";

const cmpsbl = new CMPSBL();

const result = await cmpsbl.discover({
  input: "track user behavior across sessions"
});

console.log(result);`,
    module: 'brain',
    action: 'analyze',
    payload: { prompt: 'Analyze system behavior patterns for reusable memory chains. Focus on cross-session continuity, user preference retention, and behavioral prediction opportunities.' },
  },
  {
    id: 'capture',
    label: 'Capture',
    icon: Download,
    description: 'Capture a memory chain to the stream',
    code: `import { CMPSBL } from "@cmpsbl/sdk";

const cmpsbl = new CMPSBL();

const captured = await cmpsbl.capture({
  pattern: "session-continuity",
  context: { source: "playground", type: "behavioral" }
});

console.log(captured);`,
    module: 'memory',
    action: 'store',
    payload: { content: 'SDK Playground capture: session-continuity pattern detected from interactive testing', layer: 'hot', metadata: { source: 'sdk-playground', pattern_type: 'behavioral' } },
  },
  {
    id: 'route',
    label: 'Route',
    icon: Zap,
    description: 'Route a task through NEXUS',
    code: `import { CMPSBL } from "@cmpsbl/sdk";

const cmpsbl = new CMPSBL();

const routed = await cmpsbl.route({
  task: "summarize recent system activity",
  priority: "standard"
});

console.log(routed);`,
    module: 'nexus',
    action: 'text',
    payload: { prompt: 'Summarize the current state of the cognitive substrate. Include: active primitives, recent memory chains, health status, and any notable patterns discovered in the last cycle.' },
  },
  {
    id: 'health',
    label: 'Health',
    icon: Brain,
    description: 'Check substrate health snapshot',
    code: `import { CMPSBL } from "@cmpsbl/sdk";

const cmpsbl = new CMPSBL();

const health = await cmpsbl.health();

console.log(health);`,
    module: 'vision',
    action: 'health_snapshot',
    payload: {},
  },
  {
    id: 'mesh',
    label: 'Mesh',
    icon: Sparkles,
    description: 'Query the intent mesh',
    code: `import { CMPSBL } from "@cmpsbl/sdk";

const cmpsbl = new CMPSBL();

const mesh = await cmpsbl.mesh.status();

console.log(mesh);`,
    module: 'cortex',
    action: 'status',
    payload: {},
  },
];

export default function SDKPlayground() {
  const [activeExample, setActiveExample] = useState(EXAMPLES[0]);
  const [customPayload, setCustomPayload] = useState('');
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<PlaygroundResult[]>([]);

  const runExample = useCallback(async (example: typeof EXAMPLES[0]) => {
    setIsRunning(true);
    setResult(null);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: example.module,
          action: example.action,
          ...example.payload,
        },
      });

      if (error) throw error;

      const playgroundResult: PlaygroundResult = {
        success: data?.success ?? true,
        data: data || {},
        latencyMs: Date.now() - startTime,
        provider: data?.provider,
        timestamp: new Date().toISOString(),
      };

      setResult(playgroundResult);
      setHistory(prev => [playgroundResult, ...prev].slice(0, 10));
      toast.success(`${example.label} completed in ${playgroundResult.latencyMs}ms`);
    } catch (err: any) {
      const errorResult: PlaygroundResult = {
        success: false,
        data: { error: err.message },
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      setResult(errorResult);
      toast.error(`Failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runCustom = useCallback(async () => {
    if (!customPayload.trim()) return;
    setIsRunning(true);
    setResult(null);
    const startTime = Date.now();

    try {
      const parsed = JSON.parse(customPayload);
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: parsed,
      });

      if (error) throw error;

      const playgroundResult: PlaygroundResult = {
        success: data?.success ?? true,
        data: data || {},
        latencyMs: Date.now() - startTime,
        provider: data?.provider,
        timestamp: new Date().toISOString(),
      };

      setResult(playgroundResult);
      setHistory(prev => [playgroundResult, ...prev].slice(0, 10));
    } catch (err: any) {
      const errorResult: PlaygroundResult = {
        success: false,
        data: { error: err.message },
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      setResult(errorResult);
    } finally {
      setIsRunning(false);
    }
  }, [customPayload]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 gap-2 border-primary/30">
            <Terminal className="w-3 h-3" />
            Developer Playground
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            SDK <span className="text-primary">Playground</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test <code className="text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-sm">@cmpsbl/sdk</code> methods 
            against the live substrate. Every call hits real infrastructure — no mocks, no simulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Examples + Code */}
          <div className="lg:col-span-5 space-y-4">
            {/* Example Selector */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  SDK Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {EXAMPLES.map((example) => {
                  const Icon = example.icon;
                  const isActive = activeExample.id === example.id;
                  return (
                    <button
                      key={example.id}
                      onClick={() => setActiveExample(example)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-primary/20' : 'bg-muted/30'
                      }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{example.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{example.description}</div>
                      </div>
                      {isActive && <ArrowRight className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Code Preview */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  SDK Code
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(activeExample.code)}
                  className="h-7 gap-1.5 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed border border-border/30">
                  <code>{activeExample.code}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Right: Execution + Results */}
          <div className="lg:col-span-7 space-y-4">
            {/* Run Button */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => runExample(activeExample)}
                    disabled={isRunning}
                    className="gap-2 flex-1"
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run {activeExample.label}
                      </>
                    )}
                  </Button>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    <span className="font-mono text-primary/70">{activeExample.module}.{activeExample.action}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={result.timestamp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className={`border-border/50 ${result.success ? '' : 'border-destructive/30'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-neon-green" />
                          ) : (
                            <span className="w-4 h-4 text-destructive">✕</span>
                          )}
                          Response
                        </CardTitle>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.latencyMs}ms
                          </span>
                          {result.provider && (
                            <Badge variant="outline" className="text-[10px] h-5">
                              {result.provider}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(JSON.stringify(result.data, null, 2))}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <pre className="bg-muted/30 rounded-lg p-4 text-xs font-mono leading-relaxed border border-border/30 whitespace-pre-wrap">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Payload */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  Custom Request
                </CardTitle>
                <CardDescription className="text-xs">
                  Send any JSON payload directly to the substrate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  placeholder={`{\n  "module": "brain",\n  "action": "status"\n}`}
                  className="font-mono text-xs min-h-[120px] resize-none"
                />
                <Button
                  onClick={runCustom}
                  disabled={isRunning || !customPayload.trim()}
                  variant="outline"
                  className="gap-2 w-full"
                >
                  <Play className="w-4 h-4" />
                  Execute Custom
                </Button>
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Recent Calls
                    <Badge variant="secondary" className="text-[10px] h-5">{history.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {h.success ? (
                            <CheckCircle className="w-3 h-3 text-neon-green" />
                          ) : (
                            <span className="w-3 h-3 text-destructive">✕</span>
                          )}
                          <span className="text-muted-foreground">
                            {new Date(h.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {h.provider && (
                            <span className="text-muted-foreground">{h.provider}</span>
                          )}
                          <span className="font-mono">{h.latencyMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Install Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold mb-2">Ready to integrate?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Install the SDK and start building with persistent memory, AI routing, and live discovery.
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="bg-muted/50 px-4 py-2 rounded-lg text-sm font-mono border border-border/30">
                  npm install @cmpsbl/sdk
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode('npm install @cmpsbl/sdk')}
                  className="h-9 w-9 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
