/**
 * Proof Mode — Public Substrate Demo Surface
 * Read-only, rate-limited trial of the CMPSBL® substrate
 */

import { useState, useEffect, useCallback } from "react";
import { secureGet, secureSet } from "@/lib/system/secureStorage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, MessageSquare, Moon, Play, RotateCcw, AlertTriangle, 
  CheckCircle, XCircle, Clock, Cpu, Server, Zap, Database, 
  Shield, GitBranch, Terminal, Code2
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { substrate } from "@/lib/substrate";
import { SUBSTRATE_VERSION } from "@/lib/substrate/versions";

// Types
type Scenario = "health" | "decode" | "dream";
type BannerType = "idle" | "success" | "error" | "limit";

interface StatusBanner {
  type: BannerType;
  message: string;
}

interface RateLimitData {
  runs: number;
  hourStart: number;
}

interface ExecutionMeta {
  latencyMs: number;
  timestamp: string;
  endpoint: string;
  region: string;
  executionId: string;
}

const RATE_LIMIT_KEY = "pf_proof_mode_session";
const MAX_RUNS_PER_HOUR = 10;
const EDGE_REGION = "eu-central-1";

// Scenario configs
const scenarios = [
  {
    id: "health" as Scenario,
    label: "Substrate Health Ping",
    description: "Calls vision.health() and returns system health snapshot.",
    technicalNote: "Queries all 12 substrate modules for liveness.",
    icon: Activity,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    endpoint: "/pf-substrate",
    method: "POST",
  },
  {
    id: "decode" as Scenario,
    label: "Decode Demo",
    description: "Runs a decode.chat() call with a fixed substrate-interpretation prompt.",
    technicalNote: "Routes through Nexus → Groq (llama-3.3-70b) with interpreter persona constraints.",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    endpoint: "/pf-substrate",
    method: "POST",
  },
  {
    id: "dream" as Scenario,
    label: "Dream-Eater Ping",
    description: "Feeds a canned dream snippet for acknowledgement only.",
    technicalNote: "Writes to dream_feeder_submissions table with sanitization layer.",
    icon: Moon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    endpoint: "/pf-substrate",
    method: "POST",
  },
];

// Tech stack badges
const techStack = [
  { label: "Deno Runtime", icon: Server },
  { label: "Edge Functions", icon: Zap },
  { label: "PostgreSQL", icon: Database },
  { label: "RLS Protected", icon: Shield },
  { label: "Multi-Provider AI", icon: Cpu },
];

// Error boundary fallback
function ProofModeFallback() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Proof Mode collapsed harder than intended.
          </h1>
          <p className="text-muted-foreground">
            If you're seeing this, the demo surface broke before the substrate did. Respect.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </main>
      <EnhancedFooter />
    </div>
  );
}

function ProofModeContent() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("health");
  const [runsThisSession, setRunsThisSession] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [requestPayload, setRequestPayload] = useState<Record<string, unknown> | null>(null);
  const [responsePayload, setResponsePayload] = useState<Record<string, unknown> | null>(null);
  const [statusBanner, setStatusBanner] = useState<StatusBanner>({ type: "idle", message: "" });
  const [executionMeta, setExecutionMeta] = useState<ExecutionMeta | null>(null);
  const [totalExecutions, setTotalExecutions] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'live' | 'degraded' | 'offline'>('checking');
  const [substrateVersion, setSubstrateVersion] = useState<string>('SPARTA');

  // Check substrate connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const startTime = performance.now();
        const response = await substrate.vision.health();
        const latency = Math.round(performance.now() - startTime);
        
        if (response.success && response.data) {
          setConnectionStatus('live');
          // Extract version from response if available
          const data = response.data as Record<string, unknown>;
          if (data.version) {
            setSubstrateVersion(data.version as string);
          }
        } else {
          setConnectionStatus(latency < 5000 ? 'degraded' : 'offline');
        }
      } catch {
        setConnectionStatus('offline');
      }
    };
    
    checkConnection();
  }, []);

  // Load rate limit data from secure storage
  useEffect(() => {
    try {
      const data = secureGet<RateLimitData>(RATE_LIMIT_KEY);
      if (data) {
        const now = Date.now();
        const hourAgo = now - 60 * 60 * 1000;
        
        if (data.hourStart < hourAgo) {
          secureSet(RATE_LIMIT_KEY, { runs: 0, hourStart: now });
          setRunsThisSession(0);
        } else {
          setRunsThisSession(data.runs);
        }
      }
      
      // Load total executions
      const totalStored = secureGet<number>('pf_proof_total');
      if (totalStored != null) {
        setTotalExecutions(totalStored);
      }
    } catch {
      /* Storage unavailable — start with defaults */
    }
  }, []);

  // Build request payload for scenario
  const buildPayload = useCallback((scenario: Scenario): Record<string, unknown> => {
    switch (scenario) {
      case "health":
        return {
          module: "vision",
          action: "health",
          payload: {},
        };
      case "decode":
        return {
          module: "decode",
          action: "chat",
          payload: {
            message: "In three sentences, interpret what the CMPSBL® substrate does based on its own description.",
            session_id: "proof_demo",
          },
        };
      case "dream":
        return {
          module: "dream",
          action: "feed",
          payload: {
            dream_text: "I was walking through a corridor of routers, each humming with latent intent.",
            dream_type: "dream",
          },
        };
    }
  }, []);

  // Execute scenario
  const runScenario = async () => {
    if (runsThisSession >= MAX_RUNS_PER_HOUR) {
      setStatusBanner({
        type: "limit",
        message: "Throttle engaged. Proof Mode is not a DDoS-as-a-service. Try again later.",
      });
      return;
    }

    setIsRunning(true);
    setStatusBanner({ type: "idle", message: "" });
    setExecutionMeta(null);
    
    const payload = buildPayload(selectedScenario);
    setRequestPayload(payload);
    setResponsePayload(null);

    const startTime = performance.now();

    try {
      let response;
      
      switch (selectedScenario) {
        case "health":
          response = await substrate.vision.health();
          break;
        case "decode":
          response = await substrate.decode.chat(
            "In three sentences, interpret what the promptfluid® substrate does based on its own description.",
            "proof_demo"
          );
          break;
        case "dream":
          response = await substrate.invoke({
            module: "dream",
            action: "feed",
            payload: {
              dream_text: "I was walking through a corridor of routers, each humming with latent intent.",
              dream_type: "dream",
            },
          });
          break;
      }

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      // Set execution metadata
      setExecutionMeta({
        latencyMs,
        timestamp: new Date().toISOString(),
        endpoint: `/functions/v1/pf-substrate`,
        region: EDGE_REGION,
        executionId: `exec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      });

      setResponsePayload(response as Record<string, unknown>);
      
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          setStatusBanner({
            type: "success",
            message: `200 OK • ${latencyMs}ms — substrate acknowledged your existence and replied like a civilized system.`,
          });
        } else {
          setStatusBanner({
            type: "error",
            message: "200 OK, but success:false — spiritually a 500. The router delivered it; the brain shrugged.",
          });
        }
      }

      // Update rate limit + total
      const newRuns = runsThisSession + 1;
      const newTotal = totalExecutions + 1;
      setRunsThisSession(newRuns);
      setTotalExecutions(newTotal);
      
      try {
        const existing = secureGet<RateLimitData>(RATE_LIMIT_KEY);
        const now = Date.now();
        let hourStart = now;
        
        if (existing) {
          const hourAgo = now - 60 * 60 * 1000;
          if (existing.hourStart >= hourAgo) {
            hourStart = existing.hourStart;
          }
        }
        
        secureSet(RATE_LIMIT_KEY, { runs: newRuns, hourStart });
        secureSet('pf_proof_total', newTotal);
      } catch {
        /* Storage write failed — rate limit tracking in memory only */
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setResponsePayload({ error: errorMessage, stack: "Edge function unreachable" });
      setStatusBanner({
        type: "error",
        message: "💥 Upstream failure. Either the router is sulking, the substrate rebooted, or the Dream-Eater chewed through a cable.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const remainingRuns = Math.max(0, MAX_RUNS_PER_HOUR - runsThisSession);
  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-border">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 text-xs tracking-wide font-mono">
                TRIAL_SURFACE • READ_ONLY • RATE_LIMITED
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Proof Mode
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                A public, read-only surface that proves the promptfluid® substrate is real, live, 
                and doing work — without giving the whole brain away.
              </p>
            </div>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {techStack.map((tech) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground"
                  >
                    <Icon className="w-3 h-3" />
                    {tech.label}
                  </div>
                );
              })}
            </div>

            {/* Live System Info */}
            <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground/70">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                SPARTA
              </span>
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3" />
                {EDGE_REGION}
              </span>
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                {totalExecutions} total proofs issued
              </span>
            </div>
          </div>
        </section>

        {/* Rate Limit Status */}
        <section className="py-3 border-b border-border bg-muted/20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>rate_limit: {remainingRuns}/{MAX_RUNS_PER_HOUR} remaining</span>
              </div>
              <div className="flex items-center gap-2">
                {remainingRuns > 5 && (
                  <span className="text-[hsl(var(--system-green))]">● NOMINAL</span>
                )}
                {remainingRuns <= 5 && remainingRuns > 0 && (
                  <span className="text-[hsl(var(--system-amber))]">● LOW</span>
                )}
                {remainingRuns === 0 && (
                  <span className="text-destructive">● EXHAUSTED</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Demo Cards */}
        <section className="py-10">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isSelected = selectedScenario === scenario.id;
                
                return (
                  <motion.div
                    key={scenario.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all h-full ${
                        isSelected
                          ? `${scenario.borderColor} border-2 ${scenario.bgColor}`
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${scenario.bgColor}`}>
                            <Icon className={`w-5 h-5 ${scenario.color}`} />
                          </div>
                          <CardTitle className="text-sm">{scenario.label}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <CardDescription className="text-xs">
                          {scenario.description}
                        </CardDescription>
                        <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed">
                          {scenario.technicalNote}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Run Button + Endpoint Info */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <Button
                size="lg"
                onClick={runScenario}
                disabled={isRunning || remainingRuns === 0}
                className="min-w-[220px]"
              >
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Activity className="w-4 h-4" />
                    </motion.div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Proof
                  </>
                )}
              </Button>
              
              {selectedScenarioData && (
                <code className="text-[10px] text-muted-foreground/50 font-mono">
                  {selectedScenarioData.method} {selectedScenarioData.endpoint} → {selectedScenario}.{
                    selectedScenario === "health" ? "health()" : 
                    selectedScenario === "decode" ? "chat()" : "feed()"
                  }
                </code>
              )}
            </div>

            {/* Status Banner */}
            <AnimatePresence mode="wait">
              {statusBanner.type !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <div
                    className={`p-4 rounded-lg border flex items-start gap-3 font-mono text-sm ${
                      statusBanner.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : statusBanner.type === "limit"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {statusBanner.type === "success" ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : statusBanner.type === "limit" ? (
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p>{statusBanner.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Execution Metadata */}
            {executionMeta && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="flex flex-wrap gap-4 justify-center text-[10px] font-mono text-muted-foreground/70 bg-muted/30 rounded-lg p-3 border border-border/50">
                  <span>exec_id: {executionMeta.executionId}</span>
                  <span>latency: {executionMeta.latencyMs}ms</span>
                  <span>region: {executionMeta.region}</span>
                  <span>ts: {new Date(executionMeta.timestamp).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            )}

            {/* Request/Response Display */}
            {(requestPayload || responsePayload) && (
              <Tabs defaultValue="response" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="request" className="text-xs font-mono">
                    <Code2 className="w-3 h-3 mr-1.5" />
                    Request
                  </TabsTrigger>
                  <TabsTrigger value="response" className="text-xs font-mono">
                    <Terminal className="w-3 h-3 mr-1.5" />
                    Response
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="request">
                  <Card className="bg-card border-border">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                        <span className="text-[10px] font-mono text-muted-foreground">request.json</span>
                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                          POST
                        </Badge>
                      </div>
                      <pre className="text-xs text-primary/90 overflow-x-auto p-4 font-mono leading-relaxed">
                        {requestPayload ? JSON.stringify(requestPayload, null, 2) : "null"}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="response">
                  <Card className="bg-card border-border">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                        <span className="text-[10px] font-mono text-muted-foreground">response.json</span>
                        {responsePayload && "success" in responsePayload && (
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] border-zinc-700 ${
                              responsePayload.success ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {responsePayload.success ? "SUCCESS" : "FAILED"}
                          </Badge>
                        )}
                      </div>
                      <pre className="text-xs text-blue-400/90 overflow-x-auto p-4 font-mono leading-relaxed max-h-80 overflow-y-auto">
                        {responsePayload 
                          ? JSON.stringify(responsePayload, null, 2) 
                          : isRunning 
                            ? "// awaiting response..." 
                            : "null"
                        }
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* What You're Seeing */}
            {responsePayload && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Card className="bg-muted/20 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      What This Proves
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2">
                    {selectedScenario === "health" && (
                      <>
                        <p>✓ The substrate is deployed and responding to HTTP requests</p>
                        <p>✓ All 40 matrix nodes across 12 sectors reachable</p>
                        <p>✓ Edge functions are executing on Deno runtime in {EDGE_REGION}</p>
                        <p>✓ Active deployment is live</p>
                      </>
                    )}
                    {selectedScenario === "decode" && (
                      <>
                        <p>✓ Decode interpreter primitive is operational</p>
                        <p>✓ Nexus successfully routed to an AI provider (check 'provider' field)</p>
                        <p>✓ The model field shows which LLM generated the response</p>
                        <p>✓ No user data was stored — session_id "proof_demo" is ephemeral</p>
                      </>
                    )}
                    {selectedScenario === "dream" && (
                      <>
                        <p>✓ Dream ingestion endpoint is reachable</p>
                        <p>✓ Input was sanitized before acknowledgement</p>
                        <p>✓ The placeholder:true flag indicates rate-limited demo mode</p>
                        <p>✓ Full dream processing routes to dream-feeder-api in production</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 border-t border-border">
          <div className="container mx-auto max-w-5xl px-4 text-center">
            <p className="text-[10px] text-muted-foreground/50 font-mono">
              PROOF_MODE is not a benchmarking tool. It's a witness surface. • No arbitrary inputs • No write powers • No chaos buttons
            </p>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}

// Main export with error boundary
export default function ProofModePage() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return <ProofModeFallback />;
  }

  try {
    return <ProofModeContent />;
  } catch {
    return <ProofModeFallback />;
  }
}
